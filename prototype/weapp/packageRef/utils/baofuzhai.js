'use strict';
/* ==========================================================================
 * 包袱斋 · 行商拣漏  （baofuzhai.js · 小程序端 no-DOM 移植）
 * 源自 prototype/baofuzhai.js 逻辑核心。
 * 移植约定：删去 CSS 注入与 DOM 渲染，render() 改为 view() 推送纯数据快照；
 *           物件／书目图标按 id 派生 /assets/icon/bf-*.svg 路径，交由 wxml <image> 呈现。
 *
 * 原著依据（已核，勿按"随身小洞天/老聋儿掌柜"理解）：
 *  · 包袱斋：有眼力、无定所的行商松散门派。老祖师开"和气斋"九十九间屋，每间一物；
 *    卖出后门外挂木牌"已结善缘"。可赊欠（历来定例）。散修摊位价廉真伪难辨，考眼力。
 *  · 神仙钱：1 谷雨钱 = 10 小暑钱 = 1000 雪花钱。
 *  · 掌柜 · 石柔：骑龙巷压岁铺子代掌柜，枯骨女鬼寄居杜懋遗蜕，白日男子面目、入夜女子真身，
 *    无需睡眠；认得"雪花法袍"（眼力 +5，游戏原创·推定）。
 * ========================================================================== */

const WX = (typeof wx !== 'undefined') ? wx : null;
function lsGet(k, d){
  try{ const v = WX ? WX.getStorageSync(k) : (global.__ls && global.__ls[k]); return v==null ? d : v; }
  catch(e){ return d; }
}
function lsSet(k, v){
  try{ if(WX) WX.setStorageSync(k, v); else { global.__ls = global.__ls||{}; global.__ls[k]=v; } }catch(e){}
}
function vb(t){ if(WX && WX.vibrateShort){ try{ WX.vibrateShort({ type:(t||'light') }); }catch(e){} } }
const SFX = { set(){}, click(){ vb('light'); }, play(){ vb('medium'); }, ok(){ vb('medium'); }, bad(){ vb('heavy'); } };

/* ===================== 数值常量 ===================== */
const BF_COIN_WIN     = 18;
const BF_COIN_LOSE    = 6;
const BF_SELL_RATE    = 0.5;
const BF_CREDIT_MAX   = 300;
const BF_GEAR_SLOTS   = 2;
const BF_MARK_SLOT_MAX= 3;
const BF_STALL_N      = 3;
const BF_EYE_BASE     = 30;
const BF_EYE_PER_BOOK = 10;
const BF_EYE_MAX      = 80;
const BF_EYE_ROBE     = 5;
const BF_RATE = { xue:1, shu:100, yu:1000 };

