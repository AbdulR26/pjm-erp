<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\CustomerAddress;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerAddressTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_customer_can_add_address()
    {
        $customer = Customer::create([
            'name' => 'Jane Doe',
            'email' => 'janedoe@example.com',
            'phone' => '081234567891',
        ]);

        $response = $this->withSession([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'provider' => 'email',
            ]
        ])->postJson('/api/auth/addresses', [
            'name' => 'Jane Home',
            'phone' => '081234567892',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Selatan',
            'district' => 'Kebayoran Baru',
            'village' => 'Selong',
            'address' => 'Jl. Senopati No. 12',
            'postal_code' => '12110',
            'latitude' => -6.2297,
            'longitude' => 106.8097,
            'is_primary' => true,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'success',
                'address' => [
                    'name' => 'Jane Home',
                    'province' => 'DKI Jakarta',
                    'is_primary' => true,
                ]
            ]);

        $this->assertDatabaseHas('customer_addresses', [
            'customer_id' => $customer->id,
            'name' => 'Jane Home',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Selatan',
            'district' => 'Kebayoran Baru',
            'village' => 'Selong',
            'address' => 'Jl. Senopati No. 12',
            'postal_code' => '12110',
            'is_primary' => true,
        ]);

        // Assert customer table sync
        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'address' => 'Jl. Senopati No. 12, Kel. Selong, Kec. Kebayoran Baru, Jakarta Selatan, DKI Jakarta',
            'postal_code' => '12110',
        ]);
    }

    public function test_authenticated_customer_can_list_addresses()
    {
        $customer = Customer::create([
            'name' => 'Jane Doe',
            'email' => 'janedoe@example.com',
            'phone' => '081234567891',
        ]);

        CustomerAddress::create([
            'customer_id' => $customer->id,
            'name' => 'Jane Office',
            'phone' => '081234567893',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Pusat',
            'district' => 'Gambir',
            'village' => 'Gambir',
            'address' => 'Jl. Merdeka Barat No. 1',
            'postal_code' => '10110',
            'is_primary' => true,
        ]);

        $response = $this->withSession([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
            ]
        ])->getJson('/api/auth/addresses');

        $response->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment([
                'name' => 'Jane Office',
                'city' => 'Jakarta Pusat',
            ]);
    }

    public function test_authenticated_customer_can_update_address()
    {
        $customer = Customer::create([
            'name' => 'Jane Doe',
            'email' => 'janedoe@example.com',
            'phone' => '081234567891',
        ]);

        $address = CustomerAddress::create([
            'customer_id' => $customer->id,
            'name' => 'Jane Home',
            'phone' => '081234567892',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Selatan',
            'district' => 'Kebayoran Baru',
            'village' => 'Selong',
            'address' => 'Jl. Senopati No. 12',
            'postal_code' => '12110',
            'is_primary' => true,
        ]);

        $response = $this->withSession([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
            ]
        ])->putJson("/api/auth/addresses/{$address->id}", [
            'name' => 'Jane New Home',
            'phone' => '081234567899',
            'province' => 'Jawa Barat',
            'city' => 'Bandung',
            'district' => 'Coblong',
            'village' => 'Dago',
            'address' => 'Jl. Ir. H. Juanda No. 100',
            'postal_code' => '40135',
            'is_primary' => true,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('customer_addresses', [
            'id' => $address->id,
            'name' => 'Jane New Home',
            'city' => 'Bandung',
            'is_primary' => true,
        ]);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'address' => 'Jl. Ir. H. Juanda No. 100, Kel. Dago, Kec. Coblong, Bandung, Jawa Barat',
            'postal_code' => '40135',
        ]);
    }

    public function test_authenticated_customer_can_set_primary_address()
    {
        $customer = Customer::create([
            'name' => 'Jane Doe',
            'email' => 'janedoe@example.com',
            'phone' => '081234567891',
        ]);

        $address1 = CustomerAddress::create([
            'customer_id' => $customer->id,
            'name' => 'Jane Home',
            'phone' => '081234567892',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Selatan',
            'district' => 'Kebayoran Baru',
            'village' => 'Selong',
            'address' => 'Jl. Senopati No. 12',
            'postal_code' => '12110',
            'is_primary' => true,
        ]);

        $address2 = CustomerAddress::create([
            'customer_id' => $customer->id,
            'name' => 'Jane Office',
            'phone' => '081234567893',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Pusat',
            'district' => 'Gambir',
            'village' => 'Gambir',
            'address' => 'Jl. Merdeka Barat No. 1',
            'postal_code' => '10110',
            'is_primary' => false,
        ]);

        $response = $this->withSession([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
            ]
        ])->postJson("/api/auth/addresses/{$address2->id}/primary");

        $response->assertStatus(200);

        $this->assertTrue($address2->fresh()->is_primary);
        $this->assertFalse($address1->fresh()->is_primary);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'address' => 'Jl. Merdeka Barat No. 1, Kel. Gambir, Kec. Gambir, Jakarta Pusat, DKI Jakarta',
            'postal_code' => '10110',
        ]);
    }

    public function test_authenticated_customer_can_delete_address()
    {
        $customer = Customer::create([
            'name' => 'Jane Doe',
            'email' => 'janedoe@example.com',
            'phone' => '081234567891',
        ]);

        $address1 = CustomerAddress::create([
            'customer_id' => $customer->id,
            'name' => 'Jane Home',
            'phone' => '081234567892',
            'province' => 'DKI Jakarta',
            'city' => 'Jakarta Selatan',
            'district' => 'Kebayoran Baru',
            'village' => 'Selong',
            'address' => 'Jl. Senopati No. 12',
            'postal_code' => '12110',
            'is_primary' => true,
        ]);

        $response = $this->withSession([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
            ]
        ])->deleteJson("/api/auth/addresses/{$address1->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('customer_addresses', ['id' => $address1->id]);
    }
}
