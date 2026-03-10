// --- VARIABLES DE ESTADO ---
let productosEnMemoria = []; 
let idProductoEditando = null;
let catalogoConfig = {}; 

/**
 * CARGA INICIAL Y NAVEGACIÓN
 */
async function cargarTablaDesdeSupabase() {
    console.log("🔍 Iniciando carga de inventario...");
    const body = document.getElementById("inventory-body");
    if (!body) return console.error("❌ No se encontró el elemento 'inventory-body'");

    // Actualizamos el colspan a 7 para incluir la nueva columna SKU
    body.innerHTML = '<tr><td colspan="7" style="text-align:center;">⏳ Conectando con la base de datos...</td></tr>';

    try {
        const client = window._supabase || (typeof _supabase !== 'undefined' ? _supabase : null);
        
        if (!client) {
            console.error("❌ El cliente de Supabase no está inicializado.");
            body.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Error: Cliente no inicializado</td></tr>';
            return;
        }

        const { data: confData, error: confError } = await client.from('configuracion_catalogo').select('*');
        if (confError) throw confError;

        catalogoConfig = {};
        if (confData) {
            confData.forEach(c => {
                catalogoConfig[c.categoria] = {
                    nombre: c.nombre_visible,
                    subs: c.subcategorias
                };
            });
        }

        const { data, error } = await client
            .from('productos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        productosEnMemoria = data || [];
        renderizarTabla(productosEnMemoria);

    } catch (error) {
        console.error("❌ Error crítico en cargarTablaDesdeSupabase:", error);
        body.innerHTML = `<tr><td colspan="7" style="text-align:center; color:red;">Error: ${error.message}</td></tr>`;
    }
}

function renderizarTabla(lista) {
    const body = document.getElementById("inventory-body");
    if (!body) return;
    body.innerHTML = "";

    if (!lista || lista.length === 0) {
        body.innerHTML = '<tr><td colspan="7" style="text-align:center;">📭 No hay productos registrados.</td></tr>';
        return;
    }

    lista.forEach((prod) => {
        const tr = document.createElement("tr");
        
        const precioFormateado = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(prod.precio || 0);

        const nombreCategoria = catalogoConfig[prod.categoria] ? catalogoConfig[prod.categoria].nombre : prod.categoria;

        // --- CAMBIO 1: AGREGAR COLUMNA SKU EN EL RENDER ---
        tr.innerHTML = `
            <td><img src="${prod.url_imagen_1 || 'https://via.placeholder.com/50'}" class="thumb" onerror="this.src='https://via.placeholder.com/50'"></td>
            <td><span class="sku-badge" style="background:#f1f5f9; padding:4px 8px; border-radius:4px; font-family:monospace; font-weight:bold; font-size:0.9em;">${prod.sku || 'S/N'}</span></td>
            <td>${prod.nombre}</td>
            <td><span class="badge-cat" style="background:#e2e8f0; padding:2px 8px; border-radius:4px; font-size:0.8em;">${nombreCategoria}</span></td>
            <td><strong>${precioFormateado}</strong></td>
            <td>${prod.stock} unidades</td>
            <td>
                <button class="nav-btn" style="padding:5px 10px; font-size:0.8em;" onclick="prepararEdicion('${prod.id}')">✏️ Editar</button>
                <button class="nav-btn" style="padding:5px 10px; font-size:0.8em; background:#fee2e2; color:#b91c1c;" onclick="deleteProduct('${prod.id}')">🗑️ Borrar</button>
            </td>
        `;
        body.appendChild(tr);
    });
}

async function prepararEdicion(id) {
    const p = productosEnMemoria.find(item => item.id === id);
    if (!p) return; 

    idProductoEditando = p.id;

    const editCatSelect = document.getElementById("edit-cat");
    editCatSelect.innerHTML = '<option value="">Seleccione Categoría</option>';
    
    Object.keys(catalogoConfig).forEach(key => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = catalogoConfig[key].nombre;
        editCatSelect.appendChild(opt);
    });

    // --- CAMBIO 2: CARGAR EL SKU EN EL MODAL ---
    if(document.getElementById("edit-sku")) {
        document.getElementById("edit-sku").value = p.sku || "";
    }
    
    document.getElementById("edit-nombre").value = p.nombre;
    document.getElementById("edit-cat").value = p.categoria;
    document.getElementById("edit-stock").value = p.stock;
    document.getElementById("edit-precio").value = p.precio || 0;
    document.getElementById("edit-desc").value = p.descripcion || "";

    cargarSubcategoriasEdicion(p.subcategoria);

    for (let i = 1; i <= 3; i++) {
        const imgPre = document.getElementById(`pre-edit-${i}`);
        const url = p[`url_imagen_${i}`];
        imgPre.src = url || "";
        imgPre.style.display = url ? "block" : "none";
    }

    const modal = document.getElementById("edit-modal");
    if(modal) modal.style.display = "flex";
}

