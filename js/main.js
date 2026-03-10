async function cargarProductosDestacados(categoria, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    try {
        // 1. Traemos hasta 8 productos destacados
        const { data: productos, error } = await _supabase
            .from('productos')
            .select('*')
            .eq('categoria', categoria)
            .eq('es_destacado', true)
            .order('created_at', { ascending: false })
            .limit(8);

        if (error) throw error;

        if (productos && productos.length > 0) {
            // 2. Creamos la estructura de Swiper
            grid.innerHTML = `
                <div class="swiper swiper-destacados-${containerId}">
                    <div class="swiper-wrapper">
                        ${productos.map(prod => {
                            const precio = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(prod.precio || 0);
                            const skuVisual = prod.sku ? `<div class="sku-public-container">SKU: ${prod.sku}</div>` : '';
                            
                            return `
                                <div class="swiper-slide">
                                    <div class="product-card-simple">
                                        <div class="product-img-frame">
                                            <img src="${prod.url_imagen_1 || 'images/no-image.png'}" alt="${prod.nombre}" loading="lazy">
                                        </div>
                                        <div class="product-info-simple">
                                            <span class="cat-tag-simple">${prod.categoria.replace(/_/g, ' ')}</span>
                                            <h3 class="product-name-simple">${prod.nombre}</h3>
                                            ${skuVisual}
                                            <div class="footer-card">
                                                <span class="price-simple">${precio}</span>
                                                <button class="btn-cotizar-simple" onclick="verDetalle('${prod.id}')">Detalles</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                    <div class="swiper-button-next sbn-${containerId}"></div>
                    <div class="swiper-button-prev sbp-${containerId}"></div>
                </div>
            `;

            // 3. Inicializamos Swiper para este contenedor específico
            new Swiper(`.swiper-destacados-${containerId}`, {
                slidesPerView: 1, // Por defecto 1 en móvil
                spaceBetween: 20,
                loop: true,
                autoplay: { delay: 3000, disableOnInteraction: false },
                navigation: {
                    nextEl: `.sbn-${containerId}`,
                    prevEl: `.sbp-${containerId}`,
                },
                breakpoints: {
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 4 } // 🔥 Aquí mostramos los 4 que quieres en PC
                }
            });

        } else {
            grid.innerHTML = '<p style="text-align:center; padding: 20px;">Próximamente más productos destacados.</p>';
        }
    } catch (error) {
        console.error("Error en slider destacados:", error);
    }
}
