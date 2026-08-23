import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Dark Mode Colors
  static const Color bgPrimary = Color(0xFF0F172A);   // Slate 900
  static const Color bgSecondary = Color(0xFF1E293B); // Slate 800
  static const Color bgSurface = Color(0xFF334155);   // Slate 700
  static const Color accentIndigo = Color(0xFF6366F1);
  static const Color accentCyan = Color(0xFF06B6D4);
  static const Color accentRose = Color(0xFFF43F5E);
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);

  // Role Color Palette Mapping
  static Color getRoleColor(String role) {
    switch (role.toLowerCase()) {
      case 'executive':
        return const Color(0xFFF59E0B); // Amber / Gold
      case 'engineering':
        return const Color(0xFF06B6D4); // Cyan
      case 'management':
        return const Color(0xFF6366F1); // Indigo
      case 'sales & marketing':
        return const Color(0xFF10B981); // Emerald
      case 'product & design':
        return const Color(0xFFA855F7); // Purple
      case 'operations & admin':
        return const Color(0xFFF43F5E); // Rose
      default:
        return const Color(0xFF64748B); // Slate
    }
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgPrimary,
      colorScheme: const ColorScheme.dark(
        primary: accentIndigo,
        secondary: accentCyan,
        surface: bgSecondary,
        error: accentRose,
        onPrimary: Colors.white,
        onSurface: textPrimary,
      ),
      textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.outfit(color: textPrimary, fontWeight: FontWeight.bold),
        titleLarge: GoogleFonts.outfit(color: textPrimary, fontWeight: FontWeight.w600),
        bodyLarge: GoogleFonts.outfit(color: textPrimary),
        bodyMedium: GoogleFonts.outfit(color: textSecondary),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: bgSecondary,
        elevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: textPrimary),
      ),
      cardTheme: CardThemeData(
        color: bgSecondary,
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: bgSecondary,
        selectedItemColor: accentIndigo,
        unselectedItemColor: textSecondary,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
