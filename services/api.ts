
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
      
      // Check for error code from API
      if (result.ErrorCode && result.ErrorCode !== "0") {
          throw new Error(result.ErrorText || "VIN not found in NHTSA database.");
      }

      // Ensure we have at least a make or model
      if (!result.Make && !result.Model) {
          throw new Error("VIN decoded successfully but returned no vehicle data.");
      }

      // Map Body Style
      let bodyStyle = BodyStyle.SEDAN; // Default
      const bodyClass = (result.BodyClass || '').toLowerCase();
      if (bodyClass.includes('sport utility') || bodyClass.includes('suv')) bodyStyle = BodyStyle.SUV;
      else if (bodyClass.includes('pickup') || bodyClass.includes('truck')) bodyStyle = BodyStyle.TRUCK;
      else if (bodyClass.includes('coupe')) bodyStyle = BodyStyle.COUPE;
      else if (bodyClass.includes('hatchback')) bodyStyle = BodyStyle.HATCHBACK;

      // Construct Engine String
      const engineParts = [
          result.DisplacementL ? `${result.DisplacementL}L` : null,
          result.EngineCylinders ? `${result.EngineCylinders}-Cyl` : null,
          result.FuelTypePrimary !== 'Gasoline' ? result.FuelTypePrimary : null
      ].filter(Boolean);

      return {
        make: result.Make || '',
        model: result.Model || '',
        year: result.ModelYear ? parseInt(result.ModelYear) : new Date().getFullYear(),
        bodyStyle: bodyStyle,
        specs: {
            engine: engineParts.join(' ') || 'N/A',
            drivetrain: result.DriveType || 'FWD',
            transmission: result.TransmissionStyle || 'Automatic',
            trim: result.Trim || '',
            vin: vin,
            exteriorColor: '', // API doesn't provide color
            interiorColor: '',
            horsepower: result.EngineHP ? parseInt(result.EngineHP) : 0
        }
      };
    } catch (error) {
      console.error("VIN Decode Error:", error);
      throw error;
    }
  },

  // --- LEAD GENERATION ---

  getLeads: async (): Promise<Lead[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return getLeadsData().sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
  },

  submitContactForm: async (data: ContactFormData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const leads = getLeadsData();
    const newLead: Lead = {
        id: Date.now(),
        type: 'Contact',
        customerName: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        dateSubmitted: new Date().toISOString(),
        status: 'New'
    };
    localStorage.setItem(LEADS_KEY, JSON.stringify([...leads, newLead]));
    return true;
  },

  submitTestDrive: async (data: TestDriveData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const leads = getLeadsData();
    
    // Fetch vehicle name for context
    const vehicles = initializeData();
    const vehicle = vehicles.find((v: Vehicle) => v.id === data.vehicleId);
    const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';

    const newLead: Lead = {
        id: Date.now(),
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
    return true;
  },

  submitNewsletter: async (email: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const leads = getLeadsData();
      const newLead: Lead = {
          id: Date.now(),
          type: 'Newsletter',
          customerName: 'Subscriber',
          email: email,
          phone: '',
          message: 'Joined VIP List via Homepage',
          dateSubmitted: new Date().toISOString(),
          status: 'New'
      };
      localStorage.setItem(LEADS_KEY, JSON.stringify([...leads, newLead]));
      return true;
  },

  updateLead: async (lead: Lead): Promise<Lead> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const leads = getLeadsData();
      const updatedLeads = leads.map(l => l.id === lead.id ? lead : l);
      localStorage.setItem(LEADS_KEY, JSON.stringify(updatedLeads));
      return lead;
  },

  deleteLead: async (id: number): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const leads = getLeadsData();
      const updatedLeads = leads.filter(l => l.id !== id);
      localStorage.setItem(LEADS_KEY, JSON.stringify(updatedLeads));
      return true;
  }
};
