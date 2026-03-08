async function cargarProductosDestacados(categoria = 'iluminacion') {
    const grid = document.getElementById('productos-destacados-grid');
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
                // Formateo de precio igual a productos.html
                const precioFormateado = new Intl.NumberFormat('es-CL', {
                    style: 'currency', currency: 'CLP'
                }).format(prod.precio || 0);

                const imagenPrincipal = prod.url_imagen_1 || 'images/no-image.png';

                // Buscamos la categoría visual (si tienes acceso a configuracionCategorias)
                // Si no, usamos un formateo simple
                const categoriaVisual = (typeof configuracionCategorias !== 'undefined') 
                    ? (configuracionCategorias.find(c => c.categoria === prod.categoria)?.nombre_visible || prod.categoria)
                    : prod.categoria;

                // Generamos la misma estructura que productos.html
                return `
                    <div class="product-card-simple">
                        <div class="product-img-frame">
                            <img src="${imagenPrincipal}" alt="${prod.nombre}" loading="lazy">
                            ${(prod.stock <= 0) ? '<span class="badge-out">A pedido</span>' : ''}
                        </div>
                        <div class="product-info-simple">
                            <span class="cat-tag-simple">${categoriaVisual}</span>
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
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px; color: #718096;">No hay productos destacados en este momento.</p>';
        }
    } catch (error) {
        console.error("Error cargando destacados:", error);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">Error al conectar con la base de datos.</p>';
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosDestacados('iluminacion', 'productos-iluminacion-grid');
    cargarProductosDestacados('herramientas', 'productos-herramientas-grid');
});
