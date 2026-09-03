/* ============================================================
   BEBE DE PINO — main.js
   Nav + Hero + Collection + NEW/BEST 인터랙션
   ============================================================ */

(function () {
  'use strict';


  /* ── 1. 스크롤 시 Nav 배경 #fff 전환 ────────────────────── */

  const siteNav = document.getElementById('siteNav');

  window.addEventListener('scroll', () => {
    const y = window.scrollY || window.pageYOffset;
    if (y > 10) {
      siteNav.classList.add('scrolled');
    } else {
      siteNav.classList.remove('scrolled');
    }
  }, { passive: true });


  /* ── 2. 모바일 햄버거 메뉴 → 드로어 ─────────────────────── */

  const hamburger   = document.getElementById('navHamburger');
  const drawer       = document.getElementById('navDrawer');
  const drawerOverlay = document.getElementById('navDrawerOverlay');
  const drawerClose   = document.getElementById('navDrawerClose');

  function openDrawer() {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    // 드로어 내 메뉴 링크 클릭 시 자동으로 닫기
    drawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        closeDrawer();
      }
    });
  }


  /* ── 3. 검색 아이콘 → 검색 드롭다운 토글 ───────────────── */

  const searchBtn   = document.getElementById('navSearchBtn');
  const searchPanel = document.getElementById('navSearchPanel');
  const searchInput = document.getElementById('navSearchInput');
  const searchClose = document.getElementById('navSearchClose');

  function closeSearch() {
    searchPanel.classList.remove('open');
    searchBtn.setAttribute('aria-expanded', 'false');
  }

  if (searchBtn && searchPanel) {
    searchBtn.addEventListener('click', () => {
      const isOpen = searchPanel.classList.toggle('open');
      searchBtn.setAttribute('aria-expanded', String(isOpen));

      if (isOpen) {
        setTimeout(() => searchInput.focus(), 150);
      }
    });

    searchClose.addEventListener('click', closeSearch);

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeSearch();
      // TODO: 실제 검색 결과 페이지 연결 전까지는 입력만 지원
    });
  }


  /* ── 4. 위시리스트 아이콘 → 활성화 + 카운트 배지 ──────────── */

  const wishBtn   = document.getElementById('navWishBtn');
  const wishBadge = document.getElementById('wishBadge');

  if (wishBtn && wishBadge) {
    let wishCount = 0;

    wishBtn.addEventListener('click', () => {
      const active = wishBtn.classList.toggle('active');
      wishCount = active ? wishCount + 1 : Math.max(0, wishCount - 1);

      wishBadge.textContent = wishCount;
      wishBadge.style.display = wishCount > 0 ? 'flex' : 'none';
    });
  }


})();


/* ============================================================
   COLLECTION 슬라이더
   - 데스크탑 한 화면 3장 노출
   - 한 장씩 이동
   - 6번째 다음 1번째가 바로 이어지는 무한 루프
   ============================================================ */

