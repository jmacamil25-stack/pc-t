
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { api } from '../../services/api';
import { Vehicle } from '../../types';
import VehicleCard from '../VehicleCard';
import Button from '../ui/Button';
import TrustBadge from '../ui/TrustBadge';
import Logo from '../ui/Logo';
import { Award, CheckCircle, Handshake, Sparkles, Search, Loader2, Star, Quote, ArrowRight } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);

  const [aiQuery, setAiQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<Vehicle[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // SEO: Update Page Title dynamically for better crawling
    document.title = "Used Cars Eugene OR | Pacific Cars and Trucks | Best Dealership Hwy 99";
    
    const loadData = async () => {
      const data = await api.getVehicles();
      setVehicles(data);
      // Sort by price desc for featured logic, take top 4
      const featured = data.filter(v => v.featured).sort((a, b) => b.price - a.price).slice(0, 4);
      setFeaturedVehicles(featured);
    };
    loadData();
  }, []);

  const examples = [
    { label: "Reliable SUV < $15k", query: "Find me a reliable SUV under $15,000" },
    { label: "Sporty Weekend Car", query: "I want a sporty car for the weekend" },
    { label: "Commuter Sedan", query: "Looking for a fuel efficient commuter sedan" }
  ];

  const reviews = [
    {
      id: 1,
      name: "Sarah Jenkins",
      role: "Eugene Resident",
      text: "Absolute best car buying experience I've ever had in Lane County. The AI search found exactly what I needed in seconds! No pressure, just great service.",
      initials: "SJ"
    },
    {
      id: 2,
      name: "Michael Torres",
      role: "Springfield Local",
      text: "Transparent pricing and no hidden fees. The financing tool was spot on. Pacific Cars made it incredibly easy to get into my dream truck.",
      initials: "MT"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "F-150 Owner",
      text: "Love my new Jeep! The trade-in process was fair and fast. The team was professional and the 'no-haggle' price was actually great.",
      initials: "ER"
    }
  ];

  const performSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    
    setAiQuery(queryText);
    setIsAiSearching(true);
    setHasSearched(true);
    setAiResults([]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const inventoryList = vehicles.map(({ id, make, model, year, price, bodyStyle, specs }) => ({
        id, make, model, year, price, bodyStyle, specs
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
          I am looking for a used car from your dealership in Eugene, OR. 
          My request is: "${queryText}"
          
          Here is the available inventory:
          ${JSON.stringify(inventoryList)}
          
          Please identify the best matching vehicle IDs (maximum 3) based on my request.
          Return the result as a JSON object with a "matchIds" array.
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchIds: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER }
              }
            }
          }
        }
      });
      
      const result = JSON.parse(response.text);
      const matchedVehicles = vehicles.filter(v => result.matchIds?.includes(v.id));
      setAiResults(matchedVehicles);

    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(aiQuery);
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative text-white text-center py-24 md:py-40 bg-gray-800 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center ken-burns"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1553440569-b27b9c180344?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-[#002B60] opacity-80"></div>
        
        {/* Watermark Shadow Logo */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0">
             <div className="opacity-[0.12] transform scale-[1.4] blur-[1px]">
                 <Logo className="w-[90vw] md:w-[800px] h-auto" />
             </div>
        </div>
        
        {/* Restored SUV Animation */}
        <div className="absolute bottom-0 w-full pointer-events-none opacity-60 overflow-hidden hidden md:block z-0" style={{ height: '300px' }}>
            <div className="animate-drive-across absolute bottom-10 left-0 w-64 text-black">
                <svg viewBox="-8 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* Speed Lines */}
                    <path d="M-4 8h4" className="opacity-40" />
                    <path d="M-6 11h8" className="opacity-60" />
                    <path d="M-5 14h6" className="opacity-40" />
                    
                    {/* Car Body */}
                    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                    <circle cx="6.5" cy="16.5" r="2.5" />
                    <circle cx="16.5" cy="16.5" r="2.5" />
                </svg>
            </div>
            <div className="absolute bottom-10 w-full h-0.5 bg-white/20"></div>
        </div>
        
        <div className="relative container mx-auto px-4 z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight animate-slide-in-left">
            Eugene's Premier Used Car Dealership
          </h1>
          <p className="text-xl md:text-3xl font-light mt-6 mb-12 max-w-3xl mx-auto animate-slide-in-right delay-200">
            Serving <strong>Eugene, Springfield, and Lane County</strong> with quality trucks, SUVs, and sedans. Guaranteed financing for all credit types right here on Highway 99.
          </p>
          <div className="flex justify-center animate-pop-in delay-300">
            <Button onClick={() => navigate('/inventory')} className="text-lg px-10 py-5 w-full sm:w-auto transform hover:scale-125 hover:-rotate-1 transition-transform duration-300 shadow-2xl">
              View Inventory in Eugene
            </Button>
          </div>
        </div>
      </section>

      {/* AI Search Section */}
      <section className="py-16 bg-gray-50 border-b border-gray-200 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10 animate-fade-in">
            <div className="inline-flex items-center justify-center p-2 bg-black/10 text-[#1E63FF] rounded-full mb-4 shadow-sm hover:scale-110 transition-transform duration-300">
               <Sparkles size={20} className="mr-2" />
               <span className="font-semibold text-sm"><span className="text-ai-style">AI</span>-Powered Search</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#002B60] mb-4">Find the Perfect Car in <span className="text-ai-style">Oregon</span></h2>
            <p className="text-lg text-gray-600">Tell our AI what you need—budget, daily commute to Springfield, or towing capacity—and we'll find the match.</p>
          </div>

          <form onSubmit={handleAiSearch} className="max-w-2xl mx-auto relative mb-8 animate-pop-in delay-100">
            <div className="absolute -inset-3 bg-black rounded-full blur-lg opacity-30 animate-pulse-fast"></div>
            <div className="relative flex flex-col sm:flex-row gap-2 p-2 bg-white rounded-full shadow-2xl transform transition-all duration-500 hover:scale-[1.03]">
              <div className="flex-grow flex items-center px-6">
                <Search className="text-gray-400 mr-3 w-6 h-6" />
                <input 
                  type="text" 
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g., I need a safe SUV under $15k for driving in Eugene..." 
                  className="w-full py-4 text-gray-700 outline-none placeholder-gray-400 text-xl bg-transparent"
                />
              </div>
              <Button 
                type="submit" 
                variant="gradient" 
                disabled={isAiSearching}
                className="sm:w-auto w-full flex items-center justify-center px-10 rounded-full hover:scale-110 hover:rotate-1"
              >
                {isAiSearching ? <Loader2 className="animate-spin" /> : 'Find My Car'}
              </Button>
            </div>
          </form>

          {/* Clickable Examples - Horizontal Layout */}
          <div className="flex flex-col items-center gap-2 mb-12">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wide animate-fade-in delay-200">Try an example</p>
            <div className="flex flex-row items-center justify-center -space-x-6">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => performSearch(example.query)}
                  className="w-36 h-36 rounded-full bg-[#1E63FF] hover:bg-[#002B60] hover:z-20 text-white font-bold text-sm p-4 shadow-xl flex items-center justify-center text-center transition-all duration-500 animate-pulse-red relative z-10 hover:scale-125 hover:rotate-3 border-4 border-gray-50"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Results Display */}
          {hasSearched && (
             <div className="animate-fade-in">
                {aiResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {aiResults.map((vehicle, index) => (
                             <div key={vehicle.id} style={{ animationDelay: `${index * 150}ms` }} className="animate-slide-up">
                                <VehicleCard vehicle={vehicle} />
                             </div>
                        ))}
                    </div>
                ) : (
                     !isAiSearching && (
                        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-lg mx-auto animate-pop-in">
                            <p className="text-gray-600 text-lg">We couldn't find an exact match for that request, but we have lots of other great cars!</p>
                             <Button onClick={() => navigate('/inventory')} className="mt-4" variant="secondary">Browse All Inventory</Button>
                        </div>
                    )
                )}
             </div>
          )}
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
           <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-[#002B60]">Why Eugene Drivers Choose Us</h2>
            <p className="mt-4 text-lg text-gray-600">We're committed to a transparent, simple, and enjoyable car-buying experience in the Willamette Valley.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <div className="animate-float">
              <TrustBadge icon={<Handshake size={40} />} text="Locally Owned & Operated in Eugene" />
            </div>
            <div className="animate-float delay-200">
              <TrustBadge icon={<Award size={40} />} text="Fair Market Pricing for Oregon" />
            </div>
            <div className="animate-float delay-500">
              <TrustBadge icon={<CheckCircle size={40} />} text="Fast Approvals & Easy Financing" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Inventory - Clean Grid Layout */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#002B60] animate-slide-in-left">
                    Featured Inventory
                </h2>
                <div className="h-1.5 w-24 bg-[#1E63FF] rounded-full mt-2"></div>
                <p className="mt-4 text-gray-600 max-w-lg">
                    Hand-picked selections from our lot. These vehicles represent the best value and quality available in Eugene right now.
                </p>
            </div>
            <Button 
                onClick={() => navigate('/inventory')} 
                variant="secondary"
                className="hidden md:flex items-center mt-6 md:mt-0"
            >
                View All Vehicles <ArrowRight size={18} className="ml-2"/>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredVehicles.length > 0 ? (
                featuredVehicles.map((vehicle, index) => (
                    <div key={vehicle.id} style={{ animationDelay: `${index * 150}ms` }} className="animate-slide-up">
                        <VehicleCard vehicle={vehicle} />
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center text-gray-500 py-10">
                    Loading featured vehicles...
                </div>
            )}
          </div>
          
           <div className="mt-10 md:hidden flex justify-center">
             <Button onClick={() => navigate('/inventory')} variant="secondary" className="w-full">
                View All Vehicles
            </Button>
           </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-blue-50 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-[#002B60]">5-Star Local Reviews</h2>
            <p className="text-lg text-gray-600">Don't just take our word for it. Hear from our happy customers across Eugene and Springfield.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, idx) => (
              <div 
                key={review.id} 
                style={{ animationDelay: `${idx * 150}ms` }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up transform hover:-translate-y-2 relative group"
              >
                <Quote className="absolute top-6 right-6 text-blue-100 w-12 h-12 group-hover:text-blue-200 transition-colors" />
                <div className="flex space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} fill="#FBBF24" color="#FBBF24" size={20} className="drop-shadow-sm" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 italic relative z-10 text-lg leading-relaxed">"{review.text}"</p>
                <div className="flex items-center border-t pt-6 border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1E63FF] to-[#002B60] rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md">
                    {review.initials}
                  </div>
                  <div>
                    <p className="font-bold text-[#002B60] text-lg">{review.name}</p>
                    <p className="text-sm text-[#1E63FF] font-medium">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
