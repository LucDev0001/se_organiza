# Se Organiza PWA

Este projeto é um Progressive Web App (PWA) construído com React, Vite e Tailwind CSS, oferecendo funcionalidades de organização pessoal como planejamento financeiro, gerenciamento de notas e tarefas, e um painel administrativo. Ele é projetado para ser responsivo, instalável e compatível com o Firebase (plano Spark) para persistência de dados e GitHub Pages para hospedagem estática.

## 🚀 Funcionalidades

-   **Autenticação**: Login, registro e logout de usuários com Firebase Authentication (e-mail/senha).
-   **Módulo de Planejamento Financeiro**:
    -   Cadastro de despesas e ganhos (valor, categoria, data, recorrência).
    -   Saldo mensal, histórico por mês e filtros por período.
    -   Dashboard com cards de resumo (saldo, ganhos, despesas) e gráficos (pizza por categoria, linha de evolução mensal, barras de ganhos vs. despesas) usando Chart.js.
-   **Módulo de Notas e Tarefas**:
    -   **Notas**: Criar, editar, excluir notas rápidas com cores/etiquetas.
    -   **Tarefas**: Criar tarefas com status (pendente, em andamento, concluída), datas, e organização estilo Kanban.
-   **Painel Administrativo**:
    -   Acesso restrito para administradores (atualmente validado por e-mail, **ATENÇÃO: para produção, use Firebase Custom Claims para maior segurança**).
    -   Visualização de usuários cadastrados.
    -   (Futuro) Visualização de dados financeiros globais (somente leitura).
-   **PWA**:
    -   Aplicação instalável em dispositivos móveis e desktops.
    -   Cache offline básico para assets essenciais.
    -   `display: standalone` para uma experiência de aplicativo nativo.
-   **Interface & UX**:
    -   Design **mobile-first** e responsivo.
    -   Menu de navegação inferior (mobile) e barra lateral (desktop).
    -   Modo escuro (futuro).
    -   Animações suaves e feedback visual.

## 🛠️ Stack Tecnológica

-   **Frontend**: React (Vite)
-   **Estilização**: Tailwind CSS
-   **Gerenciamento de Estado**: React Context API
-   **Roteamento**: React Router DOM
-   **Gráficos**: Chart.js com React Chart.js 2
-   **Backend (BaaS)**: Firebase (Authentication, Firestore)
-   **Hospedagem**: GitHub Pages (para o frontend estático)

## ⚙️ Configuração do Projeto

### Pré-requisitos

-   Node.js (v18 ou superior) e npm instalados.
-   Uma conta Firebase e um projeto configurado.

### Passos de Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd se_organiza
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configuração do Firebase:**
    -   No seu projeto Firebase, vá em "Configurações do Projeto" -> "Seus apps" e copie o objeto de configuração da sua aplicação web.
    -   Cole essa configuração no arquivo `src/services/firebase.js`:
        ```javascript
        // src/services/firebase.js
        import { initializeApp } from "firebase/app";
        import { getAuth } from "firebase/auth";
        import { getFirestore } from "firebase/firestore";

        const firebaseConfig = {
          apiKey: "SUA_API_KEY",
          authDomain: "SEU_AUTH_DOMAIN",
          projectId: "SEU_PROJECT_ID",
          storageBucket: "SEU_STORAGE_BUCKET",
          messagingSenderId: "SEU_MESSAGING_SENDER_ID",
          appId: "SEU_APP_ID",
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        export { app, auth, db };
        ```
    -   **Habilite o Firebase Authentication**: No console do Firebase, vá em "Authentication" -> "Sign-in method" e habilite "Email/Password".
    -   **Configure o Firestore**: No console do Firebase, vá em "Firestore Database" e crie um banco de dados.

### Regras de Segurança do Firestore

Este projeto inclui um arquivo `firestore.rules` na raiz do projeto com as regras de segurança recomendadas. **É crucial que você implante essas regras no seu projeto Firebase** para proteger seus dados.

1.  No console do Firebase, vá em "Firestore Database" -> "Rules".
2.  Substitua o conteúdo existente pelas regras encontradas no arquivo `firestore.rules` deste projeto.
    -   **Atenção:** A validação de administrador atual é baseada no e-mail `lucianosantosseverino@gmail.com`. Para um ambiente de produção, é **altamente recomendado** usar Firebase Custom Claims para identificar administradores de forma segura.
3.  Publique as regras.

### Executando a Aplicação Localmente

```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173` (ou outra porta disponível).

### Compilando para Produção

```bash
npm run build
```
Isso gerará os arquivos estáticos na pasta `dist/`.

## 📄 Deploy no GitHub Pages

Para fazer o deploy da sua aplicação no GitHub Pages, siga estes passos:

1.  **Configure o `package.json`**:
    -   Adicione a propriedade `homepage` com a URL do seu GitHub Pages (ex: `https://<USERNAME>.github.io/<REPO_NAME>/`).
    -   Adicione um script `deploy` para automatizar o processo.

    ```json
    // package.json
    {
      "name": "se_organiza",
      "private": true,
      "version": "0.0.0",
      "type": "module",
      "homepage": "https://lucianosantosseverino.github.io/se_organiza/", // Substitua pelo seu
      "scripts": {
        "dev": "vite",
        "build": "vite build",
        "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
        "preview": "vite preview",
        "deploy": "gh-pages -d dist" // Adicione esta linha
      },
      // ... outras dependências
      "devDependencies": {
        // ...
        "gh-pages": "^X.Y.Z" // Adicione esta dependência
      }
    }
    ```
2.  **Instale `gh-pages`**:
    ```bash
    npm install gh-pages --save-dev
    ```
3.  **Realize o deploy**:
    ```bash
    npm run build
    npm run deploy
    ```
4.  No seu repositório GitHub, vá em "Settings" -> "Pages" e configure a fonte para `gh-pages branch` e a pasta para `/ (root)`.

## 🎨 Personalização e Desenvolvimento

-   **Tailwind CSS**: Edite `tailwind.config.js` para personalizar seu tema.
-   **Componentes**: Encontre os componentes em `src/components/`, `src/pages/`, `src/layouts/`.
-   **Serviços Firebase**: Ajuste os serviços em `src/services/` conforme suas necessidades.
-   **PWA**: Modifique `public/manifest.json` e `public/service-worker.js` para atualizar o comportamento do PWA (ícones, estratégias de cache, etc.).

## ⚠️ Observações de Segurança

-   A implementação atual da validação de administrador (`AdminProtectedRoute.jsx`) **não é segura para ambientes de produção** pois depende de um e-mail hardcoded no frontend. Para segurança robusta, use [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims) configurados a partir de um ambiente de servidor seguro (e.g., Firebase Cloud Functions).
-   Sempre mantenha suas chaves de API do Firebase confidenciais e nunca as exponha diretamente em código público ou repositórios, embora a configuração atual do Firebase Web SDK seja projetada para ser pública.

---

Espero que este `README.md` seja útil para iniciar e gerenciar o projeto!