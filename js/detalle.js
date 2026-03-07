// Función para capturar el ID de la URL
const urlParams = new URLSearchParams(window.location.search);
const productoId = urlParams.get('id');

async function cargarDetalle() {
    if (!productoId) return;

    const { data: prod, error } = await _supabase
        .from('productos')
        .select('*')
        .eq('id', productoId)
        .single();

    if (error) {
        console.error("Error cargando detalle:", error);
        return;
    }

    // Llenar textos
    document.getElementById('det-nombre').textContent = prod.nombre;
    document.getElementById('det-descripcion').textContent = prod.descripcion || 'Sin descripción disponible.';
    document.getElementById('bread-categoria').textContent = formatearTextoVisual(prod.categoria);
    document.getElementById('det-precio').textContent = new Intl.NumberFormat('es-CL', {
        style: 'currency', currency: 'CLP'
    }).format(prod.precio || 0);

    // Imágenes
    const imgPrincipal = document.getElementById('img-principal');
    const thumbContainer = document.getElementById('thumbnails');
    
    const imagenes = [prod.url_imagen_1, prod.url_imagen_2, prod.url_imagen_3].filter(img => img);
    
    if (imagenes.length > 0) {
        imgPrincipal.src = imagenes[0];
        
        imagenes.forEach((url, index) => {
            const imgThumb = document.createElement('img');
            imgThumb.src = url;
            imgThumb.className = `thumb-item ${index === 0 ? 'active' : ''}`;
            imgThumb.onclick = () => {
                imgPrincipal.src = url;
                document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
                imgThumb.classList.add('active');
            };
            thumbContainer.appendChild(imgThumb);
        });
    }
}

function cambiarCantidad(valor) {
    const input = document.getElementById('input-cantidad');
    let nuevaCant = parseInt(input.value) + valor;
    if (nuevaCant >= 1) input.value = nuevaCant;
}

document.addEventListener('DOMContentLoaded', cargarDetalle);
