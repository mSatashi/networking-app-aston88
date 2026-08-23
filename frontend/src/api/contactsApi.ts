import { request } from './client';
import { Contact, ContactCreateInput, ExtractOCRResponse, RoleGroupResponse } from '../types/contact';

export const contactsApi = {
  /**
   * Upload image file for OCR extraction and DB insertion (handles duplicate detection)
   */
  async extractFromFile(file: File): Promise<ExtractOCRResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return request<ExtractOCRResponse>('/api/contacts/extract-file', {
      method: 'POST',
      body: formData,
      timeoutMs: 60000,
    });
  },

  /**
   * Send image URL for OCR extraction and DB insertion (handles duplicate detection)
   */
  async extractFromUrl(imageUrl: string): Promise<ExtractOCRResponse> {
    return request<ExtractOCRResponse>('/api/contacts/extract-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url: imageUrl }),
      timeoutMs: 60000,
    });
  },

  /**
   * Manually create or save contact
   */
  async createContact(contact: ContactCreateInput): Promise<Contact> {
    return request<Contact>('/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });
  },

  /**
   * List contacts with search and role filters
   */
  async getContacts(params?: { role?: string; company?: string; search?: string }): Promise<Contact[]> {
    const searchParams = new URLSearchParams();
    if (params?.role && params.role !== 'All') {
      searchParams.append('role', params.role);
    }
    if (params?.company) {
      searchParams.append('company', params.company);
    }
    if (params?.search) {
      searchParams.append('search', params.search);
    }

    const qs = searchParams.toString();
    const endpoint = `/api/contacts${qs ? `?${qs}` : ''}`;
    return request<Contact[]>(endpoint);
  },

  /**
   * Grouped contacts by role
   */
  async getContactsByRole(): Promise<RoleGroupResponse[]> {
    return request<RoleGroupResponse[]>('/api/contacts/by-role');
  },

  /**
   * Get single contact detail
   */
  async getContact(id: number): Promise<Contact> {
    return request<Contact>(`/api/contacts/${id}`);
  },

  /**
   * Delete contact
   */
  async deleteContact(id: number): Promise<void> {
    return request<void>(`/api/contacts/${id}`, {
      method: 'DELETE',
    });
  },
};
