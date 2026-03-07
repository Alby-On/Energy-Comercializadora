// 1. Configuración de Supabase
const supabaseUrl = 'https://afrfaeouzkjdkkqeozgq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcmZhZW91emtqZGtrcWVvemdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTg1OTUsImV4cCI6MjA4Nzc5NDU5NX0.CRUaz7sNOuotsV3tVM5O2KvTerAT6uTXHaTy4yKKAdM';

const _supabase = supabase.createClient(supabaseUrl, supabaseKey); 

// Variable global para almacenar los productos y usarlos en los filtros
let todosLosProductos = []; 

function formatearTextoVisual(texto) {
    if (!texto) return '';
    return texto
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
}

// 2. Función principal de carga (Se ejecuta al abrir la página)
async function inicializarCatalogo() {
    const container = document.getElementById('productos-dinamicos');
    if (!container) return;

    const { data: productos, error } = await _supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true });

    if (error) {
        console.error('Error al conectar con Supabase:', error);
        container.innerHTML = `<p style="text-align:center;">Error al cargar el catálogo: ${error.message}</p>`;
        return;
    }

    todosLosProductos = productos; // Guardamos para los filtros
    
    generarMenuJerarquico(todosLosProductos); // Crea el menú lateral
    renderizarGrid(todosLosProductos);        // Dibuja los productos iniciales
}

// 3. Función para renderizar el grid de productos (reutilizable)
/**
 * Renderizado de productos con nombres de categoría formateados
 */
function renderizarGrid(productos) {
    const container = document.getElementById('productos-dinamicos');
    if (!container) return;

    // Limpiamos el contenedor
    container.innerHTML = '';

    if (!productos || productos.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 50px; color: #718096;">No hay productos disponibles en esta categoría.</p>';
        return;
    }

    productos.forEach(prod => {
        // Formateo de precio
        const precioFormateado = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(prod.precio || 0);

        // Gestión de imagen principal
        const imagenPrincipal = prod.url_imagen_1 || 'images/no-image.png';

        // --- APLICACIÓN DE FORMATO VISUAL ---
        // Limpiamos "elec_domiciliaria" -> "Elec Domiciliaria"
        const categoriaVisual = formatearTextoVisual(prod.categoria || 'Insumo');
        
        // Opcional: Si quieres mostrar la subcategoría también formateada
        const subcategoriaVisual = prod.subcategoria ? ` | ${formatearTextoVisual(prod.subcategoria)}` : '';

        const productCard = `
            <div class="product-card-simple">
                <div class="product-img-frame">
                    <img src="${imagenPrincipal}" alt="${prod.nombre}" loading="lazy">
                    ${(prod.stock <= 0 || prod.stock === null) ? '<span class="badge-out">A pedido</span>' : ''}
                </div>
                <div class="product-info-simple">
                    <span class="cat-tag-simple">${categoriaVisual}${subcategoriaVisual}</span>
                    
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

// 4. Generar Menú Jerárquico Lateral
function generarMenuJerarquico(productos) {
    const menu = document.getElementById('menu-categorias');
    if (!menu) return;

    // 1. Limpiar y añadir botón "Ver Todo"
    menu.innerHTML = `
        <li class="category-item active" id="btn-ver-todo">
            <span><i class="fas fa-layer-group"></i> Ver Todo</span>
        </li>
    `;

    const btnVerTodo = document.getElementById('btn-ver-todo');
    if (btnVerTodo) {
        btnVerTodo.onclick = () => {
            actualizarEstadoActivo(btnVerTodo);
            renderizarGrid(todosLosProductos);
        };
    }

    // 2. Construir el Esquema único de categorías y subcategorías
    const esquema = {};
    productos.forEach(p => {
        const cat = p.categoria || 'Otros';
        const sub = p.subcategoria;
        if (!esquema[cat]) esquema[cat] = new Set();
        if (sub) esquema[cat].add(sub);
    });

    // 3. Ordenar categorías y renderizar
    Object.keys(esquema).sort().forEach(catNombre => {
        const wrapper = document.createElement('div');
        wrapper.className = 'category-group';

        const liPadre = document.createElement('li');
        liPadre.className = 'category-item has-sub';
        
        const nombrePadreVisual = formatearTextoVisual(catNombre);

        // Selección de iconos
        let icono = 'fa-plug'; 
        const nombreMin = catNombre.toLowerCase();
        if(nombreMin.includes('herramienta')) icono = 'fa-tools';
        if(nombreMin.includes('ilumina')) icono = 'fa-lightbulb';
        if(nombreMin.includes('medicion') || nombreMin.includes('tester')) icono = 'fa-bolt';

        liPadre.innerHTML = `
            <span><i class="fas ${icono}"></i> ${nombrePadreVisual}</span>
            <i class="fas fa-chevron-down arrow-icon"></i>
        `;

        const ulSub = document.createElement('ul');
        ulSub.className = 'sub-list';

        // Evento click padre (Desplegar y filtrar categoría)
        liPadre.onclick = (e) => {
            e.stopPropagation();
            
            // Estilo acordeón: cerrar otros
            document.querySelectorAll('.sub-list.show').forEach(el => {
                if(el !== ulSub) {
                    el.classList.remove('show');
                    el.previousElementSibling.querySelector('.arrow-icon')?.classList.remove('rotate');
                }
            });

            toggleMenu(liPadre, ulSub);
            const filtrados = todosLosProductos.filter(p => p.categoria === catNombre);
            renderizarGrid(filtrados);
            actualizarEstadoActivo(liPadre);
        };

        // 4. ORDENAR Y RENDERIZAR SUBCATEGORÍAS
        // Convertimos el Set a Array para poder usar .sort()
        const subCategoriasOrdenadas = Array.from(esquema[catNombre]).sort();

        subCategoriasOrdenadas.forEach(subNombre => {
            const liSub = document.createElement('li');
            liSub.className = 'sub-category-item';
            
            const nombreSubVisual = formatearTextoVisual(subNombre);
            liSub.innerHTML = `<i class="fas fa-caret-right"></i> ${nombreSubVisual}`;

            liSub.onclick = (e) => {
                e.stopPropagation(); 
                const filtrados = todosLosProductos.filter(p => 
                    p.categoria === catNombre && p.subcategoria === subNombre
                );
                renderizarGrid(filtrados);
                actualizarEstadoSubActivo(liSub);
            };
            ulSub.appendChild(liSub);
        });

        wrapper.appendChild(liPadre);
        // Solo agregar la lista de subcategorías si tiene elementos
        if (subCategoriasOrdenadas.length > 0) {
            wrapper.appendChild(ulSub);
        }
        menu.appendChild(wrapper);
    });
}

// 5. Funciones auxiliares de Interfaz (CSS Control)
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

// 6. Funciones Globales y Eventos
window.verDetalle = (id) => {
    // Cambiamos el console.log por la redirección real
    window.location.href = `detalle_productos.html?id=${id}`;
};

document.addEventListener('DOMContentLoaded', inicializarCatalogo);
