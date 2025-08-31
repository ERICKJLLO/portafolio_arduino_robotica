(function () {
	const canvas = document.getElementById('bg-canvas');
	if(!canvas) return;
	const ctx = canvas.getContext('2d');
	let w=0,h=0, DPR = Math.max(1, window.devicePixelRatio || 1);

	function resize(){
		w = window.innerWidth;
		h = window.innerHeight;
		canvas.width = Math.floor(w * DPR);
		canvas.height = Math.floor(h * DPR);
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
		ctx.setTransform(DPR,0,0,DPR,0,0);
	}
	window.addEventListener('resize', resize, {passive:true});
	resize();

	const N = Math.max(24, Math.floor((w*h)/60000));
	const parts = [];
	for(let i=0;i<N;i++){
		parts.push({
			x: Math.random()*w,
			y: Math.random()*h,
			vx: (Math.random()-0.5)*0.3,
			vy: (Math.random()-0.5)*0.3,
			r: 0.8 + Math.random()*1.6
		});
	}

	const mouse = {x: -9999, y: -9999, active:false};
	window.addEventListener('mousemove', e=>{ mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
	window.addEventListener('pointerdown', e=>{ mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
	window.addEventListener('mouseleave', ()=>{ mouse.x = -9999; mouse.y = -9999; mouse.active = false; });
	window.addEventListener('touchstart', e=>{ const t=e.touches[0]; if(t){ mouse.x=t.clientX; mouse.y=t.clientY; mouse.active=true; } }, {passive:true});
	window.addEventListener('touchmove', e=>{ const t=e.touches[0]; if(t){ mouse.x=t.clientX; mouse.y=t.clientY; } }, {passive:true});
	window.addEventListener('touchend', ()=>{ mouse.active=false; }, {passive:true});

	function step(){
		ctx.clearRect(0,0,w,h);

		for(let p of parts){
			p.x += p.vx; p.y += p.vy;
			if(p.x < 0 || p.x > w){ p.vx *= -1; p.x = Math.max(0, Math.min(w, p.x)); }
			if(p.y < 0 || p.y > h){ p.vy *= -1; p.y = Math.max(0, Math.min(h, p.y)); }

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

		for(let i=0;i<parts.length;i++){
			const a = parts[i];
			for(let j=i+1;j<parts.length;j++){
				const b = parts[j];
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				const d2 = dx*dx + dy*dy;
				if(d2 < 9000){
					const alpha = 0.12 * (1 - Math.sqrt(d2)/95);
					ctx.strokeStyle = `rgba(180,220,255,${Math.max(0,alpha)})`;
					ctx.lineWidth = 1 * (1 - Math.sqrt(d2)/95);
					ctx.beginPath();
					ctx.moveTo(a.x,a.y);
					ctx.lineTo(b.x,b.y);
					ctx.stroke();
				}
			}
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
