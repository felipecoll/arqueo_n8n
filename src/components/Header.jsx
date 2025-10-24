
// Envio de datos (cabecera) a n8n para su creacion en google sheets
import { useState } from 'react';
import { Sun, Moon, ChevronDown, CheckCircle } from 'lucide-react';

const Header = ({ 
  selectedUser, setSelectedUser, 
  selectedLocation, setSelectedLocation, 
  toggleTheme, theme,
  isFixedValueActive, setIsFixedValueActive 
}) => {
  const [isSending, setIsSending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const users = ["Coll, Leon Felipe", 'Coll, Leon Felipe (test)'];
  const locations = [
    "Caja 1 - casa central", "Caja 2 - casa central", "Caja 3 - casa central",
    "Caja Sinsacate", "Caja La caroyense - 1", "Caja ruta 9 - 1",
    "Caja ruta 9 - 2", "Caja locutorio XV"
  ];
  const fixedValue = isFixedValueActive ? 10000 : 0;
  
  const currencyFormatter = new Intl.NumberFormat('es-AR', { 
    style: 'currency', 
    currency: 'ARS', 
    minimumFractionDigits: 0 
  });

  const handleVerification = async () => {
    const payload = {
      tipoForm: "header",
      fecha: new Date().toISOString(),
      usuario: selectedUser,
      ubicacion: selectedLocation,
      valorFijo: fixedValue
    };

    setIsSending(true);

    try {
      const res = await fetch("http://localhost:5678/webhook-test/arqueoN8N", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      const data = await res.json();
      console.log("Respuesta de n8n:", data);

      alert(`
        --- Datos Enviados ---
        Usuario: ${payload.usuario}
        Ubicación: ${payload.ubicacion}
        Valor Fijo: ${currencyFormatter.format(payload.valorFijo)}
      `);

      setIsVerified(true);
    } catch (error) {
      console.error("Error al enviar datos a n8n:", error);
      alert("❌ Error al enviar los datos a n8n");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex justify-between items-center transition-colors duration-300">
      {/* Sección Izquierda */}
      <div className="flex flex-col">
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

      {/* Sección Central */}
      <div className="hidden lg:flex items-center gap-6">
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
        <button onClick={handleVerification} disabled={isVerified || isSending}
          className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg transition-colors 
            ${isVerified ? 'bg-green-500 text-white cursor-not-allowed' : 
              isSending ? 'bg-gray-400 text-gray-100 cursor-wait' :
              'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'}`}
        >
          <CheckCircle size={20} />
          {isVerified ? "Datos Enviados" : isSending ? "Enviando..." : "Verificar Datos"}
        </button>
      </div>

      {/* Sección Derecha */}
      <div className="flex flex-col items-end space-y-1">
        <button onClick={toggleTheme} className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-gray-800">
          {theme === 'dark' ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-700" />}
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>
    </header>
  );
};

export default Header;