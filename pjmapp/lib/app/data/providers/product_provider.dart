import 'dart:convert';
import 'package:get_storage/get_storage.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import '../../config/env.dart';
import '../models/product_model.dart';

class ProductProvider {
  // Get host base and point to modular API v1
  static String get baseUrl {
    final cleanHost = Env.apiUrl.replaceAll('/adminv1/api', '');
    return '$cleanHost/api/v1';
  }
  
  final _storage = GetStorage();

  String? get _jwtToken => _storage.read<String>('jwt_token');

  Map<String, String> get _headers => {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        if (_jwtToken != null) 'Authorization': 'Bearer $_jwtToken',
      };

  /// Get list of all products (with pagination limit increased to show all)
  Future<List<Product>> getProducts() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/products?limit=100'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['status'] == 'SUCCESS') {
          final List list = data['data'] ?? [];
          return list.map((item) => Product.fromJson(item)).toList();
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Get categories tree
  Future<List<CategoryTree>> getCategories() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/categories'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        if (data['status'] == 'success') {
          final List list = data['categories'] ?? [];
          return list.map((item) => CategoryTree(
            id: item['id'] ?? 0,
            name: item['name'] ?? '',
            isParent: (item['parent_id'] == null),
            children: [],
          )).toList();
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Store product
  Future<Map<String, dynamic>> storeProduct(Map<String, dynamic> data) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/products'),
        headers: _headers,
        body: jsonEncode(data),
      );

      final responseData = jsonDecode(response.body);
      if (response.statusCode == 200 || response.statusCode == 201) {
        // Return created product id if present in data key
        return {
          'success': true,
          'message': responseData['message'] ?? 'Produk berhasil disimpan.',
          'id': responseData['data'] != null ? responseData['data']['id'] : null,
        };
      }
      return {
        'success': false,
        'message': responseData['message'] ?? 'Gagal menyimpan produk.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Gagal menghubungkan ke server.',
      };
    }
  }

  /// Update product
  Future<Map<String, dynamic>> updateProduct(int id, Map<String, dynamic> data) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/products/$id'),
        headers: _headers,
        body: jsonEncode(data),
      );

      final responseData = jsonDecode(response.body);
      if (response.statusCode == 200) {
        return {
          'success': true,
          'message': responseData['message'] ?? 'Produk berhasil diperbarui.',
        };
      }
      return {
        'success': false,
        'message': responseData['message'] ?? 'Gagal memperbarui produk.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Gagal menghubungkan ke server.',
      };
    }
  }

  /// Delete product
  Future<bool> deleteProduct(int id) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/products/$id'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['status'] == 'SUCCESS';
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Mutate stock for a variant
  Future<Map<String, dynamic>> mutateStock(
    int productId, {
    required int variantId,
    required String type, // in, out
    required int quantity,
    required String source, // manual, adjustment, etc
    String? notes,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/products/$productId/mutations/adjust'),
        headers: _headers,
        body: jsonEncode({
          'type': type,
          'quantity': quantity,
          'notes': notes ?? 'Adjustment',
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 200 && data['status'] == 'SUCCESS') {
        return {
          'success': true,
          'message': data['message'] ?? 'Mutasi stok berhasil.',
        };
      }
      return {
        'success': false,
        'message': data['message'] ?? 'Gagal memproses mutasi stok.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Gagal menghubungkan ke server.',
      };
    }
  }

  // ==========================================
  // IMAGE MANAGEMENT
  // ==========================================
  
  /// Get images of a product
  Future<List<dynamic>> getImages(int productId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/products/$productId/images'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body) as List;
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Upload image to product R2
  Future<Map<String, dynamic>> uploadImage(int productId, String filePath) async {
    try {
      final uri = Uri.parse('$baseUrl/products/$productId/images');
      final request = http.MultipartRequest('POST', uri);
      
      // Copy jwt token authorization header
      if (_jwtToken != null) {
        request.headers['Authorization'] = 'Bearer $_jwtToken';
      }
      request.headers['Accept'] = 'application/json';
      
      request.files.add(await http.MultipartFile.fromPath(
        'file', 
        filePath,
        contentType: MediaType('image', 'jpeg'),
      ));

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['success'] == true) {
        return {
          'success': true,
          'image': responseData['image'],
        };
      }
      return {
        'success': false,
        'message': responseData['message'] ?? 'Gagal mengunggah gambar.',
      };
    } catch (e) {
      return {
        'success': false,
        'message': 'Koneksi pengunggahan gambar terputus.',
      };
    }
  }

  /// Delete image
  Future<bool> deleteImage(int productId, int imageId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/products/$productId/images/$imageId'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['success'] == true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Set primary image
  Future<bool> setPrimaryImage(int productId, int imageId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/products/$productId/images/$imageId/primary'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['success'] == true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // ==========================================
  // ATTRIBUTE MANAGEMENT
  // ==========================================

  /// Get attributes options and selections
  Future<List<dynamic>> getAttributes(int productId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/products/$productId/attributes'),
        headers: _headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data as List;
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Sync attributes values selections
  Future<bool> syncAttributes(int productId, List<int> valueIds) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/products/$productId/attributes/sync'),
        headers: _headers,
        body: jsonEncode({
          'attribute_value_ids': valueIds,
        }),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['success'] == true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
