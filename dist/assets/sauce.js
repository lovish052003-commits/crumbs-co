(() => {
  const catalog = {
    'mugcake-biscoff': { image:'biscoff-mugcake.png', tint:'#efe0ca' },
    'cookie-biscoff-stuffed': { image:'biscoff.png', tint:'#f0e3cf', sauce:'caramel', x:495, y:525, drip:125 },
    'mugcake-chocolate-fudge': { image:'mugcake.png', tint:'#e8dcd3', sauce:'chocolate', x:465, y:370, drip:75 },
    'cheesecake-chocolate-fudge': { image:'fudge-cheesecake.png', tint:'#e8dcd3', sauce:'chocolate', x:555, y:345, drip:160 },
  };

  // Existing carts retain product snapshots. Correct their pictures as well,
  // without changing the contents, quantities, wishlist, or drawer state.
  try {
    const saved=JSON.parse(localStorage.getItem('crumb-and-co-storage'));
    let changed=false;
    for(const product of saved?.state?.cart || []) {
      const item=catalog[product.id];
      if(item && product.image!=='/assets/'+item.image) {product.image='/assets/'+item.image;changed=true;}
    }
    if(changed)localStorage.setItem('crumb-and-co-storage',JSON.stringify(saved));
  } catch { /* Storage can be disabled; the catalogue still works. */ }

  let serial=0;
  const observed=new Set();
  const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('sauce-live',entry.isIntersecting)),{rootMargin:'80px'});

  function addPour(host,id,padding=0) {
    const item=catalog[id];
    if(!item?.sauce || host.querySelector(':scope > .sauce-pour'))return;
    const uid='sauce-'+serial++, {x,y,drip}=item;
    const caramel=item.sauce==='caramel';
    const colors=caramel?['#6a320f','#b86e30','#dc9e5d','#8e481d']:['#160905','#482014','#89513b','#2b1008'];
    const stream=`M ${x-2} 47 C ${x+3} ${y*.3}, ${x-4} ${y*.7}, ${x} ${y}`;
    const front=`M ${x+2} ${y+8} C ${x+19} ${y+23}, ${x-9} ${y+drip*.65}, ${x+5} ${y+drip}`;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('sauce-pour');svg.dataset.sauceFor=id;
    svg.setAttribute('viewBox','0 0 1000 1000');svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    svg.style.setProperty('--sauce-padding',padding+'px');
    svg.style.setProperty('--sauce-color',colors[1]);
    svg.innerHTML=`<defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${colors[0]}"/><stop offset=".38" stop-color="${colors[1]}"/><stop offset=".61" stop-color="${colors[2]}"/><stop offset="1" stop-color="${colors[3]}"/></linearGradient><linearGradient id="${uid}-metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f9f7f0"/><stop offset=".5" stop-color="#b9b2a6"/><stop offset="1" stop-color="#e4ded3"/></linearGradient></defs>
      <g class="sauce-spoon"><path d="M ${x+15} 23 L ${x+125} -15" stroke="url(#${uid}-metal)" stroke-width="10" stroke-linecap="round"/><ellipse cx="${x-2}" cy="32" rx="29" ry="14" transform="rotate(-20 ${x-2} 32)" fill="url(#${uid}-metal)" stroke="#aaa194" stroke-width="1.5"/><ellipse cx="${x-2}" cy="33" rx="24" ry="10" transform="rotate(-20 ${x-2} 33)" fill="url(#${uid})"/></g>
      <g class="sauce-stream"><path d="${stream}" fill="none" stroke="${colors[0]}" stroke-width="12" stroke-linecap="round"/><path d="${stream}" fill="none" stroke="url(#${uid})" stroke-width="9" stroke-linecap="round"/><path class="sauce-flow" d="${stream}" fill="none" stroke="${colors[2]}" stroke-width="2" stroke-linecap="round" pathLength="100" stroke-dasharray="4 19" opacity=".7"/></g>
      <g transform="translate(${x} ${y+4})"><ellipse class="sauce-pool" rx="21" ry="7" fill="${colors[1]}"/><ellipse class="sauce-ripple" rx="18" ry="5" fill="none" stroke="${colors[2]}" stroke-width="2"/></g>
      <path class="sauce-drip" d="${front}" fill="none" stroke="url(#${uid})" stroke-width="7" stroke-linecap="round" pathLength="100"/>
      <g transform="translate(${x+5} ${y+drip})"><path class="sauce-drop" d="M0 -10 C-2 -5 -7 0 -6 5 C-5 14 6 14 7 5 C8 0 2 -5 0 -10Z" fill="${colors[1]}"/><path class="sauce-drop-shine" d="M-2 0 Q-5 7 -1 9" fill="none" stroke="${colors[2]}" stroke-width="1.6"/></g>`;
    host.append(svg);observed.add(svg);visibility.observe(svg);
  }

  window.enhanceCrumbsSauce=()=> {
    for(const svg of observed)if(!svg.isConnected){visibility.unobserve(svg);observed.delete(svg);}
    document.querySelectorAll('#root a[class*="_card_118if_"][href^="/product/"]').forEach(card=>{
      const id=card.getAttribute('href').split('/').pop(),item=catalog[id];
      if(!item)return;
      const image=card.querySelector('img'),host=card.querySelector('[class*="_imageWrapper_"]');
      if(!image||!host)return;
      if(!image.dataset.catalogCutout){image.dataset.catalogCutout='true';image.src='/assets/'+item.image;image.classList.add('catalog-cutout');host.classList.add('sauce-card');host.style.setProperty('--product-tint',item.tint);}
      addPour(host,id,16);
    });
    const id=location.pathname.startsWith('/product/')?location.pathname.split('/').pop():null;
    const item=catalog[id];
    if(item){
      const image=document.querySelector('[class*="_mainImage_5zv75_"]');
      if(image){
        if(!image.dataset.catalogCutout){image.dataset.catalogCutout='true';image.src='/assets/'+item.image;image.classList.add('cutout-product');image.parentElement.classList.add('cutout-gallery');image.parentElement.style.setProperty('--product-tint',item.tint);}
        addPour(image.parentElement,id,innerWidth<=650?22:30);
      }
    }
    document.querySelectorAll('.craving-treat').forEach(link=>{
      const id=link.getAttribute('href').split('/').pop();addPour(link,id);
    });
  };
})();
