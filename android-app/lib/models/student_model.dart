class Student {
  final String id;
  final String namaLengkap;
  final String nisn;
  final String? nik;
  final String? noKk;
  final String? gender;
  final String? tempatLahir;
  final DateTime? tanggalLahir;
  final String? asalSekolah;
  final String? telepon;
  final String? statusVerifikasi;
  final String? statusKelulusan;
  final String? jalur;
  final String? waveId;
  final String? alamatLengkap;
  final String? catatanPenolakan;
  final String? nomorUjian;

  // Parent fields
  final String? namaAyah;
  final String? pekerjaanAyah;
  final String? namaIbu;
  final String? pekerjaanIbu;
  final String? penghasilanOrtu;

  // Address fields
  final String? alamatJalan;
  final String? alamatRt;
  final String? alamatRw;
  final String? alamatDesa;
  final String? alamatKecamatan;
  final String? alamatKabupaten;
  final String? alamatProvinsi;
  final String? kodePos;

  // Relations as Maps
  final Map<String, dynamic>? documents;
  final Map<String, dynamic>? grades;

  Student({
    required this.id,
    required this.namaLengkap,
    required this.nisn,
    this.nik,
    this.noKk,
    this.gender,
    this.tempatLahir,
    this.tanggalLahir,
    this.asalSekolah,
    this.telepon,
    this.statusVerifikasi,
    this.statusKelulusan,
    this.jalur,
    this.waveId,
    this.alamatLengkap,
    this.catatanPenolakan,
    this.nomorUjian,
    this.namaAyah,
    this.pekerjaanAyah,
    this.namaIbu,
    this.pekerjaanIbu,
    this.penghasilanOrtu,
    this.alamatJalan,
    this.alamatRt,
    this.alamatRw,
    this.alamatDesa,
    this.alamatKecamatan,
    this.alamatKabupaten,
    this.alamatProvinsi,
    this.kodePos,
    this.documents,
    this.grades,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    try {
      return Student(
        id: json['id']?.toString() ?? '',
        namaLengkap: json['namaLengkap']?.toString() ?? '',
        nisn: json['nisn']?.toString() ?? '',
        nik: json['nik']?.toString(),
        noKk: json['noKk']?.toString(),
        gender: json['gender']?.toString(),
        tempatLahir: json['tempatLahir']?.toString(),
        tanggalLahir: json['tanggalLahir'] != null
            ? DateTime.tryParse(json['tanggalLahir'].toString())
            : null,
        asalSekolah: json['asalSekolah']?.toString(),
        telepon: json['telepon']?.toString(),
        statusVerifikasi: json['statusVerifikasi']?.toString(),
        statusKelulusan: json['statusKelulusan']?.toString(),
        jalur: json['jalur']?.toString(),
        waveId: json['waveId']?.toString(),
        alamatLengkap: json['alamatLengkap']?.toString(),
        catatanPenolakan: json['catatanPenolakan']?.toString(),
        nomorUjian: json['nomorUjian']?.toString(),
        namaAyah: json['namaAyah']?.toString(),
        pekerjaanAyah: json['pekerjaanAyah']?.toString(),
        namaIbu: json['namaIbu']?.toString(),
        pekerjaanIbu: json['pekerjaanIbu']?.toString(),
        penghasilanOrtu: json['penghasilanOrtu']?.toString(),
        alamatJalan: json['alamatJalan']?.toString(),
        alamatRt: json['alamatRt']?.toString(),
        alamatRw: json['alamatRw']?.toString(),
        alamatDesa: json['alamatDesa']?.toString(),
        alamatKecamatan: json['alamatKecamatan']?.toString(),
        alamatKabupaten: json['alamatKabupaten']?.toString(),
        alamatProvinsi: json['alamatProvinsi']?.toString(),
        kodePos: json['kodePos']?.toString(),
        documents: json['documents'] is Map
            ? Map<String, dynamic>.from(json['documents'])
            : null,
        grades: json['grades'] is Map
            ? Map<String, dynamic>.from(json['grades'])
            : null,
      );
    } catch (e) {
      // Return a basic object instead of crashing the whole list
      return Student(
        id: json['id']?.toString() ?? 'error',
        namaLengkap: 'Data Error',
        nisn: '',
      );
    }
  }
}
