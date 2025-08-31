// simulador global: ejecuta ejemplos en el panel derecho
(function(){
	document.addEventListener('DOMContentLoaded', ()=> {
		const simLed = document.getElementById('sim-led');
		const simConsoleBody = document.getElementById('sim-console-body');
		const simStatus = document.getElementById('sim-status');
		const simStopBtn = document.getElementById('sim-stop');
		const simResetBtn = document.getElementById('sim-reset');

		const sims = {}; // simulaciones activas (solo una real a la vez en el panel)
		let active = null;

		function log(msg){
			const time = new Date().toLocaleTimeString();
			simConsoleBody.textContent += `[${time}] ${msg}\n`;
			simConsoleBody.parentElement.scrollTop = simConsoleBody.parentElement.scrollHeight;
		}
		function setLed(on){
			if(!simLed) return;
			simLed.classList.toggle('on', !!on);
		}
		function setStatus(text){
			if(simStatus) simStatus.textContent = `Estado: ${text}`;
		}

		function stopActive(){
			if(!active) return;
			const s = sims[active];
			if(s){
				if(s.type === 'interval') clearInterval(s.tid);
				if(s.type === 'timeout') clearTimeout(s.tid);
				delete sims[active];
			}
			log(`Simulación "${active}" detenida.`);
			setLed(false);
			setStatus('inactivo');
			active = null;
			// reactivar botones si fueron desactivados por modo bloqueante
			document.querySelectorAll('.run-btn').forEach(b=> b.disabled = false);
		}

		function resetConsole(){
			simConsoleBody.textContent = '';
			log('Consola reiniciada.');
		}

		function startBlinkSimple(id){
			// modo "bloqueante" (representado: deshabilita ejecución de otros ejemplos)
			stopActive();
			active = id;
			log(`Iniciando "${id}" (modo BLOQUEANTE - delay)...`);
			setStatus('ejecutando (bloqueante)');
			// desactivar otras ejecuciones
			document.querySelectorAll('.run-btn').forEach(b=>{
				if(b.getAttribute('data-example') !== id) b.disabled = true;
			});
			// simulamos delay alternando LED cada 1s mediante interval.
			const tid = setInterval(()=> {
				const on = simLed.classList.contains('on');
				setLed(!on);
				log(`LED ${!on ? 'ON' : 'OFF'}`);
			}, 1000);
			sims[id] = {type:'interval', tid};
		}

		function startBlinkMillis(id){
			stopActive();
			active = id;
			log(`Iniciando "${id}" (modo NO BLOQUEANTE - millis)...`);
			setStatus('ejecutando (no bloqueante)');
			// en no bloqueante permitimos otras acciones (no deshabilitamos botones)
			let prev = performance.now();
			const interval = 500;
			const tid = setInterval(()=>{
				const now = performance.now();
				if(now - prev >= interval){
					prev = now;
					const on = simLed.classList.contains('on');
					setLed(!on);
					log(`LED ${!on ? 'ON' : 'OFF'}`);
				}
			}, 60);
			sims[id] = {type:'interval', tid};
		}

		// manejar clicks en botones (Ejecutar / Detener por ejemplo)
		document.addEventListener('click', function(e){
			const btn = e.target.closest('button[data-action]');
			if(btn){
				const action = btn.getAttribute('data-action');
				const example = btn.getAttribute('data-example');
				if(action === 'run'){
					if(example === 'blink-simple') startBlinkSimple(example);
					else if(example === 'blink-millis') startBlinkMillis(example);
				}else if(action === 'stop'){
					if(active === example) stopActive();
					else log(`No está activo "${example}".`);
				}
			}
		});

		// botones globales del panel
		simStopBtn && simStopBtn.addEventListener('click', ()=> stopActive());
		simResetBtn && simResetBtn.addEventListener('click', ()=> { stopActive(); resetConsole(); });

		// limpiar al abandonar
		window.addEventListener('beforeunload', ()=> {
			if(active) stopActive();
		});
	});
})();
