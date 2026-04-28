import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/firestore_service.dart';
import '../../../core/services/firebase_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

final dashboardProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final firestore = FirebaseService.firestore;
  final service = FirestoreService(firestore);

  final alertCount = await service.getAlertCount();
  final eventsToday = await service.getEventsToday();

  return {
    'alertCount': alertCount,
    'eventsToday': eventsToday,
    'activeThreats': alertCount,
    'protectedContent': 1247,
    'detectionRate': '87.3%',
    'responseTime': '1.2s',
  };
});

final recentDetectionsProvider = StreamProvider<QuerySnapshot>((ref) {
  final firestore = FirebaseService.firestore;
  return firestore
      .collection('piracy_events')
      .orderBy('timestamp', descending: true)
      .limit(10)
      .snapshots();
});
