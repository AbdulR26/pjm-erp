<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Share $appSetting globally in views safely
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('settings')) {
                $appSetting = (object)[
                    'app_name' => \App\Models\Setting::get('app_name', 'Putri Jaya Mobil'),
                    'app_short_name' => \App\Models\Setting::get('app_short_name', 'PJM'),
                    'logo' => \App\Models\Setting::get('logo', ''),
                    'logo_favicon' => \App\Models\Setting::get('logo_favicon', ''),
                    'primary_color' => \App\Models\Setting::get('primary_color', '#7367f0'),
                    'secondary_color' => \App\Models\Setting::get('secondary_color', '#82868b'),
                ];
            } else {
                $appSetting = (object)[
                    'app_name' => 'Putri Jaya Mobil',
                    'app_short_name' => 'PJM',
                    'logo' => '',
                    'logo_favicon' => '',
                    'primary_color' => '#7367f0',
                    'secondary_color' => '#82868b',
                ];
            }
        } catch (\Exception $e) {
            $appSetting = (object)[
                'app_name' => 'Putri Jaya Mobil',
                'app_short_name' => 'PJM',
                'logo' => '',
                'logo_favicon' => '',
                'primary_color' => '#7367f0',
                'secondary_color' => '#82868b',
            ];
        }

        view()->share('appSetting', $appSetting);
    }
}
