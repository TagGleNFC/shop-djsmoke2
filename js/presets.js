document.addEventListener('DOMContentLoaded', function() {
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

            if (container && playBtn && audioSrc) {
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
            wavesurfers.forEach((ws, i) => {
                if (i !== index && ws.isPlaying()) {
                    ws.pause();
                }
            });
            slides.forEach((slide, i) => {
                const video = slide.querySelector('video');
                if (video) {
                    video.pause();
                }
                slide.classList.remove('active');
            });

            slides[index].classList.add('active');
            const activeVideo = slides[index].querySelector('video');
            if (activeVideo) {
                activeVideo.play().catch(() => {});
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

        showSlide(currentSlide);
    }
    
    const presetsGrid = document.getElementById("presets-grid");

    if (presetsGrid) {
        if (typeof allPresets === 'undefined') {
            console.error("Os dados dos presets (data-presets.js) não foram carregados.");
            return;
        }

        const searchInput = document.getElementById("search-input");
        const sortFilter = document.getElementById("sort-filter");
        const resultsCount = document.getElementById("results-count");
        const noResults = document.getElementById("no-results");

        function createPresetCard(preset) {
            const priceFormatted = `R$ ${preset.price.toFixed(2)}`;
            return `
                <a href="pagina-preset.html?id=${preset.id}" class="beat-card-link">
                    <div class="beat-card" data-id="${preset.id}">
                        <div class="beat-image">
                            <img src="${preset.image}" alt="${preset.title}">
                            <div class="beat-overlay"></div>
                        </div>
                        <div class="beat-info">
                            <h3 class="beat-title">${preset.title}</h3>
                            <p class="beat-details" style="font-size: 0.9rem; color: #9ca3af; margin: 0.5rem 0;">${preset.highlightedSubtitle}</p>
                            <span class="beat-price">${priceFormatted}</span>
                        </div>
                    </div>
                </a>
            `;
        }

        function applyFiltersAndRender() {
            let filteredPresets = [...allPresets];
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                filteredPresets = filteredPresets.filter(p => p.title.toLowerCase().includes(searchTerm));
            }

            const sortBy = sortFilter.value;
            filteredPresets.sort((a, b) => {
                switch (sortBy) {
                    case "newest": return b.id - a.id;
                    case "price-low": return a.price - b.price;
                    case "price-high": return b.price - a.price;
                    default: return 0;
                }
            });
            renderPresets(filteredPresets);
        }

        function renderPresets(presets) {
            const hasResults = presets.length > 0;
            presetsGrid.style.display = hasResults ? "grid" : "none";
            noResults.style.display = hasResults ? "none" : "block";
            if (hasResults) {
                presetsGrid.innerHTML = presets.map(createPresetCard).join("");
            }
            if (resultsCount) {
                resultsCount.textContent = `Mostrando ${presets.length} de ${allPresets.length} presets`;
            }
        }
        if (sortFilter) sortFilter.addEventListener("change", applyFiltersAndRender);
        if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);
        applyFiltersAndRender();
    }
});