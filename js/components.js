async function loadSharedComponents() {
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
                
                // --- AQUÍ ESTÁ EL TRUCO PARA GITHUB PAGES ---
                // Ajustamos todos los enlaces del header recién cargado
                const navLinks = container.querySelectorAll('a');
                navLinks.forEach(link => {
                    const originalHref = link.getAttribute('href');
                    // Si estamos en una subcarpeta, agregamos ../ a los links
                    if (isInPages) {
                        if (originalHref === 'index.html') {
                            link.href = '../index.html';
                        } else if (originalHref.startsWith('pages/')) {
                            // Si ya estamos en /pages/, quitamos el prefijo 'pages/'
                            link.href = originalHref.replace('pages/', './');
                        }
                    }
                });

                // Ajustar la imagen del logo también
                const logo = container.querySelector('#nav-logo');
                if (logo) {
                    logo.src = `${pathPrefix}images/Energy.png`;
                }
            }
        } catch (error) {
            console.error(`❌ Error:`, error);
        }
    }
}

document.addEventListener("DOMContentLoaded", loadSharedComponents);
