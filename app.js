const TOOLS={
 rewrite:{title:'بازنویسی متن',placeholder:'متنت را اینجا وارد کن؛ مثلاً یک پیام یا پاراگراف...'},
 summary:{title:'خلاصه‌ساز',placeholder:'متن طولانی را اینجا وارد کن...'},
 translate:{title:'مترجم',placeholder:'متن فارسی یا انگلیسی را وارد کن...'},
 ideas:{title:'ایده‌پرداز',placeholder:'موضوع، پروژه یا حوزه‌ای که برایش ایده می‌خواهی...'},
 study:{title:'کمک‌درسی',placeholder:'موضوع درسی یا صورت سؤال را وارد کن...'}
};
const LIMIT=5;
const state={tool:localStorage.getItem('kasrai_tool')||'rewrite',uses:Number(localStorage.getItem('kasrai_uses_v2')||0),day:localStorage.getItem('kasrai_day')||'',history:JSON.parse(localStorage.getItem('kasrai_history')||'[]')};
const $=s=>document.querySelector(s);
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
function today(){return new Date().toISOString().slice(0,10)}
if(state.day!==today()){state.day=today();state.uses=0;localStorage.setItem('kasrai_day',state.day);localStorage.setItem('kasrai_uses_v2','0')}
function refresh(){
 $('#counter').textContent=`استفاده رایگان امروز: ${fa(state.uses)} از ${fa(LIMIT)}`;
 $('#planPill').textContent='پلن: رایگان';
 $('#historyCount').textContent=fa(state.history.length);
}
function setTool(tool){
 state.tool=tool;localStorage.setItem('kasrai_tool',tool);
 document.querySelectorAll('.tool-card').forEach(x=>x.classList.toggle('active',x.dataset.tool===tool));
 $('#toolTitle').textContent=TOOLS[tool].title;$('#inputText').placeholder=TOOLS[tool].placeholder;
}
function clean(s){return s.replace(/\s+/g,' ').trim()}
function splitSentences(s){return s.match(/[^.!?؟]+[.!?؟]?/g)?.map(x=>clean(x)).filter(Boolean)||[clean(s)]}
function localAI(tool,input){
 const t=clean(input), sentences=splitSentences(t);
 if(tool==='rewrite'){
  return `نسخه روان‌تر و حرفه‌ای‌تر:\n\n${t.replace(/\bخیلی\b/g,'بسیار')}\n\nنکته: برای بازنویسی تخصصی‌تر، متن را کوتاه و دقیق نگه دار.`;
 }
 if(tool==='summary'){
  if(t.length<100)return `خلاصه:\n\n${t}`;
  const picked=sentences.slice(0,Math.min(3,sentences.length)).join(' ');
  return `خلاصه:\n\n${picked}${sentences.length>3?' ...':''}`;
 }
 if(tool==='translate'){
  const dictionary={'سلام':'Hello','خوبی':'How are you?','ممنون':'Thank you','مرسی':'Thanks','دوست':'friend','مدرسه':'school','کتاب':'book','سایت':'website','هوش مصنوعی':'artificial intelligence','کسری':'Kasrai'};
  let out=t;Object.entries(dictionary).forEach(([a,b])=>{out=out.replaceAll(a,b)});
  return `ترجمه آزمایشی فارسی → انگلیسی:\n\n${out}\n\nاین مترجم آفلاین برای واژه‌های پایه است؛ برای ترجمه حرفه‌ای بعداً می‌توانیم موتور واقعی اضافه کنیم.`;
 }
 if(tool==='ideas'){
  return `ایده‌های پیشنهادی برای «${t}»:\n\n۱) یک آموزش کوتاه و مرحله‌ای بساز.\n۲) یک ابزار رایگان مرتبط با این موضوع اضافه کن.\n۳) پرسش‌های پرتکرار کاربران را تبدیل به بخش FAQ کن.\n۴) یک صفحه نمونه/دمو بساز تا کاربر قبل از ثبت‌نام نتیجه را ببیند.\n۵) از کاربران بازخورد بگیر و بر اساس آن قابلیت بعدی را انتخاب کن.`;
 }
 return `راهنمای مطالعه برای «${t}»:\n\n۱) اول تعریف و نکته اصلی را مشخص کن.\n۲) موضوع را به بخش‌های کوچک تقسیم کن.\n۳) برای هر بخش یک مثال ساده بنویس.\n۴) بدون نگاه‌کردن، نکته‌ها را از حفظ توضیح بده.\n۵) در پایان چند تمرین حل کن.\n\nاگر صورت سؤال را وارد کنی، می‌توانیم قدم‌به‌قدم بررسی‌اش کنیم.`;
}
function renderHistory(){
 const box=$('#history');box.innerHTML='';
 if(!state.history.length){box.innerHTML='<div class="empty">هنوز سابقه‌ای ثبت نشده.</div>';return}
 state.history.slice(0,8).forEach((h,i)=>{
  const el=document.createElement('button');el.className='history-item';el.innerHTML=`<b>${TOOLS[h.tool]?.title||h.tool}</b><small>${h.input.slice(0,70)}${h.input.length>70?'…':''}</small>`;
  el.onclick=()=>{$('#inputText').value=h.input;$('#output').textContent=h.output;setTool(h.tool)};box.appendChild(el)
 })
}
function saveHistory(input,output){state.history.unshift({tool:state.tool,input,output,at:Date.now()});state.history=state.history.slice(0,20);localStorage.setItem('kasrai_history',JSON.stringify(state.history));renderHistory();refresh()}
document.querySelectorAll('.tool-card').forEach(c=>c.addEventListener('click',()=>setTool(c.dataset.tool)));
$('#runBtn').addEventListener('click',()=>{
 const input=$('#inputText').value.trim();
 if(!input){$('#output').textContent='اول متن یا موضوعت را وارد کن.';return}
 if(state.uses>=LIMIT){$('#output').textContent='سقف استفاده رایگان امروز پر شده است. فردا دوباره ۵ استفاده رایگان داری.';return}
 $('#runBtn').disabled=true;$('#runBtn').textContent='در حال آماده‌سازی...';
 setTimeout(()=>{const result=localAI(state.tool,input);$('#output').textContent=result;state.uses++;localStorage.setItem('kasrai_uses_v2',state.uses);saveHistory(input,result);refresh();$('#runBtn').disabled=false;$('#runBtn').textContent='✨ اجرا'},350)
});
$('#clearBtn').addEventListener('click',()=>{$('#inputText').value='';$('#output').textContent='نتیجه اینجا نمایش داده می‌شود.'});
$('#clearHistory').addEventListener('click',()=>{state.history=[];localStorage.removeItem('kasrai_history');renderHistory();refresh()});
$('#loginBtn').addEventListener('click',()=>alert('ورود کاربر در نسخه بدون بک‌اند هنوز فعال نیست. ابتدا می‌توانیم ظاهر و امکانات اصلی را کامل کنیم.'));
$('#upgradeBtn').addEventListener('click',()=>alert('پرداخت واقعی را فعلاً فعال نکرده‌ایم. این دکمه بعداً به سیستم پرداخت امن و بک‌اند متصل می‌شود.'));
$('#year').textContent=new Date().getFullYear();
setTool(state.tool);renderHistory();refresh();
