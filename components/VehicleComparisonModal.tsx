import React from 'react';
import { Vehicle } from '../types';
import { X } from 'lucide-react';

interface VehicleComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  aiSummary: string | null;
  isLoading: boolean;
  error: string | null;
}

const VehicleComparisonModal: React.FC<VehicleComparisonModalProps> = ({ isOpen, onClose, vehicles, aiSummary, isLoading, error }) => {
  if (!isOpen) return null;

  const specFields: (keyof Vehicle['specs'] | 'price' | 'mileage' | 'bodyStyle')[] = [
    'price', 'mileage', 'horsepower', 'bodyStyle', 'engine', 'drivetrain', 'transmission', 'trim', 'exteriorColor', 'interiorColor'
  ];

  const formatLabel = (field: string) => {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col animate-pop-in">
        <div className="p-5 border-b sticky top-0 bg-white z-10 flex justify-between items-center flex-shrink-0">
          <h2 className="text-3xl font-bold text-[#002B60]">Vehicle Comparison</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-900 transition-colors transform hover:scale-110"
            aria-label="Close modal"
          >
            <X size={28} />
          </button>
        </div>
        
        <div className="overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1E63FF]"></div>
              <p className="mt-4 text-lg text-gray-600">Our <span className="text-ai-style">AI</span> expert is preparing your comparison...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-8 text-center">
              <div className="p-6 bg-red-100 text-red-800 rounded-lg">
                <h3 className="font-bold text-xl mb-2">An Error Occurred</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {aiSummary && (
                <div className="p-6 bg-blue-50 border-b animate-slide-up">
                  <h3 className="text-xl font-semibold text-[#002B60] mb-3"><span className="text-ai-style">AI</span> Expert Summary</h3>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{aiSummary}</p>
                </div>
              )}
              
              <div className="overflow-x-auto animate-slide-up delay-200">
                <table className="w-full border-collapse text-left min-w-[800px]">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 font-semibold text-sm text-gray-600 uppercase bg-gray-50 sticky left-0 z-10">Feature</th>
                      {vehicles.map(v => (
                        <th key={v.id} className="p-4 font-bold text-lg text-[#002B60] bg-gray-50 border-l sticky top-0 z-10">
                          {v.year} {v.make} {v.model}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-gray-50">
                      <td className="p-4 font-semibold text-gray-600 sticky left-0 bg-gray-50">Image</td>
                      {vehicles.map(v => (
                        <td key={v.id} className="p-2 border-l">
                          <img src={v.images[0]} alt={v.model} className="h-24 w-full object-cover rounded-md hover:scale-110 transition-transform duration-300"/>
                        </td>
                      ))}
                    </tr>
                    {specFields.map(field => (
                      <tr key={field} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-gray-800 sticky left-0 bg-white hover:bg-gray-50">{formatLabel(field)}</td>
                        {vehicles.map(v => {
                           let value;
                           if (field === 'price' || field === 'mileage') {
                               value = v[field].toLocaleString();
                               if (field === 'price') value = `$${value}`;
                           } else if (field === 'bodyStyle') {
                                value = v[field];
                           } else {
                               const specValue = v.specs[field as keyof Vehicle['specs']];
                               if (field === 'horsepower') {
                                   value = `${specValue} hp`;
                               } else {
                                   value = specValue;
                               }
                           }
                           return (
                             <td key={v.id} className="p-3 text-gray-700 border-l">{value}</td>
                           );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleComparisonModal;