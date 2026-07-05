<?php

namespace App\Http\Controllers;

use App\Models\ProductReview;
use App\Models\ProductReviewLike;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PublicReviewController extends Controller
{
    /**
     * Toggle like on a review (customer only).
     */
    public function like(int $id): JsonResponse
    {
        $sessionCustomer = \Illuminate\Support\Facades\Session::get('customer');

        if (!$sessionCustomer) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $customerId = $sessionCustomer['id'];

        $review = ProductReview::findOrFail($id);

        $existingLike = ProductReviewLike::where('review_id', $id)
            ->where('customer_id', $customerId)
            ->first();

        if ($existingLike) {
            $existingLike->delete();
            $review->decrement('likes_count');
            $liked = false;
        } else {
            ProductReviewLike::create([
                'review_id'   => $id,
                'customer_id' => $customerId,
            ]);
            $review->increment('likes_count');
            $liked = true;
        }

        $review->refresh();

        return response()->json([
            'liked'       => $liked,
            'likes_count' => $review->likes_count,
        ]);
    }

    /**
     * Add or update seller reply on a review (admin only).
     */
    public function reply(Request $request, int $id): JsonResponse
    {
        // Check if user is admin (auth:web guard)
        if (!Auth::guard('web')->check()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'reply' => 'required|string|max:2000',
        ]);

        $review = ProductReview::findOrFail($id);
        $review->update([
            'seller_reply'    => $request->reply,
            'seller_reply_at' => now(),
        ]);

        return response()->json([
            'message'         => 'Balasan berhasil disimpan.',
            'seller_reply'    => $review->seller_reply,
            'seller_reply_at' => $review->seller_reply_at?->format('Y-m-d H:i'),
        ]);
    }
}
