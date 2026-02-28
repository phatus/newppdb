import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../providers/student_provider.dart';
import '../../providers/document_provider.dart';
import '../../models/wave_model.dart';
import 'package:intl/intl.dart';

import '../../models/student_model.dart';
import '../../models/grade_model.dart';

class RegistrationView extends StatefulWidget {
  final Student? student;
  final int initialStep;
  const RegistrationView({super.key, this.student, this.initialStep = 0});

  @override
  State<RegistrationView> createState() => _RegistrationViewState();
}

class _RegistrationViewState extends State<RegistrationView> {
  final _formKey = GlobalKey<FormState>();
  late int _currentStep;

  // Data Diri
  final _namaController = TextEditingController();
  final _nisnController = TextEditingController();
  final _nikController = TextEditingController();
  final _noKkController = TextEditingController();
  final _teleponController = TextEditingController();
  final _tempatLahirController = TextEditingController();
  final _asalSekolahController = TextEditingController();

  // Orang Tua
  final _namaAyahController = TextEditingController();
  final _pekerjaanAyahController = TextEditingController();
  final _namaIbuController = TextEditingController();
  final _pekerjaanIbuController = TextEditingController();

  // Alamat
  final _alamatJalanController = TextEditingController();
  final _alamatRtController = TextEditingController();
  final _alamatRwController = TextEditingController();
  final _alamatDesaController = TextEditingController();
  final _alamatKecamatanController = TextEditingController();
  final _alamatKabupatenController = TextEditingController();
  final _alamatProvinsiController = TextEditingController();
  final _kodePosController = TextEditingController();
  DateTime? _selectedTanggalLahir;
  final Map<String, double> _gradeInputs = {}; // semesterId_subjectId -> score
  bool _isSdOrigins = true; // true if SD, false if MI

  String? _selectedJalur;
  String? _selectedWaveId;
  String? _selectedGender;
  String? _selectedPenghasilan;

  final _genderOptions = ['Laki-laki', 'Perempuan'];
  final _penghasilanOptions = [
    'Kurang dari 1 Juta',
    '1 - 3 Juta',
    '3 - 5 Juta',
    'Lebih dari 5 Juta',
  ];

