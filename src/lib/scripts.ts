/* Scripts que corren en <head> antes de pintar (sin parpadeo). Módulo sin 'use client' a propósito. */

/** Aplica el tema claro/oscuro guardado. */
export const themeScript = `try{var t=localStorage.getItem('chevere:theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`

/** Fija el momento del día según la hora local del visitante (portada). */
export const momentoScript = `try{var h=new Date().getHours();document.documentElement.dataset.momento=h>=5&&h<11?'amanecer':h>=11&&h<16?'mediodia':h>=16&&h<19?'atardecer':'noche'}catch(e){}`

/** Respeta la preferencia de "animaciones pausadas" guardada por el visitante. */
export const movimientoScript = `try{if(localStorage.getItem('chevere:movimiento')==='pausado')document.documentElement.dataset.movimiento='pausado'}catch(e){}`

/**
 * Intro de bienvenida: se muestra UNA vez por visita (sesión del navegador).
 * No se muestra si el visitante pidió "reducir movimiento" o si ya la vio en esta sesión.
 */
export const introScript = `try{var d=document.documentElement;if(sessionStorage.getItem('chevere:intro')||matchMedia('(prefers-reduced-motion: reduce)').matches||d.dataset.movimiento==='pausado'){d.dataset.intro='no'}else{d.dataset.intro='si';sessionStorage.setItem('chevere:intro','1')}}catch(e){document.documentElement.dataset.intro='no'}`

/**
 * Control de la intro, autocontenido (corre mientras se lee el HTML, sin esperar a React):
 * elige el video según la pantalla, lo reproduce y cierra con un fundido al terminar,
 * al pulsar "Saltar", con Escape, si el video no arranca en 3,5 s o como máximo a los 12 s.
 */
export const introControl = `(function(){var d=document.documentElement;if(d.dataset.intro!=='si')return;var w=document.getElementById('intro');if(!w)return;var v=w.querySelector('video'),b=w.querySelector('button'),fin=false;
v.src=innerWidth<820?'/intro/chevere-intro-480.mp4':'/intro/chevere-intro-720.mp4';
function cerrar(){if(fin)return;fin=true;w.classList.add('saliendo');setTimeout(function(){d.dataset.intro='no';try{v.pause();v.removeAttribute('src');v.load()}catch(e){}},900)}
v.addEventListener('ended',cerrar);v.addEventListener('error',cerrar);b.addEventListener('click',cerrar);
document.addEventListener('keydown',function(e){if(e.key==='Escape')cerrar()});
var arranque=setTimeout(function(){if(v.currentTime<0.1)cerrar()},3500);v.addEventListener('playing',function(){clearTimeout(arranque);w.classList.add('reproduciendo')});
setTimeout(cerrar,12000);var p=v.play();if(p&&p.catch)p.catch(cerrar);
try{b.focus({preventScroll:true})}catch(e){}})();`
