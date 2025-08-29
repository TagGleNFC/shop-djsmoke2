document.addEventListener("DOMContentLoaded", () => {
    if (typeof allDrumKits === 'undefined') {
        console.error("Os dados dos drum kits (data-drumkits.js) não foram carregados.");
        return;
    }

    const drumkitsGrid = document.getElementById("drumkits-grid");
    const searchInput = document.getElementById("search-input");
    const genreFilter = document.getElementById("genre-filter");
    const sortFilter = document.getElementById("sort-filter");
    const resultsCount = document.getElementById("results-count");
    const noResults = document.getElementById("no-results");

    function createDrumKitCard(kit) {
        const priceFormatted = `R$ ${kit.price.toFixed(2)}`;
        const maxLength = 80;
        let shortDescription = kit.description;
        if (kit.description.length > maxLength) {
            shortDescription = kit.description.substring(0, maxLength) + '...';
        }
        
        return `
            <a href="pagina-drumkit.html?id=${kit.id}" class="beat-card-link">
                <div class="beat-card" data-id="${kit.id}">
                    <div class="beat-image">
                        <img src="${kit.image}" alt="${kit.title}">
                        <div class="beat-overlay"></div>
                        <span class="beat-genre">${kit.genre}</span>
                    </div>
                    <div class="beat-info">
                        <h3 class="beat-title">${kit.title}</h3>
                        <p style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 1rem;">${shortDescription}</p>
                        <span class="beat-price">${priceFormatted}</span>
                    </div>
                    <div class="card-buttons" style="padding: 0 1.5rem 1.5rem;">
                         <button class="btn btn-primary btn-sm" style="width: 100%; pointer-events: none;">Ver Detalhes</button>
                    </div>
                </div>
            </a>
        `;
    }

    function applyFiltersAndRender() {
        let filteredKits = [...allDrumKits];
        const searchTerm = searchInput.value.toLowerCase();
        const selectedGenre = genreFilter.value;
        filteredKits = allDrumKits.filter(kit => {
            const searchTermMatch = kit.title.toLowerCase().includes(searchTerm);
            const genreMatch = (selectedGenre === "all" || kit.genre === selectedGenre);
            return searchTermMatch && genreMatch;
        });

        const sortBy = sortFilter.value;
        filteredKits.sort((a, b) => {
            switch (sortBy) {
                case "newest": return b.id - a.id;
                case "price-low": return a.price - b.price;
                case "price-high": return b.price - a.price;
                default: return 0;
            }
        });
        renderKits(filteredKits);
    }

    function renderKits(kits) {
        const hasResults = kits.length > 0;
        drumkitsGrid.style.display = hasResults ? "grid" : "none";
        noResults.style.display = hasResults ? "none" : "block";
        if (hasResults) {
            drumkitsGrid.innerHTML = kits.map(createDrumKitCard).join("");
        }
        if (resultsCount) {
            resultsCount.textContent = `Mostrando ${kits.length} de ${allDrumKits.length} kits`;
        }
    }

    [genreFilter, sortFilter].forEach(element => {
        if (element) element.addEventListener("change", applyFiltersAndRender);
    });
    if (searchInput) searchInput.addEventListener("input", applyFiltersAndRender);

    applyFiltersAndRender();
});