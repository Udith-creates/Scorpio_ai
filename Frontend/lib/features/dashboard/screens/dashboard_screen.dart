import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_theme.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/metrics_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardAsync = ref.watch(dashboardProvider);
    final detectionsAsync = ref.watch(recentDetectionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Command Center'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_active_outlined),
            onPressed: () => GoRouter.of(context).go('/alerts'),
          ),
          IconButton(
            icon: const Icon(Icons.map_outlined),
            onPressed: () => GoRouter.of(context).go('/heatmap'),
          ),
        ],
      ),
      body: dashboardAsync.when(
        data: (metrics) => Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'REAL-TIME INTELLIGENCE',
                style: Theme.of(context).textTheme.displaySmall,
              ),
              const Divider(height: 32),
              const SizedBox(height: 8),
              Expanded(
                child: GridView.count(
                  crossAxisCount: 3,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.5,
                  children: [
                    MetricsCard(
                      title: 'Active Alerts',
                      value: '${metrics['alertCount'] ?? 0}',
                      icon: Icons.warning_amber_outlined,
                      accentColor: AppTheme.redAlert,
                    ),
                    MetricsCard(
                      title: 'Events Today',
                      value: '${metrics['eventsToday'] ?? 0}',
                      icon: Icons.event_note_outlined,
                    ),
                    MetricsCard(
                      title: 'Protected Content',
                      value: '${metrics['protectedContent'] ?? 0}',
                      icon: Icons.security_outlined,
                      accentColor: AppTheme.greenSuccess,
                    ),
                    MetricsCard(
                      title: 'Detection Rate',
                      value: metrics['detectionRate'] ?? '0%',
                      icon: Icons.speed_outlined,
                    ),
                    MetricsCard(
                      title: 'Avg Response',
                      value: metrics['responseTime'] ?? '0s',
                      icon: Icons.timer_outlined,
                    ),
                    MetricsCard(
                      title: 'Active Threats',
                      value: '${metrics['activeThreats'] ?? 0}',
                      icon: Icons.dangerous_outlined,
                      accentColor: AppTheme.redAlert,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'ARCHIVAL LOGS',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: Theme.of(context).colorScheme.primary,
                    ),
              ),
              const Divider(height: 16),
              const SizedBox(height: 8),
              Expanded(
                child: detectionsAsync.when(
                  data: (snapshot) => ListView.separated(
                    itemCount: snapshot.docs.length,
                    separatorBuilder: (context, index) => const Divider(),
                    itemBuilder: (context, index) {
                      final data = snapshot.docs[index].data() as Map<String, dynamic>;
                      return ListTile(
                        leading: const Icon(Icons.videocam_outlined),
                        title: Text(
                          data['content_id'] ?? 'Unknown',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                        subtitle: Text(
                          data['stream_url'] ?? '',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        trailing: Text(
                          '${data['confidence'] ?? 0}% CONFIDENCE',
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                              ),
                        ),
                      );
                    },
                  ),
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Error: $e')),
                ),
              ),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
