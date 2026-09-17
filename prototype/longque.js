'use strict';
/* =====================================================================
   笼中雀 · 骊珠洞天童年
   ---------------------------------------------------------------------
   设计（不以经营/好感为骨）：
     · 结构 = 原著关键场面链，回望「笼中少年」如何立人
     · 记账 = 做过的事（行囊 deed），不是角色好感条
     · 分野 = 理 / 情 / 剑 —— 三选一里落笔，终局看出笼时肩上是什么
     · 笼   = 叙事与章节意象，不是资源界面
   纪律：情节取自《剑来》卷一骊珠洞天明载脉络；拿不准的对白不编造。
   独立存档 ljtq_v1。
   ===================================================================== */

function injectLjtqStyle(){
  if(typeof document === 'undefined' || !document || !document.getElementById) return;
  if(document.getElementById('ljtq-style')) return;
  const css = `
  .ljtq{ max-width:980px; margin:0 auto; color:#ece6d8; padding:8px 4px 48px; }
  .ljtq-head{ text-align:center; padding:20px 12px 14px; margin-bottom:12px;
              border-bottom:1px solid rgba(232,198,106,.28); }
  .ljtq-head h1{ font-family:var(--kai); font-size:36px; letter-spacing:12px; color:var(--gold);
                 margin:0 0 8px; font-weight:normal; }
  .ljtq-head .sub{ font-size:12px; color:#9a917f; letter-spacing:3px; line-height:1.8; }
  .ljtq-head .era{ display:inline-block; margin-top:10px; padding:2px 14px;
                   border:1px solid rgba(232,198,106,.35); border-radius:12px;
                   font-size:11px; color:#c9b98f; letter-spacing:2px; }
  .ljtq-cage{ max-width:520px; height:10px; margin:12px auto 0; position:relative; }
  .ljtq-cage i{ position:absolute; top:0; bottom:0; width:2px; background:rgba(232,198,106,.35); }
  .ljtq-cage i.open{ background:rgba(232,198,106,.08); }
  .ljtq-ch{ text-align:center; font-family:var(--kai); font-size:14px; letter-spacing:6px;
            color:#c9a24b; margin:8px 0 12px; }
  .ljtq-t{ font-family:var(--kai); font-size:28px; letter-spacing:5px; color:#f0e6cc;
           text-align:center; margin:0 0 16px; font-weight:normal; }
  .ljtq-d{ font-size:15px; line-height:2.05; color:#e8e0d0; white-space:pre-wrap;
           max-width:700px; margin:0 auto 20px; text-align:justify; }
  .ljtq-lead{ max-width:560px; margin:18px auto 22px; text-align:center;
              font-family:var(--kai); font-size:15px; color:#c9b98f; letter-spacing:2px; line-height:2; }
  .ljtq-bag{ max-width:640px; margin:0 auto 18px; }
  .ljtq-bag h3{ font-family:var(--kai); font-size:14px; letter-spacing:3px; color:#c9a24b;
                font-weight:normal; margin:0 0 10px; border-bottom:1px dashed rgba(232,198,106,.22);
                padding-bottom:6px; }
  .ljtq-chips{ display:flex; flex-wrap:wrap; gap:8px; }
  .ljtq-chip{ font-size:12px; padding:5px 12px; border-radius:14px;
              border:1px solid rgba(232,198,106,.28); color:#cfc4a8; background:rgba(20,17,15,.45); }
  .ljtq-chip.li{ border-color:rgba(41,128,185,.45); color:#9ec9e8; }
  .ljtq-chip.qing{ border-color:rgba(214,83,63,.4); color:#e8a898; }
  .ljtq-chip.jian{ border-color:rgba(232,198,106,.5); color:#e8c66a; }
  .ljtq-path{ text-align:center; font-size:12px; color:#8d8574; letter-spacing:2px; margin:0 0 16px; }
  .ljtq-path b{ color:#e8c66a; font-weight:500; }
  .ljtq-opts{ max-width:640px; margin:0 auto; display:flex; flex-direction:column; gap:12px; }
  .ljtq-opt{ text-align:left; background:linear-gradient(170deg,rgba(42,37,51,.92),rgba(24,20,30,.92));
             border:1px solid rgba(232,198,106,.32); border-radius:12px; padding:16px 18px; cursor:pointer;
             transition:border-color .15s, transform .15s, box-shadow .15s; }
  .ljtq-opt:hover{ border-color:var(--gold); transform:translateY(-2px);
                   box-shadow:0 8px 22px rgba(0,0,0,.45), 0 0 14px rgba(232,198,106,.15); }
  .ljtq-opt .ot{ font-size:15.5px; color:#f0e8d2; letter-spacing:1px; margin-bottom:6px; }
  .ljtq-opt .on{ font-size:12px; color:#8d8574; line-height:1.65; }
  .ljtq-opt .ow{ font-size:11px; margin-top:8px; letter-spacing:1px; }
  .ljtq-opt .ow.li{ color:#6aa3c9; }
  .ljtq-opt .ow.qing{ color:#c98878; }
  .ljtq-opt .ow.jian{ color:#c9a24b; }
  .ljtq-il{ max-width:560px; margin:14px auto 18px; padding:14px 18px;
            border-left:2px solid rgba(232,198,106,.45); background:rgba(20,17,15,.4);
            font-size:13px; line-height:1.95; color:#cfc4a8; }
  .ljtq-il .il-t{ font-family:var(--kai); color:#e8c66a; letter-spacing:2px; margin-bottom:6px; font-size:14px; }
  .ljtq-end{ text-align:center; padding:16px 12px; }
  .ljtq-eico{ width:92px; height:92px; margin:6px auto 8px; }
  .ljtq-end .g{ font-family:var(--kai); font-size:52px; letter-spacing:10px; color:var(--gold); margin:4px 0; }
  .ljtq-end .gt{ font-family:var(--kai); font-size:26px; letter-spacing:5px; color:#f0e6cc; margin:0 0 16px; font-weight:normal; }
  .ljtq-end .gd{ max-width:560px; margin:0 auto 16px; font-size:14.5px; line-height:2.05;
                 color:#d8d0c0; white-space:pre-wrap; text-align:justify; }
  .ljtq-end .gp{ font-family:var(--kai); font-size:15px; color:#c9a24b; letter-spacing:2px; margin:12px 0 20px; }
  .ljtq-btns{ display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin:20px 0 8px; }
  .ljtq-cx{ display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:12px; margin:16px auto; max-width:900px; }
  .ljtq-cx-card{ border:1px solid rgba(232,198,106,.22); border-radius:12px; padding:14px;
                 background:linear-gradient(180deg,rgba(28,24,32,.7),rgba(18,15,22,.7)); text-align:left; }
  .ljtq-cx-card.got{ border-color:rgba(232,198,106,.42); }
  .ljtq-cx-card .tt{ font-family:var(--kai); font-size:16px; letter-spacing:2px; color:#e0d8c4; margin:0 0 6px; }
  .ljtq-cx-card:not(.got) .tt{ color:#6a6558; letter-spacing:6px; }
  .ljtq-cx-card .dd{ font-size:12px; line-height:1.7; color:#9a917f; }
  .ljtq-cx-card .ct{ font-size:11px; color:#7f7a6c; margin-top:8px; }
  .ljtq-origin{ max-width:640px; margin:0 auto 20px; }
  .ljtq-origin .oi{ background:linear-gradient(170deg,rgba(42,37,51,.9),rgba(24,20,30,.9));
                    border:1px solid rgba(232,198,106,.3); border-radius:12px; padding:18px 20px; margin-bottom:14px;
                    cursor:pointer; transition:border-color .15s, transform .15s; }
  .ljtq-origin .oi:hover{ border-color:var(--gold); transform:translateY(-2px); }
  .ljtq-origin .oi h4{ margin:0 0 8px; font-family:var(--kai); font-size:20px; letter-spacing:4px; color:#f0e6cc; font-weight:normal; }
  .ljtq-origin .oi p{ margin:0; font-size:13px; line-height:1.8; color:#9a917f; }
  .ljtq-trail{ max-width:640px; margin:24px auto 0; text-align:left; }
  .ljtq-trail h3{ font-family:var(--kai); font-size:15px; letter-spacing:3px; color:#c9a24b;
                  font-weight:normal; border-bottom:1px dashed rgba(232,198,106,.25); padding-bottom:6px; margin:0 0 10px; }
  .ljtq-trail .tr{ font-size:12.5px; color:#a8a294; line-height:1.8; padding:5px 0;
                   border-bottom:1px solid rgba(255,255,255,.04); }
  .ljtq-trail .tr b{ color:#cfc4a8; font-weight:500; }
  `;
  const st = document.createElement('style');
  st.id = 'ljtq-style';
  st.textContent = css;
  document.head.appendChild(st);
}
injectLjtqStyle();

