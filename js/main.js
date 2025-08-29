document.addEventListener("DOMContentLoaded", () => {
    // --- LÓGICA UNIVERSAL (RODA EM TODAS AS PÁGINAS) ---

    // 1. Toggle do Menu Hambúrguer
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

    // 2. Toggle do Dropdown "Catálogos" no Mobile
    const dropdownToggles = document.querySelectorAll('.nav-item-dropdown .nav-link');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            if (window.innerWidth <= 768) {
                const parent = this.parentElement;
                if (parent.querySelector('.dropdown-menu')) {
                    event.preventDefault();
                    parent.classList.toggle('dropdown-active');
                }
            }
        });
    });

    // --- INICIALIZAÇÕES ESPECÍFICAS DE CADA PÁGINA ---
    // O código agora verifica se o elemento existe ANTES de chamar a função

    // Roda apenas na index.html
    if (document.getElementById("featured-beats-grid")) {
        loadFeaturedBeats();
    }
    if (document.getElementById("presets-carousel")) {
        initializePresetsCarousel();
    }
    
    // Roda apenas na sobre.html
    if (document.getElementById("carousel-image")) {
        initializeAboutCarousel();
    }
});


// --- FUNÇÕES GLOBAIS E ESPECÍFICAS ---

function createItemCard(item, page) {
    const priceFormatted = `R$ ${item.price.toFixed(2)}`;
    return `
      <a href="${page}?id=${item.id}" class="beat-card-link">
        <div class="beat-card" data-id="${item.id}">
            <div class="beat-image">
                <img src="${item.image}" alt="${item.title}">
                <div class="beat-overlay"></div>
                <div class="beat-genre">${item.genre || 'Kit'}</div>
            </div>
            <div class="beat-info">
                <h3 class="beat-title">${item.title}</h3>
                <div class="beat-details">
                    <span class="beat-bpm">${item.bpm ? item.bpm + ' BPM' : ''}</span>
                    <span class="beat-price">${priceFormatted}</span>
                </div>
            </div>
        </div>
      </a>
    `;
}

function loadFeaturedBeats() {
    const featuredBeatsGrid = document.getElementById("featured-beats-grid");
    if (typeof allBeats !== 'undefined') {
        const featuredBeats = allBeats.slice(0, 4);
        featuredBeatsGrid.innerHTML = featuredBeats.map(beat => createItemCard(beat, 'pagina-beat.html')).join("");
    }
}

function initializeAboutCarousel() {
    const carouselImage = document.getElementById("carousel-image");
    const images = ["imgs/produtor2.jpeg", "imgs/produtor.jpeg", "imgs/produtor3.jpeg", "imgs/produtor4.jpeg", "imgs/produtor5.jpeg"];
    let currentIndex = 0;
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const dotsContainer = document.getElementById("carousel-dots");

    function updateCarousel() {
        carouselImage.style.opacity = '0';
        setTimeout(() => {
            carouselImage.src = images[currentIndex];
            carouselImage.style.opacity = '1';
        }, 400);

        const dots = dotsContainer.querySelectorAll(".carousel-dot");
        dots.forEach((dot, index) => dot.classList.toggle("active", index === currentIndex));
    }

    images.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.classList.add("carousel-dot");
        if(index === 0) dot.classList.add("active");
        dot.addEventListener("click", () => {
            currentIndex = index;
            updateCarousel();
        });
        dotsContainer.appendChild(dot);
    });

    prevBtn.addEventListener("click", () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
        updateCarousel();
    });

    nextBtn.addEventListener("click", () => {
        currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    });
}

function initializePresetsCarousel() {
    const slides = document.querySelectorAll('.preset-slide');
    const prevBtn = document.getElementById('preset-prev');
    const nextBtn = document.getElementById('preset-next');

    if (slides.length > 0 && prevBtn && nextBtn) {
        let currentSlide = 0;
        let wavesurfers = [];
        const iconPlay = '<svg viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px"><path d="M8 5v14l11-7z"></path></svg>';
        const iconPause = '<svg viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>';

        slides.forEach((slide, index) => {
            const container = slide.querySelector('.waveform-container');
            const playBtn = slide.querySelector('.waveform-play-btn');
            const audioSrc = slide.dataset.audioSrc;
            const video = slide.querySelector('video');
            
            if (video) {
                video.pause();
            }

            if (container && playBtn && audioSrc && typeof WaveSurfer !== 'undefined') {
                const wavesurfer = WaveSurfer.create({
                    container: container,
                    waveColor: '#374151',
                    progressColor: '#11479e',
                    height: 50,
                    barWidth: 2,
                    barRadius: 2,
                    responsive: true,
                    cursorWidth: 0
                });
                wavesurfer.load(audioSrc);
                wavesurfers[index] = wavesurfer;
                playBtn.addEventListener('click', () => {
                    wavesurfer.playPause();
                });
                wavesurfer.on('play', () => {
                    playBtn.innerHTML = iconPause;
                    playBtn.classList.add('playing');
                });
                wavesurfer.on('pause', () => {
                    playBtn.innerHTML = iconPlay;
                    playBtn.classList.remove('playing');
                });
                 wavesurfer.on('finish', () => {
                    playBtn.innerHTML = iconPlay;
                    playBtn.classList.remove('playing');
                });
            }
        });

        function showSlide(index) {
            // Pausa o áudio e vídeo de todos os outros slides
            wavesurfers.forEach((ws, i) => {
                if (ws && i !== index && ws.isPlaying()) {
                    ws.pause();
                }
            });
            slides.forEach((slide) => {
                const video = slide.querySelector('video');
                if (video) {
                    video.pause();
                }
                slide.classList.remove('active');
            });

            // Ativa e toca o vídeo do slide atual
            const currentSlideElement = slides[index];
            if (currentSlideElement) {
                currentSlideElement.classList.add('active');
                const activeVideo = currentSlideElement.querySelector('video');
                if (activeVideo) {
                    activeVideo.play().catch(() => {
                        // O play automático pode ser bloqueado pelo navegador, isso evita erros no console.
                    });
                }
            }
            currentSlide = index;
        }

        prevBtn.addEventListener("click", () => {
            const newIndex = (currentSlide > 0) ? currentSlide - 1 : slides.length - 1;
            showSlide(newIndex);
        });

        nextBtn.addEventListener("click", () => {
            const newIndex = (currentSlide < slides.length - 1) ? currentSlide + 1 : 0;
            showSlide(newIndex);
        });

        // Mostra o primeiro slide ao carregar a página
        showSlide(currentSlide);
    }
}