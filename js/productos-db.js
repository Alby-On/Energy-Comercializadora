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

function generarMenuJerarquico(productos) {
    const menu = document.getElementById('menu-categorias');
    if (!menu) return;

    // Limpiamos y añadimos el botón "Ver Todo"
    menu.innerHTML = `
        <li class="category-item active" onclick="renderizarGrid(todosLosProductos)">
            <span><i class="fas fa-layer-group"></i> Ver Todo</span>
        </li>
    `;

    // 1. Agrupar categorías y subcategorías únicas
    // Estructura: { "Electricidad Domiciliaria": Set(["Cajas", "Conductores"]), ... }
    const esquema = {};

    productos.forEach(p => {
        const cat = p.categoria || 'Sin Categoría';
        const sub = p.subcategoria;

        if (!esquema[cat]) {
            esquema[cat] = new Set();
        }
        if (sub) {
            esquema[cat].add(sub);
        }
    });

    // 2. Construir el HTML basado en el esquema
    Object.keys(esquema).sort().forEach(catNombre => {
        const wrapper = document.createElement('div');
        wrapper.className = 'category-group';

        // Botón de Categoría Padre
        const liPadre = document.createElement('li');
        liPadre.className = 'category-item has-sub';
        liPadre.innerHTML = `
            <span><i class="fas fa-plug"></i> ${catNombre}</span>
            <i class="fas fa-chevron-down arrow-icon"></i>
        `;

        // Contenedor de Subcategorías (Ul)
        const ulSub = document.createElement('ul');
        ulSub.className = 'sub-list';

        // Evento Click Padre: Filtra por categoría y despliega menú
        liPadre.onclick = (e) => {
            e.stopPropagation();
            toggleMenu(liPadre, ulSub);
            
            // Filtramos todos los productos que pertenezcan a esta categoría
            const filtrados = todosLosProductos.filter(p => p.categoria === catNombre);
            renderizarGrid(filtrados);
            
            // Feedback visual: marcar activo
            actualizarEstadoActivo(liPadre);
        };

        // Crear los hijos (Subcategorías)
        esquema[catNombre].forEach(subNombre => {
            const liSub = document.createElement('li');
            liSub.className = 'sub-category-item';
            liSub.textContent = subNombre;

            liSub.onclick = (e) => {
                e.stopPropagation();
                // Filtramos específicamente por la subcategoría
                const filtrados = todosLosProductos.filter(p => 
                    p.categoria === catNombre && p.subcategoria === subNombre
                );
                renderizarGrid(filtrados);
                
                // Marcar subcategoría como seleccionada
                actualizarEstadoSubActivo(liSub);
            };
            ulSub.appendChild(liSub);
        });

        wrapper.appendChild(liPadre);
        if (esquema[catNombre].size > 0) {
            wrapper.appendChild(ulSub);
        }
        menu.appendChild(wrapper);
    });
}

// Funciones auxiliares de UI
function toggleMenu(btn, lista) {
    lista.classList.toggle('show');
    const icon = btn.querySelector('.arrow-icon');
    if (icon) icon.classList.toggle('rotate');
}

function actualizarEstadoActivo(elemento) {
    document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
    elemento.classList.add('active');
}

function actualizarEstadoSubActivo(elemento) {
    document.querySelectorAll('.sub-category-item').forEach(el => el.classList.remove('selected'));
    elemento.classList.add('selected');
}