/* 三条立人向：不是数值养成，是抉择落笔 */
const LJTQ_PATHS = {
  li:   { n:'理', d:'讲道理、守底线、先生的课' },
  qing: { n:'情', d:'护身边人、认人情债' },
  jian: { n:'剑', d:'笨功夫、不肯认命、笼中想飞' },
};

/* 行囊：做过的事（离散，无好感条） */
const LJTQ_DEEDS = {
  study:      { t:'听过齐先生的课', path:'li' },
  debt:       { t:'欠先生一份束脩', path:'li' },
  help_gucan: { t:'护过挨打的顾璨', path:'qing' },
  bao_cake:   { t:'收过宝瓶半块糕，也还了半块', path:'qing' },
  jing_fu:    { t:'井口贴过一个「井」字', path:'jian' },
  jing_watch: { t:'在井边守过夜', path:'jian' },
  yang:       { t:'杨老头问过你要不要活久一点', path:'li' },
  ruanxiu:    { t:'在阮家炉边暖过手', path:'qing' },
  ning:       { t:'认得外乡佩剑的宁姑娘', path:'jian' },
  protect_liu:{ t:'羡阳出事时你没有躲', path:'qing' },
  hanshan:    { t:'得了《撼山谱》，肯下笨功夫', path:'jian' },
  zhuang:     { t:'在泥瓶巷里走桩，丑，但没停', path:'jian' },
  disciple:   { t:'齐先生临去前，收你作关门弟子', path:'li' },
  escort:     { t:'答应送宝瓶出远门', path:'qing' },
  tongnian:   { t:'和董水井、李槐在一条巷里长大', path:'qing' },
  zhi_gaze:   { t:'稚圭看你的眼神，你记下了', path:'jian' },
  cuichan:    { t:'看过崔瀺与齐先生对弈', path:'li' },
  weibo:      { t:'在山道上见过魏檗', path:'li' },
  yang_seal:  { t:'杨老头的「过几日来找我」，你当真了', path:'li' },
  qiyuan:     { t:'洞天将倾时，你没有跟着去抢机缘', path:'li' },
  bridge_left:{ t:'知道自己只剩数年好活', path:'jian' },
};

const LJTQ_ORIGINS = [
  { k:'water', t:'担水的少年', mark:'苦',
    d:'天不亮就去井边排队。水桶压在肩上，扁担吱呀作响。你没有别的本事，只有这一身用不完的力气，和一句「人要讲道理」。',
    path:'li', deed:null },
  { k:'well', t:'井边发呆', mark:'心',
    d:'有时候你趴在井沿往下看。黑漆漆的，什么也看不见。可你总觉得底下有什么东西，也在看你。',
    path:'jian', deed:'jing_watch' },
  { k:'friend', t:'跟羡阳跑腿', mark:'情',
    d:'刘羡阳有使不完的疯劲。你跟着他翻墙、躲人、挨骂，偶尔也能分到半块饼。日子苦，但不闷。',
    path:'qing', deed:null },
];

const LJTQ_INTERLUDES = [
  { t:'雨后泥路', d:'下过雨的泥瓶巷很难走。你摔了一跤，水洒了半桶。宋集薪撑伞路过，看了你一眼，什么也没说，却把伞往你那边偏了偏。', path:'qing' },
  { t:'半块烧饼', d:'李槐偷偷塞给你半块烧饼，小声说他娘多做的。你推了两次，还是接了。', path:'qing', deed:'tongnian' },
  { t:'先生的目光', d:'齐先生从学堂出来，看见你坐在门槛上用树枝在地上写字。他站了一会儿，没打扰你，第二天却让人送来一支秃笔。', path:'li' },
  { t:'巷口的价', d:'杨老头盯着你看了半天，忽然问：小子，想不想活久一点？你没听懂，只觉得他眼神像在称斤两。', path:'li', deed:'yang' },
  { t:'蝉鸣很吵', d:'夏天的蝉鸣特别吵。你挑着水从福禄街过，听见李宝瓶在墙头喊你名字，声音比蝉还亮。', path:'qing' },
  { t:'井边的凉', d:'夜里你又去井边。风从井口吹上来，凉得不像话。你还是多站了一会儿。', path:'jian', deed:'jing_watch' },
  { t:'宝甲的消息', d:'听说刘羡阳家里有祖传的剑经和宝甲。镇上一些人的眼神变了。你替他担心，他却笑嘻嘻说没事。', path:'qing' },
  { t:'稚圭一瞥', d:'稚圭在巷口晾衣裳。她抬头看你，又很快低下头。像怜悯，又像在看一件旧物。', path:'jian', deed:'zhi_gaze' },
  { t:'炉火旁', d:'阮秀蹲在炉边看火，见你路过，招手让你暖一暖手。她说：火最公道，谁靠近都暖。', path:'qing', deed:'ruanxiu' },
  { t:'外乡人的影', d:'镇口来了个佩剑的生面孔。你只看见一个背影，剑却像活的。', path:'jian', deed:'ning' },
  { t:'水井边的棋', d:'有人说镇上来了个很会下棋的外乡人，跟齐先生在老槐树下摆过一局。你路过时只看见半盘残局，黑白子像两军对峙。', path:'li', deed:'cuichan' },
  { t:'山道上的雾', d:'你挑水走远了些，山道起雾。雾里好像有人负手而立，衣袂不动。等雾散了，只有一株老松。', path:'li', deed:'weibo' },
  { t:'宋家夜灯', d:'宋家窗纸上的灯亮到后半夜。你听见稚圭低声说了句什么，宋集薪没接话。那灯灭得干脆。', path:'jian', deed:'zhi_gaze' },
  { t:'李槐怕黑', d:'李槐不敢走夜路，偏又爱跟你们跑。你把他送回家，他娘塞给你一把炒豆。', path:'qing', deed:'tongnian' },
];

/* 结局 */
const LJTQ_ENDINGS = {
  cage_bird: { g:'S', t:'笼中雀',
    d:'洞天将碎那一夜，你站在泥瓶巷口，忽然明白了两件事：这座小镇一直是只笼子；而你心里那只雀，从井沿发呆那年就想飞了。\n\n齐先生把道理和担子都交给了你。你没有立刻变成剑仙——你还是那个会讲道理、会担水的少年。可你知道，雀已在笼中抬起头。\n\n后来你自育本命飞剑，名「笼中雀」。不是纪念这座洞天，是纪念那个在笼子里也不肯把翅膀收起来的自己。',
    poem:'雀在笼中，仍想振翅。' },
  chunfeng: { g:'S', t:'问春风',
    d:'先生走的那年春天，你在巷口站了很久。有人劝你想开些，你说：遇事不决，可问春风。\n\n这句话不是逃。是你把他教你的道理，一寸寸往自己身上安。后来你护人、讲理、挨打、再站起来——每一步，脚下都有他铺过的路。',
    poem:'遇事不决，可问春风。' },
  jianpei: { g:'S', t:'剑胚初成',
    d:'你没有名师，没有家传。有的只是一口不肯咽下的气，和越练越沉的撼山谱。\n\n出笼那日，江湖还没认得你。可你自己清楚：剑胚已经在了。不是谁赐的，是你一拳一脚、一担水一担煤，从命里挣出来的。',
    poem:'我陈平安，唯有一剑。' },
  ningyao: { g:'S', t:'佩剑的姑娘',
    d:'外乡来的少女叫宁姚。她话不多，剑很快。你们在小镇的巷子里说过几句话，在井边站过一会儿，在将倾的天底下并肩挡过一次风。\n\n出笼那天她先走了。你没有追。你只是把剑桩走稳了些——你知道，总有一天，你会追上那把剑。',
    poem:'总有一天，我会去剑气长城找你。' },
  yiqi: { g:'A', t:'义气千秋',
    d:'羡阳出事那天，你没有算值不值得。有些事，死了也要做；有些事，死也不能做——你很小就认下了这两句。\n\n后来你们各走天涯。泥瓶巷的情分却一直热着，像巷口那盏总也不灭的灯。',
    poem:'少年时结下的交情，是一辈子的债。' },
  ruanxiu: { g:'A', t:'火里生的朋友',
    d:'阮秀教你认火候。她说炼器如炼心，急不得。你在炉边坐过许多个黄昏，手被烫过，道理却长了。\n\n后来她走她的火神路，你走你的剑客路。可那炉火的温度，你一直记得。',
    poem:'山水有相逢。' },
  daoli: { g:'A', t:'道理的种子',
    d:'你未必最能打，也未必最重情，可先生说过的每一句，你都当真。\n\n后来你在江湖上被人笑「太讲道理」。你没改。种子是先生种的，你只负责不让它死。',
    poem:'道理我都懂，可我还是想讲道理。' },
  qiaoda: { g:'A', t:'迟到的少年',
    d:'先生立教称圣那日，你被别的事绊住。等你赶到，只剩一缕春风。\n\n你没有哭出声。你把「齐静春」三个字在心里描了一遍又一遍。有些课，是要用余生去补的。',
    poem:'我在此立教称圣。' },
  danshui: { g:'B', t:'担水郎',
    d:'你没有出笼。洞天碎了，人散了，你还在原来的巷子里担水、搬煤、过日子。\n\n有人说你没出息。你笑了笑。日子是自己的，道理也是自己的。平平安安的平安，未必不是一种修行。',
    poem:'我叫陈平安，平平安安的平安。' },
  jingdi: { g:'B', t:'井底月',
    d:'你看井看得太久，久到分不清井里的月亮和天上的月亮。\n\n先生的话你记着，朋友的手你松过。出笼那天你回头，泥瓶巷已经不在了。你带着一肚子道理，却好像把某样东西落在了井底。',
    poem:'井底之月，捞不起，也忘不掉。' },
  duju: { g:'B', t:'独善其身',
    d:'断桥之后你只顾着活。活下来了，也把人情冷暖关在了门外。\n\n出笼是出笼了，笼子却好像换了一副——从骊珠洞天，换成了你自己的心。',
    poem:'独善其身，有时也是一种善；有时不是。' },
  gulu: { g:'C', t:'孤路出笼',
    d:'你走了，头也不回。朋友们在身后喊，你只当是风。\n\n江湖很大，笼子很小。你终于自由，也终于只剩自己。',
    poem:'出笼容易，回头难。' },
  qiaoliang: { g:'D', t:'桥断命薄',
    d:'长生桥被斩断后，你没有撑住。撼山谱摊在膝头，墨迹未干，人却先倒了。\n\n泥瓶巷还是那条巷子。只是从此少了一个天不亮就去担水的少年。',
    poem:'长生桥断，一缕命如游丝。' },
  guanqiju: { g:'A', t:'观局者',
    d:'你见过崔瀺与齐先生那盘棋。黑白纠缠，像两条不肯让路的河。\n\n很多年后你才懂：那不是棋，是有人以天下为盘，在替后辈磨一把「讲道理」的刀。你没有入局，却把「看清再落子」刻进了骨头。',
    poem:'绣虎以天下为棋，少年以本心为子。' },
  shouyue: { g:'A', t:'守约人',
    d:'杨老头那句「过几日来找我」，你一直没忘。断桥之后你去了，他看了你很久，像是在看一桩旧账。\n\n你没问他是谁，他也没说。你只记得：答应过的事，要办。后来你守过的约，比剑还多。',
    poem:'有些约，比命长。' },
};

