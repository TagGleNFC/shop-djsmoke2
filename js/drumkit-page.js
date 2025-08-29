document.addEventListener("DOMContentLoaded", () => {
    if (typeof allDrumKits === 'undefined') {
        console.error("Os dados dos drum kits (data-drumkits.js) não foram carregados.");
        document.body.innerHTML = "<h1 style='color: white; text-align: center; margin-top: 50px;'>Erro ao carregar dados.</h1>";
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const kitId = parseInt(urlParams.get('id'));
    const kit = allDrumKits.find(k => k.id === kitId);

    if (!kit) {
        document.title = "Kit não Encontrado - Dj Smoke";
        const contentWrapper = document.getElementById("drumkit-content-wrapper");
        if(contentWrapper) {
            contentWrapper.innerHTML = `
                <div class="container" style="text-align: center; padding-top: 15vh; color: white;">
                    <h1>Drum Kit Não Encontrado</h1>
                    <p>O kit que você está procurando não existe ou foi removido.</p>
                    <a href="drumkits.html" class="btn btn-primary">Voltar ao Catálogo</a>
                </div>`;
        }
        return;
    }

    document.title = `${kit.title} - Dj Smoke`;
    document.querySelector('.drumkit-title').textContent = kit.title;
    document.querySelector('.drumkit-genre-tag').textContent = kit.genre.join(', ');
    document.querySelector('.drumkit-description-text').textContent = kit.description;
    document.querySelector('.drumkit-image').src = kit.image;
    document.querySelector('.drumkit-image').alt = kit.title;
    document.querySelector('.purchase-title').textContent = kit.title;
    document.querySelector('.purchase-description').textContent = kit.description;
    document.querySelector('.drumkit-image-purchase').src = kit.image;
    document.querySelector('.drumkit-image-purchase').alt = kit.title;
    document.querySelector('.price-value').textContent = `R$ ${kit.price.toFixed(2).replace('.', ',')}`;

    const videoElement = document.querySelector('.drumkit-showcase-video');
    if (videoElement && kit.showcaseVideo) {
        videoElement.src = kit.showcaseVideo;
    } else {
        const videoSection = document.querySelector('.video-showcase-section');
        if (videoSection) {
            videoSection.style.display = 'none';
        }
    }
    
    function handlePurchase() {
        if (kit.purchaseLink) {
            window.open(kit.purchaseLink, "_blank");
        } else {
            alert("Link de compra indisponível. Por favor, entre em contato.");
            console.error("Link de compra não definido para o kit ID:", kit.id);
        }
    }

    const purchaseButtons = document.querySelectorAll('.btn-purchase');
    purchaseButtons.forEach(button => {
        button.addEventListener('click', handlePurchase);
    });
});