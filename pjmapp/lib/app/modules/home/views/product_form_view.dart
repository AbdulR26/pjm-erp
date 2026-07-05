import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:pjmapp/app/data/models/product_model.dart';
import 'package:pjmapp/app/data/providers/product_provider.dart';
import 'package:pjmapp/app/modules/home/controllers/home_controller.dart';

// Import sub-components
import 'components/product_general_tab.dart';
import 'components/product_category_tab.dart';
import 'components/product_images_tab.dart';
import 'components/product_attributes_tab.dart';
import 'components/product_stock_tab.dart';

class ProductFormView extends StatefulWidget {
  final Product? product; // null for add mode, non-null for edit mode
  final int? parentId; // non-null when adding a variant
  const ProductFormView({super.key, this.product, this.parentId});

  @override
  State<ProductFormView> createState() => _ProductFormViewState();
}

class _ProductFormViewState extends State<ProductFormView> {
  final _formKey = GlobalKey<FormState>();
  final _productProvider = ProductProvider();
  late HomeController _homeController;

  // Controllers
  final nameController = TextEditingController();
  final skuController = TextEditingController();
  final priceController = TextEditingController();
  final stockController = TextEditingController();
  final descController = TextEditingController();

  // Selected state reactives
  final selectedTypeId = 1.obs; 
  final selectedStatusId = 2.obs; 
  final selectedCategoryIds = <int>{}.obs;

  // Multi-resource reactive lists
  final productImages = <dynamic>[].obs;
  final isLoadingImages = false.obs;

  final attributesList = <dynamic>[].obs;
  final selectedAttributeValueIds = <int>{}.obs;
  final isLoadingAttributes = false.obs;

  // Local mutable state copies for product stock
  final currentStock = 0.obs;
  final stockMutationsList = <StockMutation>[].obs;
  final productVariants = <Product>[].obs;

  bool isEditMode = false;
  bool isSaving = false;

  @override
  void initState() {
    super.initState();
    _homeController = Get.find<HomeController>();
    isEditMode = widget.product != null;

    if (widget.parentId != null) {
      selectedTypeId.value = 3; // 3 is variant type id
    }

    if (isEditMode) {
      final p = widget.product!;
      nameController.text = p.name;
      skuController.text = p.sku ?? '';
      priceController.text = p.price.toStringAsFixed(0);
      stockController.text = p.stock.toString();
      descController.text = p.description ?? '';
      selectedTypeId.value = p.productTypeId;
      selectedStatusId.value = p.productStatusId;
      selectedCategoryIds.addAll(p.categories.map((c) => c.id));
      currentStock.value = p.stock;
      stockMutationsList.assignAll(p.stockMutations);
      productVariants.assignAll(p.variants);
      
      // Load lazy resources
      _loadImages();
      _loadAttributes();
    }
  }

  @override
  void dispose() {
    nameController.dispose();
    skuController.dispose();
    priceController.dispose();
    stockController.dispose();
    descController.dispose();
    super.dispose();
  }

  Future<void> _loadImages() async {
    if (!isEditMode) return;
    isLoadingImages.value = true;
    try {
      final res = await _productProvider.getImages(widget.product!.id);
      productImages.assignAll(res);
    } finally {
      isLoadingImages.value = false;
    }
  }

  Future<void> _loadAttributes() async {
    if (!isEditMode) return;
    isLoadingAttributes.value = true;
    try {
      final res = await _productProvider.getAttributes(widget.product!.id);
      attributesList.assignAll(res);

      selectedAttributeValueIds.clear();
      for (var attr in res) {
        final values = attr['values'] as List? ?? [];
        for (var val in values) {
          if (val['selected'] == true) {
            selectedAttributeValueIds.add(val['id']);
          }
        }
      }
    } finally {
      isLoadingAttributes.value = false;
    }
  }

