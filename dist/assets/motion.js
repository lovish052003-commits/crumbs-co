(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const products = [
    { name: 'Chocolate Chunk Cookie', type: 'Cookies', price: 149, id: 'cookie-chocolate-chunk', image: 'cookie.png' },
    { name: 'Biscoff Stuffed Cookie', type: 'Cookies', price: 179, id: 'cookie-biscoff-stuffed', image: null },
    { name: 'Classic New York Cheesecake', type: 'Cheesecakes', price: 249, id: 'cheesecake-classic-ny', image: null },
    { name: 'Chocolate Fudge Mug Cake', type: 'Mug Cakes', price: 179, id: 'mugcake-chocolate-fudge', image: null },
  ];
  let currentPath = '';
  let disposeHero = () => {};
  let menuOpen = false;
  let lastFocus;

  const menu = document.createElement('div');
  menu.className = 'bakery-menu';
  menu.id = 'bakery-menu';
  menu.inert = true;
  menu.setAttribute('aria-hidden', 'true');
  menu.innerHTML = `<div class="menu-top"><a href="/" class="menu-brand">Crumbs & Co.</a><button class="menu-close" aria-label="Close menu">Close ×</button></div><nav aria-label="Bakery navigation"><a href="/shop">All the good stuff<span>The bakery</span></a><a href="/category/cookies">Cookies<span>Crisp. Gooey. Gone.</span></a><a href="/category/cheesecakes">Cheesecakes<span>A little slice of joy</span></a><a href="/category/mug-cakes">Mug cakes<span>Comfort by the spoonful</span></a></nav><div class="menu-bottom"><a href="/about">Our story</a><a href="/faq">Your questions</a><a href="/contact">Say hello</a><span>Baked for your moment.</span></div>`;
  document.body.append(menu);

  function toggleMenu(open) {
    menuOpen = open;
    if (open) lastFocus = document.activeElement;
    menu.inert = !open;
    menu.setAttribute('aria-hidden', String(!open));
    menu.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('bakery-menu-open', open);
    document.querySelector('.motion-menu-button')?.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => menu.querySelector('.menu-close').focus(), 50);
    else lastFocus?.focus();
  }
  menu.querySelector('.menu-close').addEventListener('click', () => toggleMenu(false));
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') toggleMenu(false);
    if (event.key !== 'Tab') return;
    const links = [...menu.querySelectorAll('a,button')];
    const first = links[0], last = links.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('motion-visible');
      revealObserver.unobserve(entry.target);
    }
  }, { threshold: 0.08 });

  const buildHero = originalHero => window.buildCrumbsHero(originalHero);

  function enhance() {
    window.enhanceCrumbsProduct?.();
    const nav = document.querySelector('[class*="_navContainer_"]');
    if (nav && !nav.querySelector('.motion-menu-button')) {
      const button = document.createElement('button');
      button.className = 'motion-menu-button';
      button.innerHTML = 'Menu <span aria-hidden="true">☰</span>';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'bakery-menu');
      button.onclick = () => toggleMenu(true);
      nav.append(button);
    }
    if (currentPath !== location.pathname) {
      currentPath = location.pathname;
      disposeHero();
      const hero = document.querySelector('[class*="_hero_z9xcc_"]');
      if (location.pathname === '/' && hero) disposeHero = buildHero(hero);
      document.body.classList.remove('route-arrived');
      requestAnimationFrame(() => document.body.classList.add('route-arrived'));
    } else if (location.pathname === '/' && !document.querySelector('.motion-home')) {
      const hero = document.querySelector('[class*="_hero_z9xcc_"]');
      if (hero) disposeHero = buildHero(hero);
    }
    window.enhanceCrumbsSauce?.();
    document.querySelectorAll('[class*="_card_118if"], [class*="_testimonialCard_"], [class*="_sectionHeader_"], [class*="_instaGrid_"] img').forEach((element, index) => {
      if (element.dataset.motionReady) return;
      element.dataset.motionReady = 'true';
      element.style.setProperty('--reveal-delay', `${index % 4 * 70}ms`);
      revealObserver.observe(element);
    });
  }
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; enhance(); });
  }).observe(document.getElementById('root'), { childList: true, subtree: true });
  enhance();

  menu.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    event.preventDefault();
    toggleMenu(false);
    const matching = [...document.querySelectorAll('#root a[href]')].find(a => a.getAttribute('href') === link.getAttribute('href'));
    if (matching) matching.click();
    else location.href = link.href;
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('.motion-home a[href^="/"]');
    if (!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const matching = [...document.querySelectorAll('#root a[href]')].find(a => !a.closest('.motion-home') && a.getAttribute('href') === link.getAttribute('href'));
    if (matching) { event.preventDefault(); matching.click(); }
  });
})();
