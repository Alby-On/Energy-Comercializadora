// 1. Configuración de Supabase con nombre de instancia único
const supabaseUrl = 'https://afrfaeouzkjdkkqeozgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcmZhZW91emtqZGtrcWVvemdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTg1OTUsImV4cCI6MjA4Nzc5NDU5NX0.CRUaz7sNOuotsV3tVM5O2KvTerAT6uTXHaTy4yKKAdM';

// Usamos _supabase para evitar colisiones con el objeto global 'supabase' del CDN
const _supabase = supabase.createClient(supabaseUrl, supabaseKey); 

async function renderProductos() {
    const container = document.getElementById('productos-dinamicos');
    
    if (!container) return; // Seguridad por si el ID no existe en el HTML actual

    // 2. Usamos _supabase (nuestra instancia) para la consulta
    const { data: productos, error } = await _supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

    if (error) {
        console.error('Error al conectar con Supabase:', error);
        container.innerHTML = `<p style="text-align:center;">Error al cargar el catálogo: ${error.message}</p>`;
        return;
    }

    // Limpiamos el contenedor (quita el mensaje de "Cargando")
    container.innerHTML = '';

    if (productos.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No hay productos disponibles en este momento.</p>';
        return;
    }

    // 3. Renderizado de tarjetas
    productos.forEach(prod => {
        // Formateo de precio a CLP (Ej: $10.000)
        const precioFormateado = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(prod.precio || 0);

        // Fallback para imagen
        const imagenPrincipal = prod.url_imagen_1 || 'images/no-image.png';

        const productCard = `
            <div class="product-card">
                <div class="product-image-container">
                    <img src="${imagenPrincipal}" alt="${prod.nombre}" loading="lazy">
                    ${(prod.stock <= 0 || prod.stock === null) ? '<span class="badge-out">Sin Stock</span>' : ''}
                </div>
                <div class="product-content">
                    <span class="cat-tag">${prod.categoria || 'General'}</span>
                    <h3>${prod.nombre}</h3>
                    <p class="desc-short">${prod.descripcion ? prod.descripcion.substring(0, 60) + '...' : 'Sin descripción disponible'}</p>
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

// Función global para manejar el click (puedes expandirla después)
window.verDetalle = (id) => {
    console.log("Consultando detalle del producto ID:", id);
    // Aquí podrías abrir un modal o redirigir
};

document.addEventListener('DOMContentLoaded', renderProductos);
