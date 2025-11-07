(function(){
  const qs=s=>document.querySelector(s);
  const qsa=s=>Array.from(document.querySelectorAll(s));

  // Mobile menu
  const body=document.body;
  const openBtn=qs('[data-menu-open]');
  const closeBtn=qs('[data-menu-close]');
  const overlay=qs('.mobile-overlay');
  const sheet=qs('.mobile-sheet');
  function open(){body.classList.add('mobile-open')}
  function close(){body.classList.remove('mobile-open')}
  openBtn&&openBtn.addEventListener('click',open);
  closeBtn&&closeBtn.addEventListener('click',close);
  overlay&&overlay.addEventListener('click',close);
  window.addEventListener('keydown',e=>{if(e.key==='Escape') close()});
  window.addEventListener('resize',()=>{if(window.innerWidth>767) close()});

  // Scroll reveal
  const io=new IntersectionObserver((ents)=>{
    ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');io.unobserve(e.target)}})
  },{threshold:.15});
  qsa('.animate-on-scroll').forEach(el=>io.observe(el));

  // Smooth anchors
  qsa('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href').slice(1);const el=document.getElementById(id);if(!el) return;
    e.preventDefault();el.scrollIntoView({behavior:'smooth'});
  }));

  // Header include
  function initHeaderBehavior(){
    const hamburgerBtn=qs('#mobile-menu-btn');
    const mobileMenu=qs('#mobile-menu');
    const mobileMenuOverlay=qs('#mobile-menu-overlay');
    const mobileMenuClose=qs('#mobile-menu-close');
    const servicesToggle=qs('#services-toggle');
    const servicesList=qs('#services-list');
    const body=document.body;

    if(hamburgerBtn&&mobileMenu&&mobileMenuOverlay){
      function open(){mobileMenu.classList.add('open');mobileMenuOverlay.classList.add('show');body.classList.add('menu-open');hamburgerBtn.setAttribute('aria-expanded','true');mobileMenu.setAttribute('aria-hidden','false')}
      function close(){mobileMenu.classList.remove('open');mobileMenuOverlay.classList.remove('show');body.classList.remove('menu-open');hamburgerBtn.setAttribute('aria-expanded','false');mobileMenu.setAttribute('aria-hidden','true')}
      hamburgerBtn.addEventListener('click',e=>{e.stopPropagation();open()});
      mobileMenuOverlay.addEventListener('click',close);
      mobileMenuClose&&mobileMenuClose.addEventListener('click',close);
      document.addEventListener('keydown',e=>{if(e.key==='Escape'&&mobileMenu.classList.contains('open')) close()});
      window.addEventListener('resize',()=>{if(window.innerWidth>767&&mobileMenu.classList.contains('open')) close()});
      mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setTimeout(close,100)));
    }
    if(servicesToggle&&servicesList){
      const icon=servicesToggle.querySelector('svg');
      servicesToggle.addEventListener('click',()=>{
        const open=servicesList.classList.toggle('show');
        icon&&icon.classList.toggle('rotate',open);
        servicesToggle.setAttribute('aria-expanded',open?'true':'false');
      });
    }
    // Active link highlighting
    const path=location.pathname.replace(/index\.html$/,'');
    qsa('.site-header-nav .nav-link').forEach(a=>{
      const href=a.getAttribute('href');
      if(!href) return;
      if(href===location.pathname || (href.endsWith('/services/index.html')&&path.startsWith('/services/'))){
        a.classList.add('active');
      }
    });
  }

  try{
    fetch('/header.html')
      .then(r=>r.ok?r.text():Promise.reject())
      .then(html=>{
        qsa('header.site-header, .mobile-overlay, .mobile-sheet').forEach(el=>el.remove());
        document.body.insertAdjacentHTML('afterbegin', html);
        initHeaderBehavior();
      })
      .catch(()=>{});
  }catch(_){/* noop */}

  // Footer include
  try{
    fetch('/footer.html')
      .then(r=>r.ok?r.text():Promise.reject())
      .then(html=>{
        qsa('footer.site-footer, footer.footer-minimal').forEach(el=>el.remove());
        qsa('.ribbon, .footer-ribbon').forEach(el=>el.remove());
        const wrapper=document.createElement('div');
        wrapper.innerHTML=html;
        document.body.appendChild(wrapper);
        // Initialize footer behaviour (More toggle) after injection
        (function initFooterBehavior(root){
          const scope = root || document;
          const toggle = scope.querySelector('#moreToggle');
          const content = scope.querySelector('#moreContent');
          if(toggle && content){
            toggle.addEventListener('click', function(){
              const isExpanded = this.getAttribute('aria-expanded') === 'true';
              this.setAttribute('aria-expanded', (!isExpanded).toString());
              this.classList.toggle('active');
              content.classList.toggle('expanded');
            }, { once:false });
          }
        })(wrapper);
      })
      .catch(()=>{});
  }catch(_){/* noop */}
})();
