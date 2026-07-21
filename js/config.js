/**
 * Portfolio Configuration
 * Edit this file to customize every aspect of your portfolio.
 * Changes apply instantly on page reload.
 */
export const config = {
  meta: {
    title: "Akshay S Dev — Digital Designer",
    description: "Graphic & visual designer portfolio. Experiments first. Ego later.",
    author: "Akshay S Dev",
    year: 2026,
  },

  theme: {
    accent: "#E8341A",
    accentHover: "#C42A14",
    bgPrimary: "#FFFFFF",
    bgSecondary: "#F2F2F2",
    bgDark: "#1A1A1A",
    textPrimary: "#1A1A1A",
    textSecondary: "#6B6B6B",
    textMuted: "#999999",
    textOnDark: "#FFFFFF",
    border: "#E0E0E0",
    cardOverlay: "rgba(26, 26, 26, 0.85)",
  },

  typography: {
    fontHeading: "'Cormorant Garamond', Georgia, serif",
    fontBody: "'Source Serif 4', Georgia, serif",
    fontDisplay: "'Cormorant Garamond', Georgia, serif",
  },

  animation: {
    enabled: true,
    revealDuration: 800,
    revealEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    parallaxStrength: 0.15,
    hoverScale: 1.03,
  },

  nav: {
    logo: "Akshay S Dev",
    links: [
      { label: "Work", href: "#works" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/akshay-s-dev-4470a3165/", external: true },
      { label: "Dribbble", href: "https://dribbble.com/akshaysdev90", external: true },
      { label: "Resume", href: "assets/resume.pdf", download: "Akshay-S-Dev-Resume.pdf" },
    ],
  },

  hero: {
    name: "Akshay S Dev",
    role: "Digital Designer",
    tagline:
      "Not just a designer — a director. 4 years turning static brands into digital experiences. I build brand systems and then bring them to life in motion, with the eye of someone directing a scene, not just laying out a grid.",
    avatar: "assets/avatar.svg",
    watermark: "",
    watermarkOpacity: 0.06,
    // Hero tiger wow factors:
    // materialize = first-load particle assemble, stare = max tilt in degrees,
    // particles = dust count (trail densifies near cursor).
    tiger: {
      enabled: true,
      image: "assets/tiger.png",
      strength: 0.3,
      stare: 7,
      materializeMs: 2400,
      particles: 160,
    },
  },

  works: {
    title: "Works",
    description:
      "A curated selection of brand, digital, and visual design projects spanning identity systems, editorial layouts, and motion experiments.",
    // HOW TO ADD A PROJECT:
    //   image:  thumbnail shown in the grid (drop the file in assets/)
    //   images: optional gallery — opens in the lightbox on click
    //   link:   optional URL (Behance, Dribbble, case study page...) —
    //           when set, clicking the card opens this page instead
    projects: [
      {
        id: 1,
        title: "Project 1",
        category: "Brand Identity",
        description: "Visual identity system for a contemporary art gallery",
        image: "assets/project-1.jpg",
        images: [],
        link: "",
      },
      {
        id: 2,
        title: "Project 2",
        category: "Editorial",
        description: "Magazine layout and typographic system",
        image: "assets/project-2.jpg",
        link: "",
      },
      {
        id: 3,
        title: "Project 3",
        category: "Motion",
        description: "Animated brand reveal and social content",
        image: "assets/project-3.jpg",
        link: "",
      },
      {
        id: 4,
        title: "Project 4",
        category: "Digital",
        description: "UI design for a creative platform",
        image: "assets/project-4.jpg",
        link: "",
      },
      {
        id: 5,
        title: "Project 5",
        category: "Packaging",
        description: "Sustainable packaging design concept",
        image: "assets/project-5.jpg",
        link: "",
      },
    ],
    hiddenProjects: [
      { id: 6, title: "Project 6", category: "Poster", image: "assets/project-6.jpg", link: "" },
      { id: 7, title: "Project 7", category: "Logo", image: "assets/project-7.jpg", link: "" },
      { id: 8, title: "Project 8", category: "Web", image: "assets/project-8.jpg", link: "" },
    ],
    loadMoreLabel: "+ photos",
  },

  testimonials: {
    title: "Testimonials",
    description: "What collaborators say about working together.",
    // Each item: quote, role (designation), company,
    // and optional photo (shown in the side panel; accent color if omitted).
    items: [
      {
        quote:
          "Akshay brings a rare combination of editorial restraint and bold experimentation. Every deliverable felt considered, never over-designed.",
        role: "Creative Director",
        company: "Studio North",
        photo: "",
      },
      {
        quote:
          "His attention to typographic detail and visual hierarchy transformed our brand presence. A true craftsman of the digital medium.",
        role: "Brand Manager",
        company: "Meridian Co.",
        photo: "",
      },
      {
        quote:
          "Working with Akshay felt like a creative partnership, not a vendor relationship. He pushes boundaries while staying on brief.",
        role: "Art Director",
        company: "Form & Field",
        photo: "",
      },
    ],
  },

  brands: {
    title: "Brands",
    description: "Selected collaborations and client work.",
    // Official logos in a parallax grid — swap logo paths anytime.
    // scale = optical size relative to wordmarks (square marks need > 1).
    list: [
      { name: "Dorling Kindersley", logo: "assets/brands/dk.svg", scale: 1.5 },
      { name: "BCG", logo: "assets/brands/bcg.svg?v=2", scale: 2.05 },
      { name: "McCain", logo: "assets/brands/mccain.svg?v=2", scale: 1.15 },
      { name: "Light & Wonder", logo: "assets/brands/lightwonder.svg", scale: 1.1 },
      { name: "Accenture", logo: "assets/brands/accenture.svg", scale: 1.08 },
      { name: "OakNorth", logo: "assets/brands/oaknorth.png?v=4", scale: 1.1 },
      { name: "Chegg", logo: "assets/brands/chegg.svg", scale: 1.12 },
      { name: "Terumo", logo: "assets/brands/terumo.svg", scale: 1.08 },
    ],
  },

  skills: {
    title: "Software & Skills",
    description: "Tools and technologies I work with daily.",
    headline: "Industry best software & tech knowledge stack.",
    tools: [
      { name: "After Effects", logo: "assets/icons/aftereffects.png" },
      { name: "Photoshop", logo: "assets/icons/photoshop.png" },
      { name: "Illustrator", logo: "assets/icons/illustrator.png" },
      { name: "WordPress", logo: "assets/icons/wordpress.png" },
      { name: "PowerPoint", logo: "assets/icons/powerpoint.png" },
      { name: "Blender", logo: "assets/icons/blender.png" },
      { name: "Procreate", logo: "assets/icons/procreate.png" },
      { name: "Figma", logo: "assets/icons/figma.png" },
      { name: "InDesign", logo: "assets/icons/indesign.png" },
      { name: "Google Slides", logo: "assets/icons/googleslides.png" },
      { name: "Claude", logo: "assets/icons/claude.png" },
      { name: "Gemini", logo: "assets/icons/gemini.png" },
      { name: "ChatGPT", logo: "assets/icons/chatgpt.png" },
      { name: "Weave", logo: "assets/icons/weave.png" },
      { name: "Higgsfield", logo: "assets/icons/higgsfield.png" },
      { name: "Canva", logo: "assets/icons/canva.png" },
      { name: "DaVinci Resolve", logo: "assets/icons/davinci.png" },
      { name: "Adobe Firefly", logo: "assets/icons/firefly.png" },
      { name: "Affinity", logo: "assets/icons/affinity.png" },
      { name: "Wix", logo: "assets/icons/wix.png" },
      { name: "Framer", logo: "assets/icons/framer.png" },
      { name: "Cursor", logo: "assets/icons/cursor.png" },
    ],
    scrollSpeed: 45,
    visibleCount: 5,
    maxTileSize: 55,
    categories: [
      "Brand Identity", "Editorial Design", "Motion Graphics",
      "UI/UX Design", "Typography", "Art Direction",
    ],
  },

  footer: {
    cta: "In search for just a designer? We may not vibe!",
    motto: "Experiments first. Ego later.",
    name: "Akshay S Dev",
    copyright: "Design & Developed by Akshay S Dev",
    links: [
      { label: "Adobe", href: "https://behance.net" },
      { label: "Behance", href: "https://behance.net" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/akshay-s-dev-4470a3165/" },
      { label: "Twitter", href: "https://twitter.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Dribbble", href: "https://dribbble.com/akshaysdev90" },
      { label: "E-mail", href: "mailto:hello@akshaysdev.com" },
    ],
  },

  contact: {
    email: "hello@akshaysdev.com",
  },
};
