(function(){
"use strict";
/* ───────── utils ───────── */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const norm=s=>String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[đĐ]/g,"d").toLowerCase();
const pad=n=>String(n).padStart(2,"0");
const lc=s=>s?s.charAt(0).toLowerCase()+s.slice(1):s;
function rnd(n){try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n;}catch(e){return Math.floor(Math.random()*n);}}
function lsGet(k,d){try{const v=localStorage.getItem("tsw:"+k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem("tsw:"+k,JSON.stringify(v));}catch(e){}}
let toastT;function toast(m){const t=$("#toast");t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true;},2800);}

/* ───────── constants ───────── */
const WD=["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"];
const ROMAN=["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];
const RANK_LABEL=["","ACE","II","III","IV","V","VI","VII","VIII","IX","X","PAGE","KNIGHT","QUEEN","KING"];
const SUITS={w:{vi:"Gậy",en:"Wands",el:"fire",dom:"hành động, đam mê, công việc và sáng tạo",area:"công việc, dự án, đam mê"},
c:{vi:"Cốc",en:"Cups",el:"water",dom:"cảm xúc, tình yêu và các mối quan hệ",area:"các mối quan hệ, bạn bè, tình cảm"},
s:{vi:"Kiếm",en:"Swords",el:"air",dom:"suy nghĩ, giao tiếp, xung đột và quyết định",area:"thông tin, học hỏi, giao tiếp, quyết định"},
p:{vi:"Tiền",en:"Pentacles",el:"earth",dom:"tiền bạc, công việc, vật chất và sức khỏe",area:"tiền bạc, tài sản, công việc ổn định"}};
const ELEM={fire:{vi:"Lửa",color:"đỏ, cam, vàng nghệ"},water:{vi:"Nước",color:"xanh biển, bạc, tím than"},air:{vi:"Khí",color:"vàng nhạt, trắng, xanh da trời"},earth:{vi:"Đất",color:"xanh lá, nâu đất, màu be"}};
const SPEED={w:"ngày",s:"tuần",c:"tháng",p:"năm (hoặc nhiều tháng)"};
const NUM_MEAN={1:"khởi đầu, hạt giống, tiềm năng",2:"lựa chọn, cân bằng, hợp tác",3:"phát triển, sáng tạo, kết nối",4:"ổn định, nền tảng, củng cố",5:"xung đột, biến động, thử thách",6:"hài hòa, hồi phục, cho – nhận",7:"đánh giá, kiên nhẫn, thử thách nội tâm",8:"chuyển động, nỗ lực, làm chủ",9:"gần hoàn thành, đỉnh điểm, tự lực",10:"kết thúc chu kỳ, trọn vẹn, chuyển giao"};
const TOPICS={general:"Tổng quát",love:"Tình cảm",work:"Sự nghiệp",money:"Tài chính – Đầu tư",health:"Sức khỏe",mind:"Tinh thần"};
const DECAN={
w:{2:["Hỏa tinh","Bạch Dương","21/3–30/3"],3:["Mặt Trời","Bạch Dương","31/3–10/4"],4:["Kim tinh","Bạch Dương","11/4–20/4"],5:["Thổ tinh","Sư Tử","22/7–1/8"],6:["Mộc tinh","Sư Tử","2/8–11/8"],7:["Hỏa tinh","Sư Tử","12/8–22/8"],8:["Thủy tinh","Nhân Mã","22/11–1/12"],9:["Mặt Trăng","Nhân Mã","2/12–11/12"],10:["Thổ tinh","Nhân Mã","12/12–21/12"]},
c:{2:["Kim tinh","Cự Giải","21/6–1/7"],3:["Thủy tinh","Cự Giải","2/7–11/7"],4:["Mặt Trăng","Cự Giải","12/7–21/7"],5:["Hỏa tinh","Bọ Cạp","23/10–1/11"],6:["Mặt Trời","Bọ Cạp","2/11–12/11"],7:["Kim tinh","Bọ Cạp","13/11–22/11"],8:["Thổ tinh","Song Ngư","19/2–28/2"],9:["Mộc tinh","Song Ngư","1/3–10/3"],10:["Hỏa tinh","Song Ngư","11/3–20/3"]},
s:{2:["Mặt Trăng","Thiên Bình","23/9–2/10"],3:["Thổ tinh","Thiên Bình","3/10–12/10"],4:["Mộc tinh","Thiên Bình","13/10–22/10"],5:["Kim tinh","Bảo Bình","20/1–29/1"],6:["Thủy tinh","Bảo Bình","30/1–8/2"],7:["Mặt Trăng","Bảo Bình","9/2–18/2"],8:["Mộc tinh","Song Tử","21/5–31/5"],9:["Hỏa tinh","Song Tử","1/6–10/6"],10:["Mặt Trời","Song Tử","11/6–20/6"]},
p:{2:["Mộc tinh","Ma Kết","22/12–30/12"],3:["Hỏa tinh","Ma Kết","31/12–9/1"],4:["Mặt Trời","Ma Kết","10/1–19/1"],5:["Thủy tinh","Kim Ngưu","21/4–30/4"],6:["Mặt Trăng","Kim Ngưu","1/5–10/5"],7:["Thổ tinh","Kim Ngưu","11/5–20/5"],8:["Mặt Trời","Xử Nữ","23/8–1/9"],9:["Kim tinh","Xử Nữ","2/9–11/9"],10:["Thủy tinh","Xử Nữ","12/9–22/9"]}};

/* ───────── cards ───────── */
const ORDER={m:0,w:1,c:2,s:3,p:4};
const CARDS=(window.TAROT_CARDS||[]).slice().sort((a,b)=>(ORDER[a.s||"m"]-ORDER[b.s||"m"])||((a.s?a.r:a.n)-(b.s?b.r:b.n)));
const BY={};const MAJ=[];
CARDS.forEach(c=>{BY[c.id]=c;c.el=c.el||SUITS[c.s].el;if(!c.s)MAJ[c.n]=c;
  c.key=norm([c.en,c.vi,c.s?`${c.r} ${SUITS[c.s].en} ${c.r} ${SUITS[c.s].vi} ${RANK_LABEL[c.r]} an phu`:`${c.n} ${ROMAN[c.n]} major an chinh`].join(" "));});
const COURTS=CARDS.filter(c=>c.s&&c.r>10);
const GLYPH={
w:'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3v34" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" fill="none"/><g fill="currentColor"><ellipse cx="25.5" cy="9" rx="4.2" ry="1.9" transform="rotate(-35 25.5 9)"/><ellipse cx="14.5" cy="15.5" rx="4.2" ry="1.9" transform="rotate(35 14.5 15.5)"/><ellipse cx="25.5" cy="22" rx="4.2" ry="1.9" transform="rotate(-35 25.5 22)"/></g></svg>',
c:'<svg viewBox="0 0 40 40" aria-hidden="true" fill="currentColor"><path d="M9 5h22c0 10-4.5 15-11 15S9 15 9 5z"/><rect x="18.3" y="19" width="3.4" height="10"/><path d="M11 36h18l-3.5-6h-11z"/></svg>',
s:'<svg viewBox="0 0 40 40" aria-hidden="true" fill="currentColor"><path d="M20 2l3.2 6.5V27h-6.4V8.5z"/><rect x="10" y="26.5" width="20" height="3.4" rx="1.7"/><rect x="18.4" y="29.5" width="3.2" height="6"/><circle cx="20" cy="37" r="2.2"/></svg>',
p:'<svg viewBox="0 0 40 40" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><circle cx="20" cy="20" r="16"/><path d="M20 7.5L27.35 30.11 8.11 16.14H31.89L12.65 30.11Z"/></svg>'};
const IN_CLAUDE=!!(window.claude&&window.claude.use);
function dataToUrl(d){try{const mt=(/^data:([^;,]+)/.exec(d)||[])[1]||"image/jpeg";const b=atob(d.split(",")[1]);const a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return URL.createObjectURL(new Blob([a],{type:mt}));}catch(e){return d;}}
const IMGURL={},SYMURL={};
function imgUrl(id){if(IMGURL[id]===undefined){const d=(window.TAROT_IMG||{})[id];IMGURL[id]=d?dataToUrl(d):"";}return IMGURL[id];}
function symUrl(i){if(SYMURL[i]===undefined){const d=(window.TAROT_SYM_IMG||[])[i];SYMURL[i]=d?dataToUrl(d):"";}return SYMURL[i];}
const SYMS=window.TAROT_SYMBOLS||[];const SYM_BY={};SYMS.forEach((s,i)=>s.c.forEach(id=>{(SYM_BY[id]=SYM_BY[id]||[]).push(i);}));
const EN=window.TAROT_EN||{};
function symList(id,max){const l=(SYM_BY[id]||[]).slice(0,max||99);if(!l.length)return "";return `<div class="symgrid">${l.map(i=>{const s=SYMS[i];const u=symUrl(i);return `<div class="sym">${u?`<img src="${u}" alt="" loading="lazy">`:""}<div><b>${esc(s.vi)}</b><span class="muted"> · ${esc(s.en)}</span><br>${esc(s.m)}</div></div>`;}).join("")}</div>`;}
function tile(c,rev,w){w=w||64;const u=imgUrl(c.id);
  if(u)return `<div class="tc img${rev?" rev":""}" style="--w:${w}px" role="img" aria-label="${esc(c.vi+" ("+c.en+")"+(rev?", ngược":""))}"><img src="${u}" alt="" draggable="false"></div>`;
  const mid=c.s?GLYPH[c.s]:`<span class="glyph">${c.astro}︎</span>`;
  return `<div class="tc ${c.s||"m"}${rev?" rev":""}" style="--w:${w}px" role="img" aria-label="${esc(c.vi+" ("+c.en+")"+(rev?", ngược":""))}"><div class="in"><span class="num">${c.s?RANK_LABEL[c.r]:ROMAN[c.n]}</span>${mid}<span class="nm">${esc(c.en.replace(/^The /,""))}</span></div></div>`;}
function back(w){return `<div class="back" style="--w:${w||56}px" aria-hidden="true"></div>`;}
function orient(rev){return rev?'<span class="revtag">Ngược</span>':'<span class="uptag">Xuôi</span>';}
function arcana(c){return c.s?`Ẩn phụ · Bộ ${SUITS[c.s].vi} (${SUITS[c.s].en}) · ${ELEM[c.el].vi}`:`Ẩn chính ${ROMAN[c.n]} · ${ELEM[c.el].vi}`;}
function txt(c,f,rev){if(f==="gen")return rev?c.rv:c.up;const v=c[f];return Array.isArray(v)?v[rev?1:0]:v;}
function pol(c,rev){return c.p[rev?1:0];}
function topicText(c,rev,topic){return topic&&topic!=="general"?txt(c,topic,rev):txt(c,"gen",rev);}
function ynLabel(p){return p>=2?"Có":p>=1?"Nghiêng về có":p<=-2?"Không":p<=-1?"Nghiêng về không":"Chưa rõ";}
function polLabel(a){return a>=1?["Thuận lợi","ok"]:a>=.35?["Khá thuận lợi","ok"]:a>-.35?["Pha trộn – phụ thuộc cách bạn hành động","warn"]:a>-1?["Nhiều thử thách","warn"]:["Cần thận trọng","bad"];}
function polColor(k){return k==="ok"?"var(--ok)":k==="bad"?"var(--bad)":"var(--warn)";}
function astroText(c){if(!c.s)return c.astroVi+(c.dates?` (${c.dates})`:"");if(c.r>=2&&c.r<=10){const d=DECAN[c.s][c.r];return `${d[0]} tại ${d[1]} · ${d[2]}`;}return `Nguyên tố ${ELEM[c.el].vi}`;}
function timing(c){const o=[];
  if(!c.s){o.push(c.dates?`Gắn với cung ${c.astroVi} (${c.dates}).`:`Gắn với ${c.astroVi}: thời điểm thường do yếu tố lớn quyết định, không cố định theo lịch.`);}
  else{const sp=SPEED[c.s];
    if(c.r>=2&&c.r<=10){const d=DECAN[c.s][c.r];o.push(`Golden Dawn: ${d[0]} tại ${d[1]}, khoảng ${d[2]}.`);o.push(`Theo tốc độ nguyên tố: khoảng ${c.r} ${sp}.`);}
    else if(c.r===1)o.push(`Át là hạt giống: bắt đầu ngay khi bạn hành động; đơn vị gợi ý của bộ ${SUITS[c.s].vi} là ${sp}.`);
    else o.push(`Lá triều đình thường chỉ một người hoặc thái độ hơn là thời điểm; nếu cần, tính theo đơn vị ${sp}.`);}
  return o;}
function luckyNum(c){return c.s?String(c.r):(c.n===0?"0 hoặc 22":String(c.n));}

/* ───────── dates ───────── */
function todayISO(){const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;}
function thisMonth(){const d=new Date();return `${d.getFullYear()}-${pad(d.getMonth()+1)}`;}
function parseDate(s){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");return m?new Date(+m[1],+m[2]-1,+m[3]):new Date();}
function parseMonth(s){const m=/^(\d{4})-(\d{2})/.exec(s||"");if(!m){const d=new Date();return [d.getFullYear(),d.getMonth()+1];}return [+m[1],+m[2]];}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function fmtD(d){return pad(d.getDate())+"/"+pad(d.getMonth()+1);}
function fmtFull(d){return WD[d.getDay()]+", "+fmtD(d)+"/"+d.getFullYear();}
function fmtStamp(iso){const d=new Date(iso);if(isNaN(d))return "";return `${fmtD(d)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;}

/* ───────── birth cards ───────── */
const dsum=n=>String(n).split("").reduce((s,d)=>s+(+d||0),0);
function reduceTo22(n){while(n>22)n=dsum(n);return n;}
function birthCards(iso,year){const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||"");if(!m)return null;const y=+m[1],mo=+m[2],d=+m[3];
  const p=reduceTo22(d+mo+y);let soul=p;while(soul>9)soul=dsum(soul);
  const yr=reduceTo22(d+mo+(year||new Date().getFullYear()));
  return {pers:MAJ[p===22?0:p],soul:MAJ[soul],year:MAJ[yr===22?0:yr],yearNum:year||new Date().getFullYear()};}

/* ───────── spreads ───────── */
const GROUPS=[["forecast","Dự báo theo thời gian","ngày · tuần · tháng · năm"],["question","Câu hỏi nhanh","có/không · diễn biến · nên làm gì"],["decision","Ra quyết định","so sánh các lựa chọn"],["topic","Theo chủ đề","tình cảm · sự nghiệp · tiền · sức khỏe · may mắn"],["deep","Chuyên sâu","trải bài kinh điển của Waite"]];
const SPREADS=[
{id:"day",g:"forecast",name:"Lá bài hôm nay",n:1,kind:"day",date:"day",topic:true,desc:"Năng lượng của ngày, việc nên làm, điều cần tránh và gợi ý may mắn.",q:["Hôm nay tôi cần lưu ý điều gì?","Ngày mai của tôi sẽ thế nào?"]},
{id:"week",g:"forecast",name:"Dự báo 7 ngày",n:9,kind:"week",date:"day",topic:true,desc:"Một lá chủ đề, mỗi ngày một lá, và lời khuyên cho cả tuần.",q:["7 ngày tới của tôi sẽ thế nào?","Công việc của tôi trong tuần này ra sao?"]},
{id:"month",g:"forecast",name:"Dự báo tháng",n:9,kind:"month",date:"month",topic:true,desc:"Chủ đề tháng, bốn tuần, cơ hội, thử thách, lời khuyên và kết quả.",q:["Tháng này có gì đáng chú ý với tôi?","Tài chính của tôi trong tháng này thế nào?"]},
{id:"year",g:"forecast",name:"12 tháng tới",n:13,kind:"year",date:"month",topic:true,desc:"Một lá chủ đề cho cả chặng và một lá cho từng tháng.",q:["12 tháng tới tôi nên tập trung vào điều gì?"]},
{id:"yn1",g:"question",name:"Có hay Không · 1 lá",n:1,kind:"yesno",topic:true,desc:"Trả lời nhanh một câu hỏi đóng, kèm lý do và điều kiện.",q:["Tôi có nên nhận lời đề nghị này không?","Buổi phỏng vấn tuần sau có thuận lợi không?"]},
{id:"yn3",g:"question",name:"Có hay Không · 3 lá",n:3,kind:"yesno",topic:true,desc:"Yếu tố hiện tại, yếu tố ẩn và xu hướng – câu trả lời có sắc thái hơn.",q:["Tôi có nên chuyển nhà trong năm nay không?","Có nên ký hợp đồng này không?"]},
{id:"ppf",g:"question",name:"Quá khứ – Hiện tại – Tương lai",n:3,topic:true,desc:"Ba lá cho diễn biến của một vấn đề.",q:["Chuyện tình cảm của tôi đang đi về đâu?","Dự án hiện tại của tôi sẽ diễn biến thế nào?"]},
{id:"action",g:"question",name:"Tôi nên làm gì?",n:4,topic:true,desc:"Tình huống, nên làm, không nên làm, kết quả nếu làm theo lời khuyên.",q:["Tôi nên làm gì để giải quyết mâu thuẫn với đồng nghiệp?","Tôi nên làm gì để lấy lại động lực?"]},
{id:"choice",g:"decision",name:"Chọn A, B hay C",kind:"choice",topic:true,desc:"Mỗi lựa chọn hai lá: diễn biến và kết quả. App chấm mức thuận lợi để so sánh.",q:["Tôi nên chọn công việc nào?","Nên dồn vốn vào kênh nào trong năm nay?"]},
{id:"love",g:"topic",name:"Tình cảm",n:6,fixedTopic:"love",desc:"Bạn, người ấy, mối liên kết, thử thách, lời khuyên, hướng phát triển.",q:["Mối quan hệ của tôi với … đang thế nào?","Tôi đang độc thân – tình cảm sắp tới ra sao?"]},
{id:"career",g:"topic",name:"Sự nghiệp",n:6,fixedTopic:"work",desc:"Hiện trạng, điểm mạnh, trở ngại, cơ hội ẩn, hành động, kết quả.",q:["Sự nghiệp của tôi 6 tháng tới?","Tôi có nên đề xuất thăng chức lúc này?"]},
{id:"money",g:"topic",name:"Tài chính & Đầu tư",n:6,fixedTopic:"money",desc:"Tình hình, thói quen tiền bạc, rủi ro, cơ hội, cách hành động, kết quả.",q:["Tài chính của tôi trong 3–6 tháng tới?","Tôi cần lưu ý gì khi đầu tư vào …?"]},
{id:"health",g:"topic",name:"Sức khỏe & Tinh thần",n:5,fixedTopic:"health",desc:"Thể chất, tinh thần, gốc rễ mất cân bằng, điều giúp hồi phục, lời khuyên.",q:["Tôi nên chăm sóc sức khỏe và tinh thần thế nào thời gian này?"]},
{id:"luck",g:"topic",name:"May mắn & Cơ hội",n:4,desc:"Vận may hiện tại, cơ hội đến từ đâu, điều chặn vận may, cách đón cơ hội.",q:["Cơ hội nào đang đến với tôi?","Tôi cần làm gì để đón may mắn tháng này?"]},
{id:"avoid",g:"topic",name:"Phòng tránh rủi ro",n:5,topic:true,desc:"Rủi ro sắp tới, nguồn gốc, dấu hiệu sớm, cách phòng tránh, điểm tựa.",q:["Tôi cần đề phòng điều gì trong thời gian tới?","Kế hoạch kinh doanh của tôi có rủi ro gì?"]},
{id:"celtic",g:"deep",name:"Thập tự Celtic",n:10,topic:true,layout:"celtic",sig:true,desc:"Phương pháp 10 lá Waite giới thiệu trong The Pictorial Key to the Tarot (1910).",q:["Toàn cảnh vấn đề … của tôi và hướng giải quyết?"]}];
const SP={};SPREADS.forEach(s=>{SP[s.id]=s;});
const FIXED={
yn1:[["Câu trả lời","Xu hướng Có / Không và lý do.","topic","out"]],
yn3:[["Yếu tố hiện tại","Điều đang diễn ra quanh câu hỏi.","topic","yn"],["Yếu tố ẩn","Ảnh hưởng chưa lộ rõ, có thể thay đổi cục diện.","topic","yn"],["Xu hướng kết quả","Kết quả nếu mọi thứ tiếp diễn như hiện tại.","topic","out"]],
ppf:[["Quá khứ","Những gì đã dẫn tới tình huống hiện tại.","topic"],["Hiện tại","Năng lượng đang chi phối vấn đề lúc này.","topic"],["Tương lai gần","Xu hướng sắp tới nếu mọi thứ tiếp diễn như hiện tại.","topic","out"]],
action:[["Tình huống hiện tại","Bản chất của vấn đề bạn đang hỏi.","topic"],["Nên làm","Hướng hành động được ủng hộ.","adv"],["Không nên làm","Cái bẫy hoặc điều cần tránh.","warn"],["Kết quả nếu làm theo lời khuyên","Xu hướng khi bạn hành động đúng hướng.","topic","out"]],
love:[["Bạn trong chuyện tình cảm","Cảm xúc, mong muốn và trạng thái của bạn.","love"],["Người ấy / người sắp đến","Năng lượng của đối phương, hoặc người bạn sắp gặp nếu đang độc thân.","love"],["Mối liên kết","Điều đang gắn kết – hoặc có thể gắn kết – hai người.","love"],["Thử thách","Trở ngại cần vượt qua.","warn"],["Lời khuyên","Điều bạn nên làm cho chuyện tình cảm.","adv"],["Hướng phát triển","Xu hướng trong 1–3 tháng tới.","love","out"]],
career:[["Hiện trạng công việc","Bạn đang đứng ở đâu.","work"],["Điểm mạnh của bạn","Nguồn lực bạn có thể dựa vào.","gen"],["Trở ngại","Điều đang cản bước.","warn"],["Cơ hội ẩn","Hướng đi bạn chưa nhìn thấy.","work"],["Hành động nên làm","Bước đi cụ thể được ủng hộ.","adv"],["Kết quả","Xu hướng trong 3–6 tháng nếu làm theo lời khuyên.","work","out"]],
money:[["Tình hình tài chính","Bức tranh tiền bạc hiện tại.","money"],["Tư duy và thói quen tiền bạc","Thái độ bên trong đang chi phối cách bạn dùng tiền.","mind"],["Rủi ro cần đề phòng","Cái bẫy tài chính.","warn"],["Cơ hội","Nguồn thu hoặc kênh tiềm năng.","money"],["Cách hành động","Chiến lược phù hợp.","adv"],["Kết quả 3–6 tháng","Xu hướng tài chính nếu làm theo lời khuyên.","money","out"]],
health:[["Thể chất","Trạng thái cơ thể.","health"],["Tinh thần – cảm xúc","Trạng thái tâm lý.","mind"],["Gốc rễ mất cân bằng","Nguyên nhân sâu xa cần để ý.","warn"],["Điều giúp bạn hồi phục","Nguồn lực chữa lành.","gen"],["Lời khuyên chăm sóc","Việc nên làm cho thân và tâm.","adv","out"]],
luck:[["Vận may hiện tại","Năng lượng may mắn quanh bạn.","gen"],["Cơ hội đến từ đâu","Lĩnh vực hoặc con người mang cơ hội.","gen","",{domain:1}],["Điều đang chặn vận may","Thói quen hoặc niềm tin cần gỡ.","warn"],["Cách đón cơ hội","Hành động giúp bạn nắm bắt vận may.","adv","out"]],
avoid:[["Rủi ro sắp tới","Điều có thể xảy ra nếu không chú ý.","topic"],["Nguồn gốc rủi ro","Nó đến từ đâu – bên ngoài hay bên trong.","gen","",{domain:1}],["Dấu hiệu nhận biết sớm","Tín hiệu cần để ý.","warn"],["Cách phòng tránh","Việc nên làm ngay.","adv"],["Điểm tựa bảo vệ bạn","Nguồn lực và người hỗ trợ.","gen","out"]],
celtic:[["Hiện trạng – điều bao phủ","Bầu không khí chung đang bao trùm câu hỏi.","topic"],["Điều cắt ngang","Trở ngại hoặc lực tác động đang chắn ngang (đặt nằm ngang trên lá 1).","warn"],["Đỉnh đầu – mục tiêu","Lý tưởng của bạn; điều tốt nhất có thể đạt được nhưng chưa thành hiện thực.","topic"],["Nền móng – bên dưới","Gốc rễ của vấn đề; điều đã xảy ra và trở thành của bạn.","topic"],["Phía sau – vừa qua","Ảnh hưởng vừa qua hoặc đang qua đi.","topic"],["Phía trước – sắp tới","Ảnh hưởng sắp đến trong thời gian gần.","topic"],["Bản thân","Vị thế và thái độ của bạn trong hoàn cảnh này.","gen"],["Môi trường – ngôi nhà","Người xung quanh và ảnh hưởng từ bên ngoài.","topic"],["Hy vọng và nỗi sợ","Điều bạn mong – hoặc sợ; đôi khi là một.","mind"],["Kết quả","Xu hướng tổng hợp từ các lá trước.","topic","out"]]};
function P(t,d,lens,role,extra){return Object.assign({t,d,lens,role:role||""},extra||{});}
function optList(st){return (st.options||[]).slice(0,3).map((l,i)=>({letter:"ABC"[i],label:(l||"").trim()||("Lựa chọn "+"ABC"[i])}));}
function topicOf(st){const sp=SP[st.spreadId];return sp.fixedTopic||st.topic||"general";}
function positionsFor(st){const sp=SP[st.spreadId];
  if(sp.id==="day"){const d=parseDate(st.date);return [P("Năng lượng ngày "+fmtD(d),fmtFull(d)+" – chủ đề, cơ hội và lời nhắc.","day","out",{short:fmtD(d)})];}
  if(sp.id==="week"){const d0=parseDate(st.date);const a=[P("Chủ đề của 7 ngày",`Từ ${fmtD(d0)} đến ${fmtD(addDays(d0,6))}: bầu không khí và bài học chính.`,"topic","",{short:"Chủ đề"})];
    for(let i=0;i<7;i++){const d=addDays(d0,i);a.push(P(WD[d.getDay()]+" · "+fmtD(d),"Năng lượng nổi bật của ngày.","topic","day",{short:WD[d.getDay()].replace("Thứ ","T").replace("Chủ Nhật","CN")+" "+fmtD(d)}));}
    a.push(P("Lời khuyên cho cả tuần","Điều nên giữ trong tâm suốt 7 ngày.","adv","out",{short:"Lời khuyên"}));return a;}
  if(sp.id==="month"){const [y,m]=parseMonth(st.month);const last=new Date(y,m,0).getDate();const W=[[1,7],[8,14],[15,21],[22,last]];
    const a=[P(`Chủ đề tháng ${m}/${y}`,"Bầu không khí và bài học của cả tháng.","topic","",{short:"Chủ đề"})];
    W.forEach((w,i)=>a.push(P(`Tuần ${i+1} · ${pad(w[0])}–${pad(w[1])}/${pad(m)}`,"Diễn biến nổi bật của tuần.","topic","day",{short:`Tuần ${i+1}`})));
    a.push(P("Cơ hội của tháng","Điều nên nắm bắt.","gen","",{short:"Cơ hội"}),P("Thử thách cần lưu ý","Điều cần đề phòng.","warn","",{short:"Thử thách"}),P("Lời khuyên","Cách đi qua tháng này tốt nhất.","adv","",{short:"Lời khuyên"}),P("Kết quả cuối tháng","Xu hướng khi tháng khép lại.","topic","out",{short:"Kết quả"}));return a;}
  if(sp.id==="year"){const [y,m]=parseMonth(st.month);const a=[P("Chủ đề 12 tháng",`Từ tháng ${m}/${y}: chủ đề lớn của cả chặng.`,"topic","",{short:"Chủ đề"})];
    for(let i=0;i<12;i++){const mm=(m-1+i)%12+1,yy=y+Math.floor((m-1+i)/12);a.push(P(`Tháng ${mm}/${yy}`,"Năng lượng chính của tháng.","topic","day",{short:`Th ${mm}/${String(yy).slice(2)}`}));}return a;}
  if(sp.id==="choice"){const a=[P("Bạn lúc này","Gốc rễ của quyết định – bạn đang ở đâu, thật sự muốn gì.","topic","",{short:"Bạn lúc này"})];
    optList(st).forEach((o,i)=>{a.push(P(`${o.letter} · ${o.label}: diễn biến`,`Điều sẽ diễn ra khi chọn “${o.label}”.`,"topic","dev",{opt:i,short:`${o.letter} diễn biến`}));a.push(P(`${o.letter} · ${o.label}: kết quả`,`Kết quả có khả năng nhất của “${o.label}”.`,"topic","res",{opt:i,short:`${o.letter} kết quả`}));});
    a.push(P("Điều cần biết để quyết định","Lời khuyên chung, bất kể bạn chọn gì.","adv","",{short:"Lời khuyên"}));return a;}
  return FIXED[sp.id].map(x=>P(x[0],x[1],x[2],x[3],Object.assign({short:x[0].split(" – ")[0].split(" / ")[0]},x[4]||{})));}
function spreadCount(st){return positionsFor(st).length;}

/* ───────── interpretation ───────── */
function lensText(pos,c,rev,topic){
  switch(pos.lens){
    case "topic":case "day":return topicText(c,rev,topic);
    case "gen":return txt(c,"gen",rev);
    case "adv":return txt(c,"adv",rev);
    case "warn":
      if(rev)return txt(c,"gen",true);
      if(pol(c,false)<=0)return txt(c,"gen",false);
      return `Ở vị trí này, một lá vốn tích cực nhắc về mặt trái của chính năng lượng ấy – cần đề phòng ${lc(c.warn)}`;
    default:return txt(c,pos.lens,rev);}}
function analyze(picks){const cs=(picks||[]).filter(Boolean).map(p=>({c:BY[p.id],rev:!!p.rev}));const n=cs.length;const L=[];
  if(!n)return {lines:L,avg:0,n:0,label:polLabel(0)};
  const maj=cs.filter(x=>!x.c.s).length,rv=cs.filter(x=>x.rev).length;const suits={w:0,c:0,s:0,p:0};cs.forEach(x=>{if(x.c.s)suits[x.c.s]++;});
  const courts=cs.filter(x=>x.c.s&&x.c.r>10).length;const avg=cs.reduce((s,x)=>s+pol(x.c,x.rev),0)/n;
  if(n>=3){if(maj/n>=.5)L.push(`${maj}/${n} lá Ẩn chính: giai đoạn mang tính bước ngoặt, có những yếu tố lớn hơn chuyện thường ngày. Hãy chú ý bài học phía sau sự việc.`);
    else if(maj===0)L.push("Không có lá Ẩn chính: tình huống chủ yếu nằm trong tầm tay bạn và thay đổi được bằng lựa chọn hằng ngày.");
    else L.push(`${maj}/${n} lá Ẩn chính: xen giữa chuyện thường ngày là ${maj===1?"một yếu tố":"vài yếu tố"} định hướng quan trọng.`);}
  const top=Object.entries(suits).sort((a,b)=>b[1]-a[1])[0];
  if(n>=3&&top[1]>=2&&top[1]/n>=.4)L.push(`Bộ ${SUITS[top[0]].vi} chiếm ưu thế (${top[1]}/${n}): trọng tâm nằm ở ${SUITS[top[0]].dom}.`);
  if(n>=7){const miss=Object.keys(suits).filter(k=>!suits[k]);if(miss.length&&miss.length<4)L.push(`Vắng bộ ${miss.map(k=>SUITS[k].vi).join(", ")}: lĩnh vực ${miss.map(k=>SUITS[k].area.split(",")[0]).join(", ")} ít tác động, hoặc đang bị bỏ quên.`);}
  if(n>=3){if(rv/n>=.5)L.push(`${rv}/${n} lá ngược: năng lượng đang bị chặn, chậm, hoặc cần xử lý từ bên trong trước khi thấy kết quả bên ngoài.`);else if(rv===0)L.push("Không có lá ngược: năng lượng lưu thông thuận chiều.");}
  if(courts>=2)L.push(`${courts} lá triều đình: nhiều người tham gia vào vấn đề, hoặc bạn đang phải đóng nhiều vai.`);
  const rk={};cs.forEach(x=>{if(x.c.s&&x.c.r<=10)rk[x.c.r]=(rk[x.c.r]||0)+1;});
  Object.keys(rk).forEach(r=>{if(rk[r]>=2)L.push(`${r==1?"Át":"Số "+r} xuất hiện ${rk[r]} lần: chủ đề ${NUM_MEAN[r]}.`);});
  return {lines:L,avg,n,maj,rev:rv,label:polLabel(avg)};}
function yesno(st,poss){const ps=st.picks;let s=0,w=0;ps.forEach((p,i)=>{const wt=poss[i].role==="out"?1.5:1;s+=pol(BY[p.id],p.rev)*wt;w+=wt;});s=s/w;
  const v=s>=1.5?["CÓ","Các lá ủng hộ rõ ràng.","ok"]:s>=.5?["Nghiêng về CÓ","Thuận lợi, nhưng cần bạn chủ động.","ok"]:s>-.5?["CHƯA RÕ","Kết quả phụ thuộc nhiều vào hành động và thời điểm của bạn.","warn"]:s>-1.5?["Nghiêng về KHÔNG","Có trở ngại đáng kể – xem lời khuyên để biết điều kiện thay đổi.","warn"]:["KHÔNG (lúc này)","Các lá cho thấy chưa phải lúc hoặc chưa phải hướng đi phù hợp.","bad"];
  return {score:s,v};}
function choiceScores(st,poss){return optList(st).map((o,i)=>{let dev=null,res=null;poss.forEach((p,k)=>{const pk=st.picks[k];if(p.opt===i&&pk){const x={c:BY[pk.id],r:!!pk.rev};if(p.role==="dev")dev=x;if(p.role==="res")res=x;}});
  const s=(dev?pol(dev.c,dev.r):0)+1.5*(res?pol(res.c,res.r):0);return Object.assign({},o,{dev,res,score:s,pct:Math.max(0,Math.min(100,Math.round((s+5)/10*100)))});});}

/* ───────── journal store ───────── */
const Store={status:"init",cloud:[],local:lsGet("journal",[]),deleted:lsGet("deleted",{}),col:null,
  async init(){try{
      if(!window.claude||!window.claude.use){this.status="local";return this.emit();}
      const [db,user]=await Promise.all([window.claude.use("db"),window.claude.use("user")]);
      if(!db||!user){this.status="local";return this.emit();}
      const uid=await user.id();if(!uid){this.status="local";return this.emit();}
      this.col=db.collection("data/users/"+uid);this.status="connecting";this.emit();
      const timer=setTimeout(()=>{if(this.status==="connecting"){this.status="slow";this.emit();}},10000);
      this.col.onSnapshot(snap=>{if(!snap.metadata.fromCache)clearTimeout(timer);
          this.cloud=snap.docs.filter(d=>d.exists).map(d=>Object.assign({},d.data(),{id:d.id,src:"cloud"})).filter(x=>x.kind==="reading");
          this.status="cloud";this.emit();},
        ()=>{clearTimeout(timer);this.col=null;this.status="local";this.emit();});
    }catch(e){this.status="local";this.emit();}},
  all(){return this.cloud.concat(this.local.map(x=>Object.assign({},x,{src:"local"}))).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));},
  find(id){return this.all().find(x=>x.id===id);},
  async save(entry){const id=entry.id||("r"+Date.now().toString(36)+rnd(1e6).toString(36));const body=JSON.parse(JSON.stringify(entry));delete body.id;delete body.src;
    if(this.col&&entry.src!=="local"){try{await this.col.doc(id).set(body);return {id,src:"cloud"};}catch(e){if(entry.src==="cloud")throw e;}}
    const rec=Object.assign({id},body);const i=this.local.findIndex(x=>x.id===id);if(i>=0)this.local[i]=rec;else this.local.unshift(rec);lsSet("journal",this.local);this.emit();Sync.schedule();return {id,src:"local"};},
  async remove(id){const it=this.find(id);if(!it)return;if(it.src==="cloud"&&this.col){await this.col.doc(id).delete();}else{this.local=this.local.filter(x=>x.id!==id);this.deleted[id]=new Date().toISOString();lsSet("journal",this.local);lsSet("deleted",this.deleted);this.emit();Sync.schedule();}},
  emit(){if(S.view==="nhat-ky")paintJournal();else if(S.view==="xem"&&S.step==="home")renderRead();const n=$("#store-note");if(n)n.textContent=storeNote();}};
function storeNote(){return Store.status==="cloud"?"Lưu riêng tư trong tài khoản của bạn – chỉ bạn xem được.":Store.status==="connecting"||Store.status==="init"?"Đang kết nối kho nhật ký…":Store.status==="slow"?"Kho nhật ký phản hồi chậm; bản lưu có thể chưa hiện ngay.":"Lưu trên trình duyệt này. Mở trang trên claude.ai để lưu vào tài khoản.";}

/* ───────── Claude (sample) ───────── */
let samplePromise=null;
function getSample(){if(!samplePromise){samplePromise=(async()=>{try{if(!window.claude||!window.claude.use)return null;return await window.claude.use("sample");}catch(e){return null;}})();}return samplePromise;}
const AIERR={not_granted:"Trang chưa được phép dùng Claude. Bạn có thể bật trong mục Quyền của trang.",sampling_disabled:"Claude chưa khả dụng cho tài khoản này.",not_declared:"Tính năng này đang tắt.",capability_disabled:"Tính năng này không chạy được ở chế độ xem hiện tại.",capability_removed:"Ứng dụng Claude của bạn cần cập nhật để dùng tính năng này.",rate_limited:"Bạn đã dùng nhiều lượt trong thời gian ngắn. Hãy thử lại sau ít phút.",session_expired:"Phiên đăng nhập đã hết hạn – hãy đăng nhập lại claude.ai.",refused:"Claude không trả lời yêu cầu này. Hãy diễn đạt lại câu hỏi.",prompt_too_large:"Nội dung quá dài, hãy rút ngắn câu hỏi.",empty_completion:"Claude không trả về nội dung. Hãy thử lại.",upstream_error:"Kết nối bị gián đoạn. Hãy thử lại."};
const AIBLOCK=["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"];
let aiCtl=null,paintQueued=false;
function md(t){const lines=esc(t).split("\n");let h="",list=null;
  const inl=s=>s.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s).,:;!?]|$)/g,"$1<em>$2</em>");
  const close=()=>{if(list){h+=`</${list}>`;list=null;}};
  for(const raw of lines){const l=raw.trimEnd();let m;
    if((m=l.match(/^(#{1,6})\s+(.*)/))){close();h+=m[1].length<=2?`<h4>${inl(m[2])}</h4>`:`<h5>${inl(m[2])}</h5>`;}
    else if((m=l.match(/^\s*[-*•]\s+(.*)/))){if(list!=="ul"){close();h+="<ul>";list="ul";}h+=`<li>${inl(m[1])}</li>`;}
    else if((m=l.match(/^\s*\d+[.)]\s+(.*)/))){if(list!=="ol"){close();h+="<ol>";list="ol";}h+=`<li>${inl(m[1])}</li>`;}
    else if(!l.trim()){close();}
    else if(/^-{3,}$/.test(l.trim())){close();}
    else{close();h+=`<p>${inl(l)}</p>`;}}
  close();return h;}
function buildPrompt(st){const sp=SP[st.spreadId];const poss=positionsFor(st);const topic=topicOf(st);const an=analyze(st.picks);
  const sub=st.subject||{};const bc=birthCards(sub.birth);
  const who=sub.type==="other"?`Xem cho người khác: ${sub.name||"(không nêu tên)"}${sub.relation?" – "+sub.relation:""}. Người đọc bài là người xem; khi nói về người được xem hãy gọi tên hoặc dùng ngôi thứ ba.`:"Người hỏi tự xem cho bản thân; xưng hô “bạn”.";
  let extra="";
  if(sp.id==="choice")extra="\n- Các lựa chọn: "+optList(st).map(o=>`${o.letter} = “${o.label}”`).join("; ");
  if(sp.date==="day")extra+=`\n- Mốc thời gian: ${fmtFull(parseDate(st.date))}`;
  if(sp.date==="month")extra+=`\n- Mốc thời gian: từ tháng ${parseMonth(st.month).reverse().join("/")}`;
  if(st.sig&&BY[st.sig])extra+=`\n- Lá đại diện (significator): ${BY[st.sig].en} / ${BY[st.sig].vi}`;
  if(bc)extra+=`\n- Lá chủ mệnh (thần số học tarot): nhân cách ${bc.pers.vi}, linh hồn ${bc.soul.vi}, lá năm ${bc.yearNum}: ${bc.year.vi}`;
  const lines=poss.map((p,i)=>{const pk=st.picks[i];const c=BY[pk.id];return `${i+1}. ${p.t} — ${p.d}\n   Lá: ${c.en} / ${c.vi} — ${pk.rev?"NGƯỢC":"Xuôi"}\n   Hình ảnh (Pamela Colman Smith): ${c.img}\n   Từ khóa: ${pk.rev?c.kr:c.ku}`;}).join("\n");
  let ask="## Trả lời câu hỏi — trả lời trực tiếp, cụ thể câu hỏi của người hỏi.";
  if(sp.kind==="day")ask="## Dự báo trong ngày — năng lượng chung, công việc, tình cảm, tài chính, sức khỏe và tinh thần; việc nên làm, điều nên tránh.";
  if(sp.kind==="week")ask="## Dự báo từng ngày — mỗi ngày 1–2 câu (ghi rõ thứ và ngày), sau đó nêu ngày thuận lợi nhất và ngày cần thận trọng.";
  if(sp.kind==="month")ask="## Dự báo từng tuần — mỗi tuần 2–3 câu kèm mốc ngày; nêu cơ hội, thử thách và kết quả cuối tháng.";
  if(sp.kind==="year")ask="## Dự báo từng tháng — mỗi tháng 1–2 câu; chỉ ra 2–3 tháng thuận lợi nhất và 1–2 tháng cần thận trọng.";
  if(sp.kind==="yesno"){const y=yesno(st,poss);ask=`## Trả lời Có / Không — nói rõ nghiêng về CÓ, KHÔNG hay CHƯA RÕ, mức độ chắc chắn, và điều kiện có thể làm kết quả thay đổi. (Chấm điểm tham khảo của app: ${y.v[0]}.)`;}
  if(sp.kind==="choice"){const cs=choiceScores(st,poss);ask=`## So sánh các lựa chọn — phân tích từng lựa chọn (diễn biến + kết quả), xếp hạng, nêu lựa chọn nên ưu tiên và điều kiện để lựa chọn khác vẫn tốt. (Điểm thuận lợi tham khảo của app: ${cs.map(o=>`${o.letter} ${o.pct}%`).join(", ")}.)`;}
  const n=poss.length;const len=n<=3?"350–550":n<=6?"500–800":"700–1100";
  const sens=["health","money"].includes(topic)||["health","money"].includes(sp.id);
  return `Bạn là một tarot reader nhiều kinh nghiệm, đọc theo hệ Rider–Waite–Smith (bộ Smith-Waite Centennial; tranh của Pamela Colman Smith; Sức Mạnh = VIII, Công Lý = XI). Hãy luận giải trải bài dưới đây bằng tiếng Việt: ấm áp, rõ ràng, cụ thể, bám sát câu hỏi và chi tiết hình ảnh trên lá; không nói chung chung, không phán định mệnh, không gây sợ hãi.

THÔNG TIN
- Ngày xem: ${fmtFull(new Date(st.createdAt||Date.now()))}
- ${who}
- Chủ đề: ${TOPICS[topic]}
- Câu hỏi: ${st.question?`“${st.question}”`:"(không nêu – đọc như lời dẫn tổng quát cho chủ đề)"}
- Trải bài: ${sp.name}${extra}
- Cách bốc: ${st.mode==="digital"?"bốc ngẫu nhiên trong app":"bốc từ bộ bài thật"}${st.reversals?", có dùng lá ngược":", không dùng lá ngược"}

CÁC LÁ THEO VỊ TRÍ
${lines}

PHÂN TÍCH MẪU (do app tính)
${an.lines.map(l=>"- "+l).join("\n")||"- (ít lá, không đủ để phân tích mẫu)"}
- Xu hướng chung: ${an.label[0]}

YÊU CẦU TRÌNH BÀY (Markdown, tiêu đề ## và gạch đầu dòng; khoảng ${len} từ)
## Tổng quan
## Từng vị trí — mỗi lá 2–4 câu: ý nghĩa của lá tại đúng vị trí đó, liên hệ trực tiếp câu hỏi; dựa vào chi tiết tranh và chiều xuôi/ngược.
## Mạch câu chuyện — các lá nối với nhau thế nào (hướng nhìn nhân vật, nguyên tố hỗ trợ hay xung khắc, con số lặp lại).
${ask}
## Việc nên làm — 3 đến 5 hành động cụ thể, có thể làm ngay.
Kết thúc bằng một câu ngắn nhắc rằng tarot mang tính tham khảo${sens?"; với sức khỏe và tài chính hãy hỏi ý kiến chuyên gia":""}. Không lặp lại lời nhắc này ở chỗ khác.`;}

/* ───────── state ───────── */
const S={view:"xem",step:"home",spreadId:"day",subject:{type:"self",name:"",relation:"",birth:lsGet("selfBirth",""),consent:false},
  question:"",topic:"general",options:["",""],date:todayISO(),month:thisMonth(),sig:"",mode:lsGet("mode","physical"),reversals:lsGet("rev",true),
  picks:[],positions:[],d:null,ai:{text:"",status:"idle",qa:[],busy:false},notes:"",outcome:"",createdAt:null,savedId:null,savedSrc:null,pickerIdx:null,pickRev:false};
const L={q:"",f:"all"};const J={q:"",who:"all",confirm:null};const PK={q:"",f:"all"};
function setPath(obj,path,val){const ks=path.split(".");let o=obj;for(let i=0;i<ks.length-1;i++){o=o[ks[i]];}const k=ks[ks.length-1];if(Array.isArray(o))o[+k]=val;else o[k]=val;}

/* ───────── router ───────── */
const VIEWS=["xem","tra-bai","huong-dan","nhat-ky"];
function route(){const h=(location.hash||"").replace("#","");const v=VIEWS.includes(h)?h:"xem";S.view=v;
  VIEWS.forEach(x=>{$("#v-"+x).hidden=x!==v;});
  document.querySelectorAll(".tab").forEach(t=>{if(t.dataset.tab===v)t.setAttribute("aria-current","page");else t.removeAttribute("aria-current");});
  if(v==="xem")renderRead();else if(v==="tra-bai")renderLibrary();else if(v==="nhat-ky")renderJournal();else renderBirth();}
function go(v){if(location.hash!=="#"+v)location.hash=v;else route();}
function top(){window.scrollTo({top:0});}

/* ───────── read flow ───────── */
function renderRead(){const el=$("#v-xem");
  if(S.step==="setup")el.innerHTML=vSetup();else if(S.step==="draw")el.innerHTML=vDraw();else if(S.step==="result")el.innerHTML=vResult();else el.innerHTML=vHome();}
function vHome(){const d=new Date();const todays=Store.all().find(e=>e.spreadId==="day"&&e.date===todayISO()&&(!e.subject||e.subject.type!=="other")&&e.picks&&e.picks[0]&&BY[e.picks[0].id]);
  const fan=[["m10",-16,-64],["m17",0,0],["m19",16,64]].map(([id,r,x])=>`<div class="fan-card" style="transform:translateX(${x}px) rotate(${r}deg)">${tile(BY[id],false,96)}</div>`).join("");
  return `<section class="hero"><div>
    <p class="eyebrow">${fmtFull(d)}</p>
    <h1>Hôm nay bạn muốn hỏi bài điều gì?</h1>
    <p class="lede">Bốc từ bộ Smith-Waite của bạn rồi chọn lá vào đây, hoặc để app xáo và bốc giúp. Mỗi lá được giải theo đúng vị trí, chiều xuôi/ngược và chủ đề bạn hỏi.</p>
    <div class="hero-actions"><button class="btn gold" data-act="start" data-id="day">Lá bài hôm nay</button><button class="btn ghost" data-act="start" data-id="week">Dự báo 7 ngày</button><button class="btn ghost" data-act="start" data-id="month">Dự báo tháng</button><button class="btn ghost" data-act="start" data-id="choice">Chọn A, B hay C</button></div>
    ${todays?`<div class="today">${tile(BY[todays.picks[0].id],todays.picks[0].rev,40)}<div>Lá hôm nay của bạn: <b>${esc(BY[todays.picks[0].id].vi)}</b>${todays.picks[0].rev?" (ngược)":""}. <button class="btn link" data-act="openEntry" data-id="${esc(todays.id)}">Xem lại</button></div></div>`:""}
  </div><div class="fan" aria-hidden="true">${fan}</div></section>
  <section class="steps3"><div><b>Chọn trải bài</b>Đặt câu hỏi, chọn chủ đề và người được xem.</div><div><b>Bốc bài</b>Dùng bộ bài thật rồi nhập từng lá, hoặc bốc ngay trong app.</div><div><b>Đọc và lưu</b>Giải nghĩa từng lá, nhờ Claude luận giải tổng hợp, lưu nhật ký để kiểm chứng.</div></section>
  <div class="groups">${GROUPS.map(g=>`<section class="group"><h2>${g[1]} <small>${g[2]}</small></h2><div class="spread-list">${SPREADS.filter(s=>s.g===g[0]).map(s=>`<button class="sp" data-act="start" data-id="${s.id}"><span class="cnt">${s.id==="choice"?"6–8":s.n}</span><b>${esc(s.name)}</b><span class="d">${esc(s.desc)}</span></button>`).join("")}</div></section>`).join("")}</div>`;}

function birthChip(iso){const b=birthCards(iso);if(!b)return "";return `<div class="birthchip">Lá chủ mệnh: <b>${esc(b.pers.vi)}</b> (${ROMAN[b.pers.n]}) · linh hồn: <b>${esc(b.soul.vi)}</b> · lá năm ${b.yearNum}: <b>${esc(b.year.vi)}</b></div>`;}
function vSetup(){const sp=SP[S.spreadId];const subj=S.subject;const other=subj.type==="other";
  const dateField=sp.date==="day"?`<div class="field"><label for="f-date">${sp.id==="week"?"Bắt đầu từ ngày":"Ngày muốn xem"}</label><input type="date" id="f-date" data-bind="date" value="${esc(S.date)}"><div class="chips"><button type="button" class="chip" data-act="quickDate" data-v="0">Hôm nay</button><button type="button" class="chip" data-act="quickDate" data-v="1">Ngày mai</button>${sp.id==="week"?'<button type="button" class="chip" data-act="quickDate" data-v="mon">Thứ Hai tới</button>':""}</div></div>`
    :sp.date==="month"?`<div class="field"><label for="f-month">${sp.id==="year"?"Bắt đầu từ tháng":"Tháng muốn xem"}</label><input type="month" id="f-month" data-bind="month" value="${esc(S.month)}"></div>`:"";
  const topicSel=sp.topic?`<fieldset class="fs"><legend>Chủ đề muốn hỏi</legend><div class="chips">${Object.keys(TOPICS).map(k=>`<button type="button" class="chip" data-act="setTopic" data-id="${k}" aria-pressed="${S.topic===k}">${TOPICS[k]}</button>`).join("")}</div><p class="small muted">Chủ đề quyết định lá được giải theo góc tình cảm, công việc, tiền bạc… hay tổng quát.</p></fieldset>`:"";
  const opts=sp.id==="choice"?`<fieldset class="fs"><legend>Các lựa chọn</legend>${S.options.map((o,i)=>`<div class="field"><label for="f-opt${i}">Lựa chọn ${"ABC"[i]}</label><div class="row" style="flex-wrap:nowrap"><input type="text" id="f-opt${i}" data-bind="options.${i}" value="${esc(o)}" placeholder="${["Ví dụ: Nhận việc ở công ty X","Ví dụ: Ở lại công ty hiện tại","Ví dụ: Tự kinh doanh"][i]}">${i===2?'<button type="button" class="btn sm ghost" data-act="rmOpt" aria-label="Bỏ lựa chọn C">Bỏ</button>':""}</div></div>`).join("")}${S.options.length<3?'<button type="button" class="btn sm ghost" data-act="addOpt" style="justify-self:start">+ Thêm lựa chọn C</button>':""}</fieldset>`:"";
  const sig=sp.sig?`<div class="field"><label for="f-sig">Lá đại diện (không bắt buộc)</label><select id="f-sig" data-bind="sig"><option value="">Không dùng lá đại diện</option>${COURTS.map(c=>`<option value="${c.id}" ${S.sig===c.id?"selected":""}>${esc(c.vi)} · ${esc(c.en)}</option>`).join("")}</select><p class="small muted">Waite rút một lá triều đình đại diện người hỏi ra trước khi xáo. Xem mục Hướng dẫn để chọn.</p></div>`:"";
  return `<button class="btn link backlink" data-act="home">← Chọn trải bài khác</button>
  <div class="rhead"><p class="eyebrow">Bước 1 · Đặt câu hỏi</p><h1>${esc(sp.name)}</h1><p class="muted" style="max-width:62ch">${esc(sp.desc)}</p></div>
  <div class="setup"><div class="panel form">
    <fieldset class="fs"><legend>Xem cho ai</legend>
      <div class="seg" role="group" aria-label="Người được xem"><button type="button" data-act="setSubject" data-v="self" aria-pressed="${!other}">Cho bản thân</button><button type="button" data-act="setSubject" data-v="other" aria-pressed="${other}">Cho người khác</button></div>
      ${other?`<div class="grid2"><div class="field"><label for="f-name">Tên người được xem</label><input type="text" id="f-name" data-bind="subject.name" value="${esc(subj.name)}" placeholder="Ví dụ: Lan"></div><div class="field"><label for="f-rel">Mối quan hệ (không bắt buộc)</label><input type="text" id="f-rel" data-bind="subject.relation" value="${esc(subj.relation)}" placeholder="Bạn thân, đồng nghiệp…"></div></div>`:""}
      <div class="field"><label for="f-birth">Ngày sinh ${other?"của người được xem":"của bạn"} (không bắt buộc)</label><input type="date" id="f-birth" data-bind="subject.birth" value="${esc(subj.birth)}"><div id="birth-chip">${birthChip(subj.birth)}</div></div>
      ${other?`<label class="check"><input type="checkbox" id="f-consent" data-bind="subject.consent" ${subj.consent?"checked":""}><span>Người này đã đồng ý được xem bài và tự đặt câu hỏi.</span></label>`:""}
    </fieldset>
    ${dateField}${topicSel}
    <div class="field"><label for="f-q">Câu hỏi</label><textarea id="f-q" data-bind="question" placeholder="Viết câu hỏi mở, có khung thời gian. Ví dụ: Tôi nên làm gì để công việc thuận lợi hơn trong tháng này?">${esc(S.question)}</textarea>
      <div class="chips">${(sp.q||[]).map(q=>`<button type="button" class="chip" data-act="sugg" data-v="${esc(q)}">${esc(q)}</button>`).join("")}</div></div>
    ${opts}${sig}
    <fieldset class="fs"><legend>Cách bốc bài</legend>
      <div class="seg" role="group" aria-label="Cách bốc"><button type="button" data-act="setMode" data-v="physical" aria-pressed="${S.mode==="physical"}">Bộ bài thật của tôi</button><button type="button" data-act="setMode" data-v="digital" aria-pressed="${S.mode==="digital"}">Bốc trong app</button></div>
      <label class="check"><input type="checkbox" id="f-rev" data-bind="reversals" ${S.reversals?"checked":""}><span>Dùng lá ngược (khuyên dùng khi đã quen bài)</span></label>
    </fieldset>
    <div class="row"><button class="btn gold" data-act="toDraw" id="go-draw">Tiếp tục: bốc ${spreadCount(S)} lá</button></div>
  </div>
  <aside class="panel"><h3 style="margin-bottom:12px">Các vị trí trong trải bài</h3><ol class="poslist" id="poslist">${posList()}</ol>
    <p class="note" style="margin-top:16px"><b>Mẹo:</b> một câu hỏi – một trải bài. Hỏi “tôi nên làm gì…”, “điều gì cần biết về…” sẽ cho câu trả lời rõ hơn “có chắc chắn… không”.</p></aside></div>`;}
function posList(){return positionsFor(S).map(p=>`<li><div><b>${esc(p.t)}</b><small>${esc(p.d)}</small></div></li>`).join("");}
function refreshSetupAside(){const pl=$("#poslist");if(pl)pl.innerHTML=posList();const g=$("#go-draw");if(g)g.textContent=`Tiếp tục: bốc ${spreadCount(S)} lá`;}

function vDraw(){const sp=SP[S.spreadId];const poss=S.positions;const n=poss.length;
  const head=`<button class="btn link backlink" data-act="toSetup">← Sửa câu hỏi</button>
  <div class="rhead"><p class="eyebrow">Bước 2 · Bốc bài</p><h1>${esc(sp.name)} · ${n} lá</h1>${S.question?`<p class="question">“${esc(S.question)}”</p>`:""}</div>
  <div class="row"><div class="seg" role="group" aria-label="Cách bốc"><button type="button" data-act="setMode" data-v="physical" aria-pressed="${S.mode==="physical"}">Bộ bài thật của tôi</button><button type="button" data-act="setMode" data-v="digital" aria-pressed="${S.mode==="digital"}">Bốc trong app</button></div></div>`;
  return head+(S.mode==="digital"?vDigital():vPhysical());}
function vPhysical(){const poss=S.positions;const n=poss.length;const filled=S.picks.filter(Boolean).length;const sig=S.sig&&BY[S.sig];
  const fig=s=>`<div class="rart">${s}</div>`;
  const steps=[`${fig(RA.tinh())}<b>Tĩnh tâm.</b> Hít thở chậm 3 nhịp và nhẩm câu hỏi${S.question?`: “${esc(S.question)}”`:""}.`];
  if(sig)steps.push(`<b>Rút lá đại diện</b> ${esc(sig.vi)} (${esc(sig.en)}) ra khỏi bộ, đặt ngửa ở giữa bàn.`);
  if(S.reversals)steps.push(`${fig(RA.xoay())}<b>Xoay nửa bộ:</b> chia bộ làm đôi, xoay một nửa 180° rồi gộp lại.`);
  steps.push(`${fig(RA.xao())}<b>Xáo bài</b> đến khi thấy đủ.${S.subject.type==="other"?" Nếu gặp trực tiếp, để người được xem tự xáo; nếu xem từ xa, vừa xáo vừa nhẩm tên và câu hỏi của họ.":""}`);
  steps.push(`${fig(RA.cat())}<b>Cắt bài</b> bằng tay trái thành 3 chồng, gộp lại theo thứ tự bạn thấy đúng.`);
  steps.push(`${fig(RA.rut(n))}<b>Rút ${n} lá</b> từ trên xuống (hoặc trải quạt và chọn), ${n>1?`đặt lần lượt vào vị trí 1 → ${n}`:"đặt vào vị trí 1"}.`);
  steps.push(`${fig(RA.lat())}<b>Lật ngang</b> từng lá như lật trang sách để giữ đúng chiều, rồi chọn lá tương ứng bên dưới.`);
  return `<p class="note"><b>Bốc ${n} lá</b> – mỗi vị trí bên dưới là 1 lá. Rút lần lượt từ trên cùng của bộ bài đã xáo: lá thứ nhất đặt vào vị trí 1, ${n>1?"lá thứ hai vào vị trí 2… đến vị trí "+n+".":"chỉ cần đúng 1 lá."}</p>
  <details class="ritual" ${lsGet("ritualOpen",true)?"open":""} data-ritual><summary>Nghi thức bốc từ bộ bài thật</summary><ol>${steps.map(s=>`<li>${s}</li>`).join("")}</ol></details>
  <div class="slots">${poss.map((p,i)=>slotRow(p,i)).join("")}</div>
  <div class="row"><button class="btn gold" data-act="interpret" ${filled===n?"":"disabled"}>Giải bài</button><span class="muted small">${filled}/${n} lá đã chọn${filled<n?" – chạm “Chọn lá” ở từng vị trí":""}</span></div>`;}
function slotRow(p,i){const pk=S.picks[i];const c=pk&&BY[pk.id];
  return `<div class="slot ${c?"done":""}"><span class="pnum">${i+1}</span><div class="si"><b>${esc(p.t)}</b><small>${esc(p.d)}</small></div><div class="pick">${c?`${tile(c,pk.rev,44)}<div class="pickname"><b>${esc(c.vi)}</b><br><span class="muted">${esc(c.en)}</span></div>${S.reversals?`<div class="seg" role="group" aria-label="Chiều lá ${i+1}"><button type="button" data-act="setRev" data-i="${i}" data-v="0" aria-pressed="${!pk.rev}">Xuôi</button><button type="button" data-act="setRev" data-i="${i}" data-v="1" aria-pressed="${!!pk.rev}">Ngược</button></div>`:""}<button class="btn sm ghost" data-act="pick" data-i="${i}">Đổi</button>`:`<button class="btn sm" data-act="pick" data-i="${i}">Chọn lá</button>`}</div></div>`;}
function vDigital(){const n=S.positions.length;const d=S.d||(S.d={stage:"shuffle",deck:null,chosen:[],anim:false,shuffles:0});
  if(d.stage==="shuffle")return `<div class="stage"><p>Tập trung vào câu hỏi rồi bấm <b>Xáo bài</b>. Bạn có thể xáo nhiều lần cho đến khi thấy đủ.${S.reversals?" Khoảng một nửa số lá được xoay ngược ngẫu nhiên, như khi bạn xoay nửa bộ bài thật.":""}</p>
    <div class="row ${d.anim?"shuffle-anim":""}" style="justify-content:center;padding:10px 0">${back(70)}${back(70)}${back(70)}</div>
    <p class="small muted" style="text-align:center">${d.shuffles?`Đã xáo ${d.shuffles} lần.`:"Chưa xáo."}</p>
    <div class="row" style="justify-content:center"><button class="btn gold" data-act="dShuffle">${d.shuffles?"Xáo thêm":"Xáo bài"}</button>${d.deck?'<button class="btn" data-act="dToCut">Cắt bài →</button>':""}<button class="btn link" data-act="dAuto">Bốc nhanh giúp tôi</button></div></div>`;
  if(d.stage==="cut")return `<div class="stage"><p>Bộ bài đã được chia làm ba chồng. Chọn <b>một chồng</b> để đặt lên trên cùng.</p><div class="piles">${[0,1,2].map(k=>`<button class="pile" data-act="dCut" data-v="${k}"><span class="stack">${back(70)}<span style="position:absolute;left:3px;top:-3px">${back(70)}</span><span style="position:absolute;left:6px;top:-6px">${back(70)}</span></span>Chồng ${k+1}</button>`).join("")}</div></div>`;
  const ch=d.chosen;return `<div class="stage"><p>Chạm chọn <b>${n} lá</b> theo trực giác. Lá được chọn trước đặt vào vị trí trước. <b>${ch.length}/${n}</b></p>
    <div class="deckgrid">${d.deck.map((x,i)=>{const o=ch.indexOf(i);return `<button data-act="dChoose" data-v="${i}" ${o<0&&ch.length>=n?"disabled":""} aria-label="Lá úp số ${i+1}${o>=0?", đã chọn cho vị trí "+(o+1):""}">${back(48)}${o>=0?`<span class="order">${o+1}</span>`:""}</button>`;}).join("")}</div>
    <div class="row"><button class="btn gold" data-act="dReveal" ${ch.length===n?"":"disabled"}>Lật bài &amp; giải</button><button class="btn ghost" data-act="dUndo" ${ch.length?"":"disabled"}>Bỏ lá vừa chọn</button><button class="btn link" data-act="dRestart">Xáo lại từ đầu</button></div></div>`;}
function freshDeck(){const ex=S.sig;return CARDS.filter(c=>c.id!==ex).map(c=>({id:c.id,rev:false}));}
function shuffleDeck(deck){for(let i=deck.length-1;i>0;i--){const j=rnd(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
  if(S.reversals)deck.forEach(x=>{if(rnd(2))x.rev=!x.rev;});else deck.forEach(x=>{x.rev=false;});return deck;}

function vResult(){const sp=SP[S.spreadId];const poss=S.positions;const topic=topicOf(S);const an=analyze(S.picks);const subj=S.subject;
  const meta=[`<span>${fmtStamp(S.createdAt)}</span>`,`<span>${subj.type==="other"?"Xem cho "+esc(subj.name||"người khác")+(subj.relation?" ("+esc(subj.relation)+")":""):"Xem cho bản thân"}</span>`,`<span>Chủ đề: ${TOPICS[topic]}</span>`,`<span>${S.mode==="digital"?"Bốc trong app":"Bộ bài thật"}${S.reversals?" · có lá ngược":""}</span>`];
  const sig=S.sig&&BY[S.sig];
  return `<button class="btn link backlink" data-act="home">← Trải bài khác</button>
  <div class="rhead"><p class="eyebrow">Kết quả · ${esc(sp.name)}</p><h1>${S.question?esc(S.question):esc(sp.name)}</h1><div class="meta">${meta.join("")}</div>${birthChip(subj.birth)}</div>
  ${poss.length>1?`<section class="map" aria-label="Sơ đồ trải bài">${sig?`<p class="small muted" style="margin-bottom:10px">Lá đại diện: <b>${esc(sig.vi)}</b> (${esc(sig.en)})</p>`:""}${vMap()}</section>`:""}
  ${vVerdict(an)}
  ${an.lines.length?`<section class="panel patterns"><p class="eyebrow">Bức tranh chung</p><h2>Đọc tổng thể ${poss.length} lá</h2><ul>${an.lines.map(l=>`<li>${esc(l)}</li>`).join("")}</ul></section>`:""}
  <section style="display:grid;gap:14px"><h2>Giải nghĩa từng vị trí</h2>${poss.map((p,i)=>vPos(p,i,topic)).join("")}</section>
  <section class="ai" id="ai"><div><p class="eyebrow">Luận giải tổng hợp</p><h2>Đọc cả trải bài thành một câu chuyện</h2></div><p class="muted small" style="max-width:68ch">${IN_CLAUDE?"Claude đọc câu hỏi, từng vị trí, chiều xuôi/ngược và hình ảnh trên lá để viết bài luận giải liền mạch, rồi trả lời câu hỏi thêm (dùng lượt Claude của bạn). Hoặc dùng luận giải tự động của app, chạy không cần mạng.":"Luận giải tự động chạy ngay trên máy, không cần mạng. Muốn bài đọc sâu hơn và hỏi thêm, bấm “Chép lời nhắc” rồi dán vào Claude trên điện thoại hoặc máy tính."}</p><div id="ai-body">${aiBody()}</div></section>
  ${vSave()}
  <div class="row"><button class="btn ghost" data-act="editCards">Sửa lá đã bốc</button><button class="btn ghost" data-act="again">Bốc lại trải này</button><button class="btn ghost" data-act="home">Trải bài khác</button></div>`;}
function mslot(i,w){const pk=S.picks[i];const c=BY[pk.id];const p=S.positions[i];return `<button class="mslot" data-act="jump" data-i="${i}"><span class="pn">${i+1}</span>${tile(c,pk.rev,w||64)}<span>${esc(p.short||p.t)}</span></button>`;}
function vMap(){const sp=SP[S.spreadId];const n=S.positions.length;
  if(sp.layout==="celtic"){const pos={2:[2,1],3:[2,3],4:[1,2],5:[3,2],6:[4,4],7:[4,3],8:[4,2],9:[4,1]};const c2=BY[S.picks[1].id];
    let h=`<div class="celtic"><div class="cross" style="grid-column:2;grid-row:2">${mslot(0,60)}<button class="x2" data-act="jump" data-i="1" aria-label="Vị trí 2: ${esc(c2.vi)}">${tile(c2,S.picks[1].rev,54)}</button></div>`;
    Object.keys(pos).forEach(k=>{const [x,y]=pos[k];h+=`<div style="grid-column:${x};grid-row:${y}">${mslot(+k,60)}</div>`;});return h+"</div>";}
  if(sp.id==="choice"){const opts=optList(S);let h=`<div class="mapflex">${mslot(0)}`;opts.forEach((o,i)=>{h+=`<div class="mapgroup"><span class="gl">${o.letter} · ${esc(o.label)}</span><div class="mapflex">${mslot(1+i*2)}${mslot(2+i*2)}</div></div>`;});return h+mslot(n-1)+"</div>";}
  const w=n>=9?56:n>=5?64:n===1?96:80;return `<div class="mapflex" style="${n<=3?"justify-content:center":""}">${S.positions.map((p,i)=>mslot(i,w)).join("")}</div>`;}
function meter(pct,color){return `<div class="meter" role="img" aria-label="${pct}%"><i style="width:${pct}%;background:${color||"var(--gold)"}"></i></div>`;}
function vVerdict(an){const sp=SP[S.spreadId];const poss=S.positions;const topic=topicOf(S);
  if(sp.kind==="day"){const pk=S.picks[0];const c=BY[pk.id],rev=pk.rev;const lab=polLabel(pol(c,rev));
    const cell=(t,v)=>`<div class="dg"><b>${t}</b>${esc(v)}</div>`;
    return `<section class="verdict"><p class="eyebrow">Dự báo · ${fmtFull(parseDate(S.date))}</p><div class="row" style="align-items:flex-start;flex-wrap:nowrap">${tile(c,rev,84)}<div style="display:grid;gap:6px;min-width:0"><div class="big">${esc(c.vi)}</div><p class="muted">${esc(c.en)} · ${orient(rev)} · <span style="color:${polColor(lab[1])};font-weight:600">${lab[0]}</span></p><p class="small">${esc(rev?c.kr:c.ku)}</p></div></div>
      <div class="daygrid">${cell("Năng lượng chung",topicText(c,rev,topic))}${cell("Công việc",txt(c,"work",rev))}${cell("Tình cảm",txt(c,"love",rev))}${cell("Tài chính",txt(c,"money",rev))}${cell("Sức khỏe",txt(c,"health",rev))}${cell("Tinh thần",txt(c,"mind",rev))}${cell("Nên làm",txt(c,"adv",rev))}${cell("Nên tránh",cap1(c.warn))}${cell("Gợi ý may mắn","Màu "+ELEM[c.el].color+" · số "+luckyNum(c)+" (theo nguyên tố "+ELEM[c.el].vi+" và số của lá – mang tính tượng trưng)")}</div></section>`;}
  if(sp.kind==="yesno"){const y=yesno(S,poss);const pct=Math.round((y.score+2)/4*100);
    return `<section class="verdict"><p class="eyebrow">Câu trả lời</p><div class="big" style="color:${polColor(y.v[2])}">${y.v[0]}</div><p>${esc(y.v[1])}</p>${meter(pct,polColor(y.v[2]))}<p class="small muted">Thang chấm dựa trên mức thuận lợi của từng lá (xuôi/ngược)${poss.length>1?", lá kết quả được tính trọng số cao hơn":""}. Đọc phần giải nghĩa và lời khuyên bên dưới để biết điều kiện.</p></section>`;}
  if(sp.kind==="choice"){const cs=choiceScores(S,poss).slice().sort((a,b)=>b.score-a.score);const best=cs[0],second=cs[1];const close=second&&best.score-second.score<1;
    return `<section class="verdict"><p class="eyebrow">So sánh lựa chọn</p><div class="big">${close?"Các lựa chọn khá ngang nhau":esc(best.letter+" · "+best.label)}</div><p>${close?`“${esc(best.label)}” nhỉnh hơn một chút. Hãy đọc kỹ lá diễn biến của từng lựa chọn và lá “Bạn lúc này” để xem lựa chọn nào hợp với điều bạn thật sự muốn.`:`Lựa chọn này có diễn biến và kết quả thuận lợi nhất trong trải bài.`}</p>
      <div style="display:grid;gap:14px">${choiceScores(S,poss).map(o=>`<div class="optrow"><span class="ol">${o.letter} · ${esc(o.label)}</span><span class="pc">${o.pct}%</span>${meter(o.pct,o.letter===best.letter&&!close?"var(--ok)":"var(--gold)")}<span class="small muted" style="grid-column:1/-1">Diễn biến: ${o.dev?esc(o.dev.c.vi)+(o.dev.r?" (ngược)":""):"–"} · Kết quả: ${o.res?esc(o.res.c.vi)+(o.res.r?" (ngược)":""):"–"}</span></div>`).join("")}</div>
      <p class="small muted">Điểm = mức thuận lợi của lá diễn biến + 1,5 × lá kết quả. Đây là gợi ý định lượng; quyết định cuối cùng nên dựa trên toàn bộ bài đọc và hoàn cảnh thực tế của bạn.</p></section>`;}
  if(["week","month","year"].includes(sp.kind)){const rows=poss.map((p,i)=>({p,i})).filter(x=>x.p.role==="day");
    const sc=rows.map(x=>pol(BY[S.picks[x.i].id],S.picks[x.i].rev));const mx=Math.max(...sc),mn=Math.min(...sc);
    return `<section class="verdict"><p class="eyebrow">Lịch dự báo</p><div class="big">${an.label[0]}</div>${meter(Math.round((an.avg+2)/4*100),polColor(an.label[1]))}
      <div style="display:grid;gap:8px">${rows.map((x,k)=>{const pk=S.picks[x.i];const c=BY[pk.id];const lab=polLabel(pol(c,pk.rev));const tag=sc[k]===mx&&mx>0?" · thuận lợi nhất":sc[k]===mn&&mn<0?" · cần thận trọng":"";
        return `<button class="mslot" data-act="jump" data-i="${x.i}" style="width:auto;display:grid;grid-template-columns:auto 1fr;gap:12px;text-align:left;align-items:center;color:var(--ink)">${tile(c,pk.rev,34)}<span><b>${esc(x.p.t)}</b> — ${esc(c.vi)}${pk.rev?" (ngược)":""}<br><span class="muted">${esc(pk.rev?c.kr:c.ku)}</span> · <span style="color:${polColor(lab[1])};font-weight:600">${lab[0]}${tag}</span></span></button>`;}).join("")}</div></section>`;}
  const outs=poss.map((p,i)=>({p,i})).filter(x=>x.p.role==="out");const o=outs[outs.length-1];
  const oc=o&&BY[S.picks[o.i].id];const orv=o&&S.picks[o.i].rev;
  const warn=sp.id==="health"?'<p class="small muted">Tarot không thay thế chẩn đoán y khoa. Nếu có triệu chứng kéo dài, hãy đi khám.</p>':sp.id==="money"||topic==="money"?'<p class="small muted">Đây không phải lời khuyên đầu tư. Với quyết định tài chính lớn, hãy tham khảo chuyên gia.</p>':"";
  return `<section class="verdict"><p class="eyebrow">Xu hướng chung</p><div class="big" style="color:${polColor(an.label[1])}">${an.label[0]}</div>${meter(Math.round((an.avg+2)/4*100),polColor(an.label[1]))}
    ${oc?`<div class="row" style="align-items:flex-start;flex-wrap:nowrap">${tile(oc,orv,56)}<p><b>${esc(o.p.t)}: ${esc(oc.vi)}</b>${orv?" (ngược)":""} — ${esc(lensText(o.p,oc,orv,topic))}</p></div>`:""}${warn}</section>`;}
function cap1(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}
function vPos(p,i,topic){const pk=S.picks[i];const c=BY[pk.id];const rev=pk.rev;const main=lensText(p,c,rev,topic);
  const second=(topic!=="general"&&!["topic","day","adv",topic].includes(p.lens))?`<p><b>Góc ${TOPICS[topic].toLowerCase()}:</b> ${esc(txt(c,topic,rev))}</p>`:"";
  const dom=p.domain?`<p><b>Lĩnh vực:</b> ${c.s?esc(cap1(SUITS[c.s].area))+" (bộ "+SUITS[c.s].vi+")":"một bước ngoặt lớn hoặc người có ảnh hưởng – lá Ẩn chính"}.</p>`:"";
  const adv=p.lens!=="adv"?`<p class="adv"><b>Lời khuyên:</b> ${esc(txt(c,"adv",rev))}</p>`:"";
  const tm=p.role==="out"&&!["day","week","month","year"].includes(S.spreadId)?`<p class="small"><b>Thời điểm (tham khảo):</b> ${esc(timing(c).join(" "))}</p>`:"";
  return `<article class="pr" id="pos-${i+1}"><div class="side">${tile(c,rev,92)}${orient(rev)}</div><div class="body">
    <div class="ptitle"><span class="pnum">${i+1}</span><b>${esc(p.t)}</b></div><p class="pd">${esc(p.d)}</p>
    <h3>${esc(c.vi)} <small>${esc(c.en)}</small></h3><p class="kw">${esc(rev?c.kr:c.ku)}</p>
    <p class="main">${esc(main)}</p>${dom}${second}${adv}${tm}
    <details><summary>Hình ảnh trên lá và ý nghĩa theo mọi chủ đề</summary><p class="muted" style="margin-top:8px">${esc(c.img)}</p><dl>${["love","work","money","health","mind"].map(k=>`<dt>${TOPICS[k]}</dt><dd>${esc(txt(c,k,rev))}</dd>`).join("")}<dt>Cần đề phòng</dt><dd>${esc(cap1(c.warn))}</dd><dt>Chiêm tinh</dt><dd>${esc(astroText(c))}</dd>${EN[c.id]?`<dt>Bộ thẻ của bạn</dt><dd>${esc((rev?EN[c.id].rv:EN[c.id].up).join(" — "))}</dd>`:""}</dl>${symList(c.id,6)}</details>
  </div></article>`;}
function aiButtons(primaryOffline){const off=`<button class="btn ${primaryOffline?"gold":"ghost"}" data-act="aiOffline">Luận giải tự động</button>`;const cp=`<button class="btn ghost" data-act="copyPrompt">Chép lời nhắc để hỏi Claude</button>`;
  return `<div class="row">${!primaryOffline?'<button class="btn gold" data-act="aiRun">Luận giải bằng Claude</button>':""}${off}${cp}</div>`;}
function aiBody(){const a=S.ai;
  if(a.status==="unavailable")return `<p class="note">Không kết nối được Claude ở chế độ xem này. Dùng luận giải tự động, hoặc chép lời nhắc rồi dán vào Claude.</p>${aiButtons(true)}`;
  if(a.status==="blocked")return `<p class="note">${esc(AIERR[a.err]||"Tính năng này chưa khả dụng.")}</p>${aiButtons(true)}`;
  if(!a.text&&a.status==="idle")return aiButtons(!IN_CLAUDE);
  if(a.source==="offline")return `<div class="ai-out">${md(a.text)}</div><div class="row">${IN_CLAUDE?'<button class="btn sm gold" data-act="aiRun">Luận giải bằng Claude</button>':""}<button class="btn sm ghost" data-act="copyPrompt">Chép lời nhắc để hỏi Claude</button><a class="btn sm ghost" href="https://claude.ai/new" target="_blank" rel="noopener">Mở Claude</a></div>`;
  let h="";
  if(a.status==="thinking"&&!a.text)h+=`<div class="thinking"><span class="dots"><i></i><i></i><i></i></span>Claude đang đọc các lá… thường mất 20–60 giây.</div>`;
  if(a.text)h+=`<div class="ai-out">${md(a.text)}</div>`;
  const qaBusy=a.qa.some(x=>x.status==="thinking"||x.status==="stream");
  if(a.busy&&!qaBusy)h+=`<div class="row"><button class="btn sm ghost" data-act="aiStop">Dừng</button></div>`;
  if(a.status==="truncated")h+=`<p class="note">Bài luận giải bị cắt ngắn vì quá dài.</p>`;
  if(a.status==="stopped")h+=`<p class="small muted">Đã dừng.</p>`;
  if(a.status==="error")h+=`<p class="note">${esc(AIERR[a.err]||"Có lỗi xảy ra. Hãy thử lại.")}</p>`;
  if(!a.busy)h+=`<div class="row"><button class="btn sm ghost" data-act="aiRun">${a.text?"Viết lại luận giải":"Thử lại"}</button></div>`;
  if(a.text&&(a.status==="done"||a.status==="truncated"||a.qa.length)){
    if(a.qa.length)h+=`<div class="qa">${a.qa.map(x=>`<div><p class="q">Bạn hỏi: ${esc(x.q)}</p><div class="a ai-out">${x.a?md(x.a):'<div class="thinking"><span class="dots"><i></i><i></i><i></i></span>Đang trả lời…</div>'}${x.status==="error"?`<p class="note">${esc(AIERR[x.err]||"Có lỗi xảy ra.")}</p>`:""}</div></div>`).join("")}</div>`;
    if(qaBusy)h+=`<div class="row"><button class="btn sm ghost" data-act="aiStop">Dừng</button></div>`;
    else if(!a.busy)h+=`<div class="field"><label for="ai-fq">Hỏi thêm về trải bài này</label><textarea id="ai-fq" placeholder="Ví dụ: Lá ở vị trí 3 gợi ý tôi nên chờ đến khi nào?"></textarea></div><div class="row"><button class="btn sm" data-act="aiAsk">Gửi câu hỏi</button></div>`;}
  return h;}
function paintAI(){const el=$("#ai-body");if(el)el.innerHTML=aiBody();}
function schedulePaint(){if(paintQueued)return;paintQueued=true;requestAnimationFrame(()=>{paintQueued=false;paintAI();});}
async function aiRun(){if(S.ai.busy)return;const sample=await getSample();if(!sample){S.ai.status="unavailable";paintAI();return;}
  S.ai={text:"",status:"thinking",qa:[],busy:true,source:"claude"};paintAI();aiCtl=new AbortController();
  try{const r=await sample(buildPrompt(S),{signal:aiCtl.signal,cache:false,onText:({text})=>{S.ai.text=text;S.ai.status="stream";schedulePaint();}});
    S.ai.text=r.text;S.ai.status=r.truncated?"truncated":"done";}
  catch(e){S.ai.text=(e&&e.text)||S.ai.text||"";S.ai.err=e&&e.code;S.ai.status=e&&e.code==="cancelled"?"stopped":AIBLOCK.includes(e&&e.code)?"blocked":"error";}
  S.ai.busy=false;paintAI();if(S.savedId&&S.ai.text)doSave(true);}
async function aiAsk(){const box=$("#ai-fq");const q=(box&&box.value||"").trim();if(!q){toast("Hãy nhập câu hỏi thêm");return;}
  const sample=await getSample();if(!sample){S.ai.status="unavailable";paintAI();return;}
  const turns=[{role:"user",content:buildPrompt(S)},{role:"assistant",content:S.ai.text}];
  S.ai.qa.filter(x=>x.a&&x.status==="done").forEach(x=>{turns.push({role:"user",content:x.q},{role:"assistant",content:x.a});});
  turns.push({role:"user",content:`Câu hỏi thêm về trải bài trên: ${q}\nTrả lời bằng tiếng Việt, ngắn gọn (khoảng 120–250 từ), dựa trên các lá đã bốc; không bốc thêm lá.`});
  const item={q,a:"",status:"thinking"};S.ai.qa.push(item);S.ai.busy=true;paintAI();aiCtl=new AbortController();
  try{const r=await sample(turns,{signal:aiCtl.signal,cache:false,onText:({text})=>{item.a=text;item.status="stream";schedulePaint();}});item.a=r.text;item.status="done";}
  catch(e){item.a=(e&&e.text)||item.a;item.status=e&&e.code==="cancelled"?"done":"error";item.err=e&&e.code;if(!item.a&&item.status==="done")item.a="(Đã dừng.)";}
  S.ai.busy=false;paintAI();if(S.savedId)doSave(true);}
/* ───────── offline reading (no network) ───────── */
function elRel(a,b){if(a===b)return "same";const sup={fire:"air",air:"fire",water:"earth",earth:"water"};if(sup[a]===b)return "support";const opp={fire:"water",water:"fire",air:"earth",earth:"air"};return opp[a]===b?"oppose":"";}
function firstSent(t,n){const p=String(t||"").split(/(?<=[.!?])\s+/);return p.slice(0,n||1).join(" ");}
function offlineReading(st){const sp=SP[st.spreadId],poss=positionsFor(st),topic=topicOf(st),an=analyze(st.picks);
  const cs=st.picks.map(p=>({c:BY[p.id],rev:!!p.rev}));const nm=x=>`${x.c.vi}${x.rev?" (ngược)":""}`;const sh=p=>p.short||p.t;const L=[];
  L.push("## Tổng quan");
  L.push(`${st.question?`Với câu hỏi “${st.question}”, t`:"T"}rải **${sp.name}** cho thấy xu hướng chung **${an.label[0].toLowerCase()}**. ${an.lines.join(" ")}`.trim());
  const maj=cs.filter(x=>!x.c.s);if(maj.length&&cs.length>=3)L.push(`Các lá Ẩn chính – ${maj.map(nm).join(", ")} – là trục chính của câu chuyện; hãy ưu tiên thông điệp của chúng.`);
  L.push("","## Từng vị trí");
  poss.forEach((p,i)=>{const x=cs[i];L.push(`- **${i+1}. ${p.t} – ${nm(x)}:** ${firstSent(lensText(p,x.c,x.rev,topic),2)}`);});
  const pairs=[];if(sp.id==="choice"){optList(st).forEach((o,k)=>pairs.push([1+2*k,2+2*k]));}else for(let i=0;i<cs.length-1;i++)pairs.push([i,i+1]);
  const EL={same:"cùng nguyên tố nên tăng sức cho nhau",support:"hai nguyên tố hỗ trợ nhau (Lửa–Khí, Nước–Đất)",oppose:"hai nguyên tố xung khắc (Lửa–Nước, Khí–Đất), cần dung hòa"};
  const links=[];pairs.forEach(([i,j])=>{if(links.length>=6)return;const a=cs[i],b=cs[j];const d=pol(b.c,b.rev)-pol(a.c,a.rev);const r=elRel(a.c.el,b.c.el);
    const tr=d>=2?"mọi thứ chuyển biến rõ rệt theo hướng tốt":d<=-2?"năng lượng chùng xuống – cần chuẩn bị trước":d===1?"tình hình nhích lên":d===-1?"có chút trở ngại xen vào":"";
    if(!tr&&!EL[r])return;links.push(`- **${sh(poss[i])} → ${sh(poss[j])}:** ${nm(a)} rồi ${nm(b)}${tr?" – "+tr:""}${EL[r]?"; "+EL[r]:""}.`);});
  if(links.length){L.push("","## Mạch câu chuyện");L.push(...links);}
  L.push("","## Trả lời câu hỏi");
  const outs=poss.map((p,i)=>i).filter(i=>poss[i].role==="out");const oi=outs.length?outs[outs.length-1]:cs.length-1;const o=cs[oi];
  if(sp.kind==="yesno"){const y=yesno(st,poss);L.push(`**${y.v[0]}** – ${y.v[1]} Lá quyết định là ${nm(o)}: ${firstSent(topicText(o.c,o.rev,topic),1)}`);}
  else if(sp.kind==="choice"){const sc=choiceScores(st,poss).sort((a,b)=>b.score-a.score);
    sc.forEach((x,k)=>L.push(`${k+1}. **${x.letter} · ${x.label}** – ${x.pct}%: diễn biến ${x.dev?nm({c:x.dev.c,rev:x.dev.r}):"–"}, kết quả ${x.res?nm({c:x.res.c,rev:x.res.r}):"–"}. ${x.res?firstSent(topicText(x.res.c,x.res.r,topic),1):""}`));
    const b=sc[0],s2=sc[1];L.push(s2&&b.score-s2.score<1?`Hai lựa chọn đầu khá ngang nhau; hãy chọn theo điều lá “Bạn lúc này” (${nm(cs[0])}) nói về mong muốn thật của bạn.`:`Lựa chọn nổi bật là **${b.label}**.${s2?` Nếu vẫn nghiêng về “${s2.label}”, hãy chú ý lời cảnh báo: ${s2.res?lc(s2.res.c.warn):"cân nhắc kỹ"}.`:""}`);}
  else if(sp.kind==="day"){L.push(`Năng lượng ngày: ${firstSent(topicText(o.c,o.rev,topic),2)} Nên làm: ${lc(txt(o.c,"adv",o.rev))} Nên tránh: ${lc(o.c.warn)}`);}
  else if(["week","month","year"].includes(sp.kind)){const ds=poss.map((p,i)=>({p,i,v:pol(cs[i].c,cs[i].rev)})).filter(x=>x.p.role==="day");const mx=Math.max(...ds.map(x=>x.v)),mn=Math.min(...ds.map(x=>x.v));
    const best=ds.filter(x=>x.v===mx&&mx>0),worst=ds.filter(x=>x.v===mn&&mn<0);
    if(best.length)L.push(`Thuận lợi nhất: ${best.map(x=>`**${x.p.t}** (${nm(cs[x.i])})`).join(", ")}.`);
    if(worst.length)L.push(`Cần thận trọng: ${worst.map(x=>`**${x.p.t}** (${nm(cs[x.i])}) – ${lc(cs[x.i].c.warn)}`).join("; ")}.`);
    if(!best.length&&!worst.length)L.push("Các khoảng thời gian khá đều nhau, không có điểm rơi đặc biệt.");}
  else{L.push(`${poss[oi].t}: **${nm(o)}** – ${firstSent(lensText(poss[oi],o.c,o.rev,topic),2)}`);}
  const acts=[];const add=t=>{t=String(t||"").trim();if(t&&!acts.includes(t)&&acts.length<5)acts.push(t);};
  poss.forEach((p,i)=>{if(p.lens==="adv")add(txt(cs[i].c,"adv",cs[i].rev));});add(txt(o.c,"adv",o.rev));
  poss.forEach((p,i)=>{if(p.lens==="warn")add("Tránh "+lc(cs[i].c.warn));});
  if(acts.length<3)cs.forEach(x=>{if(acts.length<3)add(txt(x.c,"adv",x.rev));});
  L.push("","## Việc nên làm");acts.forEach(a=>L.push("- "+a));
  L.push("",`*Bài này do app ghép tự động từ ý nghĩa từng lá và chạy không cần mạng. Muốn đọc sâu hơn hoặc hỏi thêm, bấm “Chép lời nhắc” rồi dán vào Claude.*`);
  return L.join("\n");}
function copyText(t,okMsg){const done=()=>toast(okMsg||"Đã chép");const fallback=()=>{showModal("Chép nội dung",`<p class="muted small">Máy không cho chép tự động. Bôi đen toàn bộ (⌘A / Ctrl+A) rồi chép.</p><textarea id="copy-box" style="min-height:260px">${esc(t)}</textarea>`);setTimeout(()=>{const b=$("#copy-box");if(b){b.focus();b.select();}},30);};
  try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(done,fallback);else fallback();}catch(e){fallback();}}

/* ───────── sync: backup code + GitHub Gist ───────── */
const GIST_FILE="tarot-nhat-ky.json";
function mergeJournal(a,b){const del=Object.assign({},a.deleted||{});Object.entries(b.deleted||{}).forEach(([k,v])=>{if(!del[k]||v>del[k])del[k]=v;});
  const ts=e=>String(e.updatedAt||e.createdAt||"");const map={};
  (a.entries||[]).concat(b.entries||[]).forEach(e=>{if(!e||!e.id)return;const x=Object.assign({},e);delete x.src;if(!map[x.id]||ts(x)>ts(map[x.id]))map[x.id]=x;});
  const entries=Object.values(map).filter(e=>!(del[e.id]&&del[e.id]>=ts(e))).sort((x,y)=>String(y.createdAt).localeCompare(String(x.createdAt)));
  return {v:1,entries,deleted:del};}
function applyMerged(m){const before=new Set(Store.local.map(e=>e.id));Store.local=m.entries;Store.deleted=m.deleted;lsSet("journal",Store.local);lsSet("deleted",Store.deleted);return m.entries.filter(e=>!before.has(e.id)).length;}
async function exportCode(){const data=JSON.stringify({v:1,entries:Store.all().map(e=>{const x=Object.assign({},e);delete x.src;return x;}),deleted:Store.deleted});
  let bytes=new TextEncoder().encode(data),tag="TAROT0:";
  if(window.CompressionStream){try{const s=new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));bytes=new Uint8Array(await new Response(s).arrayBuffer());tag="TAROT1:";}catch(e){}}
  let s="";for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+0x8000));return tag+btoa(s);}
