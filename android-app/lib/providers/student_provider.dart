import 'package:flutter/material.dart';
import '../models/student_model.dart';
import '../models/wave_model.dart';
import '../models/announcement_model.dart';
import 'package:dio/dio.dart';
import '../services/student_service.dart';
import '../services/announcement_service.dart';
import '../models/exam_schedule_model.dart';
import '../models/grade_model.dart';

class StudentProvider with ChangeNotifier {
  final StudentService _studentService = StudentService();
  final AnnouncementService _announcementService = AnnouncementService();

  List<Student> _students = [];
  int _selectedStudentIndex = 0;
  List<Wave> _activeWaves = [];
  List<Announcement> _announcements = [];
  List<ExamSchedule> _examSchedules = [];
  bool _isLoading = false;
  Map<String, dynamic> _settings = {};
  Map<String, dynamic>? _accountData;
  GradeSetup? _gradeSetup;

  List<Student> get students => _students;
  int get selectedStudentIndex => _selectedStudentIndex;
  Student? get student =>
      _students.isNotEmpty ? _students[_selectedStudentIndex] : null;
  Map<String, dynamic>? get accountData => _accountData;

  bool get isRegistered => _students.isNotEmpty;
  bool get isLoading => _isLoading;
  List<Wave> get activeWaves => _activeWaves;
  List<Announcement> get announcements => _announcements;
  List<ExamSchedule> get examSchedules => _examSchedules;
  Map<String, dynamic> get settings => _settings;
  GradeSetup? get gradeSetup => _gradeSetup;

  void setSelectedStudent(int index) {
    if (index >= 0 && index < _students.length) {
      _selectedStudentIndex = index;
      notifyListeners();
    }
  }

  Future<void> refreshProfile() async {
    _isLoading = true;
    notifyListeners();

    try {
      final results = await Future.wait([
        _studentService.getProfile(),
        _announcementService.getAnnouncements(),
      ]);

      final profileData = results[0] as Map<String, dynamic>;
      _students = List<Student>.from(profileData['students']);
      _accountData = profileData['user'];

      _announcements = results[1] as List<Announcement>;

      // Keep selection within bounds
      if (_students.isNotEmpty && _selectedStudentIndex >= _students.length) {
        _selectedStudentIndex = 0;
      }
    } catch (e) {
      debugPrint('Refresh Profile Error: $e');
    }

    _isLoading = false;
    notifyListeners();
  }

  void selectStudent(int index) {
    if (index >= 0 && index < _students.length) {
      _selectedStudentIndex = index;
      notifyListeners();
    }
  }

  Future<void> fetchSettings() async {
    _isLoading = true;
    notifyListeners();
    try {
      final data = await _studentService.getSettings();
      _settings = data['settings'] ?? {};
      if (data['waves'] != null) {
        _activeWaves = (data['waves'] as List)
            .map((w) => Wave.fromJson(w))
            .toList();
      }
      if (data['examSchedules'] != null) {
        _examSchedules = (data['examSchedules'] as List)
            .map((e) => ExamSchedule.fromJson(e))
            .toList();
      }
      if (data['semesters'] != null && data['subjects'] != null) {
        _gradeSetup = GradeSetup.fromJson(data);
      } else {
        debugPrint(
          'Grade setup data missing in settings response: semesters=${data['semesters'] != null}, subjects=${data['subjects'] != null}',
        );
      }
    } catch (e) {
      debugPrint('Fetch Settings Error: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  List<String> getMissingDocuments() {
    final s = student;
    if (s == null) return [];

    final missing = <String>[];
    final docs = s.documents ?? {};

    if (docs['fileKK'] == null) missing.add('Kartu Keluarga');
    if (docs['fileAkta'] == null) missing.add('Akta Kelahiran');
    if (docs['pasFoto'] == null) missing.add('Pas Foto 3x4');
    if (docs['fileRaport'] == null) missing.add('Raport');

    // Check grades
    final g = s.grades;
    if (g == null ||
        g['semesterGrades'] == null ||
        (g['semesterGrades'] as List).isEmpty) {
      missing.add('Nilai Raport');
    }

    if (s.jalur == 'PRESTASI_AKADEMIK' || s.jalur == 'PRESTASI_NON_AKADEMIK') {
      if (docs['filePrestasi'] == null ||
          (docs['filePrestasi'] is List &&
              (docs['filePrestasi'] as List).isEmpty)) {
        missing.add('Sertifikat Prestasi');
      }
    }

    return missing;
  }

  Future<Map<String, dynamic>> register(Map<String, dynamic> data) async {
    _isLoading = true;
    notifyListeners();

    final result = await _studentService.registerStudent(data);
    if (result['success']) {
      await refreshProfile();
      _selectedStudentIndex = 0; // Select new student
    }

    _isLoading = false;
    notifyListeners();
    return result;
  }

  Future<Map<String, dynamic>> updateStudent(
    String id,
    Map<String, dynamic> data,
  ) async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await _studentService.apiClient.dio.put(
        'student/$id',
        data: data,
      );
      if (response.statusCode == 200) {
        await refreshProfile();
        _isLoading = false;
        notifyListeners();
        return {'success': true, 'message': 'Data berhasil diperbarui'};
      }
    } on DioException catch (e) {
      _isLoading = false;
      notifyListeners();
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Update gagal',
      };
    }
    _isLoading = false;
    notifyListeners();
    return {'success': false, 'message': 'Terjadi kesalahan'};
  }

  Future<void> fetchGradeSetup() async {
    if (_gradeSetup != null) return;
    await fetchSettings();
  }

  Future<Map<String, dynamic>> saveGrades(
    String studentId,
    List<GradePayload> payloads,
  ) async {
    _isLoading = true;
    notifyListeners();

    final result = await _studentService.saveGrades(studentId, payloads);
    if (result['success']) {
      await refreshProfile();
    }

    _isLoading = false;
    notifyListeners();
    return result;
  }

  Future<Map<String, dynamic>> reRegisterStudent(
    String studentId,
    String newJalur,
  ) async {
    _isLoading = true;
    notifyListeners();

    final result = await _studentService.reRegister(studentId, newJalur);
    if (result['success']) {
      await refreshProfile();
    }

    _isLoading = false;
    notifyListeners();
    return result;
  }

  void clearData() {
    _students = [];
    _accountData = null;
    _announcements = [];
    _selectedStudentIndex = 0;
    notifyListeners();
  }
}
