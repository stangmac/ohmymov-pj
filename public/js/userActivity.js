// ฟังก์ชันสำหรับบันทึกกิจกรรมของผู้ใช้
function logUserActivity(movieId, action) {
    console.log(`User performed action: ${action} on movie with ID: ${movieId}`);
    
    // ส่งข้อมูลไปยังเซิร์ฟเวอร์ (หากต้องการ)
    fetch(`/user-activity/${movieId}/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            movieId: movieId,
            action: action,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('Activity logged successfully');
        } else {
            console.error('Failed to log activity');
        }
    })
    .catch(error => {
        console.error('Error logging activity:', error);
    });
    
}
