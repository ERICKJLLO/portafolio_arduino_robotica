(function () {
	const canvas = document.getElementById('bg-canvas');
	if(!canvas) return;
	const ctx = canvas.getContext('2d');
	let w = 0, h = 0;
	let DPR = Math.max(1, window.devicePixelRatio || 1);
	const header = document.querySelector('.site-header');

	// calcular y aplicar bounds del canvas para que comience justo debajo del header
	function updateCanvasBounds(){
		const headerHeight = header ? Math.round(header.getBoundingClientRect().height) : 0;
		// colocar canvas justo debajo del header y ajustar su altura
		canvas.style.top = headerHeight + 'px';
		// altura disponible para el canvas
		w = window.innerWidth;
		h = Math.max(0, window.innerHeight - headerHeight);
		canvas.style.height = h + 'px';
		canvas.style.width = w + 'px';
		canvas.width = Math.floor(w * DPR);
		canvas.height = Math.floor(h * DPR);
		// dejar el contexto con escala DPR
		ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
	}

	// partículas (se recrean al cambiar tamaño para ajustarse al nuevo h)
	let parts = [];
	function createParticles(){
		const N = Math.max(24, Math.floor((w*h)/60000)); // escala según pantalla
		parts = [];
		for(let i=0;i<N;i++){
			parts.push({
				x: Math.random()*w,
				y: Math.random()*h,
				vx: (Math.random()-0.5)*0.3,
				vy: (Math.random()-0.5)*0.3,
				r: 0.8 + Math.random()*1.6
			});
		}
	}

	// estado del mouse relativo al área del canvas (y ajustada por header)
	const mouse = {x: -9999, y: -9999, active:false};

	function onPointerMove(clientX, clientY){
		// coordenada relativa al canvas: restar top (header height)
		const headerHeight = header ? Math.round(header.getBoundingClientRect().height) : 0;
		const relY = clientY - headerHeight;
		mouse.x = clientX;
		mouse.y = relY;
		// sólo activar si está dentro del canvas verticalmente
		mouse.active = (relY >= 0 && relY <= h);
	}

	window.addEventListener('mousemove', e => onPointerMove(e.clientX, e.clientY));
	window.addEventListener('pointerdown', e => onPointerMove(e.clientX, e.clientY));
	window.addEventListener('mouseleave', ()=>{ mouse.x = -9999; mouse.y = -9999; mouse.active = false; });
	window.addEventListener('touchstart', e=>{ const t=e.touches[0]; if(t) onPointerMove(t.clientX, t.clientY); }, {passive:true});
	window.addEventListener('touchmove', e=>{ const t=e.touches[0]; if(t) onPointerMove(t.clientX, t.clientY); }, {passive:true});
	window.addEventListener('touchend', ()=>{ mouse.active=false; }, {passive:true});

	function onResize(){
		DPR = Math.max(1, window.devicePixelRatio || 1);
		updateCanvasBounds();
		createParticles();
	}
	window.addEventListener('resize', onResize, {passive:true});

	// también recalcular si cambia el header al hacer scroll (por ejemplo .shrink)
	let lastHeaderHeight = header ? Math.round(header.getBoundingClientRect().height) : 0;
	function checkHeaderChange(){
		if(!header) return;
		const nowH = Math.round(header.getBoundingClientRect().height);
		if(nowH !== lastHeaderHeight){
			lastHeaderHeight = nowH;
			updateCanvasBounds();
			// opcional: mantener partículas, pero reposicionar si fuera necesario
		}
		requestAnimationFrame(checkHeaderChange);
	}
	checkHeaderChange();

	// inicializar
	onResize();

	function step(){
		ctx.clearRect(0,0,w,h);

		// actualizar partículas
		for(let p of parts){
			p.x += p.vx;
			p.y += p.vy;
			// rebote suave en bordes
			if(p.x < 0 || p.x > w){ p.vx *= -1; p.x = Math.max(0, Math.min(w, p.x)); }
			if(p.y < 0 || p.y > h){ p.vy *= -1; p.y = Math.max(0, Math.min(h, p.y)); }

			// interacción con ratón: pequeña atracción (usar mouse relativo al canvas)
			if(mouse.active){
				const dx = mouse.x - p.x;
				const dy = mouse.y - p.y;
				const d2 = dx*dx + dy*dy;
				const minD = 140*140;
				if(d2 < minD && d2>0){
					const f = (1 - Math.sqrt(d2)/140) * 0.08;
					p.vx += dx * f * 0.001;
					p.vy += dy * f * 0.001;
				}
			}
		}

		// líneas entre partículas cercanas y con el mouse
		for(let i=0;i<parts.length;i++){
			const a = parts[i];
			for(let j=i+1;j<parts.length;j++){
				const b = parts[j];
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				const d2 = dx*dx + dy*dy;
				if(d2 < 9000){ // distancia umbral
					const alpha = 0.12 * (1 - Math.sqrt(d2)/95);
					ctx.strokeStyle = `rgba(180,220,255,${Math.max(0,alpha)})`;
					ctx.lineWidth = 1 * (1 - Math.sqrt(d2)/95);
					ctx.beginPath();
					ctx.moveTo(a.x,a.y);
					ctx.lineTo(b.x,b.y);
					ctx.stroke();
				}
			}
			// conectar con ratón si cerca
			if(mouse.active){
				const dxm = a.x - mouse.x;
				const dym = a.y - mouse.y;
				const d2m = dxm*dxm + dym*dym;
				if(d2m < 16000){
					ctx.strokeStyle = `rgba(160,200,255,${0.10 * (1 - Math.sqrt(d2m)/126)})`;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(a.x,a.y);
					ctx.lineTo(mouse.x, mouse.y);
					ctx.stroke();
				}
			}
		}

		// dibujar partículas encima de líneas
		for(let p of parts){
			ctx.beginPath();
			ctx.fillStyle = 'rgba(200,230,255,0.9)';
			ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
			ctx.fill();
		}

		requestAnimationFrame(step);
	}
	requestAnimationFrame(step);
})();
