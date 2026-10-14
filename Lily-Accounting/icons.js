"use strict";
(function () {
  const ns = "http://www.w3.org/2000/svg";
  const sprite = new URL("assets/icons/lily-icons.svg?v=20261014-icons", document.currentScript.src).href;
  const names = new Set(["home","add","history","analytics","calendar","settings","update-log","wallet","income","expense","budget","amount","dining","transport","study","digital","shopping","entertainment","medical","living","other","note","transfer","category","search","save","delete","cleanup","export","theme","check","close","chevron-left","chevron-right","profile","login","logout","email","lock","menu"]);
  const categories = { "餐饮":"dining", "交通":"transport", "学习":"study", "数码":"digital", "购物":"shopping", "娱乐":"entertainment", "医疗":"medical", "生活":"living", "其他":"other", "住房":"home", "工资":"income", "奖金":"income", Food:"dining", Transport:"transport", Education:"study", Tech:"digital", Shopping:"shopping", Entertainment:"entertainment", Medical:"medical", Bills:"living", Other:"other" };
  function create(name, className = "") {
    const svg = document.createElementNS(ns, "svg"), use = document.createElementNS(ns, "use");
    svg.setAttribute("class", "lily-icon" + (className ? " " + className : ""));
    svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
    use.setAttribute("href", sprite + "#icon-" + (names.has(name) ? name : "other"));
    svg.append(use); return svg;
  }
  function label(element, text, name) { element.replaceChildren(create(name), document.createTextNode(" " + text)); }
  window.LilyIcons = Object.freeze({ create, label, category: value => categories[value] || "other" });
  const select = document.getElementById("category"), categoryIcon = document.getElementById("category-icon");
  if (select && categoryIcon) {
    const update = () => categoryIcon.querySelector("use").setAttribute("href", sprite + "#icon-" + (select.value ? categories[select.value] || "other" : "category"));
    select.addEventListener("change", update); update();
  }
  const authLink = document.getElementById("auth-link");
  if (authLink) {
    const decorate = () => { if (!authLink.querySelector(".lily-icon")) authLink.prepend(create(authLink.textContent.includes("退出") ? "logout" : "login"), document.createTextNode(" ")); };
    decorate(); new MutationObserver(decorate).observe(authLink, { childList: true });
  }
})();