/* 形象化结局图标 */
const LJTQ_END_ICO = {
  cage_bird: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="18" width="36" height="34" rx="5" fill="none" stroke="#e8c66a" stroke-width="2.4"/><path d="M24 18 V12 Q32 6 40 12 V18" fill="none" stroke="#e8c66a" stroke-width="2.2"/><path d="M22 28 H42 M22 36 H42 M22 44 H42" stroke="#e8c66a" stroke-width="1.2" stroke-opacity=".35"/><ellipse cx="32" cy="34" rx="7" ry="5.5" fill="#e8c66a" fill-opacity=".2" stroke="#e8c66a" stroke-width="1.8"/><path d="M37 32 Q42 28 44 24" fill="none" stroke="#e8c66a" stroke-width="1.6" stroke-linecap="round"/><circle cx="29" cy="32" r="1.2" fill="#e8c66a"/><path d="M28 40 L26 48 M34 40 L36 48" stroke="#e8c66a" stroke-width="1.5" stroke-linecap="round"/></svg>',
  chunfeng: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M12 40 Q22 22 32 28 Q42 34 52 16" fill="none" stroke="#e8c66a" stroke-width="2.4" stroke-linecap="round"/><path d="M16 48 Q28 38 40 44" fill="none" stroke="#e8c66a" stroke-width="1.6" stroke-opacity=".45" stroke-linecap="round"/><circle cx="48" cy="18" r="2.2" fill="#e8c66a" fill-opacity=".45"/></svg>',
  jianpei: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 8 L32 42" stroke="#e8c66a" stroke-width="2.8" stroke-linecap="round"/><path d="M26 42 L32 54 L38 42" fill="none" stroke="#e8c66a" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 18 L32 12 L40 18" fill="none" stroke="#e8c66a" stroke-width="1.8" stroke-linecap="round" stroke-opacity=".75"/></svg>',
  ningyao: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M18 48 L42 12" stroke="#e8c66a" stroke-width="2.4" stroke-linecap="round"/><path d="M42 12 L46 16 L22 52 Z" fill="#e8c66a" fill-opacity=".12" stroke="#e8c66a" stroke-width="1.6" stroke-linejoin="round"/><circle cx="40" cy="40" r="7" fill="none" stroke="#e8c66a" stroke-width="1.8"/><path d="M20 20 Q24 16 28 20 Q24 24 20 20" fill="#e8c66a" fill-opacity=".35" stroke="#e8c66a" stroke-width="1.2"/></svg>',
  yiqi: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="22" cy="20" r="6" fill="none" stroke="#e8c66a" stroke-width="2"/><circle cx="42" cy="20" r="6" fill="none" stroke="#e8c66a" stroke-width="2"/><path d="M14 50 Q18 36 26 34 L32 40 L38 34 Q46 36 50 50" fill="none" stroke="#e8c66a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  ruanxiu: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 50 Q18 42 20 28 Q22 18 32 12 Q42 18 44 28 Q46 42 32 50 Z" fill="#e8c66a" fill-opacity=".12" stroke="#e8c66a" stroke-width="2"/><path d="M32 44 Q26 38 28 30 Q30 24 32 20 Q34 24 36 30 Q38 38 32 44 Z" fill="#e8c66a" fill-opacity=".3" stroke="#e8c66a" stroke-width="1.3"/></svg>',
  daoli: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 50 V22 Q16 14 32 14 Q48 14 48 22 V50" fill="none" stroke="#e8c66a" stroke-width="2.2" stroke-linejoin="round"/><path d="M16 26 H48 M16 34 H48 M16 42 H48" stroke="#e8c66a" stroke-width="1.3" stroke-opacity=".4"/><path d="M32 14 V8" stroke="#e8c66a" stroke-width="1.6" stroke-linecap="round"/></svg>',
  qiaoda: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="16" r="5" fill="none" stroke="#e8c66a" stroke-width="2"/><path d="M40 22 V34 L48 48" fill="none" stroke="#e8c66a" stroke-width="2" stroke-linecap="round"/><path d="M40 34 L32 44 L28 54" fill="none" stroke="#e8c66a" stroke-width="2" stroke-linecap="round"/><path d="M12 54 H56" stroke="#e8c66a" stroke-width="1.4" stroke-opacity=".35" stroke-linecap="round"/></svg>',
  danshui: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M10 28 H54" stroke="#e8c66a" stroke-width="2.2" stroke-linecap="round"/><path d="M16 28 V32 Q14 36 16 44 H28 Q30 36 28 32 V28" fill="none" stroke="#e8c66a" stroke-width="1.8"/><path d="M36 28 V32 Q34 36 36 44 H48 Q50 36 48 32 V28" fill="none" stroke="#e8c66a" stroke-width="1.8"/></svg>',
  jingdi: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="40" rx="16" ry="8" fill="none" stroke="#e8c66a" stroke-width="2.2"/><path d="M16 40 V24 Q32 12 48 24 V40" fill="none" stroke="#e8c66a" stroke-width="2.2"/><circle cx="32" cy="34" r="6" fill="#e8c66a" fill-opacity=".2" stroke="#e8c66a" stroke-width="1.5"/></svg>',
  duju: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M8 52 Q20 44 28 36 Q36 28 56 20" fill="none" stroke="#e8c66a" stroke-width="2" stroke-linecap="round" stroke-opacity=".45"/><circle cx="30" cy="28" r="4.5" fill="none" stroke="#e8c66a" stroke-width="2"/><path d="M30 33 V44 M30 44 L24 52 M30 44 L36 52" fill="none" stroke="#e8c66a" stroke-width="1.8" stroke-linecap="round"/></svg>',
  gulu: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M10 54 Q18 46 24 40 Q32 32 40 22 Q46 14 56 10" fill="none" stroke="#e8c66a" stroke-width="2.2" stroke-linecap="round"/><circle cx="48" cy="16" r="3.5" fill="#e8c66a" fill-opacity=".35" stroke="#e8c66a" stroke-width="1.4"/></svg>',
  qiaoliang: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M8 36 H22 L26 26 L30 40 L34 30 H56" fill="none" stroke="#e8c66a" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 36 L18 48 M34 30 L38 46" stroke="#e8c66a" stroke-width="1.7" stroke-linecap="round" stroke-opacity=".55"/></svg>',
  guanqiju: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="12" width="40" height="40" rx="3" fill="none" stroke="#e8c66a" stroke-width="2"/><path d="M12 25.3 H52 M12 38.7 H52 M25.3 12 V52 M38.7 12 V52" stroke="#e8c66a" stroke-width="1.2" stroke-opacity=".35"/><circle cx="25.3" cy="25.3" r="4" fill="#e8c66a" fill-opacity=".35" stroke="#e8c66a" stroke-width="1.4"/><circle cx="38.7" cy="38.7" r="4" fill="none" stroke="#e8c66a" stroke-width="1.6"/></svg>',
  shouyue: '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="16" fill="none" stroke="#e8c66a" stroke-width="2.2"/><path d="M32 18 V32 L42 38" fill="none" stroke="#e8c66a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 48 Q32 44 44 48" fill="none" stroke="#e8c66a" stroke-width="1.4" stroke-opacity=".45" stroke-linecap="round"/></svg>',
};
function ljtqIco(k){ return LJTQ_END_ICO[k] || LJTQ_END_ICO.danshui; }

