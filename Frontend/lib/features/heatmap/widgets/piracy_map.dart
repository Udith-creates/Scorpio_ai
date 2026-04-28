import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/heatmap_provider.dart';

class PiracyMap extends ConsumerWidget {
  const PiracyMap({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final heatmapAsync = ref.watch(heatmapDataProvider);

    return heatmapAsync.when(
      data: (hotspots) {
        return FlutterMap(
          options: MapOptions(
            initialCenter: const LatLng(20, 0),
            initialZoom: 2.0,
            minZoom: 1.0,
            maxZoom: 18.0,
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'com.scorpio.frontend',
            ),
            CircleLayer(
              circles: hotspots.map((spot) {
                final color = _getIntensityColor(spot.intensity);
                return CircleMarker(
                  point: LatLng(spot.latitude, spot.longitude),
                  radius: 10.0 + (spot.intensity * 5.0).clamp(5.0, 50.0),
                  color: color.withOpacity(0.6),
                  borderStrokeWidth: 2,
                  borderColor: color,
                );
              }).toList(),
            ),
          ],
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(child: Text('Error loading map: $e')),
    );
  }

  Color _getIntensityColor(int intensity) {
    if (intensity > 80) return Colors.red;
    if (intensity > 50) return Colors.orange;
    if (intensity > 20) return Colors.yellow;
    return Colors.green;
  }
}
