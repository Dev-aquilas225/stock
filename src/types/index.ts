export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  type: 'entreprise' | 'particulier';
  companyName?: string;
  nif?: string;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export interface Commission {
  id: string;
  userId: string;
  amount: number;
  level: number;
  date: Date;
  status: 'pending' | 'paid';
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  qrCode: string;
  category: string;
}

export interface Order {
  id: string;
  customerId: string;
  products: Product[];
  total: number;
  status: 'pending' | 'approved' | 'shipped' | 'delivered';
  date: Date;
}