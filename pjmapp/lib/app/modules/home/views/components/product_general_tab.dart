import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProductGeneralTab extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController skuController;
  final TextEditingController priceController;
  final TextEditingController stockController;
  final TextEditingController descController;
  final RxInt selectedTypeId;
  final RxInt selectedStatusId;
  final int? parentId;

  const ProductGeneralTab({
    super.key,
    required this.nameController,
    required this.skuController,
    required this.priceController,
    required this.stockController,
    required this.descController,
    required this.selectedTypeId,
    required this.selectedStatusId,
    this.parentId,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: nameController,
          decoration: _buildInputDecoration('Nama Produk *', Icons.shopping_bag_outlined),
          style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
          validator: (val) => val == null || val.isEmpty ? 'Nama wajib diisi' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: skuController,
          decoration: _buildInputDecoration('SKU Produk *', Icons.qr_code_scanner_rounded),
          style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
          validator: (val) => val == null || val.isEmpty ? 'SKU wajib diisi' : null,
        ),
        const SizedBox(height: 16),
        parentId != null || selectedTypeId.value == 3
            ? TextFormField(
                initialValue: 'Variant',
                enabled: false,
                style: const TextStyle(fontSize: 13, color: Color(0xFF64748B), fontWeight: FontWeight.w600),
                decoration: _buildInputDecoration('Tipe Produk', Icons.layers_outlined),
              )
            : Obx(() => DropdownButtonFormField<int>(
                  value: selectedTypeId.value,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
                  decoration: _buildInputDecoration('Tipe Produk', Icons.layers_outlined),
                  dropdownColor: Colors.white,
                  items: const [
                    DropdownMenuItem(value: 1, child: Text('Simple')),
                    DropdownMenuItem(value: 2, child: Text('Configurable')),
                  ],
                  onChanged: (val) {
                    if (val != null) selectedTypeId.value = val;
                  },
                )),
        const SizedBox(height: 16),
        TextFormField(
          controller: priceController,
          keyboardType: TextInputType.number,
          style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
          decoration: _buildInputDecoration('Harga Jual (Rp) *', Icons.monetization_on_rounded),
          validator: (val) => val == null || val.isEmpty ? 'Harga wajib diisi' : null,
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: stockController,
          keyboardType: TextInputType.number,
          style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
          decoration: _buildInputDecoration('Stok Awal *', Icons.inventory_2_rounded),
          validator: (val) => val == null || val.isEmpty ? 'Stok wajib diisi' : null,
        ),
        const SizedBox(height: 16),
        Obx(() => DropdownButtonFormField<int>(
              value: selectedStatusId.value,
              style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
              decoration: _buildInputDecoration('Status Publikasi', Icons.visibility_rounded),
              dropdownColor: Colors.white,
              items: const [
                DropdownMenuItem(value: 1, child: Text('Draft')),
                DropdownMenuItem(value: 2, child: Text('Active')),
                DropdownMenuItem(value: 3, child: Text('Archived')),
                DropdownMenuItem(value: 4, child: Text('Inactive')),
              ],
              onChanged: (val) {
                if (val != null) selectedStatusId.value = val;
              },
            )),
        const SizedBox(height: 16),
        TextFormField(
          controller: descController,
          maxLines: 4,
          style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A)),
          decoration: _buildInputDecoration('Deskripsi Produk', Icons.description_rounded),
        ),
      ],
    );
  }

  InputDecoration _buildInputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
      prefixIcon: Icon(icon, size: 16, color: const Color(0xFF94A3B8)),
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFFDC2626), width: 1.5),
      ),
    );
  }
}
