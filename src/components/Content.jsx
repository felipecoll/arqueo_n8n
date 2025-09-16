// src/components/Content.jsx
import Efectivo from '../pages/Efectivo'; // Importa el nuevo componente

// Componente de ejemplo para las otras secciones
const PlaceholderContent = ({ sectionName }) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
    <p className="text-gray-600 dark:text-gray-400">
      Aquí se mostrará el contenido y los formularios para la sección de <strong className="font-semibold text-sky-600 dark:text-sky-400">{sectionName}</strong>.
      Próximamente desarrollaremos esta vista.
    </p>
  </div>
);


const Content = ({ selectedItem }) => {
  
  // Función para renderizar el componente correcto
  const renderContent = () => {
    switch (selectedItem) {
      case 'Efectivo':
        return <Efectivo />;
      case 'Inicio':
        return <PlaceholderContent sectionName="Inicio" />;
      case 'Transferencias':
        return <PlaceholderContent sectionName="Transferencias" />;
      // ... puedes añadir más casos para cada sección aquí
      default:
        return <PlaceholderContent sectionName={selectedItem} />;
    }
  };

  return (
    <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto transition-colors duration-300">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">{selectedItem}</h2>
      {renderContent()}
    </main>
  );
};

export default Content;