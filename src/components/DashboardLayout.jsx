// src/components/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Content from '../components/Content';
import Footer from '../components/Footer';

const DashboardLayout = () => {
  
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const [selectedItem, setSelectedItem] = useState('Inicio');
  
  const [selectedUser, setSelectedUser] = useState('Felipe Gonzalez');
  
  // --- NUEVOS CAMBIOS ---
  // Estado para la ubicación, ahora con localStorage
  const [selectedLocation, setSelectedLocation] = useState(
    () => localStorage.getItem('selectedLocation') || 'Caja 1 - Casa Central'
  );
  
  // Nuevo estado para el switch de valor fijo
  const [isFixedValueActive, setIsFixedValueActive] = useState(false);
  // --- FIN DE NUEVOS CAMBIOS ---

  // Efecto para el tema (ya existente)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // --- NUEVO EFECTO ---
  // Efecto para guardar la ubicación en localStorage
  useEffect(() => {
    localStorage.setItem('selectedLocation', selectedLocation);
  }, [selectedLocation]);
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