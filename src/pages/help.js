export function Help() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 overflow-y-auto";
  element.innerHTML = `
        <header class="bg-white dark:bg-gray-800 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10 mb-6 rounded-xl">
            <div class="flex items-center gap-4">
                <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-white">Central de Ajuda</h1>
            </div>
            <div class="flex items-center gap-4">
                <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                    <i class="fas fa-adjust text-xl"></i>
                </button>
            </div>
        </header>

        <div class="max-w-3xl mx-auto w-full space-y-6">
            <!-- FAQ Section -->
            <section>
                <h2 class="text-2xl font-bold mb-4 text-indigo-600">Perguntas Frequentes</h2>
                <div class="space-y-4">
                    <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                        <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                            Como adicionar uma transação recorrente?
                            <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                        </summary>
                        <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                            Ao criar uma nova transação na aba "Finanças", selecione a opção "Mensal" ou "Semanal" no campo "Recorrência". O sistema criará automaticamente a próxima transação como "Pendente" assim que você marcar a atual como paga.
                        </p>
                    </details>
                    <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                        <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                            Como funciona o backup?
                            <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                        </summary>
                        <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                            Vá até seu Perfil e clique em "Exportar Backup". Um arquivo JSON será baixado. Para restaurar, clique em "Restaurar Backup" e selecione esse arquivo. Cuidado: isso pode sobrescrever dados atuais.
                        </p>
                    </details>
                     <details class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm group">
                        <summary class="font-medium cursor-pointer list-none flex justify-between items-center text-gray-800 dark:text-gray-200">
                            O aplicativo funciona offline?
                            <span class="transition group-open:rotate-180"><i class="fas fa-chevron-down text-gray-500"></i></span>
                        </summary>
                        <p class="text-gray-600 dark:text-gray-400 mt-4 text-sm leading-relaxed">
                            Sim! O Se Organiza é um PWA. Você pode instalá-lo e acessar seus dados cacheados mesmo sem internet.
                        </p>
                    </details>
                </div>
            </section>

            <!-- Contact Section -->
            <section class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-center text-white shadow-lg">
                <h2 class="text-2xl font-bold mb-2">Ainda precisa de ajuda?</h2>
                <p class="mb-6 opacity-90">Nossa equipe de suporte está pronta para te ajudar.</p>
                <a href="mailto:lucianosantosseverino@gmail.com" class="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-md">Entrar em Contato</a>
            </section>
        </div>
    `;
  return element;
}
