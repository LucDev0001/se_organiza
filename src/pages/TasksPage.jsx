import React, { useState, useEffect } from 'react';
import { useUser } from '../store/userContext';
import TasksService from '../services/tasks.service';

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 border-yellow-400';
      case 'in_progress':
        return 'bg-blue-100 border-blue-400';
      case 'completed':
        return 'bg-green-100 border-green-400';
      default:
        return 'bg-gray-100 border-gray-400';
    }
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md mb-3 border-l-4 ${getStatusColor(task.status)}`}>
      <h4 className="font-semibold text-lg mb-1">{task.title}</h4>
      <p className="text-gray-700 text-sm mb-2">{task.description}</p>
      {task.dueDate && (
        <p className="text-xs text-gray-500 mb-2">Vence: {
          task.dueDate && typeof task.dueDate.toDate === 'function'
            ? new Date(task.dueDate.toDate()).toLocaleDateString()
            : new Date(task.dueDate).toLocaleDateString()
        }</p>
      )}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onEdit(task)}
          className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'pending', dueDate: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const statuses = ['pending', 'in_progress', 'completed'];

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const userTasks = await TasksService.getTasks(user.uid);
      setTasks(userTasks);
    } catch (err) {
      setError('Error fetching tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setError('');
    if (!newTask.title || !newTask.description) {
      setError('Title and description cannot be empty.');
      return;
    }
    try {
      if (editingTaskId) {
        await TasksService.updateTask(editingTaskId, newTask);
        setEditingTaskId(null);
      } else {
        await TasksService.addTask(
          user.uid,
          newTask.title,
          newTask.description,
          newTask.status,
          newTask.dueDate
        );
      }
      setNewTask({ title: '', description: '', status: 'pending', dueDate: '' });
      setIsFormVisible(false);
      fetchTasks();
    } catch (err) {
      setError('Error saving task: ' + err.message);
    }
  };

  const handleEditClick = (task) => {
    let dueDate = '';
    if (task.dueDate) {
      if (typeof task.dueDate.toDate === 'function') {
        dueDate = new Date(task.dueDate.toDate()).toISOString().slice(0, 10);
      } else {
        dueDate = new Date(task.dueDate).toISOString().slice(0, 10);
      }
    }
    setNewTask({
      title: task.title,
      description: task.description,
      status: task.status,
      dueDate: dueDate,
    });
    setEditingTaskId(task.id);
    setIsFormVisible(true);
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setError('');
      try {
        await TasksService.deleteTask(id);
        fetchTasks();
      } catch (err) {
        setError('Error deleting task: ' + err.message);
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setError('');
    try {
      await TasksService.updateTask(taskId, { status: newStatus });
      fetchTasks();
    } catch (err) {
      setError('Error updating task status: ' + err.message);
    }
  };


  if (loading) return <div className="text-center p-4">Loading tasks...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Minhas Tarefas (Kanban)</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700"
        >
          {isFormVisible ? 'Fechar' : 'Adicionar Tarefa'}
        </button>
      </div>

      {/* Task Form */}
      {isFormVisible && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-xl font-semibold mb-4">{editingTaskId ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}</h3>
          <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                id="description"
                name="description"
                rows="2"
                value={newTask.description}
                onChange={handleInputChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={newTask.status}
                onChange={handleInputChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Data de Vencimento (opcional)</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={newTask.dueDate}
                onChange={handleInputChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingTaskId ? 'Salvar Edição' : 'Adicionar Tarefa'}
              </button>
            </div>
            {editingTaskId && (
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTaskId(null);
                    setNewTask({ title: '', description: '', status: 'pending', dueDate: '' });
                    setIsFormVisible(false);
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
                >
                  Cancelar
                </button>
              </div>
            )}
            {error && <p className="md:col-span-2 mt-2 text-center text-sm text-red-600">{error}</p>}
          </form>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statuses.map((status) => (
          <div key={status} className="bg-gray-50 p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 capitalize">
              {status.replace('_', ' ')} ({tasks.filter((t) => t.status === status).length})
            </h3>
            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === status)
                .map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEditClick} onDelete={handleDeleteTask} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;