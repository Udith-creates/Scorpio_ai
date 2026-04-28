import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NavRail extends StatelessWidget {
  final String currentRoute;

  const NavRail({super.key, required this.currentRoute});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return NavigationRail(
      backgroundColor: theme.colorScheme.surface,
      selectedIndex: _getSelectedIndex(currentRoute),
      onDestinationSelected: (index) {
        switch (index) {
          case 0:
            GoRouter.of(context).go('/dashboard');
          case 1:
            GoRouter.of(context).go('/heatmap');
          case 2:
            GoRouter.of(context).go('/alerts');
        }
      },
      labelType: NavigationRailLabelType.all,
      selectedIconTheme: IconThemeData(color: theme.colorScheme.primary),
      unselectedIconTheme: IconThemeData(color: theme.colorScheme.onSurface.withOpacity(0.5)),
      selectedLabelTextStyle: TextStyle(
        color: theme.colorScheme.primary,
        fontWeight: FontWeight.bold,
        fontSize: 12,
      ),
      unselectedLabelTextStyle: TextStyle(
        color: theme.colorScheme.onSurface.withOpacity(0.5),
        fontSize: 12,
      ),
      indicatorColor: theme.colorScheme.primary.withOpacity(0.1),
      destinations: const [
        NavigationRailDestination(
          icon: Icon(Icons.dashboard_outlined),
          selectedIcon: Icon(Icons.dashboard),
          label: Text('Dashboard'),
        ),
        NavigationRailDestination(
          icon: Icon(Icons.map_outlined),
          selectedIcon: Icon(Icons.map),
          label: Text('Heatmap'),
        ),
        NavigationRailDestination(
          icon: Icon(Icons.notifications_outlined),
          selectedIcon: Icon(Icons.notifications),
          label: Text('Alerts'),
        ),
      ],
    );
  }

  int _getSelectedIndex(String route) {
    if (route.contains('/heatmap')) return 1;
    if (route.contains('/alerts')) return 2;
    return 0;
  }
}
