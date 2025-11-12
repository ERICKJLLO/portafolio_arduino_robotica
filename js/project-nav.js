// ==UserScript==
// @name         Project Navigation Enhancer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Agrega navegación anterior/siguiente en páginas de proyectos Arduino
// @author       Tu Nombre
// @match        *://*/*proyecto*.html
// @grant        none
// ==/UserScript==

(function(){
	// Inserta navegación anterior/volver/siguiente en páginas proyectoN.html
	document.addEventListener('DOMContentLoaded', function(){
		try {
			const path = window.location.pathname.replace(/\\/g,'/'); // cross-platform
			const file = path.split('/').pop() || '';
			const m = file.match(/proyecto(\d+)\.html$/i);
			if(!m) return; // no es una página de proyecto
			const num = parseInt(m[1],10);
			const prev = num > 1 ? `proyecto${num-1}.html` : null;
			const next = num < 15 ? `proyecto${num+1}.html` : null; // asumiendo 15 proyectos planeados

			// buscar la card que contiene el enlace a "proyectos.html"
			const cards = Array.from(document.querySelectorAll('section.card'));
			let targetCard = null;
			for(const c of cards){
				if(c.querySelector('a[href$="proyectos.html"], a[href$="/proyectos.html"]')){
					targetCard = c;
					break;
				}
			}
			// si no existe, intentar buscar al final
			if(!targetCard) targetCard = cards[cards.length-1] || null;
			if(!targetCard) return;

			// construir HTML del footer
			const createBtn = (href, text, disabled=false) => {
				if(disabled) return `<button class="btn" disabled aria-disabled="true" style="min-width:120px;opacity:.6;cursor:not-allowed;">${text}</button>`;
				return `<a class="btn" href="${href}" style="min-width:120px; display:inline-flex; align-items:center; justify-content:center;">${text}</a>`;
			};

			const volverHtml = `
				<div style="display:flex;gap:8px;justify-content:center;">
					<a class="btn" href="proyectos.html">Volver a proyectos</a>
					<a class="btn" href="../index.html">Volver al inicio</a>
				</div>
			`;

			const footerHtml = `
				<div class="project-footer" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
					<div class="nav-left">${ prev ? createBtn(prev, '← Anterior') : createBtn('#','← Anterior', true) }</div>
					${volverHtml}
					<div class="nav-right">${ next ? createBtn(next, 'Siguiente →') : createBtn('#','Siguiente →', true) }</div>
				</div>
			`;

			// reemplazar el contenido del targetCard por el footer manteniendo la card
			// pero si ya existe un .project-footer no duplicar
			if(!targetCard.querySelector('.project-footer')){
				// eliminar nodos previos de "volver a proyectos" para evitar duplicados
				// (si existían botones sueltos los removemos antes de insertar)
				const volverLinks = targetCard.querySelectorAll('a[href$="proyectos.html"], a[href$="../index.html"], button[aria-disabled]');
				volverLinks.forEach(n => n.remove());
				// insertar footer al final de la card
				targetCard.insertAdjacentHTML('beforeend', footerHtml);
			}
		} catch(e){
			// silencioso, evitar romper la página si algo falla
			console.error('project-nav error', e);
		}
	});
})();