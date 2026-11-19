
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle } from '../types';
import { Gauge, Car, Layers, Zap } from 'lucide-react';
import Button from './ui/Button';

interface VehicleCardProps {
  vehicle: Vehicle;
  onCompareToggle?: (id: number) => void;
  isSelected?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onCompareToggle, isSelected = false, style, className = '' }) => {
  const navigate = useNavigate();
  const isSold = vehicle.status === 'Sold';
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handleViewDetails = () => {
    navigate(`/inventory/${vehicle.id}`);
  };

  return (
    <div style={style} className={`bg-white rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:scale-[1.01] animate-slide-up ${className} ${isSold ? 'opacity-80' : ''}`}>
      <div className="relative overflow-hidden h-60 bg-gray-200">
        {/* Sophisticated Skeleton Loader */}
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-0">
            <div className="absolute inset-0 bg-gray-300 animate-pulse"></div>
            <Car className="w-12 h-12 text-gray-400 relative z-10 opacity-50" />
          </div>
        )}

        <img 
          src={vehicle.images[0]} 
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} 
          loading="lazy"
          onLoad={() => setIsImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out 
            ${isSold ? 'grayscale' : 'group-hover:scale-110'} 
            ${isImageLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'}`} 
        />
        
        {!isSold && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 transition-all duration-700 group-hover:opacity-90 group-hover:translate-y-2 group-hover:scale-105"></div>
        )}
        
        {isSold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                <div className="bg-red-600 text-white font-black text-3xl px-6 py-2 transform -rotate-12 border-4 border-white shadow-2xl tracking-widest">
                    SOLD
                </div>
            </div>
        )}

        <div className="absolute top-0 right-0 p-3 z-10">
          {onCompareToggle && !isSold && (
            <button 
              onClick={(e) => { e.stopPropagation(); onCompareToggle(vehicle.id); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isSelected ? 'bg-[#1E63FF] text-white scale-110 shadow-lg' : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:scale-110'}`}
              aria-label={isSelected ? 'Remove from comparison' : 'Add to comparison'}
            >
              <Layers size={20} />
            </button>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
          <h3 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow relative bg-white">
        {isSold ? (
             <p className="text-3xl font-extrabold text-red-600 mb-4">SOLD</p>
        ) : (
             <p className="text-3xl font-extrabold text-[#002B60] mb-4 transition-colors duration-300 group-hover:text-[#1E63FF]">${vehicle.price.toLocaleString()}</p>
        )}
        
        <div className="grid grid-cols-3 gap-x-2 gap-y-2 text-sm text-gray-600 mb-6">
          <div className="flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-[#1E63FF] flex-shrink-0" />
            <span className="truncate">{vehicle.mileage.toLocaleString()} mi</span>
          </div>
          <div className="flex items-center space-x-2">
             <Car className="w-5 h-5 text-[#1E63FF] flex-shrink-0" />
            <span className="truncate">{vehicle.bodyStyle}</span>
          </div>
           <div className="flex items-center space-x-2">
             <Zap className="w-5 h-5 text-[#1E63FF] flex-shrink-0" />
            <span className="truncate">{vehicle.specs.horsepower} hp</span>
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className={`transform transition-all duration-500 ease-out ${isSold ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}>
            <Button onClick={handleViewDetails} variant={isSold ? 'secondary' : 'primary'} className="w-full py-3 shadow-sm hover:shadow-md">
              {isSold ? 'View Archive' : 'View Details'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
