<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@pjm.com',
            'password' => bcrypt('password'),
            'roles' => ['admin'],
        ]);
    }

    public function test_dashboard_stats_endpoint_returns_real_counts_and_activities()
    {
        // Create customer
        Customer::create([
            'name' => 'Customer A',
            'email' => 'custA@example.com',
            'phone' => '081234567890',
        ]);

        // Create orders & payments
        $order = Order::create([
            'order_number' => 'PJM-20260616-XXXXX',
            'customer_id' => 1,
            'customer_level' => 'retail',
            'subtotal' => 100000,
            'grand_total' => 100000,
            'status' => 'pending',
        ]);

        Payment::create([
            'order_id' => $order->id,
            'payment_method' => 'bank_transfer',
            'status' => 'paid',
            'amount' => 100000,
        ]);

        // Create supplier
        Supplier::create([
            'name' => 'Supplier Test',
            'code' => 'SPL-TEST',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/adminv1/api/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'customer_count',
                'staff_count',
                'order_count',
                'pending_order_count',
                'product_count',
                'total_sales',
                'po_count',
                'activities'
            ])
            ->assertJsonFragment([
                'customer_count' => 1,
                'staff_count' => 1,
                'order_count' => 1,
                'total_sales' => 100000,
            ]);

        // Check if activities are returned
        $activities = $response->json('activities');
        $this->assertNotEmpty($activities);
    }
}
