<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP Aktivasi Akun - {{ $appName }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f6f9;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            color: #334155;
        }
        .email-wrapper {
            width: 100%;
            background-color: #f4f6f9;
            padding: 32px 16px;
        }
        .email-card {
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            border: 1px solid #e2e8f0;
        }
        .email-header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            padding: 36px 32px;
            text-align: center;
            color: #ffffff;
        }
        .logo-img {
            max-height: 48px;
            width: auto;
            margin-bottom: 12px;
            object-fit: contain;
        }
        .brand-title {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            margin: 0;
            color: #ffffff;
            text-transform: uppercase;
        }
        .header-subtext {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.85);
            margin-top: 6px;
            font-weight: 500;
        }
        .email-body {
            padding: 36px 32px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin-top: 0;
            margin-bottom: 12px;
        }
        .body-text {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 24px;
        }
        .otp-box {
            background-color: #fff1f2;
            border: 2px dashed #fca5a5;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            margin: 28px 0;
        }
        .otp-label {
            font-size: 12px;
            font-weight: 700;
            color: #991b1b;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
        }
        .otp-code {
            font-size: 38px;
            font-weight: 900;
            color: #dc2626;
            letter-spacing: 12px;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
        }
        .otp-expiry {
            font-size: 12px;
            color: #991b1b;
            margin-top: 8px;
            font-weight: 600;
        }
        .alert-box {
            background-color: #f8fafc;
            border-left: 4px solid #dc2626;
            padding: 14px 16px;
            border-radius: 8px;
            font-size: 12.5px;
            color: #64748b;
            line-height: 1.5;
            margin-top: 24px;
        }
        .email-footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            font-size: 12px;
            color: #94a3b8;
        }
        .footer-links {
            margin-bottom: 12px;
        }
        .footer-link {
            color: #dc2626;
            text-decoration: none;
            font-weight: 600;
            margin: 0 8px;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-card">
            <!-- Header -->
            <div class="email-header">
                @if(!empty($logoUrl))
                    <img src="{{ $logoUrl }}" alt="{{ $appName }}" class="logo-img">
                @endif
                <h1 class="brand-title">{{ $appName }}</h1>
                <div class="header-subtext">Verifikasi & Aktivasi Akun Pelanggan</div>
            </div>

            <!-- Body -->
            <div class="email-body">
                <h2 class="greeting">Halo, {{ $customer->name }}! 👋</h2>
                <p class="body-text">
                    Terima kasih telah mendaftar di <strong>{{ $appName }}</strong>. Untuk menyelesaikan pembuatan akun Anda, silakan gunakan kode OTP aktivasi berikut:
                </p>

                <!-- OTP Badge Box -->
                <div class="otp-box">
                    <div class="otp-label">KODE OTP AKTIVASI AKUN</div>
                    <div class="otp-code">{{ $otpCode }}</div>
                    <div class="otp-expiry">⏱️ Berlaku selama 10 Menit</div>
                </div>

                <!-- Security Warnings -->
                <div class="alert-box">
                    🔒 <strong>Petunjuk Keamanan:</strong><br>
                    • Jangan pernah berikan kode OTP ini kepada siapa pun.<br>
                    • Batas pengiriman OTP maksimum 3x per jam.<br>
                    • Apabila salah memasukkan kode OTP 3x berturut-turut, verifikasi akan terkunci sementara selama 1 jam.
                </div>
            </div>

            <!-- Footer -->
            <div class="email-footer">
                <div class="footer-links">
                    <a href="{{ url('/') }}" class="footer-link">Situs Utama</a> |
                    <a href="mailto:support-noreply@redauto.id" class="footer-link">Pusat Bantuan</a>
                </div>
                <div>© {{ date('Y') }} {{ $appName }}. Seluruh hak cipta dilindungi undang-undang.</div>
            </div>
        </div>
    </div>
</body>
</html>