async function importCode(code){const m=/^TAROT([01]):([A-Za-z0-9+/=]+)$/.exec(String(code).replace(/\s+/g,""));if(!m)throw new Error("format");
  let bytes=Uint8Array.from(atob(m[2]),ch=>ch.charCodeAt(0));
  if(m[1]==="1"){const s=new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));bytes=new Uint8Array(await new Response(s).arrayBuffer());}
  const data=JSON.parse(new TextDecoder().decode(bytes));const n=applyMerged(mergeJournal({entries:Store.local,deleted:Store.deleted},data));Store.emit();Sync.schedule();return n;}
const Sync={cfg:lsGet("sync",{token:"",gist:"",last:"",err:""}),busy:false,timer:null,
  on(){return !!this.cfg.token;},save(){lsSet("sync",this.cfg);},
  async api(path,opt){opt=opt||{};const h={"Authorization":"Bearer "+this.cfg.token,"Accept":"application/vnd.github+json"};if(opt.body)h["Content-Type"]="application/json";
    const r=await fetch("https://api.github.com"+path,{method:opt.method||"GET",headers:h,body:opt.body,cache:"no-store"});if(!r.ok){const e=new Error("HTTP "+r.status);e.status=r.status;throw e;}return r.json();},
  async findGist(){for(let p=1;p<=5;p++){const l=await this.api(`/gists?per_page=100&page=${p}`);const g=l.find(x=>x.files&&x.files[GIST_FILE]);if(g)return g.id;if(l.length<100)break;}return "";},
  async run(quiet){if(!this.on()||this.busy)return;this.busy=true;paintSync();
    try{if(!this.cfg.gist)this.cfg.gist=await this.findGist();let remote={entries:[],deleted:{}};
      if(this.cfg.gist){const g=await this.api("/gists/"+this.cfg.gist);const f=g.files&&g.files[GIST_FILE];if(f){let c=f.content;if(f.truncated)c=await (await fetch(f.raw_url,{cache:"no-store"})).text();try{remote=JSON.parse(c);}catch(e){}}}
      const m=mergeJournal({entries:Store.local,deleted:Store.deleted},remote);const n=applyMerged(m);
      const files={[GIST_FILE]:{content:JSON.stringify(m)}};const desc="Nhật ký Tarot Smith-Waite (đồng bộ giữa các máy)";
      if(this.cfg.gist)await this.api("/gists/"+this.cfg.gist,{method:"PATCH",body:JSON.stringify({description:desc,files})});
      else{const g=await this.api("/gists",{method:"POST",body:JSON.stringify({description:desc,public:false,files})});this.cfg.gist=g.id;}
      this.cfg.last=new Date().toISOString();this.cfg.err="";this.save();Store.emit();if(!quiet)toast(n?`Đã đồng bộ – nhận thêm ${n} lần xem`:"Đã đồng bộ nhật ký");}
    catch(e){this.cfg.err=e.status===401?"Token không đúng hoặc đã hết hạn.":e.status===403||e.status===404?"Token chưa có quyền gist, hoặc gist đã bị xóa.":"Không kết nối được GitHub. Kiểm tra mạng (trong bản trên claude.ai, tính năng này không chạy).";
      if(e.status===404)this.cfg.gist="";this.save();if(!quiet)toast(this.cfg.err);}
    this.busy=false;paintSync();},
  schedule(){if(!this.on())return;clearTimeout(this.timer);this.timer=setTimeout(()=>this.run(true),1500);}};
