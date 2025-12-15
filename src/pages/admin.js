import {
  db,
  collection,
  getDocs,
  getDoc,
  query,
  where,
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

  let allUsersData = [];

  const renderDashboard = () => {
    element.innerHTML = `
        <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center gap-4">
                <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-arrow-left text-xl"></i> <span class="text-sm font-medium ml-1">Voltar</span>
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
                    <h3 id="total-users" class="text-2xl font-bold text-gray-800 dark:text-white">...</h3>
                </div>
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Total de Transações</p>
                    <h3 id="total-transactions" class="text-2xl font-bold text-gray-800 dark:text-white">...</h3>
                </div>
                 <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Tarefas no Sistema</p>
                    <h3 id="total-tasks" class="text-2xl font-bold text-gray-800 dark:text-white">...</h3>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Novos Usuários</h2>
                    <div class="relative h-64 w-full">
                        <canvas id="userGrowthChart"></canvas>
                    </div>
                </div>
                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribuição de Planos</h2>
                    <div class="relative h-64 w-full">
                        <canvas id="userDistributionChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Gerenciar Usuários</h2>
                    <div class="flex gap-2 w-full sm:w-auto">
                        <input type="text" id="search-users" placeholder="Buscar email ou ID..." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                        <button id="backup-json" class="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none dark:focus:ring-indigo-800 whitespace-nowrap" title="Backup Completo do Banco de Dados">
                            <i class="fas fa-database mr-2"></i> Backup
                        </button>
                        <button id="export-csv" class="text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2.5 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800 whitespace-nowrap">
                            <i class="fas fa-file-csv mr-2"></i> Exportar
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th class="px-6 py-3">Email</th>
                                <th class="px-6 py-3">Data Cadastro</th>
                                <th class="px-6 py-3 text-center">Transações</th>
                                <th class="px-6 py-3 text-center">Tarefas</th>
                                <th class="px-6 py-3">Última Atividade</th>
                                <th class="px-6 py-3">Plano</th>
                                <th class="px-6 py-3">Validade</th>
                                <th class="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="users-table-body">
                            <tr><td colspan="3" class="px-6 py-4 text-center">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal de Assinatura -->
            <div id="subscription-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 backdrop-blur-sm p-4">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
                    <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white">Gerenciar Assinatura</h3>
                    <form id="subscription-form" class="space-y-4">
                        <input type="hidden" name="userId">
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
                            <select name="isPremium" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none">
                                <option value="false">Grátis</option>
                                <option value="true">Premium</option>
                            </select>
                        </div>
                        <div id="dates-container" class="space-y-4 hidden">
                            <div>
                                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Data Início</label>
                                <input type="date" name="startDate" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Data Fim (Validade)</label>
                                <input type="date" name="endDate" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none">
                            </div>
                            <div class="flex gap-2 text-xs">
                                <button type="button" class="quick-date px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded" data-days="30">+30 Dias</button>
                                <button type="button" class="quick-date px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded" data-days="365">+1 Ano</button>
                            </div>
                        </div>
                        <div class="flex justify-end gap-2 mt-4">
                            <button type="button" id="close-sub-modal" class="px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded">Cancelar</button>
                            <button type="submit" class="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    `;
    setupDashboardListeners();
    loadData();
  };

  const loadData = async () => {
    try {
      // Fetch all data in parallel for stats
      const [usersSnap, transactionsSnap, tasksSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "transactions")),
        getDocs(collection(db, "tasks")),
      ]);

      const users = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const transactions = transactionsSnap.docs.map((d) => d.data());
      const tasks = tasksSnap.docs.map((d) => d.data());

      // Update Global Stats
      document.getElementById("total-users").textContent = users.length;
      document.getElementById("total-transactions").textContent =
        transactions.length;
      document.getElementById("total-tasks").textContent = tasks.length;

      // Process User Stats
      const usersWithStats = users.map((user) => {
        const userTrans = transactions.filter((t) => t.userId === user.id);
        const userTasks = tasks.filter((t) => t.userId === user.id);

        // Calculate Last Activity
        const dates = [
          ...(user.createdAt ? [new Date(user.createdAt)] : []),
          ...userTrans.map((t) => (t.date ? new Date(t.date) : null)),
          ...userTasks.map((t) =>
            t.createdAt || t.date ? new Date(t.createdAt || t.date) : null
          ),
        ]
          .filter(Boolean)
          .map((d) => d.getTime());

        const lastActivity = dates.length > 0 ? Math.max(...dates) : null;

        return {
          ...user,
          transCount: userTrans.length,
          taskCount: userTasks.length,
          lastActivity,
        };
      });

      // Sort by Last Activity (Most recent first)
      usersWithStats.sort(
        (a, b) => (b.lastActivity || 0) - (a.lastActivity || 0)
      );

      allUsersData = usersWithStats;
      renderTable(allUsersData);
      renderCharts(users);
    } catch (error) {
      console.error("Admin Load Error:", error);
    }
  };

  const renderTable = (usersList) => {
    const usersTable = document.getElementById("users-table-body");

    if (usersList.length === 0) {
      usersTable.innerHTML =
        '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Nenhum usuário encontrado</td></tr>';
      return;
    }

    usersTable.innerHTML = usersList
      .map((u) => {
        const endDate = u.premiumEndDate ? new Date(u.premiumEndDate) : null;
        const isExpired = endDate && endDate < new Date();
        const statusColor = u.isPremium
          ? isExpired
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800"
          : "bg-gray-200 text-gray-600";

        return `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        ${u.email}
                        <div class="text-xs text-gray-500 font-mono">${
                          u.id
                        }</div>
                    </td>
                    <td class="px-6 py-4">${
                      u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "N/A"
                    }</td>
                    <td class="px-6 py-4 text-center">
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                            ${u.transCount}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                        <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
                            ${u.taskCount}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-gray-500">
                        ${
                          u.lastActivity
                            ? new Date(u.lastActivity).toLocaleString()
                            : "Sem atividade"
                        }
                    </td>
                    <td class="px-6 py-4">
                        <button class="toggle-premium-btn px-3 py-1 rounded-full text-xs font-bold transition-colors ${statusColor} hover:opacity-80" data-id="${
          u.id
        }" data-premium="${u.isPremium}" data-start="${
          u.premiumStartDate || ""
        }" data-end="${u.premiumEndDate || ""}">
                            ${
                              u.isPremium
                                ? isExpired
                                  ? "Expirado"
                                  : "Premium"
                                : "Grátis"
                            }
                        </button>
                    </td>
                    <td class="px-6 py-4 text-xs text-gray-500">
                        ${endDate ? endDate.toLocaleDateString() : "-"}
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button class="view-profile-btn text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium" data-id="${
                          u.id
                        }" title="Ver Detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
      })
      .join("");

    // --- Lógica do Modal de Assinatura ---
    const subModal = element.querySelector("#subscription-modal");
    const subForm = element.querySelector("#subscription-form");
    const datesContainer = element.querySelector("#dates-container");
    const statusSelect = subForm.querySelector("select[name='isPremium']");

    // Toggle visibility of dates based on status
    statusSelect.onchange = () => {
      if (statusSelect.value === "true") {
        datesContainer.classList.remove("hidden");
      } else {
        datesContainer.classList.add("hidden");
      }
    };

    // Quick Date Buttons
    subForm.querySelectorAll(".quick-date").forEach((btn) => {
      btn.onclick = () => {
        const days = parseInt(btn.dataset.days);
        const start = new Date();
        const end = new Date();
        end.setDate(end.getDate() + days);

        subForm.startDate.valueAsDate = start;
        subForm.endDate.valueAsDate = end;
      };
    });

    element.querySelector("#close-sub-modal").onclick = () => {
      subModal.classList.add("hidden");
      subModal.classList.remove("flex");
    };

    subForm.onsubmit = async (e) => {
      e.preventDefault();
      const uid = subForm.userId.value;
      const isPremium = subForm.isPremium.value === "true";

      const updateData = {
        isPremium: isPremium,
        premiumStartDate: isPremium ? subForm.startDate.value : null,
        premiumEndDate: isPremium ? subForm.endDate.value : null,
      };

      try {
        await updateDoc(doc(db, "users", uid), updateData);
        showToast("Assinatura atualizada!");
        subModal.classList.add("hidden");
        subModal.classList.remove("flex");
        loadData();
      } catch (error) {
        console.error(error);
        showToast("Erro ao salvar.", "error");
      }
    };

    // Open Modal on Click
    usersTable.querySelectorAll(".toggle-premium-btn").forEach((btn) => {
      btn.onclick = () => {
        const uid = btn.dataset.id;
        const isPremium = btn.dataset.premium === "true";

        subForm.userId.value = uid;
        subForm.isPremium.value = isPremium.toString();

        if (isPremium && btn.dataset.start) {
          subForm.startDate.value = btn.dataset.start;
          subForm.endDate.value = btn.dataset.end;
          datesContainer.classList.remove("hidden");
        } else {
          subForm.startDate.valueAsDate = new Date();
          // Default +30 days
          const d = new Date();
          d.setDate(d.getDate() + 30);
          subForm.endDate.valueAsDate = d;
          datesContainer.classList.add("hidden"); // Hidden initially if free
          if (isPremium) datesContainer.classList.remove("hidden");
        }

        subModal.classList.remove("hidden");
        subModal.classList.add("flex");
      };
    });

    // Add Event Listeners for View Profile
    usersTable.querySelectorAll(".view-profile-btn").forEach((btn) => {
      btn.onclick = () => {
        showUserDetails(btn.dataset.id);
      };
    });
  };

  const setupDashboardListeners = () => {
    const searchInput = element.querySelector("#search-users");
    if (searchInput) {
      searchInput.addEventListener("keyup", (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allUsersData.filter(
          (u) =>
            (u.email && u.email.toLowerCase().includes(term)) ||
            (u.id && u.id.toLowerCase().includes(term))
        );
        renderTable(filtered);
      });
    }

    const exportBtn = element.querySelector("#export-csv");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        const headers = [
          "ID",
          "Email",
          "Data Cadastro",
          "Transações",
          "Tarefas",
          "Última Atividade",
          "Premium",
        ];
        const rows = allUsersData.map((u) => [
          u.id,
          u.email,
          u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
          u.transCount,
          u.taskCount,
          u.lastActivity ? new Date(u.lastActivity).toLocaleString() : "",
          u.isPremium ? "Sim" : "Não",
        ]);

        const csvContent =
          "data:text/csv;charset=utf-8," +
          headers.join(",") +
          "\n" +
          rows.map((e) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "usuarios_se_organiza.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }

    const backupBtn = element.querySelector("#backup-json");
    if (backupBtn) {
      backupBtn.addEventListener("click", async () => {
        const originalText = backupBtn.innerHTML;
        backupBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin mr-2"></i> Gerando...';
        backupBtn.disabled = true;

        try {
          const collections = [
            "users",
            "transactions",
            "tasks",
            "notes",
            "savings_goals",
            "categories",
          ];
          const backupData = {};

          for (const colName of collections) {
            const snap = await getDocs(collection(db, colName));
            backupData[colName] = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));
          }

          const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(backupData, null, 2));
          const downloadAnchorNode = document.createElement("a");
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute(
            "download",
            `backup_se_organiza_${new Date().toISOString().split("T")[0]}.json`
          );
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
        } catch (error) {
          console.error("Backup error:", error);
          showToast("Erro ao gerar backup.", "error");
        } finally {
          backupBtn.innerHTML = originalText;
          backupBtn.disabled = false;
        }
      });
    }
  };

  const renderCharts = async (users) => {
    if (!window.Chart) {
      await new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    // Growth Chart
    const ctx = document.getElementById("userGrowthChart").getContext("2d");

    const labels = [];
    const data = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = d.toLocaleString("pt-BR", { month: "short" });
      // Capitalize first letter
      labels.push(monthName.charAt(0).toUpperCase() + monthName.slice(1));

      const count = users.filter((u) => {
        if (!u.createdAt) return false;
        const uDate = new Date(u.createdAt);
        return (
          uDate.getMonth() === d.getMonth() &&
          uDate.getFullYear() === d.getFullYear()
        );
      }).length;
      data.push(count);
    }

    new window.Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Novos Usuários",
            data: data,
            borderColor: "#4F46E5",
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    // Distribution Chart
    const ctxPie = document
      .getElementById("userDistributionChart")
      .getContext("2d");
    const premiumCount = users.filter((u) => u.isPremium).length;
    const freeCount = users.length - premiumCount;

    new window.Chart(ctxPie, {
      type: "doughnut",
      data: {
        labels: ["Premium", "Grátis"],
        datasets: [
          {
            data: [premiumCount, freeCount],
            backgroundColor: ["#F59E0B", "#9CA3AF"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  };

  const showUserDetails = async (userId) => {
    const main = element.querySelector("main");
    main.innerHTML =
      '<div class="flex justify-center items-center h-64"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>';

    try {
      const [userDoc, transSnap, tasksSnap] = await Promise.all([
        getDoc(doc(db, "users", userId)),
        getDocs(
          query(
            collection(db, "transactions"),
            where("userId", "==", userId),
            orderBy("date", "desc"),
            limit(50)
          )
        ),
        getDocs(query(collection(db, "tasks"), where("userId", "==", userId))),
      ]);

      if (!userDoc.exists()) {
        showToast("Usuário não encontrado", "error");
        renderDashboard();
        return;
      }

      const user = { id: userDoc.id, ...userDoc.data() };
      const transactions = transSnap.docs.map((d) => d.data());
      const tasks = tasksSnap.docs.map((d) => d.data());

      const formatCurrency = (val) =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(val);
      const balance = transactions.reduce(
        (acc, t) =>
          t.type === "income" ? acc + Number(t.amount) : acc - Number(t.amount),
        0
      );

      main.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="flex items-center gap-4 mb-6">
                    <button id="back-to-dashboard" class="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
                        <i class="fas fa-arrow-left text-xl"></i> <span class="text-sm font-medium">Voltar</span>
                    </button>
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Detalhes do Usuário</h2>
                </div>

                <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-indigo-500 flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">${
                          user.email
                        }</h3>
                        <p class="text-sm text-gray-500 font-mono mt-1">UID: ${
                          user.id
                        }</p>
                        <p class="text-sm text-gray-500 mt-1">Cadastrado: ${
                          user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"
                        }</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-bold ${
                      user.isPremium
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-200 text-gray-600"
                    }">
                        ${user.isPremium ? "Premium" : "Grátis"}
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                        <p class="text-sm text-gray-500">Total Transações</p>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${
                          transactions.length
                        }</h3>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                        <p class="text-sm text-gray-500">Saldo Estimado</p>
                        <h3 class="text-2xl font-bold ${
                          balance >= 0 ? "text-emerald-600" : "text-red-600"
                        }">
                            ${formatCurrency(balance)}
                        </h3>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                        <p class="text-sm text-gray-500">Total Tarefas</p>
                        <h3 class="text-2xl font-bold text-gray-800 dark:text-white">${
                          tasks.length
                        }</h3>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Últimas Transações</h3>
                    </div>
                    <div class="overflow-x-auto max-h-96">
                        <table class="w-full text-sm text-left">
                            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th class="px-6 py-3">Data</th>
                                    <th class="px-6 py-3">Descrição</th>
                                    <th class="px-6 py-3">Categoria</th>
                                    <th class="px-6 py-3">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${
                                  transactions.length
                                    ? transactions
                                        .map(
                                          (t) => `
                                    <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td class="px-6 py-4">${new Date(
                                          t.date
                                        ).toLocaleDateString()}</td>
                                        <td class="px-6 py-4">${
                                          t.description || "-"
                                        }</td>
                                        <td class="px-6 py-4">${t.category}</td>
                                        <td class="px-6 py-4 font-medium ${
                                          t.type === "income"
                                            ? "text-emerald-600"
                                            : "text-red-600"
                                        }">
                                            ${
                                              t.type === "income" ? "+" : "-"
                                            } ${formatCurrency(t.amount)}
                                        </td>
                                    </tr>
                                `
                                        )
                                        .join("")
                                    : '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Nenhuma transação encontrada</td></tr>'
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Tarefas</h3>
                    </div>
                    <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${
                          tasks.length
                            ? tasks
                                .map(
                                  (t) => `
                            <div class="p-4 border rounded-lg dark:border-gray-700 ${
                              t.status === "completed"
                                ? "bg-green-50 dark:bg-green-900/20"
                                : "bg-white dark:bg-gray-800"
                            }">
                                <div class="flex justify-between items-start mb-2">
                                    <span class="text-xs font-semibold px-2 py-1 rounded ${
                                      t.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-blue-100 text-blue-800"
                                    }">
                                        ${
                                          t.status === "completed"
                                            ? "Concluída"
                                            : "Pendente"
                                        }
                                    </span>
                                    <span class="text-xs text-gray-500">${
                                      t.date
                                        ? new Date(t.date).toLocaleDateString()
                                        : ""
                                    }</span>
                                </div>
                                <p class="font-medium text-gray-800 dark:text-white truncate">${
                                  t.title
                                }</p>
                            </div>
                        `
                                )
                                .join("")
                            : '<p class="text-gray-500 col-span-full text-center">Nenhuma tarefa encontrada</p>'
                        }
                    </div>
                </div>
            </div>
        `;

      document.getElementById("back-to-dashboard").onclick = renderDashboard;
    } catch (error) {
      console.error(error);
      showToast("Erro ao carregar perfil", "error");
      renderDashboard();
    }
  };

  renderDashboard();
  return element;
}
