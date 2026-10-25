<?php

namespace App\Services\Olshop;

use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Customer;
use App\Models\OrderStatus;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class OlshopManagerService
{
    protected TokopediaService $tokopedia;
    protected TikTokShopService $tiktok;
    protected ShopeeService $shopee;

    public function __construct(
        TokopediaService $tokopedia,
        TikTokShopService $tiktok,
        ShopeeService $shopee
    ) {
        $this->tokopedia = $tokopedia;
        $this->tiktok = $tiktok;
        $this->shopee = $shopee;
    }

    public function getShopService(string $shop)
    {
        return match (strtolower($shop)) {
            'tokopedia' => $this->tokopedia,
            'tiktok' => $this->tiktok,
            'shopee' => $this->shopee,
            default => throw new \InvalidArgumentException("Olshop platform [{$shop}] tidak didukung.")
        };
    }

    public function getOlshopProducts(string $shop): array
    {
        return $this->getShopService($shop)->getProducts();
    }

    public function getOlshopOrders(string $shop): array
    {
        return $this->getShopService($shop)->getOrders();
    }

    public function testShopConnection(string $shop): array
    {
        return $this->getShopService($shop)->testConnection();
    }

    public function cloneProducts(string $shop, array $productIds, ?int $categoryId = null): array
    {
        @set_time_limit(300);

        $allProducts = $this->getOlshopProducts($shop);
        $clonedCount = 0;
        $clonedList = [];

        $targetCategory = $categoryId ? Category::find($categoryId) : null;

        foreach ($allProducts as $p) {
            if (!in_array($p['id'], $productIds)) {
                continue;
            }

            // Find or use target category
            $category = $targetCategory ?: Category::firstOrCreate(['name' => $p['category'] ?? ucfirst($shop)]);

            $sku = !empty($p['sku']) ? $p['sku'] : ('SHP-' . $p['id']);

            // Check if product with SKU already exists in ERP
            $existingProduct = Product::where('sku', $sku)->first();

            if ($existingProduct) {
                // Update existing product price, stock & details
                $existingProduct->update([
                    'price' => $p['price'],
                    'stock' => $p['stock'],
                    'weight' => $p['weight'] ?? 1000,
                ]);

                if ($targetCategory && method_exists($existingProduct, 'categories')) {
                    $existingProduct->categories()->syncWithoutDetaching([$targetCategory->id]);
                }

                $clonedList[] = $existingProduct->name . " (Diperbarui)";
            } else {
                // Create new ERP Product
                $newProduct = Product::create([
                    'product_type_id' => 1,
                    'product_status_id' => 1,
                    'name' => $p['name'],
                    'slug' => Str::slug($p['name']) . '-' . uniqid(),
                    'sku' => $sku,
                    'price' => $p['price'],
                    'stock' => $p['stock'],
                    'description' => $p['description'] ?? null,
                    'weight' => $p['weight'] ?? 1000,
                ]);

                // Download and save image to Cloudflare R2
                if (!empty($p['image'])) {
                    $r2Service = app(\App\Services\CloudflareR2Service::class);
                    $r2Path = $r2Service->uploadFromUrl($p['image'], 'products');
                    $savedPath = $r2Path ?: $p['image'];

                    \App\Models\ProductImage::create([
                        'product_id' => $newProduct->id,
                        'image_path' => $savedPath
                    ]);
                }

                // Attach category if pivot exists
                if ($category && method_exists($newProduct, 'categories')) {
                    $newProduct->categories()->syncWithoutDetaching([$category->id]);
                }

                $clonedList[] = $newProduct->name . " (Baru)";
            }

            $clonedCount++;
        }

        return [
            'success' => true,
            'count' => $clonedCount,
            'items' => $clonedList,
            'message' => "Berhasil mengkloning {$clonedCount} produk dari {$shop} ke database ERP."
        ];
    }

    public function syncOrders(string $shop): array
    {
        $olshopOrders = $this->getOlshopOrders($shop);
        $importedCount = 0;

        foreach ($olshopOrders as $oData) {
            // Check if order number already exists in ERP
            $orderNumber = $oData['order_id'];
            if (Order::where('order_number', $orderNumber)->exists()) {
                continue;
            }

            // Find or create customer
            $customerName = $oData['buyer_name'] ?? ('Pembeli ' . ucfirst($shop));
            $customerPhone = $oData['buyer_phone'] ?? '081200000000';
            $customerEmail = strtolower(Str::slug($customerName)) . '@' . strtolower($shop) . '.com';

            $customer = Customer::firstOrCreate(
                ['phone' => $customerPhone],
                [
                    'name' => $customerName,
                    'email' => $customerEmail,
                    'address' => $oData['shipping_address'] ?? 'Alamat Olshop'
                ]
            );

            // Determine status
            $statusSlug = match (strtolower($oData['status'] ?? 'pending')) {
                'processing', 'paid' => Order::STATUS_PROCESSING,
                'shipping', 'shipped' => Order::STATUS_SHIPPING,
                'completed', 'delivered' => Order::STATUS_COMPLETED,
                default => Order::STATUS_PENDING
            };

            $orderStatus = OrderStatus::where('slug', $statusSlug)->first();
            $statusId = $orderStatus ? $orderStatus->id : 1;

            $totalAmount = (float)($oData['total_amount'] ?? 0);

            DB::beginTransaction();
            try {
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'source' => strtolower($shop),
                    'ecommerce_platform' => strtolower($shop),
                    'customer_id' => $customer->id,
                    'status_id' => $statusId,
                    'subtotal' => $totalAmount,
                    'discount' => 0,
                    'shipping_cost' => 0,
                    'grand_total' => $totalAmount,
                    'notes' => "Order ditarik otomatis dari marketplace " . ucfirst($shop) . " (Resi: " . ($oData['resi_number'] ?? '-') . ")"
                ]);

                // Create Order Items
                foreach ($oData['items'] as $item) {
                    $product = !empty($item['sku']) ? Product::where('sku', $item['sku'])->first() : null;
                    $productId = $product ? $product->id : null;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $productId,
                        'product_name' => $item['name'],
                        'sku' => $item['sku'] ?? '',
                        'price' => (float)$item['price'],
                        'unit_price' => (float)$item['price'],
                        'quantity' => (int)$item['quantity'],
                        'total' => (float)$item['price'] * (int)$item['quantity'],
                        'total_price' => (float)$item['price'] * (int)$item['quantity'],
                        'weight' => 1000
                    ]);
                }

                // Create Shipment record if Courier / Resi exists
                if (!empty($oData['courier']) || !empty($oData['resi_number'])) {
                    \App\Models\Shipment::create([
                        'order_id' => $order->id,
                        'courier_name' => $oData['courier'] ?? 'Kurir Olshop',
                        'service_name' => $oData['courier'] ?? 'Reguler',
                        'waybill' => $oData['resi_number'] ?? ('RESI-' . strtoupper(Str::random(10))),
                        'receiver_name' => $oData['buyer_name'] ?? 'Pembeli',
                        'receiver_phone' => $oData['buyer_phone'] ?? '081200000000',
                        'receiver_address' => $oData['shipping_address'] ?? 'Alamat Olshop',
                        'status' => $statusSlug
                    ]);
                }

                DB::commit();
                $importedCount++;
            } catch (\Exception $e) {
                DB::rollBack();
                continue;
            }
        }

        return [
            'success' => true,
            'count' => $importedCount,
            'message' => "Berhasil menarik {$importedCount} transaksi baru dari {$shop}."
        ];
    }
}
