// src/components/Content.jsx
import Efectivo from '../pages/Efectivo'; 
import Debitos from '../pages/Debitos';   
import Cheques from '../pages/Cheques';           
import Transferencias from '../pages/Transferencias'; 
import QR from '../pages/QR';      
import Varios from '../pages/Varios';  
import Egresos from '../pages/Egresos';  
import PagosMunicipales from '../pages/PagosMunicipales';               

// Componente de ejemplo para las otras secciones
const PlaceholderContent = ({ sectionName }) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
    <p className="text-gray-600 dark:text-gray-400">
      Seleccione una opcion del menu izquierdo para visualizar aqui su contenido.
       <strong className="font-semibold text-sky-600 dark:text-sky-400">{sectionName}</strong> .- 
    </p> 
  </div>
);

const Content = ({ selectedItem }) => {
  
  const renderContent = () => {
    switch (selectedItem) {
      case 'Efectivo':
        return <Efectivo />;
      case 'Débitos':
        return <Debitos />;
      case 'Cheques':
        return <Cheques />;
      case 'Transferencias':
        return <Transferencias />;
      case 'QR':
        return <QR />;
      case 'Varios':  
        return <Varios />;
      case 'Pagos Municipales': 
        return <PagosMunicipales />;
      case 'Egresos': 
        return <Egresos />;
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