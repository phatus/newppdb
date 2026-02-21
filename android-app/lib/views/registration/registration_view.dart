import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/student_provider.dart';

class RegistrationView extends StatefulWidget {
  const RegistrationView({super.key});

  @override
  State<RegistrationView> createState() => _RegistrationViewState();
}

class _RegistrationViewState extends State<RegistrationView> {
  final _formKey = GlobalKey<FormState>();

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
    final student = context.read<StudentProvider>().student;
    if (student != null) {
      _namaController.text = student.namaLengkap;
      _nisnController.text = student.nisn;
      _nikController.text = student.nik ?? '';
      _noKkController.text = student.noKk ?? '';
      _teleponController.text = student.telepon ?? '';
      _tempatLahirController.text = student.tempatLahir ?? '';
      _asalSekolahController.text = student.asalSekolah ?? '';
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

  void _submitForm() async {
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
        // Orang Tua
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
        // Alamat
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
      };

      final result = await studentProv.register(data);

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
      appBar: AppBar(title: const Text('Formulir Pendaftaran')),
      body: studentProv.isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // === DATA DIRI ===
                    _sectionTitle('Data Diri Siswa'),
                    const SizedBox(height: 16),
                    _requiredField(_namaController, 'Nama Lengkap'),
                    const SizedBox(height: 12),
                    _requiredField(
                      _nisnController,
                      'NISN',
                      keyboard: TextInputType.number,
                    ),
                    const SizedBox(height: 12),
                    _optionalField(
                      _nikController,
                      'NIK',
                      keyboard: TextInputType.number,
                    ),
                    const SizedBox(height: 12),
                    _optionalField(
                      _noKkController,
                      'No. KK',
                      keyboard: TextInputType.number,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedGender,
                      decoration: const InputDecoration(
                        labelText: 'Jenis Kelamin',
                      ),
                      items: _genderOptions
                          .map(
                            (g) => DropdownMenuItem(value: g, child: Text(g)),
                          )
                          .toList(),
                      onChanged: (v) => setState(() => _selectedGender = v),
                    ),
                    const SizedBox(height: 12),
                    _optionalField(_tempatLahirController, 'Tempat Lahir'),
                    const SizedBox(height: 12),
                    _optionalField(_asalSekolahController, 'Asal Sekolah'),
                    const SizedBox(height: 12),
                    _requiredField(
                      _teleponController,
                      'Nomor WhatsApp',
                      keyboard: TextInputType.phone,
                    ),

                    const SizedBox(height: 24),
                    // === ORANG TUA ===
                    _sectionTitle('Data Orang Tua / Wali'),
                    const SizedBox(height: 16),
                    _optionalField(_namaAyahController, 'Nama Ayah'),
                    const SizedBox(height: 12),
                    _optionalField(_pekerjaanAyahController, 'Pekerjaan Ayah'),
                    const SizedBox(height: 12),
                    _optionalField(_namaIbuController, 'Nama Ibu'),
                    const SizedBox(height: 12),
                    _optionalField(_pekerjaanIbuController, 'Pekerjaan Ibu'),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedPenghasilan,
                      decoration: const InputDecoration(
                        labelText: 'Penghasilan Orang Tua',
                      ),
                      items: _penghasilanOptions
                          .map(
                            (p) => DropdownMenuItem(value: p, child: Text(p)),
                          )
                          .toList(),
                      onChanged: (v) =>
                          setState(() => _selectedPenghasilan = v),
                    ),

                    const SizedBox(height: 24),
                    // === ALAMAT ===
                    _sectionTitle('Alamat Lengkap'),
                    const SizedBox(height: 16),
                    _optionalField(_alamatJalanController, 'Jalan'),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _optionalField(
                            _alamatRtController,
                            'RT',
                            keyboard: TextInputType.number,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _optionalField(
                            _alamatRwController,
                            'RW',
                            keyboard: TextInputType.number,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _optionalField(_alamatDesaController, 'Desa/Kelurahan'),
                    const SizedBox(height: 12),
                    _optionalField(_alamatKecamatanController, 'Kecamatan'),
                    const SizedBox(height: 12),
                    _optionalField(
                      _alamatKabupatenController,
                      'Kabupaten/Kota',
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _optionalField(
                            _alamatProvinsiController,
                            'Provinsi',
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _optionalField(
                            _kodePosController,
                            'Kode Pos',
                            keyboard: TextInputType.number,
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),
                    // === JALUR & GELOMBANG ===
                    _sectionTitle('Pilihan Jalur & Gelombang'),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedWaveId,
                      decoration: const InputDecoration(
                        labelText: 'Pilih Gelombang *',
                      ),
                      items: waves.map((w) {
                        return DropdownMenuItem(
                          value: w.id,
                          child: Text(w.name),
                        );
                      }).toList(),
                      onChanged: (v) {
                        setState(() {
                          _selectedWaveId = v;
                          _selectedJalur = null;
                        });
                      },
                      validator: (v) => v == null ? 'Pilih gelombang' : null,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedJalur,
                      decoration: const InputDecoration(
                        labelText: 'Pilih Jalur *',
                      ),
                      items: _selectedWaveId == null
                          ? []
                          : waves
                                .firstWhere((w) => w.id == _selectedWaveId)
                                .jalurAllowed
                                .map((j) {
                                  return DropdownMenuItem(
                                    value: j,
                                    child: Text(j.replaceAll('_', ' ')),
                                  );
                                })
                                .toList(),
                      onChanged: (v) => setState(() => _selectedJalur = v),
                      validator: (v) => v == null ? 'Pilih jalur' : null,
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: _submitForm,
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 4),
                        child: Text(
                          'SUBMIT PENDAFTARAN',
                          style: TextStyle(fontSize: 16),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: Theme.of(
        context,
      ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
    );
  }

  Widget _requiredField(
    TextEditingController ctrl,
    String label, {
    TextInputType? keyboard,
  }) {
    return TextFormField(
      controller: ctrl,
      decoration: InputDecoration(labelText: '$label *'),
      keyboardType: keyboard,
      validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
    );
  }

  Widget _optionalField(
    TextEditingController ctrl,
    String label, {
    TextInputType? keyboard,
  }) {
    return TextFormField(
      controller: ctrl,
      decoration: InputDecoration(labelText: label),
      keyboardType: keyboard,
    );
  }
}
