// ===============================================
// BITCRUSHER STUDIO PRO - WEB APP ENGINE (V3.6)
// Stellan Skyeto Project
// ===============================================

let audioCtx, originalBuffer, processedBuffer, sourceNode;
let isPlaying = false;
let isDraggingScrubber = false;
let analyser, canvasCtx, animationFrame;
let startTime = 0;
let pauseOffset = 0;

const playBtn = document.getElementById('playBtn');
const exportBtn = document.getElementById('exportWav');
const scrubber = document.getElementById('scrubber');
const timeDisplay = document.getElementById('timeDisplay');
const bitSlider = document.getElementById('bitDepth');
const sampleSlider = document.getElementById('downsample');
const mixSlider = document.getElementById('mix');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const fileBadge = document.getElementById('fileBadge');
const canvas = document.getElementById('spectrogram');
canvasCtx = canvas.getContext('2d');

// Trigger chọn file trên mobile / Safari
selectFileBtn.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
});

// Xử lý nạp file âm thanh
fileInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    fileBadge.innerText = "LOADING: " + file.name.toUpperCase();
    
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        const arrayBuffer = await file.arrayBuffer();
        
        // Sử dụng Callback truyền thống tương thích 100% Safari/iOS
        audioCtx.decodeAudioData(
            arrayBuffer,
            (buffer) => {
                originalBuffer = buffer;
                scrubber.max = originalBuffer.duration;
                scrubber.disabled = false;
                
                fileBadge.innerText = "READY: " + file.name.toUpperCase();
                updateTimeDisplay(0, originalBuffer.duration);
                processAudio();
            },
            (err) => {
                console.error("Decode error:", err);
                alert("Không thể đọc file này. Hãy thử file MP3 hoặc WAV khác nhé!");
                fileBadge.innerText = "UNSUPPORTED FORMAT";
            }
        );

    } catch (err) {
        console.error("File read error:", err);
        alert("Lỗi đọc file: " + err.message);
        fileBadge.innerText = "ERROR LOADING FILE";
    }
});

function processAudio() {
    if (!originalBuffer) return;

    try {
        const bits = parseInt(bitSlider.value);
        const normFactor = Math.pow(2, bits - 1);
        const factor = parseInt(sampleSlider.value);
        const mix = parseFloat(mixSlider.value) / 100;

        const numChannels = originalBuffer.numberOfChannels;
        const length = originalBuffer.length;
        const sampleRate = originalBuffer.sampleRate;

        processedBuffer = audioCtx.createBuffer(numChannels, length, sampleRate);

        for (let channel = 0; channel < numChannels; channel++) {
            const input = originalBuffer.getChannelData(channel);
            const output = processedBuffer.getChannelData(channel);
            let lastSample = 0;

            for (let i = 0; i < length; i++) {
                if (i % factor === 0) {
                    lastSample = Math.round(input[i] * normFactor) / normFactor;
                }
                output[i] = input[i] * (1 - mix) + lastSample * mix;
            }
        }
        
        if (isPlaying) {
            let currentPos = audioCtx.currentTime - startTime;
            stopAudioNode();
            playAudio(currentPos);
        }
    } catch (err) {
        console.error("Process error:", err);
    }
}

function playAudio(offset = 0) {
    if (!processedBuffer) {
        alert("Uh Oh , You haven't imported the audio file (MP3, WAV, etc.) yet :<");
        return;
    }
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = processedBuffer;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;

    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);

    startTime = audioCtx.currentTime - offset;
    pauseOffset = offset;
    sourceNode.start(0, offset);
    isPlaying = true;
    playBtn.innerHTML = '<span>⏸</span> PAUSE AUDIO';

    drawSpectrogram();
    updateProgress();

    sourceNode.onended = () => {
        if (audioCtx.currentTime - startTime >= processedBuffer.duration) {
            isPlaying = false;
            pauseOffset = 0;
            scrubber.value = 0;
            updateTimeDisplay(0, processedBuffer.duration);
            playBtn.innerHTML = '<span>▶</span> PLAY AUDIO';
            cancelAnimationFrame(animationFrame);
        }
    };
}

