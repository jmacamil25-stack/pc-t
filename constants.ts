
import { Vehicle, BodyStyle } from './types';

export const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Inventory', path: '/inventory' },
  { name: 'Financing', path: '/financing'},
  { name: 'Trade-in', path: '/trade-in' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
];

export const VEHICLES: Vehicle[] = [
  {
    id: 1,
    make: 'Honda',
    model: 'Civic',
    year: 2004,
    price: 4500,
    mileage: 145000,
    bodyStyle: BodyStyle.SEDAN,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1605218427368-35b84d4d6218?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1535732820275-9ffd998cac22?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      engine: '1.7L I-4',
      drivetrain: 'FWD',
      transmission: 'Automatic',
      trim: 'LX',
      vin: '1HGES16524L123456',
      exteriorColor: 'Silver',
      interiorColor: 'Gray',
      horsepower: 115
    }
  },
  {
    id: 2,
    make: 'Honda',
    model: 'Ridgeline',
    year: 2007,
    price: 9800,
    mileage: 155000,
    bodyStyle: BodyStyle.TRUCK,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1655230910408-726e6329e472?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      engine: '3.5L V6',
      drivetrain: 'AWD',
      transmission: 'Automatic',
      trim: 'RTL',
      vin: '2HKYK16457H501234',
      exteriorColor: 'Silver',
      interiorColor: 'Gray',
      horsepower: 247
    }
  },
  {
    id: 3,
    make: 'Honda',
    model: 'Pilot',
    year: 2006,
    price: 7500,
    mileage: 160000,
    bodyStyle: BodyStyle.SUV,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1599318623696-a973d091448b?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519641474000-f46712c9fbca?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      engine: '3.5L V6',
      drivetrain: '4WD',
      transmission: 'Automatic',
      trim: 'EX-L',
      vin: '5FNYF18556B098765',
      exteriorColor: 'Silver',
      interiorColor: 'Gray',
      horsepower: 244
    }
  },
  {
    id: 4,
    make: 'Nissan',
    model: 'Altima',
    year: 2005,
    price: 3900,
    mileage: 135000,
    bodyStyle: BodyStyle.SEDAN,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    specs: {
      engine: '2.5L I-4',
      drivetrain: 'FWD',
      transmission: 'Automatic',
      trim: '2.5 S',
      vin: '1N4AL11D65C123456',
      exteriorColor: 'Black',
      interiorColor: 'Black',
      horsepower: 175
    }
  },
  {
    id: 5,
    make: 'Chevrolet',
    model: 'Tahoe',
    year: 2004,
    price: 6500,
    mileage: 175000,
    bodyStyle: BodyStyle.SUV,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    specs: {
      engine: '5.3L V8',
      drivetrain: '4WD',
      transmission: 'Automatic',
      trim: 'LT',
      vin: '1GNEK13Z54R789012',
      exteriorColor: 'Black',
      interiorColor: 'Beige',
      horsepower: 295
    }
  },
  {
    id: 6,
    make: 'Honda',
    model: 'S2000',
    year: 2004,
    price: 24500,
    mileage: 85000,
    bodyStyle: BodyStyle.COUPE,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1552601979-99e28dc3c9e9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1626296836961-c852dd3d2890?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      engine: '2.2L I-4',
      drivetrain: 'RWD',
      transmission: 'Manual',
      trim: 'Base',
      vin: 'JHMAP21444T001234',
      exteriorColor: 'Silver',
      interiorColor: 'Black',
      horsepower: 237
    }
  },
  {
    id: 7,
    make: 'Toyota',
    model: 'Corolla',
    year: 2006,
    price: 5200,
    mileage: 125000,
    bodyStyle: BodyStyle.SEDAN,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1626847037657-fd3622613ce3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    specs: {
      engine: '1.8L I-4',
      drivetrain: 'FWD',
      transmission: 'Automatic',
      trim: 'LE',
      vin: '1NXBR32E66Z123456',
      exteriorColor: 'Silver',
      interiorColor: 'Tan',
      horsepower: 126
    }
  },
  {
    id: 8,
    make: 'Honda',
    model: 'CR-V',
    year: 2006,
    price: 6800,
    mileage: 140000,
    bodyStyle: BodyStyle.SUV,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1568844293986-8d0400bd4745?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1519641474000-f46712c9fbca?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      engine: '2.4L I-4',
      drivetrain: 'AWD',
      transmission: 'Automatic',
      trim: 'EX',
      vin: 'SHSRD78546U203456',
      exteriorColor: 'Blue',
      interiorColor: 'Black',
      horsepower: 156
    }
  },
  {
    id: 9,
    make: 'Subaru',
    model: 'Impreza',
    year: 2002,
    price: 11000,
    mileage: 155000,
    bodyStyle: BodyStyle.SEDAN,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1622359523773-89945c71a3c7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    specs: {
      engine: '2.0L H-4 Turbo',
      drivetrain: 'AWD',
      transmission: 'Manual',
      trim: 'WRX',
      vin: 'JF1GD70652G345678',
      exteriorColor: 'World Rally Blue',
      interiorColor: 'Black',
      horsepower: 227
    }
  },
  {
    id: 10,
    make: 'BMW',
    model: '325i',
    year: 2003,
    price: 5900,
    mileage: 130000,
    bodyStyle: BodyStyle.SEDAN,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80'
    ],
    featured: false,
    specs: {
      engine: '2.5L I-6',
      drivetrain: 'RWD',
      transmission: 'Automatic',
      trim: 'Base',
      vin: 'WBAEV33423K123456',
      exteriorColor: 'Black',
      interiorColor: 'Black',
      horsepower: 184
    }
  },
  {
    id: 11,
    make: 'Honda',
    model: 'Element',
    year: 2005,
    price: 7200,
    mileage: 165000,
    bodyStyle: BodyStyle.SUV,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      engine: '2.4L I-4',
      drivetrain: 'AWD',
      transmission: 'Automatic',
      trim: 'EX',
      vin: '5J6YH28555L001234',
      exteriorColor: 'Orange',
      interiorColor: 'Black',
      horsepower: 160
    }
  },
  {
    id: 12,
    make: 'Honda',
    model: 'Accord',
    year: 2005,
    price: 4200,
    mileage: 165000,
    bodyStyle: BodyStyle.SEDAN,
    status: 'Available',
    images: [
        'https://images.unsplash.com/photo-1592750437668-98844ba74a90?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80'
    ],
    featured: true,
    specs: {
      engine: '2.4L I-4',
      drivetrain: 'FWD',
      transmission: 'Automatic',
      trim: 'EX',
      vin: '1HGCM56685A123456',
      exteriorColor: 'White',
      interiorColor: 'Beige',
      horsepower: 160
    }
  }
];
