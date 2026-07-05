import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pjmapp/app/data/models/product_model.dart';
import 'package:pjmapp/app/modules/home/controllers/home_controller.dart';
import 'package:pjmapp/app/modules/home/views/product_form_view.dart';

class ProductDetailView extends StatelessWidget {
  final Product product;
  const ProductDetailView({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    final homeController = Get.find<HomeController>();
    const primaryColor = Color(0xFFB91C1C);
    const accentColor = Color(0xFF1E293B);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          // Header Image AppBar
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            backgroundColor: primaryColor,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                product.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  shadows: [Shadow(color: Colors.black54, blurRadius: 4, offset: Offset(0, 2))],
                ),
              ),
              background: Hero(
                tag: 'prod-img-${product.id}',
                child: product.mainImageUrl.isNotEmpty
                    ? Image.network(
                        product.mainImageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => _buildPlaceholderImage(),
                      )
                    : _buildPlaceholderImage(),
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.edit_rounded, color: Colors.white),
                tooltip: 'Edit Produk',
                onPressed: () => Get.to(() => ProductFormView(product: product)),
              ),
              IconButton(
                icon: const Icon(Icons.delete_sweep_rounded, color: Colors.white),
                tooltip: 'Hapus Produk',
                onPressed: () => _confirmDelete(context, homeController),
              ),
            ],
          ),

          // Body Details
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Info Card (Badge, Status)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: product.status.toLowerCase() == 'active' ? const Color(0xFF059669) : Colors.amber.shade700,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          product.type.toUpperCase(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                      Text(
                        'Status: ${product.status.toUpperCase()}',
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Category Breadcrumbs
                  if (product.categories.isNotEmpty)
                    Wrap(
                      spacing: 4,
                      children: product.categories.map((cat) {
                        final isLast = product.categories.last.id == cat.id;
                        return Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              cat.name,
                              style: TextStyle(
                                color: isLast ? primaryColor : const Color(0xFF94A3B8),
                                fontSize: 11,
                                fontWeight: isLast ? FontWeight.bold : FontWeight.w500,
                              ),
                            ),
                            if (!isLast)
                              const Icon(
                                Icons.chevron_right_rounded,
                                size: 14,
                                color: Color(0xFFCBD5E1),
                              ),
                          ],
                        );
                      }).toList(),
                    ),
                  const SizedBox(height: 20),

                  // Description
                  const Text(
                    'Deskripsi Produk',
                    style: TextStyle(
                      color: accentColor,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.description ?? 'Tidak ada deskripsi produk.',
                    style: const TextStyle(
                      color: Color(0xFF475569),
                      fontSize: 12,
                      height: 1.5,
                    ),
                  ),

                  const SizedBox(height: 28),
                  const Divider(color: Color(0xFFE2E8F0)),
                  const SizedBox(height: 16),

                  // Variants list
                  Wrap(
                    alignment: WrapAlignment.spaceBetween,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    spacing: 12,
                    runSpacing: 8,
                    children: [
                      Text(
                        product.variants.isNotEmpty ? 'Variasi Produk' : 'Detail Stok & Harga',
                        style: const TextStyle(
                          color: accentColor,
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Wrap(
                        spacing: 8,
                        runSpacing: 4,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        children: [
                          if (product.type.toLowerCase() == 'configurable') ...[
                            TextButton.icon(
                              onPressed: () => Get.to(() => ProductFormView(parentId: product.id)),
                              icon: const Icon(Icons.add_rounded, size: 16, color: primaryColor),
                              label: const Text('Tambah Varian', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: primaryColor)),
                              style: TextButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                minimumSize: Size.zero,
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              ),
                            ),
                          ],
                          ElevatedButton.icon(
                            onPressed: () => _openMutateStockDialog(context, homeController),
                            icon: const Icon(Icons.swap_horiz_rounded, size: 14, color: Colors.white),
                            label: const Text('Mutasi Stok', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: primaryColor,
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  if (product.variants.isEmpty) ...[
                    // Simple product view
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Umum (Simple Product)',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                    color: accentColor,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'SKU: ${product.sku ?? "-"}',
                                  style: const TextStyle(
                                    color: Colors.grey,
                                    fontSize: 10,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'Rp ${product.price.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  color: primaryColor,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: product.stock > 0
                                      ? const Color(0xFFECFDF5)
                                      : const Color(0xFFFEF2F2),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  'Stok: ${product.stock}',
                                  style: TextStyle(
                                    color: product.stock > 0
                                        ? const Color(0xFF047857)
                                        : const Color(0xFFB91C1C),
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    // Variants product view
                    ...product.variants.map((variant) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    variant.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      color: accentColor,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'SKU: ${variant.sku ?? "-"}',
                                    style: const TextStyle(
                                      color: Colors.grey,
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  'Rp ${variant.price.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    color: primaryColor,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 14,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: variant.stock > 0
                                        ? const Color(0xFFECFDF5)
                                        : const Color(0xFFFEF2F2),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    'Stok: ${variant.stock}',
                                    style: TextStyle(
                                      color: variant.stock > 0
                                          ? const Color(0xFF047857)
                                          : const Color(0xFFB91C1C),
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }),
                  ],

                  // Stock Mutation Logs
                  if (product.stockMutations.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    const Divider(color: Color(0xFFE2E8F0)),
                    const SizedBox(height: 16),
                    const Text(
                      'Histori Mutasi Stok',
                      style: TextStyle(
                        color: accentColor,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: product.stockMutations.length > 5 ? 5 : product.stockMutations.length,
                      itemBuilder: (context, index) {
                        final mutation = product.stockMutations[index];
                        final isIN = mutation.type.toLowerCase() == 'in';
                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          elevation: 0,
                          color: Colors.white,
                          child: ListTile(
                            dense: true,
                            leading: Icon(
                              isIN ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                              color: isIN ? Colors.green : Colors.red,
                              size: 16,
                            ),
                            title: Text(
                              'Stok ${isIN ? "Masuk" : "Keluar"} : ${mutation.quantity}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            subtitle: Text(
                              'Oleh: ${mutation.user} • ${mutation.notes ?? "Koreksi manual"}',
                              style: const TextStyle(fontSize: 9),
                            ),
                            trailing: Text(
                              mutation.createdAt,
                              style: const TextStyle(fontSize: 8, color: Colors.grey),
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      color: const Color(0xFFF1F5F9),
      child: const Center(
        child: Icon(
          Icons.directions_car_filled_rounded,
          color: Color(0xFFB91C1C),
          size: 64,
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context, HomeController controller) {
    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text('Hapus Produk?', style: TextStyle(fontWeight: FontWeight.bold)),
        content: Text('Apakah Anda yakin ingin menghapus "${product.name}" secara permanen dari katalog?'),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text('Batal', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () async {
              Get.back(); // close dialog
              final ok = await controller.deleteProduct(product.id);
              if (ok) {
                Get.back(); // pop detail page
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB91C1C)),
            child: const Text('Hapus', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _openMutateStockDialog(BuildContext context, HomeController controller) {
    final qtyController = TextEditingController();
    final notesController = TextEditingController();
    var selectedType = 'in'.obs;
    
    // Default selected target is either the first variant or the product itself if simple
    var selectedTarget = (product.variants.isNotEmpty ? product.variants.first : product).obs;

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
              // Choose Variant dropdown if configurable
              if (product.variants.isNotEmpty) ...[
                const Text('Pilih Varian:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 6),
                Obx(() => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<Product>(
                          value: selectedTarget.value,
                          isExpanded: true,
                          items: product.variants.map((v) {
                            return DropdownMenuItem(
                              value: v,
                              child: Text('${v.name} (Stok: ${v.stock})', style: const TextStyle(fontSize: 13)),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) selectedTarget.value = val;
                          },
                        ),
                      ),
                    )),
                const SizedBox(height: 16),
              ],

              // Choose type (IN/OUT)
              const Text('Tipe Mutasi:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 6),
              Obx(() => Row(
                    children: [
                      Expanded(
                        child: RadioListTile<String>(
                          title: const Text('IN (Masuk)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          value: 'in',
                          groupValue: selectedType.value,
                          activeColor: Colors.green,
                          onChanged: (val) => selectedType.value = val!,
                        ),
                      ),
                      Expanded(
                        child: RadioListTile<String>(
                          title: const Text('OUT (Keluar)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          value: 'out',
                          groupValue: selectedType.value,
                          activeColor: Colors.red,
                          onChanged: (val) => selectedType.value = val!,
                        ),
                      ),
                    ],
                  )),
              const SizedBox(height: 12),

              // Qty field
              TextField(
                controller: qtyController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'Jumlah Stok',
                  labelStyle: const TextStyle(fontSize: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
              const SizedBox(height: 12),

              // Notes field
              TextField(
                controller: notesController,
                maxLines: 2,
                decoration: InputDecoration(
                  labelText: 'Keterangan / Catatan',
                  labelStyle: const TextStyle(fontSize: 12),
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
            onPressed: () {
              final qty = int.tryParse(qtyController.text) ?? 0;
              if (qty <= 0) {
                Get.snackbar('Kesalahan', 'Jumlah stok harus lebih dari 0',
                    backgroundColor: const Color(0xFFB91C1C), colorText: Colors.white);
                return;
              }
              Get.back();
              controller.mutateStock(
                product.id,
                selectedTarget.value.id,
                selectedType.value,
                qty,
                notesController.text,
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB91C1C)),
            child: const Text('Proses', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
