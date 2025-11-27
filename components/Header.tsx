
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { Menu, X } from 'lucide-react';
import Logo from './ui/Logo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mobileLinkClasses = "text-2xl font-semibold text-gray-800 hover:text-blue-600 transition-colors py-3 text-center";

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg fixed w-full z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <NavLink 
            to="/" 
            className="flex items-center transition-transform duration-300 hover:scale-110 origin-left"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
             <Logo className="h-12 w-auto" />
          </NavLink>
          
          <nav className="hidden md:flex items-center space-x-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({isActive}) => `px-4 py-2 rounded-md text-md font-medium text-gray-700 hover:text-[#1E63FF] hover:bg-blue-50 transition-colors ${isActive ? 'text-[#1E63FF] bg-blue-50' : ''}`}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#002B60]">
              {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white shadow-xl flex flex-col items-center py-4">
          <nav className="flex flex-col space-y-4 w-full">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={mobileLinkClasses}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
