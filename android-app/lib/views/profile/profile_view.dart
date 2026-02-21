import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/student_provider.dart';

class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final studentProv = context.watch<StudentProvider>();
    final account =
        studentProv.accountData; // Get real-time data from StudentProvider
    final user = auth.user; // Context user

    final dispName = account?['name'] ?? user?['name'] ?? 'Pendaftar';
    final dispEmail = account?['email'] ?? user?['email'] ?? '-';
    final dispRole = account?['role'] ?? user?['role'] ?? 'USER';

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text(
          'Akun Pendaftar',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            _buildAccountHeader(dispName, dispEmail),
            const SizedBox(height: 32),
            _buildInfoSection('Rincian Akun', [
              _buildInfoRow(Icons.person_outline, 'Nama Akun', dispName),
              _buildInfoRow(Icons.email_outlined, 'Email', dispEmail),
              _buildInfoRow(
                Icons.admin_panel_settings_outlined,
                'Role',
                dispRole,
              ),
            ]),
            const SizedBox(height: 16),
            _buildSettingsSection(context, auth),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountHeader(String name, String email) {
    return Column(
      children: [
        CircleAvatar(
          radius: 50,
          backgroundColor: const Color(0xFF00DDCB).withValues(alpha: 0.1),
          child: const Icon(Icons.person, size: 50, color: Color(0xFF00DDCB)),
        ),
        const SizedBox(height: 16),
        Text(
          name,
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(email, style: const TextStyle(fontSize: 14, color: Colors.grey)),
      ],
    );
  }

  Widget _buildInfoSection(String title, List<Widget> children) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF00DDCB)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(BuildContext context, AuthProvider auth) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        children: [
          _buildSettingsTile(Icons.lock_outline, 'Ubah Kata Sandi', () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Ubah kata sandi tersedia di website.'),
              ),
            );
          }),
          const Divider(height: 1),
          _buildSettingsTile(
            Icons.logout_rounded,
            'Keluar',
            () => _showLogoutDialog(context, auth),
            isDestructive: true,
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsTile(
    IconData icon,
    String label,
    VoidCallback onTap, {
    bool isDestructive = false,
  }) {
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, color: isDestructive ? Colors.red : Colors.black87),
      title: Text(
        label,
        style: TextStyle(
          fontSize: 14,
          color: isDestructive ? Colors.red : Colors.black87,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(Icons.chevron_right, size: 20),
      dense: true,
    );
  }

  void _showLogoutDialog(BuildContext context, AuthProvider auth) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Keluar'),
        content: const Text('Apakah Anda yakin ingin keluar?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              context.read<StudentProvider>().clearData();
              auth.logout();
            },
            child: const Text(
              'Ya, Keluar',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}
