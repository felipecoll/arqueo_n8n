import { useState, useEffect, useMemo } from 'react';
import { ArrowRightLeft, Trash2, Edit, Save, XCircle, ListPlus, CircleDollarSign } from 'lucide-react';

// === Función inicial: cargar datos desde localStorage ===
const getInitialData = () => {
  try {
    const savedData = localStorage.getItem('transferenciaTransactions');
    return savedData ? JSON.parse(savedData) : [];
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

  useEffect(() => {
    localStorage.setItem('transferenciaTransactions', JSON.stringify(items));
  }, [items]);

  const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

  const { totalAmount, operationCount } = useMemo(() => {
    const total = items.reduce((sum, current) => sum + current, 0);
    return { totalAmount: total, operationCount: items.length };
  }, [items]);

  // === AGREGAR ITEM Y ENVIAR A N8N ===
  const handleAddItem = async (e) => {
    e.preventDefault();
    const newValue = parseFloat(inputValue);
    if (isNaN(newValue) || newValue <= 0) return;

    setItems([newValue, ...items]);
    setInputValue('');

    // Enviar a n8n
    try {
      const res = await fetch("https://TU_N8N_URL/webhook/transferencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: new Date().toISOString().split("T")[0], // yyyy-mm-dd
          tipo: "Ingreso",
          medio: "Transferencia",
          monto: newValue,
          observacion: "Carga manual en módulo transferencias"
        })
      });

      if (res.ok) {
        console.log("✅ Transferencia enviada a n8n");
      } else {
        console.error("❌ Error en envío a n8n");
      }
    } catch (error) {
      console.error("⚠️ No se pudo conectar con n8n", error);
    }
  };

  const handleDeleteItem = (indexToDelete) => {
    setItems(items.filter((_, index) => index !== indexToDelete));
  };
  
  const handleReset = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar todos las transferencias?")) {
      setItems([]);
    }
  };

  // === Lógica de edición ===
  const handleEditClick = (index) => {
    setEditingIndex(index);
    setEditingValue(items[index].toString());
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleSaveEdit = async (indexToSave) => {
    const updatedValue = parseFloat(editingValue);
    if (isNaN(updatedValue) || updatedValue <= 0) {
        alert("Por favor, ingresa un valor válido.");
        return;
    }
    const updatedItems = items.map((item, index) => index === indexToSave ? updatedValue : item);
    setItems(updatedItems);
    handleCancelEdit();

    // Enviar actualización a n8n
    try {
      const res = await fetch("https://TU_N8N_URL/webhook/transferencias_update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: new Date().toISOString().split("T")[0],
          tipo: "Ingreso",
          medio: "Transferencia",
          monto: updatedValue,
          observacion: `Edición de valor en índice ${indexToSave}`
        })
      });

      if (res.ok) {
        console.log("✅ Edición enviada a n8n");
      } else {
        console.error("❌ Error al enviar edición a n8n");
      }
    } catch (error) {
      console.error("⚠️ No se pudo conectar con n8n en edición", error);
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
        <input 
          type="number" 
          step="0.01" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          placeholder="Ingresar valor del vale/transf."
          className="flex-grow p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500 focus:outline-none" 
        />
        <button 
          type="submit" 
          className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          Cargar vale/transf.
        </button>
      </form>
      
      {/* Listado */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {items.length > 0 ? items.map((item, index) => (
          <div key={`${index}-${item}`} className="flex justify-between items-center bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg animate-fade-in">
            {editingIndex === index ? (
              // --- VISTA DE EDICIÓN ---
              <div className="flex-grow flex items-center gap-2">
                <input 
                  type="number" 
                  value={editingValue} 
                  onChange={(e) => setEditingValue(e.target.value)} 
                  autoFocus
                  className="w-full p-1 rounded bg-white dark:bg-gray-800 text-lg font-mono focus:ring-1 focus:ring-sky-500 focus:outline-none" 
                />
                <button onClick={() => handleSaveEdit(index)} className="text-green-500 hover:text-green-700 p-1"><Save size={20} /></button>
                <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 p-1"><XCircle size={20} /></button>
              </div>
            ) : (
              // --- VISTA NORMAL ---
              <>
                <span className="font-mono text-lg text-gray-800 dark:text-gray-200">{currencyFormatter.format(item)}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick(index)} className="text-blue-500 hover:text-blue-700 p-1"><Edit size={18} /></button>
                  <button onClick={() => handleDeleteItem(index)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18} /></button>
                </div>
              </>
            )}
          </div>
        )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay vales o transferencias cargadas.</p>}
      </div>
      
      {items.length > 0 && (
        <div className="mt-6 text-right">
          <button 
            onClick={handleReset} 
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Limpiar Todo
          </button>
        </div>
      )}
    </div>
  );
};

export default Transferencias;
