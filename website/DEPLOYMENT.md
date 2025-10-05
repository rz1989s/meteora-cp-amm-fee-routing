# Deployment Guide

Quick guide to deploy the Meteora Fee Routing pitch website to production.

## Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications. It's free and optimized for Next.js.

### Steps:

1. **Push to GitHub** (if not already done):
   ```bash
   cd /path/to/meteora-cp-amm-fee-routing
   git add .
   git commit -m "Add pitch website"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository: `meteora-cp-amm-fee-routing`
   - Configure project:
     - **Root Directory:** `website`
     - **Framework Preset:** Next.js (auto-detected)
     - **Build Command:** `npm run build` (default)
     - **Output Directory:** `.next` (default)
   - Click "Deploy"

3. **Your site is live!**
   - Vercel will give you a URL like: `https://meteora-fee-routing.vercel.app`
   - Every push to main will auto-deploy

### Custom Domain (Optional):

In Vercel project settings:
- Go to "Settings" > "Domains"
- Add your custom domain
- Follow DNS configuration instructions

## Option 2: Netlify

### Steps:

1. **Build locally**:
   ```bash
   cd website
   npm run build
   ```

2. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign in
   - Drag and drop the `.next` folder
   - Or connect GitHub repository with these settings:
     - **Base directory:** `website`
     - **Build command:** `npm run build`
     - **Publish directory:** `.next`

## Option 3: Manual VPS Deployment

For deploying to a VPS (AWS, DigitalOcean, etc.):

### Steps:

1. **On your server**, install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone repository**:
   ```bash
   git clone https://github.com/rz1989s/meteora-cp-amm-fee-routing.git
   cd meteora-cp-amm-fee-routing/website
   ```

3. **Install dependencies and build**:
   ```bash
   npm install
   npm run build
   ```

4. **Start production server**:
   ```bash
   npm start
   ```

5. **Setup PM2 for process management** (optional but recommended):
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "meteora-website" -- start
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx as reverse proxy**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Setup SSL with Let's Encrypt**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## Testing Before Deployment

Always test the production build locally first:

```bash
cd website
npm run build
npm start
```

Then visit `http://localhost:3000` to verify everything works.

## Environment Variables

This website doesn't require any environment variables. All content is static.

## Troubleshooting

### Build fails with TypeScript errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Port 3000 already in use
```bash
# Change port in package.json or kill the process
lsof -ti:3000 | xargs kill -9
```

### Vercel deployment fails
- Check that root directory is set to `website`
- Verify Node.js version is 18.x or higher
- Check build logs for specific errors

## Performance Optimization

The website is already optimized, but you can further improve:

1. **Enable gzip compression** in your server config
2. **Add CDN** for static assets (Vercel includes this)
3. **Monitor with Vercel Analytics** (free on Vercel)

## Support

For issues or questions:
- **Twitter:** [@RZ1989sol](https://x.com/RZ1989sol)
- **GitHub Issues:** [meteora-cp-amm-fee-routing](https://github.com/rz1989s/meteora-cp-amm-fee-routing/issues)
