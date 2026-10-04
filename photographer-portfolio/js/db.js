/**
 * Complete Data Storage & State Management Engine (CMS Engine)
 * Now integrated with Supabase (Database + Storage)
 */

const SUPABASE_URL = 'https://fvbxugxsdaucfnhfijsd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qlQ46sk9hN568EjinQpx5g_qkFCqOKw';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initial Complete Default CMS Data
const INITIAL_DATA = {
  branding: {
    monogram: "MA",
    name: "Mohamed Ali",
    title: "Filmmaker & Director of Photography",
    footerCopy: "Filmmaker & Director of Photography © 2026"
  },
  hero: {
    badge: "Cinematic Filmmaking & Professional Photography",
    headlineStart: "Transforming Vision into",
    headlineGradient: "Cinematic Frames",
    headlineEnd: "That Live Forever",
    subtitle: "Director of photography, commercial filmmaker, and visual artist specializing in brand commercials and dramatic fashion imagery. Obsessed with natural light, deliberate camera motion, and compelling visual narratives.",
    ctaPortfolioText: "Explore Works",
    ctaContactText: "Get in Touch"
  },
  about: {
    badge: "About The Artist",
    title: "Visual Passion Turned into Unforgettable Stories",
    paragraph1: "Hello, I'm Mohamed Ali, a filmmaker, director of photography, and visual artist. I specialize in directing and filming commercials, high-end fashion campaigns, and editorial sessions with unmatched aesthetic fidelity.",
    paragraph2: "I believe that every frame has a voice and every composition tells a story. From subtle natural lighting to dynamic camera movements, my focus is always on capturing genuine emotions and cinematic elegance that resonate long after the screen dims.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    imageTag: "Director of Photography",
    availability: "Open for Bookings & Collaborations"
  },
  contact: {
    badge: "Direct Channels",
    title: "Let's Create Together",
    subtitle: "Whether you're planning a commercial production, private photoshoot, or brand campaign, connect directly via any channel below:",
    phone: "+20 100 123 4567",
    phoneRaw: "+201001234567",
    whatsapp: "201001234567",
    email: "contact@mohamedalifilms.com",
    location: "Cairo, Egypt (Available Worldwide)",
    floatingWhatsapp: true,
    floatingWhatsappTooltip: "Chat with Mohamed Ali",
    socials: {
      instagram: "https://instagram.com/mohamedali.films",
      youtube: "https://youtube.com/@mohamedalifilms",
      vimeo: "https://vimeo.com/mohamedalifilms",
      behance: "https://behance.net/mohamedalifilms"
    },
    bookingFormTitle: "Book a Shoot or Project",
    bookingFormSubtitle: "Fill out your details below and Mohamed Ali will get back to you promptly."
  },
  categories: [
    { id: "commercial", name: "Commercial" },
    { id: "fashion", name: "Fashion" }
  ],
  projects: []
};

