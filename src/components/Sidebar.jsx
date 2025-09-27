import { Home, ArrowRightLeft, QrCode, CreditCard, Shapes, Banknote, ArrowDown, ArrowUp, Landmark } from 'lucide-react';

// Se recibe la prop isSidebarOpen para controlar el estado
const Sidebar = ({ isSidebarOpen, selectedItem, onSelectItem }) => { 
  const menuItems = [
    { name: "Inicio", icon: <Home size={20} /> },
    { name: "Transferencias", icon: <ArrowRightLeft size={20} /> },
    { name: "QR", icon: <QrCode size={20} /> },
    { name: "Cheques", icon: <Banknote size={20} /> },
    { name: "Débitos", icon: <CreditCard size={20} /> },
    { name: "Varios", icon: <Shapes size={20} /> },
    { name: "Pagos Municipales", icon: <Landmark size={20} /> },
    { name: "Egresos", icon: <ArrowDown size={20} /> },
    { name: "Efectivo", icon: <ArrowUp size={20} /> },
  ];
  
  return (
    // El ancho cambia según el estado, con una transición suave
    <aside 
      className={`bg-white dark:bg-gray-800 p-4 flex flex-col shadow-lg transition-all duration-300 ease-in-out
      ${isSidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* El título cambia para mostrar iniciales o el nombre completo */}
      <div className="font-bold mb-8 text-center text-slate-700 dark:text-slate-300">
        <h1 className="text-2xl transition-opacity duration-300">{isSidebarOpen ? 'MiFinanza' : 'MF'}</h1>
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
                  // El contenido se centra si el menú está cerrado
                  className={`flex items-center p-3 rounded-lg transition-all
                    ${isSidebarOpen ? '' : 'justify-center'}
                    ${isActive
                      ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  {item.icon}
                  {/* El texto solo se muestra si el menú está abierto */}
                  <span 
                    className={`ml-4 font-medium whitespace-nowrap transition-all duration-200 
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