<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Customer;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Shipment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdminShipmentTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $customer;
    protected $product;
    protected $variant;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@pjm.com',
            'password' => bcrypt('password'),
        ]);

        // Create customer
        $this->customer = Customer::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '081234567890',
            'address' => 'Jalan Kenanga No. 5',
        ]);

        // Create product category
        $category = Category::create([
            'name' => 'Oli',
            'slug' => 'oli',
        ]);

        // Create product
        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Oli Shell Helix',
            'slug' => 'oli-shell-helix',
            'description' => 'Oli Shell Helix berkualitas tinggi',
            'main_image' => 'shell.jpg',
            'rating' => 4.5,
            'sold_count' => 10,
        ]);

        // Create product variant
        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'name' => '1 Liter',
            'base_price' => 120000,
            'stock' => 10,
            'sku' => 'OLI-SHELL-1L',
        ]);
    }

    /**
     * Test admin can create a new shipment when no shipment exists.
     */
    public function test_admin_can_create_new_shipment(): void
    {
        // 1. Create order and paid payment
        $order = Order::create([
            'order_number' => Order::generateOrderNumber(),
            'customer_id' => $this->customer->id,
            'customer_level' => 'retail',
            'subtotal' => 120000,
            'shipping_cost' => 0,
            'grand_total' => 120000,
            'status' => Order::STATUS_PROCESSING,
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'payment_method' => 'Midtrans VA/QRIS',
            'status' => Payment::STATUS_PAID,
            'amount' => 120000,
            'paid_at' => now(),
        ]);

        // Create order item
        $order->items()->create([
            'product_variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'variant_name' => $this->variant->name,
            'sku' => $this->variant->sku,
            'unit_price' => 120000,
            'quantity' => 1,
            'weight' => 1000,
            'total_price' => 120000,
        ]);

        // Fake Biteship Order Booking API
        Http::fake([
            'api.biteship.com/v1/orders' => Http::response([
                'success' => true,
                'id' => 'bit_mockorder123',
                'status' => 'pickup_requested',
                'courier' => [
                    'waybill_id' => 'WAYBILL-MOCK-789',
                ]
            ], 200)
        ]);

        // 2. Call admin API to create/book shipment
        $response = $this->actingAs($this->admin)->postJson("/adminv1/api/orders/{$order->id}/shipment", [
            'courier_company' => 'jne',
            'courier_service' => 'reg',
            'courier_service_name' => 'JNE Reguler',
            'etd' => '1-2',
            'cost' => 15000,
            'destination_contact_name' => 'John Doe Recipient',
            'destination_contact_phone' => '081299998888',
            'destination_address' => 'Jalan Pahlawan No. 20',
            'destination_postal_code' => '12345',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'message',
            'shipment' => [
                'id',
                'order_id',
                'courier_company',
                'courier_service',
                'status',
                'biteship_order_id',
                'waybill_id',
            ]
        ]);

        // 3. Assert DB updates
        $this->assertDatabaseHas('shipments', [
            'order_id' => $order->id,
            'courier_company' => 'jne',
            'courier_service' => 'reg',
            'status' => 'pickup_requested',
            'biteship_order_id' => 'bit_mockorder123',
            'waybill_id' => 'WAYBILL-MOCK-789',
        ]);

        $order->refresh();
        $this->assertEquals(Order::STATUS_SHIPPING, $order->status);
    }

    /**
     * Test admin can book a shipment when order already has a draft shipment from checkout.
     */
    public function test_admin_can_book_shipment_replaces_draft(): void
    {
        // 1. Create order and paid payment
        $order = Order::create([
            'order_number' => Order::generateOrderNumber(),
            'customer_id' => $this->customer->id,
            'customer_level' => 'retail',
            'subtotal' => 120000,
            'shipping_cost' => 15000,
            'grand_total' => 135000,
            'status' => Order::STATUS_PROCESSING,
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'payment_method' => 'Midtrans VA/QRIS',
            'status' => Payment::STATUS_PAID,
            'amount' => 135000,
            'paid_at' => now(),
        ]);

        // Create order item
        $order->items()->create([
            'product_variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'variant_name' => $this->variant->name,
            'sku' => $this->variant->sku,
            'unit_price' => 120000,
            'quantity' => 1,
            'weight' => 1000,
            'total_price' => 120000,
        ]);

        // 2. Create existing draft shipment (simulating customer checkout)
        $oldDraftShipment = Shipment::create([
            'order_id' => $order->id,
            'courier_company' => 'jne',
            'courier_service' => 'reg',
            'courier_service_name' => 'JNE Reguler',
            'cost' => 15000,
            'status' => Shipment::STATUS_DRAFT,
            'destination_contact_name' => 'John Doe Checkout',
            'destination_contact_phone' => '081200001111',
            'destination_address' => 'Jalan Checkout No 1',
            'destination_postal_code' => '54321',
        ]);

        // Fake Biteship Order Booking API
        Http::fake([
            'api.biteship.com/v1/orders' => Http::response([
                'success' => true,
                'id' => 'bit_neworder456',
                'status' => 'pickup_requested',
                'courier' => [
                    'waybill_id' => 'WAYBILL-MOCK-000',
                ]
            ], 200)
        ]);

        // 3. Admin calls API to book/create shipment (using the new endpoint logic that allows draft)
        $response = $this->actingAs($this->admin)->postJson("/adminv1/api/orders/{$order->id}/shipment", [
            'courier_company' => 'jne',
            'courier_service' => 'reg',
            'courier_service_name' => 'JNE Reguler',
            'etd' => '1-2',
            'cost' => 15000,
            'destination_contact_name' => 'John Doe Checkout',
            'destination_contact_phone' => '081200001111',
            'destination_address' => 'Jalan Checkout No 1',
            'destination_postal_code' => '54321',
        ]);

        $response->assertStatus(201);

        // 4. Assert old draft shipment has been deleted, and new one created
        $this->assertDatabaseMissing('shipments', [
            'id' => $oldDraftShipment->id,
        ]);

        $this->assertDatabaseHas('shipments', [
            'order_id' => $order->id,
            'courier_company' => 'jne',
            'courier_service' => 'reg',
            'status' => 'pickup_requested',
            'biteship_order_id' => 'bit_neworder456',
            'waybill_id' => 'WAYBILL-MOCK-000',
        ]);

        $order->refresh();
        $this->assertEquals(Order::STATUS_SHIPPING, $order->status);
    }

    /**
     * Test admin can bulk generate resi.
     */
    public function test_admin_can_bulk_generate_resi(): void
    {
        // 1. Create order 1 and paid payment
        $order1 = Order::create([
            'order_number' => Order::generateOrderNumber(),
            'customer_id' => $this->customer->id,
            'customer_level' => 'retail',
            'subtotal' => 120000,
            'shipping_cost' => 15000,
            'grand_total' => 135000,
            'status' => Order::STATUS_PROCESSING,
        ]);

        Payment::create([
            'order_id' => $order1->id,
            'payment_method' => 'Midtrans VA/QRIS',
            'status' => Payment::STATUS_PAID,
            'amount' => 135000,
            'paid_at' => now(),
        ]);

        $order1->items()->create([
            'product_variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'variant_name' => $this->variant->name,
            'sku' => $this->variant->sku,
            'unit_price' => 120000,
            'quantity' => 1,
            'weight' => 1000,
            'total_price' => 120000,
        ]);

        $shipment1 = Shipment::create([
            'order_id' => $order1->id,
            'courier_company' => 'jne',
            'courier_service' => 'reg',
            'courier_service_name' => 'JNE Reguler',
            'cost' => 15000,
            'status' => Shipment::STATUS_DRAFT,
            'destination_contact_name' => 'John Doe Recipient',
            'destination_contact_phone' => '081299998888',
            'destination_address' => 'Jalan Pahlawan No. 20',
            'destination_postal_code' => '12345',
        ]);

        // 2. Create order 2 and paid payment
        $order2 = Order::create([
            'order_number' => Order::generateOrderNumber(),
            'customer_id' => $this->customer->id,
            'customer_level' => 'retail',
            'subtotal' => 120000,
            'shipping_cost' => 15000,
            'grand_total' => 135000,
            'status' => Order::STATUS_PROCESSING,
        ]);

        Payment::create([
            'order_id' => $order2->id,
            'payment_method' => 'Midtrans VA/QRIS',
            'status' => Payment::STATUS_PAID,
            'amount' => 135000,
            'paid_at' => now(),
        ]);

        $order2->items()->create([
            'product_variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'variant_name' => $this->variant->name,
            'sku' => $this->variant->sku,
            'unit_price' => 120000,
            'quantity' => 1,
            'weight' => 1000,
            'total_price' => 120000,
        ]);

        $shipment2 = Shipment::create([
            'order_id' => $order2->id,
            'courier_company' => 'jnt',
            'courier_service' => 'reg',
            'courier_service_name' => 'J&T Express',
            'cost' => 15000,
            'status' => Shipment::STATUS_DRAFT,
            'destination_contact_name' => 'John Doe Recipient',
            'destination_contact_phone' => '081299998888',
            'destination_address' => 'Jalan Pahlawan No. 20',
            'destination_postal_code' => '12345',
        ]);

        // Fake Biteship Order Booking API
        Http::fake([
            'api.biteship.com/v1/orders' => Http::sequence()
                ->push([
                    'success' => true,
                    'id' => 'bit_bulkorder1',
                    'status' => 'pickup_requested',
                    'courier' => [
                        'waybill_id' => 'WAYBILL-BULK-1',
                    ]
                ], 200)
                ->push([
                    'success' => true,
                    'id' => 'bit_bulkorder2',
                    'status' => 'pickup_requested',
                    'courier' => [
                        'waybill_id' => 'WAYBILL-BULK-2',
                    ]
                ], 200)
        ]);

        // 3. Admin calls API to bulk book
        $response = $this->actingAs($this->admin)->postJson("/adminv1/api/shipments/bulk-store", [
            'order_ids' => [$order1->id, $order2->id]
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['success' => true, 'order_id' => $order1->id, 'waybill_id' => 'WAYBILL-BULK-1']);
        $response->assertJsonFragment(['success' => true, 'order_id' => $order2->id, 'waybill_id' => 'WAYBILL-BULK-2']);

        // Assert DB updates
        $this->assertDatabaseHas('shipments', [
            'order_id' => $order1->id,
            'waybill_id' => 'WAYBILL-BULK-1',
            'status' => 'pickup_requested',
        ]);
        $this->assertDatabaseHas('shipments', [
            'order_id' => $order2->id,
            'waybill_id' => 'WAYBILL-BULK-2',
            'status' => 'pickup_requested',
        ]);
    }
}

