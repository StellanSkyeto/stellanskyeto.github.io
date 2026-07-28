// ==========================================================================
// 1. Quản lý Đóng / Mở Menu 3 Gạch (Hamburger Menu)
// ==========================================================================
function toggleNavMenu() {
    const drawer = document.getElementById("side-nav-drawer");
    drawer.classList.toggle("open");
}

// ==========================================================================
// 2. Hàm đóng / mở rộng danh sách các liên kết link
// ==========================================================================
function toggleMenu() {
    const hiddenLinks = document.getElementById("hidden-links");
    const arrowBtn = document.getElementById("arrow-btn");
    
    if (hiddenLinks.style.display === "none") {
        hiddenLinks.style.display = "flex";
        arrowBtn.innerText = "▲";
    } else {
        hiddenLinks.style.display = "none";
        arrowBtn.innerText = "▼";
    }
}

// ==========================================================================
// 3. Hàm tiếng mèo kêu & đổi biểu cảm Skyeto
// ==========================================================================
function makeMeow() {
    const bubble = document.getElementById("speech-bubble");
    const mascotImg = document.getElementById("skyeto-mascot");
    
    bubble.style.visibility = "visible";
    mascotImg.src = "skyeto-meow.png";
    
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

    setTimeout(() => {
        bubble.style.visibility = "hidden";
        mascotImg.src = "skyeto-closedmouth.png";
    }, 1000);
}

// ==========================================================================
// 4. Tìm kiếm & Chuyển hướng liên kết
// ==========================================================================
document.getElementById('search-submit-btn').addEventListener('click', executeSearch);
document.getElementById('custom-search-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        executeSearch();
    }
});

function executeSearch() {
    let inputVal = document.getElementById('custom-search-input').value.trim().toLowerCase();
    
    if (inputVal !== "") {
        if (inputVal === 'starcolor' || inputVal === 'starcolor/index.html') {
            window.location.href = "starcolor/index.html";
        } else if (inputVal === 'feedtheskyeto' || inputVal === 'feedtheskyeto/index.html') {
            window.location.href = "feedtheskyeto/index.html";
        } else if (inputVal === 'bitcrusher' || inputVal === 'bitcrusher/index.html') {
            window.location.href = "bitcrusher/index.html";
        } else {
            window.location.href = inputVal;
        }
    }
	}