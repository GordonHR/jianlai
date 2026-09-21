'use strict';
/* =====================================================================
   包袱斋（PC 端 · 完整版）
   ---------------------------------------------------------------------
   【原著设定 · 已核，勿再按"随身小洞天/老聋儿掌柜"理解（那是 M1 的错误）】
   · 包袱斋：古玩行术语，指有眼力、无定所的行商。《剑来》中为一处松散门派／
     商铺势力，无金玉谱牒、无山头祖师堂，开山老祖师行踪不定；门下修士
     "走到哪里，生意就做到哪里"。（第799章《登高望远》）
   · 和气斋：老祖师现身做生意时，取出随身携带的一处"和气斋"，开门迎客，
     总计九十九间屋子，每间屋子一般只卖一物；卖出后由屋内符箓美人在门外
     挂一小木牌，上书四字"已结善缘"。（第799章 明载）
   · 赊欠定例：相中者可先行赊走，日后在浩然天下任何一处包袱斋补上即可；
     "并非破例，而是我们包袱斋历来有此定例"。（第799章 明载）
   · 散修包袱斋：没有落脚地儿的山泽野修，最让人撞运气、考究眼力；多从家道
     中落的豪阀子弟手中低价收货，或自称祖上出过地仙。（第374章 明载）
     经典骗局：跛脚汉子刘杆子兜售文景国"凝运神宝"玉玺（第374章 明载）
   · 老祖师亲掌眼的宝物，"不存在任何捡漏的可能性"；散修处才考眼力。
   · 神仙钱（山上钱）：1 谷雨钱 = 10 小暑钱 = 1000 雪花钱；1 雪花钱 = 1000 两白银。
   · 陈平安别称"账房先生"（第431章《岛上来了个账房先生》），本人亦做包袱斋
     生意：剑气长城城头摆摊卖符箓（路引符、剑气过桥符）。

   【本模块四板块】
     ① 和气斋 —— 老祖师亲掌眼，明码标价，绝不打眼，可赊欠
     ② 拣  漏 —— 散修摊位，价廉而真伪难辨，考眼力（掌眼 / 捡漏 / 打眼）
     ③ 藏书阁 —— 读原著明载之书，得"悟道印记"，装配后入局生效
     ④ 行囊·善缘录 —— 已得之物、已装配、图鉴（已结善缘 / 打眼录）

   【掌柜 · 石柔（2026-09-06 立）】骑龙巷压岁铺子代掌柜，落魄山门下。
     枯骨女鬼寄居桐叶宗杜懋的飞升境遗蜕：白日以杜懋的男子面目行走，入夜方复
     女子真身（彩衣长裙），无需睡眠。陈平安自肤腻城白衣鬼物处夺来的雪花法袍，
     转手送她——故她认得此袍，你若买了，她多替你留一份心（眼力 +5，游戏原创·推定）。
     夜里她跟着看摊，每日替你上第一手（游戏原创，据"无需睡眠"+"铺子掌柜"推定）。
     铺子里（和气斋 / 藏书阁 / 行囊）说话的是她；拣漏是散修摊前，她不在，为旁白。

   【不侵入战斗公式】所有生效一律走 game.js 既有 sumK/hasK 体系
   （atk / hand / draw / judge / range / reduce / hitdraw / regen / atkLimit / nododge），
   不新造任何伤害或判定公式。
   ===================================================================== */

/* ===================== 数值常量（集中于此，便于平衡调整） ===================== */
const BF_COIN_WIN     = 18;    // 胜局所得雪花钱
const BF_COIN_LOSE    = 6;     // 败局所得雪花钱
const BF_SELL_RATE    = 0.5;   // 退货折价（向下取整）
const BF_CREDIT_MAX   = 300;   // 赊欠上限（原著可赊，此处设额度以维持平衡）
const BF_GEAR_SLOTS   = 2;     // 随身法宝装配位
const BF_MARK_SLOT_MAX= 3;     // 悟道印记装配位上限
const BF_STALL_N      = 3;     // 散修摊位同时挂出的件数
const BF_EYE_BASE     = 30;    // 眼力基础值（%）
const BF_EYE_PER_BOOK = 10;    // 每读一本书的眼力加成（%）
const BF_EYE_MAX      = 80;    // 眼力上限（%），留两成运气，合"撞运气"原著语
const BF_EYE_ROBE     = 5;     // 石柔认得「雪花法袍」后多替你留一份心（%，游戏原创·推定）

/* 神仙钱换算：1 谷雨钱 = 10 小暑钱 = 1000 雪花钱；1 雪花钱 = 1000 两白银 */
const BF_RATE = { xue:1, shu:100, yu:1000 };

/* ===================== 和气斋 · 物件（出处均为原著明载） =====================
   eff 一律使用 game.js 既有技能键，v 为数值，o 为限次（turn/once），c 为条件 */
