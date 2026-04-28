import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/api_service.dart';

class PirateHotspot {
  final double latitude;
  final double longitude;
  final int intensity;
  final String country;
  final String city;

  PirateHotspot({
    required this.latitude,
    required this.longitude,
    required this.intensity,
    required this.country,
    required this.city,
  });

  factory PirateHotspot.fromJson(Map<String, dynamic> json) {
    return PirateHotspot(
      latitude: json['latitude']?.toDouble() ?? 0.0,
      longitude: json['longitude']?.toDouble() ?? 0.0,
      intensity: json['intensity'] ?? 1,
      country: json['country'] ?? '',
      city: json['city'] ?? '',
    );
  }
}

final heatmapDataProvider = FutureProvider<List<PirateHotspot>>((ref) async {
  final apiService = ApiService();
  final data = await apiService.getHeatmapData();
  return data.map((e) => PirateHotspot.fromJson(e)).toList();
});
