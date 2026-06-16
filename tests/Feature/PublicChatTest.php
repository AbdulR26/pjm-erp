<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class PublicChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_customer_cannot_access_chat(): void
    {
        $response = $this->getJson('/api/chats');
        $response->assertStatus(401);

        $response = $this->postJson('/api/chats', ['message' => 'Hello']);
        $response->assertStatus(401);
    }

    public function test_authenticated_customer_can_send_and_get_chat_messages(): void
    {
        // Create customer
        $customer = \App\Models\Customer::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '0812345678',
            'password' => bcrypt('password')
        ]);

        // Mock customer session
        $this->withSession(['customer' => [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
        ]]);

        // Send message
        $response = $this->postJson('/api/chats', ['message' => 'Hi Support']);
        $response->assertStatus(201);
        $response->assertJsonFragment(['message' => 'Hi Support', 'sender_type' => 'customer']);

        // Get messages
        $response = $this->getJson('/api/chats');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
    }

    public function test_admin_can_access_chat_endpoints(): void
    {
        // Create admin
        $admin = \App\Models\User::create([
            'name' => 'Admin User',
            'email' => 'admin@pjm.com',
            'password' => bcrypt('password'),
            'roles' => ['admin']
        ]);

        // Create customer & chat message
        $customer = \App\Models\Customer::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '0812345678',
        ]);

        \App\Models\ChatMessage::create([
            'customer_id' => $customer->id,
            'sender_type' => 'customer',
            'message' => 'Need help',
        ]);

        // Authenticate admin
        $this->actingAs($admin);

        // Get admin chats thread list
        $response = $this->getJson('/adminv1/api/chats');
        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'John Doe']);

        // Get chat history with customer
        $response = $this->getJson("/adminv1/api/chats/{$customer->id}");
        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Need help']);

        // Send reply to customer
        $response = $this->postJson("/adminv1/api/chats/{$customer->id}", ['message' => 'Hello John']);
        $response->assertStatus(201);

        // Mark as read
        $response = $this->postJson("/adminv1/api/chats/{$customer->id}/read");
        $response->assertStatus(200);
    }
}
