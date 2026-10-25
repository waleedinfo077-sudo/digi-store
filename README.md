# Digi Store

Digi Store is a static website marketplace: browse ready-made designs, explore each one in a live preview, and send an order request. It uses HTML, CSS, vanilla JavaScript, and JSON. There is no build step, database, or server-side code; publish the project root with GitHub Pages.

## Project map

```text
index.html                 Home
templates.html             Search, category filters, sorting, design cards
preview.html               Interactive iframe preview, device sizes, palettes
checkout.html              Order details and notification form
success.html               Order summary and manual payment instructions
404.html                   Custom not-found page
.nojekyll                  Disables Jekyll processing on GitHub Pages
config.js                  EDIT THIS FILE before taking real orders
categories.json            Category metadata
templates.json             All 60 design records
assets/
  css/main.css              Store styles
  css/animations.css        Shared motion and reduced-motion support
  js/app.js                 Store UI, theme toggle, home-page catalog
  js/filter.js              Browse filters, search, sort
  js/preview.js             Iframe, palette, and device controls
  js/checkout.js            Validation and email/WhatsApp order flow
  js/success.js             Order confirmation and payment instructions
  images/logo.svg
  images/favicon.svg
  images/store-workspace.webp
  images/categories/          Locally stored category photography
  images/products/            Locally stored shop product photography
templates/<category-slug>/design-<1-3>/
  index.html                Self-contained, interactive demo
  thumb.svg                 Photo-based design-card art used by catalog cards
  hero-art.svg              Original demo illustration (kept for reference)
  images/                    Original source copies of the SVG artwork
```

## Photography and image credits

