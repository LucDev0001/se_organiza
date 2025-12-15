// Importar scripts do Firebase para Service Worker (Compat version)
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js"
);

// Configuração do Firebase no SW (Necessário para FCM Background)
firebase.initializeApp({
  apiKey: "AIzaSyAY9kqryV_1oUbR5N9tN2x-Kt5jY_ecQSE",
  projectId: "seorganiza-d4ffd",
  messagingSenderId: "970910696116",
  appId: "1:970910696116:web:8298918a58a4be65578de1",
});

const messaging = firebase.messaging();

// Handler para mensagens em segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/public/icons/icon-192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

const CACHE_NAME = "se-organiza-v11";
const ASSETS = [
  "./",
  "./index.html",
  "./src/main.js",
  "./src/utils/ui.js",
  "./src/services/firebase.js",
  "./src/services/backup.service.js",
  "./src/services/categories.service.js",
  "./src/services/finance.js",
  "./src/services/notes.service.js",
  "./src/services/notifications.service.js",
  "./src/services/tasks.service.js",
  "./src/pages/about.js",
  "./src/pages/admin.js",
  "./src/pages/dashboard.js",
  "./src/pages/finance.js",
  "./src/pages/forgot-password.js",
  "./src/pages/help.js",
  "./src/pages/landing.js",
  "./src/pages/legal.js",
  "./src/pages/login.js",
  "./src/pages/notes.js",
  "./src/pages/not-found.js",
  "./src/pages/notifications.js",
  "./src/pages/profile.js",
  "./src/pages/register.js",
  "./src/pages/tasks.js",
  "./src/pages/videos.js",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://cdn.tailwindcss.com",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
];

// Instalação: Cacheia arquivos estáticos essenciais
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Intercepta requisições
self.addEventListener("fetch", (e) => {
  // CORREÇÃO: Ignora requisições que não sejam HTTP/HTTPS (ex: chrome-extension://)
  if (!e.request.url.startsWith("http")) return;

  // MELHORIA: Ignorar requisições do Firebase/Google APIs no Cache Storage
  // Deixamos o SDK do Firebase gerenciar a persistência dos dados (Firestore/Auth)
  if (
    e.request.url.includes("googleapis.com") ||
    e.request.url.includes("firestore")
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Retorna do cache se existir, senão busca na rede
      return (
        cachedResponse ||
        fetch(e.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Cacheia a nova requisição dinamicamente
            cache.put(e.request, response.clone());
            return response;
          });
        })
      );
    })
  );
});
