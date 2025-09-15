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
  const [selectedLocation, setSelectedLocation] = useState('Caja 1 - Casa Central');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar 
        selectedItem={selectedItem} // <--- Prop añadida aquí
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
        />
        <Content selectedItem={selectedItem} />
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;