  Future<void> _loadProduct() async {
    if (!isEditMode) return;
    try {
      final updatedList = await _productProvider.getProducts();
      final updatedProd = updatedList.firstWhereOrNull((p) => p.id == widget.product!.id);
      if (updatedProd != null) {
        currentStock.value = updatedProd.stock;
        stockMutationsList.assignAll(updatedProd.stockMutations);
      }
    } catch (_) {}
  }

  Future<void> _loadProductVariants() async {
    if (!isEditMode) return;
    try {
      final updatedList = await _productProvider.getProducts();
      final updatedProd = updatedList.firstWhereOrNull((p) => p.id == widget.product!.id);
      if (updatedProd != null) {
        productVariants.assignAll(updatedProd.variants);
      }
    } catch (_) {}
  }

  Future<void> _pickAndUploadImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile == null) return;

    setState(() {
      isSaving = true;
    });

    try {
      final res = await _productProvider.uploadImage(widget.product!.id, pickedFile.path);
      if (res['success'] == true) {
        Get.snackbar(
          'Sukses',
          'Gambar berhasil diunggah.',
          backgroundColor: const Color(0xFF15803D),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
        _loadImages();
      } else {
        Get.snackbar(
          'Gagal',
          res['message'] ?? 'Gagal mengunggah gambar.',
          backgroundColor: const Color(0xFFB91C1C),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Koneksi pengunggahan gagal.',
        backgroundColor: const Color(0xFFB91C1C),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(16),
      );
    } finally {
      setState(() {
        isSaving = false;
      });
    }
  }

  Future<void> _deleteImage(int imageId) async {
    setState(() {
      isSaving = true;
    });
    try {
      final ok = await _productProvider.deleteImage(widget.product!.id, imageId);
      if (ok) {
        _loadImages();
      }
    } finally {
      setState(() {
        isSaving = false;
      });
    }
  }

  Future<void> _setPrimaryImage(int imageId) async {
    setState(() {
      isSaving = true;
    });
    try {
      final ok = await _productProvider.setPrimaryImage(widget.product!.id, imageId);
      if (ok) {
        _loadImages();
      }
    } finally {
      setState(() {
        isSaving = false;
      });
    }
  }

  Future<void> _saveProduct() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      isSaving = true;
    });

    final payload = {
      'name': nameController.text.trim(),
      'sku': skuController.text.trim(),
      'price': double.tryParse(priceController.text.trim()) ?? 0.0,
      'stock': int.tryParse(stockController.text.trim()) ?? 0,
      'description': descController.text.trim(),
      'product_type_id': widget.parentId != null ? 3 : selectedTypeId.value,
      'product_status_id': selectedStatusId.value,
      'category_ids': selectedCategoryIds.toList(),
      if (widget.parentId != null) 'parent_id': widget.parentId,
    };

    try {
      Map<String, dynamic> result;
      if (isEditMode) {
        result = await _productProvider.updateProduct(widget.product!.id, payload);
      } else {
        result = await _productProvider.storeProduct(payload);
      }

      if (result['success'] == true) {
        _homeController.fetchProducts(); // Refresh list
        Get.back();
        if (isEditMode) {
          Get.back(); // pop detail page
        }
        
        Get.snackbar(
          'Sukses',
          result['message'],
          backgroundColor: const Color(0xFF15803D),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
      } else {
        Get.snackbar(
          'Gagal',
          result['message'] ?? 'Gagal memproses data produk.',
          backgroundColor: const Color(0xFFB91C1C),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Koneksi terputus.',
        backgroundColor: const Color(0xFFB91C1C),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(16),
      );
    } finally {
      setState(() {
        isSaving = false;
      });
    }
  }

  Future<void> _saveAttributes() async {
    setState(() {
      isSaving = true;
    });

    try {
      final ok = await _productProvider.syncAttributes(
        widget.product!.id,
        selectedAttributeValueIds.toList(),
      );

      if (ok) {
        Get.snackbar(
          'Sukses',
          'Atribut berhasil diperbarui.',
          backgroundColor: const Color(0xFF15803D),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
        _loadAttributes();
      } else {
        Get.snackbar(
          'Gagal',
          'Gagal menyimpan atribut.',
          backgroundColor: const Color(0xFFB91C1C),
          colorText: Colors.white,
          snackPosition: SnackPosition.BOTTOM,
          margin: const EdgeInsets.all(16),
        );
      }
    } catch (e) {
      Get.snackbar(
        'Error',
        'Koneksi gagal.',
        backgroundColor: const Color(0xFFB91C1C),
        colorText: Colors.white,
        snackPosition: SnackPosition.BOTTOM,
        margin: const EdgeInsets.all(16),
      );
    } finally {
      setState(() {
        isSaving = false;
      });
    }
  }

  void _openMutateStockDialog(BuildContext context) {
    final qtyController = TextEditingController();
    final notesController = TextEditingController();
    var selectedType = 'in'.obs;

    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text('Mutasi Stok Manual', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Tipe Mutasi:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 6),
              Obx(() => Row(
                    children: [
                      Radio<String>(
                        value: 'in',
                        groupValue: selectedType.value,
                        onChanged: (val) {
                          if (val != null) selectedType.value = val;
                        },
                      ),
                      const Text('Masuk (IN)', style: TextStyle(fontSize: 12)),
                      const SizedBox(width: 16),
                      Radio<String>(
                        value: 'out',
                        groupValue: selectedType.value,
                        onChanged: (val) {
                          if (val != null) selectedType.value = val;
                        },
                      ),
                      const Text('Keluar (OUT)', style: TextStyle(fontSize: 12)),
                    ],
                  )),
              const SizedBox(height: 16),
              const Text('Jumlah Qty:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 6),
              TextFormField(
                controller: qtyController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  hintText: 'Masukkan jumlah barang',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Catatan / Keterangan:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 6),
              TextFormField(
                controller: notesController,
                decoration: InputDecoration(
                  hintText: 'Keterangan mutasi stok',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Batal', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB91C1C),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              final qty = int.tryParse(qtyController.text) ?? 0;
              if (qty <= 0) {
                Get.snackbar('Error', 'Jumlah Qty harus lebih dari 0', backgroundColor: const Color(0xFFB91C1C), colorText: Colors.white);
                return;
              }

              Get.back(); // close dialog
              _homeController.mutateStock(
                widget.product!.id,
                widget.product!.id,
                selectedType.value,
                qty,
                notesController.text,
              );
              Future.delayed(const Duration(milliseconds: 600), () {
                _loadProduct();
              });
            },
            child: const Text('Simpan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFB91C1C);
    const accentColor = Color(0xFF1E293B);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          isEditMode ? 'Edit Produk' : 'Tambah Produk Baru',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: Colors.white,
        foregroundColor: accentColor,
        elevation: 0.5,
        actions: [
          if (isSaving)
            const Center(
              child: Padding(
                padding: EdgeInsets.only(right: 16.0),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2, color: primaryColor),
                ),
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
              child: TextButton.icon(
                onPressed: _saveProduct,
                icon: const Icon(Icons.check_rounded, size: 14, color: Colors.white),
                label: const Text(
                  'SIMPAN',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.5),
                ),
                style: TextButton.styleFrom(
                  backgroundColor: const Color(0xFFDC2626),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. KARTU INFORMASI UMUM
              _buildSectionCard(
                title: 'Informasi Umum',
                icon: Icons.info_outline_rounded,
                child: ProductGeneralTab(
                  nameController: nameController,
                  skuController: skuController,
                  priceController: priceController,
                  stockController: stockController,
                  descController: descController,
                  selectedTypeId: selectedTypeId,
                  selectedStatusId: selectedStatusId,
                  parentId: widget.parentId,
                ),
              ),

              // 2. KARTU KATEGORI
              _buildSectionCard(
                title: 'Kategori Produk',
                icon: Icons.category_outlined,
                child: ProductCategoryTab(
                  homeController: _homeController,
                  selectedCategoryIds: selectedCategoryIds,
                  isSaving: isSaving,
                  onSave: _saveProduct,
                  showSaveButton: false, // hidden since we save via top appbar button
                ),
              ),

              // 2.5. KARTU VARIASI PRODUK (Only edit mode and type is Configurable)
              if (isEditMode && selectedTypeId.value == 2)
                _buildSectionCard(
                  title: 'Variasi Produk',
                  icon: Icons.grid_view_rounded,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Daftar Varian Aktif:',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                          ),
                          Container(
                            height: 36,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              gradient: const LinearGradient(
                                colors: [Color(0xFFDC2626), Color(0xFF991B1B)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: primaryColor.withOpacity(0.2),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: ElevatedButton.icon(
                              onPressed: () async {
                                await Get.to(() => ProductFormView(parentId: widget.product!.id));
                                _loadProductVariants();
                              },
                              icon: const Icon(Icons.add_rounded, size: 14, color: Colors.white),
                              label: const Text('TAMBAH VARIAN', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.transparent,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Obx(() {
                        if (productVariants.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 16.0),
                            child: Center(
                              child: Text(
                                'Belum ada variasi produk.',
                                style: TextStyle(color: Colors.grey, fontSize: 12),
                              ),
                            ),
                          );
                        }
                        return ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: productVariants.length,
                          itemBuilder: (context, index) {
                            final variant = productVariants[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                                side: const BorderSide(color: Color(0xFFF1F5F9)),
                              ),
                              elevation: 0,
                              color: const Color(0xFFF8FAFC),
                              child: ListTile(
                                dense: true,
                                title: Text(
                                  variant.name,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                                ),
                                subtitle: Text(
                                  'SKU: ${variant.sku ?? "-"} • Rp ${variant.price.toStringAsFixed(0)} • Stok: ${variant.stock}',
                                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                                ),
                                trailing: IconButton(
                                  icon: const Icon(Icons.edit_rounded, size: 16, color: primaryColor),
                                  onPressed: () async {
                                    await Get.to(() => ProductFormView(product: variant, parentId: widget.product!.id));
                                    _loadProductVariants();
                                  },
                                ),
                              ),
                            );
                          },
                        );
                      }),
                    ],
                  ),
                ),

              // 3. KARTU GAMBAR (Only edit mode)
              if (isEditMode)
                _buildSectionCard(
                  title: 'Galeri Gambar Produk',
                  icon: Icons.image_outlined,
                  child: ProductImagesTab(
                    productImages: productImages,
                    isLoadingImages: isLoadingImages,
                    onPickAndUpload: _pickAndUploadImage,
                    onDelete: _deleteImage,
                    onSetPrimary: _setPrimaryImage,
                  ),
                ),

              // 4. KARTU ATRIBUT (Only edit mode)
              if (isEditMode)
                _buildSectionCard(
                  title: 'Atribut / Spesifikasi',
                  icon: Icons.tune_rounded,
                  child: ProductAttributesTab(
                    attributesList: attributesList,
                    selectedAttributeValueIds: selectedAttributeValueIds,
                    isLoadingAttributes: isLoadingAttributes,
                    onSave: _saveAttributes,
                  ),
                ),

              // 5. KARTU STOK (Only edit mode)
              if (isEditMode)
                Obx(() => _buildSectionCard(
                  title: 'Manajemen & Histori Stok',
                  icon: Icons.warehouse_outlined,
                  child: ProductStockTab(
                    stock: currentStock.value,
                    stockMutations: stockMutationsList,
                    onMutateStock: () {
                      _openMutateStockDialog(context);
                    },
                  ),
                )),
                
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.015),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDC2626).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, size: 16, color: const Color(0xFFDC2626)),
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.2,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: child,
          ),
        ],
      ),
    );
  }
}
