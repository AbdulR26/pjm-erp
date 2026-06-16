<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Voucher;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Shipment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicVoucherTest extends TestCase
{
    use RefreshDatabase;

    protected $customer;
    protected $product;
    protected $variant;
    protected $percentVoucher;
    protected $fixedVoucher;

    protected function setUp(): void
    {
        parent::setUp();

        // Create customer
        $this->customer = Customer::create([
            'name' => 'Fuji E-Commerce',
            'email' => 'fuji@example.com',
            'phone' => '081234567899',
            'address' => 'Jalan Kebagusan No. 5',
        ]);

        // Create category
        $category = Category::create([
            'name' => 'Oli',
            'slug' => 'oli',
        ]);

        // Create product
        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Shell Helix',
            'slug' => 'shell-helix',
            'description' => 'Oli mesin performa tinggi.',
            'main_image' => 'shell.jpg',
            'rating' => 4.9,
            'sold_count' => 100,
        ]);

        // Create product variant with stock
        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'name' => '4 Liter',
            'base_price' => 500000,
            'stock' => 10,
            'sku' => 'OLI-SHELL-4L',
        ]);

        // Create percent voucher (10%, min spend 200k, max discount 30k)
        $this->percentVoucher = Voucher::create([
            'code' => 'TEST10',
            'type' => 'percent',
            'value' => 10,
            'min_spend' => 200000,
            'max_discount' => 30000,
            'quota' => 5,
            'used' => 0,
            'is_active' => true,
        ]);

        // Create fixed voucher (50k off, min spend 100k)
        $this->fixedVoucher = Voucher::create([
            'code' => 'TEST50K',
            'type' => 'fixed',
            'value' => 50000,
            'min_spend' => 100000,
            'max_discount' => null,
            'quota' => 10,
            'used' => 0,
            'is_active' => true,
        ]);
    }

    /**
     * Test voucher list retrieval.
     */
    public function test_can_retrieve_vouchers_list(): void
    {
        $response = $this->getJson('/api/vouchers');

        $response->assertStatus(200);
        $response->assertJsonCount(2);
        $response->assertJsonFragment(['code' => 'TEST10']);
        $response->assertJsonFragment(['code' => 'TEST50K']);
    }

    /**
     * Test voucher validation rules.
     */
    public function test_apply_voucher_validations(): void
    {
        // 1. Invalid code
        $response = $this->postJson('/api/vouchers/apply', [
            'code' => 'NOTFOUND',
            'subtotal' => 250000,
        ]);
        $response->assertStatus(404);

        // 2. Minimum spend not met
        $response = $this->postJson('/api/vouchers/apply', [
            'code' => 'TEST10',
            'subtotal' => 150000, // min spend is 200k
        ]);
        $response->assertStatus(422);
        $response->assertJsonFragment(['valid' => false]);

        // 3. Valid percent voucher
        $response = $this->postJson('/api/vouchers/apply', [
            'code' => 'TEST10',
            'subtotal' => 250000,
        ]);
        $response->assertStatus(200);
        $response->assertJson([
            'valid' => true,
            'discount' => 25000, // 10% of 250k
        ]);

        // 4. Valid percent voucher capping
        $response = $this->postJson('/api/vouchers/apply', [
            'code' => 'TEST10',
            'subtotal' => 500000,
        ]);
        $response->assertStatus(200);
        $response->assertJson([
            'valid' => true,
            'discount' => 30000, // capped at max_discount 30k (10% of 500k is 50k)
        ]);

        // 5. Valid fixed voucher
        $response = $this->postJson('/api/vouchers/apply', [
            'code' => 'TEST50K',
            'subtotal' => 150000,
        ]);
        $response->assertStatus(200);
        $response->assertJson([
            'valid' => true,
            'discount' => 50000,
        ]);
    }

    /**
     * Test creating an order applying a voucher.
     */
    public function test_place_order_with_voucher(): void
    {
        // Place order with TEST10
        $response = $this->withSession(['customer' => [
            'id' => $this->customer->id,
            'name' => $this->customer->name,
            'email' => $this->customer->email,
        ]])->postJson('/api/orders', [
            'address' => [
                'name' => 'Fuji E-Commerce',
                'phone' => '081234567899',
                'detail' => 'Jalan Kebagusan No. 5, Jakarta Selatan',
                'postal_code' => '10110',
            ],
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'variant_name' => '4 Liter',
                    'quantity' => 1, // 500000
                ]
            ],
            'courier' => [
                'id' => 'jne',
                'name' => 'JNE Express',
                'service' => 'Reguler',
                'price' => 15000,
                'eta' => '2-3 hari',
            ],
            'voucher_code' => 'TEST10',
        ]);

        $response->assertStatus(201);
        $orderId = $response->json('order.id');

        // Check order details: subtotal=500k, discount=30k (capped), courier=15k, grand_total=485k
        $this->assertDatabaseHas('orders', [
            'id' => $orderId,
            'voucher_id' => $this->percentVoucher->id,
            'voucher_code' => 'TEST10',
            'subtotal' => 500000,
            'discount' => 30000,
            'shipping_cost' => 15000,
            'grand_total' => 485000,
        ]);

        // Check quota decrement
        $this->percentVoucher->refresh();
        $this->assertEquals(1, $this->percentVoucher->used);

        // Check payment amount
        $this->assertDatabaseHas('payments', [
            'order_id' => $orderId,
            'amount' => 485000,
        ]);
    }
}
