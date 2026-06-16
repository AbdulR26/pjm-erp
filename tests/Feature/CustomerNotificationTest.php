<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\CustomerNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerNotificationTest extends TestCase
{
    use RefreshDatabase;

    private function createAuthenticatedCustomer(): Customer
    {
        $customer = Customer::create([
            'name' => 'Test Customer',
            'email' => 'test@example.com',
            'phone' => '081234567890',
            'password' => Hash::make('password123'),
        ]);

        session(['customer' => [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
        ]]);

        return $customer;
    }

    public function test_unauthenticated_customer_cannot_get_notifications()
    {
        $response = $this->getJson('/api/notifications');
        $response->assertStatus(401);
    }

    public function test_authenticated_customer_can_list_notifications()
    {
        $customer = $this->createAuthenticatedCustomer();

        CustomerNotification::create([
            'customer_id' => $customer->id,
            'title' => 'Pesanan Dibuat',
            'message' => 'Pesanan ORD-001 berhasil dibuat.',
            'type' => 'order',
            'link' => '?page=profile&tab=orders',
        ]);

        CustomerNotification::create([
            'customer_id' => $customer->id,
            'title' => 'Pembayaran Berhasil',
            'message' => 'Pembayaran ORD-001 telah diterima.',
            'type' => 'payment',
            'link' => '?page=profile&tab=orders',
        ]);

        $response = $this->withSession(['customer' => ['id' => $customer->id, 'name' => $customer->name, 'email' => $customer->email]])
            ->getJson('/api/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_customer_can_mark_notification_as_read()
    {
        $customer = $this->createAuthenticatedCustomer();

        $notification = CustomerNotification::create([
            'customer_id' => $customer->id,
            'title' => 'Pesanan Dibuat',
            'message' => 'Pesanan ORD-001 berhasil dibuat.',
            'type' => 'order',
        ]);

        $this->assertFalse($notification->fresh()->is_read);

        $response = $this->withSession(['customer' => ['id' => $customer->id, 'name' => $customer->name, 'email' => $customer->email]])
            ->postJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertTrue($notification->fresh()->is_read);
    }

    public function test_customer_can_mark_all_notifications_as_read()
    {
        $customer = $this->createAuthenticatedCustomer();

        CustomerNotification::create([
            'customer_id' => $customer->id,
            'title' => 'Notif 1',
            'message' => 'Pesan 1',
            'type' => 'order',
        ]);

        CustomerNotification::create([
            'customer_id' => $customer->id,
            'title' => 'Notif 2',
            'message' => 'Pesan 2',
            'type' => 'payment',
        ]);

        $response = $this->withSession(['customer' => ['id' => $customer->id, 'name' => $customer->name, 'email' => $customer->email]])
            ->postJson('/api/notifications/read-all');

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertEquals(0, CustomerNotification::where('customer_id', $customer->id)->where('is_read', false)->count());
    }

    public function test_customer_can_delete_notification()
    {
        $customer = $this->createAuthenticatedCustomer();

        $notification = CustomerNotification::create([
            'customer_id' => $customer->id,
            'title' => 'Pesanan Dibuat',
            'message' => 'Pesanan ORD-001 berhasil dibuat.',
            'type' => 'order',
        ]);

        $response = $this->withSession(['customer' => ['id' => $customer->id, 'name' => $customer->name, 'email' => $customer->email]])
            ->deleteJson("/api/notifications/{$notification->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('customer_notifications', ['id' => $notification->id]);
    }

    public function test_notification_cannot_be_accessed_by_other_customer()
    {
        $customer1 = Customer::create([
            'name' => 'Customer 1',
            'email' => 'c1@example.com',
            'phone' => '081111111111',
            'password' => Hash::make('password'),
        ]);

        $customer2 = Customer::create([
            'name' => 'Customer 2',
            'email' => 'c2@example.com',
            'phone' => '082222222222',
            'password' => Hash::make('password'),
        ]);

        $notification = CustomerNotification::create([
            'customer_id' => $customer1->id,
            'title' => 'Private Notif',
            'message' => 'Only for customer 1.',
            'type' => 'order',
        ]);

        // Customer 2 tries to mark customer 1's notification as read
        $response = $this->withSession(['customer' => ['id' => $customer2->id, 'name' => $customer2->name, 'email' => $customer2->email]])
            ->postJson("/api/notifications/{$notification->id}/read");

        $response->assertStatus(404);
    }
}
