import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../models/contact.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class ScanModal extends StatefulWidget {
  final VoidCallback onScanComplete;

  const ScanModal({super.key, required this.onScanComplete});

  @override
  State<ScanModal> createState() => _ScanModalState();
}

class _ScanModalState extends State<ScanModal> {
  final ImagePicker _picker = ImagePicker();
  final TextEditingController _urlController = TextEditingController();

  File? _selectedImage;
  bool _isLoading = false;
  String? _errorMessage;
  ExtractOCRResponse? _ocrResult;

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        setState(() {
          _selectedImage = File(pickedFile.path);
          _errorMessage = null;
        });
        _processFileOCR();
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to capture or select image: ${e.toString()}';
      });
    }
  }

  Future<void> _processFileOCR() async {
    if (_selectedImage == null) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _ocrResult = null;
    });

    try {
      final result = await ApiService.extractFromFile(_selectedImage!);
      setState(() {
        _ocrResult = result;
        _isLoading = false;
      });
      widget.onScanComplete();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _processUrlOCR() async {
    final url = _urlController.text.trim();
    if (url.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter an image URL';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _ocrResult = null;
    });

    try {
      final result = await ApiService.extractFromUrl(url);
      setState(() {
        _ocrResult = result;
        _isLoading = false;
      });
      widget.onScanComplete();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: 20,
        left: 24,
        right: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
            const SizedBox(height: 16),
            const Text(
              'Scan Business Card',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Capture photo or select card image for Roboflow OCR processing.',
              style: TextStyle(fontSize: 13, color: AppTheme.textSecondary),
            ),
            const SizedBox(height: 20),

            if (_errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.accentRose.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppTheme.accentRose.withValues(alpha: 0.4)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: AppTheme.accentRose),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: AppTheme.accentRose, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),

            if (_isLoading)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Column(
                  children: const [
                    SpinKitFadingCube(color: AppTheme.accentCyan, size: 48),
                    SizedBox(height: 20),
                    Text(
                      'Analyzing Card via Roboflow OCR Workflow...',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.accentCyan,
                      ),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Extracting contact details & categorizing role',
                      style: TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
              )
            else if (_ocrResult != null)
              _buildOCRSuccessCard(_ocrResult!)
            else ...[
              // Option 1: Camera & Gallery
              Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => _pickImage(ImageSource.camera),
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.accentIndigo.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.accentIndigo.withValues(alpha: 0.4)),
                        ),
                        child: Column(
                          children: const [
                            Icon(Icons.camera_alt_rounded, size: 36, color: AppTheme.accentIndigo),
                            SizedBox(height: 10),
                            Text(
                              'Take Photo',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Text(
                              'Use Camera',
                              style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: InkWell(
                      onTap: () => _pickImage(ImageSource.gallery),
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.accentCyan.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.4)),
                        ),
                        child: Column(
                          children: const [
                            Icon(Icons.photo_library_rounded, size: 36, color: AppTheme.accentCyan),
                            SizedBox(height: 10),
                            Text(
                              'Choose File',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            Text(
                              'Pick from Gallery',
                              style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Option 2: Image URL Input
              Row(
                children: const [
                  Expanded(child: Divider(color: Colors.white10)),
                  Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10),
                    child: Text('OR VIA URL', style: TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  ),
                  Expanded(child: Divider(color: Colors.white10)),
                ],
              ),
              const SizedBox(height: 16),

              TextField(
                controller: _urlController,
                style: const TextStyle(color: AppTheme.textPrimary),
                decoration: InputDecoration(
                  hintText: 'https://example.com/card.jpg',
                  hintStyle: const TextStyle(color: Colors.white30),
                  prefixIcon: const Icon(Icons.link_rounded, color: AppTheme.accentCyan),
                  filled: true,
                  fillColor: AppTheme.bgPrimary,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.accentIndigo,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  onPressed: _processUrlOCR,
                  icon: const Icon(Icons.auto_awesome_rounded, size: 18),
                  label: const Text('Extract from Image URL'),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildOCRSuccessCard(ExtractOCRResponse result) {
    final contact = result.contact;
    final isDup = result.isDuplicate;
    const emeraldColor = Color(0xFF10B981);

    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDup
                ? Colors.amber.withValues(alpha: 0.15)
                : emeraldColor.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDup ? Colors.amber : emeraldColor,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    isDup ? Icons.warning_amber_rounded : Icons.check_circle_rounded,
                    color: isDup ? Colors.amber : emeraldColor,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    isDup ? 'Duplicate Contact Ignored' : 'Card Successfully Scanned',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: isDup ? Colors.amber : emeraldColor,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                result.message,
                style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Display Extracted Info
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.bgPrimary,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                contact.fullName,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              if (contact.jobTitle != null)
                Text(contact.jobTitle!, style: const TextStyle(color: AppTheme.textSecondary)),
              const SizedBox(height: 8),
              Text('Role: ${contact.role}', style: const TextStyle(color: AppTheme.accentCyan)),
              if (contact.email != null) Text('Email: ${contact.email}'),
              if (contact.phone != null) Text('Phone: ${contact.phone}'),
            ],
          ),
        ),
        const SizedBox(height: 20),

        SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.accentIndigo,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            onPressed: () => Navigator.pop(context),
            child: const Text('Done'),
          ),
        ),
      ],
    );
  }
}
