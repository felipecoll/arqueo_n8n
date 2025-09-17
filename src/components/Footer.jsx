// src/components/Footer.jsx
const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 text-center p-4 text-sm text-gray-500 dark:text-gray-400 shadow-inner transition-colors duration-300">
      © {new Date().getFullYear()} Arqueo D - Creado por Philip Labs - Todos los derechos reservados.
    </footer>
  );
};

export default Footer;