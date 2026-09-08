(function(){
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── סרגל ותפריט ─────────────────────────────────────── */
  var bar = document.getElementById('bar');
  addEventListener('scroll', function(){ bar.classList.toggle('stuck', scrollY > 12); }, {passive:true});
  var burger = document.getElementById('burger'), menu = document.getElementById('menu');
  function setMenu(o){ menu.classList.toggle('open', o); burger.setAttribute('aria-expanded', o?'true':'false'); }
  burger.addEventListener('click', function(){ setMenu(!menu.classList.contains('open')); });
  addEventListener('keydown', function(e){ if(e.key === 'Escape') setMenu(false); });

  /* ניווט: כל עמוד הוא קובץ נפרד באתר, והניווט הוא <a href> רגיל. */
  var PAGES = {home:'p-home', tools:'p-tools', course:'p-course'};
  var current = 'home';

  function show(name, anchor, push){
    if(!PAGES[name]) name = 'home';
    Object.keys(PAGES).forEach(function(k){
      document.getElementById(PAGES[k]).hidden = (k !== name);
    });
    current = name;
    var el = document.getElementById(PAGES[name]);
    document.title = el.dataset.title || 'AI Workshops Israel';

    [].forEach.call(menu.querySelectorAll('a'), function(a){
      var on = a.dataset.page === name && !a.dataset.anchor;
      if(on) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });

    if(push){
      var h = name === 'home' ? '#/' : '#/' + name;
      if(location.hash !== h) history.pushState(null,'',h);
    }
    if(window.ScrollTrigger) ScrollTrigger.refresh();

    if(anchor){
      var t = document.getElementById(anchor);
      if(t){ t.scrollIntoView({behavior:'auto',block:'start'}); return; }
    }
    scrollTo(0,0);
  }

  document.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if(!a) return;
    setMenu(false);

    var href = a.getAttribute('href') || '';
    if(href.charAt(0) === '#' && href.length > 1){   // עוגן בתוך העמוד
      var id = href.slice(1);
      var t = document.getElementById(id);
      if(t){
        e.preventDefault();
        t.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'start'});
      }
    }
  });

  addEventListener('popstate', function(){
    var h = (location.hash || '#/').replace('#/','');
    show(h || 'home', null, false);
  });
  var initial = (location.hash || '#/').replace('#/','');
  if(initial && PAGES[initial]) show(initial, null, false);

  /* ── ההירו של עמוד הבית ──────────────────────────────── */
  var cv = document.getElementById('core');
  if (cv){
    var cx = cv.getContext('2d'), W=0,H=0,DPR=1, prog=0, shown=0;
    function size(){
      var r = cv.getBoundingClientRect();
      DPR = Math.min(devicePixelRatio||1,2); W=r.width; H=r.height;
      cv.width=W*DPR; cv.height=H*DPR; cx.setTransform(DPR,0,0,DPR,0,0);
    }
    /* שלוש טבעות = שלוש שכבות אמיתיות בארכיטקטורה של סוכן:
       המודל בפנים, הכלים באמצע, המערכות של הארגון בחוץ.
       הטבעת הרביעית היא רעש רקע בלבד. */
    var RINGS=[
      {n:3,  r:.12, sp: .22, col:'#E2563C', from:.10,
       labels:['GPT','Claude','Gemini']},
      {n:6,  r:.21, sp:-.14, col:'#6E9BFF', from:.20,
       labels:['n8n','Zapier','Copilot','Notebook','Studio','API']},
      {n:10, r:.31, sp: .09, col:'#A9C4FF', from:.42,
       labels:['CRM','Drive','Mail','ERP','Docs','Slack','DB','Sheets','Tickets','Calendar']},
      {n:14, r:.42, sp:-.05, col:'#4A5D7A'}
    ];

    /* פולסים שזורמים פנימה — הסוכן מושך מהמערכות, לא להפך */
    var PULSES = [];
    for (var pi=0; pi<14; pi++){
      PULSES.push({ring: pi%3, idx: pi, off: Math.random(), spd: .17 + Math.random()*.13});
    }

    function label(txt, x, y, cxp, a){
      if (a <= .02) return;
      cx.save();
      cx.globalAlpha = a;
      cx.font = '500 11px "Space Grotesk", ui-monospace, monospace';
      cx.textBaseline = 'middle';
      var left = x < cxp * 0.45;          // קרוב לקצה — התווית נכתבת פנימה
      cx.textAlign = left ? 'left' : 'right';
      var pad = left ? 9 : -9;
      cx.fillStyle = 'rgba(11,23,48,.72)';           // רקע קטן שמחזיק ניגודיות
      var w = cx.measureText(txt).width;
      cx.fillRect(left ? x+pad-w-4 : x+pad-4, y-8, w+8, 16);
      cx.fillStyle = '#C9D8F5';
      cx.fillText(txt, x + pad, y);
      cx.restore();
    }

    function draw(t){
      cx.clearRect(0,0,W,H);
      var small = W <= 860;
      var cxp = small ? W*.50 : W*.30;
      // הבמה גבוהה מהמסך, ולכן במובייל ממקמים לפי גובה החלון ולא לפי גובה הבמה
      var vh = innerHeight || H;
      var cyp = small ? Math.min(H*.88, vh*.76) : H*.50;
      var base = small ? Math.min(W*1.08, vh*.38) : Math.min(W,H);
      var burst = 1 + shown*(small ? .5 : .85);       // פחות "פיצוץ" כשהמקום צר

      RINGS.forEach(function(ring,ri){
        var rad = base*ring.r*burst, rot = t*ring.sp + shown*(ri%2?-1.1:1.1);

        cx.beginPath(); cx.arc(cxp,cyp,rad,0,Math.PI*2);
        cx.strokeStyle='rgba(215,228,255,'+(0.15-ri*0.022)+')'; cx.lineWidth=1; cx.stroke();

        // התוויות נחשפות בהדרגה לפי הגלילה, שכבה אחרי שכבה
        var la = ring.from == null ? 0
               : Math.max(0, Math.min(1, (shown - ring.from) / .16)) * (small && ri===2 ? 0 : 1);

        for(var i=0;i<ring.n;i++){
          var a = rot + (i/ring.n)*Math.PI*2;
          var x = cxp+Math.cos(a)*rad, y = cyp+Math.sin(a)*rad;
          var s = (ri===0?5:ri===1?3.4:2.4)*(1+shown*.25);

          cx.beginPath(); cx.moveTo(cxp,cyp); cx.lineTo(x,y);
          cx.strokeStyle='rgba(215,228,255,'+(0.11*(1-shown*.55))+')'; cx.lineWidth=1.2; cx.stroke();

          cx.beginPath(); cx.arc(x,y,s,0,Math.PI*2);
          cx.fillStyle=ring.col; cx.globalAlpha = ri===3?0.55:1; cx.fill(); cx.globalAlpha=1;

          // התוויות מצוירות רק בחצי הפנוי של הבמה; מימין יושב הטקסט
          var room = small ? x < W*0.92 : x < W*0.50;
          if (ring.labels && room) label(ring.labels[i], x, y, cxp, la * .95);
        }
      });

      // פולסים על הקווים, מהצומת אל הליבה
      PULSES.forEach(function(p){
        var ring = RINGS[p.ring], rad = base*ring.r*burst;
        var rot = t*ring.sp + shown*(p.ring%2?-1.1:1.1);
        var a = rot + ((p.idx % ring.n)/ring.n)*Math.PI*2;
        var k = 1 - ((t*p.spd + p.off) % 1);            // 1 = בצומת, 0 = בליבה
        var x = cxp + Math.cos(a)*rad*k, y = cyp + Math.sin(a)*rad*k;
        cx.beginPath(); cx.arc(x, y, 1.9, 0, Math.PI*2);
        cx.fillStyle = ring.col;
        cx.globalAlpha = Math.sin(k*Math.PI) * .75;      // דוהה בשני הקצוות
        cx.fill(); cx.globalAlpha = 1;
      });

      // הליבה — הסוכן עצמו
      var cr = base*.035*(1+shown*.2);
      var gr = cx.createRadialGradient(cxp,cyp,0,cxp,cyp,cr*3);
      gr.addColorStop(0,'rgba(226,86,60,.5)'); gr.addColorStop(1,'rgba(226,86,60,0)');
      cx.fillStyle=gr; cx.beginPath(); cx.arc(cxp,cyp,cr*3,0,Math.PI*2); cx.fill();
      cx.beginPath(); cx.arc(cxp,cyp,cr,0,Math.PI*2); cx.fillStyle='#EAF1FF'; cx.fill();
      if (shown > .12){
        cx.save();
        cx.globalAlpha = Math.min(1,(shown-.12)/.14);
        cx.font='700 10px "Space Grotesk", ui-monospace, monospace';
        cx.textAlign='center'; cx.fillStyle='#C9D8F5';
        cx.letterSpacing = '.14em';
        cx.fillText('AGENT', cxp, cyp + cr + 18);
        cx.restore();
      }
    }
    size();
    addEventListener('resize', function(){ size(); draw(performance.now()/1000); });
    if(reduce){ shown=.45; draw(0); }
    else (function loop(now){ shown += (prog-shown)*.08; draw(now/1000); requestAnimationFrame(loop); })(performance.now());

    var folds = [].slice.call(document.querySelectorAll('.fold'));
    var pips  = [].slice.call(document.querySelectorAll('#rail i'));
    function setFold(n){
      folds.forEach(function(f,i){ f.classList.toggle('on', i===n); });
      pips.forEach(function(p,i){ p.classList.toggle('on', i===n); });
    }
    if(!reduce && window.gsap && window.ScrollTrigger){
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger:'#journey', start:'top top', end:'+=' + (folds.length*135) + '%',
        pin:'#stage', scrub:true,
        onUpdate:function(self){
          prog = self.progress;
          setFold(self.progress < .5 ? 0 : 1);
        }
      });
      gsap.utils.toArray('.band .wrap > *, .cell, .step, .quote, .tool, .syl__item, .facts div, .next a')
        .forEach(function(el){
          gsap.from(el,{opacity:0,y:22,duration:.6,ease:'power2.out',
            scrollTrigger:{trigger:el,start:'top 90%',once:true}});
        });
    } else {
      folds.forEach(function(f){ f.classList.add('on'); });
    }
  }

  /* ── גלריה ───────────────────────────────────────────── */
  var gal = document.getElementById('gal'), lb = document.getElementById('lb');
  if(gal && lb && lb.showModal){
    var lbimg = document.getElementById('lbimg'), lbcap = document.getElementById('lbcap');
    gal.addEventListener('click', function(e){
      var fig = e.target.closest('figure[data-zoom]');
      var img = fig && fig.querySelector('img');
      if(!img) return;
      lbimg.src = img.currentSrc || img.src;
      lbimg.alt = img.alt || '';
      lbcap.textContent = fig.dataset.cap || img.alt || '';
      lb.showModal();
    });
    document.getElementById('lbx').addEventListener('click', function(){ lb.close(); });
    lb.addEventListener('click', function(e){ if(e.target === lb) lb.close(); });
  }

  /* ── מונים ───────────────────────────────────────────── */
  var counted = false, tally = document.querySelector('.tally');
  if(tally){
    new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting || counted || reduce) return;
        counted = true;
        [].forEach.call(document.querySelectorAll('.tally b'), function(b){
          var end = parseFloat(b.textContent.replace(/[,+]/g,''));
          var t0 = performance.now();
          (function tick(now){
            var k = Math.min(1,(now-t0)/1000), v = end*(1-Math.pow(1-k,3));
            b.textContent = Math.round(v).toLocaleString('he-IL') + (k>=1 ? '+' : '');
            if(k<1) requestAnimationFrame(tick);
          })(t0);
        });
      });
    },{threshold:.4}).observe(tally);
  }
})();