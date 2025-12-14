export function Terms() {
  const element = document.createElement("div");
  element.className =
    "p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm my-8 text-gray-800 dark:text-gray-200";
  element.innerHTML = `
        <tblick="window.location.hash='/dashboard'" class="text-indigo-600 hover:underline"><i class="fas fa-arrow-left"></i> Voltar</button>
            <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                <i class="fas fa-adjust text-xl"></i>
            </button>
        </div>
        <h1 class="text-2xl font-bold mb-4">Termos de Uso</h1>
        <div class="space-y-4 text-sm leading-relaxed">
            <p>Bem-vindo ao Se Organiza. Ao utilizar nosso aplicativo, você concorda com estes termos.</p>
            <h3 class="font-bold text-lg">1. Uso do Serviço</h3>
            <p>O Se Organiza é uma ferramenta de gestão pessoal. Você é responsável por manter a confidencialidade de sua conta.</p>
            <h3 class="font-bold text-lg">2. Dados</h3>
            <p>Seus dados são armazenados de forma segura no Firebase. Não compartilhamos suas informações financeiras com terceiros.</p>
            <h3 class="font-bold text-lg">3. Responsabilidades</h3>
            <p>Não nos responsabilizamos por decisões financeiras tomadas com base nas informações inseridas no aplicativo.</p>
        </div>
    `;
  return element;
}

export function Privacy() {
  const element = document.createElement("div");
  element.className =
    "p-6 max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm my-8 text-gray-800 dark:text-gray-200";
  element.innerHTML = `
        <div class="flear</button>
            <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors">
                <i class="fas fa-adjust text-xl"></i>
            </button>
        </div>
        <h1 class="text-2xl font-bold mb-4">Política de Privacidade</h1>
        <div class="space-y-4 text-sm leading-relaxed">
            <p>Sua privacidade é importante para nós. Esta política explica como coletamos e usamos seus dados.</p>
            <h3 class="font-bold text-lg">1. Coleta de Dados</h3>
            <p>Coletamos apenas os dados necessários para o funcionamento do app: email, nome, telefone e dados financeiros inseridos por você.</p>
            <h3 class="font-bold text-lg">2. Uso das Informações</h3>
            <p>Utilizamos suas informações para fornecer funcionalidades de gestão financeira e tarefas, além de autenticação.</p>
            <h3 class="font-bold text-lg">3. Contato</h3>
            <p>Para questões de privacidade, entre em contato pelo email do desenvolvedor.</p>
        </div>
    `;
  return element;
}
