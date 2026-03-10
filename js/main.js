// Agregamos el parámetro 'containerId' para que sea flexible
async function cargarProductosDestacados(categoria, containerId) {
    const grid = document.getElementById(containerId);
    if (!grid) return;

    try {
        // --- ACTUALIZACIÓN: Filtramos por es_destacado = true ---
        const { data: productos, error } = await _supabase
            .from('productos')
            .select('*')
            .eq('categoria', categoria)
            .eq('es_destacado', true) // 🔥 Solo los que marcaste en el gestor
            .order('created_at', { ascending: false }) // Los más nuevos primero
            .limit(4);

        if (error) throw error;

        if (productos && productos.length > 0) {
            grid.innerHTML = productos.map(prod => {
                const precioFormateado = new Intl.NumberFormat('es-CL', {
                    style: 'currency', currency: 'CLP'
                }).format(prod.precio || 0);

                const imagenPrincipal = prod.url_imagen_1 || 'images/no-image.png';
                
                // Formateamos el SKU con la misma clase que el catálogo
                const skuVisual = prod.sku ? `<div class="sku-public-container">SKU: ${prod.sku}</div>` : '';

                return `
                    <div class="product-card-simple">
                        <div class="product-img-frame">
                            <img src="${imagenPrincipal}" alt="${prod.nombre}" loading="lazy">
                        </div>
                        <div class="product-info-simple">
                            <span class="cat-tag-simple">${prod.categoria.replace(/_/g, ' ')}</span>
                            
                            <h3 class="product-name-simple" title="${prod.nombre}">${prod.nombre}</h3>
                            
                            ${skuVisual} 
                            <div class="footer-card">
                                <span class="price-simple">${precioFormateado}</span>
                                <button class="btn-cotizar-simple" onclick="verDetalle('${prod.id}')">Detalles</button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            // Mensaje amigable si no has marcado ninguno como destacado todavía
            grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; color: #a0aec0; padding: 20px;">Próximamente productos destacados en esta sección.</p>';
        }
    } catch (error) {
        console.error("Error cargando destacados:", error);
    }
}

// Llamar a las categorías al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosDestacados('iluminacion', 'productos-iluminacion-grid');
    cargarProductosDestacados('herramientas', 'productos-herramientas-grid'); 
    cargarProductosDestacados('materiales_electricos', 'productos-materiales_electricos-grid'); 
});
