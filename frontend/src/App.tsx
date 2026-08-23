import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { StatsHeader } from './components/contacts/StatsHeader';
import { SearchBar } from './components/contacts/SearchBar';
import { RoleFilterTabs } from './components/contacts/RoleFilterTabs';
import { ContactList } from './components/contacts/ContactList';
import { ContactDetailModal } from './components/contacts/ContactDetailModal';
import { ContactFormModal } from './components/contacts/ContactFormModal';
import { ScanModal } from './components/ocr/ScanModal';
import { ToastProvider, useToast } from './components/common/Toast';
import { Contact, RoleCategory, RoleGroupResponse } from './types/contact';
import { contactsApi } from './api/contactsApi';

const MainDashboard: React.FC = () => {
  const { success, error } = useToast();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [roleGroups, setRoleGroups] = useState<RoleGroupResponse[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Modals state
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isAddManualOpen, setIsAddManualOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Toggle Theme
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Fetch contacts and role groups
  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [contactsData, roleGroupData] = await Promise.all([
        contactsApi.getContacts({
          role: selectedRole !== 'All' ? selectedRole : undefined,
          search: searchQuery.trim() || undefined,
        }),
        contactsApi.getContactsByRole(),
      ]);

      setContacts(contactsData);
      setRoleGroups(roleGroupData);
      setIsBackendConnected(true);
    } catch (err: any) {
      setIsBackendConnected(false);
      error('Failed to load contacts', err.message || 'Make sure the FastAPI backend is running on port 8000.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole, searchQuery, error]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Periodic health check ping
  useEffect(() => {
    const ping = async () => {
      try {
        const res = await fetch('/api/contacts');
        setIsBackendConnected(res.ok);
      } catch {
        setIsBackendConnected(false);
      }
    };
    const interval = setInterval(ping, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleManualAddSubmit = async (data: any) => {
    try {
      const saved = await contactsApi.createContact(data);
      success('Contact Added', `${saved.full_name} has been added successfully.`);
      loadContacts();
    } catch (err: any) {
      error('Failed to add contact', err.message);
      throw err;
    }
  };

  const handleDeleteContact = async (id: number) => {
    try {
      await contactsApi.deleteContact(id);
      success('Contact Deleted', 'Record has been removed from database.');
      loadContacts();
    } catch (err: any) {
      error('Failed to delete', err.message);
      throw err;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenScan={() => setIsScanModalOpen(true)}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '1280px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem 4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        {/* Analytics & Hero Banner */}
        <StatsHeader
          contacts={contacts}
          roleGroups={roleGroups}
          onOpenScan={() => setIsScanModalOpen(true)}
          onOpenAddManual={() => setIsAddManualOpen(true)}
        />

        {/* Filter & Search Bar Toolbar */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search contacts by name, company, title, email..."
          />

          <RoleFilterTabs
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            roleGroups={roleGroups}
            totalContacts={contacts.length}
          />
        </div>

        {/* Contact Directory Cards / List */}
        <ContactList
          contacts={contacts}
          isLoading={isLoading}
          onSelectContact={(c) => setSelectedContact(c)}
          onOpenScan={() => setIsScanModalOpen(true)}
          searchQuery={searchQuery}
        />
      </main>

      {/* OCR Scan Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onSuccess={() => {
          loadContacts();
        }}
        onViewExisting={(contact) => {
          setSelectedContact(contact);
        }}
      />

      {/* Manual Contact Add Modal */}
      <ContactFormModal
        isOpen={isAddManualOpen}
        onClose={() => setIsAddManualOpen(false)}
        onSubmit={handleManualAddSubmit}
      />

      {/* Contact Profile Detail View Modal */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        onDelete={handleDeleteContact}
      />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <MainDashboard />
    </ToastProvider>
  );
}

export default App;
