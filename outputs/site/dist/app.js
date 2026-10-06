
import { site } from './content.js';

const $ = (selector) => document.querySelector(selector);
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const grid = $('#project-grid');
const more = $('#load-more');
const dialog = $('#demo-dialog');
const loader = $('#demo-loading');
let shown = 0;
let activeVideo = null;
let activeProject = null;
let lastTrigger = null;
let loadTimer = null;
let selectedProject = null;
let frame = null;
const videos = [];
const validProjects = site.projects.filter(project => {
  try { return new URL(project.url).protocol === 'https:'; } catch { return false; }
});
const priceLabel = value => value % 10000 === 0
  ? (value / 10000).toLocaleString('ko-KR') + '만원'
  : value.toLocaleString('ko-KR') + '원';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function stopPreview() {
  if (!activeVideo) return;
  activeVideo.pause();
  activeVideo.closest('.project-card').classList.remove('is-playing');
  activeVideo = null;
}
async function playPreview(video) {
  if (!video || motionQuery.matches || dialog?.open || $('#site-menu')?.open || document.hidden) return;
  if (activeVideo === video) return;
  stopPreview();
  activeVideo = video;
  if (!video.src) video.src = video.dataset.src;
  try {
    await video.play();
    if (activeVideo === video && !dialog?.open && !$('#site-menu')?.open) video.closest('.project-card').classList.add('is-playing');
    else video.pause();
  } catch {
    if (activeVideo === video) stopPreview();
  }
}

function renderProjects() {
  const next = Math.min(shown + (shown ? site.pagination.step : site.pagination.initial), validProjects.length);
  let firstNewButton;
  for (const [index, project] of validProjects.slice(shown, next).entries()) {
    const card = element('article', 'project-card');
    card.dataset.project = project.id;
    const button = element('a', 'project-open');
    button.href = project.url;
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.setAttribute('aria-label', project.name + ' 데모 체험하기');
    button.setAttribute('aria-haspopup', 'dialog');
    const visual = element('span', 'project-visual');
    const cover = element('img', 'project-cover');
    cover.src = project.cover;
    cover.alt = project.name + ' 홈페이지 미리보기';
    cover.width = project.coverWidth || 1440;
    cover.height = project.coverHeight || 1000;
    if (project.coverSmall) {
      cover.srcset = project.coverSmall + ' 800w, ' + project.cover + ' ' + cover.width + 'w';
      cover.sizes = '(max-width: 700px) calc((100vw - 72px) / 2), (max-width: 1023px) calc((98vw - 110px) / 2), (max-width: 1100px) calc((98vw - 134px) / 3), (min-width: 1972px) 579px, calc((98vw - 150px) / 3)';
    }
    cover.loading = 'lazy'; cover.decoding = 'async';
    visual.append(cover);
    let video;
    if (project.video) {
      video = element('video', 'project-video');
      video.dataset.src = project.video;
      video.muted = true; video.loop = true; video.playsInline = true;
      video.preload = 'none'; video.poster = project.cover;
      video.setAttribute('aria-hidden', 'true');
      video.addEventListener('error', () => { if (activeVideo === video) stopPreview(); });
      videos.push(video);
      visual.append(video);
    }
    const meta = element('div', 'project-meta');
    const category = element('span', 'project-category');
    const number = element('span', 'project-index', String(shown + index + 1).padStart(2, '0'));
    number.setAttribute('aria-hidden', 'true');
    category.append(number, element('span', '', project.type));
    const heading = element('h3', 'project-name', project.name);
    const description = element('p', 'project-desc', project.description);
    meta.append(category, heading, description);
    button.append(visual, meta);
    button.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openDemo(project, button);
    });
    button.addEventListener('pointerenter', () => { if (finePointer.matches) playPreview(video); });
    button.addEventListener('pointerleave', () => { if (finePointer.matches && activeVideo === video) stopPreview(); });
    button.addEventListener('focus', () => { if (finePointer.matches) playPreview(video); });
    button.addEventListener('blur', () => { if (activeVideo === video) stopPreview(); });
    card.append(button);
    if (Number.isFinite(project.startingPrice)) card.append(element('p', 'project-price', priceLabel(project.startingPrice) + '부터'));
    grid.append(card);
    firstNewButton ||= button;
  }
  const wasMore = shown > 0;
  shown = next;
  more.hidden = shown >= validProjects.length;
  if (wasMore && firstNewButton) firstNewButton.focus({ preventScroll: true });
  chooseMobilePreview();
}

more?.addEventListener('click', renderProjects);

function chooseMobilePreview() {
  if (finePointer.matches || motionQuery.matches || dialog?.open || $('#site-menu')?.open || document.hidden) return;
  let candidate = null;
  let distance = Infinity;
  for (const video of videos) {
    const rect = video.getBoundingClientRect();
    const visible = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
    if (visible / rect.height < .55) continue;
    const current = Math.abs((rect.top + rect.bottom) / 2 - innerHeight / 2);
    if (current < distance) { candidate = video; distance = current; }
  }
  if (candidate) playPreview(candidate);
  else stopPreview();
}
let scrollScheduled = false;
addEventListener('scroll', () => {
  if (scrollScheduled || !videos.length || finePointer.matches) return;
  scrollScheduled = true;
  requestAnimationFrame(() => { chooseMobilePreview(); scrollScheduled = false; });
}, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopPreview(); else chooseMobilePreview();
});
motionQuery.addEventListener('change', () => { stopPreview(); chooseMobilePreview(); });

