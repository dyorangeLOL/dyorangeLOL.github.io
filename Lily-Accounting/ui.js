"use strict";
window.LilyUI=(()=>{
 const themes=["light","dark","github","github-dark","midnight","lavender"];let currency="CNY";
 function setTheme(value){const theme=themes.includes(value)?value:"light";document.body.classList.remove(...themes.map(t=>"theme-"+t));document.body.classList.add("theme-"+theme);document.body.classList.toggle("dark",["dark","github-dark","midnight"].includes(theme));try{localStorage.setItem("lily-theme",theme);}catch(e){}document.dispatchEvent(new Event("lily:themechange"));}
 function setCurrency(value){currency=["CNY","SGD","HKD","USD","JPY"].includes(value)?value:"CNY";}
 function money(value,code=currency){return new Intl.NumberFormat("zh-CN",{style:"currency",currency:code,minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(value)||0);}
 function cents(value){return Math.round((Number(value)||0)*100);}
 function status(message,error=false,retry=false){let el=document.getElementById("page-status");if(!el){el=document.createElement("div");el.id="page-status";document.getElementById("main")?.prepend(el);}el.className="page-status"+(error?" error":"");el.setAttribute("role",error?"alert":"status");el.replaceChildren(document.createTextNode(message));if(retry){const b=document.createElement("button");b.type="button";b.className="button button-secondary";b.textContent="重新加载";b.onclick=()=>location.reload();el.append(b);}}
 document.addEventListener("click",event=>{document.querySelectorAll(".nav-more[open]").forEach(menu=>{if(!menu.contains(event.target))menu.open=false;});});
 document.addEventListener("keydown",event=>{if(event.key==="Escape")document.querySelectorAll(".nav-more[open]").forEach(menu=>{menu.open=false;menu.querySelector("summary").focus();});});
 return {setTheme,setCurrency,money,cents,status};
})();
