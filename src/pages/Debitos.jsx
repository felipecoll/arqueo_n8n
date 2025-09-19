import { useState, useEffect, useMemo } from 'react';
import { CreditCard, Trash2, ListPlus, CircleDollarSign, Send } from 'lucide-react';

// Función para obtener los datos iniciales desde localStorage
const getInitialDebitos = () => {
  try {
    const savedDebitos = localStorage.getItem('debitTransactions');
    return savedDebitos ? JSON.parse(savedDebitos) : [];
  } catch (error) {
    console.error("Error al procesar las operaciones con debito en localstorage", error);
    return [];
  }
};

const Debitos = () => {
  const [debitos, setDebitos] = useState(getInitialDebitos);
  const [inputValue, setInputValue] = useState('');

  // Efecto para guardar en localStorage cada vez que la lista de débitos cambie
  useEffect(() => {
    localStorage.setItem('debitTransactions', JSON.stringify(debitos));
  }, [debitos]);
  
  // Formateador para la moneda
  const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });

  // Cálculos para los contadores (optimizados con useMemo)
  const { totalAmount, operationCount } = useMemo(() => {
    const total = debitos.reduce((sum, current) => sum + current, 0);
    return {
      totalAmount: total,
      operationCount: debitos.length,
    };
  }, [debitos]);

  // 🔹 Manejador para enviar datos a n8n
  const sendToN8N = async (data) => {
    if (!data || data.length === 0) {
      alert("No hay datos para enviar.");
      return;
    }

    const payload = {
      tipoForm: "debitos",
      fecha: new Date().toISOString(),
      totalAmount: data.reduce((sum, current) => sum + current, 0),
      operationCount: data.length,
      detalle: data
    };

    try {
      const res = await fetch("http://localhost:5678/webhook-test/debitos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Error en la respuesta del servidor");

      const responseData = await res.json();
      console.log("Respuesta de n8n:", responseData);
      alert("Datos enviados correctamente 🚀");
    } catch (err) {
      console.error("Error al enviar datos a n8n:", err);
      alert("Hubo un error al enviar los datos a n8n");
    }
  };

  // Manejador para agregar un nuevo débito
  const handleAddDebit = (e) => {
    e.preventDefault();
    const newDebitValue = parseFloat(inputValue);

    if (isNaN(newDebitValue) || newDebitValue <= 0) {
      alert("Por favor, ingresa un valor numérico válido y mayor a cero.");
      return;
    }
    
    const updatedDebitos = [newDebitValue, ...debitos];
    setDebitos(updatedDebitos);
    setInputValue(''); // Limpia el input

    // 🔹 Enviar automáticamente a n8n
    sendToN8N(updatedDebitos);
  };
  
  // Manejador para eliminar un débito específico
  const handleDeleteDebit = (indexToDelete) => {
    const updatedDebitos = debitos.filter((_, index) => index !== indexToDelete);
    setDebitos(updatedDebitos);

    // 🔹 Enviar automáticamente a n8n después de eliminar
    if (updatedDebitos.length > 0) {
      sendToN8N(updatedDebitos);
    }
  };
  
  // Manejador para limpiar toda la lista
  const handleReset = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar todas las operaciones de débito?")) {
      setDebitos([]);
      // 🔹 También informamos a n8n que se vació
      sendToN8N([]);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-8 w-8 text-sky-600" />
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Control de Débitos</h3>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
          <CircleDollarSign className="h-8 w-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Recaudado</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {currencyFormatter.format(totalAmount)}
            </p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
          <ListPlus className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nº de Operaciones</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {operationCount}
            </p>
          </div>
        </div>
      </div>
      
      {/* Formulario de carga */}
      <form onSubmit={handleAddDebit} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="number"
          step="0.01"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ingresar valor del débito"
          className="flex-grow p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Cargar Débito
        </button>
      </form>
      
      {/* Listado de débitos */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {debitos.length > 0 ? (
          debitos.map((debit, index) => (
            <div key={`${index}-${debit}`} className="flex justify-between items-center bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg animate-fade-in">
              <span className="font-mono text-lg text-gray-800 dark:text-gray-200">{currencyFormatter.format(debit)}</span>
              <button onClick={() => handleDeleteDebit(index)} className="text-red-500 hover:text-red-700 p-1">
                <Trash2 size={18} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay operaciones cargadas.</p>
        )}
      </div>
      
      {/* Botones de acciones */}
      {debitos.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={handleReset}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Limpiar Todo
          </button>
          <button
            onClick={() => sendToN8N(debitos)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <Send size={16} />
            Enviar a Servidor
          </button>
        </div>
      )}
    </div>
  );
};

export default Debitos;


//Codigo sin importacion de n8n

// import { useState, useEffect, useMemo } from 'react';
// import { CreditCard, Trash2, ListPlus, CircleDollarSign } from 'lucide-react';

// // Función para obtener los datos iniciales desde localStorage
// const getInitialDebitos = () => {
//   try {
//     const savedDebitos = localStorage.getItem('debitTransactions');
//     return savedDebitos ? JSON.parse(savedDebitos) : [];
//   } catch (error) {
//     console.error("Error parsing debit transactions from localStorage", error);
//     return [];
//   }
// };

// const Debitos = () => {
//   const [debitos, setDebitos] = useState(getInitialDebitos);
//   const [inputValue, setInputValue] = useState('');

//   // Efecto para guardar en localStorage cada vez que la lista de débitos cambie
//   useEffect(() => {
//     localStorage.setItem('debitTransactions', JSON.stringify(debitos));
//   }, [debitos]);
  
//   // Formateador para la moneda
//   const currencyFormatter = new Intl.NumberFormat('es-AR', {
//     style: 'currency',
//     currency: 'ARS',
//   });

//   // Cálculos para los contadores (optimizados con useMemo)
//   const { totalAmount, operationCount } = useMemo(() => {
//     const total = debitos.reduce((sum, current) => sum + current, 0);
//     return {
//       totalAmount: total,
//       operationCount: debitos.length,
//     };
//   }, [debitos]);

//   // Manejador para agregar un nuevo débito
//   const handleAddDebit = (e) => {
//     e.preventDefault();
//     const newDebitValue = parseFloat(inputValue);

//     if (isNaN(newDebitValue) || newDebitValue <= 0) {
//       alert("Por favor, ingresa un valor numérico válido y mayor a cero.");
//       return;
//     }
    
//     // Agrega el nuevo valor al principio del array
//     setDebitos([newDebitValue, ...debitos]);
//     setInputValue(''); // Limpia el input
//   };
  
//   // Manejador para eliminar un débito específico
//   const handleDeleteDebit = (indexToDelete) => {
//     setDebitos(debitos.filter((_, index) => index !== indexToDelete));
//   };
  
//   // Manejador para limpiar toda la lista
//   const handleReset = () => {
//     if (window.confirm("¿Estás seguro de que deseas eliminar todas las operaciones de débito?")) {
//       setDebitos([]);
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
//       <div className="flex items-center gap-3 mb-6">
//         <CreditCard className="h-8 w-8 text-sky-600" />
//         <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Control de Débitos</h3>
//       </div>

//       {/* Contadores */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
//           <CircleDollarSign className="h-8 w-8 text-green-500" />
//           <div>
//             <p className="text-sm text-gray-500 dark:text-gray-400">Total Recaudado</p>
//             <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
//               {currencyFormatter.format(totalAmount)}
//             </p>
//           </div>
//         </div>
//         <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
//           <ListPlus className="h-8 w-8 text-blue-500" />
//           <div>
//             <p className="text-sm text-gray-500 dark:text-gray-400">Nº de Operaciones</p>
//             <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
//               {operationCount}
//             </p>
//           </div>
//         </div>
//       </div>
      
//       {/* Formulario de carga */}
//       <form onSubmit={handleAddDebit} className="flex flex-col sm:flex-row gap-2 mb-6">
//         <input
//           type="number"
//           step="0.01"
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           placeholder="Ingresar valor del débito"
//           className="flex-grow p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
//         />
//         <button
//           type="submit"
//           className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
//         >
//           Cargar Débito
//         </button>
//       </form>
      
//       {/* Listado de débitos */}
//       <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
//         {debitos.length > 0 ? (
//           debitos.map((debit, index) => (
//             <div key={`${index}-${debit}`} className="flex justify-between items-center bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg animate-fade-in">
//               <span className="font-mono text-lg text-gray-800 dark:text-gray-200">{currencyFormatter.format(debit)}</span>
//               <button onClick={() => handleDeleteDebit(index)} className="text-red-500 hover:text-red-700 p-1">
//                 <Trash2 size={18} />
//               </button>
//             </div>
//           ))
//         ) : (
//           <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay operaciones cargadas.</p>
//         )}
//       </div>
      
//       {/* Botón para Limpiar Todo */}
//       {debitos.length > 0 && (
//          <div className="mt-6 text-right">
//           <button
//             onClick={handleReset}
//             className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
//           >
//             Limpiar Todo
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Debitos;