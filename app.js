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
  const [, Y, Mo, D, h, mi] = C.date.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/).map(Number);
  const target = new Date(C.date);
  const DOW = ["일", "월", "화", "수", "목", "금", "토"];
  const DOW_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const dow = new Date(Date.UTC(Y, Mo - 1, D)).getUTCDay();
  const ampm = h === 12 ? "낮" : h < 12 ? "오전" : "오후";
  const h12 = h % 12 || 12;
  const timeStr = `${ampm} ${h12}시${mi ? ` ${mi}분` : ""}`;
  const fullDate = `${Y}년 ${Mo}월 ${D}일 ${DOW[dow]}요일 ${timeStr}`;
  const pad = (n) => String(n).padStart(2, "0");
  const enTime = `${h12}:${pad(mi)} ${h < 12 ? "AM" : "PM"}`;

  /* ---------- 텍스트 채우기 ---------- */
  $$("[data-k]").forEach((el) => {
    const v = get(el.dataset.k);
    if (!v) el.hidden = true; else el.textContent = v;
  });
  $$("[data-date=full]").forEach((el) => (el.textContent = fullDate));
  $("#coverDate").textContent = `${Y}. ${pad(Mo)}. ${pad(D)}. ${DOW_EN[dow]} ${enTime}`;
  const venueLine = C.venue.name + (C.venue.hall ? ` ${C.venue.hall}` : "");
  $$(".venue-line").forEach((el) => (el.textContent = venueLine));
  $(".greeting").innerHTML = C.greeting
    .join("\n").split(/\n\s*\n/)
    .map((para) => `<p>${para.split("\n").join("<br>")}</p>`).join("");
  if (C.showFlowerNotice) $("#flower").hidden = false;

  /* ---------- 등장 효과 ---------- */
  requestAnimationFrame(() => document.body.classList.add("ready"));
  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- 달력 + D-day ---------- */
  (() => {
    const first = new Date(Date.UTC(Y, Mo - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(Y, Mo, 0)).getUTCDate();
    let html = `<p class="cal-month">${Mo}월</p><div class="cal-grid">`;
    html += DOW.map((d, i) => `<span class="dow${i === 0 ? " sun" : ""}">${d}</span>`).join("");
    html += "<span></span>".repeat(first);
    for (let d = 1; d <= days; d++) {
      const w = (first + d - 1) % 7;
      const cls = [w === 0 && "sun", d === D && "on"].filter(Boolean).join(" ");
      html += `<span${cls ? ` class="${cls}"` : ""}>${d}</span>`;
    }
    $("#calendar").innerHTML = html + "</div>";

    // 날짜 차이는 한국 시간 기준 '날짜'로 계산 (시각 때문에 하루 어긋나지 않게)
    const today = new Date(Date.now() + 9 * 3600e3);
    const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const left = Math.round((Date.UTC(Y, Mo - 1, D) - todayUTC) / 86400e3);
    const names = `${C.groom.short}, ${C.bride.short}`;
    $("#dday").innerHTML = left > 0 ? `${names}의 결혼식까지 <b>${left}일</b>`
      : left === 0 ? `<b>오늘</b> 결혼합니다`
      : `함께해주셔서 감사합니다`;
  })();

  /* ---------- 갤러리 ---------- */
  const photos = C.photos;
  const grid = $("#grid"), moreBtn = $("#moreBtn");
  const FIRST = 9;
  grid.innerHTML = photos.map((p, i) =>
    `<button class="${i >= FIRST ? "extra" : ""}" data-i="${i}" aria-label="사진 ${i + 1} 크게 보기"><img src="images/thumb/${p}.jpg" alt="" loading="lazy" width="520" height="520"></button>`).join("");
  if (photos.length > FIRST) {
    moreBtn.hidden = false;
    moreBtn.onclick = () => { grid.classList.add("all"); moreBtn.hidden = true; };
  }
  grid.onclick = (e) => { const b = e.target.closest("button"); if (b) openLB(+b.dataset.i); };

  /* ---------- 라이트박스 (scroll-snap) ---------- */
  const lb = $("#lightbox"), lbTrack = $("#lbTrack"), lbCount = $("#lbCount");
  lbTrack.innerHTML = photos.map((p) => `<div class="lb-slide"><img src="images/full/${p}.jpg" alt="" loading="lazy" decoding="async"></div>`).join("");
  const curIdx = () => Math.round(lbTrack.scrollLeft / lbTrack.clientWidth);
  const setCount = () => (lbCount.textContent = `${curIdx() + 1} / ${photos.length}`);
  const goTo = (i, smooth = true) => {
    i = Math.max(0, Math.min(photos.length - 1, i));
    lbTrack.scrollTo({ left: i * lbTrack.clientWidth, behavior: smooth ? "smooth" : "instant" });
  };
  function openLB(i) {
    lb.showModal();
    goTo(i, false);
    setCount();
  }
  lbTrack.addEventListener("scroll", setCount, { passive: true });
  $("#lbPrev").onclick = () => goTo(curIdx() - 1);
  $("#lbNext").onclick = () => goTo(curIdx() + 1);
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(curIdx() - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(curIdx() + 1); }
  });
  lbTrack.addEventListener("click", (e) => { if (e.target.tagName !== "IMG") lb.close(); });

  /* ---------- 오시는 길 ---------- */
  const q = encodeURIComponent(C.venue.name);
  const qa = encodeURIComponent(`${C.venue.address} ${C.venue.name}`);
  $("#mapFrame").src = `https://maps.google.com/maps?q=${qa}&z=16&hl=ko&output=embed`;
  $("#navNaver").href = `https://map.naver.com/p/search/${q}`;
  $("#navKakao").href = `https://map.kakao.com/link/search/${q}`;
  $("#navTmap").onclick = () => {
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) location.href = `tmap://search?name=${q}`;
    else toast("티맵은 휴대폰에서 열 수 있어요");
  };
  if (C.venue.tel) $("#telLink").href = `tel:${C.venue.tel.replace(/[^\d+]/g, "")}`;
  else $("#telLink").hidden = true;
  $("#transport").innerHTML = C.transport.map((t) =>
    `<div class="t-row"><h3>${t.title}</h3><ul>${t.items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`).join("");

  /* ---------- 복사 / 공유 / 토스트 ---------- */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1800);
  }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch {}
      ta.remove();
    }
    toast(msg);
  }
  const pageUrl = location.href.split("#")[0];
  $("#copyAddr").onclick = () => copy(C.venue.address, "주소를 복사했어요");
  $("#copyLink").onclick = () => copy(pageUrl, "링크를 복사했어요");
  $("#shareBtn").onclick = async () => {
    const data = { title: document.title, text: `${fullDate}\n${venueLine}`, url: pageUrl };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else copy(pageUrl, "링크를 복사했어요");
  };

  /* ---------- 계좌 ---------- */
  // 은행명이 비었거나 계좌번호가 0으로만 채워진 줄은 자동으로 숨깁니다.
  const isReal = (a) => a.bank && a.bank !== "은행명" && /[1-9]/.test(a.number || "");
  $$(".acc").forEach((acc) => {
    const list = (C.accounts[acc.dataset.side] || []).filter(isReal);
    if (!list.length) { acc.hidden = true; return; }
    const body = $(".acc-body", acc);
    body.innerHTML = list.map((a, i) =>
      `<div class="acc-row"><div><p class="who">${a.role} <b>${a.name}</b></p><p class="num">${a.bank} ${a.number}</p></div><button data-i="${i}">복사</button></div>`).join("");
    body.onclick = (e) => {
      const b = e.target.closest("button[data-i]");
      if (!b) return;
      const a = list[b.dataset.i];
      copy(`${a.bank} ${a.number}`, "계좌번호를 복사했어요");
    };
  });

  /* ---------- 다이얼로그 ---------- */
  $$("[data-open]").forEach((b) => (b.onclick = () => $("#" + b.dataset.open).showModal()));
  $$("dialog").forEach((d) => {
    $$("[data-close]", d).forEach((b) => (b.onclick = () => d.close()));
    // 바깥(배경) 클릭 시 닫기 — 폼은 실수로 닫히지 않게 제외
    if (d.id !== "rsvpForm") d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  });

  /* ---------- RSVP 폼 ---------- */
  const form = $("#form"), submitBtn = $("#submitBtn"), err = $("#formErr");
  if (store.get("rsvpSent")) $("#rsvp .btn").textContent = "참석 여부 다시 보내기";
  form.addEventListener("change", () => {
    form.classList.toggle("no-attend", form.attend.value === "불참석");
    err.textContent = "";
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = form, attend = f.attend.value;
    const miss = !f.side.value ? "신랑측·신부측 중 선택해주세요."
      : !attend ? "참석 여부를 선택해주세요."
      : attend === "참석" && !f.meal.value ? "식사 여부를 선택해주세요."
      : !f.name.value.trim() ? "성함을 입력해주세요."
      : !f.agree.checked ? "개인정보 수집·이용에 동의해주세요." : "";
    if (miss) { err.textContent = miss; return; }
    if (f.website.value) return; // 스팸 봇
    if (!C.rsvpEndpoint) { err.textContent = "접수 주소가 아직 설정되지 않았습니다. (config.js → rsvpEndpoint)"; return; }
    const data = {
      side: f.side.value, attend,
      meal: attend === "참석" ? f.meal.value : "-",
      count: attend === "참석" ? f.count.value : "0",
      name: f.name.value.trim(),
      companion: attend === "참석" ? f.companion.value.trim() : "",
      message: f.message.value.trim(),
    };
    submitBtn.disabled = true; submitBtn.textContent = "보내는 중…";
    try {
      // Apps Script는 CORS 응답을 주지 않아 no-cors로 보냅니다 (네트워크 오류만 감지 가능).
      await fetch(C.rsvpEndpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(data) });
      store.set("rsvpSent", "1");
      form.hidden = true; $("#formDone").hidden = false;
    } catch {
      err.textContent = "전송하지 못했어요. 잠시 후 다시 시도해주세요.";
    } finally {
      submitBtn.disabled = false; submitBtn.textContent = "보내기";
    }
  });
})();
