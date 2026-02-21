import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  final Dio _dio = Dio();
  final _storage = const FlutterSecureStorage();

  // Replace with your actual live URL or local IP address if testing locally
  static const String baseDomain = 'https://pmbm.mtsn1pacitan.sch.id';
  static const String baseUrl = '$baseDomain/api/v1';

  static String getAssetUrl(String? path) {
    if (path == null || path.isEmpty) return '';
    if (path.startsWith('http')) return path;
    return '$baseDomain$path';
  }

  ApiClient() {
    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 10);
    _dio.options.receiveTimeout = const Duration(seconds: 10);

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'jwt_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          // Handle global errors here (e.g., token expiration)
          if (e.response?.statusCode == 401) {
            // Trigger logout or token refresh if needed
          }
          return handler.next(e);
        },
      ),
    );
  }

  Dio get dio => _dio;
}
