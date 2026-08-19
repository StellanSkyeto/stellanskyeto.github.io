const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const previewCard = document.getElementById('previewCard');
const imgPreview = document.getElementById('imgPreview');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultCard = document.getElementById('resultCard');
const aiOutput = document.getElementById('aiOutput');
const apiKeyInput = document.getElementById('apiKey');

let base64Image = "";
let imageMimeType = "image/jpeg"; // Mặc định

// Chuyển ảnh sang Base64 để gửi sang Gemini API
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

async function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    return alert("Vui lòng chọn file hình ảnh!");
  }

  // Tự động lấy chuẩn định dạng ảnh (png, jpeg, webp...)
  imageMimeType = file.type || "image/jpeg";
  imgPreview.src = URL.createObjectURL(file);
  base64Image = await fileToBase64(file);

  previewCard.classList.remove('hidden');
  resultCard.classList.add('hidden');
}

// Event Upload
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

// Drag & Drop
dropZone.addEventListener('dragover', (e) => e.preventDefault());
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});

// Phân tích màu bằng Gemini Flash API
analyzeBtn.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) return alert("please enter Gemini API Key! OwO");
  if (!base64Image) return alert("Bradar choose ur Image first!");

  analyzeBtn.innerText = "⏳ AI is analyzing colors....";
  analyzeBtn.disabled = true;

  const promptText = `You are a professional Director of Photography (DoP). Please analyze this image and provide detailed cinematic color grading instructions in Vietnamese:
1. Brief comments on lighting (general lighting, highlights, shadows).
2. Suggested color style (e.g., Teal & Orange, Moody, 35mm film look, Vintage, etc.).
3. Recommended color grading settings for apps like Alight Motion, CapCut, or Lightroom:
   - Exposure / Brightness:
   - Contrast:
   - Highlights / Shadows:
   - Temperature / Tint:
	 - Color Grading Wheel if can
	 - etc ...
	 4. Advice on improving the camera angle or lighting for future shots.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: promptText },
            { inline_data: { mime_type: imageMimeType, data: base64Image } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
      const textResult = data.candidates[0].content.parts[0].text;
      aiOutput.innerHTML = marked.parse(textResult);
      resultCard.classList.remove('hidden');
    } else if (data.error) {
      alert("❌ Lỗi API từ Google: " + data.error.message);
    } else {
      alert("❌ Có lỗi xảy ra khi gọi AI API!");
    }
  } catch (err) {
    alert("❌ Lỗi kết nối mạng hoặc sai API Key!");
    console.error(err);
  } finally {
    analyzeBtn.innerText = "✨ Analyze Color & Lighting";
    analyzeBtn.disabled = false;
  }
});