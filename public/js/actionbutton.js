
  // ✅ ใช้เฉพาะในปุ่มที่ต้องการ toggle active สีเขียว + อัปเดตกับ server
  function toggleButton(button, movieId, action) {
    fetch('/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieId, action })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // ✅ จัดการ class ปุ่ม
          if (action === 'like' || action === 'dislike') {
            document.getElementById('like-button')?.classList.remove('active-btn');
            document.getElementById('dislike-button')?.classList.remove('active-btn');
            if (!data.removed) {
              document.getElementById(`${action}-button`)?.classList.add('active-btn');
            }
          } else {
            button.classList.toggle('active-btn', !data.removed);
          }

          // ✅ อัปเดตจำนวน like/dislike
          if (data.counts) {
            if ('like' in data.counts) {
              document.getElementById('like-count').innerText = data.counts.like;
            }
            if ('dislike' in data.counts) {
              document.getElementById('dislike-count').innerText = data.counts.dislike;
            }
          }
        } else {
          alert('⚠️ บันทึกพฤติกรรมไม่สำเร็จ');
        }
      })
      .catch(err => {
        console.error('❌ log-activity error:', err);
        alert('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์');
      });
  }

  // ✅ ส่วนนี้ใช้สำหรับปุ่ม filter (ไม่เกี่ยวกับ like/dislike)
  document.addEventListener("DOMContentLoaded", function () {
    // ปุ่มหมวดหมู่ sg-button
    const sgButtons = document.querySelectorAll(".sg-button");
    sgButtons.forEach((button) => {
      button.addEventListener("click", function () {
        sgButtons.forEach((btn) => btn.classList.remove("active-sg-button"));
        this.classList.add("active-sg-button");
      });
    });

    // ปุ่ม o-button-3 (ใช้สำหรับ filter หรือแบบเดียวกัน)
    const o3Buttons = document.querySelectorAll(".o-button-3");
    o3Buttons.forEach((button) => {
      button.addEventListener("click", function () {
        o3Buttons.forEach((btn) => btn.classList.remove("active-style-o-button-3"));
        this.classList.add("active-style-o-button-3");
      });
    });
  });
