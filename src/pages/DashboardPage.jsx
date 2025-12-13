import React, { useState, useEffect } from 'react';
import { useUser } from '../store/userContext';
import FinanceService from '../services/finance.service';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const DashboardPage = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: '',
    date: new Date().toISOString().slice(0, 10),
    recurrence: '',
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userTransactions = await FinanceService.getTransactions(user.uid);
      setTransactions(userTransactions);
      const userCategories = await FinanceService.getCategories(user.uid);
      setCategories(userCategories);
    } catch (err) {
      setError('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setError('');
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.date) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      await FinanceService.addTransaction(
        user.uid,
        newTransaction.type,
        newTransaction.amount,
        newTransaction.category,
        newTransaction.date,
        newTransaction.recurrence
      );
      setNewTransaction({
        type: 'expense',
        amount: '',
        category: '',
        date: new Date().toISOString().slice(0, 10),
        recurrence: '',
      });
      fetchData(); // Refresh data
    } catch (err) {
      setError('Error adding transaction: ' + err.message);
    }
  };

  const getBalance = () => {
    const totalGains = transactions
      .filter((t) => t.type === 'gain')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return totalGains - totalExpenses;
  };

  const getCategoryData = (type) => {
    const filteredTransactions = transactions.filter((t) => t.type === type);
    const categoryMap = filteredTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    return {
      labels: Object.keys(categoryMap),
      datasets: [
        {
          data: Object.values(categoryMap),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#56FFCE',
          ],
        },
      ],
    };
  };

  const getMonthlyEvolutionData = () => {
    const monthlyData = transactions.reduce((acc, t) => {
      const monthYear = new Date(t.date.toDate()).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!acc[monthYear]) {
        acc[monthYear] = { gains: 0, expenses: 0 };
      }
      if (t.type === 'gain') {
        acc[monthYear].gains += t.amount;
      } else {
        acc[monthYear].expenses += t.amount;
      }
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const dateA = new Date(`01 ${monthA} ${yearA}`);
      const dateB = new Date(`01 ${monthB} ${yearB}`);
      return dateA - dateB;
    });

    const gainsData = sortedMonths.map(month => monthlyData[month].gains);
    const expensesData = sortedMonths.map(month => monthlyData[month].expenses);

    return {
      labels: sortedMonths,
      datasets: [
        {
          label: 'Ganhos',
          data: gainsData,
          backgroundColor: '#36A2EB',
        },
        {
          label: 'Despesas',
          data: expensesData,
          backgroundColor: '#FF6384',
        },
      ],
    };
  };


  if (loading) return <div className="text-center p-4">Loading financial data...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard Financeiro</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Saldo Atual</h3>
          <p className="text-3xl font-bold text-gray-900">R$ {getBalance().toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Total de Ganhos</h3>
          <p className="text-3xl font-bold text-green-600">R$ {transactions.filter(t => t.type === 'gain').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-500">Total de Despesas</h3>
          <p className="text-3xl font-bold text-red-600">R$ {transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-xl font-semibold mb-4">Adicionar Nova Transação</h3>
        <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              id="type"
              name="type"
              value={newTransaction.type}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="expense">Despesa</option>
              <option value="gain">Ganho</option>
            </select>
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Valor</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={newTransaction.amount}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
            <input
              type="text"
              id="category"
              name="category"
              value={newTransaction.category}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
             {/* TODO: Implement dynamic category selection/creation */}
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Data</label>
            <input
              type="date"
              id="date"
              name="date"
              value={newTransaction.date}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700">Recorrência (opcional)</label>
            <input
              type="text"
              id="recurrence"
              name="recurrence"
              value={newTransaction.recurrence}
              onChange={handleInputChange}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Ex: Mensal, Anual"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Adicionar Transação
            </button>
          </div>
          {error && <p className="md:col-span-2 mt-2 text-center text-sm text-red-600">{error}</p>}
        </form>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Despesas por Categoria</h3>
          {getCategoryData('expense').labels.length > 0 ? (
            <Doughnut data={getCategoryData('expense')} />
          ) : (
            <p className="text-center text-gray-500">Nenhuma despesa para exibir.</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Evolução Mensal (Ganhos vs Despesas)</h3>
          {getMonthlyEvolutionData().labels.length > 0 ? (
            <Bar data={getMonthlyEvolutionData()} />
          ) : (
            <p className="text-center text-gray-500">Nenhum dado mensal para exibir.</p>
          )}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Transações Recentes</h3>
        {transactions.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium">{transaction.category}</p>
                  <p className="text-sm text-gray-500">{new Date(transaction.date.toDate()).toLocaleDateString()}</p>
                </div>
                <p className={`text-lg font-semibold ${transaction.type === 'gain' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'gain' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">Nenhuma transação registrada ainda.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;