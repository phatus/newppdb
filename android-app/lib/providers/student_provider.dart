import 'package:flutter/material.dart';
import '../models/student_model.dart';
import '../models/wave_model.dart';
import '../services/student_service.dart';

class StudentProvider with ChangeNotifier {
  final StudentService _studentService = StudentService();

  Student? _student;
  List<Wave> _activeWaves = [];
  bool _isLoading = false;
  Map<String, dynamic> _settings = {};

  Student? get student => _student;
  bool get isRegistered => _student != null;
  bool get isLoading => _isLoading;
  List<Wave> get activeWaves => _activeWaves;
  Map<String, dynamic> get settings => _settings;

  Future<void> refreshProfile() async {
    _isLoading = true;
    notifyListeners();

    _student = await _studentService.getProfile();

    _isLoading = false;
    notifyListeners();
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
      _student = result['student'];
    }

    _isLoading = false;
    notifyListeners();
    return result;
  }
}
