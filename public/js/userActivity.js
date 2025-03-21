async function logUserActivity(movieId, action) {
    try {
      const response = await fetch('/log-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ movieId, action }) // ส่งข้อมูลไปที่ server
      });
  
      const data = await response.json();
  
      if (data.success) {
        console.log(`Successfully logged ${action} for movie ${movieId}`);
      } else {
        console.error("Error logging user activity:", data.message);
      }
    } catch (error) {
      console.error("Error logging user activity:", error);
    }
  }
  