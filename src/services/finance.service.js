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
} from 'firebase/firestore';

const FinanceService = {
  addTransaction: async (userId, type, amount, category, date, recurrence = null) => {
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        userId,
        type, // 'expense' or 'gain'
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        recurrence,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  getTransactions: async (userId, startDate = null, endDate = null) => {
    try {
      let q = query(collection(db, 'transactions'), where('userId', '==', userId));

      if (startDate) {
        q = query(q, where('date', '>=', new Date(startDate)));
      }
      if (endDate) {
        q = query(q, where('date', '<=', new Date(endDate)));
      }

      const querySnapshot = await getDocs(q);
      const transactions = [];
      querySnapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      return transactions;
    } catch (error) {
      throw error;
    }
  },

  updateTransaction: async (id, updatedFields) => {
    try {
      const transactionRef = doc(db, 'transactions', id);
      await updateDoc(transactionRef, updatedFields);
      return true;
    } catch (error) {
      throw error;
    }
  },

  deleteTransaction: async (id) => {
    try {
      const transactionRef = doc(db, 'transactions', id);
      await deleteDoc(transactionRef);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Categories (can be managed by user)
  addCategory: async (userId, name, type) => {
    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        userId,
        name,
        type, // 'expense' or 'gain'
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  getCategories: async (userId, type = null) => {
    try {
      let q = query(collection(db, 'categories'), where('userId', '==', userId));
      if (type) {
        q = query(q, where('type', '==', type));
      }
      const querySnapshot = await getDocs(q);
      const categories = [];
      querySnapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      return categories;
    } catch (error) {
      throw error;
    }
  },
};

export default FinanceService;