function openDemo(project, trigger) {
  if (dialog?.open) return;
  activeProject = project;
  lastTrigger = trigger;
  stopPreview();
  $('#demo-name').textContent = project.name;
  $('#demo-external').href = project.url;
  loader.hidden = false;
  loader.querySelector('p').textContent = '데모를 열고 있습니다.';
  dialog.showModal();
  document.body.classList.add('modal-open');
  document.dispatchEvent(new Event('site-overlay-change'));
  frame = document.createElement('iframe');
  frame.title = project.name + ' 데모 사이트';
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.allow = 'fullscreen';
  frame.src = project.url;
  frame.addEventListener('load', () => {
    clearTimeout(loadTimer);
    loader.hidden = true;
  }, { once: true });
  $('#demo-body').append(frame);
  loadTimer = setTimeout(() => {
    loader.hidden = true;
  }, 12000);
  $('#demo-close').focus({ preventScroll: true });
}
function cleanDemo() {
  clearTimeout(loadTimer);
  frame?.remove(); frame = null;
  activeProject = null;
  document.body.classList.remove('modal-open');
}
function closeDemo() {
  if (!dialog?.open) return;
  cleanDemo();
  dialog.close();
  lastTrigger?.focus({ preventScroll: true });
  chooseMobilePreview();
}
dialog?.addEventListener('cancel', event => {
  event.preventDefault();
  closeDemo();
});
$('#demo-close')?.addEventListener('click', closeDemo);
dialog?.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDemo();
});
dialog?.addEventListener('close', () => {
  if (!dialog?.open) cleanDemo();
});
$('#demo-inquiry')?.addEventListener('click', () => {
  selectedProject = activeProject;
  closeDemo();
  const destination = './contact.html' + (selectedProject ? '?project=' + encodeURIComponent(selectedProject.id) : '');
  location.assign(destination);
});

function updateContacts() {
  for (const link of document.querySelectorAll('[data-contact]')) {
    const type = link.dataset.contact;
    const value = site.contacts[type]?.trim();
    link.querySelector('.pending-label')?.remove();
    link.querySelector('.contact-value')?.remove();
    if (!value) {
      link.href = '#contact';
      link.setAttribute('aria-disabled', 'true');
      link.insertBefore(element('span', 'pending-label', '연결 준비 중'), link.lastElementChild);
      continue;
    }
    link.removeAttribute('aria-disabled');
    if (type !== 'kakao') link.firstElementChild.append(element('span', 'contact-value', value));
    if (type === 'email') {
      const subject = selectedProject ? 'FLOWAX-PAGE 제작 문의 — ' + selectedProject.name : 'FLOWAX-PAGE 제작 문의';
      link.href = 'mailto:' + value + '?subject=' + encodeURIComponent(subject);
    } else if (type === 'phone') {
      link.href = 'tel:' + value.replace(/[^\d+]/g, '');
    } else {
      try {
        const url = new URL(value);
        if (url.protocol !== 'https:') throw new Error('Invalid contact URL');
        link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
      } catch {
        link.href = '#contact'; link.setAttribute('aria-disabled', 'true');
        link.insertBefore(element('span', 'pending-label', '연결 준비 중'), link.lastElementChild);
      }
    }
  }
}
for (const link of document.querySelectorAll('[data-contact]')) {
  link.addEventListener('click', event => {
    if (link.getAttribute('aria-disabled') !== 'true') return;
    event.preventDefault();
    $('#contact-status').textContent = '상담 채널을 준비하고 있습니다. 연락처가 등록되면 이곳에서 바로 연결됩니다.';
  });
}

for (const [title, entries] of ($('#capabilities-list') ? site.capabilities : [])) {
  const details = element('details', 'capability');
  const summary = element('summary', '', title);
  const list = element('ul');
  entries.forEach(entry => list.append(element('li', '', entry)));
  details.append(summary, list);
  $('#capabilities-list').append(details);
}
for (const node of document.querySelectorAll('[data-price]')) {
  node.textContent = priceLabel(site.prices[node.dataset.price]);
}

if (grid) {
  const total = $('#project-total');
  total.textContent = String(validProjects.length).padStart(2, '0');
  total.setAttribute('aria-label', '총 ' + validProjects.length + '개 작품');
  renderProjects();
}
selectedProject = validProjects.find(project => project.id === new URLSearchParams(location.search).get('project')) || null;
if ($('#selected-project') && selectedProject) {
  $('#selected-project').textContent = '관심 있는 작품: ' + selectedProject.name;
  $('#selected-project').hidden = false;
}
updateContacts();
initContactGuide();

