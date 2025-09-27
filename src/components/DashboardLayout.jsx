// src/components/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Content from '../components/Content';
import Footer from '../components/Footer';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [selectedItem, setSelectedItem] = useState('Home');
  const [selectedUser, setSelectedUser] = useState('Coll, Leon Felipe');
  const [selectedLocation, setSelectedLocation] = useState(() => localStorage.getItem('selectedLocation') || 'Caja 1 - casa central');
  const [isFixedValueActive, setIsFixedValueActive] = useState(() => localStorage.getItem('isFixedValueActive') === 'true');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('selectedLocation', selectedLocation);
  }, [selectedLocation]);
  
  useEffect(() => {
    localStorage.setItem('isFixedValueActive', isFixedValueActive);
  }, [isFixedValueActive]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
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