async function saveEdit() {
    if (!idProductoEditando) return;
    const client = window._supabase || _supabase;

    const btn = document.querySelector('#edit-modal .btn-main');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = "Sincronizando...";

    const productoActual = productosEnMemoria.find(p => p.id === idProductoEditando);

    // --- CAMBIO 3: AGREGAR SKU AL OBJETO DE DATOS PARA UPDATE ---
    const datos = {
        sku: document.getElementById("edit-sku").value || "S/N",
        nombre: document.getElementById("edit-nombre").value,
        categoria: document.getElementById("edit-cat").value,
        subcategoria: document.getElementById("edit-subcat").value,
        stock: parseInt(document.getElementById("edit-stock").value) || 0,
        precio: parseInt(document.getElementById("edit-precio").value) || 0,
        descripcion: document.getElementById("edit-desc").value
    };

    try {
        for (let i = 1; i <= 3; i++) {
            const input = document.getElementById(`edit-foto${i}`);
            if (input.files && input.files[0]) {
                const urlVieja = productoActual[`url_imagen_${i}`];
                if (urlVieja) {
                    const nombreLimpio = urlVieja.split('/').pop().split('?')[0];
                    await client.storage.from('fotos-productos').remove([`productos/${nombreLimpio}`]);
                }
                const options = { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true, fileType: 'image/webp' };
                const compressed = await imageCompression(input.files[0], options);
                const path = `productos/${idProductoEditando}_${i}_${Date.now()}.webp`;
                await client.storage.from('fotos-productos').upload(path, compressed);
                const { data: pub } = client.storage.from('fotos-productos').getPublicUrl(path);
                datos[`url_imagen_${i}`] = pub.publicUrl;
            }
        }

        const { error } = await client.from('productos').update(datos).eq('id', idProductoEditando);
        if (error) throw error;

        alert("✅ Producto actualizado.");
        closeModal();
        cargarTablaDesdeSupabase();
    } catch (err) {
        alert("Error: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
}

// --- UTILIDADES ---
function filterTable() {
    const input = document.getElementById("search").value.toLowerCase();
    const resultados = productosEnMemoria.filter(p => 
        p.nombre.toLowerCase().includes(input) || 
        (p.sku && p.sku.toLowerCase().includes(input)) || // Búsqueda por SKU agregada
        p.categoria.toLowerCase().includes(input) ||
        p.subcategoria.toLowerCase().includes(input)
    );
    renderizarTabla(resultados);
}

// --- UTILIDADES ---
function filterTable() {
    const input = document.getElementById("search").value.toLowerCase();
    const resultados = productosEnMemoria.filter(p => 
        p.nombre.toLowerCase().includes(input) || 
        p.categoria.toLowerCase().includes(input) ||
        p.subcategoria.toLowerCase().includes(input)
    );
    renderizarTabla(resultados);
}

function closeModal() {
    const modal = document.getElementById("edit-modal");
    if (modal) modal.style.display = "none";
}

function previewEdit(input, imgId) {
    const preview = document.getElementById(imgId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}
