'use strict';
/* 落魄山 · 小程序端 no-DOM 移植（源自 prototype/sect.js 逻辑核心） */
const WX = (typeof wx !== 'undefined') ? wx : null;
function lsGet(k, d){ try{ const v = WX ? WX.getStorageSync(k) : (global.__ls && global.__ls[k]); return v==null ? d : v; }catch(e){ return d; } }
function lsSet(k, v){ try{ if(WX) WX.setStorageSync(k, v); else { global.__ls = global.__ls||{}; global.__ls[k]=v; } }catch(e){} }
/* 小程序端无 WebAudio：用轻量震动做"有声"反馈（不吵、不堆音频资源） */
function vb(t){ if(WX && WX.vibrateShort){ try{ WX.vibrateShort({ type:(t||'light') }); }catch(e){} } }
const SFX = { set(){}, click(){ vb('light'); }, forge(){ vb('medium'); }, breakout(){ vb('medium'); }, heal(){ vb('light'); }, draw(){ vb('light'); }, win(){ vb('heavy'); }, lose(){ vb('heavy'); }, build(){ vb('light'); } };

/* ===================== 演出层（横幅/飘字，经 setData 推送，独立于主视图重绘） ===================== */
let FXB = [];            // 当前展示的回合横幅（一次一个，队列）
let FXF = [];            // 飘字（资源增减等，可多个并存）
let FXID = 0;
let sectBannerQueue = [];
let sectBannerBusy = false;
function sectFXInit(){}
function sectFXClear(){ FXB = []; FXF = []; sectBannerQueue = []; sectBannerBusy = false; emitView(); }
function sectBannerShow(){
  if(!sectBannerQueue.length){ sectBannerBusy = false; FXB = []; emitView(); return; }
  sectBannerBusy = true;
  const it = sectBannerQueue.shift();
  FXB = [{ title:it.title, sub:it.sub||'', cls:it.cls||'' }];
  emitView();
  setTimeout(function(){ sectBannerShow(); }, 1900);
}
function sectBanner(title, sub, cls){
  sectBannerQueue.push({ title:title, sub:sub||'', cls:cls||'' });
  if(!sectBannerBusy) sectBannerShow();
}
function sectFloat(text, cls, x, y){
  const id = ++FXID;
  FXF.push({ id:id, text:text, cls:cls||'neutral' });
  emitView();
  setTimeout(function(){ FXF = FXF.filter(function(f){ return f.id!==id; }); emitView(); }, 1400);
}
/* 资源增减飘字：复用 PC 的 sectSpawnFx 逻辑，把 fxQueue 变成可见飘字 */
function sectSpawnFx(s){
  if(!s.fxQueue || !s.fxQueue.length) return;
  const q = s.fxQueue; s.fxQueue = [];
  q.forEach(function(f){
    const txt = (f.v === 0) ? f.k : (f.k + ' ' + (f.v>0?'+':'') + f.v);
    const cls = (f.v === 0) ? 'neutral' : (f.v>0 ? 'good' : 'bad');
    sectFloat(txt, cls);
  });
}
let S = null;
let SECT_DIFF_KEY = 'normal';
let HOOK = null;
function emitView(){ if(HOOK) try{ HOOK(view()); }catch(e){ console.error(e); } }
function setHook(fn){ HOOK = fn; if(S) emitView(); }
function getState(){ return S; }
const SECT_ART_SET = {"aliang":1,"baiye":1,"baize":1,"caoci":1,"chenpingan":1,"chenqingdu":1,"daozu":1,"fozu":1,"lisan":1,"miyu":1,"ningyao":1,"qijingchun":1,"zhoumi":1,"之祠":1,"于玄":1,"亚圣":1,"余斗":1,"刘灞桥":1,"刘羡阳":1,"刘重润":1,"南簪":1,"卢白象":1,"君倩":1,"吴霜降":1,"周海镜":1,"周澄":1,"周米粒":1,"姚近之":1,"姜尚真":1,"姜赦":1,"宋集薪":1,"宋雨烧":1,"小陌":1,"崔东山":1,"崔瀺":1,"崔诚":1,"左右":1,"张山峰":1,"徐远霞":1,"持剑者":1,"老秀才":1,"朱敛":1,"李二":1,"李宝瓶":1,"李柳":1,"杨老头":1,"林守一":1,"柳柔":1,"沛湘":1,"火龙真人":1,"稚圭":1,"至圣先师":1,"苏心斋":1,"苏稼":1,"董三更":1,"裴杯":1,"裴钱":1,"谢松花":1,"谢狗":1,"贺小凉":1,"赊月":1,"郑居中":1,"郦彩":1,"郭竹酒":1,"长命":1,"阮秀":1,"陆台":1,"陆沉":1,"陆芝":1,"陈景清":1,"陈暖树":1,"隋右边":1,"隋景澄":1,"顾璨":1,"马苦玄":1,"魏晋":1,"魏檗":1,"魏羡":1,"黄庭":1,"齐廷济":1,};


/* 事件类型 → ASCII 样式类（微信 WXSS 拒绝中文选择器，故此处映射） */
const EV_CLASS = {
  '江湖':'jianghu', '讲道理':'jiangli', '天劫':'tianjie', '奇遇':'qiyu',
  '访客':'fangke', '论道':'lundao', '问心':'wenxin', '抉择':'jueze'
};

/* 事件类型 → 选项左前小图标。小程序 WXML 无法解析 SVG HTML 字符串，
   故把 SVG 抽到独立文件，用 <image src="/assets/icon/xxx.svg"/> 引用。 */
const EV_ICON = {
  '天劫':'/assets/icon/opt-sword.svg', '危机':'/assets/icon/opt-sword.svg',
  '讲道理':'/assets/icon/opt-chat.svg', '册目':'/assets/icon/opt-book.svg',
  '奇遇':'/assets/icon/opt-star.svg', '访客':'/assets/icon/opt-guest.svg',
  '江湖':'/assets/icon/opt-river.svg', '问心':'/assets/icon/opt-censer.svg',
  '论道':'/assets/icon/opt-chat.svg', '抉择':'/assets/icon/opt-star.svg',
  '祈愿':'/assets/icon/opt-censer.svg'
};
function evOptIco(type){ return EV_ICON[type] || '/assets/icon/opt-censer.svg'; }

const SECT_DIFF = {
  easy:   { name:'闲云',  银:42, 灵:12, 名:14, 道心:46, 机缘:2, desc:'起手宽裕，适合先熟悉经营节奏' },
  normal: { name:'立世',  银:30, 灵:8,  名:10, 道心:40, 机缘:0, desc:'依原著规矩，齐静春离世后你被迫出山，起手极紧' },
  hard:   { name:'多艰',  银:22, 灵:5,  名:7,  道心:34, 机缘:0, desc:'资源更缺、名望更低，蛮荒叩关更早盯上你' },
};

/* 建筑：init=初始等级，max=满级；cost[lv] 为升到该级所需资源 */
const SECT_BUILDINGS = {
  老槐树: { name:'老槐树', init:1, max:3, desc:'落魄山山根，灵机之源，亦是陈平安立山之凭。',
    cost: [null, null, {银:20,灵:10}, {银:40,灵:20}],
    eff: ['灵机 +3（每旬）', '灵机 +6（每旬）', '灵机 +11（每旬）· 满级「山根贯通」周边建筑灵机 +20%'] },
  静室: { name:'静室', init:0, max:3, desc:'弟子居所与修行处，安身方能安心。',
    cost: [null, {银:20,灵:5}, {银:35,灵:10}, {银:60,灵:20}],
    eff: ['弟子上限 2，修炼 ×1.1', '弟子上限 4，修炼 ×1.2', '弟子上限 6，修炼 ×1.3 · 满级叛离率 −50%'] },
  剑庐: { name:'剑庐', init:0, max:3, desc:'祭炼飞剑之所，剑修根本。',
    cost: [null, {银:30,灵:10}, {银:45,灵:18}, {银:45,灵:28}],
    eff: ['同时祭炼 1 柄，词条偏基础', '同时祭炼 2 柄，词条质量 ↑', '同时祭炼 3 柄 · 满级祭炼失败不掉剑'] },
  书院: { name:'书院（老秀才分院）', init:0, max:3, desc:'讲道明理，养浩然气，守你心中那杆秤。',
    cost: [null, {银:40,灵:15,道心:8}, {银:55,灵:30,道心:12}, {银:80,灵:45,道心:18}],
    eff: ['道心每旬 +1，弟子悟性微涨', '道心每旬 +2，弟子悟性涨', '道心每旬 +3 · 满级讲道理事件成功率 +30%'] },
  药田: { name:'药田', init:0, max:3, desc:'植灵药，备渡劫与弟子疗伤。',
    cost: [null, {银:40,灵:5}, {银:70,灵:12}, {银:110,灵:20}],
    eff: ['每旬产丹 ×1', '每旬产丹 ×2', '每旬产丹 ×3 · 满级渡劫存活 +25%'] },
  护山大阵: { name:'护山大阵', init:0, max:3, desc:'御蛮荒叩关之根本，每旬须耗灵维持。',
    cost: [null, {银:0,灵:40}, {银:0,灵:75}, {银:0,灵:120}],
    eff: ['维持灵 5／旬，叩关减伤 20%', '维持灵 5／旬，叩关减伤 40%', '维持灵 5／旬，叩关减伤 60% · 满级反伤来犯者'] },
  倒悬山别院: { name:'倒悬山别院', init:0, max:3, desc:'开赌坊抽运，换稀有资源，亦招是非。',
    cost: [null, {银:120,名:40}, {银:180,名:60}, {银:260,名:90}],
    eff: ['机缘事件 ×2，可「赌运」', '机缘事件 ×2，赌运收益 ↑', '机缘事件 ×2 · 满级逢凶化吉概率 +20%'] },
};

/* 弟子：base=每旬修为成长，stage 0学徒/1中境/2大成 */
const SECT_DISCIPLES = {
  peiqian:  { name:'裴钱', art:'裴钱', dao:'武',  realm:'练气', base:3, loyal:70, rank:'弟子',
    desc:'藕花福地南苑国京城外粥铺，那个枯瘦黝黑、揣一把豁口刀的野丫头。出福地后一路跟着不走，是落魄山开山大弟子。性子野、最爱银钱、极护短，一句「师父」叫到末尾。武道路数，后为止境武夫。' },
  caoqinglang:{ name:'曹晴朗', art:'曹晴朗', dao:'儒', realm:'练气', base:2, loyal:80, rank:'弟子',
    desc:'藕花福地里认准了你的读书少年，性子极正，一笔一笔记下落魄山的规矩。日后的山中律令，多半出自他手。' },
  cuidongshan:{ name:'崔东山', art:'崔东山', dao:'儒', realm:'止境', base:5, loyal:50, rank:'弟子',
    desc:'崔瀺的一缕神魂分身，白衣少年，死皮赖脸拜你为师。满肚子算计，却把落魄山的家底理得井井有条。' },
  zhaoshuxia:{ name:'赵树下', art:'赵树下', dao:'武', realm:'练气', base:2, loyal:85, rank:'弟子',
    desc:'胭脂郡府里的仆役少年。妖魔打进来那天，他抄起柴刀挡在妹妹赵鸾身前——那一幕你看着眼熟。天资平平，练拳两百万次，一拳一拳把自己练成了你的武道关门弟子。' },
  guozhujiu:{ name:'郭竹酒', art:'郭竹酒', dao:'剑', realm:'练气', base:4, loyal:70, rank:'弟子',
    desc:'剑气长城郭家的独女，小名绿端，先天剑胚。性子跳脱，嘴上没个把门的，偏是裴钱的克星。她在你酒铺的墙上刻过一行字：「师父卖酒，徒弟买酒。」' },
  ningji:   { name:'宁吉', art:'宁吉', dao:'符', realm:'练气', base:4, loyal:55, rank:'弟子',
    desc:'人族女子与蛮荒妖族修士的孩子，天生道胎，符箓一途几乎无门槛。陆沉也想收他，他自己选了你。你只教他一句：心正方能术纯。' },
  dengjianping:{ name:'邓剑枰', art:'邓剑枰', dao:'剑', realm:'练气', base:3, loyal:60, rank:'弟子',
    desc:'北俱芦洲女子武夫的弟弟，本该是天之骄子。那年随驾城天劫落下，他为了自保走开了，把两个孩子留在原地。此后他故意不练剑——直到看见你一个人站在天劫底下。' },
  yuanhuang:{ name:'袁黄', art:'袁黄', dao:'武', realm:'练气', base:2, loyal:75, rank:'弟子',
    desc:'藕花福地里走出来的江湖游侠，话不多，心里有数。头一回见你，就把你「卖符」的那点小伎俩看了个透，却还是掏钱捧了场。你本已不打算再收徒，是他破的例。' },
  chennuanshu:{ name:'陈暖树', art:'陈暖树', dao:'无', realm:'练气', base:1, loyal:65, rank:'门中',
    desc:'火蟒化形，与青蛇陈灵均同为山中书童。性子温吞，最会照顾人，后来做了落魄山的小管家，山里人都唤她「如初」。' },
  zhoumili: { name:'周米粒', art:'周米粒', dao:'机缘', realm:'练气', base:1, loyal:60, rank:'门中',
    desc:'护山供奉，落魄山右护法。小吃货，胃口比修为大，福缘却奇佳，常能逢凶化吉。' },
  guycan:   { name:'顾璨', art:'顾璨', dao:'无', realm:'止境', base:7, loyal:38, rank:'门中',
    desc:'泥瓶巷一起长大的兄弟，不是你徒弟。书简湖杀孽缠身，是收是逐全在你一念。留之可成绝强战力，却也背一身因果。' },
};
const SECT_RETINUE = {
  jiangshangzhen:{ name:'姜尚真', art:'姜尚真', rank:'首席供奉', pow:26, pay:4, 名:6,
    desc:'仙人境巅峰剑修，落魄山首席供奉。请得动他，是落魄山的脸面；留得住他，是落魄山的本事。' },
  xiaomo:   { name:'小陌', art:'小陌', rank:'一等供奉', pow:30, pay:5, 名:5,
    desc:'落魄山一等供奉。briefs 载真身蜘蛛鼅鼄、道号喜烛；本模块按山中高阶剑修供奉处理。境界与「持剑者带来」等细节待外部复核，暂不写死飞升境。' },
  xiegou:   { name:'谢狗', art:'谢狗', rank:'一等供奉', pow:28, pay:5, 名:4,
    desc:'落魄山供奉。人物志/对战卡对其身份记载不一（散修少年 vs 化名白景之远古大妖剑修），本模块按山中「一等供奉·剑修」处理；飞升境与两把本命飞剑之说待外部复核，暂不写死。' },
  miyu:     { name:'米裕', art:'米裕', rank:'一等供奉', pow:18, pay:3, 名:3,
    desc:'仙人境剑修。你曾派他暗中替一个练拳的少年护道——那少年后来拜了你。' },
  zhulian:  { name:'朱敛', art:'朱敛', rank:'大管家', pow:10, pay:2, 名:2, 银:2,
    desc:'山巅境武夫，落魄山大管家。山上大小杂事过他一道手，就都顺了。' },
  changming:{ name:'长命', art:'长命', rank:'掌律', pow:8, pay:2, 名:3, 道心:1,
    desc:'落魄山掌律。山里谁犯了规矩，先过他这一关。' },
  weiwenlong:{ name:'韦文龙', art:'韦文龙', rank:'账房', pow:4, pay:1, 名:1, 银:4,
    desc:'泉府掌舵人，倒悬山出身，邵云岩嫡传，金丹境。术算天才，落魄山的财神爷——账本上多一个零少一个零，全在他一念。' },
  weibo:    { name:'魏檗', art:'魏檗', rank:'住山大使', pow:14, pay:2, 名:3, 银:3,
    desc:'神水国北岳正神，因庇护遗民触怒大骊，神位被废、金身打碎沉江，贬作棋墩山土地公，后又复为披云山山神。他说自己是落魄山的「住山大使」，半个主人。' },
};
const SECT_RETINUE_ORDER = ['weibo','zhulian','changming','weiwenlong','miyu','jiangshangzhen','xiaomo','xiegou'];
function sectRetinuePay(s){ let sum=0; for(const k in s.retinue){ const d=SECT_RETINUE[k]; if(d) sum+=d.pay; } return sum; }
function sectRetinuePow(s){ let sum=0; for(const k in s.retinue){ const d=SECT_RETINUE[k]; if(d) sum+=d.pow; } return sum; }
function sectAddRetinue(s, key){
  if(s.retinue[key]) return false;
  if(!SECT_RETINUE[key]) return false;
  s.retinue[key] = true;
  const d = SECT_RETINUE[key];
  if(d.名) sectGain(s,'名',d.名);
  sectLog(s,'【门中】'+d.rank+' '+d.name+' 入山。', 'good');
  return true;
}
function sectLoseRetinue(s, key, why){
  if(!s.retinue[key]) return false;
  delete s.retinue[key];
  const d = SECT_RETINUE[key];
  sectGain(s,'名',-(d&&d.名?Math.ceil(d.名/2):2));
  sectLog(s,'【门中】'+(d?d.name:key)+'离山'+(why?'——'+why:'')+'。', 'bad');
  return true;
}
function sectAddRenqing(s, n){ s.renqing = Math.max(0, Math.min(9, (s.renqing||0)+n)); }
const SECT_DISCIPLE_STAGE_TXT = ['学徒', '中境', '大成'];

/* 境界阶梯（剑来修士九境之要，化简为可玩七阶） */
const SECT_REALMS = ['练气','筑基','金丹','元婴','玉璞','仙人','飞升'];
const SECT_REALM_XIU = [0,60,140,240,360,500,999999];   // 弟子修为阈值
const SECT_MASTER_CULT = [0,25,55,95,150,220,300];    // 山主破境所需修为（索引=当前境；元婴需累计175，可轻松达成）
function sectRealmOf(xiwei){ for(let i=SECT_REALMS.length-1;i>=0;i--){ if(xiwei>=SECT_REALM_XIU[i]) return i; } return 0; }

/* 飞剑词条 */
const SECT_SWORD_WORDS = ['锋锐','破甲','御风','镇邪','养魂','斩蛮','生克','护道','凌厉','凝神'];
const SECT_SWORD_WORD_TXT = {
  锋锐:'剑势锐利，战力 +3', 破甲:'破敌护甲，叩关判定 +', 御风:'身法轻灵，渡劫存活 +',
  镇邪:'镇压心魔，道心稳固', 养魂:'温养神魂，弟子悟性 +', 斩蛮:'专克蛮荒，叩关战力 +8',
  生克:'暗合大道，祭炼契合 +', 护道:'护持道心，心魔抗性 +', 凌厉:'出剑凌厉，战力 +4', 凝神:'凝神静气，讲道效果 +',
};

