document.addEventListener("DOMContentLoaded", () => {
    if (typeof allSamplePacks === 'undefined') {
        console.error("Os dados dos sample packs (data-samplepacks.js) não foram carregados.");
        return;
    }

    const samplepacksGrid = document.getElementById("samplepacks-grid");
    const searchInput = document.getElementById("search-input");
    const genreFilter = document.getElementById("genre-filter");
    const sortFilter = document.getElementById("sort-filter");
    const resultsCount = document.getElementById("results-count");
    const noResults = document.getElementById("no-results");

    function createSamplePackCard(pack) {
        const priceFormatted = `R$ ${pack.price.toFixed(2)}`;
        
        return `
            <a href="pagina-samplepack.html?id=${pack.id}" class="beat-card-link">
                <div class="beat-card" data-id="${pack.id}">
                    <div class="beat-image">
                        <img src="${pack.image}" alt="${pack.title}">
                        <div class="beat-overlay"></div>
                        <span class="beat-genre">${pack.genre}</span>
                    </div>
                    <div class="beat-info">
                        <h3 class="beat-title">${pack.title}</h3>
                        <p style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 1rem;">${pack.description.substring(0, 80)}...</p>
                        <span class="beat-price">${priceFormatted}</span>
                    </div>
                </div>
            </a>
        `;
    }

    function applyFiltersAndRender() {
        if (!samplepacksGrid) return;
        
        let filteredPacks = [...allSamplePacks];
        const searchTerm = searchInput.value.toLowerCase();
        const selectedGenre = genreFilter.value;

        filteredPacks = allSamplePacks.filter(pack => {
            const searchTermMatch = pack.title.toLowerCase().includes(searchTerm);
            const genreMatch = (selectedGenre === "all" || pack.genre === selectedGenre);
            return searchTermMatch && genreMatch;
        });

        const sortBy = sortFilter.value;
        filteredPacks.sort((a, b) => {
            switch (sortBy) {
                case "newest": return b.id - a.id;
                case "price-low": return a.price - b.price;
                case "price-high": return b.price - a.price;
                default: return 0;
            }
        });
        renderPacks(filteredPacks);
    }

    function renderPacks(packs) {
        const hasResults = packs.length > 0;
        samplepacksGrid.style.display = hasResults ? "grid" : "none";
        noResults.style.display = hasResults ? "none" : "block";
        if (hasResults) {
            samplepacksGrid.innerHTML = packs.map(createSamplePackCard).join("");
        }
        if (resultsCount) {
            resultsCount.textContent = `Mostrando ${packs.length} de ${allSamplePacks.length} packs`;
        }
    }

    [genreFilter, sortFilter, searchInput].forEach(element => {
        if (element) {
            element.addEventListener("change", applyFiltersAndRender);
            if (element.type === 'text') {
                element.addEventListener("input", applyFiltersAndRender);
            }
        }
    });

    applyFiltersAndRender();
});