// src/components/Header.jsx
import { Sun, Moon, ChevronDown } from 'lucide-react';

const Header = ({ 
  selectedUser, setSelectedUser, 
  selectedLocation, setSelectedLocation, 
  toggleTheme, theme 
}) => {
  const users = ["Leon Felipe Coll"];
  const locations = ["Caja 1 - Casa Central", "Caja 2 - Casa Central", "Caja 3 - Casa Central",
    "Caja Sinsacate", "Caja La caroyense", "Caja ruta 9 - 1", "Caja ruta 9 - 2", "Caja Locutorio"
  ];
  
  const currentDate = new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center transition-colors duration-300">
      {/* Sección Izquierda */}
      <div className="flex flex-col space-y-1">
        <div className="relative">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.e.target.value)}
            className="appearance-none bg-transparent dark:text-white font-bold text-lg cursor-pointer pr-6 focus:outline-none"
          >
            {users.map(user => <option key={user} value={user}>{user}</option>)}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="appearance-none bg-transparent text-xs text-gray-500 dark:text-gray-400 cursor-pointer pr-6 focus:outline-none"
          >
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Sección Central (Título) */}
      <div className="hidden lg:block">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Panel de Control</h1>
      </div>

      {/* Sección Derecha */}
      <div className="flex flex-col items-end space-y-1">
        <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-800">
          {theme === 'dark' ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-700" />}
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">{currentDate}</span>
      </div>
    </header>
  );
};

export default Header;