(() => {
  "use strict";
  const REQUIRED_TRAILS = 4;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
  const visuals = [
    { ribbon: "red", icon: "landmark" }, { ribbon: "blue", icon: "coins" },
    { ribbon: "purple", icon: "chart-line" }, { ribbon: "green", icon: "magnifying-glass-chart" }
  ];
  let medals = [], currentUser = null, dashboard = { stars:0, possible:0, completed:0, trails:0, unlocked:0, certificates:0 };
  const finishLoading = () => { document.body.classList.remove("loading-server"); $("#serverLoading")?.remove(); };
  const shortName = (v) => String(v || "Trilha").replace(" Pública", "").replace(" e Controle Social", "").slice(0, 22);
  const dateShort = (v) => { const d = new Date(v || ""); return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR"); };

  function groups(rows) {
    const map = new Map();
    [...(rows || [])].sort((a,b) => Number(a.sectionOrder||0)-Number(b.sectionOrder||0) || Number(a.phaseOrder||0)-Number(b.phaseOrder||0)).forEach(row => {
      const key = row.sectionSlug || `secao-${row.gameSectionId}`;
      if (!map.has(key)) map.set(key, { slug:key, title:row.sectionTitle||key, order:Number(row.sectionOrder||map.size+1), phases:[] });
      map.get(key).phases.push(row);
    });
    return [...map.values()].sort((a,b)=>a.order-b.order);
  }
  function level(stars,max,unlocked) {
    if (!unlocked) return "locked";
    if (stars >= Math.ceil(max*.75)) return "gold";
    if (stars >= Math.ceil(max*.5)) return "silver";
    return "bronze";
  }
  function buildMedals(gameRows, cert) {
    const trails = groups(gameRows).map((section,index) => {
      const total=section.phases.length, done=section.phases.filter(p=>String(p.status).toLowerCase()==="completed").length;
      const stars=section.phases.reduce((n,p)=>n+Number(p.bestStars||0),0), max=total*3, unlocked=total>0&&done===total;
      return { type:"Trilha", key:section.slug, title:section.title, shortName:shortName(section.title), icon:visuals[index%4].icon, ribbon:visuals[index%4].ribbon, coin:level(stars,max,unlocked), unlocked, stars, max, brilliant:unlocked&&stars>=max, description:unlocked?`Concedida por concluir todas as ${total} fases da trilha ${section.title}.`:`Bloqueada. Conclua as ${total} fases da trilha ${section.title}.`, meta:unlocked?`${stars} de ${max} estrelas`:`${done}/${total} fases concluídas` };
    });
    const stars=trails.reduce((n,m)=>n+m.stars,0), possible=trails.reduce((n,m)=>n+m.max,0), completed=trails.filter(m=>m.unlocked).length, brilliant=trails.filter(m=>m.brilliant).length, certificates=Number(cert?.certificateCount||0), total=trails.length;
    const achievement=(key,title,short,description,icon,ribbon,coin,current,target,unlocked,meta)=>({type:"Conquista",key,title,shortName:short,description,icon,ribbon,coin:unlocked?coin:"locked",current,target,unlocked,meta:unlocked?meta:`Bloqueada · ${current}/${target}`});
    medals=[...trails,
      achievement("stars-25","Colecionador 25 Estrelas","25 Estrelas","Liberada ao conquistar pelo menos 25 estrelas nos jogos.","star","gold","gold",stars,25,stars>=25,`${stars} estrelas conquistadas`),
      achievement("stars-35","Colecionador 35 Estrelas","35 Estrelas","Liberada ao conquistar pelo menos 35 estrelas nos jogos.","stars","purple","gold",stars,35,stars>=35,`${stars} estrelas conquistadas`),
      achievement("all-trails","Todas as Trilhas","Todas Trilhas","Liberada ao concluir todas as trilhas educativas da jornada.","route","green","gold",completed,total,total>0&&completed===total,`${completed} de ${total} trilhas concluídas`),
      achievement("two-brilliant","Duas Medalhas Brilhantes","Brilhantes","Liberada ao conquistar duas medalhas brilhantes nas trilhas.","medal","gold","gold",brilliant,2,brilliant>=2,`${brilliant} medalha(s) brilhante(s)`),
      achievement("certificate","Certificado Final","Certificado","Liberada quando existe certificado emitido no banco de dados.","file-signature","blue","silver",certificates,1,certificates>0,certificates>0?"Certificado emitido":"Nenhum certificado emitido"),
      achievement("legend",`Lenda Fiscal ${possible} Estrelas`,"Lenda Fiscal","Liberada ao conquistar todas as estrelas disponíveis nas fases cadastradas.","crown","gold","gold",stars,possible,possible>0&&stars>=possible,`${stars} de ${possible} estrelas`)
    ];
    dashboard={stars,possible,completed,trails:total,unlocked:medals.filter(m=>m.unlocked).length,certificates};
  }
  const ribbon = {red:"bg-[linear-gradient(135deg,#c0272d_0_46%,#fdf6e3_46%_56%,#8f1e23_56%)]",blue:"bg-[linear-gradient(135deg,#2563eb_0_46%,#fdf6e3_46%_56%,#1d4ed8_56%)]",green:"bg-[linear-gradient(135deg,#10b981_0_46%,#fdf6e3_46%_56%,#047857_56%)]",purple:"bg-[linear-gradient(135deg,#a855f7_0_46%,#fdf6e3_46%_56%,#6d28d9_56%)]",gold:"bg-[linear-gradient(135deg,#f5a800_0_46%,#fff7d6_46%_56%,#b7791f_56%)]",locked:"bg-[linear-gradient(135deg,#a8a29e_0_46%,#e7e5e4_46%_56%,#57534e_56%)] grayscale opacity-80"};
  const coin = {gold:"bg-[radial-gradient(circle_at_32%_24%,#fff5bf_0_18%,#ffd56a_19%_42%,#f5a800_43%_68%,#9a6817_100%)] border-[#7a4b13] text-[#5d2b0a]",silver:"bg-[radial-gradient(circle_at_32%_24%,#fff_0_18%,#e5e7eb_19%_42%,#cbd5e1_43%_68%,#64748b_100%)] border-slate-600 text-slate-700",bronze:"bg-[radial-gradient(circle_at_32%_24%,#ffe4c7_0_18%,#d99b5f_19%_42%,#b87333_43%_68%,#7c3f18_100%)] border-[#7c3f18] text-[#5d2b0a]",locked:"bg-[radial-gradient(circle_at_32%_24%,#f5f5f4_0_18%,#d6d3d1_19%_42%,#a8a29e_43%_68%,#57534e_100%)] border-stone-600 text-stone-700 grayscale"};
  function render() {
    const shelf=$("#medalShelf"); if(!shelf)return;
    shelf.innerHTML=`<div class="grid grid-cols-2 gap-4 min-[480px]:grid-cols-3 md:grid-cols-4">${medals.map((m,i)=>`<button type="button" data-medal="${i}" class="relative flex min-h-[190px] flex-col items-center justify-center rounded-[22px] bg-white/15 px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_7px_16px_rgba(0,0,0,.16)] transition active:scale-[.97]"><span class="mb-[-17px] h-12 w-[46px] rounded-t-md ${ribbon[m.unlocked?m.ribbon:"locked"]} [clip-path:polygon(0_0,100%_0,86%_100%,50%_76%,14%_100%)]"></span><span class="relative grid h-[82px] w-[82px] place-items-center rounded-full border-[5px] ${coin[m.unlocked?m.coin:"locked"]} text-[2rem] shadow-[inset_0_4px_0_rgba(255,255,255,.42),inset_0_-8px_14px_rgba(92,52,8,.3),0_9px_14px_rgba(0,0,0,.25)] md:h-[92px] md:w-[92px]"><iconify-icon icon="fa6-solid:${m.unlocked?m.icon:"lock"}"></iconify-icon></span><strong class="mt-2 grid min-h-[34px] place-items-center font-display text-[.83rem] leading-none text-[#fff7d6] [text-shadow:0_2px_3px_rgba(0,0,0,.35)]">${esc(m.shortName)}</strong><span class="mt-2 rounded-full bg-white/80 px-2 py-1 text-[9px] font-black uppercase text-[#5d351d]">${m.unlocked?"Liberada":"Bloqueada"}</span></button>`).join("")}</div>`;
    $("#medalCountBadge").innerHTML=`<iconify-icon icon="fa6-solid:medal" class="mr-1 text-mgGold"></iconify-icon>${dashboard.unlocked} de ${medals.length} medalhas`;
    $("#starCountBadge").innerHTML=`<iconify-icon icon="fa6-solid:star" class="mr-1 text-mgGold"></iconify-icon>${dashboard.stars} de ${dashboard.possible} estrelas`;
    [["#summaryStarsCount",dashboard.stars],["#summaryTrailsCount",dashboard.completed],["#summaryAchievementsCount",dashboard.unlocked]].forEach(([id,v])=>{if($(id))$(id).textContent=v});
    updateCertificateLock();
  }
  function updateCertificateLock(){
    const ok=dashboard.completed>=REQUIRED_TRAILS;
    const missing=Math.max(0,REQUIRED_TRAILS-dashboard.completed);
    const shell=$(".certificate-shell"), button=$("#downloadPdf"), note=$("#certificateLockNote");
    const overlayText=$("#certificateLockOverlayText"), message=$("#progressMessage"), track=$(".progress-track"), fill=$("#certificateProgressFill");
    const progress=Math.min(100,Math.round((dashboard.completed/REQUIRED_TRAILS)*100));
    shell?.classList.toggle("is-locked",!ok);
    if(button){button.disabled=!ok;button.setAttribute("aria-disabled",String(!ok));button.title=ok?"Baixar certificado em PDF":"Conclua 4 trilhas para liberar o certificado";}
    if(note){note.classList.toggle("hidden",ok);note.textContent=ok?"":`Conclua mais ${missing} trilha${missing!==1?"s":""}. Progresso: ${dashboard.completed}/${REQUIRED_TRAILS}.`;}
    if(overlayText) overlayText.textContent=`Conclua mais ${missing} trilha${missing!==1?"s":""} para liberar. Progresso: ${dashboard.completed}/${REQUIRED_TRAILS}.`;
    if(message) message.textContent=ok?"Certificado liberado. Você já pode emitir o PDF.":`Faltam ${missing} trilha${missing!==1?"s":""} para liberar o certificado.`;
    if(track){track.setAttribute("aria-valuenow",String(dashboard.completed));track.setAttribute("aria-valuetext",`${dashboard.completed} de ${REQUIRED_TRAILS} trilhas concluídas`);}
    if(fill) fill.style.width=`${progress}%`;
  }
  function openModal(m){
    if(!m)return;
    const unlocked=Boolean(m.unlocked), ribbonKey=unlocked?m.ribbon:"locked", coinKey=unlocked?m.coin:"locked";
    $("#modalType").textContent=m.type;
    $("#modalTitle").textContent=m.title;
    $("#modalDescription").textContent=m.description;
    $("#modalMeta").textContent=m.meta;
    const modalRibbon=$("#modalRibbon"), modalCoin=$("#modalCoin"), modalIcon=$("#modalIcon");
    if(modalRibbon) modalRibbon.className=`modal-medal-ribbon ${ribbon[ribbonKey]||ribbon.locked}`;
    if(modalCoin) modalCoin.className=`modal-medal-coin ${coin[coinKey]||coin.locked}`;
    modalIcon?.setAttribute("icon",`fa6-solid:${unlocked?m.icon:"lock"}`);
    const modal=$("#medalModal");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden","false");
    $("#closeModal")?.focus();
  }
  function updatePreview(){
    const stage=$(".certificate-stage"), preview=$("#previewViewport");
    if(!stage||!preview)return;
    const available=Math.max(280,Math.min(stage.parentElement?.clientWidth||480,480));
    const scale=Math.min(available/1123,.43);
    preview.style.transform=`scale(${scale})`;
    stage.style.width=`${1123*scale+6}px`;
    stage.style.height=`${794*scale+6}px`;
  }
  async function load(user){currentUser=user; $("#certificateName").textContent=user.displayName||"Participante"; $("#certificateDate").textContent=`Minas Gerais, ${new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"})}.`; try {const [progress,map,cert]=await Promise.all([BC_API.getUserProgress(user.publicUserId),BC_API.getGameMap(user.publicUserId),BC_API.getCertificateStatus?BC_API.getCertificateStatus(user.publicUserId).catch(()=>null):null]); buildMedals(map||[],cert); if(progress?.totalStars!=null)dashboard.stars=Number(progress.totalStars); render();} catch(e){console.warn("[Conquistas]",e); buildMedals([],null); render();} finally{updatePreview();finishLoading();}}
  async function pdf(){if(dashboard.completed<REQUIRED_TRAILS)return; if(currentUser&&BC_API.issueCertificate)await BC_API.issueCertificate(currentUser.publicUserId,currentUser.displayName||"Participante").catch(()=>null); const status=$("#pdfStatus"); status.textContent="Gerando PDF..."; try{await html2pdf().set({margin:0,filename:"certificado-cidadao-fiscal-nota-a.pdf",image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:true},jsPDF:{unit:"pt",format:"a4",orientation:"landscape"}}).from($("#certificate")).save();status.textContent="PDF gerado com sucesso.";}catch(e){status.textContent="Erro ao gerar PDF.";}}
  function bind(){$("#medalShelf")?.addEventListener("click",e=>{const b=e.target.closest("[data-medal]");if(b)openModal(medals[Number(b.dataset.medal)])}); $("#closeModal")?.addEventListener("click",()=>{const modal=$("#medalModal");modal.classList.remove("is-open");modal.setAttribute("aria-hidden","true");}); $("#medalModal")?.addEventListener("click",e=>{if(e.target.id==="medalModal"){e.currentTarget.classList.remove("is-open");e.currentTarget.setAttribute("aria-hidden","true");}}); $("#downloadPdf")?.addEventListener("click",pdf); addEventListener("resize",updatePreview); document.addEventListener("keydown",e=>{if(e.key==="Escape"){const modal=$("#medalModal");modal?.classList.remove("is-open");modal?.setAttribute("aria-hidden","true");}});} 
  async function init(){const timer=setTimeout(finishLoading,12000);bind();updatePreview();try{const user=await BC_AUTH.requireUser();if(user)await load(user);else finishLoading();}catch(e){finishLoading();}finally{clearTimeout(timer);}}
  addEventListener("bc:user-ready",e=>load(e.detail));
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
