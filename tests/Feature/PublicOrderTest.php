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
                'postal_code' => '10110',
                'latitude' => -6.1751,
                'longitude' => 106.8272,
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
            'destination_postal_code' => '10110',
            'destination_latitude' => -6.1751,
            'destination_longitude' => 106.8272,
        ]);
    }

    /**
     * Test getting shipping rates successfully.
     */
    public function test_can_get_shipping_rates_successfully(): void
    {
        \Illuminate\Support\Facades\Http::fake([
            'api.biteship.com/v1/rates/couriers' => \Illuminate\Support\Facades\Http::response([
                'pricing' => [
                    [
                        'courier_code' => 'jne',
                        'courier_name' => 'JNE',
                        'courier_service_code' => 'reg',
                        'courier_service_name' => 'Reguler',
                        'duration' => '1-2',
                        'price' => 15000,
                    ],
                    [
                        'courier_code' => 'jnt',
                        'courier_name' => 'J&T',
                        'courier_service_code' => 'ez',
                        'courier_service_name' => 'EZ',
                        'duration' => '2-3',
                        'price' => 12000,
                    ]
                ]
            ], 200)
        ]);

        $response = $this->withSession(['customer' => [
            'id' => $this->customer->id,
            'name' => $this->customer->name,
            'email' => $this->customer->email,
        ]])->postJson('/api/shipment/rates', [
            'postal_code' => '10110',
            'latitude' => -6.1751,
            'longitude' => 106.8272,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'variant_name' => 'Denso Avanza',
                    'quantity' => 2,
                ]
            ]
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'rates' => [
                '*' => [
                    'courier_code',
                    'courier_name',
                    'courier_service_code',
                    'courier_service_name',
                    'duration',
                    'price',
                ]
            ]
        ]);
        
        $this->assertCount(2, $response->json('rates'));
    }
}
