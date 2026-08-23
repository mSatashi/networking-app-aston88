import { Contact } from '../types/contact';

/**
 * Generates a vCard 3.0 string for a contact
 */
export function generateVCard(contact: Contact): string {
  const parts: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.full_name}`,
  ];

  // Name parts (Last, First, Middle)
  const nameParts = contact.full_name.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const firstName = nameParts[0] || '';
  parts.push(`N:${lastName};${firstName};;;`);

  if (contact.company) {
    parts.push(`ORG:${contact.company}`);
  }
  if (contact.job_title) {
    parts.push(`TITLE:${contact.job_title}`);
  }
  if (contact.role) {
    parts.push(`ROLE:${contact.role}`);
  }
  if (contact.email) {
    parts.push(`EMAIL;TYPE=INTERNET,WORK:${contact.email}`);
  }
  if (contact.phone) {
    parts.push(`TEL;TYPE=WORK,VOICE:${contact.phone}`);
  }
  if (contact.mobile) {
    parts.push(`TEL;TYPE=CELL,VOICE:${contact.mobile}`);
  }
  if (contact.website) {
    parts.push(`URL:${contact.website}`);
  }
  if (contact.address) {
    parts.push(`ADR;TYPE=WORK:;;${contact.address.replace(/[\n\r]/g, ' ')};;;;`);
  }

  parts.push('END:VCARD');
  return parts.join('\r\n');
}

/**
 * Triggers browser download of vCard file (.vcf)
 */
export function downloadVCard(contact: Contact): void {
  const vcardContent = generateVCard(contact);
  const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedName = (contact.full_name || 'contact').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.href = url;
  link.setAttribute('download', `${sanitizedName}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers browser download of contacts array as CSV
 */
export function downloadContactsCSV(contacts: Contact[]): void {
  const headers = ['ID', 'Full Name', 'Job Title', 'Role', 'Company', 'Email', 'Phone', 'Mobile', 'Website', 'Address', 'Created At'];
  const rows = contacts.map(c => [
    c.id ?? '',
    `"${(c.full_name || '').replace(/"/g, '""')}"`,
    `"${(c.job_title || '').replace(/"/g, '""')}"`,
    `"${(c.role || '').replace(/"/g, '""')}"`,
    `"${(c.company || '').replace(/"/g, '""')}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.mobile || '').replace(/"/g, '""')}"`,
    `"${(c.website || '').replace(/"/g, '""')}"`,
    `"${(c.address || '').replace(/"/g, '""')}"`,
    `"${(c.created_at || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `CardFlow_Contacts_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
