import {
  auth,
  signInWithEmailAndPassword,
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

      showToast("Bem-vindo de volta!");
      window.location.hash = "/dashboard";
    } catch (error) {
      console.error(error);
      showToast("Erro ao fazer login. Verifique suas credenciais.", "error");
    }
  });

  return element;
}