/* 场面链。opt: path 落笔向, deed 行囊, mark 关键标记, next */
const LJTQ_NODES = {
  /* 一 · 陋巷少年 */
  a1: { ch:'一 · 陋巷少年', t:'天不亮的井', total:18,
    d:'骊珠洞天，泥瓶巷。\n\n你叫陈平安，平平安安的平安。父母早亡，只剩你一人守着漏风的屋子。天不亮就得去井边排队，把水挑到福禄街大户人家，换几个铜板。\n\n桶很沉。路很长。你还很小。\n\n很多年后有人问你，笼中雀是什么意思。你想了很久，才想起这口井。',
    ch2:[
      { txt:'咬牙把今天的水挑完', note:'日子要一天天过', path:'li', next:'a2' },
      { txt:'顺路看看宋集薪在不在', note:'比邻而居，总忍不住多看一眼', path:'qing', next:'a2' },
      { txt:'在井沿多趴一会儿', note:'底下好像有东西，也在看你', path:'jian', deed:'jing_watch', next:'a2' },
    ]},
  a2: { ch:'一 · 陋巷少年', t:'宋家门前',
    d:'宋集薪的日子和你不一样。他有婢女稚圭，屋子里有书、有茶，偶尔还有你看不懂的符纸味道。\n\n他不常搭理你，却也不像别人那样把你当叫花子。稚圭看你的眼神更怪——像在看一件本该属于别处的东西。',
    ch2:[
      { txt:'照常点头路过', note:'井水不犯河水', path:'li', next:'a3' },
      { txt:'问他借半页旧书', note:'脸皮不值钱，道理值钱', path:'li', next:'a3' },
      { txt:'帮他搬一趟东西', note:'换一顿饭，也换一点人情', path:'qing', next:'a3' },
      { txt:'站住，认真看稚圭一眼', note:'你想弄清楚那眼神是什么', path:'jian', deed:'zhi_gaze', mark:'zhi', next:'a2z' },
    ]},
  a2z: { ch:'一 · 陋巷少年', t:'稚圭不开口',
    d:'稚圭被你看得一顿，手里的衣裳滑进盆里。\n\n她低声说：你看什么。\n\n你说：我觉得你不像婢女。\n\n她愣了很久，才把衣裳捞起来，像捞一件很沉的旧事。宋集薪在门内咳了一声，门轴轻响。',
    ch2:[
      { txt:'道个歉，转身走', note:'别人的屋檐下，少问', path:'li', next:'a3' },
      { txt:'记住这一幕，不再多问', note:'总有一天会懂', path:'jian', deed:'zhi_gaze', next:'a3' },
      { txt:'对宋集薪说：她好像有心事', note:'他看了你一眼，没接话', path:'qing', next:'a3' },
    ]},
  a3: { ch:'一 · 陋巷少年', t:'羡阳与挨打的孩子', il:1,
    d:'刘羡阳拽着你满巷跑。董水井在井边冲你们招手，顾璨被几个大孩子按在地上打，哭都不敢出声。\n\n你放下水桶。有些事，你可以不管。可你还是走了过去。',
    ch2:[
      { txt:'把顾璨拉起来，挡在身前', note:'打不过也要挡', path:'qing', deed:'help_gucan', mark:'protect', next:'a4' },
      { txt:'喊羡阳一起上，把人吓跑', note:'人多势众，也是法子', path:'qing', deed:'help_gucan', mark:'protect', next:'a4' },
      { txt:'去找大人，不硬碰', note:'少挨一顿打，多费口舌', path:'li', deed:'help_gucan', mark:'protect', next:'a4' },
    ]},
  a4: { ch:'一 · 陋巷少年', t:'红棉袄',
    d:'福禄街李家有个小姑娘叫李宝瓶，爱穿红棉袄，见了你就喊名字，声音脆得像敲碗。\n\n她塞给你一块糕，又问你为什么总挑水。你答不上来，她自己先想明白了：「因为你没有爹娘，对不对？」',
    ch2:[
      { txt:'点头，然后把糕掰一半还她', note:'穷，但不占便宜', path:'li', deed:'bao_cake', next:'a5' },
      { txt:'收下糕，认真说谢谢', note:'这份情你记下了', path:'qing', deed:'bao_cake', next:'a5' },
      { txt:'沉下脸走开', note:'有些话，你还不想听', path:'jian', next:'a5' },
    ]},
  a5: { ch:'一 · 陋巷少年', t:'一条巷的少年',
    d:'董水井老实，李槐胆小却爱跟你们跑，林守一话少、算数比谁都快，赵繇走路像先生。\n\n你们没有拜过把子，只是一起挑过水、分过饼、挨过同一条巷的骂。后来各奔东西，你却总记得：泥瓶巷不是你一个人的笼子。',
    ch2:[
      { txt:'把炒豆分给大家', note:'有福同享，哪怕只是一把豆', path:'qing', deed:'tongnian', next:'b1' },
      { txt:'听林守一算今天的账', note:'你学着把日子过明白', path:'li', deed:'tongnian', next:'b1' },
      { txt:'各自散了，各干各的活', note:'穷人的交情，不必天天黏着', path:'jian', deed:'tongnian', next:'b1' },
    ]},

  /* 二 · 先生与众生 */
  b1: { ch:'二 · 先生与众生', t:'齐先生',
    d:'齐静春是镇上教书的先生。据说很有学问，却自愿守在这座洞天里，一守就是很久。\n\n有天他拦住挑水的你，问：愿不愿意来学堂听几日课？不要你的束脩。',
    ch2:[
      { txt:'去。天塌下来也要去', note:'这是你离「道理」最近的一次', path:'li', deed:'study', mark:'study', next:'b2a' },
      { txt:'先问：要耽误挑水吗', note:'活命和读书，都要账算清楚', path:'li', deed:'study', mark:'study', next:'b2b' },
      { txt:'摇头。我得先活下去', note:'先生的眼睛暗了一下', path:'jian', next:'b2c' },
    ]},
  b2a: { ch:'二 · 先生与众生', t:'第一堂课',
    d:'学堂里有李宝瓶、李槐，也有几个你认得不全的少年。先生不讲大道理，只让你把「人」字写端正。\n\n你写得很慢。先生站在你身后看了很久，说：慢不要紧，别歪。',
    ch2:[
      { txt:'把「人」字写满一页', note:'笨功夫，也是功夫', path:'li', next:'b3' },
      { txt:'问先生：为什么是我', note:'先生笑了笑，没答', path:'li', next:'b3' },
      { txt:'心里却想着井底那点凉气', note:'字在纸上，心在井边', path:'jian', next:'b3' },
    ]},
  b2b: { ch:'二 · 先生与众生', t:'账要算清',
    d:'你说：先生，我一天不挑水，就一天没饭吃。\n\n齐静春点点头，从袖中摸出几个铜板：那先生先垫着。不是施舍，是借。你以后有出息了再还。',
    ch2:[
      { txt:'收下，认真记在心里', note:'借的要还，这是道理', path:'li', deed:'debt', next:'b3' },
      { txt:'收下，当场磕一个头', note:'膝盖不值钱，心意值钱', path:'qing', deed:'debt', next:'b3' },
      { txt:'不收。我可以少睡一个时辰', note:'先生叹了口气，由你', path:'jian', next:'b3' },
    ]},
  b2c: { ch:'二 · 先生与众生', t:'错过门',
    d:'你没有去学堂。日子还是挑水、搬煤、挨饿。\n\n只是有时路过学堂，会听见里面的读书声。你加快脚步，水桶晃出的水打湿了鞋。',
    ch2:[
      { txt:'下次一定去', note:'「下次」是最软的谎', path:'li', next:'b3' },
      { txt:'在窗外听完再走', note:'窗内是先生，窗外是生活', path:'li', deed:'study', mark:'study', next:'b3' },
      { txt:'恨自己，也恨命', note:'恨意沉在桶底', path:'jian', next:'b3' },
    ]},
  b3: { ch:'二 · 先生与众生', t:'杨老头的称量', il:1,
    d:'巷口的杨老头做买卖，眼睛毒得很。他看你挑水路过，忽然说：小子，根骨是死的，人是活的。想不想活久一点？\n\n你听不懂。他也不解释，只丢给你一句话：过几日，来找我。\n\n那语气不像招揽生意，倒像在认一桩很旧的账。',
    ch2:[
      { txt:'记住他的话，也记住要还', note:'老人不会无缘无故开口', path:'li', deed:'yang', deed2:'yang_seal', next:'b4' },
      { txt:'当他是疯话', note:'活命靠自己，不靠怪人', path:'jian', next:'b4' },
      { txt:'追问：要付什么代价', note:'他眯眼笑了：先活着，再谈代价', path:'li', deed:'yang', deed2:'yang_seal', next:'b4' },
    ]},
  b4: { ch:'二 · 先生与众生', t:'阮家炉火',
    d:'镇上有座铸剑铺，主人叫阮邛。他女儿阮秀爱蹲在炉边看火，见你手冻得通红，招手让你暖一暖。\n\n她说：火最公道，谁靠近都暖。又说：你走路太轻，像怕踩碎什么。',
    ch2:[
      { txt:'坐下暖手，听她讲火候', note:'炼器如炼心', path:'qing', deed:'ruanxiu', next:'b5' },
      { txt:'谢过就走，还要挑水', note:'活儿比炉火急', path:'li', next:'b5' },
      { txt:'问她：剑是怎么铸成的', note:'她眼睛亮了', path:'jian', deed:'ruanxiu', next:'b5' },
    ]},
  b5: { ch:'二 · 先生与众生', t:'崔瀺的棋',
    d:'老槐树下摆着一盘棋。对弈的一方是齐先生，另一人青衫落拓，落子极快，像在跟整座天下较劲。\n\n有人低声说：那是崔瀺，人称绣虎。\n\n你看不懂棋，却看懂了一件事：先生每落一子，都在替谁挡一下。',
    ch2:[
      { txt:'站着看完，一声不吭', note:'看不懂，也要看', path:'li', deed:'cuichan', mark:'cuichan', next:'c1' },
      { txt:'问先生：他是敌是友', note:'先生说：棋盘上没有简单的敌友', path:'li', deed:'cuichan', mark:'cuichan', next:'c1' },
      { txt:'只觉得那人气势压人，转身走了', note:'你还小，扛不住那种锋芒', path:'jian', next:'c1' },
    ]},

  /* 三 · 井底有物 */
  c1: { ch:'三 · 井底有物', t:'夜里的怪声', il:1,
    d:'泥瓶巷那口老井，最近夜里总传出怪声。有人说底下有阴物作祟。\n\n你趴在井沿往下看——黑得深不见底。某一瞬间，你好像看见两点幽光，像眼睛。',
    ch2:[
      { txt:'告诉齐先生', note:'自己扛不动的，要交给能扛的人', path:'li', next:'c2a' },
      { txt:'自己写一张「井」字贴上去', note:'你从旧书里看来的法子', path:'jian', deed:'jing_fu', mark:'jing', next:'c2b' },
      { txt:'装作没看见，绕着走', note:'敬鬼神而远之', path:'li', next:'c2c' },
    ]},
  c2a: { ch:'三 · 井底有物', t:'先生出手',
    d:'齐先生到井边站了一会儿。他没念咒，也没画符，只是把手按在井沿上，说了句：都安静些。\n\n那夜之后，井水清了许多。先生看你一眼：以后再看见什么，还来找我。',
    ch2:[
      { txt:'记下先生的话', note:'这世上有你不懂的力量，也有你信得过的人', path:'li', next:'d1' },
      { txt:'问：井底到底是什么', note:'先生说：等你大一些再告诉你', path:'jian', next:'d1' },
    ]},
  c2b: { ch:'三 · 井底有物', t:'第一张符',
    d:'你用秃笔蘸了灶灰，在黄纸上写下一个歪歪扭扭的「井」字。\n\n手抖得厉害。写完往井口一贴——风忽然停了。井底那两点幽光，像被什么东西按住，缓缓沉了下去。\n\n你不知道自己刚才做了什么。只知道：这世上有些事，笨人也能摸到门边。',
    ch2:[
      { txt:'把这件事藏进心里', note:'说出去也没人信', path:'jian', next:'d1' },
      { txt:'告诉杨老头', note:'那老人眯眼笑了：小子，有点意思', path:'li', next:'d1' },
    ]},
  c2c: { ch:'三 · 井底有物', t:'绕井而行',
    d:'你没有靠近那口井。夜里有声音，你就把被子蒙过头。\n\n可奇怪的是，你越躲，梦里那口井就越清楚。黑水，幽光，还有一个你自己的倒影——倒影好像在说什么。',
    ch2:[
      { txt:'再撑一段时日', note:'少年的忍耐也是本事', path:'li', next:'d1' },
      { txt:'终于还是去了井边', note:'躲得过初一，躲不过十五', path:'jian', deed:'jing_watch', next:'d1' },
    ]},

  /* 四 · 外乡人与剑 */
  d1: { ch:'四 · 外乡人与剑', t:'佩剑的少女',
    d:'镇上来了个外乡少女，叫宁姚。她背一把剑，话很少，看人像在看剑——不是挑衅，是在估量。\n\n她在井边站过，在巷口停过。你挑水路过，只觉得：她的剑，好像会说话。',
    ch2:[
      { txt:'鼓起勇气打个招呼', note:'你叫陈平安，平平安安的平安', path:'qing', deed:'ning', mark:'ning', next:'d1b' },
      { txt:'远远看一眼就好', note:'外乡人，与你无关', path:'li', next:'d1b' },
      { txt:'问她：你的剑，能借我看一眼吗', note:'她挑了挑眉，竟没拒绝', path:'jian', deed:'ning', mark:'ning', next:'d1b' },
    ]},
  d1b: { ch:'四 · 外乡人与剑', t:'山道一晤',
    d:'你挑水走得远了些。山道起雾，雾里有人负手而立，衣袂不动，像一株会呼吸的老松。\n\n他看了你一眼，说：井边的少年。\n\n你想问他是谁。雾散时，人已不见，只余松针落地的轻响。后来你才知道，那一方水土，自有山君。',
    ch2:[
      { txt:'朝雾里作了个揖', note:'不管是谁，礼数要到', path:'li', deed:'weibo', mark:'weibo', next:'d2' },
      { txt:'把这一幕藏进心里', note:'小镇的秘密，不止井底一口', path:'jian', deed:'weibo', mark:'weibo', next:'d2' },
      { txt:'只当是看花了眼', note:'山里雾大，本就容易花眼', path:'li', next:'d2' },
    ]},
  d2: { ch:'四 · 外乡人与剑', t:'剑经的祸',
    d:'刘羡阳家有祖传剑经与宝甲，不知怎的走漏了风声。正阳山的人来了，还有一头让你心底发寒的巨猿——搬山猿。\n\n他们要剑经。羡阳不肯卖。',
    ch2:[
      { txt:'冲上去挡在羡阳身前', note:'你挡不住，可你还是挡了', path:'qing', deed:'protect_liu', mark:'protect_liu', next:'d3a' },
      { txt:'死死抱住羡阳往后拖', note:'先把人拖出死地', path:'qing', deed:'protect_liu', mark:'protect_liu', next:'d3b' },
      { txt:'跑去喊齐先生与宁姑娘', note:'你跑得比风还快', path:'li', deed:'protect_liu', mark:'protect_liu', next:'d3c' },
    ]},
  d3a: { ch:'四 · 外乡人与剑', t:'那一拳',
    d:'搬山猿一拳砸在羡阳胸口上。你扑过去，被巨力掀开，摔在墙根。\n\n血。少年的血。你爬起来，又扑过去。第三次，你终于把羡阳拖出了半条命。',
    ch2:[
      { txt:'护住他，直到有人来', note:'命在，剑经就在', path:'qing', next:'d4' },
      { txt:'红了眼，想跟那头猿拼了', note:'有人死死拉住了你', path:'jian', next:'d4' },
    ]},
  d3b: { ch:'四 · 外乡人与剑', t:'拖出半条命',
    d:'你把刘羡阳拖到墙根。他嘴角全是血，还冲你笑：平安……我没事。\n\n宝甲可以卖，剑经不能卖——他说那是祖宗的脸。你忽然明白，有些东西比命重。',
    ch2:[
      { txt:'先安顿他，再想办法', note:'顺序，就是你的道', path:'li', next:'d4' },
      { txt:'去找杨老头问有没有法子', note:'那老人说：有。代价你付得起吗', path:'li', deed:'yang', next:'d4' },
    ]},
  d3c: { ch:'四 · 外乡人与剑', t:'迟了一步',
    d:'你把齐先生与宁姚请来时，地上已经见了血。先生的脸白得像纸。宁姚的手按在剑柄上，指节发青。\n\n正阳山的人收势，淡淡道：齐先生，这是我们的事。',
    ch2:[
      { txt:'求先生替羡阳讨个公道', note:'你还没学会为自己求', path:'li', next:'d4' },
      { txt:'看向宁姑娘：你能不能出剑', note:'她说：还不到时候', path:'jian', next:'d4' },
    ]},
  d4: { ch:'四 · 外乡人与剑', t:'蔡金简的一剑',
    d:'蔡金简看你一眼，像看路边一条狗。\n\n然后她出剑了。\n\n不是冲着你的命——她斩的是你的长生桥。那一瞬间，你听见身体里有什么东西「咔」地断了，像冬天河面上的冰。\n\n你只剩几年好活。',
    ch2:[
      { txt:'死死瞪着她，不低头', note:'桥可以断，人不能弯', path:'jian', mark:'bridge', next:'e1' },
      { txt:'先去看羡阳，再管自己', note:'自己的命，排在兄弟后面', path:'qing', mark:'bridge', next:'e1' },
      { txt:'问她为什么', note:'她答：你挡路了。轻描淡写', path:'li', mark:'bridge', next:'e1' },
    ]},

  /* 五 · 撼山谱 */
  e1: { ch:'五 · 撼山谱', t:'活命的笨功夫',
    d:'杨老头不知从哪弄来一册《撼山谱》。他说：练这个，能多活几年。不是仙法，是笨功夫。\n\n你翻开第一页。动作丑，呼吸沉，一拳一脚都要把骨头往里砸。\n\n你没有别的路了。',
    ch2:[
      { txt:'练。往死里练', note:'把「活下去」当成头一等大事', path:'jian', deed:'hanshan', mark:'hanshan', next:'e2' },
      { txt:'练，但每晚仍去听先生说几句', note:'命要，理也要', path:'li', deed:'hanshan', mark:'hanshan', next:'e2' },
      { txt:'先问清楚：练了会怎样', note:'先生说：能活。别的不敢保证', path:'li', deed:'hanshan', mark:'hanshan', next:'e2' },
    ]},
  e2: { ch:'五 · 撼山谱', t:'走桩', il:1,
    d:'你在泥瓶巷里走桩。一步一拳，丑得像鸭子。\n\n宋集薪倚门看了半天，说了句：你这样练，是找死，也是找活。\n\n稚圭远远望着你，眼神比从前更复杂。阮秀路过，塞给你一块烤红薯：火候到了，才甜。',
    ch2:[
      { txt:'继续走，不理会目光', note:'命是自己的', path:'jian', deed:'zhuang', next:'e3' },
      { txt:'请宋集薪指正', note:'他哼了一声，却真说了两句', path:'li', deed:'zhuang', next:'e3' },
      { txt:'吃完红薯，谢过阮秀', note:'火候到了才甜——你记下了', path:'qing', deed:'zhuang', next:'e3' },
    ]},
  e3: { ch:'五 · 撼山谱', t:'数年好活',
    d:'先生或杨老头都说过类似的话：长生桥断了，寻常路走不通。练这个，能多活几年。\n\n「几年」是多少？没人给你准数。\n\n夜里你躺在漏风的屋里，第一次认真算了算：如果只剩几年，你要把什么做完？',
    ch2:[
      { txt:'把该还的还了，该护的护住', note:'命短，账要清', path:'qing', deed:'bridge_left', mark:'bridge_count', next:'f0' },
      { txt:'把撼山谱再走一遍', note:'能多走一步是一步', path:'jian', deed:'bridge_left', mark:'bridge_count', next:'f0' },
      { txt:'去找杨老头，问清楚', note:'「过几日来找我」——你当真了', path:'li', deed:'bridge_left', deed2:'yang_seal', mark:'bridge_count', next:'f0' },
    ]},

  /* 六 · 将倾之天 */
  f0: { ch:'六 · 将倾之天', t:'抢机缘的人',
    d:'洞天要碎的消息压不住了。外头来了许多人，眼睛发亮，像闻见血腥的豺狗。\n\n有人翻墙掘地，有人逼问老人，有人围着学堂转。镇上六千乡民，在他们眼里只是机缘旁边的灰。\n\n你挑水路过，水桶晃了一下。',
    ch2:[
      { txt:'把被推倒的孩子扶起来', note:'机缘是他们的，人是你的', path:'qing', deed:'qiyuan', mark:'qiyuan', next:'f1' },
      { txt:'去告诉齐先生', note:'天塌下来，有先生在顶', path:'li', deed:'qiyuan', mark:'qiyuan', next:'f1' },
      { txt:'握紧扁担，守在自家巷口', note:'你打不过修士，守得住一扇门', path:'jian', deed:'qiyuan', mark:'qiyuan', next:'f1' },
    ]},
  f1: { ch:'六 · 将倾之天', t:'天上的裂缝',
    d:'骊珠洞天撑不住了。天上的裂缝越来越大，镇上人心惶惶。有人想走，有人想抢，有人想趁乱捞一笔。\n\n齐静春却比往日更平静。他把几个少年叫到跟前，一个一个看过去，最后目光落在你身上，停得最久。',
    ch2:[
      { txt:'先生，我能做什么', note:'你还是那个先问「能做什么」的少年', path:'li', next:'f2' },
      { txt:'先生，您要小心', note:'你第一次把担忧说出口', path:'qing', next:'f2' },
      { txt:'什么也没说，只是跪下磕了三个头', note:'有些告别，膝盖比嘴诚实', path:'qing', next:'f2' },
    ]},
  f2: { ch:'六 · 将倾之天', t:'并肩挡风',
    d:'乱起来的那几日，宁姚在镇口挡过一次妖物。你也去了——不是因为你有剑，是因为你看见有孩子被挤倒。\n\n她回头看了你一眼。那一眼很短，你却记了很多年。',
    ch2:[
      { txt:'站到她身侧，用身体护住孩子', note:'你没有剑，你有命', path:'qing', deed:'ning', mark:'ning', next:'f3' },
      { txt:'把孩子抱走，不添乱', note:'不添乱，也是一种帮', path:'li', next:'f3' },
      { txt:'事后问她：剑道是什么', note:'她说：是把该杀的杀了，该护的护住', path:'jian', deed:'ning', mark:'ning', next:'f3' },
    ]},
  f3: { ch:'六 · 将倾之天', t:'立教称圣',
    d:'那一日，齐静春朗声开口。\n\n他说他要在此立教称圣。他说要以一身修为，担起天道反噬，换这小镇六千人来生安稳。\n\n有人哭，有人骂他傻。他只是笑着看向你们这些少年，像在看春天。',
    ch2:[
      { txt:'冲上去想拉住他', note:'你知道拉不住。手还是伸了出去', path:'qing', next:'f4' },
      { txt:'站在原地，把每一个字刻进骨头', note:'这是他最后一课', path:'li', next:'f4' },
      { txt:'红着眼，想替他挡那一下', note:'剑心在胸腔里撞', path:'jian', next:'f4' },
    ]},
  f4: { ch:'六 · 将倾之天', t:'一魂一魄入春风',
    d:'齐静春身死道消。\n\n他只留一魂一魄化入春风。临去前，他代老秀才收你为关门弟子，把道理与担子一并交了出去。\n\n后来你无数次想起那句话——遇事不决，可问春风。',
    ch2:[
      { txt:'接下弟子之名', note:'肩上忽然重了，也忽然稳了', path:'li', deed:'disciple', mark:'disciple', next:'g1' },
      { txt:'先问：我配吗', note:'春风拂过你的脸，像先生在摇头', path:'li', deed:'disciple', mark:'disciple', next:'g1' },
    ]},

  /* 七 · 出笼 */
  g1: { ch:'七 · 出笼', t:'巷口的红棉袄',
    d:'洞天降格，小镇不再是从前的小镇。李宝瓶要去大隋山崖书院。她站在巷口，红棉袄在风里鼓起来。\n\n「陈平安！你送我！」\n\n你回头看了眼泥瓶巷。井还在，宋家的门关着，羡阳的伤还没好利索。宁姚的剑，已经先一步出了镇。',
    ch2:[
      { txt:'送。山高水远，我陪你走一段', note:'先生教过你：护道，也是修行', path:'qing', deed:'escort', mark:'escort', next:'g2' },
      { txt:'先安顿好巷里的事，再上路', note:'走得慢，但走得稳', path:'li', deed:'escort', mark:'escort', next:'g2' },
      { txt:'我想再留一阵。笼子还没完全破', note:'你还在等心里那只雀抬起头', path:'jian', next:'g2' },
    ]},
  g2: { ch:'七 · 出笼', t:'出笼',
    d:'你终于迈出小镇。\n\n身后的骊珠洞天像一只合拢的笼。井沿的凉、先生的字、羡阳的笑、宝瓶的红棉袄、炉边的火、井底的幽光——全被留在了笼子里。\n\n可你心里有什么东西，跟着你一起走了出来。\n\n是那只雀。你要带着什么，走出这只笼？',
    ch2:[
      { txt:'把道理背进行囊', note:'先生的课，还没上完', path:'li', mark:'exit_li', next:'__end' },
      { txt:'把人情背进行囊', note:'欠过的，都要还', path:'qing', mark:'exit_qing', next:'__end' },
      { txt:'把剑心藏进行囊', note:'还不到出鞘的时候', path:'jian', mark:'exit_jian', next:'__end' },
    ]},
};

