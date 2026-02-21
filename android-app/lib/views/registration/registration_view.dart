import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/student_provider.dart';
import '../../models/wave_model.dart';
import 'package:intl/intl.dart';

import '../../models/student_model.dart';

class RegistrationView extends StatefulWidget {
  final Student? student;
  const RegistrationView({super.key, this.student});

  @override
  State<RegistrationView> createState() => _RegistrationViewState();
}

class _RegistrationViewState extends State<RegistrationView> {
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;

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
    }
  }

  bool _isWaveActive(List<Wave> waves) {
    if (_selectedWaveId == null) return true;
    try {
      final wave = waves.firstWhere((w) => w.id == _selectedWaveId);
      final now = DateTime.now();
      return now.isAfter(wave.startDate) && now.isBefore(wave.endDate);
    } catch (_) {
      return false;
    }
  }

  Future<void> _submitForm() async {
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
      return;
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
        Navigator.pop(context);
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message']),
            backgroundColor: Colors.red,
          ),
        );
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
                          _buildStepContent(waves),
                          const SizedBox(height: 32),
                          ElevatedButton(
                            onPressed: () {
                              if (_currentStep < 3) {
                                setState(() => _currentStep++);
                              } else {
                                _submitForm();
                              }
                            },
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  _currentStep < 3
                                      ? 'Simpan & Lanjut'
                                      : 'Submit Pendaftaran',
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
    final titles = ['SISWA', 'ORTU', 'ALAMAT', 'JALUR'];
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
                        ? const Color(0xFF00DDCB)
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
                    color: isActive ? const Color(0xFF00DDCB) : Colors.grey,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildStepContent(List waves) {
    switch (_currentStep) {
      case 0:
        return _buildSiswaStep();
      case 1:
        return _buildOrtuStep();
      case 2:
        return _buildAlamatStep();
      case 3:
        return _buildJalurStep(waves);
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

  Widget _buildJalurStep(List waves) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Jalur & Gelombang',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 25),
        DropdownButtonFormField<String>(
          initialValue: _selectedWaveId,
          key: ValueKey(
            _selectedWaveId,
          ), // Add key to force rebuild when value changes externally if needed
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
          items: waves
              .map<DropdownMenuItem<String>>(
                (w) => DropdownMenuItem<String>(
                  value: w.id.toString(),
                  child: Text(w.name.toString()),
                ),
              )
              .toList(),
          onChanged: (v) => setState(() {
            _selectedWaveId = v;
            _selectedJalur = null;
          }),
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          initialValue: _selectedJalur,
          key: ValueKey(
            'jalur_$_selectedWaveId',
          ), // Key to refresh items when wave changes
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
          items: _selectedWaveId == null
              ? []
              : (waves.firstWhere((w) => w.id == _selectedWaveId).jalurAllowed
                        as List)
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
            ? const Icon(Icons.check_circle, color: Color(0xFF00DDCB), size: 18)
            : null,
      ),
      keyboardType: keyboard,
      onChanged: (v) => setState(() {}),
    );
  }
}