function vSync(){return `<details class="panel sync" id="sync" ${lsGet("syncOpen",false)?"open":""} data-sync><summary>Đồng bộ Mac ↔ iPhone và sao lưu</summary><div id="sync-body"></div></details>`;}
function paintSync(){const el=$("#sync-body");if(!el)return;const c=Sync.cfg;
  const status=!c.token?"Chưa bật đồng bộ tự động.":Sync.busy?"Đang đồng bộ…":c.err?`<span class="bad-dot"></span>${esc(c.err)}`:c.last?`<span class="ok-dot"></span>Đồng bộ lần cuối ${fmtStamp(c.last)}`:"Đã có token, chưa đồng bộ.";
  el.innerHTML=`<div style="display:grid;gap:10px"><h3>1. Đồng bộ tự động qua GitHub</h3>
    <p class="small muted">Nhật ký được lưu trong một gist bí mật trên tài khoản GitHub của bạn. Mac và iPhone cùng dùng một token là tự gộp dữ liệu mỗi khi mở app và mỗi lần lưu. Cách lấy token: github.com → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → chỉ tích quyền <b>gist</b>, chọn thời hạn → Generate → chép mã bắt đầu bằng <code>ghp_</code>.</p>
    <p class="small">${status}</p>
    ${c.token?`<div class="row"><button class="btn sm" data-act="syncNow" ${Sync.busy?"disabled":""}>Đồng bộ ngay</button><button class="btn sm ghost" data-act="syncOff">Tắt đồng bộ trên máy này</button></div>`
      :`<div class="field"><label for="sync-token">Token GitHub (quyền gist)</label><input type="password" id="sync-token" autocomplete="off" placeholder="ghp_…"></div><div class="row"><button class="btn sm" data-act="syncOn">Lưu token và đồng bộ</button></div>`}
    <p class="small muted">Token chỉ nằm trên máy này. Gist bí mật không hiện công khai nhưng ai có đường link vẫn xem được – đừng chia sẻ link gist.</p>
    <h3 style="margin-top:8px">2. Mã sao lưu (không cần GitHub)</h3>
    <p class="small muted">Chép mã ở máy này, gửi sang máy kia (Ghi chú, AirDrop, tin nhắn), dán vào ô bên dưới và bấm Nhập. Dữ liệu được gộp, không mất bài đã lưu ở máy nhận.</p>
    <textarea id="bk-out" readonly placeholder="Đang tạo mã…"></textarea><div class="row"><button class="btn sm" data-act="bkCopy">Chép mã sao lưu</button></div>
    <div class="field"><label for="bk-in">Dán mã từ máy khác</label><textarea id="bk-in" placeholder="TAROT1:…"></textarea></div><div class="row"><button class="btn sm" data-act="bkImport">Nhập</button></div></div>`;
  exportCode().then(code=>{const o=$("#bk-out");if(o)o.value=code;});}

