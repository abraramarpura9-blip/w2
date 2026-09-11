(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const INV = window.INVITATION || {};
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#039;"}[m]));
  const setText=(s,v)=>{const e=$(s); if(e)e.textContent=v??"";};

  function setupContent(){
    setText("#openGroom",INV.groom||"Your Name"); setText("#openBride",INV.bride||"Your Partner");
setText("#groomName",INV.groom||""); setText("#brideName",INV.bride||"");
    setText("#introText",INV.intro||""); setText("#scratchDate",String(INV.displayDate||"").toUpperCase());
    setText("#venueName",INV.venue?.name||""); setText("#venueAddress",INV.venue?.address||""); setText("#venueNote",INV.venue?.note||"");
    setText("#guestCount",INV.guestCount??0); setText("#wishTitle",INV.wishTitle||""); setText("#wishText",INV.wishText||"");
    document.title=`${INV.groom||"Wedding"} & ${INV.bride||"Invitation"} — Royal Gold`;
    const map=$("#mapBtn"); if(map) map.href=INV.venue?.mapsUrl||"#";
    const wa=`https://wa.me/${INV.whatsappNumber||""}?text=${encodeURIComponent(INV.whatsappMessage||"")}`;
    const w=$("#whatsappBtn"), y=$("#yesBtn"); if(w)w.href=wa; if(y)y.href=wa;
    const events=$("#eventsList"); if(events) events.innerHTML=(INV.events||[]).map(e=>`<article class="event-card reveal"><div class="event-number">${esc(e.no)}</div><div><h4>${esc(e.title)}</h4><p>${esc(e.place)}</p><p>${esc(e.note)}</p></div><div class="event-time">${esc(e.time)}</div></article>`).join("");
    const gallery=$("#galleryGrid"); if(gallery) gallery.innerHTML=(INV.gallery||[]).map(g=>`<figure class="gallery-item reveal"><img src="${esc(g.src)}" alt="${esc(g.caption)}" loading="lazy" onerror="this.style.display='none'"><figcaption class="gallery-caption">${esc(g.caption)}</figcaption></figure>`).join("");
  }

  function setupOpening(){
    const btn=$("#openBtn"), opening=$("#opening"); if(!btn||!opening)return;
    btn.addEventListener("click",()=>{
      opening.classList.add("closing");
      document.body.classList.add("invitation-open");
      setTimeout(()=>{ opening.style.display="none"; initReveals(); tryPlayMusic(); },850);
    });
  }

  function setupCountdown(){
    const target=new Date(INV.weddingDate||Date.now()).getTime();
    const tick=()=>{let diff=target-Date.now(); if(!Number.isFinite(diff)||diff<0)diff=0; const s=Math.floor(diff/1000);
      setText("#days",String(Math.floor(s/86400)).padStart(2,"0")); setText("#hours",String(Math.floor(s%86400/3600)).padStart(2,"0"));
      setText("#minutes",String(Math.floor(s%3600/60)).padStart(2,"0")); setText("#seconds",String(s%60).padStart(2,"0"));};
    tick(); setInterval(tick,1000);
  }

  function setupScratch(){
    const canvas=$("#scratchCanvas"); if(!canvas)return; const ctx=canvas.getContext("2d"); let drawing=false,revealed=false,last=0;
    function cover(){const g=ctx.createLinearGradient(0,0,canvas.width,canvas.height);g.addColorStop(0,"#a87527");g.addColorStop(.5,"#e1bd70");g.addColorStop(1,"#9a6824");ctx.globalCompositeOperation="source-over";ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#251707";ctx.textAlign="center";ctx.font="700 24px Inter";ctx.fillText("SCRATCH THE ROYAL SEAL",canvas.width/2,canvas.height/2-8);ctx.font="18px Inter";ctx.fillText("✦  REVEAL  ✦",canvas.width/2,canvas.height/2+30)}
    cover();
    const pos=e=>{const r=canvas.getBoundingClientRect(),t=e.touches?.[0]||e;return{x:(t.clientX-r.left)*canvas.width/r.width,y:(t.clientY-r.top)*canvas.height/r.height}};
    const scratch=e=>{if(!drawing)return;e.preventDefault();const p=pos(e);ctx.globalCompositeOperation="destination-out";ctx.beginPath();ctx.arc(p.x,p.y,34,0,Math.PI*2);ctx.fill();if(Date.now()-last>500){last=Date.now();try{const d=ctx.getImageData(0,0,canvas.width,canvas.height).data;let c=0;for(let i=3;i<d.length;i+=40)if(d[i]<40)c++;if(c/(d.length/40)>.5&&!revealed){revealed=true;setText("#scratchHint","✨ Revealed! Save the date.")}}catch{}}};
    canvas.addEventListener("mousedown",()=>drawing=true);canvas.addEventListener("mousemove",scratch);canvas.addEventListener("mouseup",()=>drawing=false);canvas.addEventListener("mouseleave",()=>drawing=false);
    canvas.addEventListener("touchstart",()=>drawing=true,{passive:true});canvas.addEventListener("touchmove",scratch,{passive:false});canvas.addEventListener("touchend",()=>drawing=false);
  }

  function startPetals(){const c=$("#petals");if(!c)return;const make=()=>{const p=document.createElement("span");p.className="petal";p.style.left=Math.random()*100+"%";p.style.setProperty("--drift",((Math.random()-.5)*180)+"px");p.style.animationDuration=(7+Math.random()*8)+"s";p.style.animationDelay=(Math.random()*1.5)+"s";p.style.transform=`rotate(${Math.random()*360}deg) scale(${.65+Math.random()*.9})`;c.appendChild(p);setTimeout(()=>p.remove(),17000)};for(let i=0;i<15;i++)setTimeout(make,i*180);setInterval(make,850)}
  function initReveals(){const items=document.querySelectorAll(".reveal");if(!("IntersectionObserver"in window)){items.forEach(x=>x.classList.add("visible"));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12});items.forEach(x=>io.observe(x))}
  function setupMusic(){
    const a=$("#bgMusic"), b=$("#musicBtn");
    if(INV.musicUrl){ a.src=INV.musicUrl; b.title="Play / Pause wedding music"; }
    else { b.title="Add your song in assets/wedding-song.mp3"; }
    b.addEventListener("click",()=>{
      if(!a.src)return;
      if(a.paused)a.play().then(()=>b.classList.add("playing")).catch(()=>{});
      else{a.pause();b.classList.remove("playing");}
    });
  }
  function tryPlayMusic(){const a=$("#bgMusic");if(a.src)a.play().then(()=>$("#musicBtn").classList.add("playing")).catch(()=>{})}

  window.addEventListener("load",()=>{setupContent();setupOpening();setupCountdown();setupScratch();setupMusic();startPetals();setTimeout(()=>$("#loader")?.classList.add("hide"),900);initReveals()});
})();