/* ===================== 状态 ===================== */
let LJTQ = null;

function ljNewState(originKey){
  const o = LJTQ_ORIGINS.find(x => x.k === originKey) || LJTQ_ORIGINS[0];
  const s = {
    phase:'origin', origin:o.k, node:'a1',
    path:{ li:0, qing:0, jian:0 },
    deeds:[], marks:{}, trail:[], ilUsed:{}, ilCount:0,
    ending:null, steps:0,
  };
  if(o.path) s.path[o.path]++;
  if(o.deed && s.deeds.indexOf(o.deed)<0) s.deeds.push(o.deed);
  return s;
}

function ljAddPath(s, p, n){
  if(!p || !s.path[p] && s.path[p]!==0) return;
  s.path[p] += (n==null?1:n);
}
function ljAddDeed(s, key){
  if(key && s.deeds.indexOf(key)<0) s.deeds.push(key);
}
function ljLog(s, t, note){
  s.trail.push({ t, note:note||'' });
  if(s.trail.length>80) s.trail.shift();
}
function ljLean(s){
  const p = s.path;
  const max = Math.max(p.li, p.qing, p.jian);
  if(max<=0) return null;
  const hits = [];
  if(p.li===max) hits.push('理');
  if(p.qing===max) hits.push('情');
  if(p.jian===max) hits.push('剑');
  return hits.join(' · ');
}
function ljLoadCodex(){
  try{
    const raw = localStorage.getItem('ljtq_v1');
    return raw ? JSON.parse(raw) : { endings:{}, runs:0 };
  }catch(e){ return { endings:{}, runs:0 }; }
}
function ljSaveCodex(c){
  try{ localStorage.setItem('ljtq_v1', JSON.stringify(c)); }catch(e){}
}

