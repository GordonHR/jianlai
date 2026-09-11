/* 太平无事牌 · 八十面箴言匣
   牌文按"凡可核到之原句皆入"原则收录：
     - 一类是剑气长城酒铺那面木墙上的"最后的声音"（多见《剑来》第五百八十一章《唯有饮者留其名》摘录）
     - 一类是人物对白/箴言（齐静春、陈平安、宁姚、阿良、左右、裴钱、崔东山、崔瀺……）
   两类不另作区分，统标 src:'原著'，凡未核到的不再虚写。
   w = 对应人物名（取 art/<w>.png 做底），w 空则为无对应人物之无名留言。 */
const WSP_CARDS = [
  /* ── 第一至十面：剑气长城酒墙 + 各色留言 ── */
  { n:1,  t:'花好月圆人长寿。剑修高魁',                                       src:'原著', w:'' },
  { n:2,  t:'为情所困，剑不得出。风雪庙魏晋',                                 src:'原著', w:'魏晋' },
  { n:3,  t:'此处天下当知我元青蜀是剑仙',                                     src:'原著', w:'' },
  { n:4,  t:'此地酒水价廉物美，极佳，若能赊账更好。陶文',                     src:'原著', w:'' },
  { n:5,  t:'师父卖酒，徒弟买酒，师徒之谊，感人肺腑，天长地久。弟子郭竹酒',  src:'原著', w:'郭竹酒' },
  { n:6,  t:'昔年风流不足夸，百战往返几春秋。痛饮过后醉枕剑，曾梦青神来倒酒', src:'原著', w:'' },
  { n:7,  t:'斗诗一事，老子自称第二，没谁敢称第一。二掌柜除外',               src:'原著', w:'' },
  { n:8,  t:'人间一半剑仙是我友，天下哪个娘子不娇羞。我以醇酒洗我剑，谁人不说我风流', src:'原著', w:'' },
  { n:9,  t:'太徽剑宗第四代宗主，韩槐子。此生无甚大遗憾',                     src:'原著', w:'' },
  { n:10, t:'宁姑娘，你有了喜欢的人，我很伤心。刘铁夫',                       src:'原著', w:'ningyao',
    b:'可我还是祝你，岁岁平安。' },

  /* ── 第十一至二十面 ── */
  { n:11, t:'来时元婴，去时元婴，不曾破境，愧对美酒。北皑皈洲，邓凉',        src:'原著', w:'' },
  { n:12, t:'待人宜宽，待己需严。天下太平，真正无事',                         src:'原著', w:'',
    b:'为仁由己，己欲仁，斯仁至矣。愿有此心者，事事无忧愁。' },
  { n:13, t:'从不坑人二掌柜，酒品无双陈平安',                                 src:'原著', w:'chenpingan' },
  { n:14, t:'老子看遍无事牌，斗胆一言，我浩然天下剑修，剑术不如剑气长城又如何，可字，写得就是要好许多',  src:'原著', w:'' },
  { n:15, t:'浩然天下如你这般不会写字的，还有如那二掌柜不会卖酒的，再给咱们剑气长城来一打，再多也不嫌多', src:'原著', w:'' },
  { n:16, t:'林君璧饮过此酒，三年破三境而已',                                 src:'原著', w:'aliang' },
  { n:17, t:'喝得酒，杀得妖，作得诗，才情不输二掌柜，相貌惜败吴承霈。我这一生很圆满，就缺个媳妇了',        src:'原著', w:'' },
  { n:18, t:'兜里有钱，喝垮酒铺',                                             src:'原著', w:'' },
  { n:19, t:'剑术尚可',                                                       src:'原著', w:'左右' },
  { n:20, t:'老子与阿良联手，可杀飞升境大妖',                                 src:'原著', w:'aliang' },

  /* ── 廿一至三十 ── */
  { n:21, t:'阿良如果将来跻身十四境，一定是合道脸皮',                         src:'原著', w:'aliang' },
  { n:22, t:'放你娘的屁，这场大道之争，狗日的争不过二掌柜',                   src:'原著', w:'' },
  { n:23, t:'纳兰彩焕，我去去就来',                                           src:'原著', w:'' },
  { n:24, t:'牧笛，驼铃，皆是风过声',                                         src:'原著', w:'baiye' },
  { n:25, t:'好林泉都付与闲人，好娘们都被拐走了',                             src:'原著', w:'' },
  { n:26, t:'这辈子未曾醉过，怨酒',                                           src:'原著', w:'龙君' },
  { n:27, t:'陈李，佩剑晦暝，飞剑寤寐。百岁剑仙，唾手可得',                   src:'原著', w:'' },
  { n:28, t:'世间无好喝之酒，狗日的还我酒钱',                                 src:'原著', w:'' },
  { n:29, t:'陆芝确实好看。腿也好看',                                         src:'原著', w:'陆芝' },
  { n:30, t:'人生苦短，练剑太难',                                             src:'原著', w:'' },

  /* ── 卅一至四十 ── */
  { n:31, t:'托是什么，不存在的。二掌柜坐庄，高风亮节，光明磊落',             src:'原著', w:'' },
  { n:32, t:'阿良是那中土神洲书香门第出身？我打死不信。隐官真不是那浩然天下的高门豪家子？我不信',          src:'原著', w:'aliang' },
  { n:33, t:'纳兰老贼，要么滚远点，要么给白姑娘一个名分',                     src:'原著', w:'miyu' },
  { n:34, t:'左右剑术比我略高一筹',                                           src:'原著', w:'左右' },
  { n:35, t:'叠嶂姑娘，如果二掌柜对你毛手毛脚，告诉我一声，我去告诉宁姚',     src:'原著', w:'李槐' },
  { n:36, t:'这一遭，乘兴而来，乘兴而去',                                     src:'原著', w:'宋集薪' },
  { n:37, t:'次次都是我结账酒水钱，如果哪天我不在酒桌旁边了，二掌柜，给我个面子，为那群穷光蛋朋友破例赊欠一次，先行谢过', src:'原著', w:'' },
  { n:38, t:'浩然天下，有哪九洲？曾经听过，已经忘了',                         src:'原著', w:'贺小凉' },
  { n:39, t:'看了她一眼，人间颜色如尘土',                                     src:'原著', w:'陈暖树' },
  { n:40, t:'记得小时候有一年，夏天的蝉鸣特别吵人，冬天路上积雪冻屁股。只是忘记了哪一年', src:'原著', w:'' },

  /* ── 卌一至五十（续酒墙） ── */
  { n:41, t:'凭什么我是剑仙他是元婴剑修，五十岁的时候，我还是龙门境，他就是元婴境。救我作甚？',              src:'原著', w:'裴钱' },
  { n:42, t:'怎么会有一座天下，只有一轮明月？与老子一般打光棍吗？',           src:'原著', w:'董三更' },
  { n:43, t:'有些事，总是姗遛来迟；有些人，总是匆匆离去。喝酒真苦',           src:'原著', w:'刘灞桥' },
  { n:44, t:'黄花黄，白云白，青山青，少年年少',                               src:'原著', w:'崔东山' },
  { n:45, t:'一拳就倒二掌柜，笑得我腰子疼',                                   src:'原著', w:'崔瀺' },
  { n:46, t:'桌上灯半黑，窗外月半明，有人觉得不够亮，有人觉得不算黑。还还剩酒半壶，吐完再喝啊',                src:'原著', w:'齐廷济' },
  { n:47, t:'皇帝宰相状元郎，是什么东西，能当佐酒菜吗？祖坟又是什么？',       src:'原著', w:'陈暖树' },
  { n:48, t:'对错都在酒碗中',                                                 src:'原著', w:'周米粒' },
  { n:49, t:'我家城头，高过白云。浩然有吗？',                                 src:'原著', w:'隋右边' },
  { n:50, t:'几天没来大碗喝酒，无事牌怎么这么多了？',                         src:'原著', w:'' },

  /* ── 五十一至六十：人物对白 · 陈平安 ── */
  { n:51, t:'我叫陈平安，平平安安的平安。我是一名剑客。',                     src:'原著', w:'chenpingan' },
  { n:52, t:'我陈平安，唯有一剑，可搬山，倒海，降妖，镇魔，敕神，摘星，断江，摧城，开天！', src:'原著', w:'chenpingan' },
  { n:53, t:'宁姚！我喜欢你！',                                               src:'原著', w:'chenpingan' },
  { n:54, t:'少年的肩膀，就该先挑起清风明月、杨柳依依和草长莺飞。',         src:'原著', w:'chenpingan' },
  { n:55, t:'世间万般讲理与不讲理，终归会落在一处，我心安处即吾乡。',         src:'原著', w:'chenpingan' },
  { n:56, t:'落魄时把自己当回事，发迹后把别人当回事。',                       src:'原著', w:'chenpingan' },
  { n:57, t:'有些姑娘，看一眼就是一辈子。',                                   src:'原著', w:'chenpingan' },
  { n:58, t:'总有些人，一眼看到就会心生好感，道理都讲不通。',                 src:'原著', w:'chenpingan' },
  { n:59, t:'有些事情，死了也要做。但有些事情，是死也不能做的。',             src:'原著', w:'chenpingan' },
  { n:60, t:'与亲近之人，不要说气话，不要说反话，不要不说话。',               src:'原著', w:'chenpingan' },

  /* ── 六十一至七十：人物对白 · 齐静春 / 宁姚 ── */
  { n:61, t:'遇事不决，可问春风。春风不语，即随本心。',                       src:'原著', w:'qijingchun' },
  { n:62, t:'道理全在书上，做人却在书外。',                                   src:'原著', w:'qijingchun' },
  { n:63, t:'陈平安，记住，以后不管遇到什么，你都不要对这个世界失去希望。',   src:'原著', w:'qijingchun' },
  { n:64, t:'君子坐而论道，少年起而行之。',                                   src:'原著', w:'qijingchun' },
  { n:65, t:'请不要把陌生人的些许善意，视为珍稀的瑰宝；却把身边亲近人的全部付出，当做天经地义。', src:'原著', w:'qijingchun' },
  { n:66, t:'陈平安！我喜欢你，不比你喜欢我少一点点！',                       src:'原著', w:'ningyao' },
  { n:67, t:'谁让有个傻子喜欢我呢？',                                         src:'原著', w:'ningyao' },
  { n:68, t:'你好，我爹姓宁，我娘姓姚，所以我叫宁姚。',                       src:'原著', w:'ningyao' },
  { n:69, t:'我宁姚一只手能打一百个陈平安',                                   src:'原著', w:'ningyao' },
  { n:70, t:'烂好人，难怪穷得叮当响，活该被人欺负。',                         src:'原著', w:'ningyao' },

  /* ── 七十一至八十：人物对白 · 阿良 / 左右 / 裴钱 / 崔东山 / 崔瀺 ── */
  { n:71, t:'我叫阿良，善良的良。我是一名剑客。',                             src:'原著', w:'aliang' },
  { n:72, t:'我阿良最大的两个优点，就是喜欢接受批评，你批评我，我就打死你。', src:'原著', w:'aliang' },
  { n:73, t:'万事不过多递一剑。',                                             src:'原著', w:'左右' },
  { n:74, t:'我的剑意不如阿良，但剑术比他高一点。我叫左右。',                 src:'原著', w:'左右' },
  { n:75, t:'我拳一出，如日中天。天下武夫，只能磕头。',                       src:'原著', w:'裴钱' },
  { n:76, t:'读最薄的书，吃最贵的菜，骂最坏的人，打最野的狗，戳最大的马蜂窝。', src:'原著', w:'裴钱' },
  { n:77, t:'走路嚣张，妖魔心慌！',                                           src:'原著', w:'裴钱' },
  { n:78, t:'我是东山啊！',                                                   src:'原著', w:'崔东山' },
  { n:79, t:'诸位，大势倾压在即，愿挽天倾者，请起身！',                       src:'原著', w:'崔瀺' },
  { n:80, t:'白衣胜雪俱往矣，且看绣虎谋天下。',                               src:'原著', w:'崔瀺' },
];
/* 八十一号及以上暂止；后续若再扩，沿用 苏州码子 苏州码子 之外用"五十一..八十"补齐 */
const WSP_NUM = [
  '一','二','三','四','五','六','七','八','九','十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十',
  '卅一','卅二','卅三','卅四','卅五','卅六','卅七','卅八','卅九','四十',
  '卌一','卌二','卌三','卌四','卌五','卌六','卌七','卌八','卌九','五十',
  '五十一','五十二','五十三','五十四','五十五','五十六','五十七','五十八','五十九','六十',
  '六十一','六十二','六十三','六十四','六十五','六十六','六十七','六十八','六十九','七十',
  '七十一','七十二','七十三','七十四','七十五','七十六','七十七','七十八','七十九','八十',
];

