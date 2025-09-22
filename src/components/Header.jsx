import { Sun, Moon, ChevronDown, CheckCircle } from 'lucide-react';

const Header = ({ 
  selectedUser, setSelectedUser, 
  selectedLocation, setSelectedLocation, 
  toggleTheme, theme,
  isFixedValueActive, setIsFixedValueActive 
}) => {
  const users = ["Coll, Leon Felipe", 'Tonellier, Jose', 'Lenarduzzi, Andres'];
  const locations = ["Caja 1 - Casa Central", "Caja 2 - Casa Central", "Caja 3 - Casa Central"
    , "Caja Sinsacate", "Caja La caroyense - 1", "Caja ruta 9 - 1", "Caja ruta 9 - 2", "Caja Locutorio XV"
  ];
  const fixedValue = isFixedValueActive ? 10000 : 0;
  
  const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 });

  const handleVerification = () => {
    const message = `
      --- Datos Verificados ---
      Usuario: ${selectedUser}
      Ubicación: ${selectedLocation}
      Valor Fijo: ${currencyFormatter.format(fixedValue)}
    `;
    alert(message);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center transition-colors duration-300">
      {/* Sección Izquierda (sin cambios) */}
      <div className="flex flex-col space-y-1">
        <div className="relative">
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
            className="appearance-none bg-transparent dark:text-white font-bold text-lg cursor-pointer pr-6 focus:outline-none">
            {users.map(user => <option key={user} value={user}>{user}</option>)}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}
            className="appearance-none bg-transparent text-xs text-gray-500 dark:text-gray-400 cursor-pointer pr-6 focus:outline-none">
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Sección Central (MODIFICADA) */}
      <div className="hidden lg:flex items-center gap-6">
        {/* Switch de Valor Fijo */}
        <div className="flex items-center gap-3">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={isFixedValueActive} onChange={() => setIsFixedValueActive(!isFixedValueActive)} />
              <div className={`block w-14 h-8 rounded-full transition-colors ${isFixedValueActive ? 'bg-sky-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isFixedValueActive ? 'transform translate-x-6' : ''}`}></div>
            </div>
          </label>
          <span className="font-semibold text-gray-700 dark:text-gray-300 w-24 text-center">
            {currencyFormatter.format(fixedValue)}
          </span>
        </div>

        {/* Botón de Verificación */}
        <button 
          onClick={handleVerification}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors">
          <CheckCircle size={20} />
          Verificar Datos
        </button>
      </div>

      {/* Sección Derecha (sin cambios) */}
      <div className="flex flex-col items-end space-y-1">
        <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-800">
          {theme === 'dark' ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-700" />}
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
    </header>
  );
};

export default Header;

// src/components/Header.jsx
// import { Sun, Moon, ChevronDown } from 'lucide-react';

// const Header = ({ 
//   selectedUser, setSelectedUser, 
//   selectedLocation, setSelectedLocation, 
//   toggleTheme, theme 
// }) => {
//   const users = ["Leon Felipe Coll"];
//   const locations = ["Caja 1 - Casa Central", "Caja 2 - Casa Central", "Caja 3 - Casa Central",
//     "Caja Sinsacate", "Caja La caroyense", "Caja ruta 9 - 1", "Caja ruta 9 - 2", "Caja Locutorio"
//   ];
  
//   const currentDate = new Date().toLocaleDateString('es-AR', {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric'
//   });

//   return (
//     <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center transition-colors duration-300">
//       {/* Sección Izquierda */}
//       <div className="flex flex-col space-y-1">
//         <div className="relative">
//           <select
//             value={selectedUser}
//             onChange={(e) => setSelectedUser(e.e.target.value)}
//             className="appearance-none bg-transparent dark:text-white font-bold text-lg cursor-pointer pr-6 focus:outline-none"
//           >
//             {users.map(user => <option key={user} value={user}>{user}</option>)}
//           </select>
//           <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
//         </div>
//         <div className="relative">
//           <select
//             value={selectedLocation}
//             onChange={(e) => setSelectedLocation(e.target.value)}
//             className="appearance-none bg-transparent text-xs text-gray-500 dark:text-gray-400 cursor-pointer pr-6 focus:outline-none"
//           >
//             {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
//           </select>
//           <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
//         </div>
//       </div>

//       {/* Sección Central (Título) */}
//       <div className="hidden lg:block">
//         <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Panel de Control</h1>
//       </div>

//       {/* Sección Derecha */}
//       <div className="flex flex-col items-end space-y-1">
//         <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-800">
//           {theme === 'dark' ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-700" />}
//         </button>
//         <span className="text-xs text-gray-500 dark:text-gray-400">{currentDate}</span>
//       </div>
//     </header>
//   );
// };

// export default Header;