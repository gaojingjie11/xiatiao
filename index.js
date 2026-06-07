/* ==========================================================================
   scripts.js - ADVANCED INTERACTIVE ENGINE & SOUND SYNTHESIS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Global State
  let musicStarted = false;
  let activeTheme = 'theme-dark';
  let particleColor = '#E2C39C';
  let audioCtx = null;
  let activeSectionId = 'sec-story';
  let isTransitioning = false;
  let maxUnlockedSectionIndex = 2; // 0: story, 1: gallery, 2: blessings (unlocked from start)

  // Prevent browser from restoring scroll position on reload
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // DOM Elements
  const splashOverlay = document.getElementById('splash-overlay');
  const waxSealBtn = document.getElementById('wax-seal-btn');
  const envelopeBox = document.getElementById('envelope-box');
  const enterBtn = document.getElementById('enter-btn');
  const mainContent = document.getElementById('main-content');
  const bgAudio = document.getElementById('bg-audio');
  const musicToggleBtn = document.getElementById('music-toggle-btn');
  const musicWidget = document.querySelector('.music-widget');
  const ambientCanvas = document.getElementById('ambient-canvas');

  // Password Elements
  const pwdModal = document.getElementById('password-modal');
  const pwdInput = document.getElementById('pwd-input');
  const pwdConfirmBtn = document.getElementById('pwd-confirm-btn');
  const pwdCancelBtn = document.getElementById('pwd-cancel-btn');
  const pwdErrorMsg = document.getElementById('pwd-error-msg');
  
  // Lightbox
  const lightboxOverlay = document.getElementById('lightbox-overlay');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');

  // Decks & Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // SVG Timeline
  const timelineSvg = document.getElementById('timeline-svg-wire');
  const timelinePath = document.getElementById('timeline-path-wire');
  const timelineItems = document.querySelectorAll('.timeline-item');
  const scrollElements = document.querySelectorAll('.reveal-on-scroll');

  // Act 1 Timeline Page-flipping elements
  const timelinePrevBtn = document.getElementById('timeline-prev-btn');
  const timelineNextBtn = document.getElementById('timeline-next-btn');
  const timelineIndicator = document.getElementById('timeline-indicator');
  const chefPopupContainer = document.getElementById('chef-popup-container');
  const chefPopupImg = document.getElementById('chef-popup-img');
  let currentTimelineIndex = 0;

  // 3D Gift Greeting Card
  const giftCard3D = document.getElementById('gift-card-3d');
  const closeCardBtn = document.getElementById('close-card-btn');

  // 3D Photo Vortex Transition
  const vortexStartBtn = document.getElementById('vortex-start-btn');
  const transitionVortex = document.getElementById('transition-vortex');
  const vortexRing = document.getElementById('vortex-ring');

  /* ==========================================================================
     🔊 1. WEB AUDIO API SYNTHESIZER (PHYSICAL SOUND FX GENERATOR)
     ========================================================================== */
  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize a gentle digital hover bell ("ding")
  function playChime(freq = 900, duration = 0.15) {
    try {
      initAudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, audioCtx.currentTime + duration);
      
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.log('Web Audio context not initialized yet.');
    }
  }

  // Synthesize paper unfolding tear sound (FM noise)
  function playTear() {
    try {
      initAudioContext();
      const bufferSize = audioCtx.sampleRate * 0.4;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.35);
      filter.Q.setValueAtTime(3.0, audioCtx.currentTime);
      
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.38);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      
      // Add a subtle high-frequency chime at the same time
      playChime(1500, 0.2);
      
      noise.start();
      noise.stop(audioCtx.currentTime + 0.4);
    } catch(e) {}
  }

  // Synthesize a low buzzer tone for wrong actions
  function playBuzzer() {
    try {
      initAudioContext();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log('Web Audio context not initialized yet.');
    }
  }

  // Synthesize confetti party popper sound (explosion snaps)
  function playConfettiPopper() {
    try {
      initAudioContext();
      // Main explosive puff
      const duration = 0.5;
      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);
      
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      
      noise.start();
      noise.stop(audioCtx.currentTime + duration);

      // Trigger 3 tiny high frequency crackles in quick succession
      for (let offset = 0.05; offset <= 0.15; offset += 0.05) {
        setTimeout(() => {
          playChime(1800 + Math.random() * 400, 0.06);
        }, offset * 1000);
      }
    } catch(e) {}
  }

  // Synthesize portal whoosh sound (sweeping bandpass noise + chimes)
  function playPortalWhoosh() {
    try {
      initAudioContext();
      const duration = 2.4;
      const bufferSize = audioCtx.sampleRate * duration;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(80, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1600, audioCtx.currentTime + 1.2);
      filter.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 2.4);
      
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + 1.0);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.4);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      
      noise.start();
      noise.stop(audioCtx.currentTime + duration);

      // Play escalating chime sequence
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          playChime(600 + i * 150, 0.25);
        }, i * 200);
      }
    } catch(e) {}
  }

  // Attach hover sounds to interactive elements
  const interactiveElements = document.querySelectorAll('.tab-btn, .deck-nav-btn, .glow-btn, #floating-nav a, .simple-btn');
  interactiveElements.forEach(btn => {
    btn.addEventListener('mouseenter', () => playChime(1100, 0.05));
  });

  /* ==========================================================================
     🌟 2. AMBIENT NEBULA & CONSTELATIONS PARALLAX CANVAS
     ========================================================================== */
  const ctx = ambientCanvas.getContext('2d');
  let particles = [];
  let heartBubbles = [];
  const particleCount = 50;

  function resizeCanvas() {
    ambientCanvas.width = window.innerWidth;
    ambientCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class SakuraPetal {
    constructor() {
      this.reset();
      this.y = Math.random() * ambientCanvas.height;
    }

    reset() {
      this.x = Math.random() * ambientCanvas.width;
      this.y = -20;
      this.size = Math.random() * 8 + 6;
      this.speedX = Math.random() * 1.5 - 0.5; // Drift sideways
      this.speedY = Math.random() * 1.2 + 0.8; // Fall speed
      this.alpha = Math.random() * 0.7 + 0.3;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = Math.random() * 0.02 - 0.01;
      this.swingWidth = Math.random() * 1.5 + 0.5;
      this.swingTime = Math.random() * 100;
    }

    update() {
      this.y += this.speedY;
      this.swingTime += 0.02;
      this.x += this.speedX + Math.sin(this.swingTime) * this.swingWidth;
      this.angle += this.spinSpeed;

      // Wrap if outside screen boundaries
      if (this.y > ambientCanvas.height + 20) {
        this.reset();
      }
      if (this.x < -20) this.x = ambientCanvas.width + 10;
      if (this.x > ambientCanvas.width + 20) this.x = -10;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = particleColor;
      
      // Draw a cute sakura petal shape using bezier curves
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, this.size/3, 0, this.size);
      ctx.bezierCurveTo(this.size, this.size/3, this.size/2, -this.size/2, 0, 0);
      ctx.closePath();
      ctx.fill();
      
      // Add a center notch
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, this.size * 0.2);
      ctx.lineTo(-this.size * 0.1, this.size * 0.4);
      ctx.lineTo(this.size * 0.1, this.size * 0.4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  class HeartBubble {
    constructor() {
      this.x = Math.random() * ambientCanvas.width;
      this.y = ambientCanvas.height + 20;
      this.size = Math.random() * 12 + 8;
      this.speedY = -(Math.random() * 1.5 + 0.8); // Rise up
      this.speedX = Math.random() * 0.6 - 0.3;
      this.alpha = 1;
      this.decay = Math.random() * 0.008 + 0.004;
      this.swingTime = Math.random() * 100;
    }

    update() {
      this.y += this.speedY;
      this.swingTime += 0.03;
      this.x += this.speedX + Math.sin(this.swingTime) * 0.6;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = particleColor;
      
      // Draw a cute heart shape
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, 0, 0, this.size * 0.8);
      ctx.bezierCurveTo(this.size, 0, this.size/2, -this.size/2, 0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new SakuraPetal());
    }
  }
  initParticles();

  function animateParticles() {
    ctx.clearRect(0, 0, ambientCanvas.width, ambientCanvas.height);
    
    // Update & Draw Sakura Petals
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Spawn Heart Bubbles occasionally in dark/blessings/weird themes
    if ((activeTheme === 'theme-dark' || activeTheme === 'theme-blessings' || activeTheme === 'theme-weird') && Math.random() < 0.012) {
      heartBubbles.push(new HeartBubble());
    }

    // Draw & update heart bubbles
    heartBubbles = heartBubbles.filter(b => b.alpha > 0);
    heartBubbles.forEach(b => {
      b.update();
      b.draw();
    });

    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  function updateParticlesForTheme(theme) {
    if (theme === 'theme-dark') {
      particleColor = '#4DB6AC'; // Soft mint-teal sakura/heart
    } else if (theme === 'theme-business') {
      particleColor = '#C68B59';
    } else if (theme === 'theme-travel') {
      particleColor = '#81C784'; // Soft mint green leaves
    } else if (theme === 'theme-weird') {
      particleColor = '#64B5F6'; // Soft sky blue particles
    } else if (theme === 'theme-blessings') {
      particleColor = '#81D4FA'; // Baby blue bubbles/hearts
    }
  }

  /* ==========================================================================
     💌 3. 3D ENVELOPE OPENING & SPLASH ENGINE
     ========================================================================== */
  // Handle Wax Seal click (shows custom hand-drawn password modal)
  waxSealBtn.addEventListener('click', () => {
    playChime(700, 0.15);
    pwdModal.classList.add('show');
    pwdInput.value = '';
    pwdErrorMsg.textContent = '';
    setTimeout(() => pwdInput.focus(), 100);
  });

  // Handle password cancel
  pwdCancelBtn.addEventListener('click', () => {
    playChime(500, 0.1);
    pwdModal.classList.remove('show');
  });

  // Function to verify password
  function checkPassword() {
    const value = pwdInput.value.trim();
    if (value === '0609') {
      playChime(1000, 0.25);
      pwdModal.classList.remove('show');
      
      // Open the envelope
      playTear();
      splashOverlay.classList.add('opened');
    } else {
      // Play error tone
      playBuzzer();
      
      // Shake the card
      const modalCard = pwdModal.querySelector('.pwd-modal-card');
      modalCard.classList.add('shake');
      pwdErrorMsg.textContent = '你不是虾条本人！ 🤫';
      
      setTimeout(() => {
        modalCard.classList.remove('shake');
      }, 400);
      
      pwdInput.select();
    }
  }

  // Handle confirm click
  pwdConfirmBtn.addEventListener('click', checkPassword);

  // Handle Enter key in input
  pwdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      checkPassword();
    }
  });

  enterBtn.addEventListener('click', () => {
    // Only allow when envelope is opened
    if (!splashOverlay.classList.contains('opened')) return;

    playChime(1200, 0.3);
    
    // Apply scale Implosion/dissolve transition
    splashOverlay.classList.add('dissolve');
    
    setTimeout(() => {
      splashOverlay.classList.add('hidden');
      mainContent.classList.remove('hidden');
      
      // Auto Play Music
      playAudio();
      
      // Initial calculations
      initSections();
      recalculateTimelineSVG();
      checkScrollReveal();
    }, 800);
  });

  /* ==========================================================================
     🎵 4. MUSIC EQUALIZER & AUDIO CONTROLS
     ========================================================================== */
  musicToggleBtn.addEventListener('click', () => {
    if (bgAudio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  });

  function playAudio() {
    bgAudio.play()
      .then(() => {
        musicWidget.classList.add('playing');
        musicToggleBtn.classList.remove('paused');
        document.querySelector('.music-text').textContent = '音乐中';
        musicStarted = true;
      })
      .catch(err => {
        console.log("Audio autoplay deferred: waiting interaction.", err);
      });
  }

  function pauseAudio() {
    bgAudio.pause();
    musicWidget.classList.remove('playing');
    musicToggleBtn.classList.add('paused');
    document.querySelector('.music-text').textContent = '音乐静音';
  }

  /* ==========================================================================
     🖼️ 5. LIGHTBOX SYSTEM
     ========================================================================== */
  const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');

  lightboxTriggers.forEach(img => {
    img.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering card deck flips when clicking image
      const src = img.getAttribute('src');
      const captionText = img.closest('.deck-card') 
        ? img.closest('.deck-card').querySelector('h4').textContent
        : img.alt;
      
      lightboxImg.setAttribute('src', src);
      lightboxCaption.textContent = captionText;
      lightboxOverlay.classList.remove('hidden');
      playChime(950, 0.1);
    });
  });

  function closeLightbox() {
    lightboxOverlay.classList.add('hidden');
    setTimeout(() => {
      lightboxImg.setAttribute('src', '');
    }, 300);
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay || e.target === lightboxClose) {
      closeLightbox();
    }
  });

  /* ==========================================================================
     🧵 6. SELF-GENERATING SVG CONSTELLATION TIMELINE PATH
     ========================================================================== */
  function recalculateTimelineSVG() {
    if (window.innerWidth <= 1024) return; // Disable wire drawing on mobile stacks

    const wrapperRect = document.querySelector('.timeline-relative-box').getBoundingClientRect();
    const numbers = document.querySelectorAll('.timeline-number');
    
    if (numbers.length === 0) return;
    
    // Resize SVG container to match wrapper height
    timelineSvg.style.height = `${wrapperRect.height}px`;
    timelineSvg.setAttribute('viewBox', `0 0 ${wrapperRect.width} ${wrapperRect.height}`);

    let pathD = "";
    
    numbers.forEach((num, index) => {
      const numRect = num.getBoundingClientRect();
      // Compute center coordinate of timeline dots relative to SVG canvas
      const x = numRect.left + numRect.width / 2 - wrapperRect.left;
      const y = numRect.top + numRect.height / 2 - wrapperRect.top;

      if (index === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        const prevRect = numbers[index - 1].getBoundingClientRect();
        const prevY = prevRect.top + prevRect.height / 2 - wrapperRect.top;
        const prevX = prevRect.left + prevRect.width / 2 - wrapperRect.left;
        
        // Draw a smooth snake-like cubic Bezier curve around elements
        const ctrlY1 = prevY + (y - prevY) * 0.4;
        const ctrlY2 = prevY + (y - prevY) * 0.6;
        
        // Wave left or right depending on row layout
        const offsetMultiplier = (index % 2 === 0) ? -80 : 80;
        const ctrlX1 = prevX + offsetMultiplier;
        const ctrlX2 = x - offsetMultiplier;
        
        pathD += ` C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${x} ${y}`;
      }
    });

    timelinePath.setAttribute('d', pathD);
    
    // Set dash arrays
    const pathLength = timelinePath.getTotalLength();
    timelinePath.style.strokeDasharray = pathLength;
    timelinePath.style.strokeDashoffset = pathLength;
  }

  window.addEventListener('resize', () => {
    recalculateTimelineSVG();
  });

  // Synchronize timeline stroke dashoffset with scroll coordinates
  function updateTimelineSVGDrawing() {
    if (window.innerWidth <= 1024) return;
    
    const wrapper = document.querySelector('.timeline-relative-box');
    if (!wrapper) return;
    
    const rect = wrapper.getBoundingClientRect();
    const scrollTop = window.scrollY;
    
    // Calculate scroll progress through the timeline area
    const triggerStart = rect.top + scrollTop - window.innerHeight / 2;
    const triggerEnd = rect.bottom + scrollTop - window.innerHeight / 2;
    
    let progress = (scrollTop - triggerStart) / (triggerEnd - triggerStart);
    progress = Math.max(0, Math.min(1, progress));
    
    const pathLength = timelinePath.getTotalLength();
    const offset = pathLength - (progress * pathLength);
    
    timelinePath.style.strokeDashoffset = offset;
  }

  /* ==========================================================================
     📖 6.5 ACT 1 TIMELINE SLIDESHOW & CHEF TRANSITION POPUPS
     ========================================================================== */
  function initTimelineSlideshow() {
    if (timelineItems.length > 0) {
      timelineItems.forEach((item, index) => {
        if (index === 0) {
          item.classList.add('active-slide');
          item.classList.add('active'); // compatibility with scroll reveals
        } else {
          item.classList.remove('active-slide');
          item.classList.remove('active');
        }
      });
      updateTimelineIndicator();
    }
  }

  function updateTimelineIndicator() {
    if (timelineIndicator) {
      timelineIndicator.textContent = `${currentTimelineIndex + 1} / ${timelineItems.length}`;
    }
  }

  function triggerChefTransition(isNext, callback) {
    if (!chefPopupContainer || !chefPopupImg) {
      callback();
      return;
    }

    // Set appropriate image source
    chefPopupImg.src = isNext ? 'chef_check.png' : 'chef_cross.png';

    // Show popup overlay
    chefPopupContainer.classList.remove('hidden');

    // Add CSS pop and scale animation
    chefPopupImg.classList.add('chef-pop-animation');

    // Trigger state change halfway through transition pop
    setTimeout(() => {
      callback();
    }, 280);

    // Clean up animation class and hide container when done
    setTimeout(() => {
      chefPopupContainer.classList.add('hidden');
      chefPopupImg.classList.remove('chef-pop-animation');
    }, 800);
  }

  if (timelinePrevBtn && timelineNextBtn) {
    timelinePrevBtn.addEventListener('click', () => {
      if (currentTimelineIndex > 0) {
        triggerChefTransition(false, () => {
          timelineItems[currentTimelineIndex].classList.remove('active-slide');
          currentTimelineIndex--;
          timelineItems[currentTimelineIndex].classList.add('active-slide');
          timelineItems[currentTimelineIndex].classList.add('active');
          updateTimelineIndicator();
        });
      } else {
        playChime(600, 0.1);
      }
    });

    timelineNextBtn.addEventListener('click', () => {
      if (currentTimelineIndex < timelineItems.length - 1) {
        triggerChefTransition(true, () => {
          timelineItems[currentTimelineIndex].classList.remove('active-slide');
          currentTimelineIndex++;
          timelineItems[currentTimelineIndex].classList.add('active-slide');
          timelineItems[currentTimelineIndex].classList.add('active');
          updateTimelineIndicator();
        });
      } else {
        // Transition from Act 1 (Timeline) to Act 2 (Gallery) at the last page
        maxUnlockedSectionIndex = Math.max(maxUnlockedSectionIndex, 1);
        switchToSection('sec-gallery');
      }
    });
  }

  // Initialize slides on load
  initTimelineSlideshow();

  /* ==========================================================================
     🎴 7. 3D "TINDER-STYLE" CARD DECK CAROUSEL CLASS
     ========================================================================== */
  class CardDeck {
    constructor(deckId, indicatorId) {
      this.deck = document.getElementById(deckId);
      this.indicator = document.getElementById(indicatorId);
      this.cards = Array.from(this.deck.querySelectorAll('.deck-card'));
      this.currentIndex = 0;
      this.totalCards = this.cards.length;
      this.isAnimating = false;

      this.initDeck();
      this.bindDragEvents();
    }

    initDeck() {
      this.updateCardClasses();
      this.updateIndicator();
    }

    updateCardClasses() {
      this.cards.forEach((card, index) => {
        // Clear old classes
        card.className = 'deck-card';
        card.style.transform = '';
        
        const relativeIndex = (index - this.currentIndex + this.totalCards) % this.totalCards;

        if (relativeIndex === 0) {
          card.classList.add('layer-0');
        } else if (relativeIndex === 1) {
          card.classList.add('layer-1');
        } else if (relativeIndex === 2) {
          card.classList.add('layer-2');
        } else {
          card.classList.add('layer-hidden');
        }
      });
    }

    updateIndicator() {
      if (this.indicator) {
        this.indicator.textContent = `${this.currentIndex + 1} / ${this.totalCards}`;
      }
    }

    nextCard() {
      if (this.isAnimating) return;

      // If we are at the last card of this deck, navigate to the next tab or act
      if (this.currentIndex === this.totalCards - 1) {
        const type = this.deck.id === 'deck-business-cards' ? 'business' :
                     this.deck.id === 'deck-travel-cards' ? 'travel' : 'weird';
        
        if (type === 'business') {
          const btnTravel = document.getElementById('tab-btn-travel');
          if (btnTravel) btnTravel.click();
          if (decks.travel) {
            decks.travel.currentIndex = 0;
            decks.travel.updateCardClasses();
            decks.travel.updateIndicator();
          }
        } else if (type === 'travel') {
          const btnWeird = document.getElementById('tab-btn-weird');
          if (btnWeird) btnWeird.click();
          if (decks.weird) {
            decks.weird.currentIndex = 0;
            decks.weird.updateCardClasses();
            decks.weird.updateIndicator();
          }
        } else if (type === 'weird') {
          // Swipe boundary -> Switch to Act 3
          maxUnlockedSectionIndex = Math.max(maxUnlockedSectionIndex, 2);
          switchToSection('sec-blessings');
        }
        return;
      }

      this.isAnimating = true;
      playChime(850, 0.12);

      const activeCard = this.cards[this.currentIndex];
      // Animate card flying right
      activeCard.classList.add('swipe-out-right');

      setTimeout(() => {
        // Increment index
        this.currentIndex = (this.currentIndex + 1) % this.totalCards;
        this.updateCardClasses();
        this.updateIndicator();
        this.isAnimating = false;
        
        // Update vortex button visibility
        updateVortexButtonVisibility();
      }, 500);
    }

    prevCard() {
      if (this.isAnimating) return;

      // If we are at the first card of this deck, navigate to the previous tab or act
      if (this.currentIndex === 0) {
        const type = this.deck.id === 'deck-business-cards' ? 'business' :
                     this.deck.id === 'deck-travel-cards' ? 'travel' : 'weird';
                     
        if (type === 'business') {
          switchToSection('sec-story');
        } else if (type === 'travel') {
          const btnBusiness = document.getElementById('tab-btn-business');
          if (btnBusiness) btnBusiness.click();
          if (decks.business) {
            decks.business.currentIndex = decks.business.totalCards - 1;
            decks.business.updateCardClasses();
            decks.business.updateIndicator();
          }
        } else if (type === 'weird') {
          const btnTravel = document.getElementById('tab-btn-travel');
          if (btnTravel) btnTravel.click();
          if (decks.travel) {
            decks.travel.currentIndex = decks.travel.totalCards - 1;
            decks.travel.updateCardClasses();
            decks.travel.updateIndicator();
          }
        }
        return;
      }

      this.isAnimating = true;
      playChime(750, 0.12);

      // Slide bottom card out and place it on top
      const prevIndex = (this.currentIndex - 1 + this.totalCards) % this.totalCards;
      const targetCard = this.cards[prevIndex];

      // Hide at bottom position first
      targetCard.className = 'deck-card swipe-out-left';
      
      setTimeout(() => {
        this.currentIndex = prevIndex;
        this.updateCardClasses();
        this.updateIndicator();
        this.isAnimating = false;
        
        // Update vortex button visibility
        updateVortexButtonVisibility();
      }, 100);
    }

    // Touch swiping capability for mobile
    bindDragEvents() {
      let startX = 0;
      let startY = 0;
      let currentX = 0;
      let isDragging = false;
      let activeCard = null;

      const onStart = (e) => {
        if (this.isAnimating) return;
        activeCard = this.cards[this.currentIndex];
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        isDragging = true;
        
        activeCard.style.transition = 'none';
      };

      const onMove = (e) => {
        if (!isDragging || !activeCard) return;
        const touch = e.touches ? e.touches[0] : e;
        currentX = touch.clientX - startX;
        const currentY = touch.clientY - startY;

        // Only handle drag if it's horizontal
        if (Math.abs(currentX) > Math.abs(currentY)) {
          e.preventDefault(); // Prevent scroll
          const rotation = currentX / 15;
          activeCard.style.transform = `translate3d(${currentX}px, 0, 0) rotate(${rotation}deg) scale(1.02)`;
        }
      };

      const onEnd = () => {
        if (!isDragging || !activeCard) return;
        isDragging = false;
        
        activeCard.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        
        if (currentX > 100) {
          // Swipe right next card
          this.nextCard();
        } else if (currentX < -100) {
          // Swipe left prev card
          this.prevCard();
        } else {
          // Snap back
          activeCard.style.transform = '';
        }
        
        currentX = 0;
        activeCard = null;
      };

      // Mouse Listeners
      this.deck.addEventListener('mousedown', onStart);
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);

      // Touch Listeners
      this.deck.addEventListener('touchstart', onStart, { passive: true });
      this.deck.addEventListener('touchmove', onMove, { passive: false });
      this.deck.addEventListener('touchend', onEnd);
    }
  }

  // Initialize Card Decks
  let decks = {};
  setTimeout(() => {
    decks.business = new CardDeck('deck-business-cards', 'indicator-business');
    decks.travel = new CardDeck('deck-travel-cards', 'indicator-travel');
    decks.weird = new CardDeck('deck-weird-cards', 'indicator-weird');
    
    // Update button visibility on initial loading of decks
    updateVortexButtonVisibility();
  }, 100);

  // Deck button clicks
  document.querySelectorAll('.deck-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-deck');
      const isNext = btn.classList.contains('next');
      if (decks[type]) {
        if (isNext) decks[type].nextCard();
        else decks[type].prevCard();
      }
    });
  });

  /* ==========================================================================
     🖼️ 8. FADE-ON-SCROLL THEME CONTROLLER
     ========================================================================== */
  function checkScrollReveal() {
    const triggerBottom = (window.innerHeight / 10) * 8.5;

    scrollElements.forEach(el => {
      const elTop = el.getBoundingClientRect().top;
      
      if (elTop < triggerBottom) {
        if (!el.classList.contains('active')) {
          el.classList.add('active');
        }
      }
    });
  }

  // Initialize stage/acts layout and hide inactive sections
  function initSections() {
    const allSections = document.querySelectorAll('.section-container');
    allSections.forEach(sec => {
      if (sec.getAttribute('id') === activeSectionId) {
        sec.style.setProperty('display', 'flex', 'important');
        sec.classList.add('active-act');
      } else {
        sec.style.setProperty('display', 'none', 'important');
        sec.classList.remove('active-act');
      }
    });
    updateThemeAndNav();
    updateVortexButtonVisibility();
  }

  // Monitor Theme and Nav dots Switching based on activeSectionId state
  function updateThemeAndNav() {
    let currentSectionId = activeSectionId;

    // Update active dot in side nav
    navDots.forEach(dot => {
      if (dot.getAttribute('href') === `#${currentSectionId}`) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Determine theme classes on body
    let themeClass = 'theme-dark';

    if (currentSectionId === 'sec-story') {
      themeClass = 'theme-dark';
    } else if (currentSectionId === 'sec-gallery') {
      // Gallery section theme matches the active tab!
      const activeTabBtn = document.querySelector('.tab-btn.active');
      const currentTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : 'tab-business';
      
      if (currentTab === 'tab-business') {
        themeClass = 'theme-business';
        document.getElementById('orb-gallery-1').style.opacity = '0.35';
        document.getElementById('orb-gallery-2').style.opacity = '0.2';
      } else if (currentTab === 'tab-travel') {
        themeClass = 'theme-travel';
        document.getElementById('orb-gallery-1').style.opacity = '0.2';
        document.getElementById('orb-gallery-2').style.opacity = '0.35';
      } else if (currentTab === 'tab-weird') {
        themeClass = 'theme-weird';
        document.getElementById('orb-gallery-1').style.opacity = '0.4';
        document.getElementById('orb-gallery-2').style.opacity = '0.3';
      }
    } else if (currentSectionId === 'sec-blessings') {
      themeClass = 'theme-blessings';
    }

    if (activeTheme !== themeClass) {
      document.body.className = '';
      document.body.classList.add(themeClass);
      activeTheme = themeClass;
      updateParticlesForTheme(themeClass);
    }
  }

  // Active dot highlight and Scroll reveals
  const navDots = document.querySelectorAll('#floating-nav .nav-dot');

  // Intercept floating nav clicks to trigger custom funny photo transitions
  navDots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = dot.getAttribute('href').substring(1);
      switchToSection(targetId);
    });
  });

  window.addEventListener('scroll', () => {
    checkScrollReveal();
  });

  /* ==========================================================================
     🖼️ 9. GALLERY TABS SWITCHER SYSTEM
     ========================================================================== */
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update button state
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update panels display
      tabPanels.forEach(panel => {
        if (panel.getAttribute('id') === targetTab) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      // Force theme update instantly
      updateThemeAndNav();
      
      // Update vortex button visibility
      updateVortexButtonVisibility();
      
      // Re-trigger scroll reveal
      setTimeout(() => {
        checkScrollReveal();
      }, 100);
    });
  });

  /* ==========================================================================
     🎁 10. 3D FOLDING CARD & CONFETTI PIECES (ACT 3)
     ========================================================================== */
  const confettiCanvas = document.getElementById('confetti-canvas');
  const cctx = confettiCanvas.getContext('2d');
  let confettiPieces = [];
  let isGiftOpened = false;

  function resizeConfettiCanvas() {
    confettiCanvas.width = confettiCanvas.parentElement.offsetWidth;
    confettiCanvas.height = confettiCanvas.parentElement.offsetHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);

  class Confetti {
    constructor(x, y, isExplosion = false) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 8 + 4;
      this.color = `hsl(${Math.random() * 360}, 90%, 65%)`;
      
      if (isExplosion) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 15 + 4;
        this.speedX = Math.cos(angle) * velocity;
        this.speedY = Math.sin(angle) * velocity;
      } else {
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 4 + 2;
      }
      
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 6 - 3;
      this.opacity = 1;
      this.fade = isExplosion ? 0.012 : 0.005;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      
      this.speedY += 0.12; // Gravity
      this.rotation += this.rotationSpeed;
      this.opacity -= this.fade;
    }

    draw() {
      cctx.save();
      cctx.translate(this.x, this.y);
      cctx.rotate((this.rotation * Math.PI) / 180);
      cctx.globalAlpha = this.opacity;
      cctx.fillStyle = this.color;
      cctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      cctx.restore();
    }
  }

  function triggerExplosion(x, y) {
    for (let i = 0; i < 110; i++) {
      confettiPieces.push(new Confetti(x, y, true));
    }
  }

  function startFloatingConfetti() {
    if (Math.random() < 0.1) {
      confettiPieces.push(new Confetti(Math.random() * confettiCanvas.width, 0, false));
    }
  }

  function animateConfetti() {
    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    if (isGiftOpened) {
      startFloatingConfetti();
    }

    confettiPieces = confettiPieces.filter(p => p.opacity > 0);
    confettiPieces.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animateConfetti);
  }

  // Click on 3D Card
  giftCard3D.addEventListener('click', (e) => {
    if (isGiftOpened) return;
    
    // Synthesize popper sound effect
    playConfettiPopper();
    
    isGiftOpened = true;
    resizeConfettiCanvas();
    
    // Tilt folding book cover
    giftCard3D.classList.add('opened');
    
    const rect = giftCard3D.getBoundingClientRect();
    const x = rect.left + rect.width / 2 - confettiCanvas.getBoundingClientRect().left;
    const y = rect.top + rect.height / 2 - confettiCanvas.getBoundingClientRect().top;
    
    triggerExplosion(x, y);
    animateConfetti();
  });

  closeCardBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid triggering open card deck click handler on parent card container
    giftCard3D.classList.remove('opened');
    isGiftOpened = false;
    confettiPieces = [];
    playChime(600, 0.15);
  });

  const replayParticlesBtn = document.getElementById('replay-particles-btn');
  if (replayParticlesBtn) {
    replayParticlesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // 1. Close/reset the greeting card state
      giftCard3D.classList.remove('opened');
      isGiftOpened = false;
      confettiPieces = [];
      
      // 2. Play transition sound
      playPortalWhoosh();
      
      // 3. Show particle stage again and trigger
      const stage = document.getElementById('cake-particle-stage');
      if (stage) {
        // Reset stage text visibilities
        const title = stage.querySelector('.cake-title');
        const subtitle = stage.querySelector('.cake-subtitle');
        const prompt = stage.querySelector('.cake-prompt-container');
        const promptText = stage.querySelector('.cake-prompt-text');
        const promptSub = stage.querySelector('.cake-prompt-sub');
        if (title) title.classList.remove('show');
        if (subtitle) subtitle.classList.remove('show');
        if (prompt) prompt.classList.remove('show');
        if (promptText) {
          promptText.textContent = "💡 点击蜡烛、敲击空格或对着麦克风吹气，点亮生日蛋糕";
          promptText.style.color = "";
          promptText.style.textShadow = "";
        }
        if (promptSub) {
          promptSub.textContent = "(如果麦克风不灵可以尝试敲空格键，手机长按屏幕)";
        }
        
        stage.classList.remove('hidden');
        
        // Reset initialized state and trigger system
        cakeParticleSystemInitialized = false;
        triggerCakeCountdownIfNeeded();
      }
    });
  }

  /* ==========================================================================
     🌀 11. 用搞怪照片的时光转场动画 (BLOOPER PHOTO TRANSITION SYSTEM)
     ========================================================================== */
  function switchToSection(targetSectionId) {
    if (isTransitioning || targetSectionId === activeSectionId) return;

    // Check target progression index to lock forward skips
    const sectionIndices = {
      'sec-story': 0,
      'sec-gallery': 1,
      'sec-blessings': 2
    };

    const targetIdx = sectionIndices[targetSectionId];
    if (targetIdx !== undefined && targetIdx > maxUnlockedSectionIndex) {
      playChime(600, 0.15); // Play chime indicating locked dot
      return;
    }

    // SPECIAL CASE: Act 2 to Act 3 transition ALWAYS plays the 3D vortex spinner
    if (activeSectionId === 'sec-gallery' && targetSectionId === 'sec-blessings') {
      startVortexTransition();
      return;
    }

    isTransitioning = true;

    // 1. Play portal sound effect (whoosh)
    playPortalWhoosh();

    const overlay = document.getElementById('blooper-transition-overlay');
    const images = overlay.querySelectorAll('.blooper-trans-img');
    const text = overlay.querySelector('.blooper-transition-text');

    // Reset styles
    images.forEach(img => {
      img.className = img.className.split(' ')[0] + ' ' + img.className.split(' ')[1]; // keep base and img-N classes
      img.style.removeProperty('--dx');
      img.style.removeProperty('--dy');
      img.style.removeProperty('--dr');
    });
    text.classList.remove('show');

    // 2. Show transition overlay
    overlay.classList.remove('hidden');

    // 3. Stagger pop-up the 5 funny photos
    const showTimings = [100, 400, 700, 1000, 1300];
    showTimings.forEach((delay, idx) => {
      setTimeout(() => {
        if (images[idx]) {
          images[idx].classList.add('show');
          playChime(1000 + idx * 100, 0.08); // Synthesize pop/ding sound for each stamp
        }
      }, delay);
    });

    // Show indicator text
    setTimeout(() => {
      text.classList.add('show');
    }, 1300);

    // 4. Switch the displayed stage halfway through (at 2600ms)
    setTimeout(() => {
      // Hide current Act with direct styling property to override cache
      const currentSec = document.getElementById(activeSectionId);
      if (currentSec) {
        currentSec.style.setProperty('display', 'none', 'important');
        currentSec.classList.remove('active-act');
      }

      // Show target Act with direct styling property to override cache
      const targetSec = document.getElementById(targetSectionId);
      if (targetSec) {
        targetSec.style.setProperty('display', 'flex', 'important');
        targetSec.classList.add('active-act');
      }

      activeSectionId = targetSectionId;

      // Force window to scroll to top
      window.scrollTo(0, 0);

      // Recalculate layout/theme/button properties
      updateThemeAndNav();
      updateVortexButtonVisibility();
      
      // Auto-trigger scroll reveals
      setTimeout(() => {
        checkScrollReveal();
      }, 50);
    }, 2600);

    // 5. Scatter images outwards (at 3800ms)
    setTimeout(() => {
      const directions = [
        { dx: '-400px', dy: '-400px', dr: '-90deg' },
        { dx: '400px', dy: '-400px', dr: '90deg' },
        { dx: '-400px', dy: '400px', dr: '120deg' },
        { dx: '400px', dy: '400px', dr: '-120deg' },
        { dx: '0px', dy: '500px', dr: '180deg' }
      ];

      images.forEach((img, idx) => {
        if (img) {
          img.style.setProperty('--dx', directions[idx].dx);
          img.style.setProperty('--dy', directions[idx].dy);
          img.style.setProperty('--dr', directions[idx].dr);
          img.classList.add('scatter');
        }
      });
      text.classList.remove('show');
    }, 3800);

    // 6. Complete transition and hide container (at 4600ms)
    setTimeout(() => {
      overlay.classList.add('hidden');
      images.forEach(img => img.classList.remove('show', 'scatter'));
      isTransitioning = false;
      triggerCakeCountdownIfNeeded();
    }, 4600);
  }

  // Update vortex button display based on weird tab index
  function updateVortexButtonVisibility() {
    const vortexContainer = document.querySelector('.vortex-trigger-container');
    if (!vortexContainer) return;

    const activeTabBtn = document.querySelector('.tab-btn.active');
    const currentTab = activeTabBtn ? activeTabBtn.getAttribute('data-tab') : '';
    
    const isWeirdTab = currentTab === 'tab-weird';
    const isLastCard = decks.weird && decks.weird.currentIndex === 4; // index 4 corresponds to card 5/5

    if (isWeirdTab && isLastCard) {
      vortexContainer.classList.add('show-btn');
    } else {
      vortexContainer.classList.remove('show-btn');
    }
  }

  const vortexConfirmBtn = document.getElementById('vortex-confirm-btn');

  function startVortexTransition() {
    if (isTransitioning) return;
    isTransitioning = true; // Lock transitioning state

    // 1. Play portal chime sound
    playPortalWhoosh();
    
    // 2. Hide confirmation button initially & show vortex overlay
    if (vortexConfirmBtn) vortexConfirmBtn.style.display = 'none';
    if (transitionVortex) transitionVortex.classList.remove('hidden');
    
    // 3. Clear existing photos & ensure no residual spinning or rotation
    if (vortexRing) {
      vortexRing.innerHTML = '';
      vortexRing.classList.remove('spinning');
      vortexRing.style.transform = 'rotateY(0deg) rotateX(0deg) rotateZ(0deg)';
      vortexRing.style.transition = 'none';
    }
    
    // 4. Collect photos from Act 2
    const deckPhotos = document.querySelectorAll('.card-deck .deck-card img');
    const isMobile = window.innerWidth <= 768;
    const radius = isMobile ? 192 : 336; // Scaled up 20%
    const totalPhotos = deckPhotos.length;
    
    const tempPhotos = [];
    
    deckPhotos.forEach((img, i) => {
      const photoDiv = document.createElement('div');
      photoDiv.className = 'vortex-photo';
      
      const photoImg = document.createElement('img');
      photoImg.src = img.src;
      photoImg.alt = img.alt || `Photo ${i + 1}`;
      photoImg.style.animationDelay = `${i * 0.25}s`; // Staggered floating bobbing animations
      
      photoDiv.appendChild(photoImg);
      if (vortexRing) vortexRing.appendChild(photoDiv);
      
      // Compute 3D cylinder coordinates
      const angle = (i / totalPhotos) * Math.PI * 2;
      const x = radius * Math.sin(angle);
      const z = radius * Math.cos(angle);
      const y = (i % 2 === 0 ? 18 : -18); // Subtle alternate height offset instead of waving height for clean cylinder
      const rotateY = angle * (180 / Math.PI);
      
      // Calculate responsive 2D Grid coordinates (flat facing screen)
      let gridX = 0;
      let gridY = 0;
      if (isMobile) {
        // 3 rows layout for mobile (4, 4, 3) to prevent screen overflow
        const spacingX = 85;
        const spacingY = 110;
        if (i < 4) {
          gridX = (i - 1.5) * spacingX;
          gridY = -120;
        } else if (i < 8) {
          gridX = (i - 4 - 1.5) * spacingX;
          gridY = 0;
        } else {
          gridX = (i - 8 - 1) * spacingX;
          gridY = 120;
        }
      } else {
        // 2 rows layout for desktop (6, 5)
        const spacingX = 170;
        const spacingY = 220;
        if (i < 6) {
          gridX = (i - 2.5) * spacingX;
          gridY = -110;
        } else {
          gridX = (i - 6 - 2) * spacingX;
          gridY = 110;
        }
      }
      
      // Initial state: flat facing the screen at center, scale 0
      photoDiv.style.transform = `translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(0)`;
      photoDiv.style.opacity = '0';
      
      tempPhotos.push({ element: photoDiv, x, y, z, rotateY, gridX, gridY });
    });
    
    // 5. Stagger fly out photos in pairs (two by two) - flat facing front
    tempPhotos.forEach((item, idx) => {
      const pairGroup = Math.floor(idx / 2);
      const delay = 100 + pairGroup * 800; // 800ms delay between pairs for a moderate progression speed
      
      setTimeout(() => {
        // Fly out to their clean grid coordinates, flat relative to screen
        item.element.style.transition = 'transform 1.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.4s ease-out';
        item.element.style.transform = `translate3d(${item.gridX}px, ${item.gridY}px, 0px) rotateX(0deg) rotateY(0deg) scale(1)`;
        item.element.style.opacity = '1';
      }, delay);
    });
    
    // Calculate total duration for all photos to fly out and settle flat
    const numPairs = Math.ceil(totalPhotos / 2);
    const settleDelay = 100 + (numPairs - 1) * 800 + 1600;
    
    // Transition them from flat grid into 3D cylinder shape layout & tilt parent ring
    setTimeout(() => {
      tempPhotos.forEach(item => {
        item.element.style.transition = 'transform 2.2s cubic-bezier(0.25, 1, 0.5, 1)';
        item.element.style.transform = `translate3d(${item.x}px, ${item.y}px, ${item.z}px) rotateX(0deg) rotateY(${item.rotateY}deg) scale(1)`;
      });
      
      if (vortexRing) {
        vortexRing.style.transition = 'transform 2.2s cubic-bezier(0.25, 1, 0.5, 1)';
        vortexRing.style.transform = 'rotateY(0deg) rotateX(15deg) rotateZ(5deg)';
      }
    }, settleDelay);
    
    // 6. Start continuous spin after 3D cylinder shape has fully formed
    setTimeout(() => {
      if (vortexRing) {
        vortexRing.style.transition = 'none';
        vortexRing.style.transform = '';
        vortexRing.classList.add('spinning');
      }
    }, settleDelay + 2200);
    
    // 7. Update title and display confirmation button
    const vortexTitle = transitionVortex ? transitionVortex.querySelector('.vortex-title') : null;
    if (vortexTitle) {
      vortexTitle.textContent = "回忆正在凝聚中...";
      setTimeout(() => {
        vortexTitle.textContent = "回忆已凝聚，点击下方按钮开启时光祝福 🌟";
        if (vortexConfirmBtn) vortexConfirmBtn.style.display = 'block';
      }, settleDelay + 2200 + 400);
    }
  }

  // Connect Act 2 vortex button to 3D continuous vortex trigger
  if (vortexStartBtn && transitionVortex && vortexRing && vortexConfirmBtn) {
    vortexStartBtn.addEventListener('click', () => {
      maxUnlockedSectionIndex = Math.max(maxUnlockedSectionIndex, 2);
      startVortexTransition();
    });

    // 8. Confirm button clicked to complete transition to Act 3
    vortexConfirmBtn.addEventListener('click', () => {
      // Hide button to prevent double-click
      vortexConfirmBtn.style.display = 'none';
      
      // Play synthesized click chime
      playPortalWhoosh();
      
      // Change title
      const vortexTitle = transitionVortex.querySelector('.vortex-title');
      if (vortexTitle) {
        vortexTitle.textContent = "开启未来祝福之门...";
      }

      // Stop the spinning ring rotation gently by grabbing computed transform
      if (vortexRing) {
        const computedStyle = window.getComputedStyle(vortexRing);
        const currentTransform = computedStyle.transform || computedStyle.webkitTransform;
        vortexRing.style.transform = currentTransform;
        vortexRing.style.transition = 'none';
        vortexRing.classList.remove('spinning');
      }

      // Fade out the center core
      const core = transitionVortex.querySelector('.vortex-core');
      if (core) {
        core.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        core.style.opacity = '0';
        core.style.transform = 'scale(0.1)';
      }

      const isMobile = window.innerWidth <= 768;
      const vortexPhotos = vortexRing.querySelectorAll('.vortex-photo');
      const totalPhotos = vortexPhotos.length;

      // Allow browser to apply the frozen inline transform, then transition to flat facing horizontal row
      setTimeout(() => {
        if (vortexRing) {
          vortexRing.style.transition = 'transform 1.8s cubic-bezier(0.25, 1, 0.5, 1)';
          vortexRing.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
        }

        const rowScale = isMobile ? 0.55 : 1;
        const spacing = isMobile ? 65 : 155;

        vortexPhotos.forEach((photo, i) => {
          photo.style.transition = 'transform 1.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.8s ease-out';
          const rowX = (i - (totalPhotos - 1) / 2) * spacing;
          
          // Form a straight flat horizontal line facing screen
          photo.style.transform = `translate3d(${rowX}px, 0px, 100px) rotateX(0deg) rotateY(0deg) scale(${rowScale})`;
          photo.style.opacity = '1';
        });
      }, 50);

      // Slowly disperse them outwards / upwards and fade out with staggered delays
      setTimeout(() => {
        vortexPhotos.forEach((photo, i) => {
          const driftDelay = i * 60; // 60ms stagger interval
          setTimeout(() => {
            photo.style.transition = 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 2.5s ease-out';
            
            const rowScale = isMobile ? 0.55 : 1;
            const spacing = isMobile ? 65 : 155;
            const rowX = (i - (totalPhotos - 1) / 2) * spacing;
            
            // Drift slowly upwards and backwards, scaling down and fading away
            const driftX = rowX * 1.15;
            const driftY = -140;
            const driftZ = -300;
            const finalScale = rowScale * 0.5;
            photo.style.transform = `translate3d(${driftX}px, ${driftY}px, ${driftZ}px) rotateX(0deg) rotateY(0deg) scale(${finalScale})`;
            photo.style.opacity = '0';
          }, driftDelay);
        });
      }, 1900); // 1.8s transition time + 100ms buffer

      // Switch Act behind the scenes at 3300ms (during the fade)
      setTimeout(() => {
        const currentSec = document.getElementById(activeSectionId);
        if (currentSec) {
          currentSec.style.setProperty('display', 'none', 'important');
          currentSec.classList.remove('active-act');
        }

        const targetSec = document.getElementById('sec-blessings');
        if (targetSec) {
          targetSec.style.setProperty('display', 'flex', 'important');
          targetSec.classList.add('active-act');
        }

        activeSectionId = 'sec-blessings';
        maxUnlockedSectionIndex = Math.max(maxUnlockedSectionIndex, 2);

        window.scrollTo(0, 0);
        updateThemeAndNav();
        
        setTimeout(() => {
          checkScrollReveal();
        }, 50);
      }, 3300);

      // Hide transition overlay (fade-out transition) at 4400ms (once fully dispersed/faded)
      setTimeout(() => {
        transitionVortex.classList.add('hidden');
        isTransitioning = false; // Reset transitioning flag
        triggerCakeCountdownIfNeeded();
      }, 4400);

      // Clean up the vortex ring at 5200ms
      setTimeout(() => {
        vortexRing.innerHTML = '';
        if (core) {
          core.style.removeProperty('opacity');
          core.style.removeProperty('transform');
          core.style.removeProperty('transition');
        }
        if (vortexTitle) {
          vortexTitle.textContent = "正在提取时光片段...";
        }
      }, 5200);
    });
  }

  // Dynamic initialization on load
  initSections();

  /* ==========================================================================
     🖼️ 12. 3D PARALLAX TILT EFFECT (Disabled on mobile/touch screens)
     ========================================================================== */
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
  const tiltCards = document.querySelectorAll('[data-tilt]');

  if (!isTouchDevice) {
    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateY = ((x - centerX) / centerX) * 12;
        const rotateX = -((y - centerY) / centerY) * 12;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      });
    });
  }

  /* ==========================================================================
     🎂 13. INTERACTIVE PARTICLE COUNTDOWN & BIRTHDAY CAKE SYSTEM
     ========================================================================== */
  let cakeParticleSystemInitialized = false;

  function triggerCakeCountdownIfNeeded() {
    if (activeSectionId === 'sec-blessings' && !cakeParticleSystemInitialized) {
      cakeParticleSystemInitialized = true;
      startCakeParticleSystem();
    }
  }

  function startCakeParticleSystem() {
    const stage = document.getElementById('cake-particle-stage');
    if (!stage) return;
    stage.classList.remove('hidden');

    const canvas = document.getElementById('cake-particle-canvas');
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const particles = [];
    const numParticles = 1500;

    // Helper functions for sampling points
    function getPointsFromText(text, fontSize, width, height) {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const oCtx = offscreen.getContext('2d');
      oCtx.fillStyle = '#ffffff';
      oCtx.font = `bold ${fontSize}px "Outfit", sans-serif`;
      oCtx.textAlign = 'center';
      oCtx.textBaseline = 'middle';
      oCtx.fillText(text, width / 2, height / 2);
      
      const imgData = oCtx.getImageData(0, 0, width, height);
      const points = [];
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const idx = (y * width + x) * 4;
          if (imgData.data[idx + 3] > 128) {
            points.push({ x: x, y: y, type: 'white' });
          }
        }
      }
      return points;
    }

    function getPointsFromCake(width, height) {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const oCtx = offscreen.getContext('2d');
      oCtx.fillStyle = '#ffffff';
      
      const centerX = width / 2;
      const centerY = height / 2 + 50; // shift down slightly
      
      // Plate/Stand: Sleek rounded ellipse
      oCtx.beginPath();
      oCtx.ellipse(centerX, centerY + 80, 160, 14, 0, 0, Math.PI * 2);
      oCtx.fill();

      // Bottom layer: wide rounded rect
      oCtx.fillRect(centerX - 130, centerY + 20, 260, 55);
      
      // Bottom layer cream drips (scallops)
      for (let x = centerX - 125; x <= centerX + 125; x += 25) {
        oCtx.beginPath();
        oCtx.arc(x, centerY + 20, 14, 0, Math.PI);
        oCtx.fill();
      }

      // Middle layer: medium rect
      oCtx.fillRect(centerX - 100, centerY - 30, 200, 50);
      
      // Middle layer cream drips
      for (let x = centerX - 95; x <= centerX + 95; x += 20) {
        oCtx.beginPath();
        oCtx.arc(x, centerY - 30, 12, 0, Math.PI);
        oCtx.fill();
      }

      // Top layer: narrower rect
      oCtx.fillRect(centerX - 70, centerY - 80, 140, 50);
      
      // Top layer cream drips
      for (let x = centerX - 65; x <= centerX + 65; x += 18) {
        oCtx.beginPath();
        oCtx.arc(x, centerY - 80, 10, 0, Math.PI);
        oCtx.fill();
      }

      // Cherries on top of bottom layer (decorations)
      oCtx.beginPath();
      oCtx.arc(centerX - 115, centerY + 12, 9, 0, Math.PI * 2);
      oCtx.arc(centerX + 115, centerY + 12, 9, 0, Math.PI * 2);
      oCtx.fill();

      // Cherries on top of middle layer
      oCtx.beginPath();
      oCtx.arc(centerX - 85, centerY - 38, 8, 0, Math.PI * 2);
      oCtx.arc(centerX + 85, centerY - 38, 8, 0, Math.PI * 2);
      oCtx.fill();

      // Three Candles
      // Center
      oCtx.fillRect(centerX - 6, centerY - 125, 12, 45);
      // Left
      oCtx.fillRect(centerX - 42, centerY - 118, 9, 38);
      // Right
      oCtx.fillRect(centerX + 33, centerY - 118, 9, 38);
      
      // Three Flames
      // Center
      oCtx.beginPath();
      oCtx.moveTo(centerX, centerY - 165);
      oCtx.quadraticCurveTo(centerX - 14, centerY - 145, centerX, centerY - 128);
      oCtx.quadraticCurveTo(centerX + 14, centerY - 145, centerX, centerY - 165);
      oCtx.fill();

      // Left
      oCtx.beginPath();
      oCtx.moveTo(centerX - 37.5, centerY - 150);
      oCtx.quadraticCurveTo(centerX - 49, centerY - 134, centerX - 37.5, centerY - 121);
      oCtx.quadraticCurveTo(centerX - 26, centerY - 134, centerX - 37.5, centerY - 150);
      oCtx.fill();

      // Right
      oCtx.beginPath();
      oCtx.moveTo(centerX + 37.5, centerY - 150);
      oCtx.quadraticCurveTo(centerX + 26, centerY - 134, centerX + 37.5, centerY - 121);
      oCtx.quadraticCurveTo(centerX + 49, centerY - 134, centerX + 37.5, centerY - 150);
      oCtx.fill();
      
      const imgData = oCtx.getImageData(0, 0, width, height);
      const points = [];
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const idx = (y * width + x) * 4;
          if (imgData.data[idx + 3] > 128) {
            let type = 'white';
            
            if (y >= centerY + 74) {
              type = 'plate';
            } else if (y >= centerY + 20 && y < centerY + 74) {
              type = 'pink';
            } else if (y >= centerY - 30 && y < centerY + 20) {
              if (y < centerY + 17 && (Math.abs(x - (centerX - 115)) < 15 || Math.abs(x - (centerX + 115)) < 15)) {
                type = 'cherry';
              } else {
                type = 'white';
              }
            } else if (y >= centerY - 80 && y < centerY - 30) {
              if (y < centerY - 33 && (Math.abs(x - (centerX - 85)) < 12 || Math.abs(x - (centerX + 85)) < 12)) {
                type = 'cherry';
              } else {
                type = 'pink';
              }
            } else if (y >= centerY - 125 && y < centerY - 80) {
              type = 'candle';
            } else {
              type = 'flame';
            }
            points.push({ x: x, y: y, type: type });
          }
        }
      }
      return points;
    }

    function adjustPointsCount(points, targetCount) {
      if (points.length === 0) {
        const result = [];
        for (let i = 0; i < targetCount; i++) {
          result.push({ x: 300, y: 300, type: 'white' });
        }
        return result;
      }
      const result = [];
      if (points.length >= targetCount) {
        for (let i = 0; i < targetCount; i++) {
          const idx = Math.floor((i / targetCount) * points.length);
          result.push(points[idx]);
        }
      } else {
        for (let i = 0; i < targetCount; i++) {
          const idx = i % points.length;
          result.push(points[idx]);
        }
      }
      return result;
    }

    // Generate coordinate sets in 600x600 virtual box
    const points3 = adjustPointsCount(getPointsFromText("3", 280, 600, 600), numParticles);
    const points2 = adjustPointsCount(getPointsFromText("2", 280, 600, 600), numParticles);
    const points1 = adjustPointsCount(getPointsFromText("1", 280, 600, 600), numParticles);
    const pointsCake = adjustPointsCount(getPointsFromCake(600, 600), numParticles);

    // Rotation angles for 3D Y-axis flips
    let targetRotationY = 0;
    let currentRotationY = 0;
    let swirlIntensity = 0; // Start with gentle drift, no initial violent swirl

    // Helper to get random full-screen target coordinates in virtual 600x600 space
    function getRandomVirtualTarget() {
      const currentScale = Math.min(canvas.width, canvas.height) / 600 * 0.85;
      const rx = (Math.random() - 0.5) * (canvas.width / (currentScale || 1));
      const ry = (Math.random() - 0.5) * (canvas.height / (currentScale || 1));
      return {
        x: rx + 300,
        y: ry + 300,
        z: (Math.random() - 0.5) * 150
      };
    }

    // Initialize particles bursting out from the center to fill the screen
    for (let i = 0; i < numParticles; i++) {
      const randTarget = getRandomVirtualTarget();
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 8.8; // explosive initial outward velocity
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 12,
        y: canvas.height / 2 + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        tx: randTarget.x,
        ty: randTarget.y,
        tz: randTarget.z,
        type: 'white',
        size: 1.2 + Math.random() * 2,
        color: 'rgba(255, 255, 255, 0.95)'
      });
    }

    // Animation States
    const STATE_DISPERSE_3 = 0;
    const STATE_3 = 1;
    const STATE_DISPERSE_2 = 2;
    const STATE_2 = 3;
    const STATE_DISPERSE_1 = 4;
    const STATE_1 = 5;
    const STATE_DISPERSE_CAKE = 6;
    const STATE_CAKE_UNLIT = 7;
    const STATE_CAKE_LIT = 8;
    const STATE_EXPLODE = 9;

    let currentState = STATE_DISPERSE_3;
    let celebrationParticles = [];
    let isLit = false;

    // Mouse position for particle avoidance
    const mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Handle countdown stages with 3D Y-axis flips and swirl bursts
    function runCountdown() {
      // 0ms -> 1000ms: STATE_DISPERSE_3 (particles start filled, drifting)
      // At 1000ms: Converge to 3
      setTimeout(() => {
        if (currentState !== STATE_DISPERSE_3) return;
        currentState = STATE_3;
        playChime(1000, 0.15);
        
        targetRotationY += Math.PI * 2; // Full spin Y-axis flip (360 degrees)
        swirlIntensity = 18;           // Swirl burst
        
        particles.forEach((p, i) => {
          p.tx = points3[i].x;
          p.ty = points3[i].y;
          p.tz = (Math.random() - 0.5) * 80;
          p.type = 'white';
        });
      }, 1000);

      // At 2600ms: Disperse to 2
      setTimeout(() => {
        if (currentState !== STATE_3) return;
        currentState = STATE_DISPERSE_2;
        targetRotationY += Math.PI * 2; // Full spin
        swirlIntensity = 18;
        
        particles.forEach((p) => {
          const randTarget = getRandomVirtualTarget();
          p.tx = randTarget.x;
          p.ty = randTarget.y;
          p.tz = randTarget.z;
        });
      }, 2600);

      // At 3400ms: Converge to 2
      setTimeout(() => {
        if (currentState !== STATE_DISPERSE_2) return;
        currentState = STATE_2;
        playChime(1100, 0.15);
        targetRotationY += Math.PI * 2; // Full spin
        swirlIntensity = 18;
        
        particles.forEach((p, i) => {
          p.tx = points2[i].x;
          p.ty = points2[i].y;
          p.tz = (Math.random() - 0.5) * 80;
          p.type = 'white';
        });
      }, 3400);

      // At 5000ms: Disperse to 1
      setTimeout(() => {
        if (currentState !== STATE_2) return;
        currentState = STATE_DISPERSE_1;
        targetRotationY += Math.PI * 2; // Full spin
        swirlIntensity = 18;
        
        particles.forEach((p) => {
          const randTarget = getRandomVirtualTarget();
          p.tx = randTarget.x;
          p.ty = randTarget.y;
          p.tz = randTarget.z;
        });
      }, 5000);

      // At 5800ms: Converge to 1
      setTimeout(() => {
        if (currentState !== STATE_DISPERSE_1) return;
        currentState = STATE_1;
        playChime(1200, 0.15);
        targetRotationY += Math.PI * 2; // Full spin
        swirlIntensity = 18;
        
        particles.forEach((p, i) => {
          p.tx = points1[i].x;
          p.ty = points1[i].y;
          p.tz = (Math.random() - 0.5) * 80;
          p.type = 'white';
        });
      }, 5800);

      // At 7400ms: Disperse to Cake & change colors
      setTimeout(() => {
        if (currentState !== STATE_1) return;
        currentState = STATE_DISPERSE_CAKE;
        playPortalWhoosh();
        targetRotationY += Math.PI * 2; // Full spin
        swirlIntensity = 24;           // Strong swirl
        
        particles.forEach((p, i) => {
          const randTarget = getRandomVirtualTarget();
          p.tx = randTarget.x;
          p.ty = randTarget.y;
          p.tz = randTarget.z;
          p.type = pointsCake[i].type; // Immediately assign cake type colors
        });
      }, 7400);

      // At 8600ms: Morph into Cake (layer-by-layer growth assembly!)
      setTimeout(() => {
        if (currentState !== STATE_DISPERSE_CAKE) return;
        currentState = STATE_CAKE_UNLIT;
        
        // Staggered Layer-by-layer morph targets
        particles.forEach((p, i) => {
          let delay = 0;
          const type = pointsCake[i].type;
          
          if (type === 'pink') delay = 0;       // Bottom layer first
          else if (type === 'white') delay = 350; // Top layer cream
          else if (type === 'candle') delay = 700; // Candle stick
          else if (type === 'flame') delay = 1050; // Wick/Flame last

          setTimeout(() => {
            if (currentState !== STATE_CAKE_UNLIT && currentState !== STATE_CAKE_LIT) return;
            p.tx = pointsCake[i].x;
            p.ty = pointsCake[i].y;
            p.tz = (Math.random() - 0.5) * 90;
            p.type = type;
          }, delay);
        });

        // Show texts
        const title = stage.querySelector('.cake-title');
        const subtitle = stage.querySelector('.cake-subtitle');
        const prompt = stage.querySelector('.cake-prompt-container');
        if (title) title.classList.add('show');
        if (subtitle) subtitle.classList.add('show');
        if (prompt) prompt.classList.add('show');

        // Start listening to microphone
        initMicDetection(lightCake);
      }, 8600);
    }

    // Synthesize arpeggiated magic bell for lighting cake
    function playCelebrationChime() {
      try {
        initAudioContext();
        const now = audioCtx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00]; // C5 to C7
        notes.forEach((freq, index) => {
          const time = now + index * 0.12;
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.01, time + 0.3);
          
          gainNode.gain.setValueAtTime(0, time);
          gainNode.gain.linearRampToValueAtTime(0.25, time + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);
          
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          osc.start(time);
          osc.stop(time + 0.8);
        });
      } catch(e) {}
    }

    // Trigger lighting the cake
    function lightCake() {
      if (isLit) return;
      isLit = true;
      currentState = STATE_CAKE_LIT;

      // Synthesize audio chime
      playCelebrationChime();

      // Update prompt texts
      const promptText = stage.querySelector('.cake-prompt-text');
      const promptSub = stage.querySelector('.cake-prompt-sub');
      if (promptText) {
        promptText.textContent = "✨ 已点亮蛋糕！正在为你展开贺卡... ✨";
        promptText.style.color = "#BAE0CB";
        promptText.style.textShadow = "0 0 15px rgba(186, 224, 203, 0.7)";
      }
      if (promptSub) {
        promptSub.textContent = "🎂 祝虾条生日快乐，快乐无限 🎂";
      }

      // Initial firework bursts from flame wick
      let scale = Math.min(canvas.width, canvas.height) / 600 * 0.85;
      let wickX = canvas.width / 2;
      let wickY = (175 - 300) * scale + canvas.height / 2; // relative flame center wick position
      
      for (let k = 0; k < 3; k++) {
        setTimeout(() => {
          spawnFirework(wickX + (Math.random() * 40 - 20), wickY - 20);
        }, k * 300);
      }

      // Periodic fireworks
      const fwInterval = setInterval(() => {
        if (currentState !== STATE_CAKE_LIT) {
          clearInterval(fwInterval);
          return;
        }
        spawnFirework(
          wickX + (Math.random() * 200 - 100),
          wickY - 40 - Math.random() * 100
        );
      }, 500);

      // Trigger final scatter & explosion
      setTimeout(() => {
        clearInterval(fwInterval);
        explodeAndReveal();
      }, 3500);
    }

    function spawnFirework(x, y) {
      const colors = [
        'rgba(255, 174, 201, 0.95)', // pink
        'rgba(255, 235, 120, 0.95)', // yellow
        'rgba(186, 224, 203, 0.95)', // green
        'rgba(176, 224, 230, 0.95)', // blue
        'rgba(230, 230, 250, 0.95)', // purple
        'rgba(255, 255, 255, 0.95)'  // white
      ];
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 5.5;
        celebrationParticles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 1.2 + Math.random() * 1.8,
          alpha: 1.0,
          decay: 0.012 + Math.random() * 0.015,
          gravity: 0.06
        });
      }
    }

    // Explode particles and fade out overlay stage
    function explodeAndReveal() {
      currentState = STATE_EXPLODE;
      stopMicDetection();

      // Scatter all cake particles
      particles.forEach(p => {
        const angle = Math.random() * Math.PI * 2;
        const force = 8 + Math.random() * 22;
        p.vx = Math.cos(angle) * force;
        p.vy = Math.sin(angle) * force - 6; // upwards bias
      });

      // Fade out overlay
      setTimeout(() => {
        stage.classList.add('hidden');
      }, 1000);

      // Fully destroy particle stage canvas loop
      setTimeout(() => {
        cancelAnimationFrame(animationFrameId);
        cleanupStage();
        cakeParticleSystemInitialized = false; // Reset so it can be replayed
      }, 2500);
    }

    // Event listener fallbacks
    // Mouse movement inside canvas for avoidance
    const mouseHandler = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const mouseOutHandler = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', mouseHandler);
    window.addEventListener('mouseout', mouseOutHandler);

    // 1. Mouse/touch click anywhere
    const clickHandler = () => {
      if (currentState === STATE_CAKE_UNLIT) {
        lightCake();
      }
    };
    stage.addEventListener('click', clickHandler);

    // 2. Spacebar keypress
    const spaceHandler = (e) => {
      if (e.code === 'Space' && currentState === STATE_CAKE_UNLIT) {
        e.preventDefault();
        lightCake();
      }
    };
    window.addEventListener('keydown', spaceHandler);

    // 3. Mobile screen long-press
    let touchTimer = null;
    const touchStartHandler = (e) => {
      if (currentState === STATE_CAKE_UNLIT) {
        touchTimer = setTimeout(() => {
          lightCake();
        }, 400); // 400ms long press
      }
    };
    const touchEndHandler = () => {
      if (touchTimer) clearTimeout(touchTimer);
    };
    stage.addEventListener('touchstart', touchStartHandler);
    stage.addEventListener('touchend', touchEndHandler);

    // Resize handler
    const resizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);

    // Clean up all key, mouse, touch, and resize listeners on remove
    const cleanupStage = () => {
      window.removeEventListener('mousemove', mouseHandler);
      window.removeEventListener('mouseout', mouseOutHandler);
      stage.removeEventListener('click', clickHandler);
      window.removeEventListener('keydown', spaceHandler);
      stage.removeEventListener('touchstart', touchStartHandler);
      stage.removeEventListener('touchend', touchEndHandler);
      window.removeEventListener('resize', resizeHandler);
      stopMicDetection();
    };

    // Low-frequency wind noise analyser for microphone blow detection
    let audioContext = null;
    let analyser = null;
    let micStream = null;

    function initMicDetection(onBlow) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            micStream = stream;
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            let blowSustained = 0;
            
            function checkMic() {
              if (!micStream || currentState !== STATE_CAKE_UNLIT) return;
              analyser.getByteFrequencyData(dataArray);
              
              // Low frequency blow sound calculation
              let lowFreqSum = 0;
              const lowLimit = Math.floor(bufferLength * 0.35); // check low 35% of spectrum
              for (let i = 0; i < lowLimit; i++) {
                lowFreqSum += dataArray[i];
              }
              const lowAvg = lowFreqSum / lowLimit;
              
              if (lowAvg > 72) { // threshold ~72
                blowSustained++;
                if (blowSustained >= 5) {
                  onBlow();
                  stopMicDetection();
                  return;
                }
              } else {
                blowSustained = Math.max(0, blowSustained - 1);
              }
              requestAnimationFrame(checkMic);
            }
            checkMic();
          })
          .catch(err => {
            console.log("Mic detection bypassed or denied:", err);
          });
      }
    }

    function stopMicDetection() {
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
      }
      if (audioContext) {
        audioContext.close();
        audioContext = null;
      }
    }

    let animationFrameId = null;

    // Core Animation loop
    function updateAndDraw() {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.28)'; // persistent tail trail fade
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let scale = Math.min(canvas.width, canvas.height) / 600 * 0.85;

      // Update global rotation and swirl values
      currentRotationY += (targetRotationY - currentRotationY) * 0.06;
      swirlIntensity *= 0.94; // Fade out swirl force

      // Spawn ambient rising stardust from cake
      if (currentState === STATE_CAKE_UNLIT || currentState === STATE_CAKE_LIT) {
        if (Math.random() < 0.25) {
          let wickX = canvas.width / 2 + (Math.random() * 200 - 100);
          let bottomY = (380 - 300) * scale + canvas.height / 2;
          celebrationParticles.push({
            x: wickX,
            y: bottomY,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.4 - Math.random() * 0.8,
            color: 'rgba(255, 255, 255, 0.35)',
            size: 0.8 + Math.random() * 1.2,
            alpha: 0.8,
            decay: 0.007 + Math.random() * 0.008,
            gravity: 0
          });
        }
      }

      // 1. Update and Draw Main Shape-Seeking Particles
      particles.forEach((p, idx) => {
        if (currentState === STATE_EXPLODE) {
          p.vy += 0.22; // Gravity
          p.x += p.vx;
          p.y += p.vy;
          
          p.color = p.color.replace(/[\d\.]+\)$/, `${Math.max(0, parseFloat(p.color.match(/[\d\.]+\)$/)[0]) - 0.012)})`);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          return;
        }

        // Apply Y-axis rotation to virtual coordinates
        let rx = p.tx - 300;
        let ry = p.ty - 300;
        let rz = p.tz || 0;

        let rotX = rx * Math.cos(currentRotationY) - rz * Math.sin(currentRotationY);
        let rotZ = rx * Math.sin(currentRotationY) + rz * Math.cos(currentRotationY);

        let actualTargetX = rotX * scale + canvas.width / 2;
        let actualTargetY = ry * scale + canvas.height / 2;

        // Custom flame animation
        if (currentState === STATE_CAKE_LIT && p.type === 'flame') {
          if (p.flameY === undefined) {
            p.flameY = actualTargetY;
            p.flameX = actualTargetX;
            p.flameSpeed = 0.8 + Math.random() * 1.5;
            p.flameLife = Math.random();
            p.flameWobble = 0.04 + Math.random() * 0.04;
          }
          p.flameLife -= 0.022;
          p.flameY -= p.flameSpeed;
          p.flameX += Math.sin(p.flameY * p.flameWobble) * 0.5;

          actualTargetX = p.flameX;
          actualTargetY = p.flameY;

          if (p.flameLife <= 0) {
            p.flameY = ry * scale + canvas.height / 2;
            p.flameX = rotX * scale + canvas.width / 2 + (Math.random() * 10 - 5);
            p.flameLife = 1.0;
          }

          const ratio = p.flameLife;
          if (ratio > 0.62) {
            p.color = `rgba(255, 235, 110, ${ratio})`;
          } else if (ratio > 0.32) {
            p.color = `rgba(255, 130, 45, ${ratio})`;
          } else {
            p.color = `rgba(225, 40, 20, ${ratio})`;
          }
        } else if (currentState === STATE_CAKE_UNLIT && p.type === 'flame') {
          // Gather wick (sitting right on the candle ends)
          p.color = 'rgba(100, 100, 100, 0.4)';
        } else {
          // General coloring
          if (p.type === 'pink') {
            p.color = 'rgba(255, 174, 201, 0.95)'; // Strawberry pink
          } else if (p.type === 'white') {
            p.color = 'rgba(255, 255, 255, 0.95)'; // Cream white
          } else if (p.type === 'cherry') {
            p.color = 'rgba(255, 65, 100, 0.98)';  // Cherry red
          } else if (p.type === 'plate') {
            p.color = 'rgba(255, 235, 180, 0.90)'; // Champagne gold plate
          } else if (p.type === 'candle') {
            if (Math.abs(p.tx - 300) < 15) {
              p.color = 'rgba(255, 215, 0, 0.95)'; // Gold center candle
            } else if (p.tx < 300) {
              p.color = 'rgba(78, 205, 196, 0.95)'; // Teal left candle
            } else {
              p.color = 'rgba(180, 150, 240, 0.95)'; // Lavender right candle
            }
          } else {
            p.color = 'rgba(255, 255, 255, 0.92)';
          }
        }

        const dx = actualTargetX - p.x;
        const dy = actualTargetY - p.y;
        
        // Dynamic easing and friction depending on whether we are dispersing or converging
        let ease = 0.065; // default for convergence
        let friction = 0.30;

        if (currentState === STATE_DISPERSE_3 || 
            currentState === STATE_DISPERSE_2 || 
            currentState === STATE_DISPERSE_1 || 
            currentState === STATE_DISPERSE_CAKE) {
          ease = 0.012; // slow, gentle seek for dispersion
          friction = 0.12; // low friction for elegant floating drift
        }

        p.vx += dx * ease - p.vx * friction;
        p.vy += dy * ease - p.vy * friction;

        // Apply cosmic galaxy swirl force if active
        if (swirlIntensity > 0.1) {
          const sdx = p.x - canvas.width / 2;
          const sdy = p.y - canvas.height / 2;
          const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
          if (sdist > 0) {
            p.vx += (-sdy / sdist) * swirlIntensity * (0.4 + Math.random() * 0.6);
            p.vy += (sdx / sdist) * swirlIntensity * (0.4 + Math.random() * 0.6);
          }
        }

        // Interactive mouse avoidance
        if (mouse.x !== null && mouse.y !== null) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 75) {
            const force = (75 - mdist) / 75 * 2.8;
            p.vx += (mdx / mdist) * force;
            p.vy += (mdy / mdist) * force;
          }
        }

        // Brownian movement wobble
        p.vx += (Math.random() - 0.5) * 0.28;
        p.vy += (Math.random() - 0.5) * 0.28;

        p.x += p.vx;
        p.y += p.vy;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Update and Draw Celebration Firework Particles
      celebrationParticles.forEach((cp, index) => {
        cp.vy += cp.gravity;
        cp.vx *= 0.98;
        cp.x += cp.vx;
        cp.y += cp.vy;
        cp.alpha -= cp.decay;

        if (cp.alpha <= 0) {
          celebrationParticles.splice(index, 1);
          return;
        }

        ctx.fillStyle = cp.color.replace(/[\d\.]+\)$/, `${cp.alpha})`);
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, cp.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Handle stage destruction cleanup on final stage removal
      if (stage.parentNode === null) {
        cleanupStage();
        return;
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    }

    // Trigger stage countdown sequence and start animation loop
    runCountdown();
    updateAndDraw();
  }

});