/* 事件卡池：好选项必有代价。eff 支持 银/灵/名/道心/机缘/丹 增减、flag、disc、msg、loseDisc */
const SECT_EVENTS = [
  // —— 江湖 ——
  { id:'lingmai', type:'江湖', urgent:true, title:'邻山真人强占灵脉',
    desc:'一散修看中落魄山侧峰灵脉，上门强要三成，言语间颇有不忿。',
    opts:[
      { txt:'讲道理（道心≥15）', note:'守山有理，胜则固脉扬名，败则结仇',
        req:{道心:15}, eff:{名:8, 道心:-3, flag:'lingmai_win', msg:'你引经据典，讲得对方哑口无言，灵脉保住，名声小涨。'} },
      { txt:'让一步', note:'灵机受损、示弱于人，但避战省钱',
        eff:{灵:-4, 名:-6, flag:'lingmai_yield', msg:'你拱手让出三成灵脉，山民侧目，却省了一场纷争。'} },
      { txt:'请宁姚镇场（人情≥1）', note:'灵脉保、名声大涨，却欠下人情',
        req:{flag:'ningyao'}, eff:{名:12, 灵:0, flag:'ningyao_debt', msg:'宁姚一剑东来，来者悻悻而退，你却记下了这份人情。'} },
    ]},
  { id:'nonghu', type:'江湖', title:'山下农户求庇护',
    desc:'骊珠洞天降格后，山下农户生计无着，携家带口来求落魄山收留。',
    opts:[
      { txt:'开仓接济', note:'耗银、得民心与劳力，名声涨',
        eff:{银:-8, 名:10, flag:'nonghu_help', msg:'你开仓放粮，农户感念，落魄山多了几双做事的手。'} },
      { txt:'只传强身之法', note:'不耗银，名声微涨，劳力有限',
        eff:{名:4, flag:'nonghu_teach', msg:'你授了套粗浅锻体法子，农户自去谋生。'} },
      { txt:'闭门不纳', note:'省银，却损仁声、埋下心结',
        eff:{银:0, 名:-5, 道心:-2, flag:'nonghu_reject', msg:'你未开门，门外跪了半日，终是散了——这事你记了许多年。'} },
    ]},
  { id:'keshang', type:'江湖', title:'客商求购灵药',
    desc:'倒悬山来的客商愿出高价收灵药，但数目不小，须动用药田产出。',
    opts:[
      { txt:'悉数售出', note:'得银，药田储备空，渡劫堪忧',
        eff:{银:18, 丹:-3, 名:2, msg:'一箱箱灵药换来沉甸甸银两，药田却空了。'} },
      { txt:'售出半数', note:'小赚，留有余地',
        eff:{银:9, 丹:-1, msg:'你只卖了半数，客商不悦却也成交。'} },
      { txt:'不卖', note:'守药备劫，名声在修行圈小涨',
        eff:{丹:0, 名:3, msg:'你婉拒，客商摇头而去，山门自有主张。'} },
    ]},
  { id:'shanmen', type:'江湖', title:'山门修缮',
    desc:'经年风雨，山门牌坊裂了缝，弟子进出不便，也显得门庭寥落。',
    opts:[
      { txt:'大举修缮', note:'耗银，名声与弟子归属感涨',
        eff:{银:-12, 名:6, flag:'shanmen_fix', msg:'新牌坊立起，落魄山像个样子了。'} },
      { txt:'将就', note:'省钱，名声微损',
        eff:{银:-2, 名:-2, msg:'你拿木条撑了撑，凑合着用。'} },
    ]},
  { id:'chaidao', type:'江湖', once:'zhaoshuxia_join',
    gate:function(s){ return s.xun>=6 && !s.disciples.some(d=>d.key==='zhaoshuxia'); }, title:'柴刀少年',
    desc:'妖族打进胭脂郡那年，府里一个仆役少年抄起柴刀，挡在妹妹赵鸾身前。你赶到时，刀刃已经卷了，人还站着。',
    opts:[
      { txt:'把兄妹俩带上山', note:'需静室有空位 · 得一名弟子',
        req:{discSlot:true}, eff:{disc:{action:'add', key:'zhaoshuxia'}, 道心:2, flag:'zhaoshuxia_in',
        msg:'你把他和妹妹一起带回落魄山。他问能不能练拳，你说能——只要肯下苦功。'} },
      { txt:'传他一套拳，各奔前程', note:'不占名额 · 道心 +1',
        eff:{道心:1, 名:1, flag:'zhaoshuxia_yuan', msg:'你传了他剑气十八停，又托米裕暗中护道。他说将来若还活着，一定上山找你。'} },
      { txt:'救下人便是，不必多管', note:'省一事',
        eff:{名:-1, flag:'zhaoshuxia_guo', msg:'你救了人，转身走了。身后那个握柴刀的少年，一直站到看不见你的背影。'} },
    ]},

  // —— 第一章·骊珠降格（抉择点 · 隐形守护者式因果）——
  { id:'aliang_meet', chapter:1, bookXun:3, once:'aliang_meet', type:'抉择', urgent:true, title:'阿良路过',
    desc:'一个扛着木剑的汉子晃进小镇，笑嘻嘻说要带你去龙窑看天地。他说他叫阿良。',
    opts:[
      { txt:'随他去龙窑，看一眼天地', note:'亲阿良 · 剑心渐起',
        eff:{名:3, 道心:1, rel:{阿良:3}, stance:{剑礼:2}, msg:'阿良大笑：「我叫阿良，善良的良！」你第一次觉得，剑也可以这样轻松。'} },
      { txt:'婉拒，守着刻竹简的本分', note:'本分 · 偏于守礼',
        eff:{道心:2, rel:{阿良:1}, stance:{剑礼:-2}, msg:'你摇了头。阿良耸耸肩走了，临去丢下一句：「以后懂了再来找我。」'} },
    ]},
  { id:'liuxianyang', chapter:1, bookXun:5, once:'liuxianyang', type:'抉择', urgent:true, title:'刘羡阳被觊觎',
    desc:'正阳山来人，要带走你最好的朋友刘羡阳。他回头看你，等你拿主意。',
    opts:[
      { txt:'挡在身前：「他是我兄弟」', note:'硬护 · 守一人 · 硬扛到底',
        eff:{名:4, 道心:-1, rel:{刘羡阳:4}, stance:{守:3, 势:-3}, msg:'你站到了他前头。这梁子，从此结下，可你没退。'} },
      { txt:'劝他顺势离去，各安天命', note:'顺势 · 顾全大局',
        eff:{名:1, rel:{刘羡阳:1}, stance:{守:-1, 势:3}, msg:'你拍拍他肩：「去吧，活着就好。」他走了，你心里空了一块。'} },
    ]},
  { id:'jiangge_night', chapter:1, type:'抉择', urgent:true, once:'c1_jiangge', nodeFire:'qulu', title:'降格之夜 · 齐静春的棋局',
    desc:'骊珠洞天将碎。齐静春最后看你一眼：「陈平安，你将来，以何立身？」天地间只剩这一问。',
    opts:[
      { txt:'「我陈平安，唯有一剑——可搬山、断江、倒海、降妖、镇压古今。」', note:'以剑立身 · 锋芒毕露',
        eff:{道心:2, 名:4, rel:{齐静春:1}, stance:{剑礼:5}, msg:'你握紧了拳。先生笑了笑，没说什么。'} },
      { txt:'「我守规矩、讲道理，不愿白拿一分一厘。」', note:'以礼立身 · 文圣一脉亲近',
        eff:{道心:4, 名:2, rel:{齐静春:3}, stance:{剑礼:-5}, msg:'先生颔首：「善。立身以诚，比什么都强。」'} },
    ]},

  // —— 第一幕·骊珠洞天（册1-9）：本命瓷、长生桥、先生殉道、洞天降格、买下五座山头 ——
  // 原著时序勘误：此处是「买山」（册3-4），不是「开宗立派」。
  //   落魄山开宗要到第27册《风雪夜归人》，祖师堂观礼跻身「宗」字头是第28册《清都山水郎》。
  { id:'open_mountain', chapter:1, bookXun:8, once:'open_mountain', type:'抉择', urgent:true, title:'买山 · 五座山头',
    desc:'骊珠洞天坠落，山脉落于大骊国界地面。铸剑师阮邛替你牵线，你以金精铜钱买下五座山头——落魄山其一，主峰集灵峰，次峰霁色峰。山是到手了，可你马上就要远行。',
    opts:[
      { txt:'五座都要，落魄山居中', note:'守本心 · 偏守 · 山头多则根基厚',
        eff:{名:3, 道心:2, 灵:4, stance:{守:2, 势:-1}, flag:'shan_luopo', msg:'你在契书上按下手印。从此这世上，有一座山叫落魄山。'} },
      { txt:'只买落魄山一座，余钱留作行资', note:'重实利 · 名下轻装好上路',
        eff:{银:10, 名:1, 道心:1, 灵:2, stance:{势:1}, flag:'shan_yizuo', msg:'你只留了落魄山。阮邛摇头笑你不会做买卖，你却算得清：路还长，钱要花在刀刃上。'} },
      { txt:'请阮邛代管，先谢过这份人情', note:'借势 · 山有人看顾，却欠下人情',
        eff:{名:5, 道心:-1, rel:{阮邛:4}, stance:{势:2, 守:-1}, flag:'shan_ruan', msg:'阮邛一口应下。这位铸剑师的人情，你记在心里，一记就是许多年。'} },
    ]},
  { id:'baoping_meet', chapter:1, bookXun:9, once:'baoping_meet', type:'抉择', urgent:true, title:'李宝瓶途经',
    desc:'书简湖李宝瓶循着先生遗泽寻来，眨着眼问你这山收不收人。',
    opts:[
      { txt:'留她在山，待如亲人', note:'结下赤子之缘，情义深种',
        eff:{名:2, 道心:2, rel:{李宝瓶:5}, flag:'baoping_in', msg:'李宝瓶成了落魄山的常客，天真烂漫，最是赤诚。'} },
      { txt:'礼送她去书院寻先生故人', note:'成全，却少一段亲缘',
        eff:{名:1, 道心:1, rel:{李宝瓶:2}, msg:'你送她上路，她回头喊：「陈平安，我以后回来找你！」'} },
    ]},
  { id:'ruanxiu_choice', chapter:1, bookXun:8, once:'ruanxiu_choice', type:'抉择', urgent:true, title:'阮秀',
    desc:'铸剑师阮邛之女阮秀来山访你，谈剑谈火，眼里藏着火光。',
    opts:[
      { txt:'与她论剑，引为知己', note:'亲阮秀·阮邛，剑道得助',
        eff:{名:2, 道心:1, rel:{阮秀:5, 阮邛:2}, stance:{剑礼:1}, flag:'ruanxiu_friend', msg:'你与阮秀论剑终日，火光映面，惺惺相惜。'} },
      { txt:'只叙礼数，不远不近', note:'持重，却错过一桩良缘',
        eff:{名:1, rel:{阮秀:1}, msg:'你以礼相待，阮秀笑笑，未曾深交。'} },
    ]},
  { id:'zuoshi_xiong', chapter:4, bookXun:24, once:'zuoshi_xiong', type:'抉择', urgent:true, title:'左师兄论剑',
    desc:'你随剑修一脉修行，左师兄问你：剑为何物？',
    opts:[
      { txt:'「剑者，搬山断江，护我所护」', note:'以剑 · 锋芒',
        eff:{道心:1, rel:{剑修一脉:3}, stance:{剑礼:3}, msg:'左师兄点头：「剑修，当有此气。」'} },
      { txt:'「剑者，礼之器也，先正其心」', note:'偏礼 · 守规矩',
        eff:{道心:3, 名:2, stance:{剑礼:-2}, msg:'左师兄沉吟：「道理也对，只是少了几分剑修的野。」'} },
    ]},

  // —— 第三幕·藕花问心（册17-21）：藕花福地重造长生桥、收裴钱曹晴朗、老龙城水字印、书简湖问心局 ——
  { id:'taiping_mess', chapter:3, bookXun:20, once:'taiping_mess', type:'抉择', urgent:true, title:'太平山乱',
    desc:'太平山起乱，殃及山民。你管不管？',
    opts:[
      { txt:'出手平乱，护一方安宁', note:'守土 · 名望与道心齐涨',
        eff:{名:6, 道心:2, stance:{守:2, 势:1}, flag:'taiping_help', msg:'你出手定乱，山民感念，落魄山威望更隆。'} },
      { txt:'袖手旁观，独善其身', note:'省力，却寒了人心',
        eff:{道心:1, stance:{势:-2}, msg:'你闭门不理，乱平后山民侧目，你心里也不甚安。'} },
    ]},
  { id:'shuyuan_debate', chapter:2, bookXun:12, once:'shuyuan_debate', type:'抉择', urgent:true, title:'书院 · 文圣一脉',
    desc:'你在书院与崔瀺论道。这位「先生」笑里藏锋，问你：立身，究竟靠剑还是靠理？',
    opts:[
      { txt:'「理在正，剑亦正；我两者都不弃」', note:'文圣一脉亲近 · 守',
        eff:{道心:3, 名:3, rel:{文圣一脉:4}, stance:{守:1, 剑礼:-2}, msg:'崔瀺抚掌：「善。文圣一脉，终归要有个接班人。」'} },
      { txt:'「道理若讲不通，便用剑讲」', note:'以剑 · 与文圣一脉疏离',
        eff:{道心:1, 名:1, rel:{文圣一脉:-2}, stance:{剑礼:2}, msg:'崔瀺摇头轻笑，未再深谈。你与文圣一脉，自此隔了一层。'} },
    ]},
  { id:'shujian_close', chapter:3, bookXun:21, once:'shujian_close', type:'抉择', urgent:true, gate:function(s){ return !s.flags['guycan_out']; }, title:'书简湖了结',
    desc:'书简湖旧案再起，顾璨的杀孽要个了断。你如何收束这段因果？',
    opts:[
      { txt:'替顾璨担下，护他周全', note:'顾璨亲善 · 守一人 · 名望受损',
        eff:{名:-4, 道心:2, rel:{顾璨:3}, stance:{守:2}, flag:'shujian_keep', msg:'你挡在他身前：「人我带走了，账你们找我。」'} },
      { txt:'交予文庙公断', note:'守规矩 · 道心稳，却疏了顾璨',
        eff:{道心:3, 名:3, rel:{顾璨:-2}, flag:'shujian_just', msg:'你交文庙裁断，顾璨依律受罚。你守了理，却凉了情。'} },
    ]},

  // —— 第四幕·剑气长城（册22-27）：斩离真、接任隐官、长城举城飞升、独守半截长城十五年 ——
  { id:'ningyao_wall', chapter:4, bookXun:25, once:'ningyao_wall', type:'抉择', urgent:true, title:'宁姚 · 剑气长城',
    desc:'你终于到了剑气长城。宁姚立城头，回望你一眼——十年之期，你一日没落下。这一战，你要如何待她？',
    opts:[
      { txt:'并肩守城：「你守城，我守你」', note:'宁姚亲善 · 守一人 · 逆守天下',
        eff:{名:4, 道心:2, rel:{宁姚:5}, stance:{守:-2, 势:1}, flag:'ningyao_side', msg:'你与她并肩立于城头。她说：「陈平安，你这人，真古怪。」'} },
      { txt:'嘱她远避，莫陷险地', note:'惜其性命 · 偏守天下',
        eff:{名:1, 道心:1, rel:{宁姚:2}, stance:{守:2}, msg:'你劝她暂避，她冷笑：「你当我是什么人？」'} },
    ]},
  { id:'jianqi_choice', chapter:4, bookXun:25, once:'jianqi_choice', type:'抉择', urgent:true, title:'长城倾覆 · 举城飞升',
    desc:'剑气长城断为两截。老大剑仙陈清都早有谋划：众剑仙合力，举城飞升第五座天下。可总得有人留下来，守那未倒塌的半截。你留不留？',
    opts:[
      { txt:'随众死守，剑不归鞘', note:'名动天下 · 守',
        eff:{名:8, 道心:3, rel:{剑气长城:3}, stance:{守:3}, flag:'jianqi_die', msg:'你随众死守一线，剑光成河。长城记得你。'} },
      { txt:'留得青山，另谋他法', note:'顺势 · 存实力',
        eff:{名:-2, 道心:-1, 灵:5, stance:{势:2}, msg:'你抽身而退，另寻破局之法。有人骂你怯，你不为所动。'} },
    ]},

  // —— 第六幕·天下风波（册44-54）：三教祖师散道、蛮荒入侵、决战、剑开托月山、万山朝奉 ——
  { id:'manhuang_aid', chapter:6, bookXun:45, once:'manhuang_aid', type:'抉择', urgent:true, title:'倾山赴难',
    desc:'三教祖师散道，天下无主，蛮荒大举叩关。天下同道勤王，落魄山出不出兵？',
    opts:[
      { txt:'倾山门之力，赴此一难', note:'守天下 · 名望与道心齐涨',
        eff:{名:6, 道心:3, rel:{剑气长城:3}, stance:{守:2, 势:1}, flag:'aid_wall', msg:'你点起弟子赴难，落魄山之名，响彻两洲。'} },
      { txt:'独善其身，守好自家山门', note:'省力 · 守一人',
        eff:{道心:1, stance:{守:-1, 势:2}, flag:'aid_self', msg:'你只守山门。乱世里，这也是一种活法。'} },
    ]},
  { id:'tianqing', chapter:5, bookXun:34, once:'tianqing', type:'抉择', urgent:true, title:'天下聚义',
    desc:'天下同道欲结盟共抗蛮荒。你入不入盟？',
    opts:[
      { txt:'歃血入盟，共担此劫', note:'名望 · 剑气长城亲善',
        eff:{名:4, rel:{剑气长城:3}, stance:{守:1}, flag:'tianqing_in', msg:'你入盟。乱世之中，有人同行，总好过独行。'} },
      { txt:'孤行其是，不依附任何旗号', note:'独立 · 势',
        eff:{名:1, stance:{势:2}, flag:'tianqing_out', msg:'你谢过好意，仍走自己的路。'} },
    ]},

  // —— 终幕·建宗大典（册53-54）——
  { id:'feisheng_question', chapter:6, bookXun:53, type:'抉择', urgent:true, once:'feisheng_q', title:'飞升前 · 道理之问',
    desc:'天门将开，最后一问临头：你这一生，以何立于天地之间？',
    opts:[
      { txt:'「我陈平安，唯有一剑」', note:'以剑立世 · 锋芒',
        eff:{道心:2, 名:3, stance:{剑礼:3}, flag:'fs_sword', msg:'你最后一次握紧拳。剑，是你立身的答案。'} },
      { txt:'「我守规矩、讲道理，问心无愧」', note:'以礼立世 · 文圣一脉',
        eff:{道心:4, 名:2, rel:{文圣一脉:2}, stance:{剑礼:-3}, flag:'fs_li', msg:'你最后一次整了整衣冠。规矩与道理，是你立身的答案。'} },
    ]},

  // —— 幕二 · 负笈大隋（册10-16）：加密抉择点 ——
  { id:'cuizhan_scheme', chapter:2, bookXun:11, type:'抉择', urgent:true, once:'cuizhan_scheme', title:'崔瀺落子',
    desc:'文圣一脉的崔瀺似早有布局，邀你入局，要你做他棋盘上一枚活子。',
    opts:[
      { txt:'顺水推舟，接下这盘棋', note:'谋定后动 · 势', eff:{名:2, 道心:-1, rel:{文圣一脉:3}, stance:{势:2}, flag:'cuizhan_ally', msg:'你落了子。崔瀺抚掌轻笑，这步棋，日后自有回响。'} },
      { txt:'敬而远之，不沾因果', note:'守拙 · 剑礼', eff:{道心:2, rel:{文圣一脉:-2}, stance:{剑礼:2}, msg:'你婉拒。崔瀺不恼，只道：「性子倒像你先生。」'} },
    ]},
  { id:'lihuai_bully', chapter:2, bookXun:13, type:'抉择', urgent:true, once:'lihuai_bully', title:'山崖书院 · 李槐',
    desc:'小镇故人李槐在大隋山崖书院被同窗算计欺凌，跑来寻你这个「平安哥」。',
    opts:[
      { txt:'替他出头，压下这口气', note:'护短 · 守', eff:{名:3, 道心:-1, rel:{文圣一脉:2}, stance:{守:3, 势:-2}, flag:'lihuai_help', msg:'你站到他身前。李槐红了眼：「平安哥，我就知道你来。」'} },
      { txt:'教他自己面对', note:'立人 · 剑礼', eff:{道心:2, stance:{守:-1, 势:2}, msg:'你只教他拳头要硬、道理要清。李槐似懂非懂，却去了。'} },
    ]},
  // —— 补原著：回程认崔东山为弟子、收陈灵均与陈暖树为书童（册10-13）——
  { id:'cuidongshan', chapter:2, bookXun:13, type:'抉择', urgent:true, once:'cuidongshan', title:'崔东山入门',
    desc:'回程路上，一个白衣少年死皮赖脸要拜你为师。他是崔瀺的一缕神魂分身，明面上是来报「杀身之仇」的，实则一肚子的算计。你收，还是不收？',
    q:'先生，我是真心实意想跟你读书的。',
    opts:[
      { txt:'收。先立规矩，再谈别的', note:'得一大管家 · 山务自此有人', eff:{名:4, 道心:2, rel:{文圣一脉:3}, stance:{守:2}, flag:'cui_dongshan', msg:'你收了他，先让他抄一百遍《礼记》。他一边抄一边笑，眼里却有光。此后你远游，山中打理便落在这少年肩上。'} },
      { txt:'逐走。此人太聪明，不可近', note:'清静 · 却失一臂助', eff:{道心:3, 名:-2, rel:{文圣一脉:-2}, stance:{势:2}, flag:'cui_zhu', msg:'你请他上路。他作了个揖，走得干脆——可你知道，这人迟早还会回来。'} },
    ]},
  // —— 补原著：武圣崔诚授拳，打造天下最强三境纯粹武夫（册13-15）——
  { id:'cuicheng', chapter:2, bookXun:14, type:'问心', urgent:true, once:'cuicheng', title:'崔诚授拳',
    desc:'回到小镇，你遇上了武圣崔诚——大骊国师「绣虎」崔瀺的爷爷。他不说道理，只把你往死里打，硬生生将你打磨成天下最强三境的纯粹武夫。可打完了，他盯着你，只说了一句话。',
    q:'你的身体，已经是天下最强三境了。可你的心境，还有问题。',
    opts:[
      { txt:'请老先生继续打下去', note:'以身承拳 · 守', eff:{道心:2, 名:2, stance:{守:3, 势:-1}, flag:'cuicheng_da', msg:'你爬起来，摆好架势。崔诚一拳把你打进墙里，你吐了口血，又爬了出来。'} },
      { txt:'先问清楚：问题出在哪', note:'问心 · 剑礼', eff:{道心:4, stance:{剑礼:1, 守:1}, flag:'cuicheng_wen', msg:'你抹了把血问：「老先生，问题在哪？」崔诚沉默良久，说了两个字：「太狠。」'} },
    ]},
  // —— 补原著：应青童天君之请远离小镇是非，负剑南下为宁姚送剑（册15-16）——
  { id:'songjian', chapter:2, bookXun:15, type:'抉择', urgent:true, once:'songjian', title:'南下送剑',
    desc:'为远离小镇的是非，你负剑南下，替人送一柄剑去剑气长城。天底下最难送的，就是这一柄——收剑的人叫宁姚。',
    opts:[
      { txt:'一路不停，早一日送到早一日心安', note:'赴约 · 势', eff:{名:2, 道心:1, rel:{宁姚:3}, stance:{势:2}, flag:'songjian_gan', msg:'你日夜兼程。剑在背上，路在脚下，你心里只装着一件事：把剑送到。'} },
      { txt:'沿途遇事便管一管', note:'管闲事 · 守', eff:{名:3, 道心:2, 银:-4, stance:{守:3}, flag:'songjian_guan', msg:'你一路管了十数桩闲事，耽误了脚程，却也攒下了些人情。'} },
    ]},
  { id:'fenglei_spar', chapter:3, bookXun:20, type:'抉择', urgent:true, once:'fenglei_spar', title:'风雷园论剑',
    desc:'书简湖风雷园内，一干剑修子弟邀你切磋，言语间带着几分轻视。',
    opts:[
      { txt:'拔剑应战，教他们识得落魄山', note:'以剑立威', eff:{名:4, rel:{剑修一脉:3}, stance:{剑礼:3}, flag:'fenglei_win', msg:'一剑既出，满园寂然。有人服了，有人忌了。'} },
      { txt:'以礼化解，点到即止', note:'以礼服人', eff:{道心:2, 名:1, rel:{剑修一脉:1}, stance:{剑礼:-2}, msg:'你收剑入鞘，作揖而退。风雷园里，倒多了几分敬重。'} },
    ]},
  { id:'guzan_cause', chapter:3, bookXun:21, type:'抉择', urgent:true, once:'guzan_cause',
    gate:function(s){ return s.flags['guycan_in'] || s.flags['guycan_half']; }, title:'顾璨的账',
    desc:'顾璨当年在书简湖种下的因果，如今找上门来，要你为他担下。',
    opts:[
      { txt:'这梁子，我替他担了', note:'护徒 · 守', eff:{名:-5, 道心:-2, rel:{顾璨:4}, stance:{守:3}, flag:'guzan_shoulder', msg:'你挡在他身前。顾璨怔住，半晌低声道：「先生……」'} },
      { txt:'让他自己认账', note:'立理 · 剑礼', eff:{道心:3, 名:2, rel:{顾璨:-2}, stance:{守:-2}, flag:'guzan_self', msg:'你教他：人须认，账要清。顾璨垂首，到底去了。'} },
    ]},
  { id:'yangjia_help', chapter:3, bookXun:19, type:'抉择', urgent:true, once:'yangjia_help', title:'老龙城杨家',
    desc:'早年有恩于你的杨家，如今在老龙城遭人倾轧，上门求助。',
    opts:[
      { txt:'倾力相助，不教故人寒心', note:'重诺 · 守', eff:{银:-5, 名:5, stance:{守:2}, flag:'yangjia_help', msg:'你点起弟子相助。杨家老者再三作揖，这份情，记下了。'} },
      { txt:'量力而行，送顺风人情', note:'务实 · 势', eff:{名:1, 银:-1, stance:{势:1}, msg:'你略施薄力。杨家懂了分寸，客气告退。'} },
    ]},
  // —— 补原著：受老大剑仙陈清都指点，去桐叶洲藕花福地重造长生桥（册17-19）——
  { id:'ouhua_qiao', chapter:3, bookXun:17, type:'问心', urgent:true, once:'ouhua_qiao', title:'重造长生桥',
    desc:'长生桥断，是十四岁那年落下的根。老大剑仙陈清都指了条路：去桐叶洲藕花福地，把那座桥，一寸一寸重新造回来。桥该怎么造，造给谁走，是你自己的事。',
    opts:[
      { txt:'一步步走，一砖一瓦都是自己的', note:'苦功 · 守', eff:{道心:4, 名:1, stance:{守:3, 势:-1}, flag:'qiao_ku', msg:'你在福地里走了一年又一年。桥修好的那天，你坐在桥头，什么也没说。'} },
      { txt:'借福地之力，尽快成桥', note:'取巧 · 势', eff:{道心:1, 名:2, 灵:4, stance:{势:3, 守:-1}, flag:'qiao_qiao', msg:'你借了福地的天地灵机，桥成得极快。可每逢雨天，桥面还是会隐隐作痛。'} },
    ]},
  // —— 补原著：福地之中收曹晴朗为徒（册18-19）——
  { id:'caoqinglang', chapter:3, bookXun:18, type:'抉择', urgent:true, once:'caoqinglang', title:'曹晴朗',
    desc:'福地里的少年曹晴朗，读书极正，性子也极正，见你讲道理，便认定了要跟你走。可你身边已经有了一个野性难驯的裴钱。',
    opts:[
      { txt:'收。此子可托底', note:'得二弟子 · 门风自正', eff:{disc:{action:'add', key:'caoqinglang', loyal:80}, 道心:3, 名:2, flag:'cao_shou', msg:'你收了他。后来落魄山的规矩，多半是这少年一笔一笔记下来的。'} },
      { txt:'先让他去书院读完书', note:'成全 · 缓收', eff:{道心:2, 名:1, flag:'cao_huan', msg:'你送他去读书。他临走作了个揖：「先生，我读完就回来。」'} },
    ]},
  // —— 补原著：回宝瓶洲老龙城，炼化齐静春所留水字印为本命物（册19-20）——
  { id:'laolongcheng', chapter:3, bookXun:19, type:'奇遇', urgent:true, once:'laolongcheng', title:'老龙城 · 水字印',
    desc:'出福地回宝瓶洲，你在老龙城炼化齐静春先生留下的水字印为本命物。印成那日，你正式迈入练气士第一境——铜皮境。先生走了许多年，还留了东西给你。',
    q:'遇事不决，可问春风。',
    opts:[
      { txt:'以先生之道炼之', note:'承先生遗泽 · 守', eff:{道心:4, 灵:6, rel:{齐静春:4, 文圣一脉:3}, stance:{守:2}, flag:'shui_cheng', msg:'水字印入手温润，像先生那只常按在你头顶的手。你闭了闭眼，才收进袖中。'} },
      { txt:'以己之道重炼一遍', note:'立己 · 势', eff:{道心:2, 灵:8, 名:2, stance:{势:2}, flag:'shui_li', msg:'你把先生的印拆了又合，合了又拆，最后炼出来的，是你自己的「水」。'} },
    ]},

  // —— 幕四 · 剑气长城（册22-27）：加密抉择点 ——
  { id:'chengtou_kezi', chapter:4, bookXun:23, type:'抉择', urgent:true, once:'chengtou_kezi', title:'城头刻字',
    desc:'剑气长城的规矩，新来者须在城头刻下己名与一念。你握起了刻刀。',
    opts:[
      { txt:'刻一个「守」字', note:'以守立念', eff:{道心:2, 名:2, rel:{剑气长城:3}, stance:{守:3}, flag:'kezi_shou', msg:'「守」字入石。城头的风，似也温柔了些。'} },
      { txt:'刻一个「剑」字', note:'以剑立念', eff:{名:3, rel:{剑气长城:2}, stance:{剑礼:2}, flag:'kezi_jian', msg:'「剑」字凌厉。有老剑修远远瞥见，点了点头。'} },
    ]},
  { id:'chenqingdu_point', chapter:4, bookXun:25, type:'抉择', urgent:true, once:'chenqingdu_point', title:'老剑仙点拨',
    desc:'剑气长城的老辈（陈清都一脉）召你论剑，似要看看你这后生的斤两。',
    opts:[
      { txt:'虚心受教', note:'尊前辈 · 剑礼', eff:{道心:2, rel:{剑修一脉:3}, stance:{剑礼:2}, flag:'chenqingdu_teach', msg:'老剑仙讲了一夜剑理。你听得入神，受益匪浅。'} },
      { txt:'也陈己见', note:'不卑不亢', eff:{道心:1, 名:2, rel:{剑修一脉:1}, stance:{剑礼:-1}, msg:'你将自己的道理说出。老剑仙大笑：「有意思，有陈平安的味儿。」'} },
    ]},
  { id:'longhongque_sword', chapter:4, bookXun:26, type:'抉择', urgent:true, once:'longhongque_sword', title:'本命飞剑',
    desc:'剑气长城之人，皆如笼中雀。你欲祭一柄本命飞剑，念起处，是何初心？',
    opts:[
      { txt:'念一个「护」字祭剑', note:'护人为本', eff:{道心:1, rel:{剑气长城:3}, stance:{守:2}, flag:'benming_hu', msg:'剑成「护」念。握在手中，竟比想象中暖。'} },
      { txt:'念一个「破」字祭剑', note:'破敌为先', eff:{名:2, rel:{剑气长城:1}, stance:{剑礼:2}, flag:'benming_po', msg:'剑成「破」念。出鞘时，风雷俱寂。'} },
    ]},
  // —— 补原著：问心局后独行北俱芦洲磨心境，结识哑巴湖大水怪周米粒（册22-23）——
  { id:'beijulu', chapter:4, bookXun:22, type:'奇遇', urgent:true, once:'beijulu', title:'北俱芦洲 · 周米粒',
    desc:'问心局后，你一人独行北俱芦洲磨炼心境。哑巴湖边遇到个圆滚滚的大水怪，自称「周米粒」，一口一个「老爷」，从此跟定你不走了。',
    opts:[
      { txt:'带上她。路上多个伴', note:'得右护法 · 福缘极佳', eff:{disc:{action:'add', key:'zhoumili', loyal:70}, 道心:2, stance:{守:1}, flag:'zhoumili_dai', msg:'她欢天喜地跟上来，一路走一路吃。后来落魄山的人都知道，山上有个最能吃的右护法。'} },
      { txt:'让她留在湖里', note:'不惹因果 · 势', eff:{道心:1, 名:1, stance:{势:2}, flag:'zhoumili_liu', msg:'你让她留下。她在湖边哭了半宿，第二天照旧在湖面晒太阳。'} },
    ]},
  // —— 补原著：狮子峰访李二，一个月喂拳，武道直入第七境金身境（册22-23）——
  { id:'shizifeng', chapter:4, bookXun:22, type:'问心', urgent:true, once:'shizifeng', title:'狮子峰 · 金身境',
    desc:'十年之期将至，你上狮子峰找李二喂拳。一个月对拆，拳拳到肉。下山那日，武夫第七境——金身境，成了。',
    q:'武夫七境：泥胚、木胎、草菇、蝼蚁、龙门、金身、远游。',
    opts:[
      { txt:'只挨打不还手，把底子夯实', note:'以身为器 · 守', eff:{道心:3, 名:3, stance:{守:3, 势:-2}, flag:'shizi_ai', msg:'你被打断了不知多少根骨头，又一根根长好。李二说：「你这人，是真不要命。」'} },
      { txt:'对拆到底，寸步不让', note:'硬碰硬 · 剑礼', eff:{道心:2, 名:5, stance:{剑礼:3, 守:1}, flag:'shizi_dui', msg:'你与他对拆到最后一拳，两人都站不起来了。山下的人说，狮子峰那个月，天天在打雷。'} },
    ]},
  // —— 补原著：赴十年之约，首战为护宁姚迎战蛮荒第一天骄离真，离真死，自己连跌三境（册23）——
  { id:'lizhen', chapter:4, bookXun:23, type:'问心', urgent:true, once:'lizhen', title:'斩离真',
    desc:'你终于赶到了剑气长城。蛮荒第一天骄离真指着宁姚放话，要她做自己的道侣。宁姚还没开口，你已经走上前去。',
    q:'我陈平安，唯有一剑，可搬山、倒海、降妖、镇魔、敕神、摘星、断江、摧城、开天！',
    opts:[
      { txt:'正面迎上去。这一战，避不开', note:'以剑护人 · 剑礼', eff:{名:8, 道心:2, 灵:-8, rel:{宁姚:6, 剑气长城:4}, stance:{剑礼:4, 守:2}, flag:'lizhen_zhan', msg:'离真死。你自己连跌三境，吐了三口血。宁姚扶住你，手在抖：「你这人，是不是傻？」'} },
      { txt:'先问一句：你凭什么', note:'先讲道理 · 守', eff:{道心:4, 名:4, 灵:-4, rel:{宁姚:4, 剑气长城:2}, stance:{守:3, 剑礼:1}, flag:'lizhen_wen', msg:'你先讲了一遍道理，讲完了再拔剑。离真到死都没想明白，自己是怎么输的。'} },
    ]},
  // —— 补原著：长城举城飞升后，与未倒塌的半截长城合道，跻身玉璞境，孤守十五年（册25-27）——
  { id:'dushou', chapter:4, bookXun:26, type:'问心', urgent:true, once:'dushou', title:'独守半截长城',
    desc:'众人飞升去了第五座天下，只留下半截长城，和你。你与这半截城合了道，不死不灭，然后一个人守着它。一天，一月，一年，十五年。',
    q:'此城，姓陈。',
    opts:[
      { txt:'守。守到最后一刻', note:'与城合道 · 守', eff:{名:10, 道心:5, 灵:-10, rel:{剑气长城:6}, stance:{守:5, 势:-2}, flag:'dushou_shou', msg:'你在城头坐了十五年。妖族换了三批，城头那个字，始终没人擦得掉。'} },
      { txt:'边守边想：这城，得有个规矩', note:'以守立规 · 剑礼', eff:{名:6, 道心:8, rel:{剑气长城:4, 文圣一脉:2}, stance:{剑礼:2, 守:3}, flag:'dushou_gui', msg:'你一边守一边想，想明白了后来落魄山要立的那些规矩——它们都是从这半截城上长出来的。'} },
    ]},

  // —— 幕五 · 落魄开宗（册28-43）：加密抉择点 ——
  { id:'guixiang_luopo', chapter:5, bookXun:29, type:'抉择', urgent:true, once:'guixiang_luopo', title:'归乡落魄山',
    desc:'你终于从那半截长城下活着回来，回到了新起的落魄山。山门尚青涩，你却立了誓。',
    opts:[
      { txt:'立誓守此一方乡土', note:'守山 · 守', eff:{名:2, 道心:1, stance:{守:3}, flag:'luopo_oath', msg:'你于山门前立誓。风过松涛，似是应答。'} },
      { txt:'守山亦要放眼天下', note:'守中有势', eff:{名:1, stance:{势:2}, flag:'luopo_view', msg:'你望着远方。落魄山太小，天下却大。'} },
    ]},
  { id:'zhengyang_old', chapter:5, bookXun:31, type:'抉择', urgent:true, once:'zhengyang_old', title:'正阳山旧怨',
    desc:'当年欺压你一脉的正阳山（彩云居一脉），恰逢自家升宗大典，广发请帖、宾客盈门。你决意借这满山目光，上门问剑，了结当年旧怨。',
    opts:[
      { txt:'先发制人，断了这旧怨', note:'势 · 先手', eff:{名:3, 道心:-1, rel:{剑气长城:1}, stance:{势:3}, flag:'zhengyang_strike', msg:'你先一步落子。正阳山吃了闷亏，一时不敢妄动。'} },
      { txt:'按礼相争，不落下乘', note:'剑礼 · 规矩', eff:{道心:2, 名:1, stance:{剑礼:2}, flag:'zhengyang_rite', msg:'你依礼上门问罪。正阳山脸上无光，却挑不出错处。'} },
    ]},
  // —— 补原著：崔瀺以「山水颠倒」之法换出陈平安，大师兄身死道消（册27《风雪夜归人》）——
  { id:'cuizhan_si', chapter:5, bookXun:28, type:'问心', urgent:true, once:'cuizhan_si', title:'大师兄之死',
    desc:'你被困在那半截长城下十五年，是大师兄把你换出来的。他以「山水颠倒」之法，仗齐先生当年赠送的修为晋升十四境，替你合道长城。做完了这一步，他就没了。',
    q:'不要对这个世界失望。',
    opts:[
      { txt:'记住这句话，替他活下去', note:'承大师兄遗志 · 守', eff:{道心:6, 名:6, rel:{文圣一脉:5}, stance:{守:4, 势:-2}, flag:'cuizhan_ji', msg:'你把这句话刻在祖师堂的柱子上。此后每逢难事，你都要抬头看一眼。'} },
      { txt:'先问一句：值得吗', note:'问心 · 剑礼', eff:{道心:8, 名:2, rel:{文圣一脉:3}, stance:{剑礼:2}, flag:'cuizhan_wen', msg:'你问了。没人回答你。风雪里，只剩那半截长城还在。'} },
    ]},
  // —— 补原著：落魄山创建宗门，祖师堂观礼，正式跻身「宗」字头（册28《清都山水郎》）——
  { id:'zushitang', chapter:5, bookXun:28, type:'抉择', urgent:true, once:'zushitang', title:'祖师堂观礼',
    desc:'祖师堂前香火起，各路人马都来了。这一场观礼办下来，落魄山才真正算数——跻身「宗」字头。规矩、位次、请谁不请谁，都是学问。',
    opts:[
      { txt:'按规矩办，一板一眼', note:'门庭自立 · 守', eff:{名:6, 道心:3, stance:{守:3, 剑礼:2}, flag:'zushitang_gui', msg:'席位排定，礼数周全。来的人都挑不出错，走时却都记下了：落魄山，是个讲规矩的地方。'} },
      { txt:'请得越广越好，把场面做大', note:'广结善缘 · 势', eff:{名:10, 银:-8, 道心:-1, stance:{势:4, 守:-1}, flag:'zushitang_da', msg:'你广发请帖，来的人比预想还多。有人说你铺张，可这一日之后，天下都知道有座落魄山。'} },
      { txt:'只请自家人在山里吃顿饭', note:'守拙 · 不慕虚名', eff:{道心:4, 名:-2, 银:-2, stance:{守:4, 势:-3}, flag:'zushitang_jian', msg:'你只摆了一桌。裴钱嫌菜少，曹晴朗记账，崔东山笑而不语。许多年后他们说起这天，都说是最好吃的一顿。'} },
    ]},
  //     原著时序：青萍剑宗（下宗）立于落魄山上宗「建宗大典」（册54）之后，属终局后传，故置于终幕。 ——
  { id:'qingping', chapter:6, bookXun:54, type:'抉择', urgent:true, once:'qingping', title:'青萍剑宗 · 下宗',
    desc:'你要在桐叶洲建一座下宗。宗门叫什么、立什么规矩，先得想清楚。「青萍」二字，是那柄剑的名字，也是你这一路走过来的意思。',
    opts:[
      { txt:'立「青萍剑宗」，以剑立宗', note:'剑道为骨 · 剑礼', eff:{名:8, 道心:2, rel:{剑修一脉:4}, stance:{剑礼:3, 势:1}, flag:'qingping_jian', msg:'「青萍剑宗」四字挂上去那天，桐叶洲的剑修都来看。有人挑眉，有人服气。'} },
      { txt:'先开凿大渎，利在千秋', note:'功在百姓 · 守', eff:{名:6, 道心:5, 银:-10, rel:{文圣一脉:3}, stance:{守:4, 势:-1}, flag:'qingping_du', msg:'你先去挖那条河。宗门可以慢些立，可桐叶洲的百姓等不起。'} },
    ]},
  { id:'manhuang_eve', chapter:6, bookXun:47, type:'抉择', urgent:true, once:'manhuang_eve', title:'决战前夜',
    desc:'蛮荒大举叩关的前夜，剑气长城人人枕戈。你如何迎这场死仗？',
    opts:[
      { txt:'死守一线，寸土不让', note:'死守 · 守', eff:{道心:1, rel:{剑气长城:3}, stance:{守:3}, flag:'eve_hold', msg:'你立于最前。身后，是万千剑修的脊梁。'} },
      { txt:'迂回破局，寻其首脑', note:'破袭 · 势', eff:{名:1, rel:{剑气长城:1}, stance:{势:3}, flag:'eve_flank', msg:'你选了险路。有人不解，你只道：「打蛇打七寸。」'} },
    ]},
  { id:'ningyao_risk', chapter:6, bookXun:48, type:'抉择', urgent:true, once:'ningyao_risk', title:'宁姚赴险',
    desc:'宁姚独赴蛮荒险地，音讯将断。你去，还是不去？',
    opts:[
      { txt:'千里赴援，不能让她独自', note:'赴险 · 守', eff:{名:-2, rel:{宁姚:5}, stance:{守:2}, flag:'ningyao_save', msg:'你破阵而去。宁姚回头看见你，难得愣了一瞬：「你这人……」'} },
      { txt:'各守其位，信她能归', note:'信人 · 势', eff:{道心:1, rel:{宁姚:1}, stance:{势:2}, flag:'ningyao_trust', msg:'你按兵不动，信她平安归来。宁姚后来听说，只是轻笑。'} },
    ]},
  { id:'shan_zhan_feisheng', chapter:6, bookXun:48, type:'抉择', urgent:true, once:'shan_zhan_feisheng', title:'随手斩飞升',
    desc:'一名飞升境强者越线而来，你于阵前拔剑——这一剑，便叫「随手斩飞升」。',
    opts:[
      { txt:'以剑证道，一剑斩之', note:'剑 · 锋芒', eff:{名:8, 道心:1, rel:{剑气长城:4}, stance:{剑礼:3}, flag:'zhan_fs', msg:'剑光起处，来敌授首。两洲皆闻落魄山之名。'} },
      { txt:'以理降之，不妄造杀', note:'礼 · 道理', eff:{道心:3, rel:{剑气长城:2, 文圣一脉:2}, stance:{剑礼:-2}, flag:'jiang_fs', msg:'你以道理压其锋。敌者退去，却也记下了你这号人物。'} },
    ]},

  // —— 幕六 · 天下风波（册44-54）：三教祖师散道 → 蛮荒入侵 → 决战 → 剑开托月山 → 万山朝奉 ——
  // 补原著：三教祖师散道，天下秩序重塑（册44《明月落阶前》）
  { id:'sanjiao_sandao', chapter:6, bookXun:44, type:'问心', urgent:true, once:'sanjiao_sandao', title:'三教祖师散道',
    desc:'三教祖师一同散道，把这天下的「规矩」还给了天下。从此再没有谁能替你做主——好事，也是天大的险事。浩然、青冥、蛮荒，三重危机同时压来。',
    opts:[
      { txt:'先守好自己的山门', note:'守拙 · 守', eff:{道心:4, 名:2, stance:{守:4, 势:-2}, flag:'sandao_shou', msg:'你把山门守得死死的。外面的天塌下来之前，落魄山不能先乱。'} },
      { txt:'走出去，能多做一分是一分', note:'入世担责 · 势', eff:{名:6, 道心:2, 银:-6, stance:{势:4, 守:-1}, flag:'sandao_chu', msg:'你下了山。散道之后的第一桩大事，你想在场。'} },
    ]},
  { id:'yingguan_zhi', chapter:4, bookXun:24, type:'抉择', urgent:true, once:'yingguan_zhi', title:'隐官之责',
    desc:'隐官萧愻叛变，长城群龙无首。众人推你接任新一任隐官，总揽一应大小事务。此责，接是不接？',
    opts:[
      { txt:'受此重担，为苍生计', note:'担责 · 守', eff:{名:3, rel:{剑气长城:3}, stance:{守:2}, flag:'yingguan_take', msg:'你受了印。自此，肩上不止一座落魄山。'} },
      { txt:'推而不辞，量力而为', note:'不拒 · 势', eff:{名:1, rel:{剑气长城:1}, stance:{势:1}, flag:'yingguan_ease', msg:'你未推却，也未全揽。分寸，你自己拿捏。'} },
    ]},
  { id:'li_jian_zhi', chapter:5, bookXun:38, type:'抉择', urgent:true, once:'li_jian_zhi', title:'礼剑之争',
    desc:'文庙与剑修一脉，就「立身以礼还是以剑」争得面红。你这一票，倾向哪边？',
    opts:[
      { txt:'立身以剑，锋芒便是道理', note:'剑修一脉', eff:{道心:1, rel:{剑修一脉:3, 文圣一脉:-2}, stance:{剑礼:3}, flag:'lijian_sword', msg:'你站了剑。文圣一脉那边，有人摇头。'} },
      { txt:'立身以礼，规矩不可废', note:'文圣一脉', eff:{道心:2, rel:{文圣一脉:3, 剑修一脉:-2}, stance:{剑礼:-3}, flag:'lijian_li', msg:'你站了礼。剑修们嗤笑，你却笃定。'} },
    ]},

  // —— 融入原著引用的抉择点（名句 / 人物台词 / 情节线）—— 均带 once 防重注，不进普通抽卡 ——
  { id:'aliang_quote', chapter:1, bookXun:4, type:'抉择', urgent:true, once:'aliang_quote', title:'阿良的剑意',
    desc:'阿良斜倚墙头，笑问你：「小子，知道剑为什么叫剑？」——他这人，总把天大的道理说得轻飘飘。',
    opts:[
      { txt:'「我叫阿良，善良的良！」——你接了他的话', note:'以剑之洒脱 · 剑礼',
        eff:{名:2, 道心:1, rel:{阿良:3}, stance:{剑礼:2}, msg:'阿良大笑：「我叫阿良，善良的良！」你第一次觉得，剑也可以这样轻松。'} },
      { txt:'「剑者，止戈也。」——你说出自己的见解', note:'以礼思剑 · 守',
        eff:{道心:2, rel:{阿良:1}, stance:{守:1}, msg:'阿良挑眉：「有点意思。止戈为武，你比我想的沉。」'} },
    ]},
  { id:'jingshun_yan', chapter:1, bookXun:7, type:'抉择', urgent:true, once:'jingshun_yan', title:'先生的遗志',
    desc:'齐静春先生已逝。你独坐灯下，想起他常叹：「人生不如意事，十之八九，可与人言者，十无二三。」',
    opts:[
      { txt:'「先生没走完的路，我替他走。」', note:'承师志 · 守',
        eff:{道心:2, 名:1, rel:{齐静春:2}, stance:{守:2}, msg:'你对着空座作了个揖。先生的道理，你记下了。'} },
      { txt:'「这世道不公，我偏要问个明白。」', note:'不平则鸣 · 势',
        eff:{道心:1, 名:2, rel:{齐静春:1}, stance:{势:2}, msg:'你攥紧拳。有些账，总得有人去算。'} },
    ]},
  { id:'baoping_ask', chapter:2, bookXun:11, type:'抉择', urgent:true, once:'baoping_ask',
    gate:function(s){ return (s.relations['李宝瓶']||0)>=2; }, title:'宝瓶问学',
    desc:'李宝瓶歪着头问你：「陈平安，读书到底为了什么呀？」孩子眼里的认真，比许多大人都重。',
    opts:[
      { txt:'「读书人的道理，是先把自己读明白。」', note:'以礼授徒 · 剑礼',
        eff:{道心:2, rel:{李宝瓶:5, 文圣一脉:2}, stance:{剑礼:-1}, msg:'李宝瓶似懂非懂地点头。你心里却更定了——道理，原是要先立己。'} },
      { txt:'「读了书，才好替这世间，挡一些事。」', note:'读书济世 · 守',
        eff:{道心:1, 名:1, rel:{李宝瓶:2}, stance:{守:2}, msg:'李宝瓶眼睛一亮：「那我也要挡！」你笑了。'} },
    ]},
  { id:'ruanxiu_long', chapter:5, bookXun:33, type:'抉择', urgent:true, once:'ruanxiu_long', title:'阮秀与火',
    desc:'阮秀蹲在炉边看火，忽然抬头：「陈平安，你说火与土，能不能成一条龙？」她眼中映着焰，亮得惊人。',
    opts:[
      { txt:'「山水有相逢——你这条龙，我等着看。」', note:'以心相交 · 阮秀',
        eff:{名:1, 道心:1, rel:{阮秀:5, 阮邛:2}, stance:{剑礼:1}, msg:'阮秀笑了，第一次笑得那样自在。火光里，你们成了能论剑也能论心的朋友。'} },
      { txt:'陪她守了一夜炉火', note:'以诚相待 · 阮秀',
        eff:{道心:1, rel:{阮秀:3}, stance:{守:1}, msg:'你陪她坐到天明。她说：「你这人，话不多，却靠谱。」'} },
    ]},
  { id:'chenqingdu_echo', chapter:4, bookXun:24, type:'抉择', urgent:true, once:'chenqingdu_echo', title:'老剑仙的问',
    desc:'陈清都一脉的老剑仙召你论剑，只问一句：「剑修的尽头，是杀人，还是守人？」',
    opts:[
      { txt:'「剑修的尽头，是守该守的人。」', note:'守人之剑 · 守',
        eff:{道心:2, rel:{剑修一脉:3, 剑气长城:2}, stance:{守:2, 剑礼:1}, msg:'老剑仙抚须：「有点陈平安的味儿。」城头风过，似也颔首。'} },
      { txt:'「剑修的尽头，是一剑可开天门。」', note:'锋芒之剑 · 剑礼',
        eff:{道心:1, 名:2, rel:{剑修一脉:2}, stance:{剑礼:2}, msg:'老剑仙大笑：「好志气！只是别忘了，剑为护，非为杀。」'} },
    ]},
  { id:'ningyao_oath', chapter:4, bookXun:26, type:'抉择', urgent:true, once:'ningyao_oath',
    gate:function(s){ return (s.relations['宁姚']||0)>=2; }, title:'宁姚的约定',
    desc:'宁姚立在城头，忽然说：「陈平安，若有一天我守不住了，你别来。」你看着她被风刮红的脸。',
    opts:[
      { txt:'「这城，我陪你守。谁也别想赶我走。」', note:'同袍之诺 · 宁姚',
        eff:{名:-1, 道心:1, rel:{宁姚:5}, stance:{守:2}, msg:'宁姚怔了一瞬，别过脸：「……随你。」剑气长城的雪，落过两个人肩头。'} },
      { txt:'「你先走，我断后。这是规矩。」', note:'信人之诺 · 势',
        eff:{道心:1, rel:{宁姚:2}, stance:{势:1}, msg:'宁姚轻笑：「算你识相。」转身时，却悄悄放慢了脚步。'} },
    ]},
  { id:'chunfeng_ask', chapter:6, bookXun:44, type:'抉择', urgent:true, once:'chunfeng_ask', title:'问春风',
    desc:'蛮荒叩关前夜，你心头纷乱。忽想起书里那句：「遇事不决，可问春风。」',
    opts:[
      { txt:'「遇事不决，可问春风——春风说，守。」', note:'守心 · 守',
        eff:{道心:2, 名:1, stance:{守:2, 剑礼:-1}, msg:'你深吸口气。春风无声，你却听见了自己要守的东西。'} },
      { txt:'「不问春风，问我自己。」', note:'立己 · 势',
        eff:{道心:2, stance:{势:2}, msg:'你拍拍栏杆。道理千千万，到底，得自己拿主意。'} },
    ]},
  { id:'zhiyu_zui', chapter:6, bookXun:54, type:'抉择', urgent:true, once:'zhiyu_zui', title:'我有一剑',
    q:'我有一剑，可搬山、断江、倒海、摘星、开天。',
    desc:'建宗大典前最后一夜，你抚剑自语。剑修一脉有喻：「我有一剑，可搬山、断江、倒海、摘星、开天。」',
    opts:[
      { txt:'「我有一剑，可搬山断江——这便是我的道。」', note:'剑道 · 剑礼',
        eff:{道心:1, 名:2, rel:{剑修一脉:3, 剑气长城:1}, stance:{剑礼:2}, flag:'zhiyu_sword', msg:'剑鸣清越。这一生，你以剑立身，锋芒是给世间的回话。'} },
      { txt:'「我有一山，可安众生、可立说——这便是我的道。」', note:'礼道 · 文圣一脉',
        eff:{道心:2, 名:1, rel:{文圣一脉:3, 剑气长城:1}, stance:{剑礼:-2}, flag:'zhiyu_li', msg:'你整了整衣冠。规矩与道理，是你立身的答案。'} },
    ]},

  // —— 原著小故事 · 问心抉择（第三批）——
  // 说明：均取材《剑来》真实情节，且都是「问心」性质的两难，无标准答案。
  { id:'benming_ci', chapter:1, bookXun:1, type:'问心', urgent:true, once:'benming_ci', title:'碎瓷',
    desc:'五岁那年，你父亲撞破宗门以心头血烧制本命瓷的秘密，抢在你那尊瓷成形前，亲手将它打碎。他因此被秘密处决，母亲随即病故。多年后你蹲在窑边，看着一地碎瓷片出神——若那尊瓷完好，你会是另一个人。',
    opts:[
      { txt:'捡起碎片，把命攥在自己手里', note:'命由我立 · 势',
        eff:{道心:2, 名:1, stance:{势:2}, flag:'ci_zaiwo', msg:'你一片片捡起碎瓷，割破了手也没停。命是自己的，谁也拿不走。'} },
      { txt:'把碎片埋了，替父母烧一尊新瓷', note:'念亲恩 · 守',
        eff:{道心:3, stance:{守:2}, flag:'ci_bury', msg:'你把碎瓷埋在窑后，又亲手烧了一尊没有心头血的瓷。火光里，你像是又看见了爹娘。'} },
    ]},
  { id:'yifan_zhien', chapter:1, bookXun:2, type:'问心', urgent:true, once:'yifan_zhien', title:'一饭之恩',
    desc:'你快饿死那年，泥瓶巷的顾家婶子给了你一碗饭。顾璨就站在他娘身后，怯生生看着你。后来你对自己说：这一饭，得还一辈子。',
    opts:[
      { txt:'记下这碗饭，护顾璨一生', note:'重恩义 · 守',
        eff:{道心:2, rel:{顾璨:5}, stance:{守:3}, flag:'yifan_hu', msg:'你把那碗饭记在了心里最深处。从此顾璨的事，就是你的事。'} },
      { txt:'报恩不止于一人，及于众人', note:'推恩及人 · 势',
        eff:{道心:1, 名:1, rel:{顾璨:2}, stance:{势:2}, flag:'yifan_tui', msg:'你替顾璨，也替巷子里每一个饿过肚子的人，记下了这一碗饭。'} },
    ]},
  { id:'huaiye_xiongdi', chapter:1, bookXun:6, type:'问心', urgent:true, once:'huaiye_xiongdi', title:'那片槐叶',
    desc:'正阳山护山供奉搬山猿，为夺剑经把刘羡阳打得只剩一口气。齐静春替你求来的姚家槐叶，你只有一片——留住它，就是他一条命。可你也只有这一片。',
    opts:[
      { txt:'把槐叶给刘羡阳', note:'兄弟先活 · 守',
        eff:{道心:3, 名:-1, rel:{刘羡阳:5}, stance:{守:3}, flag:'huaiye_gei', msg:'你把槐叶塞进他嘴里。他没醒，可那口气，吊住了。你攥着拳站在雨里，浑身发抖。'} },
      { txt:'先留着，等更有把握的时机', note:'谋定后动 · 势',
        eff:{道心:-2, 名:1, rel:{刘羡阳:1}, stance:{势:2}, flag:'huaiye_liu', msg:'你把槐叶攥出汗，终究没给。后来你才知道，有些时机，一等就是一辈子。'} },
    ]},
  { id:'beibaoping', chapter:2, bookXun:10, type:'问心', urgent:true, once:'beibaoping',
    gate:function(s){ return (s.relations['李宝瓶']||0)>=2; }, title:'小师叔，我走不动了',
    desc:'去大隋的山路又长又陡。李宝瓶走不动了，蹲在地上拽你衣角：「小师叔，我走不动了。」你自己也快散了架。',
    opts:[
      { txt:'蹲下，背她走', note:'背人上山 · 守',
        eff:{道心:3, rel:{李宝瓶:5}, stance:{守:2}, flag:'bei_baoping', msg:'你蹲下身。她趴上你背，不多时就睡着了。山路很长，你走得很慢，却一步没停。'} },
      { txt:'教她自己站起来走完', note:'不惯着 · 剑礼',
        eff:{道心:1, 名:1, rel:{李宝瓶:2}, stance:{剑礼:2}, flag:'baoping_ziji', msg:'你说：「路得自己走。」她抹了把脸，站起来，一路再没喊过累。'} },
    ]},
  { id:'xiaoniqiu', chapter:2, bookXun:10, type:'问心', urgent:true, once:'xiaoniqiu', title:'那条小泥鳅',
    desc:'你身上带着小镇五桩福缘之一的「水运」，化作一条小泥鳅。顾璨要去书简湖了，他根骨重，此去凶吉难料。这泥鳅，给是不给？',
    opts:[
      { txt:'把小泥鳅给了顾璨', note:'福缘让兄弟 · 守',
        eff:{道心:1, 名:-1, rel:{顾璨:5}, stance:{守:2}, flag:'niqiu_gei', msg:'你把泥鳅放进他手心。他愣了半天，才小声说了句「谢谢哥」。后来书简湖的祸，也从此起。'} },
      { txt:'留着，将来护更多人', note:'留为大局 · 势',
        eff:{道心:1, 名:1, rel:{顾璨:-1}, stance:{势:2}, flag:'niqiu_liu', msg:'你握紧了泥鳅。顾璨没说什么，只是那一路，都没再回头看你。'} },
    ]},
  { id:'shujian_wendan', chapter:3, bookXun:21, type:'问心', urgent:true, once:'shujian_wendan', title:'书简湖 · 问心局',
    desc:'顾璨在书简湖恣意滥杀，冤魂无数。这是大师兄崔瀺亲手布的问心局——你要么交出顾璨以正公道，要么替他把这笔血债扛下来。法外之地无王法，可你心里有。',
    opts:[
      { txt:'自碎文胆，替顾璨赎罪', note:'舍己赎罪 · 守（原著之路）',
        eff:{道心:-6, 名:6, rel:{顾璨:6, 文圣一脉:3}, stance:{守:5, 势:-2}, flag:'wendan_sui', msg:'文胆碎裂那一瞬，你痛得说不出话。可那些叫了许久的冤魂，终于安静下来看你一眼。你选了最难的那条路。'} },
      { txt:'交出顾璨，以命抵命', note:'法理为先 · 剑礼',
        eff:{道心:3, 名:-2, rel:{顾璨:-8, 文圣一脉:2}, stance:{剑礼:4}, flag:'wendan_jiao', msg:'你把他交了出去。规矩立住了，可你从此再没睡过一个好觉。'} },
      { txt:'保下顾璨，来日再慢慢教他', note:'护短 · 势',
        eff:{道心:-3, 名:-3, rel:{顾璨:6}, stance:{势:3}, flag:'wendan_bao', msg:'你把人护在身后。书简湖的血，从此也算在你账上。'} },
    ]},
  { id:'zhangfang_xs', chapter:3, bookXun:21, type:'问心', urgent:true, once:'zhangfang_xs',
    gate:function(s){ return !!s.flags['wendan_sui']; }, title:'账房先生',
    desc:'文胆已碎，你却留在了书简湖，做了个账房先生。你召出那些死在顾璨手上的冤魂，一桩一桩问他们未了的心愿。这笔账，你要怎么记？',
    opts:[
      { txt:'一桩桩了愿，再立新规矩', note:'以规矩代刀兵 · 剑礼',
        eff:{道心:3, 名:3, rel:{文圣一脉:3}, stance:{剑礼:3}, flag:'zhangfang_gui', msg:'你替他们还愿，又教活人守规矩。书简湖的弱肉强食，被你一寸寸磨平了。'} },
      { txt:'先立威，让规矩立得住', note:'以力护法 · 势',
        eff:{道心:1, 名:4, rel:{文圣一脉:1}, stance:{势:3}, flag:'zhangfang_wei', msg:'你先杀了最凶的那个。此后书简湖的人，才知道「规矩」两个字怎么写。'} },
    ]},
  { id:'shinian_zhiyue', chapter:2, bookXun:16, type:'问心', urgent:true, once:'shinian_zhiyue', title:'十年之约',
    desc:'你要在十年内跻身武夫第七境金身境，才配与她并肩。宁姚则许诺：在你抵达剑气长城之前，她不会死在战场上。她站在雪里看你，没说软话。',
    opts:[
      { txt:'接下约定，十年如一日地练', note:'守约 · 守',
        eff:{道心:3, rel:{宁姚:5}, stance:{守:3}, flag:'yue_shou', msg:'你没说什么漂亮话，只是每日天不亮就起身走桩。十年，一天也没落下。'} },
      { txt:'提前赶去，不愿让她多等一天', note:'赴约 · 势',
        eff:{道心:1, 名:2, rel:{宁姚:3}, stance:{势:2}, flag:'yue_gan', msg:'你提前动身。到城下那日狼狈得很，她看了你半晌，只说了句：「来了。」'} },
    ]},
  { id:'aliang_meng', chapter:4, bookXun:27, type:'问心', urgent:true, once:'aliang_meng', title:'城头那个「猛」字',
    desc:'阿良拎着酒壶站在剑气长城的城头，二话不说刻下一个「猛」字。刻完他回头冲你乐：「练剑练到高处，才发现难的不是杀人，难的是不杀人。」',
    opts:[
      { txt:'「难的是不杀人」——我记住了', note:'强者的边界 · 守',
        eff:{道心:3, rel:{阿良:4}, stance:{守:2}, flag:'meng_busha', msg:'你说：「真正的强者，愿意以弱者的自由为边界。」阿良愣了一下，大笑，把酒壶丢给了你。'} },
      { txt:'「该杀的还是要杀」——我另有看法', note:'霹雳手段 · 剑礼',
        eff:{道心:1, 名:2, rel:{阿良:2}, stance:{剑礼:3}, flag:'meng_gai', msg:'你说：「不杀是慈悲，该杀是道理。」阿良眯着眼看了你很久，说：「你小子，别到时候下不去手。」'} },
    ]},
  { id:'zuoyou_daoli', chapter:4, bookXun:27, type:'问心', urgent:true, once:'zuoyou_daoli', title:'道理？我的剑就是道理',
    desc:'左师兄这辈子只做两件事：练剑，护着你。哪怕这事是你不对，他也只认一句——「道理？我的剑就是道理。」如今轮到你回答他了。',
    opts:[
      { txt:'「左师兄，有你在我才敢讲道理。」', note:'领情 · 守',
        eff:{道心:2, rel:{剑修一脉:4}, stance:{守:2}, flag:'zuoyou_ling', msg:'左右愣了愣，别过脸去：「少肉麻。」可那之后，他护得更紧了。'} },
      { txt:'「剑是道理，可道理不止是剑。」', note:'不阿 · 剑礼',
        eff:{道心:2, 名:2, rel:{剑修一脉:2, 文圣一脉:2}, stance:{剑礼:-2}, flag:'zuoyou_bu', msg:'左右沉默半晌，忽然笑了：「行，你比我讲理。」'} },
    ]},
  // —— 藕花福地 · 裴钱入门（原著第三百零四章出场：南苑国京城外粥铺；出福地后随陈平安回落魄山）——
  { id:'ouhua_fudi', chapter:3, bookXun:17, type:'奇遇', urgent:true, once:'ouhua_fudi', title:'藕花福地 · 雪人与馒头',
    desc:'南苑国京城外，施粥的棚子前挤满了逃难的灾民。一个枯瘦黝黑的小丫头躲在墙角，死死盯着那个常接济她的富贵小千金——只因那小千金有一回送了她一个雪人，而不是一个馒头。她怀里，揣着一把豁了口的刀。',
    opts:[
      { txt:'按住她攥刀的手', note:'救人 · 与这丫头结下因果',
        eff:{道心:2, 名:1, flag:'ouhua_lan', msg:'你按住她：「雪人也是人心。」她咬着牙，眼里全是敌意——可那把刀，终究没拔出来。'} },
      { txt:'先问清来由，再作定夺', note:'问清楚再讲道理 · 道心',
        eff:{道心:3, flag:'ouhua_wen', msg:'你蹲下身，听她说完逃难路上那两个馒头。听罢，你沉默了很久，把自己的那一份推给了她。'} },
      { txt:'只护下那小千金，不与她纠缠', note:'少惹因果 · 道心有亏',
        eff:{道心:-2, 名:1, flag:'ouhua_buguan', msg:'你护住了小千金，没再理会墙角那个丫头。她蹲在原地，看着你们走远。'} },
    ]},
  { id:'peiqian_bai', chapter:3, bookXun:18, type:'讲道理', urgent:true, once:'peiqian_bai', title:'出福地 · 跟在身后的丫头',
    desc:'出藕花福地那日，老观主嫌她是个「赔钱货」，随手将她丢了出去。她背着小竹箱，不远不近地跟在你身后，嘴里念叨「妖魔鬼怪快离开」。跟了三天，她开口叫你「爹」。你说：「叫师父。」',
    opts:[
      { txt:'收为落魄山开山大弟子', note:'得首徒，忠心极高，却添一份牵肠',
        eff:{disc:{action:'add', key:'peiqian', loyal:90}, 道心:2, 名:2, flag:'peiqian_shou', msg:'「从今往后，你是我落魄山开山大弟子。」她愣了半晌，脆生生喊了声「师父」。'} },
      { txt:'先留在山里做些杂事，且观其心', note:'缓收，忠心稍低，先观其心性',
        eff:{disc:{action:'add', key:'peiqian', loyal:55}, 名:1, flag:'peiqian_liu', msg:'你让她先留下，抄书、记账、扫地。她一边扫一边嘀咕，倒也没走。'} },
      { txt:'替她另寻一处安身', note:'守清静，却寒了一颗向道之心',
        eff:{道心:-2, 名:-2, flag:'peiqian_send', msg:'你替她寻了户人家。她走那天没回头，你站在山门口看了很久。'} },
    ]},
  { id:'peiqian_san', chapter:5, bookXun:30, type:'问心', urgent:true, once:'peiqian_san',
    gate:function(s){ return s.disciples.some(d=>d.key==='peiqian'); }, title:'规矩 · 板栗与那把伞',
    desc:'裴钱偷东西、骂人、三天不打上房揭瓦。山上山下都说这丫头教不好。她站在门口，斜着眼看你，一副「你敢管我」的样子。',
    opts:[
      { txt:'教，慢慢教——学不好是我教得不好', note:'言传身教 · 守',
        eff:{道心:2, 名:1, stance:{守:3}, flag:'peiqian_shou', msg:'你给了她一记板栗，又给了她一本书。多年后，她替你撑起了那把伞。'} },
      { txt:'立下规矩，严加管教', note:'山规森严 · 剑礼',
        eff:{道心:1, 名:2, stance:{剑礼:2}, flag:'peiqian_yan', msg:'你立下落魄山的规矩：不许偷、不许欺人、不许恃强凌弱。她记下了，记了一辈子。'} },
      { txt:'由她去吧，野性难驯', note:'放任 · 势',
        eff:{道心:-2, 名:-1, stance:{势:2}, flag:'peiqian_fang', msg:'你叹了口气，随她去了。她野成了山里的一阵风，再没人管得住。'} },
    ]},
  { id:'nianxin_xiu', chapter:6, bookXun:46, type:'问心', urgent:true, once:'nianxin_xiu', title:'缝衣人 · 绣名',
    desc:'缝衣人捻芯能将一个真名绣在人身上。绣上蛮荒大妖的真名，你便如披甲，妖族见你如见凶神——但那也是一道永远褪不去的诅咒。',
    opts:[
      { txt:'绣上。怕，就不配守这座城', note:'披甲 · 守',
        eff:{道心:2, 名:4, rel:{剑气长城:4}, stance:{守:3}, flag:'xiu_shang', msg:'针线入肤那夜你烧了整宿。天亮时你站起来，城头的妖族都不敢直视你。'} },
      { txt:'不绣。人不能活成一件凶器', note:'不役于物 · 剑礼',
        eff:{道心:3, 名:1, rel:{剑气长城:2}, stance:{剑礼:2}, flag:'xiu_bu', msg:'你谢过捻芯，没有绣。有人骂你傻，你只说：「我得记得自己是谁。」'} },
    ]},
  { id:'wenmiao_yishi', chapter:5, bookXun:36, type:'问心', urgent:true, once:'wenmiao_yishi', title:'文庙议事',
    desc:'浩然天下的山巅人物与蛮荒大妖在文庙谈判。谈崩了。礼圣问你：打，还是再谈？满堂读书人都看着你。',
    opts:[
      { txt:'打。这一仗躲不过', note:'主战 · 势',
        eff:{道心:1, 名:5, rel:{剑气长城:3}, stance:{势:4}, flag:'wenmiao_da', msg:'你说：「谈了也是打，不如现在打。」满堂寂然，随后有人第一个站了起来。'} },
      { txt:'再谈一次，能少死一个是一个', note:'主和 · 守',
        eff:{道心:3, 名:-1, rel:{文圣一脉:3}, stance:{守:3}, flag:'wenmiao_tan', msg:'你主张再谈。有人骂你怯，可你知道，死的都是谁家的儿子。'} },
    ]},
  { id:'tuoyue_shan', chapter:6, bookXun:50, type:'问心', urgent:true, once:'tuoyue_shan', title:'托月山',
    desc:'你借十四境之力，随宁姚等人直入蛮荒托月山。老剑条在手，对面是那位飞升境的纯粹剑修元凶。这一剑下去，你自己也要跌落境界。',
    opts:[
      { txt:'斩。哪怕跌境，也斩', note:'一剑斩元凶 · 剑礼',
        eff:{名:8, 道心:2, rel:{剑气长城:5, 宁姚:3}, stance:{剑礼:4, 势:2}, flag:'zhan_yuanxiong', msg:'剑光起处，来敌授首。你从十四境一路跌回金丹，却笑得像个少年。'} },
      { txt:'留手，留一线余地', note:'不尽杀 · 守',
        eff:{道心:3, 名:2, rel:{剑气长城:2, 文圣一脉:2}, stance:{守:3}, flag:'zhan_liushou', msg:'你收了三分力。敌者退去，天下却有人骂你心软。你认了。'} },
    ]},
  { id:'shanhe_xinxiang', chapter:6, bookXun:52, type:'问心', urgent:true, once:'shanhe_xinxiang', title:'山水心香',
    desc:'大战之后，浩然天下处处破碎。你可以用文庙攒下的全部功德，去换山水神灵的心香，一寸寸修补河山——代价是，你半生功名，尽数散尽。',
    opts:[
      { txt:'换。山河比名声要紧', note:'舍名修山河 · 守',
        eff:{道心:4, 名:-8, stance:{守:4}, flag:'shanhe_fix', msg:'你一座山一座山地走，一遍遍求心香。桐叶洲重新长出青草那天，没人在场，只有你知道。'} },
      { txt:'先立山门，有余力再说', note:'先固本 · 势',
        eff:{道心:-2, 名:4, stance:{势:3}, flag:'shanhe_hou', msg:'你把功德留给了落魄山。山河自有后来人补——你这样告诉自己，却总觉得少了点什么。'} },
    ]},

  // —— 中期门控示例：第二章由「剑礼」立场决定你遇见谁（隐形守护者式涟漪）——
  { id:'jianxiu_lead', type:'奇遇',
    gate:function(s){ return s.nodeFired['qulu'] && !s.nodeFired['dabi'] && stanceAt(s,'剑礼')>=2; },
    title:'剑修引路', desc:'一名剑修见你剑意凛然，愿指点你祭剑之法门。',
    opts:[ { txt:'虚心请教', note:'祭剑之道更通透', eff:{灵:-5, 道心:1, flag:'jianxiu_help', msg:'你祭剑之途，平添几分通透。'} } ]},
  { id:'wenmiao_lead', type:'奇遇',
    gate:function(s){ return s.nodeFired['qulu'] && !s.nodeFired['dabi'] && stanceAt(s,'剑礼')<=-2; },
    title:'文庙遗风', desc:'骊珠降格后，一缕书香引你去读残碑，讲道理时心底更定。',
    opts:[ { txt:'静坐读碑', note:'道心更稳', eff:{道心:3, 名:2, flag:'wenmiao_help', msg:'你于残碑前久坐，规矩与道理，愈发明白。'} } ]},

  // —— 讲道理 ——
  { id:'guycan_ye', chapter:1, bookXun:4, type:'讲道理', urgent:true, once:'guycan_done', title:'顾璨夜投',
    desc:'满身是血的顾璨跪在山门外，求你收留。书简湖的杀孽在他身后如影随形。',
    opts:[
      { txt:'收为弟子', note:'得绝强战力，情义+，道心-，名声-，天下侧目',
        eff:{disc:{action:'add', key:'guycan'}, 道心:-5, 名:-10, rel:{顾璨:5}, stance:{守:3}, flag:'guycan_in', msg:'你扶起他：「进来吧。」从此多了一身因果。'} },
      { txt:'收留但不入门', note:'情义稍慰，道心小损，名声小损',
        eff:{disc:{action:'add', key:'guycan', loyal:30}, 道心:-2, 名:-4, rel:{顾璨:3}, stance:{守:1}, flag:'guycan_half', msg:'你让他住下，却不入弟子籍——给他一条路，也留一分余地。'} },
      { txt:'拒之门外', note:'名声+、心结+、道心+守底线，却寒了人心',
        eff:{名:8, 道心:3, rel:{顾璨:-2}, stance:{守:-2}, flag:'guycan_out', msg:'你闭了门。裴钱红了眼，顾璨娘子跪到天明。你守了规矩，也寒了些东西。'} },
    ]},
  { id:'shujian_an', type:'讲道理', title:'书简湖旧案',
    desc:'有人翻出书简湖旧事，要你为顾璨的杀孽「给个说法」。',
    opts:[
      { txt:'以理服人（书院≥1）', note:'守底线扬名，需书院撑腰',
        req:{building:'书院'}, eff:{名:8, 道心:4, msg:'你引老秀才「三不」之说，条分缕析，问者赧然。'} },
      { txt:'含糊带过', note:'息事，却埋心结',
        eff:{道心:-2, 名:2, flag:'an_muddle', msg:'你打了个圆场，事是过去了，心里却留了根刺。'} },
      { txt:'坦然担下', note:'名望与道心齐涨，但招来更深的敌意',
        eff:{名:6, 道心:6, flag:'an_take', msg:'「人要认，账要清。」你一句话，反叫对手无从下手。'} },
    ]},
  { id:'shanmin', type:'讲道理', title:'山民讼争',
    desc:'两户山民为一块灵田争执不下，请山主做主。',
    opts:[
      { txt:'依理公断', note:'公道，名声+，道心+',
        eff:{名:5, 道心:3, msg:'你量地划界，两造皆服。'} },
      { txt:'各打五十', note:'省事，却两头不讨好',
        eff:{名:-1, 道心:-1, msg:'你各罚一通，表面平了，实则都不服。'} },
      { txt:'偏袒亲厚', note:'得人情，损公道与道心',
        eff:{名:4, 道心:-4, flag:'pianhu', msg:'你向着相熟的一家，另一家自此离心。'} },
    ]},
  { id:'wenmiao', type:'讲道理', title:'文庙责难',
    desc:'文庙来人，责你收留「不守规矩」之辈（暗指顾璨），要你自省。',
    opts:[
      { txt:'据理以争', note:'守道，需道心足，胜则扬名',
        req:{道心:30}, eff:{名:10, 道心:2, flag:'wenmiao_win', msg:'你言：「规矩是死的，人是活的。」来人悻悻。'} },
      { txt:'虚心受教', note:'息事，道心微涨，名望稍损',
        eff:{名:-3, 道心:2, msg:'你拱手称是，来人满意而去，你却觉着憋闷。'} },
      { txt:'反唇相讥', note:'痛快，却结文庙之怨',
        eff:{名:2, 道心:-3, flag:'wenmiao_quarrel', msg:'你一句话噎回去，痛快是痛快，梁子也结下了。'} },
    ]},
  { id:'dizi_cuo', type:'讲道理', title:'弟子犯错',
    desc:'一名弟子私自动用山产，被你撞破，垂头请罚。',
    opts:[
      { txt:'诲而不责', note:'忠心+，道心+，耗些银',
        eff:{银:-4, 道心:2, disc:{action:'loyalAll', v:5}, msg:'你只讲了番道理，弟子愧疚，越发死心塌地。'} },
      { txt:'依规重罚', note:'立威，名声+，忠心-',
        eff:{名:4, disc:{action:'loyalAll', v:-6}, msg:'你重罚以示山规，旁人敬畏，当事人却生了隔阂。'} },
      { txt:'逐出师门', note:'清门，忠心大损、名声涨跌两说',
        eff:{名:-2, disc:{action:'loyalAll', v:-12}, flag:'expel', msg:'你将其逐出，山门肃然，却也寒了众人。'} },
    ]},
  { id:'cuizhan', type:'讲道理', title:'崔瀺算计',
    desc:'崔瀺笑吟吟来访，说有一桩「稳赚」的买卖，要你出灵机入股。',
    opts:[
      { txt:'入股（灵≥20）', note:'或赚大笔，或被坑一笔，看天意',
        req:{灵:20}, eff:{灵:-20, flag:'cuizhan_deal', msg:'你押了灵机进去，崔瀺笑而不语——是福是祸，且看后效。'} },
      { txt:'只叙旧不谈钱', note:'不得利，也不吃亏',
        eff:{道心:1, msg:'你只与他闲话当年，生意的事半句不提。'} },
      { txt:'请他吃顿饭打发', note:'省心，略失礼数',
        eff:{银:-3, 名:1, msg:'你留他吃碗面，送客了事。'} },
    ]},
  // —— 天劫 / 心魔 ——
  { id:'tianjie', type:'天劫', urgent:true, crisis:true, title:'境界突破 · 天劫',
    desc:'你感应到境界关隘，欲借天地之力破境。天劫将至，须以底蕴相抗——扛过，便更上一层。',
    opts:[
      { txt:'以灵机硬抗（灵≥15）', note:'成则修为大进，败则掉修为',
        req:{灵:15}, eff:{灵:-15, flag:'tianjie_ling', msg:'你引灵机护身，扛过雷劫，气息更盛。'} },
      { txt:'以本命飞剑相抵（需本命飞剑）', note:'剑济则渡，剑弱则损',
        req:{swordTier:2}, eff:{flag:'tianjie_sword', msg:'本命飞剑出鞘，替你削去三分天威。'} },
      { txt:'以道心镇之（道心≥40）', note:'心稳则劫轻，却耗道心',
        req:{道心:40}, eff:{道心:-8, flag:'tianjie_dao', msg:'你守稳心神，天劫竟自退了三分。'} },
    ]},
  { id:'xinmo', type:'天劫', urgent:true, crisis:true, title:'心魔来袭',
    desc:'道心不稳，旧日杀孽与愧疚化作心魔，于静室中扰你神魂。',
    opts:[
      { txt:'直面本心', note:'道心越低越险，胜则稳固',
        eff:{flag:'xinmo_face', msg:'你不与心魔辩，只盯着那盏灯——它竟淡了。'} },
      { txt:'借丹药压服（丹≥2）', note:'耗丹，暂压下',
        req:{丹:2}, eff:{丹:-2, 道心:2, msg:'你吞下两枚丹药，神魂稍安。'} },
      { txt:'放任不管', note:'省丹，道心大损，埋下大患',
        eff:{道心:-10, flag:'xinmo_ignore', msg:'你闭目不理，心魔却在你眼底生了根。'} },
    ]},
  { id:'zhen_gao', type:'天劫', urgent:true, crisis:true, title:'护山大阵告急',
    desc:'蛮荒斥候窥伺，护山大阵灵机将枯，若不补，来日叩关必破。',
    opts:[
      { txt:'倾灵续阵（灵≥12）', note:'阵稳，灵机大耗',
        req:{灵:12}, eff:{灵:-12, flag:'zhen_ok', msg:'你续上灵机，大阵光芒复盛。'} },
      { txt:'以弟子代守', note:'省灵，弟子忠心/修为受些累',
        eff:{disc:{action:'loyalAll', v:-4}, flag:'zhen_disc', msg:'你令弟子轮值守阵，众人疲累却也同心。'} },
      { txt:'赌它不破', note:'省灵，叩关时减伤尽失的风险',
        eff:{flag:'zhen_gamble', msg:'你赌蛮荒不会来——这赌，未必赢。'} },
    ]},
  // —— 奇遇 ——
  { id:'ruanxiu', type:'奇遇', title:'阮秀赠剑胚',
    desc:'阮秀寻来，说感你护山之心，赠你一枚火属剑胚，可祭炼为本命。',
    opts:[
      { txt:'欣然受之', note:'得一枚剑胚（祭炼素材），名声+',
        eff:{名:5, flag:'got_sword_blank', msg:'阮秀一笑，剑胚入手犹带余温。'} },
      { txt:'回赠灵药', note:'人情往来，名声小涨，未得剑胚',
        eff:{名:3, 丹:-1, msg:'你回赠灵药，阮秀收下，剑胚却未留。'} },
    ]},
  { id:'jiuzang', type:'奇遇', title:'剑冢遗藏',
    desc:'山中古剑冢异动，似有遗藏现世，然守护之力未消，取之有险。',
    opts:[
      { txt:'冒险探取（机缘≥1）', note:'高回报，或得飞剑词条，或受伤',
        req:{机缘:1}, eff:{flag:'jiuzang_go', msg:'你踏进剑冢，剑气纵横中，竟摸得一枚古剑铭。'} },
      { txt:'只取外围', note:'稳妥，小得',
        eff:{灵:6, msg:'你只在外围拾得几缕残灵。'} },
      { txt:'封而不取', note:'敬古，道心+',
        eff:{道心:4, msg:'你封了剑冢，敬古之剑修——心反倒静了。'} },
    ]},
  { id:'duxuanshan', type:'奇遇', title:'倒悬山赌局',
    desc:'倒悬山别院可开赌坊，一掷之间，运去金如铁，运来铁如金。',
    opts:[
      { txt:'小赌怡情（银≥10）', note:'或得银，或失银',
        req:{银:10}, eff:{银:-10, flag:'gamble_small', msg:'你押了十两，骰子转了几圈——且看天意。'} },
      { txt:'孤注一掷（银≥25）', note:'大赚或大亏',
        req:{银:25}, eff:{银:-25, flag:'gamble_big', msg:'你把银子全推上桌，心跳如鼓。'} },
      { txt:'不赌', note:'守财，名声在清修圈小涨',
        eff:{名:1, msg:'你摇头离桌，旁人笑你胆小，你自淡然。'} },
    ]},
  { id:'haoshu', type:'奇遇', title:'老槐树显灵',
    desc:'夜深，老槐树无风自动，洒下一片槐叶，似有古意流转。',
    opts:[
      { txt:'以道心承之（道心≥20）', note:'山根更固，灵机产出涨',
        req:{道心:20}, eff:{道心:-3, 灵:8, flag:'haoshu', msg:'你接住槐叶，山根一震，灵机竟旺了一截。'} },
      { txt:'以灵机引之（灵≥10）', note:'得悟，修为小进',
        req:{灵:10}, eff:{灵:-10, flag:'haoshu_ling', msg:'你投以灵机，槐树回你一段古诀。'} },
    ]},

  // —— 访客 / 书信 ——
  { id:'ningyao_lai', type:'访客', title:'宁姚来访',
    gate: function(s){ return !s.flags['ningyao'] && s.res.道心>=15; },
    desc:'剑气长城的宁姚踏藕花福地而来，说久闻山主行事「讲道理」。她立于山门外，似在掂量你值不值得结这个人缘。',
    opts:[
      { txt:'以茶相待，承她人情', note:'结下宁姚人情，日后可请其镇场',
        eff:{名:6, 道心:2, flag:'ningyao', msg:'你煮茶相待。宁姚一笑：「这人，我认了。」自此落魄山多了一道剑气长城的护持。'} },
      { txt:'淡然相谢，不涉因果', note:'守清静，名声小涨，不欠人情',
        eff:{名:3, 道心:1, msg:'你谢过她，却未牵扯太深。宁姚点头离去，藕花福地的剑意却留了三分。'} },
      { txt:'请她指点剑道（道心≥30）', note:'得剑道感悟，道心+，但招来长城瞩目',
        req:{道心:30}, eff:{道心:5, 名:-3, flag:'ningyao', msg:'她随手演一剑，你悟了许久。剑气长城从此记下了落魄山这个名字。'} },
    ]},
  { id:'wensheng_yize', type:'访客', title:'老秀才遗泽',
    gate: function(s){ return s.nodeFired['qulu'] && !s.flags['wensheng_done']; },
    desc:'骊珠降格后，文圣一脉的遗泽化作一缕书香，落在书院旧址。你似听见先生遥遥一句：「遇事不决，可问春风。」',
    opts:[
      { txt:'静坐受教', note:'道心大涨，得「老秀才遗泽」',
        eff:{道心:8, 名:3, flag:'wensheng_done', msg:'你盘膝坐了一夜。天亮时，胸中那杆秤，稳了三分。'} },
      { txt:'以此开坛讲道（书院≥1）', note:'扬名养道，需书院撑场',
        req:{building:'书院'}, eff:{名:8, 道心:4, flag:'wensheng_done', msg:'你于旧址开坛，讲先生「三不」之说，远近学子来听。'} },
      { txt:'封存不取', note:'敬先生，道心微涨',
        eff:{道心:2, flag:'wensheng_done', msg:'你将那缕书香封存于书院，权当先生仍在。'} },
    ]},
  { id:'ruanqiong_zhu', type:'访客', title:'阮邛铸剑',
    gate: function(s){ return (s.buildings['剑庐']&&s.buildings['剑庐'].lv>=1) && !s.flags['ruanqiong_done']; },
    desc:'骊珠洞天铸剑师阮邛慕名而来，见你剑庐初成，愿留一程，助你祭炼飞剑。',
    opts:[
      { txt:'请他坐镇剑庐', note:'祭炼飞剑更易成、词条更优',
        eff:{flag:'ruanqiong_done', msg:'阮邛入剑庐，炉火更纯。此后祭炼，剑成之期可期。'} },
      { txt:'只求一柄剑胚', note:'得一枚上品剑胚（祭炼素材）',
        eff:{名:4, flag:'got_sword_blank', msg:'阮邛掷来一枚剑胚：「拿去玩。」'} },
      { txt:'婉拒，不敢耽误', note:'清静，名声小涨',
        eff:{名:2, flag:'ruanqiong_done', msg:'你谢过他的好意。阮邛哈哈一笑，自去游山。'} },
    ]},
  { id:'lun_dao', type:'论道', title:'文庙论道',
    gate: function(s){ return (s.buildings['书院']&&s.buildings['书院'].lv>=1); },
    once:'lundao_done',
    desc:'山崖书院邀你赴文庙论道。四方儒生各执一说，欲以「道理」定高下。你抚过袖中那本旧书，想起先生的话。',
    opts:[
      { txt:'以「理」相争（对 礼圣门人）', note:'道心+书院为道理点，胜则扬名养道',
        debate:{ opp:'礼圣门人', power:35, win:{名:10, 道心:4}, lose:{名:-3, 道心:-2} } },
      { txt:'以「情」相争（对 野修辩士）', note:'野修机锋更利，胜则得机缘',
        debate:{ opp:'野修辩士', power:28, win:{名:6, 机缘:1, 道心:2}, lose:{道心:-3} } },
      { txt:'静坐听道，不与人争', note:'守拙，道心小涨',
        eff:{道心:3, msg:'你只静坐听众人争，反得了几分清静。'} },
    ]},

  /* ============ 门中·供奉（据百度百科「落魄山」：管家/掌律/账房/供奉） ============ */
  { id:'weibo_join', type:'江湖', once:'weibo_join', gate:function(s){ return s.xun>=6; }, title:'棋墩山的土地公',
    desc:'一个自称棋墩山土地公的中年人上了山，说他的神位被大骊罢了，金身打碎沉在江底。他也不恼，只说北岳地界有句老话：大公鸡上披云山，都得留下两个蛋。',
    opts:[
      { txt:'请他住下', note:'得一位住山大使 · 欠一份人情',
        eff:{retinue:{action:'add', key:'weibo'}, renqing:1, 名:3,
        msg:'他说那自己就是落魄山的「住山大使」，半个主人。你没反驳——后来山上大小迎来送往，果然都是他张罗。'} },
      { txt:'只结个善缘', note:'不引入门中 · 名望小涨',
        eff:{名:3, flag:'weibo_shanyuan', msg:'你与他喝了顿酒，各留一分余地。他说：「山主什么时候改主意了，知会一声。」'} },
      { txt:'神道因果，不沾', note:'道心 +2 · 少一条路',
        eff:{道心:2, 名:-1, flag:'weibo_jue', msg:'你婉拒了。他点点头下山，走到半途回头看了眼这座山，什么也没说。'} },
    ]},
  { id:'zhulian_join', type:'江湖', once:'zhulian_join', gate:function(s){ return s.xun>=10; }, title:'大管家上门',
    desc:'一名山巅境武夫背着包袱站在山门口，说听闻此处缺个管事的。他叫朱敛。',
    opts:[
      { txt:'把山务交给他', note:'得大管家 · 每旬支俸',
        eff:{retinue:{action:'add', key:'zhulian'}, 名:2,
        msg:'他接过山务的第二天，落魄山的账就分了三本：人、物、事。'} },
      { txt:'婉拒', note:'省一份俸禄',
        eff:{名:-1, msg:'他也不恼，拱拱手走了。此后山上杂事，依旧是你自己扛。'} },
    ]},
  { id:'weiwenlong_join', type:'江湖', once:'weiwenlong_join', gate:function(s){ return s.xun>=12; }, title:'倒悬山来的账房',
    desc:'韦文龙，倒悬山出身，邵云岩嫡传，金丹境，术算天才。他说他别的不会，就会算账。',
    opts:[
      { txt:'请他掌泉府', note:'得账房 · 进项更稳',
        eff:{retinue:{action:'add', key:'weiwenlong'}, 银:12, 名:1,
        msg:'他上任头一件事，是把落魄山历年糊涂账重抄了一遍。抄完，凭空多出十二两银子。'} },
      { txt:'不必了', note:'省一份俸禄',
        eff:{msg:'他收起算筹告辞。你后来听说，他去了别处当财神爷。'} },
    ]},
  { id:'changming_join', type:'江湖', once:'changming_join', gate:function(s){ return s.xun>=14 && s.disciples.length>=2; }, title:'掌律长命',
    desc:'门下渐众，山中却还没有个定规矩的人。长命来了，说规矩这东西，早立比晚立好。',
    opts:[
      { txt:'立他为掌律', note:'得掌律 · 道心每旬渐稳',
        eff:{retinue:{action:'add', key:'changming'}, 道心:2,
        msg:'他立的头一条规矩是：山主犯错，与弟子同罚。你说这条好。'} },
      { txt:'规矩我自己立', note:'不假手他人',
        eff:{道心:1, 名:-1, msg:'你自己写了山中律令。写得慢，也写得重。'} },
    ]},
  { id:'jiangshangzhen_join', type:'江湖', once:'jiang_join', gate:function(s){ return s.res.名>=22; }, title:'首席供奉',
    desc:'姜尚真，仙人境巅峰剑修。这样的人物肯来落魄山挂个名，天下人会重新打量这座山头——也会重新打量你的分量。',
    opts:[
      { txt:'请他坐首席', note:'得首席供奉 · 旬俸最重',
        eff:{retinue:{action:'add', key:'jiangshangzhen'}, 名:6,
        msg:'他答应得很干脆，只提了一个条件：不管山务。你说正好。'} },
      { txt:'养不起这尊佛', note:'省重俸 · 名望小涨',
        eff:{名:2, flag:'jiang_ci', msg:'你如实说了家底。他反倒高看你一眼：「会算账的山主，比会吹的山主活得久。」'} },
    ]},
  { id:'xiaomo_join', type:'江湖', once:'xiaomo_join', gate:function(s){ return s.res.名>=32; }, title:'睡了万年的人',
    desc:'持剑者把一个沉睡在皓彩明月里的人带到你面前，说给你当保镖。他自称小陌。跟在他身后的女子化名白景——真名谢狗，飞升境巅峰，两把本命飞剑。',
    opts:[
      { txt:'两个都留下', note:'得两位一等供奉 · 旬俸极重',
        eff:{retinue:{action:'add', key:'xiaomo'}, 名:5,
        msg:'小陌只问了一句「管饭吗」。你说管。他就不走了。谢狗看了他一眼，也留下了。'} },
      { txt:'只留小陌', note:'省一份重俸',
        eff:{retinue:{action:'add', key:'xiaomo'}, 名:3, flag:'xiegou_zou',
        msg:'谢狗没说什么，转身走了。小陌站在原地看了很久，最后还是进了山门。'} },
      { txt:'一个不留', note:'清静',
        eff:{名:-2, flag:'xiaomo_zou', msg:'你说落魄山庙小。持剑者笑了一声，把人带走了。'} },
    ]},

  /* ============ 夜游宴（魏檗的攒钱法子：好选项必有代价） ============ */
  { id:'yeyou_yan', type:'江湖', once:'yeyou_done', urgent:true,
    gate:function(s){ return (s.retinue['wei-bo']||s.flags['weibo_shanyuan']) && !s.flags['yeyou_ban']; },
    title:'夜游宴',
    desc:'魏檗说，北岳地界凡是有点名头的山头，都办夜游宴。来的都是客，客都得留点什麼再走。落魄山如今连护山大阵的灵机都快供不上了。',
    opts:[
      { txt:'大办三日', note:'进银极丰 · 欠人情 · 清誉有损',
        eff:{银:45, 名:8, 道心:-3, renqing:3, flag:'yeyou_ban',
        msg:'三夜灯火通明。魏檗替你把一半家底攒下来了，也把一半人情赊出去了。散场那日有人拍着你肩膀说「山主，改日」，你笑着应下，心里记了一笔。'} },
      { txt:'小办一席', note:'进银尚可 · 欠一分人情',
        eff:{银:18, 名:2, 道心:-1, renqing:1, flag:'yeyou_ban',
        msg:'只摆了一席。来的人不多，留下的也不多。魏檗说够了，够撑一阵。'} },
      { txt:'不办', note:'道心安稳 · 山门更穷',
        eff:{道心:3, 名:-2, flag:'yeyou_ban',
        msg:'你说落魄山不收买路钱。魏檗看了你半晌，点头道：「也是。」那一年山上的冬天，格外长。'} },
    ]},
  { id:'yeyou_zhai', type:'江湖', urgent:true,
    gate:function(s){ return (s.renqing||0) >= 3; }, title:'债主登门',
    desc:'当年夜游宴上你敬过的酒，如今有人端着杯子站在山门口。他不说要什么，只说「山主，改日」——今日就是那个改日。',
    opts:[
      { txt:'认账', note:'银钱了结 · 人情清零',
        eff:{银:-30, renqing:-3, msg:'你把账清了。他愣了一下，说山主这人，可以交。'} },
      { txt:'再拖一拖', note:'暂不动银 · 人情更重',
        eff:{renqing:1, 名:-3, msg:'你笑着说再等等。他也笑，笑意没到眼底。'} },
      { txt:'这笔账，我不认', note:'保住银钱 · 名声与道心俱损',
        eff:{renqing:-9, 名:-8, 道心:-5, flag:'lai_zhang',
        msg:'你说夜游宴是待客，不是买卖。他点点头走了，从此北岳地界再没人替落魄山说话。'} },
    ]},

  /* ============ 回响：早年的一念，多年后自己走回来 ============ */
  { id:'echo_zhao_back', type:'抉择', once:'echo_zhao_back',
    gate:function(s){ return s.flags['zhaoshuxia_yuan'] && s.xun>=20 && !s.disciples.some(d=>d.key==='zhaoshuxia'); },
    title:'他果然来了',
    desc:'一个青年背着半袋干粮站在山门前，说胭脂郡一别，他还活着。你说过若还活着，可以上山。他记着这句话，走了很多年。',
    opts:[
      { txt:'收下他', note:'得一名弟子 · 忠心极坚',
        req:{discSlot:true}, eff:{disc:{action:'add', key:'zhaoshuxia', loyal:95}, 道心:3,
        msg:'他放下干粮，先磕了三个头，然后问：「师父，今天练多少拳？」'} },
      { txt:'山上容不下你了', note:'守规矩 · 道心有亏',
        eff:{道心:-3, 名:-2, msg:'你说山上名额满了。他把干粮留下，说那师父留着吃。你看着他的背影，想起很多年前那把卷了刃的柴刀。'} },
    ]},
  { id:'echo_zhao_fen', type:'抉择', once:'echo_zhao_fen',
    gate:function(s){ return s.flags['zhaoshuxia_guo'] && s.xun>=20; },
    title:'胭脂郡的坟',
    desc:'你路过胭脂郡，问起当年那个握柴刀的少年。有人说，妖族第二次打进来那年，他挡在妹妹前面，没站起来。',
    opts:[
      { txt:'替他立一块碑', note:'道心大涨 · 名望微损',
        eff:{道心:4, 名:-1, msg:'你凿了块碑，上头没有名字——你连他的名字都没问过。'} },
      { txt:'赶路要紧', note:'不受触动',
        eff:{道心:-2, msg:'你转身走了。有些账，是记不上的。'} },
    ]},
  { id:'echo_ningji', type:'讲道理', once:'echo_ningji',
    gate:function(s){ return s.disciples.some(d=>d.key==='ningji') && s.xun>=26; },
    title:'文庙过问',
    desc:'文庙来人问起宁吉：人族与妖族的子嗣，天生道胎，文庙记名在册已多年。他们要一个说法——是看着，还是教着。',
    opts:[
      { txt:'我教着，我担着', note:'护徒 · 与文庙生隙',
        eff:{道心:3, 名:-5, rel:{文圣一脉:-2}, stance:{守:3}, flag:'ningji_dan',
        msg:'你说这孩子我自己教，出了事算我的。来人沉默良久，说那就有劳山主了。'} },
      { txt:'交给文庙看着', note:'守规矩 · 凉了孩子的心',
        eff:{名:4, 道心:-2, rel:{文圣一脉:2}, stance:{剑礼:2}, flag:'ningji_jiao',
        msg:'宁吉没哭没闹，只是从那天起，画符的手抖了很久。'} },
    ]},
  { id:'echo_deng', type:'抉择', once:'echo_deng',
    gate:function(s){ return s.disciples.some(d=>d.key==='dengjianping') && s.xun>=30; },
    title:'随驾城又落天劫',
    desc:'随驾城又落天劫。当年他为了活命走开，把两个孩子留在原地；如今他已是金丹剑修，站在你身边。城还在，两个孩子早已不在了。',
    opts:[
      { txt:'陪他走一趟', note:'解心结 · 旬余在山外',
        eff:{道心:4, 名:3, flag:'deng_jie', disc:{action:'loyal', key:'dengjianping', v:20},
        msg:'你们在随驾城收了几个开山弟子。他站在天劫底下没动，回来时眼里的东西轻了许多。'} },
      { txt:'他得自己去', note:'不假手 · 他自己过这道坎',
        eff:{道心:1, flag:'deng_zi', disc:{action:'loyal', key:'dengjianping', v:-10},
        msg:'他一个人去的，回来时什么也没说，只是从那以后练剑练到天亮。'} },
    ]},
  { id:'echo_guo', type:'江湖', once:'echo_guo',
    gate:function(s){ return s.disciples.some(d=>d.key==='guozhujiu') && s.xun>=38; },
    title:'郭竹酒的小山头',
    desc:'郭竹酒在山上拉起了一个「小山头」，自封山主，还收了两个记名弟子。裴钱气得三天没跟她说话。',
    opts:[
      { txt:'由她闹去', note:'纵其天性',
        eff:{道心:1, 名:1, flag:'guo_zong', msg:'你说小孩子闹着玩，由她去。多年后她管着一山律令，果然管得很好。'} },
      { txt:'撤了这个山头', note:'立规矩 · 她心里不痛快',
        eff:{道心:1, 名:-1, flag:'guo_che', disc:{action:'loyal', key:'guozhujiu', v:-12},
        msg:'你撤了她的山头。她当面应了，转头在酒铺墙上又刻了一行字，你没去看。'} },
    ]},

  /* ============ 其余原著弟子入山 ============ */
  { id:'guozhujiu_join', type:'江湖', once:'guozhujiu_join',
    gate:function(s){ return s.xun>=22 && s.disciples.length>=1; }, title:'绿端',
    desc:'剑气长城郭家的独女，小名绿端，先天剑胚。她堵在山门口要拜师，说她爹答应过，只要她自己求得动，就由她。',
    opts:[
      { txt:'收下', note:'需静室有空位 · 得一名剑修弟子',
        req:{discSlot:true}, eff:{disc:{action:'add', key:'guozhujiu'}, 名:3,
        msg:'她磕完头就爬起来，说师父我剑呢。你说先认字。她脸都垮了。'} },
      { txt:'等她再大些', note:'不占名额 · 名望小涨',
        eff:{名:1, flag:'guo_deng', msg:'你说再等几年。她说那我每年都来一趟。她真的一年没落。'} },
    ]},
  { id:'ningji_join', type:'抉择', once:'ningji_join',
    gate:function(s){ return s.xun>=18; }, title:'可善可恶的孩子',
    desc:'陆沉把一个孩子领到你面前，说这孩子拜他拜你都行，他自己选了你。孩子的母亲是人族，父亲是蛮荒妖族——文庙盯着他很多年了。',
    opts:[
      { txt:'收他为徒', note:'需静室有空位 · 得一名符修弟子',
        req:{discSlot:true}, eff:{disc:{action:'add', key:'ningji'}, 道心:2, stance:{守:2},
        msg:'你只跟他说了一句：心正方能术纯。他记住了，记了很多年。'} },
      { txt:'让他拜陆沉', note:'不担因果 · 道心微损',
        eff:{道心:-1, 名:1, flag:'ningji_lu', msg:'他拜了陆沉，管陆沉叫小师父。临走前他回头看了你一眼。'} },
    ]},
  { id:'dengjianping_join', type:'抉择', once:'deng_join',
    gate:function(s){ return s.xun>=24 && s.disciples.length>=2; }, title:'求师的人',
    desc:'北俱芦洲剑道世家的子弟，本可拜入白裳门下，他却来了落魄山。求师的话说到一半，他自己说不出口了——他不敢练剑，怕想起随驾城那场天劫。',
    opts:[
      { txt:'为他留下', note:'需静室有空位 · 得一名剑修弟子',
        req:{discSlot:true}, eff:{disc:{action:'add', key:'dengjianping'}, 道心:2, stance:{守:2},
        msg:'你说，怕，说明还记得。忘了的才可怕。他站在原地很久，最后说了句「师父」。'} },
      { txt:'先想清楚再来', note:'不占名额',
        eff:{名:1, flag:'deng_hui', msg:'你说想清楚了再来。他走了，三年后真的又来了。'} },
    ]},
  { id:'yuanhuang_join', type:'江湖', once:'yuanhuang_join',
    gate:function(s){ return s.xun>=17; }, title:'看穿卖符的人',
    desc:'藕花福地出来的江湖游侠，话不多。你摆摊卖符，他站旁边看了半天，说这符是新画的。你没否认。他还是掏钱买了一张。',
    opts:[
      { txt:'收他', note:'需静室有空位 · 得一名弟子',
        req:{discSlot:true}, eff:{disc:{action:'add', key:'yuanhuang'}, 道心:1,
        msg:'你说这符不灵。他说知道，人得活。你本已不打算再收徒，是他破的例。'} },
      { txt:'请他喝酒', note:'不占名额 · 得一份缘',
        eff:{道心:1, 名:1, flag:'yuan_jiao', msg:'你们喝了一顿酒。他说山主这人不错，就是符画得糙。'} },
    ]},
];