function vSave(){return `<section class="panel save"><div><p class="eyebrow">Nhật ký</p><h2>Ghi chú và lưu lại</h2></div>
  <div class="field"><label for="f-notes">Cảm nhận của bạn khi xem</label><textarea id="f-notes" data-bind="notes" placeholder="Lá nào khiến bạn chú ý? Bạn định làm gì tiếp theo?">${esc(S.notes)}</textarea></div>
  <div class="field"><label for="f-outcome">Điều đã thực sự xảy ra (điền sau để kiểm chứng)</label><textarea id="f-outcome" data-bind="outcome" placeholder="Quay lại sau ngày/tuần/tháng để đối chiếu với dự báo.">${esc(S.outcome)}</textarea></div>
  <div class="row"><button class="btn" data-act="save" id="save-btn">${S.savedId?"Lưu thay đổi":"Lưu vào nhật ký"}</button><span class="muted small" id="store-note">${storeNote()}</span></div></section>`;}
async function doSave(quiet){const entry={kind:"reading",v:1,createdAt:S.createdAt,updatedAt:new Date().toISOString(),spreadId:S.spreadId,spreadName:SP[S.spreadId].name,date:S.date,month:S.month,topic:topicOf(S),question:S.question||"",
    subject:{type:S.subject.type,name:S.subject.type==="other"?S.subject.name||"":"",relation:S.subject.type==="other"?S.subject.relation||"":"",birth:S.subject.birth||"",consent:!!S.subject.consent},
    options:S.options.slice(),sig:S.sig||"",mode:S.mode,reversals:!!S.reversals,picks:S.picks.map(p=>({id:p.id,rev:!!p.rev})),
    ai:{source:S.ai.source||"",text:S.ai.text||"",qa:(S.ai.qa||[]).filter(x=>x.a).map(x=>({q:x.q,a:x.a}))},notes:S.notes||"",outcome:S.outcome||""};
  if(S.savedId){entry.id=S.savedId;entry.src=S.savedSrc;}
  try{const r=await Store.save(entry);S.savedId=r.id;S.savedSrc=r.src;const b=$("#save-btn");if(b)b.textContent="Lưu thay đổi";
    if(!quiet)toast(r.src==="cloud"?"Đã lưu vào nhật ký trong tài khoản":"Đã lưu vào nhật ký trên trình duyệt này");}
  catch(e){toast("Chưa lưu được – hãy thử lại.");}}

