<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Banner;
use App\Models\Setting;
use Illuminate\Http\Request;

class PublicProductController extends Controller
{
    /**
     * Get list of e-commerce products formatted for the React customer frontend.
     */
    public function index()
    {
        $products = Product::with([
            'categories', 
            'variants.images', 
            'images', 
            'attributeValues.attribute', 
            'reviews.customer', 
            'variants.reviews.customer'
        ])->whereNull('parent_id')->get();
        $now = now();
        $formatted = $products->map(function ($product) use ($now) {
            return self::formatProduct($product, $now);
        });

        return response()->json($formatted);
    }

    /**
     * Get list of categories.
     */
    public function categories()
    {
        $categories = Category::withCount('products')->get();
        return response()->json($categories);
    }

    public function banners()
    {
        $banners = Banner::where('is_active', true)->orderBy('order')->get()->map(function ($banner) {
            if ($banner->image) {
                $banner->image = \App\Helpers\StorageHelper::url($banner->image);
            }
            return $banner;
        });
        return response()->json($banners);
    }

    public function settings()
    {
        $settings = Setting::all()->pluck('value', 'key');

        $imageKeys = ['side_banner_1_image', 'side_banner_2_image', 'logo', 'logo_favicon'];
        foreach ($imageKeys as $key) {
            if (isset($settings[$key]) && $settings[$key]) {
                $settings[$key] = \App\Helpers\StorageHelper::url($settings[$key]);
            }
        }
        if (isset($settings['logo'])) {
            $settings['logo_url'] = $settings['logo'];
        }

        $settings['midtrans_client_key'] = config('midtrans.client_key');
        $settings['midtrans_is_production'] = config('midtrans.is_production');

        $now = now();
        $activeFlashSaleEnd = Product::where('is_flash_sale', true)
            ->whereNotNull('flash_sale_end')
            ->where('flash_sale_start', '<=', $now)
            ->where('flash_sale_end', '>', $now)
            ->where('flash_sale_stock', '>', 0)
            ->min('flash_sale_end');

        if ($activeFlashSaleEnd) {
            $settings['flash_sale_end_time'] = \Carbon\Carbon::parse($activeFlashSaleEnd)->toDateTimeString();
        }

        return response()->json($settings);
    }

