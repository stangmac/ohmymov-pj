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
