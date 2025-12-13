import React, { useState } from 'react';
import { useUser } from '../store/userContext';
import AuthService from '../services/auth.service';

const ProfilePage = () => {
  const { user, setUser } = useUser();
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const updatedUser = await AuthService.updateUserProfile(user, { photoURL });
      setUser(updatedUser);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Meu Perfil</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <img
            className="h-24 w-24 rounded-full"
            src={user.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
            alt="User avatar"
          />
          <div>
            <h3 className="text-xl font-semibold">{user.displayName || 'Usuário'}</h3>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
          <div>
            <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700">
              URL da Foto de Perfil
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="photoURL"
                name="photoURL"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Atualizando...' : 'Atualizar Perfil'}
            </button>
          </div>
          {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
