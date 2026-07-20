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
      { label: "Contact", href: "#contact" },
      { label: "Dribbble", href: "https://dribbble.com", external: true },
      { label: "Behance", href: "https://behance.net", external: true },
    ],
  },

  hero: {
    name: "Akshay S Dev",
    role: "Digital Designer",
    tagline:
      "I craft visual narratives that blend editorial precision with experimental edge. From brand identity to motion graphics, every pixel serves a purpose.",
    avatar: "assets/avatar.svg",
    watermark: "動",
    watermarkOpacity: 0.06,
  },

  works: {
    title: "Works",
    description:
      "A curated selection of brand, digital, and visual design projects spanning identity systems, editorial layouts, and motion experiments.",
    projects: [
      {
        id: 1,
        title: "Project 1",
        category: "Brand Identity",
        description: "Visual identity system for a contemporary art gallery",
        image: "assets/project-1.jpg",
        link: "#",
      },
      {
        id: 2,
        title: "Project 2",
        category: "Editorial",
        description: "Magazine layout and typographic system",
        image: "assets/project-2.jpg",
        link: "#",
      },
      {
        id: 3,
        title: "Project 3",
        category: "Motion",
        description: "Animated brand reveal and social content",
        image: "assets/project-3.jpg",
        link: "#",
      },
      {
        id: 4,
        title: "Project 4",
        category: "Digital",
        description: "UI design for a creative platform",
        image: "assets/project-4.jpg",
        link: "#",
      },
      {
        id: 5,
        title: "Project 5",
        category: "Packaging",
        description: "Sustainable packaging design concept",
        image: "assets/project-5.jpg",
        link: "#",
      },
    ],
    hiddenProjects: [
      { id: 6, title: "Project 6", category: "Poster", image: "assets/project-6.jpg", link: "#" },
      { id: 7, title: "Project 7", category: "Logo", image: "assets/project-7.jpg", link: "#" },
      { id: 8, title: "Project 8", category: "Web", image: "assets/project-8.jpg", link: "#" },
    ],
    loadMoreLabel: "+ photos",
  },

  testimonials: {
    title: "Testimonials",
    description: "What collaborators say about working together.",
    items: [
      {
        quote:
          "Akshay brings a rare combination of editorial restraint and bold experimentation. Every deliverable felt considered, never over-designed.",
        author: "Creative Director",
        company: "Studio North",
      },
      {
        quote:
          "His attention to typographic detail and visual hierarchy transformed our brand presence. A true craftsman of the digital medium.",
        author: "Brand Manager",
        company: "Meridian Co.",
      },
      {
        quote:
          "Working with Akshay felt like a creative partnership, not a vendor relationship. He pushes boundaries while staying on brief.",
        author: "Art Director",
        company: "Form & Field",
      },
    ],
  },

  brands: {
    title: "Brands",
    description: "Selected collaborations and client work.",
    list: [
      "Adobe", "Behance", "Meridian", "Studio North",
      "Form & Field", "Pixel Lab", "Craft Co.", "Visual Arts",
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
      { label: "LinkedIn", href: "https://linkedin.com" },
      { label: "Twitter", href: "https://twitter.com" },
      { label: "Instagram", href: "https://instagram.com" },
      { label: "Dribbble", href: "https://dribbble.com" },
      { label: "E-mail", href: "mailto:hello@akshaysdev.com" },
    ],
  },

  contact: {
    email: "hello@akshaysdev.com",
  },
};