/* 名字映射：w 字段（对应人物标识，给立绘做底用）→ 弹框里"竖线+名字"列要显示的中文名。
   无 w 的酒墙留言，落款人已写进 c.t 正文（如"剑修高魁"），不额外生成名字列。 */
const WSP_NAME = {
  '魏晋':'魏晋','郭竹酒':'郭竹酒','ningyao':'宁姚','chenpingan':'陈平安',
  'aliang':'阿良','左右':'左右','miyu':'米裕','baiye':'白也','龙君':'龙君',
  '陈暖树':'陈暖树','贺小凉':'贺小凉','李槐':'李槐','宋集薪':'宋集薪',
  '崔东山':'崔东山','崔瀺':'崔瀺','董三更':'董三更','刘灞桥':'刘灞桥',
  '齐廷济':'齐廷济','周米粒':'周米粒','隋右边':'隋右边','裴钱':'裴钱',
  'qijingchun':'齐静春'
};
function wspWho(w){ return (w && WSP_NAME[w]) || (w || ''); }

/* 牌文按字数切成多段竖排列（每列固定 12 个汉字，按用户 2026-09-04 明示要求）。
   弹框高度足够装下 12 字一行（PC 22px 字号 × 1.7 行高 = 12 字 ≈449px，panel 可用 ≈508px）；
   CSS column-count 在 writing-mode:vertical-rl 下不可靠（每列字数少就折了），
   故用 JS 切列 + flex 横排从右往左（row-reverse），最朴素的"一列写到底再折"。
   小程序 per 同为 12（WXSS 字号 32rpx × 1.7 ≈544rpx，弹框 ~930rpx）。 */
