import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Vigilant Cream Redux Colors
  static const Color surface = Color(0xFFFFF9ED);
  static const Color onSurface = Color(0xFF1E1C11);
  static const Color surfaceContainer = Color(0xFFF5EDDB);
  static const Color surfaceContainerLow = Color(0xFFFAF3E1);
  static const Color surfaceContainerHighest = Color(0xFFE9E2D0);
  
  static const Color primary = Color(0xFFAD2B00); // Burnt Orange
  static const Color onPrimary = Color(0xFFFFFFFF);
  
  static const Color primaryContainer = Color(0xFFD53E0F);
  
  static const Color neutral = Color(0xFFE9E2D0);
  static const Color charcoal = Color(0xFF1E1C11);

  // Backward compatibility colors (mapped to new palette)
  static const Color primaryCyan = primary;
  static const Color redAlert = Color(0xFFBA1A1A);
  static const Color greenSuccess = Color(0xFF008F39);

  static ThemeData get vigilantTheme {
    final textTheme = GoogleFonts.workSansTextTheme().copyWith(
      displayLarge: GoogleFonts.notoSerif(
        fontSize: 48,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.02 * 48,
        height: 1.1,
        color: onSurface,
      ),
      displayMedium: GoogleFonts.notoSerif(
        fontSize: 36,
        fontWeight: FontWeight.bold,
        letterSpacing: -0.01 * 36,
        height: 1.2,
        color: onSurface,
      ),
      displaySmall: GoogleFonts.notoSerif(
        fontSize: 24,
        fontWeight: FontWeight.bold,
        height: 1.3,
        color: onSurface,
      ),
      headlineLarge: GoogleFonts.notoSerif(
        fontSize: 32,
        fontWeight: FontWeight.bold,
        color: onSurface,
      ),
      bodyLarge: GoogleFonts.workSans(
        fontSize: 18,
        fontWeight: FontWeight.normal,
        letterSpacing: -0.01 * 18,
        height: 1.6,
        color: onSurface,
      ),
      bodyMedium: GoogleFonts.workSans(
        fontSize: 16,
        fontWeight: FontWeight.normal,
        height: 1.5,
        color: onSurface,
      ),
      labelSmall: GoogleFonts.workSans(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.05 * 14,
        height: 1.2,
        color: onSurface,
      ),
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primary,
      scaffoldBackgroundColor: surface,
      colorScheme: const ColorScheme.light(
        primary: primary,
        onPrimary: onPrimary,
        primaryContainer: primaryContainer,
        surface: surface,
        onSurface: onSurface,
        surfaceContainer: surfaceContainer,
        outline: charcoal,
        error: redAlert,
      ),
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.notoSerif(
          color: onSurface,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
        iconTheme: const IconThemeData(color: charcoal),
        shape: const Border(
          bottom: BorderSide(color: Color(0x1A1E1C11), width: 1),
        ),
      ),
      cardTheme: const CardTheme(
        color: surfaceContainer,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.zero,
          side: BorderSide(color: Color(0x1A1E1C11), width: 1),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: onPrimary,
          elevation: 0,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: GoogleFonts.workSans(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.02 * 15,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: charcoal,
          side: const BorderSide(color: charcoal, width: 1.5),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.zero,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          textStyle: GoogleFonts.workSans(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.02 * 15,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: false,
        border: const OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: BorderSide(color: charcoal, width: 1),
        ),
        enabledBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: BorderSide(color: charcoal, width: 1),
        ),
        focusedBorder: const OutlineInputBorder(
          borderRadius: BorderRadius.zero,
          borderSide: BorderSide(color: primary, width: 2),
        ),
        labelStyle: GoogleFonts.workSans(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.05 * 14,
          color: onSurface,
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0x1A1E1C11),
        thickness: 1,
        space: 1,
      ),
    );
  }
}
