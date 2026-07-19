// ==========================================================================
// 1. Hàm đóng / mở rộng danh sách các liên kết link
// ==========================================================================
function toggleMenu() {
    const hiddenLinks = document.getElementById("hidden-links");
    const arrowBtn = document.getElementById("arrow-btn");
    
    if (hiddenLinks.style.display === "none") {
        hiddenLinks.style.display = "flex";
        arrowBtn.innerText = "▲"; // Đổi mũi tên chỉ lên
    } else {
        hiddenLinks.style.display = "none";
        arrowBtn.innerText = "▼"; // Đổi mũi tên chỉ xuống
    }
}

// ==========================================================================
// 2. Hàm giả lập tiếng mèo kêu Meow! và đổi ảnh Skyeto biểu cảm mở miệng
// ==========================================================================
function makeMeow() {
    const bubble = document.getElementById("speech-bubble");
    const mascotImg = document.getElementById("skyeto-mascot");
    
    // Hiện bong bóng thoại & đổi sang ảnh Skyeto há miệng kêu meow
    bubble.style.visibility = "visible";
    mascotImg.src = "skyeto-meow.png";
    
    // Tự phát âm thanh bíp giả tiếng mèo kêu "mẻo mẻo"
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, context.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1250, context.currentTime + 0.15); 
    
    gain.gain.setValueAtTime(0.08, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.18);
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.start();
    osc.stop(context.currentTime + 0.18);

    // Tự động ẩn bong bóng thoại & đổi Skyeto về lại ảnh ngậm miệng sau 1 giây
    setTimeout(() => {
        bubble.style.visibility = "hidden";
        mascotImg.src = "skyeto-closedmouth.png";
    }, 1000);
}

// ==========================================================================
// 3. XỬ LÝ SỰ KIỆN TÌM KIẾM VÀ CHUYỂN HƯỚNG LIÊN KẾT URL TÙY CHỈNH
// ==========================================================================

// Lắng nghe sự kiện khi người dùng bấm vào nút kính lúp
document.getElementById('search-submit-btn').addEventListener('click', executeSearch);

// Lắng nghe sự kiện khi người dùng gõ chữ và nhấn phím Enter trên bàn phím
document.getElementById('custom-search-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        executeSearch();
    }
});

// Hàm thực hiện chuyển hướng trang
function executeSearch() {
    const inputVal = document.getElementById('custom-search-input').value.trim();
    
    if (inputVal !== "") {
        // Nếu người dùng chỉ gõ tên mục (ví dụ: "feedtheskyeto"), web sẽ tự chuyển sang trang đó
        window.location.href = inputVal;
    }
}
