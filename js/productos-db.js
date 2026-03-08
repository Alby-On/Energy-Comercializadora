// Variable global para almacenar los productos y usarlos en los filtros
let todosLosProductos = []; 
let configuracionCategorias = []; // Nueva: Almacena la estructura real de la BD

function formatearTextoVisual(texto) {
    if (!texto) return '';
    return texto
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
}

// 2. Función principal de carga mejorada
async function inicializarCatalogo() {
    // 1. Intentamos obtener el cliente de Supabase
    const client = window._supabase || _supabase;
    if (!client) return console.error("Supabase no inicializado");

    try {
        // 2. CARGA DEL MENÚ (Esto debe ejecutarse SIEMPRE para el Header)
        const { data: categorias, error: errConfig } = await client
            .from('configuracion_catalogo')
            .select('*')
            .order('nombre_visible', { ascending: true });

        if (errConfig) throw errConfig;
        
        configuracionCategorias = categorias;
        // Inyectamos el menú del Header (esto funcionará en Servicios, Inicio, etc.)
        generarMenuHeader(categorias);

        // 3. CARGA DEL GRID (Esto solo si estamos en productos.html)
        const container = document.getElementById('productos-dinamicos');
        const lateralMenu = document.getElementById('menu-categorias');

        if (container) {
            const { data: productos, error: errProds } = await client
                .from('productos')
                .select('*')
                .order('nombre', { ascending: true });

            if (errProds) throw errProds;

            todosLosProductos = productos;
            
            // Generar menú lateral y grid solo si los elementos existen
            if (lateralMenu) generarMenuJerarquicoDesdeConfig(categorias);
            renderizarGrid(todosLosProductos);
            
            // Lógica extra: filtrar si viene una categoría por URL
            checkURLParams();
        }

    } catch (error) {
        console.error('Error al inicializar:', error);
    }
}

// NUEVA: Genera el menú desplegable del Header
function generarMenuHeader(categorias) {
    const headerMenu = document.getElementById('header-menu-dinamico');
    if (!headerMenu) return;

    headerMenu.innerHTML = '';
    categorias.forEach(cat => {
        const li = document.createElement('li');
        // Redirige a productos.html pasándole la categoría por URL si es necesario
        li.innerHTML = `<a href="productos.html?cat=${cat.categoria}">${cat.nombre_visible}</a>`;
        headerMenu.appendChild(li);
    });
}

// MODIFICADA: Ahora usa la configuración oficial de la BD
function generarMenuJerarquicoDesdeConfig(categorias) {
    const menu = document.getElementById('menu-categorias');
    if (!menu) return;

    menu.innerHTML = `
        <li class="category-item active" id="btn-ver-todo">
            <span><i class="fas fa-layer-group"></i> Ver Todo</span>
        </li>
    `;

    document.getElementById('btn-ver-todo').onclick = () => {
        actualizarEstadoActivo(document.getElementById('btn-ver-todo'));
        renderizarGrid(todosLosProductos);
    };

    categorias.forEach(cat => {
        const wrapper = document.createElement('div');
        wrapper.className = 'category-group';

        const liPadre = document.createElement('li');
        liPadre.className = 'category-item has-sub';
        
        // Lógica de iconos (puedes expandirla)
        let icono = 'fa-plug';
        const nombreMin = cat.categoria.toLowerCase();
        if(nombreMin.includes('herramienta')) icono = 'fa-tools';
        if(nombreMin.includes('ilumina')) icono = 'fa-lightbulb';
        if(nombreMin.includes('solar') || nombreMin.includes('ernc')) icono = 'fa-sun';

        liPadre.innerHTML = `
            <span><i class="fas ${icono}"></i> ${cat.nombre_visible}</span>
            <i class="fas fa-chevron-down arrow-icon"></i>
        `;

        const ulSub = document.createElement('ul');
        ulSub.className = 'sub-list';

        liPadre.onclick = (e) => {
            e.stopPropagation();
            // Acordeón
            document.querySelectorAll('.sub-list.show').forEach(el => {
                if(el !== ulSub) {
                    el.classList.remove('show');
                    el.previousElementSibling.querySelector('.arrow-icon')?.classList.remove('rotate');
                }
            });
            toggleMenu(liPadre, ulSub);
            
            // Filtrar productos por el ID de categoría de la BD
            const filtrados = todosLosProductos.filter(p => p.categoria === cat.categoria);
            renderizarGrid(filtrados);
            actualizarEstadoActivo(liPadre);
        };

        // Renderizar subcategorías reales de la configuración
        cat.subcategorias.forEach(subNombre => {
            const liSub = document.createElement('li');
            liSub.className = 'sub-category-item';
            liSub.innerHTML = `<i class="fas fa-caret-right"></i> ${subNombre}`;

            liSub.onclick = (e) => {
                e.stopPropagation(); 
                const filtrados = todosLosProductos.filter(p => 
                    p.categoria === cat.categoria && p.subcategoria === subNombre
                );
                renderizarGrid(filtrados);
                actualizarEstadoSubActivo(liSub);
            };
            ulSub.appendChild(liSub);
        });

        wrapper.appendChild(liPadre);
        if (cat.subcategorias.length > 0) wrapper.appendChild(ulSub);
        menu.appendChild(wrapper);
    });
}

// 3. Función para renderizar el grid (Se mantiene igual a tu lógica)
function renderizarGrid(productos) {
    const container = document.getElementById('productos-dinamicos');
    if (!container) return;

    container.innerHTML = '';

    if (!productos || productos.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 50px; color: #718096;">No hay productos disponibles.</p>';
        return;
    }

    productos.forEach(prod => {
        const precioFormateado = new Intl.NumberFormat('es-CL', {
            style: 'currency', currency: 'CLP'
        }).format(prod.precio || 0);

        const imagenPrincipal = prod.url_imagen_1 || 'images/no-image.png';
        
        // Para el tag visual, intentamos buscar el nombre lindo en la configuración
        const conf = configuracionCategorias.find(c => c.categoria === prod.categoria);
        const categoriaVisual = conf ? conf.nombre_visible : formatearTextoVisual(prod.categoria);
        const subcategoriaVisual = prod.subcategoria ? ` | ${prod.subcategoria}` : '';

        const productCard = `
            <div class="product-card-simple">
                <div class="product-img-frame">
                    <img src="${imagenPrincipal}" alt="${prod.nombre}" loading="lazy">
                    ${(prod.stock <= 0) ? '<span class="badge-out">A pedido</span>' : ''}
                </div>
                <div class="product-info-simple">
                    <span class="cat-tag-simple">${categoriaVisual}${subcategoriaVisual}</span>
                    <h3 class="product-name-simple" title="${prod.nombre}">${prod.nombre}</h3>
                    <div class="footer-card">
                        <span class="price-simple">${precioFormateado}</span>
                        <button class="btn-cotizar-simple" onclick="verDetalle('${prod.id}')">Detalles</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
}

// Auxiliares de Interfaz
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

window.verDetalle = (id) => {
    window.location.href = `detalle_productos.html?id=${id}`;
};

document.addEventListener('DOMContentLoaded', inicializarCatalogo);
