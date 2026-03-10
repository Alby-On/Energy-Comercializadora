async function cargarProductosDestacados(categoria, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    try {
        const { data: productos, error } = await _supabase
            .from('productos')
            .select('*')
            .eq('categoria', categoria)
            .eq('es_destacado', true)
            .order('created_at', { ascending: false })
            .limit(8);

        if (error) throw error;

        if (productos && productos.length > 0) {
            // Inyectamos la estructura
            grid.innerHTML = `
                <div class="swiper swiper-destacados-${containerId}">
                    <div class="swiper-wrapper">
                        ${productos.map(prod => `
                            <div class="swiper-slide">
                                <div class="product-card-simple">
                                    <div class="product-img-frame">
                                        <img src="${prod.url_imagen_1 || 'images/no-image.png'}" alt="${prod.nombre}">
                                    </div>
                                    <div class="product-info-simple">
                                        <span class="cat-tag-simple">${prod.categoria.replace(/_/g, ' ')}</span>
                                        <h3 class="product-name-simple">${prod.nombre}</h3>
                                        <div class="footer-card">
                                            <span class="price-simple">${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(prod.precio || 0)}</span>
                                            <button class="btn-cotizar-simple" onclick="verDetalle('${prod.id}')">Detalles</button>
                                        </div>
                                    </div>
                                </div>
                            </div>`).join('')}
                    </div>
                    <div class="swiper-button-next sbn-${containerId}"></div>
                    <div class="swiper-button-prev sbp-${containerId}"></div>
                </div>
            `;

            // 🔥 SOLUCIÓN: Esperar un "tick" del navegador para inicializar
            setTimeout(() => {
                new Swiper(`.swiper-destacados-${containerId}`, {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    loop: productos.length > 4, // Solo hace loop si hay suficientes productos
                    autoplay: { delay: 3000 },
                    navigation: {
                        nextEl: `.sbn-${containerId}`,
                        prevEl: `.sbp-${containerId}`,
                    },
                    breakpoints: {
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 4 }
                    }
                });
            }, 100);

        } else {
            grid.innerHTML = '<p>No hay productos destacados.</p>';
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
