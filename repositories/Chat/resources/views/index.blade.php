@extends('layouts.app')
@section('title', $title)
@section('content')
    <div class="row chat-application-wrapper">
        <div class="col-12">
            <div class="chat-app-card">
                <!-- Sidebar (Customer Directory) -->
                <div class="chat-sidebar">
                    <div class="chat-sidebar-header">
                        <div class="chat-search-wrapper">
                            <i data-feather="search" class="search-icon"></i>
                            <input type="text" id="chat-search" class="form-control-chat-search" placeholder="Cari customer...">
                        </div>
                    </div>
                    <div class="chat-customer-list-wrapper" id="customer-list">
                        <!-- Loaded dynamically via AJAX -->
                        <div class="text-center py-3 text-muted">Loading customer...</div>
                    </div>
                </div>

                <!-- Chat Window Section -->
                <div class="chat-window-container">
                    <!-- Default (No Active Chat) -->
                    <div class="chat-window-default" id="chat-default-view">
                        <div class="chat-default-content text-center">
                            <div class="chat-default-icon">
                                <i data-feather="message-square"></i>
                            </div>
                            <h5 class="font-weight-bold text-dark mt-1">PJM Chat Support</h5>
                            <p class="text-muted small">Pilih salah satu customer di daftar sebelah kiri untuk memulai percakapan</p>
                        </div>
                    </div>

                    <!-- Conversation Pane (Hidden until customer is clicked) -->
                    <div class="chat-conversation-pane d-none" id="chat-conversation-view">
                        <div class="chat-conversation-header">
                            <div class="d-flex align-items-center">
                                <div class="customer-avatar-initial" id="header-avatar">C</div>
                                <div class="ml-1">
                                    <h6 class="font-weight-bold text-dark mb-0" id="header-customer-name">-</h6>
                                    <span class="chat-status-indicator"><span class="dot-online"></span> Terhubung</span>
                                </div>
                            </div>
                        </div>

                        <!-- Messages Feed -->
                        <div class="chat-messages-feed" id="messages-container">
                            <!-- Loaded dynamically via AJAX -->
                        </div>

                        <!-- Footer Input Editor -->
                        <div class="chat-conversation-footer">
                            <form id="chat-send-form" class="w-100">
                                <div class="chat-input-wrapper">
                                    <input type="text" id="chat-input-message" class="form-control-chat-input" placeholder="Tulis balasan pesan Anda..." autocomplete="off">
                                    <button type="submit" class="btn-chat-send">
                                        <i data-feather="send"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('css')
    <style>
        /* Chat Full-Screen Layout Wrapper */
        .chat-application-wrapper {
            margin-top: -10px;
        }
        .chat-app-card {
            display: flex;
            height: calc(100vh - 170px);
            min-height: 500px;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(115, 103, 240, 0.05);
            border: 1px solid #ebe9f1;
            overflow: hidden;
        }

        /* Sidebar Section */
        .chat-sidebar {
            width: 320px;
            height: 100%;
            border-right: 1px solid #ebe9f1;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            background: #fafafc;
        }
        .chat-sidebar-header {
            padding: 16px 20px;
            background: #fff;
            border-bottom: 1px solid #ebe9f1;
        }
        .chat-search-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        .search-icon {
            position: absolute;
            left: 14px;
            color: #b9b9c3;
            width: 16px;
            height: 16px;
        }
        .form-control-chat-search {
            width: 100%;
            height: 38px;
            padding: 8px 12px 8px 40px;
            background-color: #f3f2f7;
            border: 1.5px solid transparent;
            border-radius: 20px;
            font-size: 0.9rem;
            color: #6e6b7b;
            transition: all 0.25s ease;
        }
        .form-control-chat-search:focus {
            background-color: #fff;
            border-color: #7367f0;
            box-shadow: 0 4px 10px rgba(115, 103, 240, 0.1);
            outline: none;
        }

        /* Customer List Items */
        .chat-customer-list-wrapper {
            flex-grow: 1;
            overflow-y: auto;
            padding: 10px 0;
        }
        .customer-chat-item {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }
        .customer-chat-item:hover {
            background-color: #f1effd;
        }
        .customer-chat-item.active {
            background-color: rgba(115, 103, 240, 0.08);
            border-left: 4px solid #7367f0;
        }
        
        /* Avatar Generator */
        .customer-avatar-initial {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.7));
            color: #fff;
            font-weight: 700;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 4px 10px rgba(115, 103, 240, 0.2);
        }
        .customer-avatar-initial.unread {
            box-shadow: 0 4px 10px rgba(115, 103, 240, 0.4);
            border: 2px solid #7367f0;
        }
        
        .customer-item-info {
            flex-grow: 1;
            margin-left: 12px;
            min-width: 0;
        }
        .customer-name-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2px;
        }
        .customer-name {
            font-size: 0.95rem;
            font-weight: 700;
            color: #4b4b4b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .last-message-time {
            font-size: 0.75rem;
            color: #b9b9c3;
        }
        .last-message-text {
            font-size: 0.825rem;
            color: #6e6b7b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 0;
        }
        .last-message-text.unread {
            font-weight: 700;
            color: #2b2b2b;
        }
        
        .unread-badge {
            background-color: #7367f0;
            color: #fff;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 3px 7px;
            border-radius: 10px;
            min-width: 20px;
            text-align: center;
        }

        /* Right Panel (Chat Window) */
        .chat-window-container {
            flex-grow: 1;
            height: 100%;
            display: flex;
            flex-direction: column;
            background-color: #f8f8fb;
        }

        /* Default Screen */
        .chat-window-default {
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .chat-default-icon {
            color: #7367f0;
            background: rgba(115, 103, 240, 0.1);
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 35px;
            margin: 0 auto;
        }

        /* Active Chat Pane */
        .chat-conversation-pane {
            flex-grow: 1;
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .chat-conversation-header {
            padding: 16px 24px;
            background: #fff;
            border-bottom: 1px solid #ebe9f1;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.01);
            z-index: 10;
        }
        .chat-status-indicator {
            font-size: 0.75rem;
            color: #2ed573;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        .dot-online {
            width: 8px;
            height: 8px;
            background-color: #2ed573;
            border-radius: 50%;
            display: inline-block;
            margin-right: 5px;
        }

        /* Message Scroll Feed */
        .chat-messages-feed {
            flex-grow: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            background-color: #f4f3f9;
        }
        
        /* Chat Bubble Layouts */
        .chat-message-row {
            display: flex;
            margin-bottom: 16px;
            width: 100%;
        }
        .chat-message-row.incoming {
            justify-content: flex-start;
        }
        .chat-message-row.outgoing {
            justify-content: flex-end;
        }
        
        .chat-bubble {
            max-width: 65%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 0.925rem;
            line-height: 1.45;
            position: relative;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
        }
        .chat-message-row.incoming .chat-bubble {
            background-color: #fff;
            color: #2d2d2d;
            border-bottom-left-radius: 2px;
        }
        .chat-message-row.outgoing .chat-bubble {
            background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.88));
            color: #fff;
            border-bottom-right-radius: 2px;
            box-shadow: 0 4px 12px rgba(115, 103, 240, 0.2);
        }
        
        .chat-message-time {
            font-size: 0.7rem;
            color: #b9b9c3;
            margin-top: 4px;
            display: block;
            text-align: right;
        }
        .chat-message-row.outgoing .chat-message-time {
            color: rgba(255, 255, 255, 0.7);
        }

        /* Chat Input Footer */
        .chat-conversation-footer {
            padding: 16px 24px;
            background: #fff;
            border-top: 1px solid #ebe9f1;
        }
        .chat-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        .form-control-chat-input {
            width: 100%;
            height: 46px;
            padding: 10px 60px 10px 20px;
            background-color: #f8f8fb;
            border: 1.5px solid #d8d6de;
            border-radius: 24px;
            font-size: 0.95rem;
            color: #6e6b7b;
            transition: all 0.25s ease;
        }
        .form-control-chat-input:focus {
            background-color: #fff;
            border-color: #7367f0;
            box-shadow: 0 4px 15px rgba(115, 103, 240, 0.1);
            outline: none;
        }
        .btn-chat-send {
            position: absolute;
            right: 8px;
            background: linear-gradient(118deg, #7367f0, rgba(115, 103, 240, 0.85)) !important;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff !important;
            cursor: pointer;
            box-shadow: 0 4px 10px rgba(115, 103, 240, 0.2);
            transition: all 0.2s ease;
        }
        .btn-chat-send i, .btn-chat-send svg {
            width: 14px;
            height: 14px;
            margin-left: 2px;
        }
        .btn-chat-send:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 15px rgba(115, 103, 240, 0.3);
        }
    </style>
