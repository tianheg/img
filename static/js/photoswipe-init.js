import PhotoSwipeLightbox from '/photoswipe/photoswipe-lightbox.esm.js';
import PhotoSwipeDynamicCaption from '/photoswipe/photoswipe-dynamic-caption-plugin.esm.js';

export function initPhotoSwipe() {
  const lightbox = new PhotoSwipeLightbox({
    gallery: 'main',
    children: 'img',
    pswpModule: () => import('/photoswipe/photoswipe.esm.js'),
    
    // PhotoSwipe options
    showHideAnimationType: 'fade',
    spacing: 0.1,
    allowPanToNext: false,
    
    // Enable zoom
    zoom: true,
    maxZoomLevel: 4,
    
    // Background and UI
    bgOpacity: 0.9,
    closeOnVerticalDrag: true,
    
    // Preload nearby slides
    preload: [1, 1],
    
    // Custom data source function
    dataSource: (index) => {
      const images = document.querySelectorAll('main img');
      const img = images[index];
      
      if (!img) return null;
      
      // Get dimensions
      const rect = img.getBoundingClientRect();
      let width = img.naturalWidth || rect.width || 1200;
      let height = img.naturalHeight || rect.height || 800;
      
      // Fallback for images that haven't loaded
      if (width === 0 || height === 0) {
        width = 1200;
        height = 800;
      }
      
      // Get caption from various sources
      let caption = '';
      
      // First try figcaption
      const figure = img.closest('figure');
      if (figure) {
        const figcaption = figure.querySelector('figcaption');
        if (figcaption) {
          caption = figcaption.innerHTML.trim();
        }
      }
      
      // Fallback to alt or title
      if (!caption) {
        caption = img.alt || img.title || '';
      }
      
      return {
        src: img.src,
        width: width,
        height: height,
        alt: img.alt || '',
        caption: caption,
        element: img
      };
    }
  });

  // Initialize the dynamic caption plugin
  const captionPlugin = new PhotoSwipeDynamicCaption(lightbox, {
    captionContent: (slide) => {
      return slide.data.caption || slide.data.alt || '';
    },
    type: 'auto',
    horizontalEdgeThreshold: 20,
    mobileCaptionOverlapRatio: 0.3,
    mobileLayoutBreakpoint: 600,
    verticallyCenterImage: false
  });

  // Add custom event listeners
  lightbox.on('beforeOpen', () => {
    // Optional: Add loading state
    document.body.style.overflow = 'hidden';
  });

  lightbox.on('destroy', () => {
    document.body.style.overflow = '';
  });

  // Handle image load errors
  lightbox.on('loadComplete', (e) => {
    if (!e.slide.data.src) {
      console.warn('PhotoSwipe: Image source not found');
    }
  });

  // Initialize keyboard navigation
  lightbox.on('keydown', (e) => {
    const { originalEvent } = e;
    
    if (originalEvent.code === 'Escape') {
      lightbox.close();
    }
  });

  // Initialize the lightbox
  lightbox.init();
  
  return lightbox;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPhotoSwipe);
} else {
  initPhotoSwipe();
}
