# Crumbs & Co. — motion edition

A responsive enhancement of the existing Crumbs & Co. storefront, using its cream/cocoa palette, Playfair Display typography, product catalog, cart, wishlist and routes.

The opening experience is editable in `dist/assets/hero.js` and `dist/assets/hero.css`. It is a full-viewport, infinitely looping product carousel with mouse drag, touch swipe, horizontal wheel input, keyboard controls, floating cutouts, frame-rate-independent spring glide, independent product rolling with layered depth and pointer-controlled tilt, responsive product copy and changing background tones. Clicking any product lifts it forward through an expanding background, moves it into its detail page using compositor transforms, and reveals the details in sequence. The return link reverses the shared product transition. There is also quick add to cart and a return-to-carousel link. The retained `motion.js` and `motion.css` provide the full-screen menu, reveals and theme. Reduced-motion settings are respected.

## Run or deploy

Serve `dist` with a static web server that falls back to `index.html` for client routes. For Netlify, upload the contents of `dist`; the included `_redirects` file configures this fallback. No build is required.

The existing React app is retained as a compiled bundle (`app.js` and `base.css`) because the original editable React source was not supplied. The new motion files are readable source. Product images are local copies of the existing site's images, with category-appropriate replacements for unavailable originals; the carousel cookie, Biscoff cookie, cheesecake slice and mug cake are newly generated illustrative assets. See ASSETS.md for prompts.

## Before taking real orders

The inherited storefront stores cart and wishlist state in the browser. Checkout is a demo: connect real order processing and payments before using it for sales. Verify the inherited prices, delivery promises, contact email, WhatsApp number, Instagram URL and policy text. Configure business integrations using the real source project when available.

The Sites version is private to the owner; the original Netlify deployment has not been modified.

## Sauce motion

The corrected Biscoff mug cake and fudge cheesecake assets are listed in ASSETS.md. Sauce streams, moving highlights, drips, and ripples for Biscoff stuffed cookies and chocolate fudge products are implemented in `dist/assets/sauce.js` and `sauce.css`. Animations pause outside the viewport and are hidden for reduced motion. Existing cart image snapshots are updated without changing quantities.

## Netlify and GitHub

This is a static site. Use production branch `main`, leave the build command empty, and set publish directory to `dist`. The included netlify.toml configures the publish directory, and dist/_redirects supplies the client-route fallback. Upload the clean export package to your own repository; it omits this preview site's Git history and hosting identity.

## Touch controls

On phones and tablets, swipe to glide between products and tap a product to open it. Choose **Roll this treat** to drag the selected product on both axes independently; choose **Explore carousel** to return to swiping. Horizontal swipes roll the grabbed product and settle with momentum. Vertical page scrolling stays available in explore mode. Opening and returning use an uninterrupted product zoom, a circular background reveal, and staggered content reveals without a full page load. The phone's reduced-motion preference is respected. Motion assets use versioned URLs so existing visitors receive updates.
