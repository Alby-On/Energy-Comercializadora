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

    if (!productos || productos.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No hay productos disponibles en este momento.</p>';
        return;
    }

    // Renderizado de productos
    productos.forEach(prod => {
        const precioFormateado = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(prod.precio || 0);

        const imagenPrincipal = prod.url_imagen_1 || 'images/no-image.png';

        const productCard = `
            <div class="product-card-simple">
                <div class="product-img-frame">
                    <img src="${imagenPrincipal}" alt="${prod.nombre}" loading="lazy">
                    ${(prod.stock <= 0 || prod.stock === null) ? '<span class="badge-out">A pedido</span>' : ''}
                </div>
                <div class="product-info-simple">
                    <span class="cat-tag-simple">${prod.categoria || 'Insumo'}</span>
                    <h3 class="product-name-simple" title="${prod.nombre}">${prod.nombre}</h3>
                    <div class="footer-card">
                        <span class="price-simple">${precioFormateado}</span>
                        <button class="btn-cotizar-simple" onclick="verDetalle('${prod.id}')">
                            Detalles
                        </button>
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
let todosLosProductos = []; 

async function inicializarCatalogo() {
    const { data, error } = await _supabase
        .from('productos')
        .select('*');

    if (error) return console.error(error);
    
    todosLosProductos = data;
    generarMenuJerarquico(data);
    renderizarGrid(data);
}

function generarMenuJerarquico(productos) {
    const menu = document.getElementById('menu-categorias');
    
    // 1. Crear el mapa de Categoría -> Subcategorías
    const mapaCategorias = {};

    productos.forEach(p => {
        if (!p.categoria) return;
        
        if (!mapaCategorias[p.categoria]) {
            mapaCategorias[p.categoria] = new Set();
        }
        if (p.subcategoria) {
            mapaCategorias[p.categoria].add(p.subcategoria);
        }
    });

    // 2. Construir el HTML del menú
    Object.keys(mapaCategorias).sort().forEach(cat => {
        const liPadre = document.createElement('li');
        liPadre.className = 'category-item';
        liPadre.innerHTML = `<span>${cat}</span> <i class="fas fa-chevron-down"></i>`;
        
        // Ul para las subcategorías
        const ulSub = document.createElement('ul');
        ulSub.className = 'sub-list';

        // Evento para filtrar por Categoría Padre
        liPadre.onclick = (e) => {
            e.stopPropagation();
            toggleMenu(liPadre, ulSub);
            const filtrados = todosLosProductos.filter(p => p.categoria === cat);
            renderizarGrid(filtrados);
        };

        // Agregar Subcategorías al hijo
        mapaCategorias[cat].forEach(sub => {
            const liSub = document.createElement('li');
            liSub.className = 'sub-category-item';
            liSub.textContent = sub;
            
            liSub.onclick = (e) => {
                e.stopPropagation(); // Evita que se cierre el padre
                const filtrados = todosLosProductos.filter(p => p.subcategoria === sub);
                renderizarGrid(filtrados);
            };
            ulSub.appendChild(liSub);
        });

        menu.appendChild(liPadre);
        menu.appendChild(ulSub);
    });
}

function toggleMenu(padre, lista) {
    // Cerrar otros menús si prefieres (opcional)
    lista.classList.toggle('show');
    padre.querySelector('i').classList.toggle('rotate');
}