/* ===================== 和气斋 · 物件（出处均为原著明载） ===================== */
const BF_GEAR = [
  { id:'baigu',   name:'莹莹白骨',   price:12,  src:'骸骨滩（陈平安收集，欲高价转卖）',
    desc:'十几具莹莹如玉的白骨，陈平安打算在骸骨滩卖个好价钱。不值钱，但胜在量大。', keep:'藏品' },
  { id:'lufu',    name:'路引符',     price:30,  src:'剑气长城城头（陈平安摆摊所售）',
    desc:'城头摆摊时极力推销的符箓之一，据说是某位大剑仙醉酒后所传。行走之引。', eff:{ k:'range', v:1 } },
  { id:'wancai',  name:'五彩大碗',   price:55,  src:'第799章 和气斋',
    desc:'绘五谷丰登进宝图的五彩大碗。碗是盛东西的，盛得住，才留得下。', eff:{ k:'draw', v:1 } },
  { id:'bihai',   name:'琳琅仙府笔海', price:70, src:'第799章 和气斋',
    desc:'出自琳琅仙府，雕刻一幅仙家走马图，二十四节气各取一景，依次展现。', eff:{ k:'hand', v:1 } },
  { id:'bagua',   name:'山鬼雷公八卦花钱', price:80, src:'第799章 和气斋',
    desc:'山鬼雷公八卦花钱。花钱不是流通的钱，是压胜的钱，算得是另一路账。', eff:{ k:'judge', v:1 } },
  { id:'bingshu', name:'兵书',       price:95,  src:'剥落山避暑娘娘地库（陈平安所获）',
    desc:'地库中搜刮出的兵书。讲的不是一招一式的近身，是隔山打牛的策应。', eff:{ k:'atk', v:1, c:'far' } },
  { id:'menshen', name:'彩绘门神大木板', price:110, src:'第799章 和气斋',
    desc:'一对彩绘门神大木板。门神守的是门，门内一寸，不许外人踏。', eff:{ k:'reduce', v:1, o:'turn' } },
  { id:'lishi',   name:'力士石像头颅', price:130, src:'第799章 和气斋',
    desc:'几点力士石像头颅。石像无头仍能站，那股蛮力，还在里头。', eff:{ k:'atk', v:1 } },
  { id:'xiaoshuqian', name:'篆文稀少的小暑钱', price:120, src:'第799章 和气斋',
    desc:'一枚篆文极其稀少的小暑钱。钱本身不稀奇，稀奇的是篆文少。', keep:'藏品' },
  { id:'gongyang', name:'金精供养钱', price:140, src:'第17章《不平则鸣》（苻南华所给香火钱）',
    desc:'一袋子金精铜钱。供养钱是世间诸多香火钱之一，一般供在城隍庙、文昌阁的神像上。', keep:'藏品' },
  { id:'hantie',  name:'寒铁门扉',   price:150, src:'剥落山避暑娘娘地库（陈平安所获）',
    desc:'地库里的寒铁门扉。门一关，外头的事就进不来。', eff:{ k:'reduce', v:1, o:'once' } },
  { id:'laolong', name:'老龙布雨佩', price:165, src:'第17章《不平则鸣》（苻南华赠宋集薪）',
    desc:'算不得什么威力巨大的仙家法宝，只能够避暑清心与避秽，尤其对冥想坐忘大有裨益。', eff:{ k:'regen', v:1 } },
  { id:'jianqiao', name:'剑气过桥符', price:190, src:'剑气长城城头（陈平安摆摊所授）',
    desc:'说是某位大剑仙醉酒后所传。剑气过桥，守心拦不住。', eff:{ k:'nododge', v:1 } },
  { id:'jingxin', name:'静心得意印', price:210, src:'第38章《九境》（齐静春蛇胆石所刻）',
    desc:'最上等的蛇胆石雕成，刻「静心得意」四个古朴篆文，为首那个「静」字神意饱满——那是齐先生的本命字。', eff:{ k:'judge', v:1 } },
  { id:'chenshiyi', name:'陈十一印', price:230, src:'第38章《九境》（齐静春蛇胆石所刻）',
    desc:'同一方蛇胆石上刻下的第二枚私章，三个字：陈十一。不是要你成为谁，是要你做独一份的自己。', eff:{ k:'reduce', v:1, o:'once' } },
  { id:'xuehuapao', name:'雪花法袍', price:240, src:'肤腻城白娘娘处（鬼蜮谷）',
    desc:'陈平安从白娘娘处夺得，值两三枚谷雨钱。一件法袍，护得住一身。', eff:{ k:'reduce', v:1, o:'turn' } },
  { id:'xiashan', name:'下山罐',     price:280, src:'第799章 和气斋',
    desc:'山上名为下山罐的小陶罐，看着不起眼，却是一件压胜鬼物的山上重宝。', eff:{ k:'reduce', v:1, o:'once' } },
  { id:'yangjian', name:'养剑葫芦·姜壶', price:300, src:'第202章（山神魏檗所赠）',
    desc:'魏檗送来的养剑葫芦，名唤「姜壶」，与「江湖」谐音——是在说，少年该去闯荡了。', eff:{ k:'atk', v:1 } },
  { id:'shanshui', name:'清禄福地山水画册', price:320, src:'第799章 和气斋',
    desc:'清禄福地山水画册。看山是山，看久了，山也看你。', eff:{ k:'regen', v:1 } },
  { id:'huaiye', name:'祖荫槐叶', price:350, src:'骊珠洞天老槐树（一说齐先生为陈平安求得姚家槐叶）',
    desc:'小镇那株老槐树所结的叶子。老槐树是四姓十族气运所化，一片槐叶便抵得一族气运庇佑。', eff:{ k:'regen', v:1 } },
  { id:'yuzhu',   name:'玉竹扇子',   price:400, src:'第799章 和气斋',
    desc:'一面节录苏子祈雨贴，一面草书写《龙蜇诗》，末尾写那芒种时节，风雨雷电，闭户写此。落款是谪仙山柳洲。', eff:{ k:'hitdraw', v:1 } },
  { id:'shanxiao', name:'山魈养心壶', price:460, src:'第799章 和气斋',
    desc:'底款刻「山魈」二字的小小养心壶。品秩极高，最适宜修养道心、润泽气府；壶中别有小洞天，是件方寸物。', eff:{ k:'hand', v:1 } },
  { id:'longwang', name:'龙王篓', price:620, src:'骊珠洞天机缘（远古仙界之物，与金鲤相合）',
    desc:'远古仙界流传下来的龙王篓，可掌握一洲水文，天下水中之物莫敢不从。', eff:{ k:'range', v:1 } },
  { id:'dongtian', name:'破碎洞天福地', price:1200, src:'第799章 和气斋',
    desc:'几座破碎的洞天福地——只要钱足够，一样都可以买走。镇店之物，非谷雨钱不议。', eff:{ k:'atkLimit', v:1 } },
];

