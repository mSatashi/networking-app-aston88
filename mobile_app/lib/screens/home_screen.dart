import 'package:flutter/material.dart';
import '../models/contact.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/contact_detail_sheet.dart';
import '../widgets/scan_modal.dart';
import '../widgets/manual_contact_modal.dart';
import 'grouped_roles_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  String _selectedRole = 'All';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  List<Contact> _contacts = [];
  bool _isLoading = true;
  String? _error;

  final List<String> _roles = [
    'All',
    'Executive',
    'Engineering',
    'Management',
    'Sales & Marketing',
    'Product & Design',
    'Operations & Admin',
    'General',
  ];

  @override
  void initState() {
    super.initState();
    _fetchContacts();
  }

  Future<void> _fetchContacts() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final data = await ApiService.getContacts(
        role: _selectedRole,
        search: _searchQuery,
      );
      setState(() {
        _contacts = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _openScanModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ScanModal(
        onScanComplete: () {
          _fetchContacts();
        },
      ),
    );
  }

  void _openManualAddModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ManualContactModal(
        onContactCreated: () {
          _fetchContacts();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _currentIndex == 0 ? _buildHomeBody() : const GroupedRolesScreen(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.contacts_rounded),
            label: 'Contacts',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.category_rounded),
            label: 'Role Groups',
          ),
        ],
      ),
      floatingActionButton: _currentIndex == 0
          ? Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                FloatingActionButton.small(
                  heroTag: 'manualAddBtn',
                  backgroundColor: AppTheme.bgSecondary,
                  foregroundColor: AppTheme.accentCyan,
                  onPressed: _openManualAddModal,
                  child: const Icon(Icons.person_add_rounded),
                ),
                const SizedBox(height: 10),
                FloatingActionButton.extended(
                  heroTag: 'scanBtn',
                  backgroundColor: AppTheme.accentIndigo,
                  foregroundColor: Colors.white,
                  icon: const Icon(Icons.qr_code_scanner_rounded),
                  label: const Text('Scan Card', style: TextStyle(fontWeight: FontWeight.bold)),
                  onPressed: _openScanModal,
                ),
              ],
            )
          : null,
    );
  }

  Widget _buildHomeBody() {
    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Stats
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Networking Hub',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    Text(
                      '${_contacts.length} Contact${_contacts.length == 1 ? '' : 's'} Total',
                      style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
                CircleAvatar(
                  backgroundColor: AppTheme.accentIndigo.withValues(alpha: 0.2),
                  child: const Icon(Icons.badge_rounded, color: AppTheme.accentIndigo),
                ),
              ],
            ),
          ),

          // Search Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
            child: TextField(
              controller: _searchController,
              onChanged: (val) {
                _searchQuery = val.trim();
                _fetchContacts();
              },
              style: const TextStyle(color: AppTheme.textPrimary),
              decoration: InputDecoration(
                hintText: 'Search name, title, email...',
                hintStyle: const TextStyle(color: Colors.white30, fontSize: 14),
                prefixIcon: const Icon(Icons.search_rounded, color: AppTheme.textSecondary),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, color: AppTheme.textSecondary),
                        onPressed: () {
                          _searchController.clear();
                          _searchQuery = '';
                          _fetchContacts();
                        },
                      )
                    : null,
                filled: true,
                fillColor: AppTheme.bgSecondary,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Horizontal Role Filter Tabs
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              children: _roles.map((role) {
                final isSelected = _selectedRole.toLowerCase() == role.toLowerCase();
                final roleColor = role == 'All' ? AppTheme.accentIndigo : AppTheme.getRoleColor(role);

                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(role),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedRole = role);
                        _fetchContacts();
                      }
                    },
                    selectedColor: roleColor,
                    backgroundColor: AppTheme.bgSecondary,
                    labelStyle: TextStyle(
                      color: isSelected ? Colors.white : AppTheme.textSecondary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      fontSize: 13,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(
                        color: isSelected ? roleColor : Colors.white10,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          // Contact List Area
          Expanded(
            child: RefreshIndicator(
              onRefresh: _fetchContacts,
              color: AppTheme.accentCyan,
              child: _buildContactListContent(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactListContent() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan));
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.wifi_off_rounded, size: 48, color: AppTheme.accentRose),
              const SizedBox(height: 12),
              const Text(
                'Connection Error',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 6),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentIndigo),
                onPressed: _fetchContacts,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_contacts.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.contact_mail_outlined, size: 64, color: AppTheme.textSecondary.withValues(alpha: 0.4)),
            const SizedBox(height: 12),
            const Text(
              'No contacts found',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 4),
            const Text(
              'Tap "Scan Card" to add your first contact via Roboflow OCR.',
              style: TextStyle(fontSize: 12, color: Colors.white38),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      itemCount: _contacts.length,
      itemBuilder: (context, index) {
        final contact = _contacts[index];
        final roleColor = AppTheme.getRoleColor(contact.role);

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: CircleAvatar(
              radius: 24,
              backgroundColor: roleColor.withValues(alpha: 0.2),
              child: Text(
                contact.fullName.isNotEmpty ? contact.fullName[0].toUpperCase() : 'C',
                style: TextStyle(color: roleColor, fontWeight: FontWeight.bold, fontSize: 20),
              ),
            ),
            title: Text(
              contact.fullName,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppTheme.textPrimary),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (contact.jobTitle != null && contact.jobTitle!.isNotEmpty)
                  Text(
                    contact.jobTitle!,
                    style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
                  ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: roleColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        contact.role,
                        style: TextStyle(color: roleColor, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (contact.company != null && contact.company!.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          contact.company!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 12, color: Colors.white38),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
            trailing: const Icon(Icons.chevron_right_rounded, color: AppTheme.textSecondary),
            onTap: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.transparent,
                builder: (_) => ContactDetailSheet(
                  contact: contact,
                  onDelete: () async {
                    await ApiService.deleteContact(contact.id);
                    _fetchContacts();
                  },
                ),
              );
            },
          ),
        );
      },
    );
  }
}
