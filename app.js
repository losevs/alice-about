const PASSWORD_HASH = "dc018b8a0d539f7d00c0417c3a4f84caec4abf9e979ccc3114b23ddb7845fad3";
const gate = document.querySelector("[data-gate]");
const stage = document.querySelector(".stage");

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function unlock() {
  sessionStorage.setItem("alice-about-ok", "1");
  gate.hidden = true;
  stage.hidden = false;
}

if (sessionStorage.getItem("alice-about-ok") === "1") {
  unlock();
} else {
  document.querySelector("[data-gate-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = new FormData(event.target).get("password").toString();
    const error = document.querySelector("[data-gate-error]");
    if (await sha256(password) === PASSWORD_HASH) {
      unlock();
      return;
    }
    error.hidden = false;
    event.target.querySelector("input").focus();
  });
}

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const scenarios = {
  tasks: {
    files: {
      hello: "Привет!",
      sub: "Чем помочь сегодня?",
      photo: true,
      text: "Добавь надпись на фото «Бабуля, с днем рождения!»",
    },
    plugins: {
      hello: "Маркет подключён",
      sub: "Что ищем?",
      photo: false,
      text: "Найди плед и открытку к дню рождения",
    },
    search: {
      hello: "Ищу",
      sub: "Уточните, если нужно",
      photo: false,
      text: "Сравни клиники рядом и собери вопросы к врачу",
    },
    calls: {
      hello: "Могу позвонить",
      sub: "Куда и зачем?",
      photo: false,
      text: "Позвони в клинику и запиши меня на пятницу",
    },
    book: {
      hello: "Бронирую",
      sub: "Напишите детали",
      photo: false,
      text: "Забронируй столик на двоих сегодня в 19:00",
    },
  },
  memory: {
    save: {
      hello: "Привет!",
      sub: "Чем помочь сегодня?",
      photo: true,
      text: "Добавь надпись на фото «Бабуля, с днем рождения!»",
    },
    find: {
      hello: "Нашла в памяти",
      sub: "Поездка в Токио",
      photo: false,
      text: "Отель ещё не забронирован, напоминание на сегодня 18:00",
    },
    remind: {
      hello: "Напомню",
      sub: "Когда сказать?",
      photo: false,
      text: "Напомни заказать туалетную бумагу завтра утром",
    },
    context: {
      hello: "Поняла контекст",
      sub: "Речь про холм",
      photo: false,
      text: "Запиши детали обсуждения и вернись к ним вечером",
    },
  },
};

function phone(data) {
  const photo = data.photo
    ? '<img class="shot" src="assets/grandma.png" alt="">'
    : "";
  return `
    <div class="phone">
      <div class="phone-top"><i class="burger"></i><img src="assets/oknik.svg" alt=""><b>Алиса AI</b></div>
      <div class="hello"><img src="assets/oknik.svg" alt=""><p>${data.hello}<br><span>${data.sub}</span></p></div>
      <form class="composer">
        ${photo}
        <p>${data.text}</p>
        <div class="composer-bar">
          <span><i>+</i><i>⌘</i></span>
          <button class="send" type="submit" aria-label="Отправить">↑</button>
        </div>
      </form>
    </div>`;
}

function renderPhone(name, tab) {
  const well = $(`[data-phone="${name}"]`);
  well.innerHTML = phone(scenarios[name][tab]);
  well.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    toast("Запрос ушёл в Алису");
  });
}

function toast(text) {
  const node = $("[data-toast]");
  node.hidden = false;
  node.textContent = text;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    node.hidden = true;
  }, 2200);
}

const sheet = $("[data-sheet]");
const sheetBody = $("[data-sheet-body]");

function openSheet(html) {
  sheetBody.innerHTML = html;
  sheet.hidden = false;
  sheet.querySelector(".panel").scrollTop = 0;
}

function closeSheet() {
  sheet.hidden = true;
  sheetBody.innerHTML = "";
}

$$("[data-close]").forEach((node) => node.addEventListener("click", closeSheet));

function bindSheet(root = document) {
  root.querySelectorAll("[data-close-go]").forEach((node) => {
    node.addEventListener("click", () => {
      const label = node.dataset.closeGo;
      closeSheet();
      if (label) toast(label);
    });
  });
}

