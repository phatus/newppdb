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
    return Student(
      id: json['id'],
      namaLengkap: json['namaLengkap'] ?? '',
      nisn: json['nisn'] ?? '',
      nik: json['nik'],
      noKk: json['noKk'],
      gender: json['gender'],
      tempatLahir: json['tempatLahir'],
      tanggalLahir: json['tanggalLahir'] != null
          ? DateTime.tryParse(json['tanggalLahir'].toString())
          : null,
      asalSekolah: json['asalSekolah'],
      telepon: json['telepon'],
      statusVerifikasi: json['statusVerifikasi'],
      statusKelulusan: json['statusKelulusan'],
      jalur: json['jalur'],
      waveId: json['waveId'],
      alamatLengkap: json['alamatLengkap'],
      catatanPenolakan: json['catatanPenolakan'],
      nomorUjian: json['nomorUjian'],
      namaAyah: json['namaAyah'],
      pekerjaanAyah: json['pekerjaanAyah'],
      namaIbu: json['namaIbu'],
      pekerjaanIbu: json['pekerjaanIbu'],
      penghasilanOrtu: json['penghasilanOrtu'],
      alamatJalan: json['alamatJalan'],
      alamatRt: json['alamatRt'],
      alamatRw: json['alamatRw'],
      alamatDesa: json['alamatDesa'],
      alamatKecamatan: json['alamatKecamatan'],
      alamatKabupaten: json['alamatKabupaten'],
      alamatProvinsi: json['alamatProvinsi'],
      kodePos: json['kodePos'],
      documents: json['documents'] is Map
          ? Map<String, dynamic>.from(json['documents'])
          : null,
      grades: json['grades'] is Map
          ? Map<String, dynamic>.from(json['grades'])
          : null,
    );
  }
}
