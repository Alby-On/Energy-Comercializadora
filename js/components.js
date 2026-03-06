/**
 * Carga un componente HTML en un contenedor específico
 * @param {string} componentName - Nombre del archivo (sin .html)
 * @param {string} containerId - ID del elemento donde se cargará
 */
async function loadComponent(componentName, containerId) {
    try {
        // Buscamos el archivo HTML en la carpeta 'components'
        const response = await fetch(`./components/${componentName}.html`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se encontró el componente "${componentName}"`);
        }
        
        const html = await response.text();
        const container = document.getElementById(containerId);

        if (container) {
            container.innerHTML = html;
            console.log(`✅ Componente [${componentName}] cargado en #${containerId}`);
        } else {
            console.warn(`⚠️ No se encontró el contenedor con ID: "${containerId}"`);
        }
    } catch (error) {
        console.error("❌ Error al cargar el componente:", error);
    }
}

// Ejecución automática al cargar el DOM
document.addEventListener("DOMContentLoaded", async () => {
    // Cargamos Header y Footer simultáneamente
    await Promise.all([
        loadComponent('header', 'header-placeholder'),
        loadComponent('footer', 'footer-placeholder')
    ]);

    // Aquí podrías inicializar funciones de la navbar si las tienes, 
    // como el script del menú hamburguesa.
});
