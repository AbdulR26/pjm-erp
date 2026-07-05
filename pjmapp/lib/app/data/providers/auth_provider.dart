import 'dart:convert';

import 'package:get_storage/get_storage.dart';
import 'package:http/http.dart' as http;

import '../../config/env.dart';
import '../models/user_model.dart';

class AuthProvider {
  static String get baseUrl => Env.apiUrl;

  final _storage = GetStorage();

  // Cookie session storage
  String? _sessionCookie;

  AuthProvider() {
    _sessionCookie = _storage.read<String>('session_cookie');
  }



  /// Login API call
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          if (_sessionCookie != null) 'Cookie': _sessionCookie!,
        },
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && (data['status'] == 'success' || data['status'] == 'SUCCESS')) {
        // Save session cookie
        final setCookie = response.headers['set-cookie'];
        if (setCookie != null) {
          _sessionCookie = setCookie;
          _storage.write('session_cookie', setCookie);
        }

        // Save JWT token for modular endpoints
        final token = data['token'];
        if (token != null) {
          _storage.write('jwt_token', token);
        }

        // Parse & save user
        final user = User.fromJson(data['user']);
        _storage.write('user', data['user']);
        _storage.write('is_logged_in', true);

        return {
          'success': true,
          'message': data['message'] ?? 'Login berhasil.',
          'user': user,
        };
      } else {
        // Handle validation errors
        String errorMsg = data['message'] ?? 'Login gagal.';
        if (data['errors'] != null) {
          final errors = data['errors'] as Map<String, dynamic>;
          errorMsg = errors.values.first is List
              ? (errors.values.first as List).first.toString()
              : errors.values.first.toString();
        }
        return {
          'success': false,
          'message': errorMsg,
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Tidak dapat terhubung ke server. Pastikan server berjalan.',
      };
    }
  }

  /// Get current user profile
  Future<Map<String, dynamic>> me() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/me'),
        headers: {
          'Accept': 'application/json',
          if (_sessionCookie != null) 'Cookie': _sessionCookie!,
        },
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200 && data['status'] == 'success') {
        final user = User.fromJson(data['user']);
        return {
          'success': true,
          'user': user,
        };
      }
      return {'success': false, 'message': 'Session expired.'};
    } catch (e) {
      return {'success': false, 'message': 'Gagal memuat profil.'};
    }
  }

  /// Logout
  Future<Map<String, dynamic>> logout() async {
    try {
      await http.post(
        Uri.parse('$baseUrl/logout'),
        headers: {
          'Accept': 'application/json',
          if (_sessionCookie != null) 'Cookie': _sessionCookie!,
        },
      );

      // Clear stored data regardless
      _sessionCookie = null;
      _storage.remove('session_cookie');
      _storage.remove('user');
      _storage.remove('is_logged_in');

      return {'success': true, 'message': 'Logout berhasil.'};
    } catch (e) {
      // Still clear local data on error
      _sessionCookie = null;
      _storage.remove('session_cookie');
      _storage.remove('user');
      _storage.remove('is_logged_in');
      return {'success': true, 'message': 'Logged out locally.'};
    }
  }

  /// Check if user is logged in
  bool isLoggedIn() {
    return _storage.read<bool>('is_logged_in') ?? false;
  }

  /// Get saved user from storage
  User? getSavedUser() {
    final data = _storage.read('user');
    if (data != null) {
      return User.fromJson(Map<String, dynamic>.from(data));
    }
    return null;
  }
}