    /**
     * Formats a Product model including dynamic pricing, discounts, variations, and active promotion states.
     */
    public static function formatProduct($product, $now = null)
    {
        if (!$now) {
            $now = now();
        }
        $firstVariant = $product->variants->first();
        $basePrice = $firstVariant ? (float) $firstVariant->price : (float) $product->price;

        $discount = 0;
        $originalPrice = $basePrice;
        $finalPrice = $basePrice;
        $isFlashSaleActive = false;
        $flashSaleStock = 0;

        if ($firstVariant) {
            // If it has variants, parent attributes on landing pages inherit from the first variant's specific active promotions.
            // Each variant has its own independent settings.
            $vIsFlashSaleActive = $firstVariant->is_flash_sale 
                && $firstVariant->flash_sale_stock > 0 
                && $firstVariant->flash_sale_start 
                && $firstVariant->flash_sale_end 
                && $now->between($firstVariant->flash_sale_start, $firstVariant->flash_sale_end);

            if ($vIsFlashSaleActive) {
                $finalPrice = $firstVariant->flash_sale_price ? (float) $firstVariant->flash_sale_price : $basePrice;
                if ($basePrice > 0 && $finalPrice < $basePrice) {
                    $discount = round((($basePrice - $finalPrice) / $basePrice) * 100);
                }
                $isFlashSaleActive = true;
                $flashSaleStock = (int) $firstVariant->flash_sale_stock;
            } else {
                $discount = (int) ($firstVariant->discount_percent ?? 0);
                if ($discount > 0) {
                    $finalPrice = round($basePrice * (1 - ($discount / 100)));
                }
            }
            $stock = $product->variants->sum('stock');
        } else {
            // Simple product without variants
            $isFlashSaleActive = $product->is_flash_sale 
                && $product->flash_sale_stock > 0 
                && $product->flash_sale_start 
                && $product->flash_sale_end 
                && $now->between($product->flash_sale_start, $product->flash_sale_end);

            if ($isFlashSaleActive) {
                $finalPrice = $product->flash_sale_price ? (float) $product->flash_sale_price : $basePrice;
                if ($basePrice > 0 && $finalPrice < $basePrice) {
                    $discount = round((($basePrice - $finalPrice) / $basePrice) * 100);
                }
                $stock = (int) $product->flash_sale_stock;
            } else {
                $discount = (int) ($product->discount_percent ?? 0);
                if ($discount > 0) {
                    $finalPrice = round($basePrice * (1 - ($discount / 100)));
                }
                $stock = $product->stock;
            }
        }

        // Format specifications
        $specs = [];
        foreach ($product->attributeValues as $val) {
            if ($val->attribute) {
                $specs[$val->attribute->name] = $val->value;
            }
        }

        // Resolve actual sold count from completed orders (including all variants if configurable)
        $productIds = $product->variants->pluck('id')->push($product->id);
        $soldCount = (int) \App\Models\OrderItem::whereIn('product_id', $productIds)
            ->whereHas('order.status', function ($query) {
                $query->whereIn('slug', ['processing', 'shipping', 'completed']);
            })
            ->sum('quantity');

        // Resolve reviews and calculate average rating
        $reviews = collect($product->reviews);
        if ($product->relationLoaded('variants')) {
            foreach ($product->variants as $v) {
                if ($v->relationLoaded('reviews')) {
                    $reviews = $reviews->merge($v->reviews);
                }
            }
        }
        $reviews = $reviews->sortByDesc('created_at');
        $avgRating = $reviews->count() > 0 ? round($reviews->avg('rating'), 1) : 0;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'category' => $product->categories->first() ? $product->categories->first()->name : 'Uncategorized',
            'price' => $finalPrice,
            'originalPrice' => $originalPrice,
            'discount' => $discount,
            'rating' => $avgRating,
            'sold' => $soldCount,
            'reviews' => $reviews->map(function ($rev) {
                $cust = session('customer');
                $customerId = $cust ? $cust['id'] : null;
                $userLiked = $customerId
                    ? \App\Models\ProductReviewLike::where('review_id', $rev->id)
                        ->where('customer_id', $customerId)->exists()
                    : false;

                return [
                    'id'              => $rev->id,
                    'customer_name'   => $rev->customer ? $rev->customer->name : 'Pelanggan PJM',
                    'rating'          => $rev->rating,
                    'comment'         => $rev->comment,
                    'photo_urls'      => $rev->photo_urls,
                    'video_url'       => $rev->video_url,
                    'seller_reply'    => $rev->seller_reply,
                    'seller_reply_at' => $rev->seller_reply_at ? $rev->seller_reply_at->format('Y-m-d H:i') : null,
                    'likes_count'     => (int) $rev->likes_count,
                    'user_liked'      => $userLiked,
                    'variant_name'    => null, // can be enhanced later with order item variant info
                    'created_at'      => $rev->created_at ? $rev->created_at->format('Y-m-d H:i') : null,
                ];
            })->values()->toArray(),
            'stock' => (int) $stock,
            'weight' => (int) ($product->weight ?? 1000),
            'image' => $product->main_image ?: '/images/default-product.png',
            'images' => $product->images->map(function ($img) {
                $path = $img->image_path;
                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                    return $path;
                }
                return app(\App\Services\CloudflareR2Service::class)->url($path);
            })->toArray(),
            'badge' => $discount > 0 ? 'Promo' : null,
            'description' => $product->description,
            'specs' => !empty($specs) ? $specs : null,
            'variants' => $product->variants->map(function ($v) use ($product, $now) {
                $vOriginalPrice = (float) $v->price;
                $vPrice = $vOriginalPrice;
                $vDiscount = 0;
                $vStock = (int) $v->stock;

                $vIsFlashSaleActive = $v->is_flash_sale 
                    && $v->flash_sale_stock > 0 
                    && $v->flash_sale_start 
                    && $v->flash_sale_end 
                    && $now->between($v->flash_sale_start, $v->flash_sale_end);

                if ($vIsFlashSaleActive) {
                    $vPrice = $v->flash_sale_price ? (float) $v->flash_sale_price : $vOriginalPrice;
                    if ($vOriginalPrice > 0 && $vPrice < $vOriginalPrice) {
                        $vDiscount = round((($vOriginalPrice - $vPrice) / $vOriginalPrice) * 100);
                    }
                    $vStock = (int) $v->flash_sale_stock;
                } else {
                    $pctDiscount = (int) ($v->discount_percent ?? 0);
                    if ($pctDiscount > 0) {
                        $vPrice = round($vOriginalPrice * (1 - ($pctDiscount / 100)));
                        $vDiscount = $pctDiscount;
                    }
                }

                return [
                    'id' => $v->id,
                    'name' => $v->name,
                    'sku' => $v->sku,
                    'price' => (float) $vPrice,
                    'originalPrice' => $vOriginalPrice,
                    'discount' => $vDiscount,
                    'stock' => $vStock,
                    'weight' => (int) ($v->weight ?? $product->weight ?? 1000),
                    'image' => $v->main_image ?: ($product->main_image ?: '/images/default-product.png'),
                    'images' => $v->images->map(function ($img) use ($product) {
                        $path = $img->image_path;
                        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                            return $path;
                        }
                        return app(\App\Services\CloudflareR2Service::class)->url($path);
                    })->toArray(),
                ];
            })->toArray(),
            'is_flash_sale' => $isFlashSaleActive,
            'flash_sale_stock' => $isFlashSaleActive ? $flashSaleStock : 0
        ];
    }
}
