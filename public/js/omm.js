

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
  window.location.href = "/"; 
});
let elements = document.getElementsByClassName("detailmovie");
for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", function() {
        window.location.href = "/movie-detail";
    });
}


document.addEventListener("DOMContentLoaded", function () {
  function togglePassword(inputId, iconElement) {
      let input = document.getElementById(inputId);
      let icon = iconElement.querySelector("svg");

      if (input.type === "password") {
          input.type = "text";
          icon.innerHTML = `
              <path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a19.4 19.4 0 0 1 4.22-5.86M9.88 9.88A3 3 0 0 1 12 9c1.66 0 3 1.34 3 3 0 .37-.07.72-.18 1.05M3 3l18 18"/>
          `;
      } else {
          input.type = "password";
          icon.innerHTML = `
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
          `;
      }
  }

  // ทำให้ฟังก์ชันใช้งานได้ทุกที่
  window.togglePassword = togglePassword;
});
// const topMovies = [
//   { number: 1, img: '/images/poster/teeyod2.jpg', title: 'ธี่หยด 2 (2024)', rating: 7.2 },
//   { number: 2, img: '/images/poster/teeyod2.jpg', title: 'ธี่หยด 2 (2024)', rating: 7.2 },
//   { number: 3, img: '/images/poster/teeyod2.jpg', title: 'ธี่หยด 2 (2024)', rating: 7.2 },
//   { number: 4, img: '/images/poster/teeyod2.jpg', title: 'ธี่หยด 2 (2024)', rating: 7.2 },
//   { number: 5, img: '/images/poster/teeyod2.jpg', title: 'ธี่หยด 2 (2024)', rating: 7.2 },
//   { number: 6, img: '/images/poster/teeyod2.jpg', title: 'ธี่หยด 2 (2024)', rating: 7.2 },
//   { number: 7, img: '/images/poster/teeyod2.jpg', title: 'ธี่หยด 2 (2024)', rating: 7.2 },
//   { number: 8, img: '/images/poster/teeyod2.jpg', title: 'ธี่หยด 2 (2024)', rating: 7.2 },
//   { number: 9, img: '/images/poster/teeyod2.jpg', title: 'ธี่หยด 2 (2024)', rating: 7.2 },
//   { number: 10, img: '/images/poster/teeyod2.jpg', title: 'ธี่หยด 2 (2024)', rating: 7.2 }
// ];

// let startIndex = 0;
// const displayCount = 5;

// function renderMovies() {
//   const container = document.querySelector('.movie-container');
//   container.innerHTML = ''; // Clear existing content

//   for (let i = startIndex; i < startIndex + displayCount; i++) {
//       if (i >= topMovies.length) break;
//       const movie = topMovies[i];
//       const movieElement = document.createElement("div");
//       movieElement.classList.add("title-item");
//       movieElement.innerHTML = `
//           <div class="title-item-number">${movie.number}</div>
//           <a href="/" class="title-item-link">
//               <figure>
//                   <img class="poster-top" src="${movie.img}" alt="${movie.title}">
//               </figure>
//               <div class="imdb-rate">${movie.rating}</div>
//               <div class="poster-title-box">
//                   <div class="top-title">
//                       <span class="entry-title">${movie.title}</span>
//                   </div>
//               </div>
//           </a>
//       `;
//       container.appendChild(movieElement);
//   }
// }

// function scrollMovies() {
//   if (startIndex + displayCount < topMovies.length) {
//       startIndex++;  // Move forward
//   } else {
//       startIndex = 0; // Loop back to start if at end
//   }
//   renderMovies();
// }

// document.addEventListener('DOMContentLoaded', () => {
//   renderMovies();
//   document.getElementById('scroll-button').addEventListener('click', scrollMovies);
// });

// // Search Movies Script
// const searchMoviesList = [
//   { title: "Maleficent", year: 2014, image: "/images/poster/maleficent.jpg" },
//   { title: "Maleficent: Mistress of Evil", year: 2019, image: "/images/poster/maleficent2.jpg" },
//   { title: "The Lion King", year: 2019, image: "/images/poster/lionking.jpg" },
//   { title: "Beauty and the Beast", year: 2017, image: "/images/poster/beautyandthebeast.jpg" }
// ];

// function searchMovies() {
//   let input = document.querySelector('.search-input').value.toLowerCase();
//   let resultsContainer = document.getElementById('searchResults');
  
//   if (input.length === 0) {
//       resultsContainer.style.display = 'none';
//       return;
//   }

//   let filteredMovies = searchMoviesList.filter(movie => movie.title.toLowerCase().includes(input));

//   if (filteredMovies.length === 0) {
//       resultsContainer.innerHTML = '<div class="see-all">No results found</div>';
//   } else {
//       resultsContainer.innerHTML = filteredMovies.map((movie, index) => `
//           <div class="result-item ${index === 0 ? 'selected' : ''}" onclick="selectMovie('${movie.title}')">
//               <img src="${movie.image}" alt="${movie.title}">
//               <div class="result-text">
//                   <span class="result-title">${movie.title}</span>
//                   <span class="result-year">${movie.year}</span>
//               </div>
//           </div>
//       `).join('') + `<div class="see-all">See all results for "${input}"</div>`;
//   }

//   resultsContainer.style.display = 'block';
// }

// function selectMovie(title) {
//   document.querySelector('.search-input').value = title;
//   document.getElementById('searchResults').style.display = 'none';
// }

// function showResults() {
//   if (document.querySelector('.search-input').value.length > 0) {
//       document.getElementById('searchResults').style.display = 'block';
//   }
// }

// document.addEventListener('click', function(event) {
//   let searchContainer = document.querySelector('.search-container');
//   if (!searchContainer.contains(event.target)) {
//       document.getElementById('searchResults').style.display = 'none';
//   }
// });

// document.addEventListener('keydown', function(event) {
//   let resultsContainer = document.getElementById('searchResults');
//   let items = document.querySelectorAll('.result-item');
//   let selected = document.querySelector('.result-item.selected');

//   if (!resultsContainer.style.display || resultsContainer.style.display === 'none') return;

//   if (event.key === 'ArrowDown') {
//       event.preventDefault();
//       if (selected) {
//           let next = selected.nextElementSibling;
//           if (next && next.classList.contains('result-item')) {
//               selected.classList.remove('selected');
//               next.classList.add('selected');
//           }
//       } else if (items.length > 0) {
//           items[0].classList.add('selected');
//       }
//   } else if (event.key === 'ArrowUp') {
//       event.preventDefault();
//       if (selected) {
//           let prev = selected.previousElementSibling;
//           if (prev && prev.classList.contains('result-item')) {
//               selected.classList.remove('selected');
//               prev.classList.add('selected');
//           }
//       }
//   } else if (event.key === 'Enter' && selected) {
//       selectMovie(selected.querySelector('.result-title').innerText);
//   }
// });

