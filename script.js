/**
 * Hareesh L - Portfolio Logic & Interactive Canvas Animation
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. MOBILE MENU TOGGLE
  // ==========================================================================
  const menuToggle = document.querySelector('.menu-toggle');
  const navbar = document.getElementById('main-nav');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navbar.classList.toggle('mobile-active');
      const icon = menuToggle.querySelector('i');
      if (navbar.classList.contains('mobile-active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });
  }

  // Close menu when clicking link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('mobile-active');
      const icon = menuToggle?.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    });
  });


  // ==========================================================================
  // 2. SCROLL EFFECT ON NAVBAR & SCROLL SPY
  // ==========================================================================
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    // Background highlight scrolled nav
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll Spy active navigation state
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 250)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });


  // ==========================================================================
  // 3. TYPING TEXT EFFECT (HERO SECTION)
  // ==========================================================================
  const typingTextSpan = document.querySelector('.typing-text');
  const professions = [
    'System Operator & Full-stack Developer',
    'MCA Student & AI Enthusiast',
    'Full-Stack Web Engineer'
  ];
  let professionIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentText = professions[professionIndex];
    if (isDeleting) {
      typingTextSpan.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50; // Deletes faster
    } else {
      typingTextSpan.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 120; // Types at normal speed
    }

    if (!isDeleting && charIndex === currentText.length) {
      // Pause at full word
      typingSpeed = 2000; 
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      professionIndex = (professionIndex + 1) % professions.length;
      typingSpeed = 500; // Pause before typing next word
    }

    setTimeout(type, typingSpeed);
  }

  if (typingTextSpan) {
    type();
  }


  // ==========================================================================
  // 4. INTERACTIVE FACE CANVAS ANIMATION
  // ==========================================================================
  const canvas = document.getElementById('face-canvas');
  const ctx = canvas?.getContext('2d');
  const faceContainer = document.getElementById('face-container');
  const loader = document.getElementById('canvas-loader');
  const heroSection = document.getElementById('hero');

  // Aligned vertical portrait frames for clean horizontal sweep (5 frames)
  const framePaths = [
    'face/portrait_2.png', // Left Profile
    'face/portrait_1.png', // Mid-Left
    'face/portrait_0.png', // Center
    'face/portrait_5.png', // Mid-Right
    'face/portrait_4.png'  // Right Profile
  ];
  const totalFrames = framePaths.length;
  const preloadedImages = [];
  let loadedCount = 0;
  let currentFrame = 2; // Center frame by default (2 is center of 0-4)
  let targetFrame = 2;
  let isHovered = false;
  let isLoaded = false;

  // Preload aligned face rotation images
  function preloadImages() {
    for (let i = 0; i < totalFrames; i++) {
      const img = new Image();
      img.src = framePaths[i];
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          isLoaded = true;
          // Hide loading spinner
          if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
          }
          // Set canvas internal dimensions to match our 600x800 vertical aligned images
          if (canvas) {
            canvas.width = 600;
            canvas.height = 800;
            drawFrame(2); // Draw initial center frame
          }
        }
      };
      img.onerror = () => {
        console.error(`Failed to load face frame: ${framePaths[i]}`);
      };
      preloadedImages.push(img);
    }
  }

  function drawFrame(index) {
    if (!ctx || !canvas || preloadedImages.length === 0) return;
    
    // Round to the nearest frame index for a sharp, clean transition without double-exposure ghosting
    const clampedIndex = Math.max(0, Math.min(totalFrames - 1, Math.round(index)));
    const img = preloadedImages[clampedIndex];

    if (img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1.0;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }

  // Horizontal scrub, 3D parallax tilt, and dynamic proximity glow handler
  function handleRotationAndTilt(clientX, clientY) {
    if (!heroSection || !faceContainer) return;
    
    isHovered = true;
    const rect = heroSection.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;

    // 1. Calculate horizontal ratio (0 to 1) for frame scrubbing
    const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
    // Mouse on left (ratio=0) -> TargetFrame=0 (Left profile)
    // Mouse on right (ratio=1) -> TargetFrame=4 (Right profile)
    targetFrame = ratio * (totalFrames - 1);

    // 2. 3D Parallax tilt effect on the canvas container
    const tiltX = ((relativeX / rect.width) - 0.5) * 12; // range -6 to 6 deg
    const tiltY = -((relativeY / rect.height) - 0.5) * 12; // range -6 to 6 deg
    
    faceContainer.style.transform = `perspective(1000px) rotateX(${tiltY}deg) rotateY(${tiltX}deg) scale(1.02)`;

    // 3. Proximity-based border and box shadow glow calculation
    const cardRect = faceContainer.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;
    
    const dx = clientX - cardCenterX;
    const dy = clientY - cardCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const maxDistance = 700; // Activation distance in pixels
    const proximity = Math.max(0, Math.min(1, 1 - (distance / maxDistance)));
    
    // Proximity maps border opacity from 0.25 to 0.95, and shadow opacity from 0.12 to 0.45
    const borderOpacity = 0.25 + proximity * 0.7;
    const shadowOpacity = 0.12 + proximity * 0.33;
    
    faceContainer.style.setProperty('--proximity-glow', borderOpacity);
    faceContainer.style.setProperty('--proximity-glow-shadow', shadowOpacity);
  }

  function resetTilt() {
    isHovered = false;
    if (faceContainer) {
      faceContainer.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
      faceContainer.style.setProperty('--proximity-glow', '0.25');
      faceContainer.style.setProperty('--proximity-glow-shadow', '0.12');
    }
  }

  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      if (isLoaded) handleRotationAndTilt(e.clientX, e.clientY);
    });

    heroSection.addEventListener('mouseleave', () => {
      resetTilt();
    });

    // Touch events for mobile support
    heroSection.addEventListener('touchmove', (e) => {
      if (isLoaded && e.touches.length > 0) {
        handleRotationAndTilt(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    heroSection.addEventListener('touchend', () => {
      resetTilt();
    });
  }

  // Smooth interpolation and render loop
  function animationLoop() {
    if (isLoaded) {
      if (!isHovered) {
        // Idle loop: oscillate gently around the center frame (2)
        const time = Date.now() * 0.0015;
        targetFrame = 2 + Math.sin(time) * 1.2; // oscillates between index 0.8 and 3.2
        currentFrame += (targetFrame - currentFrame) * 0.06;
      } else {
        // Active scrubbing: follow cursor quickly but smoothly
        currentFrame += (targetFrame - currentFrame) * 0.15;
      }
      drawFrame(currentFrame);
    }
    requestAnimationFrame(animationLoop);
  }

  // Initialize preloader and rendering loop
  preloadImages();
  requestAnimationFrame(animationLoop);


  // ==========================================================================
  // 5. INTERSECTION OBSERVER FOR FADE-IN SECTIONS
  // ==========================================================================
  const fadeItems = document.querySelectorAll('.card, .timeline-item, .skills-category-card, .project-card, .about-text-card, .stats-card');

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const fadeInObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, observerOptions);

  fadeItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    fadeInObserver.observe(item);
  });


  // ==========================================================================
  // 6. DYNAMIC RESUME GENERATOR & DOWLOAD WINDOW
  // ==========================================================================
  // Note: The resume download button now directly downloads the file from the 'resume' folder.

});
