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
const HISTORY_LIMIT = 30;

const state = {
  tool: localStorage.getItem('kasrai_tool') || 'rewrite',
  uses: Number(localStorage.getItem('kasrai_uses_v2') || 0),
  day: localStorage.getItem('kasrai_day') || '',
  history: JSON.parse(localStorage.getItem('kasrai_history') || '[]'),
  lastInput: '',
  lastOutput: ''
};

const $ = selector => document.querySelector(selector);

function fa(number) {
  return String(number).replace(
    /\d/g,
    d => '۰۱۲۳۴۵۶۷۸۹'[d]
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function clean(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentences(text) {
  return (
    clean(text)
      .match(/[^.!?؟\n]+[.!?؟]?/g)
      ?.map(clean)
      .filter(Boolean) || []
  );
}

/* -------------------------
   روز جدید
------------------------- */

if (state.day !== today()) {
  state.day = today();
  state.uses = 0;

  localStorage.setItem('kasrai_day', state.day);
  localStorage.setItem('kasrai_uses_v2', '0');
}

/* -------------------------
   رابط کاربری
------------------------- */

function refresh() {
  if ($('#counter')) {
    $('#counter').textContent =
      `استفاده رایگان امروز: ${fa(state.uses)} از ${fa(LIMIT)}`;
  }

  if ($('#planPill')) {
    $('#planPill').textContent = 'پلن: رایگان';
  }

  if ($('#historyCount')) {
    $('#historyCount').textContent =
      fa(state.history.length);
  }
}

function setTool(tool) {
  if (!TOOLS[tool]) {
    tool = 'rewrite';
  }

  state.tool = tool;

  localStorage.setItem(
    'kasrai_tool',
    tool
  );

  document.querySelectorAll('.tool-card').forEach(card => {
    card.classList.toggle(
      'active',
      card.dataset.tool === tool
    );
  });

  if ($('#toolTitle')) {
    $('#toolTitle').textContent =
      TOOLS[tool].title;
  }

  if ($('#inputText')) {
    $('#inputText').placeholder =
      TOOLS[tool].placeholder;
  }
}

function showResult(text) {
  if ($('#output')) {
    $('#output').textContent = text;
  }

  state.lastOutput = text;
}

function showMessage(text) {
  if ($('#output')) {
    $('#output').textContent = text;
  }
}

/* -------------------------
   بازنویسی حرفه‌ای
------------------------- */

function rewriteText(text) {
  let result = clean(text);

  const replacements = [
    ['میخوام', 'می‌خواهم'],
    ['میخواد', 'می‌خواهد'],
    ['میشه', 'می‌شود'],
    ['نمیشه', 'نمی‌شود'],
    ['میتونم', 'می‌توانم'],
    ['میتونی', 'می‌توانی'],
    ['میخوام', 'می‌خواهم'],
    ['بخاطر', 'به‌خاطر'],
    ['واسه', 'برای'],
    ['یه', 'یک'],
    ['اگه', 'اگر'],
    ['ولی', 'اما'],
    ['حتما', 'حتماً'],
    ['واقعا', 'واقعاً'],
    ['خیلی خوب', 'بسیار خوب']
  ];

  replacements.forEach(([a, b]) => {
    result = result.split(a).join(b);
  });

  result = result.charAt(0).toUpperCase() + result.slice(1);

  return `نسخه حرفه‌ای بازنویسی‌شده:

${result}

✓ متن روان‌تر و مرتب‌تر شد.
✓ عبارت‌های محاوره‌ای اصلاح شدند.
✓ ساختار متن حفظ شد.`;
}

/* -------------------------
   خلاصه‌ساز حرفه‌ای
------------------------- */

function summarizeText(text) {
  const list = sentences(text);

  if (!list.length) {
    return 'متنی برای خلاصه‌سازی پیدا نشد.';
  }

  if (list.length <= 2 && text.length < 180) {
    return `خلاصه:

${text}

نکات کلیدی:
• متن کوتاه است و نیاز به خلاصه‌سازی بیشتر ندارد.`;
  }

  const count = Math.max(
    2,
    Math.min(4, Math.ceil(list.length * 0.4))
  );

  const selected = list.slice(0, count);

  return `خلاصه:

${selected.join(' ')}

نکات کلیدی:
${selected.map(x => `• ${x}`).join('\n')}`;
}

/* -------------------------
   مترجم آفلاین
------------------------- */

const dictionary = {
  'سلام': 'Hello',
  'خوبی': 'How are you?',
  'ممنون': 'Thank you',
  'مرسی': 'Thanks',
  'خداحافظ': 'Goodbye',
  'لطفاً': 'Please',
  'لطفا': 'Please',
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
  'امروز': 'today',
  'فردا': 'tomorrow',
  'دیروز': 'yesterday',
  'خوب': 'good',
  'بد': 'bad',
  'بله': 'yes',
  'نه': 'no',
  'من': 'I',
  'تو': 'you',
  'ما': 'we',
  'آنها': 'they',
  'خانه': 'home',
  'کار': 'work',
  'زمان': 'time',
  'روز': 'day',
  'شب': 'night',
  'صبح': 'morning',
  'زندگی': 'life',
  'موفقیت': 'success',
  'کمک': 'help',
  'آموزش': 'education',
  'رایگان': 'free',
  'کسری': 'Kasrai'
};

function translateText(text) {
  let result = clean(text);

  Object.keys(dictionary)
    .sort((a, b) => b.length - a.length)
    .forEach(word => {
      result = result.split(word)
        .join(dictionary[word]);
    });

  return `ترجمه آزمایشی فارسی → انگلیسی:

${result}

نکته:
این نسخه بدون API کار می‌کند و برای عبارت‌ها و واژه‌های پایه طراحی شده است.`;
}

/* -------------------------
   ایده‌پرداز حرفه‌ای
------------------------- */

function generateIdeas(text) {
  const topic = clean(text);

  return `ایده‌های حرفه‌ای برای «${topic}»:

💡 ایده ۱
ساخت یک ابزار رایگان و سریع مرتبط با موضوع.

💡 ایده ۲
ساخت آموزش مرحله‌به‌مرحله برای کاربران تازه‌کار.

💡 ایده ۳
ساخت صفحه نمونه یا دمو برای نمایش نتیجه قبل از استفاده.

💡 ایده ۴
ایجاد بخش پرسش‌های متداول کاربران.

💡 ایده ۵
اضافه‌کردن امکان ذخیره و مشاهده نتایج قبلی.

💡 ایده ۶
ساخت قابلیت اشتراک‌گذاری نتیجه.

💡 ایده ۷
گرفتن بازخورد از کاربران و اضافه‌کردن قابلیت‌های محبوب.

🚀 پیشنهاد کسری:
ابتدا ساده‌ترین ایده را اجرا کن و بعد بر اساس بازخورد کاربران توسعه بده.`;
}

/* -------------------------
   کمک‌درسی
------------------------- */

function studyHelp(text) {
  const topic = clean(text);

  return `کمک‌درسی برای:

«${topic}»

📚 روش پیشنهادی:

۱. صورت سؤال یا مفهوم اصلی را مشخص کن.

۲. اطلاعات داده‌شده را جدا کن.

۳. فرمول، قانون یا مفهوم مرتبط را پیدا کن.

۴. مسئله را مرحله‌به‌مرحله بررسی کن.

۵. محاسبات را انجام بده.

۶. جواب نهایی را با صورت سؤال مقایسه کن.

⭐ نکته:
اگر سؤال ریاضی، فیزیک، شیمی یا درس دیگری داری، صورت کامل سؤال را وارد کن تا بتوانیم مرحله‌به‌مرحله بررسی‌اش کنیم.`;
}

/* -------------------------
   موتور کسری AI
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

  state.history
    .slice(0, 8)
    .forEach(item => {
      const button =
        document.createElement('button');

      button.className =
        'history-item';

      const title =
        TOOLS[item.tool]?.title ||
        item.tool;

      const preview =
        item.input.length > 70
          ? item.input.slice(0, 70) + '…'
          : item.input;

      button.innerHTML = `
        <b>${title}</b>
        <small>${preview}</small>
      `;

      button.addEventListener('click', () => {
        setTool(item.tool);

        if ($('#inputText')) {
          $('#inputText').value =
            item.input;
        }

        showResult(item.output);
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

  state.history =
    state.history.slice(0, HISTORY_LIMIT);

  localStorage.setItem(
    'kasrai_history',
    JSON.stringify(state.history)
  );

  renderHistory();
  refresh();
}

/* -------------------------
   انتخاب ابزار
------------------------- */

document
  .querySelectorAll('.tool-card')
  .forEach(card => {
    card.addEventListener('click', () => {
      setTool(card.dataset.tool);

      if ($('#output')) {
        $('#output').textContent =
          'نتیجه اینجا نمایش داده می‌شود.';
      }
    });
  });

/* -------------------------
   اجرا
------------------------- */

if ($('#runBtn')) {
  $('#runBtn').addEventListener(
    'click',
    () => {
      const input =
        $('#inputText')?.value.trim();

      if (!input) {
        showMessage(
          'اول متن یا موضوعت را وارد کن.'
        );
        return;
      }

      if (state.uses >= LIMIT) {
        showMessage(
          'سقف استفاده رایگان امروز پر شده است. فردا دوباره ۵ استفاده رایگان داری.'
        );
        return;
      }

      state.lastInput = input;

      $('#runBtn').disabled = true;
      $('#runBtn').textContent =
        'در حال آماده‌سازی...';

      setTimeout(() => {
        const result =
          localAI(state.tool, input);

        showResult(result);

        state.uses++;

        localStorage.setItem(
          'kasrai_uses_v2',
          state.uses
        );

        saveHistory(
          input,
          result
        );

        refresh();

        $('#runBtn').disabled = false;
        $('#runBtn').textContent =
          '✨ اجرا';
      }, 400);
    }
  );
}

/* -------------------------
   پاک کردن
------------------------- */

if ($('#clearBtn')) {
  $('#clearBtn').addEventListener(
    'click',
    () => {
      if ($('#inputText')) {
        $('#inputText').value = '';
      }

      showMessage(
        'نتیجه اینجا نمایش داده می‌شود.'
      );

      state.lastInput = '';
      state.lastOutput = '';
    }
  );
}

/* -------------------------
   پاک کردن تاریخچه
------------------------- */

if ($('#clearHistory')) {
  $('#clearHistory').addEventListener(
    'click',
    () => {
      state.history = [];

      localStorage.removeItem(
        'kasrai_history'
      );

      renderHistory();
      refresh();
    }
  );
}

/* -------------------------
   ورود
------------------------- */

if ($('#loginBtn')) {
  $('#loginBtn').addEventListener(
    'click',
    () => {
      alert(
        'ورود کاربران هنوز به بک‌اند متصل نشده است.'
      );
    }
  );
}

/* -------------------------
   ارتقای پلن
------------------------- */

if ($('#upgradeBtn')) {
  $('#upgradeBtn').addEventListener(
    'click',
    () => {
      alert(
        'سیستم پرداخت هنوز فعال نشده است. بعداً می‌توانیم پلن‌های حرفه‌ای را اضافه کنیم.'
      );
    }
  );
}

/* -------------------------
   سال
------------------------- */

if ($('#year')) {
  $('#year').textContent =
    new Date().getFullYear();
}

/* -------------------------
   شروع
------------------------- */

setTool(state.tool);
renderHistory();
refresh();
