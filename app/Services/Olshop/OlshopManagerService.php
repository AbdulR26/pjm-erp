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

    public function cloneProducts(string $shop, array $productIds): array
    {
        $allProducts = $this->getOlshopProducts($shop);
        $clonedCount = 0;
        $clonedList = [];

        foreach ($allProducts as $p) {
            if (!in_array($p['id'], $productIds)) {
                continue;
            }

            // Find or create default category
            $categoryName = $p['category'] ?? 'Uncategorized';
            $category = Category::firstOrCreate(
                ['name' => $categoryName],
                ['slug' => Str::slug($categoryName)]
            );

            $sku = $p['sku'] ?? ('SKU-' . strtoupper(Str::random(6)));

            // Check if product with SKU already exists in ERP
            $existingProduct = Product::where('sku', $sku)->first();

            if ($existingProduct) {
                // Update existing product stock & price from Olshop
                $existingProduct->update([
                    'price' => $p['price'],
                    'stock' => $p['stock'],
                    'weight' => $p['weight'] ?? 1000,
                    'badge' => strtoupper($shop)
                ]);
                $clonedList[] = $existingProduct->name . " (Diperbarui)";
            } else {
                // Create new ERP product from Olshop
                $newProduct = Product::create([
                    'category_id' => $category->id,
                    'name' => $p['name'],
                    'slug' => Str::slug($p['name']) . '-' . Str::random(5),
                    'sku' => $sku,
                    'price' => $p['price'],
                    'stock' => $p['stock'],
                    'weight' => $p['weight'] ?? 1000,
                    'description' => $p['description'] ?? '',
                    'badge' => strtoupper($shop),
                    'main_image' => $p['image'] ?? null,
                    'attributes' => [
                        'source_olshop' => strtolower($shop),
                        'olshop_product_id' => $p['id']
                    ]
                ]);

                // Attach category if relationship table exists
                if (method_exists($newProduct, 'categories')) {
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
                    $product = Product::where('sku', $item['sku'])->first();

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product ? $product->id : null,
                        'product_name' => $item['name'],
                        'price' => (float)$item['price'],
                        'quantity' => (int)$item['quantity'],
                        'total' => (float)$item['price'] * (int)$item['quantity']
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