/* 结局：看行囊标记 + 三向落笔 + 出笼选择，不看好感 */
function ljRouteEnding(s){
  const m = s.marks || {};
  const has = (k) => s.deeds.indexOf(k)>=0 || !!m[k];
  const p = s.path;
  const exit = m.exit_li ? 'li' : (m.exit_qing ? 'qing' : (m.exit_jian ? 'jian' : null));

  // 断桥后未得撼山谱 → 命薄
  if(m.bridge && !has('hanshan') && !m.hanshan) return 'qiaoliang';

  // 隐藏 S：三条都立住 + 接了传承 + 关键人事
  if(has('disciple') && has('hanshan') && has('protect_liu') && has('ning')
     && has('qiyuan') && p.li>=5 && p.qing>=5 && p.jian>=5) return 'cage_bird';

  // 剑向
  if(has('hanshan') && has('zhuang') && p.jian >= Math.max(p.li, p.qing) && p.jian>=6) return 'jianpei';
  if(has('ning') && has('protect_liu') && p.jian>=5 && p.qing>=4) return 'ningyao';
  // 理向 / 观局 / 守约
  if(has('cuichan') && has('disciple') && p.li>=6) return 'guanqiju';
  if(has('yang_seal') && has('hanshan') && p.li>=5) return 'shouyue';
  if(has('disciple') && has('study') && p.li >= Math.max(p.qing, p.jian) && p.li>=6) return 'chunfeng';
  if(has('study') && p.li>=6 && !has('disciple')) return 'daoli';
  if(has('disciple') && p.li>=4 && !has('study')) return 'qiaoda';
  // 情向
  if(has('protect_liu') && has('help_gucan') && has('tongnian') && p.qing>=7) return 'yiqi';
  if(has('protect_liu') && has('help_gucan') && p.qing>=6) return 'yiqi';
  if(has('ruanxiu') && p.qing>=5) return 'ruanxiu';
  // 出笼选择加重
  if(exit==='jian' && p.jian>=4) return 'jianpei';
  if(exit==='li' && has('disciple')) return 'chunfeng';
  if(exit==='qing' && p.qing>=4) return 'yiqi';
  // 兜底
  if(p.jian>=5 && p.qing<3) return 'gulu';
  if(has('jing_fu') || (has('jing_watch') && p.qing<3 && p.li<4)) return 'jingdi';
  if(p.li>=4 && p.qing<3) return 'duju';
  if(p.qing>=3 && p.li>=3) return 'danshui';
  return 'danshui';
}

