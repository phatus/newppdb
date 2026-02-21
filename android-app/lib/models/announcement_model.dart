class Announcement {
  final String id;
  final String title;
  final String content;
  final String type; // INFO, WARNING, IMPORTANT
  final String target;
  final bool isActive;
  final DateTime createdAt;

  Announcement({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    required this.target,
    required this.isActive,
    required this.createdAt,
  });

  factory Announcement.fromJson(Map<String, dynamic> json) {
    return Announcement(
      id: json['id'],
      title: json['title'],
      content: json['content'],
      type: json['type'] ?? 'INFO',
      target: json['target'] ?? 'ALL',
      isActive: json['isActive'] ?? true,
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