const BF_GEAR = [
  { id:'baigu',   name:'莹莹白骨',   price:12,  src:'骸骨滩（陈平安收集，欲高价转卖）',
    desc:'十几具莹莹如玉的白骨，陈平安打算在骸骨滩卖个好价钱。不值钱，但胜在量大。',
    keep:'藏品' },
  { id:'lufu',    name:'路引符',     price:30,  src:'剑气长城城头（陈平安摆摊所售）',
    desc:'城头摆摊时极力推销的符箓之一，据说是某位大剑仙醉酒后所传。行走之引。',
    eff:{ k:'range', v:1 } },
  { id:'wancai',  name:'五彩大碗',   price:55,  src:'第799章 和气斋',
    desc:'绘五谷丰登进宝图的五彩大碗。碗是盛东西的，盛得住，才留得下。',
    eff:{ k:'draw', v:1 } },
  { id:'bihai',   name:'琳琅仙府笔海', price:70, src:'第799章 和气斋',
    desc:'出自琳琅仙府，雕刻一幅仙家走马图，二十四节气各取一景，依次展现。',
    eff:{ k:'hand', v:1 } },
  { id:'bagua',   name:'山鬼雷公八卦花钱', price:80, src:'第799章 和气斋',
    desc:'山鬼雷公八卦花钱。花钱不是流通的钱，是压胜的钱，算得是另一路账。',
    eff:{ k:'judge', v:1 } },
  { id:'bingshu', name:'兵书',       price:95,  src:'剥落山避暑娘娘地库（陈平安所获）',
    desc:'地库中搜刮出的兵书。讲的不是一招一式的近身，是隔山打牛的策应。',
    eff:{ k:'atk', v:1, c:'far' } },
  { id:'menshen', name:'彩绘门神大木板', price:110, src:'第799章 和气斋',
    desc:'一对彩绘门神大木板。门神守的是门，门内一寸，不许外人踏。',
    eff:{ k:'reduce', v:1, o:'turn' } },
  { id:'lishi',   name:'力士石像头颅', price:130, src:'第799章 和气斋',
    desc:'几点力士石像头颅。石像无头仍能站，那股蛮力，还在里头。',
    eff:{ k:'atk', v:1 } },
  { id:'xiaoshuqian', name:'篆文稀少的小暑钱', price:120, src:'第799章 和气斋',
    desc:'一枚篆文极其稀少的小暑钱。钱本身不稀奇，稀奇的是篆文少。',
    keep:'藏品' },
  { id:'gongyang', name:'金精供养钱', price:140, src:'第17章《不平则鸣》（苻南华所给香火钱）',
    desc:'一袋子金精铜钱。供养钱是世间诸多香火钱之一，一般供在城隍庙、文昌阁的神像上——含在嘴里，藏在肚子里，托在手掌上，皆有可能。',
    keep:'藏品' },
  { id:'hantie',  name:'寒铁门扉',   price:150, src:'剥落山避暑娘娘地库（陈平安所获）',
    desc:'地库里的寒铁门扉。门一关，外头的事就进不来。',
    eff:{ k:'reduce', v:1, o:'once' } },
  { id:'laolong', name:'老龙布雨佩', price:165, src:'第17章《不平则鸣》（苻南华赠宋集薪）',
    desc:'算不得什么威力巨大的仙家法宝，只能够避暑清心与避秽，尤其对冥想坐忘大有裨益。若有一门道家上宗秘传口诀相佐，事半功倍。',
    eff:{ k:'regen', v:1 } },
  { id:'jianqiao', name:'剑气过桥符', price:190, src:'剑气长城城头（陈平安摆摊所授）',
    desc:'说是某位大剑仙醉酒后所传。剑气过桥，守心拦不住。',
    eff:{ k:'nododge', v:1 } },
  { id:'jingxin', name:'静心得意印', price:210, src:'第38章《九境》（齐静春蛇胆石所刻）',
    desc:'最上等的蛇胆石雕成，刻「静心得意」四个古朴篆文，为首那个「静」字神意饱满——那是齐先生的本命字。心静了，出手才稳。',
    eff:{ k:'judge', v:1 } },
  { id:'chenshiyi', name:'陈十一印', price:230, src:'第38章《九境》（齐静春蛇胆石所刻）',
    desc:'同一方蛇胆石上刻下的第二枚私章，三个字：陈十一。不是要你成为谁，是要你做独一份的自己。真到了挡灾的时候，它替你顶一下。',
    eff:{ k:'reduce', v:1, o:'once' } },
  { id:'xuehuapao', name:'雪花法袍', price:240, src:'肤腻城白娘娘处（鬼蜮谷）',
    desc:'陈平安从白娘娘处夺得，值两三枚谷雨钱。一件法袍，护得住一身。',
    eff:{ k:'reduce', v:1, o:'turn' } },
  { id:'xiashan', name:'下山罐',     price:280, src:'第799章 和气斋',
    desc:'山上名为下山罐的小陶罐，看着不起眼，却是一件压胜鬼物的山上重宝。',
    eff:{ k:'reduce', v:1, o:'once' } },
  { id:'yangjian', name:'养剑葫芦·姜壶', price:300, src:'第202章（山神魏檗所赠）',
    desc:'魏檗送来的养剑葫芦，名唤「姜壶」，与「江湖」谐音——是在说，少年该去闯荡了。葫芦养剑，剑气自纯，剑出便多一分锋芒。',
    eff:{ k:'atk', v:1 } },
  { id:'shanshui', name:'清禄福地山水画册', price:320, src:'第799章 和气斋',
    desc:'清禄福地山水画册。看山是山，看久了，山也看你。',
    eff:{ k:'regen', v:1 } },
  { id:'huaiye', name:'祖荫槐叶', price:350, src:'骊珠洞天老槐树（一说齐先生为陈平安求得姚家槐叶）',
    desc:'小镇那株老槐树所结的叶子。老槐树是四姓十族气运所化，一片槐叶便抵得一族气运庇佑，能挡灾祸、续性命。得了姚家的叶，此后遇姚而止，逢姚必救。',
    eff:{ k:'regen', v:1 } },
  { id:'yuzhu',   name:'玉竹扇子',   price:400, src:'第799章 和气斋',
    desc:'一面节录苏子祈雨贴，一面草书写《龙蜇诗》，末尾写那芒种时节，风雨雷电，闭户写此。落款是谪仙山柳洲。',
    eff:{ k:'hitdraw', v:1 } },
  { id:'shanxiao', name:'山魈养心壶', price:460, src:'第17章《不平则鸣》·第1088章（底款「山魈」）',
    desc:'底款刻「山魈」二字的小小养心壶。品秩极高，最适宜修养道心、润泽气府；更要紧的是壶中别有小洞天，是件方寸物——装得下东西，也装得下事。',
    eff:{ k:'hand', v:1 } },
  { id:'longwang', name:'龙王篓', price:620, src:'骊珠洞天机缘（远古仙界之物，与金鲤相合）',
    desc:'远古仙界流传下来的龙王篓，可掌握一洲水文，天下水中之物莫敢不从，连那吞云吐雾的蛟龙之属，见了也要引颈就戮。篓口一开，一洲水路尽在掌中。',
    eff:{ k:'range', v:1 } },
  { id:'dongtian', name:'破碎洞天福地', price:1200, src:'第799章 和气斋',
    desc:'几座破碎的洞天福地——只要钱足够，一样都可以买走。镇店之物，非谷雨钱不议。',
    eff:{ k:'atkLimit', v:1 } },
];

/* ===================== 藏书阁 · 书目（出处均为原著明载） =====================
   齐静春送宋集薪六本：术算《精微》、棋谱《桃李》、散文集《山海策》，
   蒙学三书《礼乐》《观止》《小学》。顾璨赠陈平安祖传《撼山谱》。 */
