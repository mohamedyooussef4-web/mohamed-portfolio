/**
 * Public Client-Facing Application Script (app.js)
 * Mohamed Ali Portfolio - 100% Dynamically Hydrated from CMS Engine
 */

let currentFilter = 'all';
let currentLightboxIndex = -1;
let filteredProjects = [];

document.addEventListener('DOMContentLoaded', async () => {
  await DB.init();
  initApp();
});

function initApp() {
  hydrateCMS();
  renderCategoryTabs();
  renderPortfolio();
  setupContactForm();
  setupModals();
  lucide.createIcons();
}

/**
 * 1. Hydrate all public website content from CMS Engine (DB.getData())
 */
function hydrateCMS() {
  const data = DB.getData();
  const { branding, hero, about, contact } = data;

  // --- Branding ---
  if (branding) {
    document.querySelectorAll('.brand-monogram').forEach(el => el.textContent = branding.monogram || 'MA');
    document.querySelectorAll('.brand-name').forEach(el => el.textContent = branding.name || 'Mohamed Ali');
    document.querySelectorAll('.brand-title').forEach(el => el.textContent = branding.title || 'Filmmaker & Photographer');
    const footerCopy = document.getElementById('footer-copy');
    if (footerCopy && branding.footerCopy) footerCopy.textContent = branding.footerCopy;
  }

  // --- Hero Section ---
  if (hero) {
    const badgeEl = document.getElementById('hero-badge');
    if (badgeEl && hero.badge) badgeEl.textContent = hero.badge;

    const headStartEl = document.getElementById('hero-headline-start');
    if (headStartEl && hero.headlineStart) headStartEl.textContent = hero.headlineStart;

    const headGradEl = document.getElementById('hero-headline-gradient');
    if (headGradEl && hero.headlineGradient) headGradEl.textContent = hero.headlineGradient;

    const headEndEl = document.getElementById('hero-headline-end');
    if (headEndEl && hero.headlineEnd) headEndEl.textContent = hero.headlineEnd;

    const subEl = document.getElementById('hero-subtitle');
    if (subEl && hero.subtitle) subEl.textContent = hero.subtitle;

    const ctaPort = document.getElementById('hero-cta-portfolio');
    if (ctaPort && hero.ctaPortfolioText) {
      const span = ctaPort.querySelector('span');
      if (span) span.textContent = hero.ctaPortfolioText;
    }

    const ctaContact = document.getElementById('hero-cta-contact');
    if (ctaContact && hero.ctaContactText) {
      const span = ctaContact.querySelector('span');
      if (span) span.textContent = hero.ctaContactText;
    }
  }

  // --- About Section ---
  if (about) {
    const aboutBadge = document.getElementById('about-badge');
    if (aboutBadge && about.badge) aboutBadge.textContent = about.badge;

    const aboutTitle = document.getElementById('about-title');
    if (aboutTitle && about.title) aboutTitle.textContent = about.title;

    const p1 = document.getElementById('about-p1');
    if (p1 && about.paragraph1) p1.textContent = about.paragraph1;

    const p2 = document.getElementById('about-p2');
    if (p2 && about.paragraph2) p2.textContent = about.paragraph2;

    const aboutImg = document.getElementById('about-image');
    if (aboutImg && about.image) aboutImg.src = about.image;

    const imageTag = document.getElementById('about-image-tag');
    if (imageTag && about.imageTag) imageTag.textContent = about.imageTag;

    const locEl = document.getElementById('about-location');
    if (locEl) locEl.textContent = about.location || (contact && contact.location) || 'Cairo, Egypt';

    const availEl = document.getElementById('about-availability');
    if (availEl && about.availability) availEl.textContent = about.availability;
  }

  // --- Contact & Socials ---
  if (contact) {
    const contactBadge = document.getElementById('contact-badge');
    if (contactBadge && contact.badge) contactBadge.textContent = contact.badge;

    const contactTitle = document.getElementById('contact-title');
    if (contactTitle && contact.title) contactTitle.textContent = contact.title;

    const contactSub = document.getElementById('contact-subtitle');
    if (contactSub && contact.subtitle) contactSub.textContent = contact.subtitle;

    const email = contact.email || 'contact@mohamedalifilms.com';
    const rawPhone = contact.phoneRaw || (contact.phone ? contact.phone.replace(/[\s\-\(\)]/g, '') : '+201001234567');
    const displayPhone = contact.phone || '+20 100 123 4567';
    const waDigits = contact.whatsapp || '201001234567';

    // About contact links
    const aboutEmail = document.getElementById('about-email');
    if (aboutEmail) {
      aboutEmail.textContent = email;
      aboutEmail.href = `mailto:${email}`;
    }

    const aboutPhone = document.getElementById('about-phone');
    if (aboutPhone) {
      aboutPhone.textContent = displayPhone;
      aboutPhone.href = `tel:${rawPhone}`;
    }

    // Direct Contact Cards
    const cardPhone = document.getElementById('contact-card-phone');
    if (cardPhone) cardPhone.href = `tel:${rawPhone}`;

    const phoneLabel = document.getElementById('contact-phone-label');
    if (phoneLabel) phoneLabel.textContent = displayPhone;

    const cardEmail = document.getElementById('contact-card-email');
    if (cardEmail) cardEmail.href = `mailto:${email}`;

    // WhatsApp URLs across the page
    const waUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent('Hello Mohamed Ali, I would like to inquire about booking a commercial / photoshoot project.')}`;
    document.querySelectorAll('.whatsapp-link').forEach(el => {
      el.href = waUrl;
    });

    const cardWhatsApp = document.getElementById('contact-card-whatsapp');
    if (cardWhatsApp) cardWhatsApp.href = waUrl;

    // Social Links
    if (contact.socials) {
      const ig = document.getElementById('social-instagram');
      if (ig && contact.socials.instagram) ig.href = contact.socials.instagram;

      const yt = document.getElementById('social-youtube');
      if (yt && contact.socials.youtube) yt.href = contact.socials.youtube;

      const vm = document.getElementById('social-vimeo');
      if (vm && contact.socials.vimeo) vm.href = contact.socials.vimeo;

      const be = document.getElementById('social-behance');
      if (be && contact.socials.behance) be.href = contact.socials.behance;
    }

    // Booking Form Headings
    const bookTitle = document.getElementById('booking-form-title');
    if (bookTitle && contact.bookingFormTitle) bookTitle.textContent = contact.bookingFormTitle;

    const bookSub = document.getElementById('booking-form-subtitle');
    if (bookSub && contact.bookingFormSubtitle) bookSub.textContent = contact.bookingFormSubtitle;

    // Floating WhatsApp Button
    const floatingContainer = document.getElementById('floating-whatsapp-container');
    const floatingBtn = document.getElementById('floating-whatsapp-btn');
    const floatingText = document.getElementById('floating-whatsapp-text');

    if (floatingContainer) {
      if (contact.floatingWhatsapp === false) {
        floatingContainer.classList.add('hidden');
      } else {
        floatingContainer.classList.remove('hidden');
      }
    }
    if (floatingBtn) floatingBtn.href = waUrl;
    if (floatingText && contact.floatingWhatsappTooltip) {
      floatingText.textContent = contact.floatingWhatsappTooltip;
    }
  }
}

/**
 * 2. Dynamically Render Category Filter Tabs from CMS
 */
function renderCategoryTabs() {
  const container = document.getElementById('portfolio-categories');
  if (!container) return;

  const categories = DB.getCategories();

  let html = `
    <button class="filter-btn px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active" data-filter="all">
      All Works
    </button>
    <button class="filter-btn px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap" data-filter="video">
      Films Only
    </button>
    <button class="filter-btn px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap" data-filter="photo">
      Photos Only
    </button>
  `;

  categories.forEach(cat => {
    html += `
      <button class="filter-btn px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap" data-filter="${cat.id}">
        ${cat.name}
      </button>
    `;
  });

  container.innerHTML = html;

  // Add event listeners to tabs
  container.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderPortfolio();
    });
  });
}

/**
 * 3. Render Portfolio Grid
 */
function renderPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  const allProjects = DB.getProjects();
  const categories = DB.getCategories();
  const categoryMap = {};
  categories.forEach(c => { categoryMap[c.id] = c.name; });

  // Apply Filter
  if (currentFilter === 'all') {
    filteredProjects = allProjects;
  } else if (currentFilter === 'photo') {
    filteredProjects = allProjects.filter(p => p.type === 'photo');
  } else if (currentFilter === 'video') {
    filteredProjects = allProjects.filter(p => p.type === 'video');
  } else {
    filteredProjects = allProjects.filter(p => p.category === currentFilter);
  }

  if (filteredProjects.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-16 text-center text-gray-400 glass-panel rounded-3xl border border-white/5">
        <i data-lucide="folder-x" class="w-12 h-12 mx-auto text-amber-500/50 mb-4"></i>
        <p class="text-lg font-bold text-gray-300">No works found in this section</p>
        <p class="text-sm text-gray-500 mt-1">Check back soon or explore our other categories.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filteredProjects.map((item, index) => {
    const isVideo = item.type === 'video';
    const catLabel = categoryMap[item.category] || item.category || 'Featured';

    return `
      <div class="portfolio-card group relative rounded-2xl overflow-hidden glass-panel border border-white/10 cursor-pointer animate-fade-in" onclick="openMedia(${index})">
        <!-- Thumbnail -->
        <div class="aspect-4/3 w-full overflow-hidden bg-black/40 relative">
          <img src="${item.coverUrl}" alt="${item.title}" class="card-image w-full h-full object-cover object-center" loading="lazy" />
          
          <!-- Badges -->
          <div class="absolute top-3 left-3 z-10 flex items-center gap-2">
            ${isVideo ? `
              <span class="badge-video px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                <i data-lucide="play" class="w-3 h-3 fill-current"></i>
                Film
              </span>
            ` : `
              <span class="badge-photo px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md">
                <i data-lucide="camera" class="w-3 h-3"></i>
                Photo
              </span>
            `}
          </div>

          <div class="absolute top-3 right-3 z-10">
            <span class="bg-black/60 backdrop-blur-md text-gray-300 text-xs px-2.5 py-1 rounded-md border border-white/10 font-medium">
              ${catLabel}
            </span>
          </div>

          <!-- Video Play Icon Center Overlay -->
          ${isVideo ? `
            <div class="absolute inset-0 flex items-center justify-center z-10 pointer-events-none group-hover:scale-110 transition-transform">
              <div class="w-14 h-14 rounded-full bg-amber-500/90 text-black flex items-center justify-center shadow-xl shadow-amber-500/30">
                <i data-lucide="play" class="w-6 h-6 fill-current ml-0.5"></i>
              </div>
            </div>
          ` : ''}

          <!-- Hover Overlay -->
          <div class="card-overlay absolute inset-0 flex flex-col justify-end p-6 z-20">
            <h4 class="text-xl font-black text-white mb-1 group-hover:text-amber-400 transition-colors">${item.title}</h4>
            <p class="text-xs text-gray-300 line-clamp-2 mb-3">${item.description || ''}</p>
            <div class="flex items-center justify-between text-xs text-gray-400 border-t border-white/15 pt-3">
              <span class="flex items-center gap-1 text-amber-300">
                <i data-lucide="user" class="w-3.5 h-3.5"></i>
                ${item.client || 'Commission'}
              </span>
              <span class="flex items-center gap-1">
                <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                ${item.date || ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

/**
 * 4. Open Media Item (Photo or Video)
 */
window.openMedia = function(index) {
  const item = filteredProjects[index];
  if (!item) return;

  if (item.type === 'video') {
    openVideoModal(item);
  } else {
    openPhotoLightbox(index);
  }
};

/**
 * 5. Video Modal Handling
 */
function openVideoModal(item) {
  const modal = document.getElementById('video-modal');
  const container = document.getElementById('video-player-container');
  const titleEl = document.getElementById('video-modal-title');
  const descEl = document.getElementById('video-modal-desc');
  const gearEl = document.getElementById('video-modal-gear');
  const clientEl = document.getElementById('video-modal-client');

  if (!modal || !container) return;

  titleEl.textContent = item.title;
  descEl.textContent = item.description || '';
  gearEl.textContent = item.gearUsed ? `Gear: ${item.gearUsed}` : '';
  clientEl.textContent = item.client ? `Client: ${item.client}` : '';

  const parsed = parseVideoEmbed(item.videoUrl || '');

  if (parsed && parsed.type === 'youtube') {
    container.innerHTML = `
      <iframe src="${parsed.embedUrl}" class="w-full h-full rounded-2xl" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    `;
  } else if (parsed && parsed.type === 'vimeo') {
    container.innerHTML = `
      <iframe src="${parsed.embedUrl}" class="w-full h-full rounded-2xl" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
    `;
  } else if (parsed && parsed.type === 'direct') {
    container.innerHTML = `
      <video src="${parsed.url}" poster="${item.coverUrl}" controls autoplay playsinline class="w-full h-full rounded-2xl object-contain bg-black shadow-inner"></video>
    `;
  } else {
    container.innerHTML = `
      <div class="w-full h-full flex flex-col items-center justify-center bg-black/60 rounded-2xl p-6 text-center">
        <i data-lucide="video" class="w-16 h-16 text-amber-500 mb-4"></i>
        <p class="text-base font-bold text-white mb-2">Video Link: ${item.videoUrl || 'Unavailable'}</p>
        <a href="${item.videoUrl}" target="_blank" class="px-6 py-2 bg-amber-500 text-black font-bold rounded-xl mt-4">Open External Link</a>
      </div>
    `;
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}

window.closeVideoModal = function() {
  const modal = document.getElementById('video-modal');
  const container = document.getElementById('video-player-container');
  if (modal) modal.classList.add('hidden');
  if (container) container.innerHTML = '';
  document.body.style.overflow = 'auto';
};

/**
 * 6. Photo Lightbox Handling
 */
function openPhotoLightbox(index) {
  currentLightboxIndex = index;
  const item = filteredProjects[index];
  if (!item) return;

  const modal = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-image');
  const titleEl = document.getElementById('lightbox-title');
  const descEl = document.getElementById('lightbox-desc');
  const gearEl = document.getElementById('lightbox-gear');
  const clientEl = document.getElementById('lightbox-client');
  const dateEl = document.getElementById('lightbox-date');

  if (!modal || !imgEl) return;

  imgEl.src = item.coverUrl;
  titleEl.textContent = item.title;
  descEl.textContent = item.description || '';
  gearEl.textContent = item.gearUsed || 'Unspecified';
  clientEl.textContent = item.client || 'Commission';
  dateEl.textContent = item.date || '';

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lucide.createIcons();
}

window.nextLightbox = function() {
  let nextIndex = currentLightboxIndex + 1;
  while (nextIndex < filteredProjects.length && filteredProjects[nextIndex].type !== 'photo') {
    nextIndex++;
  }
  if (nextIndex < filteredProjects.length) {
    openPhotoLightbox(nextIndex);
  }
};

window.prevLightbox = function() {
  let prevIndex = currentLightboxIndex - 1;
  while (prevIndex >= 0 && filteredProjects[prevIndex].type !== 'photo') {
    prevIndex--;
  }
  if (prevIndex >= 0) {
    openPhotoLightbox(prevIndex);
  }
};

window.closeLightbox = function() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
};

/**
 * 7. Booking Form Submission (Sends directly to Mohamed Ali's WhatsApp)
 */
function setupContactForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const contact = DB.getContact();
    const waDigits = contact.whatsapp || '201001234567';

    const name = document.getElementById('book-name').value.trim();
    const phone = document.getElementById('book-phone').value.trim();
    const service = document.getElementById('book-service').value;
    const date = document.getElementById('book-date').value;
    const notes = document.getElementById('book-notes').value.trim();

    const message = `*New Booking Request - Mohamed Ali Portfolio:*
👤 *Client Name:* ${name}
📱 *Phone / WhatsApp:* ${phone}
🎬 *Project Type:* ${service}
📅 *Proposed Date:* ${date || 'To be determined'}
📝 *Project Vision / Notes:* ${notes || 'No extra notes provided'}`;

    const waUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  });
}

/**
 * 8. Modal Keyboard Navigation
 */
function setupModals() {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModal();
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      nextLightbox();
    } else if (e.key === 'ArrowLeft') {
      prevLightbox();
    }
  });
}
