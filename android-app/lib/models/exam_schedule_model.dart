class ExamSchedule {
  final String id;
  final String dayDate;
  final String time;
  final String subject;
  final int order;

  ExamSchedule({
    required this.id,
    required this.dayDate,
    required this.time,
    required this.subject,
    required this.order,
  });

  factory ExamSchedule.fromJson(Map<String, dynamic> json) {
    return ExamSchedule(
      id: json['id'],
      dayDate: json['dayDate'],
      time: json['time'],
      subject: json['subject'],
      order: json['order'] ?? 0,
    );
  }
}
