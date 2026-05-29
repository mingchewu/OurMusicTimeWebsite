

function initApp() {
  // Initialize loader
  try { hideLoader(2000); } catch(e) { console.error(e); }
  
  // Initialize components
  try { initNavbar(); } catch(e) { console.error(e); }
  try { initGallery(); } catch(e) { console.error(e); }
  try { initUtils(); } catch(e) { console.error(e); }
  
  // Note: For Chinese page, we pass translated faqData. 
  try { initFAQ(); } catch(e) { console.error(e); }
  
  // Initialize animations
  try { initAnimations(); } catch(e) { 
    console.error(e);
    // Safety fallback: reveal everything immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
  }
  try { initScrambleEffect('hero-scramble-text', 1500); } catch(e) { console.error(e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
