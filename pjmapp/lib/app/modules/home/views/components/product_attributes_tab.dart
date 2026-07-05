import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProductAttributesTab extends StatelessWidget {
  final RxList<dynamic> attributesList;
  final RxSet<int> selectedAttributeValueIds;
  final RxBool isLoadingAttributes;
  final VoidCallback onSave;

  const ProductAttributesTab({
    super.key,
    required this.attributesList,
    required this.selectedAttributeValueIds,
    required this.isLoadingAttributes,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFDC2626);

    return Obx(() {
      if (isLoadingAttributes.value) {
        return const Center(child: CircularProgressIndicator(color: primaryColor));
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ...attributesList.map((attr) {
            final values = attr['values'] as List? ?? [];
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  attr['name'] ?? 'Atribut',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: values.map((val) {
                    final valId = val['id'] as int;
                    final isSelected = selectedAttributeValueIds.contains(valId);
                    return ChoiceChip(
                      label: Text(
                        val['value'] ?? '', 
                        style: TextStyle(
                          fontSize: 11, 
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected ? primaryColor : const Color(0xFF334155),
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: primaryColor.withOpacity(0.08),
                      backgroundColor: const Color(0xFFF8FAFC),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      side: BorderSide(
                        color: isSelected ? primaryColor : const Color(0xFFE2E8F0),
                        width: 1,
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      onSelected: (selected) {
                        if (selected) {
                          selectedAttributeValueIds.add(valId);
                        } else {
                          selectedAttributeValueIds.remove(valId);
                        }
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),
                const Divider(color: Color(0xFFF1F5F9)),
                const SizedBox(height: 12),
              ],
            );
          }),
          const SizedBox(height: 16),
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
              onPressed: onSave,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text(
                'SYNC / SIMPAN ATRIBUT',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.5),
              ),
            ),
          ),
        ],
      );
    });
  }
}