/* ===================== 藏书阁 · 书目（出处均为原著明载） ===================== */
const BF_BOOKS = [
  { id:'xiaoxue', name:'《小学》', price:35, src:'齐静春所选蒙学（赠宋集薪）',
    desc:'蒙学之始。识字、明句读，先知道字是怎么写的，才谈得上学问。', eff:{ k:'hand', v:1 } },
  { id:'liyue',   name:'《礼乐》', price:45, src:'齐静春所选蒙学（赠宋集薪）',
    desc:'礼以正身，乐以正心。守得住规矩的人，才扛得住事。', eff:{ k:'reduce', v:1, o:'turn' } },
  { id:'guanzhi', name:'《观止》', price:60, src:'齐静春所选蒙学（赠宋集薪）',
    desc:'见过最好的，次一等的就糊弄不过去。眼界既开，出手自有分寸。', eff:{ k:'hitdraw', v:1 } },
  { id:'hanshan', name:'《撼山谱》', price:80, src:'顾璨赠陈平安（祖传）',
    desc:'长生桥断时，陈平安靠六步走桩续命，也由此在武学上扎下根子。武夫的路数，见了血，拳脚反而更沉。', eff:{ k:'atk', v:1, c:'hurt' } },
  { id:'taoli',   name:'《桃李》', price:100, src:'齐静春赠宋集薪（棋谱）',
    desc:'棋谱一册。落子留后手，走一步看三步——剑也是这么递的。', eff:{ k:'draw', v:1 } },
  { id:'jingwei', name:'《精微》', price:120, src:'齐静春赠宋集薪（术算）',
    desc:'齐静春私下精研三门学问：术算、脉络、律法。术算之学，算的是分寸，差一分就差千里。', eff:{ k:'judge', v:1 } },
  { id:'shanhai', name:'《山海策》', price:140, src:'齐静春赠宋集薪（散文集）',
    desc:'散文集一册，记的是山海见闻。行万里路的人，剑才递得远。', eff:{ k:'range', v:1 } },
  { id:'shanshuihua', name:'清禄福地山水画册', price:260, src:'第799章 和气斋',
    desc:'与和气斋所售画册同源。看山久了，气自回。', eff:{ k:'regen', v:1 } },
  { id:'longzhe', name:'《龙蜇诗》', price:320, src:'玉竹扇面草书（谪仙山柳洲）',
    desc:'扇面草书，末尾写那芒种时节，风雨雷电，闭户写此。诗剑风流，一剑既出，尚可再出。', eff:{ k:'atkLimit', v:1 } },
];

const BF_EFFTXT = {
  atk:'剑气伤害', atkLimit:'每回合多出一剑', hand:'手牌上限', draw:'摸牌阶段多摸',
  judge:'判定点数', range:'攻击范围', nododge:'剑气不可被守心', reduce:'受伤减免',
  regen:'回合末回气', hitdraw:'命中后摸牌',
};
const BF_CONDTXT = { far:'（攻击范围外）', low:'（自身残血时）', hurt:'（自身已伤时）',
                     mang:'（对蛮荒）', faction:'（同阵营）' };

/* 散修摊位：真品池取自和气斋物件，赝品池取自原著骗局与常见"来路货" */
const BF_FAKE_NAMES = [
  { name:'凝运神宝玉玺', note:'自称文景国交泰殿十七宝之一，说是御玺流入民间。' },
  { name:'祖传剑胚',     note:'自称祖上出过地仙，剑胚是家传的。' },
  { name:'仙人符箓一叠', note:'说是某位大剑仙醉酒后所传，一叠黄纸，一张不少。' },
  { name:'福地残图',     note:'说是半幅福地舆图，缺的那半幅在别人手里。' },
  { name:'雷法铜印',     note:'说是山上雷部流传下来的法印，印文已磨。' },
];
const BF_FAKE_ICON = ['yuxi','jianpei','fulu','cantu','tongyin'];

/* ===================== 存档 ===================== */
const BF_KEY = 'jianlai_baofu';
const BF_VER = 2;
function bfDefault(){
  return { v:BF_VER, coin:0, debt:0, read:[], marks:[], gear:[], owned:[], fakes:[],
           seen:[], stall:[], say:'', rouDate:'', loadout:[] };
}
function bfLoad(){
  let o = null;
  try{ o = JSON.parse(lsGet(BF_KEY, 'null')); }catch(e){ o = null; }
  if(!o || typeof o!=='object') return bfDefault();
  if(o.v !== BF_VER){ const keep = Math.max(0, o.coin|0); const d = bfDefault(); d.coin = keep; return d; }
  return Object.assign(bfDefault(), o);
}
function bfSave(){ bfSyncLoadout(); try{ lsSet(BF_KEY, JSON.stringify(BF)); }catch(e){} }

/* 把「已装配的法宝 / 悟道印记」预计算成 eff 列表写进存档（loadout 字段）。
   起因：战斗引擎在主包（utils/engine.js），本模块在 packageRef 分包——主包引不到分包，
   战斗端拿不到 BF_GEAR / BF_BOOKS。故由本模块预先把 id 映射成 eff，战斗端只读 b.loadout：
   零数据复制、常量不会漂移（改物件表不必再同步第二处）。 */