function wspSplit(t){
  const len = (t || '').length;
  if(!len) return { cols: [] };
  const per = 12;
  const cols = [];
  for(let i = 0; i < len; i += per) cols.push(t.slice(i, i + per));
  return { cols };
}

/* 弹框内文字竖排、从右到左、写满一列再折左一列（JS 按字数切列）。
   若 c.w 有对应人物 → 文字左侧用竖线分隔出一列显示该人物名（wsp-dt-who）。 */

function openWushipai(){
  wspClose();
  if(typeof SFX!=='undefined' && SFX) { SFX.set(true); SFX.click(); }
  state = { phase:'codex', mode:'codex', sel:[], filter:'全部', q:'', log:[],
            codexTab:'wsp', selTale:null, wspSeen:{}, wspBack:{} };
  render();
}

/* 随机抽一张优先未翻开；全部翻开时退化为任选；不影响"已见"进度。
   抽中后直接打开弹层，让玩家立刻看到。 */
function wspDraw(){
  const seen = state.wspSeen || (state.wspSeen = {});
  const unseen = [];
  const all = [];
  WSP_CARDS.forEach(function(c){
    all.push(c.n);
    if(!seen[c.n]) unseen.push(c.n);
  });
  const pool = unseen.length ? unseen : all;
  const n = pool[Math.floor(Math.random() * pool.length)];
  wspOpnMark(n);
  wspDetail(n);
  if(typeof SFX!=='undefined' && SFX) SFX.click();
}