/* ===================== 操作 ===================== */
function openLongque(){
  try{ injectLjtqStyle(); }catch(e){}
  if(typeof state === 'undefined' || !state){
    if(typeof window !== 'undefined'){ window.state = { phase:'longque', sel:[], log:[] }; }
  } else {
    state.phase = 'longque';
  }
  if(!LJTQ) LJTQ = { phase:'origin' };
  if(typeof render === 'function') render();
  else ljRenderFallback();
}
function ljStartOrigin(k){
  LJTQ = ljNewState(k);
  LJTQ.phase = 'play';
  LJTQ.node = 'a1';
  ljLog(LJTQ, '开局 · ' + ((LJTQ_ORIGINS.find(o=>o.k===k)||{}).t||''), '');
  if(typeof render === 'function') render();
}
function ljChoose(optIdx){
  if(!LJTQ || LJTQ.phase!=='play') return;
  const node = LJTQ_NODES[LJTQ.node];
  if(!node) return;
  const opt = (node.ch2||[])[optIdx];
  if(!opt) return;
  if(opt.path) ljAddPath(LJTQ, opt.path, 1);
  if(opt.deed) ljAddDeed(LJTQ, opt.deed);
  if(opt.deed2) ljAddDeed(LJTQ, opt.deed2);
  if(opt.mark) LJTQ.marks[opt.mark] = true;
  ljLog(LJTQ, node.t + ' → ' + opt.txt, opt.note||'');
  LJTQ.steps++;

  if(node.il && LJTQ.ilCount < 3){
    const pool = LJTQ_INTERLUDES.filter((x,i)=>!LJTQ.ilUsed[i]);
    if(pool.length){
      const pick = pool[Math.floor(Math.random()*pool.length)];
      const idx = LJTQ_INTERLUDES.indexOf(pick);
      LJTQ.ilUsed[idx] = true;
      LJTQ.ilCount++;
      if(pick.path) ljAddPath(LJTQ, pick.path, 1);
      if(pick.deed) ljAddDeed(LJTQ, pick.deed);
      LJTQ.lastIl = pick;
    }
  }

  if(!opt.next || opt.next==='__end' || !LJTQ_NODES[opt.next]){ ljEnd(); return; }
  LJTQ.node = opt.next;
  if(typeof render === 'function') render();
}
function ljEnd(){
  if(!LJTQ) return;
  const key = ljRouteEnding(LJTQ);
  LJTQ.ending = key;
  LJTQ.phase = 'end';
  const c = ljLoadCodex();
  const isNew = !c.endings[key];
  c.endings[key] = (c.endings[key]||0)+1;
  c.runs = (c.runs||0)+1;
  ljSaveCodex(c);
  LJTQ._isNew = isNew;
  if(typeof render === 'function') render();
}
function ljRestart(){ LJTQ = null; openLongque(); }
function ljToTitle(){
  LJTQ = null;
  if(typeof state !== 'undefined' && state){
    state.phase = 'title';
    if(typeof render === 'function') render();
  }
}
function ljOpenCodex(){
  if(typeof state !== 'undefined' && state) state.phase = 'longque';
  LJTQ = { phase:'codex' };
  if(typeof render === 'function') render();
}

