import React, { useState, useEffect } from 'react';
import { useUser } from '../store/userContext';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

const AdminPage = () => {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // In a real application, you'd check if the user is an actual admin
      // For now, we'll just fetch all users
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollectionRef = collection(db, 'users'); // Assuming you have a 'users' collection
      const querySnapshot = await getDocs(usersCollectionRef);
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() });
      });
      setUsers(userList);
    } catch (err) {
      setError('Error fetching users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading admin data...</div>;
  if (error) return <div className="text-center p-4 text-red-600">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Painel Administrativo</h2>
      <p className="mb-4">Funcionalidades do Admin (em desenvolvimento):</p>
      <ul className="list-disc list-inside bg-white p-4 rounded-lg shadow">
        <li>Visualizar usuários cadastrados (apresentado abaixo)</li>
        <li>Visualizar dados financeiros (somente leitura - será implementado)</li>
        <li>Acesso a logs básicos (será implementado)</li>
        <li>Dashboard administrativo (será implementado)</li>
      </ul>

      <h3 className="text-xl font-semibold mt-8 mb-4">Usuários Cadastrados</h3>
      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">UID</th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">Email</th>
                <th className="py-2 px-4 border-b text-left text-sm font-medium text-gray-600">Data de Criação</th>
                {/* Add more user fields as needed */}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-sm text-gray-800">{u.id}</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-800">{u.email}</td>
                  <td className="py-2 px-4 border-b text-sm text-gray-800">{u.createdAt?.toDate ? new Date(u.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">Nenhum usuário registrado ainda.</p>
      )}
    </div>
  );
};

export default AdminPage;