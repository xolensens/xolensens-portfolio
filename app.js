(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let choice = null;
  try { choice = localStorage.getItem('xolensens-motion'); } catch {}
  let motionOff = reduced.matches || choice === 'off';
  const toggle = document.querySelector('.motion-toggle');
  const layers = [...document.querySelectorAll('[data-parallax]')];
  let scheduled = false;
  function renderMotion() {
    scheduled = false;
    for (const el of layers) {
      if (motionOff) { el.style.transform = ''; continue; }
      const parent = el.closest('.hero, .burrow-preview, .manifesto, .portrait-frame');
      if (!parent) continue;
      const rect = parent.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > innerHeight + 200) continue;
      const mobile = innerWidth <= 700 ? .45 : 1;
      const y = (innerHeight * .4 - rect.top) * Number(el.dataset.parallax) * mobile;
      el.style.transform = `translate3d(0,${Math.max(-90, Math.min(100, y))}px,0)`;
    }
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(renderMotion); } }
  function updateMotion() {
    root.classList.toggle('motion-off', motionOff);
    if(motionOff) document.getAnimations().forEach(a=>a.finish());
    if (toggle) { toggle.textContent = `Движение: ${motionOff ? 'выкл.' : 'вкл.'}`; toggle.setAttribute('aria-pressed', String(motionOff)); }
    renderMotion();
  }
  toggle?.addEventListener('click', () => { motionOff = !motionOff; choice = motionOff ? 'off' : 'on'; try {localStorage.setItem('xolensens-motion', choice);} catch {} updateMotion(); });
  reduced.addEventListener('change', e => {motionOff=e.matches || choice==='off';updateMotion();});
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule);
  updateMotion();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { if (!motionOff) entry.target.classList.add('reveal-enter'); observer.unobserve(entry.target); }
    }), {threshold:.12});
    document.querySelectorAll('.section-heading h2, .section-heading p, .featured-copy h3, .featured-copy>p, .project-card, .about-copy>p, .skill-lines, .art-grid figure, .faq-layout>h3, .contact h2').forEach(el => observer.observe(el));
  }
  const screens = {
    home: ['burrow-home-crop.webp','Мшистая нора: кладовая, показатели уюта и нижняя навигация','Нора: дом как видимый результат прогресса.'],
    collection: ['burrow-collection-crop.webp','Мшистая нора: мастерская с предметами для дома','Мастерская: находки превращаются в уют.'],
    level1: ['burrow-level1-crop.webp','Мшистая нора: первый уровень прогулки','Прогулка: короткое действие открывает новое.']
  };
  document.querySelectorAll('[data-screen]').forEach(button => button.addEventListener('click', () => {
    const [file, alt, caption] = screens[button.dataset.screen];
    const screen = document.getElementById('burrow-screen');
    screen.src = `assets/${file}`; screen.alt = alt;
    document.getElementById('screen-caption').textContent = caption;
    document.querySelectorAll('[data-screen]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  }));
  let lastFocus;
  const openDialog = dialog => {lastFocus=document.activeElement;dialog.showModal();dialog.querySelector('.dialog-close').focus();};
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target===dialog) {const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();} });
    dialog.addEventListener('close',()=>{dialog.querySelector('video')?.pause();lastFocus?.focus();});
  });
  document.querySelectorAll('[data-art]').forEach(button => button.addEventListener('click', () => {
    const dialog = document.getElementById('art-dialog');
    const full = document.getElementById('art-full');
    full.src=`assets/${button.dataset.art}.webp`;full.alt=button.querySelector('img').alt;
    document.getElementById('art-caption').textContent=button.closest('figure').querySelector('figcaption').innerText;
    openDialog(dialog);
  }));
  document.querySelectorAll('[data-open-video]').forEach(button => button.addEventListener('click',()=>{const dialog=document.getElementById('video-dialog');openDialog(dialog);dialog.querySelector('video').play().catch(()=>{});}));
  document.querySelector('[data-copy-email]')?.addEventListener('click',async()=>{
    const status=document.querySelector('.copy-status');
    try {await navigator.clipboard.writeText('kholenkov2004@mail.ru');status.textContent='Почта скопирована. Буду рад знакомству.';}
    catch {status.textContent='Моя почта: kholenkov2004@mail.ru. Её можно выделить и скопировать.';}
  });
  document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
})();
