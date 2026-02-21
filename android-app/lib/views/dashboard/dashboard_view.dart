import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/student_provider.dart';
import '../registration/registration_view.dart';
import '../documents/document_upload_view.dart';
import '../announcements/announcement_view.dart';
import 'student_detail_view.dart';
import '../../models/student_model.dart';

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
    final studentProv = context.watch<StudentProvider>();
    final auth = context.watch<AuthProvider>();
    final students = studentProv.students;
    final student = studentProv.student;
    final account = studentProv.accountData;

    // Calculate progress
    double progress = 0.0;
    if (student != null) {
      if (student.statusVerifikasi == 'PENDING') progress = 0.5;
      if (student.statusVerifikasi == 'VERIFIED') progress = 1.0;
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => studentProv.refreshProfile(),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                _buildHeader(auth, account, student),
                if (students.length > 1) ...[
                  const SizedBox(height: 20),
                  _buildStudentSwitcher(studentProv),
                ],
                const SizedBox(height: 20),
                _buildRegistrationBanner(context, student),
                if (student == null && !studentProv.isLoading) ...[
                  const SizedBox(height: 10),
                  _buildDiagnosticInfo(studentProv),
                ],
                const SizedBox(height: 20),
                _buildStatusCard(student, progress),
                const SizedBox(height: 30),
                _buildMenuGrid(context, student),
                const SizedBox(height: 30),
                _buildInfoSection(context, studentProv),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(
    AuthProvider auth,
    Map<String, dynamic>? account,
    Student? student,
  ) {
    String? photoUrl = student?.documents?['pasFoto'];
    final name = account?['name'] ?? auth.user?['name'] ?? 'Pendaftar';
    final email = account?['email'] ?? auth.user?['email'] ?? '-';

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Selamat Datang,',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            Text(
              name,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            Text(
              email,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF00DDCB),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        CircleAvatar(
          radius: 24,
          backgroundColor: const Color(0xFF00DDCB).withValues(alpha: 0.1),
          backgroundImage: photoUrl != null ? NetworkImage(photoUrl) : null,
          child: photoUrl == null
              ? const Icon(Icons.person, color: Color(0xFF00DDCB))
              : null,
        ),
      ],
    );
  }

  Widget _buildStudentSwitcher(StudentProvider prov) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Pilih Siswa:',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 40,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: prov.students.length,
            separatorBuilder: (context, index) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final s = prov.students[index];
              final isSelected = prov.selectedStudentIndex == index;
              return InkWell(
                onTap: () => prov.selectStudent(index),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF00DDCB) : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF00DDCB)
                          : Colors.grey[300]!,
                    ),
                  ),
                  child: Text(
                    s.namaLengkap,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.normal,
                      color: isSelected ? Colors.white : Colors.black87,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRegistrationBanner(BuildContext context, Student? student) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF00DDCB), Color(0xFF00BFA5)],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00DDCB).withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Daftarkan Murid Baru',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Satu akun bisa daftar lebih dari 1 siswa.',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.9),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const RegistrationView()),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF00BFA5),
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              minimumSize: Size.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text(
              'Tambah',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard(Student? student, double progress) {
    String statusLabel = student == null
        ? 'Belum Terdaftar'
        : (student.statusVerifikasi == 'VERIFIED'
              ? 'Terverifikasi'
              : 'Belum Lengkap');
    Color statusColor =
        student != null && student.statusVerifikasi == 'VERIFIED'
        ? const Color(0xFF00DDCB)
        : Colors.orange;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Status Pendaftaran',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[600],
                ),
              ),
              if (student != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    statusLabel,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            student?.namaLengkap ?? 'Silakan Klik Tombol Tambah',
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: Colors.grey[200],
            color: const Color(0xFF00DDCB),
            minHeight: 8,
            borderRadius: BorderRadius.circular(10),
          ),
          const SizedBox(height: 8),
          Text(
            student == null
                ? 'Anda belum mendaftarkan calon siswa'
                : 'Lengkapi dokumen untuk mempercepat verifikasi.',
            style: const TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuGrid(BuildContext context, Student? student) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 4,
      mainAxisSpacing: 20,
      crossAxisSpacing: 16,
      childAspectRatio: 0.72,
      children: [
        _buildMenuCard(
          context,
          Icons.badge_outlined,
          'Data Diri',
          const StudentDetailView(),
        ),
        _buildMenuCard(
          context,
          Icons.file_copy_outlined,
          'Dokumen',
          const DocumentUploadView(),
        ),
        _buildMenuCard(context, Icons.event_note_rounded, 'Jadwal', null),
        _buildMenuCard(
          context,
          Icons.assignment_turned_in_outlined,
          'Hasil Seleksi',
          null,
        ),
        _buildPrintCard('Bukti Daftar', student?.id),
        _buildPrintCard('Kartu Ujian', student?.id, isExamCard: true),
      ],
    );
  }

  Widget _buildMenuCard(
    BuildContext context,
    IconData icon,
    String label,
    Widget? destination,
  ) {
    return Column(
      children: [
        InkWell(
          onTap: () {
            if (destination != null) {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => destination),
              );
            }
          },
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: const Color(0xFF00DDCB), size: 24),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _buildPrintCard(
    String label,
    String? studentId, {
    bool isExamCard = false,
  }) {
    return Column(
      children: [
        InkWell(
          onTap: () {
            if (studentId != null) {
              final type = isExamCard ? 'exam-card' : 'registration-proof';
              final url =
                  'https://pmbm.mtsn1pacitan.sch.id/dashboard/student/$type?studentId=$studentId';
              launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
            }
          },
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF3F51B5).withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: const Color(0xFF3F51B5).withValues(alpha: 0.1),
              ),
            ),
            child: Icon(
              isExamCard ? Icons.card_membership_rounded : Icons.print_outlined,
              color: const Color(0xFF3F51B5),
              size: 24,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoSection(BuildContext context, StudentProvider prov) {
    final announcements = prov.announcements;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Info Terbaru',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            TextButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const AnnouncementView()),
              ),
              child: const Text(
                'Lihat Semua',
                style: TextStyle(color: Color(0xFF00DDCB)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: announcements.isEmpty
              ? const Padding(
                  padding: EdgeInsets.all(16),
                  child: Center(
                    child: Text(
                      'Belum ada pengumuman terbaru.',
                      style: TextStyle(color: Colors.grey, fontSize: 13),
                    ),
                  ),
                )
              : ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: announcements.take(3).length, // Show top 3
                  separatorBuilder: (context, index) =>
                      const Divider(height: 24),
                  itemBuilder: (context, index) {
                    final a = announcements[index];
                    return _InfoItem(
                      title: a.title,
                      date: DateFormat('dd MMM yyyy').format(a.createdAt),
                      isNew: index == 0,
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildDiagnosticInfo(StudentProvider prov) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue[100]!),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, color: Colors.blue, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              'Data tidak muncul? Coba tekan tombol Segarkan.',
              style: TextStyle(fontSize: 11, color: Colors.blue[900]),
            ),
          ),
          TextButton(
            onPressed: () => prov.refreshProfile(),
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text(
              'Segarkan',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final String title;
  final String date;
  final bool isNew;

  const _InfoItem({
    required this.title,
    required this.date,
    this.isNew = false,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: isNew ? const Color(0xFF00DDCB) : Colors.grey[300],
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                date,
                style: TextStyle(fontSize: 11, color: Colors.grey[500]),
              ),
            ],
          ),
        ),
        const Icon(Icons.chevron_right, size: 16, color: Colors.grey),
      ],
    );
  }
}
