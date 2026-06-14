<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Voucher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminVoucherTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $staff;
    protected $voucher;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@pjm.com',
            'password' => bcrypt('password'),
        ]);
        // Laravel's Spatie Permission or custom roles: Let's check how roles are stored
        // In app/Models/User.php or migrations, let's see how roles are assigned in Seeder:
        // RoleAndUserSeeder uses Spatie permission assignRole
        // Let's check if Spatie is used. Spatie roles are handled in seeder.
        // For testing, Spatie permission is loaded, we can assign roles or we can mock/actingAs.
        // Actually, we can check routes: in routes/web.php, the admin API middleware is just 'auth'!
        // Let's verify: Route::middleware('auth')->group(...)
        // It does not use 'role:admin' middleware in routes! It just uses auth!
        // The check $user->roles.includes('admin') is on the frontend (React).
        // On backend controller (UserController, VoucherController), there's no strict role guard,
        // it just checks "auth" middleware. Let's make sure.
    }

    /**
     * Test admin can list vouchers.
     */
    public function test_admin_can_list_vouchers(): void
    {
        Voucher::create([
            'code' => 'DISCOUNT20',
            'type' => 'percent',
            'value' => 20,
            'min_spend' => 50000,
            'quota' => 10,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->getJson('/adminv1/api/vouchers');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'current_page',
            'data' => [
                '*' => [
                    'id',
                    'code',
                    'type',
                    'value',
                    'min_spend',
                    'quota',
                ]
            ]
        ]);
        $response->assertJsonFragment(['code' => 'DISCOUNT20']);
    }

    /**
     * Test admin can create a voucher.
     */
    public function test_admin_can_create_voucher(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/adminv1/api/vouchers', [
            'code' => 'DISKONBARU',
            'type' => 'fixed',
            'value' => 15000,
            'min_spend' => 30000,
            'quota' => 50,
            'is_active' => true,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('vouchers', [
            'code' => 'DISKONBARU',
            'value' => 15000,
            'min_spend' => 30000,
        ]);
    }

    /**
     * Test admin can update a voucher.
     */
    public function test_admin_can_update_voucher(): void
    {
        $vch = Voucher::create([
            'code' => 'OLDCODE',
            'type' => 'percent',
            'value' => 5,
            'min_spend' => 20000,
            'quota' => 20,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->putJson("/adminv1/api/vouchers/{$vch->id}", [
            'code' => 'NEWCODE',
            'type' => 'percent',
            'value' => 15,
            'min_spend' => 40000,
            'quota' => 30,
            'is_active' => false,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('vouchers', [
            'id' => $vch->id,
            'code' => 'NEWCODE',
            'value' => 15,
            'min_spend' => 40000,
            'is_active' => false,
        ]);
    }

    /**
     * Test admin can delete a voucher.
     */
    public function test_admin_can_delete_voucher(): void
    {
        $vch = Voucher::create([
            'code' => 'DELETECODE',
            'type' => 'fixed',
            'value' => 10000,
            'min_spend' => 10000,
            'quota' => 10,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->deleteJson("/adminv1/api/vouchers/{$vch->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('vouchers', [
            'id' => $vch->id,
        ]);
    }
}
