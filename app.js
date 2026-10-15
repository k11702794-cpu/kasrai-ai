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

/* =========================================
   KASRAI AI — BILINGUAL APP
   فارسی / English
========================================= */

const TRANSLATIONS = {
  fa: {
    direction: 'rtl',
    button: 'English',
    title: 'کسری AI | ابزارهای هوشمند',

    brand: 'کسری AI',
    navTools: 'ابزارها',
    navWorkspace: 'آزمایشگاه',
    navPricing: 'Pro',
    login: 'ورود',

    badge: '✨ دستیار هوشمند فارسی',
    heroLine1: 'کارهای روزمره‌ات را',
    heroLine2: 'سریع‌تر و ساده‌تر',
    heroLine3: 'انجام بده.',
    heroDescription: 'ابزارهای کاربردی برای نوشتن، خلاصه‌سازی، ترجمه، ایده‌پردازی و مطالعه.',
    startFree: 'شروع رایگان',
    viewPro: 'مشاهده Pro',

    statTools: '۵',
    statToolsLabel: 'ابزار کاربردی',
    statOffline: 'آفلاین',
    statOfflineLabel: 'برای قابلیت‌های پایه',
    statFree: 'رایگان',
    statFreeLabel: 'شروع کار',

    toolsEyebrow: 'ابزارها',
    toolsHeading: 'ابزار مورد نیازت را انتخاب کن',

    toolRewrite: 'بازنویسی',
    toolRewriteDesc: 'متن را روان‌تر کن',
    toolSummary: 'خلاصه‌ساز',
    toolSummaryDesc: 'متن را کوتاه کن',
    toolTranslate: 'مترجم',
    toolTranslateDesc: 'ترجمه پایه فارسی و انگلیسی',
    toolIdeas: 'ایده‌پرداز',
    toolIdeasDesc: 'برای پروژه و محتوا ایده بگیر',
    toolStudy: 'کمک‌درسی',
    toolStudyDesc: 'مطالب را مرحله‌ای مرور کن',

    planFree: 'پلن: رایگان',
    workspaceEyebrow: 'آزمایشگاه کسری',
    inputLabel: 'متن ورودی',
    resultLabel: 'نتیجه',
    resultPlaceholder: 'نتیجه اینجا نمایش داده می‌شود.',
    clear: 'پاک کردن',
    run: '✨ اجرا',
    running: 'در حال آماده‌سازی...',
    apiNote: 'این نسخه برای تست طراحی شده است. ابزارهای پایه در مرورگر اجرا می‌شوند و برای پاسخ‌های هوشمند واقعی، بعداً می‌توان بک‌اند امن اضافه کرد.',

    historyEyebrow: 'تاریخچه',
    historyHeading: 'آخرین استفاده‌ها',
    clearHistory: 'پاک کردن تاریخچه',
    noHistory: 'هنوز سابقه‌ای ثبت نشده.',

    pricingEyebrow: 'نسخه آینده',
    pricingHeading: 'رایگان شروع کن، امکانات بیشتر در Pro',
    freePlan: 'رایگان',
    freePrice: '۰',
    currency: 'تومان',
    freeFeature1: '۵ استفاده در روز',
    freeFeature2: '۵ ابزار اصلی',
    freeFeature3: 'تاریخچه روی دستگاه',
    currentPlan: 'پلن فعلی',
    comingSoon: 'در حال آماده‌سازی',
    soon: 'به‌زودی',
    proFeature1: 'استفاده بیشتر',
    proFeature2: 'پاسخ‌های هوشمندتر',
    proFeature3: 'حساب کاربری و همگام‌سازی',
    proFeature4: 'امکانات حرفه‌ای',
    remindMe: 'به من یادآوری کن',

    aboutHeading: 'نسخه پایه آماده تست است',
    aboutDescription: 'فعلاً تمرکز روی ساخت تجربه‌ای ساده و سریع است. بعد از گرفتن بازخورد، می‌توانیم امکانات بیشتری اضافه کنیم.',
    footerText: 'نسخه آزمایشی 🚀',

    toolTitles: {
      rewrite: 'بازنویسی متن',
      summary: 'خلاصه‌ساز',
      translate: 'مترجم',
      ideas: 'ایده‌پرداز',
      study: 'کمک‌درسی'
    },

    placeholders: {
      rewrite: 'متنت را اینجا وارد کن؛ مثلاً یک پیام یا پاراگراف...',
      summary: 'متن طولانی را اینجا وارد کن...',
      translate: 'متن فارسی یا انگلیسی را وارد کن...',
      ideas: 'موضوع، پروژه یا حوزه‌ای که برایش ایده می‌خواهی...',
      study: 'موضوع درسی یا صورت سؤال را وارد کن...'
    },

    counter: n => `استفاده رایگان امروز: ${n} از ۵`,
    emptyInput: 'لطفاً ابتدا متن یا موضوعت را وارد کن.',
    limitReached: 'سقف استفاده رایگان امروز پر شده است. فردا دوباره ۵ استفاده رایگان داری.',
    loginMessage: 'ورود کاربران هنوز به بک‌اند متصل نشده است.',
    upgradeMessage: 'سیستم پرداخت هنوز فعال نشده است. بعداً می‌توانیم پلن‌های حرفه‌ای را اضافه کنیم.',

    rewriteHeading: 'نسخه حرفه‌ای بازنویسی‌شده:',
    rewriteNote1: '✓ متن روان‌تر و مرتب‌تر شد.',
    rewriteNote2: '✓ عبارت‌های محاوره‌ای اصلاح شدند.',
    rewriteNote3: '✓ ساختار متن حفظ شد.',
    summaryHeading: 'خلاصه:',
    summaryShort: '• متن کوتاه است و نیاز به خلاصه‌سازی بیشتر ندارد.',
    keyPoints: 'نکات کلیدی:',
    noSummaryText: 'متنی برای خلاصه‌سازی پیدا نشد.',
    translateHeading: 'ترجمه آزمایشی فارسی → انگلیسی:',
    translateNote: 'این نسخه بدون API کار می‌کند و برای عبارت‌ها و واژه‌های پایه طراحی شده است.',
    ideasHeading: 'ایده‌های حرفه‌ای برای',
    idea1: 'ساخت یک ابزار رایگان و سریع مرتبط با موضوع.',
    idea2: 'ساخت آموزش مرحله‌به‌مرحله برای کاربران تازه‌کار.',
    idea3: 'ساخت صفحه نمونه یا دمو برای نمایش نتیجه قبل از استفاده.',
    idea4: 'ایجاد بخش پرسش‌های متداول کاربران.',
    idea5: 'اضافه‌کردن امکان ذخیره و مشاهده نتایج قبلی.',
    idea6: 'ساخت قابلیت اشتراک‌گذاری نتیجه.',
    idea7: 'گرفتن بازخورد از کاربران و اضافه‌کردن قابلیت‌های محبوب.',
    kasraiSuggestion: 'پیشنهاد کسری:',
    ideaAdvice: 'ابتدا ساده‌ترین ایده را اجرا کن و بعد بر اساس بازخورد کاربران توسعه بده.',
    studyHeading: 'کمک‌درسی برای:',
    studyMethod: 'روش پیشنهادی:',
    study1: 'صورت سؤال یا مفهوم اصلی را مشخص کن.',
    study2: 'اطلاعات داده‌شده را جدا کن.',
    study3: 'فرمول، قانون یا مفهوم مرتبط را پیدا کن.',
    study4: 'مسئله را مرحله‌به‌مرحله بررسی کن.',
    study5: 'محاسبات را انجام بده.',
    study6: 'جواب نهایی را با صورت سؤال مقایسه کن.',
    studyTip: 'نکته:',
    studyAdvice: 'اگر سؤال ریاضی، فیزیک، شیمی یا درس دیگری داری، صورت کامل سؤال را وارد کن تا بتوانیم مرحله‌به‌مرحله بررسی‌اش کنیم.',
    defaultResult: 'نتیجه اینجا نمایش داده می‌شود.'
  },

  en: {
    direction: 'ltr',
    button: 'فارسی',
    title: 'Kasrai AI | Smart Tools',

    brand: 'Kasrai AI',
    navTools: 'Tools',
    navWorkspace: 'Workspace',
    navPricing: 'Pro',
    login: 'Log in',

    badge: '✨ Your smart assistant',
    heroLine1: 'Make everyday tasks',
    heroLine2: 'faster and easier',
    heroLine3: 'with AI.',
    heroDescription: 'Useful tools for writing, summarizing, translating, brainstorming, and studying.',
    startFree: 'Get Started Free',
    viewPro: 'Explore Pro',

    statTools: '5',
    statToolsLabel: 'Useful tools',
    statOffline: 'Offline',
    statOfflineLabel: 'For basic features',
    statFree: 'Free',
    statFreeLabel: 'Get started',

    toolsEyebrow: 'TOOLS',
    toolsHeading: 'Choose the tool you need',

    toolRewrite: 'Rewrite',
    toolRewriteDesc: 'Make text clearer',
    toolSummary: 'Summarizer',
    toolSummaryDesc: 'Shorten your text',
    toolTranslate: 'Translator',
    toolTranslateDesc: 'Basic Persian-English translation',
    toolIdeas: 'Idea Generator',
    toolIdeasDesc: 'Get ideas for projects and content',
    toolStudy: 'Study Helper',
    toolStudyDesc: 'Review topics step by step',

    planFree: 'Plan: Free',
    workspaceEyebrow: 'Kasrai Lab',
    inputLabel: 'Input text',
    resultLabel: 'Result',
    resultPlaceholder: 'Your result will appear here.',
    clear: 'Clear',
    run: '✨ Run',
    running: 'Working...',
    apiNote: 'This version is designed for testing. Basic tools run in your browser. A secure backend can be added later for real AI responses.',

    historyEyebrow: 'HISTORY',
    historyHeading: 'Recent activity',
    clearHistory: 'Clear history',
    noHistory: 'No history yet.',

    pricingEyebrow: 'COMING SOON',
    pricingHeading: 'Start free, get more with Pro',
    freePlan: 'Free',
    freePrice: '0',
    currency: 'Toman',
    freeFeature1: '5 uses per day',
    freeFeature2: '5 basic tools',
    freeFeature3: 'Local history',
    currentPlan: 'Current plan',
    comingSoon: 'Coming soon',
    soon: 'Coming soon',
    proFeature1: 'More usage',
    proFeature2: 'Smarter responses',
    proFeature3: 'Account and synchronization',
    proFeature4: 'Professional features',
    remindMe: 'Notify me',

    aboutHeading: 'The basic version is ready to test',
    aboutDescription: 'We are focusing on a simple, fast experience. More features can be added based on feedback.',
    footerText: 'Beta version 🚀',

    toolTitles: {
      rewrite: 'Rewrite Text',
      summary: 'Summarizer',
      translate: 'Translator',
      ideas: 'Idea Generator',
      study: 'Study Helper'
    },

    placeholders: {
      rewrite: 'Enter text to rewrite, such as a message or paragraph...',
      summary: 'Enter a longer text to summarize...',
      translate: 'Enter Persian or English text...',
      ideas: 'Enter a topic, project, or area for ideas...',
      study: 'Enter a study topic or question...'
    },

    counter: n => `Free uses today: ${n} of 5`,
    emptyInput: 'Please enter some text or a topic first.',
    limitReached: 'You have reached today’s free usage limit. You will get 5 free uses again tomorrow.',
    loginMessage: 'User login is not connected to a backend yet.',
    upgradeMessage: 'Payments are not enabled yet. Pro plans can be added later.',

    rewriteHeading: 'Rewritten version:',
    rewriteNote1: '✓ The text is clearer and more polished.',
    rewriteNote2: '✓ Informal expressions have been improved.',
    rewriteNote3: '✓ The original structure has been preserved.',
    summaryHeading: 'Summary:',
    summaryShort: '• The text is short and does not need further summarization.',
    keyPoints: 'Key points:',
    noSummaryText: 'No text was found to summarize.',
    translateHeading: 'Experimental Persian → English translation:',
    translateNote: 'This version works without an API and supports basic words and phrases.',
    ideasHeading: 'Ideas for',
    idea1: 'Build a free and fast tool related to the topic.',
    idea2: 'Create a step-by-step guide for beginners.',
    idea3: 'Create a demo page to show results before use.',
    idea4: 'Add a frequently asked questions section.',
    idea5: 'Allow users to save and view previous results.',
    idea6: 'Add a result-sharing feature.',
    idea7: 'Collect feedback and add popular features.',
    kasraiSuggestion: 'Kasrai suggestion:',
    ideaAdvice: 'Start with the simplest idea, then improve it based on user feedback.',
    studyHeading: 'Study help for:',
    studyMethod: 'Suggested method:',
    study1: 'Identify the main question or concept.',
    study2: 'Separate the given information.',
    study3: 'Find the relevant formula, rule, or concept.',
    study4: 'Work through the problem step by step.',
    study5: 'Complete the calculations.',
    study6: 'Check the final answer against the question.',
    studyTip: 'Tip:',
    studyAdvice: 'For math, physics, chemistry, or another subject, enter the full question so we can review it step by step.',
    defaultResult: 'Your result will appear here.'
  }
};

