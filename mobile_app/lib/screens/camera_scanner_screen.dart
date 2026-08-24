import 'dart:io';
import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';
import '../models/contact.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class CameraScannerScreen extends StatefulWidget {
  const CameraScannerScreen({super.key});

  @override
  State<CameraScannerScreen> createState() => _CameraScannerScreenState();
}

class _CameraScannerScreenState extends State<CameraScannerScreen> with SingleTickerProviderStateMixin {
  CameraController? _controller;
  List<CameraDescription>? _cameras;
  int _selectedCameraIndex = 0;
  bool _isFlashOn = false;

  late AnimationController _laserAnimationController;
  late Animation<double> _laserAnimation;

  bool _isProcessing = false;
  String? _errorMessage;
  ExtractOCRResponse? _ocrResult;

  @override
  void initState() {
    super.initState();
    _initCamera();

    _laserAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);

    _laserAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _laserAnimationController, curve: Curves.easeInOut),
    );
  }

  Future<void> _initCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras != null && _cameras!.isNotEmpty) {
        _onNewCameraSelected(_cameras![_selectedCameraIndex]);
      } else {
        setState(() {
          _errorMessage = 'No camera found on this device.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Camera initialization failed: ${e.toString()}';
      });
    }
  }

  Future<void> _onNewCameraSelected(CameraDescription cameraDescription) async {
    if (_controller != null) {
      await _controller!.dispose();
    }

    final CameraController cameraController = CameraController(
      cameraDescription,
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: ImageFormatGroup.jpeg,
    );

    _controller = cameraController;

    try {
      await cameraController.initialize();
      if (mounted) {
        setState(() {});
      }
    } on CameraException catch (e) {
      setState(() {
        _errorMessage = 'Error initializing camera: ${e.description}';
      });
    }
  }

  Future<void> _toggleFlash() async {
    if (_controller == null || !_controller!.value.isInitialized) return;

    try {
      if (_isFlashOn) {
        await _controller!.setFlashMode(FlashMode.off);
        setState(() => _isFlashOn = false);
      } else {
        await _controller!.setFlashMode(FlashMode.torch);
        setState(() => _isFlashOn = true);
      }
    } catch (_) {}
  }

  Future<void> _switchCamera() async {
    if (_cameras == null || _cameras!.length < 2) return;
    _selectedCameraIndex = (_selectedCameraIndex + 1) % _cameras!.length;
    await _onNewCameraSelected(_cameras![_selectedCameraIndex]);
  }

  Future<void> _captureAndScan() async {
    if (_controller == null || !_controller!.value.isInitialized || _isProcessing) return;

    try {
      setState(() {
        _isProcessing = true;
        _errorMessage = null;
      });

      final XFile photo = await _controller!.takePicture();
      final File imageFile = File(photo.path);

      final result = await ApiService.extractFromFile(imageFile);

      if (mounted) {
        setState(() {
          _ocrResult = result;
          _isProcessing = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
          _isProcessing = false;
        });
      }
    }
  }

  Future<void> _pickFromGallery() async {
    if (_isProcessing) return;

    try {
      final ImagePicker picker = ImagePicker();
      final XFile? pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1600,
        maxHeight: 1600,
      );

      if (pickedFile != null) {
        setState(() {
          _isProcessing = true;
          _errorMessage = null;
        });

        final File imageFile = File(pickedFile.path);
        final result = await ApiService.extractFromFile(imageFile);

        if (mounted) {
          setState(() {
            _ocrResult = result;
            _isProcessing = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
          _isProcessing = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    _laserAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Live Camera Preview
          if (_controller != null && _controller!.value.isInitialized)
            SizedBox.expand(
              child: CameraPreview(_controller!),
            )
          else
            const Center(child: CircularProgressIndicator(color: AppTheme.accentCyan)),

          // 2. Viewfinder Overlay & Alignment Frame Guide
          _buildViewfinderOverlay(),

          // 3. Top Header Bar (Close, Flash, Switch Camera)
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
                const Text(
                  'Card Scanner',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Row(
                  children: [
                    IconButton(
                      icon: Icon(
                        _isFlashOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
                        color: _isFlashOn ? Colors.amber : Colors.white,
                      ),
                      onPressed: _toggleFlash,
                    ),
                    if (_cameras != null && _cameras!.length > 1)
                      IconButton(
                        icon: const Icon(Icons.flip_camera_ios_rounded, color: Colors.white),
                        onPressed: _switchCamera,
                      ),
                  ],
                ),
              ],
            ),
          ),

          // 4. Bottom Control Bar (Shutter Button & Gallery)
          Positioned(
            bottom: 30,
            left: 0,
            right: 0,
            child: Column(
              children: [
                const Text(
                  'Align card within frame & tap button',
                  style: TextStyle(color: Colors.white70, fontSize: 13),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Gallery Picker
                    IconButton(
                      icon: const Icon(Icons.photo_library_rounded, color: Colors.white, size: 30),
                      onPressed: _pickFromGallery,
                    ),

                    // Shutter Capture Button
                    GestureDetector(
                      onTap: _captureAndScan,
                      child: Container(
                        width: 76,
                        height: 76,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 4),
                          color: AppTheme.accentIndigo,
                        ),
                        child: Center(
                          child: Container(
                            width: 60,
                            height: 60,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.white,
                            ),
                            child: const Icon(Icons.camera_alt_rounded, color: AppTheme.accentIndigo, size: 32),
                          ),
                        ),
                      ),
                    ),

                    // Placeholder spacing balance
                    const SizedBox(width: 30),
                  ],
                ),
              ],
            ),
          ),

          // 5. Processing Overlay
          if (_isProcessing)
            Container(
              color: Colors.black.withValues(alpha: 0.85),
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    SpinKitFadingCube(color: AppTheme.accentCyan, size: 54),
                    SizedBox(height: 24),
                    Text(
                      'Analyzing Card via Roboflow OCR...',
                      style: TextStyle(
                        color: AppTheme.accentCyan,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Extracting text & categorizing contact role',
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),

          // 6. Error Banner
          if (_errorMessage != null && !_isProcessing)
            Positioned(
              top: MediaQuery.of(context).padding.top + 70,
              left: 20,
              right: 20,
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppTheme.accentRose.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: Colors.white),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white, size: 18),
                      onPressed: () => setState(() => _errorMessage = null),
                    ),
                  ],
                ),
              ),
            ),

          // 7. Result Sheet Modal
          if (_ocrResult != null) _buildResultModal(_ocrResult!),
        ],
      ),
    );
  }

  Widget _buildViewfinderOverlay() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final double frameW = constraints.maxWidth * 0.85;
        final double frameH = frameW * (2 / 3); // 3:2 Business card ratio
        final double frameX = (constraints.maxWidth - frameW) / 2;
        final double frameY = (constraints.maxHeight - frameH) / 2 - 40;

        return Stack(
          children: [
            // Darkened Outer Mask
            ColorFiltered(
              colorFilter: ColorFilter.mode(
                Colors.black.withValues(alpha: 0.5),
                BlendMode.srcOut,
              ),
              child: Stack(
                children: [
                  Container(
                    decoration: const BoxDecoration(
                      color: Colors.black,
                      backgroundBlendMode: BlendMode.dstOut,
                    ),
                  ),
                  Positioned(
                    left: frameX,
                    top: frameY,
                    width: frameW,
                    height: frameH,
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Frame Corners Reticle Brackets (Cyan)
            Positioned(
              left: frameX,
              top: frameY,
              width: frameW,
              height: frameH,
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.accentCyan.withValues(alpha: 0.6), width: 2),
                ),
                child: AnimatedBuilder(
                  animation: _laserAnimation,
                  builder: (context, child) {
                    return Stack(
                      children: [
                        // Animated Scanning Laser Line
                        Positioned(
                          top: frameH * _laserAnimation.value,
                          left: 0,
                          right: 0,
                          child: Container(
                            height: 3,
                            decoration: BoxDecoration(
                              color: AppTheme.accentCyan,
                              boxShadow: [
                                BoxShadow(
                                  color: AppTheme.accentCyan.withValues(alpha: 0.8),
                                  blurRadius: 8,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildResultModal(ExtractOCRResponse result) {
    final contact = result.contact;
    final isDup = result.isDuplicate;

    return Container(
      color: Colors.black.withValues(alpha: 0.8),
      padding: const EdgeInsets.all(24),
      alignment: Alignment.center,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppTheme.bgSecondary,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: isDup ? Colors.amber : const Color(0xFF10B981)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  isDup ? Icons.warning_amber_rounded : Icons.check_circle_rounded,
                  color: isDup ? Colors.amber : const Color(0xFF10B981),
                  size: 28,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    isDup ? 'Duplicate Ignored' : 'Contact Scanned & Saved',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDup ? Colors.amber : const Color(0xFF10B981),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(result.message, style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
            const Divider(height: 24, color: Colors.white10),

            Text(contact.fullName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.textPrimary)),
            if (contact.jobTitle != null) Text(contact.jobTitle!, style: const TextStyle(color: AppTheme.textSecondary)),
            const SizedBox(height: 8),
            Text('Role: ${contact.role}', style: const TextStyle(color: AppTheme.accentCyan, fontWeight: FontWeight.w600)),
            if (contact.company != null) Text('Company: ${contact.company}'),
            if (contact.email != null) Text('Email: ${contact.email}'),
            if (contact.phone != null) Text('Phone: ${contact.phone}'),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentIndigo,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                onPressed: () {
                  Navigator.pop(context, true);
                },
                child: const Text('Done & Return to Contacts', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