@endpush

@push('script')
<script>
    $(document).ready(function() {
        var activeCustomerId = null;
        var customers = [];
        var pollTimer = null;

        // Fetch customer list
        function loadCustomers(selectFirst = false) {
            $.ajax({
                url: '{{ route("admin.chats.customers") }}',
                method: 'GET',
                success: function(res) {
                    if (res.success) {
                        customers = res.customers;
                        renderCustomers();
                        
                        if (selectFirst && customers.length > 0 && activeCustomerId === null) {
                            selectCustomer(customers[0].id);
                        }
                    }
                }
            });
        }

        // Render customer list in sidebar
        function renderCustomers() {
            var searchVal = $('#chat-search').val().toLowerCase();
            var html = '';

            var filtered = customers.filter(function(cust) {
                return cust.name.toLowerCase().indexOf(searchVal) > -1;
            });

            if (filtered.length === 0) {
                html = '<div class="text-center py-3 text-muted">Tidak ada customer ditemukan</div>';
            } else {
                filtered.forEach(function(cust) {
                    var isActive = (cust.id == activeCustomerId) ? 'active' : '';
                    var avatarClass = (cust.unread_count > 0) ? 'customer-avatar-initial unread' : 'customer-avatar-initial';
                    var msgClass = (cust.unread_count > 0) ? 'last-message-text unread' : 'last-message-text';
                    var badgeMarkup = (cust.unread_count > 0) ? '<span class="unread-badge">' + cust.unread_count + '</span>' : '';
                    var timeText = cust.last_message_time ? formatTime(cust.last_message_time) : '';
                    var initial = cust.name.charAt(0).toUpperCase();

                    html += '<div class="customer-chat-item ' + isActive + '" data-id="' + cust.id + '">' +
                        '    <div class="' + avatarClass + '">' + initial + '</div>' +
                        '    <div class="customer-item-info">' +
                        '        <div class="customer-name-row">' +
                        '            <span class="customer-name">' + escapeHtml(cust.name) + '</span>' +
                        '            <span class="last-message-time">' + timeText + '</span>' +
                        '        </div>' +
                        '        <div class="d-flex align-items-center justify-content-between">' +
                        '            <p class="' + msgClass + '">' + escapeHtml(cust.last_message || '-') + '</p>' +
                        '            ' + badgeMarkup + '' +
                        '        </div>' +
                        '    </div>' +
                        '</div>';
                });
            }
            $('#customer-list').html(html);
        }

        // Format Date/Time dynamically
        function formatTime(isoString) {
            var date = new Date(isoString);
            var now = new Date();
            var diffMs = now - date;
            var diffMins = Math.floor(diffMs / 60000);
            
            if (diffMins < 1) return 'Baru saja';
            if (diffMins < 60) return diffMins + ' menit lalu';
            
            var diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return diffHours + ' jam lalu';

            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        }

        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
        }

        // Filter search input
        $('#chat-search').on('input', function() {
            renderCustomers();
        });

        // Click customer thread
        $(document).on('click', '.customer-chat-item', function() {
            var id = $(this).data('id');
            selectCustomer(id);
        });

        function selectCustomer(id) {
            activeCustomerId = id;
            var cust = customers.find(function(c) { return c.id == id; });
            
            if (cust) {
                // Setup Header
                $('#header-customer-name').text(cust.name);
                $('#header-avatar').text(cust.name.charAt(0).toUpperCase());
                
                // Show Pane
                $('#chat-default-view').addClass('d-none');
                $('#chat-conversation-view').removeClass('d-none');
                
                // Highlight Sidebar
                $('.customer-chat-item').removeClass('active');
                $('.customer-chat-item[data-id="' + id + '"]').addClass('active');

                // Read thread
                markAsRead(id);

                // Fetch conversation history
                loadMessages(id, true);
            }
        }

        function loadMessages(id, scrollToEnd = false) {
            if (id !== activeCustomerId) return;

            $.ajax({
                url: '/admin/chats/' + id + '/messages',
                method: 'GET',
                success: function(res) {
                    if (res.success && id === activeCustomerId) {
                        var html = '';
                        res.messages.forEach(function(msg) {
                            var typeClass = (msg.sender_type === 'admin') ? 'outgoing' : 'incoming';
                            var time = new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                            html += '<div class="chat-message-row ' + typeClass + '">' +
                                '    <div class="chat-bubble">' +
                                '        ' + escapeHtml(msg.message) + '' +
                                '        <span class="chat-message-time">' + time + '</span>' +
                                '    </div>' +
                                '</div>';
                        });

                        $('#messages-container').html(html);

                        if (scrollToEnd) {
                            scrollChatFeed();
                        }
                    }
                }
            });
        }

        function markAsRead(id) {
            $.ajax({
                url: '/admin/chats/' + id + '/read',
                method: 'POST',
                data: { _token: $('meta[name=csrf-token]').attr('content') },
                success: function() {
                    loadCustomers(false);
                }
            });
        }

        function scrollChatFeed() {
            var container = $('#messages-container');
            container.scrollTop(container[0].scrollHeight);
        }

        // Send Message
        $('#chat-send-form').submit(function(e) {
            e.preventDefault();
            var msg = $('#chat-input-message').val().trim();
            if (!msg || activeCustomerId === null) return;

            // Clear Input
            $('#chat-input-message').val('');

            $.ajax({
                url: '/admin/chats/' + activeCustomerId + '/send',
                method: 'POST',
                data: {
                    message: msg,
                    _token: $('meta[name=csrf-token]').attr('content')
                },
                success: function(res) {
                    if (res.success) {
                        // Append immediately
                        loadMessages(activeCustomerId, true);
                        loadCustomers(false);
                    }
                }
            });
        });

        // Polling loop
        function startPolling() {
            pollTimer = setInterval(function() {
                loadCustomers(false);
                if (activeCustomerId !== null) {
                    loadMessages(activeCustomerId, false);
                }
            }, 3000);
        }

        // Initialize Module
        loadCustomers(true);
        startPolling();
    });
</script>
@endpush
