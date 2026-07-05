class Product {
  final int id;
  final int? parentId;
  final int productTypeId;
  final int productStatusId;
  final String name;
  final String slug;
  final String? sku;
  final double price;
  final int stock;
  final String? description;
  final String type;
  final String status;
  final List<ProductCategory> categories;
  final List<ProductImage> images;
  final List<Product> variants;
  final List<StockMutation> stockMutations;

  Product({
    required this.id,
    this.parentId,
    required this.productTypeId,
    required this.productStatusId,
    required this.name,
    required this.slug,
    this.sku,
    required this.price,
    required this.stock,
    this.description,
    required this.type,
    required this.status,
    required this.categories,
    required this.images,
    required this.variants,
    required this.stockMutations,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? 0,
      parentId: json['parent_id'],
      productTypeId: json['product_type_id'] ?? 0,
      productStatusId: json['product_status_id'] ?? 0,
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      sku: json['sku'],
      price: double.tryParse(json['price']?.toString() ?? '0') ?? 0.0,
      stock: json['stock'] ?? 0,
      description: json['description'],
      type: json['type'] ?? 'simple',
      status: json['status'] ?? 'active',
      categories: (json['categories'] as List?)
              ?.map((c) => ProductCategory.fromJson(c))
              .toList() ??
          [],
      images: (json['images'] as List?)
              ?.map((i) => ProductImage.fromJson(i))
              .toList() ??
          [],
      variants: (json['variants'] as List?)
              ?.map((v) => Product.fromJson(v))
              .toList() ??
          [],
      stockMutations: (json['stock_mutations'] as List?)
              ?.map((m) => StockMutation.fromJson(m))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'parent_id': parentId,
      'product_type_id': productTypeId,
      'product_status_id': productStatusId,
      'name': name,
      'slug': slug,
      'sku': sku,
      'price': price,
      'stock': stock,
      'description': description,
      'type': type,
      'status': status,
    };
  }

  // Getters for display
  String get mainImageUrl {
    if (images.isEmpty) return '';
    final primary = images.firstWhere((i) => i.isPrimary, orElse: () => images.first);
    return primary.url;
  }

  int get totalStock {
    if (variants.isEmpty) return stock;
    return variants.fold(stock, (sum, v) => sum + v.stock);
  }

  double get minPrice {
    if (variants.isEmpty) return price;
    final prices = variants.map((v) => v.price).toList()..add(price);
    return prices.reduce((a, b) => a < b ? a : b);
  }

  double get maxPrice {
    if (variants.isEmpty) return price;
    final prices = variants.map((v) => v.price).toList()..add(price);
    return prices.reduce((a, b) => a > b ? a : b);
  }

  String get categoryBreadcrumbs {
    if (categories.isEmpty) return 'Katalog';
    return categories.map((c) => c.name).join(' > ');
  }
}

class ProductCategory {
  final int id;
  final String name;
  final String slug;

  ProductCategory({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory ProductCategory.fromJson(Map<String, dynamic> json) {
    return ProductCategory(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
    );
  }
}

class ProductImage {
  final int id;
  final String imagePath;
  final String url;
  final bool isPrimary;
  final int order;

  ProductImage({
    required this.id,
    required this.imagePath,
    required this.url,
    required this.isPrimary,
    required this.order,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      id: json['id'] ?? 0,
      imagePath: json['image_path'] ?? '',
      url: json['url'] ?? '',
      isPrimary: json['is_primary'] ?? false,
      order: json['order'] ?? 0,
    );
  }
}

class StockMutation {
  final int id;
  final int productId;
  final String type;
  final int quantity;
  final String source;
  final String? notes;
  final String user;
  final String createdAt;

  StockMutation({
    required this.id,
    required this.productId,
    required this.type,
    required this.quantity,
    required this.source,
    this.notes,
    required this.user,
    required this.createdAt,
  });

  factory StockMutation.fromJson(Map<String, dynamic> json) {
    return StockMutation(
      id: json['id'] ?? 0,
      productId: json['product_id'] ?? 0,
      type: json['type'] ?? '',
      quantity: json['quantity'] ?? 0,
      source: json['source'] ?? '',
      notes: json['notes'],
      user: json['user'] ?? 'System',
      createdAt: json['created_at'] ?? '',
    );
  }
}

class CategoryTree {
  final int id;
  final String name;
  final bool isParent;
  final List<CategoryTree> children;

  CategoryTree({
    required this.id,
    required this.name,
    required this.isParent,
    required this.children,
  });

  factory CategoryTree.fromJson(Map<String, dynamic> json) {
    return CategoryTree(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      isParent: json['isParent'] ?? false,
      children: (json['children'] as List?)
              ?.map((c) => CategoryTree.fromJson(c))
              .toList() ??
          [],
    );
  }
}
