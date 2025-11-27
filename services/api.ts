
import { Vehicle, Lead, BodyStyle } from '../types';
import { VEHICLES as INITIAL_DATA } from '../constants';

// STORAGE_KEYS
const INVENTORY_KEY = 'pacific_cars_inventory_v1';
const LEADS_KEY = 'pacific_cars_leads_v1';

// Initialize Inventory Data
const initializeData = () => {
  const stored = localStorage.getItem(INVENTORY_KEY);
  if (!stored) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing local storage", e);
    return INITIAL_DATA;
  }
};

// Initialize Leads Data
const getLeadsData = (): Lead[] => {
  const stored = localStorage.getItem(LEADS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface TestDriveData {
  vehicleId: number;
  customerName: string;
  phone: string;
  email: string;
  date: string;
  time: string;
}

export const api = {
  // --- VEHICLE OPERATIONS ---

  getVehicles: async (): Promise<Vehicle[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return initializeData();
  },

  getVehicleById: async (id: number): Promise<Vehicle | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const vehicles = initializeData();
    return vehicles.find((v: Vehicle) => v.id === id);
  },

  addVehicle: async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const vehicles = initializeData();
    const newId = vehicles.length > 0 ? Math.max(...vehicles.map((v: Vehicle) => v.id)) + 1 : 1;
    const newVehicle = { ...vehicle, id: newId };
    const updatedList = [...vehicles, newVehicle];
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedList));
    return newVehicle;
  },

  updateVehicle: async (vehicle: Vehicle): Promise<Vehicle> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const vehicles = initializeData();
    const updatedList = vehicles.map((v: Vehicle) => (v.id === vehicle.id ? vehicle : v));
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedList));
    return vehicle;
  },

  deleteVehicle: async (id: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const vehicles = initializeData();
    const updatedList = vehicles.filter((v: Vehicle) => v.id !== id);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedList));
    return true;
  },

  resetData: async (): Promise<void> => {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(INITIAL_DATA));
    localStorage.removeItem(LEADS_KEY); // Also clear leads on reset
    window.location.reload();
  },

  // --- VIN DECODER ---
  
  decodeVin: async (vin: string): Promise<Partial<Vehicle>> => {
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`);
      const data = await response.json();
      const result = data.Results[0];

      if (!result) throw new Error("Invalid VIN");

      // Map Body Style
      let bodyStyle = BodyStyle.SEDAN; // Default
      const bodyClass = (result.BodyClass || '').toLowerCase();
      if (bodyClass.includes('sport utility') || bodyClass.includes('suv') || bodyClass.includes('crossover')) bodyStyle = BodyStyle.SUV;
      else if (bodyClass.includes('pickup') || bodyClass.includes('truck')) bodyStyle = BodyStyle.TRUCK;
      else if (bodyClass.includes('coupe')) bodyStyle = BodyStyle.COUPE;
      else if (bodyClass.includes('hatchback')) bodyStyle = BodyStyle.HATCHBACK;
      else if (bodyClass.includes('sedan')) bodyStyle = BodyStyle.SEDAN;

      // Construct Engine String
      let engine = '';
      if (result.DisplacementL) engine += `${result.DisplacementL}L`;
      if (result.EngineCylinders) engine += ` ${result.EngineConfiguration || 'V'}${result.EngineCylinders}`;

      return {
        make: result.Make || '',
        model: result.Model || '',
        year: parseInt(result.ModelYear) || new Date().getFullYear(),
        bodyStyle: bodyStyle,
        specs: {
          engine: engine.trim(),
          drivetrain: result.DriveType || '',
          transmission: result.TransmissionStyle || '',
          trim: result.Trim || '',
          vin: vin,
          // Added missing properties exteriorColor and interiorColor
          exteriorColor: '',
          interiorColor: '',
          horsepower: parseInt(result.EngineHP) || 0
        }
      };
    } catch (e) {
      console.error("VIN Decode Error", e);
      throw e;
    }
  },

  // --- LEAD OPERATIONS (CMS) ---

  /**
   * Fetch all leads for the admin dashboard
   */
  getLeads: async (): Promise<Lead[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return getLeadsData().sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
  },

  /**
   * Delete a lead
   */
  deleteLead: async (id: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const leads = getLeadsData();
    const updatedLeads = leads.filter(l => l.id !== id);
    localStorage.setItem(LEADS_KEY, JSON.stringify(updatedLeads));
    return true;
  },

  /**
   * Simulates submitting a contact form -> Saves to Leads
   */
  submitContactForm: async (data: ContactFormData): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const leads = getLeadsData();
    const newId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;
    
    const newLead: Lead = {
      id: newId,
      type: 'Contact',
      customerName: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
      dateSubmitted: new Date().toISOString(),
      status: 'New'
    };

    localStorage.setItem(LEADS_KEY, JSON.stringify([...leads, newLead]));
    return { success: true };
  },

  /**
   * Simulates submitting a test drive request -> Saves to Leads
   */
  submitTestDrive: async (data: TestDriveData): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get vehicle details for context
    const vehicles = initializeData();
    const vehicle = vehicles.find((v: Vehicle) => v.id === data.vehicleId);
    const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';

    const leads = getLeadsData();
    const newId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 1;

    const newLead: Lead = {
      id: newId,
      type: 'Test Drive',
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      vehicleId: data.vehicleId,
      vehicleName: vehicleName,
      requestedDate: data.date,
      requestedTime: data.time,
      dateSubmitted: new Date().toISOString(),
      status: 'New'
    };

    localStorage.setItem(LEADS_KEY, JSON.stringify([...leads, newLead]));
    return { success: true };
  }
};
