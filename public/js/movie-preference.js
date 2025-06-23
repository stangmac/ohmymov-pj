let likeDislikeCount = 0; // ใช้สำหรับอัปเดตปุ่มเท่านั้น ไม่บังคับจำนวน
const nextButton = document.getElementById('nextButton');
const alertPlaceholder = document.getElementById('liveAlertPlaceholder');

// ไม่ต้องแสดงข้อความเตือนอีกต่อไป
function updateAlertMessage() {
  alertPlaceholder.style.display = 'none';
}

// ✅ ตรวจสอบจำนวนจาก server ตอนโหลดหน้า
if (window.userMovieStatus) {
  const { like = [], dislike = [] } = window.userMovieStatus;
  likeDislikeCount = like.length + dislike.length;

  nextButton.disabled = false; // ❌ ไม่ต้องตรวจจำนวนแล้ว
  updateAlertMessage();
}

// ✅ ตั้งค่าปุ่ม active ตามสถานะจาก server
document.querySelectorAll('.fav-movie-content').forEach(content => {
  const movieId = content.dataset.movieId;
  if (!movieId || !window.userMovieStatus) return;

  const { like, dislike, wishlist, seen } = window.userMovieStatus;

  if (like.includes(movieId)) content.querySelector('.fav-like-btn')?.classList.add('active');
  if (dislike.includes(movieId)) content.querySelector('.fav-dislike-btn')?.classList.add('active');
  if (wishlist.includes(movieId)) content.querySelector('.fav-wishlist-btn')?.classList.add('active');
  if (seen.includes(movieId)) content.querySelector('.fav-seen-btn')?.classList.add('active');
});

// ✅ จัดการการคลิกปุ่มต่าง ๆ
document.querySelectorAll('.fav-actions button').forEach(btn => {
  btn.addEventListener('click', async () => {
    const movieContent = btn.closest('.fav-movie-content');
    const movieId = movieContent?.dataset.movieId;
    if (!movieId) return console.error("❌ ไม่พบ movieId");

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
      if (!result.success) return console.error("❌ กิจกรรมล้มเหลว:", result.message);

      if (isWishlist || isSeen) {
        btn.classList.toggle('active');
        return;
      }

      const wasActive = btn.classList.contains('active');
      btn.classList.remove('active');

      const siblingBtn = movieContent.querySelector(isLike ? '.fav-dislike-btn' : '.fav-like-btn');
      siblingBtn?.classList.remove('active');

      if (!wasActive) {
        btn.classList.add('active');
      }

      nextButton.disabled = false;
      updateAlertMessage();
    } catch (error) {
      console.error("❌ Error ใน fetch:", error);
    }
  });
});

// ✅ เมื่อคลิกปุ่มถัดไป
nextButton.addEventListener('click', () => {
  alertPlaceholder.style.display = 'block';
  alertPlaceholder.textContent = "Going to the suggestion page...";
  setTimeout(() => {
    window.location.href = '/suggestion';
  }, 1000);
});