/* -------------------------
   ابزارها
------------------------- */

const TOOLS = {
  rewrite: { key: 'toolRewrite', placeholderKey: 'rewrite' },
  summary: { key: 'toolSummary', placeholderKey: 'summary' },
  translate: { key: 'toolTranslate', placeholderKey: 'translate' },
  ideas: { key: 'toolIdeas', placeholderKey: 'ideas' },
  study: { key: 'toolStudy', placeholderKey: 'study' }
};

const LIMIT = 5;
const HISTORY_LIMIT = 30;

const $ = selector => document.querySelector(selector);

const state = {
  tool: localStorage.getItem('kasrai_tool') || 'rewrite',
  uses: Number(localStorage.getItem('kasrai_uses_v2') || 0),
  day: localStorage.getItem('kasrai_day') || '',
  history: loadHistory(),
  lastInput: '',
  lastOutput: '',
  language: localStorage.getItem('kasrai_language') || 'fa'
};

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem('kasrai_history') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function t(key) {
  return TRANSLATIONS[state.language][key] ??
    TRANSLATIONS.fa[key] ??
    key;
}

function fa(number) {
  return state.language === 'fa'
    ? String(number).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
    : String(number);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function clean(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function sentences(text) {
  return clean(text).match(/[^.!?؟\n]+[.!?؟]?/g)?.map(clean).filter(Boolean) || [];
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
   رابط کاربری و ترجمه
------------------------- */

function applyLanguage() {
  const language = state.language;
  const dict = TRANSLATIONS[language];

  document.documentElement.lang = language;
  document.documentElement.dir = dict.direction;
  document.title = dict.title;

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    if (dict[key] !== undefined && typeof dict[key] === 'string') {
      element.textContent = dict[key];
    }
  });

  const languageButton = $('#languageBtn');
  if (languageButton) {
    languageButton.textContent = dict.button;
    languageButton.onclick = toggleLanguage;
    languageButton.setAttribute(
      'aria-label',
      language === 'fa' ? 'Switch to English' : 'تغییر زبان به فارسی'
    );
  }

  document.querySelectorAll('.brand span').forEach(span => {
    if (span.dataset.i18n === 'brand') {
      span.textContent = dict.brand;
    }
  });

  setTool(state.tool, false);
  refresh();
  renderHistory();

  if ($('#output') && !state.lastOutput) {
    $('#output').textContent = dict.defaultResult;
  }

  const runButton = $('#runBtn');
  if (runButton && !runButton.disabled) {
    runButton.textContent = dict.run;
  }
}

function toggleLanguage() {
  state.language = state.language === 'fa' ? 'en' : 'fa';
  localStorage.setItem('kasrai_language', state.language);
  applyLanguage();
}

/* -------------------------
   بروزرسانی شمارنده و پلن
------------------------- */

function refresh() {
  if ($('#counter')) {
    $('#counter').textContent = t('counter')(fa(state.uses));
  }

  if ($('#planPill')) {
    $('#planPill').textContent = t('planFree');
  }

  if ($('#historyCount')) {
    $('#historyCount').textContent = fa(state.history.length);
  }
}

/* -------------------------
   انتخاب ابزار
------------------------- */

function setTool(tool, save = true) {
  if (!TOOLS[tool]) tool = 'rewrite';

  state.tool = tool;

  if (save) {
    localStorage.setItem('kasrai_tool', tool);
  }

  document.querySelectorAll('.tool-card').forEach(card => {
    card.classList.toggle('active', card.dataset.tool === tool);
  });

  if ($('#toolTitle')) {
    $('#toolTitle').textContent = t('toolTitles')[tool] || t(TOOLS[tool].key);
  }

  if ($('#inputText')) {
    $('#inputText').placeholder = t('placeholders')[TOOLS[tool].placeholderKey];
  }
}

function showResult(text) {
  if ($('#output')) $('#output').textContent = text;
  state.lastOutput = text;
}

function showMessage(text) {
  if ($('#output')) $('#output').textContent = text;
}

/* -------------------------
   بازنویسی
------------------------- */

function rewriteText(text) {
  let result = clean(text);

  if (state.language === 'fa') {
    const replacements = [
      ['میخوام', 'می‌خواهم'],
      ['میخواد', 'می‌خواهد'],
      ['میشه', 'می‌شود'],
      ['نمیشه', 'نمی‌شود'],
      ['میتونم', 'می‌توانم'],
      ['میتونی', 'می‌توانی'],
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

    return `${t('rewriteHeading')}

${result}

${t('rewriteNote1')}
${t('rewriteNote2')}
${t('rewriteNote3')}`;
  }

  return `${t('rewriteHeading')}

${result}

${t('rewriteNote1')}
${t('rewriteNote2')}
${t('rewriteNote3')}`;
}

/* -------------------------
   خلاصه‌ساز
------------------------- */

function summarizeText(text) {
  const list = sentences(text);

  if (!list.length) return t('noSummaryText');

  if (list.length <= 2 && text.length < 180) {
    return `${t('summaryHeading')}

${text}

${t('keyPoints')}
${t('summaryShort')}`;
  }

  const count = Math.max(2, Math.min(4, Math.ceil(list.length * 0.4)));
  const selected = list.slice(0, count);

  return `${t('summaryHeading')}

${selected.join(' ')}

${t('keyPoints')}
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
  'دوست من': 'my friend',
  'دوست': 'friend',
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
      result = result.split(word).join(dictionary[word]);
    });

  if (state.language === 'en') {
    return `${t('translateHeading')}

${result}

${t('translateNote')}`;
  }

  return `${t('translateHeading')}

${result}

${t('translateNote')}`;
}

/* -------------------------
   ایده‌پرداز
------------------------- */

function generateIdeas(text) {
  const topic = clean(text);

  if (state.language === 'en') {
    return `${t('ideasHeading')} "${topic}":

💡 Idea 1
${t('idea1')}

💡 Idea 2
${t('idea2')}

💡 Idea 3
${t('idea3')}

💡 Idea 4
${t('idea4')}

💡 Idea 5
${t('idea5')}

💡 Idea 6
${t('idea6')}

💡 Idea 7
${t('idea7')}

🚀 ${t('kasraiSuggestion')}
${t('ideaAdvice')}`;
  }

  return `${t('ideasHeading')} «${topic}»:

💡 ایده ۱
${t('idea1')}

💡 ایده ۲
${t('idea2')}

💡 ایده ۳
${t('idea3')}

💡 ایده ۴
${t('idea4')}

💡 ایده ۵
${t('idea5')}

💡 ایده ۶
${t('idea6')}

💡 ایده ۷
${t('idea7')}

🚀 ${t('kasraiSuggestion')}
${t('ideaAdvice')}`;
}

/* -------------------------
   کمک‌درسی
------------------------- */

function studyHelp(text) {
  const topic = clean(text);

  return `${t('studyHeading')}

"${topic}"

📚 ${t('studyMethod')}

1. ${t('study1')}

2. ${t('study2')}

3. ${t('study3')}

4. ${t('study4')}

5. ${t('study5')}

6. ${t('study6')}

⭐ ${t('studyTip')}
${t('studyAdvice')}`;
}

/* -------------------------
   موتور ابزارها
------------------------- */

function localAI(tool, input) {
  const text = clean(input);

  if (!text) return t('emptyInput');

  switch (tool) {
    case 'rewrite': return rewriteText(text);
    case 'summary': return summarizeText(text);
    case 'translate': return translateText(text);
    case 'ideas': return generateIdeas(text);
    case 'study': return studyHelp(text);
    default: return rewriteText(text);
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
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = t('noHistory');
    box.appendChild(empty);
    return;
  }

  state.history.slice(0, 8).forEach(item => {
    const button = document.createElement('button');