function initContactGuide() {
  const root = $('#contact-guide');
  if (!root) return;
  const title = $('#contact-reply-title');
  const copy = $('#contact-reply-copy');
  const choices = [...root.querySelectorAll('[data-intent]')];
  const art = $('#contact-guide-art');
  const emailLink = $('[data-contact="email"]');
  const emailBase = emailLink?.getAttribute('href');
  const replies = {
    reference: {
      title: '좋아하는 화면에서 시작해요.',
      copy: selectedProject
        ? '‘' + selectedProject.name + '’에서 마음에 든 점과 바꾸고 싶은 부분을 알려주세요. 함께 살펴볼게요.'
        : '마음에 든 작품의 이름이나 주소를 보내주세요. 바꾸고 싶은 부분부터 함께 이야기해요.',
      email: '마음에 드는 포트폴리오를 바탕으로 홈페이지를 제작하고 싶습니다.'
    },
    custom: {
      title: '우리 브랜드만의 페이지로.',
      copy: '소개하고 싶은 내용과 원하는 분위기를 알려주세요. 필요한 화면과 기능을 함께 정해볼게요.',
      email: '우리 브랜드에 맞는 홈페이지를 처음부터 제작하고 싶습니다.'
    },
    explore: {
      title: '아직 정하지 않아도 괜찮아요.',
      copy: '어떤 일을 하시는지, 홈페이지로 무엇을 하고 싶은지부터 이야기해 주세요. 함께 방향을 찾아볼게요.',
      email: '홈페이지 제작을 고민 중입니다. 어떤 방향으로 시작하면 좋을지 상담받고 싶습니다.'
    }
  };
  let animations = [];
  let inView = false;
  let greeted = false;
  const stopMotion = () => { animations.forEach(animation => animation.cancel()); animations = []; };
  const animate = (selector, frames, duration) => {
    const node = root.querySelector(selector);
    if (node?.animate) animations.push(node.animate(frames, { duration, easing: 'ease-in-out' }));
  };
  const react = key => {
    stopMotion();
    if (motionQuery.matches || !inView || document.hidden || document.querySelector('dialog[open]')) return;
    animate('.contact-maker-arm', [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(-12deg)' },
      { transform: 'rotate(-3deg)' }, { transform: 'rotate(-10deg)' }, { transform: 'rotate(0deg)' }
    ], key === 'hello' ? 1100 : 700);
    animate('.contact-maker-head', [
      { transform: 'rotate(0deg)' }, { transform: 'rotate(' + (key === 'explore' ? 5 : -5) + 'deg)' }, { transform: 'rotate(0deg)' }
    ], 650);
    animate('.contact-eye', [
      { transform: 'scaleY(1)', offset: 0 }, { transform: 'scaleY(.1)', offset: .35 },
      { transform: 'scaleY(1)', offset: .55 }, { transform: 'scaleY(1)', offset: 1 }
    ], 500);
    animate('.contact-spark', [{ opacity: .2, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1)' }], 450);
    if (key !== 'hello') animate('#contact-reply', [{ opacity: .5, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], 250);
  };
  const select = (key, motion = true) => {
    const reply = replies[key];
    if (!reply) return;
    title.textContent = reply.title;
    copy.textContent = reply.copy;
    choices.forEach(button => {
      const active = button.dataset.intent === key;
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('.contact-choice-mark').textContent = active ? '✓' : '↗';
    });
    $('#contact-next').hidden = false;
    $('#contact-channel-note').textContent = '이메일 문의에는 방금 고른 이야기가 함께 담겨요.';
    if (emailBase?.startsWith('mailto:')) {
      const projectLine = selectedProject ? '\n\n관심 있는 작품: ' + selectedProject.name + '\n데모 주소: ' + selectedProject.url : '';
      emailLink.href = emailBase + '&body=' + encodeURIComponent('안녕하세요, FLOWAX-PAGE.\n\n' + reply.email + projectLine);
    }
    if (motion) react(key);
  };
  choices.forEach(button => button.addEventListener('click', () => select(button.dataset.intent)));
  root.querySelector('.contact-choices').hidden = false;
  if (selectedProject) select('reference', false);
  else copy.textContent = '지금 생각과 가까운 이야기를 골라주세요. 어디서부터 시작하면 좋을지 함께 살펴볼게요.';
  $('#contact-next').addEventListener('click', event => {
    event.preventDefault();
    $('#contact-channels').scrollIntoView({ behavior: motionQuery.matches ? 'instant' : 'smooth', block: 'start' });
    $('#contact-channels-title').focus({ preventScroll: true });
  });
  const syncMotion = () => {
    if (!inView || document.hidden || document.querySelector('dialog[open]') || motionQuery.matches) { stopMotion(); return; }
    if (!greeted) { greeted = true; react('hello'); }
  };
  new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncMotion(); }, { threshold: .15 }).observe(art);
  document.addEventListener('site-overlay-change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  motionQuery.addEventListener('change', syncMotion);
}

function initServiceProcess() {
  const root = $('#process.process-intro');
  if (!root) return;
  const panels = [...root.querySelectorAll('.process-panel')];
  const buttons = [...root.querySelectorAll('.process-step-button')];
  const bars = buttons.map(button => button.querySelector('.process-track i'));
  const { gsap } = window;
  let current = 0;
  let manual = motionQuery.matches;
  let inView = root.getBoundingClientRect().bottom > 0 && root.getBoundingClientRect().top < innerHeight;
  let sequence;
  let scene;
  const syncPlayback = () => {
    const suspended = !inView || document.hidden || !!document.querySelector('dialog[open]');
    sequence?.paused(suspended || manual || motionQuery.matches);
    scene?.paused(suspended);
  };
  const showStep = (index, animate = true) => {
    scene?.kill();
    current = index;
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    buttons.forEach((button, i) => {
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    root.dataset.step = String(index + 1);
    const panel = panels[index];
    const pieces = panel.querySelectorAll('.process-piece');
    const accent = panel.querySelector('.process-accent');
    const copy = panel.querySelectorAll('.process-copy > *');
    if (gsap && animate && !motionQuery.matches) {
      scene = gsap.timeline({ id: 'service-scene' })
        .fromTo(pieces, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .45, stagger: .12, ease: 'power3.out' }, 0)
        .fromTo(copy, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .3, stagger: .045, ease: 'power3.out' }, .1)
        .fromTo(accent, { scale: .8, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: .35, ease: 'back.out(1.3)' }, .55);
    } else {
      gsap?.set([...pieces, accent, ...copy], { clearProps: 'opacity,transform' });
    }
    syncPlayback();
  };
  const markProgress = index => {
    bars.forEach((bar, i) => { bar.style.transform = 'scaleX(' + (i <= index ? 1 : 0) + ')'; });
  };
  root.classList.add('is-ready');
  root.querySelector('.process-steps').hidden = false;
  showStep(0);
  if (gsap && !motionQuery.matches) {
    sequence = gsap.timeline({ id: 'service-process', paused: true });
    panels.forEach((panel, i) => {
      const at = i * 4.4;
      sequence.addLabel('step-' + (i + 1), at);
      if (i) sequence.call(() => showStep(i), [], at);
      sequence.fromTo(bars[i], { scaleX: 0 }, { scaleX: 1, duration: 4.4, ease: 'none', immediateRender: false }, at);
    });
  } else markProgress(0);
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      manual = true;
      sequence?.pause();
      root.querySelector('.process-panels').setAttribute('aria-live', 'polite');
      showStep(index);
      markProgress(index);
    });
  });
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }, { threshold: .05 });
  observer.observe(root);
  document.addEventListener('visibilitychange', syncPlayback);
  document.addEventListener('site-overlay-change', syncPlayback);
  addEventListener('pagehide', () => { sequence?.pause(); scene?.pause(); });
  addEventListener('pageshow', syncPlayback);
  motionQuery.addEventListener('change', () => {
    if (motionQuery.matches) {
      manual = true;
      sequence?.pause();
      showStep(current, false);
      markProgress(current);
    }
    syncPlayback();
  });
  syncPlayback();
}

