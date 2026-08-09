<?php

namespace App\Mail;

use App\Models\Customer;
use App\Models\Setting;
use App\Services\CloudflareR2Service;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountActivationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Customer $customer;
    public string $otpCode;
    public string $appName;
    public ?string $logoUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Customer $customer, string $otpCode)
    {
        $this->customer = $customer;
        $this->otpCode = $otpCode;

        $settings = Setting::all()->pluck('value', 'key');
        $this->appName = $settings['store_name'] ?? $settings['site_name'] ?? $settings['app_name'] ?? config('app.name', 'Putri Jaya Mobil');
        
        $logo = $settings['logo_url'] ?? $settings['site_logo'] ?? $settings['logo'] ?? null;
        if ($logo) {
            if (str_starts_with($logo, 'http://') || str_starts_with($logo, 'https://')) {
                $this->logoUrl = $logo;
            } else {
                $this->logoUrl = app(CloudflareR2Service::class)->url($logo);
            }
        } else {
            $this->logoUrl = null;
        }
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Kode OTP Aktivasi Akun - {$this->appName}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.account_activation',
            with: [
                'customer' => $this->customer,
                'otpCode'  => $this->otpCode,
                'appName'  => $this->appName,
                'logoUrl'  => $this->logoUrl,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
