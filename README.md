# ![Ripper Stream](https://i.ibb.co/qrXNkyH/streaming-screenshot-1-2023-12-04.jpg)

## 🔗 Links
- **[Demo](https://fossa.tv)**
- **[Discord](https://discord.com/invite/8tQsDUyqu2)**
- **[git.cdak.ws](https://git.cdak.ws)**

## 🖥️ Requirements
- Static Web Hosting - Example: **[Jink](https://clients.jink.host/link.php?id=5)**
- Computer with Windows, Linux or MacOS.
- Common sense.

## 📂 Download

1. Install Git on your system if you haven't already.
2. Run `git clone https://git.cdak.ws/cdak/Stream.git`

## 🔧 Setup
1. Install Node.js if you haven't already from [nodejs.org](https://nodejs.org)
2. Download the script using instructions above.
3. Open a terminal in the script directory.
4. Run `npm install` to install dependencies, then `npm run dev` to start the dev server.
5. Open `http://localhost:5173` in your browser.
6. **(Optional)** Change the site logo by replacing `/public/logo.png` with your own logo.
7. **(Optional)** Change the site icon by replacing `/public/icon.png` with your own icon, use a square (1:1) image for best results.
8. **(Optional)** Change the site name by replacing `Ripper+` in `/.env` and `/index.html`.
9. **(Optional)** Add any advertisement codes in `/index.html` (Like [Adsterra](https://beta.publishers.adsterra.com/referral/fMYMsgM7NM))
10. Run `npm run build` in the terminal to build the production files
11. Upload the contents of the `/dist` folder to production. (**Jink**, Netlify, etc.)
12. Configure your webserver to work with SPA. If you use nginx, add this in your server block or vhost

```nginx
location / {
   try_files $uri $uri/ /index.html;
}
```
Otherwise, create a .htaccess file in the root directory and add 

```
RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

[![Adsterra](https://landings-cdn.adsterratech.com/referralBanners/gif/468x60_adsterra_reff.gif)](https://beta.publishers.adsterra.com/referral/fMYMsgM7NM)