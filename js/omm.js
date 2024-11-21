

// หาตัวแปรสำหรับเลเยอร์เบลอ


// เมื่อคลิกที่ปุ่มเพื่อเปิด modal
// document.querySelector("#show-signin").addEventListener("click", function() {
//     document.querySelector("#signinModal").classList.add("active"); // แสดง modal
//     overlay.style.display = "block"; // แสดงเลเยอร์เบลอ
// });

// // เมื่อคลิกที่ปุ่มปิด modal
// document.querySelector(".popup-signin-p .close-btn").addEventListener("click", function() {
//     document.querySelector("#signinModal").classList.remove("active"); // ซ่อน modal
//     overlay.style.display = "none"; // ซ่อนเลเยอร์เบลอ
// });
// document.querySelector("#Create-one").addEventListener("click", function() {
//     document.querySelector("#signupModal").classList.add("active"); // แสดง modal
//     overlay.style.display = "block"; // แสดงเลเยอร์เบลอ
// });

// // เมื่อคลิกที่ปุ่มปิด modal
// document.querySelector(".popup-signup-p .close-btn-signup").addEventListener("click", function() {
//     document.querySelector("#signupModal").classList.remove("active"); // ซ่อน modal
//     overlay.style.display = "none"; // ซ่อนเลเยอร์เบลอ
// });
// var click_disabled = false;

// ตัวแปรสำหรับป้องกันการคลิกซ้ำ
var click_disabled = false;

// ฟังก์ชันในการสลับไอคอนของ Bookmark
function toggleBookmark() {
    if (click_disabled) {
        return; // หากถูกปิดการคลิก จะไม่ทำการใดๆ
    }

    // สลับสถานะของการแอนิเมชัน bookmark
    $('.btn-bookmark .icon-container.first-icon').toggleClass('second-icon');  // สลับไอคอนแรกกับไอคอนที่สอง

    // ตั้งค่า aria-label ให้ถูกต้อง
    var label = $('.btn-bookmark').attr('aria-label') == 'Favourite' ? 'Unfavourite' : 'Favourite';
    $('.btn-bookmark').attr('aria-label', label);

    // ปิดการคลิกชั่วคราว
    click_disabled = true;

    // รีเซ็ตสถานะการคลิกหลังจากเวลาที่กำหนด
    setTimeout(function() {
        click_disabled = false;
    }, 400);  // ใช้เวลาให้ตรงกับแอนิเมชัน
}

// เพิ่ม event listener สำหรับการคลิก
$('.btn-bookmark').click(toggleBookmark);
function toggleBookmark() {
    const button = document.querySelector('.btn-bookmark');
    const firstIcon = button.querySelector('.first-icon');
    const secondIcon = button.querySelector('.second-icon');
  
    if (firstIcon.style.transform === 'rotateX(-90deg)') {
      firstIcon.style.transform = 'rotateX(0deg)';
      secondIcon.style.transform = 'rotateX(90deg)';
    } else {
      firstIcon.style.transform = 'rotateX(-90deg)';
      secondIcon.style.transform = 'rotateX(0deg)';
    }
  }


// Select elements
const signinModal = document.getElementById('signinModal');
const signupModal = document.getElementById('signupModal');
const overlay = document.createElement('div'); // Create overlay element
overlay.id = 'overlay';
document.body.appendChild(overlay);

// Open Sign In modal
const openSignIn = () => {
    overlay.style.display = 'block';
    signinModal.classList.add('active');
    signinModal.classList.remove('hidden');
};

// Open Sign Up modal
const openSignUp = () => {
    overlay.style.display = 'block';
    signinModal.classList.remove('active');
    signinModal.classList.add('hidden');
    signupModal.classList.add('active');
    signupModal.classList.remove('hidden');
};

// Close all modals
const closeAll = () => {
    overlay.style.display = 'none';
    signinModal.classList.remove('active');
    signupModal.classList.remove('active');
    signinModal.classList.add('hidden');
    signupModal.classList.add('hidden');
};

// Event listeners
document.getElementById('show-signin').addEventListener('click', openSignIn);
document.getElementById('closeSignIn').addEventListener('click', closeAll);
document.getElementById('closeSignUp').addEventListener('click', closeAll);

document.getElementById('Create-one').addEventListener('click', (e) => {
    e.preventDefault();
    openSignUp();
});

// Close modals when clicking outside
overlay.addEventListener('click', closeAll);



