import React, { useState, useEffect } from 'react';
import { useUser } from '../store/userContext';
import TasksService from '../services/tasks.service';

const NotesPage = () => {
  const { user } = useUser();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState({ title: '', content: '', color: '#ffffff' });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const userNotes = await TasksService.getNotes(user.uid);
      setNotes(userNotes);
    } catch (err) {
      setError('Error fetching notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    setError('');
    if (!newNote.title || !newNote.content) {
      setError('Title and content cannot be empty.');
      return;
    }
    try {
      if (editingNoteId) {
        await TasksService.updateNote(editingNoteId, newNote);
        setEditingNoteId(null);
      } else {
        await TasksService.addNote(user.uid, newNote.title, newNote.content, newNote.color);
      }
      setNewNote({ title: '', content: '', color: '#ffffff' });
      setIsFormVisible(false);
      fetchNotes();
    } catch (err) {
      setError('Error saving note: ' + err.message);
    }
  };

  const handleEditClick = (note) => {
    setNewNote({ title: note.title, content: note.content, color: note.color });
    setEditingNoteId(note.id);
    setIsFormVisible(true);
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setError('');
      try {
        await TasksService.deleteNote(id);
        fetchNotes();
      } catch (err) {
        setError('Error deleting note: ' + err.message);
      }
    }
  };

  if (loading) return <div className="text-center p-4">Loading notes...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Minhas Notas</h2>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700"
        >
          {isFormVisible ? 'Fechar' : 'Adicionar Nota'}
        </button>
      </div>

      {/* Note Form */}
      {isFormVisible && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-xl font-semibold mb-4">{editingNoteId ? 'Editar Nota' : 'Adicionar Nova Nota'}</h3>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newNote.title}
                onChange={handleInputChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">Conteúdo</label>
              <textarea
                id="content"
                name="content"
                rows="4"
                value={newNote.content}
                onChange={handleInputChange}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700">Cor</label>
              <input
                type="color"
                id="color"
                name="color"
                value={newNote.color}
                onChange={handleInputChange}
                className="mt-1 block h-10 w-20 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingNoteId ? 'Salvar Edição' : 'Adicionar Nota'}
            </button>
            {editingNoteId && (
              <button
                type="button"
                onClick={() => {
                  setEditingNoteId(null);
                  setNewNote({ title: '', content: '', color: '#ffffff' });
                  setIsFormVisible(false);
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-2"
              >
                Cancelar
              </button>
            )}
            {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
          </form>
        </div>
      )}

      {/* Notes List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div key={note.id} className="p-4 rounded-lg shadow-md relative" style={{ backgroundColor: note.color }}>
              <h3 className="text-xl font-semibold mb-2">{note.title}</h3>
              <p className="text-gray-700 mb-4">{note.content}</p>
              <div className="absolute bottom-2 right-2 flex space-x-2">
                <button
                  onClick={() => handleEditClick(note)}
                  className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">Nenhuma nota registrada ainda.</p>
        )}
      </div>
    </div>
  );
};

export default NotesPage;