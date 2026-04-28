import 'package:cloud_firestore/cloud_firestore.dart';
import '../../core/constants/app_constants.dart';

class FirestoreService {
  final FirebaseFirestore _firestore;

  FirestoreService(this._firestore);

  Stream<QuerySnapshot> getPiracyAlertsStream() {
    return _firestore
        .collection(AppConstants.firestorePiracyAlerts)
        .orderBy('timestamp', descending: true)
        .limit(50)
        .snapshots();
  }

  Stream<QuerySnapshot> getPiracyEventsStream() {
    return _firestore
        .collection(AppConstants.firestorePiracyEvents)
        .orderBy('timestamp', descending: true)
        .limit(100)
        .snapshots();
  }

  Future<void> addPiracyAlert(Map<String, dynamic> alert) async {
    await _firestore
        .collection(AppConstants.firestorePiracyAlerts)
        .add(alert);
  }

  Future<int> getAlertCount() async {
    final snapshot = await _firestore
        .collection(AppConstants.firestorePiracyAlerts)
        .get();
    return snapshot.size;
  }

  Future<int> getEventsToday() async {
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day);
    final snapshot = await _firestore
        .collection(AppConstants.firestorePiracyEvents)
        .where('timestamp', isGreaterThan: startOfDay)
        .get();
    return snapshot.size;
  }
}
