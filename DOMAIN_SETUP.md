# Custom Domain Setup Guide for Vercel

## Prerequisites
- Your project is already deployed to Vercel
- You own a custom domain
- Access to your domain's DNS settings

## Method 1: Via Vercel Dashboard (Recommended)

### Step 1: Access Vercel Project Settings
1. Go to https://vercel.com/dashboard
2. Select your `calla-portfolio` project
3. Click **Settings** → **Domains**

### Step 2: Add Domain
1. Click the **Add** button
2. Enter your domain name:
   - For root domain: `yourdomain.com`
   - For subdomain: `www.yourdomain.com` or `portfolio.yourdomain.com`
3. Click **Add**

### Step 3: Verify Ownership
Vercel will provide DNS records to add. You'll see instructions like:

#### For Apex/Root Domain (yourdomain.com):
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600 (or automatic)
```

#### For WWW Subdomain (www.yourdomain.com):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or automatic)
```

### Step 4: Configure DNS at Your Domain Provider

#### Popular Domain Providers:

**GoDaddy:**
1. Log in to GoDaddy
2. Go to **My Products** → **DNS**
3. Click **Manage DNS** for your domain
4. Add the A record and CNAME record from Vercel
5. Save changes

**Namecheap:**
1. Log in to Namecheap
2. Go to **Domain List** → Select your domain
3. Click **Manage** → **Advanced DNS**
4. Add records provided by Vercel
5. Save all changes

**Google Domains:**
1. Log in to Google Domains
2. Select your domain
3. Click **DNS** in the left menu
4. Scroll to **Custom resource records**
5. Add the records from Vercel
6. Save

**Cloudflare:**
1. Log in to Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Add A and CNAME records
5. **Important:** Set proxy status to "DNS only" (gray cloud icon)
6. Save

### Step 5: Set Primary Domain (Optional)
1. In Vercel Dashboard → **Domains**
2. Click the three dots next to your preferred domain
3. Select **Set as Primary Domain**
4. This will redirect all other domains to this one

### Step 6: Wait for Verification
- DNS propagation: 1-48 hours (usually 1-2 hours)
- SSL certificate: Issued automatically by Vercel
- Check status in Vercel Dashboard

---

## Method 2: Via Vercel CLI

### Install Vercel CLI
```bash
npm i -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Add Domain
```bash
vercel domains add yourdomain.com
```

### List Domains
```bash
vercel domains ls
```

### Remove Domain (if needed)
```bash
vercel domains rm yourdomain.com
```

---

## Common DNS Configurations

### Configuration 1: Root Domain Only
**Goal:** `yourdomain.com` works, `www.yourdomain.com` redirects to root

**DNS Records:**
```
A     @    76.76.21.21
CNAME www  cname.vercel-dns.com
```

**In Vercel:** Set `yourdomain.com` as primary domain

### Configuration 2: WWW Subdomain as Primary
**Goal:** `www.yourdomain.com` works, `yourdomain.com` redirects to www

**DNS Records:**
```
A     @    76.76.21.21
CNAME www  cname.vercel-dns.com
```

**In Vercel:** Set `www.yourdomain.com` as primary domain

### Configuration 3: Custom Subdomain
**Goal:** Use `portfolio.yourdomain.com`

**DNS Records:**
```
CNAME portfolio cname.vercel-dns.com
```

**In Vercel:** Add `portfolio.yourdomain.com`

---

## Troubleshooting

### DNS Not Propagating
1. Check DNS propagation status: https://dnschecker.org
2. Clear browser cache and cookies
3. Try incognito/private browsing mode
4. Flush DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns
   
   # Mac
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

### SSL Certificate Issues
- Vercel automatically issues Let's Encrypt SSL certificates
- If SSL fails, check if:
  - DNS records are correct
  - Domain is verified in Vercel
  - No CAA records blocking Let's Encrypt
- Wait 24 hours for automatic retry

### Domain Shows "Not Found"
1. Verify DNS records are correct
2. Check domain is added in Vercel Dashboard
3. Ensure project is deployed
4. Try redeploying: `vercel --prod`

### Multiple Domains Not Redirecting
1. Set one domain as "Primary" in Vercel
2. Other domains will auto-redirect to primary
3. Check redirect settings in Vercel Dashboard

### Cloudflare Specific Issues
- Set proxy status to "DNS only" (gray cloud)
- Or use Cloudflare DNS records:
  ```
  CNAME @ yourproject.vercel.app (flatten)
  CNAME www yourproject.vercel.app
  ```

---

## Update Environment Variables (If Needed)

After adding your domain, update these in your `.env.local`:

```env
# Update to your custom domain
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
SITE_URL=https://yourdomain.com
```

Then update in Vercel Dashboard:
1. **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_SITE_URL` and `SITE_URL`
3. Redeploy: `vercel --prod`

---

## Verify Setup

### Check Domain Status
1. Visit your custom domain in browser
2. Verify SSL certificate (lock icon in address bar)
3. Test www redirect (if configured)
4. Check Open Graph preview:
   - Share link on Facebook, Twitter, LinkedIn
   - Use https://metatags.io to preview

### Test All URLs
- [ ] `https://yourdomain.com` loads correctly
- [ ] `https://www.yourdomain.com` works or redirects
- [ ] SSL certificate is valid (green lock)
- [ ] All pages load correctly
- [ ] No mixed content warnings

---

## Best Practices

1. **Always use HTTPS** - Vercel provides free SSL
2. **Set primary domain** - Ensures consistent URLs
3. **Use www or non-www** - Pick one and stick with it
4. **Update sitemap** - Update sitemap.xml with new domain
5. **Update Google Search Console** - Add new domain property
6. **Update social media links** - Update all social profiles
7. **301 redirects** - Vercel handles this automatically for non-primary domains

---

## Need Help?

- Vercel Docs: https://vercel.com/docs/concepts/projects/domains
- Vercel Support: https://vercel.com/support
- DNS Checker: https://dnschecker.org
- SSL Checker: https://www.ssllabs.com/ssltest/

---

## Quick Command Reference

```bash
# Deploy to production
vercel --prod

# Add domain via CLI
vercel domains add yourdomain.com

# List all domains
vercel domains ls

# Remove domain
vercel domains rm yourdomain.com

# Check deployment status
vercel ls

# View logs
vercel logs
```
