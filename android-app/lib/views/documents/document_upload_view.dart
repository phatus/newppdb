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

    return Scaffold(
      appBar: AppBar(title: const Text('Upload Berkas')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildUploadCard(
            context,
            'Pas Foto',
            'pasFoto',
            student.documents?['pasFoto'],
          ),
          _buildUploadCard(
            context,
            'Akta Kelahiran',
            'fileAkta',
            student.documents?['fileAkta'],
          ),
          _buildUploadCard(
            context,
            'Kartu Keluarga',
            'fileKK',
            student.documents?['fileKK'],
          ),
          _buildUploadCard(
            context,
            'SKL / Ijazah',
            'fileSKL',
            student.documents?['fileSKL'],
          ),
          _buildUploadCard(
            context,
            'Raport',
            'fileRaport',
            student.documents?['fileRaport'],
          ),
        ],
      ),
    );
  }

  Widget _buildUploadCard(
    BuildContext context,
    String label,
    String field,
    String? currentUrl,
  ) {
    final docProv = context.watch<DocumentProvider>();
    final isUploading = docProv.isUploading(field);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                if (currentUrl != null)
                  const Icon(Icons.check_circle, color: Colors.green)
                else
                  const Icon(Icons.pending_actions, color: Colors.orange),
              ],
            ),
            const SizedBox(height: 12),
            if (isUploading)
              const LinearProgressIndicator()
            else
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () =>
                          _pickAndUpload(context, field, ImageSource.gallery),
                      icon: const Icon(Icons.photo_library),
                      label: const Text('Galeri'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () =>
                          _pickAndUpload(context, field, ImageSource.camera),
                      icon: const Icon(Icons.camera_alt),
                      label: const Text('Kamera'),
                    ),
                  ),
                ],
              ),
            if (currentUrl != null) ...[
              const SizedBox(height: 8),
              const Text(
                'Sudah terupload',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
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
