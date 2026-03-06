/**
 * Carga los componentes compartidos (Header y Footer)
 * Todos los archivos HTML deben estar en la raíz del proyecto.
 */
async function loadSharedComponents() {
    // Definimos los componentes a cargar
    const components = [
        { name: 'header', id: 'header-placeholder' },
        { name: 'footer', id: 'footer-placeholder' }
    ];

    for (const comp of components) {
        const container = document.getElementById(comp.id);
        if (!container) continue;

        try {
            // La ruta siempre será relativa a la raíz
            const response = await fetch(`./components/${comp.name}.html`);
            
            if (response.ok) {
                container.innerHTML = await response.text();
                console.log(`✅ Componente [${comp.name}] cargado correctamente.`);
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
