/**
 * Carga los componentes compartidos (Header y Footer)
 */
async function loadSharedComponents() {
    // Detectamos si estamos en la carpeta /pages/ para ajustar la ruta
    const isInPages = window.location.pathname.includes('/pages/');
    const pathPrefix = isInPages ? '../' : './';

    const components = [
        { name: 'header', id: 'header-placeholder' },
        { name: 'footer', id: 'footer-placeholder' }
    ];

    for (const comp of components) {
        const container = document.getElementById(comp.id);
        if (!container) continue;

        try {
            const response = await fetch(`${pathPrefix}components/${comp.name}.html`);
            if (response.ok) {
                container.innerHTML = await response.text();
                console.log(`✅ ${comp.name} cargado.`);
            }
        } catch (error) {
            console.error(`❌ Error cargando ${comp.name}:`, error);
        }
    }
}

document.addEventListener("DOMContentLoaded", loadSharedComponents);
