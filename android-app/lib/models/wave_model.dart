class Wave {
  final String id;
  final String name;
  final DateTime startDate;
  final DateTime endDate;
  final List<String> jalurAllowed;

  Wave({
    required this.id,
    required this.name,
    required this.startDate,
    required this.endDate,
    required this.jalurAllowed,
  });

  factory Wave.fromJson(Map<String, dynamic> json) {
    return Wave(
      id: json['id'],
      name: json['name'],
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      jalurAllowed: List<String>.from(json['jalurAllowed'] ?? []),
    );
  }
}
