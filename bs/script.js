document.addEventListener("DOMContentLoaded", () => {

    const mainContent = document.querySelector(".main-content");
    const isMobile = () => window.innerWidth <= 768;
    const sidebar = document.querySelector(".sidebar");
    const body = document.body;

    /* ================= ЯЗЫК ================= */
    let lang = "ru";
    try { if (localStorage.getItem("lang") === "en") lang = "en"; } catch (e) {}

    // Тексты, которые создаются скриптом
    const UI = {
        ru: {
            empty: "Ничего не найдено",
            crReady: "Готов к захвату?",
            crStart: "Начать",
            crAgain: "Играть снова",
            crWin: (n) => `🏆 Победа! Собрано кристаллов: ${n}`,
            crLose: (n, g) => `Не хватило! Собрано: ${n} из ${g}`,
            streak: "Серия",
            best: "Рекорд",
            maxStreak: "Лучшая серия",
            restart: "Пройти заново",
            perfect: "Идеально! Ты эксперт 🏆",
            good: "Хороший результат 👍",
            bad: "Перечитай гайд и попробуй ещё 📖",
            bugEmpty: "Опишите ошибку перед отправкой.",
            bugOpened: "Письмо открыто в вашей почте.",
            bugSubject: "Баг на сайте Ranked Guide",
            bugBody: (mode, rank, text) => `Режим: ${mode}\nРанг: ${rank}\n\nОписание:\n${text}`,
            tips: [
                "Для рангового боя нужны бойцы 11 уровня силы. Прокачайте основных бойцов заранее.",
                "Цифры от 1 до 6 рядом с игроками показывают очередь пика. Сверяйтесь с ними, прежде чем выбирать бойца.",
                "У каждой команды по 3 бана, по одному на игрока. Предложите союзникам, кого банить, через быстрый чат.",
                "Победа 2:0 даёт больше очков, а поражение 1:2 отнимает меньше. Играйте до конца даже в близких матчах.",
                "Если союзнику удобнее выбирать раньше, поменяйтесь очередью на фазе пиков.",
                "После матча загляните в статистику: урон, лечение и задачи режима по раундам помогут найти слабые места.",
                "Начиная с ранга «Мастер I» играть можно только в одиночку. Заранее привыкайте полагаться на себя.",
                "Сброс в новом сезоне теперь всего на 2 ранга, так что вернуться на прежний уровень проще.",
                "Кнопка «Играть снова» быстро находит новый матч с той же командой (кроме ранга «Мастер I» и выше).",
                "Сначала смотрите на карту и режим, а уже потом выбирайте бойца."
            ]
        },
        en: {
            empty: "Nothing found",
            crReady: "Ready to grab?",
            crStart: "Start",
            crAgain: "Play again",
            crWin: (n) => `🏆 Victory! Gems collected: ${n}`,
            crLose: (n, g) => `Not enough! Collected: ${n} of ${g}`,
            streak: "Streak",
            best: "Record",
            maxStreak: "Best streak",
            restart: "Try again",
            perfect: "Perfect! You're an expert 🏆",
            good: "Good result 👍",
            bad: "Re-read the guide and try again 📖",
            bugEmpty: "Please describe the error before sending.",
            bugOpened: "The email has been opened in your mail app.",
            bugSubject: "Bug on the Ranked Guide site",
            bugBody: (mode, rank, text) => `Mode: ${mode}\nRank: ${rank}\n\nDescription:\n${text}`,
            tips: [
                "Ranked requires brawlers of power level 11. Upgrade your main brawlers in advance.",
                "The numbers from 1 to 6 next to players show the pick order. Check them before choosing a brawler.",
                "Each team has 3 bans, one per player. Suggest to your allies who to ban using quick chat.",
                "A 2:0 win gives more points and a 1:2 loss takes fewer. Play to the end even in close matches.",
                "If a teammate prefers to pick earlier, swap pick order during the pick phase.",
                "Check the stats after the match: damage, healing and mode objectives by round help you find weak spots.",
                "From Masters I and above you can only play solo. Get used to relying on yourself early.",
                "The new season reset is only 2 ranks, so getting back to your previous level is easier.",
                "The “Play Again” button quickly finds a new match with the same team (except Masters I and above).",
                "Look at the map and mode first, then choose your brawler."
            ]
        }
    };
    const t = (key, ...args) => {
        const v = UI[lang][key];
        return typeof v === "function" ? v(...args) : v;
    };
    const langHooks = [];

    // Собираем статические тексты, которые есть в словаре lang.js
    const norm = (s) => s.replace(/\s+/g, " ").trim();
    const dict = typeof I18N_EN !== "undefined" ? I18N_EN : {};
    const textNodes = [];
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
            const p = n.parentElement;
            if (!p || p.closest("script, style, #cr-msg, #cr-start, #quiz-box")) return NodeFilter.FILTER_REJECT;
            return dict[norm(n.nodeValue)] ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
    });
    while (walker.nextNode()) textNodes.push({ node: walker.currentNode, ru: walker.currentNode.nodeValue });

    const attrItems = [];
    document.querySelectorAll("[placeholder],[title],[alt]").forEach(el => {
        ["placeholder", "title", "alt"].forEach(a => {
            const v = el.getAttribute(a);
            if (v && dict[norm(v)]) attrItems.push({ el, a, ru: v });
        });
    });

    function applyStatic() {
        textNodes.forEach(({ node, ru }) => {
            if (lang === "ru") { node.nodeValue = ru; return; }
            const lead = ru.match(/^\s*/)[0];
            const trail = ru.match(/\s*$/)[0];
            node.nodeValue = lead + dict[norm(ru)] + trail;
        });
        attrItems.forEach(({ el, a, ru }) => {
            el.setAttribute(a, lang === "ru" ? ru : dict[norm(ru)]);
        });
        document.documentElement.lang = lang;
    }

    const langBtn = document.getElementById("lang-toggle");

    function setLang(l) {
        lang = l;
        try { localStorage.setItem("lang", l); } catch (e) {}
        applyStatic();
        if (langBtn) langBtn.textContent = l === "ru" ? "EN" : "RU";
        document.querySelectorAll(".search-empty").forEach(e => { e.textContent = t("empty"); });
        langHooks.forEach(h => h());
    }

    if (langBtn) langBtn.addEventListener("click", () => setLang(lang === "ru" ? "en" : "ru"));

    /* ================= ЗВУК ================= */
    let soundOn = true;
    try { soundOn = localStorage.getItem("sound") !== "off"; } catch (e) {}
    let audioCtx = null;

    function tone(freq, dur = 0.12, type = "sine", vol = 0.15, delay = 0) {
        if (!soundOn) return;
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === "suspended") audioCtx.resume();
            const t0 = audioCtx.currentTime + delay;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t0);
            gain.gain.setValueAtTime(vol, t0);
            gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(t0);
            osc.stop(t0 + dur);
        } catch (e) {}
    }

    const sfx = {
        ping: () => { tone(880, 0.08, "triangle"); tone(1320, 0.1, "triangle", 0.12, 0.05); },
        ok:   () => { tone(660, 0.1); tone(990, 0.16, "sine", 0.15, 0.1); },
        bad:  () => tone(160, 0.25, "sawtooth", 0.1),
        win:  () => [523, 659, 784, 1047].forEach((f, n) => tone(f, 0.18, "triangle", 0.15, n * 0.1)),
        lose: () => { tone(330, 0.2, "triangle"); tone(247, 0.3, "triangle", 0.12, 0.15); }
    };

    const soundBtn = document.getElementById("sound-toggle");
    function renderSound() { if (soundBtn) soundBtn.textContent = soundOn ? "🔊" : "🔇"; }
    if (soundBtn) {
        soundBtn.addEventListener("click", () => {
            soundOn = !soundOn;
            try { localStorage.setItem("sound", soundOn ? "on" : "off"); } catch (e) {}
            renderSound();
            if (soundOn) sfx.ping();
        });
    }
    renderSound();

    /* ================= РАЗМЕР ТЕКСТА ================= */
    const ZOOMS = [0.9, 1, 1.15, 1.3, 1.5];
    let zoomIdx = 1;
    try {
        const saved = parseInt(localStorage.getItem("zoomIdx"), 10);
        if (saved >= 0 && saved < ZOOMS.length) zoomIdx = saved;
    } catch (e) {}
    const fontDec = document.getElementById("font-dec");
    const fontInc = document.getElementById("font-inc");

    function applyZoom() {
        document.documentElement.style.setProperty("--text-zoom", ZOOMS[zoomIdx]);
        if (fontDec) fontDec.disabled = zoomIdx === 0;
        if (fontInc) fontInc.disabled = zoomIdx === ZOOMS.length - 1;
        try { localStorage.setItem("zoomIdx", zoomIdx); } catch (e) {}
    }
    if (fontDec) fontDec.addEventListener("click", () => { if (zoomIdx > 0) { zoomIdx--; applyZoom(); } });
    if (fontInc) fontInc.addEventListener("click", () => { if (zoomIdx < ZOOMS.length - 1) { zoomIdx++; applyZoom(); } });
    applyZoom();

    /* ================= 1. МЕНЮ ================= */
    const toggleBtn = document.getElementById("toggle-btn");
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener("click", () => sidebar.classList.toggle("collapsed"));
        // На телефоне меню закрыто по умолчанию и закрывается по тапу на контент
        if (isMobile()) sidebar.classList.add("collapsed");
        mainContent.addEventListener("click", (e) => {
            if (isMobile() && !sidebar.classList.contains("collapsed") && !e.target.closest("#toggle-btn")) {
                sidebar.classList.add("collapsed");
            }
        });
    }

    /* ================= 2. СТРАНИЦЫ (с адресами #ranked, #modes, ...) ================= */
    const menuLinks = document.querySelectorAll(".menu-link");
    const pages = document.querySelectorAll(".page-content");
    const pageNames = Array.from(pages).map(p => p.id.replace("page-", ""));

    function selectGameTab(sub) {
        const panel = sub && document.getElementById("game-" + sub);
        if (!panel) return;
        document.querySelectorAll(".game-tab").forEach(x => x.classList.toggle("active", x.dataset.game === panel.id));
        document.querySelectorAll(".game-panel").forEach(p => p.classList.toggle("active", p === panel));
    }

    function showPage(name, sub) {
        let idx = pageNames.indexOf(name);
        if (idx < 0) idx = 0;
        const changed = !pages[idx].classList.contains("active");
        if (changed) clearSearch();
        menuLinks.forEach((l, k) => l.classList.toggle("active", k === idx));
        pages.forEach((p, k) => p.classList.toggle("active", k === idx));
        if (pageNames[idx] === "games") selectGameTab(sub);
        if (changed) mainContent.scrollTop = 0;
    }

    function route() {
        const h = location.hash.slice(1);
        const parts = h.split("-");
        showPage(parts[0], parts[1]);
        if (h) { try { localStorage.setItem("route", h); } catch (e) {} }
    }

    menuLinks.forEach((link, index) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            if (isMobile() && sidebar) sidebar.classList.add("collapsed");
            const name = pageNames[index];
            if (location.hash === "#" + name) mainContent.scrollTop = 0;
            else location.hash = name;
        });
    });

    /* ================= 3. ТЕМА ================= */
    const themeToggleBtn = document.getElementById("theme-toggle");
    if (themeToggleBtn) {
        if (localStorage.getItem("theme") === "light") {
            body.classList.add("light-theme");
            themeToggleBtn.textContent = "☀️";
        }
        themeToggleBtn.addEventListener("click", () => {
            const isLight = body.classList.toggle("light-theme");
            themeToggleBtn.textContent = isLight ? "☀️" : "🌙";
            localStorage.setItem("theme", isLight ? "light" : "dark");
        });
    }

    /* ================= 4. ПОИСК ================= */
    const searchInput = document.getElementById("search-input");

    function applySearch() {
        const page = document.querySelector(".page-content.active");
        if (!page) return;
        const q = searchInput.value.trim().toLowerCase();
        let found = 0;
        page.querySelectorAll(".card").forEach(card => {
            const match = !q || card.textContent.toLowerCase().includes(q);
            card.style.display = match ? "" : "none";
            if (match) found++;
        });
        let empty = page.querySelector(".search-empty");
        if (!empty) {
            empty = document.createElement("div");
            empty.className = "search-empty";
            page.appendChild(empty);
        }
        empty.textContent = t("empty");
        empty.style.display = q && !found ? "block" : "none";
    }

    function clearSearch() {
        if (!searchInput || !searchInput.value) return;
        searchInput.value = "";
        applySearch();
    }

    if (searchInput) searchInput.addEventListener("input", applySearch);

    /* ================= 5. ОГЛАВЛЕНИЕ И «НАВЕРХ» ================= */
    document.querySelectorAll(".toc-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.getElementById(link.dataset.target);
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });

    const topBtn = document.getElementById("back-to-top");
    if (topBtn) {
        mainContent.addEventListener("scroll", () => {
            topBtn.classList.toggle("visible", mainContent.scrollTop > 300);
        });
        topBtn.addEventListener("click", () => mainContent.scrollTo({ top: 0, behavior: "smooth" }));
    }

    /* ================= 6. ВКЛАДКИ МИНИ-ИГР ================= */
    document.querySelectorAll(".game-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            const target = "#games-" + tab.dataset.game.replace("game-", "");
            if (location.hash !== target) location.hash = target.slice(1);
        });
    });

    /* ================= 7. ИГРА «СОБЕРИ КРИСТАЛЛЫ» ================= */
    const arena = document.getElementById("cr-arena");
    if (arena) {
        const overlay = document.getElementById("cr-overlay");
        const msg = document.getElementById("cr-msg");
        const startBtn = document.getElementById("cr-start");
        const scoreEl = document.getElementById("cr-score");
        const timeEl = document.getElementById("cr-time");
        const bestEl = document.getElementById("cr-best");
        const GOAL = 10, DURATION = 30;
        let score = 0, time = DURATION, tick = null, spawn = null;
        let phase = "ready"; // ready | win | lose

        let best = 0;
        try { best = parseInt(localStorage.getItem("crystalBest"), 10) || 0; } catch (e) {}
        bestEl.textContent = best;

        function renderOverlay() {
            msg.textContent = phase === "ready" ? t("crReady")
                : phase === "win" ? t("crWin", score)
                : t("crLose", score, GOAL);
            startBtn.textContent = phase === "ready" ? t("crStart") : t("crAgain");
        }

        function spawnCrystal() {
            if (!arena.clientWidth) return; // страница скрыта
            const c = document.createElement("button");
            c.className = "crystal";
            c.textContent = "💎";
            c.style.left = Math.random() * (arena.clientWidth - 50) + "px";
            c.style.top = Math.random() * (arena.clientHeight - 50) + "px";
            c.addEventListener("click", () => {
                sfx.ping();
                score++;
                scoreEl.textContent = score;
                c.classList.add("pop");
                setTimeout(() => c.remove(), 250);
            });
            arena.appendChild(c);
            setTimeout(() => c.remove(), 1400);
        }

        function endGame() {
            clearInterval(tick);
            clearInterval(spawn);
            arena.querySelectorAll(".crystal").forEach(c => c.remove());
            if (score > best) {
                best = score;
                bestEl.textContent = best;
                try { localStorage.setItem("crystalBest", best); } catch (e) {}
            }
            phase = score >= GOAL ? "win" : "lose";
            if (phase === "win") sfx.win(); else sfx.lose();
            renderOverlay();
            overlay.classList.remove("hidden");
        }

        startBtn.addEventListener("click", () => {
            score = 0;
            time = DURATION;
            scoreEl.textContent = 0;
            timeEl.textContent = time;
            overlay.classList.add("hidden");
            tick = setInterval(() => {
                if (!arena.offsetParent) return; // пауза, пока вкладка не видна
                time--;
                timeEl.textContent = time;
                if (time <= 0) endGame();
            }, 1000);
            spawn = setInterval(spawnCrystal, 650);
        });

        langHooks.push(renderOverlay);
        renderOverlay();
    }

    /* ================= 8. ВИКТОРИНА ================= */
    const quizBox = document.getElementById("quiz-box");
    if (quizBox) {
        const QUESTIONS = [
            { q: { ru: "С какого количества трофеев открывается ранговый бой?", en: "How many trophies are needed to unlock Ranked?" },
              a: { ru: ["1000", "3000", "5000", "10000"], en: ["1000", "3000", "5000", "10000"] }, c: 2 },
            { q: { ru: "Сколько бойцов блокирует каждая команда на драфте?", en: "How many brawlers does each team ban in the draft?" },
              a: { ru: ["1", "3", "5", "6"], en: ["1", "3", "5", "6"] }, c: 1 },
            { q: { ru: "Бойцы какого уровня силы нужны для рангов после обновления?", en: "What brawler power level is required for ranks after the update?" },
              a: { ru: ["9", "10", "11", "12"], en: ["9", "10", "11", "12"] }, c: 2 },
            { q: { ru: "На сколько рангов сбрасывается ранг в начале нового сезона?", en: "By how many ranks does your rank drop at the start of a new season?" },
              a: { ru: ["2", "4", "6", "10"], en: ["2", "4", "6", "10"] }, c: 0 },
            { q: { ru: "Что означает аббревиатура «ФП»?", en: "What does the abbreviation “FP” stand for?" },
              a: { ru: ["Final Pick", "First Pick", "Fast Play", "Free Pass"], en: ["Final Pick", "First Pick", "Fast Play", "Free Pass"] }, c: 1 },
            { q: { ru: "С какого ранга можно играть только в одиночку?", en: "From which rank can you only play solo?" },
              a: { ru: ["Алмаз", "Мифический", "Мастер I", "Бронза"], en: ["Diamond", "Mythic", "Masters I", "Bronze"] }, c: 2 },
            { q: { ru: "Сколько бесплатных максимально прокачанных бойцов теперь выдаётся?", en: "How many free fully upgraded brawlers are given now?" },
              a: { ru: ["3", "6", "9", "12"], en: ["3", "6", "9", "12"] }, c: 1 },
            { q: { ru: "Сколько бойцов 11 уровня нужно для порога «Алмаз»?", en: "How many power level 11 brawlers are needed for the Diamond threshold?" },
              a: { ru: ["9", "10", "12", "15"], en: ["9", "10", "12", "15"] }, c: 2 }
        ];
        const QTIME = 15; // секунд на вопрос
        let i = 0, correct = 0, streak = 0, maxStreak = 0;
        let locked = false, view = "q", timeLeft = QTIME * 10, timer = null;
        let bestQuiz = 0;
        try { bestQuiz = parseInt(localStorage.getItem("quizBest"), 10) || 0; } catch (e) {}

        function stopTimer() { clearInterval(timer); timer = null; }

        function startTimer() {
            stopTimer();
            timer = setInterval(() => {
                if (!quizBox.offsetParent) return; // пауза, пока вкладка не видна
                timeLeft--;
                const bar = document.getElementById("qz-bar");
                const sec = document.getElementById("qz-time");
                if (bar) {
                    bar.style.width = (timeLeft / (QTIME * 10)) * 100 + "%";
                    bar.classList.toggle("low", timeLeft <= 50);
                }
                if (sec) sec.textContent = Math.max(0, Math.ceil(timeLeft / 10));
                if (timeLeft <= 0) timeUp();
            }, 100);
        }

        function renderQuestion(resume) {
            const item = QUESTIONS[i];
            view = "q";
            locked = false;
            if (!resume) timeLeft = QTIME * 10;
            quizBox.innerHTML =
                `<div class="game-stats">` +
                    `<span>🔥 ${t("streak")}: <strong>${streak}</strong></span>` +
                    `<span>⏱ <strong id="qz-time">${Math.ceil(timeLeft / 10)}</strong></span>` +
                    `<span>🏆 ${t("best")}: <strong>${bestQuiz}/${QUESTIONS.length}</strong></span>` +
                `</div>` +
                `<div class="quiz-progress"><div style="width:${(i / QUESTIONS.length) * 100}%"></div></div>` +
                `<div class="quiz-timer"><div id="qz-bar" style="width:${(timeLeft / (QTIME * 10)) * 100}%"></div></div>` +
                `<div class="quiz-question">${i + 1}/${QUESTIONS.length}. ${item.q[lang]}</div>` +
                item.a[lang].map((txt, n) => `<button class="quiz-option" data-n="${n}">${txt}</button>`).join("");
            quizBox.querySelectorAll(".quiz-option").forEach(btn => {
                btn.addEventListener("click", () => answer(btn, item));
            });
            startTimer();
        }

        function next() {
            i++;
            i < QUESTIONS.length ? renderQuestion() : renderResult();
        }

        function answer(btn, item) {
            if (locked) return;
            locked = true;
            stopTimer();
            const options = quizBox.querySelectorAll(".quiz-option");
            if (Number(btn.dataset.n) === item.c) {
                sfx.ok();
                correct++;
                streak++;
                maxStreak = Math.max(maxStreak, streak);
                btn.classList.add("correct");
            } else {
                sfx.bad();
                streak = 0;
                btn.classList.add("wrong");
                options[item.c].classList.add("correct");
            }
            setTimeout(next, 1000);
        }

        function timeUp() {
            if (locked) return;
            locked = true;
            stopTimer();
            sfx.bad();
            streak = 0;
            quizBox.querySelectorAll(".quiz-option")[QUESTIONS[i].c].classList.add("correct");
            setTimeout(next, 1000);
        }

        function renderResult(silent) {
            view = "r";
            stopTimer();
            if (correct > bestQuiz) {
                bestQuiz = correct;
                try { localStorage.setItem("quizBest", bestQuiz); } catch (e) {}
            }
            const pct = correct / QUESTIONS.length;
            if (!silent) { if (pct >= 0.6) sfx.win(); else sfx.lose(); }
            const text = pct === 1 ? t("perfect") : pct >= 0.6 ? t("good") : t("bad");
            quizBox.innerHTML =
                `<div class="quiz-result"><div class="big">${correct} / ${QUESTIONS.length}</div>` +
                `<p>${text}</p>` +
                `<p>🔥 ${t("maxStreak")}: ${maxStreak} &nbsp; 🏆 ${t("best")}: ${bestQuiz}/${QUESTIONS.length}</p><br>` +
                `<button class="game-btn" id="quiz-restart">${t("restart")}</button></div>`;
            document.getElementById("quiz-restart").addEventListener("click", () => {
                i = 0; correct = 0; streak = 0; maxStreak = 0;
                renderQuestion();
            });
        }

        langHooks.push(() => {
            if (view === "r") renderResult(true);
            else if (!locked) renderQuestion(true);
        });

        renderQuestion();
    }

    /* ================= 9. ФОНОВАЯ АНИМАЦИЯ ================= */
    const canvas = document.getElementById("bg-canvas");
    if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const ctx = canvas.getContext("2d");
        const COLORS = ["255,204,0", "255,51,102", "80,200,255"];
        const gems = [];
        let w = 0, h = 0;

        function resize() {
            const dpr = window.devicePixelRatio || 1;
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function makeGem(initial) {
            return {
                x: Math.random() * w,
                y: initial ? Math.random() * h : h + 40,
                s: 8 + Math.random() * 16,
                vy: 0.2 + Math.random() * 0.4,
                vx: (Math.random() - 0.5) * 0.2,
                rot: Math.random() * Math.PI * 2,
                vr: (Math.random() - 0.5) * 0.01,
                c: COLORS[Math.floor(Math.random() * COLORS.length)],
                a: 0.08 + Math.random() * 0.12
            };
        }

        resize();
        for (let n = 0; n < 28; n++) gems.push(makeGem(true));
        window.addEventListener("resize", resize);

        function frame() {
            ctx.clearRect(0, 0, w, h);
            const k = body.classList.contains("light-theme") ? 1.6 : 1;
            gems.forEach((g, idx) => {
                g.y -= g.vy;
                g.x += g.vx;
                g.rot += g.vr;
                if (g.y < -40) gems[idx] = makeGem(false);
                ctx.save();
                ctx.translate(g.x, g.y);
                ctx.rotate(g.rot);
                ctx.beginPath();
                ctx.moveTo(0, -g.s);
                ctx.lineTo(g.s * 0.7, -g.s * 0.3);
                ctx.lineTo(0, g.s);
                ctx.lineTo(-g.s * 0.7, -g.s * 0.3);
                ctx.closePath();
                ctx.fillStyle = `rgba(${g.c}, ${g.a * k})`;
                ctx.strokeStyle = `rgba(${g.c}, ${Math.min(1, g.a * 2 * k)})`;
                ctx.lineWidth = 1.5;
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            });
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    /* ================= 10. СОВЕТ ДНЯ ================= */
    const tipText = document.getElementById("tip-text");
    const tipNext = document.getElementById("tip-next");
    if (tipText) {
        const now = new Date();
        const dayNum = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
        let tipOffset = 0;
        const renderTip = () => {
            const tips = UI[lang].tips;
            tipText.textContent = tips[(dayNum + tipOffset) % tips.length];
        };
        if (tipNext) tipNext.addEventListener("click", () => { tipOffset++; renderTip(); });
        langHooks.push(renderTip);
        renderTip();
    }

    /* ================= 11. ФОРМА «СООБЩИТЬ О БАГЕ» ================= */
    const BUG_EMAIL = ""; // ← впишите сюда свою почту, на которую должны приходить сообщения
    const bugSend = document.getElementById("bug-send");
    if (bugSend) {
        const bugMode = document.getElementById("bug-mode");
        const bugRank = document.getElementById("bug-rank");
        const bugText = document.getElementById("bug-text");
        const bugStatus = document.getElementById("bug-status");
        const setStatus = (text, isError) => {
            bugStatus.textContent = text;
            bugStatus.className = "form-status" + (isError ? " error" : "");
        };
        bugText.addEventListener("input", () => setStatus("", false));
        langHooks.push(() => setStatus("", false));
        bugSend.addEventListener("click", () => {
            const text = bugText.value.trim();
            if (!text) {
                setStatus(t("bugEmpty"), true);
                bugText.focus();
                return;
            }
            const mode = bugMode.selectedOptions[0].textContent.trim();
            const rank = bugRank.value.trim() || "—";
            const url = "mailto:" + BUG_EMAIL +
                "?subject=" + encodeURIComponent(t("bugSubject")) +
                "&body=" + encodeURIComponent(t("bugBody", mode, rank, text));
            window.location.href = url;
            setStatus(t("bugOpened"), false);
        });
    }

    /* ================= 12. УСТАНОВКА КАК ПРИЛОЖЕНИЯ (PWA) ================= */
    if ("serviceWorker" in navigator &&
        (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) {
        navigator.serviceWorker.register("sw.js").catch(() => {});
    }

    /* ================= ЗАПУСК: адрес страницы ================= */
    window.addEventListener("hashchange", route);
    if (!location.hash) {
        let saved = "";
        try { saved = localStorage.getItem("route") || ""; } catch (e) {}
        if (saved) {
            try { history.replaceState(null, "", "#" + saved); } catch (e) { location.hash = saved; }
        }
    }
    route();

    /* Применяем сохранённый язык */
    if (lang === "en") setLang("en");
});