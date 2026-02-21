import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import 'dart:io';
import '../core/api_client.dart';

class DocumentService {
  final ApiClient _apiClient = ApiClient();

  Future<Map<String, dynamic>> uploadFile(File file) async {
    try {
      String fileName = file.path.split('/').last;
      FormData formData = FormData.fromMap({
        "file": await MultipartFile.fromFile(file.path, filename: fileName),
      });

      final response = await _apiClient.dio.post(
        '/student/upload',
        data: formData,
      );
      return {
        'success': response.statusCode == 201,
        'url': response.data['url'],
        'message': response.data['message'],
      };
    } on DioException catch (e) {
      return {
        'success': false,
        'message': e.response?.data['message'] ?? 'Upload gagal',
      };
    }
  }

  Future<bool> linkDocument(String field, String url, String studentId) async {
    try {
      final response = await _apiClient.dio.post(
        '/student/documents',
        data: {'field': field, 'url': url, 'studentId': studentId},
      );
      return response.statusCode == 200;
    } on DioException catch (e) {
      debugPrint('Link Document Error: ${e.message}');
      return false;
    }
  }
}
