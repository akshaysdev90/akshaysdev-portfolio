# Akshay S Dev — Portfolio

A minimalist, editorial portfolio website for graphic & visual design work. Built to match your layout with config-driven content, live theme customization, and subtle scroll interactions.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Customization

### Content — `js/config.js`

All text, projects, testimonials, brands, skills, and links live in one file:

| Section | What to edit |
|---------|-------------|
| `theme` | Colors (accent, backgrounds, text) |
| `typography` | Font families |
| `nav` | Navigation links |
| `hero` | Name, role, tagline, watermark character |
| `works.projects` | Project cards — `image` (grid thumbnail), `images` (lightbox gallery), `link` (opens a page on click) |
| `testimonials.items` | Quote, `author`, `role`, `company`, optional `photo` (shown in the side panel) |
| `works.hiddenProjects` | Extra projects revealed by "+ photos" |
| `testimonials.items` | Client quotes |
| `brands.list` | Brand names in the marquee |
| `skills.tools` | Software icons and colors |
| `footer` | CTA, motto, social links |

### Day / Night Mode

Click the moon/sun button (bottom-right) to switch between light and dark mode. The choice persists in localStorage. Dark palette lives in `js/theme.js`.

### Images

Replace placeholder paths in `config.js`:

```
assets/avatar.jpg       → Your profile photo
assets/project-1.jpg    → Project thumbnails
```

SVG placeholders render automatically if images are missing.

## Animations

- Scroll-triggered fade-in reveals
- Hero watermark parallax
- Project card magnetic hover
- Testimonial auto-carousel with dot navigation
- Brands marquee (pauses on hover)
- "+ photos" load-more with staggered reveal

Disable all animations by setting `animation.enabled: false` in config.

## Deploy

```bash
npm run build
```

Static files output to `dist/`. Deploy to Vercel, Netlify, GitHub Pages, or any static host.

## Structure

```
├── index.html
├── css/
│   ├── variables.css    # Design tokens
│   └── styles.css       # Layout & components
├── js/
│   ├── config.js        # ← Edit this for content
│   ├── main.js          # Rendering & interactions
│   ├── animations.js    # Scroll & hover effects
│   └── theme.js         # Day / night mode toggle
└── assets/              # Your images
```
