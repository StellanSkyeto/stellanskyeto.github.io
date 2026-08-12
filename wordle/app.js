// Đăng ký Service Worker cho PWA Offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.log('Service Worker registered successfully!', reg.scope))
      .catch((err) => console.log('Service Worker registration failed:', err));
  });
}
// app.js
let targetWord = "";
let currentRow = 0;
let currentTile = 0;
let guesses = Array(6).fill(null).map(() => ["", "", "", "", ""]);

// Thư viện thoại Skyeto mặc định
let skyetoLibrary = {
  NEAR_WIN: ["Almost here~ Keep goin' !", "If you succeed, I'll give you a subscribe >:3"],
  WIN: ["WOW! You got it! 🎉", "Awesome! You deserve a sub >:3"],
  LOSE: ["Aww, next time for sure!"],
  CLICK: ["Customizing my settings? 🛠️", "Let's import your files! >:3"],
  DEFAULT: ["Skyeto is watching... 👀", "Think carefully!"]
};

// Khởi tạo Game
window.onload = function() {
  initGame();
};

function initGame() {
  if (typeof WORDS !== 'undefined' && WORDS.length > 0) {
    targetWord = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
  } else {
    targetWord = "APPLE";
  }
  
  const board = document.getElementById("board");
  board.innerHTML = "";
  for (let r = 0; r < 6; r++) {
    let rowDiv = document.createElement("div");
    rowDiv.className = "row";
    for (let c = 0; c < 5; c++) {
      let tile = document.createElement("div");
      tile.className = "tile";
      tile.id = `tile-${r}-${c}`;
      rowDiv.appendChild(tile);
    }
    board.appendChild(rowDiv);
  }

  buildKeyboard();
}

function buildKeyboard() {
  const keyboard = document.getElementById("keyboard");
  keyboard.innerHTML = '<div class="kbd-row" id="row1"></div><div class="kbd-row" id="row2"></div><div class="kbd-row" id="row3"></div>';
  
  const keysLayout = [
    ["Q","W","E","R","T","Y","U","I","O","P"],
    ["A","S","D","F","G","H","J","K","L"],
    ["Z","X","C","V","B","N","M","⌫"]
  ];

  keysLayout.forEach((row, idx) => {
    const rowDiv = document.getElementById(`row${idx + 1}`);
    row.forEach(key => {
      const btn = document.createElement("button");
      btn.className = "key" + (key === "⌫" ? " key-wide" : "");
      btn.innerText = key;
      btn.onclick = () => handleInput(key);
      rowDiv.appendChild(btn);
    });
  });
}

function handleInput(key) {
  if (key === "⌫") {
    if (currentTile > 0) {
      currentTile--;
      guesses[currentRow][currentTile] = "";
      document.getElementById(`tile-${currentRow}-${currentTile}`).innerText = "";
    }
  } else if (currentTile < 5 && currentRow < 6) {
    guesses[currentRow][currentTile] = key;
    document.getElementById(`tile-${currentRow}-${currentTile}`).innerText = key;
    currentTile++;
  }
}

// CẬP NHẬT BIỂU CẢM & LỜI THOẠI SKYETO
function setSkyeto(imgName, textCategory) {
  document.getElementById("skyeto-avatar").src = imgName;
  let list = skyetoLibrary[textCategory] || skyetoLibrary['DEFAULT'];
  let randomText = list[Math.floor(Math.random() * list.length)];
  document.getElementById("skyeto-bubble").innerText = randomText;
}

// KIỂM TRA TỪ ĐOÁN
function checkWord() {
  if (currentTile < 5) {
    alert("Chưa đủ 5 ký tự!");
    return;
  }

  let guess = guesses[currentRow].join("");
  let correctCount = 0;
  
  for (let i = 0; i < 5; i++) {
    let tile = document.getElementById(`tile-${currentRow}-${i}`);
    let letter = guess[i];

    if (letter === targetWord[i]) {
      tile.classList.add("correct");
      correctCount++;
    } else if (targetWord.includes(letter)) {
      tile.classList.add("present");
    } else {
      tile.classList.add("absent");
    }
  }

  // Đổi cảm xúc Skyeto theo kết quả
  if (guess === targetWord) {
    setSkyeto("skyeto4.png", "WIN");
  } else if (correctCount >= 3) {
    setSkyeto("skyeto3.png", "NEAR_WIN"); // Đúng >= 3 ô -> skyeto3.png
  } else if (currentRow === 5) {
    setSkyeto("skyeto5.png", "LOSE");
  } else {
    setSkyeto("skyeto2.png", "DEFAULT");
    currentRow++;
    currentTile = 0;
  }
}

// BẤM VÀO SKYETO -> ĐỔI BIỂU CẢM SKYETO6 & MỞ CỬA SỔ SETTINGS
function openSettings() {
  setSkyeto("skyeto6.png", "CLICK");
  document.getElementById("settings-modal").style.display = "flex";
}

function closeSettings() {
  document.getElementById("settings-modal").style.display = "none";
}

// IMPORT FILE WORDS.JS
function importWordsFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      eval(e.target.result);
      if (typeof WORDS !== 'undefined' && Array.isArray(WORDS)) {
        targetWord = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
        alert("Imported Words.js successfully! New game started 🎉");
        closeSettings();
      } else {
        alert("File error: Variable 'WORDS' not found!");
      }
    } catch (err) {
      alert("Syntax error in Words.js file!");
    }
  };
  reader.readAsText(file);
}

// IMPORT FILE LIBRARYSKYETO.TXT
function importLibraryFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    parseCustomTxt(text);
    alert("Imported libraryskyeto.txt successfully! 🎉");
    closeSettings();
  };
  reader.readAsText(file);
}

function parseCustomTxt(text) {
  const lines = text.split('\n');
  let currentCat = 'DEFAULT';
  let newLib = { NEAR_WIN: [], WIN: [], LOSE: [], CLICK: [], DEFAULT: [] };

  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('[') && line.endsWith(']')) {
      currentCat = line.substring(1, line.length - 1);
    } else if (line.length > 0) {
      if (!newLib[currentCat]) newLib[currentCat] = [];
      newLib[currentCat].push(line);
    }
  });

  skyetoLibrary = newLib;
}

// HƯỚNG DẪN CÚ PHÁP FILE BẰNG NÚT (i)
function showGuide(type) {
  const guideModal = document.getElementById("guide-modal");
  const title = document.getElementById("guide-title");
  const desc = document.getElementById("guide-desc");
  const code = document.getElementById("guide-code");

  if (type === 'words') {
    title.innerText = "Words.js Structure Guide";
    desc.innerText = "Format your custom words.js file like this:";
    code.innerText = `// File: words.js\nconst WORDS = [\n  "APPLE",\n  "BEACH",\n  "CLOUD",\n  "DREAM",\n  "EAGLE"\n];`;
  } else if (type === 'library') {
    title.innerText = "libraryskyeto.txt Guide";
    desc.innerText = "Format your dialogue file using categories:";
    code.innerText = `[NEAR_WIN]\nAlmost there~ Keep goin' !\nIf you succeed, I'll sub >:3\n\n[WIN]\nWOW! You got it! 🎉\n\n[CLICK]\nHey! Stop poking me! 😼\n\n[DEFAULT]\nThink carefully!`;
  }

  guideModal.style.display = "flex";
}

function closeGuide() {
  document.getElementById("guide-modal").style.display = "none";
	}