const SECT_QULU_EVENT = { id:'qulu_event', type:'讲道理', urgent:true, title:'骊珠降格 · 先生远去',
  desc:'骊珠洞天降格，齐静春先生以身殉道，化去一洲文运。你本在山中静修，今被迫出山，泥瓶巷旧邻来投，亦有旧债主登门。',
  opts:[
    { txt:'担下泥瓶巷', note:'耗银、得民心与道心，名望微涨',
      eff:{银:-10, 道心:5, 名:4, flag:'qulu_take', msg:'你将泥瓶巷旧邻一并接回山里——这担子，你认了。'} },
    { txt:'只顾本山', note:'省银，道心-，名声-',
      eff:{银:0, 道心:-3, 名:-4, flag:'qulu_self', msg:'你只守落魄山，泥瓶巷的人你没接——夜里你想了很久。'} },
    { txt:'卖剑还债', note:'清旧债，得银，却损了些底子',
      eff:{银:12, 名:-2, flag:'qulu_sell', msg:'你忍痛处置一桩旧物还清债，账是清了，心疼许久。'} },
  ]};

const SECT_ENDINGS = {
  ascend:   { g:'S', t:'大典既成 · 落魄山立世',
    d:'第五十四旬，建宗大典。你山有弟子、剑有本命、心有秤。蛮荒叩关你守住，书院大比你扬名。四方观礼的人站满了霁色峰——落魄山从此不是地图上的一个点，而是一句「你的山头」。',
    poem:'我有一剑，可开天门；我有一山，可安众生。' },
  pacify:   { g:'A', t:'守成 · 山门不倒',
    d:'建宗大典你堪堪办成。论剑稍逊、讲道将将，弟子虽少却齐心。观礼的人来得不多，落魄山也没能名动天下，但灯一直亮着——这也算一种圆满。',
    poem:'不求惊天动地，但求山门不冷。' },
  broken:   { g:'D', t:'山门被破 · 蛮荒叩关',
    d:'蛮荒大举来犯，护山大阵形同虚设，弟子四散、灵脉被夺。你立于残碑前，想起当年立山时的那句话——终是没能守住。',
    poem:'剑气长城万里远，落魄山前一梦寒。' },
  lost:     { g:'D', t:'弟子尽散 · 孤山',
    d:'你忙于经营算计，忽略了身边人。一个个弟子或叛或离，最后只剩老槐树陪你。山还是那座山，却再无人唤你先生。',
    poem:'繁华落尽见真淳，真淳不在空余尘。' },
  demon:    { g:'D', t:'道心崩 · 入魔',
    d:'你一次次为效率弃了本心，道心碎尽那日，心魔自眼底涌出。落魄山更名「堕魔渊」——这结局，最违你初心。',
    poem:'算尽机关太聪明，反误了道心性命。' },
  ruined:   { g:'D', t:'名声扫地 · 除名',
    d:'行事乖张、背信弃义，天下侧目。文庙除你名、同道绝你交。落魄山被从修行地图上抹去，仿佛从未有过。',
    poem:'德不配位，必有灾殃；名不副实，终被遗忘。' },
  bankrupt: { g:'D', t:'入不敷出 · 荒废',
    d:'银穷灵竭，连护山大阵的维持都供不起。山民散去、弟子远走，落魄山荒草没径，只剩一个空名。',
    poem:'巧妇难为无米炊，空山不见煮茶人。' },
  // —— 路线归宿：合格档（S/A）内按因果细分的「立世姿态」，贴合原著人物线 ——
  jianqi_end:{ g:'S', t:'剑修立身 · 一剑霜寒',
    d:'你走的是剑修的路。一剑既出，万法可破。剑气长城镇过你的名，老剑仙点过你的道。这一生以剑立身，锋芒是道理，也是你给这世间的一句回话。',
    poem:'我与我周旋久，宁作我。——陈平安的道理' },
  wensheng_end:{ g:'S', t:'老秀才关门 · 浩然立言',
    d:'你接的是文圣一脉的衣钵。规矩与道理，是你立身的答案。书院里你讲过学，文庙中你立过言。浩然气长，落魄山更名「礼山」亦无妨。',
    poem:'读书人的道理，是先把自己读明白。——书中语' },
  yingguan_end:{ g:'S', t:'隐官归位 · 山海可平',
    d:'剑气长城记得你，隐官的印你接了。自此肩上不止一座落魄山，而是两洲生灵的安危。你成了那撑天的人——这人间塌下来的天，总得有人去撑。',
    poem:'这人间的天塌下来，总得有人撑着。——书中语' },
  ningyao_end:{ g:'A', t:'与子同袍 · 城不倒',
    d:'大典那天来观礼的人不算多，但有一件事你赢了：宁姚在你身旁。剑气长城的雪，落过两个人的肩头。山门虽不显赫，却暖，且再不会倒。',
    poem:'剑气长城的雪，落过两个人的肩头。——书中意' },
  gujiao_end:{ g:'A', t:'故交满座 · 山不孤',
    d:'落魄山不算顶尖，却从不冷清。阿良来过，刘羡阳来过，李宝瓶年年喊着「陈平安我回来啦」。少年时结下的交情，是一辈子的债，也是一辈子的福。',
    poem:'少年时结下的交情，是一辈子的债，也是一辈子的福。——书中意' },
  ruanxiu_end:{ g:'A', t:'山水有相逢 · 瓷器与龙',
    d:'你与阮秀的交情，像她手里的瓷器——火与土，终成器。山水有相逢，这一生你多了一位能论剑、也能论心的朋友，火光映面，惺惺相惜。',
    poem:'山水有相逢。——书中语' },
  // —— 第三批：契合原著「小故事问心」的归宿 ——
  zhixing_end:{ g:'S', t:'知行合一 · 讲道理的人',
    d:'你既未一味尚剑，也未空谈道理。剑在手，理在胸，行得正、坐得端。回望来路，骊珠洞天那个担水的少年，还是那个少年——「道理我都懂，可我还是想讲道理」。',
    poem:'道理我都懂，可我还是想讲道理。——陈平安' },
  tuoyue_end:{ g:'S', t:'托月山 · 一剑斩元凶',
    d:'你借十四境之力，随宁姚等人直入蛮荒托月山。老剑条在手，一剑斩落那位飞升境的纯粹剑修元凶。战后你于剑气长城刻下一个字，风雪扑面，天下侧目。',
    poem:'我有一剑，可开天门。——书中意' },
  shanshui_end:{ g:'A', t:'遍访山水 · 修复破碎山河',
    d:'战后的浩然天下处处破碎。你以文庙全部功德，换取山水神灵的心香，一遍遍走，一寸寸补。桐叶洲重新长出青草的那天，没人记得你，但那片山河记得。',
    poem:'人生当苦无妨，良人当归即好。——齐静春' },
  peiqian_end:{ g:'A', t:'薪火相传 · 有人替你撑伞',
    d:'裴钱长大了，个头比你高，伞也撑得稳。落魄山门下弟子渐众，青萍剑宗立起的那日，你站在最后面。你这一生没能教出多少天才，却教出了几个好人。',
    poem:'少年的肩膀，先挑起清风明月、草长莺飞。——书中语' },
};

