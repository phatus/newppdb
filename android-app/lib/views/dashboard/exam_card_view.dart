import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/student_provider.dart';
import '../../core/api_client.dart';
import 'package:intl/intl.dart';

class ExamCardView extends StatelessWidget {
  const ExamCardView({super.key});

  @override
  Widget build(BuildContext context) {
    final studentProv = context.watch<StudentProvider>();
    final student = studentProv.student;
    final settings = studentProv.settings;
    final schedules = studentProv.examSchedules;

    if (student == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Kartu Ujian')),
        body: const Center(child: Text('Data siswa tidak ditemukan')),
      );
    }

    if (student.statusVerifikasi != 'VERIFIED') {
      return Scaffold(
        appBar: AppBar(title: const Text('Kartu Ujian')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.lock_clock_outlined,
                  size: 64,
                  color: Colors.orange,
                ),
                const SizedBox(height: 16),
                const Text(
                  'Kartu Ujian Belum Tersedia',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Kartu ujian hanya dapat diakses setelah data Anda diverifikasi oleh panitia.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Kembali'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final schoolName = settings['schoolName'] ?? 'MTsN 1 PACITAN';
    final academicYear = settings['academicYear'] ?? '2025/2026';
    final logoUrl = settings['schoolLogo'];
    final photoUrl = student.documents?['pasFoto'];

    return Scaffold(
      backgroundColor: Colors.grey[200],
      appBar: AppBar(title: const Text('Kartu Peserta Ujian')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 10,
              ),
            ],
          ),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: const BoxDecoration(
                  color: Colors.green,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(16),
                    topRight: Radius.circular(16),
                  ),
                ),
                child: Row(
                  children: [
                    if (logoUrl != null)
                      CircleAvatar(
                        backgroundColor: Colors.white,
                        radius: 25,
                        backgroundImage: NetworkImage(
                          ApiClient.getAssetUrl(logoUrl),
                        ),
                      )
                    else
                      const Icon(Icons.school, color: Colors.white, size: 40),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            schoolName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          Text(
                            'KARTU PESERTA UJIAN $academicYear',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Photo
                        Container(
                          width: 100,
                          height: 130,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey[300]!),
                            borderRadius: BorderRadius.circular(8),
                            image: photoUrl != null
                                ? DecorationImage(
                                    image: NetworkImage(
                                      ApiClient.getAssetUrl(photoUrl),
                                    ),
                                    fit: BoxFit.cover,
                                  )
                                : null,
                          ),
                          child: photoUrl == null
                              ? const Icon(
                                  Icons.person,
                                  size: 50,
                                  color: Colors.grey,
                                )
                              : null,
                        ),
                        const SizedBox(width: 20),
                        // Basic Info
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildStaticRow('NAMA', student.namaLengkap),
                              _buildStaticRow('NISN', student.nisn),
                              _buildStaticRow(
                                'ASAL',
                                student.asalSekolah?.toUpperCase() ?? '-',
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'NOMOR UJIAN:',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                student.nomorUjian ?? 'MENUNGGU...',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green,
                                ),
                              ),
                              if (student.passwordCbt != null) ...[
                                const SizedBox(height: 12),
                                const Text(
                                  'PASSWORD CBT:',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[200],
                                    border: Border.all(
                                      color: Colors.grey[400]!,
                                    ),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    student.passwordCbt!,
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 40),
                    // Schedule Table
                    const Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'JADWAL UJIAN:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildScheduleTable(schedules),
                    const SizedBox(height: 24),
                    // Notes
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.yellow[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.yellow[200]!),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Catatan:',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            '1. Harap membawa kartu ini saat ujian.',
                            style: TextStyle(fontSize: 10),
                          ),
                          Text(
                            '2. Datang 15 menit sebelum ujian dimulai.',
                            style: TextStyle(fontSize: 10),
                          ),
                          Text(
                            '3. Berpakaian rapi dan sopan sesuai ketentuan.',
                            style: TextStyle(fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Expanded(
                          child: Text(
                            '* Kartu ini adalah bukti sah mengikuti ujian seleksi.\n* Harap dibawa saat pelaksanaan ujian beserta alat tulis.',
                            style: TextStyle(
                              fontSize: 9,
                              fontStyle: FontStyle.italic,
                              color: Colors.grey,
                            ),
                          ),
                        ),
                        Text(
                          'Printed: ${DateFormat("dd/MM/yyyy").format(DateTime.now())}',
                          style: const TextStyle(
                            fontSize: 9,
                            color: Colors.grey,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStaticRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 9,
              color: Colors.grey,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            value,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleTable(List<dynamic> schedules) {
    if (schedules.isEmpty) {
      return const Text('Jadwal belum diatur.', style: TextStyle(fontSize: 11));
    }

    return Table(
      border: TableBorder.all(color: Colors.grey[300]!),
      columnWidths: const {
        0: FlexColumnWidth(2),
        1: FlexColumnWidth(2),
        2: FlexColumnWidth(3),
      },
      children: [
        const TableRow(
          decoration: BoxDecoration(color: Color(0xFFEEEEEE)),
          children: [
            Padding(
              padding: EdgeInsets.all(8),
              child: Text(
                'Hari, Tgl',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(8),
              child: Text(
                'Waktu',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(8),
              child: Text(
                'Mata Pelajaran',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 10),
              ),
            ),
          ],
        ),
        ...schedules.map(
          (s) => TableRow(
            children: [
              Padding(
                padding: EdgeInsets.all(8),
                child: Text(s.dayDate, style: const TextStyle(fontSize: 10)),
              ),
              Padding(
                padding: EdgeInsets.all(8),
                child: Text(s.time, style: const TextStyle(fontSize: 10)),
              ),
              Padding(
                padding: EdgeInsets.all(8),
                child: Text(s.subject, style: const TextStyle(fontSize: 10)),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
