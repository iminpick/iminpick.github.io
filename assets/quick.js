/* 빠른 선택형 엔진
   T={id,limit(ms,0=무제한),feedback(정답표시),shuffle,questions:[{q,ctx?,o:[[문구,데이터],...]}],
      compute(ans)=>{hit,name,lines,html?,share,q,img:[줄]},friend:(q)=>[줄1,줄2]|null}
   ans[i]={q,pick,data,others:[데이터],ms,miss} */
function quickTest(T){
  const P=PICK,$=P.$;P.init({id:T.id});
  let i=0,ans=[],t0=0,raf=0,lock=false,qs=[],res=null;
  const fr=T.friend&&T.friend();if(fr){$("pre").textContent="친구 결과 도착";$("hook").innerHTML=fr[0]+"<br>"+fr[1];$("go").textContent="나도 해보기"}
  function start(){P.track("start");i=0;ans=[];qs=T.questions.map(q=>({...q,o:T.shuffle?q.o.slice().sort(()=>Math.random()-.5):q.o}));P.show("s-quiz");if(T.limit)$("tl").style.display="block";ask()}
  function ask(){
    lock=false;const it=qs[i];P.track("q"+(i+1));
    $("count").textContent=(i+1)+"/"+qs.length;$("q").innerHTML=it.q;$("ctx").textContent=it.ctx||"";
    $("choices").innerHTML="";
    it.o.forEach((o,k)=>{const b=document.createElement("button");b.className="ch";b.textContent=o[0];b.onclick=()=>pick(k,b);$("choices").appendChild(b)});
    t0=performance.now();if(T.limit){$("tl").classList.remove("hurry");tick()}
  }
  function tick(){const el=performance.now()-t0;$("tl").style.transform="scaleX("+Math.max(0,1-el/T.limit)+")";if(el>T.limit*.6)$("tl").classList.add("hurry");if(el>=T.limit)return miss();raf=requestAnimationFrame(tick)}
  function rec(k,missed){const it=qs[i];ans.push({q:it.q.replace(/<[^>]+>/g,""),pick:k<0?null:it.o[k][0],data:k<0?null:it.o[k][1],others:it.o.filter((_,j)=>j!==k).map(o=>o[1]),otherText:it.o.filter((_,j)=>j!==k).map(o=>o[0]),ms:performance.now()-t0,miss:missed})}
  function pick(k,b){
    if(lock)return;lock=true;cancelAnimationFrame(raf);rec(k,false);P.buzz(10);
    const kids=[...$("choices").children];
    if(T.feedback){const okk=qs[i].o.findIndex(o=>o[1]&&o[1].ok);kids.forEach((c,j)=>{if(j===okk)c.classList.add("ok");else if(c===b)c.classList.add("no");else c.classList.add("fade")});setTimeout(next,700)}
    else{kids.forEach(c=>c.classList.add(c===b?"pick":"fade"));setTimeout(next,180)}
  }
  function miss(){lock=true;rec(-1,true);P.buzz([25,40,25]);$("choices").classList.add("shake");setTimeout(()=>$("choices").classList.remove("shake"),300);setTimeout(next,380)}
  function next(){i++;i<qs.length?ask():finish()}
  function finish(){
    $("tl").style.display="none";P.show("s-wait");P.track("finish");
    res=T.compute(ans);if(res.q)P.setUrl(res.q);
    setTimeout(()=>{P.buzz([15,60,15]);
      $("hit").innerHTML=res.hit;$("tname").textContent=res.name||"";$("list").innerHTML=(res.lines||[]).map(x=>"<p>"+x+"</p>").join("");$("extra").innerHTML=res.html||"";
      document.title=(res.name?res.name+" | ":"")+document.title.split(" | ").pop();
      P.show("s-result");P.renderNext($("next"));
      [...$("s-result").children].forEach((e,k)=>{e.classList.remove("show");setTimeout(()=>e.classList.add("show"),k*220)});
    },1500);
  }
  $("go").onclick=start;
  $("again").onclick=()=>{P.track("retry");P.setUrl("");P.show("s-start")};
  $("share").onclick=()=>P.share(res.share,res.q||"");
  $("copy").onclick=()=>P.copyLink(res.q||"");
  $("save").onclick=()=>P.saveImage(res.img,T.id,res.imgBg);
}
