import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pjmapp/app/data/models/product_model.dart';
import 'package:pjmapp/app/modules/home/views/product_detail_view.dart';
import 'package:pjmapp/app/modules/home/views/product_form_view.dart';
import '../controllers/home_controller.dart';

// Slate Color Palette to avoid Colors.slate compilation errors
const Color slate50 = Color(0xFFF8FAFC);
const Color slate100 = Color(0xFFF1F5F9);
const Color slate200 = Color(0xFFE2E8F0);
const Color slate300 = Color(0xFFCBD5E1);
const Color slate400 = Color(0xFF94A3B8);
const Color slate500 = Color(0xFF64748B);
const Color slate600 = Color(0xFF475569);
const Color slate700 = Color(0xFF334155);
const Color slate800 = Color(0xFF1E293B);
const Color slate900 = Color(0xFF0F172A);

class HomeView extends GetView<HomeController> {
  const HomeView({super.key});

  @override
  Widget build(BuildContext context) {
    const primaryColor = Color(0xFFB91C1C); // Brand Red
    const accentColor = Color(0xFF1E293B);  // Slate Dark

    return Obx(() {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: SafeArea(
          child: IndexedStack(
            index: controller.currentIndex.value,
            children: [
              _buildDashboardTab(context, primaryColor, accentColor),
              _buildProductTab(context, primaryColor),
              _buildOrderTab(context, primaryColor),
              _buildCustomerTab(context, primaryColor),
              _buildSettingTab(context, primaryColor),
            ],
          ),
        ),
        floatingActionButton: controller.currentIndex.value == 1
            ? FloatingActionButton(
                backgroundColor: primaryColor,
                onPressed: () => Get.to(() => const ProductFormView()),
                child: const Icon(Icons.add_rounded, color: Colors.white),
              )
            : null,
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: controller.currentIndex.value,
          onTap: controller.changePage,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: primaryColor,
          unselectedItemColor: slate400,
          backgroundColor: Colors.white,
          elevation: 12,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 11),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_rounded),
              activeIcon: Icon(Icons.dashboard_rounded),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.directions_car_rounded),
              activeIcon: Icon(Icons.directions_car_rounded),
              label: 'Product',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_rounded),
              activeIcon: Icon(Icons.receipt_long_rounded),
              label: 'Order',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.people_alt_rounded),
              activeIcon: Icon(Icons.people_alt_rounded),
              label: 'Customer',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.settings_suggest_rounded),
              activeIcon: Icon(Icons.settings_suggest_rounded),
              label: 'Setting',
            ),
          ],
        ),
      );
    });
  }

  // ==========================================
  // TAB 1: DASHBOARD (HOME)
  // ==========================================
  Widget _buildDashboardTab(BuildContext context, Color primaryColor, Color accentColor) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Welcome Card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [primaryColor, primaryColor.withRed(150)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(32),
                bottomRight: Radius.circular(32),
              ),
              boxShadow: [
                BoxShadow(
                  color: primaryColor.withOpacity(0.3),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Putri Jaya Mobil',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Sistem ERP Admin',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.notifications_active_rounded,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.admin_panel_settings_rounded,
                          color: primaryColor,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Selamat Datang Admin!',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Akses panel manajemen & database toko secara realtime.',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.87),
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      )
                    ],
                  ),
                )
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Overview Statistics Label
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Ringkasan Data',
                  style: TextStyle(
                    color: accentColor,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Text(
                  'Hari ini',
                  style: TextStyle(
                    color: slate500,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Stats Cards Grid
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: GridView.count(
              shrinkWrap: true,
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 1.4,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStatCard('Total Produk', '142 Pcs', Icons.shopping_bag_rounded, Colors.blue.shade600),
                _buildStatCard('Order Baru', '8 Transaksi', Icons.receipt_long_rounded, Colors.orange.shade700),
                _buildStatCard('Customer', '59 Orang', Icons.people_rounded, Colors.green.shade600),
                _buildStatCard('Omset Toko', 'Rp 48,9 M', Icons.monetization_on_rounded, Colors.purple.shade600),
              ],
            ),
          ),

          const SizedBox(height: 28),

          // Quick Action Section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              'Menu Cepat Sementara',
              style: TextStyle(
                color: accentColor,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Quick Menu Grid
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: GridView.count(
              shrinkWrap: true,
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 16,
              childAspectRatio: 1.0,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildQuickMenu(context, 'Tambah\nProduk', Icons.add_business_rounded, primaryColor, () => controller.changePage(1)),
                _buildQuickMenu(context, 'Kelola\nOrderan', Icons.assignment_turned_in_rounded, primaryColor, () => controller.changePage(2)),
                _buildQuickMenu(context, 'Database\nPelanggan', Icons.contact_mail_rounded, primaryColor, () => controller.changePage(3)),
                _buildQuickMenu(context, 'Mutasi\nGudang', Icons.swap_horiz_rounded, primaryColor, () {}),
                _buildQuickMenu(context, 'Grafik\nPenjualan', Icons.bar_chart_rounded, primaryColor, () {}),
                _buildQuickMenu(context, 'Pengaturan\nAplikasi', Icons.tune_rounded, primaryColor, () => controller.changePage(4)),
              ],
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: slate100),
        boxShadow: [
          BoxShadow(
            color: slate200.withOpacity(0.4),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 20,
                ),
              ),
              Icon(
                Icons.trending_up_rounded,
                color: Colors.green.shade500,
                size: 16,
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  color: Color(0xFF0F172A),
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: const TextStyle(
                  color: slate400,
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildQuickMenu(BuildContext context, String title, IconData icon, Color primaryColor, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: slate100),
          boxShadow: [
            BoxShadow(
              color: slate200.withOpacity(0.3),
              blurRadius: 8,
              offset: const Offset(0, 3),
            )
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: primaryColor.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: primaryColor,
                size: 24,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Color(0xFF334155),
                fontSize: 10,
                fontWeight: FontWeight.bold,
                height: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // TAB 2: PRODUCT PLACEHOLDER
  // ==========================================
  // ==========================================
  // TAB 2: PRODUCT MANAGEMENT LIST VIEW
  // ==========================================
  Widget _buildProductTab(BuildContext context, Color primaryColor) {
    return Column(
      children: [
        // Search & Header
        Container(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.only(
              bottomLeft: Radius.circular(20),
              bottomRight: Radius.circular(20),
            ),
            boxShadow: [
              BoxShadow(
                color: Color(0x08000000),
                blurRadius: 10,
                offset: Offset(0, 4),
              )
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Katalog Produk',
                style: TextStyle(
                  color: slate900,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                onChanged: controller.filterProducts,
                decoration: InputDecoration(
                  hintText: 'Cari nama produk...',
                  hintStyle: const TextStyle(color: slate400, fontSize: 13),
                  prefixIcon: const Icon(Icons.search_rounded, color: slate400, size: 20),
                  suffixIcon: IconButton(
                    icon: Icon(Icons.refresh_rounded, color: primaryColor, size: 20),
                    onPressed: () => controller.fetchProducts(),
                  ),
                  filled: true,
                  fillColor: slate50,
                  contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Color(0x26B91C1C), width: 1.5),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Products List / Loading / Empty State
        Expanded(
          child: Obx(() {
            if (controller.isLoadingProducts.value) {
              return Center(
                child: CircularProgressIndicator(color: primaryColor),
              );
            }

            if (controller.filteredProductsList.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: const BoxDecoration(
                        color: slate100,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.search_off_rounded,
                        color: slate400,
                        size: 48,
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Produk Tidak Ditemukan',
                      style: TextStyle(
                        color: slate900,
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Coba gunakan kata kunci pencarian yang lain.',
                      style: TextStyle(
                        color: slate400,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              itemCount: controller.filteredProductsList.length,
              physics: const BouncingScrollPhysics(),
              itemBuilder: (context, index) {
                final Product product = controller.filteredProductsList[index];
                final imgUrl = product.mainImageUrl;

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: slate100),
                    boxShadow: [
                      BoxShadow(
                        color: slate200.withOpacity(0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      )
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(18),
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: () => Get.to(() => ProductDetailView(product: product)),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Row(
                            children: [
                              // Main Image
                              Container(
                                width: 80,
                                height: 80,
                                decoration: BoxDecoration(
                                  color: slate50,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(12),
                                  child: imgUrl.isNotEmpty
                                      ? Hero(
                                          tag: 'prod-img-${product.id}',
                                          child: Image.network(
                                            imgUrl,
                                            fit: BoxFit.cover,
                                            errorBuilder: (context, error, stackTrace) => _buildListPlaceholder(),
                                          ),
                                        )
                                      : _buildListPlaceholder(),
                                ),
                              ),
                              const SizedBox(width: 16),

                              // Info Column
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Badge & Category
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            product.categoryBreadcrumbs,
                                            style: const TextStyle(
                                              color: slate400,
                                              fontSize: 9,
                                              fontWeight: FontWeight.w600,
                                            ),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),

                                    // Product Title
                                    Text(
                                      product.name,
                                      style: const TextStyle(
                                        color: slate900,
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 4),

                                    // Price Range
                                    Text(
                                      product.minPrice == product.maxPrice
                                          ? 'Rp ${product.minPrice.toStringAsFixed(0)}'
                                          : 'Rp ${product.minPrice.toStringAsFixed(0)} - Rp ${product.maxPrice.toStringAsFixed(0)}',
                                      style: TextStyle(
                                        color: primaryColor,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w900,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Right Section (Stock indicator & chevron)
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: product.totalStock > 0
                                          ? const Color(0xFFECFDF5)
                                          : const Color(0xFFFEF2F2),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      'Stok: ${product.totalStock}',
                                      style: TextStyle(
                                        color: product.totalStock > 0
                                            ? const Color(0xFF047857)
                                            : const Color(0xFFB91C1C),
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  const Icon(
                                    Icons.chevron_right_rounded,
                                    color: slate400,
                                    size: 18,
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            );
          }),
        ),
      ],
    );
  }


  Widget _buildListPlaceholder() {
    return Container(
      color: slate100,
      child: const Center(
        child: Icon(
          Icons.directions_car_filled_rounded,
          color: Color(0xFFB91C1C),
          size: 24,
        ),
      ),
    );
  }

  // ==========================================
  // TAB 3: ORDER PLACEHOLDER
  // ==========================================
  Widget _buildOrderTab(BuildContext context, Color primaryColor) {
    return _buildTabPlaceholder(
      context: context,
      title: 'Laporan Orderan',
      subtitle: 'Daftar transaksi penjualan & booking servis mobil.',
      icon: Icons.receipt_long_rounded,
      color: Colors.orange.shade700,
    );
  }

  // ==========================================
  // TAB 4: CUSTOMER PLACEHOLDER
  // ==========================================
  Widget _buildCustomerTab(BuildContext context, Color primaryColor) {
    return _buildTabPlaceholder(
      context: context,
      title: 'Database Pelanggan',
      subtitle: 'Daftar riwayat customer terdaftar dan booking list.',
      icon: Icons.people_rounded,
      color: Colors.green.shade600,
    );
  }

  // ==========================================
  // TAB 5: SETTING PLACEHOLDER
  // ==========================================
  Widget _buildSettingTab(BuildContext context, Color primaryColor) {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Pengaturan',
              style: TextStyle(
                color: Color(0xFF0F172A),
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Kelola konfigurasi aplikasi ERP PJM Anda.',
              style: TextStyle(
                color: slate400,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 24),
            _buildSettingItem(Icons.person_outline_rounded, 'Profil Saya', 'Ubah email dan detail akun', () {}),
            _buildSettingItem(Icons.lock_outline_rounded, 'Ubah Kata Sandi', 'Jaga keamanan akun Anda', () {}),
            _buildSettingItem(Icons.language_rounded, 'Pilihan Bahasa', 'Atur bahasa tampilan aplikasi', () {}),
            _buildSettingItem(Icons.notifications_none_rounded, 'Notifikasi', 'Kelola pemberitahuan masuk', () {}),
            _buildSettingItem(Icons.info_outline_rounded, 'Tentang Aplikasi', 'Versi app dan lisensi', () {}),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.logout_rounded, color: Colors.white),
                label: const Text('Keluar Akun Admin', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingItem(IconData icon, String title, String subtitle, VoidCallback onTap) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.white,
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: slate100),
        ),
        child: ListTile(
          onTap: onTap,
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: slate50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF475569), size: 20),
          ),
          title: Text(
            title,
            style: const TextStyle(
              color: Color(0xFF0F172A),
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          subtitle: Text(
            subtitle,
            style: const TextStyle(
              color: slate400,
              fontSize: 10,
            ),
          ),
          trailing: const Icon(Icons.chevron_right_rounded, color: slate400),
        ),
      ),
    );
  }

  // Placeholder builder for tabs
  Widget _buildTabPlaceholder({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: color.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: color,
                size: 64,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: const TextStyle(
                color: Color(0xFF0F172A),
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: slate400,
                fontSize: 12,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => controller.changePage(0),
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 16),
              label: const Text('Kembali ke Dashboard', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E293B),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
