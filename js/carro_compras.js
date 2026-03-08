/* ================================================================
   LÓGICA GLOBAL DEL CARRITO - ENERGY COMERCIALIZADORA
   ================================================================ */

// 1. Persistencia: Cargar el carrito desde el navegador
let carrito = JSON.parse(localStorage.getItem('energy_cart')) || [];

/**
 * Control de apertura y cierre del panel lateral
 */
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Bloqueamos el scroll del fondo si el carro está abierto
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
    }
}

/**
 * Agrega productos (Soporta unidades múltiples para la página de detalle)
 */
function agregarAlCarrito(id, nombre, precio, cantidad = 1) {
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push({ id, nombre, precio, cantidad });
    }

    actualizarInterfaz();
}

/**
 * Elimina un producto por completo del listado
 */
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarInterfaz();
}

/**
 * Guarda los cambios y refresca el contador (Badge) y la lista visual
 */
function actualizarInterfaz() {
    // Re-leer el carrito para asegurar que tenemos lo último
    carrito = JSON.parse(localStorage.getItem('energy_cart')) || [];
    
    // 1. Actualizar el contador (Badge)
    const badge = document.getElementById('cart-badge');
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    if (badge) {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // 2. Dibujar la lista
    renderizarLista();
}

/**
 * Dibuja los productos dentro del sidebar lateral
 */
function renderizarLista() {
    const listaContenedor = document.getElementById('cart-items-list');
    const totalContenedor = document.getElementById('cart-total-val');
    
    if (!listaContenedor || !totalContenedor) return;

    if (carrito.length === 0) {
        listaContenedor.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-box-open"></i>
                <p>Tu carrito está vacío</p>
            </div>`;
        totalContenedor.innerText = '$0';
        return;
    }

    let sumaTotal = 0;
    listaContenedor.innerHTML = carrito.map(item => {
        const subtotal = item.precio * item.cantidad;
        sumaTotal += subtotal;
        
        return `
            <div class="cart-item-render" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 0.9rem; margin: 0; color: var(--azul-main);">${item.nombre}</h4>
                    <small style="color: #666;">${item.cantidad} x $${item.precio.toLocaleString('es-CL')}</small>
                </div>
                <button onclick="eliminarDelCarrito('${item.id}')" style="background:none; border:none; color: #e74c3c; cursor:pointer; padding: 5px;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');

    totalContenedor.innerText = `$${sumaTotal.toLocaleString('es-CL')}`;
}

/**
 * ACCIÓN FINAL: Envío del pedido a WhatsApp
 */
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert("El carrito está vacío. Agregue productos para cotizar.");
        return;
    }

    // Encabezado del mensaje
    let mensaje = "⚡ *SOLICITUD DE COTIZACIÓN - ENERGY*%0A%0A";
    mensaje += "Hola, me gustaría consultar por los siguientes productos:%0A%0A";

    // Detalle de productos
    carrito.forEach(item => {
        mensaje += `• ${item.nombre} (x${item.cantidad})%0A`;
    });

    // Total y cierre
    const total = document.getElementById('cart-total-val').innerText;
    mensaje += `%0A*TOTAL ESTIMADO:* ${total}%0A%0A_Favor confirmar disponibilidad para retiro o despacho en Chillán._`;

    // Número de contacto de Energy
    const telefono = "56932318919"; 
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}

// --- INICIALIZACIÓN DE INTERFAZ ---

// 1. Cuando el DOM está listo (Carga inicial de la página)
document.addEventListener('DOMContentLoaded', () => {
    // Solo actualizamos si el elemento ya existe en el HTML estático
    if (document.getElementById('cart-items-list')) {
        actualizarInterfaz();
    }
});

// 2. Cuando el componente se carga dinámicamente desde componentes.js
document.addEventListener('cartLoaded', () => {
    console.log("⚡ Carrito inyectado dinámicamente: Renderizando datos de Energy...");
    actualizarInterfaz();
});
