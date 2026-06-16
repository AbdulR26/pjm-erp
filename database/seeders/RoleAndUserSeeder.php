<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Support\Facades\Hash;

class RoleAndUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $staffRole = Role::create(['name' => 'staff']);
        $customerRole = Role::create(['name' => 'customer']);

        // Create Admin User
        $adminUser = User::create([
            'name' => 'Super Admin PJM',
            'email' => 'admin@pjm.com',
            'password' => Hash::make('password'),
        ]);
        $adminUser->assignRole($adminRole);

        // Create Staff User
        $staffUser = User::create([
            'name' => 'Staff Operasional PJM',
            'email' => 'staff@pjm.com',
            'password' => Hash::make('password'),
        ]);
        $staffUser->assignRole($staffRole);

        // Create Dummy Customers
        Customer::create([
            'name' => 'Budi Santoso',
            'email' => 'budi@gmail.com',
            'phone' => '08123456789',
            'address' => 'Jl. Jend. Sudirman No. 10, Jakarta Pusat',
            'postal_code' => '10110',
            'latitude' => -6.1805,
            'longitude' => 106.8285,
        ]);

        Customer::create([
            'name' => 'Siti Aminah',
            'email' => 'siti@gmail.com',
            'phone' => '08567891234',
            'address' => 'Jl. Margonda Raya No. 45, Depok',
            'postal_code' => '16424',
            'latitude' => -6.3725,
            'longitude' => 106.8285,
        ]);

        Customer::create([
            'name' => 'Andi Wijaya',
            'email' => 'andi@gmail.com',
            'phone' => '08789012345',
            'address' => 'Jl. Ahmad Yani No. 88, Bekasi Selatan',
            'postal_code' => '17141',
            'latitude' => -6.2425,
            'longitude' => 106.9995,
        ]);
    }
}
