function toggleButton(button, movieId, action) {
  const btns = document.querySelectorAll(`#${action}-button-${movieId}`);
  
  // 💡 Optimistically toggle active class
  if (action === 'like' || action === 'dislike') {
    const allLikeBtns = document.querySelectorAll(`#like-button-${movieId}`);
    const allDislikeBtns = document.querySelectorAll(`#dislike-button-${movieId}`);

    // เอาออกหมดก่อน
    allLikeBtns.forEach(btn => btn.classList.remove('active-btn'));
    allDislikeBtns.forEach(btn => btn.classList.remove('active-btn'));

    // ใส่ active เฉพาะปุ่มที่กด (toggle ทันที)
    if (!button.classList.contains('active-btn')) {
      button.classList.add('active-btn');
    }
  } else {
    // WISHLIST / SEEN: toggle ทันที
    btns.forEach(btn => btn.classList.toggle('active-btn'));
  }

  // ปิดปุ่มชั่วคราว
  btns.forEach(btn => btn.disabled = true);

  const spinner = document.createElement("span");
  spinner.className = "spinner-border spinner-border-sm";
  spinner.style.marginLeft = "6px";
  spinner.setAttribute("role", "status");
  spinner.setAttribute("aria-hidden", "true");
  button.appendChild(spinner);

  // 🔄 Fetch server
  fetch('/log-activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ movieId, action })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // 🎯 sync count ทันที
        if (data.counts) {
          const likeCounts = document.querySelectorAll(`#like-count-${movieId}`);
          const dislikeCounts = document.querySelectorAll(`#dislike-count-${movieId}`);
          likeCounts.forEach(span => span.textContent = data.counts.like);
          dislikeCounts.forEach(span => span.textContent = data.counts.dislike);
        }
      } else {
        alert('⚠️ บันทึกพฤติกรรมไม่สำเร็จ');
      }
    })
    .catch(err => {
      console.error('❌ log-activity error:', err);
      alert('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');

      // ❌ ย้อน class กลับถ้า error
      if (action === 'like' || action === 'dislike') {
        button.classList.remove('active-btn');
      } else {
        button.classList.toggle('active-btn');
      }
    })
    .finally(() => {
      spinner.remove();
      btns.forEach(btn => btn.disabled = false);
    });
}