function initMotion() {
  initServiceProcess();
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);


  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray('.section-intro, .pricing-option, .capabilities-heading, .contact-heading').forEach(node => {
      gsap.from(node, { y: 30, opacity: 0, duration: .75, ease: 'power3.out', scrollTrigger: { trigger: node, start: 'top 93%', once: true } });
    });
    if (!$('.hero')) return;
    const title = $('.hero-title-word');

    gsap.from('.hero-art', { opacity: 0, y: 12, duration: .7, ease: 'power3.out' });
    gsap.from('.hero-lead', { opacity: 0, y: 12, duration: .65, delay: .15, ease: 'power3.out' });
    const kicker = $('.hero-kicker');
    const story = gsap.timeline({ id: 'hero-story', repeat: -1, repeatDelay: .25, paused: true, defaults: { ease: 'power2.inOut' } });
    const word = (label, lead, text, time) => {
      story.addLabel(label, time)
        .to([title, kicker], { opacity: 0, y: -8, duration: .16 }, time)
        .set(kicker, { textContent: lead, y: 9 }, time + .16)
        .set(title, { textContent: text, y: 12 }, time + .16)
        .to([kicker, title], { opacity: 1, y: 0, duration: .32, stagger: .04, ease: 'power3.out' }, time + .17);
    };

    // Assemble the page: the two makers carry text and an image into place.
    story.addLabel('design', 0)
      .set(title, { textContent: '디자인으로.', opacity: 1, y: 0 }, 0)
      .set(kicker, { textContent: '당신의 생각을,', opacity: 1, y: 0 }, 0)
      .set('.page-mobile, .page-interaction, .page-selection, .studio-notes, .paper-piece, .spark', { opacity: 0 }, 0)
      .set('.page-window', { x: 0, y: 0, scaleX: .06, scaleY: 1, opacity: 0, rotation: 0, svgOrigin: '554 302', smoothOrigin: false }, 0)
      .set('.page-mobile', { x: 0, y: 20, scale: .8, rotation: 5, svgOrigin: '554 302', smoothOrigin: false }, 0)
      .set('.mobile-scroll', { y: 0 }, 0)
      .set('.studio-notes', { y: 0 }, 0)
      .to('.page-window', { scaleX: 1, opacity: 1, duration: .85 }, .2)
      .fromTo('.maker-left-arm', { rotation: 24, svgOrigin: '257 302' }, { rotation: 0, duration: .85 }, .2)
      .fromTo('.maker-right-arm', { rotation: -19, svgOrigin: '824 298' }, { rotation: 0, duration: .85 }, .3)
      .fromTo('.maker-left', { rotation: -2, svgOrigin: '226 536' }, { rotation: 0, duration: .8 }, .25)
      .fromTo('.maker-right', { rotation: 2, svgOrigin: '862 537' }, { rotation: 0, duration: .8 }, .4)
      .fromTo('.page-type', { x: -82, y: -8, rotation: -5, opacity: 0 }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: .65, ease: 'power3.out' }, 1.15)
      .to('.maker-left-arm', { rotation: -11, duration: .3 }, 1.15)
      .to('.maker-left-arm', { rotation: 0, duration: .5 }, 1.45)
      .fromTo('.page-picture', { x: 86, y: -24, rotation: 12, scale: 1, opacity: 0, svgOrigin: '631 293', smoothOrigin: false }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: .65, ease: 'power3.out' }, 1.8)
      .to('.maker-right-arm', { rotation: 12, duration: .3 }, 1.8)
      .to('.maker-right-arm', { rotation: 0, duration: .5 }, 2.1)
      .fromTo('.page-button', { scale: .2, opacity: 0, x: 0, y: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: .4, ease: 'back.out(1.5)' }, 2.4)
      .fromTo('.page-footer', { opacity: 0, y: 0 }, { opacity: 1, duration: .4 }, 2.65);

    // Rearrange the same components, with floating design samples.
    word('personal', '좋아하는 분위기로,', '당신답게.', 3.3);
    story.to('.studio-notes', { opacity: 1, duration: .3 }, 3.65)
      .fromTo('.note-type', { y: 22, rotation: -12, transformOrigin: '50% 50%' }, { y: 0, rotation: -7, duration: .6 }, 3.65)
      .fromTo('.note-image', { y: 28, rotation: 14, transformOrigin: '50% 50%' }, { y: 0, rotation: 8, duration: .6 }, 3.8)
      .to('.page-type', { x: 204, y: 8, duration: .8 }, 3.9)
      .to('.page-picture', { x: -153, y: -3, rotation: -3, duration: .8 }, 3.9)
      .to('.page-button', { x: 205, duration: .8 }, 3.9)
      .to('.maker-left-head', { rotation: 5, svgOrigin: '224 270', duration: .4 }, 4.05)
      .to('.maker-right-head', { rotation: -5, svgOrigin: '857 274', duration: .4 }, 4.2)
      .to('.note-type', { y: -5, rotation: 4, duration: .8 }, 4.5)
      .to('.note-image', { y: 4, rotation: -4, duration: .8 }, 4.6)
      .to('.page-type, .page-picture, .page-button', { x: 0, y: 0, rotation: 0, duration: .75 }, 5.3)
      .to('.studio-notes', { opacity: 0, y: -10, duration: .35 }, 5.6)
      .to('.maker-left-head, .maker-right-head', { rotation: 0, duration: .5 }, 5.4);

    // Bring the picture to life and bounce the call to action.
    word('motion', '멈춰 있던 화면에,', '움직임을.', 6.3);
    story.to('.picture-sun', { x: 10, y: -9, duration: .65 }, 6.65)
      .to('.picture-mountains', { attr: { d: 'M533 320L581 301L621 276L672 304L729 257V369H533Z' }, duration: 1 }, 6.7)
      .to('.page-picture', { rotation: 3, scale: 1.04, duration: .5 }, 6.85)
      .to('.page-picture', { rotation: -2, duration: .55 }, 7.35)
      .to('.page-button', { y: -6, duration: .32, ease: 'power2.out' }, 7.2)
      .to('.page-button', { y: 0, duration: .4, ease: 'bounce.out' }, 7.52)
      .to('.maker-left-arm', { rotation: -7, duration: .35 }, 7.25)
      .to('.maker-right-arm', { rotation: 8, duration: .35 }, 7.4)
      .to('.page-picture', { rotation: 0, scale: 1, duration: .5 }, 7.9)
      .to('.picture-sun', { x: 0, y: 0, duration: .7 }, 8.1)
      .to('.picture-mountains', { attr: { d: 'M533 339L583 289L621 319L667 261L729 330V369H533Z' }, duration: .75 }, 8.1)
      .to('.maker-left-arm, .maker-right-arm', { rotation: 0, duration: .5 }, 8.3);

    // Fold the desktop into a phone, then scroll its content.
    word('mobile', '작은 화면에서도,', '자연스럽게.', 9.3);
    story.to('.page-window', { scaleX: .42, scaleY: 1.02, opacity: 0, duration: .6 }, 9.6)
      .to('.page-mobile', { opacity: 1, y: 0, scale: 1, rotation: 0, duration: .65, ease: 'back.out(1.2)' }, 9.8)
      .to('.maker-left', { rotation: 3, duration: .6 }, 9.7)
      .to('.maker-right', { rotation: -3, duration: .6 }, 9.85)
      .to('.maker-left-head', { rotation: 5, duration: .45 }, 10.1)
      .to('.maker-right-head', { rotation: -5, duration: .45 }, 10.2)
      .fromTo('.mobile-touch', { opacity: 0, y: 16 }, { opacity: .7, y: 0, duration: .25 }, 10.65)
      .to('.mobile-touch', { y: -54, duration: .75 }, 10.9)
      .to('.mobile-scroll', { y: -64, duration: .85 }, 10.9)
      .to('.mobile-touch', { opacity: 0, duration: .25 }, 11.6)
      .to('.mobile-scroll', { y: 0, duration: .65 }, 11.9)
      .to('.page-mobile', { opacity: 0, scale: .85, y: 10, rotation: -4, duration: .45 }, 12.6)
      .to('.page-window', { opacity: 1, scaleX: 1, scaleY: 1, duration: .65 }, 12.6)
      .to('.maker-left, .maker-right, .maker-left-head, .maker-right-head', { rotation: 0, duration: .55 }, 12.6);

    // Click the button and reveal a small greeting.
    word('interaction', '클릭하는 순간까지,', '섬세하게.', 12.9);
    story.fromTo('.page-cursor', { x: 70, y: 40, opacity: 0 }, { x: -255, y: 13, opacity: 1, duration: .9 }, 13.1)
      .to('.page-button', { scale: .92, duration: .12 }, 14)
      .to('.page-button', { scale: 1, duration: .25 }, 14.12)
      .fromTo('.click-ripple', { x: -262, y: 10, scale: .5, opacity: .6, transformOrigin: '50% 50%' }, { scale: 2, opacity: 0, duration: .5, immediateRender: false }, 14)
      .fromTo('.page-interaction', { y: 18, scale: .82, opacity: 0, svgOrigin: '554 300', smoothOrigin: false }, { y: 0, scale: 1, opacity: 1, duration: .55, ease: 'back.out(1.2)' }, 14.15)
      .to('.maker-left-head', { rotation: 6, duration: .3, repeat: 1, yoyo: true }, 14.6)
      .to('.maker-right-head', { rotation: -6, duration: .3, repeat: 1, yoyo: true }, 14.75)
      .to('.page-cursor', { x: -5, y: -125, duration: .65 }, 15.05)
      .to('.page-interaction', { opacity: 0, scale: .92, y: -8, duration: .25 }, 15.75);

    // Pull the picture into a different layout, showing custom editing.
    word('custom', '정해진 틀을 넘어,', '원하는 대로.', 16);
    story.to('.page-selection', { opacity: 1, duration: .2 }, 16.3)
      .to('.page-cursor', { x: 43, y: 26, duration: .55 }, 16.2)
      .to('.page-picture, .page-selection', { scale: .82, x: -14, y: 17, svgOrigin: '631 293', smoothOrigin: false, duration: .75 }, 16.9)
      .to('.page-cursor', { x: 10, y: 25, duration: .75 }, 16.9)
      .to('.page-type', { y: -5, x: 8, duration: .7 }, 16.9)
      .to('.maker-right-arm', { rotation: 12, duration: .5 }, 16.9)
      .to('.maker-left-arm', { rotation: -9, duration: .5 }, 17.05)
      .to('.page-picture, .page-selection', { scale: 1, x: 0, y: 0, duration: .75 }, 17.95)
      .to('.page-type', { x: 0, y: 0, duration: .75 }, 17.95)
      .to('.page-cursor', { x: 43, y: 26, duration: .75 }, 17.95)
      .to('.page-selection, .page-cursor', { opacity: 0, duration: .3 }, 18.75)
      .to('.maker-left-arm, .maker-right-arm', { rotation: 0, duration: .5 }, 18.55);

    // Celebrate, wave, and reset into the next build.
    word('complete', '이 모든 생각을,', '웹사이트로.', 19.15);
    story.to('.page-window', { scale: 1.025, y: -5, duration: .35 }, 19.45)
      .to('.page-window', { scale: 1, y: 0, duration: .5 }, 19.8)
      .fromTo('.spark', { opacity: 0, scale: .5, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: .3, stagger: .08 }, 19.5)
      .fromTo('.paper-piece', { opacity: 0, y: 24, rotation: -20, transformOrigin: '50% 50%' }, { opacity: 1, y: -5, rotation: 20, duration: .6, stagger: .06 }, 19.55)
      .to('.paper-piece', { opacity: 0, y: 22, rotation: 70, duration: .75, stagger: .06 }, 20.2)
      .to('.spark', { opacity: 0, duration: .4 }, 20.45)
      .to('.maker-left-arm', { rotation: -18, duration: .4 }, 19.5)
      .to('.maker-right-arm', { rotation: 20, duration: .4 }, 19.6)
      .to('.maker-left-arm', { rotation: -8, duration: .22, repeat: 3, yoyo: true }, 19.9)
      .to('.maker-right-arm', { rotation: 9, duration: .22, repeat: 3, yoyo: true }, 20)
      .to('.maker-left-arm, .maker-right-arm', { rotation: 0, duration: .5 }, 20.9)
      .to('.page-type, .page-picture, .page-button, .page-footer', { opacity: 0, y: -10, duration: .3, stagger: .07 }, 21.55)
      .to('.page-window', { scaleX: .06, opacity: 0, duration: .65 }, 22)
      .to('.maker-left-arm', { rotation: 24, duration: .65 }, 22)
      .to('.maker-right-arm', { rotation: -19, duration: .65 }, 22);
    for (const time of [1.1, 4.8, 8.6, 11.2, 15.1, 20.6]) {
      story.to('.maker-eye', { scaleY: .12, transformOrigin: '50% 50%', duration: .07 }, time)
        .to('.maker-eye', { scaleY: 1, duration: .12 }, time + .07);
    }


    let inView = true;
    const syncPlayback = () => story.paused(!inView || document.hidden || $('#site-menu')?.open);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncPlayback(); }, { threshold: .05 });
    observer.observe($('.hero'));

    document.addEventListener('visibilitychange', syncPlayback);
    document.addEventListener('site-overlay-change', syncPlayback);
    syncPlayback();

    const art = $('.hero-art');
    const moveX = gsap.quickTo('.page-float', 'x', { duration: .8, ease: 'power3.out' });
    const moveY = gsap.quickTo('.page-float', 'y', { duration: .8, ease: 'power3.out' });
    const onMove = event => {
      if (!finePointer.matches) return;
      const rect = art.getBoundingClientRect();
      moveX(((event.clientX - rect.left) / rect.width - .5) * 7);
      moveY(((event.clientY - rect.top) / rect.height - .5) * 5);
    };
    const onLeave = () => { moveX(0); moveY(0); };
    art.addEventListener('pointermove', onMove);
    art.addEventListener('pointerleave', onLeave);

    return () => {
      observer.disconnect();

      document.removeEventListener('visibilitychange', syncPlayback);
      document.removeEventListener('site-overlay-change', syncPlayback);
      art.removeEventListener('pointermove', onMove);
      art.removeEventListener('pointerleave', onLeave);

      title.textContent = '웹사이트로.';
      kicker.textContent = '당신의 생각을,';
    };
  });
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}
initSiteNavigation();
initSiteCursor();
if (grid && ['#services', '#capabilities', '#process'].includes(location.hash)) location.replace('./services.html' + location.hash);
if (grid && location.hash === '#contact') location.replace('./contact.html');
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMotion, { once: true });
else initMotion();


