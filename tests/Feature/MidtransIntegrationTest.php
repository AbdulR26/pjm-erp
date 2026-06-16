<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Shipment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MidtransIntegrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_generates_midtrans_snap_token()
    {
        $customer = Customer::create([
            'name' => 'Test Customer',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'address' => 'Test address',
        ]);

        $category = \App\Models\Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Product',
            'description' => 'Test Description',
            'attributes' => ['weight' => 1000]
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'name' => 'Default',
            'base_price' => 50000,
            'stock' => 10,
            'sku' => 'TEST-SKU',
        ]);

        // Mock MidtransService
        $this->mock(\App\Services\MidtransService::class, function ($mock) {
            $mock->shouldReceive('createSnapToken')
                ->once()
                ->andReturn([
                    'token' => 'mocked-snap-token-123',
                    'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mocked-snap-token-123'
                ]);
        });

        $response = $this->withSession([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
            ]
        ])->postJson('/api/orders', [
            'address' => [
                'name' => 'Recipient Name',
                'phone' => '0811111111',
                'detail' => 'Recipient address details',
                'postal_code' => '10110',
            ],
            'items' => [
                [
                    'product_id' => $product->id,
                    'variant_name' => 'Default',
                    'quantity' => 2
                ]
            ],
            'courier' => [
                'id' => 'jne',
                'name' => 'JNE Express',
                'service' => 'Reguler',
                'price' => 15000,
                'eta' => '2-3 hari'
            ],
            'notes' => 'Some note',
            'voucher_code' => null
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('order.payment.snap_token', 'mocked-snap-token-123');
        $response->assertJsonPath('order.payment.payment_url', 'https://app.sandbox.midtrans.com/snap/v2/vtweb/mocked-snap-token-123');

        $this->assertDatabaseHas('orders', [
            'customer_id' => $customer->id,
            'grand_total' => 115000, // 50000 * 2 + 15000
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('payments', [
            'amount' => 115000,
            'snap_token' => 'mocked-snap-token-123',
            'status' => 'waiting_payment',
        ]);

        $this->assertDatabaseHas('shipments', [
            'cost' => 15000,
            'destination_contact_name' => 'Recipient Name',
            'destination_contact_phone' => '0811111111',
            'destination_address' => 'Recipient address details',
        ]);
    }

    public function test_customer_can_retrieve_or_refresh_snap_token()
    {
        $customer = Customer::create([
            'name' => 'Test Customer',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'address' => 'Test address',
        ]);

        $order = Order::create([
            'order_number' => 'PJM-20260614-11111',
            'customer_id' => $customer->id,
            'customer_level' => 'retail',
            'subtotal' => 100000,
            'discount' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 115000,
            'status' => 'pending',
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'payment_method' => 'Midtrans VA/QRIS',
            'status' => 'pending',
            'amount' => 115000,
            'expired_at' => now()->addHours(24),
        ]);

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'courier_company' => 'jne',
            'courier_service' => 'reg',
            'courier_service_name' => 'JNE Reguler',
            'etd' => '2-3 hari',
            'cost' => 15000,
            'status' => 'draft',
            'destination_contact_name' => 'Recipient Name',
            'destination_contact_phone' => '0811111111',
            'destination_address' => 'Recipient Address',
        ]);

        // Mock MidtransService
        $this->mock(\App\Services\MidtransService::class, function ($mock) {
            $mock->shouldReceive('createSnapToken')
                ->once()
                ->andReturn([
                    'token' => 'refreshed-snap-token',
                    'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/refreshed-snap-token'
                ]);
        });

        $response = $this->withSession([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
            ]
        ])->postJson("/api/orders/{$order->id}/payment");

        $response->assertStatus(200);
        $response->assertJsonPath('payment.snap_token', 'refreshed-snap-token');
        $response->assertJsonPath('payment.status', 'waiting_payment');
    }
}