function stopAudioNode() {
    if (sourceNode) {
        try { sourceNode.stop(); } catch(e){}
        sourceNode.disconnect();
        sourceNode = null;
    }
}

function stopAudio(resetOffset = true) {
    stopAudioNode();
    pauseOffset = resetOffset ? 0 : (audioCtx.currentTime - startTime);
    isPlaying = false;
    playBtn.innerHTML = '<span>▶</span> PLAY AUDIO';
    cancelAnimationFrame(animationFrame);
}

function updateProgress() {
    if (!isPlaying) return;
    const current = audioCtx.currentTime - startTime;
    pauseOffset = current;
    
    if (!isDraggingScrubber) {
        scrubber.value = current;
        updateTimeDisplay(current, processedBuffer.duration);
    }
    requestAnimationFrame(updateProgress);
}

function formatTime(sec) {
    if (isNaN(sec) || sec < 0) sec = 0;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
}

function updateTimeDisplay(cur, dur) {
    timeDisplay.innerText = formatTime(cur) + " / " + formatTime(dur);
}

scrubber.addEventListener('touchstart', () => { isDraggingScrubber = true; });
scrubber.addEventListener('mousedown', () => { isDraggingScrubber = true; });

scrubber.addEventListener('input', () => {
    pauseOffset = parseFloat(scrubber.value);
    updateTimeDisplay(pauseOffset, processedBuffer ? processedBuffer.duration : 0);
});

const onScrubberEnd = () => {
    if (isDraggingScrubber) {
        isDraggingScrubber = false;
        pauseOffset = parseFloat(scrubber.value);
        if (isPlaying) {
            stopAudioNode();
            playAudio(pauseOffset);
        }
    }
};

scrubber.addEventListener('touchend', onScrubberEnd);
scrubber.addEventListener('mouseup', onScrubberEnd);

// Sự kiện bấm nút PLAY - Kích hoạt AudioContext
playBtn.addEventListener('click', async () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    if (isPlaying) {
        pauseOffset = audioCtx.currentTime - startTime;
        stopAudio(false);
    } else {
        playAudio(pauseOffset);
    }
});

[bitSlider, sampleSlider, mixSlider].forEach(slider => {
    slider.addEventListener('input', () => {
        document.getElementById('bitVal').innerText = bitSlider.value + ' bits';
        document.getElementById('sampleVal').innerText = sampleSlider.value + 'x';
        document.getElementById('mixVal').innerText = mixSlider.value + '%';
        processAudio();
    });
});

function drawSpectrogram() {
    if (!isPlaying || !analyser) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const width = canvas.width = canvas.clientWidth * 2;
    const height = canvas.height = canvas.clientHeight * 2;

    function renderFrame() {
        if (!isPlaying) return;
        animationFrame = requestAnimationFrame(renderFrame);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, width, height);

        const barWidth = (width / bufferLength) * 1.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height;
            
            const gradient = canvasCtx.createLinearGradient(0, height, 0, 0);
            gradient.addColorStop(0, 'rgba(0, 242, 254, 0.2)');
            gradient.addColorStop(1, '#00f2fe');

            canvasCtx.fillStyle = gradient;
            canvasCtx.fillRect(x, height - barHeight, barWidth - 4, barHeight);

            x += barWidth;
        }
    }
    renderFrame();
}

exportBtn.addEventListener('click', () => {
    if (!processedBuffer) {
        alert("Uh Oh , You haven't imported the audio file (MP3, WAV, etc.) yet :<");
        return;
    }
    const wavData = bufferToWav(processedBuffer);
    const blob = new Blob([wavData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'bitcrushed_audio.wav';
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 1000);
});

function bufferToWav(buffer) {
    let numOfChan = buffer.numberOfChannels,
        length = buffer.length * numOfChan * 2 + 44,
        out = new DataView(new ArrayBuffer(length)),
        channels = [], i, sample, offset = 0, pos = 0;

    function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
    function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (i = 0; i < buffer.numberOfChannels; i++) channels.push(buffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            out.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }
    return out.buffer;
		}