/* ===================== 渲染 ===================== */
function renderLongque(app){
  if(!app || typeof document === 'undefined') return;
  if(!LJTQ) LJTQ = { phase:'origin' };
  if(LJTQ.phase==='codex'){ app.innerHTML = ljHtmlCodex(); return; }
  if(LJTQ.phase==='origin'){ app.innerHTML = ljHtmlOrigin(); return; }
  if(LJTQ.phase==='end'){ app.innerHTML = ljHtmlEnd(); return; }
  app.innerHTML = ljHtmlPlay();
}
function ljHtmlHead(){
  return '<div class="ljtq-head">'
    + '<h1>笼 中 雀</h1>'
    + '<div class="sub">很多年后，他给本命飞剑取名「笼中雀」。<br>那年他还在骊珠洞天，还是泥瓶巷里担水的少年。</div>'
    + '<div class="era">卷一 · 场面链 · 无好感条</div>'
    + '</div>';
}
function ljCageBar(s){
  const total = 24;
  const step = Math.min(total, (s && s.steps) || 0);
  let bars = '';
  for(let i=0;i<total;i++){
    const open = i < step;
    const x = (i+0.5)/total*100;
    bars += '<i class="'+(open?'open':'')+'" style="left:'+x+'%"></i>';
  }
  return '<div class="ljtq-cage" title="笼条：章节推进时一根根松开">'+bars+'</div>';
}
function ljHtmlBag(s, title){
  if(!s || !s.deeds || !s.deeds.length) return '';
  let h = '<div class="ljtq-bag"><h3>'+(title||'行 囊 · 做过的事')+'</h3><div class="ljtq-chips">';
  s.deeds.forEach(k => {
    const d = LJTQ_DEEDS[k];
    if(!d) return;
    h += '<span class="ljtq-chip '+(d.path||'')+'">'+d.t+'</span>';
  });
  h += '</div></div>';
  return h;
}
function ljHtmlPath(s){
  if(!s || !s.path) return '';
  const lean = ljLean(s);
  return '<div class="ljtq-path">此行落笔 · 理 '+s.path.li+' · 情 '+s.path.qing+' · 剑 '+s.path.jian
    + (lean ? '　更近 <b>'+lean+'</b>' : '') + '</div>';
}
function ljHtmlOrigin(){
  let h = '<div class="ljtq">' + ljHtmlHead();
  h += '<p class="ljtq-lead">这座洞天像一只笼子。<br>你还小，还不知道笼子有多大——只知道心里好像有什么东西，想飞。</p>';
  h += '<div class="ljtq-ch">择 来 路</div><div class="ljtq-origin">';
  LJTQ_ORIGINS.forEach(o => {
    h += '<div class="oi" onclick="ljStartOrigin(\''+o.k+'\')">'
      + '<h4>'+o.mark+' · '+o.t+'</h4><p>'+o.d+'</p></div>';
  });
  h += '</div><div class="ljtq-btns">'
    + '<button class="btn ghost" onclick="ljOpenCodex()">结局图鉴</button>'
    + '<button class="btn ghost" onclick="ljToTitle()">返回卷首</button></div></div>';
  return h;
}
function ljHtmlPlay(){
  const s = LJTQ;
  const node = LJTQ_NODES[s.node];
  if(!node) return '<div class="ljtq">'+ljHtmlHead()+'<p style="text-align:center">节点缺失</p></div>';
  let h = '<div class="ljtq">' + ljHtmlHead() + ljCageBar(s) + ljHtmlPath(s) + ljHtmlBag(s);
  h += '<div class="ljtq-ch">'+node.ch+'</div>';
  h += '<h2 class="ljtq-t">'+node.t+'</h2>';
  h += '<div class="ljtq-d">'+node.d+'</div>';
  if(s.lastIl){
    h += '<div class="ljtq-il"><div class="il-t">巷中插曲 · '+s.lastIl.t+'</div>'+s.lastIl.d+'</div>';
  }
  h += '<div class="ljtq-opts">';
  (node.ch2||[]).forEach((o,i) => {
    const deedTxt = (LJTQ_DEEDS[o.deed]||{}).t || '';
    const deed2Txt = (LJTQ_DEEDS[o.deed2]||{}).t || '';
    const bagTxt = [deedTxt, deed2Txt].filter(Boolean).join(' / ');
    const pw = o.path ? '<div class="ow '+o.path+'">落笔 · '+(LJTQ_PATHS[o.path]||{}).n + (bagTxt ? '　行囊：'+bagTxt : '') + '</div>' : '';
    h += '<div class="ljtq-opt" onclick="ljChoose('+i+')">'
      + '<div class="ot">'+o.txt+'</div>'
      + (o.note ? '<div class="on">'+o.note+'</div>' : '')
      + pw + '</div>';
  });
  h += '</div><div class="ljtq-btns">'
    + '<button class="btn ghost" onclick="ljRestart()">重来</button>'
    + '<button class="btn ghost" onclick="ljToTitle()">返回卷首</button></div></div>';
  return h;
}
function ljHtmlEnd(){
  const s = LJTQ;
  const e = LJTQ_ENDINGS[s.ending] || LJTQ_ENDINGS.danshui;
  let h = '<div class="ljtq">' + ljHtmlHead() + '<div class="ljtq-end">';
  h += '<div class="ljtq-eico">'+ljtqIco(s.ending)+'</div>';
  h += '<div class="g">'+e.g+'</div>';
  h += '<h2 class="gt">'+e.t+'</h2>';
  h += '<div class="gd">'+e.d+'</div>';
  h += '<div class="gp">'+(e.poem||'')+'</div>';
  if(s._isNew) h += '<div style="font-size:12px;color:#7fc79a;letter-spacing:2px;margin-bottom:12px">新结局已收入图鉴</div>';
  h += ljHtmlPath(s);
  h += ljHtmlBag(s, '出笼时的行囊');
  h += '<div class="ljtq-btns">'
    + '<button class="btn primary" onclick="ljRestart()">再走一遭</button>'
    + '<button class="btn ghost" onclick="ljOpenCodex()">结局图鉴</button>'
    + '<button class="btn ghost" onclick="ljToTitle()">返回卷首</button></div></div>';
  if(s.trail && s.trail.length){
    h += '<div class="ljtq-trail"><h3>这一路</h3>';
    s.trail.forEach(t => {
      h += '<div class="tr"><b>'+t.t+'</b>'+(t.note?' — '+t.note:'')+'</div>';
    });
    h += '</div>';
  }
  h += '</div>';
  return h;
}
function ljHtmlCodex(){
  const c = ljLoadCodex();
  const keys = Object.keys(LJTQ_ENDINGS);
  const got = keys.filter(k => c.endings[k]);
  const lost = keys.filter(k => !c.endings[k]);
  const rank = { S:0,A:1,B:2,C:3,D:4 };
  got.sort((a,b)=>(rank[LJTQ_ENDINGS[a].g]||9)-(rank[LJTQ_ENDINGS[b].g]||9));
  let h = '<div class="ljtq">'+ljHtmlHead()
    + '<p class="ljtq-lead">结 局 图 鉴　已至 '+got.length+' / '+keys.length+' · 共 '+((c.runs)||0)+' 遭</p>';
  if(got.length){
    h += '<div class="ljtq-cx">';
    got.forEach(k => {
      const e = LJTQ_ENDINGS[k];
      h += '<div class="ljtq-cx-card got">'
        + '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
        + '<div style="width:40px;height:40px;flex:none">'+ljtqIco(k)+'</div>'
        + '<div class="tt" style="margin:0">'+e.g+' · '+e.t+'</div></div>'
        + '<div class="dd">'+(e.d||'').slice(0,56)+'…</div>'
        + '<div class="ct">走过 '+c.endings[k]+' 次</div></div>';
    });
    h += '</div>';
  } else {
    h += '<p style="text-align:center;color:#7f7a6c;padding:28px 0;letter-spacing:2px">还没走出泥瓶巷。</p>';
  }
  if(lost.length){
    h += '<div class="ljtq-cx">';
    lost.forEach(()=>{ h += '<div class="ljtq-cx-card lock"><div class="tt">？？？</div><div class="dd">未至</div></div>'; });
    h += '</div>';
  }
  h += '<div class="ljtq-btns">'
    + '<button class="btn primary" onclick="ljRestart()">开始</button>'
    + '<button class="btn ghost" onclick="ljToTitle()">返回卷首</button></div></div>';
  return h;
}
function ljRenderFallback(){
  const app = typeof document !== 'undefined' && document.getElementById('app');
  if(app) renderLongque(app);
}

if(typeof module !== 'undefined' && module.exports){
  module.exports = {
    LJTQ_NODES, LJTQ_ENDINGS, LJTQ_ORIGINS, LJTQ_INTERLUDES, LJTQ_DEEDS, LJTQ_PATHS, LJTQ_END_ICO,
    ljNewState, ljRouteEnding, ljAddPath, ljAddDeed, ljLean,
  };
}
