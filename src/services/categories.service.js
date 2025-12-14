import {
  db,
  auth,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "./firebase.js";

const COLLECTION_NAME = "categories";

export const DEFAULT_CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Salário",
  "Outros",
];

export async function getCategories(type = "finance") {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", user.uid),
    where("type", "==", type)
  );
  const snapshot = await getDocs(q);
  const customCategories = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    isDefault: false,
  }));

  // Ordenar categorias personalizadas alfabeticamente
  customCategories.sort((a, b) => a.name.localeCompare(b.name));

  if (type === "finance") {
    const defaults = DEFAULT_CATEGORIES.map((c) => ({
      id: `def_${c}`,
      name: c,
      isDefault: true,
    }));
    return [...defaults, ...customCategories];
  }

  return customCategories;
}

export async function addCategory(name, type = "finance") {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");

  await addDoc(collection(db, COLLECTION_NAME), {
    userId: user.uid,
    name: name,
    type: type,
    createdAt: new Date().toISOString(),
  });
}

export async function deleteCategory(id) {
  if (!id) return;
  await deleteDoc(doc(db, COLLECTION_NAME, id));
}
