// ===================== THEME =====================
function applyTheme() {
  const settings = JSON.parse(localStorage.getItem("settings")) || {};
  const theme = settings.theme || "light";

  document.body.classList.toggle("dark", theme === "dark");
  document.querySelectorAll(".expense-card").forEach(card => {
    card.classList.toggle("dark", theme === "dark");
  });
}
function showBudget() {
  const settings = JSON.parse(localStorage.getItem("settings")) || {};
  const budget = settings.budget || "未设置";
  const currency = settings.currency || "INR";

  const display = document.getElementById("budget-display");
  if (display) {
    display.textContent = `🎯 月度预算： ${currency} ${budget}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(); // already exists
  showBudget(); // add this
});


// ===================== SETTINGS =====================
// Apply theme on page load
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
});

// Save settings
function save设置() {
  const budget = document.getElementById("budget")?.value;
  const currency = document.getElementById("currency")?.value;
  const theme = document.getElementById("theme")?.value;

  const settings = { budget, currency, theme };
  localStorage.setItem("settings", JSON.stringify(settings));

  applyTheme();
  showToast("✅ 设置 Saved!");
}

// Apply theme
function applyTheme() {
  const settings = JSON.parse(localStorage.getItem("settings")) || {};
  const theme = settings.theme || "light";

  document.body.classList.toggle("dark", theme === "dark");
  document.querySelectorAll(".expense-card").forEach(card => {
    card.classList.toggle("dark", theme === "dark");
  });
}

// Reset all data
function resetData() {
  if (confirm("确定要清空所有账单和设置吗？")) {
    localStorage.removeItem("expenses");
    localStorage.removeItem("settings");
    showToast("🗑️ 已清空全部数据！");
  }
}

// Export all expenses
function exportAllExpenses() {
  const expenses = JSON.parse(localStorage.getItem("expenses")) || [];
  if (expenses.length === 0) {
    showToast("⚠️ 暂无账单可导出。");
    return;
  }

  const blob = new Blob([JSON.stringify(expenses, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "全部账单.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }
}

// ===================== ADD EXPENSE =====================
document.addEventListener("DOMContentLoaded", () => {
  applyTheme();

  const form = document.getElementById("expense-form");
  const historyList = document.getElementById("history-list");
  const searchInput = document.getElementById("search");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const desc = document.getElementById("desc").value;
      const amount = parseFloat(document.getElementById("amount").value);
      const category = document.getElementById("category").value;
      const date = document.getElementById("date").value;

      const expense = { desc, amount, category, date };
      saveExpense(expense);
      form.reset();
      alert("账单已添加！");
    });
  }

  if (historyList) {
    const expenses = getExpenses();
    renderExpenses(expenses, historyList);

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const filtered = expenses.filter(exp =>
          exp.desc.toLowerCase().includes(searchInput.value.toLowerCase())
        );
        renderExpenses(filtered, historyList);
      });
    }
  }
});

// ===================== RENDER HISTORY =====================
function renderExpenses(expenses, container) {
  container.innerHTML = "";
  expenses.forEach((exp, index) => {
    const card = document.createElement("div");
    card.className = "expense-card";
    card.innerHTML = `
      <span>${exp.desc} (${exp.category}) - ${exp.date}</span>
      <span class="amount">₹${exp.amount}</span>
      <span class="delete" onclick="deleteExpense(${index})">x</span>
    `;
    container.appendChild(card);
  });
}
