document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const bars = navToggle.querySelectorAll(".bar");
            bars.forEach((bar, index) => {
                bar.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                if (navMenu.classList.contains("active")) {
                    if (index === 0) bar.style.transform = "rotate(45deg) translate(5px, 5px)";
                    if (index === 1) bar.style.opacity = "0";
                    if (index === 2) bar.style.transform = "rotate(-45deg) translate(7px, -6px)";
                } else {
                    bar.style.transform = "none";
                    bar.style.opacity = "1";
                }
            });
        });
    }

    initializePage();
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        if (i !== j) [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createBeatCard(beat) {
    let priceDisplay;
    if (beat.onPromotion && beat.originalPrice) {
        const originalPriceFormatted = `R$ ${beat.originalPrice.toFixed(2)}`;
        const priceFormatted = `R$ ${beat.price.toFixed(2)}`;
        priceDisplay = `
            <span class="beat-price on-sale">
                <span class="original-price">${originalPriceFormatted}</span>
                ${priceFormatted}
            </span>`;
    } else {
        const priceFormatted = `R$ ${beat.price.toFixed(2)}`;
        priceDisplay = `<span class="beat-price">${priceFormatted}</span>`;
    }

    return `
        <a href="pagina-beat.html?id=${beat.id}" class="beat-card-link">
            <div class="beat-card" data-id="${beat.id}">
                <div class="beat-image"><img src="${beat.image}" alt="${beat.title}"></div>
                <div class="beat-info">
                    <h3 class="beat-title">${beat.title}</h3>
                    <div class="beat-details"><span class="beat-bpm">${beat.bpm} BPM</span>${priceDisplay}</div>
                </div>
            </div>
        </a>
    `;
}

function initializePage() {
    if (typeof allBeats === 'undefined' || allBeats.length === 0) {
        console.error("ERRO: O arquivo data-beats.js não foi carregado ou está vazio.");
        document.body.innerHTML = '<h1 style="text-align:center;padding:5rem;color:white;">Erro ao carregar dados.</h1>';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const beatId = parseInt(params.get('id'));
    const beat = allBeats.find(b => b.id === beatId);

    if (!beat) {
        document.body.innerHTML = '<h1 style="text-align:center;padding:5rem;color:white;">Beat não encontrado.</h1>';
        return;
    }

    populatePageData(beat);
    initializeWaveformPlayer(beat);
    loadRelatedBeats(beat);
}

function populatePageData(beat) {
    document.title = `${beat.title} - Dj Smoke`;
    const wrapper = document.getElementById('beat-content-wrapper');
    if (!wrapper) return;
    
    wrapper.querySelector('.player-info .beat-title').textContent = beat.title;
    wrapper.querySelector('.player-info .beat-genre').textContent = beat.genre;
    wrapper.querySelector('.player-info .beat-bpm').textContent = `${beat.bpm} BPM`;
    wrapper.querySelector('.player-info .beat-key').textContent = beat.key || 'N/A';
    
    const vibeElement = wrapper.querySelector('.beat-vibe');
    if (beat.vibe && beat.vibe.length > 0) {
        vibeElement.textContent = `Vibe: ${beat.vibe.join(', ')}`;
        vibeElement.style.display = 'inline';
    } else {
        vibeElement.style.display = 'none';
    }
    
    wrapper.querySelector('.beat-description-text').textContent = beat.description || 'Descrição não disponível.';
    wrapper.querySelector('.specs-list').innerHTML = `<li><strong>BPM:</strong> ${beat.bpm}</li><li><strong>Tonalidade:</strong> ${beat.key || 'N/A'}</li><li><strong>Gênero:</strong> ${beat.genre}</li>`;
    
    const priceDisplayContainer = wrapper.querySelector('.price-display');
    if (beat.onPromotion && beat.originalPrice) {
        priceDisplayContainer.innerHTML = `
            <span class="price original-price-large">R$ ${beat.originalPrice.toFixed(2)}</span>
            <span class="price">R$ ${beat.price.toFixed(2)}</span>
            <span class="price-label">Licença Padrão</span>
        `;
    } else {
        priceDisplayContainer.querySelector('.price').textContent = `R$ ${beat.price.toFixed(2)}`;
    }
    
    const artworkImage = wrapper.querySelector('.artwork-image');
    artworkImage.src = beat.image;
    artworkImage.alt = `Capa do beat ${beat.title}`;
}

function initializeWaveformPlayer(beat) {
    const WAVEFORM_CONFIG = {
        playedColor: '#4da6ff',
        unplayedColor: '#374151'
    };

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioElement = document.getElementById('audio-element');
    const playButton = document.getElementById('play-button');
    const artworkPlayButton = document.querySelector('.artwork-play-btn');
    const purchaseButton = document.querySelector('.btn-purchase');
    const playIcon = playButton.querySelector('.play-icon');
    const pauseIcon = playButton.querySelector('.pause-icon');
    const waveformCanvas = document.getElementById('waveform-canvas');
    const waveformContainer = document.getElementById('waveform-container');
    const ctx = waveformCanvas.getContext('2d');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');

    let normalizedData = [];
    let animationFrameId;

    const audioSrc = beat.preview;

    if (!audioSrc) {
        console.error(`Áudio não encontrado para o beat: ${beat.title}`);
        return;
    }

    audioElement.src = audioSrc;
    audioElement.load();

    async function precomputeWaveformData() {
        try {
            const response = await fetch(audioSrc);
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
            if (maxAmp > 0) {
                normalizedData = normalizedData.map(n => n / maxAmp);
            }
            draw();
        } catch (error) {
            console.error("Erro ao processar o áudio:", error);
        }
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

    const togglePlay = () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        audioElement.paused ? audioElement.play() : audioElement.pause();
    };

    playButton.addEventListener('click', togglePlay);
    artworkPlayButton.addEventListener('click', togglePlay);
    
    purchaseButton.addEventListener('click', () => {
        if (beat.purchaseLink) {
            window.open(beat.purchaseLink, '_blank');
        } else {
            console.error("Link de compra não encontrado para este beat!");
        }
    });

    audioElement.addEventListener('play', () => {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        requestAnimationFrame(update);
    });

    audioElement.addEventListener('pause', () => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        cancelAnimationFrame(animationFrameId);
    });

    audioElement.addEventListener('loadedmetadata', () => {
        totalTimeDisplay.textContent = formatTime(audioElement.duration);
        precomputeWaveformData();
    });

    audioElement.addEventListener('timeupdate', () => {
        currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
    });

    audioElement.addEventListener('ended', () => {
        audioElement.currentTime = 0;
    });

    waveformContainer.addEventListener('click', (event) => {
        if (!audioElement.duration) return;
        const rect = waveformContainer.getBoundingClientRect();
        const clickPosition = (event.clientX - rect.left) / rect.width;
        audioElement.currentTime = clickPosition * audioElement.duration;
        if (normalizedData.length > 0) {
            draw();
        }
    });

    function update() {
        if (!audioElement.paused) {
            draw();
            animationFrameId = requestAnimationFrame(update);
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

function loadRelatedBeats(currentBeat) {
    const relatedBeatsGrid = document.getElementById('related-beats-grid');
    if (!relatedBeatsGrid) return;
    const otherBeats = allBeats.filter(b => b.id !== currentBeat.id);
    const shuffledBeats = shuffleArray(otherBeats);
    const randomRelatedBeats = shuffledBeats.slice(0, 3);
    relatedBeatsGrid.innerHTML = randomRelatedBeats.length > 0
        ? randomRelatedBeats.map(createBeatCard).join('')
        : '<p style="color: #9ca3af; text-align: center;">Não há outros beats para mostrar.</p>';
}