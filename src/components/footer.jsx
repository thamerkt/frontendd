import { FaTwitter, FaLinkedinIn, FaFacebookF } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between">
        {/* Logo Section */}
        <div className="mb-6 md:mb-0">
          <div className="text-teal-400 text-4xl font-bold">LFT</div>
        </div>

        {/* Links Section */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* Empresa Section */}
          <div>
            <h3 className="text-lg font-bold mb-3">Empresa</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-white">Soluciones</a></li>
              <li><a href="#" className="hover:text-white">Insights</a></li>
            </ul>
          </div>

          {/* Categorías Section */}
          <div>
            <h3 className="text-lg font-bold mb-3">Categorías</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Contratar Talento</a></li>
              <li><a href="#" className="hover:text-white">Desarrollar Talento</a></li>
              <li><a href="#" className="hover:text-white">Herramientas de Gamificación</a></li>
              <li><a href="#" className="hover:text-white">Competencias Digitales</a></li>
              <li><a href="#" className="hover:text-white">Competencias Comerciales</a></li>
              <li><a href="#" className="hover:text-white">Liderazgo</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-10 border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
        {/* Social Icons */}
        <div className="flex space-x-4">
          <a href="#" className="text-gray-400 hover:text-white">
            <FaTwitter />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <FaLinkedinIn />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <FaFacebookF />
          </a>
        </div>

        {/* Policies */}
        <div className="mt-6 md:mt-0 flex flex-wrap gap-4 text-gray-400 text-sm">
          <a href="#" className="hover:text-white">Política de Privacidad</a>
          <a href="#" className="hover:text-white">Términos y Condiciones</a>
          <a href="#" className="hover:text-white">Código de Conducta</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
