import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/student_model.dart';
import '../models/grade_model.dart';

class StudentService {
  final ApiClient _apiClient = ApiClient();
  ApiClient get apiClient => _apiClient;

  Future<Map<String, dynamic>> getProfile() async {
    try {
      final response = await _apiClient.dio.get('student/profile');
      if (response.statusCode == 200) {
        final rawStudents = response.data['students'];
        return {
          'user': response.data['user'],
          'students': rawStudents is List
              ? rawStudents.map((s) => Student.fromJson(s)).toList()
              : <Student>[],
        };
      }
    } on DioException catch (e) {
      debugPrint('Get Profile Error: ${e.message}');
      if (e.response != null) {
        debugPrint('Response Body: ${e.response?.data}');
      }
    }
    return {'user': null, 'students': <Student>[]};
  }

  Future<Map<String, dynamic>> registerStudent(
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _apiClient.dio.post(
        'student/register',
        data: data,
      );
      return {
        'success': response.statusCode == 201,
        'message': response.data['message'],
        'student': response.data['student'] != null
            ? Student.fromJson(response.data['student'])
            : null,
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message':
            e.response?.data['message'] ?? 'Terjadi kesalahan saat pendaftaran',
      };
    }
  }

  Future<Map<String, dynamic>> getSettings() async {
    try {
      final response = await _apiClient.dio.get('settings');
      return response.data;
    } on DioException catch (e) {
      debugPrint('Get Settings Error: ${e.message}');
      if (e.response != null) {
        debugPrint('Response Body: ${e.response?.data}');
      }
      return {};
    }
  }

  Future<Map<String, dynamic>> saveGrades(
    String studentId,
    List<GradePayload> payloads,
  ) async {
    try {
      final response = await _apiClient.dio.post(
        'student/$studentId/grades',
        data: {'payloads': payloads.map((p) => p.toJson()).toList()},
      );
      return {
        'success': response.statusCode == 200,
        'message': response.data['message'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Gagal menyimpan nilai',
      };
    }
  }

  Future<Map<String, dynamic>> reRegister(
    String studentId,
    String newJalur,
  ) async {
    try {
      final response = await _apiClient.dio.post(
        'student/$studentId/re-register',
        data: {'newJalur': newJalur},
      );
      return {
        'success': response.statusCode == 200,
        'message': response.data['message'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message':
            e.response?.data['message'] ?? 'Gagal melakukan pendaftaran ulang',
      };
    }
  }
}
