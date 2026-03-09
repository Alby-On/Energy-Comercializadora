// Agregamos el parámetro 'containerId' para que sea flexible
async function cargarProductosDestacados(categoria, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    try {
        const { data: productos, error } = await _supabase
            .from('productos')
            .select('*')
            .eq('categoria', categoria)
            .limit(4);

        if (error) throw error;

        if (productos && productos.length > 0) {
            grid.innerHTML = productos.map(prod => {
                const precioFormateado = new Intl.NumberFormat('es-CL', {
                    style: 'currency', currency: 'CLP'
                }).format(prod.precio || 0);

                const imagenPrincipal = prod.url_imagen_1 || 'images/no-image.png';

                return `
                    <div class="product-card-simple">
                        <div class="product-img-frame">
                            <img src="${imagenPrincipal}" alt="${prod.nombre}" loading="lazy">
                        </div>
                        <div class="product-info-simple">
                            <span class="cat-tag-simple">${prod.categoria}</span>
                            <h3 class="product-name-simple" title="${prod.nombre}">${prod.nombre}</h3>
                            <div class="footer-card">
                                <span class="price-simple">${precioFormateado}</span>
                                <button class="btn-cotizar-simple" onclick="verDetalle('${prod.id}')">Detalles</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            grid.innerHTML = '<p>No hay productos en esta categoría.</p>';
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Llamar a ambas categorías al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosDestacados('iluminacion', 'productos-iluminacion-grid');
    cargarProductosDestacados('herramientas', 'productos-herramientas-grid'); 
     cargarProductosDestacados('materiales', 'productos-materiales-grid'); 
});
