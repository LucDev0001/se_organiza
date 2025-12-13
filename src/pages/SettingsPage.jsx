import React from 'react';
import PwaInstallButton from '../components/PwaInstallButton';

const SettingsPage = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Configurações</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Instalar Aplicativo</h3>
        <p className="mb-4">Instale o aplicativo em seu dispositivo para uma melhor experiência.</p>
        <PwaInstallButton />
      </div>
    </div>
  );
};

export default SettingsPage;