/* ───────── picker ───────── */
function filterCards(q,f){const nq=norm(q).trim();const ws=nq?nq.split(/\s+/):[];return CARDS.filter(c=>(f==="all"||(f==="m"?!c.s:c.s===f))&&ws.every(w=>c.key.includes(w)));}
function filterChips(act,cur){return [["all","Tất cả"],["m","Ẩn chính"],["w","Gậy"],["c","Cốc"],["s","Kiếm"],["p","Tiền"]].map(([k,v])=>`<button type="button" class="chip" data-act="${act}" data-id="${k}" aria-pressed="${cur===k}">${v}</button>`).join("");}
function openPicker(i){S.pickerIdx=i;S.pickRev=S.picks[i]?!!S.picks[i].rev:false;PK.q="";PK.f="all";
  showModal(`Vị trí ${i+1}: ${S.positions[i].t}`,`<div class="libbar">${S.reversals?`<div class="row"><span class="lbl">Lá này đang</span><div class="seg" role="group" aria-label="Chiều lá"><button type="button" data-act="pkRev" data-v="0" aria-pressed="${!S.pickRev}">Xuôi</button><button type="button" data-act="pkRev" data-v="1" aria-pressed="${S.pickRev}">Ngược</button></div></div>`:""}
    <input type="search" id="pk-q" placeholder="Gõ tên lá: “3 cups”, “ba cốc”, “star”, “ngôi sao”…" autocomplete="off"><div class="chips" id="pk-chips">${filterChips("pkFilter",PK.f)}</div></div><div class="pickgrid" id="pk-grid">${pickGrid()}</div>`);
  setTimeout(()=>{const q=$("#pk-q");if(q&&window.matchMedia("(min-width:700px)").matches)q.focus();},30);}
