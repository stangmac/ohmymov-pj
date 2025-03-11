      /// toggle password

      document.addEventListener("DOMContentLoaded", function () {
        function togglePassword(event) {
            console.log("togglePassword function called!"); // ตรวจสอบว่าฟังก์ชันถูกเรียก

            let button = event.currentTarget;
            let input = button.previousElementSibling;
            let icon = button.querySelector("i");

            console.log("Input Field:", input); // ตรวจสอบ input
            console.log("Icon:", icon); // ตรวจสอบ icon

            if (input && icon) {
                if (input.type === "password") {
                    input.type = "text";
                    icon.classList.replace("fa-eye-slash", "fa-eye");
                    console.log("Changed to TEXT");
                } else {
                    input.type = "password";
                    icon.classList.replace("fa-eye", "fa-eye-slash");
                    console.log("Changed to PASSWORD");
                }
            } else {
                console.error("Error: Input or Icon not found!");
            }
        }

        // เพิ่ม event listener ให้ทุกปุ่ม toggle-password
        document.querySelectorAll(".toggle-password").forEach(button => {
            console.log("Adding event listener to:", button); // ตรวจสอบว่าปุ่มไหนได้รับ event
            button.addEventListener("click", togglePassword);
        });
    });