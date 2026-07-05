import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pjmapp/app/modules/home/controllers/home_controller.dart';

class ProductCategoryTab extends StatelessWidget {
  final HomeController homeController;
  final RxSet<int> selectedCategoryIds;
  final bool isSaving;
  final VoidCallback onSave;
  final bool showSaveButton;

  const ProductCategoryTab({
    super.key,
    required this.homeController,
    required this.selectedCategoryIds,
    required this.isSaving,
    required this.onSave,
    this.showSaveButton = true,
  });

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFDC2626);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Pilih Kategori Produk:',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
        ),
        const SizedBox(height: 12),
        Obx(() {
          if (homeController.categoriesList.isEmpty) {
            return const Text('Tidak ada kategori tersedia.', style: TextStyle(fontSize: 12, color: Colors.grey));
          }
          return Wrap(
            spacing: 8,
            runSpacing: 8,
            children: homeController.categoriesList.map((cat) {
              final isSelected = selectedCategoryIds.contains(cat.id);
              return FilterChip(
                label: Text(
                  cat.name, 
                  style: TextStyle(
                    fontSize: 11, 
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? primaryColor : const Color(0xFF334155),
                  ),
                ),
                selected: isSelected,
                selectedColor: primaryColor.withOpacity(0.08),
                checkmarkColor: primaryColor,
                backgroundColor: const Color(0xFFF8FAFC),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                side: BorderSide(
                  color: isSelected ? primaryColor : const Color(0xFFE2E8F0),
                  width: 1,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                onSelected: (selected) {
                  if (selected) {
                    selectedCategoryIds.add(cat.id);
                  } else {
                    selectedCategoryIds.remove(cat.id);
                  }
                },
              );
            }).toList(),
          );
        }),
        if (showSaveButton) ...[
          const SizedBox(height: 24),
          Container(
            height: 48,
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              gradient: const LinearGradient(
                colors: [Color(0xFFDC2626), Color(0xFF991B1B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: primaryColor.withOpacity(0.25),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: isSaving ? null : onSave,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text(
                'SIMPAN KATEGORI',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.5),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
