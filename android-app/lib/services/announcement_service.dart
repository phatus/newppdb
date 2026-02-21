import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/announcement_model.dart';

class AnnouncementService {
  final ApiClient _apiClient = ApiClient();

  Future<List<Announcement>> getAnnouncements() async {
    try {
      final response = await _apiClient.dio.get('/announcements');
      if (response.statusCode == 200) {
        final list = response.data['announcements'] as List;
        return list.map((a) => Announcement.fromJson(a)).toList();
      }
    } on DioException catch (e) {
      debugPrint('Get Announcements Error: ${e.message}');
    }
    return [];
  }
}
