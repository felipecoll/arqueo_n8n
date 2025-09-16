// src/components/Efectivo.jsx
import { useState, useEffect, useMemo } from 'react';
import { Trash2, Calculator } from 'lucide-react';

const denominations = [20000, 10000, 2000, 1000, 500, 200, 100, 50, 20, 10];

// Función para obtener los datos iniciales desde localStorage
const getInitialCounts = () => {
  try {
    const savedCounts = localStorage.getItem('billCounts');
    if (savedCounts) {
      return JSON.parse(savedCounts);
    }
  } catch (error) {
    console.error("Error parsing bill counts from localStorage", error);
  }
  // Si no hay nada guardado, crea un objeto con todas las denominaciones en 0
  return denominations.reduce((acc, denom) => {
    acc[denom] = '';
    return acc;
  }, {});
};

const Efectivo = () => {
  const [counts, setCounts] = useState(getInitialCounts);

  // Efecto para guardar en localStorage cada vez que los conteos cambien
  useEffect(() => {
    localStorage.setItem('billCounts', JSON.stringify(counts));
  }, [counts]);

  // Función para manejar el cambio en los inputs
  const handleCountChange = (denomination, value) => {
    // Permite solo números enteros y positivos
    const newCount = Math.max(0, parseInt(value, 10) || 0);
    setCounts(prevCounts => ({
      ...prevCounts,
      [denomination]: newCount === 0 ? '' : newCount, // Guarda '' si es 0 para un mejor UX en el input
    }));
  };
  
  // Calcula el total general usando useMemo para optimizar
  const totalGeneral = useMemo(() => {
    return denominations.reduce((total, denom) => {
      const count = parseInt(counts[denom], 10) || 0;
      return total + (count * denom);
    }, 0);
  }, [counts]);

  // Función para limpiar todos los campos
  const handleReset = () => {
     const resetCounts = denominations.reduce((acc, denom) => {
      acc[denom] = '';
      return acc;
    }, {});
    setCounts(resetCounts);
  };

  // Formateador para la moneda (ARS - Peso Argentino)
  const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className='flex items-center gap-3'>
            <Calculator className="h-8 w-8 text-sky-600" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Contador de Efectivo</h3>
        </div>
        <div className="text-right">
          <p className="text-gray-500 dark:text-gray-400">Total General</p>
          <p className="text-3xl font-bold text-sky-600 dark:text-sky-400">
            {currencyFormatter.format(totalGeneral)}
          </p>
        </div>
      </div>

      {/* Grilla de Billetes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {denominations.map(denom => {
          const count = counts[denom] || 0;
          const subtotal = count * denom;

          return (
            <div key={denom} className="bg-slate-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Billetes de ${new Intl.NumberFormat('es-AR').format(denom)}
              </label>
              <input
                type="number"
                value={counts[denom]}
                onChange={e => handleCountChange(denom, e.target.value)}
                placeholder="Cantidad"
                className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <div className="mt-2 text-right text-gray-600 dark:text-gray-400 font-medium">
                Subtotal: <span className='text-black dark:text-white'>{currencyFormatter.format(subtotal)}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Botón para Limpiar */}
      <div className="mt-8 text-right">
        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-2 ml-auto bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
          Limpiar Todo
        </button>
      </div>
    </div>
  );
};

export default Efectivo;