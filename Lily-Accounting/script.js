async function applyTheme(){const s=await loadSettings(),t=["light","dark","github","github-dark","midnight","lavender"].includes(s.theme)?s.theme:"light";localStorage.setItem("lily-theme",t);document.body.classList.remove("theme-light","theme-dark","theme-github","theme-github-dark","theme-midnight","theme-lavender");document.body.classList.add("theme-"+t);document.body.classList.toggle("dark",t==="dark"||t==="midnight"||t==="github-dark");document.querySelectorAll(".expense-card").forEach(c=>c.classList.toggle("dark",t==="dark"||t==="midnight"||t==="github-dark"));}
async function showBudget() {
  const settings = await loadSettings(), display = document.getElementById("budget-display");
  if (display) LilyIcons.label(display, settings.budget ? `月度预算： ${settings.currency || "CNY"} ${settings.budget}` : "尚未设置月度预算", "budget");
}
function formatRecordTime(e){if(!e.createdAt)return e.date;const d=new Date(e.createdAt);return Number.isNaN(d.getTime())?e.date:d.toLocaleString("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false});}
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return alert(message);
  const text = document.createElement("span"); text.textContent = message;
  toast.replaceChildren(LilyIcons.create(message.includes("失败") ? "close" : message.includes("暂无") ? "other" : "check"), text);
  toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 3000);
}
function renderExpenses(expenses, container) {
  container.replaceChildren();
  if (!expenses.length) { const empty = document.createElement("p"); empty.className = "empty-state"; empty.textContent = "暂无账单记录"; container.append(empty); }
  expenses.forEach(expense => {
    const card = document.createElement("div"); card.className = "expense-card " + (expense.type === "income" ? "income-card" : "");
    const info = document.createElement("span"); info.className = "expense-info";
    info.append(document.createTextNode(expense.desc + "（" + expense.category + "） · 账单日期：" + expense.date), document.createElement("br"));
    const time = document.createElement("small"); time.textContent = "记录时间：" + formatRecordTime(expense); info.append(time);
    const amount = document.createElement("span"); amount.className = "amount"; amount.textContent = (expense.type === "income" ? "+" : "-") + "¥" + expense.amount.toFixed(2);
    const remove = document.createElement("button"); remove.type = "button"; remove.className = "delete";
    LilyIcons.label(remove, "删除", "delete"); remove.setAttribute("aria-label", "删除账单：" + expense.desc); remove.onclick = () => deleteExpense(expense.id);
    card.append(LilyIcons.create(LilyIcons.category(expense.category), "expense-category-icon"), info, amount, remove); container.append(card);
  });
}
document.addEventListener("DOMContentLoaded", async () => {
  let isSubmitting = false;
  const user = await requireAuth(); if (!user) return;
  await applyTheme(); await showBudget();
  const settings = await loadSettings(), budget = document.getElementById("budget"), initial = document.getElementById("initial-funds"), currency = document.getElementById("currency"), theme = document.getElementById("theme");
  if (budget && settings.budget != null) budget.value = settings.budget;
  if (initial && settings.initial_funds != null) initial.value = settings.initial_funds;
  if (currency && settings.currency) currency.value = settings.currency;
  if (theme && settings.theme) theme.value = settings.theme;
  const form = document.getElementById("expense-form");
  if (form) form.onsubmit = async event => {
    event.preventDefault(); if (isSubmitting) return; isSubmitting = true;
    const button = form.querySelector('button[type="submit"]'), original = button ? Array.from(button.childNodes, node => node.cloneNode(true)) : [];
    if (button) { button.disabled = true; button.textContent = "保存中…"; }
    try {
      await saveExpense({desc:document.getElementById("desc").value.trim(),amount:Number(document.getElementById("amount").value),category:document.getElementById("category").value,date:document.getElementById("date").value,type:document.getElementById("type").value});
      alert("账单已添加！"); location.href = "history.html";
    } catch (error) {
      isSubmitting = false; if (button) { button.disabled = false; button.replaceChildren(...original); }
      alert("保存失败，请稍后重试。"); console.error(error);
    }
  };
  const list = document.getElementById("history-list");
  if (list) {
    const expenses = await getExpenses(); renderExpenses(expenses, list);
    const query = document.getElementById("search");
    if (query) query.oninput = () => renderExpenses(expenses.filter(expense => expense.desc.toLowerCase().includes(query.value.toLowerCase())), list);
  }
});
