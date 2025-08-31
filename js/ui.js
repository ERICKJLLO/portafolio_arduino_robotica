// smooth scroll para enlaces internos + encoger header al hacer scroll
(function(){
	// smooth scroll (respeta prefers-reduced-motion)
	document.addEventListener('DOMContentLoaded', ()=> {
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if(prefersReduced){
			document.documentElement.style.scrollBehavior = 'auto';
		}
		document.querySelectorAll('a[href^="#"]').forEach(a=>{
			a.addEventListener('click', function(e){
				const target = document.querySelector(this.getAttribute('href'));
				if(target){ e.preventDefault(); target.scrollIntoView({behavior: prefersReduced ? 'auto' : 'smooth', block:'start'}); }
			});
		});
	});

	// header shrink + efecto "absorber"
	(function(){
		const header = document.querySelector('.site-header');
		const root = document.documentElement;
		const main = document.querySelector('main');
		if(!header || !main) return;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if(prefersReduced) return;
		const SHRINK_THRESHOLD = 60;
		const ABSORB_MAX_SCROLL = 420;
		let ticking = false;

		function headerCenter() {
			const rect = header.getBoundingClientRect();
			const x = rect.left + rect.width / 2;
			const y = rect.top + rect.height / 2;
			const vx = (x / window.innerWidth) * 100;
			const vy = (y / window.innerHeight) * 100;
			return {vx: vx + '%', vy: vy + '%'};
		}

		function onScroll(){
			if(!ticking){
				window.requestAnimationFrame(()=> {
					const y = window.scrollY || window.pageYOffset || 0;
					if(y > SHRINK_THRESHOLD) header.classList.add('shrink');
					else header.classList.remove('shrink');

					let v = Math.max(0, Math.min(1, y / ABSORB_MAX_SCROLL));
					v = 1 - Math.pow(1 - v, 1.8);

					root.style.setProperty('--absorb', v.toFixed(3));
					const pos = headerCenter();
					root.style.setProperty('--absorb-x', pos.vx);
					root.style.setProperty('--absorb-y', pos.vy);

					if(v > 0.01) main.classList.add('absorbing');
					else main.classList.remove('absorbing');

					ticking = false;
				});
				ticking = true;
			}
		}
		window.addEventListener('scroll', onScroll, {passive:true});
		onScroll();
	})();
})();
