import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../providers/alerts_provider.dart';
import '../../../core/theme/app_theme.dart';

class AlertBanner extends ConsumerWidget {
  const AlertBanner({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final alertsAsync = ref.watch(alertsProvider);

    return alertsAsync.when(
      data: (snapshot) {
        if (snapshot.docs.isEmpty) return const SizedBox.shrink();

        final latestAlert = snapshot.docs.first.data() as Map<String, dynamic>;
        final timestamp = latestAlert['timestamp'] as Timestamp?;

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppTheme.redAlert.withOpacity(0.15),
            border: Border(
              bottom: BorderSide(
                color: AppTheme.redAlert.withOpacity(0.5),
                width: 1,
              ),
            ),
          ),
          child: Row(
            children: [
              const Icon(
                Icons.warning_amber_rounded,
                color: AppTheme.redAlert,
                size: 20,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Piracy Detected!',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            color: AppTheme.redAlert,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      '${latestAlert['content_id'] ?? 'Unknown'} - ${latestAlert['stream_url'] ?? ''}',
                      style: Theme.of(context).textTheme.bodySmall,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              if (timestamp != null)
                Text(
                  '${timestamp.toDate().hour}:${timestamp.toDate().minute.toString().padLeft(2, '0')}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
            ],
          ),
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }
}
