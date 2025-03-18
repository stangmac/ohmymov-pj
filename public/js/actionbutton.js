document.addEventListener("DOMContentLoaded", function () {
    // เลือกปุ่มทั้งหมดที่ต้องการให้เปลี่ยนสไตล์เมื่อถูกคลิก
    const buttons = document.querySelectorAll(".o-button-1, .o-button-2");
  
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        // ถ้าปุ่มนั้นมี class 'active-style' อยู่แล้ว ให้ลบออก
        if (this.classList.contains("active-style")) {
          this.classList.remove("active-style");
        } else {
          // ถ้าไม่มีก็ให้เพิ่ม class 'active-style'
          this.classList.add("active-style");
        }
      });
    });
  });
  

document.addEventListener("DOMContentLoaded", function () {
  // เลือกปุ่มทั้งหมดที่มีคลาส sg-button
  const buttons = document.querySelectorAll(".sg-button");
  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      // ลบ class 'active-style' ออกจากปุ่มที่เคยถูกเลือกก่อนหน้านี้
      buttons.forEach((btn) => btn.classList.remove("active-sg-button"));

      // เพิ่ม class 'active-style' ให้ปุ่มที่ถูกคลิก
      this.classList.add("active-sg-button");
    });
  });
});
document.addEventListener("DOMContentLoaded", function () {
    // เลือกปุ่มทั้งหมดที่มีคลาส sg-button
    const buttons = document.querySelectorAll(".o-button-3");
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        // ลบ class 'active-style' ออกจากปุ่มที่เคยถูกเลือกก่อนหน้านี้
        buttons.forEach((btn) => btn.classList.remove("active-style-o-button-3"));
  
        // เพิ่ม class 'active-style' ให้ปุ่มที่ถูกคลิก
        this.classList.add("active-style-o-button-3");
      });
    });
  });
  
  document.addEventListener("DOMContentLoaded", function () {
    const likeButton = document.getElementById("like-button");
    const dislikeButton = document.getElementById("dislike-button");
  
    // ฟังก์ชันการจัดการการคลิกที่ปุ่ม
    function toggleActiveStyle(clickedButton, otherButton) {
      // ลบ active-style ออกจากปุ่มที่ไม่ได้ถูกคลิก
      otherButton.classList.remove("active-style");
  
      // เพิ่ม active-style ให้กับปุ่มที่ถูกคลิก
      clickedButton.classList.add("active-style");
    }
  
    // เมื่อคลิกที่ปุ่ม like
    likeButton.addEventListener("click", function () {
      toggleActiveStyle(likeButton, dislikeButton);
      // ทำการบันทึกกิจกรรม
      logUserActivity('<%= movie._id %>', 'like');
    });
  
    // เมื่อคลิกที่ปุ่ม dislike
    dislikeButton.addEventListener("click", function () {
      toggleActiveStyle(dislikeButton, likeButton);
      // ทำการบันทึกกิจกรรม
      logUserActivity('<%= movie._id %>', 'dislike');
    });
  });
  