function pickGrid(){const used=new Set(S.picks.filter((p,k)=>p&&k!==S.pickerIdx).map(p=>p.id));if(S.sig)used.add(S.sig);
  const list=filterCards(PK.q,PK.f);if(!list.length)return `<p class="muted">Không tìm thấy lá phù hợp.</p>`;
  return list.map(c=>`<button class="libitem" data-act="pkChoose" data-id="${c.id}" ${used.has(c.id)?"disabled":""}>${tile(c,false,62)}<span>${esc(c.vi)}</span><small>${esc(c.en)}</small></button>`).join("");}
function showModal(title,body){$("#modal-title").textContent=title;$("#modal-body").innerHTML=body;$("#modal").hidden=false;document.body.style.overflow="hidden";}
function closeModal(){$("#modal").hidden=true;document.body.style.overflow="";S.pickerIdx=null;}

/* ───────── library ───────── */
function renderLibrary(){const el=$("#v-tra-bai");if(!el.dataset.built){el.innerHTML=`<div class="rhead"><p class="eyebrow">Tra cứu</p><h1>78 lá Smith-Waite</h1><p class="muted" style="max-width:62ch">Chạm vào một lá để xem hình ảnh, từ khóa, ý nghĩa xuôi – ngược theo từng chủ đề, chiêm tinh và thời điểm.</p></div>
  <div class="libbar"><input type="search" id="lib-q" placeholder="Tìm: “the moon”, “mặt trăng”, “5 kiếm”, “queen of cups”…" autocomplete="off"><div class="chips" id="lib-chips">${filterChips("libFilter",L.f)}</div></div><div class="libgrid" id="lib-grid"></div>`;el.dataset.built="1";}
  paintLibrary();}
