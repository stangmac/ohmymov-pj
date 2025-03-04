

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

// Select the button
var btn = document.querySelector(".btn-bookmark");
var t = new TimelineMax({ paused: true }); // Initialize animation timeline

// Define animation for the second icon
t.to(".btn-bookmark .icon-container.second-icon", 0.8, {
  transform: "rotateX(0deg)",
  ease: Bounce.easeOut
});

// Function to handle bookmark click
function bookmark() {
  t.reversed(!t.reversed()); // Reverse animation state
  if (t.reversed()) {
    t.reverse();
  } else {
    t.play();
  }
}



// // Select elements
// const signinModal = document.getElementById('signinModal');
// const signupModal = document.getElementById('signupModal');
// const overlay = document.createElement('div'); // Create overlay element
// overlay.id = 'overlay';
// document.body.appendChild(overlay);

// // Open Sign In modal
// const openSignIn = () => {
//     overlay.style.display = 'block';
//     signinModal.classList.add('active');
//     signinModal.classList.remove('hidden');
// };

// // Open Sign Up modal
// const openSignUp = () => {
//     overlay.style.display = 'block';
//     signinModal.classList.remove('active');
//     signinModal.classList.add('hidden');
//     signupModal.classList.add('active');
//     signupModal.classList.remove('hidden');
// };

// // Close all modals
// const closeAll = () => {
//     overlay.style.display = 'none';
//     signinModal.classList.remove('active');
//     signupModal.classList.remove('active');
//     signinModal.classList.add('hidden');
//     signupModal.classList.add('hidden');
// };

// // Event listeners
// document.getElementById('show-signin').addEventListener('click', openSignIn);
// document.getElementById('closeSignIn').addEventListener('click', closeAll);
// document.getElementById('closeSignUp').addEventListener('click', closeAll);

// document.getElementById('Create-one').addEventListener('click', (e) => {
//     e.preventDefault();
//     openSignUp();
// });

// // Close modals when clicking outside
// overlay.addEventListener('click', closeAll);

// document.getElementById("signinForm").addEventListener("submit", function(event) {
//   event.preventDefault(); // ป้องกันการโหลดหน้าใหม่

//   const formData = new FormData(this);
//   const errorMessages = document.getElementById("errorMessages");

//   fetch("/popup-sign-p", {
//       method: "POST",
//       body: formData
//   })
//   .then(response => response.json())
//   .then(data => {
//       if (data.success) {
//           window.location.reload(); // หรือเปลี่ยนไปยังหน้าหลัก
//       } else {
//           // แสดง error message
//           errorMessages.innerHTML = data.errors.map(err => `<p class="alert alert-danger">${err}</p>`).join("");
          
//           // เปิด modal sign-in ค้างไว้
//           document.getElementById("signinModal").classList.remove("hidden");
//       }
//   })
//   .catch(error => console.error("Error:", error));
// });

document.getElementById("show-signin").addEventListener("click", function() {
  window.location.href = "/login"; 
});
document.getElementById("Create-one").addEventListener("click", function() {
  window.location.href = "/register"; 
});
document.getElementById("logo").addEventListener("click", function() {
  window.location.href = "/home"; 
});
let elements = document.getElementsByClassName("detailmovie");
for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", function() {
        window.location.href = "/movie-detail";
    });
}
