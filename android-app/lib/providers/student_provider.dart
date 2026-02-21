import 'package:flutter/material.dart';
import '../models/student_model.dart';
import '../models/wave_model.dart';
import '../models/announcement_model.dart';
import 'package:dio/dio.dart';
import '../services/student_service.dart';
import '../services/announcement_service.dart';

class StudentProvider with ChangeNotifier {
  final StudentService _studentService = StudentService();
  final AnnouncementService _announcementService = AnnouncementService();

  List<Student> _students = [];
  int _selectedStudentIndex = 0;
  List<Wave> _activeWaves = [];
  List<Announcement> _announcements = [];
  bool _isLoading = false;
  Map<String, dynamic> _settings = {};
  Map<String, dynamic>? _accountData;

  List<Student> get students => _students;
  int get selectedStudentIndex => _selectedStudentIndex;
  Student? get student =>
      _students.isNotEmpty ? _students[_selectedStudentIndex] : null;
  Map<String, dynamic>? get accountData => _accountData;

  bool get isRegistered => _students.isNotEmpty;
  bool get isLoading => _isLoading;
  List<Wave> get activeWaves => _activeWaves;
  List<Announcement> get announcements => _announcements;
  Map<String, dynamic> get settings => _settings;

  Future<void> refreshProfile() async {
    _isLoading = true;
    notifyListeners();

    try {
      final results = await Future.wait([
        _studentService.getProfile(),
        _announcementService.getAnnouncements(),
      ]);

      final profileData = results[0] as Map<String, dynamic>;
      final rawStudents = profileData['students'];
      _students = rawStudents is List
          ? rawStudents.map((s) => s as Student).toList()
          : [];
      _accountData = profileData['user'];

      final rawAnnouncements = results[1];
      _announcements = rawAnnouncements is List
          ? rawAnnouncements.map((a) => a as Announcement).toList()
          : [];

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
    final data = await _studentService.getSettings();
    _settings = data['settings'] ?? {};
    if (data['waves'] != null) {
      _activeWaves = (data['waves'] as List)
          .map((w) => Wave.fromJson(w))
          .toList();
    }
    notifyListeners();
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
        '/student/$id',
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

  void clearData() {
    _students = [];
    _accountData = null;
    _announcements = [];
    _selectedStudentIndex = 0;
    notifyListeners();
  }
}
