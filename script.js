/**
 * =================================================================
 * HAYRÜNNİSA & AHMET DİJİTAL DAVETİYE — script.js
 *
 * Sürüm: 5.1 (Nihai - Tam Sayfa Kaydırma - Eksiksiz)
 * =================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initVhUnit();
  initFullPageScroll();
  initRsvpForm();
  initEnvelopeAnimation();
  initAccessibility();
  initMobileOptimizations();
  initContactModal();
  initFloatingRsvpButton();
});


/**
 * 1. Mobil Cihazlar İçin --vh Birimi Ayarlama (Geliştirilmiş)
 */
function initVhUnit() {
  function setVh() {
    // iOS Safari için özel hesaplama
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // iOS Safari'de viewport height sorunları için ekstra kontrol
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      const actualHeight = window.innerHeight;
      const visualHeight = window.visualViewport ? window.visualViewport.height : actualHeight;
      if (actualHeight !== visualHeight) {
        const correctedVh = visualHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${correctedVh}px`);
      }
      
      // iPhone 12 özel düzeltmesi
      if (window.innerWidth === 390 && window.innerHeight === 844) {
        const iphone12Vh = Math.min(actualHeight, 844) * 0.01;
        document.documentElement.style.setProperty('--vh', `${iphone12Vh}px`);
      }
    }
  }
  
  setVh();
  window.addEventListener('resize', setVh, { passive: true });
  
  // iOS Safari için visual viewport değişikliklerini dinle
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setVh, { passive: true });
  }
}


/**
 * 2. Tam Sayfa Kaydırma Mantığı (Mobil Optimizasyonlu)
 */
function initFullPageScroll() {
  const container = document.getElementById('fullpage-container');
  const sections = document.querySelectorAll('.full-page-section');
  if (!container || sections.length === 0) return;

  let currentSectionIndex = 0;
  let isScrolling = false;
  const totalSections = sections.length;
  
  // Mobil cihaz tespiti
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  function scrollToSection(index) {
    if (isScrolling || index < 0 || index >= totalSections) return;
    
    isScrolling = true;
    currentSectionIndex = index;
    
    // Mobil cihazlarda daha yumuşak geçiş
    const scrollDuration = isMobile ? 800 : 1000;
    container.style.transition = `transform ${scrollDuration}ms cubic-bezier(0.65, 0, 0.35, 1)`;
    container.style.transform = `translateY(-${index * 100}vh)`;

    setTimeout(() => {
      isScrolling = false;
    }, scrollDuration);
  }

  // Wheel event (masaüstü)
  document.addEventListener('wheel', (event) => {
    if (isMobile) return; // Mobil cihazlarda wheel event'i devre dışı bırak
    
    event.preventDefault();
    const delta = Math.sign(event.deltaY);
    if (delta > 0) {
      scrollToSection(currentSectionIndex + 1);
    } else if (delta < 0) {
      scrollToSection(currentSectionIndex - 1);
    }
  }, { passive: false });

  // Klavye kontrolü
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      scrollToSection(currentSectionIndex + 1);
    } else if (event.key === 'ArrowUp') {
      scrollToSection(currentSectionIndex - 1);
    }
  });

  // Touch event'leri (mobil)
  let touchStartY = 0;
  let touchStartTime = 0;
  
  document.addEventListener('touchstart', (event) => {
    touchStartY = event.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });
  
  document.addEventListener('touchend', (event) => {
    const touchEndY = event.changedTouches[0].clientY;
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    const touchDistance = Math.abs(touchStartY - touchEndY);
    
    // Minimum mesafe ve maksimum süre kontrolü
    if (touchDistance < 30 || touchDuration > 500) return;
    
    if (touchStartY - touchEndY > 30) { // Yukarı swipe
      scrollToSection(currentSectionIndex + 1);
    } else if (touchEndY - touchStartY > 30) { // Aşağı swipe
      scrollToSection(currentSectionIndex - 1);
    }
  }, { passive: true });

  // iOS Safari için özel düzeltmeler
  if (isIOS) {
    // iOS'ta scroll momentum'u engelle
    document.addEventListener('touchmove', (event) => {
      if (event.scale !== 1) {
        event.preventDefault();
      }
    }, { passive: false });
  }
}


/**
 * 3. LCV Formu Gönderme Mantığı
 */
function initRsvpForm() {
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSuccess = document.getElementById('rsvp-success');
    if (!rsvpForm || !rsvpSuccess) return;

    rsvpForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(rsvpForm);
        const action = rsvpForm.action;
        const submitButton = rsvpForm.querySelector('button[type="submit"]');
        const eventChoice = formData.get('Etkinlik');
        if (!eventChoice) { alert('Lütfen katılacağınız bir etkinlik seçin.'); return; }

        submitButton.disabled = true;
        submitButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Gönderiliyor...`;

        fetch(action, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } })
        .then(response => {
            if (response.ok) {
                const name = formData.get('Adı Soyadı');
                const guests = formData.get('Kişi Sayısı');
                document.getElementById('success-name').textContent = name;
                document.getElementById('success-guests').textContent = guests;
                document.getElementById('success-event').textContent = eventChoice;
                const buttonWrapper = document.getElementById('success-location-buttons');
                buttonWrapper.innerHTML = '';

                if (eventChoice === 'Her İkisine de') {
                    const mevlidOption = document.querySelector('option[value="Mevlid"]');
                    const nikahOption = document.querySelector('option[value="Nikâh"]');
                    if (mevlidOption && nikahOption) {
                        buttonWrapper.appendChild(createLocationButton(mevlidOption.dataset.locationUrl, 'Mevlid Konumu'));
                        buttonWrapper.appendChild(createLocationButton(nikahOption.dataset.locationUrl, 'Nikâh Konumu'));
                    }
                } else {
                    const selectedOption = rsvpForm.querySelector('option:checked');
                    if (selectedOption && selectedOption.dataset.locationUrl) {
                        buttonWrapper.appendChild(createLocationButton(selectedOption.dataset.locationUrl, 'Konumu Gör'));
                    }
                }
                rsvpForm.style.display = 'none';
                rsvpSuccess.hidden = false;
            } else { throw new Error('Sunucu hatası.'); }
        })
        .catch(error => {
            alert('Bir sorun oluştu. Lütfen tekrar deneyin.');
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Katılımımı Bildir`;
        });
    });

    function createLocationButton(url, text) {
        const button = document.createElement('a');
        button.href = url;
        button.className = 'btn btn-outline';
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.innerHTML = `<i class="fa-solid fa-map-location-dot"></i> ${text}`;
        return button;
    }
}


/**
 * 4. Zarf Animasyonu ve Scroll Kilitleme
 */
function initEnvelopeAnimation() {
  const addressLinks = document.querySelectorAll('.address-link');
  const envelopeOverlay = document.getElementById('envelope-overlay');
  if (!envelopeOverlay || addressLinks.length === 0) return;

  const envelope = document.getElementById('envelope');
  let isEnvelopeOpen = false;

  function showEnvelopeAnimation(url) {
    if (isEnvelopeOpen) return;
    isEnvelopeOpen = true;

    envelopeOverlay.setAttribute('aria-hidden', 'false');
    envelope.classList.remove('open');
    requestAnimationFrame(() => {
      setTimeout(() => envelope.classList.add('open'), 100);
    });

    clearTimeout(window.envelopeTimer);
    window.envelopeTimer = setTimeout(() => {
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      hideEnvelope();
    }, 2500);
  }

  function hideEnvelope() {
    if (!isEnvelopeOpen) return;
    clearTimeout(window.envelopeTimer);
    envelope.classList.remove('open');
    setTimeout(() => {
      envelopeOverlay.setAttribute('aria-hidden', 'true');
      isEnvelopeOpen = false;
    }, 700);
  }

  addressLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const url = link.dataset.url;
      showEnvelopeAnimation(url);
    });
  });

  envelopeOverlay.addEventListener('click', (event) => {
    if (event.target === envelopeOverlay) hideEnvelope();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideEnvelope();
  });
}


/**
 * 5. Erişilebilirlik İyileştirmeleri
 */
function initAccessibility() {
  document.body.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.documentElement.classList.add('show-focus-outline');
    }
  }, { once: true });
}

/**
 * 6. Mobil Cihazlar İçin Özel Optimizasyonlar
 */
function initMobileOptimizations() {
  // Mobil cihaz tespiti
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (isMobile) {
    // Mobil cihazlarda body'ye class ekle
    document.body.classList.add('mobile-device');
    
    if (isIOS) {
      document.body.classList.add('ios-device');
    } else if (isAndroid) {
      document.body.classList.add('android-device');
    }

    // iOS Safari için özel düzeltmeler
    if (isIOS) {
      // iOS'ta address bar'ın gizlenmesi/gösterilmesi durumunda viewport'u güncelle
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
        }, 100);
      });

      // iOS'ta scroll bounce'u engelle
      document.addEventListener('touchmove', (e) => {
        if (e.target.closest('.section-content')) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    // Android Chrome için özel düzeltmeler
    if (isAndroid) {
      // Android'de soft keyboard açıldığında viewport'u güncelle
      window.addEventListener('resize', () => {
        setTimeout(() => {
          const vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty('--vh', `${vh}px`);
        }, 100);
      });
    }

    // Tüm mobil cihazlarda zoom'u engelle
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });

    // Mobil cihazlarda double-tap zoom'u engelle
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Dropdown için mobil optimizasyonlar
    initMobileDropdownOptimizations();
    
    // iPhone 12 özel optimizasyonları
    initIPhone12Optimizations();
  }
}

/**
 * 8.1. iPhone 12 Özel Optimizasyonları
 */
function initIPhone12Optimizations() {
  // iPhone 12 tespiti
  const isIPhone12 = window.innerWidth === 390 && window.innerHeight === 844;
  
  if (isIPhone12) {
    // iPhone 12 için özel viewport ayarları
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.content = 'width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no';
    }
    
    // iPhone 12 için scroll optimizasyonu
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // iPhone 12 için section padding ayarları
    const sections = document.querySelectorAll('.full-page-section');
    sections.forEach(section => {
      section.style.paddingBottom = '100px';
    });
    
    // iPhone 12 için contact section görünürlüğü
    const contactSection = document.querySelector('.contact-section');
    if (contactSection) {
      contactSection.style.marginBottom = '20px';
      contactSection.style.paddingBottom = '10px';
    }
  }
}

/**
 * 7. Mobil Cihazlar İçin Dropdown Optimizasyonları
 */
function initMobileDropdownOptimizations() {
  const dropdown = document.querySelector('.custom-dropdown select');
  if (!dropdown) return;

  // iOS Safari için özel düzeltmeler
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    // iOS'ta dropdown'ın doğru çalışması için
    dropdown.addEventListener('focus', () => {
      dropdown.style.fontSize = '16px';
      // iPhone 12 için özel düzeltme
      if (window.innerWidth === 390 && window.innerHeight === 844) {
        dropdown.style.position = 'relative';
        dropdown.style.zIndex = '9999';
      }
    });
    
    dropdown.addEventListener('blur', () => {
      dropdown.style.fontSize = '1rem';
      // iPhone 12 için özel düzeltme
      if (window.innerWidth === 390 && window.innerHeight === 844) {
        dropdown.style.position = '';
        dropdown.style.zIndex = '';
      }
    });
  }

  // Android Chrome için özel düzeltmeler
  if (/Android/.test(navigator.userAgent)) {
    // Android'de dropdown'ın doğru çalışması için
    dropdown.addEventListener('touchstart', () => {
      dropdown.style.fontSize = '16px';
    });
  }

  // Tüm mobil cihazlarda dropdown için touch optimizasyonu
  dropdown.addEventListener('touchstart', (e) => {
    e.stopPropagation();
  }, { passive: true });
}

/**
 * 8. İletişim Modal Fonksiyonalitesi
 */
function initContactModal() {
  const contactModalBtn = document.getElementById('contact-modal-btn');
  const contactModal = document.getElementById('contact-modal');
  const contactModalClose = document.getElementById('contact-modal-close');
  
  if (!contactModalBtn || !contactModal || !contactModalClose) return;

  let isModalOpen = false;

  function showContactModal() {
    if (isModalOpen) return;
    isModalOpen = true;
    
    // Body scroll'u engelle
    document.body.style.overflow = 'hidden';
    
    // Modal'ı göster
    contactModal.setAttribute('aria-hidden', 'false');
    
    // iOS Safari için özel düzeltme
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // iOS'ta viewport'u sabitle
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = 'width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no';
      }
    }
  }

  function hideContactModal() {
    if (!isModalOpen) return;
    isModalOpen = false;
    
    // Body scroll'u geri aç
    document.body.style.overflow = '';
    
    // Modal'ı gizle
    contactModal.setAttribute('aria-hidden', 'true');
    
    // iOS Safari için özel düzeltme
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // iOS'ta viewport'u geri yükle
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.content = 'width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no';
      }
    }
  }

  // Modal açma
  contactModalBtn.addEventListener('click', showContactModal);
  
  // Modal kapatma
  contactModalClose.addEventListener('click', hideContactModal);
  
  // Overlay'e tıklayınca kapatma
  contactModal.addEventListener('click', (e) => {
    if (e.target === contactModal) {
      hideContactModal();
    }
  });
  
  // ESC tuşu ile kapatma
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      hideContactModal();
    }
  });

  // iOS Safari için özel touch event'leri
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    // iOS'ta modal içeriğinde scroll'u engelle
    const modalBody = contactModal.querySelector('.contact-modal-body');
    if (modalBody) {
      modalBody.addEventListener('touchmove', (e) => {
        e.stopPropagation();
      }, { passive: false });
    }
    
    // iOS'ta modal dışında scroll'u engelle
    contactModal.addEventListener('touchmove', (e) => {
      if (e.target === contactModal) {
        e.preventDefault();
      }
    }, { passive: false });
  }
}

/**
 * 9. Floating Katılım Butonu Fonksiyonalitesi
 */
function initFloatingRsvpButton() {
  const floatingBtn = document.getElementById('floating-rsvp-btn');
  const floatingBtnContent = floatingBtn?.querySelector('.floating-btn-content');
  
  if (!floatingBtn || !floatingBtnContent) return;

  // Butona tıklama olayı
  floatingBtnContent.addEventListener('click', () => {
    // Katılım bölümüne (3. bölüm) scroll et
    scrollToRsvpSection();
  });

  // Katılım bölümüne scroll fonksiyonu
  function scrollToRsvpSection() {
    const container = document.getElementById('fullpage-container');
    if (!container) return;

    // 3. bölüme (index 2) scroll et
    container.style.transition = 'transform 1s cubic-bezier(0.65, 0, 0.35, 1)';
    container.style.transform = 'translateY(-200vh)'; // 3. bölüm (index 2 * 100vh)

    // Scroll tamamlandıktan sonra transition'ı kaldır
    setTimeout(() => {
      container.style.transition = '';
    }, 1000);
  }

  // Mobil cihazlarda touch optimizasyonu
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    floatingBtnContent.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }

  // iOS Safari için özel düzeltmeler
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    // iOS'ta floating buton için touch optimizasyonu
    floatingBtnContent.addEventListener('touchstart', () => {
      floatingBtnContent.style.transform = 'scale(0.95)';
    }, { passive: true });
    
    floatingBtnContent.addEventListener('touchend', () => {
      setTimeout(() => {
        floatingBtnContent.style.transform = '';
      }, 100);
    }, { passive: true });
  }
}
