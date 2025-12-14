import {
  auth,
  signOut,
  db,
  doc,
  getDoc,
  updateDoc,
} from "../services/firebase.js";
import {
  getTransactions,
  calculateBalance,
  deleteTransaction,
  updateTransaction,
  getFinancialGoal,
  saveFinancialGoal,
} from "../services/finance.js";
import { getTasks } from "../services/tasks.service.js";
import { getNotes } from "../services/notes.service.js";
import { showToast, showConfirm } from "../utils/ui.js";

export function Dashboard() {
  const user = auth.currentUser;
  // Fallback seguro para nome de exibição
  const displayName = user && (user.displayName || user.email.split("@")[0]);
  let currentTransactions = []; // Estado local para filtro
  let currentFilterType = "all"; // 'all', 'income', 'expense'

  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100";

  element.innerHTML = `
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
      <div class="flex items-center gap-2">
        <i class="fas fa-chart-pie text-indigo-600 text-xl"></i>
        <h1 class="text-xl font-bold text-gray-800 dark:text-white">Se Organiza</h1>
      </div>
      <div class="flex items-center gap-4">
        <button id="global-search-btn" class="text-gray-500 hover:text-indigo-600 transition-colors" title="Busca Global">
            <i class="fas fa-search text-xl"></i>
        </button>
        <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
            <i class="fas fa-adjust text-xl"></i>
        </button>
        <button onclick="window.location.hash='/notifications'" class="text-gray-500 hover:text-indigo-600 transition-colors relative">
            <i class="fas fa-bell text-xl"></i>
            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
        </button>
        <button id="logout-btn" class="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Sair">
            <i class="fas fa-sign-out-alt text-lg"></i>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 p-6 max-w-5xl mx-auto w-full overflow-y-auto">
      <div class="mb-8">
        <h2 class="text-2xl font-bold">Olá, <span class="text-indigo-600">${displayName}</span></h2>
        <p class="text-gray-500 dark:text-gray-400">Aqui está o resumo das suas finanças este mês.</p>
      </div>

      <!-- Quick Actions (Moved Up) -->
      <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Acesso Rápido</h3>
      <div id="quick-actions-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 transition-all duration-300">
        <button onclick="window.location.hash='/finance'" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 group">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
             <i class="fas fa-plus text-lg"></i>
          </div>
          <span class="text-sm font-medium">Nova Transação</span>
        </button>
        <button onclick="window.location.hash='/tasks'" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 group">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
             <i class="fas fa-tasks text-lg"></i>
          </div>
          <span class="text-sm font-medium">Tarefas</span>
        </button>
        <button onclick="window.location.hash='/notes'" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400 group">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/30 transition-colors">
             <i class="fas fa-sticky-note text-lg"></i>
          </div>
          <span class="text-sm font-medium">Notas</span>
        </button>
        <button onclick="window.location.hash='/profile'" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400 group">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-green-50 dark:group-hover:bg-green-900/30 transition-colors">
             <i class="fas fa-user text-lg"></i>
          </div>
          <span class="text-sm font-medium">Perfil</span>
        </button>
        <button onclick="window.location.hash='/videos'" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 group">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-900/30 transition-colors">
             <i class="fab fa-youtube text-lg"></i>
          </div>
          <span class="text-sm font-medium">Vídeos</span>
        </button>
        
        <!-- Admin Button (Conditional) -->
        ${
          user.email === "lucianosantosseverino@gmail.com"
            ? `
        <button onclick="window.location.hash='/admin'" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 group">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-900/30 transition-colors">
             <i class="fas fa-shield-alt text-lg"></i>
          </div>
          <span class="text-sm font-medium">Admin</span>
        </button>
        `
            : ""
        }

        <button onclick="window.location.hash='/about'" class="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition flex flex-col items-center gap-3 text-gray-600 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400 group">
          <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-purple-50 dark:group-hover:bg-purple-900/30 transition-colors">
             <i class="fas fa-info-circle text-lg"></i>
          </div>
          <span class="text-sm font-medium">Sobre</span>
        </button>
      </div>

      <!-- Financial Summary Cards -->
      <div id="financial-summary" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 transition-all duration-300">
        <!-- Saldo -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-indigo-500 relative overflow-hidden">
          <div class="flex justify-between items-start relative z-10">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Saldo Atual</p>
              <h3 id="balance-amount" class="text-2xl font-bold tracking-tight">...</h3>
            </div>
            <div class="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
              <i class="fas fa-wallet text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Receitas -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Receitas</p>
              <h3 id="income-amount" class="text-2xl font-bold text-emerald-600 tracking-tight">...</h3>
            </div>
            <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
              <i class="fas fa-arrow-up text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Despesas -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">Despesas</p>
              <h3 id="expense-amount" class="text-2xl font-bold text-red-600 tracking-tight">...</h3>
            </div>
            <div class="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg text-red-600">
              <i class="fas fa-arrow-down text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
            <div class="flex justify-between items-center">
                <h4 class="text-orange-800 dark:text-orange-200 font-semibold">Contas a Pagar</h4>
                <i class="fas fa-file-invoice-dollar text-orange-500"></i>
            </div>
            <p id="pending-expense" class="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-2">R$ 0,00</p>
            <p class="text-xs text-orange-600 dark:text-orange-400 mt-1">Total pendente este mês</p>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <div class="flex justify-between items-center">
                <h4 class="text-blue-800 dark:text-blue-200 font-semibold">Receitas a Receber</h4>
                <i class="fas fa-hand-holding-usd text-blue-500"></i>
            </div>
            <p id="pending-income" class="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">R$ 0,00</p>
            <p class="text-xs text-blue-600 dark:text-blue-400 mt-1">Total previsto este mês</p>
        </div>
      </div>

      <!-- Smart Insights (Innovative Feature) -->
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
        <div class="flex items-center gap-2 mb-4">
            <i class="fas fa-lightbulb text-yellow-300 text-xl"></i>
            <h3 class="text-lg font-bold">Insights Inteligentes</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4" id="insights-container">
            <p class="text-sm opacity-80 col-span-full">Analisando suas finanças...</p>
        </div>
      </div>

      <!-- Financial Goal -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm mb-8 border-l-4 border-purple-500">
        <div class="flex justify-between items-end mb-3">
            <div>
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Meta de Saldo</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">Acompanhe seu progresso financeiro</p>
            </div>
            <button id="edit-goal-btn" class="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg transition-colors">Definir Meta</button>
        </div>
        
        <div class="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden relative">
            <div id="goal-progress-bar" class="bg-purple-600 h-4 rounded-full transition-all duration-1000 ease-out relative" style="width: 0%"></div>
        </div>
        <div class="flex justify-between text-sm mt-2 font-medium text-gray-600 dark:text-gray-300">
            <span id="goal-current">R$ 0,00</span>
            <span id="goal-target">Meta: R$ 0,00</span>
        </div>
      </div>

      <!-- Charts Section -->
      <div id="charts-section" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 transition-all duration-300">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Despesas por Categoria</h3>
          <div class="relative h-64 w-full flex items-center justify-center">
            <canvas id="expenses-chart"></canvas>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Receitas por Categoria</h3>
          <div class="relative h-64 w-full flex items-center justify-center">
            <canvas id="incomes-chart"></canvas>
          </div>
        </div>
        
        <!-- Recent Transactions List with Actions -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm flex flex-col">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Transações Recentes</h3>
                <div class="relative">
                    <input type="text" id="trans-search" placeholder="Buscar..." class="pl-8 pr-3 py-1 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 outline-none w-32 focus:w-48 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400">
                    <i class="fas fa-search absolute left-2.5 top-2 text-gray-400 text-xs"></i>
                </div>
            </div>
            <div id="dashboard-transactions" class="flex-1 overflow-y-auto space-y-3 max-h-64 custom-scrollbar">
                <!-- Injected via JS -->
            </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div id="edit-trans-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 class="text-lg font-bold mb-4">Editar Transação</h3>
            <form id="edit-trans-form" class="space-y-3">
                <input type="hidden" name="id">
                <div>
                    <label class="block text-sm font-medium mb-1">Descrição</label>
                    <input type="text" name="description" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Valor</label>
                    <input type="number" step="0.01" name="amount" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none">
                </div>
                <div class="flex items-center">
                    <input id="edit-status" name="status" type="checkbox" class="w-4 h-4 text-indigo-600 rounded">
                    <label for="edit-status" class="ml-2 text-sm">Pago / Recebido</label>
                </div>
                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" id="close-edit-modal" class="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                    <button type="submit" class="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
                </div>
            </form>
        </div>
      </div>

      <!-- Goal Modal -->
      <div id="goal-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
            <h3 class="text-lg font-bold mb-4">Definir Meta de Saldo</h3>
            <form id="goal-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Valor Alvo (R$)</label>
                    <input type="number" step="0.01" name="goalAmount" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ex: 5000,00">
                </div>
                <div class="flex justify-end gap-2 mt-4">
                    <button type="button" id="close-goal-modal" class="px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded">Cancelar</button>
                    <button type="submit" class="px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700">Salvar</button>
                </div>
            </form>
        </div>
      </div>

      <!-- Global Search Modal -->
      <div id="global-search-modal" class="fixed inset-0 bg-black/50 hidden items-start justify-center z-[60] backdrop-blur-sm p-4 pt-20">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <i class="fas fa-search text-gray-400"></i>
                <input type="text" id="global-search-input" placeholder="Pesquisar em tudo (Tarefas, Notas, Transações)..." class="flex-1 bg-transparent outline-none text-lg text-gray-800 dark:text-gray-200 placeholder-gray-400">
                <button id="close-global-search" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
            </div>
            <div id="global-search-results" class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <div class="text-center text-gray-500 py-10">Digite para pesquisar...</div>
            </div>
        </div>
      </div>
    </main>
  `;

  // Lógica de Logout
  element.querySelector("#logout-btn").addEventListener("click", async () => {
    await signOut(auth);
  });

  // Edit Modal Logic
  const editModal = element.querySelector("#edit-trans-modal");
  const editForm = element.querySelector("#edit-trans-form");

  element.querySelector("#close-edit-modal").onclick = () =>
    editModal.classList.add("hidden");

  editForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = editForm.id.value;
    const data = {
      description: editForm.description.value,
      amount: editForm.amount.value,
      status: editForm.status.checked ? "paid" : "pending",
    };
    await updateTransaction(id, data);
    editModal.classList.add("hidden");
    loadFinancialData(); // Reload
  };

  // Goal Modal Logic
  const goalModal = element.querySelector("#goal-modal");
  const goalForm = element.querySelector("#goal-form");
  const editGoalBtn = element.querySelector("#edit-goal-btn");
  const closeGoalBtn = element.querySelector("#close-goal-modal");

  editGoalBtn.onclick = () => goalModal.classList.remove("hidden");
  closeGoalBtn.onclick = () => goalModal.classList.add("hidden");

  goalForm.onsubmit = async (e) => {
    e.preventDefault();
    await saveFinancialGoal(goalForm.goalAmount.value);
    goalModal.classList.add("hidden");
    loadFinancialData();
  };

  // Global Search Logic
  const globalSearchModal = element.querySelector("#global-search-modal");
  const globalSearchInput = element.querySelector("#global-search-input");
  const globalSearchResults = element.querySelector("#global-search-results");
  const closeGlobalSearch = element.querySelector("#close-global-search");
  const globalSearchBtn = element.querySelector("#global-search-btn");

  globalSearchBtn.onclick = () => {
    globalSearchModal.classList.remove("hidden");
    globalSearchModal.classList.add("flex");
    globalSearchInput.focus();
  };

  const closeSearch = () => {
    globalSearchModal.classList.add("hidden");
    globalSearchModal.classList.remove("flex");
    globalSearchInput.value = "";
    globalSearchResults.innerHTML =
      '<div class="text-center text-gray-500 py-10">Digite para pesquisar...</div>';
  };

  closeGlobalSearch.onclick = closeSearch;
  globalSearchModal.onclick = (e) => {
    if (e.target === globalSearchModal) closeSearch();
  };

  let searchTimeout;
  globalSearchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    const term = e.target.value.toLowerCase().trim();

    if (!term) {
      globalSearchResults.innerHTML =
        '<div class="text-center text-gray-500 py-10">Digite para pesquisar...</div>';
      return;
    }

    searchTimeout = setTimeout(async () => {
      globalSearchResults.innerHTML =
        '<div class="text-center py-4"><i class="fas fa-circle-notch fa-spin text-indigo-500"></i></div>';

      try {
        const [transactions, tasks, notes] = await Promise.all([
          getTransactions(), // Fetches all (no args)
          getTasks(),
          getNotes(),
        ]);

        const results = {
          transactions: transactions.filter(
            (t) =>
              (t.description && t.description.toLowerCase().includes(term)) ||
              (t.category && t.category.toLowerCase().includes(term))
          ),
          tasks: tasks.filter(
            (t) =>
              (t.title && t.title.toLowerCase().includes(term)) ||
              (t.description && t.description.toLowerCase().includes(term))
          ),
          notes: notes.filter(
            (n) =>
              (n.title && n.title.toLowerCase().includes(term)) ||
              (n.content && n.content.toLowerCase().includes(term))
          ),
        };

        let html = "";

        if (results.tasks.length > 0) {
          html += `<h4 class="font-bold text-gray-500 uppercase text-xs mb-2">Tarefas (${results.tasks.length})</h4><div class="space-y-2 mb-4">`;
          results.tasks.forEach(
            (t) =>
              (html += `<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-blue-500"><h5 class="font-medium dark:text-gray-200">${
                t.title
              }</h5><p class="text-sm text-gray-500 truncate">${
                t.description || ""
              }</p></div>`)
          );
          html += "</div>";
        }

        if (results.notes.length > 0) {
          html += `<h4 class="font-bold text-gray-500 uppercase text-xs mb-2">Notas (${results.notes.length})</h4><div class="space-y-2 mb-4">`;
          results.notes.forEach(
            (n) =>
              (html += `<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-yellow-500"><h5 class="font-medium dark:text-gray-200">${
                n.title || "Sem título"
              }</h5><p class="text-sm text-gray-500 truncate">${
                n.content || ""
              }</p></div>`)
          );
          html += "</div>";
        }

        if (results.transactions.length > 0) {
          html += `<h4 class="font-bold text-gray-500 uppercase text-xs mb-2">Transações (${results.transactions.length})</h4><div class="space-y-2 mb-4">`;
          results.transactions.forEach(
            (t) =>
              (html += `<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 ${
                t.type === "income" ? "border-emerald-500" : "border-red-500"
              } flex justify-between"><div><h5 class="font-medium dark:text-gray-200">${
                t.description || t.category
              }</h5><p class="text-xs text-gray-500">${new Date(
                t.date
              ).toLocaleDateString()}</p></div><span class="font-bold ${
                t.type === "income" ? "text-emerald-600" : "text-red-600"
              }">${t.type === "income" ? "+" : "-"} R$ ${
                t.amount
              }</span></div>`)
          );
          html += "</div>";
        }

        if (!html)
          html =
            '<div class="text-center text-gray-500 py-10">Nenhum resultado encontrado.</div>';
        globalSearchResults.innerHTML = html;
      } catch (e) {
        globalSearchResults.innerHTML =
          '<div class="text-center text-red-500">Erro na busca.</div>';
      }
    }, 500);
  });

  // Render List Helper
  const renderTransactionsList = (txs) => {
    const listEl = element.querySelector("#dashboard-transactions");
    listEl.innerHTML = "";

    if (txs.length === 0) {
      listEl.innerHTML =
        '<p class="text-gray-500 text-sm text-center py-4">Nenhuma transação encontrada.</p>';
      return;
    }

    txs.slice(0, 10).forEach((t) => {
      const div = document.createElement("div");
      div.className =
        "flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group";
      div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center ${
                  t.type === "income"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-red-100 text-red-600"
                }">
                    <i class="fas ${
                      t.type === "income" ? "fa-arrow-up" : "fa-arrow-down"
                    } text-xs"></i>
                </div>
                <div>
                    <p class="text-sm font-medium ${
                      t.status === "pending" ? "text-gray-500 line-through" : ""
                    }">${t.description || t.category}</p>
                    <p class="text-xs text-gray-500">${new Date(
                      t.date
                    ).toLocaleDateString("pt-BR")} 
                      ${
                        t.recurrence && t.recurrence !== "none"
                          ? '<i class="fas fa-sync-alt text-[10px] text-indigo-400"></i>'
                          : ""
                      } ${
        t.status === "pending"
          ? '<span class="text-orange-500">(Pendente)</span>'
          : ""
      }</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-sm font-bold ${
                  t.type === "income" ? "text-emerald-600" : "text-red-600"
                }">${t.type === "income" ? "+" : "-"} ${Number(
        t.amount
      ).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}</span>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button class="edit-btn text-blue-500 hover:bg-blue-100 p-1 rounded"><i class="fas fa-pen"></i></button>
                    <button class="del-btn text-red-500 hover:bg-red-100 p-1 rounded"><i class="fas fa-trash"></i></button>
                </div>
            </div>
          `;

      div.querySelector(".del-btn").onclick = async () => {
        showConfirm("Excluir transação?", async () => {
          await deleteTransaction(t.id);
          loadFinancialData();
        });
      };
      div.querySelector(".edit-btn").onclick = () => {
        editForm.id.value = t.id;
        editForm.description.value = t.description;
        editForm.amount.value = t.amount;
        editForm.status.checked = t.status === "paid";
        editModal.classList.remove("hidden");
        editModal.classList.add("flex");
      };
      listEl.appendChild(div);
    });
  };

  // Filter Tabs Logic
  element.querySelectorAll(".filter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update UI
      element.querySelectorAll(".filter-tab").forEach((b) => {
        b.className =
          "filter-tab px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors";
      });
      btn.className =
        "filter-tab px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300";

      currentFilterType = btn.dataset.type;
      const term = element.querySelector("#trans-search").value.toLowerCase();
      filterAndRender(term);
    });
  });

  const filterAndRender = (term) => {
    let filtered = currentTransactions.filter(
      (t) =>
        (t.description && t.description.toLowerCase().includes(term)) ||
        (t.category && t.category.toLowerCase().includes(term))
    );
    if (currentFilterType !== "all")
      filtered = filtered.filter((t) => t.type === currentFilterType);
    renderTransactionsList(filtered);
  };

  // Search Listener
  element
    .querySelector("#trans-search")
    .addEventListener("input", (e) =>
      filterAndRender(e.target.value.toLowerCase())
    );

  // Carregar dados reais
  const loadFinancialData = async () => {
    try {
      const now = new Date();
      const transactions = await getTransactions(
        now.getMonth(),
        now.getFullYear()
      );
      currentTransactions = transactions; // Update local state
      const { income, expense, total } = calculateBalance(transactions);

      const fmt = (val) =>
        val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

      element.querySelector("#balance-amount").textContent = fmt(total);
      element.querySelector("#income-amount").textContent = fmt(income);
      element.querySelector("#expense-amount").textContent = fmt(expense);

      // Calculate Pending
      const pendingExpense = transactions
        .filter((t) => t.type === "expense" && t.status === "pending")
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

      const pendingIncome = transactions
        .filter((t) => t.type === "income" && t.status === "pending")
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

      element.querySelector("#pending-expense").textContent =
        fmt(pendingExpense);
      element.querySelector("#pending-income").textContent = fmt(pendingIncome);

      // --- Goal Logic ---
      const goal = await getFinancialGoal();
      const currentBalance = total;

      element.querySelector("#goal-current").textContent = fmt(currentBalance);
      element.querySelector("#goal-target").textContent = `Meta: ${fmt(goal)}`;

      let progress = 0;
      if (goal > 0) {
        progress = (currentBalance / goal) * 100;
        if (progress < 0) progress = 0;
        if (progress > 100) progress = 100;
      }
      element.querySelector("#goal-progress-bar").style.width = `${progress}%`;

      // --- Chart Logic ---
      const processChartData = (type) =>
        transactions
          .filter((t) => t.type === type)
          .reduce((acc, curr) => {
            const cat = curr.category || "Outros";
            acc[cat] = (acc[cat] || 0) + Number(curr.amount);
            return acc;
          }, {});

      const renderChart = (canvasId, dataObj, colors) => {
        const chartCanvas = element.querySelector("#expenses-chart");
        const canvas = element.querySelector(`#${canvasId}`);
        if (canvas && window.Chart) {
          const labels = Object.keys(dataObj);
          const data = Object.values(dataObj);

          // Destroy old instance if exists to prevent overlay
          const existingChart = Chart.getChart(canvas);
          if (existingChart) existingChart.destroy();

          if (labels.length === 0) {
            // Optional: Show "No Data" message
          } else {
            new Chart(canvas, {
              type: "doughnut",
              data: {
                labels: labels,
                datasets: [
                  {
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 4,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { usePointStyle: true, padding: 20 },
                  },
                },
              },
            });
          }
        }
      };

      const expenseColors = [
        "#EF4444",
        "#F59E0B",
        "#F87171",
        "#B91C1C",
        "#7F1D1D",
        "#FECACA",
      ];
      const incomeColors = [
        "#10B981",
        "#3B82F6",
        "#34D399",
        "#059669",
        "#047857",
        "#D1FAE5",
      ];

      renderChart("expenses-chart", processChartData("expense"), expenseColors);
      renderChart("incomes-chart", processChartData("income"), incomeColors);

      // --- Generate Insights ---
      const insightsContainer = element.querySelector("#insights-container");
      insightsContainer.innerHTML = "";

      // 1. Savings Rate
      if (income > 0) {
        const savingsRate = ((income - expense) / income) * 100;
        let savingsMsg = "";
        let icon = "";
        if (savingsRate > 20) {
          savingsMsg = `Ótimo! Você poupou ${savingsRate.toFixed(
            0
          )}% da sua renda.`;
          icon = "fa-piggy-bank";
        } else if (savingsRate > 0) {
          savingsMsg = `Você poupou ${savingsRate.toFixed(
            0
          )}%. Tente chegar a 20%!`;
          icon = "fa-coins";
        } else {
          savingsMsg = `Atenção: Seus gastos superaram seus ganhos.`;
          icon = "fa-exclamation-triangle";
        }
        insightsContainer.innerHTML += `
              <div class="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <div class="flex items-center gap-2 mb-1 font-semibold"><i class="fas ${icon}"></i> Poupança</div>
                  <p class="text-sm opacity-90">${savingsMsg}</p>
              </div>
          `;
      }

      // 2. Top Expense Category
      const expenses = transactions.filter((t) => t.type === "expense");
      if (expenses.length > 0) {
        const catTotals = expenses.reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
          return acc;
        }, {});
        const topCat = Object.keys(catTotals).reduce((a, b) =>
          catTotals[a] > catTotals[b] ? a : b
        );
        insightsContainer.innerHTML += `
              <div class="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <div class="flex items-center gap-2 mb-1 font-semibold"><i class="fas fa-chart-line"></i> Maior Gasto</div>
                  <p class="text-sm opacity-90">Sua maior despesa é com <strong>${topCat}</strong>.</p>
              </div>
          `;
      }

      // 3. Random Tip
      const tips = [
        "Revise suas assinaturas mensais.",
        "Tente a regra 50/30/20.",
        "Defina uma meta de saldo maior.",
        "Evite compras por impulso.",
        "Categorize todos os seus gastos.",
      ];
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      insightsContainer.innerHTML += `
          <div class="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <div class="flex items-center gap-2 mb-1 font-semibold"><i class="fas fa-info-circle"></i> Dica</div>
              <p class="text-sm opacity-90">${randomTip}</p>
          </div>
      `;

      // --- List Logic ---
      renderTransactionsList(transactions);
    } catch (error) {
      console.error("Erro ao carregar finanças:", error);
    }
  };

  // --- Share App Card Logic ---
  const shareCard = document.createElement("div");
  shareCard.className =
    "fixed bottom-20 right-4 max-w-xs w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-40 transform transition-all duration-500 translate-y-20 opacity-0 hidden";
  shareCard.innerHTML = `
      <div class="flex justify-between items-start mb-2">
          <div class="flex items-center gap-2">
              <i class="fas fa-heart text-red-500"></i>
              <h4 class="font-bold text-gray-800 dark:text-white text-sm">Gostando do App?</h4>
          </div>
          <button id="close-share-card" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><i class="fas fa-times"></i></button>
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">Compartilhe com amigos e ajude a comunidade!</p>
      <div class="flex gap-2">
          <button id="share-wa" class="flex-1 bg-[#25D366] text-white py-2 rounded-lg hover:opacity-90 transition-opacity" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
          <button id="share-fb" class="flex-1 bg-[#1877F2] text-white py-2 rounded-lg hover:opacity-90 transition-opacity" title="Facebook"><i class="fab fa-facebook-f"></i></button>
          <button id="share-native" class="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:opacity-90 transition-opacity" title="Outros / Instagram"><i class="fas fa-share-alt"></i></button>
      </div>
  `;
  element.appendChild(shareCard);

  const checkShareCard = () => {
    const lastShown = localStorage.getItem("share_last_shown");
    const now = Date.now();
    const interval = 3 * 24 * 60 * 60 * 1000; // 3 dias em milissegundos

    // Mostra se nunca foi mostrado ou se passou o intervalo
    if (!lastShown || now - parseInt(lastShown) > interval) {
      setTimeout(() => {
        shareCard.classList.remove("hidden");
        // Força reflow para animação funcionar
        void shareCard.offsetWidth;
        shareCard.classList.remove("translate-y-20", "opacity-0");
        localStorage.setItem("share_last_shown", now.toString());
      }, 3000); // Aparece 3 segundos após carregar o dashboard
    }
  };

  shareCard.querySelector("#close-share-card").onclick = () => {
    shareCard.classList.add("translate-y-20", "opacity-0");
    setTimeout(() => shareCard.classList.add("hidden"), 500);
  };

  const appUrl = window.location.href.split("#")[0]; // URL base do app
  const shareText =
    "Gerencie suas finanças e tarefas com o Se Organiza! Confira:";

  shareCard.querySelector("#share-wa").onclick = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        shareText + " " + appUrl
      )}`,
      "_blank"
    );
  };

  shareCard.querySelector("#share-fb").onclick = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        appUrl
      )}`,
      "_blank"
    );
  };

  shareCard.querySelector("#share-native").onclick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Se Organiza",
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareText + " " + appUrl);
      showToast("Link copiado para a área de transferência!");
    }
  };

  checkShareCard();

  // --- Onboarding Tutorial Logic ---
  const startOnboarding = async () => {
    const steps = [
      {
        title: "Bem-vindo ao Se Organiza! 🚀",
        text: "Seu novo assistente para gestão financeira e pessoal. Vamos fazer um tour rápido para você aproveitar ao máximo?",
        target: null,
      },
      {
        title: "Acesso Rápido ⚡",
        text: "Aqui você encontra atalhos para criar transações, tarefas, notas e acessar vídeos educativos.",
        target: "#quick-actions-grid",
      },
      {
        title: "Resumo Financeiro 💰",
        text: "Acompanhe seu saldo atual, receitas e despesas do mês em tempo real nestes cartões.",
        target: "#financial-summary",
      },
      {
        title: "Gráficos e Listas 📊",
        text: "Visualize para onde seu dinheiro está indo e gerencie suas últimas transações aqui.",
        target: "#charts-section",
      },
    ];

    let currentStep = 0;

    // Create Overlay
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-black/70 z-[100] flex flex-col justify-end sm:justify-center items-center p-4 transition-opacity duration-300 opacity-0";
    overlay.innerHTML = `
          <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full relative transform transition-all duration-300 translate-y-10">
              <div class="flex justify-between items-center mb-4">
                  <h3 id="onb-title" class="text-xl font-bold text-indigo-600 dark:text-indigo-400"></h3>
                  <span id="onb-step" class="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full"></span>
              </div>
              <p id="onb-text" class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed"></p>
              <div class="flex justify-between items-center">
                  <button id="onb-skip" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium">Pular Tour</button>
                  <button id="onb-next" class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/30">Próximo</button>
              </div>
          </div>
      `;
    document.body.appendChild(overlay);

    // Animate In
    requestAnimationFrame(() => {
      overlay.classList.remove("opacity-0");
      overlay.querySelector("div").classList.remove("translate-y-10");
    });

    const updateStep = async () => {
      const step = steps[currentStep];
      overlay.querySelector("#onb-title").textContent = step.title;
      overlay.querySelector("#onb-text").textContent = step.text;
      overlay.querySelector("#onb-step").textContent = `${currentStep + 1}/${
        steps.length
      }`;
      overlay.querySelector("#onb-next").textContent =
        currentStep === steps.length - 1 ? "Concluir" : "Próximo";

      // Highlight Logic
      document
        .querySelectorAll(".ring-4")
        .forEach((el) =>
          el.classList.remove(
            "ring-4",
            "ring-indigo-500",
            "ring-offset-4",
            "dark:ring-offset-gray-900"
          )
        );

      if (step.target) {
        const targetEl = element.querySelector(step.target);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          targetEl.classList.add(
            "ring-4",
            "ring-indigo-500",
            "ring-offset-4",
            "dark:ring-offset-gray-900"
          );
        }
      }
    };

    const finishOnboarding = async () => {
      document
        .querySelectorAll(".ring-4")
        .forEach((el) =>
          el.classList.remove(
            "ring-4",
            "ring-indigo-500",
            "ring-offset-4",
            "dark:ring-offset-gray-900"
          )
        );
      overlay.classList.add("opacity-0");
      setTimeout(() => overlay.remove(), 300);
      await updateDoc(doc(db, "users", user.uid), {
        onboardingCompleted: true,
      });
    };

    overlay.querySelector("#onb-next").onclick = () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        updateStep();
      } else {
        finishOnboarding();
      }
    };
    overlay.querySelector("#onb-skip").onclick = finishOnboarding;

    updateStep();
  };

  loadFinancialData();

  // Check Onboarding Status
  setTimeout(async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && !userDoc.data().onboardingCompleted) {
        startOnboarding();
      }
    } catch (e) {
      console.error(e);
    }
  }, 1000);

  return element;
}
