<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Supplier;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSupplierTest extends TestCase
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
            'roles' => ['admin'], // Set role
        ]);
    }

    public function test_admin_can_list_suppliers()
    {
        Supplier::create([
            'name' => 'Supplier A',
            'code' => 'SPL-A',
            'phone' => '081234567890',
        ]);

        $response = $this->actingAs($this->admin)
            ->getJson('/adminv1/api/suppliers');

        $response->assertStatus(200)
            ->assertJsonFragment([
                'name' => 'Supplier A',
                'code' => 'SPL-A',
            ]);
    }

    public function test_admin_can_create_supplier()
    {
        $payload = [
            'name' => 'Supplier B',
            'code' => 'SPL-B',
            'company_name' => 'PT Supplier Jaya',
            'phone' => '081234567891',
            'email' => 'supplierB@example.com',
            'address' => 'Jakarta, Indonesia',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/adminv1/api/suppliers', $payload);

        $response->assertStatus(211) // Laravel default or our custom 211
            ->assertJsonFragment([
                'name' => 'Supplier B',
                'code' => 'SPL-B',
            ]);

        $this->assertDatabaseHas('suppliers', [
            'code' => 'SPL-B',
        ]);
    }

    public function test_supplier_creation_validates_unique_code()
    {
        Supplier::create([
            'name' => 'Supplier Unique',
            'code' => 'SPL-UNIQ',
        ]);

        $payload = [
            'name' => 'Supplier Another',
            'code' => 'SPL-UNIQ', // Duplicate code
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/adminv1/api/suppliers', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('code');
    }

    public function test_admin_can_update_supplier()
    {
        $supplier = Supplier::create([
            'name' => 'Supplier Old',
            'code' => 'SPL-OLD',
        ]);

        $payload = [
            'name' => 'Supplier New Name',
            'code' => 'SPL-NEW', // Can update code
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/adminv1/api/suppliers/{$supplier->id}", $payload);

        $response->assertStatus(200);
        $this->assertDatabaseHas('suppliers', [
            'id' => $supplier->id,
            'name' => 'Supplier New Name',
            'code' => 'SPL-NEW',
        ]);
    }

    public function test_admin_cannot_delete_supplier_with_purchase_orders()
    {
        $supplier = Supplier::create([
            'name' => 'Supplier Heavy',
            'code' => 'SPL-HVY',
        ]);

        // Create product + variant for PO
        $category = Category::create(['name' => 'Spareparts', 'slug' => 'spareparts']);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Busi Bosch',
            'slug' => 'busi-bosch',
        ]);
        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'name' => 'Standard',
            'sku' => 'BUSI-STD',
            'base_price' => 15000,
            'stock' => 10,
        ]);

        // Create PO
        $po = PurchaseOrder::create([
            'supplier_id' => $supplier->id,
            'order_date' => now(),
            'created_by' => $this->admin->id,
        ]);

        $po->items()->create([
            'product_variant_id' => $variant->id,
            'quantity' => 10,
            'unit_cost' => 12000,
            'total_cost' => 120000,
        ]);

        // Try to delete supplier
        $response = $this->actingAs($this->admin)
            ->deleteJson("/adminv1/api/suppliers/{$supplier->id}");

        $response->assertStatus(422)
            ->assertJsonFragment([
                'status' => 'error',
                'message' => 'Supplier tidak dapat dihapus karena memiliki transaksi Purchase Order.',
            ]);

        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id]);
    }

    public function test_admin_can_delete_supplier_without_purchase_orders()
    {
        $supplier = Supplier::create([
            'name' => 'Supplier Empty',
            'code' => 'SPL-EMPTY',
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/adminv1/api/suppliers/{$supplier->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('suppliers', ['id' => $supplier->id]);
    }
}
