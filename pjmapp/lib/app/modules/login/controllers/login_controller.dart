import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../data/models/user_model.dart';
import '../../../data/providers/auth_provider.dart';

class LoginController extends GetxController {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  final isObscure = true.obs;
  final isLoading = false.obs;

  final AuthProvider _authProvider = AuthProvider();

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    super.onClose();
  }

  void toggleObscure() {
    isObscure.value = !isObscure.value;
  }

  Future<void> login() async {
    String email = emailController.text.trim();
    String password = passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      Get.snackbar(
        "Peringatan",
        "Email dan password harus diisi",
        backgroundColor: Colors.amber,
        colorText: Colors.black,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(16),
        borderRadius: 12,
      );
      return;
    }

    isLoading.value = true;

    try {
      final result = await _authProvider.login(email, password);

      if (result['success'] == true) {
        final User user = result['user'];

        Get.snackbar(
          "Berhasil",
          "Selamat datang, ${user.name}!",
          backgroundColor: const Color(0xFF2E5496),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
          borderRadius: 12,
          duration: const Duration(seconds: 2),
        );

        // Navigate to home after successful login
        await Future.delayed(const Duration(milliseconds: 500));
        Get.offAllNamed('/home');
      } else {
        Get.snackbar(
          "Login Gagal",
          result['message'] ?? 'Email atau password salah.',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
          borderRadius: 12,
        );
      }
    } catch (e) {
      Get.snackbar(
        "Error",
        "Terjadi kesalahan. Coba lagi nanti.",
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(16),
        borderRadius: 12,
      );
    } finally {
      isLoading.value = false;
    }
  }
}
