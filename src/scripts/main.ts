/**
 * Progressive enhancement: scroll reveal + marquee.
 *
 * Loaded as a module from BaseLayout. Everything here is an ENHANCEMENT —
 * without JS the site still shows all content (see global.css: elements are
 * visible by default and JS is what adds .rv-hidden).
 */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

/* ------------------------------------------------------------------ reveal */
if (!reduceMotion && 'IntersectionObserver' in window) {
  const STAGGER = 70; // ms between items inside a stagger group

  // Expand stagger groups into individually delayed children.
  document.querySelectorAll<HTMLElement>('[data-reveal="stagger"]').forEach((group) => {
    group.querySelectorAll<HTMLElement>(':scope > *').forEach((kid, i) => {
      kid.style.setProperty('--rv-delay', `${i * STAGGER}ms`);
      kid.setAttribute('data-reveal', 'up');
    });
    group.removeAttribute('data-reveal');
  });

  const all = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
  all.forEach((el) => el.classList.add('rv-hidden'));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('rv-hidden');
        entry.target.classList.add('rv-shown');
        io.unobserve(entry.target); // animate once — no re-trigger on scroll-up
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  all.forEach((el) => io.observe(el));

  // Safety net: anything still hidden but inside the viewport after 2.5s is
  // shown regardless, so a missed observer callback can never hide content.
  setTimeout(() => {
    document.querySelectorAll<HTMLElement>('[data-reveal].rv-hidden').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        el.classList.remove('rv-hidden');
        el.classList.add('rv-shown');
      }
    });
  }, 2500);
}

/* ----------------------------------------------------------------- marquee */
const MIN_ITEMS = 3; // rule: only run when there are more than 3 items
const DESKTOP = 1024;

document.querySelectorAll<HTMLElement>('[data-marquee]').forEach((mq) => {
  const track = mq.querySelector<HTMLElement>('[data-marquee-track]');
  const set = mq.querySelector<HTMLElement>('[data-marquee-set]');
  const dots = mq.querySelector<HTMLElement>('.mq-dots');
  if (!track || !set) return;

  const items = [...set.children] as HTMLElement[];
  const n = items.length;
  if (n <= MIN_ITEMS) return; // static grid is correct for <=3 items
  mq.dataset.mqCount = String(n);

  let clone: HTMLElement | null = null;
  let dotsBuilt = false;

  const buildDots = () => {
    if (!dots) return;
    dots.innerHTML = '';
    const mkBtn = (label: string) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', label);
      return b;
    };
    const prev = mkBtn(mq.dataset.mqPrev ?? 'Previous item');
    const next = mkBtn(mq.dataset.mqNext ?? 'Next item');
    dots.appendChild(prev);

    const dotsWrap = document.createElement('span');
    dotsWrap.style.display = 'contents';
    items.forEach((_, i) => {
      const b = mkBtn(`${mq.dataset.mqGoto ?? 'Go to item'} ${i + 1}`);
      b.addEventListener('click', () =>
        items[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' }),
      );
      dotsWrap.appendChild(b);
    });
    dots.appendChild(dotsWrap);
    dots.appendChild(next);

    const step = () => (items[0]?.getBoundingClientRect().width ?? 0) + 24;
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

    dotsBuilt = true;
    const sync = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      items.forEach((it, i) => {
        const d = Math.abs(it.offsetLeft + it.offsetWidth / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      const btns = [...(dotsWrap.children) as HTMLCollectionOf<HTMLElement>];
      btns.forEach((b, i) => b.setAttribute('aria-current', String(i === best)));
      prev.disabled = best === 0;
      next.disabled = best === items.length - 1;
    };
    track.addEventListener('scroll', sync, { passive: true });
    sync();
  };

  const enableAuto = () => {
    track.scrollLeft = 0;
    if (!clone) {
      clone = set.cloneNode(true) as HTMLElement;
      clone.classList.add('marquee-clone');
      clone.removeAttribute('data-marquee-set');
      clone.removeAttribute('data-animating');
      clone.setAttribute('aria-hidden', 'true'); // decorative duplicate
      track.appendChild(clone);
    }
    set.setAttribute('data-animating', 'true');
    set.style.animationDuration = mq.dataset.mqDur || '75s';
    if (dots) dots.style.display = 'none';
  };

  const disableAuto = () => {
    if (clone) {
      clone.remove();
      clone = null;
    }
    set.removeAttribute('data-animating');
    set.style.animationDuration = '';
    track.scrollLeft = 0;
    if (dots && !dotsBuilt) buildDots();
    if (dots) dots.style.display = 'flex';
  };

  const apply = () => {
    if (reduceMotion) disableAuto();
    else if (innerWidth >= DESKTOP) enableAuto();
    else disableAuto();
  };
  apply();

  let t: number | undefined;
  addEventListener(
    'resize',
    () => {
      clearTimeout(t);
      t = window.setTimeout(apply, 180);
    },
    { passive: true },
  );
});

/* ------------------------------------------------- product category filter */
// Inline chips toggle which product cards are visible. No library, and the
// grid is fully rendered in HTML so it still works with JS disabled.
const chips = [...document.querySelectorAll<HTMLElement>('.chip')];
// Works for both the product grid (#pgrid) and the article grid (#agrid).
const productCards = [
  ...document.querySelectorAll<HTMLElement>('#pgrid [data-cat], #agrid [data-cat]'),
];
const emptyState = document.getElementById('aempty');
if (chips.length && productCards.length) {
  const ACTIVE = ['btn-primary'];
  const IDLE = ['btn-outline-ink'];
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => {
        c.classList.remove(...ACTIVE);
        c.classList.add(...IDLE);
      });
      chip.classList.add(...ACTIVE);
      chip.classList.remove(...IDLE);
      const f = chip.dataset.f;
      let visible = 0;
      productCards.forEach((card) => {
        const show = f === 'all' || card.dataset.cat === f;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      // Show the empty-state note when a filter matches nothing.
      if (emptyState) emptyState.classList.toggle('hidden', visible > 0);
    });
  });
}