The home-page hero, category cards, all 60 demo designs, and shop product cards use local WebP copies of Unsplash photography. The pages do not hotlink those photos at runtime. Source photo IDs and download settings are maintained in [`tools/prepare_stock_photos.ps1`](./tools/prepare_stock_photos.ps1); photo use follows the [Unsplash License](https://unsplash.com/license).

Expand the template branch above as follows; each listed design folder contains the three published files `index.html`, `thumb.svg`, and `hero-art.svg`, as well as local source copies under `images/`:

```text
templates/
  gym-fitness/{design-1,design-2,design-3}/
  doctors-clinics/{design-1,design-2,design-3}/
  hospitals-pharmacies/{design-1,design-2,design-3}/
  dentists/{design-1,design-2,design-3}/
  primary-schools/{design-1,design-2,design-3}/
  high-schools-academies/{design-1,design-2,design-3}/
  universities-coaching/{design-1,design-2,design-3}/
  shops-retail/{design-1,design-2,design-3}/
  ecommerce-stores/{design-1,design-2,design-3}/
  cars-showrooms/{design-1,design-2,design-3}/
  real-estate/{design-1,design-2,design-3}/
  restaurants-cafes/{design-1,design-2,design-3}/
  salons-spas-barbers/{design-1,design-2,design-3}/
  law-firms-consultants/{design-1,design-2,design-3}/
  photography-studios/{design-1,design-2,design-3}/
  hotels-travel-tours/{design-1,design-2,design-3}/
  portfolios-freelancers/{design-1,design-2,design-3}/
  construction-interior/{design-1,design-2,design-3}/
  events-weddings/{design-1,design-2,design-3}/
  agencies-startups/{design-1,design-2,design-3}/
```

For display names, filters, prices, and preview paths, see `categories.json` and `templates.json`.

## Set up order notifications

1. Open **[`config.js`](./config.js)** and replace the empty placeholders:
   - `OWNER_WHATSAPP`: country code followed by digits only, such as `923001234567`.
   - `OWNER_EMAIL`: your notification address. The email destination itself is controlled by the provider account/form.
   - `FORM_PROVIDER`: `web3forms`, `formspree`, or `none`.
   - `FORM_ACCESS_KEY`: your Web3Forms access key, or the Formspree form ID (the part after `/f/`).
   - Add payment instructions to `PAYMENT_METHODS` if you want them displayed after checkout. Add your delivery estimate and support text if needed.
2. For Web3Forms, create a free form at [web3forms.com](https://web3forms.com/), use the access key associated with the email inbox that should receive orders, then paste that key into `FORM_ACCESS_KEY`.
3. For Formspree, create a form at [formspree.io](https://formspree.io/), confirm the recipient address there, choose `formspree`, and put the form ID in `FORM_ACCESS_KEY`.
4. Keep `FORM_PROVIDER` set to `none` if you are not ready to send email. The order is still saved in the current browser and the customer can use the WhatsApp fallback.

**Security note:** GitHub Pages serves public files. Do not put private API tokens, passwords, bank login details, or Telegram bot tokens in `config.js`. Web3Forms access keys and public Formspree form IDs are intended for browser forms; use provider-side spam protection as appropriate. Telegram bot delivery is disabled because a bot token cannot be kept secret in a static site.

Orders are not paid online. Customers submit their contact details, and you arrange payment and delivery manually. Order details are saved in the browser's `localStorage` (with a `sessionStorage` fallback) so the confirmation page can display them; clearing browser storage removes that local copy.

## Publish with GitHub Pages

1. Create or sign in to a free account at [github.com](https://github.com/).
2. Create a **public** repository. Keep `index.html` at the repository root (do not upload the project inside an extra enclosing folder).
3. Upload the project files and folders. On GitHub, use **Add file → Upload files** and drag the project contents into the upload area, or use Git:

   ```bash
   git init
   git add .
   git commit -m "Add Digi Store website marketplace"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

4. In the repository, open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
5. Wait for the Pages deployment to finish. The site link appears in the Pages settings and usually follows `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`.
6. Edit `config.js`, commit/upload the changed file, and wait for Pages to redeploy.
7. Test one order with your own contact details. Confirm the provider email arrives and the WhatsApp button opens with the correct order information. Remove test data from the browser afterwards.

For local testing, serve this folder with any simple static-file server so the browser can fetch the JSON catalog. The published GitHub Pages site works without a backend.

### Common fixes

- **Cards or categories keep loading:** make sure `index.html`, `categories.json`, and `templates.json` are in the repository root, and that Pages is publishing the `main` branch root.
- **A demo image is missing:** check the image path and capitalization in the demo HTML. GitHub Pages paths are case-sensitive.
- **The preview iframe is blank:** check that the design's `previewPath` in `templates.json` matches an existing `index.html`; keep all demo assets on relative paths.
- **GitHub Pages shows a 404:** allow the first deployment to finish, confirm Pages is set to `main` and `/(root)`, and confirm `index.html` is not nested in another folder.
- **No order email arrives:** verify the provider/form ID or key, confirm the recipient with the provider, check its spam folder, and ensure `FORM_PROVIDER` matches the selected provider. Try the WhatsApp fallback if the email service is unavailable.
- **The page looks unstyled after an edit:** check the browser console for a typo in the asset path, then hard-refresh after the Pages deployment has completed.

## Add a design or category

1. Copy an existing `templates/<category-slug>/design-1/` folder and give it a new design folder name.
2. Keep the demo self-contained. Use relative asset paths and include the CSS variables `--primary`, `--secondary`, `--accent`, `--bg`, and `--text`. To support live palette changes, keep the theme `postMessage` handler from an existing demo.
3. Add local artwork in the copied `images/` folder and copy the preview art to the design folder root as `thumb.svg` and `hero-art.svg`.
4. Add one complete record to `templates.json`, with a unique `id`, category slug, name, price, `thumbnail`, and `previewPath` pointing to the copied files. Add the slug to `categories.json` if this is a new category, including its icon, description, display order, color, and sub-categories.
5. Check the new card, direct preview, palette controls, and checkout link. No store JavaScript changes or build step are needed.
6. To change a price, edit that design's `price` (and optional `oldPrice`) in `templates.json`.

The included demos use original inline/SVG artwork. No stock-photo hotlinks or third-party image services are required.
