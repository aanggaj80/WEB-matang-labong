// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
if(menuBtn && navLinks){
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero parallax (halus, dimatikan otomatis kalau reduce-motion aktif)
const heroBg = document.getElementById('heroBg');
if(heroBg && !prefersReducedMotion){
  let ticking = false;
  window.addEventListener('scroll', () => {
    if(!ticking){
      requestAnimationFrame(() => {
        const y = window.scrollY * 0.28;
        heroBg.style.transform = `translateY(${y}px) scale(1.08)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive:true });
}

// Reveal on scroll — dengan jeda bertahap (stagger) untuk grid kartu
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const group = entry.target.closest('.quick-grid, .card-grid');
      if(group){
        const siblings = Array.from(group.children);
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = (idx * 70) + 'ms';
      }
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal, .quick-card, .signpost').forEach(el => {
  if(!el.classList.contains('reveal')) el.classList.add('reveal');
  observer.observe(el);
});

// Efek "magnetic" ringan pada kartu/tombol saat hover (desktop saja)
if(window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion){
  document.querySelectorAll('.quick-card, .btn-outline, .maps-btn, .signpost').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) * 0.06;
      const y = (e.clientY - r.top - r.height/2) * 0.12;
      el.style.transform = `translate(${x}px, ${y - 4}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// Lightbox for galleries
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
if(lightbox && lightboxImg){
  document.querySelectorAll('.gallery figure').forEach(fig => {
    fig.addEventListener('click', () => {
      lightboxImg.src = fig.getAttribute('data-full');
      lightbox.classList.add('open');
    });
  });
  const closeBtn = document.getElementById('lightboxClose');
  if(closeBtn) closeBtn.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) lightbox.classList.remove('open'); });
}
