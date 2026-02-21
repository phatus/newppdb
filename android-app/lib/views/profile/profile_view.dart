import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/student_provider.dart';

class ProfileView extends StatefulWidget {
  const ProfileView({super.key});

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StudentProvider>().refreshProfile();
    });
  }

  @override
  Widget build(BuildContext context) {
    final studentProv = context.watch<StudentProvider>();
    final student = studentProv.student;

    return Scaffold(
      appBar: AppBar(title: const Text('Profil Saya')),
      body: studentProv.isLoading
          ? const Center(child: CircularProgressIndicator())
          : student == null
          ? const Center(
              child: Text(
                'Data profil belum tersedia. Silakan daftar terlebih dahulu.',
              ),
            )
          : RefreshIndicator(
              onRefresh: () => studentProv.refreshProfile(),
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Avatar
                  Center(
                    child: CircleAvatar(
                      radius: 48,
                      backgroundColor: Theme.of(context).primaryColor,
                      child: Text(
                        student.namaLengkap.isNotEmpty
                            ? student.namaLengkap[0].toUpperCase()
                            : '?',
                        style: const TextStyle(
                          fontSize: 36,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Center(
                    child: Text(
                      student.namaLengkap,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Center(
                    child: Text(
                      'NISN: ${student.nisn}',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _statusColor(
                          student.statusVerifikasi,
                        ).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        student.statusVerifikasi ?? 'PENDING',
                        style: TextStyle(
                          color: _statusColor(student.statusVerifikasi),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  _buildInfoTile('NIK', student.nik ?? '-'),
                  _buildInfoTile('Jenis Kelamin', student.gender ?? '-'),
                  _buildInfoTile('Tempat Lahir', student.tempatLahir ?? '-'),
                  _buildInfoTile('Asal Sekolah', student.asalSekolah ?? '-'),
                  _buildInfoTile('No. WhatsApp', student.telepon ?? '-'),
                  _buildInfoTile(
                    'Jalur Pendaftaran',
                    student.jalur?.replaceAll('_', ' ') ?? '-',
                  ),
                  const Divider(height: 32),
                  Text(
                    'Status Kelulusan',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          Icon(
                            student.statusKelulusan == 'LULUS'
                                ? Icons.check_circle
                                : Icons.hourglass_top,
                            color: _kelulusanColor(student.statusKelulusan),
                            size: 32,
                          ),
                          const SizedBox(width: 12),
                          Text(
                            student.statusKelulusan ?? 'BELUM DITENTUKAN',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: _kelulusanColor(student.statusKelulusan),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildInfoTile(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(label, style: TextStyle(color: Colors.grey[600])),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'VERIFIED':
        return Colors.green;
      case 'REJECTED':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  Color _kelulusanColor(String? status) {
    switch (status) {
      case 'LULUS':
        return Colors.green;
      case 'TIDAK_LULUS':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
