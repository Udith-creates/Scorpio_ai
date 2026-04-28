class AppConstants {
  static const String appName = 'Scorpio AI Command Center';
  static const String version = '1.0.0';

  static const String baseApiUrl = 'http://localhost:8000/api/v1';

  static const String firestorePiracyAlerts = 'piracy_alerts';
  static const String firestorePiracyEvents = 'piracy_events';
  static const String firestoreOrganizations = 'organizations';

  static const String heatmapDefaultColor = '#00D4FF';
  static const double heatmapDefaultZoom = 2.0;
  static const double heatmapMinZoom = 1.0;
  static const double heatmapMaxZoom = 18.0;

  static const Duration splashDuration = Duration(seconds: 2);
  static const Duration alertFlashDuration = Duration(milliseconds: 500);
}