  @override
  void initState() {
    super.initState();
    _currentStep = widget.initialStep;
    final student = widget.student;
    if (student != null) {
      _namaController.text = student.namaLengkap;
      _nisnController.text = student.nisn;
      _nikController.text = student.nik ?? '';
      _noKkController.text = student.noKk ?? '';
      _teleponController.text = student.telepon ?? '';
      _tempatLahirController.text = student.tempatLahir ?? '';
      _asalSekolahController.text = student.asalSekolah ?? '';
      _selectedTanggalLahir = student.tanggalLahir;
      _selectedGender = student.gender;
      _selectedJalur = student.jalur;
      _selectedWaveId = student.waveId;
      // Orang Tua
      _namaAyahController.text = student.namaAyah ?? '';
      _pekerjaanAyahController.text = student.pekerjaanAyah ?? '';
      _namaIbuController.text = student.namaIbu ?? '';
      _pekerjaanIbuController.text = student.pekerjaanIbu ?? '';
      _selectedPenghasilan = student.penghasilanOrtu;
      // Alamat
      _alamatJalanController.text = student.alamatJalan ?? '';
      _alamatRtController.text = student.alamatRt ?? '';
      _alamatRwController.text = student.alamatRw ?? '';
      _alamatDesaController.text = student.alamatDesa ?? '';
      _alamatKecamatanController.text = student.alamatKecamatan ?? '';
      _alamatKabupatenController.text = student.alamatKabupaten ?? '';
      _alamatProvinsiController.text = student.alamatProvinsi ?? '';
      _kodePosController.text = student.kodePos ?? '';
      _isSdOrigins =
          !(student.asalSekolah?.toUpperCase().contains('MI') ?? false);

      // Pre-fill grades mapping
      if (student.grades != null && student.grades!['semesterGrades'] != null) {
        for (var sg in student.grades!['semesterGrades']) {
          String semId = sg['semesterId'];
          if (sg['entries'] != null) {
            for (var entry in sg['entries']) {
              String subjId = entry['subjectId'];
              _gradeInputs['${semId}_$subjId'] = (entry['score'] as num)
                  .toDouble();
            }
          }
        }
      }
    }

    // Fetch Grade Setup
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<StudentProvider>().fetchGradeSetup();
    });
  }

  bool _isWaveActive(List<Wave> waves) {
    if (_selectedWaveId == null) return true;
    try {
      final wave = waves.firstWhere(
        (w) => w.id == _selectedWaveId,
        orElse: () => throw Exception('Wave not found'),
      );
      final now = DateTime.now();
      return now.isAfter(wave.startDate) && now.isBefore(wave.endDate);
    } catch (_) {
      return false;
    }
  }

  Future<bool> _submitForm() async {
    final waves = context.read<StudentProvider>().activeWaves;
    if (!_isWaveActive(waves)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Maaf, pendaftaran untuk gelombang ini sudah ditutup atau belum dibuka.',
          ),
          backgroundColor: Colors.red,
        ),
      );
      return false;
    }

    if (_formKey.currentState!.validate()) {
      final studentProv = context.read<StudentProvider>();

      final data = {
        'namaLengkap': _namaController.text,
        'nisn': _nisnController.text,
        'nik': _nikController.text.isNotEmpty ? _nikController.text : null,
        'noKk': _noKkController.text.isNotEmpty ? _noKkController.text : null,
        'gender': _selectedGender,
        'tempatLahir': _tempatLahirController.text.isNotEmpty
            ? _tempatLahirController.text
            : null,
        'asalSekolah': _asalSekolahController.text.isNotEmpty
            ? _asalSekolahController.text
            : null,
        'telepon': _teleponController.text,
        'jalur': _selectedJalur,
        'waveId': _selectedWaveId,
        'namaAyah': _namaAyahController.text.isNotEmpty
            ? _namaAyahController.text
            : null,
        'pekerjaanAyah': _pekerjaanAyahController.text.isNotEmpty
            ? _pekerjaanAyahController.text
            : null,
        'namaIbu': _namaIbuController.text.isNotEmpty
            ? _namaIbuController.text
            : null,
        'pekerjaanIbu': _pekerjaanIbuController.text.isNotEmpty
            ? _pekerjaanIbuController.text
            : null,
        'penghasilanOrtu': _selectedPenghasilan,
        'alamatJalan': _alamatJalanController.text.isNotEmpty
            ? _alamatJalanController.text
            : null,
        'alamatRt': _alamatRtController.text.isNotEmpty
            ? _alamatRtController.text
            : null,
        'alamatRw': _alamatRwController.text.isNotEmpty
            ? _alamatRwController.text
            : null,
        'alamatDesa': _alamatDesaController.text.isNotEmpty
            ? _alamatDesaController.text
            : null,
        'alamatKecamatan': _alamatKecamatanController.text.isNotEmpty
            ? _alamatKecamatanController.text
            : null,
        'alamatKabupaten': _alamatKabupatenController.text.isNotEmpty
            ? _alamatKabupatenController.text
            : null,
        'alamatProvinsi': _alamatProvinsiController.text.isNotEmpty
            ? _alamatProvinsiController.text
            : null,
        'kodePos': _kodePosController.text.isNotEmpty
            ? _kodePosController.text
            : null,
        'tanggalLahir': _selectedTanggalLahir?.toIso8601String(),
      };

      final result = widget.student == null
          ? await studentProv.register(data)
          : await studentProv.updateStudent(widget.student!.id, data);

      if (result['success'] && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: Colors.green,
          ),
        );
        return true;
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
    return false;
  }

  Widget _buildDokumenStep() {
    final student = context.watch<StudentProvider>().student;
    if (student == null) {
      return const Center(child: Text('Data siswa tidak ditemukan'));
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Upload Berkas',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Lengkapi dokumen pendaftaran untuk mempercepat verifikasi.',
          style: TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 25),
        ...docs.map(
          (doc) => _buildDocItem(
            doc['label'] as String,
            doc['field'] as String,
            doc['value'] as String?,
            isWajib: doc['isWajib'] == true,
          ),
        ),
      ],
    );
  }

  Widget _buildDocItem(
    String label,
    String field,
    String? url, {
    bool isWajib = false,
  }) {
    final docProv = context.watch<DocumentProvider>();
    final isUploading = docProv.isUploading(field);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 4),
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
                  const Icon(Icons.check_circle, color: Colors.green, size: 20),
              ],
            ),
            const SizedBox(height: 12),
            if (isUploading)
              const LinearProgressIndicator()
            else
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _showPickOptions(field),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF00DDCB)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        url != null ? 'Ganti File' : 'Upload File',
                        style: const TextStyle(color: Color(0xFF00DDCB)),
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  void _showPickOptions(String field) {
    showModalBottomSheet(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Kamera'),
              onTap: () {
                Navigator.pop(context);
                _pickAndUpload(field, ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Galeri'),
              onTap: () {
                Navigator.pop(context);
                _pickAndUpload(field, ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickAndUpload(String field, ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 70);

    if (pickedFile != null && mounted) {
      final success = await context.read<DocumentProvider>().uploadDocument(
        field,
        File(pickedFile.path),
        context.read<StudentProvider>().student!.id,
      );
      if (success && mounted) {
        context.read<StudentProvider>().refreshProfile();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final studentProv = context.watch<StudentProvider>();
    final waves = studentProv.activeWaves;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.student == null ? 'Pendaftaran Baru' : 'Edit Data Siswa',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: studentProv.isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                _buildStepper(),
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(24.0),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildStepContent(waves, studentProv),
                          const SizedBox(height: 32),
                          ElevatedButton(
                            onPressed: () async {
                              if (_currentStep < 5) {
                                if (_currentStep < 3) {
                                  setState(() => _currentStep++);
                                } else if (_currentStep == 3) {
                                  // Save profile before moving to document step
                                  final success = await _submitForm();
                                  if (success) {
                                    setState(() => _currentStep++);
                                  }
                                } else if (_currentStep == 4) {
                                  // Moving from Berkas to Raport
                                  setState(() => _currentStep++);
                                }
                              } else {
                                // Final Save for Grades
                                final studentId = studentProv.student?.id;
                                if (studentId != null) {
                                  final setup = studentProv.gradeSetup;
                                  if (setup != null) {
                                    List<GradePayload> payloads = [];
                                    for (var sem in setup.semesters) {
                                      List<GradeEntryPayload> entries = [];
                                      for (var subj in setup.subjects) {
                                        // Specific filtering for SD/MI
                                        bool isReligious =
                                            subj.name.contains('Al-Qur\'an') ||
                                            subj.name.contains('Akidah') ||
                                            subj.name.contains('Fiqih') ||
                                            subj.name.contains('SKI');
                                        if (_isSdOrigins && isReligious) {
                                          continue;
                                        }
                                        if (!_isSdOrigins &&
                                            subj.name == 'Pendidikan Agama') {
                                          continue;
                                        }

                                        double? score =
                                            _gradeInputs['${sem.id}_${subj.id}'];
                                        if (score != null) {
                                          entries.add(
                                            GradeEntryPayload(
                                              subjectId: subj.id,
                                              score: score,
                                            ),
                                          );
                                        }
                                      }
                                      payloads.add(
                                        GradePayload(
                                          semesterId: sem.id,
                                          entries: entries,
                                        ),
                                      );
                                    }

                                    final res = await studentProv.saveGrades(
                                      studentId,
                                      payloads,
                                    );
                                    if (!mounted) return;

                                    if (res['success']) {
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(res['message']),
                                          backgroundColor: Colors.green,
                                        ),
                                      );
                                      Navigator.pop(context);
                                    } else {
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(res['message']),
                                          backgroundColor: Colors.red,
                                        ),
                                      );
                                    }
                                  }
                                }
                              }
                            },
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  _currentStep < 3
                                      ? 'Simpan & Lanjut'
                                      : (_currentStep == 3
                                            ? 'Simpan & Lengkapi Berkas'
                                            : (_currentStep == 4
                                                  ? 'Lanjut ke Nilai Raport'
                                                  : 'Selesai')),
                                ),
                                const SizedBox(width: 8),
                                const Icon(
                                  Icons.arrow_forward_rounded,
                                  size: 18,
                                ),
                              ],
                            ),
                          ),
                          if (_currentStep > 0)
                            Center(
                              child: TextButton(
                                onPressed: () => setState(() => _currentStep--),
                                child: const Text(
                                  'Kembali',
                                  style: TextStyle(color: Colors.grey),
                                ),
                              ),
                            ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildStepper() {
    final titles = ['SISWA', 'ORTU', 'ALAMAT', 'JALUR', 'BERKAS', 'RAPORT'];
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFEEEEEE))),
      ),
      child: Row(
        children: List.generate(titles.length, (index) {
          final isActive = _currentStep == index;
          final isCompleted = _currentStep > index;
          return Expanded(
            child: Column(
              children: [
                Container(
                  height: 4,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: isActive || isCompleted
                        ? Theme.of(context).colorScheme.secondary
                        : Colors.grey[200],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  titles[index],
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isActive
                        ? Theme.of(context).colorScheme.secondary
                        : Colors.grey,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStepContent(List<Wave> waves, StudentProvider provider) {
    switch (_currentStep) {
      case 0:
        return _buildSiswaStep();
      case 1:
        return _buildOrtuStep();
      case 2:
        return _buildAlamatStep();
      case 3:
        return _buildJalurStep(waves);
      case 4:
        return _buildDokumenStep();
      case 5:
        return _buildRaportStep(provider);
      default:
        return const SizedBox();
    }
  }

  Widget _buildSiswaStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Identitas Siswa',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Mohon isi data diri calon siswa dengan benar sesuai ijazah atau akte kelahiran.',
          style: TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 25),
        _buildInputField(
          _nisnController,
          'NISN',
          Icons.badge_outlined,
          keyboard: TextInputType.number,
        ),
        const SizedBox(height: 16),
        _buildInputField(
          _namaController,
          'Nama Lengkap',
          Icons.person_outline_rounded,
        ),
        const SizedBox(height: 16),
        const Text(
          'Jenis Kelamin',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          children: _genderOptions.map((g) {
            final isSelected = _selectedGender == g;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    backgroundColor: isSelected
                        ? const Color(0xFF00DDCB).withValues(alpha: 0.1)
                        : Colors.white,
                    side: BorderSide(
                      color: isSelected
                          ? const Color(0xFF00DDCB)
                          : Colors.grey[300]!,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () => setState(() => _selectedGender = g),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        g == 'Laki-laki' ? Icons.male : Icons.female,
                        size: 18,
                        color: isSelected
                            ? const Color(0xFF00DDCB)
                            : Colors.grey,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        g,
                        style: TextStyle(
                          color: isSelected
                              ? const Color(0xFF00DDCB)
                              : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildInputField(
                _tempatLahirController,
                'Tempat Lahir',
                Icons.location_on_outlined,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: InkWell(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _selectedTanggalLahir ?? DateTime(2010),
                    firstDate: DateTime(2000),
                    lastDate: DateTime.now(),
                  );
                  if (picked != null) {
                    setState(() => _selectedTanggalLahir = picked);
                  }
                },
                child: AbsorbPointer(
                  child: _buildInputField(
                    TextEditingController(
                      text: _selectedTanggalLahir != null
                          ? DateFormat(
                              'dd/MM/yyyy',
                            ).format(_selectedTanggalLahir!)
                          : 'Pilih Tanggal',
                    ),
                    'Tanggal Lahir',
                    Icons.calendar_today_rounded,
                    readOnly: true,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _buildInputField(
          _asalSekolahController,
          'Asal Sekolah',
          Icons.school_outlined,
        ),
        const SizedBox(height: 16),
        _buildInputField(
          _teleponController,
          'Nomor WhatsApp',
          Icons.phone_android_rounded,
          keyboard: TextInputType.phone,
        ),
      ],
    );
  }

  Widget _buildOrtuStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Data Orang Tua',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 25),
        _buildInputField(
          _namaAyahController,
          'Nama Ayah',
          Icons.person_outline,
        ),
        const SizedBox(height: 16),
        _buildInputField(
          _pekerjaanAyahController,
          'Pekerjaan Ayah',
          Icons.work_outline,
        ),
        const SizedBox(height: 16),
        _buildInputField(_namaIbuController, 'Nama Ibu', Icons.person_outline),
        const SizedBox(height: 16),
        _buildInputField(
          _pekerjaanIbuController,
          'Pekerjaan Ibu',
          Icons.work_outline,
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          initialValue: _selectedPenghasilan,
          decoration: InputDecoration(
            labelText: 'Penghasilan Orang Tua',
            prefixIcon: const Icon(Icons.payments_outlined),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            filled: true,
            fillColor: Colors.white,
          ),
          items: _penghasilanOptions
              .map((p) => DropdownMenuItem(value: p, child: Text(p)))
              .toList(),
          onChanged: (v) => setState(() => _selectedPenghasilan = v),
        ),
      ],
    );
  }

  Widget _buildAlamatStep() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Alamat Lengkap',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 25),
        _buildInputField(
          _alamatJalanController,
          'Nama Jalan, RT/RW, Dusun',
          Icons.home_outlined,
          maxLines: 3,
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildInputField(_alamatDesaController, 'Desa', null),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildInputField(
                _alamatKecamatanController,
                'Kecamatan',
                null,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        _buildInputField(
          _alamatKabupatenController,
          'Kabupaten / Kota',
          Icons.location_city_outlined,
        ),
        const SizedBox(height: 16),
        _buildInputField(
          _alamatProvinsiController,
          'Provinsi',
          Icons.map_outlined,
        ),
      ],
    );
  }

  Widget _buildJalurStep(List<Wave> waves) {
    if (waves.isEmpty) {
      return const Column(
        children: [
          Icon(Icons.warning_amber_rounded, size: 48, color: Colors.orange),
          SizedBox(height: 16),
          Text(
            'Belum ada gelombang pendaftaran yang tersedia.',
            textAlign: TextAlign.center,
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ],
      );
    }

    final selectedWave = _selectedWaveId != null
        ? waves.firstWhere(
            (w) => w.id == _selectedWaveId,
            orElse: () => waves.first,
          )
        : null;

    final now = DateTime.now();
    bool isWaveActive = false;
    if (selectedWave != null) {
      isWaveActive =
          now.isAfter(selectedWave.startDate) &&
          now.isBefore(selectedWave.endDate);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Jalur & Gelombang',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        const Text(
          'Pilih gelombang pendaftaran yang sedang aktif.',
          style: TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 25),
        DropdownButtonFormField<String>(
          initialValue: _selectedWaveId,
          decoration: InputDecoration(
            labelText: 'Pilih Gelombang',
            prefixIcon: const Icon(Icons.waves),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            filled: true,
            fillColor: Colors.white,
          ),
          items: waves.map<DropdownMenuItem<String>>((w) {
            final isActive =
                now.isAfter(w.startDate) && now.isBefore(w.endDate);
            return DropdownMenuItem<String>(
              value: w.id,
              child: Text(
                '${w.name} ${isActive ? "[BUKA]" : "[TUTUP]"}',
                style: TextStyle(
                  color: isActive ? Colors.green[700] : Colors.red[700],
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            );
          }).toList(),
          onChanged: (v) => setState(() {
            _selectedWaveId = v;
            _selectedJalur = null;
          }),
        ),
        if (selectedWave != null && !isWaveActive)
          Padding(
            padding: const EdgeInsets.only(top: 8.0, left: 4.0),
            child: Row(
              children: [
                const Icon(Icons.info_outline, size: 14, color: Colors.red),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    now.isBefore(selectedWave.startDate)
                        ? 'Pendaftaran baru dibuka pada ${DateFormat('dd MMM yyyy').format(selectedWave.startDate)}'
                        : 'Pendaftaran sudah ditutup pada ${DateFormat('dd MMM yyyy').format(selectedWave.endDate)}',
                    style: const TextStyle(
                      color: Colors.red,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
        const SizedBox(height: 24),
        DropdownButtonFormField<String>(
          initialValue: _selectedJalur,
          key: ValueKey('jalur_$_selectedWaveId'),
          decoration: InputDecoration(
            labelText: 'Pilih Jalur',
            prefixIcon: const Icon(Icons.alt_route),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide.none,
            ),
            filled: true,
            fillColor: Colors.white,
          ),
          items: selectedWave == null
              ? []
              : (selectedWave.jalurAllowed)
                    .map<DropdownMenuItem<String>>(
                      (j) => DropdownMenuItem<String>(
                        value: j.toString(),
                        child: Text(j.toString().replaceAll('_', ' ')),
                      ),
                    )
                    .toList(),
          onChanged: (v) => setState(() => _selectedJalur = v),
        ),
      ],
    );
  }

  Widget _buildRaportStep(StudentProvider provider) {
    final setup = provider.gradeSetup;
    if (setup == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Nilai Raport',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            SegmentedButton<bool>(
              segments: const [
                ButtonSegment(
                  value: false,
                  label: Text('MI', style: TextStyle(fontSize: 12)),
                  icon: Icon(Icons.mosque, size: 16),
                ),
                ButtonSegment(
                  value: true,
                  label: Text('SD', style: TextStyle(fontSize: 12)),
                  icon: Icon(Icons.school, size: 16),
                ),
              ],
              selected: {_isSdOrigins},
              onSelectionChanged: (Set<bool> newSelection) {
                setState(() => _isSdOrigins = newSelection.first);
              },
              style: SegmentedButton.styleFrom(
                selectedBackgroundColor: const Color(0xFF00DDCB),
                selectedForegroundColor: Colors.white,
                visualDensity: VisualDensity.compact,
              ),
            ),
          ],
        ),
        const Text(
          'Inputkan nilai rata-rata raport (skala 0-100) untuk setiap semester.',
          style: TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 20),
        DefaultTabController(
          length: setup.semesters.length,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TabBar(
                isScrollable: true,
                tabs: setup.semesters
                    .map(
                      (s) => Tab(
                        text: s.name
                            .replaceAll('Kelas ', 'K')
                            .replaceAll('Semester ', 'S'),
                      ),
                    )
                    .toList(),
                labelColor: const Color(0xFF00DDCB),
                indicatorColor: const Color(0xFF00DDCB),
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 350,
                child: TabBarView(
                  children: setup.semesters.map((sem) {
                    final filteredSubjects = setup.subjects.where((subj) {
                      final name = subj.name.toLowerCase();
                      final isReligious =
                          name.contains('quran') ||
                          name.contains('hadis') ||
                          name.contains('hadist') ||
                          name.contains('akidah') ||
                          name.contains('fikih') ||
                          name.contains('fiqih') ||
                          name.contains('ski') ||
                          name.contains('arab');

                      if (_isSdOrigins) {
                        // For SD: Hide religious subjects
                        return !isReligious;
                      } else {
                        // For MI: Hide generic "Pendidikan Agama" if it exists (MI has specific ones)
                        return !name.contains('pendidikan agama islam') &&
                            !name.contains('pendidikan agama');
                      }
                    }).toList();

                    return ListView.builder(
                      shrinkWrap: true,
                      itemCount: filteredSubjects.length,
                      itemBuilder: (context, index) {
                        final subj = filteredSubjects[index];
                        final key = '${sem.id}_${subj.id}';
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Row(
                            children: [
                              Expanded(
                                flex: 3,
                                child: Text(
                                  subj.name,
                                  style: const TextStyle(fontSize: 14),
                                ),
                              ),
                              Expanded(
                                flex: 1,
                                child: TextFormField(
                                  initialValue:
                                      _gradeInputs[key]?.toString() ?? '',
                                  keyboardType:
                                      const TextInputType.numberWithOptions(
                                        decimal: true,
                                      ),
                                  decoration: const InputDecoration(
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 10,
                                      vertical: 0,
                                    ),
                                    border: OutlineInputBorder(),
                                  ),
                                  onChanged: (v) {
                                    setState(() {
                                      if (v.isEmpty) {
                                        _gradeInputs.remove(key);
                                      } else {
                                        _gradeInputs[key] =
                                            double.tryParse(v) ?? 0;
                                      }
                                    });
                                  },
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _buildGradeSummary(setup),
      ],
    );
  }

  Widget _buildGradeSummary(GradeSetup setup) {
    double totalAvg = 0;
    int semCount = 0;

    for (var sem in setup.semesters) {
      double semTotal = 0;
      int subjCount = 0;
      for (var subj in setup.subjects) {
        bool isReligious =
            subj.name.contains('Al-Qur\'an') ||
            subj.name.contains('Akidah') ||
            subj.name.contains('Fiqih') ||
            subj.name.contains('SKI');
        if (_isSdOrigins && isReligious) continue;
        if (!_isSdOrigins && subj.name == 'Pendidikan Agama') continue;

        double? score = _gradeInputs['${sem.id}_${subj.id}'];
        if (score != null) {
          semTotal += score;
          subjCount++;
        }
      }
      if (subjCount > 0) {
        totalAvg += (semTotal / subjCount);
        semCount++;
      }
    }

    double finalAvg = semCount > 0 ? totalAvg / semCount : 0;
    bool isAcademicValid =
        _selectedJalur != 'PRESTASI_AKADEMIK' || finalAvg >= 85;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isAcademicValid ? Colors.blue[50] : Colors.red[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Rata-rata Keseluruhan:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(
                finalAvg.toStringAsFixed(2),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isAcademicValid ? Colors.blue[800] : Colors.red[800],
                ),
              ),
            ],
          ),
          if (!isAcademicValid)
            const Padding(
              padding: EdgeInsets.only(top: 8.0),
              child: Text(
                'Syarat Jalur Prestasi Akademik minimal rata-rata 85.',
                style: TextStyle(
                  color: Colors.red,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildInputField(
    TextEditingController ctrl,
    String label,
    IconData? icon, {
    TextInputType? keyboard,
    bool readOnly = false,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: ctrl,
      readOnly: readOnly,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: icon != null ? Icon(icon, size: 20) : null,
        suffixIcon: ctrl.text.isNotEmpty
            ? Icon(
                Icons.check_circle,
                color: Theme.of(context).colorScheme.secondary,
                size: 18,
              )
            : null,
      ),
      keyboardType: keyboard,
      onChanged: (v) => setState(() {}),
    );
  }
}
