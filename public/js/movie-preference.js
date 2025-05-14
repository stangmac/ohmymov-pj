let likeDislikeCount = 0; // นับเฉพาะ like + dislike
const nextButton = document.getElementById('nextButton');

// ✅ ตรวจสอบจำนวนจาก server ตอนโหลดหน้า
if (window.userMovieStatus) {
  const { like = [], dislike = [] } = window.userMovieStatus;
  likeDislikeCount = like.length + dislike.length;

  nextButton.disabled = likeDislikeCount < 5;
}

// ✅ ตั้งค่าปุ่ม active ตามสถานะจาก server
document.querySelectorAll('.fav-movie-item').forEach(movieItem => {
  const movieId = movieItem.dataset.movieId;
  if (!movieId || !window.userMovieStatus) return;

  const { like, dislike, wishlist, seen } = window.userMovieStatus;

  if (like.includes(movieId)) {
    movieItem.querySelector('.fav-like-btn')?.classList.add('active');
  }
  if (dislike.includes(movieId)) {
    movieItem.querySelector('.fav-dislike-btn')?.classList.add('active');
  }
  if (wishlist.includes(movieId)) {
    movieItem.querySelector('.fav-wishlist-btn')?.classList.add('active');
  }
  if (seen.includes(movieId)) {
    movieItem.querySelector('.fav-seen-btn')?.classList.add('active');
  }
});

// ✅ จัดการการคลิกปุ่มต่าง ๆ
document.querySelectorAll('.fav-actions button').forEach(btn => {
  btn.addEventListener('click', async () => {
    const movieItem = btn.closest('.fav-movie-item');
    const movieId = movieItem?.dataset.movieId;

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

      const siblingBtn = movieItem.querySelector(isLike ? '.fav-dislike-btn' : '.fav-like-btn');
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

    } catch (error) {
      console.error("❌ Error ใน fetch:", error);
    }
  });
});

// ✅ เมื่อคลิกปุ่มถัดไป
nextButton.addEventListener('click', () => {
  const { like = [], dislike = [] } = window.userMovieStatus;
  const total = like.length + dislike.length;

  if (total < 5) {
    alert("กรุณาเลือกภาพยนตร์ที่คุณชอบหรือไม่ชอบอย่างน้อย 5 เรื่องก่อนดำเนินการต่อ");
    return;
  }

  window.location.href = '/suggestion';
});
