/**
 * Complete Admin Panel & CMS Studio Script (admin.js)
 * Mohamed Ali Portfolio - 100% Control over all content, media, numbers, and settings
 */

let editingProjectId = null;
let currentAdminTab = 'projects';

document.addEventListener('DOMContentLoaded', async () => {
  await DB.init();
  initAdmin();
});

function initAdmin() {
  updateSidebarBranding();
  renderStats();
  renderProjectsTable();
  populateCategoryDropdown();
  loadHeroForm();
  loadAboutForm();
  loadContactForm();
  renderCategories();

  setupAdminNavigation();
  setupProjectForm();
  setupHeroForm();
  setupAboutForm();
  setupContactForm();
  setupCategoryForm();
  setupBackupRestore();
  setupLivePreviews();

  lucide.createIcons();
}

/**
 * Toast Notification Utility
 */
function showAdminToast(message) {
  const toast = document.getElementById('admin-toast');
  const text = document.getElementById('admin-toast-text');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.remove('translate-y-[-150%]');
  toast.classList.add('translate-y-0');

  setTimeout(() => {
    toast.classList.remove('translate-y-0');
    toast.classList.add('translate-y-[-150%]');
  }, 3500);
}

/**
 * 1. Setup Admin Tabs Navigation
 */
function setupAdminNavigation() {
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('active', 'bg-amber-500', 'text-black');
        b.classList.add('text-gray-400', 'hover:bg-white/5');
      });

      btn.classList.add('active', 'bg-amber-500', 'text-black');
      btn.classList.remove('text-gray-400', 'hover:bg-white/5');

      const target = btn.getAttribute('data-tab');
      currentAdminTab = target;

      document.querySelectorAll('.admin-tab-content').forEach(section => {
        section.classList.add('hidden');
      });

      const activeSection = document.getElementById(`tab-${target}`);
      if (activeSection) {
        activeSection.classList.remove('hidden');
      }
      lucide.createIcons();
    });
  });
}

/**
 * Sidebar Brand Sync
 */
function updateSidebarBranding() {
  const branding = DB.getBranding();
  const monogramEl = document.getElementById('sidebar-monogram');
  const nameEl = document.getElementById('sidebar-brand-name');
  if (monogramEl && branding.monogram) monogramEl.textContent = branding.monogram;
  if (nameEl && branding.name) nameEl.textContent = branding.name;
}

/**
 * 2. Render Overview Statistics
 */
function renderStats() {
  const projects = DB.getProjects();
  const photos = projects.filter(p => p.type === 'photo');
  const videos = projects.filter(p => p.type === 'video');

  const totalEl = document.getElementById('stat-total-projects');
  const photosEl = document.getElementById('stat-total-photos');
  const videosEl = document.getElementById('stat-total-videos');

  if (totalEl) totalEl.textContent = projects.length;
  if (photosEl) photosEl.textContent = photos.length;
  if (videosEl) videosEl.textContent = videos.length;
}

/**
 * 3. Render Projects List / Table
 */
