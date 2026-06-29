/* ==========================================================================
   STELLAN SKYETO - OFFICIAL WEBSITE JAVASCRIPT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Thông báo hệ thống khởi chạy thành công trong Console chuột phải
    console.log("🔥 Stellan Skyeto's official website initialized successfully!");

    // 1. CHỌN TẤT CẢ CÁC ĐƯỜNG LINK TRÊN WEB
    const navLinks = document.querySelectorAll(".nav-button");

    // 2. TẠO HIỆU ỨNG TƯƠNG TÁC KHI NGƯỜI DÙNG TƯƠNG TÁC
    navLinks.forEach((link) => {
        
        // Khi người dùng click vào link
        link.addEventListener("click", (event) => {
            const destination = link.getAttribute("href");
            
            // Ghi log kiểm tra đường link ra console để debug khi cần
            console.log(`🔗 Navigating to: ${link.textContent.trim()} -> ${destination}`);
            
            // Bạn có thể thêm các hiệu ứng chuyển cảnh (fade-out) ở đây nếu muốn nâng cấp sau này
        });

        // Tối ưu hiệu ứng hover bằng JS để đảm bảo font Italic phản hồi chuẩn xác trên mọi trình duyệt
        link.addEventListener("mouseenter", () => {
            link.style.fontFamily = "'Coolvetica-It', sans-serif";
        });

        link.addEventListener("mouseleave", () => {
            link.style.fontFamily = "'Coolvetica-Rg', sans-serif";
        });
    });

    // 3. BONUS: HIỆU ỨNG TƯƠNG TÁC NHẸ KHI BẤM VÀO NGỌN LỬA 0001.PNG
    const fireWrapper = document.querySelector(".fire-wrapper");
    if (fireWrapper) {
        fireWrapper.addEventListener("click", () => {
            // Khi bấm vào ngọn lửa, nó sẽ lắc nhẹ một cái rồi quay về vị trí cũ
            fireWrapper.style.transition = "transform 0.1s ease-in-out";
            fireWrapper.style.transform = "rotate(15deg) scale(1.1)";
            
            setTimeout(() => {
                fireWrapper.style.transform = "rotate(6deg) scale(1)";
            }, 150);
            
            console.log("🔥 Someone poked Skyeto's flame!");
        });
    }
});