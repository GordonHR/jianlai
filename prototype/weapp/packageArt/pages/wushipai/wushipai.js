/* 太平无事牌 · 八十面箴言匣（小程序端，数据与 PC 1:1）
   牌文按"凡可核到之原句皆入"原则收录：
     - 一类是剑气长城酒铺那面木墙上的"最后的声音"（多见《剑来》第五百八十一章《唯有饮者留其名》摘录）
     - 一类是人物对白/箴言（齐静春、陈平安、宁姚、阿良、左右、裴钱、崔东山、崔瀺……）
   两类不另作区分，统标 src:'原著'。 */
const WSP_CARDS = [
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
  { n:11, t:'来时元婴，去时元婴，不曾破境，愧对美酒。北皑皑洲，邓凉',        src:'原著', w:'' },
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
  { n:41, t:'凭什么我是剑仙他是元婴剑修，五十岁的时候，我还是龙门境，他就是元婴境。救我作甚？',              src:'原著', w:'裴钱' },
  { n:42, t:'怎么会有一座天下，只有一轮明月？与老子一般打光棍吗？',           src:'原著', w:'董三更' },
  { n:43, t:'有些事，总是姗姗来迟；有些人，总是匆匆离去。喝酒真苦',           src:'原著', w:'刘灞桥' },
  { n:44, t:'黄花黄，白云白，青山青，少年年少',                               src:'原著', w:'崔东山' },
  { n:45, t:'一拳就倒二掌柜，笑得我腰子疼',                                   src:'原著', w:'崔瀺' },
  { n:46, t:'桌上灯半黑，窗外月半明，有人觉得不够亮，有人觉得不算黑。还剩酒半壶，吐完再喝啊',                src:'原著', w:'齐廷济' },
  { n:47, t:'皇帝宰相状元郎，是什么东西，能当佐酒菜吗？祖坟又是什么？',       src:'原著', w:'陈暖树' },
  { n:48, t:'对错都在酒碗中',                                                 src:'原著', w:'周米粒' },
  { n:49, t:'我家城头，高过白云。浩然有吗？',                                 src:'原著', w:'隋右边' },
  { n:50, t:'几天没来大碗喝酒，无事牌怎么这么多了？',                         src:'原著', w:'' },

  /* ── 五十一至八十：人物对白（已网络核实） ── */
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

/* 名字映射：w 字段（对应人物标识，给立绘做底用）→ 弹框"竖线+名字"列要显示的中文名。
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
   小程序弹框 ~930rpx 高、32rpx 字号 → 每列 ≈653rpx，写到底再折。
   CSS column-count 在 writing-mode 下行为不可靠，故 JS 切列 + flex 横排从右往左渲染。 */
function wspSplit(t){
  const len = (t || '').length;
  if(!len) return { cols: [] };
  const per = 12;
  const cols = [];
  for(let i = 0; i < len; i += per) cols.push(t.slice(i, i + per));
  return { cols };
}

/* 弹框内文字竖排、从右到左、写满一列再折左一列（JS 按字数切列）。
   若 c.w 有对应人物 → 文字左侧用竖线分隔出一列显示该人物名。 */

Page({
  data: {
    cards: [], total: WSP_CARDS.length,
    count: 0, seen: {}, detail: null,
  },
  onLoad(){
    const cards = WSP_CARDS.map(function(c){
      const sp = wspSplit(c.t);
      const sp2 = c.b ? wspSplit(c.b) : { cols: [] };
      return { n:c.n, no:WSP_NUM[c.n-1], t:c.t, b:c.b||'', src:c.src,
               w:c.w||'', s2:c.b?true:false,
               cols: sp.cols, cols2: sp2.cols, who: c.w ? wspWho(c.w) : '',
               /* 模糊立绘（做底）：引用 /packageArt/assets/portraits/<w>.jpg；无 w → 不渲染 */
               art: c.w ? ('/packageArt/assets/portraits/' + c.w + '.jpg') : '', on:false };
    });
    this.setData({ cards:cards });
  },
  open(e){
    const i = e.currentTarget.dataset.i;
    const cards = this.data.cards.slice();
    const c = cards[i];
    const seen = Object.assign({}, this.data.seen);
    const firstSeen = !seen[c.n];
    if(firstSeen) seen[c.n] = 1;
    cards[i] = Object.assign({}, c, { on:true });
    let count = 0; WSP_CARDS.forEach(function(x){ if(seen[x.n]) count++; });
    /* detail 对象里加 hasArt = c.w 是否有，便于 WXSS 加光辉样式兼容。
       不再做 wspSplit 分列——直接渲染 c.t/c.b，CSS 统一横排。 */
    const sp = wspSplit(c.t);
    const sp2 = c.b ? wspSplit(c.b) : { cols: [] };
    const detail = { n:c.n, no:c.no, t:c.t, b:c.b, src:c.src, w:c.w, s2:c.s2, art:c.art, show2:false, hasArt: !!c.w, who: c.w ? wspWho(c.w) : '', cols: sp.cols, cols2: sp2.cols };
    this.setData({ cards:cards, seen:seen, count:count, detail:detail });
  },
  /* 随机抽一张优先未翻开；全部翻开时退化任选；不影响已见进度 */
  draw(){
    const seen = this.data.seen || {};
    const unseen = [], all = [];
    WSP_CARDS.forEach(function(c){ all.push(c.n); if(!seen[c.n]) unseen.push(c.n); });
    const pool = unseen.length ? unseen : all;
    const n = pool[Math.floor(Math.random() * pool.length)];
    const idx = WSP_CARDS.findIndex(function(c){ return c.n === n; });
    if(idx < 0) return;
    const c = WSP_CARDS[idx];
    const cards = this.data.cards.slice();
    const newSeen = Object.assign({}, seen);
    if(!newSeen[n]) newSeen[n] = 1;
    cards[idx] = Object.assign({}, cards[idx], { on:true });
    let count = 0; WSP_CARDS.forEach(function(x){ if(newSeen[x.n]) count++; });
    const sp = wspSplit(c.t);
    const sp2 = c.b ? wspSplit(c.b) : { cols: [] };
    const detail = { n:c.n, no:WSP_NUM[c.n-1], t:c.t, b:c.b, src:c.src, w:c.w, s2:!!c.b, art:c.w ? ('/packageArt/assets/portraits/' + c.w + '.jpg') : '', show2:false, hasArt: !!c.w, who: c.w ? wspWho(c.w) : '', cols: sp.cols, cols2: sp2.cols };
    this.setData({ cards:cards, seen:newSeen, count:count, detail:detail });
  },
  flip(){ this.setData({ 'detail.show2': !this.data.detail.show2 }); },
  close(){ this.setData({ detail:null }); },
  openAll(){
    const cards = this.data.cards.map(function(c){ return Object.assign({}, c, { on:true }); });
    const seen = {}; WSP_CARDS.forEach(function(c){ seen[c.n]=1; });
    this.setData({ cards:cards, seen:seen, count:WSP_CARDS.length });
  },
  reset(){
    const cards = this.data.cards.map(function(c){ return Object.assign({}, c, { on:false }); });
    this.setData({ cards:cards, seen:{}, count:0, detail:null });
  },
  imgErr(e){
    const i = e.currentTarget.dataset.i;
    const cards = this.data.cards.slice();
    cards[i] = Object.assign({}, cards[i], { art:'', w:'' });
    this.setData({ cards:cards });
  },
  dtImgErr(){
    if(this.data.detail) this.setData({ 'detail.art':'', 'detail.hasArt':false });
  }
});
