// Configuración de Supabase
const supabaseUrl = 'https://afrfaeouzkjdkkqeozgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcmZhZW91emtqZGtrcWVvemdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTg1OTUsImV4cCI6MjA4Nzc5NDU5NX0.CRUaz7sNOuotsV3tVM5O2KvTerAT6uTXHaTy4yKKAdM';
const supabase = supabasejs.createClient(supabaseUrl, supabaseKey)

async function renderProductos() {
    const container = document.getElementById('productos-dinamicos');
    
    // Consultamos a Supabase
    const { data: productos, error } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true }); // Ordenados alfabéticamente

    if (error) {
        console.error('Error:', error);
        container.innerHTML = `<p>Error al cargar el catálogo: ${error.message}</p>`;
        return;
    }

    container.innerHTML = '';

    productos.forEach(prod => {
        // Formateo de precio a CLP
        const precioFormateado = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(prod.precio);

        // Validar si hay imagen, si no, poner una de relleno
        const imagenPrincipal = prod.url_imagen_1 || 'images/no-image.png';

        const productCard = `
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${imagenPrincipal}" alt="${prod.nombre}" loading="lazy">
                    ${prod.stock <= 0 ? '<span class="badge-out">Sin Stock</span>' : ''}
                </div>
                <div class="product-content">
                    <span class="cat-tag">${prod.categoria}</span>
                    <h3>${prod.nombre}</h3>
                    <p class="desc-short">${prod.descripcion ? prod.descripcion.substring(0, 60) + '...' : 'Sin descripción'}</p>
                    <div class="product-footer">
                        <span class="price">${precioFormateado}</span>
                        <button class="btn-ver" onclick="verDetalle('${prod.id}')">Ver más</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
}

document.addEventListener('DOMContentLoaded', renderProductos);
