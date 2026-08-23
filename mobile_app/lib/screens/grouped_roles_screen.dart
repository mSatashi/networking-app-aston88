import 'package:flutter/material.dart';
import '../models/contact.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/contact_detail_sheet.dart';

class GroupedRolesScreen extends StatefulWidget {
  const GroupedRolesScreen({super.key});

  @override
  State<GroupedRolesScreen> createState() => _GroupedRolesScreenState();
}

class _GroupedRolesScreenState extends State<GroupedRolesScreen> {
  late Future<List<RoleGroupResponse>> _groupedFuture;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  void _refresh() {
    setState(() {
      _groupedFuture = ApiService.getContactsByRole();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Role Categories', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _refresh,
          ),
        ],
      ),
      body: FutureBuilder<List<RoleGroupResponse>>(
        future: _groupedFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan));
          } else if (snapshot.hasError) {
            return Center(
              child: Text(
                'Error loading roles: ${snapshot.error}',
                style: const TextStyle(color: AppTheme.accentRose),
              ),
            );
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(
              child: Text('No role categories found.', style: TextStyle(color: AppTheme.textSecondary)),
            );
          }

          final groups = snapshot.data!;

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: groups.length,
            itemBuilder: (context, index) {
              final group = groups[index];
              final roleColor = AppTheme.getRoleColor(group.role);

              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppTheme.bgSecondary,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: roleColor.withValues(alpha: 0.3)),
                ),
                child: ExpansionTile(
                  shape: const RoundedRectangleBorder(side: BorderSide.none),
                  leading: CircleAvatar(
                    backgroundColor: roleColor.withValues(alpha: 0.2),
                    child: Text(
                      '${group.count}',
                      style: TextStyle(color: roleColor, fontWeight: FontWeight.bold),
                    ),
                  ),
                  title: Text(
                    group.role,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  subtitle: Text(
                    '${group.count} contact${group.count > 1 ? 's' : ''}',
                    style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                  ),
                  children: group.contacts.map((contact) {
                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                      title: Text(
                        contact.fullName,
                        style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
                      ),
                      subtitle: Text(
                        contact.jobTitle ?? contact.company ?? 'No details',
                        style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
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
                              _refresh();
                            },
                          ),
                        );
                      },
                    );
                  }).toList(),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
