(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const treats = [
    {id:'cookie-chocolate-chunk',name:'Chocolate Chunk Cookie',short:'Chocolate chunk',type:'The cookie collection',price:149,image:'cookie.png',tint:'#f8f4ed',note:'Crisp edges. Soft centre. Chocolate in every bite.'},
    {id:'cookie-biscoff-stuffed',name:'Biscoff Stuffed Cookie',short:'Biscoff bliss',type:'The cookie collection',price:179,image:'biscoff.png',tint:'#f0e3cf',note:'Brown butter, a golden crumb, a molten Biscoff heart.'},
    {id:'cheesecake-classic-ny',name:'Classic New York Cheesecake',short:'A little New York',type:'The cheesecake collection',price:249,image:'cheesecake.png',tint:'#f0e9e0',note:'Slow-baked, silky smooth, and worth a little pause.'},
    {id:'mugcake-chocolate-fudge',name:'Chocolate Fudge Mug Cake',short:'Chocolate comfort',type:'The mug cake collection',price:179,image:'mugcake.png',tint:'#e8dcd3',note:'Warm, rich chocolate. Your happy place in a mug.'},
  ];
  const mod = n => ((n % treats.length) + treats.length) % treats.length;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  // Analytic critically damped spring: the feel is identical at 60/120 Hz.
  function spring(state, goal, frequency, dt) {
    const offset = state.value - goal;
    const impulse = (state.velocity + frequency * offset) * dt;
    const decay = Math.exp(-frequency * dt);
    state.value = goal + (offset + impulse) * decay;
    state.velocity = (state.velocity - frequency * impulse) * decay;
  }
  let opening = false;

  function navigate(href) {
    const link = [...document.querySelectorAll('#root a[href]')].find(a => !a.closest('.motion-home') && a.getAttribute('href') === href);
    if (link) link.click(); else location.assign(href);
  }

  window.enhanceCrumbsProduct = () => {
    const treat = treats.find(t => location.pathname === '/product/' + t.id);
    if (!treat) return;
    const image = document.querySelector('[class*="_mainImage_5zv75_"]');
    const page = document.querySelector('[class*="_productPage_5zv75_"]');
    if (!image || !page || image.dataset.cutout) return;
    image.dataset.cutout = 'true';
    image.src = '/assets/' + treat.image;
    image.classList.add('cutout-product');
    image.parentElement.classList.add('cutout-gallery');
    image.parentElement.style.setProperty('--product-tint', treat.tint);
    const back = document.createElement('a');
    back.href = '/'; back.className = 'back-to-cravings'; back.textContent = 'Back to your cravings';
    page.prepend(back);
    back.addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      e.preventDefault();
      sessionStorage.setItem('crumbs-active-treat',String(treats.indexOf(treat)));
      openTreat(treat,image,'/');
    });
  };

  function contentBox(image) {
    const box=image.getBoundingClientRect(), css=getComputedStyle(image);
    const left=parseFloat(css.paddingLeft)||0, top=parseFloat(css.paddingTop)||0;
    return {left:box.left+left,top:box.top+top,width:box.width-left-(parseFloat(css.paddingRight)||0),height:box.height-top-(parseFloat(css.paddingBottom)||0)};
  }

  async function openTreat(treat, source, href='/product/'+treat.id) {
    if (opening) return;
    opening = true;
    if (reduced.matches || !source) { navigate(href); opening = false; return; }
    const link=source.closest('.craving-treat'), bounds=source.getBoundingClientRect();
    let origin, startTransform='none';
    let model;
    if(link) {
      const stage=link.parentElement.getBoundingClientRect();
      origin={left:stage.left+link.offsetLeft,top:stage.top+link.offsetTop,width:link.offsetWidth,height:link.offsetHeight};
      startTransform=getComputedStyle(link).transform;
      model=link.querySelector('.treat-model').cloneNode(true);
    } else {
      origin=contentBox(source);
      model=document.createElement('span');model.className='treat-model';
      const picture=document.createElement('img');picture.src=source.src;picture.alt='';model.append(picture);
    }
    const curtain = document.createElement('div');
    curtain.className = 'treat-transition';
    curtain.setAttribute('aria-hidden','true');
    const surface=document.createElement('div');surface.className='flight-curtain';surface.style.background=treat.tint;
    const ghost=document.createElement('div');ghost.className='flight-product';ghost.append(model);
    Object.assign(ghost.style,{left:origin.left+'px',top:origin.top+'px',width:origin.width+'px',height:origin.height+'px',transform:startTransform});
    curtain.append(surface,ghost);document.body.append(curtain);
    document.documentElement.classList.add('treat-is-opening');
    const hiddenSource=link?.querySelector('.treat-model')||source;
    hiddenSource.style.visibility='hidden';
    const point=`${bounds.left+bounds.width/2}px ${bounds.top+bounds.height/2}px`;
    surface.animate([{clipPath:`circle(20px at ${point})`},{clipPath:`circle(${Math.hypot(innerWidth,innerHeight)}px at ${point})`}],{duration:600,easing:'cubic-bezier(.22,.8,.25,1)',fill:'forwards'});
    const liftTransform=`translate3d(${innerWidth/2-origin.left-origin.width/2}px,${innerHeight*.46-origin.top-origin.height/2}px,0) rotate(-6deg) scale(${Math.min(innerWidth*.86,620)/Math.min(origin.width,origin.height)})`;
    const lift=ghost.animate([{transform:startTransform},{transform:liftTransform}],{duration:420,easing:'cubic-bezier(.22,.7,.25,1)',fill:'forwards'});
    const modelStart=getComputedStyle(model).transform;
    model.animate([{transform:modelStart},{transform:'perspective(900px) rotateX(0deg) rotateY(-12deg) rotateZ(-8deg)'},{transform:'perspective(900px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)'}],{duration:1080,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
    document.querySelectorAll('.craving-headline,.craving-caption,.craving-actions,.craving-top').forEach((node,i)=>node.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:`translateY(${-20-i*6}px)`}],{duration:250,fill:'forwards'}));
    let destination;
    try {
      await delay(300);
      navigate(href); window.scrollTo({top:0,behavior:'instant'});
      for(let n=0;n<60;n++) {
        window.enhanceCrumbsProduct();
        destination = href==='/'?document.querySelector(`.craving-treat[data-treat="${treats.indexOf(treat)}"] .treat-front`):document.querySelector('.cutout-product');
        if (location.pathname === href && destination) {destination.style.visibility='hidden';break;}
        await delay(20);
      }
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      await lift.finished;
      if (destination) {
        await Promise.race([destination.decode().catch(()=>{}),delay(1000)]);
        const end=contentBox(destination);
        const scale=Math.min(end.width,end.height)/Math.min(origin.width,origin.height);
        const endTransform=`translate3d(${end.left+end.width/2-origin.left-origin.width/2}px,${end.top+end.height/2-origin.top-origin.height/2}px,0) scale(${scale})`;
        const flight=ghost.animate([{transform:liftTransform},{transform:endTransform}],{duration:760,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
        surface.animate([{opacity:1},{opacity:0}],{duration:520,delay:120,fill:'forwards'});
        const content=href==='/'?document.querySelectorAll('.craving-headline,.craving-caption,.craving-actions,.craving-top'):document.querySelectorAll('[class*="_details_5zv75_"] > *, .back-to-cravings');
        content.forEach((node,i)=>node.animate([{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0)'}],{duration:680,delay:100+Math.min(i,5)*65,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}));
        await flight.finished;
      }
    } finally {
      hiddenSource.style.visibility='';if(destination)destination.style.visibility='';
      curtain.remove();document.documentElement.classList.remove('treat-is-opening');opening=false;
    }
  }

  window.buildCrumbsHero = originalHero => {
    const section = document.createElement('section');
    section.className = 'motion-home';
    section.innerHTML = `
      <section class="craving-hero" aria-label="Explore the Crumbs and Co bakery">
        <div class="craving-top"><p>SMALL BATCHES. BIG FEELINGS.</p><a href="/shop">Explore the bakery</a></div>
        <h1 class="craving-headline">Love at <em>first bite.</em></h1>
        <div class="craving-orbit" aria-hidden="true"></div>
        <span class="craving-spark spark-left" aria-hidden="true">✳</span><span class="craving-spark spark-right" aria-hidden="true">✳</span>
        <div class="craving-stage" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Bakery products. Drag, swipe, or use left and right arrow keys. Click a product to open it.">
          ${treats.map((t,i)=>`<a class="craving-treat" href="/product/${t.id}" data-treat="${i}" aria-label="Open ${t.name}"><span class="treat-model" style="--cutout:url('/assets/${t.image}')"><img class="treat-depth" src="/assets/${t.image}" alt="" aria-hidden="true" draggable="false"><img class="treat-front" src="/assets/${t.image}" alt="${t.name}" width="1024" height="1024" draggable="false" ${i===0?'fetchpriority="high"':''}><span class="treat-glint" aria-hidden="true"></span></span><span class="treat-open-label">Take a closer look</span></a>`).join('')}
        </div>
        <div class="craving-caption" aria-live="polite" aria-atomic="true"><p class="craving-category"></p><h2 class="craving-name"></h2><p class="craving-note"></p></div>
        <div class="craving-actions"><a class="craving-discover bakery-button" href="/product/${treats[0].id}">Discover this treat <span>₹149</span></a><button class="craving-add" type="button">Add to box</button></div>
        <div class="craving-bottom"><p><span class="drag-symbol" aria-hidden="true">↔</span> Drag to explore <span class="desktop-hint">· move over a treat to roll it</span></p><div class="craving-pagination" aria-label="Choose a treat">${treats.map((t,i)=>`<button type="button" aria-label="Show ${t.name}" aria-pressed="${i===0}" data-slide="${i}"><span></span></button>`).join('')}</div><a href="#bestsellers">More sweet things below</a></div>
        <div class="craving-cursor" aria-hidden="true"><span>Open<br>treat</span></div>
      </section>
      <div class="bakery-marquee" aria-hidden="true"><div>SMALL BATCHES <i>✳</i> BIG FEELINGS <i>✳</i> FRESHLY BAKED <i>✳</i> SMALL BATCHES <i>✳</i> BIG FEELINGS <i>✳</i> FRESHLY BAKED <i>✳</i></div></div>`;
    originalHero.before(section); originalHero.classList.add('original-hero-hidden');
    const hero=section.querySelector('.craving-hero'), stage=section.querySelector('.craving-stage');
    const links=[...section.querySelectorAll('.craving-treat')];
    const images=links.map(a=>a.querySelector('.treat-front'));
    const models=links.map(a=>a.querySelector('.treat-model'));
    const glints=links.map(a=>a.querySelector('.treat-glint'));
    const rotations=models.map(()=>({x:{value:0,velocity:0},y:{value:0,velocity:0},z:{value:0,velocity:0},tx:0,ty:0,tz:0}));
    const dots=[...section.querySelectorAll('[data-slide]')];
    const cursor=section.querySelector('.craving-cursor');
    const saved=Number(sessionStorage.getItem('crumbs-active-treat') || 0);
    let target=Number.isFinite(saved)?saved:0, position=target, lastIndex=-1;
    const glide={value:position,velocity:0};
    let frame, previousTime=0, active=true, down=false, moved=false, startX=0, startY=0, dragOrigin=0;
    let velocity=0, lastX=0, lastMoveTime=0, suppressClickUntil=0, wheelTimer;
    let hovered=-1, grabbed=-1, dragRoll=0, hasRendered=false;
    let captionAnimation;
    const cursorText=cursor.querySelector('span');let lastCursorText='';
    const spacing=()=>innerWidth<=650?Math.min(innerWidth*.62,280):Math.min(innerWidth*.36,550);
    const setTarget=value=> {target=value;};
    const nearest=index=>target+(mod(index-Math.round(target)+2)-2);
    const select=index=>setTarget(nearest(index));
    const onVisibility=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;},{rootMargin:'100px'});
    onVisibility.observe(hero);
    dots.forEach((dot,i)=>dot.onclick=()=>select(i));
    links.forEach((link,i)=>link.addEventListener('focus',()=>select(i)));
    const cursorMove=event=> {
      const hit=event.target.closest('.craving-treat');
      if(!down) {
        hovered=hit?Number(hit.dataset.treat):-1;
        rotations.forEach((r,i)=>{if(i!==hovered){r.tx=0;r.ty=0;r.tz=0;}});
        if(hovered>=0) {
          const rect=hit.getBoundingClientRect();
          const x=clamp((event.clientX-rect.left)/rect.width-.5,-.5,.5);
          const y=clamp((event.clientY-rect.top)/rect.height-.5,-.5,.5);
          rotations[hovered].tx=-y*48;rotations[hovered].ty=x*66;rotations[hovered].tz=x*38-y*10;
        }
      }
      if(event.pointerType==='mouse') {
        cursor.style.left=event.clientX+'px';cursor.style.top=event.clientY+'px';
        cursor.classList.add('visible');
        const label=down?'Roll &<br>explore':hit?'Roll · click<br>to open':'Drag<br>to explore';
        if(label!==lastCursorText){cursorText.innerHTML=label;lastCursorText=label;}
      }
    };
    stage.addEventListener('pointerdown',event=>{
      if(event.button!==0) return;
      down=true;moved=false;startX=lastX=event.clientX;startY=event.clientY;dragOrigin=target;velocity=0;lastMoveTime=performance.now();
      const hit=event.target.closest('.craving-treat');grabbed=hit?Number(hit.dataset.treat):-1;
      dragRoll=grabbed>=0?rotations[grabbed].z.value:0;
      stage.classList.add('is-dragging');
    });
    stage.addEventListener('pointermove',event=>{
      cursorMove(event);
      if(!down)return;
      const dx=event.clientX-startX,dy=event.clientY-startY;
      if(!moved && Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>12 && event.pointerType==='touch') {down=false;stage.classList.remove('is-dragging');return;}
      if(Math.hypot(dx,dy)>8) {
        moved=true;
        if(!stage.hasPointerCapture(event.pointerId))stage.setPointerCapture(event.pointerId);
        const now=performance.now();const instant=(event.clientX-lastX)/Math.max(now-lastMoveTime,4);
        velocity=velocity*.55+instant*.45;
        lastX=event.clientX;lastMoveTime=now;
        setTarget(dragOrigin-dx/spacing());
        if(grabbed>=0){rotations[grabbed].tz=dragRoll+dx/spacing()*145;rotations[grabbed].ty=clamp(dx*.13,-38,38);rotations[grabbed].tx=clamp(-dy*.22,-30,30);}
      }
    });
    const release=()=>{
      if(!down)return;
      down=false;stage.classList.remove('is-dragging');
      if(moved) {
        const momentum=performance.now()-lastMoveTime<100?clamp(-velocity*.18,-1,1):0;
        target=Math.round(target+momentum);suppressClickUntil=performance.now()+350;
      }
      rotations.forEach(r=>{r.tx=0;r.ty=0;r.tz=0;});grabbed=-1;
    };
    stage.addEventListener('pointerup',release);
    stage.addEventListener('pointercancel',()=>{release();target=Math.round(target);rotations.forEach(r=>{r.tx=r.ty=r.tz=0;});suppressClickUntil=performance.now()+350;});
    // Touch starts with implicit capture on the product link. Ignore its
    // release while transferring capture to the carousel during a swipe.
    stage.addEventListener('lostpointercapture',event=>{if(event.target===stage)release();});
    stage.addEventListener('pointerleave',()=>{hovered=-1;if(!down)rotations.forEach(r=>{r.tx=r.ty=r.tz=0;});cursor.classList.remove('visible');if(!moved)release();});
    stage.addEventListener('dragstart',event=>event.preventDefault());
    stage.addEventListener('click',event=>{
      const link=event.target.closest('.craving-treat');
      if(performance.now()<suppressClickUntil){event.preventDefault();event.stopPropagation();return;}
      if(!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)return;
      event.preventDefault();event.stopPropagation();
      const index=Number(link.dataset.treat);sessionStorage.setItem('crumbs-active-treat',String(index));
      openTreat(treats[index],images[index]);
    });
    stage.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight') {
        event.preventDefault();target=Math.round(target)+(event.key==='ArrowRight'?1:-1);
      }
    });
    stage.addEventListener('wheel',event=>{
      const horizontal=event.shiftKey?event.deltaY:event.deltaX;
      if(!horizontal || (!event.shiftKey&&Math.abs(event.deltaY)>Math.abs(event.deltaX)))return;
      event.preventDefault();target+=horizontal/spacing();
      clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{target=Math.round(target)},140);
    },{passive:false});
    section.querySelector('.craving-discover').addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey)return;
      event.preventDefault();event.stopPropagation();const index=mod(Math.round(target));
      sessionStorage.setItem('crumbs-active-treat',String(index));openTreat(treats[index],images[index]);
    });
    const add=section.querySelector('.craving-add');let addTimer;
    add.addEventListener('click',()=>{
      const treat=treats[mod(Math.round(target))];
      const card=[...document.querySelectorAll('#root a[href]')].find(a=>!a.closest('.motion-home')&&a.getAttribute('href')==='/product/'+treat.id);
      const button=card?.querySelector('[class*="_quickAddBtn_"], [class*="_qtyBtn_"]:last-child');
      if(button){button.click();add.textContent='Added to your box';clearTimeout(addTimer);addTimer=setTimeout(()=>add.textContent='Add to box',1500);}
      else openTreat(treat,images[mod(Math.round(target))]);
    });
    function updateCaption(index) {
      const t=treats[index];hero.style.setProperty('--craving-tint',t.tint);
      section.querySelector('.craving-category').textContent=t.type;
      section.querySelector('.craving-name').textContent=t.short;
      section.querySelector('.craving-note').textContent=t.note;
      const discover=section.querySelector('.craving-discover');discover.href='/product/'+t.id;discover.innerHTML=`Discover this treat <span>₹${t.price}</span>`;
      dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));
      links.forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');});
      sessionStorage.setItem('crumbs-active-treat',String(index));
      if(!reduced.matches){captionAnimation?.cancel();captionAnimation=section.querySelector('.craving-caption').animate([{opacity:.15,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});}
    }
    function animate(time) {
      const dt=Math.min((time-previousTime)||16,40)/1000;previousTime=time;
      if(active&&!document.hidden&&(!opening||!hasRendered)) {
        hasRendered=true;
        if(reduced.matches){glide.value=target;glide.velocity=0;}else spring(glide,target,down?30:12,dt);
        position=glide.value;
        links.forEach((link,i)=>{
          const distance=mod(i-position+2)-2;
          const scale=1-Math.min(Math.abs(distance)*.23,.5);
          const lift=reduced.matches?0:Math.sin(time/1900+i)*4;
          link.style.transform=`translate(-50%,-50%) translate3d(${distance*spacing()}px,${Math.pow(Math.abs(distance),1.4)*48+lift}px,0) rotate(${reduced.matches?0:distance*-10-glide.velocity*1.8}deg) scale(${scale})`;
          link.style.opacity=String((1-Math.abs(distance)*.28)*clamp((1.95-Math.abs(distance))/.4,0,1));
          link.style.pointerEvents=Math.abs(distance)>1.85?'none':'';
          link.style.zIndex=String(10-Math.round(Math.abs(distance)*3));
          const r=rotations[i];
          spring(r.x,r.tx,14,dt);spring(r.y,r.ty,14,dt);spring(r.z,r.tz,down?18:10,dt);
          models[i].style.transform=reduced.matches?'none':`perspective(900px) rotateX(${r.x.value}deg) rotateY(${r.y.value}deg) rotateZ(${r.z.value-glide.velocity*3}deg)`;
          glints[i].style.opacity=String(.08+Math.abs(r.y.value)*.003);
        });
        const index=mod(Math.round(position));if(index!==lastIndex){lastIndex=index;updateCaption(index);}
      }
      frame=requestAnimationFrame(animate);
    }
    frame=requestAnimationFrame(animate);
    return()=>{cancelAnimationFrame(frame);clearTimeout(wheelTimer);clearTimeout(addTimer);onVisibility.disconnect();section.remove();};
  };
})();
