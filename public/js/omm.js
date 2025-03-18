

// document.getElementById("show-signin").addEventListener("click", function() {
//   window.location.href = "/login"; 
// });

let elements = document.getElementsByClassName("detailmovie");
for (let i = 0; i < elements.length; i++) {
    elements[i].addEventListener("click", function() {
        window.location.href = "/movie-detail";
    });
}

