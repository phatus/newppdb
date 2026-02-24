class GradeSetup {
  final List<Semester> semesters;
  final List<Subject> subjects;

  GradeSetup({required this.semesters, required this.subjects});

  factory GradeSetup.fromJson(Map<String, dynamic> json) {
    return GradeSetup(
      semesters: (json['semesters'] as List)
          .map((i) => Semester.fromJson(i))
          .toList(),
      subjects: (json['subjects'] as List)
          .map((i) => Subject.fromJson(i))
          .toList(),
    );
  }
}

class Semester {
  final String id;
  final String name;
  final int order;

  Semester({required this.id, required this.name, required this.order});

  factory Semester.fromJson(Map<String, dynamic> json) {
    return Semester(
      id: json['id'],
      name: json['name'],
      order: json['order'] as int,
    );
  }
}

class Subject {
  final String id;
  final String name;
  final String category;
  final int order;

  Subject({
    required this.id,
    required this.name,
    required this.category,
    required this.order,
  });

  factory Subject.fromJson(Map<String, dynamic> json) {
    return Subject(
      id: json['id'],
      name: json['name'],
      category: json['category'],
      order: json['order'] as int,
    );
  }
}

class GradePayload {
  final String semesterId;
  final List<GradeEntryPayload> entries;

  GradePayload({required this.semesterId, required this.entries});

  Map<String, dynamic> toJson() {
    return {
      'semesterId': semesterId,
      'entries': entries.map((e) => e.toJson()).toList(),
    };
  }
}

class GradeEntryPayload {
  final String subjectId;
  final double score;

  GradeEntryPayload({required this.subjectId, required this.score});

  Map<String, dynamic> toJson() {
    return {'subjectId': subjectId, 'score': score};
  }
}
