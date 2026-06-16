<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderPrintTest extends TestCase
{
    use RefreshDatabase;

    public function test_print_invoice_requires_auth()
    {
        $customer = Customer::create([
            'name' => 'John Client',
            'email' => 'client@example.com',
            'phone' => '0812345678',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-12345',
            'customer_id' => $customer->id,
            'customer_level' => 'silver',
            'subtotal' => 100000,
            'discount' => 0,
            'shipping_cost' => 0,
            'grand_total' => 100000,
            'status' => 'pending',
        ]);

        $response = $this->get("/adminv1/api/orders/{$order->id}/print-invoice");
        $response->assertRedirect('/adminv1/login');
    }

    public function test_print_invoice_success()
    {
        $user = User::factory()->create();
        $customer = Customer::create([
            'name' => 'John Client',
            'email' => 'client@example.com',
            'phone' => '0812345678',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-123456',
            'customer_id' => $customer->id,
            'customer_level' => 'silver',
            'subtotal' => 500000,
            'discount' => 50000,
            'shipping_cost' => 15000,
            'grand_total' => 465000,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)
            ->get("/adminv1/api/orders/{$order->id}/print-invoice");

        $response->assertStatus(200);
        $response->assertSee('ORD-123456');
        $response->assertSee('John Client');
        $response->assertSee('Rp 500.000');
        $response->assertSee('window.print()');
    }

    public function test_print_resi_fails_if_no_shipment()
    {
        $user = User::factory()->create();
        $customer = Customer::create([
            'name' => 'John Client',
            'email' => 'client@example.com',
            'phone' => '0812345678',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-123456',
            'customer_id' => $customer->id,
            'customer_level' => 'silver',
            'subtotal' => 500000,
            'discount' => 50000,
            'shipping_cost' => 15000,
            'grand_total' => 465000,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)
            ->get("/adminv1/api/orders/{$order->id}/print-resi");

        $response->assertStatus(404);
        $response->assertSee('Pengiriman Belum Di-booking');
    }

    public function test_print_resi_success_with_shipment()
    {
        $user = User::factory()->create();
        $customer = Customer::create([
            'name' => 'John Client',
            'email' => 'client@example.com',
            'phone' => '0812345678',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-123456',
            'customer_id' => $customer->id,
            'customer_level' => 'silver',
            'subtotal' => 500000,
            'discount' => 50000,
            'shipping_cost' => 15000,
            'grand_total' => 465000,
            'status' => 'pending',
        ]);

        $shipment = Shipment::create([
            'order_id' => $order->id,
            'courier_company' => 'jne',
            'courier_service' => 'reg',
            'courier_service_name' => 'JNE Reguler',
            'cost' => 15000,
            'status' => 'pickup_requested',
            'waybill_id' => 'JNE9988776655',
            'destination_contact_name' => 'John Client',
            'destination_contact_phone' => '0812345678',
            'destination_address' => 'Jl. Penerima No. 123',
            'destination_postal_code' => '17111',
            'origin_contact_name' => 'Store Sender',
            'origin_contact_phone' => '0899887766',
            'origin_address' => 'Jl. Pengirim No. 1',
            'origin_postal_code' => '17112',
        ]);

        $response = $this->actingAs($user)
            ->get("/adminv1/api/orders/{$order->id}/print-resi");

        $response->assertStatus(200);
        $response->assertSee('JNE9988776655');
        $response->assertSee('JNE REGULER');
        $response->assertSee('John Client');
        $response->assertSee('window.print()');
    }

    public function test_print_invoices_success()
    {
        $user = User::factory()->create();
        $customer = Customer::create([
            'name' => 'John Client',
            'email' => 'client@example.com',
            'phone' => '0812345678',
        ]);

        $order1 = Order::create([
            'order_number' => 'ORD-111111',
            'customer_id' => $customer->id,
            'customer_level' => 'silver',
            'subtotal' => 500000,
            'discount' => 0,
            'shipping_cost' => 0,
            'grand_total' => 500000,
            'status' => 'pending',
        ]);

        $order2 = Order::create([
            'order_number' => 'ORD-222222',
            'customer_id' => $customer->id,
            'customer_level' => 'silver',
            'subtotal' => 300000,
            'discount' => 0,
            'shipping_cost' => 0,
            'grand_total' => 300000,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)
            ->get("/adminv1/api/orders/print-invoices?order_ids={$order1->id},{$order2->id}");

        $response->assertStatus(200);
        $response->assertSee('ORD-111111');
        $response->assertSee('ORD-222222');
        $response->assertSee('John Client');
        $response->assertSee('window.print()');
    }

    public function test_print_resis_success()
    {
        $user = User::factory()->create();
        $customer = Customer::create([
            'name' => 'John Client',
            'email' => 'client@example.com',
            'phone' => '0812345678',
        ]);

        $order1 = Order::create([
            'order_number' => 'ORD-111111',
            'customer_id' => $customer->id,
            'customer_level' => 'silver',
            'subtotal' => 500000,
            'discount' => 0,
            'shipping_cost' => 0,
            'grand_total' => 500000,
            'status' => 'pending',
        ]);

        $order2 = Order::create([
            'order_number' => 'ORD-222222',
            'customer_id' => $customer->id,
            'customer_level' => 'silver',
            'subtotal' => 300000,
            'discount' => 0,
            'shipping_cost' => 0,
            'grand_total' => 300000,
            'status' => 'pending',
        ]);

        Shipment::create([
            'order_id' => $order1->id,
            'courier_company' => 'jne',
            'courier_service' => 'reg',
            'courier_service_name' => 'JNE Reguler',
            'cost' => 15000,
            'status' => 'pickup_requested',
            'waybill_id' => 'JNE111111111',
            'destination_contact_name' => 'John Client',
            'destination_contact_phone' => '0812345678',
            'destination_address' => 'Jl. Penerima No. 1',
        ]);

        Shipment::create([
            'order_id' => $order2->id,
            'courier_company' => 'jnt',
            'courier_service' => 'reg',
            'courier_service_name' => 'J&T Express',
            'cost' => 15000,
            'status' => 'pickup_requested',
            'waybill_id' => 'JNT222222222',
            'destination_contact_name' => 'John Client',
            'destination_contact_phone' => '0812345678',
            'destination_address' => 'Jl. Penerima No. 2',
        ]);

        $response = $this->actingAs($user)
            ->get("/adminv1/api/orders/print-resis?order_ids={$order1->id},{$order2->id}");

        $response->assertStatus(200);
        $response->assertSee('JNE111111111');
        $response->assertSee('JNT222222222');
        $response->assertSee('John Client');
        $response->assertSee('window.print()');
    }
}

