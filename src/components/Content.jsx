// src/components/Content.jsx
const Content = ({ selectedItem }) => {
  return (
    <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto transition-colors duration-300">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">{selectedItem}</h2>
      
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <p className="text-gray-600 dark:text-gray-400">
          {/* Color de texto resaltado cambiado a sky-600 */}
          Aquí se mostrará el contenido y los formularios para la sección de <strong className="font-semibold text-sky-600 dark:text-sky-400">{selectedItem}</strong>.
          Próximamente desarrollaremos esta vista.
        </p>
        <div className="h-96"></div>
        <p className="dark:text-gray-400">Final del contenido de ejemplo.</p>
      </div>
    </main>
  );
};

export default Content;