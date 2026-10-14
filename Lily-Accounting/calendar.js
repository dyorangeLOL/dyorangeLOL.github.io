"use strict";
let calendarRows=[], calendarCurrency="CNY", calendarMonth=new Date(new Date().getFullYear(),new Date().getMonth(),1), selectedCalendarDate="";
function calendarDateKey(year,month,day){return String(year).padStart(4,"0")+"-"+String(month+1).padStart(2,"0")+"-"+String(day).padStart(2,"0");}
function calendarMoney(cents){return calendarCurrency+" "+(cents/100).toFixed(2);}
function calendarTotals(rows){const totals=new Map();for(const row of rows){if(row.type==="income")continue;totals.set(row.date,(totals.get(row.date)||0)+Math.round(Number(row.amount)*100));}return totals;}
function showCalendarDay(key){
 selectedCalendarDate=key;
 document.getElementById("day-title").textContent=key+" 支出明细";
 const list=document.getElementById("day-expenses");list.replaceChildren();
 const rows=calendarRows.filter(row=>row.date===key&&row.type!=="income");
 if(!rows.length){const p=document.createElement("p");p.className="empty-state";p.textContent="当天暂无支出";list.append(p);}
 for(const row of rows){const card=document.createElement("div");card.className="expense-card";const desc=document.createElement("span");desc.className="expense-info";desc.textContent=row.description+"（"+normalizeCategory(row.category)+"）";const amount=document.createElement("span");amount.className="amount";amount.textContent=calendarMoney(Math.round(Number(row.amount)*100));card.append(LilyIcons.create(LilyIcons.category(normalizeCategory(row.category)),"expense-category-icon"),desc,amount);list.append(card);}
 for(const cell of document.querySelectorAll(".calendar-day")){const active=cell.dataset.date===key;cell.classList.toggle("selected",active);cell.setAttribute("aria-pressed",String(active));}
}
function drawCalendar(){
 const year=calendarMonth.getFullYear(),month=calendarMonth.getMonth(),prefix=calendarDateKey(year,month,1).slice(0,7),totals=calendarTotals(calendarRows),grid=document.getElementById("calendar-grid");
 document.getElementById("calendar-month").textContent=year+"年"+(month+1)+"月";
 let total=0;for(const [key,value] of totals)if(key.startsWith(prefix+"-"))total+=value;
 document.getElementById("month-spending").textContent="本月支出："+calendarMoney(total);
 grid.replaceChildren();const offset=(new Date(year,month,1).getDay()+6)%7,days=new Date(year,month+1,0).getDate();
 for(let n=0;n<offset;n++){const blank=document.createElement("div");blank.className="calendar-blank";blank.setAttribute("aria-hidden","true");grid.append(blank);}
 const today=new Date(),todayKey=calendarDateKey(today.getFullYear(),today.getMonth(),today.getDate());
 for(let day=1;day<=days;day++){
  const key=calendarDateKey(year,month,day),cell=document.createElement("button"),date=document.createElement("span"),amount=document.createElement("span");
  cell.type="button";cell.className="calendar-day";cell.dataset.date=key;date.textContent=String(day);date.className="calendar-number";
  const has=totals.has(key);amount.textContent=has?calendarMoney(totals.get(key)):"—";amount.className="calendar-amount";
  cell.classList.toggle("today",key===todayKey);if(key===todayKey)cell.setAttribute("aria-current","date");
  cell.setAttribute("aria-label",key+"，支出 "+calendarMoney(totals.get(key)||0));cell.onclick=()=>showCalendarDay(key);cell.append(date,amount);grid.append(cell);
 }
 showCalendarDay(selectedCalendarDate.startsWith(prefix+"-")?selectedCalendarDate:(todayKey.startsWith(prefix+"-")?todayKey:prefix+"-01"));
}
document.addEventListener("DOMContentLoaded",async()=>{
 const status=document.getElementById("calendar-status");
 try{
  const user=await requireAuth();if(!user)return;
  const settings=await loadSettings();calendarCurrency=["CNY","SGD","HKD","USD","JPY"].includes(settings.currency)?settings.currency:"CNY";
  const theme=["light","dark","github","github-dark","midnight","lavender"].includes(settings.theme)?settings.theme:"light";
  document.body.classList.remove("theme-light","theme-dark","theme-github","theme-github-dark","theme-midnight","theme-lavender");document.body.classList.add("theme-"+theme);document.body.classList.toggle("dark",theme==="dark"||theme==="midnight"||theme==="github-dark");try{localStorage.setItem("lily-theme",theme);}catch(e){}
  for(let start=0;;start+=1000){
   const {data,error}=await supabaseClient.from("expenses").select("id,description,amount,category,date,type").eq("user_id",user.id).order("date").order("id").range(start,start+999);
   if(error)throw error;calendarRows.push(...(data||[]));if(!data||data.length<1000)break;
  }
  document.getElementById("previous-month").onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()-1,1);drawCalendar();};
  document.getElementById("next-month").onclick=()=>{calendarMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,1);drawCalendar();};
  document.getElementById("current-month").onclick=()=>{const now=new Date();calendarMonth=new Date(now.getFullYear(),now.getMonth(),1);selectedCalendarDate=calendarDateKey(now.getFullYear(),now.getMonth(),now.getDate());drawCalendar();};
  for(const b of document.querySelectorAll(".calendar-toolbar button"))b.disabled=false;
  drawCalendar();status.textContent="";
 }catch(error){console.error(error);status.textContent="账单加载失败，请刷新重试；未加载的数据不会显示为零支出。";}
});
