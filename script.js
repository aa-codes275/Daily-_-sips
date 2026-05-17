/* ══════════════════════════════════════════════
   Daily Sips MENU — script.js
   Supabase + i18n (EN/AR) + Cart + WhatsApp + InstaPay
══════════════════════════════════════════════ */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://frerjemdrrrnjmeugokc.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_2bmCUEdFLhmDGLBQnSiQIA_zZirn5UB';
  const WA_NUMBER   = '201035219469';
  const SERVICE_FEE = 0.12;
  const WATER_PER_GUEST = 12;

  const _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const T = {
    en: {
      searchPlaceholder: 'Search...',
      tagline: 'Modern Daily Sips & drinks • fast • fresh',
      enterMenu: 'MENU',
      branchesLabel: 'OUR BRANCHES',
      b1: 'Hadayek October',
      b2: 'Sheikh Zayed',
      b3: 'El Hossary',
      cats: { all: 'All' },
      cartTitle: 'Your Order',
      addLabel: 'Add to Cart',
      waLabel: 'Confirm Order',
      added: 'Added to cart ✓',
      empty: 'No items found',
      tableHolder: 'Table #',
      guestHolder: 'Guests',
      noteHolder: 'Special notes...',
      subtotal: 'Subtotal',
      water: 'Water',
      service: 'Service 12%',
      total: 'TOTAL',
      noCart: 'Your cart is empty',
      tableWarn: 'Please enter your table number',
      guestWarn: 'Please enter number of guests',
      cartWarn: 'Please add items first',
      instaPayLabel: 'InstaPay',
      instaPaySubtitle: 'Pay instantly via InstaPay',
      instaPayNumberLabel: 'InstaPay Number',
      instaPayQrLabel: 'Scan QR Code',
      instaPayNote: 'Scan the QR code or copy the number to pay via any bank app',
      copyLabel: 'Copy',
      copiedLabel: 'Copied!',
    },
    ar: {
      searchPlaceholder: 'بحث...',
      tagline: 'قائمة مشروبات يومية • سريع • طازج',
      enterMenu: 'المنيو',
      branchesLabel: 'فروعنا',
      b1: 'حدائق أكتوبر',
      b2: 'الشيخ زايد',
      b3: 'الحصري',
      cats: { all: 'الكل' },
      cartTitle: 'طلبك',
      addLabel: 'أضف للسلة',
      waLabel: 'تأكيد الطلب',
      added: 'تمت الإضافة ✓',
      empty: 'لا توجد نتائج',
      tableHolder: 'رقم الطاولة',
      guestHolder: 'عدد الأفراد',
      noteHolder: 'ملاحظاتك...',
      subtotal: 'المطلوبات',
      water: 'مياه',
      service: 'خدمة 12%',
      total: 'الإجمالي',
      noCart: 'السلة فارغة',
      tableWarn: 'أدخل رقم الطاولة',
      guestWarn: 'أدخل عدد الأفراد',
      cartWarn: 'أضف صنف أولاً',
      instaPayLabel: 'انستا باي',
      instaPaySubtitle: 'ادفع فوراً عن طريق انستا باي',
      instaPayNumberLabel: 'رقم انستا باي',
      instaPayQrLabel: 'امسح الكود',
      instaPayNote: 'امسح الكود أو انسخ الرقم للدفع من أي تطبيق بنكي',
      copyLabel: 'نسخ',
      copiedLabel: 'تم النسخ!',
    }
  };

  let lang = 'en';
  let activeCat = 'all';
  let products = [];
  let allCategories = [];
  let cart = [];
  let activeProduct = null;
  let modalQty = 1;
  let selectedSize = null;
  let instaPayNumber = '';
  let instaPayQRInstance = null;

  const $ = (id) => document.getElementById(id);
  const $$ = (sel) => document.querySelectorAll(sel);

  const landing         = document.querySelector('.landing');
  const menuPage        = document.querySelector('.menu-page');
  const enterMenuBtn    = $('enterMenuBtn');
  const backBtn         = $('backBtn');
  const searchInput     = $('searchInput');
  const catRow          = $('catRow');
  const productGrid     = $('productGrid');
  const modalOverlay    = $('modalOverlay');
  const modalClose      = $('modalClose');
  const modalName       = $('modalName');
  const modalPriceWrap  = $('modalPriceWrap');
  const qtyMinus        = $('qtyMinus');
  const qtyPlus         = $('qtyPlus');
  const qtyVal          = $('qtyVal');
  const addToCartBtn    = $('addToCartBtn');
  const cartTopbarBtn   = $('cartTopbarBtn');
  const cartBadge       = $('cartBadge');
  const cartOverlay     = $('cartOverlay');
  const cartCloseBtn    = $('cartCloseBtn');
  const cartItems       = $('cartItems');
  const tableNum        = $('tableNum');
  const peopleNum       = $('peopleNum');
  const cartNote        = $('cartNote');
  const cartTotalBox    = $('cartTotalBox');
  const waBtn           = $('waBtn');
  const toast           = $('toast');
  const langEn          = $('langEn');
  const langAr          = $('langAr');
  const instaPayBtn     = $('instaPayBtn');
  const instaPayOverlay = $('instaPayOverlay');
  const instaPayClose   = $('instaPayClose');
  const instaPayCopyBtn = $('instaPayCopyBtn');

  // ─── INIT ───
  async function init() {
    applyLang('en');
    startBrandAnimation();
    await Promise.all([loadProducts(), loadInstaPayNumber()]);

    enterMenuBtn.addEventListener('click', openMenu);
    backBtn.addEventListener('click', closeMenu);
    langEn.addEventListener('click', () => applyLang('en'));
    langAr.addEventListener('click', () => applyLang('ar'));
    searchInput.addEventListener('input', () => renderProducts(false));
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    qtyMinus.addEventListener('click', () => { if (modalQty > 1) { modalQty--; qtyVal.textContent = modalQty; } });
    qtyPlus.addEventListener('click', () => { modalQty++; qtyVal.textContent = modalQty; });
    addToCartBtn.addEventListener('click', addToCart);
    cartTopbarBtn.addEventListener('click', openCart);
    cartCloseBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', (e) => { if (e.target === cartOverlay) closeCart(); });
    waBtn.addEventListener('click', sendWhatsApp);
    peopleNum.addEventListener('input', renderCartTotal);
    instaPayBtn.addEventListener('click', openInstaPayModal);
    instaPayClose.addEventListener('click', closeInstaPayModal);
    instaPayOverlay.addEventListener('click', (e) => { if (e.target === instaPayOverlay) closeInstaPayModal(); });
    instaPayCopyBtn.addEventListener('click', copyInstaPayNumber);
  }

  // ─── Brand SVG animation ───
  function startBrandAnimation() {
    const drawText = document.querySelector('.brand-draw-text');
    const fillText = document.querySelector('.brand-fill-text');
    if (drawText) {
      drawText.style.animation = 'none';
      const len = drawText.getTotalLength?.() || 600;
      drawText.style.strokeDasharray = len;
      drawText.style.strokeDashoffset = len;
      requestAnimationFrame(() => {
        drawText.style.animation = 'drawText 1.4s cubic-bezier(.4,0,.2,1) .2s forwards';
      });
    }
    if (fillText) fillText.style.animation = 'fillText .6s ease 1.5s forwards';
  }

  // ─── Load InstaPay ───
  async function loadInstaPayNumber() {
    try {
      const { data, error } = await _sb
        .from('settings')
        .select('value')
        .eq('key', 'instapay_number')
        .single();
      if (error) throw error;
      instaPayNumber = data?.value || '';
    } catch (e) {
      instaPayNumber = localStorage.getItem('instapay_number') || '';
    }
    if ($('instaPayNumber')) $('instaPayNumber').textContent = instaPayNumber || '01XXXXXXXXXX';
  }

  // ─── Load Products ───
  async function loadProducts() {
    try {
      const { data, error } = await _sb
        .from('products')
        .select('*')
        .eq('is_hidden', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      products = (data || []).map(normalizeProduct);
      buildDynamicCategories();
    } catch (e) {
      console.warn('Supabase error – using demo data:', e.message);
      products = demoProducts();
      buildDynamicCategories();
    }
  }

  // تعديل استقبال الحقول الجديدة من قاعدة البيانات وعمل fallback للسعر القديم إذا وجد
  function normalizeProduct(p) {
    return {
      id:             p.id,
      name_en:        p.name_en || p.name || '',
      name_ar:        p.name_ar || p.name || '',
      price:          p.price || null,
      price_medium:   p.price_medium || null,
      price_large:    p.price_large || null,
      discount_price: p.discount_price || null,
      category:       p.category || 'other',
      image_url:      p.image_url || '',
      spin_type:      p.spin_type || 'float',
      badge:          p.badge || null,
      extras:         p.extras || null,
      options:        p.options || null,
      description:    p.description || '',
      visible:        !p.is_hidden,
    };
  }

  function buildDynamicCategories() {
    const seen = new Set();
    allCategories = [];
    products.forEach(p => {
      if (p.category && !seen.has(p.category)) {
        seen.add(p.category);
        allCategories.push(p.category);
      }
    });
  }

  function demoProducts() {
    return [
      { id: 'd1', name_en: 'Mango Matcha',   name_ar: 'مانجو ماتشا',  price: 110, category: 'icen', image_url: '', spin_type: 'spin',   visible: true },
      { id: 'd2', name_en: 'Mango Smoothie', name_ar: 'سموثي مانجو',  price: 55,  category: 'icen', image_url: '', spin_type: 'wobble', visible: true },
      { id: 'd3', name_en: 'Lemon Mint',     name_ar: 'ليمون بنعناع', price: 45,  category: 'ice',  image_url: '', spin_type: 'float',  visible: true },
    ];
  }

  // ─── Language ───
  function applyLang(l) {
    lang = l;
    const t = T[l];
    const isAr = l === 'ar';
    document.documentElement.lang = l;
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
    setText('tagline', t.tagline);
    setText('enterLabel', t.enterMenu);
    setText('branchesLabel', t.branchesLabel);
    setText('b1', t.b1); setText('b2', t.b2); setText('b3', t.b3);
    setText('s-insta', 'INSTAGRAM'); setText('s-face', 'FACEBOOK'); setText('s-tiktok', 'TIKTOK');
    setText('instaPayLabel', t.instaPayLabel);
    setText('instaPaySubtitle', t.instaPaySubtitle);
    setText('instaPayNumberLabel', t.instaPayNumberLabel);
    setText('instaPayQrLabel', t.instaPayQrLabel);
    setText('instaPayNote', t.instaPayNote);
    setText('copyBtnLabel', t.copyLabel);
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;
    setText('cartTitle', t.cartTitle);
    setText('addLabel', t.addLabel);
    setText('waLabel', t.waLabel);
    if (tableNum) tableNum.placeholder = t.tableHolder;
    if (peopleNum) peopleNum.placeholder = t.guestHolder;
    if (cartNote) cartNote.placeholder = t.noteHolder;
    langEn.classList.toggle('active', l === 'en');
    langAr.classList.toggle('active', l === 'ar');
    buildCategories();
    renderProducts(false);
  }

  function setText(id, txt) {
    const el = $(id);
    if (el) el.textContent = txt;
  }

  // ─── Menu open/close ───
  function openMenu() {
    landing.classList.add('exit');
    setTimeout(() => {
      landing.style.display = 'none';
      menuPage.classList.add('active');
      buildCategories();
      renderProducts(true);
    }, 380);
  }

  // ─── Categories ───
  function buildCategories() {
    const t = T[lang];
    if (!catRow) return;
    catRow.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'cat-pill' + (activeCat === 'all' ? ' active' : '');
    allBtn.textContent = t.cats.all;
    allBtn.type = 'button';
    allBtn.addEventListener('click', () => {
      activeCat = 'all';
      $$('.cat-pill').forEach(b => b.classList.toggle('active', b === allBtn));
      renderProducts(false);
    });
    catRow.appendChild(allBtn);

    allCategories.forEach(catId => {
      const btn = document.createElement('button');
      btn.className = 'cat-pill' + (catId === activeCat ? ' active' : '');
      btn.textContent = formatCatLabel(catId, lang);
      btn.type = 'button';
      btn.addEventListener('click', () => {
        activeCat = catId;
        $$('.cat-pill').forEach(b => b.classList.toggle('active', b === btn));
        renderProducts(false);
      });
      catRow.appendChild(btn);
    });
  }

  function formatCatLabel(catId, l) {
    const map = {
      drinks: l === 'ar' ? 'مشروبات'      : 'Drinks',
      drink:  l === 'ar' ? 'مشروبات'      : 'Drinks',
      soup:   l === 'ar' ? 'شوربة'         : 'Soup',
      food:   l === 'ar' ? 'طعام'          : 'Food',
      ice:    l === 'ar' ? 'مشروبات'           : 'drinks',
      icen:   l === 'ar' ? 'آيس كريمي'    : 'Iced',
      hot:    l === 'ar' ? 'مشروبات ساخنة': 'Hot',
      cold:   l === 'ar' ? 'مشروبات باردة': 'Cold',
      coffee: l === 'ar' ? 'قهوة'          : 'Coffee',
      juice:  l === 'ar' ? 'عصائر'         : 'Juice',
    };
    return map[catId.toLowerCase()] || (catId.charAt(0).toUpperCase() + catId.slice(1));
  }

  function closeMenu() {
    menuPage.classList.remove('active');
    landing.style.display = 'flex';
    requestAnimationFrame(() => { landing.classList.remove('exit'); });
  }

  // ─── Render Products ───
  function renderProducts(withEntrance) {
    if (!productGrid) return;
    const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const list = products.filter(p => {
      if (activeCat !== 'all' && p.category !== activeCat) return false;
      if (q) {
        const nameEn = (p.name_en || '').toLowerCase();
        const nameAr = (p.name_ar || '').toLowerCase();
        return nameEn.includes(q) || nameAr.includes(q);
      }
      return true;
    });

    productGrid.innerHTML = '';
    if (!list.length) {
      productGrid.innerHTML = `<div class="empty-state"><div class="empty-icon">🍃</div><p>${T[lang].empty}</p></div>`;
      return;
    }

    const frag = document.createDocumentFragment();
    list.forEach((p, i) => frag.appendChild(buildProductCard(p, i)));
    productGrid.appendChild(frag);

    if (withEntrance) {
      requestAnimationFrame(() => {
        const cards = $$('.product-card');
        cards.forEach((c, i) => setTimeout(() => c.classList.add('show'), i * 55));
      });
    } else {
      $$('.product-card').forEach(c => c.classList.add('show'));
    }
  }
function buildProductCard(p, i) {
    const name = lang === 'ar' ? (p.name_ar || p.name_en) : (p.name_en || p.name_ar);
    const side = i % 2 === 0 ? 'left' : 'right';
    const spinClass = p.spin_type || 'float';
    const priceStr = formatPrice(p);
    const imgSrc = p.image_url || '';

    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.side = side;
    card.dataset.id = p.id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', name);

    const badgeHTML = p.badge ? `<span class="product-badge">${escHtml(p.badge)}</span>` : '';

    let priceHTML = '';
    if (p.discount_price) {
      priceHTML = `<span class="price-text price-discount">${p.discount_price} EGP</span>
                   <span class="price-original">${p.price} EGP</span>`;
    } else {
      priceHTML = `<span class="price-text">${priceStr}</span>`;
    }

    const imgHTML = imgSrc
      ? `<img class="drink-img ${spinClass}" src="${imgSrc}" alt="${escHtml(name)}" loading="lazy"
              onerror="this.style.display='none';this.parentElement.querySelector('.drink-fallback').style.display='flex'">`
      : '';

    // 🌟 تم تعديل الـ innerHTML لإضافة الوصف تحت الـ product-name 🌟
    card.innerHTML = `
      <div class="drink-frame">
        ${imgHTML}
        <div class="drink-fallback" style="display:${imgSrc ? 'none' : 'flex'};font-size:28px;align-items:center;justify-content:center;width:58px;height:58px;">${getCatEmoji(p.category)}</div>
      </div>
      <div class="product-info">
        ${badgeHTML}
        <p class="product-name">${escHtml(name)}</p>
        
        ${p.description ? `
          <div class="product-desc-container" onclick="e => e.stopPropagation(); toggleDescription(this);">
            <p class="product-desc short-desc" style="${lang === 'ar' ? 'text-align: right;' : 'text-align: left;'}">
              ${escHtml(p.description)}
            </p>
          </div>
        ` : ''}
        
        <div class="product-price-row">
          <div class="price-wrap">${priceHTML}</div>
          <button class="price-plus" aria-label="Add" type="button">+</button>
        </div>
      </div>`;

    card.addEventListener('click', () => openModal(p));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(p); });
    card.querySelector('.price-plus').addEventListener('click', e => { e.stopPropagation(); openModal(p); });
    
    return card;
}
  function getCatEmoji(cat) {
    const map = { food:'🥗', soup:'🍲', ice:'🥤', drink:'🥤', drinks:'🧊', icen:'🧋', hot:'☕', coffee:'☕', juice:'🍊', cold:'🥤' };
    return map[(cat||'').toLowerCase()] || '🍽️';
  }

  // تعديل عرض السعر على الكارت الخارجي ليوضح الأحجام الجديدة المتاحة
  function formatPrice(p) {
    if (p.discount_price) return `${p.discount_price} EGP`;
    if (p.price_medium && p.price_large) {
      return lang === 'ar' 
        ? `وسط: ${p.price_medium} • كبير: ${p.price_large}` 
        : `M: ${p.price_medium} • L: ${p.price_large}`;
    }
    if (p.price) return `${p.price} EGP`;
    return '—';
  }

  function escHtml(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ══════════════════════════════════════════════
  // Spectacular Product Showcase
  // ══════════════════════════════════════════════
  function buildProductShowcase(p) {
    const stage = document.querySelector('.modal-stage');
    if (!stage) return;

    const glowMap = {
      ice:    'rgba(100,200,255,.6)',
      icen:   'rgba(100,200,255,.6)',
      hot:    'rgba(255,140,40,.6)',
      coffee: 'rgba(200,120,60,.6)',
      juice:  'rgba(255,180,0,.6)',
      soup:   'rgba(255,120,50,.6)',
    };
    const cat = (p.category || '').toLowerCase();
    const glowColor = glowMap[cat] || 'rgba(255,212,0,.6)';

    const pColors = [
      'rgba(255,212,0,.85)',
      'rgba(184,221,176,.75)',
      'rgba(255,255,255,.6)',
      'rgba(255,200,50,.7)',
      'rgba(100,220,150,.6)',
    ];

    let particlesHTML = '';
    for (let i = 0; i < 14; i++) {
      const size  = (3 + Math.random() * 7).toFixed(1);
      const color = pColors[Math.floor(Math.random() * pColors.length)];
      const dur   = (3 + Math.random() * 5).toFixed(1);
      const delay = -(Math.random() * 6).toFixed(1);
      const left  = (8 + Math.random() * 84).toFixed(0);
      particlesHTML += `<div class="particle" style="left:${left}%;width:${size}px;height:${size}px;background:${color};animation-duration:${dur}s;animation-delay:${delay}s;"></div>`;
    }

    let sparklesHTML = '';
    for (let i = 0; i < 7; i++) {
      const size = (6 + Math.random() * 9).toFixed(1);
      const dur  = (1.2 + Math.random() * 2.2).toFixed(1);
      const del  = (Math.random() * 3).toFixed(1);
      const l    = (5 + Math.random() * 88).toFixed(0);
      const t    = (5 + Math.random() * 88).toFixed(0);
      sparklesHTML += `<div class="sparkle" style="left:${l}%;top:${t}%;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:${del}s;"></div>`;
    }

    const name = lang === 'ar' ? (p.name_ar || p.name_en) : (p.name_en || p.name_ar);
    const mediaHTML = p.image_url
      ? `<img class="modal-drink-img" id="modalDrinkImg" src="${escHtml(p.image_url)}" alt="${escHtml(name)}">`
      : `<div style="font-size:90px;z-index:4;position:relative;animation:productHero 3.5s ease-in-out infinite;">${getCatEmoji(p.category)}</div>`;

    stage.innerHTML = `
      <div class="modal-orb modal-orb-1"></div>
      <div class="modal-orb modal-orb-2"></div>
      <div class="modal-orb modal-orb-3"></div>
      <div class="modal-particles">${particlesHTML}${sparklesHTML}</div>
      <div class="product-showcase">
        <div class="product-glow" style="background:radial-gradient(circle,${glowColor} 0%,transparent 70%);"></div>
        ${mediaHTML}
      </div>`;
  }

  // ─── Modal ───
  // تعديل نافذة اختيار الحجم عند الضغط على المنتج لتدعم الخيارات الجديدة (Medium و Large) باللغتين
  function openModal(p) {
    activeProduct = p;
    modalQty = 1;
    qtyVal.textContent = '1';
    selectedSize = null;

    buildProductShowcase(p);

    const name = lang === 'ar' ? (p.name_ar || p.name_en) : (p.name_en || p.name_ar);
    modalName.textContent = name;

    modalPriceWrap.innerHTML = '';
    if (p.price_medium && p.price_large) {
      selectedSize = 'medium'; // الحجم الافتراضي المختار عند الفتح هو وسط
      
      const labelMedium = lang === 'ar' ? 'وسط M' : 'Medium M';
      const labelLarge  = lang === 'ar' ? 'كبير L' : 'Large L';

      modalPriceWrap.innerHTML = `
        <div class="price-sizes">
          <div class="size-chip selected" data-size="medium">${labelMedium} — ${p.price_medium} EGP</div>
          <div class="size-chip"          data-size="large">${labelLarge} — ${p.price_large} EGP</div>
        </div>`;
      modalPriceWrap.querySelectorAll('.size-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          selectedSize = chip.dataset.size;
          modalPriceWrap.querySelectorAll('.size-chip').forEach(c => c.classList.toggle('selected', c === chip));
        });
      });
    } else if (p.discount_price) {
      modalPriceWrap.innerHTML = `
        <div style="text-align:center;">
          <strong style="color:var(--pist-dark);font-size:18px;">${p.discount_price} EGP</strong>
          <span style="text-decoration:line-through;color:var(--muted);font-size:13px;margin-left:8px;">${p.price} EGP</span>
        </div>`;
    } else {
      modalPriceWrap.innerHTML = `<strong>${p.price} EGP</strong>`;
    }

    $('addLabel').textContent = T[lang].addLabel;
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    activeProduct = null;
  }

  // ─── Cart ───
  // تعديل دالة الإضافة إلى السلة لحساب السعر بناءً على الخيارات الجديدة وكتابة تفاصيل الحجم في الفاتورة باللغتين
  function addToCart() {
    if (!activeProduct) return;
    let price = activeProduct.discount_price || activeProduct.price || 0;
    if (selectedSize === 'medium') price = activeProduct.price_medium || price;
    if (selectedSize === 'large') price = activeProduct.price_large || price;
    
    const name = lang === 'ar'
      ? (activeProduct.name_ar || activeProduct.name_en)
      : (activeProduct.name_en || activeProduct.name_ar);
      
    // تعريب وتحديث اسم الحجم المضاف للسلة والواتساب
    let sizeLabel = '';
    if (selectedSize === 'medium') {
      sizeLabel = lang === 'ar' ? ' (وسط)' : ' (M)';
    } else if (selectedSize === 'large') {
      sizeLabel = lang === 'ar' ? ' (كبير)' : ' (L)';
    }

    cart.push({ id: Date.now(), name: name + sizeLabel, price: parseFloat(price) * modalQty, qty: modalQty });
    updateCartBadge();
    showToast(T[lang].added);
    closeModal();
  }

  function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    updateCartBadge();
    renderCartItems();
    renderCartTotal();
  }

  function updateCartBadge() {
    const total = cart.reduce((s, c) => s + c.qty, 0);
    if (total > 0) { cartBadge.textContent = total; cartBadge.style.display = 'flex'; }
    else { cartBadge.style.display = 'none'; }
  }

  function openCart() {
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartItems();
    renderCartTotal();
  }

  function closeCart() {
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderCartItems() {
    const t = T[lang];
    if (!cart.length) { cartItems.innerHTML = `<div class="cart-empty-msg">${t.noCart}</div>`; return; }
    cartItems.innerHTML = '';
    cart.forEach(item => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <span class="cart-item-name">${escHtml(item.name)} × ${item.qty}</span>
        <span class="cart-item-price">${item.price.toFixed(2)} EGP</span>
        <button class="cart-rm-btn" data-id="${item.id}" aria-label="Remove">✕</button>`;
      div.querySelector('.cart-rm-btn').addEventListener('click', () => removeFromCart(item.id));
      cartItems.appendChild(div);
    });
  }

  function renderCartTotal() {
    const t = T[lang];
    const guests = parseInt(peopleNum.value) || 0;
    if (!cart.length || !guests) { cartTotalBox.style.display = 'none'; return; }
    const sub   = cart.reduce((s, c) => s + c.price, 0);
    const water = guests * WATER_PER_GUEST;
    const svc   = (sub + water) * SERVICE_FEE;
    const total = sub + water + svc;
    cartTotalBox.style.display = 'block';
    cartTotalBox.innerHTML = `
      <div class="total-row"><span>${t.subtotal}</span><span>${sub.toFixed(2)} EGP</span></div>
      <div class="total-row"><span>${t.water} (${guests}×${WATER_PER_GUEST})</span><span>${water} EGP</span></div>
      <div class="total-row"><span>${t.service}</span><span>${svc.toFixed(2)} EGP</span></div>
      <div class="total-final"><span>${t.total}</span><span>${total.toFixed(2)} EGP*</span></div>`;
  }

  // ─── WhatsApp ───
  function sendWhatsApp() {
    const t = T[lang];
    const table  = tableNum.value.trim();
    const guests = parseInt(peopleNum.value) || 0;
    const note   = cartNote.value.trim();
    if (!cart.length)  return showToast(t.cartWarn);
    if (!table)        return showToast(t.tableWarn);
    if (!guests)       return showToast(t.guestWarn);
    const sub   = cart.reduce((s, c) => s + c.price, 0);
    const water = guests * WATER_PER_GUEST;
    const svc   = (sub + water) * SERVICE_FEE;
    const total = sub + water + svc;
    let msg = `*🍹 Daily Sips — New Order*\n`;
    msg += `Table: ${table}  |  Guests: ${guests}\n`;
    msg += `─────────────────\n`;
    cart.forEach((item, i) => { msg += `${i + 1}. ${item.name} — ${item.price.toFixed(2)} EGP\n`; });
    msg += `─────────────────\n`;
    msg += `Water (${guests}×${WATER_PER_GUEST}): ${water} EGP\n`;
    msg += `Service 12%: ${svc.toFixed(2)} EGP\n`;
    msg += `*TOTAL: ${total.toFixed(2)} EGP*\n`;
    if (note) msg += `📝 Note: ${note}`;
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`);
  }

  // ─── InstaPay Modal ───
  function openInstaPayModal() {
    const num = instaPayNumber || '01XXXXXXXXXX';
    $('instaPayNumber').textContent = num;
    const qrContainer = $('instaPayQR');
    if (!qrContainer) return;
    qrContainer.innerHTML = '';
    if (instaPayNumber) {
      instaPayQRInstance = new QRCode(qrContainer, {
        text: instaPayNumber,
        width: 200,
        height: 200,
        colorDark: '#1b3a18',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      qrContainer.innerHTML = '<div style="width:200px;height:200px;display:flex;align-items:center;justify-content:center;background:#f0f8ee;border-radius:12px;color:#52796f;font-weight:700;font-size:13px;text-align:center;padding:20px;">No number set yet</div>';
    }
    instaPayOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeInstaPayModal() {
    instaPayOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function copyInstaPayNumber() {
    const num = instaPayNumber;
    if (!num) return;
    navigator.clipboard.writeText(num).then(() => {
      const label = $('copyBtnLabel');
      const prev = label.textContent;
      label.textContent = T[lang].copiedLabel;
      setTimeout(() => { label.textContent = prev; }, 1800);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = num; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      const label = $('copyBtnLabel');
      const prev = label.textContent;
      label.textContent = T[lang].copiedLabel;
      setTimeout(() => { label.textContent = prev; }, 1800);
    });
  }

  // ─── Toast ───
  let toastTimer;
  function showToast(msg) {
    $('toastMsg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // ─── Start ───
  init();
})();