// Database Manager
const DB = {
  dataCache: null,

  // Sync state with Supabase
  init: async function() {
    try {
      const { data, error } = await supabase
        .from('portfolio_data')
        .select('content')
        .eq('id', 'cms_state')
        .single();
        
      if (data && data.content && Object.keys(data.content).length > 0) {
        const parsed = data.content;
        this.dataCache = {
          branding: { ...INITIAL_DATA.branding, ...(parsed.branding || {}) },
          hero: { ...INITIAL_DATA.hero, ...(parsed.hero || {}) },
          about: { ...INITIAL_DATA.about, ...(parsed.about || {}) },
          contact: {
            ...INITIAL_DATA.contact,
            ...(parsed.contact || {}),
            socials: { ...INITIAL_DATA.contact.socials, ...((parsed.contact && parsed.contact.socials) || {}) }
          },
          categories: parsed.categories || INITIAL_DATA.categories,
          projects: parsed.projects || INITIAL_DATA.projects
        };
      } else {
        this.dataCache = JSON.parse(JSON.stringify(INITIAL_DATA));
      }
    } catch (err) {
      console.warn('Supabase fetch failed or table not found. Using local data fallback.');
      
      // Fallback to local storage if Supabase fails (e.g. before tables are created)
      const stored = localStorage.getItem('mohamed_ali_portfolio_cms_v1');
      if (stored) {
        this.dataCache = JSON.parse(stored);
      } else {
        this.dataCache = JSON.parse(JSON.stringify(INITIAL_DATA));
      }
    }
    return this.dataCache;
  },

  getData: function() {
    if (!this.dataCache) return INITIAL_DATA;
    return this.dataCache;
  },

  // Save full data to Supabase and LocalStorage
  saveData: async function(newData) {
    this.dataCache = newData;
    localStorage.setItem('mohamed_ali_portfolio_cms_v1', JSON.stringify(newData));

    try {
      const { error } = await supabase
        .from('portfolio_data')
        .upsert({ id: 'cms_state', content: newData });
      if (error) console.error("Supabase upsert error:", error);
    } catch (e) {
      console.error("Supabase network error:", e);
    }
    return true;
  },

  // Section Specific Getters & Updaters
  getBranding: function() { return this.getData().branding; },
  updateBranding: function(fields) {
    const data = this.getData();
    data.branding = { ...data.branding, ...fields };
    this.saveData(data);
    return data.branding;
  },

  getHero: function() { return this.getData().hero; },
  updateHero: function(fields) {
    const data = this.getData();
    data.hero = { ...data.hero, ...fields };
    this.saveData(data);
    return data.hero;
  },

  getAbout: function() { return this.getData().about; },
  updateAbout: function(fields) {
    const data = this.getData();
    data.about = { ...data.about, ...fields };
    this.saveData(data);
    return data.about;
  },

  getContact: function() { return this.getData().contact; },
  updateContact: function(fields) {
    const data = this.getData();
    data.contact = {
      ...data.contact,
      ...fields,
      socials: { ...data.contact.socials, ...(fields.socials || {}) }
    };
    this.saveData(data);
    return data.contact;
  },

  getCategories: function() { return this.getData().categories || INITIAL_DATA.categories; },
  updateCategories: function(list) {
    const data = this.getData();
    data.categories = list;
    this.saveData(data);
    return data.categories;
  },

  // Projects CRUD
  getProjects: function() { return this.getData().projects || []; },
  getProjectById: function(id) {
    return this.getProjects().find(p => p.id === id);
  },
  addProject: function(project) {
    const data = this.getData();
    if (!project.id) project.id = 'proj-' + Date.now();
    data.projects.unshift(project);
    this.saveData(data);
    return project;
  },
  updateProject: function(id, updatedFields) {
    const data = this.getData();
    const index = data.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      data.projects[index] = { ...data.projects[index], ...updatedFields };
      this.saveData(data);
      return data.projects[index];
    }
    return null;
  },
  deleteProject: function(id) {
    const data = this.getData();
    const initialLen = data.projects.length;
    data.projects = data.projects.filter(p => p.id !== id);
    if (data.projects.length !== initialLen) {
      this.saveData(data);
      return true;
    }
    return false;
  },

  resetData: function() {
    this.saveData(INITIAL_DATA);
    return INITIAL_DATA;
  },

  // Upload file to Supabase Storage
  uploadMediaFile: async function(file, onProgress) {
    if (!file) throw new Error("No file selected");

    if (onProgress) onProgress(20); // Dummy progress start
    
    // Generate unique safe filename
    const fileExt = file.name.split('.').pop().toLowerCase();
    const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    const fileName = `${Date.now()}_${safeName}.${fileExt}`;

    try {
      const { data, error } = await supabase.storage
        .from('portfolio-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }
      
      if (onProgress) onProgress(100);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('portfolio-media')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrlData.publicUrl, filename: fileName };

    } catch (err) {
      console.error("Upload error:", err);
      throw new Error("Failed to upload to Supabase: " + err.message);
    }
  },

  // Export JSON file
  exportJSON: function() {
    const data = this.getData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mohamed_ali_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  // Import JSON data
  importJSON: function(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.branding && parsed.projects) {
        this.saveData(parsed);
        return { success: true, message: "Data imported and portfolio updated successfully!" };
      } else {
        return { success: false, message: "Invalid file format: must include branding and projects." };
      }
    } catch (e) {
      return { success: false, message: "Error parsing JSON backup file." };
    }
  }
};

// Helper: Parse Video URLs
function parseVideoEmbed(url) {
  if (!url) return null;
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const vimeoRegex = /(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?/i;
  
  const ytMatch = url.match(youtubeRegex);
  if (ytMatch && ytMatch[1]) {
    return { type: 'youtube', id: ytMatch[1], embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` };
  }
  
  const vmMatch = url.match(vimeoRegex);
  if (vmMatch && vmMatch[1]) {
    return { type: 'vimeo', id: vmMatch[1], embedUrl: `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1` };
  }
  
  if (url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('supabase.co/storage')) {
    return { type: 'direct', url: url };
  }
  
  return null;
}
