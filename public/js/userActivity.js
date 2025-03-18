async function logUserActivity(movieId, action) {
    try {
        console.log("Sending Activity:", { movieId, action });

        const response = await fetch("/log-activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ movieId, action })
        });

        const data = await response.json();
        console.log("Response:", data);
    } catch (error) {
        console.error("Error logging activity:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const wishlistButton = document.getElementById("wishlist-button");
    const seenButton = document.getElementById("seen-button");

    wishlistButton.addEventListener("click", function () {
        toggleUserActivity(wishlistButton, "wishlist");
    });

    seenButton.addEventListener("click", function () {
        toggleUserActivity(seenButton, "seen");
    });

    async function toggleUserActivity(button, action) {
        const movieId = new URLSearchParams(window.location.search).get("id");
        const isActive = button.classList.contains("active-style");

        try {
            const response = await fetch("/toggle-activity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ movieId, action, isActive })
            });

            const result = await response.json();
            if (result.success) {
                button.classList.toggle("active-style");
            } else {
                console.error("Failed to update activity");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
});
