import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/student_provider.dart';
import '../registration/registration_view.dart';
import '../announcements/announcement_view.dart';
import 'registration_proof_view.dart';
import 'exam_card_view.dart';
import '../ranking/ranking_view.dart';
import 'registration_history_view.dart';
import 'student_detail_view.dart';
import '../../models/student_model.dart';
import '../../models/wave_model.dart';
import '../../core/api_client.dart';

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
          onRefresh: () async {
            await studentProv.refreshProfile();
            await studentProv.fetchSettings();
          },
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
                _buildStatusBanners(studentProv, student),
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
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.secondary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        CircleAvatar(
          radius: 24,
          backgroundColor: Theme.of(
            context,
          ).colorScheme.secondary.withValues(alpha: 0.1),
          backgroundImage: photoUrl != null
              ? NetworkImage(ApiClient.getAssetUrl(photoUrl))
              : null,
          child: photoUrl == null
              ? Icon(
                  Icons.person,
                  color: Theme.of(context).colorScheme.secondary,
                )
              : null,
        ),
      ],
    );
  }

  Widget _buildStudentSwitcher(StudentProvider prov) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Row(
        children: [
          const Icon(Icons.people_outline, size: 20, color: Colors.grey),
          const SizedBox(width: 12),
          Expanded(
            child: DropdownButtonHideUnderline(
              child: DropdownButton<int>(
                value: prov.selectedStudentIndex,
                isExpanded: true,
                items: List.generate(prov.students.length, (index) {
                  final s = prov.students[index];
                  return DropdownMenuItem(
                    value: index,
                    child: Text(
                      s.namaLengkap,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  );
                }),
                onChanged: (val) {
                  if (val != null) prov.selectStudent(val);
                },
              ),
            ),
          ),
        ],
      ),
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
              MaterialPageRoute(
                builder: (_) => const RegistrationView(student: null),
              ),
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

  Widget _buildStatusBanners(StudentProvider prov, Student? student) {
    if (student == null) {
      return Column(
        children: [
          _buildRegistrationBanner(context, null),
          if (!prov.isLoading) ...[
            const SizedBox(height: 10),
            _buildDiagnosticInfo(prov),
          ],
        ],
      );
    }

    final isLulus = student.statusKelulusan == 'LULUS';
    final isTidakLulus = student.statusKelulusan == 'TIDAK_LULUS';

    List<Widget> banners = [];

    // 1. Graduation Banner
    if (isLulus) {
      banners.add(
        _buildFancyBanner(
          title: 'Selamat! Anda Dinyatakan LULUS',
          subtitle:
              'Silakan lakukan daftar ulang sesuai jadwal yang ditentukan.',
          icon: Icons.celebration,
          color: Colors.green,
        ),
      );
    } else if (isTidakLulus) {
      final activeWave = prov.activeWaves.isNotEmpty
          ? prov.activeWaves.first
          : null;
      bool canReRegister =
          activeWave != null && activeWave.id != student.waveId;

      banners.add(
        _buildFancyBanner(
          title: 'Mohon Maaf, Belum Lulus',
          subtitle: 'Jangan berkecil hati, tetap semangat menuntut ilmu.',
          icon: Icons.sentiment_dissatisfied,
          color: Colors.red,
          action: Wrap(
            spacing: 8,
            children: [
              if (canReRegister)
                ElevatedButton(
                  onPressed: () => _showReRegistrationDialog(
                    context,
                    prov,
                    student,
                    activeWave,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: Colors.red,
                    elevation: 0,
                    side: const BorderSide(color: Colors.red),
                  ),
                  child: const Text(
                    'Daftar Gelombang Selanjutnya',
                    style: TextStyle(fontSize: 10),
                  ),
                ),
              if (student.history != null && student.history!.isNotEmpty)
                TextButton(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => RegistrationHistoryView(student: student),
                    ),
                  ),
                  child: const Text(
                    'Lihat Riwayat',
                    style: TextStyle(
                      fontSize: 10,
                      color: Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ),
      );
    }

    if (banners.isEmpty) return _buildRegistrationBanner(context, student);

    return Column(children: banners);
  }

  Widget _buildFancyBanner({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    Widget? action,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: color is MaterialColor ? color[900] : color,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11,
                    color: color is MaterialColor ? color[700] : color,
                  ),
                ),
                if (action != null) ...[const SizedBox(height: 12), action],
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showReRegistrationDialog(
    BuildContext context,
    StudentProvider prov,
    Student student,
    Wave wave,
  ) {
    String? selectedJalur;
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text('Daftar Ulang: ${wave.name}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Silakan pilih jalur pendaftaran baru untuk mendaftar ulang.',
                style: TextStyle(fontSize: 13),
              ),
              const SizedBox(height: 16),
              ...wave.jalurAllowed.map(
                (j) => RadioListTile<String>(
                  title: Text(
                    j.toString().replaceAll('_', ' '),
                    style: const TextStyle(fontSize: 13),
                  ),
                  value: j.toString(),
                  groupValue: selectedJalur,
                  onChanged: (v) => setDialogState(() => selectedJalur = v),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              onPressed: selectedJalur == null
                  ? null
                  : () async {
                      final res = await prov.reRegisterStudent(
                        student.id,
                        selectedJalur!,
                      );
                      if (context.mounted) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(res['message']),
                            backgroundColor: res['success']
                                ? Colors.green
                                : Colors.red,
                          ),
                        );
                      }
                    },
              child: const Text('Daftar Sekarang'),
            ),
          ],
        ),
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
        ? Theme.of(context).colorScheme.secondary
        : Colors.orange;

    final missingDocs = context.read<StudentProvider>().getMissingDocuments();

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
            color: Theme.of(context).colorScheme.secondary,
            minHeight: 8,
            borderRadius: BorderRadius.circular(10),
          ),
          const SizedBox(height: 12),
          if (student != null && missingDocs.isNotEmpty) ...[
            Text(
              'Dokumen Belum Lengkap:',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Colors.red[700],
              ),
            ),
            const SizedBox(height: 4),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: missingDocs
                  .map(
                    (doc) => Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: Colors.red[100]!),
                      ),
                      child: Text(
                        doc,
                        style: TextStyle(fontSize: 9, color: Colors.red[900]),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ] else ...[
            Text(
              student == null
                  ? 'Anda belum mendaftarkan calon siswa'
                  : 'Dokumen lengkap. Menunggu verifikasi panitia.',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
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
          student != null
              ? RegistrationView(student: student, initialStep: 4)
              : null,
        ),
        _buildMenuCard(
          context,
          Icons.grade_outlined,
          'Nilai Raport',
          student != null
              ? RegistrationView(student: student, initialStep: 5)
              : null,
        ),
        _buildMenuCard(
          context,
          Icons.event_note_rounded,
          'Jadwal',
          null,
          onTap: () => _showExamSchedule(context),
        ),
        _buildMenuCard(
          context,
          Icons.assignment_turned_in_outlined,
          'Hasil Seleksi',
          null,
          onTap: () => _showSelectionResult(context, student),
        ),
        _buildMenuCard(
          context,
          Icons.leaderboard_outlined,
          'Ranking',
          const RankingView(),
        ),
        _buildMenuCard(
          context,
          Icons.history_rounded,
          'Riwayat',
          student != null ? RegistrationHistoryView(student: student) : null,
        ),
        _buildPrintCard(context, 'Bukti Daftar', student?.id),
        _buildPrintCard(context, 'Kartu Ujian', student?.id, isExamCard: true),
      ],
    );
  }

  Widget _buildMenuCard(
    BuildContext context,
    IconData icon,
    String label,
    Widget? destination, {
    VoidCallback? onTap,
  }) {
    return Column(
      children: [
        InkWell(
          onTap: () {
            if (onTap != null) {
              onTap();
            } else if (destination != null) {
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
            child: Icon(
              icon,
              color: Theme.of(context).colorScheme.secondary,
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

  Widget _buildPrintCard(
    BuildContext context,
    String label,
    String? studentId, {
    bool isExamCard = false,
  }) {
    return Column(
      children: [
        InkWell(
          onTap: () {
            if (studentId != null) {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => isExamCard
                      ? const ExamCardView()
                      : const RegistrationProofView(),
                ),
              );
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

  void _showExamSchedule(BuildContext context) {
    final schedules = context.read<StudentProvider>().examSchedules;

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Jadwal Ujian',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (schedules.isEmpty)
              const Center(child: Text('Jadwal belum tersedia.'))
            else
              Flexible(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: schedules.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (_, index) {
                    final s = schedules[index];
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00DDCB).withValues(alpha: 0.1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.event,
                          color: Color(0xFF00DDCB),
                          size: 20,
                        ),
                      ),
                      title: Text(
                        s.subject,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text('${s.dayDate} • ${s.time}'),
                    );
                  },
                ),
              ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Tutup'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSelectionResult(BuildContext context, Student? student) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) {
        final status = student?.statusKelulusan ?? 'PENDING';
        final isAccepted = status == 'LULUS';
        final isRejected = status == 'TIDAK_LULUS';

        return Container(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isAccepted
                    ? Icons.check_circle_rounded
                    : (isRejected
                          ? Icons.cancel_rounded
                          : Icons.hourglass_empty_rounded),
                size: 64,
                color: isAccepted
                    ? Colors.green
                    : (isRejected ? Colors.red : Colors.orange),
              ),
              const SizedBox(height: 24),
              const Text(
                'Hasil Seleksi',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Text(
                isAccepted
                    ? 'SELAMAT! Anda dinyatakan Lulus Seleksi PMBM.'
                    : (isRejected
                          ? 'MAAF, Anda dinyatakan Tidak Lulus Seleksi.'
                          : 'Hasil seleksi belum diumumkan. Silakan cek berkala.'),
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, height: 1.5),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Tutup'),
                ),
              ),
            ],
          ),
        );
      },
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
              child: Text(
                'Lihat Semua',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.secondary,
                ),
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
            color: isNew
                ? Theme.of(context).colorScheme.secondary
                : Colors.grey[300],
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
