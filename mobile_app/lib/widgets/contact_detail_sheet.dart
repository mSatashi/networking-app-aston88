import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/contact.dart';
import '../theme/app_theme.dart';

class ContactDetailSheet extends StatelessWidget {
  final Contact contact;
  final VoidCallback onDelete;

  const ContactDetailSheet({
    super.key,
    required this.contact,
    required this.onDelete,
  });

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri uri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _sendEmail(String email) async {
    final Uri uri = Uri(scheme: 'mailto', path: email);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _openWebsite(String url) async {
    String formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://$formattedUrl';
    }
    final Uri uri = Uri.parse(formattedUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final roleColor = AppTheme.getRoleColor(contact.role);

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Handle Bar
            Center(
              child: Container(
                width: 48,
                height: 5,
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Header Info
            Row(
              children: [
                CircleAvatar(
                  radius: 32,
                  backgroundColor: roleColor.withValues(alpha: 0.2),
                  child: Text(
                    contact.fullName.isNotEmpty ? contact.fullName[0].toUpperCase() : 'C',
                    style: TextStyle(
                      color: roleColor,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        contact.fullName,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      if (contact.jobTitle != null && contact.jobTitle!.isNotEmpty)
                        Text(
                          contact.jobTitle!,
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: roleColor.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: roleColor.withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          contact.role,
                          style: TextStyle(
                            color: roleColor,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            const Divider(color: Colors.white10),
            const SizedBox(height: 16),

            // Detail Fields
            if (contact.company != null && contact.company!.isNotEmpty)
              _buildDetailTile(Icons.business_rounded, 'Company', contact.company!),
            if (contact.email != null && contact.email!.isNotEmpty)
              _buildDetailTile(
                Icons.email_rounded,
                'Email',
                contact.email!,
                onTap: () => _sendEmail(contact.email!),
                actionIcon: Icons.send_rounded,
              ),
            if (contact.phone != null && contact.phone!.isNotEmpty)
              _buildDetailTile(
                Icons.phone_rounded,
                'Phone',
                contact.phone!,
                onTap: () => _makePhoneCall(contact.phone!),
                actionIcon: Icons.call_rounded,
              ),
            if (contact.website != null && contact.website!.isNotEmpty)
              _buildDetailTile(
                Icons.language_rounded,
                'Website',
                contact.website!,
                onTap: () => _openWebsite(contact.website!),
                actionIcon: Icons.open_in_new_rounded,
              ),
            if (contact.address != null && contact.address!.isNotEmpty)
              _buildDetailTile(Icons.location_on_rounded, 'Address', contact.address!),

            const SizedBox(height: 24),

            // Action Buttons (Delete / Close)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.accentRose,
                      side: const BorderSide(color: AppTheme.accentRose),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () {
                      Navigator.pop(context);
                      onDelete();
                    },
                    icon: const Icon(Icons.delete_outline_rounded, size: 18),
                    label: const Text('Delete Contact'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentIndigo,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Close'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailTile(
    IconData icon,
    String label,
    String value, {
    VoidCallback? onTap,
    IconData? actionIcon,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: AppTheme.bgPrimary.withValues(alpha: 0.5),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
          ),
          child: Row(
            children: [
              Icon(icon, size: 20, color: AppTheme.accentCyan),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                    ),
                    Text(
                      value,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              if (actionIcon != null)
                Icon(actionIcon, size: 18, color: AppTheme.accentIndigo),
            ],
          ),
        ),
      ),
    );
  }
}
