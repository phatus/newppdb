import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../core/api_client.dart';

class AuthProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  final _storage = const FlutterSecureStorage();
  final GoogleSignIn _googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);

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
      final response = await _apiClient.dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );

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

  Future<bool> register(String email, String password, String name) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiClient.dio.post(
        '/auth/register',
        data: {'email': email, 'password': password, 'name': name},
      );

      if (response.statusCode == 201) {
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } on DioException catch (e) {
      _isLoading = false;
      notifyListeners();
      debugPrint('Register Error: ${e.response?.data['message'] ?? e.message}');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<bool> signInWithGoogle() async {
    _isLoading = true;
    notifyListeners();

    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final GoogleSignInAuthentication googleAuth =
          await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final response = await _apiClient.dio.post(
        '/auth/google',
        data: {'idToken': idToken},
      );

      if (response.statusCode == 200) {
        _token = response.data['token'];
        _user = response.data['user'];
        await _storage.write(key: 'jwt_token', value: _token);
        _isLoading = false;
        notifyListeners();
        return true;
      }
    } catch (e) {
      debugPrint('Google Signin Error: $e');
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
    await _googleSignIn.signOut();
    _token = null;
    _user = null;
    notifyListeners();
  }
}
