import {
  auth,
  db,
  doc,
  getDoc,
  updateDoc,
  deleteUser,
  signOut,
} from "../services/firebase.js";
import { exportData, importData } from "../services/backup.service.js";
import { showToast, showConfirm } from "../utils/ui.js";
import { getTransactions } from "../services/finance.js";
import { getTasks } from "../services/tasks.service.js";
import { getNotes } from "../services/notes.service.js";

export function Profile() {
  const user = auth.currentUser;
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100";

  element.innerHTML = `
        <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div class="flex items-center gap-4">
                <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-white">Meu Perfil</h1>
            </div>
            <div class="flex items-center gap-4">
                <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                    <i class="fas fa-adjust text-xl"></i>
                </button>
                <button onclick="window.location.hash='/notifications'" class="text-gray-500 hover:text-indigo-600 transition-colors relative">
                    <i class="fas fa-bell text-xl"></i>
                    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
                </button>
            </div>
        </header>

        <main class="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full overflow-y-auto space-y-6">
            
            <!-- Profile Header Card -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden relative group" id="profile-card">
                <div class="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                    <div class="absolute inset-0 bg-black/10"></div>
                </div>
                <div class="px-6 pb-6 relative">
                    <div class="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-4 sm:mb-0 gap-4">
                        <div class="w-24 h-24 bg-white dark:bg-gray-800 rounded-full p-1 shadow-lg relative z-10">
                            <div class="w-full h-full bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 text-4xl overflow-hidden">
                                ${user.photoURL ? `<img src="${user.photoURL}" class="w-full h-full object-cover">` : `<i class="fas fa-user" id="profile-icon"></i>`}
                            </div>
                        </div>
                        <div class="flex-1 text-center sm:text-left mb-2">
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                                ${user.displayName || 'Usuário'}
                                <span id="plan-badge" class="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Free</span>
                            </h2>
                            <p class="text-gray-500 dark:text-gray-400 text-sm">${user.email}</p>
                            <p class="text-gray-400 text-xs mt-1" id="member-since">Membro desde ${new Date(user.metadata.creationTime).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <!-- Stats -->
                    <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <div class="text-center">
                            <span class="block text-xl font-bold text-gray-800 dark:text-white" id="stat-transactions">...</span>
                            <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">Transações</span>
                        </div>
                        <div class="text-center border-l border-r border-gray-100 dark:border-gray-700">
                            <span class="block text-xl font-bold text-gray-800 dark:text-white" id="stat-tasks">...</span>
                            <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">Tarefas</span>
                        </div>
                        <div class="text-center">
                            <span class="block text-xl font-bold text-gray-800 dark:text-white" id="stat-notes">...</span>
                            <span class="text-xs text-gray-500 uppercase tracking-wide font-medium">Notas</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Premium CTA -->
            <div id="premium-cta" class="hidden bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transform hover:scale-[1.01] transition-transform cursor-pointer">
                <div class="absolute right-0 top-0 h-full w-1/2 bg-white/10 skew-x-12 translate-x-10"></div>
                <div class="relative z-10 flex justify-between items-center">
                    <div>
                        <h3 class="font-bold text-xl mb-1"><i class="fas fa-crown text-yellow-200 mr-2"></i>Seja Premium</h3>
                        <p class="text-white/90 text-sm max-w-md">Desbloqueie relatórios avançados, categorias ilimitadas e suporte prioritário.</p>
                    </div>
                    <button class="bg-white text-orange-600 px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap">
                        Assinar Agora
                    </button>
                </div>
            </div>

            <!-- Personal Info Form -->
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                    <i class="fas fa-id-card text-indigo-500"></i> Informações Pessoais
                </h3>
                <form id="profile-form" class="space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">WhatsApp / Celular</label>
                            <input type="tel" name="phone" id="phone" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Gênero</label>
                            <select name="gender" id="gender" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                                <option value="">Selecione...</option>
                                <option value="masculino">Masculino</option>
                                <option value="feminino">Feminino</option>
                                <option value="outro">Outro</option>
                            </select>
                        </div>
                    </div>
                    <div id="msg" class="hidden p-3 rounded-lg text-center text-sm font-medium"></div>
                    <div class="flex justify-end">
                        <button type="submit" class="px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>

            <!-- Settings & Data Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Settings -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                        <i class="fas fa-cog text-gray-400"></i> Configurações
                    </h3>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center">
                                    <i class="fas fa-moon"></i>
                                </div>
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Modo Escuro</span>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="theme-toggle-profile" class="sr-only peer">
                                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Data Management -->
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                    <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                        <i class="fas fa-database text-blue-500"></i> Dados
                    </h3>
                    <div class="space-y-3">
                        <button id="btn-export" class="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                            <span class="text-sm font-medium flex items-center gap-2"><i class="fas fa-download"></i> Exportar Backup</span>
                            <i class="fas fa-chevron-right text-xs opacity-50"></i>
                        </button>
                        <button id="btn-import-trigger" class="w-full flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                            <span class="text-sm font-medium flex items-center gap-2"><i class="fas fa-upload"></i> Restaurar Backup</span>
                            <i class="fas fa-chevron-right text-xs opacity-50"></i>
                        </button>
                        <input type="file" id="file-import" accept=".json" class="hidden">
                    </div>
                </div>
            </div>

            <!-- Share & Danger -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                 <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-sm p-6 text-white">
                    <h3 class="text-lg font-bold mb-2 flex items-center gap-2"><i class="fas fa-heart"></i> Gostou do App?</h3>
                    <p class="text-sm opacity-90 mb-4">Compartilhe com seus amigos e ajude nossa comunidade a crescer.</p>
                    <button id="btn-share-profile" class="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-bold transition-colors">
                        Compartilhar Link
                    </button>
                </div>

                <div class="bg-red-50 dark:bg-red-900/10 rounded-2xl shadow-sm p-6 border border-red-100 dark:border-red-900/30">
                    <h3 class="text-lg font-bold mb-2 text-red-700 dark:text-red-400 flex items-center gap-2"><i class="fas fa-exclamation-triangle"></i> Zona de Perigo</h3>
                    <p class="text-sm text-red-600 dark:text-red-300/80 mb-4">A exclusão da conta é permanente e não pode ser desfeita.</p>
                    <button id="btn-delete-account" class="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors">
                        Excluir Minha Conta
                    </button>
                </div>
            </div>
        </main>
    `;

  const form = element.querySelector("#profile-form");
  const msg = element.querySelector("#msg");
  const planBadge = element.querySelector("#plan-badge");
  const premiumCta = element.querySelector("#premium-cta");
  const profileIcon = element.querySelector("#profile-icon");

  // Load Data
  const loadProfile = async () => {
    // Skeleton Loading
    const profileCard = element.querySelector("#profile-card");
    const originalContent = profileCard.innerHTML;
    profileCard.innerHTML = `
        <div class="animate-pulse flex flex-col items-center space-y-4">
            <div class="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div class="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded mt-6"></div>
        </div>
    `;

    try {
      const [docSnap, transactions, tasks, notes] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getTransactions(),
        getTasks(),
        getNotes()
      ]);

      if (docSnap.exists()) {
        const data = docSnap.data();
        form.phone.value = data.phone || "";
        form.gender.value = data.gender || "";

        // Restore content structure (re-bind elements if needed, but here we just update values on the form which is outside the skeleton replacement if we were careful, but since we replaced innerHTML of profile-card, we need to restore it first or update logic.
        // Better approach: Update the DOM elements directly after fetching, removing skeleton class if used, or swap content.
        profileCard.innerHTML = originalContent;

        // Re-select elements after innerHTML restore
        const planBadge = element.querySelector("#plan-badge");
        const profileIcon = element.querySelector("#profile-icon");
        const premiumCta = element.querySelector("#premium-cta");
        const form = element.querySelector("#profile-form"); // Re-select form inside card

        // Re-populate form values
        form.phone.value = data.phone || "";
        form.gender.value = data.gender || "";

        // Populate Stats
        element.querySelector("#stat-transactions").textContent = transactions.length;
        element.querySelector("#stat-tasks").textContent = tasks.length;
        element.querySelector("#stat-notes").textContent = notes.length;

        // Lógica Visual do Plano
        if (data.isPremium) {
          planBadge.textContent = "PREMIUM";
          planBadge.className =
            "text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 font-bold";
          profileIcon.className = "fas fa-crown text-yellow-500";
          premiumCta.classList.add("hidden");
        } else {
          premiumCta.classList.remove("hidden");

          // Ação do botão Premium (Simulação de Checkout)
          premiumCta.onclick = () => {
            showConfirm(
              `
                    <div class="text-center">
                        <h3 class="text-xl font-bold text-indigo-600 mb-2">Plano Premium</h3>
                        <p class="mb-4 text-sm">Apoie o projeto e desbloqueie tudo por apenas <strong>R$ 9,90</strong> (pagamento único).</p>
                        <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded mb-2 font-mono text-sm select-all">11661221408</div>
                        <p class="text-xs text-gray-500">Chave Pix (CPF). Envie o comprovante para o suporte para ativação imediata.</p>
                    </div>
                `,
              () => {
                window.open(
                  `https://wa.me/5511999999999?text=Olá, fiz o pix para o Premium do Se Organiza! Meu email é ${user.email}`,
                  "_blank"
                );
              }
            );
          };
        }
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      profileCard.innerHTML = originalContent; // Restore on error
    }
  };

  loadProfile();

  // Save Data
  // Re-attach listener because of innerHTML replacement in loadProfile
  element.addEventListener("submit", async (e) => {
    if (e.target.id !== "profile-form") return;
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector("button");
    const msg = element.querySelector("#msg");

    btn.disabled = true;
    btn.textContent = "Salvando...";
    msg.classList.add("hidden");

    try {
      await updateDoc(doc(db, "users", user.uid), {
        phone: form.phone.value,
        gender: form.gender.value,
      });
      msg.textContent = "Perfil atualizado com sucesso!";
      msg.className =
        "p-3 rounded text-center text-sm bg-green-100 text-green-700 block";
    } catch (error) {
      msg.textContent = "Erro ao atualizar perfil.";
      msg.className =
        "p-3 rounded text-center text-sm bg-red-100 text-red-700 block";
    } finally {
      btn.disabled = false;
      btn.textContent = "Salvar Alterações";
    }
  });

  // Share Logic
  const btnShareProfile = element.querySelector("#btn-share-profile");
  btnShareProfile.onclick = async () => {
    const shareData = {
      title: "Se Organiza",
      text: "Gerencie suas finanças e tarefas com o Se Organiza! Acesse:",
      url: window.location.href.split("#")[0],
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(shareData.text + " " + shareData.url);
      showToast("Link copiado para a área de transferência!");
    }
  };

  // Backup Logic
  const btnExport = element.querySelector("#btn-export");
  const btnImportTrigger = element.querySelector("#btn-import-trigger");
  const fileImport = element.querySelector("#file-import");

  btnExport.onclick = async () => {
    try {
      btnExport.disabled = true;
      btnExport.innerHTML =
        '<i class="fas fa-circle-notch fa-spin"></i> Exportando...';
      await exportData();
      showToast("Backup exportado com sucesso!");
    } catch (error) {
      console.error(error);
      showToast("Erro ao exportar dados.", "error");
    } finally {
      btnExport.disabled = false;
      btnExport.innerHTML = '<i class="fas fa-download"></i> Exportar Backup';
    }
  };

  btnImportTrigger.onclick = () => fileImport.click();

  fileImport.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showConfirm(
      "Isso irá sobrescrever/mesclar os dados atuais com o backup. Deseja continuar?",
      async () => {
        try {
          btnImportTrigger.disabled = true;
          btnImportTrigger.innerHTML =
            '<i class="fas fa-circle-notch fa-spin"></i> Restaurando...';
          await importData(file);
          showToast("Dados restaurados com sucesso!");
          setTimeout(() => window.location.reload(), 1500); // Reload to reflect changes
        } catch (error) {
          console.error(error);
          showToast("Erro ao restaurar backup.", "error");
        } finally {
          btnImportTrigger.disabled = false;
          btnImportTrigger.innerHTML =
            '<i class="fas fa-upload"></i> Restaurar Backup';
          fileImport.value = ""; // Reset input
        }
      }
    );
  };

  // Delete Account Logic
  const btnDelete = element.querySelector("#btn-delete-account");
  btnDelete.onclick = () => {
    showConfirm(
      "Tem certeza absoluta? Essa ação não pode ser desfeita.",
      async () => {
        try {
          await deleteUser(user);
          showToast("Conta excluída com sucesso.");
          window.location.reload();
        } catch (error) {
          console.error(error);
          if (error.code === "auth/requires-recent-login") {
            showToast(
              "Por segurança, faça login novamente para excluir a conta.",
              "error"
            );
            await signOut(auth);
          } else {
            showToast("Erro ao excluir conta.", "error");
          }
        }
      }
    );
  };

  // Theme Toggle Logic
  const themeToggle = element.querySelector("#theme-toggle-profile");
  if(themeToggle) {
      themeToggle.checked = document.documentElement.classList.contains("dark");
      themeToggle.addEventListener("change", () => {
          window.toggleTheme();
      });
  }

  return element;
}
