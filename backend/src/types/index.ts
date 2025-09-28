export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'buyer' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  isActive: boolean;
}

export interface SellerProfile {
  uid: string;
  storeName: string;
  storeDescription: string;
  storeLogo?: string;
  storeBanner?: string;
  phone: string;
  address: string;
  city: string;
  rating: number;
  totalSales: number;
  isVerified: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  productCount: number;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  condition: 'new' | 'used' | 'refurbished';
  location: string;
  city: string;
  stock: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  viewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  title: string;
  image: string;
  sellerId: string;
  sellerName: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  postalCode?: string;
}

export interface Review {
  id: string;
  productId: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerPhoto?: string;
  sellerId: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpfulCount: number;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'order' | 'product' | 'review' | 'system' | 'promotion';
  data?: Record<string, string>;
  isRead: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface AuthRequest extends Express.Request {
  user?: {
    uid: string;
    email: string;
    role: string;
  };
}

import Express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string;
        role: string;
      };
    }
  }
}
