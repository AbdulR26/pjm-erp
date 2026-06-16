<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Pusher\Pusher;

class PublicChatController extends Controller
{
    /**
     * Get chat history for the currently logged-in customer.
     */
    public function index()
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $messages = ChatMessage::where('customer_id', $customer['id'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                $msg->is_read_by_customer = (bool) $msg->is_read_by_customer;
                $msg->is_read_by_admin = (bool) $msg->is_read_by_admin;
                return $msg;
            });

        return response()->json($messages);
    }

    /**
     * Send a new message to CS (admin).
     */
    public function store(Request $request)
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $message = ChatMessage::create([
            'customer_id' => $customer['id'],
            'sender_type' => 'customer',
            'message' => $request->message,
            'is_read_by_customer' => true,
            'is_read_by_admin' => false,
        ]);

        // Broadcast the event to Pusher channel
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }

    /**
     * Mark all admin messages to this customer as read.
     */
    public function read()
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        ChatMessage::where('customer_id', $customer['id'])
            ->where('sender_type', 'admin')
            ->where('is_read_by_customer', false)
            ->update(['is_read_by_customer' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Authorize Pusher subscription for private chat channels.
     * Accessible by either the customer themselves or an authenticated admin.
     */
    public function auth(Request $request)
    {
        $socketId = $request->input('socket_id');
        $channelName = $request->input('channel_name');

        $customer = session('customer');
        $isAdmin = auth()->check();

        if ($channelName === 'private-admin.chats' && $isAdmin) {
            try {
                $pusher = new Pusher(
                    config('broadcasting.connections.pusher.key'),
                    config('broadcasting.connections.pusher.secret'),
                    config('broadcasting.connections.pusher.app_id'),
                    config('broadcasting.connections.pusher.options')
                );

                $authData = $pusher->authorizeChannel($channelName, $socketId);
                return response($authData);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Pusher error: ' . $e->getMessage()], 500);
            }
        }

        if (preg_match('/^private-chat\.customer\.(\d+)$/', $channelName, $matches)) {
            $customerId = (int) $matches[1];

            // Authorize if it's the customer themselves, or if it's an authenticated admin
            if (($customer && (int)$customer['id'] === $customerId) || $isAdmin) {
                try {
                    $pusher = new Pusher(
                        config('broadcasting.connections.pusher.key'),
                        config('broadcasting.connections.pusher.secret'),
                        config('broadcasting.connections.pusher.app_id'),
                        config('broadcasting.connections.pusher.options')
                    );

                    $authData = $pusher->authorizeChannel($channelName, $socketId);
                    return response($authData);
                } catch (\Exception $e) {
                    return response()->json(['message' => 'Pusher error: ' . $e->getMessage()], 500);
                }
            }
        }

        return response()->json(['message' => 'Unauthorized'], 403);
    }
}
