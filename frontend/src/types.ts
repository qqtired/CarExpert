export type InspectionStatus =
  | 'NEW'
  | 'WAITING_FOR_EXPERT'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'REPORT_IN_PROGRESS'
  | 'DONE'
  | 'CANCELLED';

export type SelectionStatus =
  | 'NEW'
  | 'WAITING_FOR_EXPERT'
  | 'ASSIGNED'
  | 'SOURCING'
  | 'CANDIDATES_SENT'
  | 'INSPECTIONS'
  | 'WAITING_FOR_DECISION'
  | 'DEAL_FLOW'
  | 'DONE'
  | 'CANCELLED';

export interface ChecklistItem {
  id: string;
  label: string;
  type: 'boolean' | 'enum' | 'text' | 'number';
  options?: { value: string; label: string }[];
  severityEnabled?: boolean;
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  version: string;
  sections: ChecklistSection[];
}

export interface Report {
  id: string;
  inspectionOrderId: string;
  templateId: string;
  data: Record<string, unknown>;
  severities?: Record<string, 'OK' | 'WARN' | 'BAD'>;
  summary: string;
  recommendedDiscount?: { min: number; max: number; comment: string };
  webUrl?: string;
  pdfUrl?: string;
  legalCheck?: LegalCheck;
  media?: { photos?: string[]; videos?: string[] };
}

export interface ClientRef {
  name: string;
  phone: string;
  email?: string;
}

export interface InspectionOrder {
  id: string;
  status: InspectionStatus;
  sourceUrl: string;
  parsedData: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    price: number | null;
    city: string;
  };
  city: string;
  client: ClientRef;
  sellerContact?: string;
  priceSegment: string;
  summary: string;
  expertId: string | null;
  appointmentAt: string | null;
  address?: string;
  tariffId?: string;
  createdAt: string;
  updatedAt: string;
  selectionOrderId?: string | null;
  report?: Report | null;
}

export interface SelectionOrder {
  id: string;
  status: SelectionStatus;
  city: string;
  cityFrom?: string;
  cityTarget?: string;
  client: ClientRef;
  budget: string;
  budgetMin?: number;
  budgetMax?: number;
  requirements: string;
  deadline?: string;
  inspectionIds: string[];
  candidates?: Candidate[];
  tariffId?: string;
  addonTariffId?: string;
  includedInspections?: number;
  extraInspections?: number;
  result?: { type: 'BOUGHT' | 'NOT_BOUGHT' | 'NO_MATCH'; description: string };
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  sourceUrl: string;
  make: string;
  model: string;
  year: number;
  body?: string;
  mileage: number;
  price: number;
  city: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  summary?: string;
  inspectionId?: string;
  legalCheck?: LegalCheck;
}

export interface LegalCheck {
  pledge?: 'OK' | 'RISK' | 'BAD';
  restrictions?: 'OK' | 'RISK' | 'BAD';
  ownersCount?: number;
  fines?: 'OK' | 'RISK' | 'BAD';
  notes?: string;
}

export interface Expert {
  id: string;
  name: string;
  phone: string;
  email?: string;
  cities: string[];
  brands: string[];
  generations?: string[];
  rating: number;
  completedInspections: number;
  cancelRate: number;
  active: boolean;
  notes?: string;
  specialization?: 'body' | 'engine' | 'electric' | 'universal';
  services?: ('inspection' | 'selection' | 'deal_support')[];
  travelRadiusKm?: number;
  baseArea?: string;
  brandTags?: string[];
  skillTags?: string[];
  loadToday?: 'free' | 'busy' | 'overloaded';
  avgReportHours?: number;
  avgResponseMinutes?: number;
  last30dInspections?: number;
  recommendRatio?: number;
}

export interface Tariff {
  id: string;
  priceSegment: string;
  amount: number | 'custom';
  comment?: string;
  kind: 'inspection' | 'selection';
}

export type ChatAuthor = 'service' | 'client' | 'expert' | 'system';

export interface ChatMessage {
  id: string;
  from: ChatAuthor;
  text: string;
  createdAt: string;
  actions?: { label: string; reply?: string }[];
}

export interface ChatThread {
  id: string;
  participant: ClientRef;
  inspectionId?: string;
  selectionId?: string;
  messages: ChatMessage[];
}
