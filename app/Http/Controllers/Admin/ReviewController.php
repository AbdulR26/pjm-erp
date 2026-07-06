<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Display a listing of the reviews.
     */
    public function index(Request $request)
    {
        $query = ProductReview::with(['customer', 'product', 'order'])
            ->orderBy('created_at', 'desc');

        // Filter by rating
        if ($request->filled('rating')) {
            $query->where('rating', $request->rating);
        }

        // Filter by visibility
        if ($request->filled('status')) {
            $query->where('is_hidden', $request->status === 'hidden' ? 1 : 0);
        }

        // Search in product name or customer name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('product', function($pq) use ($search) {
                    $pq->where('name', 'like', "%{$search}%");
                })->orWhereHas('customer', function($cq) use ($search) {
                    $cq->where('name', 'like', "%{$search}%");
                })->orWhere('comment', 'like', "%{$search}%");
            });
        }

        $reviews = $query->paginate(15)->withQueryString();
        
        $title = 'Manajemen Ulasan Produk';
        $breadcrumbs = [
            ['link' => url('/'), 'name' => "Home"],
            ['name' => "Ulasan Produk"],
        ];
        $pageConfigs = ['pageHeader' => true, 'isFabButton' => false];

        return view('admin.reviews.index', get_defined_vars());
    }

    /**
     * Toggle visibility status of a review.
     */
    public function toggleVisibility($id)
    {
        try {
            $review = ProductReview::findOrFail($id);
            $review->is_hidden = !$review->is_hidden;
            $review->save();

            return response()->json([
                'success' => true,
                'message' => "Ulasan berhasil " . ($review->is_hidden ? 'disembunyikan' : 'ditampilkan') . ".",
                'is_hidden' => $review->is_hidden
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah status ulasan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reply to a review.
     */
    public function reply(Request $request, $id)
    {
        $request->validate([
            'reply' => 'required|string|max:1000',
        ]);

        try {
            $review = ProductReview::findOrFail($id);
            $review->seller_reply = $request->reply;
            $review->seller_reply_at = now();
            $review->save();

            return response()->json([
                'success' => true,
                'message' => 'Tanggapan ulasan berhasil disimpan.',
                'seller_reply' => $review->seller_reply,
                'seller_reply_at' => $review->seller_reply_at->format('Y-m-d H:i:s')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan tanggapan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a review.
     */
    public function destroy($id)
    {
        try {
            $review = ProductReview::findOrFail($id);
            $review->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ulasan berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus ulasan: ' . $e->getMessage()
            ], 500);
        }
    }
}
