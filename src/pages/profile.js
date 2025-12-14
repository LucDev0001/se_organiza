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

        <main class="flex-1 p-6 max-w-2xl mx-auto w-full overflow-y-auto">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div class="flex flex-col items-center mb-6">
                    <div class="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 text-4xl mb-3">
                        <i class="fas fa-user" id="profile-icon"></i>
                    </div>
                    <h2 class="text-xl font-bold flex items-center gap-2">
                        ${user.email}
                        <span id="plan-badge" class="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Free</span>
                    </h2>
                    <p class="text-gray-500 text-sm mb-4">UID: ${user.uid}</p>
                    
                    <div id="premium-cta" class="hidden w-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-4 text-white text-center mb-6 shadow-lg transform hover:scale-[1.02] transition-transform cursor-pointer">
                        <h3 class="font-bold text-lg"><i class="fas fa-crown text-yellow-300"></i> Seja Premium</h3>
                        <p class="text-sm opacity-90 mb-2">Desbloqueie relatórios PDF, CSV e categorias ilimitadas!</p>
                        <button class="bg-white text-indigo-600 px-4 py-1 rounded-full text-sm font-bold shadow-sm">Assinar Agora</button>
                    </div>
                </div>

                <form id="profile-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">WhatsApp / Celular</label>
                        <input type="tel" name="phone" id="phone" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Sexo</label>
                        <select name="gender" id="gender" class="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option value="">Selecione...</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                    
                    <div id="msg" class="hidden p-3 rounded text-center text-sm"></div>

                    <button type="submit" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors">
                        Salvar Alterações
                    </button>
                </form>
            </div>

            <!-- Share Section -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6">
                <div class="flex items-center gap-2 mb-4">
                    <i class="fas fa-heart text-red-500 text-xl"></i>
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white">Gostou do App?</h3>
                </div>
                <button id="btn-share-profile" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-bold shadow-md">
                    <i class="fas fa-share-alt"></i> Compartilhar com Amigos
                </button>
            </div>

            <!-- Backup Section -->
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-6">
                <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-white">Gerenciamento de Dados</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Faça backup dos seus dados ou restaure de um arquivo anterior.</p>
                
                <div class="flex flex-col sm:flex-row gap-4">
                    <button id="btn-export" class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                        <i class="fas fa-download"></i> Exportar Backup
                    </button>
                    <button id="btn-import-trigger" class="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors">
                        <i class="fas fa-upload"></i> Restaurar Backup
                    </button>
                    <input type="file" id="file-import" accept=".json" class="hidden">
                </div>
            </div>

            <!-- Danger Zone -->
            <div class="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm p-6 mt-6 border border-red-100 dark:border-red-800 mb-6">
                <h3 class="text-lg font-bold mb-2 text-red-700 dark:text-red-400">Zona de Perigo</h3>
                <p class="text-sm text-red-600 dark:text-red-300 mb-4">A exclusão da conta é irreversível. Todos os seus dados serão perdidos permanentemente.</p>
                <button id="btn-delete-account" class="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                    <i class="fas fa-trash-alt"></i> Excluir Minha Conta
                </button>
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
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        form.phone.value = data.phone || "";
        form.gender.value = data.gender || "";

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
    }
  };

  loadProfile();

  // Save Data
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button");
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

  return element;
}
