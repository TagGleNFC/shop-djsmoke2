document.addEventListener("DOMContentLoaded", () => {
    if (typeof allSamplePacks === 'undefined') {
        console.error("Os dados (data-samplepacks.js) não foram carregados.");
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const packId = parseInt(urlParams.get('id'));
    const pack = allSamplePacks.find(p => p.id === packId);
    const contentWrapper = document.getElementById("samplepack-content-wrapper");

    if (!pack) {
        document.title = "Pack não Encontrado - Dj Smoke";
        if(contentWrapper) {
            contentWrapper.innerHTML = `
                <div class="container" style="text-align: center; padding: 15vh 0; color: white;">
                    <h1>Sample Pack Não Encontrado</h1>
                    <p>O pack que você está procurando não existe ou foi removido.</p>
                    <a href="samplepacks.html" class="btn btn-primary">Voltar ao Catálogo</a>
                </div>`;
        }
        return;
    }

    // Popula as informações na página
    document.title = `${pack.title} - Dj Smoke`;
    document.querySelector('.samplepack-title').textContent = pack.title;
    
    // Adiciona os produtores
    const producersElement = document.querySelector('.samplepack-producers');
    if (producersElement && pack.producers && pack.producers.length > 0) {
        producersElement.textContent = `por ${pack.producers.join(', ')}`;
    } else if (producersElement) {
        producersElement.style.display = 'none'; 
    }

    document.querySelector('.samplepack-genre-tag').textContent = pack.genre;
    document.querySelector('.samplepack-description-text').textContent = pack.description;
    document.querySelector('.samplepack-image').src = pack.image;
    document.querySelector('.samplepack-image').alt = pack.title;
    
    document.querySelector('.purchase-title').textContent = pack.title;
    document.querySelector('.purchase-description').textContent = pack.description;
    document.querySelector('.samplepack-image-purchase').src = pack.image;
    document.querySelector('.samplepack-image-purchase').alt = pack.title;
    document.querySelector('.price-value').textContent = `R$ ${pack.price.toFixed(2).replace('.', ',')}`;

    const contentsList = document.querySelector('.contents-list');
    if (contentsList && pack.contents) {
        contentsList.innerHTML = pack.contents.map(item => `<li>${item}</li>`).join('');
    }

    // Adiciona o vídeo de demonstração a partir de um arquivo local
    const videoPlayer = document.querySelector('.video-player');
    if (videoPlayer && pack.videoFile) {
        const videoElement = document.createElement('video');
        videoElement.src = pack.videoFile;
        videoElement.controls = true; // Adiciona controles de play, volume, etc.
        videoElement.preload = 'metadata'; // Otimiza o carregamento
        videoElement.style.width = '100%'; // Garante que o vídeo seja responsivo
        
        videoPlayer.innerHTML = ''; // Limpa a mensagem padrão
        videoPlayer.appendChild(videoElement);
    }
    
    // Lógica do botão de compra
    const purchaseButtons = document.querySelectorAll('.btn-purchase');
    purchaseButtons.forEach(button => {
        if(button.tagName === 'A') { 
             button.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector(button.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
            });
        } else { 
            button.addEventListener('click', () => {
                if (pack.purchaseLink) {
                    window.open(pack.purchaseLink, "_blank");
                }
            });
        }
    });
});