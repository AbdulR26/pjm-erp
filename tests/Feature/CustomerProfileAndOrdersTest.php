<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Shipment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerProfileAndOrdersTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_customer_can_update_profile()
    {
        $customer = Customer::create([
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
            'phone' => '081234567890',
            'address' => 'Old Address',
            'postal_code' => '11111',
            'latitude' => -6.0000,
            'longitude' => 106.0000,
        ]);

        // Put customer in session to simulate authentication
        $response = $this->withSession([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'provider' => 'email',
                'postal_code' => $customer->postal_code,
                'latitude' => $customer->latitude,
                'longitude' => $customer->longitude,
            ]
        ])->putJson('/api/auth/profile', [
            'name' => 'John New Name',
            'phone' => '089876543210',
            'address' => 'New Address Detail',
            'postal_code' => '12345',
            'latitude' => -6.1234,
            'longitude' => 106.1234,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'customer' => [
                    'id' => $customer->id,
                    'name' => 'John New Name',
                    'phone' => '089876543210',
                    'address' => 'New Address Detail',
                    'postal_code' => '12345',
                    'latitude' => -6.1234,
                    'longitude' => 106.1234,
                ]
            ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'John New Name',
            'phone' => '089876543210',
            'address' => 'New Address Detail',
            'postal_code' => '12345',
            'latitude' => -6.1234,
            'longitude' => 106.1234,
        ]);
        
        // Assert session updated
        $this->assertEquals('John New Name', session('customer.name'));
        $this->assertEquals('New Address Detail', session('customer.address'));
        $this->assertEquals('12345', session('customer.postal_code'));
        $this->assertEquals(-6.1234, session('customer.latitude'));
        $this->assertEquals(106.1234, session('customer.longitude'));
    }

    public function test_unauthenticated_customer_cannot_update_profile()
    {
        $response = $this->putJson('/api/auth/profile', [
            'name' => 'Anonymous',
            'phone' => '0000000000',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_customer_can_list_orders()
    {
        $customer = Customer::create([
            'name' => 'Customer B',
            'email' => 'customerb@example.com',
            'phone' => '0811111111',
        ]);

        $order = Order::create([
            'order_number' => 'ORD-999',
            'customer_id' => $customer->id,
            'customer_level' => 'retail',
            'subtotal' => 120000,
            'discount' => 0,
            'shipping_cost' => 15000,
            'grand_total' => 135000,
            'status' => 'pending',
        ]);

        Payment::create([
            'order_id' => $order->id,
            'payment_method' => 'Midtrans VA/QRIS',
            'status' => Payment::STATUS_WAITING,
            'amount' => 135000,
        ]);

        Shipment::create([
            'order_id' => $order->id,
            'courier_company' => 'jne',
            'courier_service' => 'reg',
            'cost' => 15000,
            'status' => Shipment::STATUS_DRAFT,
            'destination_contact_name' => 'Customer B',
            'destination_contact_phone' => '0811111111',
            'destination_address' => 'Jl. E-Commerce No. 1',
        ]);

        $response = $this->withSession([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
            ]
        ])->getJson('/api/orders');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'order_number' => 'ORD-999',
                'grand_total' => 135000,
                'status' => 'pending',
            ]);
    }

    public function test_unauthenticated_customer_cannot_list_orders()
    {
        $response = $this->getJson('/api/orders');
        $response->assertStatus(401);
    }
}
