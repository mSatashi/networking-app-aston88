import React, { useState, useEffect } from 'react';
import { User, Briefcase, Building, Mail, Phone, Globe, MapPin, Save, CheckCircle2, RefreshCw } from 'lucide-react';
import { Contact, ContactCreateInput, ROLE_OPTIONS } from '../../types/contact';

interface ReviewFormProps {
  initialData: Partial<Contact>;
  previewUrl: string | null;
  onSave: (contact: ContactCreateInput) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  initialData,
  previewUrl,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<ContactCreateInput>({
    full_name: initialData.full_name || '',
    job_title: initialData.job_title || '',
    role: initialData.role || 'General',
    company: initialData.company || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    mobile: initialData.mobile || '',
    website: initialData.website || '',
    address: initialData.address || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      full_name: initialData.full_name || '',
      job_title: initialData.job_title || '',
      role: initialData.role || 'General',
      company: initialData.company || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      mobile: initialData.mobile || '',
      website: initialData.website || '',
      address: initialData.address || '',
    });
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: previewUrl ? '1fr 1.2fr' : '1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Business Card Image Preview */}
        {previewUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className="form-label">
              <CheckCircle2 size={14} color="#10b981" /> Scanned Business Card
            </label>
            <div
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                boxShadow: 'var(--shadow-md)',
                maxHeight: '340px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={previewUrl}
                alt="Source Business Card"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Check the card text against the extracted fields on the right.
            </p>
          </div>
        )}

        {/* Right Column: Editable Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              placeholder="e.g. Sarah Jenkins"
              required
            />
            {errors.full_name && (
              <span style={{ fontSize: '0.75rem', color: '#f43f5e' }}>{errors.full_name}</span>
            )}
          </div>

          {/* Job Title & Role Grid */}
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
                placeholder="e.g. Chief Technology Officer"
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
              <Building size={14} /> Company / Organization
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.company || ''}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Acme Innovations Inc."
            />
          </div>

          {/* Email & Phone Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                className="form-input"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah@example.com"
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
                placeholder="+1 555 123 4567"
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
              placeholder="https://example.com"
            />
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">
              <MapPin size={14} /> Physical Address
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Tech Blvd, Suite 400, San Francisco, CA"
            />
          </div>
        </div>
      </div>

      {/* Form Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSaving}>
          <RefreshCw size={14} /> Cancel / Scan Another
        </button>
        <button type="submit" className="btn-primary" disabled={isSaving}>
          <Save size={16} /> {isSaving ? 'Saving to Database...' : 'Confirm & Save Contact'}
        </button>
      </div>
    </form>
  );
};
