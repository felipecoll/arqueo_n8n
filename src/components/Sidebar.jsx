// src/components/Sidebar.jsx
import { Home, ArrowRightLeft, QrCode, CreditCard, Landmark, Banknote, ArrowDown, ArrowUp, Shapes, PanelLeftClose, Menu } from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar, selectedItem, onSelectItem }) => { 
  const menuItems = [
    { name: "Home", icon: <Home size={20} /> },
    { name: "Pagos Municipales", icon: <Landmark size={20} /> },
    { name: "Varios", icon: <Shapes size={20} /> },
    { name: "Egresos", icon: <ArrowDown size={20} /> },
    { name: "Cheques", icon: <Banknote size={20} /> },
    { name: "Transferencias", icon: <ArrowRightLeft size={20} /> },
    { name: "QR", icon: <QrCode size={20} /> },
    { name: "Débitos", icon: <CreditCard size={20} /> },
    { name: "Efectivo", icon: <ArrowUp size={20} /> }, 
  ];
  
  return (
    <aside 
      className={`bg-white dark:bg-gray-800 p-4 flex flex-col shadow-lg transition-all duration-300 ease-in-out
      ${isSidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* 🔹 CONTENEDOR DEL TÍTULO Y BOTÓN CORREGIDO 🔹 */}
      <div 
        className={`flex items-center mb-8 transition-all duration-300
        ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}
      >
        {/* El título ahora se renderiza condicionalmente para no ocupar espacio al cerrarse */}
        {isSidebarOpen && (
          <h1 className="font-bold text-2xl text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Arqueo Digit
          </h1>
        )}
        
        <button 
          onClick={toggleSidebar} 
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300"
        >
          {isSidebarOpen ? <PanelLeftClose size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <nav className="flex-grow">
        <ul>
          {menuItems.map((item) => {
            const isActive = selectedItem === item.name;
            return (
              <li key={item.name} className="mb-2">
                <a
                  href="#"
                  onClick={() => onSelectItem(item.name)}
                  className={`flex items-center p-3 rounded-lg transition-all
                    ${isSidebarOpen ? '' : 'justify-center'}
                    ${isActive
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  <div className="flex-shrink-0">
                    {item.icon}
                  </div>
                  
                  <span 
                    className={`ml-4 font-medium whitespace-nowrap transition-opacity duration-200 
                    ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}
                  >
                    {item.name}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;