// Capturamos el ID de la URL
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

    // 1. Llenar textos informativos
    document.getElementById('det-nombre').textContent = prod.nombre;
    document.getElementById('det-descripcion').textContent = prod.descripcion || 'Sin descripción disponible.';
    document.getElementById('bread-categoria').textContent = formatearTextoVisual(prod.categoria);
    document.getElementById('det-precio').textContent = new Intl.NumberFormat('es-CL', {
        style: 'currency', currency: 'CLP'
    }).format(prod.precio || 0);

    // 2. Manejo Dinámico de Imágenes
    const imgPrincipal = document.getElementById('img-principal');
    const thumbContainer = document.getElementById('thumbnails');
    
    // Filtramos para obtener solo las imágenes que existen y no son nulas/vacías
    const imagenesDisponibles = [prod.url_imagen_1, prod.url_imagen_2, prod.url_imagen_3]
        .filter(url => url && url.trim() !== "");

    // Limpiamos el contenedor de miniaturas
    thumbContainer.innerHTML = '';

    if (imagenesDisponibles.length > 0) {
        // Establecemos la primera imagen válida como principal
        imgPrincipal.src = imagenesDisponibles[0];
        
        // Creamos las miniaturas solo para las imágenes que existen
        imagenesDisponibles.forEach((url, index) => {
            const imgThumb = document.createElement('img');
            imgThumb.src = url;
            imgThumb.alt = `Miniatura ${index + 1}`;
            imgThumb.className = `thumb-item ${index === 0 ? 'active' : ''}`;
            
            // Evento para cambiar la imagen principal al hacer clic
            imgThumb.onclick = () => {
                imgPrincipal.src = url;
                // Actualizar estado visual de la miniatura activa
                document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
                imgThumb.classList.add('active');
            };
            
            thumbContainer.appendChild(imgThumb);
        });
    } else {
        // Imagen por defecto si la base de datos no tiene ninguna URL
        imgPrincipal.src = 'images/no-image.png';
    }
}

// Función global para el selector de cantidad
window.cambiarCantidad = (valor) => {
    const input = document.getElementById('input-cantidad');
    let nuevaCant = parseInt(input.value) + valor;
    if (nuevaCant >= 1) {
        input.value = nuevaCant;
    }
};

document.addEventListener('DOMContentLoaded', cargarDetalle);
