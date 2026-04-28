import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/firebase_service.dart';

final alertsProvider = StreamProvider<QuerySnapshot>((ref) {
  return FirebaseService.firestore
      .collection('piracy_alerts')
      .orderBy('timestamp', descending: true)
      .limit(50)
      .snapshots();
});

final unreadAlertsCountProvider = StreamProvider<int>((ref) {
  return FirebaseService.firestore
      .collection('piracy_alerts')
      .where('read', isEqualTo: false)
      .snapshots()
      .map((snapshot) => snapshot.size);
});