(function () {
  'use strict';

  const track   = document.getElementById('collectionTrack');
  const prevBtn = document.getElementById('colPrev');
  const nextBtn = document.getElementById('colNext');
  const section = document.getElementById('collectionSection');

  if (!track) return;

  const wrap     = track.parentElement;
  const INTERVAL = 2500;

  let autoTimer  = null;
  let VISIBLE    = 3;
  let slideWidth = 0;
  let isMoving   = false;

  /* ── 반응형: 화면 너비에 따라 보이는 슬라이드 수 계산 ── */
  function getVisible() {
    const w = window.innerWidth;

    if (w <= 768)  return 1.3;
    if (w <= 1024) return 2;

    return 3;
  }

  /* ── transition on/off ── */
  function setTransition(enabled) {
    track.style.transition = enabled
      ? 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
      : 'none';
  }

  /* ── 슬라이드 너비 계산 ── */
  function setSlideWidths() {
    VISIBLE = getVisible();

    const wrapWidth = wrap.clientWidth;
    slideWidth = wrapWidth / VISIBLE;

    const slides = track.querySelectorAll('.col-slide');

    slides.forEach((slide) => {
      slide.style.width = slideWidth + 'px';
      slide.style.flex = '0 0 ' + slideWidth + 'px';
    });

    setTransition(false);
    track.style.transform = 'translateX(0px)';
  }

  /* ── 다음 슬라이드 ──
     예:
     1,2,3,4 → 2,3,4,5
     4,5,6,7 → 5,6,7,1
  */
  function goNext() {
    if (isMoving) return;
    isMoving = true;

    setTransition(true);
    track.style.transform = 'translateX(-' + slideWidth + 'px)';

    track.addEventListener('transitionend', function handler() {
      track.removeEventListener('transitionend', handler);

      /*
        맨 앞 슬라이드를 맨 뒤로 이동
        DOM 순서 자체가
        1,2,3,4,5,6,7 → 2,3,4,5,6,7,1
        이런 식으로 계속 바뀜
      */
      track.appendChild(track.firstElementChild);

      setTransition(false);
      track.style.transform = 'translateX(0px)';

      isMoving = false;
    });
  }

  /* ── 이전 슬라이드 ──
     예:
     2,3,4,5 → 1,2,3,4
  */
  function goPrev() {
    if (isMoving) return;
    isMoving = true;

    /*
      맨 뒤 슬라이드를 맨 앞으로 먼저 이동
      그 상태에서 -1칸 위치에 세팅 후 0으로 이동
    */
    setTransition(false);
    track.insertBefore(track.lastElementChild, track.firstElementChild);
    track.style.transform = 'translateX(-' + slideWidth + 'px)';

    /*
      브라우저가 위 위치를 먼저 인식하게 한 뒤 애니메이션 실행
    */
    track.offsetHeight;

    setTransition(true);
    track.style.transform = 'translateX(0px)';

    track.addEventListener('transitionend', function handler() {
      track.removeEventListener('transitionend', handler);
      setTransition(false);
      isMoving = false;
    });
  }

  /* ── 자동 슬라이드 ── */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(goNext, INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  /* ── 화살표 버튼 ── */
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goNext();
      startAuto();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goPrev();
      startAuto();
    });
  }

  /* ── 터치 스와이프 ── */
  let touchStartX = 0;

  if (section) {
    section.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    section.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          goNext();
        } else {
          goPrev();
        }

        startAuto();
      }
    }, { passive: true });

    section.addEventListener('mouseenter', stopAuto);
    section.addEventListener('mouseleave', startAuto);
  }

  /* ── resize 대응 ──
     리사이즈가 시작되면 자동 슬라이드를 즉시 멈추고,
     디바운스 종료 후 폭을 다시 계산한 다음에만 자동 재생을 재개함.
     (트랜지션 도중 리사이즈가 겹치면 위치가 어긋날 수 있는 문제 방지) */
  let resizeTimer = null;

  window.addEventListener('resize', () => {
    stopAuto();
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      setSlideWidths();
      startAuto();
    }, 150);
  }, { passive: true });

  /* ── 초기화 ── */
  setSlideWidths();
  startAuto();

})();


/* ============================================================
   NEW / BEST 섹션
   ============================================================ */

