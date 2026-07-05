import 'package:flutter/material.dart';
import 'package:pjmapp/app/data/models/product_model.dart';

class ProductStockTab extends StatelessWidget {
  final int stock;
  final List<StockMutation> stockMutations;
  final VoidCallback onMutateStock;

  const ProductStockTab({
    super.key,
    required this.stock,
    required this.stockMutations,
    required this.onMutateStock,
  });

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFDC2626);
    const accentColor = Color(0xFF1E293B);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Current Stock Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Stok Saat Ini', style: TextStyle(color: Color(0xFF64748B), fontSize: 11, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 6),
                  Text(
                    '$stock Pcs',
                    style: const TextStyle(color: accentColor, fontWeight: FontWeight.bold, fontSize: 24, letterSpacing: -0.5),
                  ),
                ],
              ),
              Container(
                height: 40,
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
                  onPressed: onMutateStock,
                  icon: const Icon(Icons.swap_horiz_rounded, size: 16, color: Colors.white),
                  label: const Text(
                    'MUTASI STOK',
                    style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 28),

        // Mutations history list
        const Text(
          'Histori Mutasi Stok:',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
        ),
        const SizedBox(height: 12),
        if (stockMutations.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.symmetric(vertical: 24.0),
              child: Text('Belum ada histori mutasi stok.', style: TextStyle(color: Colors.grey, fontSize: 12)),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: stockMutations.length,
            itemBuilder: (context, index) {
              final mutation = stockMutations[index];
              final isIN = mutation.type.toLowerCase() == 'in';

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: const BorderSide(color: Color(0xFFF1F5F9)),
                ),
                elevation: 0,
                color: const Color(0xFFF8FAFC),
                child: ListTile(
                  dense: true,
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isIN ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isIN ? Icons.arrow_downward_rounded : Icons.arrow_upward_rounded,
                      color: isIN ? Colors.green : Colors.red,
                      size: 14,
                    ),
                  ),
                  title: Text(
                    'Stok ${isIN ? "Masuk" : "Keluar"} : ${mutation.quantity}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1E293B)),
                  ),
                  subtitle: Text(
                    'Oleh: ${mutation.user} • ${mutation.notes ?? "Koreksi manual"}',
                    style: const TextStyle(fontSize: 10, color: Color(0xFF64748B)),
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
    );
  }
}
