import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../core/constants/app_constants.dart';

class ApiService {
  final String baseUrl;

  ApiService({String? baseUrl}) : baseUrl = baseUrl ?? AppConstants.baseApiUrl;

  Future<List<dynamic>> getHeatmapData() async {
    final response = await http.get(Uri.parse('$baseUrl/analytics/heatmap'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to load heatmap data: ${response.statusCode}');
  }

  Future<List<dynamic>> getDetectionsList() async {
    final response = await http.get(Uri.parse('$baseUrl/detections/list'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    throw Exception('Failed to load detections: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> reportDetection(Map<String, dynamic> detection) async {
    final response = await http.post(
      Uri.parse('$baseUrl/detections/report'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(detection),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to report detection: ${response.statusCode}');
  }

  Future<Map<String, dynamic>> getDashboardMetrics() async {
    final response = await http.get(Uri.parse('$baseUrl/dashboard/metrics'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body) as Map<String, dynamic>;
    }
    throw Exception('Failed to load dashboard metrics: ${response.statusCode}');
  }
}