/* ===================== 状态 ===================== */
function newSectState(diffKey){
  const d = SECT_DIFF[diffKey] || SECT_DIFF.normal;
  const buildings = {};
  for(const k in SECT_BUILDINGS) buildings[k] = { lv: SECT_BUILDINGS[k].init };
  return {
    diff: diffKey || 'normal',
    year:1, xun:1, ap:3,
    masterRealm:0, masterCult:0, breakPending:0,
    res: { 银:d.银, 灵:d.灵, 名:d.名, 道心:d.道心, 机缘:d.机缘, 丹:0 },
    buildings,
    disciples: [],
    retinue: {},            // 门中 · 供奉 · 管家：{ key:true }，不占静室名额，按旬支俸
    renqing: 0,             // 人情债：夜游宴等「借来的银子」记在此处，债主会登门
    swords: [],
    flags: {},
    trail: [],
    events: [],            // 本旬待处理事件
    backlog: 0,            // 积压事件数（旬末未处理）
    brokeStreak: 0,
    nodeFired: {},
    over:false, ending:null,
    ui:'main',
    moodOpen:false, moodLine:'',
    chronicle:false,       // 山志·原著脉络面板：默认收起，点击「山志」才展开
    log: [],
    fxQueue: [],
    relations: {},                       // 道契：与关键人物的亲疏（阿良/刘羡阳/顾璨/齐静春…）
    stance: { 剑礼:0, 守:0, 势:0 },       // 立场取向：以剑↔以礼 / 守一人↔守天下 / 顺势↔硬扛
    bookKey:'',                          // 当前所读册目（用于册首语只弹一次）
    prologue:null,                       // 章内"节"册首语卡片：{title,sub,body}
    settling:false,                      // 本旬已结算、待确认进入下一旬（中转页）
    lastSettle:null,                     // 中转页账目快照
  };
}

