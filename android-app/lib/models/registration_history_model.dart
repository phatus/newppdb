class RegistrationHistory {
  final String id;
  final String? waveId;
  final String jalur;
  final String status;
  final String? notes;
  final DateTime createdAt;

  RegistrationHistory({
    required this.id,
    this.waveId,
    required this.jalur,
    required this.status,
    this.notes,
    required this.createdAt,
  });

  factory RegistrationHistory.fromJson(dynamic json) {
    if (json is! Map) {
      return RegistrationHistory(
        id: 'error',
        jalur: '',
        status: 'ERROR',
        createdAt: DateTime.now(),
      );
    }
    try {
      return RegistrationHistory(
        id: json['id']?.toString() ?? '',
        waveId: json['waveId']?.toString(),
        jalur: json['jalur']?.toString() ?? '',
        status: json['status']?.toString() ?? '',
        notes: json['notes']?.toString(),
        createdAt: json['createdAt'] != null
            ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
            : DateTime.now(),
      );
    } catch (e) {
      return RegistrationHistory(
        id: 'error',
        jalur: '',
        status: 'ERROR',
        createdAt: DateTime.now(),
      );
    }
  }
}