$("[data-open='menu']").addEventListener("click", () => {
  openSheet(`
    <h3>Разделы</h3>
    <nav class="menu-list">
      <a href="#news" data-close-go>Что нового</a>
      <a href="#tasks" data-close-go>Задачи</a>
      <a href="#studio" data-close-go>Студия</a>
      <a href="#characters" data-close-go>Персонажи</a>
      <a href="#live" data-close-go>Живое общение</a>
      <a href="#memory" data-close-go>Память</a>
      <a href="#plus" data-close-go>Алиса Плюс</a>
      <a href="#places" data-close-go>Где живёт</a>
    </nav>`);
  bindSheet(sheetBody);
});

$$("[data-try]").forEach((node) => {
  node.addEventListener("click", () => {
    openSheet(`
      <h3>${node.dataset.try}</h3>
      <p>${node.dataset.tryText}</p>
      <button class="btn" type="button" data-close-go="Сценарий «${node.dataset.try}» открыт">Открыть в Алисе</button>`);
    bindSheet(sheetBody);
  });
});

$$("[data-more]").forEach((node) => {
  node.addEventListener("click", () => {
    const extra = node.parentElement.nextElementSibling;
    const open = extra.classList.toggle("open");
    node.setAttribute("aria-expanded", String(open));
  });
});

$$("[data-save]").forEach((node) => {
  node.addEventListener("click", () => {
    node.classList.toggle("on");
    toast(node.classList.contains("on") ? "Сохранено" : "Убрано из сохранённого");
  });
});

$$("[data-goto]").forEach((node) => {
  node.addEventListener("click", () => {
    document.querySelector(node.dataset.goto).scrollIntoView({ behavior: "smooth" });
    toast("Открыла раздел «Моя память»");
  });
});

$$("[data-check]").forEach((card) => {
  const input = card.querySelector("input");
  input.addEventListener("change", () => {
    card.classList.toggle("done", input.checked);
    toast(input.checked ? "Отмечено выполненным" : "Снова в списке");
  });
});

const scroller = $("[data-scroller]");
const dots = $("[data-dots]");
const cards = $$(".news-card", scroller);
cards.forEach((_, index) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.className = index === 0 ? "on" : "";
  dot.setAttribute("aria-label", `Карточка ${index + 1}`);
  dot.addEventListener("click", () => {
    cards[index].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  });
  dots.append(dot);
});
scroller.addEventListener("scroll", () => {
  const index = Math.round(scroller.scrollLeft / (cards[0].offsetWidth + 4));
  $$("button", dots).forEach((dot, i) => dot.classList.toggle("on", i === index));
}, { passive: true });

$$("[data-tabs]").forEach((bar) => {
  const name = bar.dataset.tabs;
  renderPhone(name, bar.querySelector(".on").dataset.tab);
  $$("button", bar).forEach((button) => {
    button.addEventListener("click", () => {
      $$("button", bar).forEach((item) => item.classList.toggle("on", item === button));
      renderPhone(name, button.dataset.tab);
    });
  });
});

