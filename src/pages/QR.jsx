import { useState, useEffect, useMemo } from 'react';
import { QrCode, Trash2, Edit, Save, XCircle, ListPlus, CircleDollarSign, Send, UploadCloud } from 'lucide-react'; 

// --- Estructura de Datos Mejorada ---
// { value: number, sent: boolean, isSending: boolean }

const getInitialData = () => {
  try {
    const savedData = localStorage.getItem('qrTransactions');
    if (!savedData) return [];

    const parsedData = JSON.parse(savedData);
    
    return parsedData.map(item => {
      // Manejar la conversión de viejos formatos (solo números) y asegurar flags
      const value = typeof item === 'number' ? item : item.value;
      const sent = item.sent || false;
      
      // Siempre inicializar isSending en false al cargar
      return { value: value, sent: sent, isSending: false }; 
    });
  } catch (error) {
    console.error("Error parsing Qr transactions from localStorage", error);
    return [];
  }
};

const QR = () => {
  const [items, setItems] = useState(getInitialData);
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [sendingBulk, setSendingBulk] = useState(false); // Estado para el envío masivo

  useEffect(() => {
    // Guarda la nueva estructura de objetos en LocalStorage
    localStorage.setItem('qrTransactions', JSON.stringify(items));
  }, [items]);

  const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

  const { totalAmount, operationCount } = useMemo(() => {
    // Accede a item.value para el cálculo
    const total = items.reduce((sum, current) => sum + current.value, 0);
    return { totalAmount: total, operationCount: items.length };
  }, [items]);

  const handleAddItem = (e) => {
    e.preventDefault();
    const newValue = parseFloat(inputValue);
    if (isNaN(newValue) || newValue <= 0) return;
    
    // Nuevo ítem con sent: false y isSending: false
    setItems([{ value: newValue, sent: false, isSending: false }, ...items]);
    setInputValue('');
  };

  const handleDeleteItem = (indexToDelete) => {
    setItems(items.filter((_, index) => index !== indexToDelete));
  };
  
  const handleReset = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar todos los Qr's?")) {
      setItems([]);
    }
  };

  // --- Lógica de Edición ---
  const handleEditClick = (index) => {
    setEditingIndex(index);
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
        // Al modificar, se resetea 'sent' y 'isSending' a false
        return { ...item, value: updatedValue, sent: false, isSending: false };
      }
      return item;
    });
    setItems(updatedItems);
    handleCancelEdit(); 
  };
  
  // 🔄 MODIFICADA: Envío Individual con manejo de 'isSending'
  const handleSendIndividualToN8N = async (indexToSend) => {
    const item = items[indexToSend];
    // Previene si ya fue enviado O si ya está en proceso de envío
    if (item.sent || item.isSending) return; 

    if (!window.confirm(`¿Seguro que quieres enviar el monto ${currencyFormatter.format(item.value)} individualmente a N8N?`)) {
      return;
    }

    // 1. Marcar el ítem como isSending: true
    setItems(items.map((i, idx) => 
      idx === indexToSend ? { ...i, isSending: true } : i
    ));

    try {
      const response = await fetch('http://localhost:5678/webhook-test/arqueoN8N', {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: item.value, 
          source: 'qr', // Tipo de dato para N8N
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el dato individual');
      }

      // 2. Si es exitoso: Marcar como sent: true y isSending: false
      setItems(items.map((i, idx) => 
        idx === indexToSend ? { ...i, sent: true, isSending: false } : i
      ));

      alert("Monto enviado exitosamente a N8N.");
    } catch (error) {
      console.error("Error enviando a N8N:", error);
      alert(`Hubo un error al enviar el dato (${error.message || 'Failed to fetch'}). Intenta nuevamente.`);
      
      // 3. Si falla: Marcar isSending: false, manteniendo sent: false
      setItems(items.map((i, idx) => 
        idx === indexToSend ? { ...i, isSending: false } : i
      ));
    }
  };


  // 🔄 Envío Masivo con manejo de 'sendingBulk' y 'source: qr'
  const handleSendToN8N = async () => {
    if (items.length === 0) {
      alert("No hay valores para enviar.");
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas enviar la lista completa a N8N?")) {
      return;
    }
    
    setSendingBulk(true);

    try {
      const valuesToSend = items.map(item => item.value);

      const response = await fetch('http://localhost:5678/webhook-test/arqueoN8N', {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: valuesToSend,
          totalAmount,
          operationCount,
          source: 'qr', // Tipo de dato para N8N (Bulk)
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar los datos');
      }

      // Éxito: Marca TODOS los ítems como enviados y termina la carga
      const markedAsSent = items.map(item => ({ ...item, sent: true, isSending: false }));
      setItems(markedAsSent);

      alert("Datos enviados exitosamente a N8N.");
    } catch (error) {
      console.error("Error enviando a N8N:", error);
      alert(`Hubo un error al enviar los datos (${error.message || 'Failed to fetch'}). Verifica la conexión a N8N.`);
    } finally {
        setSendingBulk(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <QrCode className="h-8 w-8 text-sky-600" />
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Control de Qr's</h3>
      </div>
      
      {/* Contadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
          <CircleDollarSign className="h-8 w-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monto Total</p>
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
        <input type="number" step="0.01" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ingrese el monto del Qr"
          className="flex-grow p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
        <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
          Cargar Qr
        </button>
      </form>
      
      {/* Listado */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {items.length > 0 ? items.map((item, index) => (
          <div key={index} 
               className={`flex justify-between items-center p-3 rounded-lg animate-fade-in transition-colors 
               ${item.sent ? 'bg-green-50 dark:bg-gray-700/80 border-l-4 border-green-500' : 
                 item.isSending ? 'bg-yellow-50 dark:bg-yellow-800/50 border-l-4 border-yellow-500 animate-pulse' : 
                 'bg-slate-50 dark:bg-gray-700/50'}`}>
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
                          disabled={item.sent || item.isSending}
                          className={`p-1 transition-opacity ${item.sent || item.isSending ? 'text-gray-400 opacity-60 cursor-not-allowed' : 'text-green-500 hover:text-green-700'}`}
                          title={item.sent ? 'QR enviado' : item.isSending ? 'Enviando...' : 'Enviar este QR individualmente'}>
                      {item.isSending ? '...' : <Send size={18} />}
                  </button>
                  {/* BOTÓN DE EDICIÓN (Permite editar y re-enviar) */}
                  <button onClick={() => handleEditClick(index)} className="text-blue-500 hover:text-blue-700 p-1" title="Editar"><Edit size={18} /></button>
                  {/* BOTÓN DE ELIMINAR */}
                  <button onClick={() => handleDeleteItem(index)} className="text-red-500 hover:text-red-700 p-1" title="Eliminar"><Trash2 size={18} /></button>
                </div>
              </>
            )}
          </div>
        )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay Qr cargados.</p>}
      </div>
      
      {items.length > 0 && (
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Limpiar Todo</button>
          
          <button 
            onClick={handleSendToN8N} 
            disabled={sendingBulk}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <UploadCloud size={16} />
            {sendingBulk ? "Enviando..." : "Enviar Valores (Bulk)"}
          </button>
        </div>
      )}
    </div>
  );
};

export default QR;

// Codigo hasta el 13/11/2025

// import { useState, useEffect, useMemo } from 'react';
// import { QrCode, Trash2, Edit, Save, XCircle, ListPlus, CircleDollarSign } from 'lucide-react';

// const getInitialData = () => {
//   try {
//     const savedData = localStorage.getItem('qrTransactions');
//     return savedData ? JSON.parse(savedData) : [];
//   } catch (error) {
//     console.error("Error parsing Qr transactions from localStorage", error);
//     return [];
//   }
// };

// const QR = () => {
//   const [items, setItems] = useState(getInitialData);
//   const [inputValue, setInputValue] = useState('');
  
//   // Estados para la edición
//   const [editingIndex, setEditingIndex] = useState(null);
//   const [editingValue, setEditingValue] = useState('');

//   useEffect(() => {
//     localStorage.setItem('qrTransactions', JSON.stringify(items));
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
//     if (window.confirm("¿Estás seguro de que deseas eliminar todos los Qr's?")) {
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

//   // --- Nueva función para enviar a N8N ---
//   const handleSendToN8N = async () => {
//     if (items.length === 0) {
//       alert("No hay valores para enviar.");
//       return;
//     }

//     if (!window.confirm("¿Estás seguro de que deseas enviar los valores a N8N?")) {
//       return;
//     }

//     try {
//       const response = await fetch('http://localhost:5678/webhook-test/arqueoN8N', {  
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           items,  // Envía la lista de montos
//           totalAmount,  // Opcional: envía el total calculado
//           operationCount,  // Opcional: envía el conteo de operaciones
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Error al enviar los datos');
//       }

//       alert("Datos enviados exitosamente a N8N.");
//       // Opcional: Limpia la lista después de enviar
//       // setItems([]);
//     } catch (error) {
//       console.error("Error enviando a N8N:", error);
//       alert("Hubo un error al enviar los datos. Intenta nuevamente.");
//     }
//   };

//   return (
//     <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
//       <div className="flex items-center gap-3 mb-6">
//         <QrCode className="h-8 w-8 text-sky-600" />
//         <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Control de Qr's</h3>
//       </div>
      
//       {/* Contadores */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//         <div className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center gap-4">
//           <CircleDollarSign className="h-8 w-8 text-green-500" />
//           <div>
//             <p className="text-sm text-gray-500 dark:text-gray-400">Monto Total</p>
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
//         <input type="number" step="0.01" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Ingrese el monto del Qr"
//           className="flex-grow p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500 focus:outline-none" />
//         <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2">
//           Cargar Qr
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
//         )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay Qr cargados.</p>}
//       </div>
      
//       {items.length > 0 && (
//         <div className="mt-6 flex justify-end gap-4">
//           <button onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Limpiar Todo</button>
//           <button onClick={handleSendToN8N} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">Enviar Valores</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QR;