// Optional browser capability; ordinary browsers use the interface above.
if (document.modelContext?.registerTool) {
  const lifecycle = new AbortController();
  try {
    Promise.resolve(document.modelContext.registerTool({
      name: 'list_portfolio',
      title: '포트폴리오 목록 보기',
      description: 'FLOWAX-PAGE에 등록된 포트폴리오 데모의 이름과 주소를 조회합니다.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('No input properties are accepted.');
        return validProjects.map(({ id, name, url }) => ({ id, name, url }));
      }
    }, { signal: lifecycle.signal })).catch(() => {});
    addEventListener('pagehide', event => { if (!event.persisted) lifecycle.abort(); });
  } catch { /* Progressive enhancement: the visible interface remains available. */ }
}


function initSiteNavigation() {
  const menu = $('#site-menu');
  const opener = $('#menu-toggle');
  const closer = $('#menu-close');
  const surface = menu.querySelector('.menu-surface');
  let menuAnimation;
  let closingPromise = null;
  const notify = () => document.dispatchEvent(new Event('site-overlay-change'));
  const openMenu = () => {
    if (menu.open || closingPromise) return;
    stopPreview();
    surface.style.clipPath = 'none';
    menu.showModal();
    document.body.classList.add('menu-open');
    opener.setAttribute('aria-expanded', 'true');
    closer.focus({ preventScroll: true });
    notify();
    if (window.gsap && !motionQuery.matches) {
      menuAnimation = gsap.timeline()
        .fromTo(surface, { clipPath: 'ellipse(6% 60% at 100% 50%)' }, { clipPath: 'ellipse(155% 130% at 100% 50%)', duration: .6, ease: 'power3.inOut' }, 0)
        .fromTo('.menu-links>a', { opacity: 0, x: 38 }, { opacity: 1, x: 0, duration: .45, stagger: .07, ease: 'power3.out' }, .22);
    }
  };
  const closeMenu = (restoreFocus = true) => {
    if (closingPromise) return closingPromise;
    if (!menu.open) return Promise.resolve();
    menuAnimation?.kill();
    closingPromise = new Promise(resolve => {
      const finish = () => {
        menu.close();
        document.body.classList.remove('menu-open');
        opener.setAttribute('aria-expanded', 'false');
        if (restoreFocus) opener.focus({ preventScroll: true });
        notify();
        chooseMobilePreview();
        resolve();
      };
      if (window.gsap && !motionQuery.matches) {
        menuAnimation = gsap.to(surface, { clipPath: 'ellipse(0% 60% at 100% 50%)', duration: .3, ease: 'power3.inOut', onComplete: finish });
      } else finish();
    }).finally(() => { closingPromise = null; });
    return closingPromise;
  };
  opener.addEventListener('click', openMenu);
  closer.addEventListener('click', () => closeMenu());
  menu.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
  menu.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const targets = [...menu.querySelectorAll('a[href], button:not([disabled])')].filter(node => node.getClientRects().length);
    const first = targets[0], last = targets.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  menu.addEventListener('close', () => {
    document.body.classList.remove('menu-open');
    opener.setAttribute('aria-expanded', 'false');
    notify();
  });
  for (const link of menu.querySelectorAll('nav a')) {
    link.addEventListener('click', async event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      const url = new URL(link.href);
      await closeMenu(false);
      const sameHome = (url.pathname === '/' || url.pathname.endsWith('/index.html')) &&
        (location.pathname === '/' || location.pathname.endsWith('/index.html'));
      if ((url.pathname === location.pathname || sameHome) && url.hash && $(url.hash)) {
        history.pushState(null, '', url);
        const target = $(url.hash);
        target.scrollIntoView({ behavior: motionQuery.matches ? 'instant' : 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      } else location.assign(url.href);
    });
  }
  addEventListener('pagehide', () => {
    menuAnimation?.kill();
    if (menu.open) menu.close();
    document.body.classList.remove('menu-open');
  });
  motionQuery.addEventListener('change', () => {
    if (menu.open && motionQuery.matches) {
      menuAnimation?.progress(1);
      surface.style.clipPath = 'none';
    }
  });
}

function initSiteCursor() {
  const cursor = element('div', 'site-cursor');
  cursor.setAttribute('aria-hidden', 'true');
  const tip = element('span', 'cursor-tip');
  tip.append(element('span', 'cursor-paper'));
  const frame = element('span', 'cursor-frame');
  for (let i = 0; i < 4; i++) frame.append(element('i', 'cursor-corner'));
  const ticket = element('span', 'cursor-ticket', '열어보기');
  ticket.append(element('span', 'cursor-ticket-arrow', '↗'));
  frame.append(ticket);
  cursor.append(frame, tip);
  document.body.append(cursor);
  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let raf = 0, visible = false, lastTime = 0;
  const hide = () => {
    visible = false;
    cursor.classList.remove('is-visible', 'is-pressed');
    document.documentElement.classList.remove('cursor-enabled');
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const hover = target => {
    const action = target?.closest('a,button,summary,[role=button]');
    cursor.classList.toggle('is-link', !!action);
    cursor.classList.toggle('is-project', !!target?.closest('.project-open'));
  };
  const tick = time => {
    // Keep the same trailing feel on 60 Hz and high refresh rate displays.
    const blend = 1 - Math.pow(.76, Math.min(time - lastTime, 32) / 16.67);
    lastTime = time;
    const dx = targetX - currentX, dy = targetY - currentY;
    currentX += dx * blend;
    currentY += dy * blend;
    const tilt = Math.max(-16, Math.min(16, dx * .32 - dy * .15));
    const framed = cursor.classList.contains('is-link');
    const project = cursor.classList.contains('is-project');
    frame.style.transform = 'translate3d(' + (currentX + (project ? 64 : 34)) + 'px,' + (currentY + (project ? 44 : 30)) + 'px,0) rotate(' + ((framed ? 0 : -12) + tilt) + 'deg)';
    tip.style.transform = 'translate3d(' + targetX + 'px,' + targetY + 'px,0) rotate(' + (tilt * .65) + 'deg)';
    if (visible && Math.abs(dx) + Math.abs(dy) > .1) raf = requestAnimationFrame(tick);
    else raf = 0;
  };
  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || motionQuery.matches || document.querySelector('dialog[open]')) {
      hide(); return;
    }
    targetX = event.clientX; targetY = event.clientY;
    if (!visible) { currentX = targetX; currentY = targetY; }
    visible = true;
    cursor.classList.add('is-visible');
    document.documentElement.classList.add('cursor-enabled');
    tip.style.transform = 'translate3d(' + targetX + 'px,' + targetY + 'px,0)';
    hover(event.target instanceof Element ? event.target : null);
    if (!raf) { lastTime = performance.now(); raf = requestAnimationFrame(tick); }
  }, { passive: true });
  document.addEventListener('pointerdown', event => {
    if (visible && event.button === 0) cursor.classList.add('is-pressed');
  });
  document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'));
  document.addEventListener('pointerout', event => { if (!event.relatedTarget) hide(); });
  document.addEventListener('keydown', event => { if (event.key === 'Tab') hide(); });
  document.addEventListener('site-overlay-change', hide);
  document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
  addEventListener('blur', hide);
  addEventListener('pagehide', hide);
  addEventListener('scroll', () => {
    if (visible) {
      hover(document.elementFromPoint(targetX, targetY));
      if (!raf) { lastTime = performance.now(); raf = requestAnimationFrame(tick); }
    }
  }, { passive: true });
  motionQuery.addEventListener('change', hide);
  finePointer.addEventListener('change', hide);
}

