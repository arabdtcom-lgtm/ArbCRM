
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type LeadStatus = 'New' | 'Contacted' | 'Quoted' | 'Won' | 'Lost';
export type ShipmentStatus = 'Pending' | 'In Transit' | 'At Sea' | 'Customs' | 'Delivered';
export type DetailedCustomsStatus = 'Not Started' | 'Docs Received' | 'Declaration Filed' | 'Inspection' | 'Duty Paid' | 'Released';

export interface ActivityLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'critical';
}

export interface TelemetryPoint {
  time: string;
  temp: number;
  humidity: number;
}

export interface ShipDoc {
  id: string;
  name: string;
  type: string;
  status: 'Verified' | 'Pending' | 'Missing';
  uploadDate: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  companyName?: string;
  email?: string;
  address?: string;
  website?: string;
  facebook?: string;
  linkedin?: string;
  cargoType: string;
  route: string;
  status: LeadStatus;
  date: string;
  salesName: string;
  shippingLine?: string;
  shipmentTrackingNumber?: string;
  notes?: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  customerName: string;
  bookingDate: string;
  bookingNumber: string;
  blNumber: string;
  shippingLine: string;
  shipmentMode: 'Sea' | 'Land' | 'Air';
  shipmentType: 'FCL' | 'LCL';
  shipmentDirection: 'Export' | 'Import';
  containerType: 'Dry' | 'Reefer' | 'Open Top' | 'Flat Rack' | 'High Cube';
  containerSize: '20’' | '40’';
  placeOfLoading: string;
  pol: string;
  pod: string;
  cargoDescription: string;
  loadingDate: string;
  currentLocation: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  shippingDate: string;
  eta: string;
  weightKg?: number;
  salesRep: string;
  currency: 'USD' | 'EGP';
  // Advanced Features
  telemetry?: TelemetryPoint[];
  documents?: ShipDoc[];
  // Inland Transportation Cost Details
  inlandFreight?: number;
  gensetCost?: number;
  officialReceipts?: number;
  overnightStay?: number;
  otherExpenses?: number;
  otherExpensesNotes?: string;
  // Customs Clearance Details
  customsBroker?: string;
  customsDeclarationNumber?: string;
  detailedCustomsStatus?: DetailedCustomsStatus;
  customsNotes?: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  size: ImageSize;
}
