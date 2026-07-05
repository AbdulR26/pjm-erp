import 'package:get/get.dart';
import 'package:flutter/material.dart';
import 'package:pjmapp/app/data/models/product_model.dart';
import 'package:pjmapp/app/data/providers/product_provider.dart';

class HomeController extends GetxController {
  final currentIndex = 0.obs;
  
  final _productProvider = ProductProvider();
  
  // Reactives for Products
  final productsList = <Product>[].obs;
  final filteredProductsList = <Product>[].obs;
  final isLoadingProducts = false.obs;
  final searchQuery = ''.obs;

  // Reactives for Categories
  final categoriesList = <CategoryTree>[].obs;
  final isLoadingCategories = false.obs;

  void changePage(int index) {
    currentIndex.value = index;
    if (index == 0 || index == 1) {
      fetchProducts();
    }
  }

  @override
  void onInit() {
    super.onInit();
    fetchProducts();
    fetchCategories();
  }

  /// Fetch products from API
  Future<void> fetchProducts() async {
    isLoadingProducts.value = true;
    try {
      final res = await _productProvider.getProducts();
      // Show only parent products in the catalog list
      final parentProducts = res.where((p) => p.parentId == null).toList();
      productsList.assignAll(parentProducts);
      filterProducts(searchQuery.value);
    } finally {
      isLoadingProducts.value = false;
    }
  }

  /// Fetch categories tree from API
  Future<void> fetchCategories() async {
    isLoadingCategories.value = true;
    try {
      final res = await _productProvider.getCategories();
      categoriesList.assignAll(res);
    } finally {
      isLoadingCategories.value = false;
    }
  }

  /// Filter products by search query
  void filterProducts(String query) {
    searchQuery.value = query;
    if (query.isEmpty) {
      filteredProductsList.assignAll(productsList);
    } else {
      filteredProductsList.assignAll(
        productsList
            .where((p) => p.name.toLowerCase().contains(query.toLowerCase()))
            .toList(),
      );
    }
  }

  /// Delete a product
  Future<bool> deleteProduct(int id) async {
    final success = await _productProvider.deleteProduct(id);
    if (success) {
      productsList.removeWhere((p) => p.id == id);
      filterProducts(searchQuery.value);
      Get.snackbar(
        'Sukses',
        'Produk berhasil dihapus dari katalog.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1E293B),
        colorText: Colors.white,
      );
    } else {
      Get.snackbar(
        'Gagal',
        'Gagal menghapus produk.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFB91C1C),
        colorText: Colors.white,
      );
    }
    return success;
  }

  /// Mutate stock for a variant
  Future<void> mutateStock(
    int productId,
    int variantId,
    String type,
    int quantity,
    String notes,
  ) async {
    final result = await _productProvider.mutateStock(
      productId,
      variantId: variantId,
      type: type,
      quantity: quantity,
      source: 'manual',
      notes: notes,
    );

    if (result['success'] == true) {
      fetchProducts(); // reload data
      Get.snackbar(
        'Sukses',
        result['message'],
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF15803D),
        colorText: Colors.white,
      );
    } else {
      Get.snackbar(
        'Gagal',
        result['message'],
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFFB91C1C),
        colorText: Colors.white,
      );
    }
  }
}
