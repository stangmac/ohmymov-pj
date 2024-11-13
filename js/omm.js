function toggleBookmark(element) {
    element.classList.toggle("active");
}
document.querySelector("#show-signin").addEventListener("click", function() {
    document.querySelector("#signinModal").classList.add("active");
});
document.querySelector(".popup-signin-p .close-btn").addEventListener("click", function() {
    document.querySelector("#signinModal").classList.remove("active");
});