function bfSyncLoadout(){
  const list = [];
  (BF.gear||[]).forEach(function(id){ const g=bfGear(id);
    if(g && g.eff) list.push({ n:g.name, k:g.eff.k, v:g.eff.v, o:g.eff.o||null, c:g.eff.c||null }); });
  (BF.marks||[]).forEach(function(id){ const b=bfBook(id);
    if(b && b.eff) list.push({ n:'悟·'+b.name, k:b.eff.k, v:b.eff.v, o:b.eff.o||null, c:b.eff.c||null }); });
  BF.loadout = list;
}

let BF = bfLoad();
let BF_TAB = 'heqi';
let BF_SAY = '';
let HOOK = null;
let FLOATS = [];   // 资源飘字（雪花钱增减等）

function emitView(){ if(HOOK) try{ HOOK(view()); }catch(e){ console.error(e); } }
function setHook(fn){ HOOK = fn; if(BF) emitView(); }

/* ===================== 工具 ===================== */
function bfGear(id){ for(const g of BF_GEAR){ if(g.id===id) return g; } return null; }
function bfBook(id){ for(const b of BF_BOOKS){ if(b.id===id) return b; } return null; }
function bfHas(id){ return BF.owned.indexOf(id) >= 0; }

/* 图标路径：物件 / 书目 / 假货，统一指向 /assets/icon/bf-*.svg */
function bfIcon(id){ return '/assets/icon/bf-' + id + '.svg'; }
function bfStallIcon(it){
  if(it.gid) return bfIcon(it.gid);
  for(let i=0;i<BF_FAKE_NAMES.length;i++){
    if(BF_FAKE_NAMES[i].name === it.name) return '/assets/icon/bf-fake' + BF_FAKE_ICON[i] + '.svg';
  }
  return '';
}
function bfInsight(){
  let v = BF_EYE_BASE + (BF.read.length||0) * BF_EYE_PER_BOOK;
  if(bfHas('xuehuapao')) v += BF_EYE_ROBE;
  return Math.min(BF_EYE_MAX, v);
}
function bfMarkSlots(){ return Math.min(BF_MARK_SLOT_MAX, 1 + Math.floor((BF.read.length||0)/3)); }

/* 雪花钱折算显示：≥1000 显示谷雨钱，≥100 显示小暑钱，否则雪花钱 */
function bfCoinText(n){
  n = Math.max(0, n|0);
  if(n >= BF_RATE.yu) return (n/BF_RATE.yu).toFixed(n%BF_RATE.yu===0?0:2) + ' 谷雨钱';
  if(n >= BF_RATE.shu) return Math.floor(n/BF_RATE.shu) + ' 小暑钱 ' + (n%BF_RATE.shu) + ' 雪花钱';
  return n + ' 雪花钱';
}
function bfEffText(eff){
  if(!eff) return '—';
  const t = BF_EFFTXT[eff.k] || eff.k;
  return t + (eff.v ? ' +' + eff.v : '') + (BF_CONDTXT[eff.c]||'')
       + (eff.o==='turn' ? '，每回合限一次' : (eff.o==='once' ? '，每局限一次' : ''));
}
/* 资源飘字：只登记 + 定时清理，由调用方 emitView（避免一次操作推两遍视图） */
function bfFloat(text){
  const id = FLOATS.length ? (FLOATS[FLOATS.length-1].id + 1) : 1;
  FLOATS.push({ id:id, text:text });
  setTimeout(function(){ FLOATS = FLOATS.filter(f=>f.id!==id); emitView(); }, 1400);
}

/* 跨模块：战局结账、拣漏、读书等可回报行迹录（行者录）道行，若存在则调用 */
function bfTellProfile(kind, name){
  try{ if(typeof global!=='undefined' && global.__jl_profile_record){ global.__jl_profile_record('baofu', kind, name); } }catch(e){}
}

/* ===================== 掌柜 · 石柔 ===================== */
function bfIsNight(){ const d = new Date(); const h = d.getHours(); return (h >= 19 || h < 5); }
function bfToday(){ const d = new Date(); return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate(); }
function bfKeeperLine(){
  if(bfHas('xuehuapao'))
    return '「这件雪花法袍，我认得。」她多看了两眼，「山主从肤腻城那白衣鬼物手里夺来，原是给我的。你既买了，我总归多替你留一份心。」';
  if((BF.fakes||[]).length >= 3)
    return '「打眼了几回？不打紧。」她低头拨了拨算盘，「我这双眼睛，早年间被人借去看过落魄山，后来是崔东山替我斩断的。看错东西不打紧——」她没再说下去。';
  return bfIsNight()
    ? '「铺子打烊了。」她把灯芯挑亮了些，「你若要挑东西，慢慢看。」'
    : '「客官看中哪间，推门进去便是。」';
}
function bfKeeper(){
  return bfIsNight()
    ? { look:'彩衣长裙，对镜而坐——入夜，她才敢恢复女子真身' }
    : { look:'仙风道骨的男子模样，言语客气——白日里，她披着杜懋的遗蜕' };
}