function openCharacter(node) {
  const name = node.dataset.character;
  const line = node.dataset.line;
  openSheet(`
    <h3>${name}</h3>
    <div class="chat-log" data-log>
      <p>${line}</p>
    </div>
    <form class="ask">
      <input name="text" placeholder="Написать персонажу" required>
      <button class="btn" type="submit">→</button>
    </form>`);
  const form = sheetBody.querySelector("form");
  const log = sheetBody.querySelector("[data-log]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = new FormData(form).get("text").toString().trim();
    if (!text) return;
    log.insertAdjacentHTML("beforeend", `<p class="me">${escapeHtml(text)}</p><p>Слышу. Давай ещё чуть конкретнее — и я отвечу по-своему.</p>`);
    form.reset();
    log.lastElementChild.scrollIntoView({ block: "nearest" });
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

$$("[data-character]").forEach((node) => {
  node.addEventListener("click", () => openCharacter(node));
});

$$("[data-chip]").forEach((chip) => {
  chip.addEventListener("click", () => {
    $$("[data-chip]").forEach((item) => item.classList.toggle("on", item === chip));
    const tag = chip.dataset.chip;
    $$("[data-filter-row] button").forEach((card) => {
      const show = tag === "all" || card.dataset.tag === tag;
      card.classList.toggle("is-hidden", !show);
    });
  });
});

const catalog = $("[data-filter-row='catalog']");
const catalogOrder = $$("button", catalog);
$$("[data-sort]").forEach((button) => {
  button.addEventListener("click", () => {
    $$("[data-sort]").forEach((item) => item.classList.toggle("on", item === button));
    const items = button.dataset.sort === "fresh" ? [...catalogOrder].reverse() : catalogOrder;
    items.forEach((item) => catalog.append(item));
  });
});

$("[data-open='recents']").addEventListener("click", () => {
  openSheet(`<h3>Недавние чаты</h3><div class="menu-list" data-list></div>`);
  const list = sheetBody.querySelector("[data-list]");
  $$("[data-filter-row='recent'] button").forEach((card) => {
    const choice = document.createElement("button");
    choice.type = "button";
    choice.className = "choice";
    choice.textContent = card.dataset.character;
    choice.addEventListener("click", () => openCharacter(card));
    list.append(choice);
  });
});

$("[data-open='search']").addEventListener("click", () => {
  openSheet(`
    <h3>Поиск персонажа</h3>
    <form class="ask">
      <input name="q" placeholder="Имя или настроение" required>
      <button class="btn" type="submit">Найти</button>
    </form>
    <div class="menu-list" data-found></div>`);
  const form = sheetBody.querySelector("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = new FormData(form).get("q").toString().trim().toLowerCase();
    const found = sheetBody.querySelector("[data-found]");
    found.innerHTML = "";
    const matches = $$("[data-character]").filter((card) => card.dataset.character.toLowerCase().includes(query));
    if (!matches.length) {
      found.innerHTML = "<p>Такого персонажа нет — можно создать своего.</p>";
      return;
    }
    matches.forEach((card) => {
      const choice = document.createElement("button");
      choice.type = "button";
      choice.className = "choice";
      choice.textContent = card.dataset.character;
      choice.addEventListener("click", () => openCharacter(card));
      found.append(choice);
    });
  });
});

$("[data-open='genres']").addEventListener("click", () => {
  openSheet(`<h3>Все ролплеи</h3><div class="menu-list" data-list></div>`);
  const list = sheetBody.querySelector("[data-list]");
  ["Все", "Аниме", "Фентези", "Романтика", "История"].forEach((label) => {
    const choice = document.createElement("button");
    choice.type = "button";
    choice.className = "choice";
    choice.textContent = label;
    choice.addEventListener("click", () => {
      const chip = $(`[data-chip="${label === "Все" ? "all" : label.toLowerCase()}"]`);
      chip.click();
      closeSheet();
    });
    list.append(choice);
  });
});

$("[data-open='tools']").addEventListener("click", () => {
  openSheet(`
    <h3>Инструменты</h3>
    <div class="menu-list">
      <button class="choice" type="button" data-close-go="Открыла цены">Цены и рубли</button>
      <button class="choice" type="button" data-close-go="Открыла рисование">Рисунок</button>
      <button class="choice" type="button" data-close-go="Открыла заботу">Забота</button>
      <button class="choice" type="button" data-close-go="Открыла места">Рестораны</button>
    </div>`);
  bindSheet(sheetBody);
});

$$("[data-place]").forEach((node) => {
  node.addEventListener("click", (event) => {
    if (event.target.closest("[data-download]")) {
      event.stopPropagation();
      toast("Ссылка на приложение готова");
      return;
    }
    openSheet(`
      <h3>${node.dataset.place}</h3>
      <p>${node.dataset.placeText}</p>
      <button class="btn" type="button" data-close-go="Переход: ${node.dataset.place}">Перейти</button>`);
    bindSheet(sheetBody);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !sheet.hidden) closeSheet();
});

const topbar = $(".topbar");
document.addEventListener("scroll", () => {
  topbar.classList.toggle("stuck", window.scrollY > 24);
}, { passive: true });
