// src/components/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Content from '../components/Content';
import Footer from '../components/Footer';

const DashboardLayout = () => {
  // Estado para el tema (con localStorage)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  
  // Estado para el contenido a mostrar
  const [selectedItem, setSelectedItem] = useState('Inicio');
  
  // Estado para el usuario seleccionado
  const [selectedUser, setSelectedUser] = useState('Felipe Gonzalez');
  
  // Estado para la ubicación (con localStorage)
  const [selectedLocation, setSelectedLocation] = useState(
    () => localStorage.getItem('selectedLocation') || 'Caja 1 - Casa Central'
  );
  
  // --- NUEVO CAMBIO ---
  // Estado para el switch de valor fijo, ahora con localStorage
  const [isFixedValueActive, setIsFixedValueActive] = useState(
    () => localStorage.getItem('isFixedValueActive') === 'true' // Lee como string y convierte a boolean
  );
  // --- FIN DE NUEVO CAMBIO ---

  // Efecto para el tema
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Efecto para guardar la ubicación
  useEffect(() => {
    localStorage.setItem('selectedLocation', selectedLocation);
  }, [selectedLocation]);
  
  // --- NUEVO EFECTO ---
  // Efecto para guardar el estado del switch en localStorage
  useEffect(() => {
    localStorage.setItem('isFixedValueActive', isFixedValueActive);
  }, [isFixedValueActive]);
  // --- FIN DE NUEVO EFECTO ---

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar 
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem} 
      />
      <div className="flex-1 flex flex-col">
        <Header 
          selectedUser={selectedUser} 
          setSelectedUser={setSelectedUser}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          toggleTheme={toggleTheme} 
          theme={theme}
          isFixedValueActive={isFixedValueActive}
          setIsFixedValueActive={setIsFixedValueActive}
        />
        <Content selectedItem={selectedItem} />
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;