async function cargarProductosDestacados(categoria = 'iluminacion') {
    const grid = document.getElementById('productos-destacados-grid');
    if (!grid) return;

    try {
        // Consultamos Supabase filtrando por categoría y limitando a 4
        const { data: productos, error } = await _supabase
            .from('productos')
            .select('*')
            .eq('categoria', categoria)
            .limit(4);

        if (error) throw error;

        if (productos && productos.length > 0) {
            grid.innerHTML = productos.map(prod => `
                <div class="producto-card">
                    <div class="producto-img">
                        <img src="${prod.imagen_url || 'images/no-image.png'}" alt="${prod.nombre}">
                    </div>
                    <div class="producto-info">
                        <h3>${prod.nombre}</h3>
                        <p class="precio">$${prod.precio.toLocaleString('es-CL')}</p>
                        <button class="btn-agregar" onclick="agregarAlCarrito('${prod.id}', '${prod.nombre}', ${prod.precio})">
                            <i class="fas fa-cart-plus"></i> Agregar
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            grid.innerHTML = '<p>No hay productos destacados en este momento.</p>';
        }
    } catch (error) {
        console.error("Error cargando destacados:", error);
        grid.innerHTML = '<p>Error al conectar con la base de datos.</p>';
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarProductosDestacados('iluminacion'); // Puedes cambiar 'iluminacion' por la categoría que prefieras
});
