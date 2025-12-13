import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';

const TasksService = {
  addNote: async (userId, title, content, color = '#ffffff') => {
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        userId,
        title,
        content,
        color,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  getNotes: async (userId) => {
    try {
      const q = query(collection(db, 'notes'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const notes = [];
      querySnapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() });
      });
      return notes;
    } catch (error) {
      throw error;
    }
  },

  updateNote: async (id, updatedFields) => {
    try {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, updatedFields);
      return true;
    } catch (error) {
      throw error;
    }
  },

  deleteNote: async (id) => {
    try {
      const noteRef = doc(db, 'notes', id);
      await deleteDoc(noteRef);
      return true;
    } catch (error) {
      throw error;
    }
  },

  addTask: async (userId, title, description, status = 'pending', dueDate = null) => {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        userId,
        title,
        description,
        status, // 'pending', 'in_progress', 'completed'
        dueDate: dueDate ? new Date(dueDate) : null,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  getTasks: async (userId) => {
    try {
      const q = query(collection(db, 'tasks'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      return tasks;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (id, updatedFields) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, updatedFields);
      return true;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      const taskRef = doc(db, 'tasks', id);
      await deleteDoc(taskRef);
      return true;
    } catch (error) {
      throw error;
    }
  },
};

export default TasksService;