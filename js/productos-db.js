// Configuración de Supabase
const supabaseUrl = 'https://afrfaeouzkjdkkqeozgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcmZhZW91emtqZGtrcWVvemdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTg1OTUsImV4cCI6MjA4Nzc5NDU5NX0.CRUaz7sNOuotsV3tVM5O2KvTerAT6uTXHaTy4yKKAdM';
const supabase = supabasejs.createClient(supabaseUrl, supabaseKey)

async function cargarProductos() {
    const container = document.getElementById('productos-dinamicos');

    // 1. Consultar a la tabla 'productos'
    const { data: productos, error } = await supabase
        .from('productos')
        .select('*');

    if (error) {
        console.error('Error cargando datos:', error);
        container.innerHTML = '<p>Error al conectar con la base de datos.</p>';
        return;
    }

    // 2. Limpiar contenedor
    container.innerHTML = '';

    // 3. Iterar y renderizar el template
    productos.forEach(producto => {
        // Formatear precio a moneda chilena (opcional)
        const precioCLP = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(producto.precio);

        const card = `
            <div class="product-card">
                <div class="product-image-box">
                    <img src="${producto.imagen_url}" alt="${producto.nombre}" loading="lazy">
                </div>
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion_corta || 'Suministro eléctrico de alta calidad.'}</p>
                <div class="product-footer">
                    <span class="precio-tag">${precioCLP}</span>
                    <span class="certificacion">${producto.categoria}</span>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

document.addEventListener('DOMContentLoaded', cargarProductos);