function wspReset(){
  state.wspSeen = {}; state.wspBack = {};
  if(typeof SFX!=='undefined' && SFX) SFX.click();
  render();
}
function wspOpenAll(){
  WSP_CARDS.forEach(function(c){ state.wspSeen[c.n] = 1; });
  if(typeof SFX!=='undefined' && SFX) SFX.click();
  render();
}

/* 点击木牌：墙上翻面留痕（计入已见）+ 弹出放大详情层（有对应人物则以模糊立绘做底） */
function wspOpnMark(n){
  try{ if(typeof prRecordRead==='function') prRecordRead('wsp','牌'+n); }catch(e){}
}
function wspOpen(el, n){
  const seen = state.wspSeen || (state.wspSeen = {});
  const c = WSP_CARDS[n-1];
  if(!seen[n]){
    seen[n] = 1;
    wspOpnMark(n);
    if(el) el.classList.add('on');
    if(typeof SFX!=='undefined' && SFX) SFX.click();
  }
  wspDetail(n);
}

/* 放大详情层（独立浮层，挂 body，不随 render 重建，保住入场动效）
   比例 2:3（与立绘同比例，竖版高>宽），有对应人物模糊立绘做底，无对应人物用底部纹路做底
   四边光辉（亮一些、不规则）；牌文竖排单列、直接写在卡面（不另加签条）。
   关闭方式：点击弹框内任意区域、点击遮罩、按 Esc。 */