/* ===================== 工具 ===================== */
function sectClampRes(s){
  const r = s.res;
  r.银   = Math.max(0, Math.min(999, r.银));
  r.灵   = Math.max(0, Math.min(999, r.灵));
  r.名   = Math.max(0, Math.min(100, r.名));
  r.道心 = Math.max(0, Math.min(100, r.道心));
  r.机缘 = Math.max(0, Math.min(99,  r.机缘));
  r.丹   = Math.max(0, Math.min(99,  r.丹));
}
function sectGain(s, k, v){ s.res[k] = (s.res[k]||0) + v; sectClampRes(s); }
function sectLog(s, t, cls){ s.log.unshift({ t, cls:cls||'' }); if(s.log.length>60) s.log.pop(); }
function sectTrail(s, t, c, note){ s.trail.push({ t, c, note }); }
/* 因果引擎：道契（关系）与立场（道理观取向） */
function relAt(s, who){ return s.relations[who]||0; }
function stanceAt(s, axis){ return s.stance[axis]||0; }
function sectAddRel(s, who, d){ s.relations[who] = Math.max(-10, Math.min(10, (s.relations[who]||0)+d)); }
function sectAddStance(s, axis, d){ s.stance[axis] = Math.max(-10, Math.min(10, (s.stance[axis]||0)+d)); }

/* 弟子操作 */
function sectAddDisc(s, key, loyal){
  if(s.disciples.some(d=>d.key===key)) return false;
  const def = SECT_DISCIPLES[key];
  if(!def) return false;
  s.disciples.push({ key, name:def.name, art:def.art, dao:def.dao, realm:def.realm,
    base:def.base, loyal: loyal!=null?loyal:def.loyal, stage:0, xiwei:0 });
  return true;
}
function sectSlotUsed(s){ return s.disciples.length; }
function sectSlotMax(s){ return (s.buildings['静室']?s.buildings['静室'].lv:0) * 2; }

/* 战力（用于大比/叩关判定） */
function sectPower(s){
  let p = 0;
  s.disciples.forEach(d=>{ p += d.xiwei + d.stage*15 + 10; });
  p += s.swords.length * 5;
  p += (s.buildings['护山大阵']?s.buildings['护山大阵'].lv:0) * 12;
  p += sectRetinuePow(s);         // 门中供奉：落魄山真正的家底
  return p;
}
function sectHasSwordTier(s, tier){ return s.swords.some(x=>x.tier>=tier); }

/* ===================== 入口 ===================== */
function openSect(){
  SFX.set(true); SFX.click();
  sectFXClear(); sectFXInit();
  S = newSectState(SECT_DIFF_KEY);
  const s = S;
  sectLog(s, '你于骊珠洞天降格之际，立落魄山。山主之责，自此而始。', 'big');
  // 开局即展示第一册册首语（章内"节"的仪式感）
  const first = sectCurrentBook(s);
  s.bookKey = first.book;
  s.prologue = { title:'《'+first.book+'》', sub:'第 '+first.act+' 幕 · '+first.actName+'　第 '+first.bookIdxInAct+' / '+first.bookCountInAct+' 册', img: (first.bookIdxInAct===1) ? SECT_ACTS[first.act-1].img : null, body: SECT_BOOK_PROLOGUE[first.book] || '' };
  // 裴钱拜师不再于开局推送：原著中裴钱在落魄山已立、剑气长城一脉之后才出现，
  // 对应事件 peiqian_san（bookXun:45）。开局收徒违背剧情推进节奏。
  s.moodLine = sectMoodLine(s);
  emitView();
}

/* ===================== 事件解析 ===================== */
function sectEventDef(id){
  if(id==='qulu_event') return SECT_QULU_EVENT;
  return SECT_EVENTS.filter(e=>e.id===id)[0];
}
function sectOptReqOk(s, opt){
  const r = opt.req; if(!r) return { ok:true };
  if(r.道心!=null && s.res.道心 < r.道心) return { ok:false, why:'需道心≥'+r.道心 };
  if(r.灵!=null   && s.res.灵   < r.灵)   return { ok:false, why:'需灵机≥'+r.灵 };
  if(r.银!=null   && s.res.银   < r.银)   return { ok:false, why:'需银两≥'+r.银 };
  if(r.丹!=null   && s.res.丹   < r.丹)   return { ok:false, why:'需丹≥'+r.丹 };
  if(r.机缘!=null && s.res.机缘 < r.机缘) return { ok:false, why:'需机缘≥'+r.机缘 };
  if(r.名!=null   && s.res.名   < r.名)   return { ok:false, why:'需名声≥'+r.名 };
  if(r.flag && !s.flags[r.flag])          return { ok:false, why:'需先结下相关因缘' };
  if(r.building && (!s.buildings[r.building] || s.buildings[r.building].lv<1)) return { ok:false, why:'需先建'+r.building };
  if(r.swordTier && !sectHasSwordTier(s, r.swordTier)) return { ok:false, why:'需本命飞剑' };
  if(r.discSlot && sectSlotUsed(s) >= sectSlotMax(s))   return { ok:false, why:'静室名额已满' };
  if(r.rel){ for(const k in r.rel){ if((s.relations[k]||0) < r.rel[k]) return { ok:false, why:'需与'+k+'亲善≥'+r.rel[k] }; } }
  if(r.stance){ for(const k in r.stance){ if((s.stance[k]||0) < r.stance[k]) return { ok:false, why:'需立场·'+k+'≥'+r.stance[k] }; } }
  return { ok:true };
}
/* 【不剧透纪律】此处原有一支 sectOptGainText()，把「银+5 / 道心-3」这类收益
   算成预览贴在选项上（2026-08-31 已停止渲染）。函数随之删除，与 PC 端 sect.js
   保持一致：玩家只需要做决断，后果在提交后由 sectApplyEff 推入 s.fxQueue 变成
   飘字，并写入 sectTrail 山中纪事后揭示。
   注意 opt.note 仍会写入 sectTrail（见下方 resolveEvent），那是「事后揭示」。 */
