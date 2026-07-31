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
    textSecondary: "#5C5C5C",
    textMuted: "#6B6B6B",
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
      {
        label: "Resume",
        href: "assets/resume.pdf",
        download: "Akshay-S-Dev-Resume.pdf",
        primary: true,
      },
    ],
  },

  hero: {
    name: "Akshay S Dev",
    role: "Digital Designer",
    tagline:
      "Not just a designer — a director. 4 years turning static brands into digital experiences. I build brand systems and then bring them to life in motion, with the eye of someone directing a scene, not just laying out a grid.",
    cta: { label: "Selected work", href: "#works" },
    avatar: "assets/avatar.jpg",
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
    // Location-based climate overlay on the hero only.
    // force: null | "clear" | "cloudy" | "fog" | "drizzle" | "rain" | "snow" | "storm"
    // defaultCoords: last-resort lat/lon when GPS + IP both fail
    weather: {
      enabled: true,
      force: null,
      defaultCoords: null,
    },
  },

  works: {
    title: "Works",
    description:
      "A curated selection of brand, digital, and visual design projects spanning identity systems, editorial layouts, and motion experiments.",
    /*
     * ═══════════════════════════════════════════════════════════
     *  HOW TO ADD / EDIT A PROJECT (easy template)
     * ═══════════════════════════════════════════════════════════
     *
     *  1. Drop images in /assets/ (e.g. assets/projects/my-project/)
     *  2. Copy a project object below and fill the fields
     *  3. Open project → shows the full case study viewer
     *
     *  Reel card fields:
     *    title, category, description, image  → preview in Works
     *    link  → if set to a real URL, opens that instead of the viewer
     *
     *  caseStudy (the full project page):
     *    about     → left column story / what the project is
     *    role, duration, roleType, team, year, client → right column facts
     *    cover     → big banner between title and overview (also Works reel thumb)
     *    sections[] — add as many as you want, each with:
     *      title   → section heading (optional)
     *      text    → intro paragraph(s). Use \n\n for new paragraphs
     *      points  → bullet list: ["item"] or [{ title, text }]
     *      stats   → side metrics: [{ value, label, text }]
     *      images  → ["path.jpg"] or [{ src, caption }]
     *
     *  Tip: leave caseStudy out and the viewer still opens with
     *  your cover image + description as a simple project page.
     */
    projects: [
      {
        id: 1,
        title: "Project 1",
        category: "Branding",
        description: "Brand identity system and visual language",
        image: "assets/project-1.jpg",
        link: "",
        caseStudy: {
          year: "2024",
          role: "Brand Designer",
          client: "Studio sample",
          cover: "assets/project-1.jpg",
          intro:
            "A full brand identity built from a single mark — type, color, and applications designed to feel editorial and confident.",
          sections: [
            {
              title: "The challenge",
              text: "The brand needed a system that could move from print to digital without losing warmth.\n\nWe started with constraints: one accent, two type families, and a mark that works at 16px.",
              images: ["assets/project-1.jpg"],
            },
            {
              title: "Process",
              text: "Sketches → digital mark → type pairing → applications. Each step cut noise until the voice felt inevitable.",
              images: ["assets/project-1.jpg", "assets/project-1.jpg"],
            },
            {
              title: "Outcome",
              text: "A compact identity kit: logo suite, color tokens, and sample layouts ready for real use.",
              images: [],
            },
          ],
        },
      },
      {
        id: 2,
        title: "Brush, byte & Beyond Magazine",
        category: "Editorial",
        description: "Editorial monograph on Asian art & culture — layout and cover system",
        image: "assets/projects/project-2-cover.jpg?v=153",
        imagePosition: "center center",
        link: "",
        caseStudy: {
          year: "2024",
          role: "Editorial Designer",
          client: "",
          cover: "assets/projects/project-2-cover.jpg?v=153",
          coverPosition: "center center",
          about:
            "Brush, byte & Beyond is an editorial monograph exploring the evolution of Asian art and culture — from ancient civilizations to the age of artificial intelligence. The system prioritizes hierarchy, rhythm, and readable long-form pages.",
          sections: [
            {
              title: "Final Layouting n Looks",
              text: "Issue 01 settles into a quiet grid — generous margins, clear hierarchy, and spreads that let type and image breathe.",
              images: [
                {
                  src: "assets/projects/project-2-contents.jpg?v=154",
                  caption: "Cover with contents spread",
                  aspect: "auto",
                  span: "full",
                },
                {
                  src: "assets/projects/project-2-spread-01.jpg?v=154",
                  caption: "Opening feature — The Ancient Foundation",
                  aspect: "auto",
                  span: "full",
                },
                {
                  src: "assets/projects/project-2-spread-02.jpg?v=154",
                  caption: "Interior pages 02–03",
                  aspect: "auto",
                  span: "full",
                },
                {
                  src: "assets/projects/project-2-handheld.jpg?v=154",
                  caption: "Cover in hand",
                  aspect: "auto",
                  size: "md",
                },
              ],
            },
          ],
        },
      },
      {
        id: 3,
        title: "BeatRoute Saas Video Design",
        category: "Motion",
        description: "SaaS explainer video — art direction and storyboard",
        image: "assets/projects/project-3-cover.jpg?v=141",
        imagePosition: "left center",
        link: "",
        caseStudy: {
          year: "2026",
          role: "Art Direction, Storyboard Artist, Graphic Designer",
          team: "Akshay S Dev, Anil, Sandipa Halder",
          client: "",
          cover: "assets/projects/project-3-cover.jpg?v=141",
          coverPosition: "left center",
          about:
            "BeatRoute is the world's only Goal-Driven AI platform for retail sales and distribution — an enterprise-grade, scalable system that uses Goal-Driven AI to deliver measurable business impact for brands across their retail sales and distribution channels.\n\nWorldwide, retail and distribution businesses in FMCG, consumer goods, and building materials often face a difficult choice: invest in risky, costly custom development, or settle for tools that fall short. BeatRoute addresses this with a ready-to-deploy enterprise SaaS AI solution.\n\nToday, BeatRoute serves 200+ enterprise brands across 20+ countries, with 100K+ users in India, South Asia, and Africa spanning 10 industry verticals.",
          downloads: [
            {
              label: "Download storyboard page 1",
              href: "assets/projects/BeatRoute-Africa-Storyboard-Page-1.jpg",
              download: "BeatRoute-Africa-Storyboard-Page-1.jpg",
            },
            {
              label: "Download storyboard page 2",
              href: "assets/projects/BeatRoute-Africa-Storyboard-Page-2.jpg",
              download: "BeatRoute-Africa-Storyboard-Page-2.jpg",
            },
          ],
          sections: [
            {
              title: "Problem",
              text: "For years, BeatRoute lacked a dedicated brand promo it could share with stakeholders, new clients, and marketing teams. Whenever the design team proposed one, the work stalled without clear art direction — and the ideas never reached production. When I joined the team the previous year, closing that gap became a major priority.",
              images: [],
            },
            {
              title: "Behind the Scene",
              text: "The following is the approved final storyboard, finalized through three iterative review cycles before being handed to the motion designer. The preparation process involved supplying hand-drawn rough sketches alongside a detailed, screen-by-screen breakdown to Claude, ensuring precise alignment between the creative intent and the production-ready storyboard — minimizing miscommunication during handoff.",
              galleryLayout: "pager",
              images: [
                {
                  src: "assets/projects/BeatRoute-Africa-Storyboard-Page-1.jpg?v=138",
                  caption: "Storyboard sheet — page 1 of 2 (frames 01–04)",
                  download: "BeatRoute-Africa-Storyboard-Page-1.jpg",
                },
                {
                  src: "assets/projects/BeatRoute-Africa-Storyboard-Page-2.jpg?v=138",
                  caption: "Storyboard sheet — page 2 of 2 (frames 05–08)",
                  download: "BeatRoute-Africa-Storyboard-Page-2.jpg",
                },
              ],
            },
            {
              title: "Final Result",
              text: "",
              video: {
                src: "https://www.youtube.com/watch?v=NMo1RHhN5sc",
                caption: "BeatRoute Africa explainer",
              },
            },
            {
              title: "Takeaway",
              text: "After introducing the SaaS video explainer, BeatRoute saw clear gains in sales performance, brand presence, and pipeline quality across digital channels.",
              stats: [
                {
                  value: "60%",
                  label: "Sales growth",
                  text: "Increase in software sales following the explainer launch.",
                },
                {
                  value: "70%",
                  label: "Brand visibility",
                  text: "Rise in brand visibility across digital platforms.",
                },
                {
                  value: "24%",
                  label: "Lead growth",
                  text: "Quarterly increase in lead count after release.",
                },
              ],
              images: [],
            },
          ],
        },
      },
      {
        id: 4,
        title: "In Love",
        category: "Typography",
        description: "A font inspired by love",
        image: "assets/projects/project-4-cover.jpg",
        link: "",
        caseStudy: {
          year: "2026",
          role: "Type Designer",
          client: "",
          cover: "assets/projects/project-4-cover.jpg",
          about: "A font inspired by love.",
          downloads: [
            {
              label: "Download In Love (.otf)",
              href: "assets/fonts/In-Love.otf",
              download: "In-Love.otf",
            },
          ],
          sections: [
            {
              title: "Character Display Sheet",
              text: "",
              images: [
                {
                  src: "assets/projects/project-4-charset.jpg?v=126",
                  caption: "Full character set — uppercase, lowercase, figures, and punctuation",
                  aspect: "auto",
                  span: "full",
                },
              ],
            },
            {
              title: "Final Display",
              text: "",
              images: [
                {
                  src: "assets/projects/project-4-poster.jpg?v=127",
                  caption: "Editorial poster",
                  aspect: "auto",
                },
                {
                  src: "assets/projects/project-4-can.jpg?v=127",
                  caption: "Packaging application",
                  aspect: "auto",
                },
                {
                  src: "assets/projects/project-4-sign.jpg?v=127",
                  caption: "Outdoor signage",
                  aspect: "auto",
                },
                {
                  src: "assets/projects/project-4-tote.jpg?v=127",
                  caption: "Merchandise",
                  aspect: "auto",
                },
              ],
            },
          ],
        },
      },
      {
        id: 5,
        title: "Club Noize",
        category: "Logo",
        description: "Nightlife brand identity for Gen Z and young millennials",
        image: "assets/projects/project-5-cover.png",
        link: "",
        caseStudy: {
          year: "2026",
          role: "Logo Designer",
          client: "",
          cover: "assets/projects/project-5-cover.png",
          about:
            "A nightlife/social club targeting Gen Z and young millennials, built around three pillars: music/dance, connection, and self-expression.",
          sections: [
            {
              title: "Target audience",
              text: "18–28 year-olds who see going out as identity and community, not just entertainment. Digital-native, values authenticity over polish, active on Instagram/TikTok.",
              images: [],
            },
            {
              title: "Brand personality",
              text: "Energetic, inclusive, a little rebellious — more \"collective\" than \"venue.\" Should feel like a scene, not a business.",
              images: [],
            },
            {
              title: "Logo Conceptualisation",
              text: "The design process began with a clear intention: the logo needed to embody the vibe and culture of the space through its form alone. My starting point was the idea of noise — energetic, contemporary, and youthful. This led me to the phrase \"We had a blast!\", a popular Gen Z expression that captured exactly the tone I was after.\n\nThe word \"Blast\" became my anchor. Artistically, it evoked fun, controlled chaos, and energetic noise — qualities I wanted the mark to communicate instantly. My first exploration translated this into an abstract crown form, but it didn't fully deliver on that intent.\n\nReturning to the brainstorming stage, I developed the concept further by treating each letter of \"NOIZE\" as an individual arm-like element, which became the structural foundation of the logo. This gave the mark more energy and identity, but it still felt incomplete.\n\nTo ground the concept and reflect the idea of space, I introduced a house silhouette nested within the \"blast\" form — tying the energetic exterior to a sense of place and belonging. From there, the design went through several rounds of iteration and simplification, refining proportions and details until it resolved into the final logo.",
              images: [
                {
                  src: "assets/projects/project-5-concepts.jpg?v=116",
                  caption: "Early mark explorations — twelve directions around noise, blast, and nightlife energy",
                },
              ],
            },
            {
              title: "Final Result",
              text: "",
              galleryLayout: "mosaic",
              images: [
                {
                  src: "assets/projects/project-5-logo.jpg?v=119",
                  caption: "Primary mark",
                  presentation: "mark",
                  col: 1,
                  row: 1,
                },
                {
                  src: "assets/projects/project-5-access.jpg?v=117",
                  caption: "Access card",
                  aspect: "auto",
                  col: 2,
                  row: 1,
                  rowSpan: 2,
                },
                {
                  src: "assets/projects/project-5-cards.jpg?v=117",
                  caption: "Business cards",
                  aspect: "auto",
                  col: 1,
                  row: 2,
                },
                {
                  src: "assets/projects/project-5-final.jpg?v=117",
                  caption: "In context",
                  aspect: "cover",
                  col: 1,
                  row: 3,
                },
                {
                  src: "assets/projects/project-5-icon.jpg?v=117",
                  caption: "App icon",
                  aspect: "auto",
                  col: 2,
                  row: 3,
                },
              ],
            },
          ],
        },
      },
      {
        id: 6,
        title: "Project 6",
        category: "Packaging",
        description: "Sustainable packaging design concept",
        image: "assets/project-6.jpg",
        link: "",
        caseStudy: {
          year: "2022",
          role: "Packaging Designer",
          client: "",
          cover: "assets/project-6.jpg",
          intro: "Packaging that feels tactile, honest, and easy to produce.",
          sections: [
            {
              title: "Overview",
              text: "Add packaging story and dielines here.",
              images: ["assets/project-6.jpg"],
            },
          ],
        },
      },
      {
        id: 7,
        title: "Docze App: The Doctor Appointment App",
        category: "UI Design",
        description: "Interface design for a digital product",
        image: "assets/projects/project-7-cover.png",
        link: "",
        caseStudy: {
          year: "2025",
          role: "UI Designer",
          duration: "DEC 2024 - JAN 2025 (2 months)",
          roleType: "Part-Time",
          team: "Shivam Pandey, Akshay S Dev, Bhuphendra Rana, Jitendra Kirar",
          client: "",
          cover: "assets/projects/project-7-cover.png",
          about:
            "Docze is a doctor appointment app based in Luxembourg, designed to address the inefficiencies in healthcare accessibility. By connecting patients with medical professionals through a streamlined platform, Docze simplifies the process of finding, scheduling, and managing healthcare appointments.",
          sections: [
            {
              title: "Objective",
              text: "Patients in Luxembourg faced challenges in booking doctor appointments. These hurdles often led to delays in receiving timely medical care.",
              points: [
                "Limited visibility into doctor availability",
                "Long waiting times for appointments",
                "No centralized platform for healthcare scheduling",
              ],
              images: [],
            },
            {
              title: "The Solution",
              text: "Docze provides a comprehensive, user-friendly app that bridges the gap between patients and healthcare providers. The platform offers:",
              points: [
                {
                  title: "Real-Time Availability",
                  text: "Patients can view and book available slots instantly.",
                },
                {
                  title: "Doctor Profiles",
                  text: "Detailed profiles with qualifications, specialities, and reviews.",
                },
                {
                  title: "Appointment Management",
                  text: "Easy rescheduling and cancellation options.",
                },
                {
                  title: "Reminders & Notifications",
                  text: "Automated alerts to reduce no-shows and ensure timely visits.",
                },
              ],
              images: [
                {
                  src: "assets/projects/project-7-home.png",
                  caption: "Home — booking, specialties, nearby doctors",
                },
                {
                  src: "assets/projects/project-7-find-doctor.png",
                  caption: "Find Doctor — location-aware discovery",
                },
              ],
            },
            {
              title: "Results",
              text: "Since its launch, Docze has achieved measurable improvements for patients and clinics alike.",
              stats: [
                {
                  value: "40%",
                  label: "Faster scheduling",
                  text: "Reduction in appointment scheduling time for patients and doctors.",
                },
                {
                  value: "90%",
                  label: "Positive experiences",
                  text: "Users reported a positive experience with the app.",
                },
                {
                  value: "↓",
                  label: "Fewer no-shows",
                  text: "Clinics saw better schedule management and fewer missed visits.",
                },
              ],
              images: [],
            },
            {
              title: "Key Takeaways",
              text: "Docze’s success highlights the importance of user-centred design and technological innovation in solving real-world problems. By addressing accessibility and efficiency, Docze has redefined healthcare management in Luxembourg.",
              images: [],
            },
          ],
        },
      },
    ],
    hiddenProjects: [],
    loadMoreLabel: "+ photos",
  },

  fortune: {
    idleLabel: "Click the machine to draw a fortune",
    spinLabel: "Drawing your fortune…",
    readyLabel: "Your fortune is ready",
    // Optional custom slips are drawn first (no repeats), then the 1e15 generative library.
    fortunes: [],
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
      { label: "Contact me", href: "mailto:akshaysdev90@gmail.com", primary: true },
      {
        label: "Resume",
        href: "assets/resume.pdf",
        download: "Akshay-S-Dev-Resume.pdf",
        primary: true,
      },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/akshay-s-dev-4470a3165/" },
      { label: "Dribbble", href: "https://dribbble.com/akshaysdev90" },
      { label: "Instagram", href: "https://www.instagram.com/akshay.s.dev/" },
      { label: "X", href: "https://x.com/AkshaySDev4" },
    ],
  },

  contact: {
    email: "akshaysdev90@gmail.com",
  },
};
