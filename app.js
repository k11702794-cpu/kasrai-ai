const TOOLS = {
  rewrite: {
    title: 'بازنویسی متن',
    placeholder: 'متنت را اینجا وارد کن؛ مثلاً یک پیام یا پاراگراف...'
  },
  summary: {
    title: 'خلاصه‌ساز',
    placeholder: 'متن طولانی را اینجا وارد کن...'
  },
  translate: {
    title: 'مترجم',
    placeholder: 'متن فارسی یا انگلیسی را وارد کن...'
  },
  ideas: {
    title: 'ایده‌پرداز',
    placeholder: 'موضوع، پروژه یا حوزه‌ای که برایش ایده می‌خواهی...'
  },
  study: {
    title: 'کمک‌درسی',
    placeholder: 'موضوع درسی یا صورت سؤال را وارد کن...'
  }
};

const LIMIT = 5;

const state = {
  tool: localStorage.getItem('kasrai_tool') || 'rewrite',
  uses: Number(localStorage.getItem('kasrai_uses_v2') || 0),
  day: localStorage.getItem('kasrai_day') || '',
  history: JSON.parse(localStorage.getItem('kasrai_history') || '[]')
};

const $ = selector => document.querySelector(selector);

const fa = number =>
  String(number).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

function today() {
  return new Date().toISOString().slice(0, 10);
}

if (state.day !== today()) {
  state.day = today();
  state.uses = 0;
  localStorage.setItem('kasrai_day', state.day);
  localStorage.setItem('kasrai_uses_v2', '0');
}

function refresh() {
  if ($('#counter')) {
    $('#counter').textContent =
      `استفاده رایگان امروز: ${fa(state.uses)} از ${fa(LIMIT)}`;
  }

  if ($('#planPill')) {
    $('#planPill').textContent = 'پلن: رایگان';
  }

  if ($('#historyCount')) {
    $('#historyCount').textContent = fa(state.history.length);
  }
}

function setTool(tool) {
  if (!TOOLS[tool]) tool = 'rewrite';

  state.tool = tool;
  localStorage.setItem('kasrai_tool', tool);

  document.querySelectorAll('.tool-card').forEach(card => {
    card.classList.toggle(
      'active',
      card.dataset.tool === tool
    );
  });

  if ($('#toolTitle')) {
    $('#toolTitle').textContent = TOOLS[tool].title;
  }

  if ($('#inputText')) {
    $('#inputText').placeholder = TOOLS[tool].placeholder;
  }
}

function clean(text) {
  return String(text)
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text) {
  return (
    text
      .match(/[^.!?؟\n]+[.!?؟]?/g)
      ?.map(clean)
      .filter(Boolean) || [clean(text)]
  );
}

/* -------------------------
   بازنویسی
------------------------- */

function rewriteText(text) {
  let result = clean(text);

  const replacements = [
    ['خیلی خوب', 'بسیار خوب'],
    ['خیلی زیاد', 'بیش از حد'],
    ['میخوام', 'می‌خواهم'],
    ['میخواد', 'می‌خواهد'],
    ['میشه', 'می‌شود'],
    ['نمیشه', 'نمی‌شود'],
    ['میتونم', 'می‌توانم'],
    ['میتونی', 'می‌توانی'],
    ['بخاطر', 'به‌خاطر'],
    ['اگه', 'اگر'],
    ['ولی', 'اما'],
    ['واسه', 'برای'],
    ['یه', 'یک'],
    ['چونکه', 'زیرا'],
    ['حتما', 'حتماً'],
    ['واقعا', 'واقعاً']
  ];

  replacements.forEach(([from, to]) => {
    result = result.split(from).join(to);
  });

  return `نسخه بازنویسی‌شده:

${result}

نکته: متن برای خوانایی، روانی و لحن حرفه‌ای‌تر تنظیم شد.`;
}

/* -------------------------
   خلاصه‌ساز
------------------------- */

