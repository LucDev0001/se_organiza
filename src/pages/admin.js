import {
  db,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "../services/firebase.js";
import { showToast, showConfirm } from "../utils/ui.js";

export function Admin() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100";

  element.innerHTML = `
        <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center gap-4">
                <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-white">Painel Administrativo</h1>
            </div>
            <div class="flex items-center gap-4">
                <span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded hidden sm:inline-block">ADMIN</span>
                <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                    <i class="fas fa-adjust text-xl"></i>
                </button>
                <button onclick="window.location.hash='/notifications'" class="text-gray-500 hover:text-indigo-600 transition-colors relative">
                    <i class="fas fa-bell text-xl"></i>
                    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
                </button>
            </div>
        </header>

        <main class="flex-1 p-6 max-w-6xl mx-auto w-full overflow-y-auto space-y-8">
            
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Total de Usuários</p>
                    <h3 id="total-users" class="text-2xl font-bold">...</h3>
                </div>
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Transações Recentes</p>
                    <h3 id="total-transactions" class="text-2xl font-bold">...</h3>
                </div>
                 <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Tarefas no Sistema</p>
                    <h3 id="total-tasks" class="text-2xl font-bold">...</h3>
                </div>
            </div>

            <!-- Users Table -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 class="text-lg font-semibold">Usuários Cadastrados</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th class="px-6 py-3">UID</th>
                                <th class="px-6 py-3">Email</th>
                                <th class="px-6 py-3">Data Cadastro</th>
                                <th class="px-6 py-3">Plano</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <tr><td colspan="3" class="px-6 py-4 text-center">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Recent Transactions -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 class="text-lg font-semibold">Últimas Transações (Global)</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th class="px-6 py-3">Usuário (UID)</th>
                                <th class="px-6 py-3">Tipo</th>
                                <th class="px-6 py-3">Valor</th>
                                <th class="px-6 py-3">Data</th>
                            </tr>
                        </thead>
                        <tbody id="transactions-table-body">
                            <tr><td colspan="4" class="px-6 py-4 text-center">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </main>
    `;

  const loadData = async () => {
    try {
      // Users
      const usersSnap = await getDocs(collection(db, "users"));
      const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      document.getElementById("total-users").textContent = users.length;

      const usersTable = document.getElementById("users-table-body");
      usersTable.innerHTML = users
        .map(
          (u) => `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4 font-mono text-xs">${u.id}</td>
                    <td class="px-6 py-4">${u.email}</td>
                    <td class="px-6 py-4">${
                      u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "N/A"
                    }</td>
                    <td class="px-6 py-4">
                        <button class="toggle-premium-btn px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          u.isPremium
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        }" data-id="${u.id}" data-status="${u.isPremium}">
                            ${u.isPremium ? "Premium" : "Grátis"}
                        </button>
                    </td>
                </tr>
            `
        )
        .join("");

      // Add Event Listeners for Premium Toggle
      usersTable.querySelectorAll(".toggle-premium-btn").forEach((btn) => {
        btn.onclick = () => {
          const uid = btn.dataset.id;
          const currentStatus = btn.dataset.status === "true";
          const newStatus = !currentStatus;

          showConfirm(
            `Alterar status do usuário para ${
              newStatus ? "Premium" : "Grátis"
            }?`,
            async () => {
              try {
                await updateDoc(doc(db, "users", uid), {
                  isPremium: newStatus,
                });
                showToast("Status atualizado com sucesso!");
                loadData();
              } catch (error) {
                console.error(error);
                showToast("Erro ao atualizar status.", "error");
              }
            }
          );
        };
      });

      // Transactions (Global - Limit 20)
      const transactionsSnap = await getDocs(
        query(
          collection(db, "transactions"),
          orderBy("date", "desc"),
          limit(20)
        )
      );
      const transactions = transactionsSnap.docs.map((d) => d.data());

      document.getElementById("total-transactions").textContent =
        transactionsSnap.size + (transactionsSnap.size === 20 ? "+" : "");

      const transTable = document.getElementById("transactions-table-body");
      transTable.innerHTML = transactions
        .map(
          (t) => `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4 font-mono text-xs">${t.userId}</td>
                    <td class="px-6 py-4"><span class="${
                      t.type === "income" ? "text-emerald-600" : "text-red-600"
                    } font-medium">${
            t.type === "income" ? "Receita" : "Despesa"
          }</span></td>
                    <td class="px-6 py-4">R$ ${Number(t.amount).toFixed(2)}</td>
                    <td class="px-6 py-4">${new Date(
                      t.date
                    ).toLocaleDateString()}</td>
                </tr>
            `
        )
        .join("");

      // Tasks Stats
      const tasksSnap = await getDocs(collection(db, "tasks"));
      document.getElementById("total-tasks").textContent = tasksSnap.size;
    } catch (error) {
      console.error("Admin Load Error:", error);
    }
  };

  loadData();
  return element;
}
