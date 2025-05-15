let likeDislikeCount = 0; // นับเฉพาะ like + dislike
const nextButton = document.getElementById('nextButton');
const alertPlaceholder = document.getElementById('liveAlertPlaceholder');

// ฟังก์ชันแสดง/ซ่อนข้อความแจ้งเตือนตามจำนวน
function updateAlertMessage() {
  if (likeDislikeCount < 5) {
    alertPlaceholder.style.display = 'block';
    alertPlaceholder.textContent = "กรุณาเลือกภาพยนตร์ที่คุณชอบหรือไม่ชอบอย่างน้อย 5 เรื่องก่อนดำเนินการต่อ";
  } else {
    alertPlaceholder.style.display = 'none';
  }
}

// ✅ ตรวจสอบจำนวนจาก server ตอนโหลดหน้า
if (window.userMovieStatus) {
  const { like = [], dislike = [] } = window.userMovieStatus;
  likeDislikeCount = like.length + dislike.length;

  nextButton.disabled = likeDislikeCount < 5;
  updateAlertMessage(); // แสดง/ซ่อนข้อความแจ้งเตือน
}

// ✅ ตั้งค่าปุ่ม active ตามสถานะจาก server
document.querySelectorAll('.fav-movie-content').forEach(content => {
  const movieId = content.dataset.movieId;
  if (!movieId || !window.userMovieStatus) return;

  const { like, dislike, wishlist, seen } = window.userMovieStatus;

  if (like.includes(movieId)) {
    content.querySelector('.fav-like-btn')?.classList.add('active');
  }
  if (dislike.includes(movieId)) {
    content.querySelector('.fav-dislike-btn')?.classList.add('active');
  }
  if (wishlist.includes(movieId)) {
    content.querySelector('.fav-wishlist-btn')?.classList.add('active');
  }
  if (seen.includes(movieId)) {
    content.querySelector('.fav-seen-btn')?.classList.add('active');
  }
});

// ✅ จัดการการคลิกปุ่มต่าง ๆ
document.querySelectorAll('.fav-actions button').forEach(btn => {
  btn.addEventListener('click', async () => {
    const movieContent = btn.closest('.fav-movie-content');
    const movieId = movieContent?.dataset.movieId;

    if (!movieId) {
      console.error("❌ ไม่พบ movieId");
      return;
    }

    const isLike = btn.classList.contains('fav-like-btn');
    const isDislike = btn.classList.contains('fav-dislike-btn');
    const isWishlist = btn.classList.contains('fav-wishlist-btn');
    const isSeen = btn.classList.contains('fav-seen-btn');

    let action = '';
    if (isLike) action = 'like';
    else if (isDislike) action = 'dislike';
    else if (isWishlist) action = 'wishlist';
    else if (isSeen) action = 'seen';

    try {
      const response = await fetch('/user-activity/fav', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId, action })
      });

      const result = await response.json();

      if (!result.success) {
        console.error("❌ กิจกรรมล้มเหลว:", result.message);
        return;
      }

      // ✅ Wishlist/Seen: toggle เฉย ๆ ไม่เกี่ยวกับ count
      if (isWishlist || isSeen) {
        btn.classList.toggle('active');
        return;
      }

      // ✅ Like/Dislike: toggle + อัปเดต count
      const wasActive = btn.classList.contains('active');
      btn.classList.remove('active');

      const siblingBtn = movieContent.querySelector(isLike ? '.fav-dislike-btn' : '.fav-like-btn');
      const siblingWasActive = siblingBtn?.classList.contains('active');

      siblingBtn?.classList.remove('active');

      if (!wasActive) {
        btn.classList.add('active');
        likeDislikeCount++;
        if (siblingWasActive) likeDislikeCount--; // สลับฝั่ง
      } else {
        likeDislikeCount--;
      }

      nextButton.disabled = likeDislikeCount < 5;
      updateAlertMessage();

    } catch (error) {
      console.error("❌ Error ใน fetch:", error);
    }
  });
});

// ✅ เมื่อคลิกปุ่มถัดไป
nextButton.addEventListener('click', () => {
  // แสดงข้อความแจ้งเตือนทุกครั้ง
  alertPlaceholder.style.display = 'block';

  if (likeDislikeCount >= 5) {
    alertPlaceholder.textContent = "กำลังไปยังหน้าคำแนะนำ...";
    setTimeout(() => {
      window.location.href = '/suggestion';
    }, 1000);
  } else {
    alertPlaceholder.textContent = "กรุณาเลือกภาพยนตร์ที่คุณชอบหรือไม่ชอบอย่างน้อย 5 เรื่องก่อนดำเนินการต่อ";
  }
});
