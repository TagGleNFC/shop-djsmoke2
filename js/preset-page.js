document.addEventListener('DOMContentLoaded', () => {
    handleRetractableNav();
    initializePresetPage();
});

function handleRetractableNav() {
    const nav = document.getElementById('retractable-nav');
    if (!nav) return;

    document.addEventListener('mousemove', (e) => {
        if (e.clientY < 80) {
            nav.classList.add('visible');
        }
    });
}

function initializePresetPage() {
    if (typeof allPresets === 'undefined' || allPresets.length === 0) {
        console.error("ERRO: O arquivo data-presets.js não foi carregado ou está vazio.");
        document.body.innerHTML = '<h1 style="text-align:center;padding:5rem;color:white;">Erro ao carregar dados.</h1>';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const presetId = parseInt(params.get('id'));
    const preset = allPresets.find(p => p.id === presetId);

    if (!preset) {
        document.body.innerHTML = '<h1 style="text-align:center;padding:5rem;color:white;">Preset não encontrado.</h1>';
        return;
    }

    populatePageData(preset);
    initializeWaveformPlayer(preset);
    setupTutorialVideo(preset);
    updateBackgroundVideos(preset.backgroundVideo);
}

function updateBackgroundVideos(videoSrc) {
    const mainBgVideo = document.getElementById('main-background-video');
    const sectionBgVideo = document.getElementById('section-background-video');

    if (mainBgVideo && videoSrc) {
        mainBgVideo.src = videoSrc;
        mainBgVideo.load();
        mainBgVideo.play().catch(e => console.error("Erro ao iniciar main background video:", e));
    }
    if (sectionBgVideo && videoSrc) {
        sectionBgVideo.src = videoSrc;
        sectionBgVideo.load();
        sectionBgVideo.play().catch(e => console.error("Erro ao iniciar section background video:", e));
    }
}

function populatePageData(preset) {
    document.title = `${preset.title} - Dj Smoke`;
    document.querySelector('.preset-title').textContent = preset.title;
    document.querySelector('.preset-subtitle-highlighted').textContent = preset.highlightedSubtitle;
    document.querySelector('.preset-description-text').textContent = preset.description;
    document.querySelector('.preset-image').src = preset.image;
    document.querySelector('.preset-image').alt = `Capa do preset ${preset.title}`;

    const toolsImageElement = document.getElementById('tools-image-display');
    if (toolsImageElement && preset.toolsImage) {
        toolsImageElement.src = preset.toolsImage;
    }

    if (preset.packageItems) {
        document.getElementById('total-value-display').textContent = `R$ ${preset.packageItems.totalValue.toFixed(2).replace('.', ',')}`;
        document.getElementById('promo-value-display').textContent = `R$ ${preset.price.toFixed(2).replace('.', ',')}`;
    }

    const finalPurchaseButton = document.querySelector('.btn-purchase-final');
    if (finalPurchaseButton) {
        finalPurchaseButton.addEventListener('click', () => {
            if (preset.purchaseLink) {
                 window.open(preset.purchaseLink, "_blank");
            } else {
                 console.error("Link de compra não definido para este preset.");
            }
        });
    }

    const scrollButton = document.querySelector('.btn-scroll');
    if(scrollButton) {
        scrollButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('#receive-section').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function setupTutorialVideo(preset) {
    const tutorialVideoPlayer = document.getElementById('tutorial-video-player');
    if (tutorialVideoPlayer && preset.tutorialVideo) {
        tutorialVideoPlayer.src = preset.tutorialVideo;
    } else if (tutorialVideoPlayer) {
        tutorialVideoPlayer.parentElement.style.display = 'none';
    }
}

function initializeWaveformPlayer(preset) {
    const WAVEFORM_CONFIG = { playedColor: '#4da6ff', unplayedColor: '#374151' };
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioElement = document.getElementById('audio-element');
    const playButton = document.getElementById('play-button');
    const playIcon = playButton.querySelector('.play-icon');
    const pauseIcon = playButton.querySelector('.pause-icon');
    const waveformCanvas = document.getElementById('waveform-canvas');
    const waveformContainer = document.getElementById('waveform-container');
    if (!waveformCanvas) return;
    const ctx = waveformCanvas.getContext('2d');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    let normalizedData = [];
    let animationFrameId;
    const audioSrc = preset.audio;

    if (!audioSrc) {
        console.error(`Áudio não encontrado para o preset no data-presets.js: ${preset.title}`);
        return;
    }
    audioElement.src = audioSrc;

    async function precomputeWaveformData() {
        try {
            const response = await fetch(audioSrc);
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status} - Verifique o caminho do arquivo de áudio.`); }
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const rawData = audioBuffer.getChannelData(0);
            const samples = waveformContainer.offsetWidth;
            const blockSize = Math.floor(rawData.length / samples);
            normalizedData = [];
            for (let i = 0; i < samples; i++) {
                let blockStart = blockSize * i;
                let sum = 0;
                for (let j = 0; j < blockSize; j++) {
                    sum += Math.abs(rawData[blockStart + j] || 0);
                }
                normalizedData.push(sum / blockSize);
            }
            const maxAmp = Math.max(...normalizedData);
            if (maxAmp > 0) { normalizedData = normalizedData.map(n => n / maxAmp); }
            draw();
        } catch (error) { console.error("Erro ao processar o áudio:", error); }
    }

    function draw() {
        if (!waveformCanvas || !waveformContainer) return;
        const dpr = window.devicePixelRatio || 1;
        waveformCanvas.width = waveformContainer.offsetWidth * dpr;
        waveformCanvas.height = waveformContainer.offsetHeight * dpr;
        ctx.scale(dpr, dpr);
        const width = waveformContainer.offsetWidth;
        const height = waveformContainer.offsetHeight;
        const progressInPixels = audioElement.duration ? Math.floor((audioElement.currentTime / audioElement.duration) * width) : 0;
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < normalizedData.length; i++) {
            const barHeight = normalizedData[i] * height;
            const y = (height - barHeight) / 2;
            ctx.fillStyle = i < progressInPixels ? WAVEFORM_CONFIG.playedColor : WAVEFORM_CONFIG.unplayedColor;
            ctx.fillRect(i, y, 1, barHeight);
        }
    }
    const togglePlay = () => { if (audioContext.state === 'suspended') { audioContext.resume(); } audioElement.paused ? audioElement.play() : audioElement.pause(); };
    playButton.addEventListener('click', togglePlay);
    audioElement.addEventListener('play', () => { playIcon.style.display = 'none'; pauseIcon.style.display = 'block'; requestAnimationFrame(update); });
    audioElement.addEventListener('pause', () => { playIcon.style.display = 'block'; pauseIcon.style.display = 'none'; cancelAnimationFrame(animationFrameId); });
    audioElement.addEventListener('loadedmetadata', () => { totalTimeDisplay.textContent = formatTime(audioElement.duration); precomputeWaveformData(); });
    audioElement.addEventListener('timeupdate', () => { currentTimeDisplay.textContent = formatTime(audioElement.currentTime); });
    audioElement.addEventListener('ended', () => { audioElement.currentTime = 0; });
    waveformContainer.addEventListener('click', (event) => { if (!audioElement.duration) return; const rect = waveformContainer.getBoundingClientRect(); const clickPosition = (event.clientX - rect.left) / rect.width; audioElement.currentTime = clickPosition * audioElement.duration; if (normalizedData.length > 0) draw(); });
    function update() { if (!audioElement.paused) { draw(); animationFrameId = requestAnimationFrame(update); } }
    function formatTime(seconds) { if (isNaN(seconds)) return "0:00"; const minutes = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${minutes}:${secs.toString().padStart(2, '0')}`; }
}