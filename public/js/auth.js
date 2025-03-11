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
    const now = Date.now();

    // ตรวจสอบว่าห่างจากการเรียกครั้งก่อนเกิน 5 วินาทีหรือไม่
    if (now - lastCheckTime < checkInterval || isChecking) {
        return;
    }

    isChecking = true; // ป้องกันการเรียก API ซ้ำซ้อน
    lastCheckTime = now;

    try {
        const response = await fetch('/check-login');
        const data = await response.json();

        const isLoggedIn = data.loggedIn;
        const isLoginPage = window.location.pathname === "/login";

        if (!isLoggedIn && !isLoginPage) {
            window.location.href = '/login'; // ถ้ายังไม่ได้ Login และไม่ได้อยู่ที่หน้า Login → ไปหน้า Login
        } else if (isLoggedIn && isLoginPage) {
            window.location.href = '/'; // ถ้า Login แล้ว แต่ยังอยู่ที่หน้า Login → ไปหน้าแรก
        }
    } catch (error) {
        console.error('Error checking login status:', error);
    } finally {
        isChecking = false;
    }
}

// ใช้ setInterval ให้ตรวจสอบทุก 5 วินาที
setInterval(() => {
    if (document.visibilityState === "visible") {
        checkLogin();
    }
}, checkInterval);
