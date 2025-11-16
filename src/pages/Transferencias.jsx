import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ArrowRightLeft, Trash2, Edit, Save, XCircle, 
  ListPlus, CircleDollarSign, UploadCloud, Send, CheckCircle
} from 'lucide-react';

// --- Estructura de Datos Mejorada ---
// { value: number, sent: boolean, isSending: boolean }

const getInitialData = () => {
  try {
    const savedData = localStorage.getItem('transferenciaTransactions');
    if (!savedData) return [];

    const parsedData = JSON.parse(savedData);
    
    return parsedData.map(item => {
      const value = typeof item === 'number' ? item : item.value;
      const sent = item.sent || false;
      return { value: value, sent: sent, isSending: false };
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

  // --- NUEVO ESTADO PARA NOTIFICACIÓN PUSH SIMULADA ---
  const [notification, setNotification] = useState(null);

  // Función para mostrar la notificación
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500); // La notificación desaparece después de 3.5 segundos
  }, []);

  useEffect(() => {
    localStorage.setItem('transferenciaTransactions', JSON.stringify(items));
  }, [items]);

  const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

  const { totalAmount, operationCount } = useMemo(() => {
    const total = items.reduce((sum, current) => sum + current.value, 0);
    return { totalAmount: total, operationCount: items.length };
  }, [items]);

  const handleAddItem = (e) => {
    e.preventDefault();
    const newValue = parseFloat(inputValue);
    if (isNaN(newValue) || newValue <= 0) return;
    
    setItems([{ value: newValue, sent: false, isSending: false }, ...items]);
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

  // --- Lógica de Edición (sin cambios) ---
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
        return { ...item, value: updatedValue, sent: false, isSending: false };
      }
      return item;
    });
    setItems(updatedItems);
    handleCancelEdit(); 
  };
  
  // 🔄 MODIFICADA: Envío Individual (Sin confirmación, con notificación de éxito)
  const handleSendIndividualToN8N = async (indexToSend) => {
    const item = items[indexToSend];
    if (item.sent || item.isSending) return; 

    // 1. Marcar el ítem como isSending: true
    setItems(items.map((i, idx) => 
      idx === indexToSend ? { ...i, isSending: true } : i
    ));

    try {
      const response = await fetch("http://localhost:5678/webhook-test/arqueoN8N", {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: item.value, 
          operacion: "individual",
          source: 'transferencia',
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar el dato individual');
      }

      // 2. Si el envío es exitoso: actualiza sent: true y isSending: false
      setItems(items.map((i, idx) => 
        idx === indexToSend ? { ...i, sent: true, isSending: false } : i
      ));

      // Reemplaza alert por la notificación simulada
      showNotification(`Transferencia de ${currencyFormatter.format(item.value)} enviada.`, 'success');

    } catch (error) {
      console.error("Error enviando a n8n:", error);
      // Mantiene el alert para el error, como se solicitó
      alert(`⚠️ ERROR: No se pudo enviar el monto individual. Verifica la conexión a N8N. Detalle: ${error.message}`);
      
      // 3. Si falla: Marcar isSending: false
      setItems(items.map((i, idx) => 
        idx === indexToSend ? { ...i, isSending: false } : i
      ));
    }
  };


  // 🔄 MODIFICADA: Envío Bulk (Sin confirmación, con notificación de éxito)
  const handleSendToN8N = async () => {
    if (items.length === 0) return;
    
    // Eliminada la confirmación con window.confirm

    setSending(true);

    try {
      const valuesToSend = items.map(item => item.value);

      const response = await fetch("http://localhost:5678/webhook-test/arqueoN8N", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transferencias: valuesToSend,
          total: totalAmount,
          operaciones: operationCount,
          source: 'transferencia',
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar datos a n8n");
      }

      // Éxito: Marca TODOS los ítems como enviados
      const markedAsSent = items.map(item => ({ ...item, sent: true, isSending: false }));
      setItems(markedAsSent);

      // Reemplaza alert por la notificación simulada
      showNotification("Envío masivo de transferencias completado.", 'success');

    } catch (error) {
      console.error("Error enviando a n8n:", error);
      // Mantiene el alert para el error, como se solicitó
      alert(`⚠️ ERROR: No se pudo completar el envío masivo. Verifica la conexión a N8N. Detalle: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg relative">
      {/* --- NOTIFICACIÓN PUSH SIMULADA (Renderizado) --- */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center gap-3 transition-transform transform duration-500 ease-out 
          ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
          ${notification ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ minWidth: '300px' }}
        >
          <CheckCircle className="h-6 w-6" />
          <p className="font-semibold">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-auto opacity-75 hover:opacity-100 font-bold">X</button>
        </div>
      )}
      {/* --- FIN NOTIFICACIÓN --- */}

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
                          title={item.sent ? 'Transferencia enviada' : item.isSending ? 'Enviando...' : 'Enviar esta transf. individualmente'}>
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
        )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay vales o transferencias cargadas.</p>}
      </div>
      
      {/* Botones de acciones */}
      {items.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
          <button onClick={handleReset} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
            Limpiar Todo
          </button>
          <button 
            onClick={handleSendToN8N} 
            disabled={sending}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <UploadCloud size={18} />
            {sending ? "Enviando..." : "Enviar a n8n (Bulk)"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Transferencias;