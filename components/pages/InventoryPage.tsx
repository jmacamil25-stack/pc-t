import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../../services/api';
import { Vehicle, BodyStyle } from '../../types';
import VehicleCard from '../VehicleCard';
import VehicleComparisonModal from '../VehicleComparisonModal';
import Button from '../ui/Button';
import { Search, XCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const InventoryPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [makeFilter, setMakeFilter] = useState('');
  const [bodyStyleFilter, setBodyStyleFilter] = useState('');

  const [compareList, setCompareList] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // SEO Title Update - Localized
    document.title = "Used Car Inventory Eugene OR | Trucks, SUVs & Sedans for Sale Lane County";

    const loadData = async () => {
      setLoading(true);
      const data = await api.getVehicles();
      setVehicles(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const makes = useMemo(() => [...new Set(vehicles.map(v => v.make))].sort(), [vehicles]);
  const bodyStyles = Object.values(BodyStyle);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const searchMatch = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase());
      const priceMatch = !priceFilter || (priceFilter === '10000' && vehicle.price < 10000) || (priceFilter === '15000' && vehicle.price >= 10000 && vehicle.price <= 15000) || (priceFilter === '15001' && vehicle.price > 15000);
      const makeMatch = !makeFilter || vehicle.make === makeFilter;
      const bodyStyleMatch = !bodyStyleFilter || vehicle.bodyStyle === bodyStyleFilter;
      return searchMatch && priceMatch && makeMatch && bodyStyleMatch;
    });
  }, [vehicles, searchTerm, priceFilter, makeFilter, bodyStyleFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setPriceFilter('');
    setMakeFilter('');
    setBodyStyleFilter('');
  };
  
  const handleCompareToggle = (id: number) => {
    setCompareList(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length < 4) {
        return [...prev, id];
      }
      alert("You can compare a maximum of 4 vehicles.");
      return prev;
    });
  };

  const handleStartComparison = async () => {
    if (compareList.length < 2) return;
    setIsComparing(true);
    setError(null);
    setAiSummary(null);

    const vehiclesToCompare = vehicles.filter(v => compareList.includes(v.id));
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const vehiclesForPrompt = vehiclesToCompare.map(v => ({
          id: v.id,
          make: v.make,
          model: v.model,
          year: v.year,
          price: v.price,
          mileage: v.mileage,
          engine: v.specs.engine,
          horsepower: v.specs.horsepower,
      }));
      
      const prompt = `
        You are a knowledgeable and helpful car sales assistant.
        A customer is comparing the following vehicles. Provide a concise, easy-to-understand summary that compares them.

        Here are the vehicle details, including horsepower (hp) for performance:
        ${JSON.stringify(vehiclesForPrompt, null, 2)}

        Instructions:
        - Start with a brief overview of the selection.
        - For each car, highlight its key strengths and potential weaknesses in relation to the others. Make sure to compare their performance using the horsepower value.
        - Conclude by suggesting which type of buyer each car might be best for (e.g., "The Civic is ideal for budget-conscious commuters," "The F-150 is the clear choice for heavy-duty work and has surprising power," "The CR-V offers great versatility for a small family.").
        - Keep the tone friendly, neutral, and informative. Do not use overly technical jargon.
        - Format the output as plain text with paragraphs for readability.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      setAiSummary(response.text);
      setIsModalOpen(true);

    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setError("Sorry, we couldn't generate a comparison at this time. Please try again later.");
      setIsModalOpen(true);
    } finally {
      setIsComparing(false);
    }
  };
  
  const vehiclesForModal = vehicles.filter(v => compareList.includes(v.id));

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center text-[#002B60] mb-8">Used Vehicles for Sale in Eugene</h1>
      
      <div className="bg-white p-6 rounded-xl mb-10 shadow-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-5">
            <label htmlFor="search-inventory" className="block text-sm font-medium text-gray-700 mb-1">Search by Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={20} />
              </div>
              <input 
                type="text" 
                id="search-inventory"
                placeholder="e.g., Honda Civic" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent text-gray-900" 
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="price-filter" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <select 
              id="price-filter" 
              value={priceFilter} 
              onChange={e => setPriceFilter(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent"
            >
              <option value="">All Prices</option>
              <option value="10000">Under $10,000</option>
              <option value="15000">$10,000 - $15,000</option>
              <option value="15001">Over $15,000</option>
            </select>
          </div>
          <div>
            <label htmlFor="make-filter" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
            <select 
              id="make-filter" 
              value={makeFilter} 
              onChange={e => setMakeFilter(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent"
            >
              <option value="">All Makes</option>
              {makes.map(make => <option key={make} value={make}>{make}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="body-style-filter" className="block text-sm font-medium text-gray-700 mb-1">Body Style</label>
            <select 
              id="body-style-filter" 
              value={bodyStyleFilter} 
              onChange={e => setBodyStyleFilter(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent"
            >
              <option value="">All Body Styles</option>
              {bodyStyles.map(style => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2 flex justify-end">
             <button onClick={handleResetFilters} className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-[#1E63FF] transition-colors">
              <XCircle size={18}/>
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E63FF] mx-auto"></div>
           <p className="mt-4 text-gray-500">Loading inventory...</p>
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-24">
          {filteredVehicles.map(vehicle => (
            <VehicleCard 
              key={vehicle.id} 
              vehicle={vehicle}
              isSelected={compareList.includes(vehicle.id)}
              onCompareToggle={handleCompareToggle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">No vehicles match your criteria. Please try different filters.</p>
        </div>
      )}

      {compareList.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-xl bg-[#002B60]/90 backdrop-blur-sm p-4 rounded-xl shadow-2xl z-40 flex items-center justify-between animate-slide-up">
          <div className="flex items-center space-x-3">
            <span className="text-white font-bold text-lg">{compareList.length} / 4 Selected</span>
          </div>
          <Button 
            onClick={handleStartComparison}
            disabled={compareList.length < 2 || isComparing}
            className="disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isComparing ? 'Comparing...' : `Compare (${compareList.length})`}
          </Button>
        </div>
      )}

      <VehicleComparisonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicles={vehiclesForModal}
        aiSummary={aiSummary}
        isLoading={isComparing}
        error={error}
      />
    </div>
  );
};

export default InventoryPage;