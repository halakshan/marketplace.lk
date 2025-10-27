export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  phone?: string;
  city?: string;
  address?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  subcategories: string[];
  adCount: number;
  isActive: boolean;
}

export interface Ad {
  id: string;
  userId: string;
  posterName: string;
  posterPhone: string;
  posterWhatsapp?: string;
  title: string;
  description: string;
  price: number | null;
  priceNegotiable: boolean;
  category: string;
  categoryName: string;
  subcategory: string;
  condition: 'new' | 'used';
  images: string[];
  city: string;
  district: string;

  // Vehicle specific
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;

  // Property specific
  bedrooms?: number;
  bathrooms?: number;
  floorArea?: number;
  furnishing?: string;
  propertyType?: string;

  // Land specific
  landArea?: number;

  // General
  brand?: string;

  views: number;
  status: 'active' | 'sold' | 'expired' | 'deleted';
  isFeatured: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: any;
}
