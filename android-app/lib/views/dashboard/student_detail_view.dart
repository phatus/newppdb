import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/student_provider.dart';
import '../../models/student_model.dart';

class StudentDetailView extends StatelessWidget {
  const StudentDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    final studentProv = context.watch<StudentProvider>();
    final student = studentProv.student;

    if (student == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Detail Siswa')),
        body: const Center(child: Text('Data siswa tidak ditemukan.')),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        title: const Text(
          'Detail Calon Siswa',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        actions: [
          if (student.statusVerifikasi == 'PENDING' ||
              student.statusVerifikasi == 'DRAFT')
            IconButton(
              icon: const Icon(Icons.edit_outlined, color: Color(0xFF00DDCB)),
              onPressed: () {
                // Future implementation: Pre-fill RegistrationView or similar
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text(
                      'Gunakan menu Pendaftaran untuk memperbarui data.',
                    ),
                  ),
                );
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildProfileHeader(student),
            const SizedBox(height: 24),
            _buildInfoCard('Informasi Personal', [
              _buildInfoRow('Nama Lengkap', student.namaLengkap),
              _buildInfoRow('NISN', student.nisn),
              _buildInfoRow('NIK', student.nik ?? '-'),
              _buildInfoRow('Jenis Kelamin', student.gender ?? '-'),
              _buildInfoRow('Tempat Lahir', student.tempatLahir ?? '-'),
              _buildInfoRow(
                'Tanggal Lahir',
                student.tanggalLahir != null
                    ? DateFormat(
                        'dd MMMM yyyy',
                        'id_ID',
                      ).format(student.tanggalLahir!)
                    : '-',
              ),
            ]),
            const SizedBox(height: 16),
            _buildInfoCard('Kontak & Sekolah', [
              _buildInfoRow('No. WhatsApp', student.telepon ?? '-'),
              _buildInfoRow('Asal Sekolah', student.asalSekolah ?? '-'),
              _buildInfoRow(
                'Jalur',
                student.jalur?.replaceAll('_', ' ') ?? '-',
              ),
              _buildInfoRow('Alamat', student.alamatLengkap ?? '-'),
            ]),
            const SizedBox(height: 16),
            _buildInfoCard('Informasi Orang Tua', [
              _buildInfoRow('Nama Ayah', student.namaAyah ?? '-'),
              _buildInfoRow('Pekerjaan Ayah', student.pekerjaanAyah ?? '-'),
              _buildInfoRow('Nama Ibu', student.namaIbu ?? '-'),
              _buildInfoRow('Pekerjaan Ibu', student.pekerjaanIbu ?? '-'),
              _buildInfoRow('Penghasilan', student.penghasilanOrtu ?? '-'),
            ]),
            const SizedBox(height: 16),
            if (student.catatanPenolakan != null &&
                student.catatanPenolakan!.isNotEmpty)
              _buildWarningCard('Catatan Panitia', student.catatanPenolakan!),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(Student student) {
    String? photoUrl = student.documents?['pasFoto'];
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
        children: [
          CircleAvatar(
            radius: 50,
            backgroundColor: const Color(0xFF00DDCB).withValues(alpha: 0.1),
            backgroundImage: photoUrl != null ? NetworkImage(photoUrl) : null,
            child: photoUrl == null
                ? const Icon(Icons.person, size: 50, color: Color(0xFF00DDCB))
                : null,
          ),
          const SizedBox(height: 16),
          Text(
            student.namaLengkap,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _getStatusColor(
                student.statusVerifikasi,
              ).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              student.statusVerifikasi ?? 'PENDING',
              style: TextStyle(
                color: _getStatusColor(student.statusVerifikasi),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(String title, List<Widget> children) {
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

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(color: Colors.grey, fontSize: 13),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWarningCard(String title, String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.red[100]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.warning_amber_rounded,
                color: Colors.red,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Colors.red,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(message, style: TextStyle(fontSize: 13, color: Colors.red[900])),
        ],
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'VERIFIED':
        return Colors.green;
      case 'REJECTED':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }
}