function paintLibrary(){const g=$("#lib-grid");if(!g)return;const list=filterCards(L.q,L.f);g.innerHTML=list.length?list.map(c=>`<button class="libitem" data-act="card" data-id="${c.id}">${tile(c,false,80)}<span>${esc(c.vi)}</span><small>${esc(c.en)}</small></button>`).join(""):`<p class="muted">Không tìm thấy lá phù hợp.</p>`;
  const ch=$("#lib-chips");if(ch)ch.innerHTML=filterChips("libFilter",L.f);}
function cardDetail(c){const side=rev=>`<div><h4>${orient(rev)} ${rev?"Chiều ngược":"Chiều xuôi"}</h4><p class="kw muted">${esc(rev?c.kr:c.ku)}</p><p style="margin-top:6px">${esc(txt(c,"gen",rev))}</p><dl>${["love","work","money","health","mind"].map(k=>`<dt>${TOPICS[k]}</dt><dd>${esc(txt(c,k,rev))}</dd>`).join("")}<dt>Lời khuyên</dt><dd>${esc(txt(c,"adv",rev))}</dd></dl></div>`;
  return `<div class="detail"><div>${tile(c,false,140)}</div><div><p class="eyebrow">${esc(arcana(c))}</p><h2>${esc(c.vi)}</h2><p class="serif muted" style="font-size:18px">${esc(c.en)}</p><p style="margin-top:10px">${esc(c.img)}</p>
    <dl class="facts"><dt>Chiêm tinh</dt><dd>${esc(astroText(c))}</dd><dt>Có / Không</dt><dd>${ynLabel(c.p[0])} (xuôi) · ${ynLabel(c.p[1])} (ngược)</dd><dt>Thời điểm</dt><dd>${esc(timing(c).join(" "))}</dd><dt>Cần đề phòng</dt><dd>${esc(cap1(c.warn))}</dd><dt>Màu gợi ý</dt><dd>${esc(ELEM[c.el].color)}</dd></dl></div></div>
    <div class="twocol">${side(false)}${side(true)}</div>${enBox(c.id)}
    ${(SYM_BY[c.id]||[]).length?`<div><h3>Biểu tượng trên lá</h3><p class="small muted">Ảnh cận cảnh và ý nghĩa từ bộ thẻ Tarot Meanings của bạn.</p>${symList(c.id)}</div>`:""}`;}
function enBox(id,rev){const e=EN[id];if(!e)return "";const row=(lab,x)=>`<p><b>${lab}:</b> ${esc(x[0])} — <span class="muted">${esc(x[1])}</span></p>`;
  return `<div class="enbox"><p class="lbl" style="margin-bottom:4px">Bộ thẻ Tarot Meanings (tiếng Anh)</p>${rev===undefined?row("Upright",e.up)+row("Reversed",e.rv):row(rev?"Reversed":"Upright",rev?e.rv:e.up)}</div>`;}

/* ───────── journal ───────── */
function renderJournal(){const el=$("#v-nhat-ky");if(!el.dataset.built){el.innerHTML=`<div class="rhead"><p class="eyebrow">Nhật ký</p><h1>Những lần xem bài</h1><p class="muted" id="j-store"></p></div><div id="j-stats"></div><div class="jbar"><input type="search" id="j-q" placeholder="Tìm theo câu hỏi, tên người, tên lá…" autocomplete="off"><select id="j-who" aria-label="Lọc theo người được xem"></select></div><div class="jlist" id="j-list"></div>${vSync()}`;el.dataset.built="1";paintSync();}
  paintJournal();}
