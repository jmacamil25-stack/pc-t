
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../constants';
import { Phone, Mail, MapPin, Maximize, Lock } from 'lucide-react';
import Logo from './ui/Logo';

const Footer: React.FC = () => {
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <footer className="bg-[#002B60] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
             <NavLink to="/" className="inline-block mb-4">
                <Logo className="h-14 w-auto" variant="light" />
            </NavLink>
            <p className="text-gray-300 max-w-xs">Your trusted local dealership for quality, pre-owned vehicles and transparent financing.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-center md:text-left">Quick Links</h3>
            <ul className="space-y-2 flex flex-col items-center md:items-start">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <NavLink to={link.path} className="hover:text-[#1E63FF] transition-colors">
                    {link.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4 text-center md:text-left">Contact Us</h3>
            <ul className="space-y-3 flex flex-col items-center md:items-start">
              <li className="flex items-center space-x-2">
                <MapPin size={20} className="text-[#1E63FF]" />
                <span>456 Highway 99 N, Eugene, OR 97402</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={20} className="text-[#1E63FF]" />
                <span>(541) 555-0199</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={20} className="text-[#1E63FF]" />
                <span>sales@pacificcarsandtrucks.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 flex flex-col sm:flex-row justify-center items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Pacific Cars and Trucks. All Rights Reserved.</p>
          <div className="flex items-center gap-3">
            <button 
                onClick={toggleFullScreen} 
                className="text-xs flex items-center gap-1 text-gray-500 hover:text-white transition-colors px-3 py-1 rounded-full border border-gray-700 hover:border-gray-500"
                title="Toggle Presentation Mode"
            >
                <Maximize size={12} /> Demo Mode
            </button>
            <NavLink 
                to="/admin"
                className="text-xs flex items-center gap-1 text-gray-600 hover:text-white transition-colors px-3 py-1"
            >
                <Lock size={12} /> Dealer Login
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;