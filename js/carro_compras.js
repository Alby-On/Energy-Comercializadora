/* ================================================================
   LÓGICA GLOBAL DEL CARRITO - ENERGY COMERCIALIZADORA
   ================================================================ */

// 1. Inicializar el carrito desde LocalStorage
let carrito = JSON.parse(localStorage.getItem('energy_cart')) || [];

/**
 * Alterna la visibilidad del sidebar y el overlay
 */
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Bloquear scroll del fondo para mejor UX
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
    }
}

/**
 * Agrega un producto al carrito
 * @param {string} id - ID único de Supabase
 * @param {string} nombre - Nombre del producto
 * @param {number} precio - Valor unitario
 * @param {number} cantidad - Cantidad a añadir (por defecto 1)
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
 * Elimina un producto completamente del carrito
 */
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarInterfaz();
}

/**
 * Guarda en LocalStorage y refresca los elementos visuales
 */
function actualizarInterfaz() {
    localStorage.setItem('energy_cart', JSON.stringify(carrito));
    
    // Actualizar el número en el badge naranja (el icono flotante)
    const badge = document.getElementById('cart-badge');
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    
    if (badge) {
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    renderizarLista();
}

/**
 * Dibuja los productos dentro del sidebar
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
            <div class="cart-item-render" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 0.9rem; margin: 0; color: var(--azul-main);">${item.nombre}</h4>
                    <small style="color: #666;">${item.cantidad} x $${item.precio.toLocaleString('es-CL')}</small>
                </div>
                <button onclick="eliminarDelCarrito('${item.id}')" style="background:none; border:none; color: #e74c3c; cursor:pointer;">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
    }).join('');

    totalContenedor.innerText = `$${sumaTotal.toLocaleString('es-CL')}`;
}

/**
 * Genera el mensaje y abre WhatsApp
 */
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    let mensaje = "⚡ *NUEVA SOLICITUD - ENERGY COMERCIALIZADORA*%0A%0A";
    mensaje += "Hola, me gustaría cotizar los siguientes productos:%0A%0A";

    carrito.forEach(item => {
        mensaje += `• ${item.nombre} (x${item.cantidad})%0A`;
    });

    const total = document.getElementById('cart-total-val').innerText;
    mensaje += `%0A*TOTAL ESTIMADO:* ${total}%0A%0A_Favor confirmar disponibilidad y costos de envío._`;

    // Número de contacto de Energy (Ejercito de Chile N° 80)
    const telefono = "56932318919"; 
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}

// Inicializar al cargar el documento
document.addEventListener('DOMContentLoaded', actualizarInterfaz);

// Escuchar evento si el carrito se inyecta dinámicamente vía fetch
document.addEventListener('cartLoaded', actualizarInterfaz);