/* ===================== 和气斋 ===================== */
function bfBuy(id){
  const g = bfGear(id);
  if(!g || bfHas(id)) return;
  if((BF.coin||0) < g.price){
    BF_SAY = '囊中 ' + bfCoinText(BF.coin) + '，还差 ' + (g.price - BF.coin) + ' 雪花钱。'
           + '和气斋历来可赊——相中了就先带走，日后再补。';
    SFX.click(); emitView(); return;
  }
  BF.coin -= g.price;
  BF.owned.push(id);
  if(BF.seen.indexOf(id) < 0) BF.seen.push(id);
  BF_SAY = '「' + g.name + '」记下了。符箓美人在门外挂上一面小木牌，上书四字——已结善缘。';
  bfSave(); bfTellProfile('buy', g.name); bfFloat('-' + g.price + ' 雪花钱'); SFX.click(); emitView();
}
function bfCredit(id){
  const g = bfGear(id);
  if(!g || bfHas(id)) return;
  if(BF.debt > 0){
    BF_SAY = '上一笔善缘还没补上。老祖师的规矩：赊可以，得先了了旧账。';
    SFX.click(); emitView(); return;
  }
  if(g.price > BF_CREDIT_MAX){
    BF_SAY = '此物太重，赊不得。至多赊 ' + BF_CREDIT_MAX + ' 雪花钱，再多就不是规矩了。';
    SFX.click(); emitView(); return;
  }
  BF.debt += g.price;
  BF.owned.push(id);
  if(BF.seen.indexOf(id) < 0) BF.seen.push(id);
  BF_SAY = '先拿去。日后在浩然天下任何一处包袱斋，随时补上即可——此非破例，是我们包袱斋历来有此定例。';
  bfSave(); bfTellProfile('buy', g.name); bfFloat('赊 ' + g.price + ' 雪花钱'); SFX.click(); emitView();
}
function bfSell(id){
  const g = bfGear(id);
  if(!g || !bfHas(id)) return;
  const back = Math.floor(g.price * BF_SELL_RATE);
  /* 防御旧档重复项：同 id 一次全摘，避免「卖一件还剩一件」反复变现 */
  for(let k=BF.gear.length-1;k>=0;k--){ if(BF.gear[k]===id) BF.gear.splice(k,1); }
  for(let k=BF.owned.length-1;k>=0;k--){ if(BF.owned[k]===id) BF.owned.splice(k,1); }
  BF.coin += back;
  BF_SAY = '退一半，这是规矩。' + back + ' 雪花钱入袋，木牌摘下。';
  bfSave(); bfFloat('+' + back + ' 雪花钱'); SFX.click(); emitView();
}
function bfRepay(){
  if(BF.debt <= 0) return;
  const pay = Math.min(BF.debt, BF.coin||0);
  if(pay <= 0){
    BF_SAY = '身上一个雪花钱也没有，拿什么补善缘？';
    SFX.click(); emitView(); return;
  }
  BF.coin -= pay; BF.debt -= pay;
  BF_SAY = '补上 ' + pay + ' 雪花钱，旧账两清' + (BF.debt>0 ? '，还欠 ' + BF.debt + '。' : '。');
  bfSave(); bfFloat('-' + pay + ' 雪花钱'); SFX.click(); emitView();
}