function summarizeText(text) {
  const sentences = splitSentences(text);

  if (sentences.length <= 2 && text.length < 180) {
    return `خلاصه:

${text}`;
  }

  const max = Math.max(
    2,
    Math.min(4, Math.ceil(sentences.length * 0.4))
  );

  const selected = sentences.slice(0, max);

  return `خلاصه:

${selected.join(' ')}

تعداد جملات اصلی: ${fa(sentences.length)}
جملات انتخاب‌شده برای خلاصه: ${fa(selected.length)}`;
}

/* -------------------------
   مترجم آفلاین
------------------------- */

function translateText(text) {
  const dictionary = {
    'سلام': 'Hello',
    'خوبی': 'How are you?',
    'ممنون': 'Thank you',
    'مرسی': 'Thanks',
    'خداحافظ': 'Goodbye',
    'دوست': 'friend',
    'دوست من': 'my friend',
    'مدرسه': 'school',
    'دانشگاه': 'university',
    'کتاب': 'book',
    'درس': 'lesson',
    'معلم': 'teacher',
    'دانش‌آموز': 'student',
    'سایت': 'website',
    'هوش مصنوعی': 'artificial intelligence',
    'کامپیوتر': 'computer',
    'برنامه': 'program',
    'پروژه': 'project',
    'ایده': 'idea',
    'کسری': 'Kasrai',
    'امروز': 'today',
    'فردا': 'tomorrow',
    'خوب': 'good',
    'بد': 'bad',
    'بله': 'yes',
    'نه': 'no',
    'لطفا': 'please',
    'لطفاً': 'please',
    'من': 'I',
    'تو': 'you',
    'ما': 'we',
    'آنها': 'they'
  };

  let output = text;

  Object.keys(dictionary)
    .sort((a, b) => b.length - a.length)
    .forEach(key => {
      output = output.split(key).join(dictionary[key]);
    });

  return `ترجمه آزمایشی:

${output}

مترجم فعلی آفلاین است و برای عبارت‌های ساده طراحی شده است.`;
}

/* -------------------------
   ایده‌پرداز
------------------------- */

function generateIdeas(text) {
  const topic = clean(text);

  return `ایده برای «${topic}»:

۱. یک ابزار رایگان و ساده مرتبط با این موضوع بساز.

۲. یک آموزش کوتاه و مرحله‌به‌مرحله برای کاربران قرار بده.

۳. یک صفحه نمونه یا دمو بساز تا کاربر قبل از استفاده نتیجه را ببیند.

۴. پرسش‌های پرتکرار کاربران را جمع‌آوری و در بخش FAQ قرار بده.

۵. امکان ذخیره و مشاهده نتایج قبلی را اضافه کن.

۶. یک قابلیت اشتراک‌گذاری نتیجه برای دوستان ایجاد کن.

۷. از کاربران بازخورد بگیر و بر اساس درخواست‌های واقعی، قابلیت‌های بعدی را اضافه کن.`;
}

/* -------------------------
   کمک‌درسی
------------------------- */

function studyHelp(text) {
  const topic = clean(text);

  return `راهنمای کمک‌درسی برای:

«${topic}»

۱. ابتدا صورت سؤال یا مفهوم اصلی را مشخص کن.

۲. اطلاعاتی که سؤال به تو داده جدا کن.

۳. فرمول، قانون یا مفهوم مرتبط را پیدا کن.

۴. مسئله را مرحله‌به‌مرحله حل کن.

۵. جواب نهایی را با صورت سؤال مقایسه کن.

اگر سؤال عددی باشد، بهتر است مراحل محاسبه هم بررسی شوند تا اشتباه احتمالی پیدا شود.`;
}

/* -------------------------
   موتور اصلی کسری
------------------------- */

function localAI(tool, input) {
  const text = clean(input);

  if (!text) {
    return 'لطفاً ابتدا متن یا موضوعت را وارد کن.';
  }

  switch (tool) {
    case 'rewrite':
      return rewriteText(text);

    case 'summary':
      return summarizeText(text);

    case 'translate':
      return translateText(text);

    case 'ideas':
      return generateIdeas(text);

    case 'study':
      return studyHelp(text);

    default:
      return rewriteText(text);
  }
}

/* -------------------------
   تاریخچه
------------------------- */

