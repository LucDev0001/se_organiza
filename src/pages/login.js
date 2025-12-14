import {
  auth,
  db,
  doc,
  setDoc,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  googleProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "../services/firebase.js";

export function Login() {
  const section = document.createElement("section");
  section.className =
    "flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 w-full max-w-md mx-auto";

  section.innerHTML = `
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <div class="mx-auto h-12 w-12 text-indigo-600 text-4xl text-center">
            <i class="fas fa-wallet"></i>
        </div>
        <h2 id="page-title" class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
            Entre na sua conta
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" id="login-form">
          
          <!-- Campos Extras de Cadastro (Ocultos no Login) -->
          <div id="signup-fields" class="hidden space-y-6">
             <div>
                <label for="phone" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">WhatsApp / Celular</label>
                <div class="mt-2">
                  <input id="phone" name="phone" type="tel" placeholder="(11) 99999-9999"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3">
                </div>
             </div>
             <div>
                <label for="gender" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Sexo</label>
                <div class="mt-2">
                  <select id="gender" name="gender" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3">
                    <option value="">Selecione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
             </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Email</label>
            <div class="mt-2">
              <input id="email" name="email" type="email" autocomplete="email" required 
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3">
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">Senha</label>
              <div class="text-sm" id="forgot-password-container">
                <a href="#" id="forgot-password-btn" class="font-semibold text-indigo-600 hover:text-indigo-500">Esqueceu a senha?</a>
              </div>
            </div>
            <div class="mt-2">
              <input id="password" name="password" type="password" autocomplete="current-password" required 
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3">
            </div>
          </div>

          <!-- Checkbox Termos (Apenas Cadastro) -->
          <div id="terms-container" class="hidden flex items-start">
            <div class="flex h-6 items-center">
              <input id="terms" name="terms" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
            </div>
            <div class="ml-3 text-sm leading-6">
              <label for="terms" class="font-medium text-gray-900 dark:text-gray-300">Li e aceito os <a href="#/terms" class="text-indigo-600 hover:underline">Termos</a> e <a href="#/privacy" class="text-indigo-600 hover:underline">Privacidade</a></label>
            </div>
          </div>

          <div id="error-msg" class="hidden text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded"></div>
          <div id="success-msg" class="hidden text-green-600 text-sm text-center bg-green-50 dark:bg-green-900/20 p-2 rounded"></div>

          <div id="resend-container" class="hidden text-center">
            <button type="button" id="resend-btn" class="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              Reenviar email de verificação
            </button>
          </div>

          <div>
            <button type="submit" id="submit-btn"
                class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Entrar
            </button>
          </div>
        </form>

        <div class="mt-6" id="google-login-container">
            <div class="relative">
                <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300"></div></div>
                <div class="relative flex justify-center text-sm"><span class="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500">Ou continue com</span></div>
            </div>
            <div class="mt-6">
                <button id="google-btn" class="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent">
                    <i class="fab fa-google text-red-500"></i> Google
                </button>
            </div>
        </div>

        <div class="mt-6 hidden" id="install-pwa-container">
            <button id="install-pwa-btn" class="flex w-full items-center justify-center gap-3 rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-100 transition-colors">
                <i class="fas fa-download"></i> Instalar Aplicativo
            </button>
        </div>

        <p class="mt-10 text-center text-sm text-gray-500 dark:text-gray-400">
          <span id="toggle-text">Não tem uma conta?</span>
          <a href="#" id="toggle-btn" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Cadastre-se</a>
        </p>
      </div>
    `;

  // Lógica do Componente
  const form = section.querySelector("#login-form");
  const toggleBtn = section.querySelector("#toggle-btn");
  const pageTitle = section.querySelector("#page-title");
  const submitBtn = section.querySelector("#submit-btn");
  const toggleText = section.querySelector("#toggle-text");
  const errorMsg = section.querySelector("#error-msg");
  const successMsg = section.querySelector("#success-msg");
  const resendContainer = section.querySelector("#resend-container");
  const resendBtn = section.querySelector("#resend-btn");

  const signupFields = section.querySelector("#signup-fields");
  const termsContainer = section.querySelector("#terms-container");
  const forgotPasswordContainer = section.querySelector(
    "#forgot-password-container"
  );
  const forgotPasswordBtn = section.querySelector("#forgot-password-btn");
  const googleLoginContainer = section.querySelector("#google-login-container");
  const googleBtn = section.querySelector("#google-btn");
  const installContainer = section.querySelector("#install-pwa-container");
  const installBtn = section.querySelector("#install-pwa-btn");

  let isLogin = true;
  let isReset = false;

  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (isReset) {
      // Voltar do reset para login
      isReset = false;
      isLogin = true;
      resetUI();
      return;
    }

    isLogin = !isLogin;
    resetUI();
  });

  forgotPasswordBtn.addEventListener("click", (e) => {
    e.preventDefault();
    isReset = true;
    resetUI();
  });

  function resetUI() {
    errorMsg.classList.add("hidden");
    successMsg.classList.add("hidden");
    resendContainer.classList.add("hidden");
    form.reset();

    if (isReset) {
      pageTitle.textContent = "Recuperar Senha";
      submitBtn.textContent = "Enviar Email";
      toggleText.textContent = "Lembrou a senha?";
      toggleBtn.textContent = "Voltar ao Login";

      signupFields.classList.add("hidden");
      termsContainer.classList.add("hidden");
      forgotPasswordContainer.classList.add("hidden");
      googleLoginContainer.classList.add("hidden");
      form.password.parentElement.parentElement.classList.add("hidden"); // Esconde campo senha
    } else if (isLogin) {
      pageTitle.textContent = "Entre na sua conta";
      submitBtn.textContent = "Entrar";
      toggleText.textContent = "Não tem uma conta?";
      toggleBtn.textContent = "Cadastre-se";

      signupFields.classList.add("hidden");
      termsContainer.classList.add("hidden");
      forgotPasswordContainer.classList.remove("hidden");
      googleLoginContainer.classList.remove("hidden");
      form.password.parentElement.parentElement.classList.remove("hidden");
    } else {
      pageTitle.textContent = "Crie sua conta";
      submitBtn.textContent = "Cadastrar";
      toggleText.textContent = "Já tem uma conta?";
      toggleBtn.textContent = "Faça login";

      signupFields.classList.remove("hidden");
      termsContainer.classList.remove("hidden");
      forgotPasswordContainer.classList.add("hidden");
      googleLoginContainer.classList.remove("hidden");
      form.password.parentElement.parentElement.classList.remove("hidden");
    }
  }

  // Google Login
  googleBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Redirecionamento automático via onAuthStateChanged
    } catch (error) {
      console.error(error);
      errorMsg.textContent = "Erro ao entrar com Google.";
      errorMsg.classList.remove("hidden");
    }
  });

  // Resend Verification Logic
  resendBtn.addEventListener("click", async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        successMsg.textContent =
          "Email reenviado! Verifique sua caixa de entrada.";
        successMsg.classList.remove("hidden");
        resendContainer.classList.add("hidden");
      } catch (err) {
        console.error(err);
        errorMsg.textContent = "Erro ao reenviar. Tente novamente mais tarde.";
        errorMsg.classList.remove("hidden");
      }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = !isReset ? form.password.value : null;

    errorMsg.classList.add("hidden");
    successMsg.classList.add("hidden");
    resendContainer.classList.add("hidden");
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

    try {
      if (isReset) {
        await sendPasswordResetEmail(auth, email);
        successMsg.textContent =
          "Email de recuperação enviado! Verifique sua caixa de entrada.";
        successMsg.classList.remove("hidden");
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar Email";
        return;
      }

      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (!userCred.user.emailVerified) {
          throw new Error("email-not-verified");
        }
      } else {
        // Validação de Termos
        if (!form.terms.checked) {
          throw new Error("terms-not-accepted");
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Salvar dados extras
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          phone: form.phone.value,
          gender: form.gender.value,
          isPremium: false, // Padrão: Gratuito
          termsAccepted: true,
          termsAcceptedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });

        // Enviar verificação
        await sendEmailVerification(user);

        // Logout forçado para obrigar login após verificação
        await auth.signOut();

        successMsg.textContent =
          "Conta criada! Um email de verificação foi enviado para você. Verifique antes de entrar.";
        successMsg.classList.remove("hidden");

        // Mudar para tela de login
        isLogin = true;
        resetUI();
        submitBtn.disabled = false;
        return;
      }
      // O redirecionamento é tratado pelo onAuthStateChanged no main.js
    } catch (error) {
      console.error(error);
      let message = "Ocorreu um erro. Tente novamente.";

      if (error.message === "email-not-verified") {
        message = "Por favor, verifique seu email antes de entrar.";
        resendContainer.classList.remove("hidden");
      } else if (error.message === "terms-not-accepted") {
        message = "Você precisa aceitar os Termos de Uso.";
      } else if (
        error.code.includes("invalid-credential") ||
        error.code.includes("wrong-password")
      )
        message = "Email ou senha incorretos.";
      else if (error.code.includes("email-already-in-use"))
        message = "Este email já está em uso.";
      else if (error.code.includes("weak-password"))
        message = "A senha deve ter pelo menos 6 caracteres.";

      errorMsg.textContent = message;
      errorMsg.classList.remove("hidden");
      submitBtn.disabled = false;
      submitBtn.textContent = isReset
        ? "Enviar Email"
        : isLogin
        ? "Entrar"
        : "Cadastrar";
    }
  });

  // Check initial state (if page reloaded or redirected back while logged in but unverified)
  if (auth.currentUser && !auth.currentUser.emailVerified) {
    errorMsg.textContent =
      "Email não verificado. Por favor, verifique seu email.";
    errorMsg.classList.remove("hidden");
    resendContainer.classList.remove("hidden");
  }

  // PWA Install Logic
  const checkPwa = () => {
    if (window.deferredPrompt) {
      installContainer.classList.remove("hidden");
    }
  };
  checkPwa();
  window.addEventListener("pwa-install-available", checkPwa);

  installBtn.addEventListener("click", async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      if (outcome === "accepted") {
        installContainer.classList.add("hidden");
        window.deferredPrompt = null;
      }
    }
  });

  return section;
}