function sectApplyEff(s, eff){
  if(!eff) return;
  const before = { 银:s.res.银, 灵:s.res.灵, 名:s.res.名, 道心:s.res.道心, 机缘:s.res.机缘, 丹:s.res.丹 };
  ['银','灵','名','道心','机缘','丹'].forEach(k=>{ if(eff[k]!=null) sectGain(s,k,eff[k]); });
  if(!s.fxQueue) s.fxQueue = [];
  ['银','灵','名','道心','机缘','丹'].forEach(k=>{
    const d = s.res[k] - before[k];
    if(d !== 0) s.fxQueue.push({ k:k, v:d });
  });
  if(eff.flag) s.flags[eff.flag] = 1;
  if(eff.disc){
    const d = eff.disc;
    if(d.action==='add'){
      const ok = sectAddDisc(s, d.key, d.loyal);
      if(ok){ const def = SECT_DISCIPLES[d.key]; if(def) s.fxQueue.push({ k:'收徒 · '+def.name, v:0 }); }
    }
    else if(d.action==='loyalAll') s.disciples.forEach(x=>{ x.loyal=Math.max(0,Math.min(100,x.loyal+d.v)); });
    else if(d.action==='loyal'){ const t=s.disciples.find(z=>z.key===d.key); if(t) t.loyal=Math.max(0,Math.min(100,t.loyal+d.v)); }
    else if(d.action==='stage'){ const t=s.disciples.find(z=>z.key===d.key); if(t&&t.stage<2) t.stage++; }
  }
  if(eff.retinue){
    const r = eff.retinue;
    if(r.action==='add'){ if(sectAddRetinue(s, r.key) && r.msg) sectLog(s, r.msg, 'good'); }
    else if(r.action==='remove'){ sectLoseRetinue(s, r.key, r.why); }
  }
  if(eff.renqing){ s.renqing = Math.max(0, (s.renqing||0) + eff.renqing); }
  if(eff.rel){ for(const k in eff.rel){ const d=eff.rel[k]; sectAddRel(s,k,d); sectLog(s, '【道契】与'+k+' '+(d>0?'亲近':'疏远')+(d>0?'+':'')+d, d>0?'good':'bad'); } }
  if(eff.stance){ for(const k in eff.stance){ const d=eff.stance[k]; sectAddStance(s,k,d); const lab={'剑礼':'立身之道','守':'所守之心','势':'行事之法'}[k]||k; sectLog(s, '【立场】'+(lab)+' '+(d>0?'偏':'转')+(d>0?'+':'')+d, ''); } }
  if(eff.msg) sectLog(s, eff.msg, eff.道心!=null&&eff.道心<0?'bad':(eff.名!=null&&eff.名>0?'good':'') );
}

/* 文庙论道：以「道理点」博弈（道心 + 书院加成 + 随机 对 对方实力） */
function sectDebate(s, opp){
  const my = s.res.道心 + (s.buildings['书院']?s.buildings['书院'].lv:0)*8 + Math.floor(Math.random()*10);
  const foe = opp.power + Math.floor(Math.random()*10);
  return { win: my>=foe, my, foe };
}

/* 解决事件 */
function sectResolveEvent(idx, optIdx){
  const s = S; if(s.over) return;
  const ev = s.events[idx]; if(!ev) return;
  const def = sectEventDef(ev.id); if(!def) return;
  const opt = def.opts[optIdx]; if(!opt) return;
  const rq = sectOptReqOk(s, opt); if(!rq.ok) return;
  // 论道：先算道理点博弈，再结算胜负效果
  if(opt.debate){
    const r = sectDebate(s, opt.debate);
    const eff = r.win ? opt.debate.win : opt.debate.lose;
    sectApplyEff(s, eff);
    sectSpawnFx(s);
    sectTrail(s, def.title, (r.win?'论道胜':'论道败')+'（我 '+r.my+' · 彼 '+r.foe+'）', opt.note);
    s.events.splice(idx,1);
    if(def.once) s.flags[def.once] = 1;
    sectBanner('文庙论道', r.win ? '理直 · 胜' : '理屈 · 败', r.win?'glory':'danger');
    SFX.click();
    if(s.res.道心<=0){ sectEnding(s,'demon'); return; }
    emitView(); return;
  }
  sectApplyEff(s, opt.eff);
  sectSpawnFx(s);
  sectTrail(s, def.title, opt.txt, opt.note);
  s.events.splice(idx,1);
  if(def.once) s.flags[def.once] = 1;            // 一次性事件防复刷
  // 天劫 = 山主破境：扛过即升境界
  if(ev.id==='tianjie' && s.breakPending){
    const need = s.breakPending; s.breakPending = 0;
    s.masterRealm = Math.min(SECT_REALMS.length-1, s.masterRealm+1);
    s.masterCult = Math.max(0, s.masterCult - need);
    const r = SECT_REALMS[s.masterRealm];
    sectLog(s, '天劫过后，你破【'+r+'】境成！山主修为大进。', 'good');
    sectBanner('破境 · '+r, '越过了那道关隘', 'glory');
  }
  SFX.click();
  // 即时结局风险
  if(s.res.道心<=0){ sectEnding(s,'demon'); return; }
  emitView();
}
function sectSkipEvent(idx){
  const s = S; if(s.over) return;
  const ev = s.events[idx]; if(!ev) return;
  const def = sectEventDef(ev.id);
  s.events.splice(idx,1);
  s.backlog++;
  sectLog(s, '你暂将「'+def.title+'」搁置一旁。', '');
  SFX.click(); emitView();
}

/* 危机事件按条件触发（不入普通抽卡） */
function sectSpawnCrises(s){
  // 护山大阵告急：大阵已建却因灵不足而虚弱
  if(s.flags['zhen_weak'] && !s.events.some(x=>x.id==='zhen_gao')){
    s.events.push({ id:'zhen_gao' });
    s.flags['zhen_weak'] = 0;          // 已提示，待玩家在事件中抉择；未补则叩关仍弱
  }
  // 心魔：道心长期低迷
  if(s.res.道心<15 && !s.events.some(x=>x.id==='xinmo') && Math.random()<0.6){
    s.events.push({ id:'xinmo' });
  }
}

/* 全册脊·抉择点注入：按 bookXun（或 nodeFire）脚本触发，隐形守护者式因果 */
function sectSpawnChapters(s){
  for(const def of SECT_EVENTS){
    if(!def.chapter) continue;                       // 仅处理册目抉择点（普通事件走随机抽卡）
    if(s.events.some(e=>e.id===def.id)) continue;    // 已入队则跳过
    if(def.once && s.flags[def.once]) continue;
    if(def.gate && !def.gate(s)) continue;
    if(def.nodeFire){                                // 节点触发型（降格之夜 / 飞升之问）
      if(s.nodeFired[def.nodeFire]) s.events.push({ id:def.id });
      continue;
    }
    if(def.bookXun && s.xun >= def.bookXun) s.events.push({ id:def.id });
  }
}

/* ===================== 行动 ===================== */
function sectSpendRes(s, cost){
  for(const k in cost){ if((s.res[k]||0) < cost[k]) return false; }
  for(const k in cost) sectGain(s, k, -cost[k]);
  return true;
}
function sectUseAp(n){
  const s = S;
  if(s.ap < n) return false;
  s.ap -= n; return true;
}
function sectBuild(key){
  const s = S; if(s.over) return;
  const def = SECT_BUILDINGS[key]; const b = s.buildings[key];
  if(!def || !b || b.lv>=def.max) return;
  const cost = def.cost[b.lv+1];
  if(!cost){ return; }
  if(!sectSpendRes(s, cost)){ sectLog(s,'银/灵/名不足，建不成「'+def.name+'」。','bad'); emitView(); return; }
  if(!sectUseAp(1)){ sectLog(s,'本旬行动点已尽，无暇营建。','bad'); emitView(); return; }
  b.lv++;
  if(key==='倒悬山别院') s.flags['倒悬山别院'] = 1;   // 机缘事件加成据此生效
  sectLog(s, '「'+def.name+'」升至 '+b.lv+' 级。', 'good');
  SFX.forge ? SFX.forge() : SFX.click();
  emitView();
}
function sectRecruitSeek(){
  const s = S; if(s.over) return;
  if(!sectUseAp(1)){ sectLog(s,'本旬行动点已尽。','bad'); emitView(); return; }
  // 从尚未收入、且条件可收的弟子里随机给一个「投靠」机会
  const pool = Object.keys(SECT_DISCIPLES).filter(k=>!s.disciples.some(d=>d.key===k));
  if(!pool.length){ sectLog(s,'门下已无可知的晚辈可寻。',''); emitView(); return; }
  const pick = pool[Math.floor(Math.random()*pool.length)];
  s.events.push({ id:'touxiang', _forceKey:pick });
  sectLog(s, '你遣人访寻，似有一人可来投——且看来人。', '');
  s.ui='main'; emitView();
}
function sectForge(){
  const s = S; if(s.over) return;
  if(!sectUseAp(1)){ sectLog(s,'本旬行动点已尽。','bad'); emitView(); return; }
  const cost = { 灵:10, 银:5 };
  if(!sectSpendRes(s, cost)){ sectLog(s,'灵机或银两不足，无从祭炼。','bad'); emitView(); return; }
  const jianlu = s.buildings['剑庐']?s.buildings['剑庐'].lv:0;
  const maxTier = jianlu>=3?3:(jianlu>=2?2:(jianlu>=1?1:0));
  // 失败概率：无剑庐 40%，有剑庐递减；以道心护剑降低
  let fail = jianlu===0?0.4:(jianlu===1?0.22:0.1);
  let useDao = (s.res.道心>=20) && Math.random()<0.5;
  if(useDao){ fail *= 0.35; sectGain(s,'道心',-5); }
  if(s.flags['haoshu']) fail *= 0.8;
  const ok = Math.random() > fail;
  if(!ok){
    if(jianlu>=3){ sectLog(s,'祭炼受挫，宝剑却因剑庐稳固而未损。',''); }
    else { sectLog(s,'祭炼失败，灵机散去，剑胚有损。','bad'); }
    SFX.breakout ? SFX.breakout() : SFX.click();
    emitView(); return;
  }
  // 成：升阶或加词条
  let sword;
  if(s.swords.length===0 || Math.random()<0.2){
    const names = ['无名','青萍','藕花','笼中雀','井中月','春风','山君'];
    const nm = names[Math.floor(Math.random()*names.length)];
    sword = { name:nm, dao:['剑','儒','无','机缘'][Math.floor(Math.random()*4)], tier:0, words:[] };
    s.swords.push(sword);
    sectLog(s, '一柄新剑胚成型，名「'+nm+'」。', 'good');
  } else {
    sword = s.swords[Math.floor(Math.random()*s.swords.length)];
  }
  if(sword.tier < maxTier && Math.random()<0.8){
    sword.tier++;
    sectLog(s, '「'+sword.name+'」祭炼精进，晋为本命飞剑（阶 '+sword.tier+'）。', 'good');
  } else {
    const w = SECT_SWORD_WORDS[Math.floor(Math.random()*SECT_SWORD_WORDS.length)];
    if(!sword.words.includes(w)){ sword.words.push(w); sectLog(s, '「'+sword.name+'」得词条「'+w+'」。', 'good'); }
    else sectLog(s, '「'+sword.name+'」祭炼小成，剑意更纯。', 'good');
  }
  SFX.forge ? SFX.forge() : SFX.click();
  emitView();
}
function sectPreach(){
  const s = S; if(s.over) return;
  if(!sectUseAp(1)){ sectLog(s,'本旬行动点已尽。','bad'); emitView(); return; }
  const shuyuan = s.buildings['书院']?s.buildings['书院'].lv:0;
  let gain = 5 + shuyuan*2;
  if(s.flags['wenmiao_win']) gain += 2;
  sectGain(s,'道心', gain);
  s.masterCult += 3;                            // 讲道亦养山主修为
  s.disciples.forEach(d=>{ d.loyal=Math.min(100,d.loyal+2); });
  sectLog(s, '你于静室讲道，浩然气生，道心 +'+gain+'，弟子向心更坚。', 'good');
  SFX.heal ? SFX.heal() : SFX.click();
  emitView();
}
function sectBreak(){
  const s = S; if(s.over) return;
  if(!sectUseAp(1)){ sectLog(s,'本旬行动点已尽。','bad'); emitView(); return; }
  const cur = s.masterRealm;
  if(cur>=SECT_REALMS.length-1){ sectLog(s,'你已至当世绝顶，无可再破。',''); emitView(); return; }
  const need = SECT_MASTER_CULT[cur+1];
  if(s.masterCult < need){ sectLog(s,'修为未足（山主修为 '+s.masterCult+'/'+need+'），破境无门。','bad'); emitView(); return; }
  s.breakPending = need;
  s.events.push({ id:'tianjie' });
  sectLog(s, '你感应到【'+SECT_REALMS[cur]+'】关隘，欲借天地之力破境——天劫将至！', 'big');
  SFX.click(); emitView();
}
function sectTrade(){
  const s = S; if(s.over) return;
  if(!sectUseAp(1)){ sectLog(s,'本旬行动点已尽。','bad'); emitView(); return; }
  const got = 8 + Math.floor(Math.random()*7);
  sectGain(s,'银', got);
  // 离山则疏于管束，随机一名弟子忠心略降
  if(s.disciples.length){
    const d = s.disciples[Math.floor(Math.random()*s.disciples.length)];
    d.loyal = Math.max(0, d.loyal-3);
    sectLog(s, '你下山走商，得银 '+got+'，却疏于山中，'+d.name+'忠心微降。', '');
  } else {
    sectLog(s, '你下山走商，得银 '+got+'。', '');
  }
  SFX.draw ? SFX.draw() : SFX.click();
  emitView();
}
function sectGamble(big){
  const s = S; if(s.over) return;
  const bieyuan = s.buildings['倒悬山别院']?s.buildings['倒悬山别院'].lv:0;
  if(bieyuan<1){ sectLog(s,'须先建倒悬山别院，方能开赌。','bad'); emitView(); return; }
  if(!sectUseAp(1)){ sectLog(s,'本旬行动点已尽。','bad'); emitView(); return; }
  const cost = big?25:10;
  if(s.res.银 < cost){ sectLog(s,'银两不足，押不进这局。','bad'); emitView(); return; }
  sectGain(s,'银', -cost);
  let winRate = big?0.42:0.55;
  if(bieyuan>=3) winRate += 0.12;
  const win = Math.random()<winRate;
  if(win){ const g = big?Math.round(cost*2.2):Math.round(cost*1.6); sectGain(s,'银',g); sectLog(s,'骰子停下——你赢了 '+g+' 两！','good'); }
  else { sectLog(s,'骰子停下——你输了这 '+cost+' 两。','bad'); }
  s.ui='main'; emitView();
}

/* ===================== 旬推进 ===================== */
function sectSeason(s){ const se = (Math.floor((s.xun-1)/3))%4; return ['春','夏','秋','冬'][se]; }
function sectYearOf(s){ return Math.floor((s.xun-1)/12)+1; }

/* ===================== 全册脊（真实册目·六幕） ===================== */
// 真实册目：浙江文艺出版社实体书最终 8 辑 54 册（2025-10 出齐）。
// 6 幕按 xun 跨度等比切分，覆盖全部 54 个真实四字册名，无编造、无遗漏。
const SECT_ACTS = [
  { act:1, name:'骊珠洞天', img:'act1', x0:1,  x1:9,  node:'qulu',
    books:['少年起微末','忽为远行客','清梦压星河','草长莺飞时','山水有相逢','剑符在扁舟','迢迢渡银汉','误入藕花渡','乱起太平山'] },
  { act:2, name:'负笈大隋', img:'act2', x0:10, x1:16, node:'dabi',
    books:['他乡遇故知','君从故乡来','人间羊肠道','陇上花又开','江清月近人','天地无拘束','月色入高楼'] },
  { act:3, name:'藕花问心', img:'act3', x0:17, x1:21, node:'shujian',
    books:['一洲皆起剑','我与我周旋','剑修如云处','饮者留其名','皆是笼中雀'] },
  { act:4, name:'剑气长城', img:'act4', x0:22, x1:27, node:'qiguan',
    books:['愿挽天倾者','人生梦复梦','新酒等旧人','天地皆同力','人间最得意','风雪夜归人'] },
  { act:5, name:'落魄开宗', img:'act5', x0:28, x1:43, node:'kaizong',
    books:['清都山水郎','座中皆豪杰','一剑破万法','观礼正阳山','登高拖虚舟','城头刻新字','山中何所有','一笑抚青萍',
           '浩荡百川流','只是朱颜改','请君入梦来','借取万重山','风雪旧曾谙','山青花欲燃','观书喜夜长','青帝常为主'] },
  { act:6, name:'天下风波', img:'act6', x0:44, x1:54, node:'ascend',
    books:['明月落阶前','彩云一片城','人间半部书','饮者折镆干','随手斩飞升','今宵月正圆','蜉蝣见青天','手书昭天地',
           '吾有辞乡剑','万山朝奉请','人间温柔乡'] },
];
// 当前所读册目（营造"翻《剑来》"的进度手感）
function sectCurrentBook(s){
  const a = SECT_ACTS.find(a=> s.xun>=a.x0 && s.xun<=a.x1) || SECT_ACTS[SECT_ACTS.length-1];
  const span = Math.max(1, a.x1 - a.x0);
  const idx = Math.min(a.books.length-1, Math.floor((s.xun - a.x0) / span * a.books.length));
  return { act:a.act, actName:a.name, book:a.books[Math.max(0, idx)], bookIdxInAct:idx+1, bookCountInAct:a.books.length };
}

// 每册册首语：用作章内"节"的意境锚点（贴合原著情节/情绪，不剧透）
// key 须与 SECT_ACTS[].books 完全一致
const SECT_BOOK_PROLOGUE = {
  // 第一幕 · 骊珠洞天（册1-9）：泥瓶巷、本命瓷、齐静春殉道、洞天降格、买下五座山头
  '少年起微末':'龙泉小镇泥瓶巷，一个五岁失怙的少年，从泥里起步。',
  '忽为远行客':'本命瓷碎，长生桥断。有些路，是被人推着走的。',
  '清梦压星河':'阿良来了——一个扛木剑的汉子，把更大的天地压进少年的梦里。',
  '草长莺飞时':'洞天将碎。先生问：陈平安，你将来，以何立身？',
  '山水有相逢':'一簪、一印、一缕春风。先生去了，人还得往前走。',
  '剑符在扁舟':'五座山头，金精铜钱。少年成了有山的人，却要离山远行。',
  '迢迢渡银汉':'负笈南下，护送先生的弟子去大隋。江湖路，自此起。',
  '误入藕花渡':'路上杀机与灯火并存。有人送剑，也有人等着看笑话。',
  '乱起太平山':'太平山并不太平。乱，自此处起。',
  // 第二幕 · 负笈大隋（册10-16）：山崖书院、崔东山、崔诚、南下送剑、定十年之约
  '他乡遇故知':'他乡遇故知，可那故知，未必还是当年的故知。',
  '君从故乡来':'故乡来人，带故土的消息，也带一道抉择。',
  '人间羊肠道':'人间路窄如羊肠，一步踏错，便是深渊。',
  '陇上花又开':'陇上花又开，可有些人，已经不在了。',
  '江清月近人':'江清月近人，书院的月，照着每个人的心事。',
  '天地无拘束':'出了书院，天地仿佛都无拘束——也再无人替你撑伞。',
  '月色入高楼':'一剑南下为送剑。天底下最难送的，是这一柄。',
  // 第三幕 · 藕花问心（册17-21）：藕花福地重造长生桥、收裴钱、老龙城、书简湖问心局
  '一洲皆起剑':'老大剑仙指了条路：去桐叶洲藕花福地，重造长生桥。',
  '我与我周旋':'与我周旋久，宁作我——福地里重建的，不止是一座桥。',
  '剑修如云处':'出福地，回宝瓶洲。老龙城炼水字印，青鸾国了旧因果。',
  '饮者留其名':'饮者留其名。这一程的酒，多半是苦的。',
  '皆是笼中雀':'以天下为之笼，则雀无所逃——书简湖，就是这样一张笼。',
  // 第四幕 · 剑气长城（册22-27）：斩离真、接任隐官、长城飞升、独守十五年
  '愿挽天倾者':'有人愿挽天倾，哪怕明知独木难支。隐官之责，自此而始。',
  '人生梦复梦':'人生如梦复如梦，城头的剑修，谁又真的醒着。',
  '新酒等旧人':'新酒温好，等的却是未必回来的旧人。长城举城飞升，只留一人。',
  '天地皆同力':'天地皆同力，独守半截长城，一守就是十五年。',
  '人间最得意':'人间最得意时，往往最是凶险。有人在扶摇洲独战六头大妖。',
  '风雪夜归人':'风雪夜，归人是幸。大师兄算了最后一局，把自己算了进去。',
  // 第五幕 · 落魄开宗（册28-43）：祖师堂观礼跻身宗字头、建下宗青萍剑宗、文庙议事
  '清都山水郎':'祖师堂前香火起，落魄山自此跻身「宗」字头。',
  '座中皆豪杰':'座中皆豪杰，谁主沉浮。开宗容易，守成难。',
  '一剑破万法':'一剑既出，万法可破。可真正难的，是收得回去。',
  '观礼正阳山':'正阳山的礼，是给赢家看的。旧怨，也该有个了断。',
  '登高拖虚舟':'登高拖虚舟，虚舟载不动这许多因果。',
  '城头刻新字':'城头刻下新字，是新的规矩，也是旧的念想。',
  '山中何所有':'山中何所有？唯有读书声，与剑鸣。',
  '一笑抚青萍':'青萍剑在手中，一笑间，风雷俱静。',
  '浩荡百川流':'浩荡百川东到海，道理终须有个归处。',
  '只是朱颜改':'只是朱颜改，山河依旧在。故人，却换了一茬。',
  '请君入梦来':'请君入梦来，梦里说尽平生事。',
  '借取万重山':'借取万重山，不过是借一份担当。',
  '风雪旧曾谙':'风雪旧曾谙，最难是故人。',
  '山青花欲燃':'山青花欲燃，是归期，也是别期。',
  '观书喜夜长':'喜夜长，正好读一部未完的书。',
  '青帝常为主':'青帝常为主，四时有序——可这天下，就要乱了。',
  // 第六幕 · 天下风波（册44-54）：三教祖师散道、蛮荒入侵、决战、剑开托月山
  '明月落阶前':'明月落阶前，照见少年当初的模样。三教祖师散道，天下无主。',
  '彩云一片城':'彩云一片城，温柔乡里，最磨练人。',
  '人间半部书':'人间半部书，写满聚散，与坚守。',
  '饮者折镆干':'饮者折了镆干剑，豪气，却不折。',
  '随手斩飞升':'随手一剑斩飞升，这是，陈平安的道。',
  '今宵月正圆':'今宵月正圆，该来的，终究要来。',
  '蜉蝣见青天':'蜉蝣也见青天，微小者，自有其志。',
  '手书昭天地':'手书昭昭，天地，可鉴此心。',
  '吾有辞乡剑':'吾有一剑名辞乡，出鞘，便是归途。',
  '万山朝奉请':'万山朝奉，天下，共此一礼。',
  '人间温柔乡':'人间温柔乡，最是，英雄难渡的岸。',
};

