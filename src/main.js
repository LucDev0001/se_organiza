import { auth, onAuthStateChanged } from "./services/firebase.js";
import { Login } from "./pages/login.js";
import { Dashboard } from "./pages/dashboard.js";
import { Tasks } from "./pages/tasks.js";
import { Finance } from "./pages/finance.js";
import { Admin } from "./pages/admin.js";
import { Notes } from "./pages/notes.js";
import { About } from "./pages/about.js";
import { Terms, Privacy } from "./pages/legal.js";
import { Profile } from "./pages/profile.js";
import { Notifications, updateGlobalBadge } from "./pages/notifications.js";
import { Landing } from "./pages/landing.js";
import { Help } from "./pages/help.js";
import { Videos } from "./pages/videos.js";
import { showToast } from "./utils/ui.js";

// Estado Global Simples
const state = {
  user: null,
  isAdmin: false,
};

// Configuração do Admin (Frontend Check - Segurança real está no Firestore Rules)
const ADMIN_EMAIL = "lucianosantosseverino@gmail.com";

// Router Básico
const routes = {
  "/": "home", // Página inicial
  "/login": "login",
  "/dashboard": "dashboard",
  "/finance": "finance",
  "/tasks": "tasks",
  "/admin": "admin",
  "/notes": "notes",
  "/about": "about",
  "/terms": "terms",
  "/privacy": "privacy",
  "/profile": "profile",
  "/notifications": "notifications",
  "/help": "help",
  "/videos": "videos",
};

async function router() {
  const app = document.getElementById("app");
  let hash = window.location.hash.slice(1) || "/";

  // Proteção de Rotas
  if (
    !state.user &&
    hash !== "/login" &&
    hash !== "/" &&
    hash !== "/terms" &&
    hash !== "/privacy"
  ) {
    window.location.hash = "/"; // Redireciona para Landing se tentar acessar rota protegida sem logar
    return;
  }

  // Verificação de Email (Bloqueio)
  if (state.user && !state.user.emailVerified && hash !== "/login") {
    alert(
      "Seu email ainda não foi verificado. Verifique sua caixa de entrada."
    );
    await auth.signOut();
    return;
  }

  // Redirecionamento se logado
  if (state.user && (hash === "/login" || hash === "/")) {
    if (state.user.emailVerified) {
      window.location.hash = "/dashboard";
    }
    return;
  }

  // Proteção Admin
  if (hash === "/admin" && !state.isAdmin) {
    console.warn("Acesso negado: Apenas administradores.");
    window.location.hash = "/dashboard";
    return;
  }

  // Renderização
  app.innerHTML = ""; // Limpa o conteúdo anterior

  if (hash === "/") {
    app.appendChild(Landing());
  } else if (hash === "/login") {
    app.appendChild(Login());
  } else if (hash === "/dashboard") {
    app.appendChild(Dashboard());
  } else if (hash === "/tasks") {
    app.appendChild(Tasks());
  } else if (hash === "/finance") {
    app.appendChild(Finance());
  } else if (hash === "/admin") {
    app.appendChild(Admin());
  } else if (hash === "/notes") {
    app.appendChild(Notes());
  } else if (hash === "/about") {
    app.appendChild(About());
  } else if (hash === "/terms") {
    app.appendChild(Terms());
  } else if (hash === "/privacy") {
    app.appendChild(Privacy());
  } else if (hash === "/profile") {
    app.appendChild(Profile());
  } else if (hash === "/notifications") {
    app.appendChild(Notifications());
  } else if (hash === "/help") {
    app.appendChild(Help());
  } else if (hash === "/videos") {
    app.appendChild(Videos());
  } else {
    app.innerHTML = `
        <div class="p-8 text-center">
            <h1 class="text-2xl font-bold mb-4 text-indigo-600">Página: ${hash}</h1>
            <p class="text-gray-500">Usuário: ${
              state.user ? state.user.email : "Não logado"
            }</p>
            ${
              state.isAdmin
                ? '<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">ADMIN</span>'
                : ""
            }
        </div>
    `;
  }
}

// Inicialização
window.addEventListener("hashchange", router);

onAuthStateChanged(auth, (user) => {
  state.user = user;
  state.isAdmin = user && user.email === ADMIN_EMAIL;
  router();
});

// Real-time Notification Badge
setInterval(updateGlobalBadge, 60000); // Check every minute
window.addEventListener("hashchange", () => setTimeout(updateGlobalBadge, 500)); // Check on nav

// Dark Mode Logic
window.toggleTheme = () => {
  if (document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
};

// Init Theme
if (
  localStorage.getItem("theme") === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

// Service Worker Registration
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("sw.js")
    .catch((err) => console.error("SW Error:", err));
}

// Global PWA Install Event Capture
window.deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  window.dispatchEvent(new Event("pwa-install-available"));
});

// Online/Offline Status Handlers
window.addEventListener("online", () =>
  showToast("Conexão restabelecida!", "success")
);
window.addEventListener("offline", () =>
  showToast("Você está offline. O app continuará funcionando.", "error")
);
