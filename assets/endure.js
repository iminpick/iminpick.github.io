/* 참기 게임 엔진: 메시지가 쏟아지는 동안 버튼을 안 누르고 버틴 시간 = 점수
   G = {id,name,btn,max,msgs:[[초,문구]],flood:[문구],results:[[미만초,이름,[줄]]],hit:(m,t)=>html,share:(t,n)=>txt,friend:(t)=>[줄1,줄2]} */
function endureGame(G){
  const P=PICK,$=P.$;P.init({id:G.id});
  let t0=0,raf=0,shown=0,last="",timers=[],over=true,best=0;
  try{best=parseFloat(localStorage.getItem("best_"+G.id))||0}catch(e){}
  const fs=parseFloat(P.param("s"));
  if(fs>0){$("pre").textContent="친구 기록 도착";$("hook").innerHTML=G.friend(fs.toFixed(1))[0]+"<br>"+G.friend(fs.toFixed(1))[1];$("go").textContent="도전하기"}
  if(best>0)$("bestline").textContent="내 최고 기록 "+best.toFixed(1)+"초";
  function addMsg(t){
    const d=document.createElement("div");d.className="bub";d.textContent=t;$("chat").appendChild(d);
    $("chat").scrollTop=$("chat").scrollHeight;last=t;shown++;$("unread").textContent=shown;P.buzz(18);
    requestAnimationFrame(()=>d.classList.add("in"));
  }
  function start(){
    P.track("start");P.show("s-game");$("chat").innerHTML="";shown=0;last="";over=false;
    t0=performance.now();timers.forEach(clearTimeout);timers=[];
    G.msgs.forEach(([s,m])=>timers.push(setTimeout(()=>!over&&addMsg(m),s*1000)));
    const fstart=G.msgs[G.msgs.length-1][0]+0.7;let k=0;
    for(let s=fstart;s<G.max;s+=Math.max(.28,.8-k*.03)){const m=G.flood[k%G.flood.length];k++;timers.push(setTimeout(()=>!over&&addMsg(m),s*1000))}
    tick();
  }
  function tick(){
    const el=(performance.now()-t0)/1000;$("clock").textContent=el.toFixed(1);
    if(el>=G.max)return end(true);raf=requestAnimationFrame(tick);
  }
  function end(survived){
    if(over)return;over=true;cancelAnimationFrame(raf);timers.forEach(clearTimeout);
    const t=Math.min(G.max,(performance.now()-t0)/1000);P.buzz(survived?[30,50,30,50,80]:[60]);
    P.track("finish");P.track("score:"+Math.floor(t));
    const r=G.results.find(x=>t<x[0])||G.results[G.results.length-1];
    const isBest=t>best;if(isBest){best=t;try{localStorage.setItem("best_"+G.id,t.toFixed(1))}catch(e){}}
    $("hit").innerHTML=survived?G.win(t.toFixed(1)):G.hit(last||"아무것도 안 왔는데",t.toFixed(1));
    $("score").textContent=t.toFixed(1)+"초";
    $("tname").textContent=r[1];$("list").innerHTML=r[2].map(x=>"<p>"+x+"</p>").join("");
    $("rec").textContent=isBest?"최고 기록 갱신":"내 최고 기록 "+best.toFixed(1)+"초";
    if(fs>0)$("vs").textContent=t>fs?"친구 기록 "+fs.toFixed(1)+"초를 이겼어요":"친구 기록 "+fs.toFixed(1)+"초한테 졌어요";
    P.setUrl("?s="+t.toFixed(1));$("s-result").dataset.t=t.toFixed(1);
    P.show("s-result");P.renderNext($("next"));
    [...$("s-result").children].forEach((e,k)=>{e.classList.remove("show");setTimeout(()=>e.classList.add("show"),k*200)});
  }
  $("go").onclick=start;$("btn").onclick=()=>end(false);
  $("retry").onclick=()=>{P.track("retry");start()};
  $("share").onclick=()=>P.share(G.share($("s-result").dataset.t,$("tname").textContent),"?s="+$("s-result").dataset.t);
  $("copy").onclick=()=>P.copyLink("?s="+$("s-result").dataset.t);
  $("save").onclick=()=>P.saveImage([{t:G.title,size:42,weight:700,color:"#888"},{t:$("s-result").dataset.t+"초",size:200,gap:40},{t:$("tname").textContent,size:72,gap:20},{t:"몇 초 버틸 수 있을까요?",size:46,weight:700,color:G.accent||"#ff3b30",gap:80}],G.id);
}
