import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/ranking_model.dart';

class RankingService {
  final ApiClient _apiClient = ApiClient();

  Future<List<RankingEntry>> getRankings({
    String? jalur,
    String? waveId,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (jalur != null) queryParams['jalur'] = jalur;
      if (waveId != null) queryParams['waveId'] = waveId;

      final response = await _apiClient.dio.get(
        '/ranking',
        queryParameters: queryParams,
      );
      if (response.statusCode == 200) {
        final list = response.data['rankings'] as List;
        return list.map((r) => RankingEntry.fromJson(r)).toList();
      }
    } on DioException catch (e) {
      debugPrint('Get Rankings Error: ${e.message}');
    }
    return [];
  }
}
