function initAnimations() {
  if (!window.IntersectionObserver) {
    // Fallback for older browsers
    document.querySelectorAll('.reveal').forEach(element => {
      element.classList.add('active');
    });
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(element => {
    observer.observe(element);
  });
}

function hideLoader(minTime = 2500) {
  const loaderStart = Date.now();
  
  const removeLoader = () => {
    const elapsed = Date.now() - loaderStart;
    const loader = document.getElementById("music-loader");
    if (!loader) return;
    
    if (elapsed >= minTime) {
      loader.style.opacity = "0";
      setTimeout(() => loader.style.display = "none", 500);
    } else {
      setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => loader.style.display = "none", 500);
      }, minTime - elapsed);
    }
  };

  if (document.readyState === 'complete') {
    removeLoader();
  } else {
    window.addEventListener("load", removeLoader);
  }
}

function initScrambleEffect(elementId, duration = 1800) {
  const el = document.getElementById(elementId);
  if (!el) return;
  
  const text = el.getAttribute("data-text") || el.textContent;
  el.textContent = "";
  
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~";
  let elapsed = 0;
  
  // start scrambling when element comes into view
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        obs.unobserve(entry.target);
        const scrambleInterval = setInterval(() => {
          let out = "";
          for (let i = 0; i < text.length; i++) {
            if (text[i] === " ") {
              out += " ";
            } else {
              out += Math.random() < 0.5 ? chars[Math.floor(Math.random() * chars.length)] : text[i];
            }
          }
          el.textContent = out;
          elapsed += 40;
          if (elapsed > duration) {
            clearInterval(scrambleInterval);
            el.textContent = text;
          }
        }, 40);
      }
    });
  });
  
  observer.observe(el);
}
