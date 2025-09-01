# Supabase Email Configuration

## 1. Enable Email Confirmation in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **User Signups**, make sure:
   - ✅ **Enable email confirmations** is checked
   - ✅ **Enable email change confirmations** is checked
   - ✅ **Enable phone confirmations** is checked (if using phone auth)

## 2. Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Update the **Confirm signup** template:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>If you didn't sign up for this account, you can safely ignore this email.</p>
```

3. Update the **Reset password** template:

```html
<h2>Reset your password</h2>

<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>

<p>If you didn't request a password reset, you can safely ignore this email.</p>
```

## 3. Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set your **Site URL** to your production domain (e.g., `https://swims.cc`)
3. Add redirect URLs:
   - `https://swims.cc/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

## 4. Email Provider Configuration

### Option A: Use Supabase's built-in email (for testing)
- No additional configuration needed
- Limited to 3 emails per hour

### Option B: Use custom SMTP (recommended for production)
1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Configure your email provider:

**For Gmail:**
- SMTP Host: `smtp.gmail.com`
- SMTP Port: `587`
- SMTP User: `your-email@gmail.com`
- SMTP Pass: `your-app-password`
- SMTP Admin Email: `your-email@gmail.com`

**For SendGrid:**
- SMTP Host: `smtp.sendgrid.net`
- SMTP Port: `587`
- SMTP User: `apikey`
- SMTP Pass: `your-sendgrid-api-key`
- SMTP Admin Email: `your-email@domain.com`

**For Mailgun:**
- SMTP Host: `smtp.mailgun.org`
- SMTP Port: `587`
- SMTP User: `your-mailgun-smtp-username`
- SMTP Pass: `your-mailgun-smtp-password`
- SMTP Admin Email: `your-email@domain.com`

## 5. Environment Variables

Make sure these are set in your Supabase project:

```env
# In your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site URL for redirects
NEXT_PUBLIC_SITE_URL=https://swims.cc
```

## 6. Test Email Configuration

1. Try signing up with a test email
2. Check your email inbox (and spam folder)
3. Click the confirmation link
4. Try logging in

## 7. Troubleshooting

### Emails not sending:
- Check SMTP configuration
- Verify email provider credentials
- Check rate limits
- Look at Supabase logs for errors

### Emails going to spam:
- Set up SPF, DKIM, and DMARC records
- Use a reputable email provider
- Avoid spam trigger words in templates

### Confirmation links not working:
- Check Site URL configuration
- Verify redirect URLs
- Ensure HTTPS in production
- Check for typos in URLs

## 8. Production Checklist

- [ ] Email confirmations enabled
- [ ] Custom SMTP configured
- [ ] Site URL set to production domain
- [ ] Redirect URLs configured
- [ ] Email templates customized
- [ ] DNS records set up (SPF, DKIM, DMARC)
- [ ] Test signup flow works
- [ ] Test login flow works
- [ ] Test password reset works
