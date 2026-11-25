/* pick 공통 엔진: 기록 · 공유 · 저장 · 다음 테스트 추천 · 광고 자리
   각 페이지는 PICK.init({id, title}) 후 PICK.* 사용 */
(function(){
const FORM="https://docs.google.com/forms/d/e/1FAIpQLSf04nq87oC420sNEfEuP0wFoM3ye-Hga7sYIeD989DrfIBKuA/formResponse";
const ENTRY="entry.1016624779";
// 광고: 카카오 애드핏 승인 후 단위 ID를 넣으면 모든 페이지의 .ad 자리에 자동 표시
const ADFIT_UNIT="";

// 전체 목록 (허브·추천에 공통 사용). cat: 같은 카테고리 우선 추천
const CATALOG=[
 {id:"some7",t:"썸 7일: 사귈 수 있을까",s:"카톡으로 7일, 엔딩 8개 모으는 게임",cat:"love",game:1},
 {id:"love",t:"3.5초 안에 고르는 연애 직감 테스트",s:"몇 초 멈췄는지까지 다 기록돼요",cat:"love"},
 {id:"ignore",t:"썸남 카톡 읽씹, 몇 초 버틸 수 있어요?",s:"답장 누르면 끝나는 게임",cat:"love",game:1},
 {id:"kakao",t:"그 사람 카톡을 넣으면 보이는 것들",s:"답장 속도, ㅋ 개수, 먼저 연락한 횟수까지",cat:"love"},
 {id:"unpicked",t:"'안 고른' 답으로 보는 진짜 성격",s:"고른 것보다 이게 더 잘 맞아요",cat:"self"},
 {id:"receipt",t:"2026 연애 정산서",s:"올해 감정에 얼마 썼는지 영수증으로 뽑아드려요",cat:"love",season:1},
 {id:"groupchat",t:"우리 단톡방에서 나는 뭐 담당일까?",s:"단톡방에 던지면 다들 해봐요",cat:"friend"},
 {id:"spell",t:"맞춤법 10문제, 몇 개 맞힐 수 있을까요?",s:"부모님 단톡방에 보내기 좋아요",cat:"quiz"}
];

let V="",SID=Math.random().toString(36).slice(2,9),FR="direct",PAGE="";
try{const q=new URLSearchParams(location.search);FR=q.get("from")?("from:"+q.get("from")):(q.get("r")||q.get("s")?"friend":(document.referrer?new URL(document.referrer).hostname:"direct"))}catch(x){}

function track(e){try{if(!location.protocol.startsWith("http"))return;const b=new URLSearchParams();b.append(ENTRY,[V,e,SID,FR].join("|"));fetch(FORM,{method:"POST",mode:"no-cors",body:b,keepalive:true}).catch(()=>{})}catch(x){}}
const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll(".screen").forEach(s=>s.classList.remove("on"));$(id).classList.add("on");window.scrollTo(0,0)}
let tt;function toast(m){let t=$("toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t)}t.textContent=m;t.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("on"),1900)}
function buzz(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
function param(k){try{return new URLSearchParams(location.search).get(k)}catch(e){return null}}
function setUrl(q){try{history.replaceState(null,"",location.pathname+q)}catch(e){}}
function pageUrl(q){try{if(location.protocol.startsWith("http"))return location.origin+location.pathname.replace(/index\.html$/,"")+(q||"")}catch(e){}return ""}
function copyText(t){try{navigator.clipboard.writeText(t).then(()=>toast("복사됐어요, 카톡에 붙여넣어 주세요"),()=>toast("여기서는 복사가 막혀 있어요"))}catch(e){toast("여기서는 복사가 막혀 있어요")}}
function share(text,q){
  track("share");const url=pageUrl(q);
  if(!url)return toast("공유는 사이트에서 열었을 때 돼요");
  try{if(navigator.share)navigator.share({text,url}).catch(()=>{});else copyText(text+" "+url)}catch(e){copyText(text+" "+url)}
}
function copyLink(q){track("copy");const url=pageUrl(q);if(!url)return toast("링크는 사이트에서 열었을 때 돼요");copyText(url)}
// 스토리용 이미지: lines = [{t,size,weight,color,gap}]
function saveImage(lines,file,bg){
  track("save");
  try{const W=1080,H=1920,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    x.fillStyle=bg||"#000";x.fillRect(0,0,W,H);let y=300;
    lines.forEach(l=>{x.fillStyle=l.color||"#fff";x.font=(l.weight||800)+" "+(l.size||64)+"px sans-serif";y+=(l.gap||0);y=wrap(x,l.t,90,y,900,(l.size||64)*1.35)+(l.size||64)*1.35});
    x.fillStyle="#666";x.font="700 38px sans-serif";x.fillText("iminpick.github.io",90,1800);
    const a=document.createElement("a");a.download=(file||"pick")+".png";a.href=c.toDataURL("image/png");a.click();toast("저장됐어요, 스토리에 올려보세요");
  }catch(e){toast("여기서는 저장이 막혀 있어요")}
}
function wrap(x,t,lx,y,max,lh){let line="";for(const w of String(t)){if(w==="\n"){x.fillText(line,lx,y);line="";y+=lh;continue}const s=line+w;if(x.measureText(s).width>max){x.fillText(line,lx,y);line=w;y+=lh}else line=s}x.fillText(line,lx,y);return y}
// 다음 테스트 추천: 같은 카테고리 → 게임 → 나머지 순, 현재 제외, 3개
function renderNext(el,n){
  if(!el)return;const me=CATALOG.find(c=>c.id===PAGE)||{};
  const rest=CATALOG.filter(c=>c.id!==PAGE);
  const score=c=>(c.cat===me.cat?3:0)+(c.game&&!me.game?2:0)+(c.season?1:0)+Math.random();
  const pick=rest.sort((a,b)=>score(b)-score(a)).slice(0,n||3);
  el.innerHTML='<p class="small" style="margin-bottom:6px">이거 한 분들이 다음에 많이 누른 것</p>'+pick.map(c=>'<a class="nx" href="../'+c.id+'/?from='+PAGE+'" data-id="'+c.id+'"><span>'+c.t+'<small>'+c.s+'</small></span><i>→</i></a>').join("")+'<a class="nx" href="../" data-id="hub"><span>전체 테스트 보기<small>'+CATALOG.length+'개</small></span><i>→</i></a>';
  el.querySelectorAll(".nx").forEach(a=>a.addEventListener("click",()=>track("next:"+a.dataset.id)));
}
function ads(){
  if(!ADFIT_UNIT)return;
  document.querySelectorAll(".ad").forEach(el=>{if(el.dataset.done)return;el.dataset.done=1;el.innerHTML='<ins class="kakao_ad_area" style="display:none;" data-ad-unit="'+ADFIT_UNIT+'" data-ad-width="320" data-ad-height="100"></ins>'});
  const s=document.createElement("script");s.async=true;s.src="//t1.daumcdn.net/kas/static/ba.min.js";document.body.appendChild(s);
}
function init(o){PAGE=o.id;V=o.v||o.id;track("view");ads();}
window.PICK={init,track,show,toast,buzz,param,setUrl,share,copyLink,saveImage,renderNext,ads,$,CATALOG};
})();