(function () {
  'use strict';

  const grid = document.getElementById('nbGrid');
  const tabs = document.querySelectorAll('.nb-tab');
  const cartBadge = document.getElementById('cartBadge');

  if (!grid) return;

  /* ── 상품 데이터 ──
     참고: NEW 목록은 new1~6, 8, 10 순으로 되어 있어 new7·new9가 빠진 것처럼 보이지만,
     실제 소스 이미지 자체가 new7 / new9 번호로는 존재하지 않는 것을 확인함(데이터 누락 아님, 결번 의도).
     추후 신규 이미지가 들어오면 같은 번호로 채워 넣으면 됨. */
  const PRODUCTS = {
    new: [
      { img: 'images/new/new1.jpg', imgHover: 'images/new/new1_back.JPG', name: '베이비 체리 올 오버 코튼 와플 라운지웨어 세트', original: '₩42,000', sale: '₩33,600' },
      { img: 'images/new/new2.jpg', imgHover: 'images/new/new2_back.JPG', name: '베이비 컬러풀 체리 원마일웨어 세트',       original: '₩39,000', sale: '₩31,200' },
      { img: 'images/new/new3.jpg', imgHover: 'images/new/new3_back.JPG', name: '애플 컬러 블록 라운지웨어 세트',         original: '₩38,000', sale: '₩30,400' },
      { img: 'images/new/new4.jpg', imgHover: 'images/new/new4_back.JPG', name: '스트로베리 러플 라운지웨어 세트',              original: '₩45,000', sale: '₩36,000' },
      { img: 'images/new/new5.jpg', imgHover: 'images/new/new5_back.JPG', name: '리본 체리 민소매 티셔츠',            original: '₩29,000', sale: '₩23,200' },
      { img: 'images/new/new6.jpg', imgHover: 'images/new/new6_back.JPG', name: '스트로베리 스트라이프 프릴 소매 티셔츠',              original: '₩32,000', sale: '₩25,600' },
      { img: 'images/new/new8.jpg', imgHover: 'images/new/new8_back.JPG', name: '체리 올 오버 크로쉐 반다나',          original: '₩36,000', sale: '₩28,800' },
      { img: 'images/new/new10.jpg', imgHover: 'images/new/new10_back.JPG', name: '블루밍 레빗 스트라이프 라운지웨어 세트',             original: '₩44,000', sale: '₩35,200' }
    ],
    best: [
      { img: 'images/best/best1.jpg', imgHover: 'images/best/best1_back.JPG', name: '애플 올 오버 수영복 세트', original: '₩36,000', sale: '₩28,800' },
      { img: 'images/best/best2.jpg', imgHover: 'images/best/best2_back.JPG', name: '베이비 기글리 엘리펀트 라운지웨어 세트', original: '₩36,000', sale: '₩28,800' },
      { img: 'images/best/best3.jpg', imgHover: 'images/best/best3_back.JPG', name: '신생아 후르츠 올 오버 오버롤 세트',       original: '₩69,000', sale: '₩49,000' },
      { img: 'images/best/best4.jpg', imgHover: 'images/best/best4_back.JPG', name: '로즈 올 오버 러플 수영복 세트', original: '₩59,000', sale: null },
      { img: 'images/best/best5.jpg', imgHover: 'images/best/best5_back.JPG', name: '빈즈 브로즈 라글란 요꼬 카라 티셔츠',           original: '₩48,000', sale: '₩38,400' },
      { img: 'images/best/best6.jpg', imgHover: 'images/best/best6_back.JPG', name: '빈즈 브로즈 컬러 블록 저지 팬츠',             original: '₩26,000', sale: '₩20,800' },
      { img: 'images/best/best7.jpg', imgHover: 'images/best/best7_back.JPG', name: '빈즈 브로즈 요꼬 포인트 티셔츠',             original: '₩49,000', sale: '₩39,200' },
      { img: 'images/best/best8.jpg', imgHover: 'images/best/best8_back.JPG', name: '빈즈 브로즈 라인 포인트 반바지',               original: '₩34,000', sale: '₩27,200' }
    ]
  };

  let currentTab = 'new';

  /* ── 하트 / 카트 아이콘 SVG ── */
  const HEART_SVG =
    '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>' +
    '</svg>';

  const CART_SVG =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>' +
    '</svg>';

  /* ── 카드 HTML 생성 ── */
  function buildCard(item) {
    const card = document.createElement('div');
    card.className = 'nb-card';

    /* 할인가(sale)가 없거나 정가와 같으면 "할인 없음"으로 간주.
       이 경우 세일 전용 빨간 스타일(nb-price-sale)이 아니라
       일반 가격 스타일(nb-price-regular)로 표시해, 할인이 없는데도
       세일가처럼 보이는 문제를 방지함. */
    const hasDiscount = !!item.sale && item.sale !== item.original;

    card.innerHTML =
      '<a href="#" class="nb-img-wrap">' +
        '<img class="nb-img nb-img-default" src="' + item.img + '" alt="' + item.name + '" loading="lazy" ' +
          'onerror="this.style.background=\'#EFECE8\'; this.removeAttribute(\'src\');">' +
        '<img class="nb-img nb-img-hover" src="' + item.imgHover + '" alt="" loading="lazy" ' +
          'onerror="this.style.opacity=0; this.removeAttribute(\'src\');">' +
      '</a>' +
      '<div class="nb-actions">' +
        '<button class="nb-icon-btn nb-like-btn" aria-label="좋아요">' + HEART_SVG + '</button>' +
        '<button class="nb-icon-btn nb-cart-btn" aria-label="장바구니 담기">' + CART_SVG + '</button>' +
      '</div>' +
      '<p class="nb-name">' + item.name + '</p>' +
      '<p class="nb-price">' +
        (hasDiscount
          ? '<span class="nb-price-original">' + item.original + '</span><span class="nb-price-sale">' + item.sale + '</span>'
          : '<span class="nb-price-regular">' + item.original + '</span>') +
      '</p>';

    return card;
  }

  /* ── 그리드 렌더링 (탭 전환 시 페이드) ── */
  function renderGrid(tabKey, animate) {
    const items = PRODUCTS[tabKey] || [];

    function paint() {
      grid.innerHTML = '';
      items.forEach((item) => {
        grid.appendChild(buildCard(item));
      });
      grid.classList.remove('nb-grid-fading');
    }

    if (!animate) {
      paint();
      return;
    }

    grid.classList.add('nb-grid-fading');
    setTimeout(paint, 200);
  }

  /* ── 탭 클릭 ── */
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      if (target === currentTab) return;

      currentTab = target;

      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      renderGrid(currentTab, true);
    });
  });

  /* ── 좋아요 / 장바구니 클릭 (이벤트 위임) ── */
  grid.addEventListener('click', (e) => {
    const likeBtn = e.target.closest('.nb-like-btn');
    const cartBtn = e.target.closest('.nb-cart-btn');

    if (likeBtn) {
      likeBtn.classList.toggle('active');
      return;
    }

    if (cartBtn) {
      cartBtn.classList.add('nb-cart-added');
      setTimeout(() => {
        cartBtn.classList.remove('nb-cart-added');
      }, 300);

      // 상단 nav 장바구니 뱃지 수량 증가
      if (cartBadge) {
        const count = parseInt(cartBadge.textContent, 10) || 0;
        cartBadge.textContent = count + 1;
      }
    }
  });

  /* ── 초기 렌더 ── */
  renderGrid(currentTab, false);

})();


