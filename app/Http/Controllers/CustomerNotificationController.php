<?php

namespace App\Http\Controllers;

use App\Models\CustomerNotification;
use Illuminate\Http\Request;

class CustomerNotificationController extends Controller
{
    /**
     * Get list of notifications for the logged-in customer.
     */
    public function index()
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $notifications = CustomerNotification::where('customer_id', $customer['id'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(string $id)
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $notification = CustomerNotification::where('customer_id', $customer['id'])
            ->findOrFail($id);

        $notification->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'notification' => $notification
        ]);
    }

    /**
     * Mark all notifications of the customer as read.
     */
    public function markAllAsRead()
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        CustomerNotification::where('customer_id', $customer['id'])
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi ditandai telah dibaca.'
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(string $id)
    {
        $customer = session('customer');
        if (!$customer) {
            return response()->json(['message' => 'Silakan login terlebih dahulu.'], 401);
        }

        $notification = CustomerNotification::where('customer_id', $customer['id'])
            ->findOrFail($id);

        $notification->delete();

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi berhasil dihapus.'
        ]);
    }
}
