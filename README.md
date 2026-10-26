# Maya Steel Works

A responsive company website for Maya Steel Works, Maya, Wakiso, Uganda. Built with HTML, CSS and JavaScript, with no runtime packages or third-party tracking.

## Included

- Six services from the supplied company brochure, with accurate contact numbers and opening hours.
- Industrial hero, responsive layouts, mobile navigation, section reveals and a motion pause control. System reduced-motion preferences are respected.
- Filterable product gallery with a keyboard-accessible image dialog, previous/next controls and service-specific quote links.
- Quote builder with optional measurements, quantity and project notes. Visitors review the message before opening WhatsApp and sending it themselves.
- Direct call links, WhatsApp contact links, brochure download and a general Maya area map link. An exact workshop map pin was not provided.
- Local fonts and compressed WebP imagery, metadata, LocalBusiness structured data and a 404 page.

## Local development

Requires Node.js 22 or newer. There are no packages to install.

```sh
npm run dev
npm run check
npm run build
```

The development server serves `public/` on port 3000 (or `PORT`). Production output is in `dist/`. The development-only `/__qa/mobile?width=390` route embeds the page at a selected width for responsive inspection; it is not part of the published output.

## Vercel

Import `lumuxav/maya-website` into the intended Vercel account or team. The committed `vercel.json` selects **Other**, runs `npm run build` and publishes `dist`. No environment variables, database or API keys are required.

This is a commercial website. Use a Vercel plan that permits commercial use. No Vercel deployment, subscription purchase or custom domain registration is included in this repository creation.

Once a final domain is chosen, add an absolute canonical URL, absolute social preview image URL and sitemap for that domain.

## Enquiries and privacy

The quote form does not submit to a server or send messages automatically. It builds an encoded WhatsApp link addressed to **+256 757 742 177**. The visitor reviews the message and explicitly opens WhatsApp, then sends it there. Form values are held in page memory only and are not saved in browser storage. WhatsApp and map links are external services with their own policies. No email destination was provided, so the website does not pretend to send email.

## Content and assets

- The business text, six product images and downloadable PDF come from the supplied `MAYA_STEEL_WORKS (1).pdf`.
- Product images are presented as brochure examples, without invented customer names, testimonials, project histories, prices or years of operation.
- The `public/assets/cnc-hero.webp` and `cnc-hero-small.webp` backgrounds were created with the built-in image-generation tool and compressed for the web. They are illustrative; a visible footer note identifies them accordingly. They do not claim to depict the actual workshop.
- Hero prompt: “Wide editorial industrial photograph of a CNC plasma cutting head cutting an intricate geometric pattern through dark steel, realistic fine orange sparks on the right, graphite metal texture, low oblique perspective, dark negative space on the left for white headings, believable workshop lighting, no people, text, logos or watermark.”
- Barlow Condensed and Manrope are self-hosted Google Fonts. Their OFL license notices are included under `public/assets/fonts/`.
- The geometric M monogram is a website graphic. It can be replaced with the company's official logo when supplied.

Update content in `public/index.html`, presentation in `public/styles.css`, and interactions in `public/app.js`. Update all three contact numbers and WhatsApp destinations together if business details change.

