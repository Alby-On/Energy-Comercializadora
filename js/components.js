// components.js

/**
 * Carga un componente HTML en un contenedor específico
 * @param {string} componentName - Nombre del archivo (sin .html)
 * @param {string} containerId - ID del elemento donde se cargará
 */
async function loadComponent(componentName, containerId) {
    try {
        // Buscamos el archivo HTML del componente en una carpeta llamada 'components'
        const response = await fetch(`./components/${componentName}.html`);
        
        if (!response.ok) throw new Error(`No se pudo cargar: ${componentName}`);
        
        const html = await response.text();
        document.getElementById(containerId).innerHTML = html;
        
        console.log(`Componente [${componentName}] cargado con éxito.`);
    } catch (error) {
        console.error("Error al cargar el componente:", error);
    }
}

// Ejemplo de uso al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    loadComponent('navbar', 'nav-placeholder');
    loadComponent('footer', 'footer-placeholder');
});
