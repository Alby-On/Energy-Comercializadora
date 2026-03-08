/**
 * Carga los componentes compartidos (Header, Footer y Carrito)
 * La ruta es relativa a la carpeta /components/
 */
async function loadSharedComponents() {
    const components = [
        { name: 'header', id: 'header-placeholder' },
        { name: 'footer', id: 'footer-placeholder' },
        { name: 'carro_compras', id: 'cart-placeholder' }
    ];

    for (const comp of components) {
        const container = document.getElementById(comp.id);
        if (!container) continue;

        try {
            const response = await fetch(`./components/${comp.name}.html`);
            
            if (response.ok) {
                container.innerHTML = await response.text();
                console.log(`✅ Componente [${comp.name}] cargado correctamente.`);

                // --- LÓGICA DE SINCRONIZACIÓN PARA EL CARRITO ---
                // Si el componente que acabamos de cargar es el carrito,
                // avisamos al sistema para que renderice los productos guardados.
                if (comp.name === 'carro_compras') {
                    document.dispatchEvent(new CustomEvent('cartLoaded'));
                }
                
            } else {
                console.error(`❌ No se encontró el archivo: components/${comp.name}.html`);
            }
        } catch (error) {
            console.error(`❌ Error de red al cargar ${comp.name}:`, error);
        }
    }
}

// Iniciar la carga al abrir cualquier página
document.addEventListener("DOMContentLoaded", loadSharedComponents);