function wspDetail(n){
  const c = WSP_CARDS[n-1];
  if(!c) return;
  let root = document.getElementById('wsp-overlay');
  if(!root){ root = document.createElement('div'); root.id = 'wsp-overlay'; document.body.appendChild(root); }
  /* 有立绘 → 全层模糊做底；无立绘 → 用底部纹路（线性渐隐 + 角花）做底 */
  const art = c.w
    ? '<img class="wsp-dt-bg" src="art/'+c.w+'.png" onerror="this.style.display=\'none\'">'
    : '<div class="wsp-dt-pattern" aria-hidden="true"></div>';
  const sp = wspSplit(c.t);
  const sp2 = c.b ? wspSplit(c.b) : { cols: [] };
  const colHtml = function(arr){ return arr.map(function(s){ return '<span class="wsp-dt-col">'+s+'</span>'; }).join(''); };
  root.innerHTML =
      '<div class="wsp-dt-scrim" onclick="wspClose()"></div>'
    + '<div class="wsp-dt-card" onclick="wspClose()">'
    +   '<div class="wsp-dt-glow" aria-hidden="true"></div>'
    +   '<div class="wsp-dt-sheen" aria-hidden="true"></div>'
    +   art
    +   '<div class="wsp-dt-panel">'
    +     '<span class="wsp-dt-no">'+WSP_NUM[c.n-1]+'</span>'
    +     '<div class="wsp-dt-words">'
    +       (c.w ? '<div class="wsp-dt-who" aria-label="'+wspWho(c.w)+'">'+wspWho(c.w)+'</div>' : '')
    +       '<div class="wsp-dt-txt">'+colHtml(sp.cols)+'</div>'
    +       (c.b ? '<div class="wsp-dt-txt2" style="display:none">'+colHtml(sp2.cols)+'</div>' : '')
    +     '</div>'
    +   '</div>'
    + '</div>';
  root.classList.add('show');
  if(!root._key){
    root._key = function(ev){ if(ev.key === 'Escape') wspClose(); };
    document.addEventListener('keydown', root._key);
  }
}
function wspDetailFlip(n){
  const root = document.getElementById('wsp-overlay');
  if(!root) return;
  const t1 = root.querySelector('.wsp-dt-txt');
  const t2 = root.querySelector('.wsp-dt-txt2');
  if(!t1 || !t2) return;
  const show2 = t2.style.display === 'none';
  t1.style.display = show2 ? 'none' : '';
  t2.style.display = show2 ? '' : 'none';
  if(typeof SFX!=='undefined' && SFX) SFX.click();
}
function wspClose(){
  const root = document.getElementById('wsp-overlay');
  if(root){
    root.classList.remove('show');
    root.innerHTML = '';
    if(root._key){ document.removeEventListener('keydown', root._key); root._key = null; }
  }
}
function wspCount(){
  const seen = state.wspSeen || {};
  let k = 0; WSP_CARDS.forEach(function(c){ if(seen[c.n]) k++; });
  const seal = document.getElementById('wsp-seal');
  if(seal) seal.classList.toggle('on', k >= WSP_CARDS.length);
}
function renderWushipai(){
  const seen = state.wspSeen || (state.wspSeen = {});
  let n0 = 0; WSP_CARDS.forEach(function(c){ if(seen[c.n]) n0++; });

  /* 顶部不再放「天 下 太 平」一行字（用户 2026-09-03 反馈：只保留按钮），改为仅一排操作按钮 */
  let h = '<div class="wsp-bar">'
        + '<button class="btn ghost" onclick="state={phase:\'title\',sel:[],log:[]};render()">返回卷首</button>'
        + '<button class="btn primary wsp-draw" onclick="wspDraw()">随 手 抽 一 张</button>'
        + '</div>';

  h += '<p class="hint">剑气长城酒铺一面木墙，挂满木牌。出城杀妖前留一句话，当作最后的声音。'
     + '大多后来战死、连墓碑也没有——这面墙不是祈福墙，是「我曾来过」。点牌即翻。</p>';

  h += '<div class="wsp-holder"><div class="wsp-wall">';

  WSP_CARDS.forEach(function(c, idx){
    const s2 = c.b ? ' s2' : '';
    const on = seen[c.n] ? ' on' : '';
    const on2 = (c.b && state.wspBack && state.wspBack[c.n]) ? ' on2' : '';
    /* 木牌：有立绘模糊做底，无则底部纹路 */
    const art = c.w
      ? '<img class="wsp-art" src="art/'+c.w+'.png" onerror="this.style.display=\'none\'">'
      : '<div class="wsp-art wsp-pattern" aria-hidden="true"></div>';
    const dly = ' style="animation-delay:'+Math.min(idx*16, 1100)+'ms"';
    h += '<div class="wsp-card'+s2+on+on2+'"'+dly+' onclick="wspOpen(this,'+c.n+')">'
       +   '<div class="wsp-inner">'
       +     '<div class="wsp-face wsp-wood">'
       +       '<span class="wsp-cord"></span><span class="wsp-hole"></span>'
       +       '<span class="wsp-no">'+WSP_NUM[c.n-1]+'</span>'
       +     '</div>'
       +     '<div class="wsp-face wsp-words">'
       +       art
       +     '</div>'
       +   '</div>'
       + '</div>';
  });

  h += '</div>'
     + '<div class="wsp-seal'+(n0>=WSP_CARDS.length?' on':'')+'" id="wsp-seal">'
     +   '<span>天下太平　真正无事</span></div>'
     + '<div class="wsp-acts">'
     +   '<button class="btn ghost" onclick="wspOpenAll()">全 部 翻 开</button> '
     +   '<button class="btn ghost" onclick="wspReset()">重 新 挂 起</button>'
     + '</div></div>';
  return h;
}
