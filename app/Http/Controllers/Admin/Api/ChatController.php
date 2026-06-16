<?php

namespace App\Http\Controllers\Admin\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\ChatMessage;
use App\Events\MessageSent;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Get a list of customers who have chat threads, sorted by recent activity.
     */
    public function index()
    {
        $customers = Customer::whereHas('chatMessages')
            ->withCount(['chatMessages as unread_count' => function ($q) {
                $q->where('sender_type', 'customer')->where('is_read_by_admin', false);
            }])
            ->get()
            ->map(function ($cust) {
                $lastMsg = ChatMessage::where('customer_id', $cust->id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                
                $cust->last_message = $lastMsg ? $lastMsg->message : null;
                $cust->last_message_time = $lastMsg ? $lastMsg->created_at->toIso8601String() : null;
                return $cust;
            })
            ->sortByDesc('last_message_time')
            ->values();

        return response()->json($customers);
    }

    /**
     * Get full chat history with a specific customer.
     */
    public function show(string $customerId)
    {
        $messages = ChatMessage::where('customer_id', $customerId)
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
     * Send a reply message to the customer.
     */
    public function store(Request $request, string $customerId)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $message = ChatMessage::create([
            'customer_id' => $customerId,
            'sender_type' => 'admin',
            'admin_id' => auth()->id(),
            'message' => $request->message,
            'is_read_by_customer' => false,
            'is_read_by_admin' => true,
        ]);

        // Broadcast to Pusher channel
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }

    /**
     * Mark all customer messages in this thread as read by admin.
     */
    public function read(string $customerId)
    {
        ChatMessage::where('customer_id', $customerId)
            ->where('sender_type', 'customer')
            ->where('is_read_by_admin', false)
            ->update(['is_read_by_admin' => true]);

        return response()->json(['success' => true]);
    }
}
