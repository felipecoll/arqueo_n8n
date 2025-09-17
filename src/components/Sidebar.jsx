// src/components/Sidebar.jsx
import { Home, ArrowRightLeft, QrCode, CreditCard, Landmark, Banknote, ArrowDown, ArrowUp, Shapes } from 'lucide-react';

const Sidebar = ({ selectedItem, onSelectItem }) => {
  const menuItems = [
    { name: "Inicio", icon: <Home size={20} /> },
    { name: "Pagos Municipales", icon: <Landmark size={20} /> },
    { name: "Varios", icon: <Shapes size={20} /> },
    { name: "Egresos", icon: <ArrowDown size={20} /> },
    { name: "Cheques", icon: <Banknote size={20} /> },
    { name: "Transferencias", icon: <ArrowRightLeft size={20} /> },
    { name: "QR", icon: <QrCode size={20} /> },
    { name: "Débitos", icon: <CreditCard size={20} /> },
    
    { name: "Efectivo", icon: <ArrowUp size={20} /> }, // <--- Nombre cambiado aquí
  ];
  
  // ... el resto del componente sigue igual
  
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 p-4 flex flex-col shadow-lg transition-colors duration-300">
      <div className="text-2xl font-bold mb-8 text-center text-slate-700 dark:text-slate-300">MiFinanza</div>
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
                    ${isActive
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-4 font-medium">{item.name}</span>
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