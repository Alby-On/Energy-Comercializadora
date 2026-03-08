// Capturamos el ID de la URL
const urlParams = new URLSearchParams(window.location.search);
const productoId = urlParams.get('id');

// Variable global para almacenar el producto cargado y usarlo al agregar al carrito
let productoActual = null;

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

    // Guardamos los datos necesarios en la variable global
    productoActual = prod;

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
    
    const imagenesDisponibles = [prod.url_imagen_1, prod.url_imagen_2, prod.url_imagen_3]
        .filter(url => url && url.trim() !== "");

    thumbContainer.innerHTML = '';

    if (imagenesDisponibles.length > 0) {
        imgPrincipal.src = imagenesDisponibles[0];
        
        imagenesDisponibles.forEach((url, index) => {
            const imgThumb = document.createElement('img');
            imgThumb.src = url;
            imgThumb.alt = `Miniatura ${index + 1}`;
            imgThumb.className = `thumb-item ${index === 0 ? 'active' : ''}`;
            
            imgThumb.onclick = () => {
                imgPrincipal.src = url;
                document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
                imgThumb.classList.add('active');
            };
            
            thumbContainer.appendChild(imgThumb);
        });
    } else {
        imgPrincipal.src = 'images/no-image.png';
    }
}

// --- LÓGICA DE COMPRA ---

// Función para el selector de cantidad
window.cambiarCantidad = (valor) => {
    const input = document.getElementById('input-cantidad');
    if (!input) return;
    let nuevaCant = parseInt(input.value) + valor;
    if (nuevaCant >= 1) {
        input.value = nuevaCant;
    }
};

// Función para enviar al carrito global
window.prepararAgregado = () => {
    if (!productoActual) {
        console.error("No hay datos del producto para agregar.");
        return;
    }

    const inputCant = document.getElementById('input-cantidad');
    const cantidad = parseInt(inputCant.value) || 1;

    // Usamos la función global que definimos en carrito.js
    // Pasamos: id, nombre, precio y la cantidad seleccionada
    if (typeof agregarAlCarrito === 'function') {
        agregarAlCarrito(
            productoActual.id, 
            productoActual.nombre, 
            productoActual.precio, 
            cantidad
        );
        
        // Feedback visual: opcionalmente reseteamos el contador a 1
        inputCant.value = 1;
        
        // Abrir el carrito para confirmar la acción
        if (typeof toggleCart === 'function') {
            toggleCart();
        }
    } else {
        console.error("La función agregarAlCarrito no está disponible. Revisa que carrito.js esté cargado.");
    }
};

document.addEventListener('DOMContentLoaded', cargarDetalle);