const BF_BOOKS = [
  { id:'xiaoxue', name:'《小学》', price:35, src:'齐静春所选蒙学（赠宋集薪）',
    desc:'蒙学之始。识字、明句读，先知道字是怎么写的，才谈得上学问。',
    eff:{ k:'hand', v:1 } },
  { id:'liyue',   name:'《礼乐》', price:45, src:'齐静春所选蒙学（赠宋集薪）',
    desc:'礼以正身，乐以正心。守得住规矩的人，才扛得住事。',
    eff:{ k:'reduce', v:1, o:'turn' } },
  { id:'guanzhi', name:'《观止》', price:60, src:'齐静春所选蒙学（赠宋集薪）',
    desc:'见过最好的，次一等的就糊弄不过去。眼界既开，出手自有分寸。',
    eff:{ k:'hitdraw', v:1 } },
  { id:'hanshan', name:'《撼山谱》', price:80, src:'顾璨赠陈平安（祖传）',
    desc:'长生桥断时，陈平安靠六步走桩续命，也由此在武学上扎下根子。武夫的路数，见了血，拳脚反而更沉。',
    eff:{ k:'atk', v:1, c:'hurt' } },
  { id:'taoli',   name:'《桃李》', price:100, src:'齐静春赠宋集薪（棋谱）',
    desc:'棋谱一册。落子留后手，走一步看三步——剑也是这么递的。',
    eff:{ k:'draw', v:1 } },
  { id:'jingwei', name:'《精微》', price:120, src:'齐静春赠宋集薪（术算）',
    desc:'齐静春私下精研三门学问：术算、脉络、律法。术算之学，算的是分寸，差一分就差千里。',
    eff:{ k:'judge', v:1 } },
  { id:'shanhai', name:'《山海策》', price:140, src:'齐静春赠宋集薪（散文集）',
    desc:'散文集一册，记的是山海见闻。行万里路的人，剑才递得远。',
    eff:{ k:'range', v:1 } },
  { id:'shanshuihua', name:'清禄福地山水画册', price:260, src:'第799章 和气斋',
    desc:'与和气斋所售画册同源。看山久了，气自回。',
    eff:{ k:'regen', v:1 } },
  { id:'longzhe', name:'《龙蜇诗》', price:320, src:'玉竹扇面草书（谪仙山柳洲）',
    desc:'扇面草书，末尾写那芒种时节，风雨雷电，闭户写此。诗剑风流，一剑既出，尚可再出。',
    eff:{ k:'atkLimit', v:1 } },
];

/* 技能键 → 人话（与 game.js skillText 口径一致，不另造） */
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

/* ===================== 存档 ===================== */
const BF_KEY = 'jianlai_baofu';
const BF_VER = 2;
function bfDefault(){
  return { v:BF_VER, coin:0, debt:0, read:[], marks:[], gear:[], owned:[], fakes:[],
           seen:[], stall:[], say:'', rouDate:'' };
}
function bfLoad(){
  let o = null;
  try{ o = JSON.parse(localStorage.getItem(BF_KEY)||'null'); }catch(e){ o = null; }
  if(!o || typeof o!=='object') return bfDefault();
  if(o.v !== BF_VER){
    // 旧档（M1）迁移：只保留雪花钱，其余重置——M1 的"碎银/老聋儿"设定已作废
    const keep = Math.max(0, o.coin|0);
    const d = bfDefault(); d.coin = keep; return d;
  }
  return Object.assign(bfDefault(), o);
}
function bfSave(){ try{ localStorage.setItem(BF_KEY, JSON.stringify(BF)); }catch(e){} }
let BF = bfLoad();
let BF_SAY = '';
let BF_TAB = 'heqi';

/* ===================== 工具 ===================== */
function bfGear(id){ for(const g of BF_GEAR){ if(g.id===id) return g; } return null; }
function bfBook(id){ for(const b of BF_BOOKS){ if(b.id===id) return b; } return null; }

/* 物件／书目图标：按 id 派生路径，缺图由 onerror 兜底（不硬塞占位） */
function bfIcon(id, small){
  return '<img class="bf-ico'+(small?'-s':'')+'" src="assets/icon/bf-'+id+'.svg" alt="" aria-hidden="true"'
       + ' onerror="this.style.display=\'none\'">';
}
/* 摊位货品：真品用物件图，赝品按名字对号（假货不配真图） */
const BF_FAKE_ICON = ['yuxi','jianpei','fulu','cantu','tongyin'];
function bfStallIcon(it){
  if(it.gid) return bfIcon(it.gid);
  for(let i=0;i<BF_FAKE_NAMES.length;i++){
    if(BF_FAKE_NAMES[i].name === it.name) return bfIcon('fake'+BF_FAKE_ICON[i]);
  }
  return '';
}
function bfInsight(){
  let v = BF_EYE_BASE + (BF.read.length||0) * BF_EYE_PER_BOOK;
  if(bfHas('xuehuapao')) v += BF_EYE_ROBE;   // 她认得这件法袍，替你多看两眼
  return Math.min(BF_EYE_MAX, v);
}

/* ===================== 掌柜 · 石柔 =====================
   原著：骑龙巷压岁铺子代掌柜；枯骨女鬼寄居桐叶宗杜懋的飞升境遗蜕，
   白日以杜懋的男子面目行走人间，入夜才恢复女子真身（一身彩衣、长裙大袖）；
   无需睡眠。陈平安自肤腻城白衣鬼物处夺来的雪花法袍，转手送给了她。
   ——故此处以时辰分昼夜两副面目；「夜里代掌一眼」为游戏原创（据"无需睡眠"+"铺子掌柜"推定）。 */
function bfIsNight(){ const h = new Date().getHours(); return (h >= 19 || h < 5); }
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
/* 夜里石柔替你上第一手：每日一次，她说的是她看到的（不受眼力所限） */
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
  bfSave();
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}
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
function bfMarkSlots(){
  return Math.min(BF_MARK_SLOT_MAX, 1 + Math.floor((BF.read.length||0)/3));
}

/* 由 game.js 的 updateRecord(win, mode) 挂钩：一局终了结账，先抵赊欠，余下入袋 */
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
  bfSave();
  /* 返回结账明细，供结算界面呈现（原先只悄悄入账，玩家不知赚了多少） */
  return { gain:gain, pay:pay, net:gain-pay, coin:BF.coin, debt:BF.debt };
}

/* ===================== 装配（入局生效） ===================== */
/* 由 startGame 调用：给我方角色挂上随身法宝与悟道印记。
   群雄论剑（hot）为同席切磋，不带随身之物入场，以存公允。 */
function bfApplyLoadout(players, mode){
  if(!players || !players.length || mode==='hot') return;
  const list = [];
  (BF.gear||[]).forEach(id=>{
    const g = bfGear(id);
    if(g && g.eff) list.push({ n:g.name, k:g.eff.k, v:g.eff.v, o:g.eff.o||null, c:g.eff.c||null });
  });
  (BF.marks||[]).forEach(id=>{
    const b = bfBook(id);
    if(b && b.eff) list.push({ n:'悟·'+b.name, k:b.eff.k, v:b.eff.v, o:b.eff.o||null, c:b.eff.c||null });
  });
  if(!list.length) return;
  players.forEach(p=>{
    const mine = (mode==='siege') ? p.side==='ally'
               : (mode==='boss')  ? p.side==='hero'
               : (mode==='ai')    ? p.id===0
               : false;
    if(mine) p.extraSkills = list.slice();
  });
}

