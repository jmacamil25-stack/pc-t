
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Vehicle } from '../../types';
import Button from '../ui/Button';
import { Phone, Calendar, Calculator, CheckCircle, Loader2, Tag, Info, AlertTriangle } from 'lucide-react';
import VehicleCard from '../VehicleCard';
import { api } from '../../services/api';

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(undefined);
  const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [mainImage, setMainImage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', date: '', time: ''
  });
  
  // Calculator State
  const [downPayment, setDownPayment] = useState(1000);
  const [interestRate, setInterestRate] = useState(7.5);
  const [term, setTerm] = useState(60);

  useEffect(() => {
    const loadVehicle = async () => {
      setIsLoading(true);
      if (id) {
        const foundVehicle = await api.getVehicleById(parseInt(id));
        setVehicle(foundVehicle);
        if (foundVehicle) {
            // SEO Dynamic Title
            document.title = `${foundVehicle.year} ${foundVehicle.make} ${foundVehicle.model} for Sale in Eugene OR | Pacific Cars`;
            
            setMainImage(foundVehicle.images[0]);
            // Load similar
            const allVehicles = await api.getVehicles();
            const similar = allVehicles
                .filter(v => v.bodyStyle === foundVehicle.bodyStyle && v.id !== foundVehicle.id && v.status !== 'Sold')
                .slice(0, 3);
            setSimilarVehicles(similar);
        }
      }
      setIsLoading(false);
      window.scrollTo(0,0);
    };
    loadVehicle();
  }, [id]);

  if (isLoading) {
      return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E63FF]"></div></div>;
  }

  if (!vehicle) {
    return <div className="text-center py-20 text-2xl">Vehicle not found.</div>;
  }

  const isSold = vehicle.status === 'Sold';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.submitTestDrive({
        vehicleId: vehicle.id,
        customerName: formData.name,
        phone: formData.phone,
        email: formData.email,
        date: formData.date,
        time: formData.time
      });
      setFormSubmitted(true);
    } catch (error) {
      console.error("Failed to submit test drive request", error);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const specItems = {
      "Mileage": `${vehicle.mileage.toLocaleString()} mi`,
      "Engine": vehicle.specs.engine,
      "Drivetrain": vehicle.specs.drivetrain,
      "Transmission": vehicle.specs.transmission,
      "Trim": vehicle.specs.trim,
      "Exterior Color": vehicle.specs.exteriorColor,
      "Interior Color": vehicle.specs.interiorColor,
      "VIN": vehicle.specs.vin,
      "Horsepower": `${vehicle.specs.horsepower} hp`,
  };

  const getMinDate = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Calculator Logic
  const calculatePayment = () => {
    const principal = vehicle.price - downPayment;
    const monthlyRate = (interestRate / 100) / 12;
    
    if (principal <= 0) return 0;
    
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    
    return isFinite(monthlyPayment) ? Math.round(monthlyPayment) : 0;
  };

  return (
    <div className="bg-gray-50 pb-24 md:pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Images & Specs */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="relative">
                <img src={mainImage} alt="Main vehicle" className={`w-full h-auto rounded-2xl shadow-lg mb-4 object-cover ${isSold ? 'grayscale opacity-75' : ''}`} />
                {isSold && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-red-600 text-white font-black text-5xl sm:text-7xl px-8 py-4 transform -rotate-12 border-8 border-white shadow-2xl tracking-widest opacity-90">
                            SOLD
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-5 gap-2 mb-8">
              {vehicle.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`cursor-pointer rounded-lg border-2 h-16 sm:h-24 w-full object-cover ${mainImage === img ? 'border-[#1E63FF]' : 'border-transparent'} hover:border-[#1E63FF] transition-all duration-200 ${isSold ? 'grayscale' : ''}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>

            {/* Custom Description & Features (CMS Content) */}
            {(vehicle.description || (vehicle.features && vehicle.features.length > 0)) && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 animate-slide-up">
                    {vehicle.description && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#002B60] mb-3 flex items-center">
                                <Info className="mr-2 w-5 h-5 text-[#1E63FF]" /> Seller's Notes
                            </h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
                        </div>
                    )}
                    
                    {vehicle.features && vehicle.features.length > 0 && (
                        <div>
                             <h2 className="text-xl font-bold text-[#002B60] mb-3 flex items-center">
                                <Tag className="mr-2 w-5 h-5 text-[#1E63FF]" /> Key Features
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {vehicle.features.map((feature, idx) => (
                                    <span key={idx} className="bg-blue-50 text-[#002B60] px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
              <h2 className="text-2xl font-bold text-[#002B60] mb-6 border-b pb-4">Vehicle Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                {Object.entries(specItems).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{key}</span>
                    <span className="font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

             {/* Similar Vehicles - Desktop/Tablet Placement */}
             {similarVehicles.length > 0 && (
               <div className="hidden lg:block mt-12">
                  <h3 className="text-2xl font-bold text-[#002B60] mb-6">You Might Also Like</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {similarVehicles.map(v => (
                      <VehicleCard key={v.id} vehicle={v} className="text-sm" />
                    ))}
                  </div>
               </div>
             )}
          </div>

          {/* Right Column: Pricing, Calculator, Form */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 mt-8 lg:mt-0">
            {/* Price Card */}
            <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-[#1E63FF]">
               <h1 className="text-2xl font-bold text-[#002B60] leading-tight mb-2">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
               <p className="text-gray-500 mb-4">{vehicle.specs.trim} • {vehicle.mileage.toLocaleString()} miles</p>
               <div className="flex items-end justify-between mb-6">
                  {isSold ? (
                      <p className="text-4xl font-extrabold text-red-600">SOLD</p>
                  ) : (
                      <p className="text-4xl font-extrabold text-[#1E63FF]">${vehicle.price.toLocaleString()}</p>
                  )}
                  {!isSold && <p className="text-gray-500 text-sm mb-1">plus taxes & fees</p>}
               </div>
               
               {!isSold ? (
                   <div className="space-y-3">
                     <Button onClick={() => document.getElementById('test-drive-form')?.scrollIntoView({behavior: 'smooth'})} className="w-full flex items-center justify-center">
                        <Calendar className="mr-2 h-5 w-5" /> Schedule Test Drive
                     </Button>
                     <Button variant="secondary" className="w-full flex items-center justify-center" onClick={() => window.location.href = "tel:5415550199"}>
                        <Phone className="mr-2 h-5 w-5" /> Call Us Today
                     </Button>
                   </div>
               ) : (
                   <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
                       <p className="text-red-700 font-medium flex items-center justify-center gap-2"><AlertTriangle size={18}/> This vehicle has been sold.</p>
                       <Button variant="secondary" className="w-full mt-4" onClick={() => navigate('/inventory')}>View Available Inventory</Button>
                   </div>
               )}
            </div>

            {/* Payment Calculator Widget */}
            {!isSold && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center space-x-2 mb-4 text-[#002B60]">
                    <Calculator className="h-6 w-6" />
                    <h3 className="text-xl font-bold">Estimate Payment</h3>
                </div>
                
                <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg">
                    <span className="block text-sm text-gray-500 uppercase font-semibold">Est. Monthly</span>
                    <span className="text-4xl font-extrabold text-[#002B60]">${calculatePayment()}</span>
                    <span className="text-sm text-gray-400">/mo</span>
                </div>

                <div className="space-y-4">
                    <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Down Payment</span>
                        <span className="font-semibold">${downPayment.toLocaleString()}</span>
                    </div>
                    <input 
                        type="range" min="0" max={vehicle.price / 2} step="100" 
                        value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))}
                        className="w-full"
                    />
                    </div>
                    <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Credit Score (Rate)</span>
                        <span className="font-semibold">{interestRate}%</span>
                    </div>
                    <input 
                        type="range" min="2.9" max="25" step="0.1" 
                        value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Excellent</span>
                        <span>Poor</span>
                    </div>
                    </div>
                    <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Term</span>
                        <span className="font-semibold">{term} Months</span>
                    </div>
                    <select 
                        value={term} onChange={(e) => setTerm(Number(e.target.value))}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
                    >
                        <option value="36">36 Months</option>
                        <option value="48">48 Months</option>
                        <option value="60">60 Months</option>
                        <option value="72">72 Months</option>
                    </select>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-center text-gray-400">
                    *Estimate only. Actual rate/payment may vary.
                </div>
                </div>
            )}

            {/* Test Drive Form */}
            {!isSold && (
                <div id="test-drive-form" className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="text-xl font-bold text-[#002B60] mb-4">Schedule a Viewing</h3>
                {formSubmitted ? (
                    <div className="text-center py-8 bg-green-50 text-green-800 rounded-lg border border-green-100 animate-fade-in">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <h3 className="text-lg font-semibold mt-2">Request Sent!</h3>
                    <p className="text-sm mt-1">We'll text you shortly to confirm.</p>
                    <button onClick={() => setFormSubmitted(false)} className="mt-4 text-sm text-[#1E63FF] underline">Send another request</button>
                    </div>
                ) : (
                    <form onSubmit={handleFormSubmit} className="space-y-3">
                    <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Full Name" 
                        required 
                        disabled={isSubmitting}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E63FF] outline-none transition-all text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-400" 
                    />
                    <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone Number" 
                        required 
                        disabled={isSubmitting}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E63FF] outline-none transition-all text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-400" 
                    />
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email (Optional)" 
                        disabled={isSubmitting}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E63FF] outline-none transition-all text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-400" 
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                            type="date" 
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            min={getMinDate()} 
                            required 
                            disabled={isSubmitting}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E63FF] outline-none transition-all text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-400" 
                        />
                        <select 
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            required 
                            disabled={isSubmitting}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1E63FF] outline-none transition-all text-sm text-gray-900 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                        <option value="">Time...</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                        </select>
                    </div>
                    <Button type="submit" className="w-full flex justify-center items-center" disabled={isSubmitting}>
                        {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scheduling...
                        </>
                        ) : (
                        'Request Appointment'
                        )}
                    </Button>
                    </form>
                )}
                </div>
            )}
          </div>
        </div>

        {/* Similar Vehicles - Mobile/Tablet Placement */}
        {similarVehicles.length > 0 && (
          <div className="lg:hidden mt-12">
            <h3 className="text-2xl font-bold text-[#002B60] mb-6">You Might Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {similarVehicles.map(v => (
                <VehicleCard key={v.id} vehicle={v} className="text-sm" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Action Bar - Hide if Sold */}
      {!isSold && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden z-50 flex gap-3">
            <Button 
            variant="secondary" 
            className="flex-1 py-3 text-sm flex items-center justify-center"
            onClick={() => window.location.href = 'tel:5415550199'}
            >
            <Phone size={18} className="mr-2" /> Call Now
            </Button>
            <Button 
            className="flex-1 py-3 text-sm flex items-center justify-center"
            onClick={() => document.getElementById('test-drive-form')?.scrollIntoView({behavior: 'smooth'})}
            >
            <Calendar size={18} className="mr-2" /> Test Drive
            </Button>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailPage;
