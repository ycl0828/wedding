(() => {
  "use strict";
  const C = window.WEDDING;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : ""), C);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  /* ---------- 날짜 ---------- */
  const m = C.date.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  const Y = +m[1], Mo = +m[2], D = +m[3], h = +m[4], mi = +m[5];
  const target = new Date(C.date).getTime();
  const DOW = ["일", "월", "화", "수", "목", "금", "토"];
  const dow = new Date(Date.UTC(Y, Mo - 1, D)).getUTCDay();
  const ampm = h === 12 ? "낮" : h < 12 ? "오전" : "오후";
  const h12 = h > 12 ? h - 12 : h;
  const timeStr = `${ampm} ${h12}시${mi ? ` ${mi}분` : ""}`;
  const fullDate = `${Y}년 ${Mo}월 ${D}일 ${DOW[dow]}요일 ${timeStr}`;

  /* ---------- 텍스트 채우기 ---------- */
  $$("[data-k]").forEach((el) => {
    const v = get(el.dataset.k);
    if (!v) el.hidden = true; else el.textContent = v;
  });
  $$("[data-date=full]").forEach((el) => (el.textContent = fullDate));
  const venueLine = C.venue.name + (C.venue.hall ? ` ${C.venue.hall}` : "");
  $$(".venue-line").forEach((el) => (el.textContent = venueLine));
  $(".greeting").innerHTML = C.greeting.map((l) => `<p>${l || "&nbsp;"}</p>`).join("");
  if (C.showFlowerNotice) $("#flower").hidden = false;

  /* ---------- 인트로 ---------- */
  const intro = $("#intro");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let introDone = false;
  const endIntro = () => {
    if (introDone) return;
    introDone = true;
    intro.classList.add("hide");
    document.body.classList.add("ready");
    document.body.classList.remove("lock");
    setTimeout(maybeRsvpPopup, 1300);
  };
  document.body.classList.add("lock");
  intro.addEventListener("click", endIntro);
  setTimeout(endIntro, reduce ? 300 : 3900);

  /* ---------- 헤더 / 플로팅 / 페이드 ---------- */
  const topbar = $("#topbar"), floating = $(".floating");
  const onScroll = () => {
    const y = scrollY;
    topbar.classList.toggle("show", y > innerHeight * 0.5);
    floating.classList.toggle("show", y > innerHeight * 0.5);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  $("#toTop").onclick = () => scrollTo({ top: 0, behavior: "smooth" });

  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".fade").forEach((el) => io.observe(el));

  /* ---------- 드로어 ---------- */
  const toggleDrawer = (open) => document.body.classList.toggle("drawer-open", open);
  $("#menuBtn").onclick = () => toggleDrawer(true);
  $("#drawerDim").onclick = () => toggleDrawer(false);
  $$("#drawer a").forEach((a) => (a.onclick = () => toggleDrawer(false)));

  /* ---------- 달력 ---------- */
  (() => {
    const first = new Date(Date.UTC(Y, Mo - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(Y, Mo, 0)).getUTCDate();
    let html = `<div class="cal-month">${Mo}<small>${Y}년 ${Mo}월</small></div><div class="cal-grid">`;
    html += DOW.map((d, i) => `<span class="dow ${i === 0 ? "sun" : i === 6 ? "sat" : ""}">${d}</span>`).join("");
    for (let i = 0; i < first; i++) html += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const w = (first + d - 1) % 7;
      const cls = [w === 0 ? "sun" : w === 6 ? "sat" : "", d === D ? "day-on" : ""].join(" ");
      html += `<span class="${cls}">${d}</span>`;
    }
    $("#calendar").innerHTML = html + "</div>";
  })();

  /* ---------- 카운트다운 ---------- */
  const cd = { d: $("#cdD"), h: $("#cdH"), m: $("#cdM"), s: $("#cdS") };
  const names = `${C.groom.short}, ${C.bride.short}`;
  const tick = () => {
    let diff = Math.max(0, target - Date.now());
    const s = Math.floor(diff / 1000);
    cd.d.textContent = Math.floor(s / 86400);
    cd.h.textContent = Math.floor((s % 86400) / 3600);
    cd.m.textContent = Math.floor((s % 3600) / 60);
    cd.s.textContent = s % 60;
    const dd = Math.ceil((target - Date.now()) / 86400000);
    $("#cdMsg").innerHTML = target > Date.now()
      ? `${names}의 결혼식이 <b>${dd}일</b> 남았습니다.`
      : `${names}, 결혼했습니다. 축복해주셔서 감사합니다.`;
  };
  tick(); setInterval(tick, 1000);

  /* ---------- 갤러리 버블 ---------- */
  const photos = C.photos;
  const track = $("#bubbleTrack"), scroller = $("#bubbles");
  const rand = (() => { let s = 7; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); })();
  const H = 520, COL = 168, PER = 3;
  const cols = Math.ceil(photos.length / PER);
  let idx = 0;
  for (let c = 0; c < cols; c++) {
    const n = Math.min(PER, photos.length - idx);
    const sizes = Array.from({ length: n }, () => Math.round(118 + rand() * 46));
    let free = H - sizes.reduce((a, b) => a + b, 0) - 20;
    let y = 10 + (c % 2 ? free * 0.45 : free * 0.1);
    free -= y - 10;
    sizes.forEach((sz, k) => {
      const slack = (COL - sz) / 2;
      const x = 16 + c * COL + slack + (rand() * 2 - 1) * slack;
      const i = idx++;
      const b = document.createElement("button");
      b.className = "bubble";
      b.style.cssText = `width:${sz}px;height:${sz}px;left:${x}px;top:${y}px;animation-delay:${-rand() * 7}s`;
      b.setAttribute("aria-label", `사진 ${i + 1} 크게 보기`);
      b.innerHTML = `<img src="images/thumb/${photos[i]}.jpg" alt="" loading="lazy" draggable="false">`;
      b.onclick = () => { if (!dragMoved) openLB(i); };
      track.appendChild(b);
      y += sz + Math.max(8, (free / (n)) * (0.5 + rand() * 0.8));
    });
  }
  track.style.width = `${32 + cols * COL}px`;

  // 자동 흐름 + 드래그 스크롤(데스크톱)
  let paused = false, resumeT, dir = 1, visible = false, dragMoved = false;
  const pause = () => { paused = true; clearTimeout(resumeT); resumeT = setTimeout(() => (paused = false), 3500); $("#swipeHint").classList.add("gone"); };
  ["touchstart", "wheel", "pointerdown"].forEach((ev) => scroller.addEventListener(ev, pause, { passive: true }));
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(scroller);
  let acc = 0;
  const drift = () => {
    if (visible && !paused && !reduce && !lbOpen) {
      const max = scroller.scrollWidth - scroller.clientWidth;
      acc += 0.35 * dir;
      if (Math.abs(acc) >= 1) { scroller.scrollLeft += Math.trunc(acc); acc -= Math.trunc(acc); }
      if (scroller.scrollLeft >= max - 1) dir = -1; else if (scroller.scrollLeft <= 0) dir = 1;
    }
    requestAnimationFrame(drift);
  };
  requestAnimationFrame(drift);
  let dragX = null, startLeft = 0;
  scroller.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; dragX = e.clientX; startLeft = scroller.scrollLeft; dragMoved = false; });
  addEventListener("pointermove", (e) => { if (dragX === null) return; const dx = e.clientX - dragX; if (Math.abs(dx) > 5) dragMoved = true; scroller.scrollLeft = startLeft - dx; });
  addEventListener("pointerup", () => { dragX = null; setTimeout(() => (dragMoved = false), 0); });

  /* ---------- 라이트박스 ---------- */
  const lb = $("#lightbox"), lbTrack = $("#lbTrack");
  lbTrack.innerHTML = photos.map((p) => `<div class="lb-slide"><img data-src="images/full/${p}.jpg" alt=""></div>`).join("");
  let cur = 0, lbOpen = false;
  const loadAround = (i) => [i - 1, i, i + 1].forEach((j) => {
    const img = lbTrack.children[(j + photos.length) % photos.length].firstChild;
    if (!img.src) img.src = img.dataset.src;
  });
  const go = (i, anim = true) => {
    cur = (i + photos.length) % photos.length;
    lbTrack.style.transition = anim ? "" : "none";
    lbTrack.style.transform = `translateX(${-cur * 100}%)`;
    $("#lbCount").textContent = `${cur + 1} / ${photos.length}`;
    loadAround(cur);
  };
  function openLB(i) { lbOpen = true; go(i, false); lb.classList.add("open"); document.body.classList.add("lock"); }
  const closeLB = () => { lbOpen = false; lb.classList.remove("open"); if (!$(".modal.open")) document.body.classList.remove("lock"); };
  $("#lbClose").onclick = closeLB;
  $("#lbPrev").onclick = () => go(cur - 1);
  $("#lbNext").onclick = () => go(cur + 1);
  addEventListener("keydown", (e) => {
    if (lbOpen) {
      if (e.key === "ArrowLeft") go(cur - 1);
      if (e.key === "ArrowRight") go(cur + 1);
      if (e.key === "Escape") closeLB();
    } else if (e.key === "Escape") { const o = $$(".modal.open").pop(); if (o) closeModal(o); toggleDrawer(false); }
  });
  let sx = null, sy = 0, dx = 0;
  lb.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; sx = e.clientX; sy = e.clientY; dx = 0; lbTrack.style.transition = "none"; });
  lb.addEventListener("pointermove", (e) => { if (sx === null) return; dx = e.clientX - sx; lbTrack.style.transform = `translateX(calc(${-cur * 100}% + ${dx}px))`; });
  const endSwipe = (e) => {
    if (sx === null) return;
    const dy = (e.clientY || sy) - sy; sx = null;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
    else if (Math.abs(dx) < 6 && dy > 120) closeLB();
    else go(cur);
  };
  lb.addEventListener("pointerup", endSwipe);
  lb.addEventListener("pointercancel", endSwipe);

  /* ---------- 오시는 길 ---------- */
  const q = encodeURIComponent(C.venue.name);
  const qa = encodeURIComponent(`${C.venue.address} ${C.venue.name}`);
  $("#mapFrame").src = `https://maps.google.com/maps?q=${qa}&z=16&hl=ko&output=embed`;
  $("#navNaver").href = `https://map.naver.com/p/search/${q}`;
  $("#navKakao").href = `https://map.kakao.com/link/search/${q}`;
  $("#navTmap").onclick = () => {
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) location.href = `tmap://search?name=${q}`;
    else toast("티맵은 휴대폰에서 이용할 수 있어요");
  };
  if (C.venue.tel) $("#telLink").href = `tel:${C.venue.tel.replace(/[^\d+]/g, "")}`; else $("#telLink").hidden = true;
  $("#transport").innerHTML = C.transport.map((t) => `<div class="t-row"><h4>${t.title}</h4><ul>${t.items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`).join("");

  /* ---------- 복사 / 공유 / 토스트 ---------- */
  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1800); }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch {} ta.remove(); }
    toast(msg);
  }
  $("#copyAddr").onclick = () => copy(C.venue.address, "주소가 복사되었습니다");
  $("#shareBtn").onclick = async () => {
    const data = { title: document.title, text: `${C.groom.name} ♥ ${C.bride.name} 결혼합니다\n${fullDate}\n${venueLine}`, url: location.href.split("#")[0] };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else copy(data.url, "청첩장 링크가 복사되었습니다");
  };

  /* ---------- 계좌 ---------- */
  $$(".acc").forEach((acc) => {
    const list = C.accounts[acc.dataset.side] || [];
    const body = $(".acc-body", acc);
    body.innerHTML = list.map((a, i) => `<div class="acc-row"><div><div class="who">${a.role} ${a.name}</div><div class="num">${a.bank} ${a.number}</div></div><button data-i="${i}">복사</button></div>`).join("");
    $$("button[data-i]", body).forEach((b) => (b.onclick = () => { const a = list[b.dataset.i]; copy(`${a.bank} ${a.number}`, "계좌번호가 복사되었습니다"); }));
    $(".acc-head", acc).onclick = () => {
      const open = acc.classList.toggle("open");
      body.style.maxHeight = open ? body.scrollHeight + "px" : "0";
    };
  });

  /* ---------- 모달 ---------- */
  function openModal(el) {
    if (typeof el === "string") el = $("#" + el);
    if (el.id === "rsvpForm") $$(".modal.open").forEach((o) => o.id === "rsvpIntro" && closeModal(o));
    el.classList.add("open"); document.body.classList.add("lock");
  }
  function closeModal(el) {
    el.classList.remove("open");
    if (el.id === "rsvpIntro" && $("#skipToday").checked) store.set("rsvpSkip", new Date().toDateString());
    if (!$(".modal.open") && !lbOpen) document.body.classList.remove("lock");
  }
  $$("[data-open]").forEach((b) => (b.onclick = () => openModal(b.dataset.open)));
  $$(".modal").forEach((mo) => {
    mo.addEventListener("click", (e) => { if (e.target === mo && !mo.classList.contains("sheet")) closeModal(mo); });
    $$("[data-close]", mo).forEach((b) => (b.onclick = () => closeModal(mo)));
  });
  $("#skipToday").onchange = (e) => { if (e.target.checked) closeModal($("#rsvpIntro")); };
  function maybeRsvpPopup() {
    if (!C.rsvpPopupOnLoad || target < Date.now()) return;
    if (store.get("rsvpSkip") === new Date().toDateString()) return;
    if (store.get("rsvpSent")) return;
    openModal("rsvpIntro");
  }

  /* ---------- RSVP 폼 ---------- */
  const form = $("#form"), submitBtn = $("#submitBtn"), err = $("#formErr");
  const sync = () => {
    const attend = form.attend.value;
    form.classList.toggle("no-attend", attend === "불참석");
    submitBtn.disabled = !form.agree.checked;
    err.textContent = "";
  };
  form.addEventListener("input", sync); form.addEventListener("change", sync);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form;
    const attend = f.attend.value;
    const miss = !f.side.value ? "어느 측 하객인지 선택해주세요."
      : !attend ? "참석여부를 선택해주세요."
      : attend === "참석" && !f.meal.value ? "식사여부를 선택해주세요."
      : !f.name.value.trim() ? "성함을 입력해주세요."
      : !f.agree.checked ? "개인정보 수집 및 활용에 동의해주세요." : "";
    if (miss) { err.textContent = miss; return; }
    if (f.website.value) return; // 스팸 봇
    const data = {
      side: f.side.value, attend,
      meal: attend === "참석" ? f.meal.value : "-",
      count: attend === "참석" ? f.count.value : "0",
      name: f.name.value.trim(),
      companion: attend === "참석" ? f.companion.value.trim() : "",
      message: f.message.value.trim(),
    };
    if (!C.rsvpEndpoint) { err.textContent = "아직 접수 주소가 설정되지 않았습니다. (config.js의 rsvpEndpoint)"; return; }
    submitBtn.disabled = true; submitBtn.textContent = "전달 중…";
    try {
      await fetch(C.rsvpEndpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
      store.set("rsvpSent", "1");
      form.hidden = true; $("#formDone").hidden = false;
    } catch {
      err.textContent = "전송에 실패했습니다. 잠시 후 다시 시도해주세요.";
    } finally {
      submitBtn.disabled = !form.agree.checked; submitBtn.textContent = "전달";
    }
  });
})();
