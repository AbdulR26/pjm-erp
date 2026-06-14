<?php

namespace Tests\Feature;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CustomerAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_successfully()
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
            'phone' => '081234567890',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'customer' => [
                    'name' => 'John Doe',
                    'email' => 'johndoe@example.com',
                    'provider' => 'email',
                ]
            ]);

        $this->assertDatabaseHas('customers', [
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
            'phone' => '081234567890',
        ]);

        $customer = Customer::where('email', 'johndoe@example.com')->first();
        $this->assertTrue(Hash::check('password123', $customer->password));

        // Session check
        $this->assertEquals($customer->id, session('customer.id'));
    }

    public function test_customer_registration_validation()
    {
        // 1. Missing fields
        $response = $this->postJson('/api/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'status',
                'errors' => ['name', 'email', 'phone', 'password']
            ]);

        // 2. Duplicate email
        Customer::create([
            'name' => 'Existing Customer',
            'email' => 'existing@example.com',
            'phone' => '0812345678',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'New Customer',
            'email' => 'existing@example.com',
            'phone' => '08987654321',
            'password' => 'secret123',
        ]);

        $response->assertStatus(422)
            ->assertJsonFragment([
                'email' => ['Email ini sudah terdaftar.']
            ]);
    }

    public function test_customer_can_login_successfully()
    {
        $customer = Customer::create([
            'name' => 'Jane Doe',
            'email' => 'janedoe@example.com',
            'phone' => '081122334455',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'janedoe@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'customer' => [
                    'id' => $customer->id,
                    'name' => 'Jane Doe',
                    'email' => 'janedoe@example.com',
                    'provider' => 'email',
                ]
            ]);

        $this->assertEquals($customer->id, session('customer.id'));
    }

    public function test_customer_login_fails_with_invalid_credentials()
    {
        Customer::create([
            'name' => 'Jane Doe',
            'email' => 'janedoe@example.com',
            'phone' => '081122334455',
            'password' => Hash::make('password123'),
        ]);

        // Wrong password
        $response = $this->postJson('/api/auth/login', [
            'email' => 'janedoe@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'status' => 'error',
                'message' => 'Email atau password salah.'
            ]);

        // Wrong email
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }
}
