export interface Contact {
  id?: number;
  full_name: string;
  job_title?: string | null;
  role?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  website?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type ContactCreateInput = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;

export interface ExtractOCRResponse {
  status: 'inserted' | 'duplicate_ignored' | string;
  message: string;
  is_duplicate: boolean;
  contact: Contact;
}

export interface RoleGroupResponse {
  role: string;
  count: number;
  contacts: Contact[];
}

export type OCRStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'failed' | 'timeout';

export interface OCRErrorDetails {
  title: string;
  message: string;
  statusCode?: number;
}

export const ROLE_OPTIONS = [
  'Executive',
  'Management',
  'Engineering',
  'Sales & Marketing',
  'Product & Design',
  'Operations & Admin',
  'General',
] as const;

export type RoleCategory = typeof ROLE_OPTIONS[number] | 'All';