/* ===================== 拣漏（散修摊位） ===================== */
function bfRollStall(force){
  if(!force && BF.stall && BF.stall.length) return;
  /* 真品池排除已拥有之物（与 PC 同规则）：堵住重复购入 → owned 重复 id → 反复退货刷钱 */
  const pool = BF_GEAR.filter(function(g){ return BF.owned.indexOf(g.id) < 0; });
  const out = [];
  for(let i=0; i<BF_STALL_N && pool.length; i++){
    const idx = Math.floor(Math.random()*pool.length);
    const real = Math.random() < 0.55;
    const src = pool.splice(idx,1)[0];
    if(real){
      const ask = Math.max(6, Math.round(src.price * (0.4 + Math.random()*0.2)));
      out.push({ real:true, gid:src.id, name:src.name, ask, worth:src.price, note:'东西是真东西，就是来路说不太清。', eye:null });
    }else{
      const f = BF_FAKE_NAMES[Math.floor(Math.random()*BF_FAKE_NAMES.length)];
      const ask = Math.max(8, Math.round(src.price * (0.35 + Math.random()*0.35)));
      out.push({ real:false, gid:null, name:f.name, ask, worth:Math.round(ask*0.1), note:f.note, eye:null, fake:true });
    }
  }
  BF.stall = out;
  bfSave();
}
function bfEye(i){
  const it = BF.stall[i];
  if(!it || it.eye){ emitView(); return; }
  const acc = bfInsight();
  const hit = Math.random()*100 < acc;
  let tier;
  if(hit) tier = it.real ? (Math.random()<0.65 ? 'zhen' : 'weizhi') : 'jia';
  else    tier = ['zhen','weizhi','jia'][Math.floor(Math.random()*3)];
  const TXT = {
    zhen:  '东西压手，包浆自然，款识也对得上。大开门。',
    weizhi:'看不太准。说是祖上传的，可祖上是谁，他也说不清。来路不明。',
    jia:   '纸是新纸，锈是浮锈，故事讲得太圆。不大开门。',
  };
  it.eye = TXT[tier];
  BF_SAY = '你摩挲了一遍。（眼力 ' + acc + '%，看到的未必就是真的。）';
  bfSave(); bfTellProfile('eye', it.name); SFX.click(); emitView();
}
function bfBuyStall(i){
  const it = BF.stall[i];
  if(!it || it.done) return;
  /* 防御旧档残留的真品摊位：已拥有就不再重复入账 */
  if(it.real && it.gid && bfHas(it.gid)){
    BF_SAY = '这东西你已有一件，何必再买？这件留着，下回再看。';
    SFX.click(); emitView(); return;
  }
  if((BF.coin||0) < it.ask){
    BF_SAY = '散修不做赊买卖。' + it.ask + ' 雪花钱，一文都不能少。';
    SFX.click(); emitView(); return;
  }
  BF.coin -= it.ask;
  it.done = true;
  if(it.real){
    BF.owned.push(it.gid);
    if(BF.seen.indexOf(it.gid) < 0) BF.seen.push(it.gid);
    BF_SAY = '捡着了。「' + it.name + '」是真东西，作价 ' + it.worth + ' 雪花钱，你只花了 ' + it.ask + '。';
    bfTellProfile('real', it.name);
  }else{
    const key = 'fake_' + it.name;
    if(BF.fakes.indexOf(key) < 0) BF.fakes.push(key);
    BF_SAY = '打眼了。「' + it.name + '」是假的，' + it.ask + ' 雪花钱买了个数。——这行当，谁没打过眼呢。';
    bfTellProfile('fake', it.name);
  }
  bfSave(); bfFloat('-' + it.ask + ' 雪花钱'); SFX.click(); emitView();
}
function bfRefreshStall(){
  bfRollStall(true);
  BF_SAY = '换了三处摊子。散修的包袱斋没有落脚地儿，走到哪儿摆到哪儿。';
  bfSave(); SFX.click(); emitView();
}
/* 夜里石柔替你上第一手：每日一次 */
function bfRouEye(){
  if(!bfIsNight()) return;
  if(BF.rouDate === bfToday()) return;
  let i = -1;
  for(let k=0;k<(BF.stall||[]).length;k++){
    const it = BF.stall[k];
    if(it && !it.eye && !it.done){ i = k; break; }
  }
  if(i < 0) return;
  const it = BF.stall[i];
  it.eye = it.real ? '东西压手，包浆自然，款识也对得上。大开门。'
                   : '纸是新纸，锈是浮锈，故事讲得太圆。不大开门。';
  it.rouEye = true;
  BF.rouDate = bfToday();
  BF_SAY = '石柔接过去，只翻了两下就递回来。（这是她替你上的手。）';
  bfSave(); SFX.click(); emitView();
}

/* ===================== 藏书阁 ===================== */
function bfRead(id){
  const b = bfBook(id);
  if(!b || BF.read.indexOf(id) >= 0) return;
  if((BF.coin||0) < b.price){
    BF_SAY = '书价 ' + b.price + ' 雪花钱，你还差些。书不赊——字在纸上，纸在人手里，讲究现钱。';
    SFX.click(); emitView(); return;
  }
  BF.coin -= b.price;
  BF.read.push(id);
  if(BF.seen.indexOf('book_'+id) < 0) BF.seen.push('book_'+id);
  if(BF.marks.length < bfMarkSlots()) BF.marks.push(id);
  BF_SAY = '「' + b.name + '」读过了。眼力添了几分（' + bfInsight() + '%），悟道印记可装配 ' + bfMarkSlots() + ' 个。';
  bfSave(); bfFloat('-' + b.price + ' 雪花钱'); SFX.click(); emitView();
}
function bfToggleMark(id){
  if(BF.read.indexOf(id) < 0) return;
  const i = BF.marks.indexOf(id);
  if(i >= 0){ BF.marks.splice(i,1); BF_SAY = '「' + bfBook(id).name + '」的道理先收起来。'; }
  else{
    if(BF.marks.length >= bfMarkSlots()){
      BF_SAY = '身上只带得下 ' + bfMarkSlots() + ' 道印记。书读得多了，才带得多。';
      SFX.click(); emitView(); return;
    }
    BF.marks.push(id);
    BF_SAY = '「' + bfBook(id).name + '」的道理带在身上。';
  }
  bfSave(); SFX.click(); emitView();
}
function bfToggleGear(id){
  const g = bfGear(id);
  if(!g || !bfHas(id) || !g.eff) return;
  const i = BF.gear.indexOf(id);
  if(i >= 0){ BF.gear.splice(i,1); BF_SAY = '「' + g.name + '」收进行囊。'; }
  else{
    if(BF.gear.length >= BF_GEAR_SLOTS){
      BF_SAY = '随身只带得下 ' + BF_GEAR_SLOTS + ' 件。带多了，就不是行商，是搬家。';
      SFX.click(); emitView(); return;
    }
    BF.gear.push(id);
    BF_SAY = '「' + g.name + '」带在身上。';
  }
  bfSave(); SFX.click(); emitView();
}