// 山志·原著脉络：落魄山自骊珠降格到飞升立世的关键节点，皆依《剑来》原著，不杜撰。
const SECT_CHRONICLE = [
  { t:'本命瓷碎', d:'骊珠洞天泥瓶巷。五岁那年，父亲为不让他被宗门掌控，打碎了他的本命瓷，随即遭秘密处决；母亲亦病故。自此机缘纷纷涌来，却一样也留不住。',
    src:'原著 · 第1册《少年起微末》' },
  { t:'长生桥断', d:'十四岁，外乡人入洞天寻找机缘。云霞仙子蔡金简一掌打断陈平安长生桥，断其修行路，只剩半年寿命。童年玩伴顾璨将祖传《撼山谱》赠他续命，也由此打下武道底子。',
    src:'原著 · 第1册《少年起微末》' },
  { t:'先生殉道', d:'儒家第四圣文圣的亲传弟子齐静春，自愿困守骊珠洞天一甲子。洞天将碎之际，他以身扛天道反扑，换了洞天六千人的来生。临终代师收徒，将刻有「言念君子，温其如玉」的文圣玉簪赠予陈平安，又嘱他：不管遇到什么，都不要对这个世界失去希望。他散去「静」「春」两个本命字，只留一魂一魄化为一缕春风绕在少年身侧；洞天自此降格为福地。',
    q:'遇事不决，可问春风。', src:'原著 · 第148章《少年有事问春风》' },
  { t:'买下五座山', d:'洞天坠落后，山脉落于大骊国界地面。陈平安在阮邛帮助下，以金精铜钱买下五座山头——落魄山其一，主峰集灵峰、次峰霁色峰。山虽到手，人却要远行。',
    src:'原著 · 第3-4册《清梦压星河》《草长莺飞时》' },
  { t:'负笈南下', d:'为完成齐静春遗愿，陈平安放弃小镇安逸，护送李宝瓶、林守一、李槐、赵繇远赴大隋山崖书院。路途凶险，既有大骊铁骑追杀，也有精怪鬼魅环伺；途中得剑客阿良相助，亦结识北岳正神魏檗与文圣老秀才。',
    q:'我叫阿良，善良的良，我是一名剑客。', src:'原著 · 第4-9册 负笈南下一段' },
  { t:'崔东山入门', d:'回程途中，陈平安认崔瀺的神魂分身、少年崔东山为弟子；又借崔东山之力，收青蛇陈灵均、火蟒陈暖树为书童。此后山主远游，山中打理便落在这几人肩上。',
    src:'原著 · 第10-13册 回程一段' },
  { t:'崔诚授拳', d:'回到小镇，陈平安遇武圣崔诚——大骊国师「绣虎」崔瀺的爷爷。在崔诚调教下，他被打造成天下最强三境纯粹武夫，却被当面点破：心境上还有问题。',
    src:'原著 · 第13-15册' },
  { t:'南下送剑', d:'应青童天君之请远离小镇是非，陈平安负剑南下，为宁姚送剑。二人于剑气长城互表心意，定下十年之约：他十年内跻身武夫第七境金身境，她则承诺在他抵达前不死于战场。',
    q:'谁让有个傻子喜欢我呢？陈平安！我喜欢你，不比你喜欢我少一点点！',
    src:'原著 · 第15-16册 送剑定约一段 ｜ 引文据百度百科「宁姚」词条' },
  { t:'藕花福地', d:'受老大剑仙陈清都指点，陈平安前往桐叶洲藕花福地重造长生桥。福地之中，他收下野性难驯的裴钱与曹晴朗为徒——裴钱并非泥瓶巷人，而是福地里跟上来、赶不走的丫头。',
    src:'原著 · 第17-19册 桐叶洲藕花福地一段' },
  { t:'老龙城 · 水字印', d:'出福地后，陈平安结识崇拜老秀才的埋河水神，授其顺序之学；回到宝瓶洲，于老龙城炼化齐静春所留水字印为本命物，正式迈入练气士第一境铜皮境。',
    src:'原著 · 第19-20册' },
  { t:'书简湖 · 问心局', d:'大师兄崔瀺（绣虎）为小师弟设下此局，全程不曾干预他的选择。顾璨凭陈平安早年所赠小泥鳅炭雪，在书简湖大开杀戒。陈平安既不杀顾璨，也不纵容：他在湖上做了三年账房先生，一笔笔记下亡者的姓名、身世与家人，收集亡魂逐一道歉；终亲手斩了炭雪，并自碎金身文胆——那文胆，原是建在别人的道理之上的。而在崔瀺眼中，这一局从来不是终局。',
    q:'我与齐静春的棋盘，是天下，所有的天下。一座乌烟瘴气的书简湖，算个什么东西？',
    src:'原著 · 第20-22册 书简湖一段 ｜ 设局人：崔瀺，非崔东山 ｜ 引文出第455章《报道先生归也》' },
  { t:'北俱芦洲', d:'问心局后，陈平安独行北俱芦洲磨炼心境，途中结识哑巴湖大水怪周米粒；又于狮子峰拜访李二，一个月喂拳，武道直入第七境金身境。十年之期已满。',
    src:'原著 · 第22-23册' },
  { t:'城头 · 隐官', d:'重返剑气长城赴十年之约。首战为护宁姚，他正面迎战蛮荒第一天骄离真，离真死，他自己连跌三境。隐官萧愻叛变后，陈平安临危受命接任新一任隐官，调度众剑仙，硬生生将战事多拖了三年。',
    q:'我陈平安，唯有一剑，可搬山、倒海、降妖、镇魔、敕神、摘星、断江、摧城、开天！',
    src:'原著 · 第22-23册《愿挽天倾者》《人生梦复梦》' },
  { t:'半截长城', d:'剑气长城断为两截。在陈清都谋划下，众剑仙合力将长城举城飞升至第五座天下，陈平安独自留下，与未倒塌的半截长城合道，跻身玉璞境，以不死不灭之身孤守十五年。',
    src:'原著 · 第23-27册' },
  { t:'大师兄之死', d:'妖族倾巢而出之际，崔瀺以「愿挽天倾者，请起身」整合大骊一洲之力，让凡人持械上阵、修士列阵迎敌，硬生生在宝瓶洲拖住妖族主力。最终他借齐静春遗留修为从飞升境跻身十四境，以「山水颠倒」之法替换陈平安合道剑气长城，把小师弟从孤城中换出——大师兄为此身死道消。陈平安于造化窟沉睡三年，醒来时，已是战后满目疮痍。',
    q:'诸位，大势倾轧在即，愿挽天倾者，请起身。',
    src:'原著 · 第27册《风雪夜归人》｜ 引文出第640章《愿挽天倾者请起身》' },
  { t:'落魄开宗', d:'陈平安回到落魄山，创建自己的宗门；次年召集各路人马于祖师堂观礼，落魄山正式跻身「宗」字头。祖师堂悬三幅挂像：居中老秀才，左齐静春，右崔诚；香火牌位只写姓名，不着一字。门下弟子八人：裴钱（开山大弟子）、崔东山、曹晴朗、赵树下（武道关门弟子）、郭竹酒、宁吉、邓剑枰、袁黄。大管家朱敛（山巅境武夫，兼厨子），小管家陈如初（暖树，文运火蟒），首席供奉姜尚真（化名周肥，仙人境剑修），护山供奉兼右护法周米粒（哑巴湖大水怪），掌律长命，账房韦文龙。',
    src:'原著 · 第27-28册《风雪夜归人》《清都山水郎》｜名单据百度百科「落魄山」条（引实体书第177-178页）' },
  { t:'青萍剑宗', d:'于桐叶洲择址建落魄山下宗——青萍剑宗。后又撮合各方势力开凿大渎，勾连桐叶洲陆地与东海水域。',
    src:'原著 · 第28-32册' },
  { t:'文庙议事', d:'受礼圣之邀参与文庙议事——此次议事，礼圣只邀了两人：白泽与陈平安。浩然与蛮荒谈判不成，陈平安向前跨出一步，说了三个字，浩然众人皆前跨一步。',
    q:'那就打。', src:'原著 · 第32-40册 文庙议事一段' },
  { t:'剑开托月山', d:'陈平安与宁姚等剑修杀入蛮荒天下，剑开托月山，手持老剑条斩杀飞升境纯粹剑修元凶。战后他在剑气长城刻下一个「萍」字，因出剑过多，修为跌落。',
    src:'原著 · 第40-48册' },
  { t:'万山朝奉', d:'三教祖师散道，天下秩序重塑。一路走到最后，落魄山从一座以金精铜钱买来的野山，成了万山朝奉的所在。',
    src:'原著 · 第53-54册《万山朝奉请》《人间温柔乡》' },
];

// 道契显示顺序（仅展示已结缘者）
const SECT_REL_ORDER = ['阿良','刘羡阳','顾璨','齐静春','李宝瓶','阮秀','阮邛','剑修一脉','文圣一脉','宁姚','剑气长城'];

/* ===================== 人物志（原著档案） =====================
   人物、称号、阵营、简介、名句均取自《剑来》原著（经核对，不杜撰）。
   unlock(s) 决定该人物是否已在「此局」中出现过——纯展示判定，不写状态、不触因果。 */
const SECT_FIGURES = {
  '陈平安': { t:'落魄山山主 · 老秀才关门弟子', f:'落魄山',
    d:'生于骊珠洞天泥瓶巷，五岁那年父亲为护他打碎本命瓷，随即被秘密处决，母亲病故。十四岁长生桥被断，只剩半年寿命。资质平平，唯靠死理与苦功，一路走到剑气长城末代隐官、青萍剑宗宗主。',
    q:'道理我都懂，可我还是想讲道理。', unlock:()=>true },
  '齐静春': { t:'老秀才四弟子 · 骊珠洞天镇守者', f:'文圣一脉',
    d:'儒家第四圣老秀才的亲传弟子，被誉为「有望立教称祖的读书人」。自愿困守骊珠洞天一甲子，最终为护洞天六千百姓，以身扛天道反扑而殉道。临终代师收徒，将老秀才玉簪赠予陈平安。',
    q:'遇事不决，可问春风；春风不语，即随本心。', unlock:()=>true },
  '宁姚': { t:'剑气长城 · 五彩天下剑修第一人', f:'剑气长城',
    d:'剑气长城两大剑仙眷侣之女，天资万年未有，修行如饮水。本命飞剑「天真」（另有「斩仙」），剑气长城末代隐官陈平安的道侣。与陈平安定下十年之约：他十年内跻身金身境，她则承诺在他抵达前不死于战场。',
    q:'陈平安，你若是死了，我就让整座天下给你陪葬。',
    unlock:s=> (s.relations['宁姚']||0)!==0 || s.xun>=16 },
  '阿良': { t:'亚圣之子 · 本命飞剑「饮者」', f:'剑修一脉',
    d:'亚圣之子，读书人，更是剑客，本命飞剑「饮者」。腰间永远别着银白酒葫芦，独游蛮荒天下砍杀大妖，后被托月山大妖镇压而跌境。在剑气长城城头刻下一个「猛」字。',
    q:'我叫阿良，善良的良，我是一名剑客。',
    unlock:s=> (s.relations['阿良']||0)!==0 || !!s.flags['aliang_quote'] },
  '刘羡阳': { t:'泥瓶巷兄弟 · 龙泉剑宗嫡传', f:'落魄山',
    d:'与陈平安、顾璨自幼一起长大。祖传一部剑经与一件宝甲，因不肯卖剑经被正阳山搬山猿打成重伤濒死，陈平安以齐静春求来的姚家槐叶替他吊住一口气。后与陈平安一路问剑正阳山，大仇得报。',
    q:'天底下，唯一能对陈平安指手画脚、他也肯听的人。',
    unlock:s=> (s.relations['刘羡阳']||0)!==0 },
  '顾粲': { t:'泥瓶巷兄弟 · 道号「粲然」', f:'书简湖',
    d:'三兄弟中最幼，其母曾在陈平安濒死时施以一饭之恩。被截江真君刘志茂带往书简湖后，凭元婴水蛟炭雪任性滥杀。陈平安为护他自碎文胆赎罪，以账房先生身份为他重塑善恶是非。后为白帝城郑居中关门弟子。',
    q:'自小跟在陈平安身后，却最畏惧他。',
    unlock:s=> (s.relations['顾璨']||0)!==0 },
  '李宝瓶': { t:'齐静春传承者 · 小宝瓶', f:'文圣一脉',
    d:'齐静春选定的衣钵传人，称陈平安为「小师叔」。当年穿红棉袄、炫耀被蟹钳夹手的小姑娘，去大隋山崖书院求学路上走不动了，是陈平安背她上的山。长大后相貌绝色，有君子气象。',
    q:'陈平安，我以后回来找你！',
    unlock:s=> (s.relations['李宝瓶']||0)!==0 },
  '阮秀': { t:'火神转世 · 阮邛之女', f:'宝瓶洲',
    d:'上古天庭五位至高神灵之一火神转世，兵家圣人阮邛的独女。能看见他人身上的气运与因果，腕上戴着火龙化成的镯子。爱吃糕点，却唯独不敢望向陈平安。',
    q:'如果当年你先遇到我，会怎样？',
    unlock:s=> (s.relations['阮秀']||0)!==0 || (s.relations['阮邛']||0)!==0 },
  '阮邛': { t:'兵家圣人 · 龙泉剑宗宗主', f:'宝瓶洲',
    d:'十境巅峰的兵家圣人，铸剑大家，龙泉剑宗开山之主。陈平安远赴大隋前，将买下的五座山头托付于他，并获老剑条认可。',
    q:'铸剑如做人，火候到了，剑自成。',
    unlock:s=> (s.relations['阮邛']||0)!==0 },
  '崔瀺': { t:'老秀才首徒 · 大骊国师「绣虎」', f:'文圣一脉',
    d:'天下棋道第二人，原名崔瀺巉。以天下为棋盘、以人心为棋子，叛出师门却心系天下，用事功学说为浩然天下筑起防线。书简湖问心局便是他的手笔。',
    q:'这天下是一盘棋，落子无悔。', unlock:s=> s.xun>=12 },
  '崔东山': { t:'崔瀺少年身 · 陈平安弟子', f:'文圣一脉',
    d:'崔瀺败给齐静春跌境后，分裂出的少年时期化身，改名崔东山，被老秀才逼迫拜陈平安为先生。玩世不恭，却最服李宝瓶。',
    q:'先生说得对——先认错，再挨打。', unlock:s=> s.xun>=13 },
  '老秀才': { t:'老秀才 · 十四境合道地利', f:'文圣一脉',
    d:'姓荀，万年之内最年轻的十四境，四十修道、甲子光阴、百岁得道。极善辩论，与天地共鸣。曾为陈平安向穗山山神求得剑胚「小酆都」，后化为飞剑「初一」。',
    q:'少年的肩膀，先挑起清风明月、杨柳依依、草长莺飞。',
    unlock:s=> (s.relations['文圣一脉']||0)!==0 || s.xun>=11 },
  '崔诚': { t:'武圣 · 崔瀺之祖父', f:'落魄山',
    d:'十境巅峰武夫，有望成为宝瓶洲第一位武神境。得知陈平安是自己孙子的先生，嫌他修为太低，便在落魄山竹楼亲自指导他武道功夫。',
    q:'武夫的拳头，是先站得住，再打得出去。', unlock:s=> s.xun>=14 },
  '左右': { t:'老秀才二弟子 · 浩然剑修天花板', f:'剑修一脉',
    d:'这辈子只做两件事：练剑，保护陈平安。哪怕这事是陈平安不对，他也只认一句话。周米粒口中的「桌儿大剑仙」。',
    q:'道理？我的剑就是道理。',
    unlock:s=> !!s.flags['zuoyou_ling'] || !!s.flags['zuoyou_bu'] || s.xun>=24 },
  '刘十六': { t:'老秀才三弟子 · 君倩', f:'文圣一脉',
    d:'本体为远古金翅大鹏，拥有半步武神战力。常年在天外随礼圣诛杀远古神灵余孽。',
    q:'振翅九万里，不见来时路。', unlock:s=> s.xun>=30 },
  '陈清都': { t:'剑气长城老剑修', f:'剑气长城',
    d:'剑气长城的定海神针，本命飞剑「浮萍」。远古仙剑「天真」择宁姚为主，他便是那桩择主之事的见证者。他是那座城头下，一代剑修的尺度。',
    q:'我陈清都守的不是城，是城下喘气的活人。',
    unlock:s=> s.xun>=23 || !!s.flags['chenqingdu_teach'] },
  '裴钱': { t:'陈平安弟子', f:'落魄山',
    d:'藕花福地南苑国的孤儿，偷东西、骂人、三天不打上房揭瓦。人人都说教不好，陈平安却收下了她：「学不好，是我教得不好。」多年后，长高了个头，替师父撑起了那把伞。',
    q:'师父，伞我撑着，你歇会儿。',
    unlock:s=> !!s.flags['peiqian_shou'] || !!s.flags['peiqian_liu'] || s.xun>=18 },
  '周米粒': { t:'哑巴湖大水怪 · 落魄山右护法', f:'落魄山',
    d:'本体是哑巴湖的大水怪，绝招是「请你吃瓜子」。提着扁担巡山，是落魄山的团宠与核武器开关。只要小米粒还在巡山，这江湖就还称得上可爱。',
    q:'请你吃瓜子！', unlock:s=> s.xun>=22 },
  '魏檗': { t:'宝瓶洲山君 · 夜游之王', f:'宝瓶洲',
    d:'宝瓶洲的山君，人脉厚得出奇，是落魄山最硬的后台之一。',
    q:'这山是我的，山里的人，也是。', unlock:s=> s.xun>=11 },
  '稚圭': { t:'王朱 · 真龙龙珠所化', f:'骊珠洞天',
    d:'宋集薪的婢女，真龙龙珠所化。曾被陈平安所救，却转投身具龙气的宋集薪。后沿齐渡走江，终成飞升境，坐镇宝瓶洲。',
    q:'我曾是一条龙的珠子。', unlock:s=> s.xun>=5 },
  '宋集薪': { t:'宋睦 · 大骊藩王', f:'骊珠洞天',
    d:'以督造官私生子的假身份住进泥瓶巷，做了陈平安的邻居，实为大骊先帝安排的棋子。回帝都后更名宋睦，成为坐镇宝瓶洲南部的藩王。',
    q:'你我皆为棋子，只是棋盘不同。', unlock:s=> s.xun>=5 },
  '马苦玄': { t:'真武山弟子', f:'骊珠洞天',
    d:'出身杏花巷，马兰花之孙。前身出自远古雷部，比职掌雷部斩勘司的老车夫神位更高。',
    q:'雷部斩勘，不问人情。', unlock:s=> s.xun>=8 },
  '李槐': { t:'文圣一脉第三代', f:'文圣一脉',
    d:'气运无双、福缘深厚。小时候在小镇私塾求学被小宝瓶收拾，连裤衩都被丢到树上，哭得一脸鼻涕，却从不记仇。',
    q:'我李槐，运气向来好。', unlock:s=> !!s.flags['lihuai_bully'] || s.xun>=13 },
  '曹慈': { t:'年轻一辈武道最高者', f:'武夫',
    d:'十境归真，与陈平安多次交手，是年轻一代武夫的天花板。',
    q:'武道之巅，站着只能有一个。', unlock:s=> s.xun>=30 },
  '捻芯': { t:'缝衣人', f:'剑气长城',
    d:'能将蛮荒大妖的真名绣于人身上，既是护甲，也是一道永远褪不去的诅咒。曾助陈平安将大妖真名绣在身上。',
    q:'名字绣上了，就摘不下来了。',
    unlock:s=> !!s.flags['xiu_shang'] || !!s.flags['xiu_bu'] || s.xun>=46 },
  '萧愻': { t:'剑气长城前隐官', f:'剑气长城',
    d:'原任剑气长城隐官，遭重创后意外背叛，逃至蛮荒天下。陈平安因此临危受命，接任新隐官。',
    q:'守了那么多年，我累了。', unlock:s=> s.xun>=24 },
  '周密': { t:'蛮荒天下大妖 · 十四王座', f:'蛮荒天下',
    d:'统率十四位王者大妖，对剑气长城发起猛烈叩关，是这一场浩劫的策动者。',
    q:'人间的城墙，终究要塌。', unlock:s=> s.xun>=44 },
  '杨老头': { t:'骊珠洞天福地药铺', f:'骊珠洞天',
    d:'福地药铺的杨老头，飞剑「十五」的原主。陈平安以一支发簪，从他手中换得此剑。',
    q:'小本生意，概不赊账。', unlock:s=> !!s.flags['yangjia_help'] || s.xun>=3 },
  '郑居中': { t:'白帝城 · 魔道第一巨擘', f:'魔道',
    d:'天下魔道第一人，后收顾璨为关门弟子，由师姑韩俏色护道。',
    q:'魔也好，道也好，走得通便是我的道。', unlock:s=> s.xun>=30 },
  '刘志茂': { t:'截江真君 · 书简湖', f:'书简湖',
    d:'相中顾璨根骨，将其带离小镇收为关门弟子。书简湖弱肉强食的风气，与此人不无关系。',
    q:'法外之地，何来王法。', unlock:s=> s.xun>=16 },
  '袁真页': { t:'正阳山护山供奉 · 搬山猿', f:'正阳山',
    d:'为夺刘羡阳家传剑经，将其打成重伤濒死，由此结下与陈平安、刘羡阳的死仇。',
    q:'剑经留下，人可以走。', unlock:s=> s.xun>=15 },
  '蔡金简': { t:'云霞仙子', f:'骊珠洞天',
    d:'嫉妒陈平安内心的纯净，又被截江仙君算计，一掌击断他的长生桥，使他只剩半年寿命。',
    q:'区区凡胎，也配道心澄澈？', unlock:()=>true },
  '陆沉': { t:'道长', f:'骊珠洞天',
    d:'将重伤的宁姚送到陈平安家中，无意间改写了两个人的一生。曾给刘羡阳算命，留下一句「见你一次打你一次」。',
    q:'贫道只是送个人，其余的，都是天数。', unlock:()=>true },
  '茅小冬': { t:'山崖书院山主 · 文脉记名师兄', f:'文圣一脉',
    d:'文脉记名师兄，山崖书院山主。李宝瓶曾随他前往中土神洲文庙游历。',
    q:'读书人，先学坐冷板凳。', unlock:s=> s.xun>=12 },
  // 勘误：此条原作「云曦 · 摘星楼守剑人」，本名云曦、摘星楼守剑三千年仅见于解读文，百度百科「老剑条」词条未载，属杜撰，已改。
  '剑妈': { t:'老剑条 · 万剑之主', f:'骊珠洞天',
    d:'骊珠洞天廊桥底下那柄锈迹斑斑、无柄无鞘的剑条，剑灵被唤作「剑妈」。本体是远古天庭五大至高神灵之一「持剑者」所剥离的神性，曾斩落神灵、断流光阴长河，四大仙剑亦只是它的仿品，故称「天下万剑之主」。登天之战中她背弃神族阵营相助人类，战后自愿镇守廊桥八千年，只为等一个心性纯粹的新主。陈平安在廊桥下立下那道誓言后方才认主，自此少年每唤一声「我有一剑」，她必应。',
    q:'天道崩塌，我陈平安，唯有一剑，可搬山、倒海、降妖、镇魔、敕神、摘星、断江、摧城、开天！', unlock:()=>true },
  '李柳': { t:'水神转世', f:'宝瓶洲',
    d:'与阮秀合力使宝瓶洲与北俱芦洲连为一洲，在蛮荒天下入侵期间抵御妖族。后神性被阮秀吞去。',
    q:'水无定形，随器而变。', unlock:s=> s.xun>=25 },
  // 勘误：原作「梧桐山之主」为杜撰。百度百科「姜尚真」词条：化名周肥，桐叶洲玉圭宗宗主、春潮宫宫主、落魄山首席供奉。
  '姜尚真': { t:'玉圭宗宗主 · 落魄山首席供奉', f:'桐叶洲',
    d:'化名周肥，桐叶洲玉圭宗宗主、春潮宫宫主，山上四大难缠鬼之一。本是飞升境剑修，本命飞剑是一株柳树，他以跌境为代价反复磨砺，磨到只剩一片柳叶，锋利却仍在飞升境之列，故有「一片柳叶斩仙人」之名。与陈平安初遇于藕花福地时还是敌非友，被左右威胁过后索性投了缘，落魄山尚未成型便死皮赖脸蹭上首席供奉的名号。人极有钱，性极风流，骂名一身；蛮荒妖族打进桐叶洲时整洲沦陷大半，他一个仙人境硬是从数名飞升境手下活着逃出，一个人守了一洲。',
    q:'一片柳叶，斩个仙人。', unlock:s=> s.xun>=35 },
  // —— 阵营（可作道契对象，亦录入人物志）——
  '剑修一脉': { t:'以剑证道的一脉', f:'剑修一脉',
    d:'不讲虚理，只问手中剑。认为锋芒本身就是道理，剑出则万法可破。浩然天下剑修以左右为峰，剑气长城为垒。',
    q:'剑者，锋芒即道理。', unlock:s=> (s.relations['剑修一脉']||0)!==0 || s.xun>=20 },
  '文圣一脉': { t:'以礼立身的一脉', f:'文圣一脉',
    d:'儒家第四圣老秀才所开，讲规矩、讲道理、讲人何以是人。齐静春、崔瀺、左右、刘十六皆出其门下。',
    q:'为天地立心，为生民立命。', unlock:s=> (s.relations['文圣一脉']||0)!==0 || s.xun>=15 },
  '剑气长城': { t:'人间的那道城墙', f:'剑气长城',
    d:'横亘在浩然天下与蛮荒天下之间的一道城墙，也是一代代剑修拿命填出来的防线。城头刻满名字，风雪从不停。',
    q:'城在，人在；城破，人亡。', unlock:s=> (s.relations['剑气长城']||0)!==0 || s.xun>=33 },
};

/* 点「过此旬」→ 先结算本旬产出、出中转页，不推进时间、不注入新事件 */
function sectSettle(){
  const s = S; if(s.over || s.settling) return;
  const before = { 灵:s.res.灵, 道心:s.res.道心, 丹:s.res.丹, 名:s.res.名 };
  const notes = [];
  const beforeDisc = s.disciples.length;
  const beforeMc = s.masterCult;
  const beforeXiwei = s.disciples.reduce((a,d)=>a+d.xiwei,0);

  // 1) 本旬结算产出（基于当前建筑）
  const lao = s.buildings['老槐树']?s.buildings['老槐树'].lv:0;
  let lingOut = [0,3,6,11][lao] || 0;
  if(s.buildings['老槐树'] && s.buildings['老槐树'].lv>=3) lingOut = Math.round(lingOut*1.2);
  const season = sectSeason(s);
  if(season==='冬') lingOut = Math.round(lingOut*0.6);
  sectGain(s,'灵', lingOut);
  const shuyuan = s.buildings['书院']?s.buildings['书院'].lv:0;
  if(shuyuan>0) sectGain(s,'道心', [0,1,2,3][shuyuan]);
  // 山主修为增长（书院讲道助益最大）
  s.masterCult += 2 + (shuyuan>0 ? shuyuan : 0);   // 山主自身勤修（陈平安苦修不辍）+ 书院浩然气加成
  const yaotian = s.buildings['药田']?s.buildings['药田'].lv:0;
  if(yaotian>0) sectGain(s,'丹', [0,1,2,3][yaotian]);
  // 门中供奉俸禄：养得起，才留得住
  const paySum = sectRetinuePay(s);
  if(paySum > 0){
    if(s.res.银 >= paySum){
      sectGain(s,'银', -paySum);
      sectLog(s,'【门中】本旬支俸 '+paySum+' 银。','');
    } else {
      let worst = null;                                  // 发不出俸禄，最贵的那位先走
      for(const key in s.retinue){ if(!SECT_RETINUE[key]) continue;
        if(!worst || SECT_RETINUE[key].pay > SECT_RETINUE[worst].pay) worst = key; }
      if(worst) sectLoseRetinue(s, worst, '连俸禄都发不出了');
      else sectGain(s,'银', -s.res.银);
    }
  }
  if((s.renqing||0) > 0 && Math.random() < 0.25) s.renqing--;   // 人情慢慢还
  // 弟子修炼成长
  const jingshi = s.buildings['静室']?s.buildings['静室'].lv:0;
  const mul = [1,1.1,1.2,1.3][jingshi] || 1;
  s.disciples.forEach(d=>{
    d.xiwei += Math.round(d.base*mul);
    if(d.xiwei>=200 && d.stage<2) d.stage=2;
    else if(d.xiwei>=90 && d.stage<1) d.stage=1;
    if(d.loyal < 15){ if(Math.random()<0.4){ s.flags['disc_lost']=1; sectLog(s, d.name+'忠心已失，悄然离山。', 'bad'); s.disciples = s.disciples.filter(z=>z!==d); } }
  });
  if(s.res.道心 < 20 && s.disciples.length){
    const d = s.disciples[Math.floor(Math.random()*s.disciples.length)];
    d.loyal = Math.max(0, d.loyal-4);
  }
  // 护山大阵维持
  const zhen = s.buildings['护山大阵']?s.buildings['护山大阵'].lv:0;
  if(zhen>0){ if(s.res.灵>=3){ sectGain(s,'灵',-3); } else { sectLog(s,'护山大阵灵机不济，威能大减！','bad'); s.flags['zhen_weak']=1; notes.push('护山大阵灵机不济，威能大减。'); } }

  // 2) 积压惩罚（本旬积压生怨）
  if(s.backlog>0){ s.backlog--; sectGain(s,'名',-2); sectLog(s,'积压之事渐生恶果，名声 -2。','bad'); notes.push('积压之事渐生恶果，名声 -2。'); }

  // 3) 账目快照
  const after = { 灵:s.res.灵, 道心:s.res.道心, 丹:s.res.丹, 名:s.res.名 };
  const ledger = [
    { k:'灵机', d: after.灵 - before.灵 },
    { k:'道心', d: after.道心 - before.道心 },
    { k:'丹',   d: after.丹 - before.丹 },
    { k:'名声', d: after.名 - before.名 },
  ];
  const mcGain = s.masterCult - beforeMc;
  const xiweiGain = s.disciples.reduce((a,d)=>a+d.xiwei,0) - beforeXiwei;
  if(mcGain) notes.push('山主修为 +'+mcGain+'。');
  if(xiweiGain) notes.push('门下修为 +'+xiweiGain+'。');
  if(s.disciples.length < beforeDisc) notes.push('有弟子离心离山。');

  s.lastSettle = {
    year: s.year, xun: ((s.xun-1)%12+1), season,
    ledger, notes,
    backlogLeft: s.backlog,
  };
  s.settling = true;
  emitView();
}

/* 结算页视图：缓存并保持同一引用。
   否则每次 setData 都下发新对象，WXML 节点被重建，账本入场动效会被反复重放（整页闪烁） */
function sectSettleView(s){
  const st = s.lastSettle;
  if(!s.settling || !st) return null;
  if(!st._v){
    st._v = {
      year: st.year, xun: st.xun, season: st.season,
      ledger: st.ledger.map(l=>({ k:l.k, d:l.d, cls: l.d>0?'up':(l.d<0?'down':''), dTxt:(l.d>0?'+':'')+l.d })),
      notes: st.notes,
      backlogLeft: st.backlogLeft,
    };
  }
  return st._v;
}

