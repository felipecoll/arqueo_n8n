import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRightLeft, Trash2, Edit, Save, XCircle, 
  ListPlus, CircleDollarSign, UploadCloud, Send // Importé 'Send' para el botón individual
} from 'lucide-react';

// Nueva interfaz de datos: { value: number, sent: boolean }

const getInitialData = () => {
  try {
    const savedData = localStorage.getItem('transferenciaTransactions');
    if (!savedData) return [];

    const parsedData = JSON.parse(savedData);
    
    // Convierte el formato antiguo (array de números) al nuevo (array de objetos) si es necesario.
    return parsedData.map(item => {
      if (typeof item === 'number') {
        return { value: item, sent: false }; // Nuevo ítem sin enviar
      }
      // Si ya es un objeto, lo usa, asegurando que 'sent' esté definido.
      return { value: item.value, sent: item.sent || false };
    });
  } catch (error) {
    console.error("Error parsing transfer transactions from localStorage", error);
    return [];
  }
};

const Transferencias = () => {
  const [items, setItems] = useState(getInitialData);
  const [inputValue, setInputValue] = useState('');
  
  // Estados para la edición
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  
  // Estado para feedback de envío (bulk)
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Al guardar en LocalStorage, ahora se guarda el array de objetos
    localStorage.setItem('transferenciaTransactions', JSON.stringify(items));
  }, [items]);

  const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

  const { totalAmount, operationCount } = useMemo(() => {
    // El cálculo ahora accede a la propiedad 'value' de cada objeto
    const total = items.reduce((sum, current) => sum + current.value, 0);
    return { totalAmount: total, operationCount: items.length };
  }, [items]);

  const handleAddItem = (e) => {
    e.preventDefault();
    const newValue = parseFloat(inputValue);
    if (isNaN(newValue) || newValue <= 0) return;
    
    // Crea el nuevo objeto con sent: false
    setItems([{ value: newValue, sent: false }, ...items]);
    setInputValue('');
  };

  const handleDeleteItem = (indexToDelete) => {
    setItems(items.filter((_, index) => index !== indexToDelete));
  };
  
  const handleReset = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar todas las transferencias?")) {
      setItems([]);
    }
  };

  // --- Lógica de Edición ---
  const handleEditClick = (index) => {
    setEditingIndex(index);
    // Guarda el valor numérico (item.value) como string para la edición
    setEditingValue(items[index].value.toString());
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleSaveEdit = (indexToSave) => {
    const updatedValue = parseFloat(editingValue);
    if (isNaN(updatedValue) || updatedValue <= 0) {
        alert("Por favor, ingresa un valor válido.");
        return;
    }
    
    const updatedItems = items.map((item, index) => {
      if (index === indexToSave) {
        // Al modificar, se resetea el estado 'sent' a false para permitir el reenvío
        return { value: updatedValue, sent: false };
      }
      return item;
    });
    setItems(updatedItems);
    handleCancelEdit(); // Resetea el estado de edición
  };
  
  // --- Función para enviar un ítem individual a N8N ---
  const handleSendIndividualToN8N = async (indexToSend) => {
    const item = items[indexToSend];
    if (item.sent) return; // Previene el envío si ya fue marcado como enviado

    if (!window.confirm(`¿Seguro que quieres enviar el monto ${currencyFormatter.format(item.value)} individualmente a n8n?`)) {
      return;
    }
    
    const originalItem = item; // Guardar el ítem original
    
    // Temporalmente marcar como enviando (opcional para feedback visual, no implementado aquí para ser concisos, pero lo dejo como nota)
    
    try {
      const response = await fetch("http://localhost:5678/webhook/transferencias", {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: item.value, // Envía solo el valor
          operacion: "individual",
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el dato individual');
      }

      // Si el envío es exitoso, actualiza el estado 'sent' a true para ESTE ítem
      const updatedItems = items.map((i, idx) => 
        idx === indexToSend ? { ...i, sent: true } : i
      );
      setItems(updatedItems);

      alert("✅ Monto individual enviado a n8n.");
    } catch (error) {
      console.error("Error enviando a n8n:", error);
      alert("⚠️ No se pudo enviar el monto individual. Intenta nuevamente.");
    }
  };


  // --- Función original para enviar todos (modificada para actualizar el estado) ---
  const handleSendToN8N = async () => {
    if (items.length === 0) return;

    if (!window.confirm("¿Estás seguro de que deseas enviar la lista completa de transferencias a n8n?")) {
        return;
    }
    
    setSending(true);

    try {
      // Prepara la lista de valores para enviar al webhook
      const valuesToSend = items.map(item => item.value);

      const response = await fetch("http://localhost:5678/webhook/transferencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferencias: valuesToSend, // Envía solo los valores
          total: totalAmount,
          operaciones: operationCount,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar datos a n8n");
      }

      // Si el envío masivo es exitoso, marca TODOS los ítems como enviados
      const markedAsSent = items.map(item => ({ ...item, sent: true }));
      setItems(markedAsSent);

      alert("✅ Datos enviados a n8n correctamente");
    } catch (error) {
      console.error("Error enviando a n8n:", error);
      alert("⚠️ No se pudo conectar con n8n");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <ArrowRightLeft className="h-8 w-8 text-sky-600" />
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Vales - transf.</h3>
      </div>
      
      {/* Contadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
          <CircleDollarSign className="h-8 w-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400"> Total</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{currencyFormatter.format(totalAmount)}</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
          <ListPlus className="h-8 w-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Nº de Operaciones</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{operationCount}</p>
          </div>
        </div>
      </div>
      
      {/* Formulario de carga */}
      <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input type="number" step="0.01" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ingresar valor del vale/transf."
          className="flex-grow p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
        <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
          Cargar vale o transf.
        </button>
      </form>
      
      {/* Listado */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {items.length > 0 ? items.map((item, index) => (
          <div key={index} 
               className={`flex justify-between items-center p-3 rounded-lg animate-fade-in transition-colors ${item.sent ? 'bg-green-50 dark:bg-gray-700/80 border-l-4 border-green-500' : 'bg-slate-50 dark:bg-gray-700/50'}`}>
            {editingIndex === index ? (
              // --- VISTA DE EDICIÓN ---
              <div className="flex-grow flex items-center gap-2">
                <input type="number" value={editingValue} onChange={(e) => setEditingValue(e.target.value)} autoFocus
                  className="w-full p-1 rounded bg-white dark:bg-gray-800 text-lg font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none" />
                <button onClick={() => handleSaveEdit(index)} className="text-green-500 hover:text-green-700 p-1"><Save size={20} /></button>
                <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 p-1"><XCircle size={20} /></button>
              </div>
            ) : (
              // --- VISTA NORMAL ---
              <>
                <span className={`font-mono text-lg transition-colors ${item.sent ? 'text-green-700 dark:text-green-300 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                    {currencyFormatter.format(item.value)}
                </span>
                <div className="flex items-center gap-2">
                  {/* BOTÓN DE ENVÍO INDIVIDUAL */}
                  <button onClick={() => handleSendIndividualToN8N(index)} 
                          disabled={item.sent}
                          className={`p-1 transition-opacity ${item.sent ? 'text-gray-400 opacity-60 cursor-not-allowed' : 'text-green-500 hover:text-green-700'}`}
                          title={item.sent ? 'Transferencia enviada' : 'Enviar esta transf. individualmente'}>
                      <Send size={18} />
                  </button>
                  {/* BOTÓN DE EDICIÓN (Permite editar y re-enviar) */}
                  <button onClick={() => handleEditClick(index)} className="text-blue-500 hover:text-blue-700 p-1" title="Editar"><Edit size={18} /></button>
                  {/* BOTÓN DE ELIMINAR */}
                  <button onClick={() => handleDeleteItem(index)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar"><Trash2 size={18} /></button>
                </div>
              </>
            )}
          </div>
        )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay vales o transferencias cargadas.</p>}
      </div>
      
      {/* Botones de acciones */}
      {items.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
            Limpiar Todo
          </button>
          {/* <button 
            onClick={handleSendToN8N} 
            disabled={sending}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <UploadCloud size={18} />
            {sending ? "Enviando..." : "Enviar a n8n (Bulk)"}
          </button> */}
        </div>
      )}
    </div>
  );
};

export default Transferencias;

// Codigo hasta la fecha 13/11/2025

// import { useState, useEffect, useMemo } from 'react';
// import { 
//   ArrowRightLeft, Trash2, Edit, Save, XCircle, 
//   ListPlus, CircleDollarSign, UploadCloud 
// } from 'lucide-react';

// const getInitialData = () => {
//   try {
//     const savedData = localStorage.getItem('transferenciaTransactions');
//     return savedData ? JSON.parse(savedData) : [];
//   } catch (error) {
//     console.error("Error parsing transfer transactions from localStorage", error);
//     return [];
//   }
// };

// const Transferencias = () => {
//   const [items, setItems] = useState(getInitialData);
//   const [inputValue, setInputValue] = useState('');
  
//   // Estados para la edición
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editingValue, setEditingValue] = useState('');
  
//   // Estado para feedback de envío
//   const [sending, setSending] = useState(false);

//   useEffect(() => {
//     localStorage.setItem('transferenciaTransactions', JSON.stringify(items));
//   }, [items]);

//   const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

//   const { totalAmount, operationCount } = useMemo(() => {
//     const total = items.reduce((sum, current) => sum + current, 0);
//     return { totalAmount: total, operationCount: items.length };
//   }, [items]);

//   const handleAddItem = (e) => {
//     e.preventDefault();
//     const newValue = parseFloat(inputValue);
//     if (isNaN(newValue) || newValue <= 0) return;
//     setItems([newValue, ...items]);
//     setInputValue('');
//   };

//   const handleDeleteItem = (indexToDelete) => {
//     setItems(items.filter((_, index) => index !== indexToDelete));
//   };
  
//   const handleReset = () => {
//     if (window.confirm("¿Estás seguro de que deseas eliminar todas las transferencias?")) {
//       setItems([]);
//     }
//   };

//   // --- Lógica de Edición ---
//   const handleEditClick = (index) => {
//     setEditingIndex(index);
//     setEditingValue(items[index].toString());
//   };

//   const handleCancelEdit = () => {
//     setEditingIndex(null);
//     setEditingValue('');
//   };

//   const handleSaveEdit = (indexToSave) => {
//     const updatedValue = parseFloat(editingValue);
//     if (isNaN(updatedValue) || updatedValue <= 0) {
//         alert("Por favor, ingresa un valor válido.");
//         return;
//     }
//     const updatedItems = items.map((item, index) => index === indexToSave ? updatedValue : item);
//     setItems(updatedItems);
//     handleCancelEdit(); // Resetea el estado de edición
//   };

//   // --- Envío a n8n ---
//   const handleSendToN8N = async () => {
//     if (items.length === 0) return;

//     setSending(true);
//     try {
//       const response = await fetch("http://localhost:5678/webhook/transferencias", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           transferencias: items,
//           total: totalAmount,
//           operaciones: operationCount,
//           timestamp: new Date().toISOString()
//         }),
//       });

//       if (response.ok) {
//         alert("✅ Datos enviados a n8n correctamente");
//       } else {
//         alert("❌ Error al enviar datos a n8n");
//       }
//     } catch (error) {
//       console.error("Error enviando a n8n:", error);
//       alert("⚠️ No se pudo conectar con n8n");
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
//       <div className="flex items-center gap-3 mb-6">
//         <ArrowRightLeft className="h-8 w-8 text-sky-600" />
//         <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Vales - transf.</h3>
//       </div>
      
//       {/* Contadores */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
//           <CircleDollarSign className="h-8 w-8 text-green-500" />
//           <div>
//             <p className="text-sm text-gray-500 dark:text-gray-400"> Total</p>
//             <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{currencyFormatter.format(totalAmount)}</p>
//           </div>
//         </div>
//         <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
//           <ListPlus className="h-8 w-8 text-blue-500" />
//           <div>
//             <p className="text-sm text-gray-500 dark:text-gray-400">Nº de Operaciones</p>
//             <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{operationCount}</p>
//           </div>
//         </div>
//       </div>
      
//       {/* Formulario de carga */}
//       <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2 mb-6">
//         <input type="number" step="0.01" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ingresar valor del vale/transf."
//           className="flex-grow p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
//         <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
//           Cargar vale o transf.
//         </button>
//       </form>
      
//       {/* Listado */}
//       <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
//         {items.length > 0 ? items.map((item, index) => (
//           <div key={`${index}-${item}`} className="flex justify-between items-center bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg animate-fade-in">
//             {editingIndex === index ? (
//               // --- VISTA DE EDICIÓN ---
//               <div className="flex-grow flex items-center gap-2">
//                 <input type="number" value={editingValue} onChange={(e) => setEditingValue(e.target.value)} autoFocus
//                   className="w-full p-1 rounded bg-white dark:bg-gray-800 text-lg font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none" />
//                 <button onClick={() => handleSaveEdit(index)} className="text-green-500 hover:text-green-700 p-1"><Save size={20} /></button>
//                 <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 p-1"><XCircle size={20} /></button>
//               </div>
//             ) : (
//               // --- VISTA NORMAL ---
//               <>
//                 <span className="font-mono text-lg text-gray-800 dark:text-gray-200">{currencyFormatter.format(item)}</span>
//                 <div className="flex items-center gap-2">
//                   <button onClick={() => handleEditClick(index)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={18} /></button>
//                   <button onClick={() => handleDeleteItem(index)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
//                 </div>
//               </>
//             )}
//           </div>
//         )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay vales o transferencias cargadas.</p>}
//       </div>
      
//       {/* Botones de acciones */}
//       {items.length > 0 && (
//         <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
//           <button onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
//             Limpiar Todo
//           </button>
//           <button 
//             onClick={handleSendToN8N} 
//             disabled={sending}
//             className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
//           >
//             <UploadCloud size={18} />
//             {sending ? "Enviando..." : "Enviar a n8n"}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Transferencias;