/* ===================== 样式注入 ===================== */
(function injectBaofuStyle(){
  if(document.getElementById('baofu-style')) return;
  const css = `
  .baofu{ color:#ece6d8; max-width:1080px; margin:0 auto; padding:18px 6px; }
  .bf-head{ display:flex; align-items:flex-end; justify-content:space-between; flex-wrap:wrap; gap:10px;
    border-bottom:1px solid rgba(232,198,106,.3); padding-bottom:12px; margin-bottom:14px; }
  .bf-title{ font-family:var(--kai); font-size:30px; color:var(--gold); letter-spacing:6px; }
  .bf-title small{ font-family:inherit; font-size:13px; color:#b9ad8f; letter-spacing:2px; margin-left:12px; }
  .bf-purse{ text-align:right; font-size:12px; color:#b9ad8f; line-height:1.8; }
  .bf-purse b{ color:var(--gold); font-size:19px; font-weight:normal; }
  .bf-purse .owe{ color:#c98b6b; }

  .bf-tabs{ display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
  .bf-tab{ cursor:pointer; font-size:13px; padding:6px 16px; border-radius:8px;
    border:1px solid rgba(232,198,106,.28); color:#b9ad8f; background:transparent; }
  .bf-tab.on{ color:var(--gold); border-color:var(--gold); background:rgba(232,198,106,.10); }

  .bf-say{ background:rgba(20,17,15,.55); border:1px solid rgba(232,198,106,.22);
    border-left:3px solid rgba(232,198,106,.55); border-radius:8px;
    padding:10px 14px; font-size:13px; color:#d8cfb6; line-height:1.7; margin-bottom:16px; }
  .bf-say b{ color:var(--gold); font-weight:normal; }
  .bf-say .who{ color:#9a917f; margin-right:8px; }

  .bf-keeper{ display:flex; flex-wrap:wrap; align-items:baseline; gap:10px; margin-bottom:12px; }
  .bf-keeper .kp-n{ font-family:var(--kai); font-size:14px; color:var(--gold); letter-spacing:2px; }
  .bf-keeper .kp-look{ font-size:12px; color:#7d7666; }
  .bf-keeper .kp-line{ flex-basis:100%; margin-top:6px; font-size:13px; color:#cdb98a;
    line-height:1.7; border-left:2px solid rgba(232,198,106,.3); padding-left:9px; }
  .bf-r-name small{ font-size:11px; color:#7d7666; letter-spacing:1px; margin-left:8px; }
  .bf-slotbar .bf-btn{ margin-left:10px; }

  .bf-note{ font-size:12px; color:#9a917f; line-height:1.7; margin-bottom:14px; }
  .bf-sec{ font-family:var(--kai); font-size:18px; color:var(--gold); letter-spacing:3px;
    border-left:3px solid var(--gold); padding-left:9px; margin:20px 0 10px; }
  .bf-sec span{ font-family:inherit; font-size:12px; color:#b9ad8f; letter-spacing:1px; margin-left:10px; }

  .bf-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:10px; }
  .bf-room{ background:rgba(20,17,15,.55); border:1px solid rgba(232,198,106,.22);
    border-radius:10px; padding:12px 14px; position:relative; }
  .bf-room.sold{ border-color:rgba(232,198,106,.14); }
  .bf-r-top{ display:flex; align-items:baseline; justify-content:space-between; gap:8px; }
  .bf-r-name{ font-family:var(--kai); font-size:17px; color:#f0e6cc; letter-spacing:2px; }
  .bf-ico{ width:26px; height:26px; vertical-align:-7px; margin-right:8px; }
  .bf-ico-s{ width:20px; height:20px; vertical-align:-5px; margin-right:6px; }
  .kp-ico{ width:30px; height:30px; vertical-align:-9px; margin-right:8px; }
  .bf-r-tag{ font-size:11px; color:#9a917f; border:1px solid rgba(232,198,106,.25);
    border-radius:9px; padding:1px 7px; white-space:nowrap; }
  .bf-r-desc{ font-size:12px; color:#b9ad8f; line-height:1.7; margin:7px 0 6px; }
  .bf-r-eff{ font-size:12px; color:#cdb98a; margin-bottom:4px; }
  .bf-r-src{ font-size:11px; color:#7d7666; margin-bottom:9px; }
  .bf-r-buy{ display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; }
  .bf-price{ font-size:13px; color:#cdb98a; }
  .bf-price b{ color:var(--gold); font-size:16px; font-weight:normal; }
  .bf-plaque{ position:absolute; top:10px; right:10px; font-size:11px; letter-spacing:2px;
    color:#8a7f5f; border:1px solid rgba(232,198,106,.3); border-radius:4px; padding:2px 6px;
    background:rgba(232,198,106,.06); }

  .bf-btn{ font-family:inherit; cursor:pointer; font-size:13px; padding:6px 14px; border-radius:8px;
    border:1px solid rgba(232,198,106,.4); background:rgba(232,198,106,.08); color:var(--gold); }
  .bf-btn:hover{ background:rgba(232,198,106,.16); }
  .bf-btn.primary{ background:var(--gold); color:#1a140c; border-color:var(--gold); }
  .bf-btn.primary:hover{ background:#f0dcaa; }
  .bf-btn:disabled{ cursor:not-allowed; background:rgba(232,198,106,.04);
    border-color:rgba(232,198,106,.18); color:#8a8578; }
  .bf-btn:disabled:hover{ background:rgba(232,198,106,.04); }
  .bf-btns{ display:flex; gap:8px; flex-wrap:wrap; }

  .bf-bag{ display:flex; flex-wrap:wrap; gap:10px; }
  .bf-bag-i{ background:rgba(20,17,15,.55); border:1px solid rgba(232,198,106,.22);
    border-radius:10px; padding:10px 12px; min-width:190px; }
  .bf-bag-i.on{ border-color:var(--gold); }
  .bf-bag-i.fake{ border-color:rgba(160,110,90,.4); }
  .bf-bag-n{ font-family:var(--kai); font-size:15px; color:#f0e6cc; letter-spacing:1px; }
  .bf-bag-c{ font-size:12px; color:#b9ad8f; margin:4px 0 8px; line-height:1.6; }
  .bf-empty{ font-size:13px; color:#9a917f; line-height:1.7; }
  .bf-slotbar{ font-size:12px; color:#b9ad8f; margin-bottom:10px; }
  .bf-slotbar b{ color:var(--gold); font-weight:normal; }

  .bf-eye{ font-size:12px; color:#cdb98a; margin:6px 0; line-height:1.7;
    border-left:2px solid rgba(232,198,106,.4); padding-left:8px; }
  .bf-eye.bad{ border-left-color:rgba(180,110,90,.6); color:#c99b86; }

  .bf-foot{ margin-top:26px; text-align:center; }
  .bf-foot .fbtn{ cursor:pointer; font-size:12px; padding:6px 16px; color:#cdb98a;
    border:1px solid rgba(232,198,106,.3); border-radius:8px; }
  .bf-foot .fbtn:hover{ color:var(--gold); border-color:rgba(232,198,106,.55); }

  /* 结算页 · 包袱斋结账行（本局雪花钱得数） */
  .rs-coin{ display:flex; align-items:baseline; justify-content:center; gap:14px; flex-wrap:wrap;
    margin:12px auto 4px; font-size:13px; color:#b9ad8f; }
  .rs-coin .rc-k{ font-family:var(--kai); letter-spacing:3px; color:#9a917f; }
  .rs-coin .rc-v{ font-family:var(--kai); font-size:20px; color:var(--gold); letter-spacing:1px; }
  .rs-coin .rc-pay{ font-size:12px; color:#c98b6b; }
  .rs-coin .rc-net{ font-size:12px; color:#7d7666; }
  `;
  const st = document.createElement('style');
  st.id = 'baofu-style';
  st.textContent = css;
  document.head.appendChild(st);
})();