/* 中转页「入下一旬」→ 真正推进时间、注入新事件 */
function sectEnterNext(){
  const s = S; if(s.over || !s.settling) return;
  s.settling = false;
  s.lastSettle = null;

  // 1) 推进时间
  s.xun++;
  s.year = sectYearOf(s);
  s.ap = 3;

  // 2) 册目切换：进入新册则弹出册首语（章内"节"）
  const cur = sectCurrentBook(s);
  if(s.bookKey !== cur.book){
    s.bookKey = cur.book;
    s.prologue = { title:'《'+cur.book+'》', sub:'第 '+cur.act+' 幕 · '+cur.actName+'　第 '+cur.bookIdxInAct+' / '+cur.bookCountInAct+' 册', img: (cur.bookIdxInAct===1) ? SECT_ACTS[cur.act-1].img : null, body: SECT_BOOK_PROLOGUE[cur.book] || '' };
  }

  // 3) 节点校验
  sectCheckNodes(s);
  if(s.over){ emitView(); return; }

  // 4) 抽新事件
  const season = sectSeason(s);
  let n = 1;
  if(season==='秋') n = 2;                       // 秋名声事件多
  if(s.res.名>=50) n += 1;                        // 高名声招事（双刃）
  n = Math.min(3, n);
  sectSpawnCrises(s);
  sectSpawnChapters(s);    // 全册脊·抉择点（脚本注入）
  const bieyuan = s.buildings['倒悬山别院']?s.buildings['倒悬山别院'].lv:0;
  for(let i=0;i<n;i++){
    let pool = SECT_EVENTS.filter(e=>!e.crisis && !e.chapter && (!e.gate || e.gate(s)) && (!e.once || !s.flags[e.once]));
    if(bieyuan>0){
      const jy = pool.filter(e=>e.type==='奇遇');
      if(jy.length && Math.random()<0.5) pool = jy;
    }
    if(!pool.length) break;
    const pick = pool[Math.floor(Math.random()*pool.length)];
    if(s.events.some(x=>sectEventDef(x.id) && sectEventDef(x.id).id===pick.id)) continue;
    s.events.push({ id:pick.id });
  }

  // 5) 结局预检
  sectCheckEndingLive(s);
  if(s.over){ emitView(); return; }

  sectLog(s, '—— 第 '+s.year+' 年 · '+sectSeason(s)+' · 第 '+((s.xun-1)%12+1)+' 旬 ——', 'big');
  if(!s.over) sectBanner('第 '+s.year+' 年', '· '+sectSeason(s)+' · 第 '+((s.xun-1)%12+1)+' 旬');
  s.moodLine = sectMoodLine(s);
  emitView();
}

/* 兼容旧调用（测试/脚本）：结算并立即进入下一旬 */
function sectAdvance(){ sectSettle(); sectEnterNext(); }

/* 节点 */
const SECT_NODES = {
  qulu:     { xun:4,  name:'骊珠降格',            fired:false },
  dabi:     { xun:16, name:'山崖书院 · 文胆之赐', fired:false },
  shujian:  { xun:21, name:'书简湖 · 问心局',     fired:false },
  qiguan:   { xun:25, name:'剑气长城 · 倾覆',     fired:false, span:4 },
  kaizong:  { xun:28, name:'落魄开宗',            fired:false },
  manhuang: { xun:46, name:'蛮荒叩关',            fired:false, span:4 },
  ascend:   { xun:54, name:'落魄山 · 建宗大典',   fired:false },
};
const SECT_NODE_ORDER = ['qulu','dabi','shujian','qiguan','kaizong','manhuang','ascend'];
function sectNodeForce(s, nodeKey, evId){
  SECT_NODES[nodeKey].fired = true;
  s.events.push({ id:evId });
  sectLog(s, '【节点】'+SECT_NODES[nodeKey].name+' 至！', 'big');
}
function sectCheckNodes(s){
  SECT_NODE_ORDER.forEach(k=>{
    const nd = SECT_NODES[k];
    if(s.nodeFired[k]) return;
    if(s.xun >= nd.xun){
      s.nodeFired[k]=true;
      if(k==='qulu'){
        s.events.push({ id:'qulu_event' });
        sectLog(s,'【节点】骊珠洞天降格——齐静春先生离世，你被迫出山，起手遭劫。','big');
        sectBanner('骊珠降格', '先生远去 · 你被迫出山', 'danger');
        sectGain(s,'银',-8); sectGain(s,'灵',-2); sectGain(s,'道心',-2);
      } else if(k==='dabi'){
        // 山崖书院：陈平安于此炼化城隍爷沈温所赠金色文胆，得第二件本命物。
        // 考验不在弟子修为，而在山主本人的道心与名望——文胆是「道理」凝的，不是打出来的。
        if(s.res.道心>=25 && s.res.名>=12){
          sectGain(s,'道心',12); sectGain(s,'名',10);
          s.flags['wendan'] = 1;                    // 已得金色文胆；书简湖一役的自碎，正是指它
          sectLog(s,'【节点】山崖书院——道心凝而不散，你炼化城隍所赠金色文胆，得第二件本命物。','good');
          sectBanner('山崖书院', '文胆既成 · 道理有了形状', 'glory');
        } else {
          sectGain(s,'道心',-6); sectGain(s,'名',-8);
          sectLog(s,'【节点】山崖书院——道心未凝，文胆不成，书院一场问学，只落下满心浮躁。','bad');
          sectBanner('山崖书院', '文胆未成 · 道心有亏', 'danger');
        }
      } else if(k==='shujian'){
        // 书简湖问心局：崔瀺为小师弟设的局。此处只把抉择交到玩家手上——
        // 自碎文胆、担下三千七百二十一笔账，还是抽身而退，由「问心局」事件裁决。
        sectNodeForce(s, 'shujian', 'shujian_wendan');
        sectLog(s,'【节点】书简湖——大师兄的局，落到你面前了。','big');
        sectBanner('书简湖', '问心之局 · 你无处可退', 'danger');
      } else if(k==='qiguan'){
        // 剑气长城倾覆：众剑仙举城飞升第五座天下，陈平安独守半截长城。
        // 落魄山要不要倾山驰援？看的是山门的底气，不是护山大阵。
        const pow = sectPower(s);
        const disc = s.disciples.length;
        if(pow>=70 && disc>=2){
          sectGain(s,'名',16); sectGain(s,'道心',6); sectGain(s,'银',-10);
          s.flags['yuan_chengchi'] = 1;             // 倾山援长城
          sectLog(s,'【节点】剑气长城倾覆——你倾山之力驰援城头，落魄山的旗，插在了长城上。','good');
          sectBanner('剑气长城', '倾山驰援 · 此山与城同在', 'glory');
        } else {
          sectGain(s,'名',-12); sectGain(s,'道心',-4);
          sectLog(s,'【节点】剑气长城倾覆——心有余而力不足，你只能眼看着那半截长城，独撑风雨。','bad');
          sectBanner('剑气长城', '力有不逮 · 望城兴叹', 'danger');
        }
      } else if(k==='kaizong'){
        // 落魄开宗（原著册27-28）：创建宗门、祖师堂观礼、跻身「宗」字头。
        // 需门庭、弟子、资粮三者齐备，方撑得起一个「宗」字。
        const dao=s.res.道心, ming=s.res.名, ling=s.res.灵, yin=s.res.银;
        const discStrong = s.disciples.length>=3 && s.disciples.some(d=>d.stage>=2);
        if(ming>=40 && dao>=35 && discStrong && ling>=25 && yin>=15){
          sectGain(s,'名',25); sectGain(s,'道心',8);
          s.flags['kaizong'] = 1;
          sectLog(s,'【节点】落魄开宗——祖师堂前香火起，落魄山自此跻身「宗」字头。','big');
          sectBanner('落魄开宗', '祖师堂观礼 · 跻身宗字头', 'glory');
        } else {
          sectGain(s,'名',-18);
          s.disciples.forEach(d=>d.loyal=Math.max(0,d.loyal-5));
          sectLog(s,'【节点】落魄开宗——门庭未立、弟子未成，观礼只得草草收场，「宗」字头擦肩而过。','bad');
          sectBanner('落魄开宗', '门庭未立 · 观礼草草', 'danger');
        }
      } else if(k==='manhuang'){
        const zhen = s.buildings['护山大阵']?s.buildings['护山大阵'].lv:0;
        const pow = sectPower(s);
        if(s.flags['zhen_weak']) { sectLog(s,'【节点】蛮荒叩关——护山大阵灵机不济，险象环生！','bad'); }
        if(zhen>=2 && pow>=80){
          sectGain(s,'名',15); sectLog(s,'【节点】蛮荒叩关——大阵巍然、弟子同心，来犯者铩羽。','good');
          sectBanner('蛮荒叩关', '大阵巍然 · 来犯者铩羽', 'glory');
        } else if(zhen>=1 && pow>=40){
          sectGain(s,'名',5); sectLog(s,'【节点】蛮荒叩关——惨胜，山门守住了，却也伤了元气。','');
          sectBanner('蛮荒叩关', '惨胜 · 山门暂守', '');
        } else {
          // 破山门：失弟子 / 失地
          const lost = s.disciples.shift();
          if(lost) sectLog(s,'【节点】蛮荒叩关——大阵形同虚设，'+lost.name+'于乱中失散！','bad');
          else sectLog(s,'【节点】蛮荒叩关——山门被破，灵脉被夺。','bad');
          sectGain(s,'灵',-10); sectGain(s,'名',-15);
          sectBanner('蛮荒叩关', '大阵崩坏 · 山门被破', 'danger');
          if(s.disciples.length===0){ sectEnding(s,'broken'); return; }
        }
      } else if(k==='ascend'){
        // 建宗大典：落魄山立世的一问。S「立世」须全属性大成 + 接下观礼三问。
        const dao = s.res.道心, ming = s.res.名, ling = s.res.灵, yin = s.res.银;
        const benz = sectHasSwordTier(s,3);              // 须一柄真正本命（阶3）
        const swords = s.swords.length;
        const power = sectPower(s);
        const discStrong = s.disciples.length>=3 && s.disciples.some(d=>d.stage>=2);
        const zhen = s.buildings['护山大阵']?s.buildings['护山大阵'].lv:0;
        const shuyuan = s.buildings['书院']?s.buildings['书院'].lv:0;
        const mrealm = s.masterRealm;                   // 山主境界
        // S 立世：全维度硬门槛（含山主破境至元婴以上）
        if(dao>=55 && ming>=45 && ling>=40 && yin>=20 && benz && swords>=2 && discStrong && power>=150 && mrealm>=3){
          // 观礼三问：问道、问剑、问人，以一生底蕴硬抗（满分 7，须 ≥4）
          sectLog(s,'【节点】落魄山 · 建宗大典——霁色峰上站满了观礼的人。你须以一身修为，接下这最后一问。','big');
          let trial = 0;
          if(benz) trial++;                       // 本命飞剑（必满）
          if(dao>=65) trial++;                    // 道心稳固
          if(ling>=55) trial++;                   // 灵机深厚
          if(power>=180) trial++;                 // 战力滔天
          if(zhen>=2) trial++;                    // 大阵护山
          if(shuyuan>=2) trial++;                 // 浩然气护身
          if(mrealm>=3) trial++;                  // 山主破境（元婴+）
          if(trial>=4){ const r = sectRouteEnding(s,'S'); sectBanner('建宗大典', (r&&SECT_ENDINGS[r]?SECT_ENDINGS[r].t:'大典既成 · 落魄山立世'), 'glory'); sectEnding(s, r||'ascend'); return; }   // 三问皆应，按因果归宿
          else { const r = sectRouteEnding(s,'A'); sectEnding(s, r||'pacify'); return; }          // 试炼未尽全功，退守成（仍可被路线归宿润色）
        } else if(dao>=30 && ming>=25 && s.disciples.length>=1){
          // A 守成：门坎未够观礼三问，但仍按一生因果归宿收尾（路线归宿，非裸 pacify）
          const r = sectRouteEnding(s,'A');
          sectBanner('建宗大典', (r&&SECT_ENDINGS[r]?SECT_ENDINGS[r].t:'大典草草 · 守成'), '');
          sectEnding(s, r||'pacify'); return;
        } else {
          // 不合格：依短板给对应失败结局
          if(dao<20){ sectEnding(s,'demon'); return; }
          if(s.disciples.length===0){ sectEnding(s,'lost'); return; }
          if(ming<10){ sectEnding(s,'ruined'); return; }
          const r2 = sectRouteEnding(s,'A');   // 兜底一档亦按归宿收尾
          sectEnding(s, r2||'pacify'); return;
        }
      }
    }
  });
}

/* 即时/持续结局预检 */
function sectCheckEndingLive(s){
  if(s.over) return;
  // 道心崩溃
  if(s.res.道心<=0){ sectEnding(s,'demon'); return; }
  // 弟子尽散（且已过大比，经营无以为继）
  if(s.disciples.length===0 && s.nodeFired['dabi']){ sectEnding(s,'lost'); return; }
  // 名声扫地
  if(s.res.名<=0 && s.nodeFired['dabi']){ sectEnding(s,'ruined'); return; }
  // 破产：银灵皆竭连续
  if(s.res.银<=0 && s.res.灵<=0){ s.brokeStreak++; if(s.brokeStreak>=2){ sectEnding(s,'bankrupt'); return; } }
  else s.brokeStreak = 0;
}

/* 路线归宿：合格档（S/A）内，按「道契 + 立场」细分最终结局姿态。
   失败结局（broken/lost/demon/ruined/bankrupt）已在 sectCheckNodes 中定档，此处不触。
   仅当原判定已为 S 或 A 时，再按因果润色为更贴合原著人物线的归宿；tier 不符则返回 null 沿用原结局。 */
function sectRouteEnding(s, tier){
  const rel = s.relations, st = s.stance;
  const E = SECT_ENDINGS;
  const pick = (key)=> (E[key] && E[key].g===tier) ? key : null;
  // 相对偏向：道契值减去全局均值。
  // 定夺归宿看的不是「你认识多少人」，而是「谁在你心里分量最重」——这才是道契。
  // 否则各项道契都被事件喂到 8~10，绝对值毫无区分度，所有局会撞进同一个结局。
  const vals = Object.keys(rel).map(k=>rel[k]||0);
  const avg  = vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0;
  const b = (k)=> Math.max((rel[k]||0) - avg, (rel[k]||0)*0.3);
  // 道契只结了一两位时，相对偏向会失效（均值=自身，偏差恒为 0），
  // 故取 max(偏离均值, 自身三成) 保底，让「专情于一道」也能成立。
  const score = tier==='S'
    ? { tuoyue_end:   (s.flags['zhan_yuanxiong'] ?2:-99) + b('剑气长城')*0.8 + (st['剑礼']||0)*0.3,
        jianqi_end:   b('剑修一脉') + (st['剑礼']||0)*0.6,
        wensheng_end: b('文圣一脉') - (st['剑礼']||0)*0.4,
        yingguan_end: b('剑气长城') + (rel['剑气长城'] ? (st['守']||0)*0.3 : 0) + b('宁姚')*0.3 }
    : { shanshui_end: (s.flags['shanhe_fix']   ? 2.5 : -99),   // 舍尽功名修山河，代价极重，故分量足
        peiqian_end:  (s.flags['peiqian_shou'] ? 2.5 : -99),   // 收裴钱为徒，薪火相传
        ningyao_end:  b('宁姚'),
        ruanxiu_end:  Math.max(b('阮秀'), b('阮邛')*0.8),
        gujiao_end:   Math.max(b('阿良'), b('刘羡阳'), b('李宝瓶')) };
  let bestK = null, bestV = -1e9;
  for(const k in score){ if(score[k] > bestV){ bestV = score[k]; bestK = k; } }
  if(bestK && bestV > 0) return pick(bestK);
  // 无人突出：剑礼均衡而守心稳固 —— 陈平安本色
  if(tier==='S' && Math.abs(st['剑礼']||0)<=2 && (st['守']||0)>=2) return pick('zhixing_end');
  return null;
}

/* 联动：把训练成果（弟子境界/忠心、山主境界）存入 localStorage，供卡牌对战「携弟子入战」加成 */
function sectSaveAllies(s){
  try{
    const arr = s.disciples.filter(d=>d.loyal>0).map(d=>({
      name:d.name, realm:sectRealmOf(d.xiwei), realmName:SECT_REALMS[sectRealmOf(d.xiwei)],
      loyal:d.loyal, dao:d.dao
    }));
    arr.push({ name:'陈平安', realm:s.masterRealm, realmName:SECT_REALMS[s.masterRealm], loyal:100, dao:'剑', master:true });
    // 同名只保留最高境界的一次训练
    const best = {};
    arr.forEach(a=>{ if(!best[a.name] || a.realm>best[a.name].realm) best[a.name]=a; });
    lsSet('jianlai_sect_allies', JSON.stringify(best));
  }catch(e2){}
}

function sectEnding(s, key){
  s.over = true;
  s.ending = key;
  const e = SECT_ENDINGS[key];
  sectLog(s, '【结局】'+e.t, 'big');
  sectSaveAllies(s);                 // 结局落定即存档，弟子可携入战局
  try{
    const k='jianlai_sect_endings';
    const o = JSON.parse(lsGet(k)||'{}');
    o[key] = (o[key]||0)+1;
    lsSet(k, JSON.stringify(o));
  }catch(e2){}
  SFX.lose ? (key==='ascend'?SFX.win():SFX.lose()) : SFX.click();
}


/* ===================== view() 快照（替代 render()） ===================== */
function sectResClass(s, k){
  if(k==='道心' && s.res.道心<20) return 'warn';
  if(k==='名' && s.res.名<10) return 'warn';
  if(k==='银' && s.res.银<=5) return 'warn';
  if(k==='灵' && s.res.灵<=5) return 'warn';
  return '';
}
function sectDaoqiRecap(s){
  const st = s.stance;
  const a = (v,pos,neg)=> v>0?pos : v<0?neg : '未定';
  const relKeys = SECT_REL_ORDER.filter(k=> s.relations[k]);
  const rel = relKeys.length ? relKeys.map(k=> k+(s.relations[k]>0?'+':'')+s.relations[k]).join(' · ') : '';
  const b = sectCurrentBook(s);
  const fKeys = Object.keys(SECT_FIGURES);
  const fMet = fKeys.filter(k=>{ const u = SECT_FIGURES[k].unlock; return !u || u(s); }).length;
  return '你的道理 —— 立身·'+a(st['剑礼'],'以剑','以礼')+'，所守·'+a(st['守'],'守一人','守天下')+'，行事·'+a(st['势'],'顺势','硬扛')
    + (rel? '<br>道契：'+rel : '')
    + '<br>行路：第'+b.act+'幕 · '+b.actName+'，今读《'+b.book+'》'
    + '<br>人物：已识 '+fMet+' / '+fKeys.length+' 位';
}
/* 山中一瞬：每旬一句叙事节拍（暗线心境，不堆数值） */
function sectMoodLine(s){
  const season = sectSeason(s);
  if(SECT_NODES.ascend.xun - s.xun <= 3 && !s.nodeFired.ascend)
    return '建宗大典将近，你握了握拳——这一山的道理，终于要立给天下看。';
  if(s.nodeFired.qiguan && !s.nodeFired.ascend)
    return '蛮荒的尘烟已散，山门暂稳，可你知道，更大的事还在后头。';
  const base = {
    '春':['春风过檐，新绿初发，落魄山又添了一岁静气。','泥瓶巷的旧友捎来口信，山里的日子，倒也不算冷清。','檐下风铃轻响，似有远客踏青而来。'],
    '夏':['蝉声沸处槐荫浓，老槐树又长高了一截。','夏夜星河低垂，你于阶前独坐，想着先生的话。','炉火映面，剑庐里那柄胚胎，正悄悄成形。'],
    '秋':['落叶铺阶，远客渐至，山门前的石狮也染了霜色。','秋风起时，总有人来借剑、来问道理、来寻一段因果。','稻熟收仓，农户送来的新米，够山里吃上一冬。'],
    '冬':['雪压松枝，山门寂寂，你裹紧衣裳，听风过空山。','炉中炭将尽，你添了一块——只要火不灭，山就在。','冬夜漫长，你于灯下读书，灯花爆了一回又一回。']
  };
  const arr = base[season] || base['春'];
  let line = arr[(s.xun + s.year) % arr.length];
  // 偶发语境点缀（避免每旬雷同，也保留「独山」质感）
  if(s.disciples.length===0 && (s.xun % 3 === 1))
    line = '山中仍只你一人。风过松涛，像是谁在唤你，该收个徒弟了。';
  else if(s.swords.length===0 && s.buildings['剑庐'] && s.buildings['剑庐'].lv>0 && (s.xun % 4 === 0))
    line = '剑庐炉火已温，只等一柄本命飞剑，承你这一身的道理。';
  return line;
}
function toggleMood(){ if(S && !S.over){ S.moodOpen = !S.moodOpen; SFX.click(); emitView(); } }
function toggleChron(){ if(S && !S.over){ S.chronicle = !S.chronicle; SFX.click(); emitView(); } }

function view(){
  if(!S) return { ready:false };
  const s = S;
  const book = sectCurrentBook(s);
  const over = s.over;
  const out = {
    ready:true, over:over, diff:s.diff,
    year:s.year, xunInYear:((s.xun-1)%12+1), xun:s.xun, season:sectSeason(s),
    masterRealmName:SECT_REALMS[s.masterRealm], masterRealm:s.masterRealm, masterCult:s.masterCult,
    nextNeed: s.masterRealm>=SECT_REALMS.length-1 ? null : SECT_MASTER_CULT[s.masterRealm+1],
    ascendLeft: SECT_NODES.ascend.xun - s.xun,
    book: book, ap:s.ap, backlog:s.backlog, ui:s.ui,
    moodOpen:s.moodOpen, moodLine:s.moodLine||'',
    chronicleOpen:s.chronicle, chronicle: SECT_CHRONICLE,
    prologue: s.prologue || null,
    settling: !!s.settling,
    settle: sectSettleView(s),
    fxBanners: FXB.slice(),
    fxFloats: FXF.slice()
  };
  const resOrder = [['银','银两'],['灵','灵机'],['名','名声'],['道心','道心'],['机缘','机缘'],['丹','丹']];
  const RES_ICO = { 银:'/assets/icon/sect-yinliang.svg', 灵:'/assets/icon/sect-lingji.svg', 名:'/assets/icon/sect-mingsheng.svg', 道心:'/assets/icon/sect-daoxin.svg', 机缘:'/assets/icon/sect-jiyuan.svg', 丹:'/assets/icon/sect-dan.svg' };
  out.res = resOrder.map(([k,lab])=>({ k, lab, v:s.res[k], cls:sectResClass(s,k), ico:RES_ICO[k] }));
  out.nodes = SECT_NODE_ORDER.map(k=>{
    const nd = SECT_NODES[k];
    const prog = Math.min(100, Math.round((s.xun/nd.xun)*100));
    const cls = s.nodeFired[k] ? 'done' : (s.xun>=nd.xun-3 ? 'fire' : '');
    return { key:k, name:nd.name, prog, cls, fired:s.nodeFired[k] };
  });
  out.daoqi = {
    axes: [
      { label:'立身', v:s.stance['剑礼'], pos:'以剑', neg:'以礼' },
      { label:'所守', v:s.stance['守'], pos:'守一人', neg:'守天下' },
      { label:'行事', v:s.stance['势'], pos:'顺势', neg:'硬扛' }
    ],
    rel: SECT_REL_ORDER.filter(k=> s.relations[k]).map(k=>{ const f=SECT_FIGURES[k]; return { k, v:s.relations[k], tip:(f?f.t:'') }; })
  };
  const fkeys = Object.keys(SECT_FIGURES);
  const fmet = fkeys.filter(k=>{ const u=SECT_FIGURES[k].unlock; return !u || u(s); });
  out.figures = { total:fkeys.length, met:fmet.length, pct:Math.round(fmet.length/fkeys.length*100),
    list: fmet.map(k=>{ const f=SECT_FIGURES[k]; return { k, t:f.t, f:f.f, d:f.d, q:f.q, art:k, hasArt:!!SECT_ART_SET[k] }; }) };
  out.events = s.events.map((ev,idx)=>{
    const def = sectEventDef(ev.id); if(!def) return null;
    return {
      idx, id:ev.id, type:def.type, evClass:(EV_CLASS[def.type]||'misc'), urgent:!!def.urgent, ask:def.type==='问心',
      title:def.title, descLines:(def.desc||'').split('\n'),
      quote:def.q||'',
      opts: def.opts.map((opt,oi)=>{
        const rq = sectOptReqOk(s, opt);
        return { idx, oi, txt:opt.txt, ok:rq.ok, why:rq.why||'', ico: evOptIco(def.type) };
      })
    };
  }).filter(Boolean);
  out.buildings = Object.keys(SECT_BUILDINGS).map(k=>{
    const def = SECT_BUILDINGS[k]; const b = s.buildings[k];
    const maxed = b.lv>=def.max;
    const cost = maxed?null:def.cost[b.lv+1];
    let costTxt = maxed?'已满级':Object.keys(cost||{}).map(c=>({银:'银',灵:'灵',名:'名',道心:'道心'}[c]+cost[c])).join(' ');
    return { key:k, name:def.name, lv:b.lv, max:def.max, sub:(def.eff[b.lv]||def.desc), maxed, costTxt };
  });
  out.disciples = s.disciples.map(d=>({
    name:d.name, art:d.art||'', hasArt:!!(d.art && SECT_ART_SET[d.art]),
    realmName:SECT_REALMS[sectRealmOf(d.xiwei)], dao:d.dao, xiwei:d.xiwei,
    loyal:d.loyal, loyalCls: d.loyal<25?'warn':(d.loyal>70?'good':'')
  }));
  out.discSlots = { used:sectSlotUsed(s), max:sectSlotMax(s) };
  out.swords = s.swords.map(x=>({ name:x.name, tier:x.tier, dao:x.dao, words:x.words }));
  out.log = s.log.map(l=>({ t:l.t, cls:l.cls||'' }));
  const curR = s.masterRealm;
  const nextNeed = curR>=SECT_REALMS.length-1 ? null : SECT_MASTER_CULT[curR+1];
  out.actions = {
    breakTxt: nextNeed==null ? '已 至 绝 顶' : ('破 境（'+SECT_REALMS[curR+1]+'）'),
    canBreak: nextNeed!=null && s.masterCult>=nextNeed && s.ap>0,
    gambBtn: !!(s.buildings['倒悬山别院'] && s.buildings['倒悬山别院'].lv>0)
  };
  if(over){
    const e = SECT_ENDINGS[s.ending];
    out.ending = { key:s.ending, g:e.g, t:e.t, dLines:(e.d||'').split('\n'), poem:e.poem||'', recapLines: sectDaoqiRecap(s).split('<br>'), img:'/packageArt/assets/sect/'+s.ending+'.jpg' };
  }
  return out;
}
function closePrologue(){ if(S && S.prologue){ S.prologue = null; emitView(); } }
function sectUISwitch(ui){ if(!S || S.over) return; S.ui = ui; if(ui!=='main') S.moodOpen = false; SFX.click(); emitView(); }
function open(diffKey){ SECT_DIFF_KEY = diffKey || 'normal'; openSect(); }
function restart(diffKey){ open(diffKey || SECT_DIFF_KEY); }

module.exports = {
  open, restart, setHook, getState, view, closePrologue, sectUISwitch, toggleMood, toggleChron,
  sectSettle, sectEnterNext, sectAdvance, sectBuild, sectRecruitSeek, sectForge, sectPreach, sectBreak, sectTrade, sectGamble,
  sectResolveEvent, sectSkipEvent, SECT_DIFF
};
