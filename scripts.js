document.addEventListener('DOMContentLoaded',()=>{
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  if(navToggle){
    navToggle.setAttribute('aria-expanded','false');
    navToggle.addEventListener('click',()=>{
      const isOpen = mainNav.style.display==='block' || mainNav.style.display==='flex';
      if(isOpen){ mainNav.style.display=''; navToggle.setAttribute('aria-expanded','false') }
      else { mainNav.style.display='block'; navToggle.setAttribute('aria-expanded','true') }
    })
  }

  // Close mobile nav when resizing to desktop
  window.addEventListener('resize',()=>{
    if(window.innerWidth>800 && mainNav){ mainNav.style.display=''; navToggle && navToggle.setAttribute('aria-expanded','false') }
  })

  // Form handling (fake submit) — replace with server endpoint if available
  const form = document.getElementById('contactForm');
  const msg = document.getElementById('formMessage');
  form && form.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const params = {};
    for(const [k,v] of data.entries()) params[k]=v;

    // Try EmailJS (client-side) — configure your IDs in README
    try{
      if(window.emailjs && emailjs.send){
        // Replace the service ID, template ID and public key in README and below
        const SERVICE_ID = 'YOUR_SERVICE_ID';
        const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
        const PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
        // init if not already
        if(!emailjs._userID && PUBLIC_KEY && PUBLIC_KEY!=='YOUR_PUBLIC_KEY'){
          emailjs.init(PUBLIC_KEY);
        }
        await emailjs.send(SERVICE_ID,TEMPLATE_ID,params);
        msg.style.color='green';
        msg.textContent = `Thanks ${params.name||'there'} — we received your request.`;
        form.reset();
        return;
      }
    }catch(err){
      console.warn('EmailJS send failed',err);
    }

    // Fallback: open mail client with prefilled mailto
    const subject = encodeURIComponent('Booking request from The GeoLuxe');
    const body = encodeURIComponent(Object.entries(params).map(([k,v])=>`${k}: ${v}`).join('\n'));
    const mailTo = `mailto:molinemurapa85@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailTo;
  })

  // footer year
  const y = document.getElementById('year');
  if(y) y.textContent = new Date().getFullYear();
  
  // Lightbox functionality
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  // gallery image behavior: click opens lightbox, hover updates preview (desktop)
  const galleryImgs = Array.from(document.querySelectorAll('.gallery-grid img'));
  // Prevent caption clicks from triggering the lightbox open
  const galleryCaptions = Array.from(document.querySelectorAll('.gallery-grid figure .caption'));
  galleryCaptions.forEach(cap=>{
    const stop = (e)=>{ try{ e.preventDefault(); e.stopPropagation(); }catch(err){} };
    cap.addEventListener('click', stop);
    cap.addEventListener('pointerup', stop);
    try{ cap.addEventListener('touchend', stop, {passive:false}); }catch(e){}
  })
  // scroll lock helpers to prevent background scrolling while lightbox open
  let _scrollPos = 0;
  function lockScroll(){
    _scrollPos = window.scrollY || document.documentElement.scrollTop || 0;
    document.documentElement.style.scrollBehavior = 'auto';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${_scrollPos}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }
  function unlockScroll(){
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    try{ window.scrollTo(0, _scrollPos || 0) }catch(e){}
    _scrollPos = 0;
    document.documentElement.style.scrollBehavior = '';
  }

  // centralized open/close so close always does the same thing
  function openLightboxFor(imgEl){
    if(!lightbox || !lightboxImg) return;
    lightboxImg.src = imgEl.getAttribute('src') || imgEl.src;
    lightboxImg.alt = imgEl.alt || '';
    document.body.classList.add('lightbox-open');
    lockScroll();
    lightbox.style.display = 'flex';
    try{ history.pushState({lightboxOpen:true}, '') }catch(e){}
    if(lightboxClose && typeof lightboxClose.focus === 'function') lightboxClose.focus();
  }

  function closeLightbox(){
    if(!lightbox) return;
    // hide immediately
    lightbox.style.display = 'none';
    if(lightboxImg) lightboxImg.src = '';
    document.body.classList.remove('lightbox-open');
    unlockScroll();
    // clear any pushed history state
    try{ if(history.state && history.state.lightboxOpen){ history.replaceState(null, '', window.location.pathname + window.location.search + window.location.hash) } }catch(e){}
    // scroll to home section
    const homeEl = document.getElementById('home');
    if(homeEl){ try{ homeEl.scrollIntoView({behavior:'smooth'}) }catch(e){ window.scrollTo({top:0,behavior:'smooth'}) } }
    else { window.scrollTo({top:0,behavior:'smooth'}) }
    // restore focus
    const brand = document.querySelector('.brand'); if(brand && typeof brand.focus === 'function') brand.focus();
  }
  galleryImgs.forEach(img=>{
    img.addEventListener('click',(e)=>{ e.preventDefault(); openLightboxFor(img); })
    img.addEventListener('mouseenter',()=>{
      const previewImg = document.getElementById('galleryPreviewImg');
      const previewCaption = document.getElementById('galleryPreviewCaption');
      if(previewImg){ previewImg.src = img.src; previewImg.alt = img.alt || ''; }
      if(previewCaption) previewCaption.textContent = img.getAttribute('alt') || '';
    })
  })
  
  // Autoplay preview carousel: cycles through gallery images every 4s, pauses on hover
  let autoplayIndex = 0;
  let autoplayInterval = null;
  const previewContainer = document.getElementById('galleryPreview');
  const previewImg = document.getElementById('galleryPreviewImg');
  const previewCaption = document.getElementById('galleryPreviewCaption');

  function setPreviewFromElement(el){
    if(!el) return;
    // show the JPEG immediately, then try loading WebP and replace if available
    const src = el.getAttribute('src');
    const webp = src.replace(/\.jpe?g$/i, '.webp');
    // set jpeg immediately for instant preview
    previewImg.style.opacity = 0;
    previewImg.src = src;
    previewImg.alt = el.alt || '';
    previewCaption.textContent = el.alt || '';
    previewImg.style.opacity = 1;
    // then attempt to load webp and swap if it exists
    const testWebp = new Image();
    testWebp.onload = ()=>{ previewImg.style.opacity = 0; setTimeout(()=>{ previewImg.src = webp; previewImg.style.opacity = 1 }, 120) }
    testWebp.onerror = ()=>{/* ignore if webp not available */}
    testWebp.src = webp;
  }

  function startAutoplay(){
    if(autoplayInterval) return;
    autoplayInterval = setInterval(()=>{
      autoplayIndex = (autoplayIndex + 1) % galleryImgs.length;
      const el = galleryImgs[autoplayIndex];
      setPreviewFromElement(el);
    }, 4000);
  }

  function stopAutoplay(){
    if(autoplayInterval){ clearInterval(autoplayInterval); autoplayInterval = null }
  }

  // pause on hover over preview or gallery grid
  const galleryGrid = document.querySelector('.gallery-grid');
  [previewContainer, galleryGrid].forEach(node=>{
    if(!node) return;
    node.addEventListener('mouseenter',()=> stopAutoplay());
    node.addEventListener('mouseleave',()=> startAutoplay());
  });

  // if user hovers a thumbnail, show that immediately and pause autoplay until leave
  galleryImgs.forEach((img, idx)=>{
    img.addEventListener('mouseenter',()=>{
      autoplayIndex = idx;
      setPreviewFromElement(img);
      stopAutoplay();
    })
    img.addEventListener('mouseleave',()=>{
      // resume autoplay after a short delay
      setTimeout(()=>{ if(!autoplayInterval) startAutoplay() }, 600);
    })
  })

  // initialize preview (autoplay disabled by default)
  if(galleryImgs.length>0){ setPreviewFromElement(galleryImgs[0]); /* startAutoplay(); */ }

  /* Showcase autoplay carousel (visible under Gallery heading) */
  const showcaseImgs = galleryImgs; // reuse gallery images
  const showImg = document.getElementById('showImg');
  const showCaption = document.getElementById('showCaption');
  const btnPrev = document.getElementById('showPrev');
  const btnNext = document.getElementById('showNext');
  const btnPause = document.getElementById('showPause');
  let showIndex = 0;
  let showAuto = true;
  let showTimer = null;

  function updateShow(index){
    const el = showcaseImgs[index];
    if(!el) return;
    showImg.style.opacity = 0;
    setTimeout(()=>{ showImg.src = el.getAttribute('src'); showImg.alt = el.alt || ''; showCaption.textContent = el.alt || ''; showImg.style.opacity = 1 }, 120);
  }

  function startShowAuto(){ if(showTimer) clearInterval(showTimer); showTimer = setInterval(()=>{ showIndex = (showIndex+1) % showcaseImgs.length; updateShow(showIndex); }, 4500); btnPause.textContent = 'Pause'; showAuto=true }
  function stopShowAuto(){ if(showTimer) clearInterval(showTimer); showTimer=null; btnPause.textContent = 'Play'; showAuto=false }

  btnPrev && btnPrev.addEventListener('click',()=>{ stopShowAuto(); showIndex = (showIndex-1+showcaseImgs.length) % showcaseImgs.length; updateShow(showIndex); })
  btnNext && btnNext.addEventListener('click',()=>{ stopShowAuto(); showIndex = (showIndex+1) % showcaseImgs.length; updateShow(showIndex); })
  btnPause && btnPause.addEventListener('click',()=>{ if(showAuto) stopShowAuto(); else startShowAuto() })

  // pause on hover
  const showcaseEl = document.getElementById('galleryShowcase');
  if(showcaseEl){ showcaseEl.addEventListener('mouseenter', stopShowAuto); showcaseEl.addEventListener('mouseleave', ()=>{ if(!showTimer) startShowAuto() }) }

  // init showcase
  if(showcaseImgs.length>0){ updateShow(0); startShowAuto(); }
  // robust close handlers that call the centralized closeLightbox
  if(lightboxClose){
    lightboxClose.setAttribute('type','button');
    // robust close handlers: prevent propagation and support pointer/touch events
    const safeClose = (e)=>{
      try{ if(e){ e.preventDefault(); e.stopPropagation(); } }catch(err){}
      try{ closeLightbox(); }catch(err){}
    };
    lightboxClose.addEventListener('click', safeClose);
    lightboxClose.addEventListener('pointerup', safeClose);
    try{ lightboxClose.addEventListener('touchend', safeClose, {passive:false}); }catch(e){}
    // expose for inline fallback
    try{ window.closeLightbox = closeLightbox }catch(e){}
  }
  if(lightbox){
    lightbox.addEventListener('click',(e)=>{ if(e.target===lightbox) closeLightbox(); })
    if(lightboxImg){
      lightboxImg.addEventListener('dblclick', closeLightbox);
      let _lastTap = 0;
      lightboxImg.addEventListener('touchend', (e)=>{
        const now = Date.now();
        const delta = now - _lastTap;
        _lastTap = now;
        if(delta > 0 && delta < 400){ e.preventDefault(); closeLightbox(); }
      }, {passive:false});
    }
  }
  // ensure ESC closes
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox() })
  // popstate: close when history back is used
  window.addEventListener('popstate', (e)=>{
    if(!(history.state && history.state.lightboxOpen) && document.body.classList.contains('lightbox-open')){
      closeLightbox();
    }
  })
  // expose globally in case inline handlers or other scopes need it
  try{ window.closeLightbox = closeLightbox }catch(e){}

  // Ensure only one testimonial video plays at a time
  (function(){
    const testimonialVideos = Array.from(document.querySelectorAll('.testimonial-videos video'));
    if(testimonialVideos.length === 0) return;
    testimonialVideos.forEach((v)=>{
      v.addEventListener('play', ()=>{
        testimonialVideos.forEach((other)=>{
          if(other !== v){ try{ other.pause(); }catch(e){} }
        });
      });
    });
  })();

  // Capture-level listeners to ensure single-click on the close control
  // is caught even if other handlers stop propagation (Edge quirk fixes).
  document.addEventListener('click', function(e){
    try{
      const btn = e.target && e.target.closest && e.target.closest('#lightboxClose');
      if(btn){ e.preventDefault(); e.stopPropagation(); console.debug('lightboxClose clicked'); closeLightbox(); }
    }catch(err){}
  }, true);
  document.addEventListener('pointerup', function(e){
    try{
      const btn = e.target && e.target.closest && e.target.closest('#lightboxClose');
      if(btn){ e.preventDefault(); e.stopPropagation(); console.debug('lightboxClose pointerup'); closeLightbox(); }
    }catch(err){}
  }, true);
})
