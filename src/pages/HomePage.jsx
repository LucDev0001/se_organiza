import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  CreditCardIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useUser } from '../store/userContext';

const navigationItems = [
  { name: 'Financeiro', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Tarefas', href: '/tasks', icon: ClipboardDocumentListIcon },
  { name: 'Notas', href: '/notes', icon: CreditCardIcon },
  { name: 'Perfil', href: '/profile', icon: UserIcon },
  { name: 'Configurações', href: '/settings', icon: CogIcon },
];

const AuthenticatedHomePage = () => {
  const { user } = useUser();

  return (
    <div className="p-4 text-center">
      <h1 className="text-3xl font-bold mb-2">Bem-vindo, {user.displayName || 'Usuário'}!</h1>
      <p className="text-lg text-gray-600 mb-8">O que você gostaria de fazer hoje?</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg hover:bg-indigo-50 transition-colors"
          >
            <item.icon className="h-12 w-12 text-indigo-600 mb-2" />
            <span className="text-lg font-semibold text-gray-800">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const UnauthenticatedHomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Bem-vindo ao Se Organiza!</h1>
      <p className="text-lg text-gray-600 text-center mb-8">
        Seu assistente pessoal para planejamento financeiro, notas e tarefas.
      </p>
      <div className="flex space-x-4">
        <Link
          to="/login"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Fazer Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Criar Conta
        </Link>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }
  
  return user ? <AuthenticatedHomePage /> : <UnauthenticatedHomePage />;
};

export default HomePage;