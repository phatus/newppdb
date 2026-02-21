import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/student_provider.dart';
import '../registration/registration_view.dart';
import '../documents/document_upload_view.dart';
import '../announcements/announcement_view.dart';
import '../ranking/ranking_view.dart';
import '../profile/profile_view.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StudentProvider>().refreshProfile();
      context.read<StudentProvider>().fetchSettings();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final studentProv = context.watch<StudentProvider>();
    final user = auth.user;
    final student = studentProv.student;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard Siswa'),
        actions: [
          IconButton(
            icon: const Icon(Icons.campaign),
            tooltip: 'Pengumuman',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AnnouncementView()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => auth.logout(),
          ),
        ],
      ),
      body: studentProv.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: () => studentProv.refreshProfile(),
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                physics: const AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeroCard(context, user, student),
                    const SizedBox(height: 24),
                    if (!studentProv.isRegistered) _buildRegisterAlert(context),
                    const SizedBox(height: 24),
                    Text(
                      'Menu Utama',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    GridView.count(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisCount: 2,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      children: [
                        _buildMenuCard(
                          context,
                          'Profil Saya',
                          Icons.person,
                          Colors.blue,
                          () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const ProfileView(),
                              ),
                            );
                          },
                        ),
                        _buildMenuCard(
                          context,
                          'Pendaftaran',
                          Icons.assignment,
                          Colors.orange,
                          () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const RegistrationView(),
                              ),
                            );
                          },
                        ),
                        _buildMenuCard(
                          context,
                          'Upload Berkas',
                          Icons.cloud_upload,
                          Colors.purple,
                          () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const DocumentUploadView(),
                              ),
                            );
                          },
                        ),
                        _buildMenuCard(
                          context,
                          'Cek Ranking',
                          Icons.format_list_numbered,
                          Colors.red,
                          () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const RankingView(),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildHeroCard(BuildContext context, user, student) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Theme.of(context).primaryColor, Colors.green[800]!],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Selamat Datang,',
              style: TextStyle(color: Colors.white70, fontSize: 16),
            ),
            Text(
              student?.namaLengkap ??
                  user?['name'] ??
                  user?['email'] ??
                  'Siswa',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    student != null
                        ? 'Status: ${student.statusVerifikasi}'
                        : 'Belum Terdaftar',
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ),
                if (student?.jalur != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Jalur: ${student.jalur}',
                      style: const TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRegisterAlert(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.orange[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.orange[200]!),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: Colors.orange),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Pendaftaran Belum Lengkap',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.orange,
                  ),
                ),
                const Text(
                  'Silakan lengkapi formulir pendaftaran.',
                  style: TextStyle(fontSize: 12),
                ),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const RegistrationView(),
                      ),
                    );
                  },
                  child: const Text('Lengkapi Sekarang →'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: color),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