/* ===================== 和气斋 ===================== */
function bfHas(id){ return BF.owned.indexOf(id) >= 0; }

function bfBuy(id){
  const g = bfGear(id);
  if(!g || bfHas(id)) return;
  if((BF.coin||0) < g.price){
    BF_SAY = '囊中 ' + bfCoinText(BF.coin) + '，还差 ' + (g.price - BF.coin) + ' 雪花钱。'
           + '和气斋历来可赊——相中了就先带走，日后再补。';
    if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
    render(); return;
  }
  BF.coin -= g.price;
  BF.owned.push(id);
  if(BF.seen.indexOf(id) < 0) BF.seen.push(id);
  BF_SAY = '「' + g.name + '」记下了。符箓美人在门外挂上一面小木牌，上书四字——已结善缘。';
  bfSave();
  try{ if(typeof prRecordBaofu==='function') prRecordBaofu('buy', g.name); }catch(e){}
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

/* 赊欠：包袱斋历来定例，非为谁破例 */
function bfCredit(id){
  const g = bfGear(id);
  if(!g || bfHas(id)) return;
  if(BF.debt > 0){
    BF_SAY = '上一笔善缘还没补上。老祖师的规矩：赊可以，得先了了旧账。';
    if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
    render(); return;
  }
  if(g.price > BF_CREDIT_MAX){
    BF_SAY = '此物太重，赊不得。至多赊 ' + BF_CREDIT_MAX + ' 雪花钱，再多就不是规矩了。';
    if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
    render(); return;
  }
  BF.debt += g.price;
  BF.owned.push(id);
  if(BF.seen.indexOf(id) < 0) BF.seen.push(id);
  BF_SAY = '先拿去。日后在浩然天下任何一处包袱斋，随时补上即可——'
         + '此非破例，是我们包袱斋历来有此定例。';
  bfSave();
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

/* 退货：折半，这是行里的规矩 */
function bfSell(id){
  const g = bfGear(id);
  if(!g || !bfHas(id)) return;
  const back = Math.floor(g.price * BF_SELL_RATE);
  /* 防御旧档重复项：同 id 一次全摘，避免「卖一件还剩一件」反复变现 */
  for(let k=BF.gear.length-1;k>=0;k--){ if(BF.gear[k]===id) BF.gear.splice(k,1); }
  for(let k=BF.owned.length-1;k>=0;k--){ if(BF.owned[k]===id) BF.owned.splice(k,1); }
  BF.coin += back;
  BF_SAY = '退一半，这是规矩。' + back + ' 雪花钱入袋，木牌摘下。';
  bfSave();
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

function bfRepay(){
  if(BF.debt <= 0) return;
  const pay = Math.min(BF.debt, BF.coin||0);
  if(pay <= 0){
    BF_SAY = '身上一个雪花钱也没有，拿什么补善缘？';
    if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
    render(); return;
  }
  BF.coin -= pay; BF.debt -= pay;
  BF_SAY = '补上 ' + pay + ' 雪花钱，旧账两清' + (BF.debt>0 ? '，还欠 ' + BF.debt + '。' : '。');
  bfSave();
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

/* ===================== 拣漏（散修摊位） ===================== */
function bfRollStall(force){
  if(!force && BF.stall && BF.stall.length) return;
  /* 真品池排除已拥有之物：好东西收走了就是收走了，摊上不再挂（合原著"宝物有主"）。
     同时堵住「重复购入同一物件 → owned 出现重复 id → 反复退货刷钱」的漏洞。 */
  const pool = BF_GEAR.filter(g => BF.owned.indexOf(g.id) < 0);
  const out = [];
  for(let i=0; i<BF_STALL_N && pool.length; i++){
    const idx = Math.floor(Math.random()*pool.length);
    const real = Math.random() < 0.55;                 // 真品概率：留足"撞运气"的余地
    const src = pool.splice(idx,1)[0];
    if(real){
      // 真：要价约为实价的四到六成，捡漏就捡在这里
      const ask = Math.max(6, Math.round(src.price * (0.4 + Math.random()*0.2)));
      out.push({ real:true, gid:src.id, name:src.name, ask, worth:src.price,
                 note:'东西是真东西，就是来路说不太清。', eye:null });
    }else{
      const f = BF_FAKE_NAMES[Math.floor(Math.random()*BF_FAKE_NAMES.length)];
      const ask = Math.max(8, Math.round(src.price * (0.35 + Math.random()*0.35)));
      out.push({ real:false, gid:null, name:f.name, ask, worth:Math.round(ask*0.1),
                 note:f.note, eye:null, fake:true });
    }
  }
  BF.stall = out;
  bfSave();
}

/* 掌眼：眼力越高，评语越准；眼力留两成运气，合原著"撞运气"的说法 */
function bfEye(i){
  const it = BF.stall[i];
  if(!it || it.eye) { render(); return; }
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
  bfSave();
  try{ if(typeof prRecordBaofu==='function') prRecordBaofu('eye', it.name); }catch(e){}
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

function bfBuyStall(i){
  const it = BF.stall[i];
  if(!it || it.done) return;
  /* 防御旧档残留的真品摊位：已拥有就不再重复入账 */
  if(it.real && it.gid && bfHas(it.gid)){
    BF_SAY = '这东西你已有一件，何必再买？这件留着，下回再看。';
    if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
    render(); return;
  }
  if((BF.coin||0) < it.ask){
    BF_SAY = '散修不做赊买卖。' + it.ask + ' 雪花钱，一文都不能少。';
    if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
    render(); return;
  }
  BF.coin -= it.ask;
  it.done = true;
  if(it.real){
    BF.owned.push(it.gid);
    if(BF.seen.indexOf(it.gid) < 0) BF.seen.push(it.gid);
    BF_SAY = '捡着了。「' + it.name + '」是真东西，作价 ' + it.worth + ' 雪花钱，'
           + '你只花了 ' + it.ask + '。这才是包袱斋的门道。';
  }else{
    const key = 'fake_' + it.name;
    if(BF.fakes.indexOf(key) < 0) BF.fakes.push(key);
    BF_SAY = '打眼了。「' + it.name + '」是假的，' + it.ask + ' 雪花钱买了个数。'
           + '——这行当，谁没打过眼呢。';
  }
  try{ if(typeof prRecordBaofu==='function') prRecordBaofu(it.real?'real':'fake', it.name); }catch(e){}
  bfSave();
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

function bfRefreshStall(){
  bfRollStall(true);
  BF_SAY = '换了三处摊子。散修的包袱斋没有落脚地儿，走到哪儿摆到哪儿。';
  bfSave();
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

/* ===================== 藏书阁 ===================== */
function bfRead(id){
  const b = bfBook(id);
  if(!b || BF.read.indexOf(id) >= 0) return;
  if((BF.coin||0) < b.price){
    BF_SAY = '书价 ' + b.price + ' 雪花钱，你还差些。书不赊——字在纸上，纸在人手里，讲究现钱。';
    if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
    render(); return;
  }
  BF.coin -= b.price;
  BF.read.push(id);
  if(BF.seen.indexOf('book_'+id) < 0) BF.seen.push('book_'+id);
  // 初读即装配（若还有位子）
  if(BF.marks.length < bfMarkSlots()) BF.marks.push(id);
  BF_SAY = '「' + b.name + '」读过了。眼力添了几分（' + bfInsight() + '%），'
         + '悟道印记可装配 ' + bfMarkSlots() + ' 个。';
  bfSave();
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

function bfToggleMark(id){
  if(BF.read.indexOf(id) < 0) return;
  const i = BF.marks.indexOf(id);
  if(i >= 0){ BF.marks.splice(i,1); BF_SAY = '「' + bfBook(id).name + '」的道理先收起来。'; }
  else{
    if(BF.marks.length >= bfMarkSlots()){
      BF_SAY = '身上只带得下 ' + bfMarkSlots() + ' 道印记。书读得多了，才带得多。';
      if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
      render(); return;
    }
    BF.marks.push(id);
    BF_SAY = '「' + bfBook(id).name + '」的道理带在身上。';
  }
  bfSave();
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

function bfToggleGear(id){
  const g = bfGear(id);
  if(!g || !bfHas(id) || !g.eff) return;
  const i = BF.gear.indexOf(id);
  if(i >= 0){ BF.gear.splice(i,1); BF_SAY = '「' + g.name + '」收进行囊。'; }
  else{
    if(BF.gear.length >= BF_GEAR_SLOTS){
      BF_SAY = '随身只带得下 ' + BF_GEAR_SLOTS + ' 件。带多了，就不是行商，是搬家。';
      if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
      render(); return;
    }
    BF.gear.push(id);
    BF_SAY = '「' + g.name + '」带在身上。';
  }
  bfSave();
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

/* ===================== 入口与渲染 ===================== */
function openBaofu(){
  if(typeof SFX!=='undefined'){ SFX.set(true); SFX.click(); }
  BF = bfLoad();
  bfRollStall(false);
  BF_SAY = '门开着。九十九间屋子，一间一物。看中哪间，推门进去便是。';
  state = { phase:'baofu', mode:'baofu', sel:[], filter:'全部', q:'', log:[] };
  render();
}

function bfTab(t){
  BF_TAB = t;
  if(typeof SFX!=='undefined' && SFX && SFX.click) SFX.click();
  render();
}

function renderBaofu(app){
  const coin = BF.coin||0, debt = BF.debt||0;
  const tabs = [['heqi','和 气 斋'],['lou','拣 漏'],['shu','藏 书 阁'],['nang','行 囊 · 善 缘 录']];
  const tabsHtml = tabs.map(t=>'<span class="bf-tab'+(BF_TAB===t[0]?' on':'')+'" onclick="bfTab(\''+t[0]+'\')">'+t[1]+'</span>').join('');

  let body = '';
  if(BF_TAB==='heqi')      body = bfRenderHeqi(coin);
  else if(BF_TAB==='lou')  body = bfRenderLou(coin);
  else if(BF_TAB==='shu')  body = bfRenderShu(coin);
  else                     body = bfRenderNang(coin);

  app.innerHTML =
    '<div class="baofu">'
    + '<div class="bf-head">'
    +   '<div class="bf-title">包 袱 斋<small>无奇不有 · 钱货两清</small></div>'
    +   '<div class="bf-purse">囊中 <b>'+coin+'</b> 雪花钱 <span style="color:#7d7666">（'+bfCoinText(coin)+'）</span>'
    +     (debt>0 ? '<br><span class="owe">赊欠 '+debt+' 雪花钱未补</span>' : '')
    +     '<br><span style="color:#7d7666">眼力 '+bfInsight()+'% · 印记 '+BF.marks.length+'/'+bfMarkSlots()+' · 法宝 '+BF.gear.length+'/'+BF_GEAR_SLOTS+'</span>'
    +   '</div>'
    + '</div>'
    + '<div class="bf-keeper">'
    +   '<span class="kp-n"><img class="kp-ico" src="assets/icon/bf-shirou.svg" alt="" aria-hidden="true"'
    +     ' onerror="this.style.display=\'none\'">掌柜 · 石柔</span>'
    +   '<span class="kp-look">'+bfKeeper().look+'</span>'
    +   '<div class="kp-line">'+bfKeeperLine()+'</div>'
    + '</div>'
    + '<div class="bf-tabs">'+tabsHtml+'</div>'
    + '<div class="bf-say">'+ (BF_TAB==='lou' ? '' : '<span class="who">石柔：</span>') + BF_SAY + '</div>'
    + body
    + '<div class="bf-foot"><span class="fbtn" onclick="state={phase:\'title\',sel:[],log:[]};render()">回 到 卷 首</span></div>'
    + '</div>';
}

/* ---------- 和气斋 ---------- */
/* 和气斋九十九间屋，每间只卖一物：此处按序给每一物一个房号。
   步长取 4（与 99 互质）再对 99 取模，物件增减都不会越出九十九间 */
const bfRoomNum = function(i){ return 1 + ((3 + i*4 - 1) % 99); };
function bfRoomNo(n){
  const CN = ['','一','二','三','四','五','六','七','八','九'];
  const t = (n/10)|0, o = n%10;
  if(t === 0) return CN[o];
  if(t === 1) return '十' + (o ? CN[o] : '');
  return CN[t] + '十' + (o ? CN[o] : '');
}
function bfRenderHeqi(coin){
  let h = '<div class="bf-note">老祖师现身做生意，取出一处「和气斋」，开门迎客，总计九十九间屋子，'
        + '每间屋子一般只卖一物。老祖师亲自掌眼的东西，不存在捡漏的可能——'
        + '但价也实在。相中了可以先赊走，日后在浩然天下任何一处包袱斋补上即可，'
        + '此非破例，是包袱斋历来定例。</div>';
  h += '<div class="bf-sec">和 气 斋<span>九十九间屋 · 此处可见 '+BF_GEAR.length+' 间</span></div>';
  h += '<div class="bf-grid">' + BF_GEAR.map((g,i)=>{
    const owned = bfHas(g.id);
    const on = BF.gear.indexOf(g.id) >= 0;
    const afford = coin >= g.price;
    let act;
    if(owned){
      act = on ? '<button class="bf-btn" onclick="bfToggleGear(\''+g.id+'\')">取 下</button>'
               : (g.eff ? '<button class="bf-btn" onclick="bfToggleGear(\''+g.id+'\')">带 上</button>'
                        : '<span class="bf-price" style="color:#7d7666">藏品 · 不入战局</span>');
      if(!g.eff) act += ' <button class="bf-btn" onclick="bfSell(\''+g.id+'\')">转 手</button>';
    }else{
      act = '<button class="bf-btn primary" onclick="bfBuy(\''+g.id+'\')"'+(afford?'':' disabled')+'>'
          + (afford ? '买 下' : '雪花钱不足') + '</button>'
          + (afford || bfDebt()>0 ? '' : ' <button class="bf-btn" onclick="bfCredit(\''+g.id+'\')">赊 走</button>');
    }
    return '<div class="bf-room'+(owned?' sold':'')+'">'
      + (owned ? '<span class="bf-plaque">已结善缘</span>' : '')
      + '<div class="bf-r-top"><span class="bf-r-name">'+bfIcon(g.id)+g.name+'<small>第 '+bfRoomNo(bfRoomNum(i))+' 间</small></span>'
      +   '<span class="bf-r-tag">'+(g.eff?'法 宝':'藏 品')+'</span></div>'
      + '<div class="bf-r-desc">'+g.desc+'</div>'
      + (g.eff ? '<div class="bf-r-eff">'+bfEffText(g.eff)+'</div>' : '')
      + '<div class="bf-r-src">出处：'+g.src+'</div>'
      + '<div class="bf-r-buy"><span class="bf-price">作价 <b>'+g.price+'</b> 雪花钱</span>'
      +   '<span class="bf-btns">'+act+'</span></div>'
      + '</div>';
  }).join('') + '</div>';

  if((BF.debt||0) > 0){
    h += '<div class="bf-sec">赊 欠<span>旧账未了，不可再赊</span></div>'
      +  '<div class="bf-slotbar">尚欠善缘 <b>'+BF.debt+'</b> 雪花钱。'
      +  '一局终了结账时，先从所得里抵扣。</div>'
      +  '<button class="bf-btn" onclick="bfRepay()"'+(coin>0?'':' disabled')+'>就 地 补 上</button>';
  }
  return h;
}
function bfDebt(){ return BF.debt||0; }

/* ---------- 拣漏 ---------- */
function bfRenderLou(coin){
  bfRollStall(false);
  let h = '<div class="bf-note">有落脚地儿的铺子，捡漏的可能极小。'
        + '没有落脚地儿的包袱斋，才是最让人撞运气、考究眼力的——'
        + '多是山泽野修，四海为家，从家道中落的豪阀子弟手里低价收货，'
        + '或是自称祖上、师门出过金丹元婴。买主不用计较这些，只凭眼力。'
        + '你的眼力 <b style="color:#e8c66a;font-weight:normal">'+bfInsight()+'%</b>'
        + '（读书可增，上限 '+BF_EYE_MAX+'%——总还要留两成给运气）。</div>';
  if(bfIsNight() && BF.rouDate !== bfToday()){
    h += '<div class="bf-slotbar">夜深了。石柔不必睡，跟着你一道看摊——头一件东西，她替你上手。'
       + '<button class="bf-btn" onclick="bfRouEye()">请 石 柔 掌 眼</button></div>';
  }
  h += '<div class="bf-sec">散 修 摊 子<span>价廉而难辨 · 可掌眼一次</span></div>';
  h += '<div class="bf-grid">' + BF.stall.map((it,i)=>{
    if(it.done){
      return '<div class="bf-room sold">'
        + '<span class="bf-plaque">'+(it.real?'捡 着 了':'打 眼 了')+'</span>'
        + '<div class="bf-r-top"><span class="bf-r-name">'+bfStallIcon(it)+it.name+'</span></div>'
        + '<div class="bf-r-desc">'+(it.real
            ? '真东西，作价 '+it.worth+' 雪花钱，你花了 '+it.ask+'。'
            : '假货。'+it.ask+' 雪花钱买了个数，记在打眼录上。')+'</div>'
        + '</div>';
    }
    const afford = coin >= it.ask;
    return '<div class="bf-room">'
      + '<div class="bf-r-top"><span class="bf-r-name">'+bfStallIcon(it)+it.name+'</span>'
      +   '<span class="bf-r-tag">要 价 '+it.ask+'</span></div>'
      + '<div class="bf-r-desc">'+it.note+'</div>'
      + (it.eye ? '<div class="bf-eye'+(it.eye.indexOf('不大开门')>=0?' bad':'')+'">'+it.eye+'</div>'
                : '<div class="bf-eye" style="border-left-color:rgba(232,198,106,.15);color:#7d7666">还未上手。</div>')
      + '<div class="bf-r-buy"><span class="bf-price">雪花钱 <b>'+it.ask+'</b></span>'
      +   '<span class="bf-btns">'
      +     (it.eye ? '' : '<button class="bf-btn" onclick="bfEye('+i+')">掌 眼</button>')
      +     '<button class="bf-btn primary" onclick="bfBuyStall('+i+')"'+(afford?'':' disabled')+'>'
      +     (afford?'买 下':'钱不够')+'</button>'
      +   '</span></div>'
      + '</div>';
  }).join('') + '</div>';
  h += '<div class="bf-sec">换 一 处<span>散修走到哪儿摆到哪儿</span></div>'
    +  '<button class="bf-btn" onclick="bfRefreshStall()">另 寻 摊 子</button>';
  return h;
}

/* ---------- 藏书阁 ---------- */
function bfRenderShu(coin){
  let h = '<div class="bf-note">包袱斋也卖书。书读了，眼力见长，也悟出些道理——'
        + '那便是「悟道印记」，可带在身上入局。'
        + '带得下几道，看你读过几本：<b style="color:#e8c66a;font-weight:normal">'
        + BF.marks.length+' / '+bfMarkSlots()+'</b>'
        + '（每读满三本，多带一道，至多 '+BF_MARK_SLOT_MAX+' 道）。</div>';
  h += '<div class="bf-sec">藏 书 阁<span>已读 '+BF.read.length+' / '+BF_BOOKS.length+' 本</span></div>';
  h += '<div class="bf-grid">' + BF_BOOKS.map(b=>{
    const got = BF.read.indexOf(b.id) >= 0;
    const on = BF.marks.indexOf(b.id) >= 0;
    const afford = coin >= b.price;
    let act;
    if(got){
      act = '<button class="bf-btn'+(on?'':' primary')+'" onclick="bfToggleMark(\''+b.id+'\')">'
          + (on ? '收起印记' : '带上印记') + '</button>';
    }else{
      act = '<button class="bf-btn primary" onclick="bfRead(\''+b.id+'\')"'+(afford?'':' disabled')+'>'
          + (afford ? '买 下 读' : '雪花钱不足') + '</button>';
    }
    return '<div class="bf-room'+(got?' sold':'')+'">'
      + (got ? '<span class="bf-plaque">'+(on?'已 带':'已 读')+'</span>' : '')
      + '<div class="bf-r-top"><span class="bf-r-name">'+bfIcon(b.id)+b.name+'</span>'
      +   '<span class="bf-r-tag">'+(got?'悟 道':'未 读')+'</span></div>'
      + '<div class="bf-r-desc">'+b.desc+'</div>'
      + '<div class="bf-r-eff">'+(got ? '悟：'+bfEffText(b.eff) : '读后方知其中道理')+'</div>'
      + '<div class="bf-r-src">出处：'+b.src+'</div>'
      + '<div class="bf-r-buy"><span class="bf-price">书价 <b>'+b.price+'</b> 雪花钱</span>'
      +   '<span class="bf-btns">'+act+'</span></div>'
      + '</div>';
  }).join('') + '</div>';
  return h;
}

/* ---------- 行囊 · 善缘录 ---------- */
function bfRenderNang(coin){
  let h = '<div class="bf-note">随身只带得下 '+BF_GEAR_SLOTS+' 件法宝、'+bfMarkSlots()+' 道印记。'
        + '仗剑独行、剑气长城、天下共伐三处，随身之物与我同行；'
        + '群雄论剑是同席切磋，按规矩不带私物入场。</div>';

  h += '<div class="bf-sec">随 身 · 法 宝<span>'+BF.gear.length+' / '+BF_GEAR_SLOTS+'</span></div>';
  if(BF.gear.length){
    h += '<div class="bf-bag">' + BF.gear.map(id=>{
      const g = bfGear(id);
      return '<div class="bf-bag-i on"><div class="bf-bag-n">'+bfIcon(id,true)+g.name+'</div>'
        + '<div class="bf-bag-c">'+bfEffText(g.eff)+'<br><span style="color:#7d7666">'+g.src+'</span></div>'
        + '<button class="bf-btn" onclick="bfToggleGear(\''+id+'\')">取 下</button></div>';
    }).join('') + '</div>';
  }else h += '<div class="bf-empty">身上还空着。去和气斋挑两件。</div>';

  h += '<div class="bf-sec">随 身 · 悟 道 印 记<span>'+BF.marks.length+' / '+bfMarkSlots()+'</span></div>';
  if(BF.marks.length){
    h += '<div class="bf-bag">' + BF.marks.map(id=>{
      const b = bfBook(id);
      return '<div class="bf-bag-i on"><div class="bf-bag-n">'+bfIcon(id,true)+'悟 · '+b.name+'</div>'
        + '<div class="bf-bag-c">'+bfEffText(b.eff)+'</div>'
        + '<button class="bf-btn" onclick="bfToggleMark(\''+id+'\')">收 起</button></div>';
    }).join('') + '</div>';
  }else h += '<div class="bf-empty">还不曾从书里悟出什么。去藏书阁看看。</div>';

  const ownedEff = BF.owned.filter(id=>{ const g=bfGear(id); return g && g.eff && BF.gear.indexOf(id)<0; });
  h += '<div class="bf-sec">行 囊<span>已得而未带 '+ownedEff.length+' 件</span></div>';
  if(ownedEff.length){
    h += '<div class="bf-bag">' + ownedEff.map(id=>{
      const g = bfGear(id);
      return '<div class="bf-bag-i"><div class="bf-bag-n">'+bfIcon(id,true)+g.name+'</div>'
        + '<div class="bf-bag-c">'+bfEffText(g.eff)+'</div>'
        + '<span class="bf-btns"><button class="bf-btn" onclick="bfToggleGear(\''+id+'\')">带 上</button>'
        + '<button class="bf-btn" onclick="bfSell(\''+id+'\')">转手 '+Math.floor(g.price*BF_SELL_RATE)+'</button></span></div>';
    }).join('') + '</div>';
  }else h += '<div class="bf-empty">没有闲置的物件。</div>';

  const keeps = BF.owned.filter(id=>{ const g=bfGear(id); return g && !g.eff; });
  if(keeps.length){
    h += '<div class="bf-sec">藏 品<span>不入战局</span></div><div class="bf-bag">'
      + keeps.map(id=>{
          const g = bfGear(id);
          return '<div class="bf-bag-i"><div class="bf-bag-n">'+bfIcon(id,true)+g.name+'</div>'
            + '<div class="bf-bag-c" style="color:#7d7666">'+g.src+'</div>'
            + '<button class="bf-btn" onclick="bfSell(\''+id+'\')">转手 '+Math.floor(g.price*BF_SELL_RATE)+'</button></div>';
        }).join('') + '</div>';
  }

  h += '<div class="bf-sec">善 缘 录<span>已结善缘 '+BF.seen.length+' 条</span></div>';
  h += '<div class="bf-empty">'
    + (BF.seen.length
        ? BF.seen.map(k=>{
            if(k.indexOf('book_')===0){ const b=bfBook(k.slice(5)); return b ? b.name : k; }
            const g = bfGear(k); return g ? g.name : k;
          }).join('、')
        : '一件也还不曾识得。')
    + '</div>';

  if(BF.fakes.length){
    h += '<div class="bf-sec">打 眼 录<span>买假 '+BF.fakes.length+' 次</span></div>';
    h += '<div class="bf-empty" style="color:#a57a68">'
      + BF.fakes.map(k=>k.slice(5)).join('、')
      + '<br>——刘杆子那一路说辞，多是从这儿来的。</div>';
  }
  return h;
}
