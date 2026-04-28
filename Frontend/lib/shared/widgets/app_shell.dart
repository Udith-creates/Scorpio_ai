import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/alerts/widgets/alert_banner.dart';
import 'nav_rail.dart';

class AppShell extends StatelessWidget {
  final Widget child;

  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;

    return Scaffold(
      body: Row(
        children: [
          NavRail(currentRoute: location),
          Expanded(
            child: Column(
              children: [
                const AlertBanner(),
                Expanded(child: child),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
