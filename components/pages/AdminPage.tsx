
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Vehicle, BodyStyle, Lead } from '../../types';
import Button from '../ui/Button';
import { 
    Plus, Edit2, Trash2, Save, X, LogOut, RefreshCw, 
    Car, Upload, Image as ImageIcon, Loader2, AlertTriangle, 
    MessageSquare, Calendar, Inbox, Check, Wand2, Tag,
    LayoutDashboard, DollarSign, TrendingUp, Users, BarChart3,
    ArrowRight, Clock, CheckCircle
} from 'lucide-react';

// Helper for image compression
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; 
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.6)); 
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// --- SUB-COMPONENTS ---

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend?: string; color?: string }> = ({ title, value, icon, trend, color = "bg-blue-500" }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      {trend && <p className="text-xs text-green-600 flex items-center mt-2"><TrendingUp size={12} className="mr-1"/> {trend}</p>}
    </div>
    <div className={`p-3 rounded-lg text-white ${color}`}>
      {icon}
    </div>
  </div>
);

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tabs: 'overview' | 'inventory' | 'leads'
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'leads'>('overview');

  // Inventory State
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const initialVehicleState: Omit<Vehicle, 'id'> = {
    make: '', model: '', year: new Date().getFullYear(), price: 0, mileage: 0,
    bodyStyle: BodyStyle.SEDAN, images: [], featured: false,
    description: '', features: [],
    specs: {
      engine: '', drivetrain: '', transmission: '', trim: '', vin: '',
      exteriorColor: '', interiorColor: '', horsepower: 0
    }
  };
  const [currentVehicle, setCurrentVehicle] = useState<Vehicle | Omit<Vehicle, 'id'>>(initialVehicleState);

  // Leads State
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const checkAuth = localStorage.getItem('admin_auth');
    if (checkAuth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vehicleData, leadsData] = await Promise.all([
        api.getVehicles(),
        api.getLeads()
      ]);
      setVehicles(vehicleData);
      setLeads(leadsData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      localStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
      loadData();
    } else {
      setError('Invalid password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  // --- STATS CALCULATION ---
  const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0);
  const avgPrice = vehicles.length > 0 ? totalValue / vehicles.length : 0;
  const totalLeads = leads.length;
  const recentLeads = leads.slice(0, 5); // First 5
  
  // --- INVENTORY HANDLERS ---

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      await api.deleteVehicle(id);
      loadData();
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setCurrentVehicle({
        ...vehicle,
        description: vehicle.description || '',
        features: vehicle.features || []
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNew = () => {
    setCurrentVehicle(initialVehicleState);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentVehicle(initialVehicleState);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    if (type === 'number') finalValue = Number(value);
    if ((e.target as HTMLInputElement).type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
    }

    if (name === 'vin') {
        finalValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    
    if (name in currentVehicle) {
      setCurrentVehicle(prev => ({
        ...prev,
        [name]: finalValue
      }));
    } else {
      setCurrentVehicle(prev => ({
        ...prev,
        specs: {
          ...prev.specs,
          [name]: finalValue
        }
      }));
    }
  };

  const handleAddFeature = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !newFeature.trim()) return;
    e.preventDefault();
    
    if (!currentVehicle.features?.includes(newFeature.trim())) {
        setCurrentVehicle(prev => ({
            ...prev,
            features: [...(prev.features || []), newFeature.trim()]
        }));
    }
    setNewFeature('');
  };

  const removeFeature = (featureToRemove: string) => {
    setCurrentVehicle(prev => ({
        ...prev,
        features: prev.features?.filter(f => f !== featureToRemove) || []
    }));
  };

  const handleVinDecode = async () => {
    const vin = currentVehicle.specs.vin;
    if (!vin || vin.length !== 17) {
        setError("Please enter a valid 17-character VIN first.");
        return;
    }
    setIsDecoding(true);
    setError(null);
    try {
        const decoded = await api.decodeVin(vin);
        setCurrentVehicle(prev => ({
            ...prev,
            make: decoded.make || prev.make,
            model: decoded.model || prev.model,
            year: decoded.year || prev.year,
            bodyStyle: decoded.bodyStyle || prev.bodyStyle,
            specs: {
                ...prev.specs,
                engine: decoded.specs?.engine || prev.specs.engine,
                drivetrain: decoded.specs?.drivetrain || prev.specs.drivetrain,
                transmission: decoded.specs?.transmission || prev.specs.transmission,
                trim: decoded.specs?.trim || prev.specs.trim,
                horsepower: decoded.specs?.horsepower || prev.specs.horsepower
            }
        }));
    } catch (err: any) {
        setError(err.message || "Could not decode VIN.");
    } finally {
        setIsDecoding(false);
    }
  };

  // Image Handling
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
  };

  const processFiles = async (files: FileList) => {
    setIsLoading(true);
    setError(null);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImage(file);
        newImages.push(compressed);
      }
      setCurrentVehicle(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    } catch (err) {
      setError("Failed to process images. Storage might be full.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setCurrentVehicle(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if ('id' in currentVehicle) await api.updateVehicle(currentVehicle as Vehicle);
      else await api.addVehicle(currentVehicle);
      setIsEditing(false);
      loadData();
    } catch (err) {
      setError("Storage Error: Database full.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetData = async () => {
    if(window.confirm("Restore original demo data? This deletes custom changes.")) {
        await api.resetData();
        loadData();
    }
  };

  // --- LEADS HANDLERS ---
  const handleDeleteLead = async (id: number) => {
    if (window.confirm('Archive this message?')) {
        await api.deleteLead(id);
        loadData();
    }
  };

  // --- RENDER ---

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-[#1E63FF] mb-4">
               <LayoutDashboard size={32} />
            </div>
            <h2 className="text-3xl font-bold text-[#002B60]">Dealer Portal</h2>
            <p className="text-gray-500 mt-2">Secure access for staff only.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E63FF] focus:border-transparent outline-none transition-all"
                placeholder="Enter access code..."
              />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2"><AlertTriangle size={14}/> {error}</p>}
            <Button type="submit" className="w-full py-4 text-lg">Login to Dashboard</Button>
            <div className="text-center mt-6">
                <p className="text-xs text-gray-400">Demo Access: <span className="font-mono bg-gray-100 px-2 py-1 rounded">admin123</span></p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-2 text-[#002B60]">
                <LayoutDashboard size={24} className="text-[#1E63FF]" />
                <span className="font-extrabold text-xl tracking-tight">DEALER<span className="font-light text-gray-400">HUB</span></span>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={handleResetData} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <RefreshCw size={12} /> Reset Demo
                </button>
                <div className="h-6 w-px bg-gray-200"></div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </div>
      </nav>

      {/* Sub-Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 flex gap-8">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${activeTab === 'overview' ? 'border-[#1E63FF] text-[#1E63FF]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                <BarChart3 size={18} /> Overview
            </button>
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${activeTab === 'inventory' ? 'border-[#1E63FF] text-[#1E63FF]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                <Car size={18} /> Inventory <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{vehicles.length}</span>
            </button>
            <button 
                onClick={() => setActiveTab('leads')}
                className={`py-4 px-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-all ${activeTab === 'leads' ? 'border-[#1E63FF] text-[#1E63FF]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
                <Inbox size={18} /> Inbox 
                {leads.length > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs shadow-sm">{leads.length}</span>}
            </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
             <div className="animate-fade-in space-y-8">
                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Inventory Value" 
                        value={`$${totalValue.toLocaleString()}`} 
                        icon={<DollarSign size={24} />} 
                        color="bg-[#1E63FF]"
                        trend="+12% vs last month"
                    />
                     <StatCard 
                        title="Avg. Listing Price" 
                        value={`$${Math.round(avgPrice).toLocaleString()}`} 
                        icon={<Tag size={24} />} 
                        color="bg-emerald-500"
                    />
                     <StatCard 
                        title="Active Leads" 
                        value={totalLeads.toString()} 
                        icon={<Users size={24} />} 
                        color="bg-purple-500"
                        trend="3 new today"
                    />
                     <StatCard 
                        title="Vehicles in Stock" 
                        value={vehicles.length.toString()} 
                        icon={<Car size={24} />} 
                        color="bg-orange-500"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-[#002B60]">Recent Inbox Activity</h3>
                            <button onClick={() => setActiveTab('leads')} className="text-sm text-[#1E63FF] hover:underline flex items-center">View All <ArrowRight size={14} className="ml-1"/></button>
                        </div>
                        <div className="space-y-4">
                            {recentLeads.length > 0 ? recentLeads.map(lead => (
                                <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${lead.type === 'Test Drive' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                            {lead.type === 'Test Drive' ? <Calendar size={18}/> : <MessageSquare size={18}/>}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{lead.customerName}</p>
                                            <p className="text-xs text-gray-500">{lead.type} • {new Date(lead.dateSubmitted).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {lead.type === 'Test Drive' && <span className="text-xs font-medium text-[#1E63FF] block">{lead.vehicleName}</span>}
                                        <button onClick={() => handleDeleteLead(lead.id)} className="text-xs text-gray-400 hover:text-red-500 mt-1">Archive</button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-400 italic text-center py-8">No recent activity.</p>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                         <h3 className="text-lg font-bold text-[#002B60] mb-6">Quick Actions</h3>
                         <div className="space-y-3">
                             <button onClick={() => { setActiveTab('inventory'); handleAddNew(); }} className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                                 <span>Add New Vehicle</span>
                                 <Plus size={18} />
                             </button>
                             <button onClick={() => window.open('/#/inventory', '_blank')} className="w-full flex items-center justify-between p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                                 <span>View Live Website</span>
                                 <LayoutDashboard size={18} />
                             </button>
                             <button onClick={() => setActiveTab('leads')} className="w-full flex items-center justify-between p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                                 <span>Check Unread Messages</span>
                                 <div className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{leads.length}</div>
                             </button>
                         </div>
                         
                         <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100">
                             <h4 className="text-amber-800 font-bold text-sm mb-1 flex items-center gap-2"><AlertTriangle size={14}/> System Status</h4>
                             <p className="text-xs text-amber-700">Storage Usage: Low. All systems operational. Connected to Demo API.</p>
                         </div>
                    </div>
                </div>
             </div>
        )}

        {/* --- INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
            <>
                {isEditing ? (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-5xl mx-auto animate-fade-in">
                    <div className="flex justify-between items-center mb-8 border-b pb-6">
                        <div>
                             <h2 className="text-2xl font-bold text-[#002B60]">
                                {'id' in currentVehicle ? 'Edit Vehicle Details' : 'Add New Inventory'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">Complete the form below to publish to the live site.</p>
                        </div>
                        <button onClick={handleCancel} className="text-gray-400 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        {error}
                    </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* VIN Input - Manual + Decode */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <label className="block text-sm font-bold text-[#002B60] mb-2">Start with VIN (Optional)</label>
                        <div className="flex gap-3">
                            <div className="relative flex-grow">
                                <input 
                                    name="vin" 
                                    value={currentVehicle.specs.vin} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter 17-digit VIN..." 
                                    className="w-full p-3 pl-4 border rounded-lg uppercase font-mono tracking-wider focus:ring-2 focus:ring-[#1E63FF] outline-none" 
                                    maxLength={17}
                                />
                            </div>
                            <Button 
                                type="button" 
                                onClick={handleVinDecode} 
                                disabled={isDecoding || !currentVehicle.specs.vin}
                                className="flex-shrink-0"
                            >
                                {isDecoding ? <Loader2 className="animate-spin" /> : <><Wand2 className="w-4 h-4 mr-2" /> Auto-Fill</>}
                            </Button>
                        </div>
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1"><CheckCircle size={12}/> Connected to NHTSA Database</p>
                    </div>

                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Vehicle Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <input required type="number" name="year" value={currentVehicle.year} onChange={handleInputChange} className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                                <input required name="make" value={currentVehicle.make} onChange={handleInputChange} className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Ford" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                <input required name="model" value={currentVehicle.model} onChange={handleInputChange} className="w-full p-3 border rounded-lg bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. F-150" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                                    <input required type="number" name="price" value={currentVehicle.price} onChange={handleInputChange} className="w-full p-3 pl-7 border rounded-lg font-bold text-gray-900" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
                                <input required type="number" name="mileage" value={currentVehicle.mileage} onChange={handleInputChange} className="w-full p-3 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Body Style</label>
                                <select name="bodyStyle" value={currentVehicle.bodyStyle} onChange={handleInputChange} className="w-full p-3 border rounded-lg bg-white">
                                    {Object.values(BodyStyle).map(style => (
                                    <option key={style} value={style}>{style}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Specs */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Technical Specs</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500 uppercase font-bold">Engine</label>
                                <input name="engine" value={currentVehicle.specs.engine} onChange={handleInputChange} placeholder="e.g. 5.0L V8" className="w-full p-2 border rounded mt-1" />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500 uppercase font-bold">Transmission</label>
                                <input name="transmission" value={currentVehicle.specs.transmission} onChange={handleInputChange} placeholder="Automatic" className="w-full p-2 border rounded mt-1" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Drivetrain</label>
                                <input name="drivetrain" value={currentVehicle.specs.drivetrain} onChange={handleInputChange} placeholder="AWD/4WD" className="w-full p-2 border rounded mt-1" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Trim</label>
                                <input name="trim" value={currentVehicle.specs.trim} onChange={handleInputChange} placeholder="XLT" className="w-full p-2 border rounded mt-1" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Ext. Color</label>
                                <input name="exteriorColor" value={currentVehicle.specs.exteriorColor} onChange={handleInputChange} placeholder="Black" className="w-full p-2 border rounded mt-1" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Horsepower</label>
                                <input type="number" name="horsepower" value={currentVehicle.specs.horsepower} onChange={handleInputChange} placeholder="400" className="w-full p-2 border rounded mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* Marketing & Features */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Marketing Copy</h3>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seller's Description</label>
                            <textarea 
                                name="description" 
                                value={currentVehicle.description || ''} 
                                onChange={handleInputChange} 
                                rows={6}
                                placeholder="Tell a story about this car..."
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#1E63FF] outline-none"
                            />
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Key Features</h3>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    value={newFeature} 
                                    onChange={(e) => setNewFeature(e.target.value)} 
                                    onKeyDown={handleAddFeature}
                                    placeholder="Add feature (e.g. Sunroof)" 
                                    className="flex-grow p-3 border rounded-lg"
                                />
                                <Button type="button" onClick={handleAddFeature} variant="secondary" className="px-6">Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl min-h-[100px] content-start">
                                {currentVehicle.features?.map((feature, idx) => (
                                    <span key={idx} className="bg-white text-[#002B60] px-3 py-1 rounded-full text-sm flex items-center gap-2 border shadow-sm">
                                        {feature}
                                        <button type="button" onClick={() => removeFeature(feature)} className="text-gray-400 hover:text-red-500">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                                {(!currentVehicle.features || currentVehicle.features.length === 0) && (
                                    <span className="text-gray-400 text-sm italic w-full text-center py-2">No features added yet.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Vehicle Photos</h3>
                        
                        <div 
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${dragActive ? 'border-[#1E63FF] bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-[#1E63FF] hover:bg-gray-50'}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        >
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                        <div className="flex flex-col items-center justify-center text-gray-500">
                            <div className={`p-4 rounded-full bg-blue-50 mb-3 ${dragActive ? 'bg-blue-200' : ''}`}>
                                <Upload size={32} className="text-[#1E63FF]" />
                            </div>
                            <p className="text-xl font-bold text-[#002B60]">Drag & Drop Photos Here</p>
                            <p className="text-sm mt-1">or click to browse your computer</p>
                            <p className="text-xs mt-4 text-gray-400 bg-white px-3 py-1 rounded-full border">Auto-compressed for web optimization</p>
                        </div>
                        </div>

                        {currentVehicle.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                            {currentVehicle.images.map((img, idx) => (
                            <div key={idx} className="relative group aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border shadow-sm">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transform hover:scale-110 transition-all"
                                    >
                                    <Trash2 size={18} />
                                    </button>
                                </div>
                                {idx === 0 && (
                                <div className="absolute top-2 left-2 bg-[#1E63FF] text-white text-xs px-2 py-1 rounded shadow-sm font-bold">
                                    Cover Photo
                                </div>
                                )}
                            </div>
                            ))}
                        </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 border-t pt-6 sticky bottom-0 bg-white p-4 -mx-8 -mb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                        <Button type="button" variant="secondary" onClick={handleCancel} className="px-8">Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="px-10">
                        {isLoading ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 w-4 h-4" /> Save & Publish</>}
                        </Button>
                    </div>
                    </form>
                </div>
                ) : (
                <div className="animate-fade-in space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Vehicle Inventory</h2>
                        <Button onClick={handleAddNew} className="flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                            <Plus className="mr-2" /> Add Vehicle
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Vehicle Details</th>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Pricing</th>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Stats</th>
                            <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {vehicles.map(vehicle => (
                            <tr key={vehicle.id} className="hover:bg-blue-50/50 transition-colors group">
                                <td className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300 shadow-sm relative">
                                    {vehicle.images[0] ? (
                                        <img src={vehicle.images[0]} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400"><ImageIcon size={20}/></div>
                                    )}
                                    {vehicle.featured && <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl-lg"></div>}
                                    </div>
                                    <div>
                                    <div className="font-bold text-[#002B60] text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-1">{vehicle.specs.vin || 'NO VIN'}</div>
                                    </div>
                                </div>
                                </td>
                                <td className="p-5">
                                    <div className="font-bold text-gray-900 text-lg">${vehicle.price.toLocaleString()}</div>
                                    <div className="text-xs text-green-600 font-medium">Market: Good</div>
                                </td>
                                <td className="p-5">
                                    <div className="text-sm text-gray-600 flex items-center gap-2"><Clock size={14}/> {vehicle.mileage.toLocaleString()} miles</div>
                                    <div className="text-sm text-gray-600 flex items-center gap-2 mt-1"><Tag size={14}/> {vehicle.bodyStyle}</div>
                                </td>
                                <td className="p-5 text-right">
                                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                    onClick={() => handleEdit(vehicle)}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Edit"
                                    >
                                    <Edit2 size={18} />
                                    </button>
                                    <button 
                                    onClick={() => handleDelete(vehicle.id)}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete"
                                    >
                                    <Trash2 size={18} />
                                    </button>
                                </div>
                                </td>
                            </tr>
                            ))}
                            {vehicles.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-16 text-center text-gray-400">
                                    <div className="inline-block p-4 bg-gray-100 rounded-full mb-4"><Car size={32}/></div>
                                    <p>No vehicles in stock. Add your first car above!</p>
                                </td>
                            </tr>
                            )}
                        </tbody>
                        </table>
                    </div>
                    </div>
                </div>
                )}
            </>
        )}

        {/* --- LEADS TAB --- */}
        {activeTab === 'leads' && (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Inbox & Leads</h2>
                    <div className="text-sm text-gray-500">Showing all active inquiries</div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                                    <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Customer</th>
                                    <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider">Inquiry Details</th>
                                    <th className="p-5 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {leads.map(lead => (
                                    <tr key={lead.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="p-5">
                                            <div className="flex flex-col gap-2">
                                                 <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${lead.type === 'Test Drive' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                    {lead.type === 'Test Drive' ? <Calendar size={12} /> : <MessageSquare size={12} />}
                                                    {lead.type}
                                                </span>
                                                <span className="text-xs text-gray-400 pl-1">{new Date(lead.dateSubmitted).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="font-bold text-[#002B60] text-lg">{lead.customerName}</div>
                                            <div className="text-sm text-gray-500 mt-1">{lead.email}</div>
                                            <div className="text-sm text-gray-500">{lead.phone}</div>
                                        </td>
                                        <td className="p-5">
                                            {lead.type === 'Test Drive' ? (
                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 inline-block min-w-[200px]">
                                                    <p className="font-bold text-[#1E63FF] text-sm mb-1">{lead.vehicleName}</p>
                                                    <p className="text-xs text-gray-600 flex items-center gap-1"><Clock size={12}/> {lead.requestedDate} @ {lead.requestedTime}</p>
                                                </div>
                                            ) : (
                                                <div className="max-w-md bg-gray-50 p-3 rounded-lg border border-gray-200 italic text-gray-700 text-sm">
                                                    "{lead.message}"
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-right">
                                            <button 
                                                onClick={() => handleDeleteLead(lead.id)}
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-600 hover:text-green-600 hover:border-green-500 hover:bg-green-50 rounded-lg transition-all flex items-center gap-2 ml-auto shadow-sm"
                                                title="Mark as Done / Archive"
                                            >
                                                <Check size={16} /> Mark Done
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {leads.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-gray-400">
                                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                                                <Inbox size={40} className="text-gray-300"/>
                                            </div>
                                            <p className="text-lg font-medium text-gray-600">All caught up!</p>
                                            <p className="text-sm">No active leads in your inbox.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;