/* ===================== 入口与快照 ===================== */
function open(){
  SFX.set && SFX.set(true); SFX.click();
  BF = bfLoad();
  bfRollStall(false);
  BF_SAY = '门开着。九十九间屋子，一间一物。看中哪间，推门进去便是。';
  emitView();
}
function tab(t){ BF_TAB = t; SFX.click(); emitView(); }

/* 物件房号（与 PC 同算法）：步长 4 对 99 取模，增减都不越九十九间 */
function bfRoomNo(n){
  const CN = ['','一','二','三','四','五','六','七','八','九'];
  const t = (n/10)|0, o = n%10;
  if(t === 0) return CN[o];
  if(t === 1) return '十' + (o ? CN[o] : '');
  return CN[t] + '十' + (o ? CN[o] : '');
}
const _bfRoomNum = function(i){ return 1 + ((3 + i*4 - 1) % 99); };

function view(){
  const coin = BF.coin||0, debt = BF.debt||0, insight = bfInsight(), slots = bfMarkSlots();
  const keeper = bfKeeper();
  const head = {
    coin: coin, coinText: bfCoinText(coin), debt: debt,
    insight: insight, marks: BF.marks.length, markSlots: slots, gear: BF.gear.length, gearSlots: BF_GEAR_SLOTS,
    keeperLook: keeper.look, keeperLine: bfKeeperLine(), say: BF_SAY,
    tab: BF_TAB
  };
  const tabs = [['heqi','和 气 斋'],['lou','拣 漏'],['shu','藏 书 阁'],['nang','行 囊 · 善 缘 录']];

  let body = {};
  if(BF_TAB==='heqi'){
    body = {
      kind:'heqi',
      note:'老祖师现身做生意，取出一处「和气斋」，开门迎客，总计九十九间屋子，每间屋子一般只卖一物。老祖师亲自掌眼的东西，不存在捡漏的可能——但价也实在。相中了可以先赊走，日后在浩然天下任何一处包袱斋补上即可，此非破例，是包袱斋历来定例。',
      rooms: BF_GEAR.map(function(g,i){
        const owned = bfHas(g.id);
        const on = BF.gear.indexOf(g.id) >= 0;
        const afford = coin >= g.price;
        let act;
        if(owned){
          if(g.eff) act = on ? '取 下' : '带 上';
          else act = '藏 品';
        }else{
          act = afford ? '买 下' : '钱不足';
        }
        return {
          id:g.id, name:g.name, icon:bfIcon(g.id), roomNo:bfRoomNo(_bfRoomNum(i)),
          owned:owned, on:on, eff:g.eff?bfEffText(g.eff):'', src:g.src, desc:g.desc,
          price:g.price, afford:afford, tag:g.eff?'法 宝':'藏 品',
          act:act, sellable:owned && !g.eff, canCredit:(!owned && !afford && debt<=0 && g.price<=BF_CREDIT_MAX)
        };
      }),
      debt: debt
    };
  } else if(BF_TAB==='lou'){
    bfRollStall(false);
    body = {
      kind:'lou',
      note:'有落脚地儿的铺子，捡漏的可能极小。没有落脚地儿的包袱斋，才是最让人撞运气、考究眼力的——多是山泽野修，四海为家。你的眼力 ' + insight + '%（读书可增，上限 ' + BF_EYE_MAX + '%——总还要留两成给运气）。',
      insight:insight, canRouEye:(bfIsNight() && BF.rouDate !== bfToday()),
      stalls: BF.stall.map(function(it,i){
        const afford = coin >= it.ask;
        let eyeBad = false;
        if(it.eye && it.eye.indexOf('不大开门')>=0) eyeBad = true;
        return {
          idx:i, name:it.name, icon:bfStallIcon(it), note:it.note, ask:it.ask, done:!!it.done,
          real:!!it.real, eye:it.eye||'', eyeBad:eyeBad, afford:afford, rouEye:!!it.rouEye,
          worth:it.worth||0
        };
      })
    };
  } else if(BF_TAB==='shu'){
    body = {
      kind:'shu',
      note:'包袱斋也卖书。书读了，眼力见长，也悟出些道理——那便是「悟道印记」，可带在身上入局。带得下几道，看你读过几本：' + BF.marks.length + ' / ' + slots + '（每读满三本，多带一道，至多 ' + BF_MARK_SLOT_MAX + ' 道）。',
      readCount:BF.read.length, bookTotal:BF_BOOKS.length, marks:BF.marks.length, markSlots:slots,
      books: BF_BOOKS.map(function(b){
        const got = BF.read.indexOf(b.id) >= 0;
        const on = BF.marks.indexOf(b.id) >= 0;
        const afford = coin >= b.price;
        return {
          id:b.id, name:b.name, icon:bfIcon(b.id), desc:b.desc, src:b.src,
          eff:got?bfEffText(b.eff):'', price:b.price, got:got, on:on, afford:afford,
          tag:got?'悟 道':'未 读', act: got ? (on?'收起印记':'带上印记') : (afford?'买 下 读':'钱不足')
        };
      })
    };
  } else {
    const ownedEff = BF.owned.filter(function(id){ const g=bfGear(id); return g && g.eff && BF.gear.indexOf(id)<0; });
    const keeps = BF.owned.filter(function(id){ const g=bfGear(id); return g && !g.eff; });
    body = {
      kind:'nang',
      note:'随身只带得下 ' + BF_GEAR_SLOTS + ' 件法宝、' + slots + ' 道印记。仗剑独行、剑气长城、天下共伐三处，随身之物与我同行；群雄论剑是同席切磋，按规矩不带私物入场。',
      gear: BF.gear.map(function(id){ const g=bfGear(id); return { id:id, name:g.name, icon:bfIcon(id), eff:bfEffText(g.eff), src:g.src }; }),
      marks: BF.marks.map(function(id){ const b=bfBook(id); return { id:id, name:'悟 · '+b.name, eff:bfEffText(b.eff) }; }),
      ownedEff: ownedEff.map(function(id){ const g=bfGear(id); return { id:id, name:g.name, icon:bfIcon(id), eff:bfEffText(g.eff), sellHalf:Math.floor(g.price*BF_SELL_RATE) }; }),
      keeps: keeps.map(function(id){ const g=bfGear(id); return { id:id, name:g.name, icon:bfIcon(id), src:g.src, sellHalf:Math.floor(g.price*BF_SELL_RATE) }; }),
      seen: BF.seen.map(function(k){
        if(k.indexOf('book_')===0){ const b=bfBook(k.slice(5)); return b ? b.name : k; }
        const g = bfGear(k); return g ? g.name : k;
      }),
      fakes: BF.fakes.map(function(k){ return k.slice(5); })
    };
  }

  return { ready:true, head:head, tabs:tabs, body:body, floats:FLOATS.slice() };
}

