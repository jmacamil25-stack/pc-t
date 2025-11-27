
export enum BodyStyle {
  SEDAN = 'Sedan',
  SUV = 'SUV',
  TRUCK = 'Truck',
  COUPE = 'Coupe',
  HATCHBACK = 'Hatchback',
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  bodyStyle: BodyStyle;
  images: string[];
  featured: boolean;
  description?: string; // New field for custom seller notes
  features?: string[];  // New field for specific features (e.g. "Heated Seats")
  specs: {
    engine: string;
    drivetrain: string;
    transmission: string;
    trim: string;
    vin: string;
    exteriorColor: string;
    interiorColor: string;
    horsepower: number;
  };
}

export type LeadType = 'Contact' | 'Test Drive';

export interface Lead {
  id: number;
  type: LeadType;
  customerName: string;
  email: string;
  phone: string;
  dateSubmitted: string; // ISO String
  status: 'New' | 'Read';
  // Contact Form Specifics
  message?: string;
  // Test Drive Specifics
  vehicleId?: number;
  vehicleName?: string;
  requestedDate?: string;
  requestedTime?: string;
}
