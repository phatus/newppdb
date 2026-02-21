class RankingEntry {
  final String id;
  final String namaLengkap;
  final String nisn;
  final String jalur;
  final String statusKelulusan;
  final double? finalScore;
  final double? rataRataNilai;

  RankingEntry({
    required this.id,
    required this.namaLengkap,
    required this.nisn,
    required this.jalur,
    required this.statusKelulusan,
    this.finalScore,
    this.rataRataNilai,
  });

  factory RankingEntry.fromJson(Map<String, dynamic> json) {
    return RankingEntry(
      id: json['id'],
      namaLengkap: json['namaLengkap'],
      nisn: json['nisn'],
      jalur: json['jalur'] ?? 'REGULER',
      statusKelulusan: json['statusKelulusan'] ?? 'PENDING',
      finalScore: json['grades']?['finalScore']?.toDouble(),
      rataRataNilai: json['grades']?['rataRataNilai']?.toDouble(),
    );
  }
}
