
document.querySelector(".first-icon").addEventListener("click", function() {
    document.querySelector(".first-icon").classList.add("active"); // เพิ่ม class active ให้ second-icon
});

// หาตัวแปรสำหรับเลเยอร์เบลอ
const overlay = document.querySelector("#overlay");

// เมื่อคลิกที่ปุ่มเพื่อเปิด modal
document.querySelector("#show-signin").addEventListener("click", function() {
    document.querySelector("#signinModal").classList.add("active"); // แสดง modal
    overlay.style.display = "block"; // แสดงเลเยอร์เบลอ
});

// เมื่อคลิกที่ปุ่มปิด modal
document.querySelector(".popup-signin-p .close-btn").addEventListener("click", function() {
    document.querySelector("#signinModal").classList.remove("active"); // ซ่อน modal
    overlay.style.display = "none"; // ซ่อนเลเยอร์เบลอ
});