function renderProjectsTable(searchQuery = '', typeFilter = 'all') {
  const container = document.getElementById('admin-projects-list');
  if (!container) return;

  let projects = DB.getProjects();
  const categories = DB.getCategories();
  const categoryMap = {};
  categories.forEach(c => { categoryMap[c.id] = c.name; });

  if (searchQuery) {
    projects = projects.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.client && p.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  if (typeFilter !== 'all') {
    projects = projects.filter(p => p.type === typeFilter);
  }

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center text-gray-400 glass-panel rounded-2xl border border-white/5">
        <i data-lucide="inbox" class="w-12 h-12 mx-auto text-gray-600 mb-3"></i>
        <p class="text-base font-bold text-gray-300">No works found</p>
        <p class="text-xs text-gray-500 mt-1">Add your first work using the "Add New Work" button above.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = projects.map(item => `
    <div class="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-amber-500/30 transition-all">
      <div class="flex items-center gap-4 w-full md:w-auto">
        <img src="${item.coverUrl}" alt="${item.title}" class="w-16 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0 bg-black" />
        <div>
          <div class="flex items-center gap-2 mb-1">
            <h4 class="font-bold text-white text-base">${item.title}</h4>
            ${item.type === 'video' ? `
              <span class="badge-video text-[10px] px-2 py-0.5 rounded-full font-bold">Film</span>
            ` : `
              <span class="badge-photo text-[10px] px-2 py-0.5 rounded-full font-bold">Photo</span>
            `}
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-semibold border border-white/10">
              ${categoryMap[item.category] || item.category}
            </span>
          </div>
          <p class="text-xs text-gray-400 flex items-center gap-3">
            <span>Client: ${item.client || 'Commission'}</span>
            <span>•</span>
            <span>Date: ${item.date || 'Unspecified'}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
        <button onclick="editProject('${item.id}')" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500 hover:text-black text-gray-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-white/10">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          <span>Edit</span>
        </button>
        <button onclick="deleteProject('${item.id}')" class="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-red-500/20">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>Delete</span>
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

/**
 * 4. Search and Filter Event Listeners
 */
const searchInput = document.getElementById('admin-project-search');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const typeFilter = document.getElementById('admin-project-filter-type')?.value || 'all';
    renderProjectsTable(e.target.value, typeFilter);
  });
}

const filterSelect = document.getElementById('admin-project-filter-type');
if (filterSelect) {
  filterSelect.addEventListener('change', (e) => {
    const query = document.getElementById('admin-project-search')?.value || '';
    renderProjectsTable(query, e.target.value);
  });
}

/**
 * 5. Media Source Toggle Helpers
 */
window.toggleAdminVideoSource = function(mode) {
  const linkBox = document.getElementById('admin-video-link-container');
  const fileBox = document.getElementById('admin-video-file-container');
  if (!linkBox || !fileBox) return;
  if (mode === 'upload') {
    linkBox.classList.add('hidden');
    fileBox.classList.remove('hidden');
  } else {
    linkBox.classList.remove('hidden');
    fileBox.classList.add('hidden');
  }
};

window.toggleAdminImageSource = function(mode) {
  const fileBox = document.getElementById('admin-image-file-container');
  const linkBox = document.getElementById('admin-image-link-container');
  if (!fileBox || !linkBox) return;
  if (mode === 'link') {
    fileBox.classList.add('hidden');
    linkBox.classList.remove('hidden');
  } else {
    fileBox.classList.remove('hidden');
    linkBox.classList.add('hidden');
  }
};

/**
 * Category Dropdown population
 */
function populateCategoryDropdown() {
  const catSelect = document.getElementById('form-category');
  if (!catSelect) return;
  const categories = DB.getCategories();
  catSelect.innerHTML = categories.map(c => `
    <option value="${c.id}">${c.name}</option>
  `).join('');
}

/**
 * 6. Add / Edit Project Form Handling
 */
function setupProjectForm() {
  const form = document.getElementById('admin-project-form');
  const typeSelect = document.getElementById('form-type');
  const videoGroup = document.getElementById('form-video-group');
  const fileInput = document.getElementById('form-image-file');
  const imgPreview = document.getElementById('form-image-preview');
  const progressBox = document.getElementById('admin-upload-progress');
  const progressBar = document.getElementById('admin-progress-bar');
  const progressPercent = document.getElementById('admin-progress-percent');
  const submitBtn = document.getElementById('admin-submit-btn');

  if (typeSelect && videoGroup) {
    typeSelect.addEventListener('change', () => {
      if (typeSelect.value === 'video') {
        videoGroup.classList.remove('hidden');
      } else {
        videoGroup.classList.add('hidden');
      }
    });
  }

  // Live File preview for cover
  if (fileInput && imgPreview) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imgPreview.src = event.target.result;
          imgPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Form submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const itemType = typeSelect ? typeSelect.value : 'photo';
      const isVideo = itemType === 'video';

      // 1. Determine Video URL
      let finalVideoUrl = '';
      if (isVideo) {
        const videoSource = document.querySelector('input[name="admin-video-source"]:checked')?.value || 'link';
        if (videoSource === 'upload') {
          const videoFile = document.getElementById('form-video-file')?.files[0];
          if (videoFile) {
            if (progressBox) progressBox.classList.remove('hidden');
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.innerHTML = 'Uploading video file...';
            }
            try {
              const res = await DB.uploadMediaFile(videoFile, (p) => {
                if (progressBar) progressBar.style.width = p + '%';
                if (progressPercent) progressPercent.textContent = p + '%';
              });
              finalVideoUrl = res.url;
            } catch (err) {
              alert('Video upload failed: ' + err.message);
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Save Work';
              }
              if (progressBox) progressBox.classList.add('hidden');
              return;
            }
          } else if (editingProjectId) {
            const existing = DB.getProjectById(editingProjectId);
            if (existing) finalVideoUrl = existing.videoUrl;
          }
        } else {
          finalVideoUrl = document.getElementById('form-video-url')?.value.trim() || '';
        }
      }

      // 2. Determine Cover Image URL
      let finalCoverUrl = '';
      const imageSource = document.querySelector('input[name="admin-image-source"]:checked')?.value || 'upload';

      if (imageSource === 'upload') {
        const imageFile = document.getElementById('form-image-file')?.files[0];
        if (imageFile) {
          if (progressBox) progressBox.classList.remove('hidden');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Uploading image file...';
          }
          try {
            const res = await DB.uploadMediaFile(imageFile, (p) => {
              if (progressBar) progressBar.style.width = p + '%';
              if (progressPercent) progressPercent.textContent = p + '%';
            });
            finalCoverUrl = res.url;
          } catch (err) {
            console.error(err);
          }
        } else if (editingProjectId) {
          const existing = DB.getProjectById(editingProjectId);
          if (existing) finalCoverUrl = existing.coverUrl;
        }
      } else {
        finalCoverUrl = document.getElementById('form-image-url')?.value.trim() || '';
      }

      if (!finalCoverUrl) {
        if (editingProjectId) {
          const existing = DB.getProjectById(editingProjectId);
          if (existing) finalCoverUrl = existing.coverUrl;
        }
        if (!finalCoverUrl) {
          finalCoverUrl = isVideo 
            ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80'
            : 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80';
        }
      }

      const projectData = {
        title: document.getElementById('form-title').value.trim(),
        type: itemType,
        category: document.getElementById('form-category').value,
        coverUrl: finalCoverUrl,
        videoUrl: finalVideoUrl,
        client: document.getElementById('form-client').value.trim(),
        date: document.getElementById('form-date').value || new Date().toISOString().slice(0, 10),
        gearUsed: document.getElementById('form-gear').value.trim(),
        description: document.getElementById('form-desc').value.trim()
      };

      if (editingProjectId) {
        DB.updateProject(editingProjectId, projectData);
        showAdminToast('Work updated successfully!');
      } else {
        DB.addProject(projectData);
        showAdminToast('New work added successfully!');
      }

      resetProjectForm();
      renderStats();
      renderProjectsTable();
      closeProjectModal();

      if (progressBox) progressBox.classList.add('hidden');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i><span>Save Work</span>';
      }
      lucide.createIcons();
    });
  }
}

window.openAddProjectModal = function() {
  resetProjectForm();
  populateCategoryDropdown();
  document.getElementById('project-modal-title').textContent = 'Add New Work';
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  lucide.createIcons();
};

window.editProject = function(id) {
  const item = DB.getProjectById(id);
  if (!item) return;

  editingProjectId = id;
  populateCategoryDropdown();
  document.getElementById('project-modal-title').textContent = 'Edit Work';

  document.getElementById('form-title').value = item.title;
  document.getElementById('form-type').value = item.type;
  document.getElementById('form-category').value = item.category;
  
  const imgUrlInput = document.getElementById('form-image-url');
  if (imgUrlInput) {
    imgUrlInput.value = item.coverUrl.startsWith('data:') ? '' : item.coverUrl;
  }
  
  const vidUrlInput = document.getElementById('form-video-url');
  if (vidUrlInput) {
    vidUrlInput.value = item.videoUrl || '';
  }

  document.getElementById('form-client').value = item.client || '';
  document.getElementById('form-date').value = item.date || '';
  document.getElementById('form-gear').value = item.gearUsed || '';
  document.getElementById('form-desc').value = item.description || '';

  const imgPreview = document.getElementById('form-image-preview');
  if (imgPreview) {
    imgPreview.src = item.coverUrl;
    imgPreview.classList.remove('hidden');
  }

  const videoGroup = document.getElementById('form-video-group');
  if (videoGroup) {
    if (item.type === 'video') {
      videoGroup.classList.remove('hidden');
    } else {
      videoGroup.classList.add('hidden');
    }
  }

  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  lucide.createIcons();
};

window.closeProjectModal = function() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
};

function resetProjectForm() {
  editingProjectId = null;
  const form = document.getElementById('admin-project-form');
  if (form) form.reset();
  const imgPreview = document.getElementById('form-image-preview');
  if (imgPreview) {
    imgPreview.src = '';
    imgPreview.classList.add('hidden');
  }
  const videoGroup = document.getElementById('form-video-group');
  if (videoGroup) videoGroup.classList.add('hidden');
}

window.deleteProject = function(id) {
  if (confirm('Are you sure you want to permanently delete this work?')) {
    DB.deleteProject(id);
    renderStats();
    renderProjectsTable();
    showAdminToast('Work deleted successfully');
  }
};

/**
 * 7. TAB 2: Hero & Branding Form
 */
function loadHeroForm() {
  const branding = DB.getBranding();
  const hero = DB.getHero();

  document.getElementById('brand-monogram-input').value = branding.monogram || 'MA';
  document.getElementById('brand-name-input').value = branding.name || 'Mohamed Ali';
  document.getElementById('brand-title-input').value = branding.title || 'Filmmaker & Director of Photography';
  document.getElementById('brand-footer-input').value = branding.footerCopy || 'Filmmaker & Director of Photography © 2026';

  document.getElementById('hero-badge-input').value = hero.badge || '';
  document.getElementById('hero-headline-start-input').value = hero.headlineStart || '';
  document.getElementById('hero-headline-gradient-input').value = hero.headlineGradient || '';
  document.getElementById('hero-headline-end-input').value = hero.headlineEnd || '';
  document.getElementById('hero-subtitle-input').value = hero.subtitle || '';
  document.getElementById('hero-cta-portfolio-input').value = hero.ctaPortfolioText || '';
  document.getElementById('hero-cta-contact-input').value = hero.ctaContactText || '';
}

function setupHeroForm() {
  const form = document.getElementById('admin-hero-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const brandingFields = {
      monogram: document.getElementById('brand-monogram-input').value.trim(),
      name: document.getElementById('brand-name-input').value.trim(),
      title: document.getElementById('brand-title-input').value.trim(),
      footerCopy: document.getElementById('brand-footer-input').value.trim()
    };

    const heroFields = {
      badge: document.getElementById('hero-badge-input').value.trim(),
      headlineStart: document.getElementById('hero-headline-start-input').value.trim(),
      headlineGradient: document.getElementById('hero-headline-gradient-input').value.trim(),
      headlineEnd: document.getElementById('hero-headline-end-input').value.trim(),
      subtitle: document.getElementById('hero-subtitle-input').value.trim(),
      ctaPortfolioText: document.getElementById('hero-cta-portfolio-input').value.trim(),
      ctaContactText: document.getElementById('hero-cta-contact-input').value.trim()
    };

    DB.updateBranding(brandingFields);
    DB.updateHero(heroFields);
    updateSidebarBranding();

    showAdminToast('Hero & Branding settings saved successfully!');
  });
}

/**
 * 8. TAB 3: About Section Form
 */
function loadAboutForm() {
  const about = DB.getAbout();

  document.getElementById('about-badge-input').value = about.badge || '';
  document.getElementById('about-title-input').value = about.title || '';
  document.getElementById('about-p1-input').value = about.paragraph1 || '';
  document.getElementById('about-p2-input').value = about.paragraph2 || '';
  document.getElementById('about-tag-input').value = about.imageTag || '';
  document.getElementById('about-avail-input').value = about.availability || '';
  document.getElementById('about-image-url-input').value = about.image || '';

  const imgPreview = document.getElementById('about-img-preview');
  if (imgPreview && about.image) {
    imgPreview.src = about.image;
  }
}

function setupAboutForm() {
  const form = document.getElementById('admin-about-form');
  const fileInput = document.getElementById('about-image-file-input');
  const imgPreview = document.getElementById('about-img-preview');

  if (fileInput && imgPreview) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          imgPreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let finalImageUrl = document.getElementById('about-image-url-input').value.trim();
    const photoFile = fileInput?.files[0];

    if (photoFile) {
      try {
        const res = await DB.uploadMediaFile(photoFile);
        finalImageUrl = res.url;
        document.getElementById('about-image-url-input').value = finalImageUrl;
      } catch (err) {
        console.error("About photo upload error:", err);
      }
    }

    if (!finalImageUrl) {
      finalImageUrl = DB.getAbout().image;
    }

    const fields = {
      badge: document.getElementById('about-badge-input').value.trim(),
      title: document.getElementById('about-title-input').value.trim(),
      paragraph1: document.getElementById('about-p1-input').value.trim(),
      paragraph2: document.getElementById('about-p2-input').value.trim(),
      image: finalImageUrl,
      imageTag: document.getElementById('about-tag-input').value.trim(),
      availability: document.getElementById('about-avail-input').value.trim()
    };

    DB.updateAbout(fields);
    showAdminToast('About section updated successfully!');
  });
}

/**
 * 9. TAB 4: Contact & Socials Form
 */
function loadContactForm() {
  const contact = DB.getContact();

  document.getElementById('contact-badge-input').value = contact.badge || '';
  document.getElementById('contact-title-input').value = contact.title || '';
  document.getElementById('contact-subtitle-input').value = contact.subtitle || '';
  document.getElementById('contact-whatsapp-input').value = contact.whatsapp || '';
  document.getElementById('contact-phone-input').value = contact.phone || '';
  document.getElementById('contact-email-input').value = contact.email || '';
  document.getElementById('contact-location-input').value = contact.location || '';

  if (contact.socials) {
    document.getElementById('contact-ig-input').value = contact.socials.instagram || '';
    document.getElementById('contact-yt-input').value = contact.socials.youtube || '';
    document.getElementById('contact-vm-input').value = contact.socials.vimeo || '';
    document.getElementById('contact-be-input').value = contact.socials.behance || '';
  }

  document.getElementById('contact-form-title-input').value = contact.bookingFormTitle || '';
  document.getElementById('contact-form-subtitle-input').value = contact.bookingFormSubtitle || '';
  
  const waCheck = document.getElementById('contact-floating-wa-enable');
  if (waCheck) waCheck.checked = contact.floatingWhatsapp !== false;

  document.getElementById('contact-floating-wa-tooltip').value = contact.floatingWhatsappTooltip || 'Chat with Mohamed Ali';
}

function setupContactForm() {
  const form = document.getElementById('admin-contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const phoneDisplay = document.getElementById('contact-phone-input').value.trim();
    const phoneRaw = phoneDisplay.replace(/[\s\-\(\)]/g, '');

    const fields = {
      badge: document.getElementById('contact-badge-input').value.trim(),
      title: document.getElementById('contact-title-input').value.trim(),
      subtitle: document.getElementById('contact-subtitle-input').value.trim(),
      whatsapp: document.getElementById('contact-whatsapp-input').value.trim().replace(/[^0-9]/g, ''),
      phone: phoneDisplay,
      phoneRaw: phoneRaw,
      email: document.getElementById('contact-email-input').value.trim(),
      location: document.getElementById('contact-location-input').value.trim(),
      socials: {
        instagram: document.getElementById('contact-ig-input').value.trim(),
        youtube: document.getElementById('contact-yt-input').value.trim(),
        vimeo: document.getElementById('contact-vm-input').value.trim(),
        behance: document.getElementById('contact-be-input').value.trim()
      },
      bookingFormTitle: document.getElementById('contact-form-title-input').value.trim(),
      bookingFormSubtitle: document.getElementById('contact-form-subtitle-input').value.trim(),
      floatingWhatsapp: document.getElementById('contact-floating-wa-enable').checked,
      floatingWhatsappTooltip: document.getElementById('contact-floating-wa-tooltip').value.trim()
    };

    DB.updateContact(fields);
    showAdminToast('Contact channels and social links saved successfully!');
  });
}

/**
 * 10. TAB 5: Categories Manager
 */
function renderCategories() {
  const container = document.getElementById('admin-categories-list');
  if (!container) return;

  const categories = DB.getCategories();

  container.innerHTML = categories.map(cat => `
    <div class="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between">
      <div>
        <span class="font-bold text-white text-sm block">${cat.name}</span>
        <span class="text-[10px] text-gray-500 font-mono">id: ${cat.id}</span>
      </div>
      <button onclick="deleteCategory('${cat.id}')" class="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-colors">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    </div>
  `).join('');

  lucide.createIcons();
}

function setupCategoryForm() {
  const form = document.getElementById('admin-add-category-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('cat-name-input');
    const name = nameInput.value.trim();
    if (!name) return;

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || ('cat-' + Date.now());
    const categories = DB.getCategories();

    if (categories.some(c => c.id === id)) {
      alert('A category with this name already exists.');
      return;
    }

    categories.push({ id, name });
    DB.updateCategories(categories);
    nameInput.value = '';
    renderCategories();
    populateCategoryDropdown();
    showAdminToast(`Category "${name}" added!`);
  });
}

window.deleteCategory = function(catId) {
  const categories = DB.getCategories();
  if (categories.length <= 1) {
    alert('At least one category is required for portfolio filtering.');
    return;
  }

  if (confirm(`Are you sure you want to delete this category?`)) {
    const updated = categories.filter(c => c.id !== catId);
    DB.updateCategories(updated);
    renderCategories();
    populateCategoryDropdown();
    renderProjectsTable();
    showAdminToast('Category removed successfully');
  }
};

/**
 * 11. TAB 6: Backup & System Sync
 */
function setupBackupRestore() {
  const exportBtn = document.getElementById('btn-export-backup');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      DB.exportJSON();
      showAdminToast('Backup JSON file generated and downloading...');
    });
  }

  const importInput = document.getElementById('input-import-backup');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = DB.importJSON(event.target.result);
        if (result.success) {
          showAdminToast(result.message);
          initAdmin();
        } else {
          alert(result.message);
        }
      };
      reader.readAsText(file);
    });
  }

  const resetBtn = document.getElementById('btn-reset-data');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all portfolio data to default? Any custom works and changes will be lost.')) {
        DB.resetData();
        showAdminToast('Portfolio reset to default successfully!');
        initAdmin();
      }
    });
  }
}

/**
 * Live Previews
 */
function setupLivePreviews() {
  const aboutUrlInput = document.getElementById('about-image-url-input');
  const aboutPreview = document.getElementById('about-img-preview');
  if (aboutUrlInput && aboutPreview) {
    aboutUrlInput.addEventListener('input', () => {
      if (aboutUrlInput.value.trim()) {
        aboutPreview.src = aboutUrlInput.value.trim();
      }
    });
  }

  const workUrlInput = document.getElementById('form-image-url');
  const workPreview = document.getElementById('form-image-preview');
  if (workUrlInput && workPreview) {
    workUrlInput.addEventListener('input', () => {
      if (workUrlInput.value.trim()) {
        workPreview.src = workUrlInput.value.trim();
        workPreview.classList.remove('hidden');
      }
    });
  }
}
