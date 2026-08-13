// ======================================================
// ZAMVO — SCRIPT PRINCIPAL
// ======================================================

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// ------------------------------------------------------
// BARRA DE PROGRESSO DA PÁGINA
// ------------------------------------------------------
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
scrollProgress.setAttribute('aria-hidden', 'true');
document.body.appendChild(scrollProgress);

function updateScrollProgress() {
  const scrollableHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress = scrollableHeight > 0
    ? (window.scrollY / scrollableHeight) * 100
    : 0;

  scrollProgress.style.width = `${Math.min(progress, 100)}%`;
}


// ------------------------------------------------------
// HEADER AO ROLAR
// ------------------------------------------------------
const siteHeader = document.getElementById('siteHeader');

function updateHeader() {
  if (!siteHeader) return;

  siteHeader.classList.toggle('scrolled', window.scrollY > 20);
}

function handleScroll() {
  updateHeader();
  updateScrollProgress();
}

handleScroll();
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', updateScrollProgress);


// ------------------------------------------------------
// MENU MOBILE
// ------------------------------------------------------
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

function closeMobileMenu() {
  if (!navToggle || !mainNav) return;

  mainNav.classList.remove('open');
  navToggle.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');

    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!mainNav.classList.contains('open')) return;

    const clickedInsideMenu = mainNav.contains(event.target);
    const clickedToggle = navToggle.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMobileMenu();
    }
  });
}


// ------------------------------------------------------
// ANIMAÇÕES DE ENTRADA
// ------------------------------------------------------
const revealElements = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
  revealElements.forEach((element) => {
    element.classList.add('in');
  });
} else if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add('in');
  });
}


// ------------------------------------------------------
// LINK ATIVO DO MENU CONFORME A SEÇÃO
// ------------------------------------------------------
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.main-nav a');

if ('IntersectionObserver' in window && sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      const id = visibleEntry.target.id;

      navLinks.forEach((link) => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === `#${id}`
        );
      });
    },
    {
      threshold: [0.25, 0.45, 0.65],
      rootMargin: '-15% 0px -55% 0px'
    }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}


// ------------------------------------------------------
// FAQ ACESSÍVEL
// ------------------------------------------------------
document.querySelectorAll('.faq-item').forEach((item, index) => {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  if (!button || !answer) return;

  const answerId = `faq-answer-${index + 1}`;

  answer.id = answerId;
  button.setAttribute('aria-controls', answerId);
  button.setAttribute('aria-expanded', 'false');

  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach((openItem) => {
      if (openItem === item) return;

      openItem.classList.remove('open');

      const openButton = openItem.querySelector('.faq-question');
      const openAnswer = openItem.querySelector('.faq-answer');

      if (openButton) {
        openButton.setAttribute('aria-expanded', 'false');
      }

      if (openAnswer) {
        openAnswer.style.maxHeight = null;
      }
    });

    item.classList.toggle('open', !isOpen);
    button.setAttribute('aria-expanded', String(!isOpen));

    answer.style.maxHeight = !isOpen
      ? `${answer.scrollHeight}px`
      : null;
  });
});


// ------------------------------------------------------
// EFEITO SUAVE NO MOCKUP DO HERO
// ------------------------------------------------------
const heroShowcase = document.getElementById('heroShowcase');

if (
  heroShowcase &&
  window.matchMedia('(pointer: fine)').matches &&
  !prefersReducedMotion
) {
  heroShowcase.addEventListener('mousemove', (event) => {
    const rect = heroShowcase.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    heroShowcase.style.transform =
      `translate3d(${x * 7}px, ${y * 7}px, 0)`;
  });

  heroShowcase.addEventListener('mouseleave', () => {
    heroShowcase.style.transform = '';
  });
}


// ------------------------------------------------------
// TOAST / MENSAGEM DE FEEDBACK
// ------------------------------------------------------
const toast = document.createElement('div');
toast.className = 'form-toast';
toast.setAttribute('role', 'status');
toast.setAttribute('aria-live', 'polite');
document.body.appendChild(toast);

let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.add('show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}


// ------------------------------------------------------
// FORMULÁRIO -> WHATSAPP
// ------------------------------------------------------
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const nomeInput = document.getElementById('nome');
  const emailInput = document.getElementById('email');
  const negocioInput = document.getElementById('negocio');
  const mensagemInput = document.getElementById('msg');

  [nomeInput, emailInput, negocioInput, mensagemInput].forEach((field) => {
    field?.addEventListener('input', () => {
      field.classList.remove('input-error');
    });

    field?.addEventListener('change', () => {
      field.classList.remove('input-error');
    });
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const nome = nomeInput?.value.trim() || '';
    const email = emailInput?.value.trim() || '';
    const negocio =
      negocioInput?.options[negocioInput.selectedIndex]?.text ||
      'Não informado';
    const mensagem = mensagemInput?.value.trim() || '';

    let firstInvalidField = null;

    if (!nome) {
      nomeInput?.classList.add('input-error');
      firstInvalidField = firstInvalidField || nomeInput;
    }

    if (!email || !emailInput?.checkValidity()) {
      emailInput?.classList.add('input-error');
      firstInvalidField = firstInvalidField || emailInput;
    }

    if (firstInvalidField) {
      showToast('Preencha corretamente seu nome e e-mail.');
      firstInvalidField.focus();
      return;
    }

    const whatsappNumber = '5518997976258';

    const texto = [
      'Olá! Vim pelo site da ZAMVO.',
      '',
      `Nome: ${nome}`,
      `E-mail: ${email}`,
      `Objetivo do projeto: ${negocio}`,
      '',
      'Sobre o projeto:',
      mensagem || 'Gostaria de conversar sobre um orçamento.'
    ].join('\n');

    const url =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(texto)}`;

    showToast('Abrindo o WhatsApp com sua mensagem...');

    setTimeout(() => {
      window.open(url, '_blank', 'noopener');
    }, 180);
  });
}


// ------------------------------------------------------
// EXEMPLOS RÁPIDOS NO FORMULÁRIO
// ------------------------------------------------------
const exampleChips = document.querySelectorAll('.example-chip');
const messageField = document.getElementById('msg');

if (exampleChips.length && messageField) {
  exampleChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const example = chip.dataset.example || '';

      messageField.value = example;
      messageField.classList.remove('input-error');
      messageField.focus();

      showToast('Exemplo preenchido. Você pode editar como quiser.');
    });
  });
}


// ------------------------------------------------------
// SEÇÕES DE CONFIANÇA E CASE
// ------------------------------------------------------
// As novas seções usam a mesma classe .reveal,
// então entram automaticamente no sistema de animação existente.


// ------------------------------------------------------
// CTA DE CONVERSÃO
// ------------------------------------------------------
// O CTA e o botão flutuante usam links diretos.
// Nenhum JavaScript adicional é necessário.


// ------------------------------------------------------
// ANO AUTOMÁTICO NO FOOTER
// ------------------------------------------------------
const footerCopy = document.querySelector('.footer-copy');

if (footerCopy) {
  footerCopy.textContent = `© ${new Date().getFullYear()} ZAMVO`;
}
