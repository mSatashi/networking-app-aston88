import React, { useState } from 'react';
import { User, Briefcase, Building, Mail, Phone, Globe, MapPin, Save } from 'lucide-react';
import { ContactCreateInput, ROLE_OPTIONS } from '../../types/contact';
import { Modal } from '../common/Modal';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: ContactCreateInput) => Promise<void>;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ContactCreateInput>({
    full_name: '',
    job_title: '',
    role: 'General',
    company: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({
        full_name: '',
        job_title: '',
        role: 'General',
        company: '',
        email: '',
        phone: '',
        mobile: '',
        website: '',
        address: '',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Contact Manually"
      subtitle="Enter contact details to save into the database"
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label">
            <User size={14} /> Full Name <span style={{ color: '#f43f5e' }}>*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="e.g. Alexander Graham"
            required
          />
          {errors.full_name && (
            <span style={{ fontSize: '0.75rem', color: '#f43f5e' }}>{errors.full_name}</span>
          )}
        </div>

        {/* Job Title & Role Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">
              <Briefcase size={14} /> Job Title
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.job_title || ''}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
              placeholder="e.g. Lead Architect"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Category</label>
            <select
              className="form-select"
              value={formData.role || 'General'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Company */}
        <div className="form-group">
          <label className="form-label">
            <Building size={14} /> Company
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.company || ''}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="e.g. Vertex Systems"
          />
        </div>

        {/* Email & Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={14} /> Email
            </label>
            <input
              type="email"
              className="form-input"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="alex@vertex.io"
            />
            {errors.email && (
              <span style={{ fontSize: '0.75rem', color: '#f43f5e' }}>{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <Phone size={14} /> Phone / Mobile
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.phone || formData.mobile || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value, mobile: e.target.value })}
              placeholder="+1 (555) 345-6789"
            />
          </div>
        </div>

        {/* Website */}
        <div className="form-group">
          <label className="form-label">
            <Globe size={14} /> Website
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.website || ''}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://vertex.io"
          />
        </div>

        {/* Address */}
        <div className="form-group">
          <label className="form-label">
            <MapPin size={14} /> Address
          </label>
          <textarea
            className="form-textarea"
            rows={2}
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="456 Innovation Way, Austin, TX"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
          <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            <Save size={15} /> {isSubmitting ? 'Saving...' : 'Save Contact'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
