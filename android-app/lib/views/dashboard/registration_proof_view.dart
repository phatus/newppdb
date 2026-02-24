import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/student_provider.dart';
import '../../models/student_model.dart';
import '../../core/api_client.dart';
import 'package:intl/intl.dart';

class RegistrationProofView extends StatelessWidget {
  const RegistrationProofView({super.key});

  @override
  Widget build(BuildContext context) {
    final studentProv = context.watch<StudentProvider>();
    final student = studentProv.student;
    final settings = studentProv.settings;

    if (student == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Bukti Pendaftaran')),
        body: const Center(child: Text('Data siswa tidak ditemukan')),
      );
    }

    final schoolName = settings['schoolName'] ?? 'MTsN 1 PACITAN';
    final academicYear = settings['academicYear'] ?? '2025/2026';
    final logoUrl = settings['schoolLogo'];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Bukti Pendaftaran'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined),
            onPressed: () {
              // TODO: Implement share as Image/PDF
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Container(
          color: Colors.white,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  if (logoUrl != null)
                    Image.network(
                      ApiClient.getAssetUrl(logoUrl),
                      height: 60,
                      width: 60,
                    )
                  else
                    const Icon(Icons.school, size: 60, color: Colors.green),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'PANITIA PENERIMAAN PESERTA DIDIK BARU',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          schoolName.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                        Text(
                          'TAHUN PELAJARAN $academicYear',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(thickness: 2, height: 32),

              // Title
              Center(
                child: Column(
                  children: [
                    const Text(
                      'TANDA TERIMA PENDAFTARAN',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      student.statusVerifikasi == 'VERIFIED'
                          ? 'Nomor Registrasi: ${student.nomorUjian ?? "-"}'
                          : 'Nomor Registrasi: (Akan muncul setelah verifikasi)',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Data Table
              _buildInfoRow('Nama Lengkap', student.namaLengkap),
              _buildInfoRow('NISN', student.nisn),
              _buildInfoRow('Asal Sekolah', student.asalSekolah ?? '-'),
              _buildInfoRow(
                'Tempat, Tgl Lahir',
                '${student.tempatLahir ?? '-'}, ${student.tanggalLahir != null ? DateFormat('dd MMMM yyyy').format(student.tanggalLahir!) : '-'}',
              ),
              _buildInfoRow('Jenis Kelamin', student.gender ?? '-'),
              _buildInfoRow(
                'Jalur Pendaftaran',
                student.jalur?.replaceAll('_', ' ') ?? '-',
              ),
              _buildInfoRow(
                'Waktu Daftar',
                DateFormat(
                  'dd/MM/yyyy HH:mm',
                ).format(student.createdAt ?? DateTime.now()),
              ),

              const SizedBox(height: 32),
              const Text(
                'KELENGKAPAN DOKUMEN:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              ),
              const SizedBox(height: 8),
              _buildDocChecklist(student),

              const SizedBox(height: 40),

              // Signature Area
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Column(
                    children: [
                      Text(
                        '${settings["schoolCity"] ?? "Pacitan"}, ${DateFormat("dd MMMM yyyy").format(student.createdAt ?? DateTime.now())}',
                      ),
                      const Text('Panitia PPDB,'),
                      const SizedBox(height: 8),
                      if (settings['committeeSignature'] != null)
                        Image.network(
                          ApiClient.getAssetUrl(settings['committeeSignature']),
                          height: 50,
                          fit: BoxFit.contain,
                        )
                      else
                        const SizedBox(height: 50),
                      Text(
                        settings['committeeName'] ??
                            '--------------------------',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      if (settings['committeeNip'] != null)
                        Text('NIP. ${settings["committeeNip"]}'),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 40),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey[300]!),
                ),
                child: const Text(
                  'Catatan: Bukti tanda terima ini adalah sah dihasilkan oleh sistem dan digunakan sebagai syarat verifikasi berkas luring.',
                  style: TextStyle(fontSize: 10, fontStyle: FontStyle.italic),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
            ),
          ),
          const Text(': ', style: TextStyle(fontWeight: FontWeight.bold)),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocChecklist(Student student) {
    final docs = student.documents ?? {};
    final list = [
      {'label': 'Kartu Keluarga', 'status': docs['fileKK'] != null},
      {'label': 'Akta Kelahiran', 'status': docs['fileAkta'] != null},
      {'label': 'Pas Foto 3x4', 'status': docs['pasFoto'] != null},
      {'label': 'Raport Semester 1-5', 'status': student.grades != null},
    ];

    return Column(
      children: list.map((item) {
        return Row(
          children: [
            Icon(
              item['status'] == true
                  ? Icons.check_box_outlined
                  : Icons.check_box_outline_blank,
              size: 18,
              color: item['status'] == true ? Colors.green : Colors.grey,
            ),
            const SizedBox(width: 8),
            Text(item['label'] as String, style: const TextStyle(fontSize: 12)),
          ],
        );
      }).toList(),
    );
  }
}
