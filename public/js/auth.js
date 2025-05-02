document.addEventListener('click', handleUserInteraction);
let lastCheckTime = 0; // เวลาตรวจสอบล่าสุด
const checkInterval = 5000; // ตรวจสอบทุก 5 วินาที
let isChecking = false; // ป้องกันการเรียก fetch ซ้ำซ้อน
function handleUserInteraction() {
    if (!isChecking) {
        checkLogin();
    }
}
async function checkLogin() {
    try {
        const response = await fetch('/check-login');
        const data = await response.json();

        console.log("Login check result:", data); // ✅ Debugging

        const isLoggedIn = data.loggedIn;
        const isLoginPage = window.location.pathname === "/login";

        if (!isLoggedIn && !isLoginPage) {
            window.location.href = '/login'; 
        } else if (isLoggedIn && isLoginPage) {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    }
    console.log("auth.js loaded"); // ทันทีเมื่อไฟล์ถูก execute
document.addEventListener('click', () => console.log("User clicked")); // เพื่อดูว่ interaction trigger ได้ไหม
}
// ใช้ setInterval ให้ตรวจสอบทุก 5 วินาที
setInterval(() => {
    if (document.visibilityState === "visible") {
        checkLogin();
    }
}, checkInterval);
