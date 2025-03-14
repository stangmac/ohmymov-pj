document.addEventListener("DOMContentLoaded", function () {
    const changePasswordBtn = document.getElementById("changePasswordBtn");
    const passwordSection = document.getElementById("passwordSection");
    const requestOtpBtn = document.getElementById("requestOtpBtn");
    const otpSection = document.getElementById("otpSection");
    const submitPasswordBtn = document.getElementById("submitPasswordBtn");

    // แสดงฟอร์มเปลี่ยนรหัสผ่าน
    changePasswordBtn.addEventListener("click", function () {
        passwordSection.classList.toggle("hidden");
    });

    // ขอ OTP
    requestOtpBtn.addEventListener("click", async function () {
        try {
            const response = await fetch("/request-otp", { method: "POST" });
            const data = await response.json();

            if (data.success) {
                otpSection.classList.remove("hidden");
                alert("OTP has been sent to your email.");
            } else {
                alert("Error sending OTP: " + data.message);
            }
        } catch (error) {
            console.error("OTP request failed:", error);
        }
    });

    // เปลี่ยนรหัสผ่าน
    submitPasswordBtn.addEventListener("click", async function () {
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const otpCode = document.getElementById("otpCode").value;

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword, otpCode })
            });

            const data = await response.json();
            if (data.success) {
                alert("Password changed successfully!");
                location.reload();
            } else {
                alert("Error changing password: " + data.message);
            }
        } catch (error) {
            console.error("Password change failed:", error);
        }
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const editProfileBtn = document.getElementById("editProfileBtn");
    const editProfileFormContainer = document.getElementById("editProfileFormContainer");
    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    const inputs = document.querySelectorAll("#editProfileForm input, #editProfileForm select");

    // ✅ เปิดฟอร์มแก้ไขเมื่อคลิกปุ่ม EDIT PROFILE
    editProfileBtn.addEventListener("click", function () {
        editProfileFormContainer.classList.toggle("hidden");
    });

    // ✅ ทำให้ input สามารถแก้ไขได้
    editBtn.addEventListener("click", function () {
        inputs.forEach(input => input.disabled = false);
        editBtn.classList.add("hidden");
        saveBtn.classList.remove("hidden");
    });

    // ✅ บันทึกข้อมูลโปรไฟล์
    saveBtn.addEventListener("click", async function (e) {
        e.preventDefault();

        const userData = {
            username: document.getElementById("username").value,
            email: document.getElementById("email").value,
            gender: document.getElementById("gender").value
        };

        try {
            const response = await fetch("/update-profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const result = await response.json();
            if (result.success) {
                alert("Profile updated successfully!");
                location.reload();
            } else {
                alert("Error updating profile: " + result.message);
            }
        } catch (error) {
            console.error("Update failed:", error);
        }
    });
});