/* ============================================================
   SNS (INSTAGRAM) 섹션
   ============================================================ */

(function () {
  'use strict';

  const track   = document.getElementById('snsTrack');
  const prevBtn = document.getElementById('snsPrev');
  const nextBtn = document.getElementById('snsNext');

  if (!track) return;

  /* ── SNS 게시물 데이터 ──
     주의: 폴더 경로를 images/sns_N.jpg 형태로 통일함.
     이전에는 4~5번째 항목만 images/sns/sns_4.jpg 처럼 하위 폴더 경로였는데,
     실제로 해당 파일이 존재하지 않아 깨진 이미지로 노출되는 문제가 있었음.
     → 현재 보유 중인 실제 이미지(sns_1~3.jpg) 3개만 사용하도록 정리.
     추후 이미지가 추가되면 동일한 images/sns_N.jpg 규칙으로 이어서 추가하면 됨. */
  const SNS_POSTS = [
    {
      img: 'images/sns_1.jpg',
      badge: 'NOTICE',
      title: ' 띵-동🔔 베피 비밀리데이 OPEN!',
      desc: '#베피비밀리데이, #비밀리데이, #BMILYDAY',
      link: 'https://www.instagram.com/p/Da1kkOOj4bt/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
    },
    {
      img: 'images/sns_2.jpg',
      badge: 'SUMMER',
      title: '심.쿵.주.의.보💖 베피의 여름 인기 컬렉션',
      desc: '#26SUMMER, #라운지웨어, #여름휴가룩',
      link: 'https://www.instagram.com/p/Day8Vh_jXfh/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=='
    },
    {
      img: 'images/sns_3.jpg',
      badge: 'BLUEDOG',
      title: '선물로도 좋은 홈웨어&언더웨어',
      desc: '부드러운 소재의 편안함을 만나세요',
      link: '#'
    }
  ];

  const INSTAGRAM_ICON_SVG =
    '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="5"/>' +
    '<circle cx="12" cy="12" r="4"/>' +
    '<circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none"/>' +
    '</svg>';

  /* ── 카드 생성 ── */
  function buildCard(post) {
    const card = document.createElement('a');
    card.className = 'sns-card';
    card.href = post.link;
    card.target = '_blank';
    card.rel = 'noopener';

    card.innerHTML =
      '<img class="sns-img" src="' + post.img + '" alt="' + post.title + '" loading="lazy" ' +
        'onerror="this.style.background=\'#EFECE8\'; this.removeAttribute(\'src\');">' +
      '<div class="sns-gradient"></div>' +
      '<div class="sns-text">' +
        '<span class="sns-badge">' + post.badge + '</span>' +
        '<p class="sns-title">' + post.title + '</p>' +
        '<p class="sns-desc">' + post.desc + '</p>' +
      '</div>' +
      '<div class="sns-hover-overlay">' +
        '<span class="sns-hover-icon">' + INSTAGRAM_ICON_SVG + '</span>' +
      '</div>';

    return card;
  }

  /* ── 렌더링 ── */
  SNS_POSTS.forEach((post) => {
    track.appendChild(buildCard(post));
  });

  /* ── 화살표 스크롤 ── */
  function scrollByCard(direction) {
    const card = track.querySelector('.sns-card');
    if (!card) return;

    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    const distance = card.getBoundingClientRect().width + gap;

    track.scrollBy({ left: direction * distance, behavior: 'smooth' });
  }

  /* ── 화살표 활성/비활성 상태 업데이트 ── */
  function updateArrowState() {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;

    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => scrollByCard(-1));
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => scrollByCard(1));
  }

  track.addEventListener('scroll', updateArrowState, { passive: true });
  window.addEventListener('resize', updateArrowState, { passive: true });

  updateArrowState();

})();



/* ============================================================
   FOOTER — TOP 버튼
   ============================================================ */

(function () {
  'use strict';

  const topBtn = document.getElementById('footerTopBtn');

  if (!topBtn) return;

  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

})();