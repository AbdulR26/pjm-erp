<div class="main-menu menu-fixed menu-light menu-accordion menu-shadow" data-scroll-to-active="true">
    <div class="navbar-header">
        <ul class="nav navbar-nav flex-row">
            <li class="nav-item mr-auto">
                <a class="navbar-brand" href="{{ route('admin.dashboard') }}" style="display: flex; align-items: center; margin-top: 10px;">
                    <span class="brand-logo" style="display: flex; align-items: center; justify-content: center;">
                        @if($appSetting->logo)
                            <img src="{{ \App\Helpers\StorageHelper::url($appSetting->logo) }}" alt="logo" style="max-height: 28px; border-radius: 4px;">
                        @else
                            <svg viewbox="0 0 139 95" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="24">
                                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                    <g id="Artboard" transform="translate(-400.000000, -178.000000)">
                                        <g id="Group" transform="translate(400.000000, 178.000000)">
                                            <path id="Path" class="text-primary" fill="currentColor" d="M-5.68434189e-14,2.84217094e-14 L39.1816085,2.84217094e-14 L69.3453773,32.2519224 L101.428699,2.84217094e-14 L138.784583,2.84217094e-14 L94.7579721,42.0205676 L138.784583,82.8421709 L101.428699,82.8421709 L69.3453773,50.7077556 L39.1816085,82.8421709 L-5.68434189e-14,82.8421709 L44.0266008,42.0205676 L-5.68434189e-14,2.84217094e-14 Z" style="fill: currentColor;"></path>
                                        </g>
                                    </g>
                                </g>
                            </svg>
                        @endif
                    </span>
                    <h2 class="brand-text text-primary" style="font-size: 1.15rem; font-weight: 800; margin-left: 8px; margin-bottom: 0;">
                        {{ $appSetting->app_short_name ?: $appSetting->app_name }}
                    </h2>
                </a>
            </li>
            <li class="nav-item nav-toggle"><a class="nav-link modern-nav-toggle pr-0" data-toggle="collapse"><i
                        class="d-block d-xl-none text-primary toggle-icon font-medium-4" data-feather="x"></i><i
                        class="d-none d-xl-block collapse-toggle-icon font-medium-4  text-primary" data-feather="disc"
                        data-ticon="disc"></i></a></li>
        </ul>
    </div>
    <div class="shadow-bottom"></div>
    <div class="main-menu-content">
        <ul class="navigation navigation-main" id="main-menu-navigation" data-menu="menu-navigation">
            
            <!-- Dashboard -->
            <li class="nav-item {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('admin.dashboard') }}">
                    <i data-feather="home"></i>
                    <span class="menu-title text-truncate">Dashboard</span>
                </a>
            </li>

            <!-- Products -->
            <li class="nav-item has-sub {{ request()->is('admin/products*') || request()->is('admin/product-categories*') || request()->is('admin/reviews*') ? 'open sidebar-group-active' : '' }}">
                <a class="d-flex align-items-center" href="#">
                    <i data-feather="package"></i>
                    <span class="menu-title text-truncate">Product</span>
                </a>
                <ul class="menu-content">
                    <li class="{{ request()->is('admin/products*') ? 'active' : '' }}">
                        <a class="d-flex align-items-center" href="{{ route('product.index') }}">
                            <i data-feather="list"></i>
                            <span class="menu-item text-truncate">Products</span>
                        </a>
                    </li>
                    <li class="{{ request()->is('admin/product-categories*') ? 'active' : '' }}">
                        <a class="d-flex align-items-center" href="{{ route('product-category.index') }}">
                            <i data-feather="tag"></i>
                            <span class="menu-item text-truncate">Category</span>
                        </a>
                    </li>
                    <li class="{{ request()->is('admin/reviews*') ? 'active' : '' }}">
                        <a class="d-flex align-items-center" href="{{ route('admin.reviews.index') }}">
                            <i data-feather="star"></i>
                            <span class="menu-item text-truncate">Reviews</span>
                        </a>
                    </li>
                </ul>
            </li>

            <!-- Stock Management -->
            <li class="nav-item {{ request()->is('admin/stock*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('admin.stock.index') }}">
                    <i data-feather="database"></i>
                    <span class="menu-title text-truncate">Stock Management</span>
                </a>
            </li>

            <!-- Orders -->
            <li class="nav-item {{ request()->is('admin/orders*') && !request()->is('admin/order-returns*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('admin.orders.index') }}">
                    <i data-feather="shopping-cart"></i>
                    <span class="menu-title text-truncate">Orders</span>
                </a>
            </li>

            <!-- Retur & Refund -->
            <li class="nav-item {{ request()->is('admin/order-returns*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('admin.order-returns.index') }}">
                    <i data-feather="rotate-ccw"></i>
                    <span class="menu-title text-truncate">Retur & Refund</span>
                </a>
            </li>

            <!-- Vouchers -->
            <li class="nav-item {{ request()->is('admin/vouchers*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('admin.vouchers.index') }}">
                    <i data-feather="gift"></i>
                    <span class="menu-title text-truncate">Voucher</span>
                </a>
            </li>

            <!-- Customers -->
            <li class="nav-item {{ request()->is('admin/customers*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('customer.index') }}">
                    <i data-feather="users"></i>
                    <span class="menu-title text-truncate">Customer</span>
                </a>
            </li>

            <!-- Suppliers -->
            <li class="nav-item {{ request()->is('admin/suppliers*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('admin.suppliers.index') }}">
                    <i data-feather="truck"></i>
                    <span class="menu-title text-truncate">Supplier</span>
                </a>
            </li>

            <!-- Purchase Orders -->
            <li class="nav-item {{ request()->is('admin/purchase-orders*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('admin.purchase-orders.index') }}">
                    <i data-feather="file-text"></i>
                    <span class="menu-title text-truncate">Purchase Order</span>
                </a>
            </li>

            <!-- Chat Support -->
            <li class="nav-item {{ request()->routeIs('admin.chats.index') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('admin.chats.index') }}">
                    <i data-feather="message-square"></i>
                    <span class="menu-title text-truncate">Chat Support</span>
                </a>
            </li>

            <!-- Settings -->
            <li class="nav-item {{ request()->is('admin/settings*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('admin.settings.index') }}">
                    <i data-feather="settings"></i>
                    <span class="menu-title text-truncate">Settings</span>
                </a>
            </li>

            <!-- User Management -->
            <li class="nav-item {{ request()->is('admin/users*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ route('admin.users.index') }}">
                    <i data-feather="users"></i>
                    <span class="menu-title text-truncate">User Management</span>
                </a>
            </li>

            <li class="navigation-header">
                <span>Logs</span>
                <i data-feather="more-horizontal"></i>
            </li>
            
            <!-- Log Aktivitas -->
            <li class="nav-item {{ request()->is('data-logs*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ url('/data-logs') }}">
                    <i data-feather="database"></i>
                    <span class="menu-title text-truncate">Log</span>
                </a>
            </li>

            <!-- Log API -->
            <li class="nav-item {{ request()->is('api-logs*') ? 'active' : '' }}">
                <a class="d-flex align-items-center" href="{{ url('/api-logs') }}">
                    <i data-feather="activity"></i>
                    <span class="menu-title text-truncate">Log Api</span>
                </a>
            </li>

        </ul>
    </div>
</div>
