import 'package:flutter/material.dart';
import 'dashboard/dashboard_view.dart';
import 'registration/student_list_view.dart';
import 'announcements/announcement_view.dart';
import 'profile/profile_view.dart';

class MainWrapper extends StatefulWidget {
  const MainWrapper({super.key});

  @override
  State<MainWrapper> createState() => _MainWrapperState();
}

class _MainWrapperState extends State<MainWrapper> {
  int _selectedIndex = 0;

  final List<Widget> _pages = [
    const DashboardView(),
    const StudentListView(),
    const AnnouncementView(),
    const ProfileView(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).colorScheme.secondary,
        unselectedItemColor: Theme.of(
          context,
        ).colorScheme.onSurfaceVariant, // Replaced hardcoded color
        selectedFontSize: 12,
        unselectedFontSize: 12,
        showUnselectedLabels: true,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_rounded),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment_rounded),
            label: 'Daftar Siswa',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.campaign_rounded),
            label: 'Info',
          ),
          BottomNavigationBarItem(
            icon: Icon(
              Icons.person_rounded,
            ), // Kept original icon, color is handled by selected/unselectedItemColor
            label: 'Akun',
          ),
        ],
      ),
    );
  }
}
