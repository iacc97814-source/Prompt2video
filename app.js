const $=id=>document.getElementById(id);
let lastScript="";
function build(prompt,duration,style){
  const words=prompt.trim().split(/\s+/).filter(Boolean);
  const base=words.length?prompt.trim():"Two friends meet and have an important conversation.";
  const long=duration>=300;
  const count=long?8:4;
  const scenes=[];
  const actions=[
    ["Opening","Establish the location and introduce the characters. Use a slow cinematic camera movement."],
    ["Conversation","The characters face each other and begin the conversation described in the prompt. Keep lip movement and gestures natural."],
    ["Action","Show the main action from the prompt. Characters move through the environment and react to each other."],
    ["Reaction","Show close-up reactions, expressions and natural body movement. Keep character appearance consistent."],
    ["Progress","Continue the story while preserving the same characters, clothing and location."],
    ["Turning point","Show the key moment described by the user with cinematic framing."],
    ["Ending","Resolve the conversation or action naturally."],
    ["Final shot","Finish with a wide cinematic shot and a short visual ending."]
  ];
  for(let i=0;i<count;i++){
    const a=actions[i];
    scenes.push({n:i+1,title:a[0],visual:a[1],prompt:`${base}. Scene ${i+1}: ${a[1]} Style: ${style}. Keep characters consistent, realistic motion, natural expressions, cinematic lighting.`});
  }
  return scenes;
}
$("generate").onclick=()=>{
 const prompt=$("prompt").value.trim(), duration=+$("duration").value, style=$("style").value;
 if(!prompt){$("status").textContent="Pehle apna prompt likho.";return}
 $("status").textContent="Story aur scenes prepare ho rahe hain...";
 setTimeout(()=>{
  const scenes=build(prompt,duration,style);
  lastScript=`PROMPT2VIDEO AI\\nStyle: ${style}\\nDuration plan: ${duration}s\\n\\nUSER PROMPT:\\n${prompt}\\n\\nSCENES:\\n`+
   scenes.map(s=>`${s.n}. ${s.title}\\n${s.prompt}`).join("\\n\\n");
  $("story").innerHTML=`<p><b>Original prompt:</b> ${escapeHtml(prompt)}</p><p><span class="pill">${style}</span><span class="pill">${duration>=1200?"15–20 minute plan":duration+" second plan"}</span></p>`;
  $("scenes").innerHTML=scenes.map(s=>`<div class="scene"><h3>Scene ${s.n} — ${s.title}</h3><p>${escapeHtml(s.visual)}</p><p><b>AI generation prompt:</b> ${escapeHtml(s.prompt)}</p></div>`).join("");
  $("result").classList.remove("hidden"); $("status").textContent="Ready. Ye MVP abhi video plan generate karta hai.";
  window.scrollTo({top:$("result").offsetTop-20,behavior:"smooth"});
 },500);
};
$("speak").onclick=()=>{
 if(!lastScript){return}
 speechSynthesis.cancel();
 const text=$("prompt").value.trim();
 const u=new SpeechSynthesisUtterance(text);
 u.rate=.95; u.pitch=1; speechSynthesis.speak(u);
};
$("download").onclick=()=>{
 const blob=new Blob([lastScript],{type:"text/plain"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="prompt2video-script.txt";a.click();
};
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}