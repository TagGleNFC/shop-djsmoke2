document.addEventListener("DOMContentLoaded", () => {
    if (typeof allBeats === 'undefined') {
        console.error("Os dados dos beats (data-beats.js) não foram carregados.");
        return;
    }

    const promotionGrid = document.getElementById('promotion-beats-grid');
    const beatsGrid = document.getElementById("beats-grid");
    const searchInput = document.getElementById("search-input");
    const genreFilter = document.getElementById("genre-filter");
    const vibeFilter = document.getElementById("vibe-filter");
    const sortFilter = document.getElementById("sort-filter");
    const resultsCount = document.getElementById("results-count");
    const noResults = document.getElementById("no-results");
    
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
                    <div class="beat-image">
                        <img src="${beat.image}" alt="${beat.title}">
                        <div class="beat-overlay"></div>
                        <span class="beat-genre">${beat.genre}</span>
                    </div>
                    <div class="beat-info">
                        <h3 class="beat-title">${beat.title}</h3>
                        <div class="beat-details">
                            <span class="beat-bpm">${beat.bpm} BPM</span>
                            ${priceDisplay}
                        </div>
                        <div class="card-buttons">
                            <span class="btn btn-outline btn-sm">Detalhes</span>
                            <button class="buy-btn btn btn-primary btn-sm" data-link="${beat.purchaseLink}">Comprar</button>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }

    const renderPromotionBeats = () => {
        if (!promotionGrid) return;
        const promotionBeats = allBeats.filter(beat => beat.onPromotion).slice(0, 3);
        promotionGrid.innerHTML = promotionBeats.map(createBeatCard).join('');
    };
    
    function applyFiltersAndRender() {
        let filteredBeats = [...allBeats];

        const searchTerm = searchInput.value.toLowerCase();
        const selectedGenre = genreFilter.value;
        const selectedVibe = vibeFilter.value;

        filteredBeats = allBeats.filter(beat => {
            const searchTermMatch = beat.title.toLowerCase().includes(searchTerm);
            const genreMatch = (selectedGenre === "all" || beat.genre === selectedGenre);
            const vibeMatch = (selectedVibe === "all" || (beat.vibe && beat.vibe.includes(selectedVibe)));
            return searchTermMatch && genreMatch && vibeMatch;
        });

        const sortBy = sortFilter.value;
        filteredBeats.sort((a, b) => {
            switch (sortBy) {
                case "newest": return b.id - a.id;
                case "price-low": return a.price - b.price;
                case "price-high": return b.price - a.price;
                default: return 0;
            }
        });
        
        renderBeats(filteredBeats);
    }

    function renderBeats(beats) {
        if (!beatsGrid || !noResults) return;
        
        const hasResults = beats.length > 0;
        beatsGrid.style.display = hasResults ? "grid" : "none";
        noResults.style.display = hasResults ? "none" : "block";
        
        if (hasResults) {
            beatsGrid.innerHTML = beats.map(createBeatCard).join("");
        }
        
        updateResultsCount(beats.length);
    }
    
    function updateResultsCount(filteredCount) {
        if (resultsCount) {
            resultsCount.textContent = `Mostrando ${filteredCount} de ${allBeats.length} beats`;
        }
    }

    [searchInput, genreFilter, vibeFilter, sortFilter].forEach(element => {
        if (element) element.addEventListener("change", applyFiltersAndRender);
    });
    if(searchInput) searchInput.addEventListener("input", applyFiltersAndRender);

    document.addEventListener('click', (event) => {
        const buyButton = event.target.closest('.buy-btn');
        if (buyButton) {
            event.preventDefault();
            window.open(buyButton.dataset.link, "_blank");
        }
    });

    renderPromotionBeats();
    applyFiltersAndRender();
});