/* 由战局模块挂钩：一局终了结账，先抵赊欠，余下入袋 */
function bfAddCoin(n){
  if(!n) return null;
  const gain = n;
  let pay = 0;
  if(BF.debt > 0){
    pay = Math.min(BF.debt, n);
    BF.debt -= pay; n -= pay;
    BF_SAY = '结账。先抵赊欠 ' + pay + ' 雪花钱' + (n>0 ? '，余下 ' + n + ' 入袋。' : '。');
  }else{
    BF_SAY = '结账。雪花钱入袋 ' + n + '。';
  }
  BF.coin = Math.max(0, (BF.coin||0) + n);
  bfSave(); emitView();
  /* 返回结账明细，供结算页呈现（与 PC bfAddCoin 同口径） */
  return { gain:gain, pay:pay, net:gain-pay, coin:BF.coin, debt:BF.debt };
}
/* 由对战模块调用：给我方角色挂上随身法宝与悟道印记（hot 不注入，存公允） */
function bfApplyLoadout(players, mode){
  if(!players || !players.length || mode==='hot') return;
  const list = [];
  (BF.gear||[]).forEach(function(id){ const g = bfGear(id); if(g && g.eff) list.push({ n:g.name, k:g.eff.k, v:g.eff.v, o:g.eff.o||null, c:g.eff.c||null }); });
  (BF.marks||[]).forEach(function(id){ const b = bfBook(id); if(b && b.eff) list.push({ n:'悟·'+b.name, k:b.eff.k, v:b.eff.v, o:b.eff.o||null, c:b.eff.c||null }); });
  if(!list.length) return;
  players.forEach(function(p){
    const mine = (mode==='siege') ? p.side==='ally' : (mode==='boss') ? p.side==='hero' : (mode==='ai') ? p.id===0 : false;
    if(mine) p.extraSkills = list.slice();
  });
}

module.exports = {
  setHook:setHook, emitView:emitView, open:open, tab:tab, view:view,
  buy:bfBuy, credit:bfCredit, sell:bfSell, repay:bfRepay,
  eye:bfEye, buyStall:bfBuyStall, refreshStall:bfRefreshStall, rouEye:bfRouEye,
  read:bfRead, toggleMark:bfToggleMark, toggleGear:bfToggleGear,
  addCoin:bfAddCoin, applyLoadout:bfApplyLoadout,
  coinText:bfCoinText, insight:bfInsight, markSlots:bfMarkSlots,
  coinWin:BF_COIN_WIN, coinLose:BF_COIN_LOSE   // 供 _selftest 与主包 engine.BF_SETTLE 比对
};
