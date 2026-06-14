<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Shipment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicOrderTest extends TestCase
{
    use RefreshDatabase;

    protected $customer;
    protected $product;
    protected $variant;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a customer
        $this->customer = Customer::create([
            'name' => 'Adit E-Commerce',
            'email' => 'adit@example.com',
            'phone' => '081234567890',
            'address' => 'Jalan Merdeka No. 10',
        ]);

        // Create a category
        $category = Category::create([
            'name' => 'Aksesoris',
            'slug' => 'aksesoris',
        ]);

        // Create a product
        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Filter Oli Denso',
            'slug' => 'filter-oli-denso',
            'description' => 'Filter oli original Denso berkualitas tinggi.',
            'main_image' => 'filter_oli.jpg',
            'rating' => 4.8,
            'sold_count' => 50,
        ]);

        // Create a product variant with stock
        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'name' => 'Denso Avanza',
            'base_price' => 75000,
            'stock' => 15,
            'sku' => 'FO-DENSO-AVZ',
        ]);
    }

    /**
     * Test placing a public order successfully.
     */
    public function test_can_place_order_successfully(): void
    {
        // Place an order as authenticated customer
        $response = $this->withSession(['customer' => [
            'id' => $this->customer->id,
            'name' => $this->customer->name,
            'email' => $this->customer->email,
        ]])->postJson('/api/orders', [
            'address' => [
                'name' => 'Adit E-Commerce',
                'phone' => '081234567890',
                'detail' => 'Jalan Merdeka No. 10, Jakarta Pusat',
            ],
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'variant_name' => 'Denso Avanza',
                    'quantity' => 2,
                ]
            ],
            'courier' => [
                'id' => 'jne',
                'name' => 'JNE Express',
                'service' => 'Reguler',
                'price' => 15000,
                'eta' => '2-3 hari',
            ],
            'notes' => 'Tolong bungkus bubble wrap',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'order' => [
                'id',
                'order_number',
                'customer_id',
                'subtotal',
                'shipping_cost',
                'grand_total',
                'status',
                'items',
                'payment',
                'shipment',
            ]
        ]);

        // Assert Order database record
        $this->assertDatabaseHas('orders', [
            'customer_id' => $this->customer->id,
            'subtotal' => 150000, // 75000 * 2
            'shipping_cost' => 15000,
            'grand_total' => 165000,
            'status' => 'pending',
        ]);

        // Assert stock decrement
        $this->variant->refresh();
        $this->assertEquals(13, $this->variant->stock); // 15 - 2

        // Assert payment record creation
        $orderId = $response->json('order.id');
        $this->assertDatabaseHas('payments', [
            'order_id' => $orderId,
            'status' => 'waiting_payment',
            'amount' => 165000,
        ]);

        // Assert shipment record creation
        $this->assertDatabaseHas('shipments', [
            'order_id' => $orderId,
            'courier_company' => 'jne',
            'cost' => 15000,
            'status' => 'draft',
            'destination_contact_name' => 'Adit E-Commerce',
            'destination_address' => 'Jalan Merdeka No. 10, Jakarta Pusat',
        ]);
    }

    /**
     * Test payment simulation updates order and payment status.
     */
    public function test_can_simulate_payment_successfully(): void
    {
        // 1. First place the order
        $order = Order::create([
            'order_number' => Order::generateOrderNumber(),
            'customer_id' => $this->customer->id,
            'customer_level' => 'retail',
            'subtotal' => 75000,
            'shipping_cost' => 15000,
            'grand_total' => 90000,
            'status' => 'pending',
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'payment_method' => 'Midtrans VA/QRIS',
            'status' => 'waiting_payment',
            'amount' => 90000,
        ]);

        // 2. Call the payment simulation route
        $response = $this->withSession(['customer' => [
            'id' => $this->customer->id,
            'name' => $this->customer->name,
            'email' => $this->customer->email,
        ]])->postJson("/api/orders/{$order->id}/pay-simulate", [
            'payment_method' => 'GoPay / QRIS',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Simulasi pembayaran berhasil.',
        ]);

        // 3. Assert status changes in DB
        $order->refresh();
        $payment->refresh();

        $this->assertEquals('processing', $order->status);
        $this->assertEquals('paid', $payment->status);
        $this->assertEquals('GoPay / QRIS', $payment->payment_method);
        $this->assertNotNull($payment->paid_at);
    }
}