function paintJournal(){if(!$("#j-list"))return;const all=Store.all();$("#j-store").textContent=storeNote();
  const names=[...new Set(all.filter(e=>e.subject&&e.subject.type==="other"&&e.subject.name).map(e=>e.subject.name))];
  const sel=$("#j-who");const opts=`<option value="all">Tất cả mọi người</option><option value="self">Chỉ bản thân</option>${names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("")}`;if(sel.innerHTML!==opts){sel.innerHTML=opts;}sel.value=[...sel.options].some(o=>o.value===J.who)?J.who:"all";
  const freq={};all.forEach(e=>(e.picks||[]).forEach(p=>{if(BY[p.id])freq[p.id]=(freq[p.id]||0)+1;}));const topc=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const majN=all.reduce((s,e)=>s+(e.picks||[]).filter(p=>BY[p.id]&&!BY[p.id].s).length,0),totN=all.reduce((s,e)=>s+(e.picks||[]).length,0);
  $("#j-stats").innerHTML=all.length?`<div class="stats"><div class="stat"><b>${all.length}</b><span class="muted small">lần xem đã lưu</span></div><div class="stat"><b>${totN?Math.round(majN/totN*100):0}%</b><span class="muted small">lá Ẩn chính (trung bình ngẫu nhiên ≈ 28%)</span></div><div class="stat"><span class="muted small">Lá xuất hiện nhiều nhất</span><div class="row" style="margin-top:6px">${topc.map(([id,k])=>`<button class="libitem" data-act="card" data-id="${id}" style="padding:0" title="${esc(BY[id].vi)} · ${k} lần">${tile(BY[id],false,34)}<small>${k}×</small></button>`).join("")}</div></div></div>`:"";
  const nq=norm(J.q).trim();
  const list=all.filter(e=>{if(J.who==="self"&&e.subject&&e.subject.type==="other")return false;if(J.who!=="all"&&J.who!=="self"&&!(e.subject&&e.subject.name===J.who))return false;
    if(!nq)return true;const hay=norm([e.question,e.spreadName,e.subject&&e.subject.name,e.notes,e.outcome,(e.picks||[]).map(p=>BY[p.id]?BY[p.id].vi+" "+BY[p.id].en:"").join(" ")].join(" "));return nq.split(/\s+/).every(w=>hay.includes(w));});
  $("#j-list").innerHTML=!all.length?`<div class="empty"><h3>Chưa có lần xem nào được lưu</h3><p class="muted">Sau khi giải bài, bấm “Lưu vào nhật ký”. Mỗi lần xem lưu câu hỏi, các lá, luận giải và ghi chú để bạn quay lại đối chiếu dự báo ngày, tuần, tháng.</p><button class="btn gold" data-act="start" data-id="day">Bốc lá bài hôm nay</button></div>`
    :!list.length?`<p class="muted">Không có lần xem nào khớp bộ lọc.</p>`
    :list.map(e=>{const sp=SP[e.spreadId];const who=e.subject&&e.subject.type==="other"?"Cho "+(e.subject.name||"người khác"):"Bản thân";
      return `<article class="jitem"><div style="min-width:0"><div class="jt">${esc(sp?sp.name:e.spreadName)}</div><div class="jm"><span>${fmtStamp(e.createdAt)}</span><span>${esc(who)}</span><span>${esc(TOPICS[e.topic]||"")}</span><span class="tag">${e.src==="cloud"?"Tài khoản":"Trình duyệt"}</span>${e.ai&&e.ai.text?'<span class="tag">Có luận giải</span>':""}</div>${e.question?`<p class="jq">“${esc(e.question)}”</p>`:""}<div class="jcards">${(e.picks||[]).filter(p=>BY[p.id]).map(p=>tile(BY[p.id],p.rev,32)).join("")}</div>${e.outcome?`<p class="small" style="margin-top:6px"><b>Đã xảy ra:</b> ${esc(e.outcome)}</p>`:""}</div>
        <div class="jact"><button class="btn sm" data-act="openEntry" data-id="${esc(e.id)}">Mở</button>${J.confirm===e.id?`<button class="btn sm ghost" data-act="delYes" data-id="${esc(e.id)}" style="color:var(--bad);border-color:var(--bad)">Xác nhận xóa</button><button class="btn link" data-act="delNo">Hủy</button>`:`<button class="btn sm ghost" data-act="del" data-id="${esc(e.id)}">Xóa</button>`}</div></article>`;}).join("");}
function openEntry(id){const e=Store.find(id);if(!e||!SP[e.spreadId])return;
  Object.assign(S,{spreadId:e.spreadId,date:e.date||todayISO(),month:e.month||thisMonth(),topic:e.topic||"general",question:e.question||"",subject:Object.assign({type:"self",name:"",relation:"",birth:"",consent:false},e.subject||{}),
    options:(e.options&&e.options.length?e.options.slice():["",""]),sig:e.sig||"",mode:e.mode||"physical",reversals:e.reversals!==false,picks:(e.picks||[]).filter(p=>BY[p.id]).map(p=>({id:p.id,rev:!!p.rev})),
    ai:{source:(e.ai&&e.ai.source)||"",text:(e.ai&&e.ai.text)||"",status:e.ai&&e.ai.text?"done":"idle",qa:((e.ai&&e.ai.qa)||[]).map(x=>({q:x.q,a:x.a,status:"done"})),busy:false},notes:e.notes||"",outcome:e.outcome||"",createdAt:e.createdAt,savedId:e.id,savedSrc:e.src,step:"result",d:null});
  S.positions=positionsFor(S);if(S.positions.length!==S.picks.length){toast("Không mở được lần xem này");S.step="home";}
  closeModal();go("xem");top();}

/* ───────── birth calculator (guide) ───────── */
const BC={date:lsGet("selfBirth",""),year:new Date().getFullYear()};
function renderBirth(){const el=$("#birthcalc");if(!el)return;if(!el.dataset.built){el.innerHTML=`<div class="grid2"><div class="field"><label for="bc-date">Ngày sinh</label><input type="date" id="bc-date" value="${esc(BC.date)}"></div><div class="field"><label for="bc-year">Năm muốn xem lá năm</label><input type="number" id="bc-year" value="${BC.year}" min="1900" max="2200"></div></div><div id="bc-out" style="margin-top:14px"></div>`;el.dataset.built="1";}paintBirth();}
function paintBirth(){const o=$("#bc-out");if(!o)return;const b=birthCards(BC.date,+BC.year||new Date().getFullYear());
  if(!b){o.innerHTML=`<p class="muted small">Nhập ngày sinh để xem lá chủ mệnh. Ví dụ 15/07/1990: 15 + 7 + 1990 = 2012 → 2+0+1+2 = 5 → Giáo Hoàng.</p>`;return;}
  const item=(lab,c)=>`<button class="libitem" data-act="card" data-id="${c.id}" style="justify-items:start;text-align:left;grid-template-columns:auto 1fr;display:grid;gap:12px;align-items:center">${tile(c,false,52)}<span><span class="lbl">${lab}</span><br><b>${esc(c.vi)}</b> · ${esc(c.en)}<br><span class="muted">${esc(c.ku)}</span></span></button>`;
  o.innerHTML=`<div style="display:grid;gap:10px">${item("Lá nhân cách",b.pers)}${b.soul.id!==b.pers.id?item("Lá linh hồn",b.soul):""}${item("Lá năm "+b.yearNum,b.year)}</div>`;}

/* ───────── actions ───────── */
function startSpread(id){const sp=SP[id];if(!sp)return;Object.assign(S,{spreadId:id,step:"setup",question:"",topic:sp.fixedTopic||"general",options:["",""],sig:"",picks:[],d:null,ai:{text:"",status:"idle",qa:[],busy:false},notes:"",outcome:"",savedId:null,savedSrc:null});
  if(sp.date==="day")S.date=todayISO();if(sp.date==="month")S.month=thisMonth();go("xem");renderRead();top();}
function toInterpret(){S.step="result";S.createdAt=new Date().toISOString();S.ai={text:"",status:"idle",qa:[],busy:false};S.savedId=null;S.savedSrc=null;S.notes="";S.outcome="";renderRead();top();}
const ACT={
  home(){S.step="home";go("xem");renderRead();top();},
  start(a){startSpread(a.dataset.id);},
  setSubject(a){S.subject.type=a.dataset.v;if(a.dataset.v==="self")S.subject.birth=lsGet("selfBirth","");else S.subject.birth="";renderRead();},
  setTopic(a){S.topic=a.dataset.id;document.querySelectorAll('[data-act="setTopic"]').forEach(b=>b.setAttribute("aria-pressed",b.dataset.id===S.topic));},
  quickDate(a){const v=a.dataset.v;let d=new Date();if(v==="1")d=addDays(d,1);if(v==="mon"){const k=(8-d.getDay())%7||7;d=addDays(d,k);}S.date=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;const f=$("#f-date");if(f)f.value=S.date;refreshSetupAside();},
  sugg(a){S.question=a.dataset.v;const f=$("#f-q");if(f){f.value=S.question;f.focus();}},
  addOpt(){if(S.options.length<3){S.options.push("");renderRead();}},
  rmOpt(){S.options=S.options.slice(0,2);renderRead();},
  setMode(a){S.mode=a.dataset.v;lsSet("mode",S.mode);if(S.step==="draw"&&S.mode==="digital"){S.picks=S.positions.map(()=>null);S.d=null;}renderRead();},
  toSetup(){S.step="setup";renderRead();top();},
  toDraw(){const sp=SP[S.spreadId];
    if(sp.id==="choice"&&S.options.filter(o=>o.trim()).length<2){toast("Hãy đặt tên cho ít nhất hai lựa chọn");const f=$("#f-opt0");if(f)f.focus();return;}
    S.positions=positionsFor(S);const n=S.positions.length;if(S.picks.length!==n||S.picks.some(p=>p&&p.id===S.sig))S.picks=new Array(n).fill(null);S.d=null;S.step="draw";renderRead();top();},
  pick(a){openPicker(+a.dataset.i);},
  pkRev(a){S.pickRev=a.dataset.v==="1";document.querySelectorAll('[data-act="pkRev"]').forEach(b=>b.setAttribute("aria-pressed",(b.dataset.v==="1")===S.pickRev));},
  pkFilter(a){PK.f=a.dataset.id;$("#pk-chips").innerHTML=filterChips("pkFilter",PK.f);$("#pk-grid").innerHTML=pickGrid();},
  pkChoose(a){const i=S.pickerIdx;if(i==null)return;S.picks[i]={id:a.dataset.id,rev:S.reversals?S.pickRev:false};
    const next=S.picks.findIndex((p,k)=>!p&&k>i);renderRead();if(next>=0){openPicker(next);toast(`Đã chọn ${BY[a.dataset.id].vi} cho vị trí ${i+1}`);}else{closeModal();const firstEmpty=S.picks.findIndex(p=>!p);if(firstEmpty<0)toast("Đủ lá rồi – bấm “Giải bài”");}},
  setRev(a){const i=+a.dataset.i;if(S.picks[i]){S.picks[i].rev=a.dataset.v==="1";renderRead();}},
  interpret(){if(S.picks.every(Boolean))toInterpret();},
  dShuffle(){const d=S.d;d.deck=shuffleDeck(d.deck||freshDeck());d.shuffles++;d.anim=true;renderRead();setTimeout(()=>{d.anim=false;if(S.step==="draw"&&S.d===d&&d.stage==="shuffle")renderRead();},900);},
  dToCut(){S.d.stage="cut";renderRead();},
  dCut(a){const d=S.d;const N=d.deck.length;const c1=Math.floor(N/3)-4+rnd(9),c2=Math.floor(2*N/3)-4+rnd(9);const piles=[d.deck.slice(0,c1),d.deck.slice(c1,c2),d.deck.slice(c2)];const k=+a.dataset.v;
    d.deck=piles[k].concat(...piles.filter((_,j)=>j!==k));d.stage="pick";d.chosen=[];renderRead();},
  dChoose(a){const d=S.d;const i=+a.dataset.v;const o=d.chosen.indexOf(i);if(o>=0)return;if(d.chosen.length<S.positions.length){d.chosen.push(i);renderRead();}},
  dUndo(){S.d.chosen.pop();renderRead();},
  dRestart(){S.d=null;renderRead();},
  dReveal(){const d=S.d;S.picks=d.chosen.map(i=>({id:d.deck[i].id,rev:d.deck[i].rev}));toInterpret();},
  dAuto(){const deck=shuffleDeck(shuffleDeck(freshDeck()));S.picks=deck.slice(0,S.positions.length).map(x=>({id:x.id,rev:x.rev}));toInterpret();},
  jump(a){const el=document.getElementById("pos-"+(+a.dataset.i+1));if(el)el.scrollIntoView({behavior:"smooth",block:"start"});},
  aiRun(){aiRun();},
  aiOffline(){S.ai={text:offlineReading(S),status:"done",qa:[],busy:false,source:"offline"};paintAI();if(S.savedId)doSave(true);},
  copyPrompt(){copyText(buildPrompt(S),"Đã chép lời nhắc – mở Claude và dán vào");},
  syncOn(){const t=($("#sync-token")||{}).value||"";if(!t.trim()){toast("Hãy dán token GitHub");return;}Sync.cfg={token:t.trim(),gist:"",last:"",err:""};Sync.save();Sync.run(false);},
  syncOff(){Sync.cfg={token:"",gist:"",last:"",err:""};Sync.save();paintSync();toast("Đã tắt đồng bộ trên máy này");},
  syncNow(){Sync.run(false);},
  bkCopy(){const o=$("#bk-out");if(o&&o.value)copyText(o.value,"Đã chép mã sao lưu");},
  async bkImport(){const i=$("#bk-in");try{const n=await importCode(i.value);i.value="";toast(n?`Đã nhập ${n} lần xem mới`:"Đã gộp – không có lần xem mới");paintSync();}catch(e){toast("Mã không đúng hoặc bị thiếu ký tự – hãy chép lại đủ.");}},
  aiAsk(){aiAsk();},
  aiStop(){if(aiCtl)aiCtl.abort();},
  save(){doSave(false);},
  editCards(){S.mode="physical";S.step="draw";renderRead();top();},
  again(){S.picks=S.positions.map(()=>null);S.d=null;S.step="draw";renderRead();top();},
  card(a){const c=BY[a.dataset.id];if(c)showModal(c.vi,cardDetail(c));},
  libFilter(a){L.f=a.dataset.id;paintLibrary();},
  openEntry(a){openEntry(a.dataset.id);},
  del(a){J.confirm=a.dataset.id;paintJournal();},
  delNo(){J.confirm=null;paintJournal();},
  async delYes(a){J.confirm=null;try{await Store.remove(a.dataset.id);toast("Đã xóa");}catch(e){toast("Chưa xóa được – hãy thử lại");}paintJournal();},
  closeModal(){closeModal();}};

/* ───────── events ───────── */
document.addEventListener("click",e=>{
  const g=e.target.closest('a[href^="#g-"]');if(g){e.preventDefault();const t=document.getElementById(g.getAttribute("href").slice(1));if(t)t.scrollIntoView({behavior:"smooth",block:"start"});return;}
  if(e.target.id==="modal"){closeModal();return;}
  const a=e.target.closest("[data-act]");if(!a||a.disabled)return;const fn=ACT[a.dataset.act];if(!fn)return;if(a.tagName==="A")e.preventDefault();fn(a,e);});
function onField(e){const t=e.target;
  if(e.type==="change"&&(t.type==="search"||t.type==="text"||t.tagName==="TEXTAREA"))return;
  if(t.dataset&&t.dataset.bind){const v=t.type==="checkbox"?t.checked:t.value;setPath(S,t.dataset.bind,v);const k=t.dataset.bind;
    if(k==="date"||k==="month"||k.startsWith("options"))refreshSetupAside();
    if(k==="subject.birth"){if(S.subject.type==="self")lsSet("selfBirth",v);const bc=$("#birth-chip");if(bc)bc.innerHTML=birthChip(v);}
    if(k==="reversals")lsSet("rev",!!v);return;}
  if(t.id==="pk-q"){PK.q=t.value;$("#pk-grid").innerHTML=pickGrid();return;}
  if(t.id==="lib-q"){L.q=t.value;paintLibrary();return;}
  if(t.id==="j-q"){J.q=t.value;paintJournal();return;}
  if(t.id==="j-who"){J.who=t.value;paintJournal();return;}
  if(t.id==="bc-date"){BC.date=t.value;paintBirth();return;}
  if(t.id==="bc-year"){BC.year=t.value;paintBirth();return;}}
document.addEventListener("input",onField);document.addEventListener("change",onField);
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("#modal").hidden)closeModal();
  if(e.key==="Enter"&&e.target.id==="pk-q"){const b=document.querySelector('#pk-grid .libitem:not([disabled])');if(b){e.preventDefault();b.click();}}});
document.addEventListener("toggle",e=>{if(!e.target.matches)return;if(e.target.matches("details[data-ritual]"))lsSet("ritualOpen",e.target.open);if(e.target.matches("details[data-sync]"))lsSet("syncOpen",e.target.open);},true);
window.addEventListener("hashchange",route);

/* ───────── boot ───────── */
route();getSample();Store.init();if(Sync.on())Sync.run(true);
if(!IN_CLAUDE&&"serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")){const had=!!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("sw.js").catch(()=>{});navigator.serviceWorker.addEventListener("controllerchange",()=>{if(had)toast("Đã tải bản mới của app – mở lại để dùng bản mới nhất.");});}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&Sync.on())Sync.run(true);});
})();
