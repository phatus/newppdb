import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import '../core/api_client.dart';

class AuthProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  final _storage = const FlutterSecureStorage();
  
  bool _isLoading = false;
  String? _token;
  Map<String, dynamic>? _user;

  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;
  Map<String, dynamic>? get user => _user;

  AuthProvider() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    _token = await _storage.read(key: 'jwt_token');
    // You might want to fetch user profile here to verify token
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.statusCode == 200) {
        _token = response.data['token'];
        _user = response.data['user'];
        await _storage.write(key: 'jwt_token', value: _token);
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } on DioException catch (e) {
      _isLoading = false;
      notifyListeners();
      debugPrint('Login Error: ${e.response?.data['message'] ?? e.message}');
    }
    
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    _token = null;
    _user = null;
    notifyListeners();
  }
}
