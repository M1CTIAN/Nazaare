const GALLERY = document.getElementById("gallery");
const PAGINATION = document.getElementById("pagination");
const SEARCH = document.getElementById("search-input");
const YEAR = document.getElementById("footer-year");

let PHOTOS = [];
let filteredPhotos = [];
let currentPage = 1;

const PHOTOS_PER_PAGE = 6;

// Load photo metadata and render immediately
fetch("data/photos.json")
  .then(res => res.json())
  .then(data => {
    PHOTOS = data;
    filteredPhotos = [...PHOTOS];
    renderGallery(); 
    YEAR.textContent = new Date().getFullYear();
    
  })
  .catch(err => {
    console.error("Error loading photos:", err);
    GALLERY.innerHTML = '<p class="error-state">Failed to load photos. Please refresh.</p>';
  });

// Search handler
SEARCH.addEventListener("input", debounce((e) => {
  const term = e.target.value.toLowerCase();
  filteredPhotos = PHOTOS.filter(photo =>
    (photo.title || "").toLowerCase().includes(term) ||
    (photo.description || "").toLowerCase().includes(term) ||
    (photo.tags || []).some(tag => tag.toLowerCase().includes(term))
  );
  currentPage = 1;
  renderGallery();
}, 300));

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Render gallery items
function renderGallery() {
  GALLERY.innerHTML = "";

  const start = (currentPage - 1) * PHOTOS_PER_PAGE;
  const pagePhotos = filteredPhotos.slice(start, start + PHOTOS_PER_PAGE);

  pagePhotos.forEach((photo, i) => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.innerHTML = `
      <img src="assets/photos/${photo.filename}" alt="${photo.title}" loading="lazy" />
      <div class="info">
        <h2>${photo.title}</h2>
        <p>${photo.description}</p>
        <p class="meta">
          📍 ${photo.location || "Unknown"} • 📅 ${formatDateTime(photo.dateTaken) || "Unknown"} • 📷 ${photo.device || "Unknown"}
        </p>
        <div class="tags">${photo.tags?.map(tag => `<span class="tag">${tag}</span>`).join("") || `<span class="tag">None</span>`}</div>
        <div class="actions"><a href="assets/photos/${photo.filename}" download class="download-btn">⬇️ Download</a></div>
      </div>
    `;
    div.addEventListener("click", () => openLightbox(start + i));
    GALLERY.appendChild(div);
  });

  renderPagination();
}

// Render pagination buttons
function renderPagination() {
  PAGINATION.innerHTML = "";
  const totalPages = Math.ceil(filteredPhotos.length / PHOTOS_PER_PAGE);

  // Prev
  const prev = document.createElement("button");
  prev.textContent = "Prev";
  prev.disabled = currentPage === 1;
  prev.addEventListener("click", () => {
    currentPage--;
    renderGallery();
  });
  PAGINATION.appendChild(prev);

  // Pages
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      renderGallery();
    });
    PAGINATION.appendChild(btn);
  }

  // Next
  const next = document.createElement("button");
  next.textContent = "Next";
  next.disabled = currentPage === totalPages;
  next.addEventListener("click", () => {
    currentPage++;
    renderGallery();
  });
  PAGINATION.appendChild(next);
}

// Lightbox
const LIGHTBOX = document.getElementById("lightbox");
const LIGHTBOX_IMG = document.getElementById("lightbox-img");
const LIGHTBOX_CAPTION = document.getElementById("lightbox-caption");
const LIGHTBOX_CLOSE = document.getElementById("lightbox-close");
const LIGHTBOX_NEXT = document.getElementById("lightbox-next");
const LIGHTBOX_PREV = document.getElementById("lightbox-prev");

let currentLightboxIndex = 0;

function openLightbox(index) {
  currentLightboxIndex = index;
  const photo = filteredPhotos[index];
  LIGHTBOX_IMG.src = `assets/photos/${photo.filename}`;
  LIGHTBOX_CAPTION.innerHTML = `
    <h2>${photo.title}</h2>
    <p>${photo.description}</p>
    <p>📍 ${photo.location || "Unknown"} • 📅 ${formatDateTime(photo.dateTaken) || "Unknown"} • 📷 ${photo.device || "Unknown"}</p>
    <p class="tags" style="margin-top: 0; justify-content: center;">Tags: ${photo.tags?.join(", ") || "None"}</p>
    <a href="assets/photos/${photo.filename}" download class="download-btn">⬇️ Download Photo</a>
  `;
  LIGHTBOX.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  LIGHTBOX.style.display = "none";
  document.body.style.overflow = "";
}

function showNext() {
  if (currentLightboxIndex < filteredPhotos.length - 1) {
    openLightbox(currentLightboxIndex + 1);
  }
}

function showPrev() {
  if (currentLightboxIndex > 0) {
    openLightbox(currentLightboxIndex - 1);
  }
}

// Events
LIGHTBOX_CLOSE.addEventListener("click", closeLightbox);
LIGHTBOX_NEXT.addEventListener("click", showNext);
LIGHTBOX_PREV.addEventListener("click", showPrev);
LIGHTBOX.addEventListener("click", e => {
  if (e.target === LIGHTBOX) closeLightbox();
});
document.addEventListener("keydown", e => {
  if (LIGHTBOX.style.display === "flex") {
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "Escape") closeLightbox();
  }
});

function formatDateTime(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return "Unknown";

  const [datePart, timePart] = dateStr.split(" ");
  if (!datePart || !timePart) return dateStr;

  const [year, month, day] = datePart.split(":");
  const [hour, minute] = timePart.split(":");

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}`);

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });
}

const THEME_BTN = document.getElementById("theme-toggle-btn");
const BODY = document.body;

// Load saved mode from localStorage
if (localStorage.getItem("theme") === "dark") {
  BODY.classList.add("dark-mode");
} else {
  BODY.classList.remove("dark-mode");
}

THEME_BTN.addEventListener("click", () => {
  BODY.classList.toggle("dark-mode");
  const isDark = BODY.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  THEME_BTN.textContent = isDark ? "🌙" : "☀️";
});

// Set initial icon
THEME_BTN.textContent = document.body.classList.contains("dark-mode") ? "🌙" : "☀️";
