import { getNotes, saveNote, deleteNote } from "../services/notes.service.js";
import {
  getCategories,
  addCategory,
  deleteCategory,
} from "../services/categories.service.js";
import { showToast, showConfirm } from "../utils/ui.js";

export function Notes() {
  const element = document.createElement("div");
  element.className =
    "flex flex-col h-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100";

  element.innerHTML = `
        <header class="bg-white dark:bg-gray-800 shadow-sm px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <div class="flex items-center gap-2 sm:gap-4">
                <button onclick="window.location.hash='/dashboard'" class="text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <h1 class="text-xl font-bold text-gray-800 dark:text-white">Notas</h1>
            </div>
            <div class="flex items-center gap-2 sm:gap-4">
                <button id="mobile-search-btn" class="sm:hidden text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fas fa-search text-xl"></i>
                </button>
                
                <div class="relative hidden sm:block">
                    <input type="text" id="search-notes" placeholder="Pesquisar..." class="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64 text-sm outline-none transition-all">
                    <i class="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                </div>

                <button onclick="window.toggleTheme()" class="text-gray-500 hover:text-yellow-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fas fa-adjust text-xl"></i>
                </button>
                <button onclick="window.location.hash='/notifications'" class="text-gray-500 hover:text-indigo-600 transition-colors relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <i class="fas fa-bell text-xl"></i>
                    <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">3</span>
                </button>
            </div>
        </header>

        <div id="mobile-search-overlay" class="fixed inset-0 bg-white dark:bg-gray-900 z-[55] hidden p-4">
            <div class="flex items-center gap-2">
                <button id="close-mobile-search" class="text-gray-500 hover:text-indigo-600 transition-colors">
                    <i class="fas fa-arrow-left text-xl"></i>
                </button>
                <div class="relative flex-1">
                    <input type="text" id="mobile-search-input" placeholder="Pesquisar notas..." class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500 text-base outline-none">
                    <i class="fas fa-search absolute left-3 top-3.5 text-gray-400"></i>
                </div>
            </div>
        </div>

        <main class="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            <div class="max-w-2xl mx-auto mb-8">
                <div id="create-note-container" class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200">
                    <div id="create-note-collapsed" class="p-3 text-gray-500 font-medium cursor-text">
                        Criar uma nota...
                    </div>
                    <div id="create-note-expanded" class="hidden p-4">
                        <input type="text" id="new-note-title" placeholder="Título" class="w-full bg-transparent font-bold text-lg mb-2 outline-none placeholder-gray-500">
                        <textarea id="new-note-content" placeholder="Criar uma nota..." rows="5" class="w-full bg-transparent resize-none outline-none placeholder-gray-500"></textarea>
                        
                        <div class="flex flex-wrap items-center gap-3 mb-2 mt-3">
                            <select id="new-note-cat" class="text-xs bg-gray-100 dark:bg-gray-700 rounded p-1 border-none outline-none w-full sm:w-auto flex-shrink-0">
                                <option value="">Sem categoria</option>
                            </select>
                            <button id="manage-note-cats" class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors w-full sm:w-auto"><i class="fas fa-cog mr-1"></i>Gerenciar Categorias</button>
                        </div>
                        
                        <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <div class="flex gap-2" id="color-picker">
                                </div>
                            <button id="close-create-note" class="text-sm font-medium px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Concluir</button>
                        </div>
                    </div>
                    </div>
            </div>

            <div id="notes-grid" class="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 p-1">
                </div>
        </main>

        <div id="edit-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 backdrop-blur-sm p-4">
            <div id="edit-modal-content" class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg p-0 transform transition-all scale-95 opacity-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div class="p-4 overflow-y-auto flex-1 custom-scrollbar">
                    <input type="text" id="edit-note-title" placeholder="Título" class="w-full bg-transparent font-bold text-xl mb-3 outline-none placeholder-gray-500">
                    <textarea id="edit-note-content" placeholder="Nota" class="w-full bg-transparent resize-none outline-none placeholder-gray-500 min-h-[150px]"></textarea>
                    <select id="edit-note-cat" class="text-sm bg-gray-100 dark:bg-gray-700 rounded p-1 border-none outline-none w-full mt-2">
                        <option value="">Sem categoria</option>
                    </select>
                </div>
                
                <div class="p-3 bg-gray-50/50 dark:bg-gray-700/30 flex flex-col sm:flex-row justify-between sm:items-center border-t border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                    <div class="flex gap-2 pb-2 sm:pb-0" id="edit-color-picker"></div>
                    
                    <div class="flex justify-end items-center gap-2 flex-shrink-0">
                        <span id="save-status" class="text-xs text-gray-400 italic opacity-0 transition-opacity mr-2">Salvo</span>
                        
                        <button id="copy-note-btn" class="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" title="Copiar conteúdo">
                            <i class="fas fa-copy"></i>
                        </button>

                        <button id="delete-note-btn" class="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Excluir"><i class="fas fa-trash"></i></button>
                        
                        <button id="close-modal-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors">Concluir</button>
                    </div>
                </div>
                </div>
        </div>

        <div id="cats-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-[60] backdrop-blur-sm p-4">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-bold">Categorias de Notas</h3>
                    <button id="close-cats-modal" class="text-gray-500"><i class="fas fa-times"></i></button>
                </div>
                <form id="add-cat-form" class="flex gap-2 mb-4">
                    <input type="text" name="catName" placeholder="Nova categoria..." required class="flex-1 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2 outline-none text-sm">
                    <button type="submit" class="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"><i class="fas fa-plus"></i></button>
                </form>
                <div id="cats-list" class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar"></div>
            </div>
        </div>
    `;

  // --- Logic ---
  const colors = [
    "white",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "darkblue",
    "purple",
    "pink",
    "brown",
    "gray",
  ];
  const colorMap = {
    white: "bg-white dark:bg-gray-800",
    red: "bg-red-100 dark:bg-red-900/30",
    orange: "bg-orange-100 dark:bg-orange-900/30",
    yellow: "bg-yellow-100 dark:bg-yellow-900/30",
    green: "bg-green-100 dark:bg-green-900/30",
    teal: "bg-teal-100 dark:bg-teal-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
    darkblue: "bg-indigo-100 dark:bg-indigo-900/30",
    purple: "bg-purple-100 dark:bg-purple-900/30",
    pink: "bg-pink-100 dark:bg-pink-900/30",
    brown: "bg-amber-100 dark:bg-amber-900/30",
    gray: "bg-gray-100 dark:bg-gray-700",
  };

  // State
  let notes = [];
  let currentNoteId = null;
  let currentColor = "white";
  let autoSaveTimer = null;

  // Elements
  const grid = element.querySelector("#notes-grid");
  const searchInput = element.querySelector("#search-notes");
  
  // New Mobile Search Elements
  const mobileSearchBtn = element.querySelector("#mobile-search-btn");
  const mobileSearchOverlay = element.querySelector("#mobile-search-overlay");
  const mobileSearchInput = element.querySelector("#mobile-search-input");
  const closeMobileSearchBtn = element.querySelector("#close-mobile-search");

  // Create Note Elements
  const createCollapsed = element.querySelector("#create-note-collapsed");
  const createExpanded = element.querySelector("#create-note-expanded");
  const newTitle = element.querySelector("#new-note-title");
  const newContent = element.querySelector("#new-note-content");
  const closeCreateBtn = element.querySelector("#close-create-note");
  const colorPicker = element.querySelector("#color-picker");

  // Edit Modal Elements
  const modal = element.querySelector("#edit-modal");
  const modalContent = element.querySelector("#edit-modal-content");
  const editTitle = element.querySelector("#edit-note-title");
  const editContent = element.querySelector("#edit-note-content");
  const editColorPicker = element.querySelector("#edit-color-picker");
  const deleteBtn = element.querySelector("#delete-note-btn");
  const closeModalBtn = element.querySelector("#close-modal-btn");
  const saveStatus = element.querySelector("#save-status");
  const copyNoteBtn = element.querySelector("#copy-note-btn"); // NOVO ELEMENTO

  const newCatSelect = element.querySelector("#new-note-cat");
  const editCatSelect = element.querySelector("#edit-note-cat");
  const manageCatsBtn = element.querySelector("#manage-note-cats");
  const catsModal = element.querySelector("#cats-modal");
  const closeCatsBtn = element.querySelector("#close-cats-modal");
  const addCatForm = element.querySelector("#add-cat-form");
  const catsList = element.querySelector("#cats-list");

  // --- Functions ---

  const renderColorPicker = (container, onClick) => {
    container.innerHTML = "";
    colors.forEach((color) => {
      const btn = document.createElement("button");
      const cssColors = {
        white: "#ffffff",
        red: "#fca5a5",
        orange: "#fdba74",
        yellow: "#fde047",
        green: "#86efac",
        teal: "#5eead4",
        blue: "#93c5fd",
        darkblue: "#a5b4fc",
        purple: "#d8b4fe",
        pink: "#f9a8d4",
        brown: "#d6d3d1",
        gray: "#e5e7eb",
      };
      // Adicionado ring-2 e classes de foco/seleção para melhor feedback visual
      btn.className = `w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
        currentColor === color ? "ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-gray-900" : ""
      }`;
      btn.style.backgroundColor = cssColors[color];
      btn.title = color;
      btn.onclick = (e) => {
        e.stopPropagation();
        onClick(color);
        // Atualiza o estado visual do color picker após a seleção
        renderColorPicker(container, onClick);
      };
      container.appendChild(btn);
    });
  };

  const renderNotes = () => {
    grid.innerHTML = "";
    // Verifica qual campo de busca usar (Desktop ou Mobile Overlay)
    const term = (searchInput.value || mobileSearchInput.value).toLowerCase();

    const filtered = notes.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(term)) ||
        (n.content && n.content.toLowerCase().includes(term))
    );

    if (filtered.length === 0) {
      grid.innerHTML =
        '<div class="col-span-full text-center text-gray-500 py-8">Nenhuma nota encontrada</div>';
      return;
    }

    filtered.forEach((note) => {
      const card = document.createElement("div");
      const bgClass = colorMap[note.color] || colorMap.white;
      card.className = `${bgClass} p-4 rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all cursor-pointer break-inside-avoid mb-4 group relative`;

      card.innerHTML = `
                ${
                  note.title
                    ? `<h3 class="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">${note.title}</h3>`
                    : ""
                }
                <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm line-clamp-[10]">${
                  note.content || ""
                }</p>
                ${
                  note.category
                    ? `<span class="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 font-medium">${note.category}</span>`
                    : ""
                }
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-transparent sm:bg-white/50 dark:sm:bg-black/20 rounded-full">
                    <button class="p-1.5 text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"><i class="fas fa-pen text-sm"></i></button>
                </div>
            `;

      card.onclick = () => openEditModal(note);
      grid.appendChild(card);
    });
  };

  const loadNotes = async () => {
    try {
      notes = await getNotes();
      renderNotes();
    } catch (error) {
      console.error(error);
    }
  };

  // Category Logic
  const renderCategories = async () => {
    const cats = await getCategories("note");
    const populate = (sel) => {
      const val = sel.value;
      sel.innerHTML = '<option value="">Sem categoria</option>';
      cats.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.name;
        opt.textContent = c.name;
        sel.appendChild(opt);
      });
      sel.value = val;
    };
    populate(newCatSelect);
    populate(editCatSelect);

    catsList.innerHTML = "";
    cats.forEach((c) => {
      const div = document.createElement("div");
      div.className =
        "flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm";
      div.innerHTML = `<span>${c.name}</span><button class="text-red-500 hover:text-red-700 p-1"><i class="fas fa-trash"></i></button>`;
      div.querySelector("button").onclick = () =>
        showConfirm(`Excluir "${c.name}"?`, async () => {
          await deleteCategory(c.id);
          renderCategories();
        });
      catsList.appendChild(div);
    });
  };
  manageCatsBtn.onclick = () => {
    catsModal.classList.remove("hidden");
    catsModal.classList.add("flex");
  };
  closeCatsBtn.onclick = () => {
    catsModal.classList.add("hidden");
    catsModal.classList.remove("flex");
  };
  addCatForm.onsubmit = async (e) => {
    e.preventDefault();
    await addCategory(addCatForm.catName.value, "note");
    addCatForm.reset();
    renderCategories();
  };
  
  // --- Mobile Search Logic ---
  mobileSearchBtn.onclick = () => {
    mobileSearchOverlay.classList.remove("hidden");
    mobileSearchOverlay.classList.add("flex");
    mobileSearchInput.value = searchInput.value; // Sincroniza o valor
    mobileSearchInput.focus();
  };
  closeMobileSearchBtn.onclick = () => {
    mobileSearchOverlay.classList.add("hidden");
    mobileSearchOverlay.classList.remove("flex");
    // Sincroniza o valor de volta para o input desktop
    searchInput.value = mobileSearchInput.value;
  };
  mobileSearchInput.addEventListener("input", renderNotes);
  // O input desktop já tem o event listener: searchInput.addEventListener("input", renderNotes);


  // --- Create Note Logic ---
  
  // Adiciona evento de mudança de cor no container de criação
  const updateCreateContainerColor = (color) => {
    currentColor = color;
    const container = element.querySelector("#create-note-container");
    const bgClass = colorMap[color];
    // Remove todas as classes de cor e aplica a nova
    container.className = container.className.replace(
      /bg-\w+-\d+\/30|bg-\w+-\d+|bg-white|dark:bg-\w+-\d+\/30|dark:bg-\w+-\d+|dark:bg-gray-800/g, 
      ''
    );
    // Adiciona as classes de cor, mantendo as outras (shadow, border, etc.)
    container.className = `${container.className.replace(/shadow-\w+|border-\w+|rounded-\w+|overflow-\w+|transition-\w+|duration-\w+/g, '').trim()} ${bgClass} rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200`;

    renderColorPicker(colorPicker, updateCreateContainerColor); // Renderiza novamente para destacar a cor
  };
  
  createCollapsed.onclick = () => {
    createCollapsed.classList.add("hidden");
    createExpanded.classList.remove("hidden");
    newTitle.focus();
    updateCreateContainerColor("white");
  };

  const closeCreate = async () => {
    const title = newTitle.value.trim();
    const content = newContent.value.trim();

    if (title || content) {
      await saveNote({
        title,
        content,
        color: currentColor,
        category: newCatSelect.value,
      });
      showToast("Nota criada com sucesso!", "success"); // Feedback ao usuário
      newTitle.value = "";
      newContent.value = "";
      newCatSelect.value = ""; // Reseta a categoria
      currentColor = "white"; // Reseta a cor
      loadNotes();
    }

    createExpanded.classList.add("hidden");
    createCollapsed.classList.remove("hidden");
    // Reseta a cor do container para a cor padrão
    element.querySelector("#create-note-container").className = 
      element.querySelector("#create-note-container").className.replace(
        /bg-\w+-\d+\/30|bg-\w+-\d+|bg-white|dark:bg-\w+-\d+\/30|dark:bg-\w+-\d+|dark:bg-gray-800/g, 
        colorMap.white.split(' ').join(' ')
      );
  };

  closeCreateBtn.onclick = closeCreate;
  

  // --- Edit/Auto-save Logic ---
  const openEditModal = (note) => {
    currentNoteId = note.id;
    editTitle.value = note.title;
    editContent.value = note.content;
    currentColor = note.color;
    editCatSelect.value = note.category || "";

    // Update modal visual
    const bgClass = colorMap[note.color] || colorMap.white;
    // Lógica aprimorada para remover todas as cores antes de adicionar a nova
    Object.values(colorMap).forEach((c) =>
      c.split(" ").forEach((cls) => modalContent.classList.remove(cls))
    );
    bgClass.split(" ").forEach((cls) => modalContent.classList.add(cls));

    renderColorPicker(editColorPicker, (c) => {
      currentColor = c;
      const newBgClass = colorMap[c];
      // Lógica aprimorada para remover todas as cores antes de adicionar a nova
      Object.values(colorMap).forEach((cls) =>
        cls.split(" ").forEach((cl) => modalContent.classList.remove(cl))
      );
      newBgClass.split(" ").forEach((cl) => modalContent.classList.add(cl));
      triggerAutoSave();
    });

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    setTimeout(() => {
      modalContent.classList.remove("scale-95", "opacity-0");
      modalContent.classList.add("scale-100", "opacity-100");
    }, 10);
    // Para garantir que o foco seja na área de conteúdo em mobile
    if (window.innerWidth < 640) {
      editContent.focus();
    }
  };

  const closeEditModal = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    saveStatus.style.opacity = "0"; // Garante que o status de salvamento desapareça
    
    modalContent.classList.remove("scale-100", "opacity-100");
    modalContent.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      currentNoteId = null;
      loadNotes(); // Recarrega as notas para refletir as mudanças
    }, 200);
  };

  const triggerAutoSave = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    saveStatus.style.opacity = "0";

    autoSaveTimer = setTimeout(async () => {
      if (!currentNoteId) return;

      const note = {
        id: currentNoteId,
        title: editTitle.value,
        content: editContent.value,
        color: currentColor,
        category: editCatSelect.value,
      };

      await saveNote(note);

      // Update local state
      const idx = notes.findIndex((n) => n.id === currentNoteId);
      if (idx !== -1) notes[idx] = { ...notes[idx], ...note };

      // Feedback de salvamento aprimorado
      saveStatus.textContent = "Salvo";
      saveStatus.style.opacity = "1";
      setTimeout(() => (saveStatus.style.opacity = "0"), 2000);
    }, 1000); // 1 second debounce
  };

  const copyNoteContent = async () => {
    const title = editTitle.value.trim();
    const content = editContent.value.trim();
    
    if (!title && !content) {
        showToast("A nota está vazia!", "warning");
        return;
    }

    // Combina título e conteúdo, se existirem
    const textToCopy = (title ? title + "\n\n" : "") + content;

    try {
        await navigator.clipboard.writeText(textToCopy);
        showToast("Conteúdo da nota copiado!", "success");
    } catch (err) {
        console.error('Falha ao copiar texto: ', err);
        showToast("Erro ao copiar. Tente novamente.", "error");
    }
  };

  editTitle.addEventListener("input", triggerAutoSave);
  editContent.addEventListener("input", triggerAutoSave);
  editCatSelect.addEventListener("change", triggerAutoSave);

  closeModalBtn.onclick = closeEditModal;
  modal.onclick = (e) => {
    // Somente fecha se clicar diretamente no backdrop
    if (e.target === modal) closeEditModal();
  };

  deleteBtn.onclick = async () => {
    showConfirm("Excluir esta nota permanentemente?", async () => {
      await deleteNote(currentNoteId);
      showToast("Nota excluída com sucesso!", "warning");
      closeEditModal();
    });
  };

  // VINCULA A NOVA FUNÇÃO DE COPIAR AO BOTÃO
  copyNoteBtn.onclick = copyNoteContent;

  // Sincroniza o input desktop com o mobile, se necessário
  searchInput.addEventListener("input", () => {
    mobileSearchInput.value = searchInput.value;
    renderNotes();
  });
  // O input mobile já tem o event listener: mobileSearchInput.addEventListener("input", renderNotes);

  loadNotes();
  renderCategories();

  return element;
}
