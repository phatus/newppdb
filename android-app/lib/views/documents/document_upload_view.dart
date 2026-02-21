import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../providers/document_provider.dart';
import '../../providers/student_provider.dart';

class DocumentUploadView extends StatelessWidget {
  const DocumentUploadView({super.key});

  @override
  Widget build(BuildContext context) {
    final student = context.watch<StudentProvider>().student;

    if (student == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Upload Berkas')),
        body: const Center(
          child: Text('Silakan lengkapi pendaftaran terlebih dahulu'),
        ),
      );
    }

    final docs = [
      {
        'label': 'Kartu Keluarga (KK)',
        'field': 'fileKK',
        'value': student.documents?['fileKK'],
      },
      {
        'label': 'Akta Kelahiran',
        'field': 'fileAkta',
        'value': student.documents?['fileAkta'],
      },
      {
        'label': 'Pas Foto 3x4',
        'field': 'pasFoto',
        'value': student.documents?['pasFoto'],
        'isWajib': true,
      },
      {
        'label': 'Raport',
        'field': 'fileRaport',
        'value': student.documents?['fileRaport'],
      },
    ];

    int uploadedCount = docs.where((d) => d['value'] != null).length;
    double progress = uploadedCount / docs.length;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Upload Dokumen',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildProgressCard(uploadedCount, docs.length, progress),
            const SizedBox(height: 24),
            _buildTipsCard(),
            const SizedBox(height: 24),
            ...docs.map(
              (doc) => _buildDocItem(
                context,
                doc['label'] as String,
                doc['field'] as String,
                doc['value'] as String?,
                isWajib: doc['isWajib'] == true,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Simpan & Lanjut'),
                  SizedBox(width: 8),
                  Icon(Icons.arrow_forward_rounded, size: 18),
                ],
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressCard(int current, int total, double progress) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Kelengkapan Berkas',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            Text(
              '${(progress * 100).toInt()}%',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Color(0xFF00DDCB),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          '$current dari $total dokumen terupload',
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 12),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: Colors.grey[200],
          color: const Color(0xFF00DDCB),
          minHeight: 8,
          borderRadius: BorderRadius.circular(10),
        ),
      ],
    );
  }

  Widget _buildTipsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE8EAF6),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_rounded, color: Color(0xFF3F51B5), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Tips Upload',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: Color(0xFF3F51B5),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Pastikan foto dokumen terlihat jelas, tidak buram, dan tulisan dapat terbaca. Format JPG/PDF maks 2MB.',
                  style: TextStyle(fontSize: 11, color: Colors.grey[700]),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDocItem(
    BuildContext context,
    String label,
    String field,
    String? url, {
    bool isWajib = false,
  }) {
    final docProv = context.watch<DocumentProvider>();
    final isUploading = docProv.isUploading(field);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    field == 'pasFoto'
                        ? Icons.face_rounded
                        : Icons.description_outlined,
                    color: url != null ? const Color(0xFF00DDCB) : Colors.grey,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            label,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          if (isWajib) ...[
                            const SizedBox(width: 4),
                            const Text(
                              'WAJIB',
                              style: TextStyle(
                                color: Colors.red,
                                fontSize: 8,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ],
                      ),
                      Text(
                        url != null
                            ? 'Dokumen sudah diupload'
                            : 'Belum ada dokumen',
                        style: TextStyle(
                          fontSize: 12,
                          color: url != null ? Colors.green : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
                if (url != null)
                  const Icon(
                    Icons.check_circle,
                    color: Color(0xFF00DDCB),
                    size: 20,
                  ),
              ],
            ),
            if (isUploading) ...[
              const SizedBox(height: 12),
              const LinearProgressIndicator(),
            ] else ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  if (url != null) ...[
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {}, // Implementation for viewing
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(0, 40),
                          padding: EdgeInsets.zero,
                          side: BorderSide(color: Colors.grey[300]!),
                        ),
                        child: const Text(
                          'Lihat',
                          style: TextStyle(fontSize: 12, color: Colors.black),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                  ],
                  Expanded(
                    flex: 2,
                    child: OutlinedButton(
                      onPressed: () => _showPickOptions(context, field),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 40),
                        padding: EdgeInsets.zero,
                        side: BorderSide(
                          color: const Color(0xFF00DDCB).withValues(alpha: 0.5),
                        ),
                      ),
                      child: Text(
                        url != null
                            ? 'Ganti'
                            : (field == 'pasFoto'
                                  ? 'Upload Foto'
                                  : 'Upload Dokumen'),
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF00DDCB),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showPickOptions(BuildContext context, String field) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Pilih Sumber',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: _buildOption(
                    context,
                    'Kamera',
                    Icons.camera_alt_rounded,
                    ImageSource.camera,
                    field,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildOption(
                    context,
                    'Galeri',
                    Icons.photo_library_rounded,
                    ImageSource.gallery,
                    field,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildOption(
    BuildContext context,
    String label,
    IconData icon,
    ImageSource source,
    String field,
  ) {
    return InkWell(
      onTap: () {
        Navigator.pop(context);
        _pickAndUpload(context, field, source);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[200]!),
        ),
        child: Column(
          children: [
            Icon(icon, color: const Color(0xFF1B5E20)),
            const SizedBox(height: 8),
            Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Future<void> _pickAndUpload(
    BuildContext context,
    String field,
    ImageSource source,
  ) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 70);

    if (pickedFile != null && context.mounted) {
      final success = await context.read<DocumentProvider>().uploadDocument(
        field,
        File(pickedFile.path),
        context.read<StudentProvider>().student!.id,
      );
      if (success && context.mounted) {
        context.read<StudentProvider>().refreshProfile();
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Upload berhasil')));
      } else if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Upload gagal'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
