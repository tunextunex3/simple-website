# The GeoLuxe — Static Website

Simple responsive static site scaffold for The GeoLuxe Glam Hair Salon.

Files added:
- `index.html` — main site
- `styles.css` — styles
- `scripts.js` — small interactions
- `assets/placeholder1.svg`, `assets/placeholder2.svg`, `assets/placeholder3.svg` — gallery placeholders
- `assets/README.txt` — instructions for logo

Quick start:
1. Place your real logo image at `assets/logo.png` (see `assets/README.txt`).
2. Open `index.html` in a browser to preview.

Deploy:
- GitHub Pages: push this repo and enable Pages from the `main` branch root.
- Any static host (Netlify, Vercel) works.

Customization hints:
- Edit `styles.css` to tweak colors (CSS variables at top).
- Update services and prices in `index.html`.
- Replace placeholder gallery images in `assets/` with photos.

Contact form (email sending)
- The site supports EmailJS for client-side email sending. To enable:
	1. Sign up at https://www.emailjs.com and create a `Service` and `Email Template`.
	2. In `scripts.js` replace `YOUR_SERVICE_ID`, `YOUR_TEMPLATE_ID`, and `YOUR_PUBLIC_KEY` with your EmailJS values.
	3. The contact form will attempt to send using EmailJS, and if that fails it falls back to opening the user's mail client with a prefilled message.

If you prefer a server-based send (SMTP or serverless function), replace the form handler in `scripts.js` with an AJAX call to your endpoint.
