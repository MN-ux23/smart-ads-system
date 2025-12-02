// js/ IMI Chat
(() => {

  // language detection 
  const isAR = (document.documentElement.lang || '').toLowerCase().startsWith('ar');
  //
  const T = isAR ? {
    name: 'IMI',
    sub: 'مساعد خيال الفِكرة',
    hello: 'مرحبًا! أنا ايمي — مساعدك الذكي. اختر أحد الأسئلة:',
    typing: 'يكتب…',
    // predefined Arabic FAQ dataset
    quick: [
      [
        'ما هي خدمة "ذكاء الإعلانات"؟',
        'خدمة ذكاء الإعلانات (Ad Intelligence) تقترح أفضل موقع لعرض إعلانك بناءً على بيانات واقعية من الاستبيانات وسلوك الزوار، لتضمن أعلى تفاعل من الفئة المستهدفة.'
      ],
      [
        'ما هي خدمة "ذكاء الصيانة"؟',
        'خدمة ذكاء الصيانة (Predictive Maintenance) تتابع أداء الشاشات وتتنبأ بالأعطال قبل حدوثها اعتمادًا على عوامل مثل الحرارة، الرطوبة، وساعات التشغيل — لتقليل التوقفات والمحافظة على الكفاءة.'
      ],
      [
        'من أنتم؟',
        'شركة خيال الفكرة للشاشات الذكية — شركة سعودية متخصصة في توريد وتركيب حلول العرض الذكية والرقمية بجودة عالية ودعم فني مستمر. رؤيتنا أن نكون الخيار الأول في المملكة عبر خدمات احترافية وتقنيات مبتكرة وتجربة لا تُنسى.'
      ],
      [
        'أنواع الشاشات المتوفرة؟',
        'LED داخلية/خارجية، مرنة، أرضية تفاعلية، فيديو وول، لافتات جدارية، OLED، بدائل البنر، شاشات لمس، وتصاميم مخصّصة.'
      ],
      [
        'هل توفرون مقاسات خاصة؟',
        'نعم — ننفّذ مقاسات وأنواع مختلفة حسب احتياج المشروع.'
      ],
      [
        'هل الشاشات الخارجية مقاومة للطقس؟',
        'نعم — شاشاتنا الخارجية مقاومة للعوامل الجوية للعمل في الطرق والمتاجر والفعاليات.'
      ],
      [
        'هل تقدمون حلول تركيب؟',
        'بالتأكيد — حائط/حامل، أفقي/رأسي مع دعم فني كامل.'
      ],
      [
        'طرق التواصل والموقع؟',
        '📍 الموقع: حائل – زون، الطابق الأول.\n🔗 خرائط: https://maps.app.goo.gl/c72ZxHd2PYkHW6J46\n📞 +966550433477\n✉️ info@imidea.co'
      ]
    ]
  } : {
    name: 'IMI',
    sub: 'IMIDEA Assistant',
    hello: 'Hi! I’m IMI — your smart assistant. Pick a question:',
    typing: 'typing…',
    //English FAQ dataset
    quick: [
      [
        'What is “Ad Intelligence”?',
        'Ad Intelligence suggests the best ad location in Hail using real survey data and visitor behavior, to maximize engagement from your target audience.'
      ],
      [
        'What is “Predictive Maintenance”?',
        'Predictive Maintenance monitors screen health and forecasts failures early using inputs like temperature, humidity, and usage hours — reducing downtime and keeping screens efficient.'
      ],
      [
        'Who are you?',
        'Khiyal AlFikrah (IMIDEA SmartScreen) — a Saudi company supplying and installing smart/digital display solutions with professional services and continuous technical support. Our vision is to be the Kingdom’s first choice via innovative tech and memorable customer experience.'
      ],
      [
        'What screens do you offer?',
        'Indoor/Outdoor LED, flexible LED, interactive floor, video walls, signage, OLED, banner replacements, touch screens, and custom designs.'
      ],
      [
        'Custom sizes?',
        'Yes — custom sizes and configurations per project needs.'
      ],
      [
        'Weather-resistant?',
        'Yes — outdoor screens are weatherproof for roads, shops, and events.'
      ],
      [
        'Do you handle installation?',
        'Absolutely — wall/stand, landscape/portrait with full technical support.'
      ],
      [
        'Contact & location?',
        '📍 Location: Hail – Zoon, 1st floor.\n🔗 Maps: https://maps.app.goo.gl/c72ZxHd2PYkHW6J46\n📞 +966550433477\n✉️ info@imidea.co'
      ]
    ]
  };
// UI element references
  const root   = document.getElementById('imi-chat');
  if (!root) return;
  const toggle = document.getElementById('imi-toggle');
  const panel  = document.getElementById('imi-panel');
  const feed   = document.getElementById('imi-feed');
  const quick  = document.getElementById('imi-quick');
  const close  = document.getElementById('imi-close');
  const nameEl = document.getElementById('imi-name');
  const subEl  = document.getElementById('imi-sub');
  // inject assistant name and subtitle into UI
  nameEl.textContent = T.name;
  subEl.textContent  = T.sub;
 // generic message renderer
  const addMsg = (cls, text) => {
const b = document.createElement('div');
    b.className = cls;
    b.textContent = text;
    feed.appendChild(b);
    feed.scrollTop = feed.scrollHeight;
  };
// indicator to simulate conversational behaviour 
  const typing = () => {
    const el = document.createElement('div');
    el.className = 'imi-bot';
    el.textContent = T.typing;
    feed.appendChild(el);
    feed.scrollTop = feed.scrollHeight;
    return el;
  };
// Build Quick-Reply Buttons (interactive chips for FAQs)  quick.innerHTML = '';
  T.quick.forEach(([q, a]) => {
    const btn = document.createElement('button');
    btn.className = 'imi-chip';
    btn.type = 'button';
    btn.textContent = q;
    // Event: When user selects a predefined question
    btn.addEventListener('click', () => {
      addMsg('imi-user', q);
      const t = typing();
      setTimeout(() => {
        t.remove();
        addMsg('imi-bot', a);
      }, 600);
    });
    quick.appendChild(btn);
  });
// Open Panel Logic (displays greeting only once)
  const open = () => {
    root.classList.add('open');
    if (!feed.dataset.greeted) {
      addMsg('imi-bot', T.hello);
      feed.dataset.greeted = '1';
    }
  };
  // Close Panel Logic 
  const closePanel = () => root.classList.remove('open');
 // Toggle Listeners (open/close interaction) 
  toggle.addEventListener('click', () => {
    if (root.classList.contains('open')) {
      closePanel();
    } else {
      open();
    }
  });
  close.addEventListener('click', closePanel);
})();
//  Robot Image Rotator
//  rotate robot images every 2 seconds 
(() => {
  const img = document.getElementById('imi-bot');
  if (!img) return;

  
  const frames = [
    '../image/robot1.png',
    '../image/robot2.png',
    '../image/robot3.png',
    '../image/robot4.png'
  ].filter(Boolean);

  if (frames.length === 0) return;

  let idx = 0;
  img.src = frames[idx];
// Timer-based frame rotation
  setInterval(() => {
    idx = (idx + 1) % frames.length;
    img.src = frames[idx];
  }, 2000);
})();