function renderHistory() {
  const box = $('#history');

  if (!box) return;

  box.innerHTML = '';

  if (!state.history.length) {
    box.innerHTML =
      '<div class="empty">هنوز سابقه‌ای ثبت نشده.</div>';
    return;
  }

  state.history.slice(0, 8).forEach(item => {
    const button = document.createElement('button');

    button.className = 'history-item';

    const title =
      TOOLS[item.tool]?.title || item.tool;

    const shortText =
      item.input.length > 70
        ? item.input.slice(0, 70) + '…'
        : item.input;

    button.innerHTML = `
      <b>${title}</b>
      <small>${shortText}</small>
    `;

    button.addEventListener('click', () => {
      if ($('#inputText')) {
        $('#inputText').value = item.input;
      }

      if ($('#output')) {
        $('#output').textContent = item.output;
      }

      setTool(item.tool);
    });

    box.appendChild(button);
  });
}

function saveHistory(input, output) {
  state.history.unshift({
    tool: state.tool,
    input,
    output,
    at: Date.now()
  });

  state.history = state.history.slice(0, 20);

  localStorage.setItem(
    'kasrai_history',
    JSON.stringify(state.history)
  );

  renderHistory();
  refresh();
}

/* -------------------------
   ابزارها
------------------------- */

document.querySelectorAll('.tool-card').forEach(card => {
  card.addEventListener('click', () => {
    setTool(card.dataset.tool);
  });
});

/* -------------------------
   دکمه اجرا
------------------------- */

if ($('#runBtn')) {
  $('#runBtn').addEventListener('click', () => {
    const input = $('#inputText')?.value.trim();

    if (!input) {
      if ($('#output')) {
        $('#output').textContent =
          'اول متن یا موضوعت را وارد کن.';
      }
      return;
    }

    if (state.uses >= LIMIT) {
      if ($('#output')) {
        $('#output').textContent =
          'سقف استفاده رایگان امروز پر شده است. فردا دوباره ۵ استفاده رایگان داری.';
      }
      return;
    }

    $('#runBtn').disabled = true;
    $('#runBtn').textContent = 'در حال آماده‌سازی...';

    setTimeout(() => {
      const result = localAI(
        state.tool,
        input
      );

      if ($('#output')) {
        $('#output').textContent = result;
      }

      state.uses++;

      localStorage.setItem(
        'kasrai_uses_v2',
        state.uses
      );

      saveHistory(input, result);
      refresh();

      $('#runBtn').disabled = false;
      $('#runBtn').textContent = '✨ اجرا';
    }, 400);
  });
}

/* -------------------------
   پاک کردن متن
------------------------- */

if ($('#clearBtn')) {
  $('#clearBtn').addEventListener('click', () => {
    if ($('#inputText')) {
      $('#inputText').value = '';
    }

    if ($('#output')) {
      $('#output').textContent =
        'نتیجه اینجا نمایش داده می‌شود.';
    }
  });
}

/* -------------------------
   پاک کردن تاریخچه
------------------------- */

if ($('#clearHistory')) {
  $('#clearHistory').addEventListener('click', () => {
    state.history = [];

    localStorage.removeItem('kasrai_history');

    renderHistory();
    refresh();
  });
}

/* -------------------------
   ورود
------------------------- */

if ($('#loginBtn')) {
  $('#loginBtn').addEventListener('click', () => {
    alert(
      'سیستم ورود هنوز به بک‌اند متصل نشده است. این بخش را می‌توانیم در مرحله بعد فعال کنیم.'
    );
  });
}

/* -------------------------
   ارتقا / پلن
------------------------- */

if ($('#upgradeBtn')) {
  $('#upgradeBtn').addEventListener('click', () => {
    alert(
      'سیستم پرداخت هنوز فعال نشده است. بعداً می‌توانیم پلن‌های پولی را به یک سیستم پرداخت امن متصل کنیم.'
    );
  });
}

/* -------------------------
   سال
------------------------- */

if ($('#year')) {
  $('#year').textContent =
    new Date().getFullYear();
}

/* -------------------------
   شروع برنامه
------------------------- */

setTool(state.tool);
renderHistory();
refresh();
