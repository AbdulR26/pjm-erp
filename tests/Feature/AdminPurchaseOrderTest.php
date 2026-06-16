<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\StockMutation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminPurchaseOrderTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $supplier;
    protected $variant;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@pjm.com',
            'password' => bcrypt('password'),
            'roles' => ['admin'],
        ]);

        $this->supplier = Supplier::create([
            'name' => 'Main Supplier',
            'code' => 'SPL-MAIN',
        ]);

        $category = Category::create(['name' => 'Oli', 'slug' => 'oli']);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Oli Fastron',
            'slug' => 'oli-fastron',
        ]);
        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'name' => '10W-40',
            'sku' => 'FAS-10W40',
            'base_price' => 85000,
            'stock' => 5,
        ]);
    }

    public function test_admin_can_create_purchase_order()
    {
        $payload = [
            'supplier_id' => $this->supplier->id,
            'order_date' => now()->format('Y-m-d'),
            'expected_delivery_date' => now()->addDays(5)->format('Y-m-d'),
            'notes' => 'Urgent stock update',
            'tax' => 15000,
            'shipping_cost' => 25000,
            'items' => [
                [
                    'product_variant_id' => $this->variant->id,
                    'quantity' => 10,
                    'unit_cost' => 70000,
                ]
            ]
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/adminv1/api/purchase-orders', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'status' => 'success',
                'po_number' => 'PO-' . date('Ymd') . '-0001', // boot generator test
            ]);

        $this->assertDatabaseHas('purchase_orders', [
            'supplier_id' => $this->supplier->id,
            'tax' => 15000,
            'shipping_cost' => 25000,
            'subtotal' => 700000,
            'grand_total' => 740000,
            'status' => 'draft',
        ]);

        $this->assertDatabaseHas('purchase_order_items', [
            'product_variant_id' => $this->variant->id,
            'quantity' => 10,
            'unit_cost' => 70000,
            'total_cost' => 700000,
        ]);
    }

    public function test_admin_can_receive_purchase_order_items_fully()
    {
        $po = PurchaseOrder::create([
            'supplier_id' => $this->supplier->id,
            'order_date' => now(),
            'status' => 'ordered',
            'created_by' => $this->admin->id,
        ]);

        $poItem = $po->items()->create([
            'product_variant_id' => $this->variant->id,
            'quantity' => 10,
            'quantity_received' => 0,
            'unit_cost' => 70000,
            'total_cost' => 700000,
        ]);

        $payload = [
            'items' => [
                [
                    'product_variant_id' => $this->variant->id,
                    'quantity_received' => 10,
                ]
            ]
        ];

        $response = $this->actingAs($this->admin)
            ->postJson("/adminv1/api/purchase-orders/{$po->id}/receive", $payload);

        $response->assertStatus(200);

        // Variant stock should increase by 10 (from 5 to 15)
        $this->assertEquals(15, $this->variant->fresh()->stock);

        // Status should transition to received
        $this->assertEquals('received', $po->fresh()->status);
        $this->assertNotNull($po->fresh()->received_date);

        // Verify stock mutation logged
        $this->assertDatabaseHas('stock_mutations', [
            'product_variant_id' => $this->variant->id,
            'type' => 'in',
            'quantity' => 10,
            'source' => 'purchase',
        ]);
    }

    public function test_admin_can_receive_purchase_order_items_partially()
    {
        $po = PurchaseOrder::create([
            'supplier_id' => $this->supplier->id,
            'order_date' => now(),
            'status' => 'ordered',
            'created_by' => $this->admin->id,
        ]);

        $poItem = $po->items()->create([
            'product_variant_id' => $this->variant->id,
            'quantity' => 10,
            'quantity_received' => 0,
            'unit_cost' => 70000,
            'total_cost' => 700000,
        ]);

        $payload = [
            'items' => [
                [
                    'product_variant_id' => $this->variant->id,
                    'quantity_received' => 4, // Partial receive
                ]
            ]
        ];

        $response = $this->actingAs($this->admin)
            ->postJson("/adminv1/api/purchase-orders/{$po->id}/receive", $payload);

        $response->assertStatus(200);

        // Variant stock should increase by 4 (from 5 to 9)
        $this->assertEquals(9, $this->variant->fresh()->stock);

        // Status should remain ordered since it's not fully received yet
        $this->assertEquals('ordered', $po->fresh()->status);
        $this->assertNull($po->fresh()->received_date);

        // Verify stock mutation logged
        $this->assertDatabaseHas('stock_mutations', [
            'product_variant_id' => $this->variant->id,
            'type' => 'in',
            'quantity' => 4,
            'source' => 'purchase',
        ]);
    }
}
