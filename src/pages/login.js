import {
  auth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "../services/firebase.js";
import { showToast } from "../utils/ui.js";

export function Login() {
  const element = document.createElement("div");
  element.className =
    "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 transition-colors duration-200";

  element.innerHTML = `
        <div class="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            <div class="text-center">
                <div class="mx-auto h-16 w-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                    <i class="fas fa-wallet text-3xl text-white"></i>
                </div>
                <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    Bem-vindo de volta
                </h2>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Acesse sua conta para gerenciar suas finanças
                </p>
            </div>
            
            <form class="mt-8 space-y-6" id="login-form">
                <div class="space-y-4">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-envelope text-gray-400"></i>
                            </div>
                            <input id="email" name="email" type="email" autocomplete="email" required 
                                class="appearance-none rounded-lg relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all" 
                                placeholder="seu@email.com">
                        </div>
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fas fa-lock text-gray-400"></i>
                            </div>
                            <input id="password" name="password" type="password" autocomplete="current-password" required 
                                class="appearance-none rounded-lg relative block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all" 
                                placeholder="••••••••">
                            <button type="button" id="toggle-password" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 cursor-pointer focus:outline-none transition-colors">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer">
                        <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer">
                            Lembrar de mim
                        </label>
                    </div>

                    <div class="text-sm">
                        <a href="#/forgot-password" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
                            Esqueceu a senha?
                        </a>
                    </div>
                </div>

                <button type="submit" id="btn-login" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50">
                    <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                        <i class="fas fa-sign-in-alt group-hover:text-indigo-200 transition-colors"></i>
                    </span>
                    Entrar
                </button>
            </form>

            <div class="mt-6">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">
                            Ou continue com
                        </span>
                    </div>
                </div>

                <div class="mt-6">
                    <button id="btn-google" class="w-full flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 transition-all">
                        <img class="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo">
                        <span>Google</span>
                    </button>
                </div>
            </div>

            <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                Não tem uma conta?
                <a href="#/register" class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline transition-colors">
                    Cadastre-se gratuitamente
                </a>
            </p>
        </div>
    `;

  // Toggle Password Visibility
  const toggleBtn = element.querySelector("#toggle-password");
  const passInput = element.querySelector("#password");
  toggleBtn.onclick = () => {
    const type =
      passInput.getAttribute("type") === "password" ? "text" : "password";
    passInput.setAttribute("type", type);
    toggleBtn.innerHTML = `<i class="fas ${
      type === "password" ? "fa-eye" : "fa-eye-slash"
    }"></i>`;
  };

  const form = element.querySelector("#login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        renderVerificationModal(element, email);
        return;
      }

      showToast("Bem-vindo de volta!");
      window.location.hash = "/dashboard";
    } catch (error) {
      console.error(error);
      showToast("Erro ao fazer login. Verifique suas credenciais.", "error");
    }
  });

  element.querySelector("#btn-google").addEventListener("click", async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Using signInWithPopup is better for PWAs to avoid navigation issues
      await signInWithPopup(auth, provider);
      showToast("Login com Google realizado!");
      window.location.hash = "/dashboard";
    } catch (error) {
      console.error(error);
      if (error.code === "auth/popup-closed-by-user") {
        showToast("Login cancelado.", "info");
        return;
      }
      showToast("Erro no login com Google.", "error");
    }
  });

  // Verifica se veio do cadastro
  const pendingEmail = sessionStorage.getItem("pendingVerificationEmail");
  if (pendingEmail) {
    renderVerificationModal(element, pendingEmail);
    sessionStorage.removeItem("pendingVerificationEmail");
  }

  return element;
}

function renderVerificationModal(parentElement, email) {
  const modal = document.createElement("div");
  modal.className =
    "fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in";

  modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-gray-100 dark:border-gray-700">
            <div class="bg-indigo-600 p-4 text-center">
                <div class="mx-auto h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-md">
                    <i class="fas fa-envelope-open-text text-3xl text-white"></i>
                </div>
                <h3 class="text-xl font-bold text-white">Verifique seu Email</h3>
            </div>
            
            <div class="p-6 space-y-4">
                <p class="text-center text-gray-600 dark:text-gray-300">
                    Para sua segurança, precisamos que você confirme seu endereço de email antes de entrar.
                </p>
                
                <div class="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 text-center border border-indigo-100 dark:border-indigo-800">
                    <span class="text-indigo-700 dark:text-indigo-300 font-medium break-all">${email}</span>
                </div>

                <div class="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-search text-yellow-500"></i>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-bold text-yellow-800 dark:text-yellow-200">Não encontrou?</h3>
                            <p class="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                                Verifique a caixa de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>. O email pode ter caído lá por engano.
                            </p>
                        </div>
                    </div>
                </div>

                <button id="close-modal-btn" class="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-xl font-medium transition-colors">
                    Entendi, vou verificar
                </button>
            </div>
        </div>
    `;

  parentElement.appendChild(modal);

  modal.querySelector("#close-modal-btn").onclick = () => {
    modal.remove();
  };
}
