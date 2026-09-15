'use strict';

/* ===================== 数据 ===================== */
const FACTIONS = {
  '剑气长城': '#c0392b',
  '中土文庙': '#2980b9',
  '蛮荒天下': '#8e44ad',
  '青冥天下': '#16a085',
  '莲花天下': '#d4a017',
  '散修': '#7f8c8d',
};
// 宿敌：选人时优先撮合的对立面
const HOSTILE = {
  '剑气长城':'蛮荒天下', '中土文庙':'蛮荒天下', '青冥天下':'蛮荒天下',
  '莲花天下':'蛮荒天下', '蛮荒天下':'剑气长城', '散修':'蛮荒天下',
};

/* 人物志次序：阵营显序 + 阵营内置顶核心（贴合原著辈分/地位）。
   仅定「头部」，未列者按原插入序，避免误排。 */
const FAC_ORDER = ['中土文庙','剑气长城','青冥天下','莲花天下','蛮荒天下','散修'];
const FAC_HEAD = {
  '中土文庙': ['至圣先师','礼圣','亚圣','老秀才','齐静春'],
  '剑气长城': ['陈清都','持剑者'],
  '青冥天下': ['道祖'],
  '莲花天下': ['佛祖'],
  '蛮荒天下': ['周密','托月山大祖'],
  '散修':     ['陈平安'],
};
function codexSort(keys){
  const ins = {}; Object.keys(CHARS).forEach((k,i)=>{ if(ins[k]==null) ins[k]=i; });
  return keys.slice().sort((a,b)=>{
    const fa = FAC_ORDER.indexOf(CHARS[a].faction), fb = FAC_ORDER.indexOf(CHARS[b].faction);
    if(fa!==fb) return fa-fb;
    const ha = FAC_HEAD[CHARS[a].faction], hb = FAC_HEAD[CHARS[b].faction];
    const ia = ha?ha.indexOf(CHARS[a].name):-1, ib = hb?hb.indexOf(CHARS[b].name):-1;
    if(ia!==ib) return (ia<0?999:ia)-(ib<0?999:ib);
    return (ins[a]==null?0:ins[a])-(ins[b]==null?0:ins[b]);
  });
}

const CHARS = {
  chenpingan:  { name:'陈平安', faction:'散修', hp:4, realm:'止境', skills:['守拙','问心','攒劲'], flagship:true,
    txt:'【守拙】成为「剑气」目标时，可弃一张牌视为打出「守心」；【问心】每回合首次造成伤害后，可令目标「讲道理」，你方道理大则目标弃一牌；【攒劲】每使用第三张「丹药」，永久 +1 手牌上限' },
  caoci:       { name:'曹慈', faction:'散修', hp:5, realm:'止境', skills:['慈','武'], flagship:true,
    txt:'【慈】你受到伤害时反弹 1 点给来源（每回合限一次）；【武】近战「剑气」伤害 +1' },
  ningyao:     { name:'宁姚', faction:'剑气长城', hp:3, realm:'止境', skills:['剑心','镇蛮'], flagship:true,
    txt:'【剑心】你打出的「剑气」不可被「守心」抵消（仍可被装备/神通抵）；【镇蛮】你对蛮荒天下角色伤害 +1' },
  aliang:      { name:'阿良', faction:'剑气长城', hp:4, realm:'飞升', skills:['问剑','无忧'], flagship:true,
    txt:'【问剑】出牌阶段指定一名角色，其直到回合结束不能使用「守心」；【无忧】受伤害时展示手牌，若全为「剑气」则免伤并摸一' },
  miyu:        { name:'米裕', faction:'剑气长城', hp:3, realm:'玉璞境', skills:['米','杀力'], flagship:true,
    txt:'【米】你的「剑气」基础伤害视为 2；【杀力】你对蛮荒天下角色伤害再 +1' },
  chenqingdu:  { name:'陈清都', faction:'剑气长城', hp:4, realm:'飞升', skills:['一剑','长城'], flagship:true,
    txt:'【一剑】出牌阶段弃所有手牌，对一名角色造 X 伤（X=弃牌数且≥其气血一半），每局限一次；【长城】非剑气长城角色须先击败另一名剑气长城角色，才能以你为攻击目标' },
  baiye:       { name:'白也', faction:'剑气长城', hp:3, realm:'十四境·合道', skills:['诗剑','青衫'], flagship:true,
    txt:'【诗剑】每打出一张「锦囊」，本回合剑气伤害 +1（可叠加）；【青衫】无视距离使用「剑气」' },
  qijingchun:  { name:'齐静春', faction:'中土文庙', hp:3, realm:'玉璞境', skills:['教化','护道'], flagship:true,
    txt:'【教化】回合结束给一名队友一张牌；若其为儒修额外摸一；【护道】一名阵营角色即将受伤时，你可弃一牌替其承 1 点' },
  lisan:       { name:'礼圣', faction:'中土文庙', hp:4, realm:'飞升', skills:['礼法','规矩'], flagship:true,
    txt:'【礼法】其他角色打出的第一张「锦囊」对你无效，除非其先对你「陈词」成功；【规矩】开局指定一条永久规矩（如"不得使用蛮荒入侵"），违反者受 1 伤' },
  zhoumi:      { name:'周密', faction:'蛮荒天下', hp:5, realm:'飞升', skills:['算计','化外'], flagship:true,
    txt:'【算计】出牌阶段获得一名角色一张手牌（每局限数次）；【化外】免疫第一次「讲道理」判定失败的效果' },
  baize:       { name:'白泽', faction:'蛮荒天下', hp:3, realm:'止境', skills:['通晓','旁观'], flagship:true,
    txt:'【通晓】你可知所有角色的大道属性；你的「讲道理」判定 +1；【旁观】你不能被选为「锦囊」目标，除非该锦囊指定所有角色' },
  daozu:       { name:'道祖', faction:'青冥天下', hp:4, realm:'飞升', skills:['道法自然','无为'], flagship:true,
    txt:'【道法自然】出牌阶段弃两张摸两张；若弃牌含「锦囊」额外摸一；【无为】回合外受到的第一次伤害 -1' },
  fozu:        { name:'佛祖', faction:'莲花天下', hp:4, realm:'飞升', skills:['因果','慈悲'], flagship:true,
    txt:'【因果】一名角色对你造成伤害时，你可将 1 点伤害反弹给伤害来源；【慈悲】你的「丹药」可同时回复两名角色各 1 气血' },
  '左右': { name:'左右', faction:'剑气长城', hp:3, realm:'飞升', skills:['出城','剑仙'], txt:'【出城】你对攻击范围外的角色造成伤害 +1；【剑仙】手牌上限 +1', talent:'锋芒' },
  '魏晋': { name:'魏晋', faction:'剑气长城', hp:3, realm:'止境', skills:['浩然','孤峰'], txt:'【浩然】场上有宁姚时，你的剑气伤害 +1；【孤峰】手牌上限 +2', talent:'锋芒' },
  '董三更': { name:'董三更', faction:'剑气长城', hp:3, realm:'止境', skills:['三更','夜'], txt:'【三更】每回合你打出的第 3 张「剑气」伤害 +1；【夜】回合外打出的「守心」视为 +1 次', talent:'锋芒' },
  '姚近之': { name:'姚近之', faction:'剑气长城', hp:3, realm:'止境', skills:['近之','柔剑'], txt:'【近之】场上有魏晋时，双方剑气伤害各 +1；【柔剑】一张「守心」可当「剑气」使用', talent:'锋芒' },
  '齐廷济': { name:'齐廷济', faction:'剑气长城', hp:3, realm:'止境', skills:['齐家剑','廷'], txt:'【齐家剑】出牌阶段限一次，额外打出一张「剑气」；【廷】你的判定点数 +1', talent:'锋芒' },
  '齐景龙': { name:'齐景龙', faction:'剑气长城', hp:4, realm:'止境', skills:['老剑','齐'], txt:'【老剑】你的「剑气」无视距离；【齐】齐姓角色受伤时可互相替受 1 点', talent:'锋芒' },
  '隋右边': { name:'隋右边', faction:'剑气长城', hp:3, realm:'止境', skills:['右边','隋'], txt:'【右边】受伤时可弃一张牌免 1 伤（每回合限一次）；【隋】与隋景澄互保，一方受伤另一方可替', talent:'锋芒' },
  // 本命飞剑「抱朴」「北斗」（原著，北斗主死）。旧写「芝兰/早逝」是按人物气质所拟、非飞剑名，已归位；机制与数值不变。
  '陆芝': { name:'陆芝', faction:'剑气长城', hp:3, realm:'止境', skills:['抱朴','北斗'], txt:'【抱朴】回合结束给一名队友一张牌；【北斗】你死亡时令一名队友摸两张', talent:'锋芒' },
  '持剑者': { name:'持剑者', faction:'剑气长城', hp:5, realm:'飞升', skills:['至高','剑源'], flagship:true, txt:'【至高】你免疫「论道」「讲道理」等言语类控制；【剑源】你的「剑气」伤害 +1，且无视「守心」抵消（可被装备/神通抵挡）' },
  '陈熙': { name:'陈熙', faction:'剑气长城', hp:3, realm:'止境', skills:['熙','城'], txt:'【熙】本命飞剑「祭炼」成长速度翻倍（每次祭炼攻击 +1）；【城】剑气命中后摸一', talent:'锋芒' },
  '萧𢙏': { name:'萧𢙏', faction:'剑气长城', hp:3, realm:'止境', skills:['𢙏'], txt:'【𢙏】「剑气」命中后，可立即再打出一张「剑气」（每回合限一次）', talent:'锋芒' },
  '老秀才': { name:'老秀才', faction:'中土文庙', hp:4, realm:'飞升', skills:['文','圣'], txt:'【文】全场儒修手牌上限 +1；【圣】游戏开始时每人获得一张牌', talent:'耕读' },
  '亚圣': { name:'亚圣', faction:'中土文庙', hp:4, realm:'止境', skills:['守礼','亚'], txt:'【守礼】每局限一次免疫一张「锦囊」；【亚】儒修技能效果 +1', talent:'耕读' },
  '至圣先师': { name:'至圣先师', faction:'中土文庙', hp:5, realm:'飞升', skills:['至圣','先师'], txt:'【至圣】每名儒修每回合限一次多摸一；【先师】你死亡时全场儒修回 1 气血', talent:'耕读' },
  '崔瀺': { name:'崔瀺', faction:'中土文庙', hp:4, realm:'飞升', skills:['算无遗策','国士无双'], txt:'【算无遗策】每回合限一次，观看一名角色两张手牌并交换其中一张；【国士无双】你每回合首次造成伤害时，可令一名同阵营角色摸一张牌', talent:'耕读' },
  '崔诚': { name:'崔诚', faction:'中土文庙', hp:4, realm:'飞升', skills:['传道','严教'], txt:'【传道】每回合限一次，可令一名同阵营角色视为使用一张基本牌；【严教】你对同阵营角色造成伤害时，可令其改为摸一张牌', talent:'耕读' },
  '崔东山': { name:'崔东山', faction:'中土文庙', hp:3, realm:'止境', skills:['观棋','分身'], txt:'【观棋】出牌阶段开始时可观看任意一名角色的手牌顶一张；【分身】你受到致命伤害时，可弃两张牌令伤害改为1', talent:'耕读' },
  '君倩': { name:'君倩', faction:'中土文庙', hp:3, realm:'止境', skills:['君子','倩'], txt:'【君子】出牌阶段可各打出一张「剑气」与一张「守心」；【倩】儒修对你的「剑气」伤害 -1', talent:'耕读' },
  '周澄': { name:'周澄', faction:'中土文庙', hp:3, realm:'止境', skills:['澄','文'], txt:'【澄】你的判定阶段可将判定牌替换为你的一张手牌；【文】锦囊点数 +1', talent:'耕读' },
  '李宝瓶': { name:'李宝瓶', faction:'中土文庙', hp:3, realm:'练气', skills:['宝瓶','问学'], txt:'【宝瓶】摸牌阶段多摸一；【问学】出牌阶段给一名队友一张牌（每回合限一次）', talent:'耕读' },
  '林守一': { name:'林守一', faction:'中土文庙', hp:3, realm:'止境', skills:['守一','算'], txt:'【守一】你的判定点数 +1；【算】一张「锦囊」可当「破阵」或「借物」使用', talent:'耕读' },
  '张山峰': { name:'张山峰', faction:'中土文庙', hp:4, realm:'止境', skills:['山峰','厚'], txt:'【山峰】每局限一次受到伤害 -1；【厚】你的手牌上限 +1', talent:'耕读' },
  '顾粲': { name:'顾璨', faction:'散修', hp:3, realm:'止境', skills:['棋子','蛊'], txt:'【棋子】弃一牌当「锦囊」指定一名角色下回合无法出「剑气」；【蛊】你受伤害时反弹 1 点给来源（每局限一次）', talent:'机缘' },
  '宋集薪': { name:'宋集薪', faction:'中土文庙', hp:3, realm:'止境', skills:['集薪','弃文'], txt:'【集薪】手牌上限 +2；【弃文】一张手牌可当任意「基本牌」使用', talent:'耕读' },
  '杨老头': { name:'杨老头', faction:'中土文庙', hp:4, realm:'飞升', skills:['棋','师'], txt:'【棋】任意角色的判定结算前，你可改其中一张判定牌；【师】陈平安在场时双方互保，各免 1 伤（每局限一次）', talent:'耕读' },
  '李槐': { name:'李槐', faction:'中土文庙', hp:3, realm:'练气', skills:['槐','问学'], txt:'【槐】摸牌阶段可弃一张牌，令一名队友本回合手牌上限 +1；【问学】出牌阶段给一名队友一张牌', talent:'耕读' },
  '刘重润': { name:'刘重润', faction:'蛮荒天下', hp:3, realm:'止境', skills:['龙女','润'], txt:'【龙女】每局限一次，受到致命伤时免伤并回 1；【润】出牌阶段给一名队友一张牌', talent:'嗜血' },
  '之祠': { name:'之祠', faction:'蛮荒天下', hp:4, realm:'止境', skills:['神祠','祠'], txt:'【神祠】你的回合结束回 1 气血（不超过上限）；【祠】一张「锦囊」可当「守心」使用', talent:'嗜血' },
  '斐然': { name:'斐然', faction:'蛮荒天下', hp:4, realm:'飞升', skills:['画','妖'], txt:'【画】弃两张牌，创造一张临时「锦囊」并立即结算；【妖】你对中土文庙角色伤害 +1', talent:'嗜血' },
  '老瞎子': { name:'老瞎子', faction:'蛮荒天下', hp:4, realm:'止境', skills:['盲','老'], txt:'【盲】你的「剑气」无视距离；【老】每局限一次受到伤害 -1', talent:'嗜血' },
  // 十四王座之首。原著又称「妖族大祖」「蛮荒大祖」，与旧条目 manhuangdazu 为同一人，已合并。
  '托月山': { name:'托月山大祖', faction:'蛮荒天下', hp:5, realm:'飞升', skills:['山','托月'], txt:'【山】气血上限视为 5；【托月】受伤时反弹 1 点给来源（每局限一次）', talent:'嗜血' },
  '纳兰烧苇': { name:'纳兰烧苇', faction:'蛮荒天下', hp:4, realm:'止境', skills:['烧苇','苇'], txt:'【烧苇】你的「剑气」附加 1 点火属性伤害；【苇】火伤对青冥天下额外 +1', talent:'嗜血' },
  '老聋儿': { name:'老聋儿', faction:'蛮荒天下', hp:4, realm:'止境', skills:['聋','儿'], txt:'【聋】免疫语言类「锦囊」（论道、陈词等）；【儿】手牌上限 +1', talent:'嗜血' },
  '仰止': { name:'仰止', faction:'蛮荒天下', hp:4, realm:'止境', skills:['仰','止'], txt:'【仰】你的攻击范围 +1；【止】被你攻击的角色下回合无法使用「守心」', talent:'嗜血' },
  '龙君': { name:'龙君', faction:'蛮荒天下', hp:5, realm:'飞升', skills:['龙君','君'], txt:'【龙君】全场蛮荒天下角色造成的伤害 +1；【君】你死亡时全体蛮荒角色各摸两张', talent:'嗜血' },
  '搬山猿': { name:'搬山猿', faction:'蛮荒天下', hp:4, realm:'止境', skills:['搬山','猿'], txt:'【搬山】你的「剑气」伤害 +1，但不可指定气血 1 的角色；【猿】每局限一次，受到致命伤时免伤', talent:'嗜血' },

  /* 蛮荒天下·旧十四王座补全（依百度百科「十四王座」、中文百科全书同名词条）
     完整名录：托月山大祖·周密·刘叉·袁首·仰止·绯妃·黄鸾·牛刀·五嶽·白莹·曜甲·切韵·龙君·荷花庵主
     其中 托月山大祖 / 周密 / 龙君 / 仰止 已在上方，此处补齐其余十席。 */
  '刘叉': { name:'刘叉', faction:'蛮荒天下', hp:4, realm:'飞升', skills:['问剑','佩刀'], txt:'【问剑】出牌阶段指定一名角色，其直到回合结束不能使用「守心」；【佩刀】你的「剑气」命中后摸一', talent:'嗜血' },
  '袁首': { name:'袁首', faction:'蛮荒天下', hp:4, realm:'飞升', skills:['搬山','石珠'], txt:'【搬山】你的「剑气」伤害 +1；【石珠】每局限一次，受到致命伤时免伤', talent:'嗜血' },
  '五嶽': { name:'五嶽', faction:'蛮荒天下', hp:5, realm:'飞升', skills:['六臂','神到'], txt:'【六臂】出牌阶段限一次，额外打出一张「剑气」；【神到】你每回合受到的第一次伤害 -1', talent:'嗜血' },
  '牛刀': { name:'牛刀', faction:'蛮荒天下', hp:4, realm:'飞升', skills:['金甲','蛮牛'], txt:'【金甲】你每回合受到的第一次伤害 -1（金甲亦是牢狱）；【蛮牛】你的「剑气」伤害 +1', talent:'嗜血' },
  '白莹': { name:'白莹', faction:'蛮荒天下', hp:4, realm:'飞升', skills:['枯骨','傀儡'], txt:'【枯骨】你死亡时令一名蛮荒天下队友摸一张；【傀儡】手牌上限 +1', talent:'嗜血' },
  '绯妃': { name:'绯妃', faction:'蛮荒天下', hp:3, realm:'飞升', skills:['水运','蛇蜕'], txt:'【水运】你的回合结束回 1 气血（不超过上限）；【蛇蜕】每局限一次受到伤害 -1', talent:'嗜血' },
  '曜甲': { name:'曜甲', faction:'蛮荒天下', hp:3, realm:'飞升', skills:['金精','倒悬'], txt:'【金精】你的装备牌效果对所有角色 +1；【倒悬】每局限一次受到伤害 -1', talent:'嗜血' },
  '切韵': { name:'切韵', faction:'蛮荒天下', hp:4, realm:'飞升', skills:['养剑葫','面皮'], txt:'【养剑葫】「剑气」命中后，可立即再打出一张「剑气」（每回合限一次）；【面皮】免疫语言类「锦囊」（论道、陈词等）', talent:'嗜血' },
  '黄鸾': { name:'黄鸾', faction:'蛮荒天下', hp:3, realm:'飞升', skills:['洞府','鸾翼'], txt:'【洞府】你的装备牌效果对所有角色 +1；【鸾翼】你的攻击范围 +1', talent:'嗜血' },
  '荷花庵主': { name:'荷花庵主', faction:'蛮荒天下', hp:4, realm:'飞升', skills:['月魄','庵主'], txt:'【月魄】你的回合结束回 1 气血（不超过上限）；【庵主】你的判定点数 +1', talent:'嗜血' },
  '余斗': { name:'余斗', faction:'青冥天下', hp:3, realm:'止境', skills:['斗转','星移'], txt:'【斗转】你打出的「锦囊」结算后可回收手牌；【星移】你与其他角色距离 -1（攻击范围 +1）', talent:'无为' },
  '陆沉': { name:'陆沉', faction:'青冥天下', hp:3, realm:'止境', skills:['一气化三清','沉静'], txt:'【一气化三清】限定技：获得攻/守/变三枚标记，每回合激活一枚（攻：本回合剑气+1；守：免1伤；变：弃牌摸牌）；【沉静】一张「闪」可当「守心」或「剑气」', talent:'无为' },
  '玉圭': { name:'玉圭', faction:'青冥天下', hp:4, realm:'止境', skills:['玉圭','清'], txt:'【玉圭】你的装备牌效果对所有角色 +1；【清】你的判定点数 +1', talent:'无为' },
  '阮秀': { name:'阮秀', faction:'散修', hp:3, realm:'止境', skills:['炼器','火属'], txt:'【炼器】出牌阶段消耗两张牌铸一把临时「本命飞剑」（攻击 +1，可成长）；【火属】你的「剑气」对蛮荒角色额外造成 1 点火伤', talent:'机缘' },
  '火龙真人': { name:'火龙真人', faction:'散修', hp:4, realm:'止境', skills:['铸剑','火德'], txt:'【铸剑】开局获得专属「本命飞剑·火龙」；【火德】你的装备牌效果对所有角色 +1', talent:'机缘' },
  '裴钱': { name:'裴钱', faction:'散修', hp:3, realm:'练气', skills:['钱','学徒'], txt:'【钱】摸牌阶段多摸一（机灵）；【学徒】陈平安在场时你的剑气伤害 +1', talent:'机缘' },
  '刘羡阳': { name:'刘羡阳', faction:'散修', hp:4, realm:'止境', skills:['炼','阳'], txt:'【炼】出牌阶段铸一把装备（攻击 +1）；【阳】每局限一次受伤 -1', talent:'机缘' },
  '李二': { name:'李二', faction:'散修', hp:4, realm:'止境', skills:['武夫','二'], txt:'【武夫】你的「剑气」视为近战武力，不可被「守心」抵消，伤害 +1；【二】受伤害 -1（每局限一次）', talent:'机缘' },
  '李柳': { name:'李柳', faction:'散修', hp:3, realm:'止境', skills:['柳','柔'], txt:'【柳】每局限一次完全免伤；【柔】一张「守心」可当「剑气」', talent:'机缘' },
  '朱敛': { name:'朱敛', faction:'散修', hp:4, realm:'止境', skills:['敛','管家'], txt:'【敛】你的手牌不向其他角色暴露，且可暗藏一张牌；【管家】出牌阶段给队友一张牌', talent:'机缘' },
  '姜尚真': { name:'姜尚真', faction:'散修', hp:3, realm:'止境', skills:['尚真','真'], txt:'【尚真】出牌阶段弃一牌摸一（交易）；【真】你的装备牌消耗 -1', talent:'机缘' },
  '姜赦': { name:'姜赦', faction:'散修', hp:3, realm:'止境', skills:['赦'], txt:'【赦】每回合限一次，获得一名角色一张手牌（赦令）', talent:'机缘' },
  '南簪': { name:'南簪', faction:'散修', hp:3, realm:'止境', skills:['簪','南'], txt:'【簪】你的判定点数 +1；【南】手牌上限 +1', talent:'机缘' },
  '卢白象': { name:'卢白象', faction:'散修', hp:4, realm:'止境', skills:['白象','卢'], txt:'【白象】每局限一次受伤 -1；【卢】攻击范围 +1', talent:'机缘' },
  '刘灞桥': { name:'刘灞桥', faction:'散修', hp:3, realm:'止境', skills:['灞桥'], txt:'【灞桥】出牌阶段可额外打出一张「基本牌」', talent:'机缘' },
  '谢松花': { name:'谢松花', faction:'散修', hp:3, realm:'止境', skills:['松花','谢'], txt:'【松花】「剑气」命中后摸一；【谢】守心 +1', talent:'机缘' },
  '谢狗': { name:'谢狗', faction:'散修', hp:3, realm:'止境', skills:['狗'], txt:'【狗】受伤时若手牌有「守心」则免 1 伤（每回合限一次）', talent:'机缘' },
  '贺小凉': { name:'贺小凉', faction:'散修', hp:3, realm:'止境', skills:['小凉'], txt:'【小凉】你的判定牌可重掷一次', talent:'机缘' },
  '赊月': { name:'赊月', faction:'散修', hp:3, realm:'止境', skills:['赊'], txt:'【赊】出牌阶段获得一名角色一张牌，下回合须还回（否则受 1 伤）', talent:'机缘' },
  '郑居中': { name:'郑居中', faction:'散修', hp:3, realm:'止境', skills:['居中','郑'], txt:'【居中】手牌上限 +1；【郑】判定 +1', talent:'机缘' },
  '郭竹酒': { name:'郭竹酒', faction:'散修', hp:3, realm:'止境', skills:['竹酒','郭'], txt:'【竹酒】「问剑（酒）」效果 +1；【郭】出牌阶段可弃一牌回 1 气血', talent:'机缘' },
  '长命': { name:'长命', faction:'散修', hp:3, realm:'止境', skills:['长命'], txt:'【长命】你的「桃」回复 +1（回 2）', talent:'机缘' },
  '徐远霞': { name:'徐远霞', faction:'散修', hp:3, realm:'止境', skills:['远霞','徐'], txt:'【远霞】攻击范围 +1；【徐】', talent:'机缘' },
  '小陌': { name:'小陌', faction:'散修', hp:3, realm:'练气', skills:['陌'], txt:'【陌】出牌阶段给一名队友一张牌（每回合限一次）', talent:'机缘' },
  '苏稼': { name:'苏稼', faction:'散修', hp:3, realm:'止境', skills:['稼'], txt:'【稼】摸牌阶段多摸一', talent:'机缘' },
  '裴杯': { name:'裴杯', faction:'散修', hp:3, realm:'止境', skills:['杯'], txt:'【杯】出牌阶段弃一牌令一名角色摸一（敬酒）', talent:'机缘' },
  '陈景清': { name:'陈景清', faction:'散修', hp:3, realm:'止境', skills:['景清'], txt:'【景清】每回合首张「锦囊」不计入次数', talent:'机缘' },
  '陈暖树': { name:'陈暖树', faction:'散修', hp:3, realm:'练气', skills:['暖树'], txt:'【暖树】出牌阶段给陈平安一张牌', talent:'机缘' },
  '隋景澄': { name:'隋景澄', faction:'散修', hp:3, realm:'止境', skills:['景澄','隋'], txt:'【景澄】与隋右边互保，一方受伤另一方可替；【隋】', talent:'机缘' },
  '魏檗': { name:'魏檗', faction:'散修', hp:4, realm:'止境', skills:['山君','檗'], txt:'【山君】出牌阶段指定一名角色，其下回合摸牌阶段少摸一（地形压制）；【檗】受伤害 -1（每局限一次）', talent:'机缘' },
  '魏羡': { name:'魏羡', faction:'散修', hp:3, realm:'止境', skills:['羡'], txt:'【羡】每回合限一次获得一名角色一张手牌', talent:'机缘' },
  '黄庭': { name:'黄庭', faction:'散修', hp:3, realm:'止境', skills:['黄庭'], txt:'【黄庭】你的装备不可被「破阵」弃置', talent:'机缘' },
  '周海镜': { name:'周海镜', faction:'散修', hp:3, realm:'止境', skills:['海镜'], txt:'【海镜】出牌阶段查看一名角色的手牌', talent:'机缘' },
  '周米粒': { name:'周米粒', faction:'散修', hp:2, realm:'练气', skills:['米粒'], txt:'【米粒】每回合限一次随机「机缘」摸一（随机基本/锦囊）', talent:'机缘' },
  '石柔': { name:'石柔', faction:'散修', hp:3, realm:'练气', skills:['蜕','窥'], txt:'【蜕】你受到的伤害 -1（每局限一次，仙人遗蜕替人挡灾）；【窥】你的判定 +1（那双被人借过的眼睛，看得比旁人清楚些）', talent:'机缘' },
  '稚圭': { name:'稚圭', faction:'散修', hp:3, realm:'止境', skills:['稚圭'], txt:'【稚圭】每局限一次完全免伤', talent:'机缘' },
  '宋雨烧': { name:'宋雨烧', faction:'散修', hp:3, realm:'止境', skills:['雨烧'], txt:'【雨烧】你的「剑气」火伤 +1', talent:'机缘' },
  '沛湘': { name:'沛湘', faction:'散修', hp:3, realm:'止境', skills:['沛','湘'], txt:'【沛】一张「守心」可当两张用（水柔）；【湘】', talent:'机缘' },
  '柳柔': { name:'柳柔', faction:'散修', hp:3, realm:'止境', skills:['柔'], txt:'【柔】一张「守心」可当「剑气」使用', talent:'机缘' },
  '陆台': { name:'陆台', faction:'散修', hp:3, realm:'止境', skills:['陆台'], txt:'【陆台】每回合限一次受伤反弹 1 点', talent:'机缘' },
  '马苦玄': { name:'马苦玄', faction:'散修', hp:3, realm:'止境', skills:['苦玄','玄'], txt:'【苦玄】你的「讲道理」判定 +1；【玄】对陈平安造成的伤害 +1', talent:'机缘' },
  '于玄': { name:'于玄', faction:'散修', hp:3, realm:'止境', skills:['于玄'], txt:'【于玄】出牌阶段弃两张摸两张（循环）', talent:'机缘' },
  '吴霜降': { name:'吴霜降', faction:'散修', hp:3, realm:'止境', skills:['霜降'], txt:'【霜降】「剑气」命中后，目标下回合出牌阶段少出一张牌（冻结）', talent:'机缘' },
  '苏心斋': { name:'苏心斋', faction:'散修', hp:3, realm:'止境', skills:['心斋'], txt:'【心斋】一张「守心」视为 +1 次', talent:'机缘' },
  '郦彩': { name:'郦彩', faction:'散修', hp:3, realm:'止境', skills:['郦彩'], txt:'【郦彩】摸牌阶段多摸一', talent:'机缘' },

  // 新增：原著真实人物补全
  '李希圣': { name:'李希圣', faction:'中土文庙', hp:3, realm:'止境', skills:['希圣','兄'], txt:'【希圣】儒修队友手牌上限 +1；【兄】李宝瓶在场时，你可替她承受 1 点伤害', talent:'耕读' },
  '赵繇': { name:'赵繇', faction:'中土文庙', hp:3, realm:'止境', skills:['繇印','静春'], txt:'【繇印】你的判定牌点数 +2；【静春】你死亡时，可令一名儒修队友摸两张牌', talent:'耕读' },
  '宋长镜': { name:'宋长镜', faction:'中土文庙', hp:5, realm:'止境', skills:['长镜','武运'], txt:'【长镜】你受到伤害时，可弃一张牌令伤害 -1；【武运】你的「剑气」伤害 +1', talent:'耕读' },
  '阮邛': { name:'阮邛', faction:'散修', hp:4, realm:'止境', skills:['铸剑','护女'], txt:'【铸剑】出牌阶段可弃两张牌，铸造一把临时「本命飞剑」（攻击 +1，可成长）；【护女】阮秀在场时，你的装备牌效果 +1', talent:'机缘' },
  '蔡金简': { name:'蔡金简', faction:'散修', hp:3, realm:'止境', skills:['断桥','金简'], txt:'【断桥】你对陈平安造成伤害时，该伤害 +1；【金简】你的「剑气」可令目标本回合无法使用「守心」', talent:'机缘' },
  '董水井': { name:'董水井', faction:'散修', hp:3, realm:'练气', skills:['井','商'], txt:'【井】摸牌阶段可观看牌堆顶一张牌并选择是否置于牌堆底；【商】出牌阶段可与一名角色交换一张手牌', talent:'机缘' },
  'mihu': { name:'米祜', faction:'剑气长城', hp:3, realm:'止境', skills:['守门','米家'], txt:'【守门】镇守剑气长城城门，米家剑专破妖族；【米家】同米裕一脉，对蛮荒天下角色剑气伤害 +1', talent:'锋芒' },
  'nalanyexing': { name:'纳兰夜行', faction:'剑气长城', hp:3, realm:'止境', skills:['夜行','纳兰'], txt:'【夜行】夜战剑势连绵，一剑既出常再递一剑；【纳兰】纳兰家剑修，追击凌厉', talent:'锋芒' },
  'longhushan': { name:'龙虎山老天师', faction:'青冥天下', hp:4, realm:'飞升', skills:['天师','斩龙'], txt:'【天师】执掌龙虎山道门祖庭道统；【斩龙】正阳山便由其门下分出，同源而道争' },
  'liulaocheng': { name:'刘老成', faction:'散修', hp:3, realm:'止境', skills:['书简湖','老成'], txt:'【书简湖】书简湖一脉老辈，胸有丘壑；【老成】久历世事，判定点数 +1', talent:'机缘' },

  // 新增：原著真实人物补全（第二批）
  xunyuan:      { name:'荀渊', faction:'散修', hp:3, realm:'飞升境', skills:['一尺枪','余家贫'], txt:'【一尺枪】你的「剑气」伤害 +1（一尺枪，一寸短一寸险）；【余家贫】每回合限一次，受到伤害 -1', talent:'锋芒' },
  xieshi:       { name:'谢时', faction:'中土文庙', hp:3, realm:'止境', skills:['君子','礼剑'], txt:'【君子】你的「剑气」不可被「守心」抵消（仍可被装备/神通抵）；【礼剑】出牌阶段限一次额外打出一张「剑气」', talent:'耕读' },
  laojiao:      { name:'老蛟', faction:'蛮荒天下', hp:4, realm:'止境', skills:['古','执拗'], txt:'【古】你的判定点数 +1；【执拗】每局限一次受到伤害 -1', talent:'嗜血' },
  xianzhu:      { name:'仙珠', faction:'散修', hp:3, realm:'练气', skills:['邻','暖'], txt:'【邻】出牌阶段给一名队友一张牌（每回合限一次）；【暖】陈平安在场时你手牌上限 +1', talent:'机缘' },
  liujinglong:  { name:'刘景龙', faction:'剑气长城', hp:4, realm:'飞升境', skills:['规矩','守序'], txt:'【规矩】你的「剑气」无视距离；【守序】一名剑气长城队友受伤时，你可替其承 1 点', talent:'锋芒' },
  // 勘误：于樾本命飞剑为「惊鸟」「百花」（原著第792章明载），原挂的「北斗」「抱朴」实为陆芝之剑。
  // 原著：流霞洲老剑修（老玉璞），皑皑洲密云谢氏首席客卿、落魄山记名供奉（化名于倒悬）；非剑气长城出身，仅金丹境游历三年。
  yuyue:        { name:'于樾', faction:'散修', hp:3, realm:'玉璞境', skills:['惊鸟','百花'], txt:'【惊鸟】以风驰电掣著称，你的攻击范围 +1；【百花】出牌阶段限一次，额外打出一张「剑气」', talent:'锋芒' },

  '曹晴朗': { name:'曹晴朗', faction:'散修', hp:3, realm:'金丹境', skills:['三元','读书'], txt:'【三元】摸牌阶段多摸一（南苑国科举连中三元、大骊科举榜眼，厚积薄发）；【读书】判定 +1（文圣一脉真正的读书种子）' },
  '赵树下': { name:'赵树下', faction:'散修', hp:4, realm:'五境武夫', skills:['百万拳','走桩'], txt:'【百万拳】你打出的「剑气」伤害 +1（两百万次基础拳法打下的底子）；【走桩】摸牌阶段多摸一（六步走桩，走满十万遍）' },
  '宁吉':   { name:'宁吉', faction:'散修', hp:3, realm:'练气', skills:['道胎','开卷'], txt:'【道胎】摸牌阶段多摸一（天生道胎，只要想学，机缘就走到跟前）；【开卷】判定 +1（陆沉赠印「开卷有益」）' },
  '邓剑枰': { name:'邓剑枰', faction:'散修', hp:3, realm:'金丹境', skills:['开山','文脉'], txt:'【开山】你打出的「剑气」伤害 +1（回随驾城收那一对孩子为开山弟子与关门弟子）；【文脉】判定 +1（金丹剑修，却极契合文脉）' },
  '袁黄':   { name:'袁黄', faction:'散修', hp:4, realm:'金身境', skills:['金身','诚拳'], txt:'【金身】你受到伤害 -1（金身境武夫）；【诚拳】你打出的「剑气」伤害 +1（学拳之心诚挚，打破了师父不再收徒的规矩）' },
  '郑大风': { name:'郑大风', faction:'散修', hp:5, realm:'山巅境', skills:['守门','大霜'], txt:'【守门】你受到伤害 -1（落魄山首任看门人，曾是浩然天下最强八境武夫）；【大霜】摸牌阶段多摸一（前身东天门守卫神将，披一身大霜宝甲）' },
  '韦文龙': { name:'韦文龙', faction:'散修', hp:3, realm:'金丹境', skills:['术算','泉府'], txt:'【术算】摸牌阶段多摸一（术算天才）；【泉府】手牌上限 +1（执掌落魄山泉府，管着山上的钱袋子）' },

};

/* ===================== 境界体系（依《剑来》原著） =====================
   数据来源：百度百科「剑来2之游学风云·修行境界」、搜狗百科「剑来·修行等级」、
   快懂百科「剑来·武夫境界」。三者对练气士十五境、武夫十一境的记载一致。

   要点：
   · 练气士十五境 = 下五境（登山五境）+ 中五境 + 上五境 + 失传二境。
   · 纯粹武夫十一境 = 炼体三境 + 炼气三境 + 炼神三境 + 止境（气盛/归真/神到）+ 武神。
   · 剑修**没有独立境界**，修为按练气士十五境计；玉璞境起方称「剑仙」，
     且同境战力普遍高于普通练气士（故剑修 tier +1，见 realmTier）。
   · 妖族、神灵亦按练气士十五境对标。
   · 旧代码把「止境」当作通用境界（84 人挂此境）是错的，已废弃。
=================================================================== */

const REALMS = {
  lianqi: {
    key:'lianqi', name:'练气士', n:15,
    lead:'借天地灵气修行，共十五境，分下五境、中五境、上五境，另有失传二境。',
    groups:[
      { g:'下五境 · 登山五境', lead:'牵引天地元气，浇筑砥砺皮肉筋骨血，尚在山下。', list:[
        { i:1, n:'铜皮境', d:'侧重载皮。大成时激发真气，皮肤呈紫铜色，寻常刀剑难伤。' },
        { i:2, n:'草根境', d:'侧重载肉。「斩草不除根，春风吹又生」，大成者血肉恢复能力出众。' },
        { i:3, n:'柳筋境', d:'侧重载筋。昔有柳姓修士单凭炼筋直入上五境，空前绝后，故以柳筋命名；又因众多修士久滞此境，又名「留人境」。' },
        { i:4, n:'骨气境', d:'侧重载骨。源出前辈修士「造就千金重骨，方有一两气」之说。儒家修士养浩然正气，在此境得天独厚。' },
        { i:5, n:'铸炉境', d:'或称筑庐境。「人生天地间，体魄为熔炉」，肉身成炉可储灵气，一只脚踏入修行门槛。佛道两家在此境优势最大。' }
      ]},
      { g:'中五境', lead:'开窍纳气，登山入流。每境分上中下三重楼，修士可称地仙。', list:[
        { i:6, n:'洞府境', d:'人身三百六十五窍穴，犹如三百六十五座洞天福地，此境窍穴洞门大开，可从天地间汲取灵气。' },
        { i:7, n:'观海境', d:'取「我登楼观百川，入海即入我怀」之意。扩充人体经脉，灵气反哺肉身，可延年益寿至百岁高龄。' },
        { i:8, n:'龙门境', d:'气海灵气逆行流转，如鲤鱼跃龙门。冲关失败则跌回洞府境，一辈子只有三次机会，故曰「事不过三」。' },
        { i:9, n:'金丹境', d:'「结成金丹客，方是我辈人」。气海凝聚为一颗金丹，丹室大小优劣因人而异，一般可开宗立派。' },
        { i:10, n:'元婴境', d:'金丹化婴，于识海育出阳神或阴神。此境可称地仙，寿命数百年。' }
      ]},
      { g:'上五境', lead:'人间顶尖，一举一动牵动气运。', list:[
        { i:11, n:'玉璞境', d:'返璞归真，元婴与肉身相融，修成无垢琉璃之躯，水火不惧，可御空。剑修至此方称「剑仙」。' },
        { i:12, n:'仙人境', d:'触摸规则，可调动天地之力，遨游天地，寿至千年，方具开宗立派之资格。' },
        { i:13, n:'飞升境', d:'凡间顶点。为天道所不容，只能被迫飞升去往传说中的天庭；一旦飞升失败，魂飞魄散。' }
      ]},
      { g:'失传二境', lead:'当世罕有人至，近乎传说。', list:[
        { i:14, n:'十四境 · 合道', d:'十三境练气士需合道方能进入，途径分天时、地利、人和。所走之道若与他人相同，即为大道之争，你死我活。' },
        { i:15, n:'十五境 · 三教祖师', d:'全书仅儒教至圣先师、道教道祖、佛教佛祖三位抵达，执掌世界本源规则。' }
      ]}
    ]
  },

  wufu: {
    key:'wufu', name:'纯粹武夫', n:11,
    lead:'不借天地灵气，只修自身气血肉身，共十一境。又称「断头路」。',
    groups:[
      { g:'炼体三境', lead:'打磨血肉，脱去凡胎。', list:[
        { i:1, n:'泥胚境', d:'武夫体魄粗糙不堪，此境颠覆之时，犹如一尊泥菩萨，气沉丹田，不动如山。' },
        { i:2, n:'木胎境', d:'体魄淬炼由粗入细，大成时肌肤纹理精密，如同篆刻铭文。' },
        { i:3, n:'水银境', d:'血液浓稠如水银，重量却更加轻盈，气血凝聚合一，身法灵动。' }
      ]},
      { g:'炼气三境', lead:'凝练精气神，淬炼出英魂雄魄。', list:[
        { i:4, n:'英魂境', d:'武夫淬炼出英雄魂，精神可外放感知。' },
        { i:5, n:'雄魄境', d:'魂魄与肉身深度绑定，不惧幻境与寻常阴邪侵扰。' },
        { i:6, n:'武胆境', d:'凝结塑造出一颗英雄胆，即「武胆」，道心稳固，绝境可爆发。' }
      ]},
      { g:'炼神三境', lead:'肉身超凡，已是一国顶尖。', list:[
        { i:7, n:'金身境', d:'修炼出金刚不败之躯，又称小宗师，刀剑难伤。' },
        { i:8, n:'羽化境', d:'可御风远游、虚空悬停，故又称「远游境」，亦称大宗师。' },
        { i:9, n:'山巅境', d:'世人视为武道尽头，肉身力量比肩山岳，一拳可引地动山摇。' }
      ]},
      { g:'止境', lead:'武夫第十境，内分三层。一洲之内止境武夫寥寥无几，无一不是身负一洲武运。', list:[
        { i:10, n:'止境 · 气盛', d:'气血磅礴如江河，一己气血可压制一方天地，战力约敌练气士十一境。' },
        { i:11, n:'止境 · 归真', d:'剥离后天杂质，招式返璞归真，无招胜有招，约敌练气士十二境。' },
        { i:12, n:'止境 · 神到', d:'神魂与肉身完全合一，心意动则气血随行，可硬抗练气士十三境。' }
      ]},
      { g:'传说', lead:'武夫道路的尽头，万年来几乎无人走通。', list:[
        { i:13, n:'武神境', d:'达此境者寿与天齐。世间仅女子武神裴怀一脚踏入，故武夫一道又被称为「断头路」。' }
      ]}
    ]
  },

  jianxiu: {
    key:'jianxiu', name:'剑修', ref:'lianqi',
    lead:'剑修并无独立境界，修为按练气士十五境计。但剑修把全部真气压入一剑，同境杀力碾压寻常练气士：玉璞境剑修可斩寻常飞升境。玉璞境起，方称「剑仙」。',
    note:'游戏中剑修的境界档位按练气士再上一档计（见 realmTier）。'
  },

  yaozu: {
    key:'yaozu', name:'妖族', ref:'lianqi',
    lead:'蛮荒天下妖族修为亦按练气士十五境对标，另有大妖、妖王、古祖等称，视血脉与年岁而定。上古真龙、远古神灵可对标十四境。'
  },

  shenling: {
    key:'shenling', name:'神灵', ref:'lianqi',
    lead:'山河正神、城隍、水神等，境界对标练气士，实际战力看香火与神位高低。'
  }
};

/* 修行路径 → 境界序（用于推导档位与排序） */
const PATHS = [
  { k:'lianqi',   n:'练气士',   short:'气' },
  { k:'jianxiu',  n:'剑修',     short:'剑' },
  { k:'wufu',     n:'纯粹武夫', short:'武' },
  { k:'yaozu',    n:'妖族',     short:'妖' },
  { k:'shenling', n:'神灵',     short:'神' }
];

/* 档位（游戏平衡用）：1 下五境 / 2 中五境 / 3 上五境 / 4 失传·传说 */
function realmTier(path, realm){
  if(!realm) return 2;                       // 原著未载者按中五境计
  if(path==='wufu'){
    const W = {'泥胚境':1,'木胎境':1,'水银境':1,'英魂境':1,'雄魄境':2,'武胆境':2,
               '金身境':2,'羽化境':2,'山巅境':3,
               '止境·气盛':3,'止境·归真':3,'止境·神到':3,'武神境':4};
    if(W[realm] !== undefined) return W[realm];
    if(realm.indexOf('止境')>=0) return 3;
    if(realm.indexOf('武神')>=0) return 4;
    return 2;
  }
  const Q = {'铜皮境':1,'草根境':1,'柳筋境':1,'骨气境':1,'铸炉境':1,
             '洞府境':2,'观海境':2,'龙门境':2,'金丹境':2,'元婴境':2,
             '玉璞境':3,'仙人境':3,'飞升境':3,
             '十四境':4,'十五境':4};
  for(const k in Q){ if(realm.indexOf(k)>=0) return (path==='jianxiu') ? Math.min(4, Q[k]+1) : Q[k]; }
  return 2;
}
/* 手牌上限按档位：与原 REALM_LIMIT（练气4/止境5/飞升6）保持一致 */
const TIER_LIMIT = { 1:4, 2:5, 3:6, 4:7 };
function tierOf(p){ return realmTier(p.path, p.realm); }

/* 境界全称（展示用） */
function realmLabel(p){
  if(!p.realm) return '境界未载';
  return p.realm;
}
function pathLabel(p){
  const f = PATHS.filter(x=>x.k===p.path)[0];
  return f ? f.n : '';
}


/* 修行路径与境界（依《剑来》原著；realm=null 表示原著未载，游戏显示「境界未载」） */
const CHAR_PATH = {
  'aliang': { path:'jianxiu', realm:'飞升境', src:'推定', note:'剑气长城飞升境剑修' },
  'baiye': { path:'jianxiu', realm:'十四境·合道', src:'原著', note:'读书人合道诗篇证道（十四境·合道），持仙剑太白；诗不尽，剑不绝。太白为仙剑，非本命飞剑' },
  'baize': { path:'yaozu', realm:'止境', src:'推定', note:'蛮荒大妖，通晓万物' },
  'caoci': { path:'wufu', realm:'止境武夫', src:'原著', note:'武神曹慈，武道止境' },
  'chenpingan': { path:'wufu', realm:'止境武夫', src:'原著', note:'止境武夫 + 剑道证道大剑仙，飞升前最强武夫之一' },
  'chenqingdu': { path:'jianxiu', realm:'飞升境', src:'推定', note:'剑气长城老大剑仙，人间剑道顶点' },
  'daozu': { path:'lianqi', realm:'十五境', src:'原著', note:'三教祖师之一，道教道祖，原著设定全书仅至圣先师、道祖、佛祖三人在此境' },
  'fozu': { path:'lianqi', realm:'十五境', src:'原著', note:'三教祖师之一，佛教佛祖' },
  'lisan': { path:'lianqi', realm:'十四境·合道', src:'原著', note:'礼圣，合道浩然天下礼序规矩（特殊合道，不在天时/地利/人和三途径内）；据传随时可上十五境' },
  'liulaocheng': { path:'lianqi', realm:'玉璞境', src:'推定', note:'书简湖老辈，湖底最沉的那双眼' },
  'longhushan': { path:'lianqi', realm:null, src:'地标', note:'龙虎山是地名，非人物，跳过' },
  'mihu': { path:'jianxiu', realm:'止境', src:'推定', note:'米裕之兄，止境剑修' },
  'miyu': { path:'jianxiu', realm:'玉璞境', src:'原著', note:'剑气长城十人之一，玉璞境剑仙，本命飞剑「霞满天」；青萍剑宗首席供奉，曾破境仙人境' },
  'nalanyexing': { path:'jianxiu', realm:'玉璞境', src:'原著', note:'剑气长城宁府老管事，最擅隐匿刺杀的剑仙之一；为护宁姚重伤，自仙人境跌回玉璞境，末战殉城' },
  'ningyao': { path:'jianxiu', realm:'飞升境', src:'原著', note:'剑气长城新一代魁首，持仙剑「天真」' },
  'qijingchun': { path:'lianqi', realm:'玉璞境', src:'原著', note:'老秀才关门弟子，宝瓶洲罕见玉璞境修士，曾跨境斩杀飞升境妖族' },
  'zhoumi': { path:'yaozu', realm:'十四境·合道', src:'原著', note:'旧天庭共主之一，合道"心中驳杂学问"（吃下他人一份份大道以稳境界）；十四境大妖' },
  '之祠': { path:'yaozu', realm:'止境', src:'推定', note:'蛮荒大妖之一' },
  '于玄': { path:'lianqi', realm:'玉璞境', src:'推定', note:'东宝瓶洲老修士' },
  '亚圣': { path:'lianqi', realm:'十四境·合道', src:'原著', note:'亚圣，合道中土神洲（地利）' },
  '仰止': { path:'yaozu', realm:'止境', src:'推定', note:'蛮荒大妖之一' },
  '余斗': { path:'lianqi', realm:'十四境·合道', src:'原著', note:'白玉京二掌教，道老二，世称真无敌；大公无私，曾亲手斩杀两位挚友，与陈平安书简湖之择互为对照（书简湖设局人是崔瀺，非余斗）；合道方式未明（百科列为"未知"），借玉京山之力可临时伪十五' },
  '刘灞桥': { path:'lianqi', realm:'止境', src:'推定', note:'宝瓶洲北地宗字头修士' },
  '刘羡阳': { path:'jianxiu', realm:'止境', src:'推定', note:'泥瓶巷少年剑修，剑道止境' },
  '刘重润': { path:'yaozu', realm:'止境', src:'推定', note:'蛟龙之女，南涧国旧主' },
  '南簪': { path:'lianqi', realm:'玉璞境', src:'推定', note:'南簪，大骊皇族供奉' },
  '卢白象': { path:'wufu', realm:'止境武夫', src:'推定', note:'武夫止境，落魄山供奉' },
  '君倩': { path:'lianqi', realm:'止境', src:'推定', note:'文圣一脉，止境儒修' },
  '吴霜降': { path:'lianqi', realm:'十四境·合道', src:'原著', note:'岁除宫宫主，合道"愿天下有情人终成眷属"——天下有情人越多境界越稳' },
  '周海镜': { path:'jianxiu', realm:'止境', src:'推定', note:'女子止境剑修' },
  '周澄': { path:'lianqi', realm:'练气', src:'推定', note:'年轻一代，先天剑胚' },
  '周米粒': { path:'lianqi', realm:'练气', src:'推定', note:'落魄山弟子，稚童' },
  '石柔': { path:'lianqi', realm:'练气', src:'推定', note:'骑龙巷压岁铺子代掌柜；枯骨女鬼寄居桐叶宗杜懋飞升境遗蜕，白日以杜懋面目行走，夜里方复女子真身' },
  '姚近之': { path:'jianxiu', realm:'止境', src:'推定', note:'剑气长城女子止境剑修' },
  '姜尚真': { path:'lianqi', realm:'止境', src:'推定', note:'落魄山供奉，玉璞/止境' },
  '姜赦': { path:'wufu', realm:'武神境', src:'原著', note:'兵家初祖，道号元神，全书唯一十一境武神；开创人间武道并亲定止境三重（气盛·归真·神到），裴钱前世之父' },
  '宋长镜': { path:'wufu', realm:'山巅境', src:'推定', note:'大骊宋氏皇族武道宗师；武夫九境山巅即一国顶尖、武道宗师' },
  '宋集薪': { path:'lianqi', realm:'止境', src:'推定', note:'大骊皇子，落魄旧主，止境' },
  '宋雨烧': { path:'wufu', realm:'止境武夫', src:'推定', note:'龙泉剑窑老武夫' },
  '小陌': { path:'lianqi', realm:'止境', src:'推定', note:'蛮荒旧日大妖，后为落魄山供奉' },
  '崔东山': { path:'lianqi', realm:'止境', src:'推定', note:'崔瀺分身/徒弟，止境' },
  '崔瀺': { path:'lianqi', realm:'十四境·合道', src:'原著', note:'老秀才首徒，落魄山真正布局之人，合道宝瓶洲文脉（一洲文运），大骊国师"绣虎"' },
  '崔诚': { path:'wufu', realm:'止境', src:'推定', note:'原著点名的止境武夫之一（崔诚、马苦玄、顾佑），具体层次未细分' },
  '左右': { path:'jianxiu', realm:'飞升境', src:'原著', note:'剑气长城十人之首，飞升境剑修' },
  '张山峰': { path:'wufu', realm:'止境武夫', src:'推定', note:'武道止境，落魄山供奉' },
  '徐远霞': { path:'lianqi', realm:'玉璞境', src:'推定', note:'宝瓶洲女修' },
  '托月山': { path:'yaozu', realm:'十四境·合道', src:'原著', note:'托月山大祖，又称妖族大祖、蛮荒大祖；合道蛮荒天下气运（地利）；十四境巅峰、半步十五，十四王座之首' },
  // 旧十四王座其余十席
  '刘叉': { path:'jianxiu', realm:'飞升境', src:'原著', note:'王座第三，飞升境剑修；曾于浩然躋身十四境、以纯粹剑道合道，被陈淳安以命打落，后囚于文庙功德林' },
  '袁首': { path:'yaozu', realm:'飞升境', src:'原著', note:'真身朱厌，搬山一族老祖宗；手中石珠皆为搬走炼化的雄山' },
  '五嶽': { path:'wufu', realm:'止境·神到', src:'原著', note:'三头六臂巨人，飞升境巅峰兼纯粹武夫止境神到；曾率先登城，硬受陈清都一剑未死' },
  '牛刀': { path:'yaozu', realm:'飞升境', src:'原著', note:'飞升境巅峰；金甲实为牢狱，争蛮荒共主败于托月山后被囚英灵殿古井，又被道祖一指按回' },
  '白莹': { path:'yaozu', realm:'飞升境', src:'原著', note:'枯骨王座；实为文海周密的阳神身外身，白骨之身混杂数十万魂魄' },
  '绯妃': { path:'yaozu', realm:'飞升境', src:'原著', note:'真身猩红长蛇，曳落河共主；水运被陈平安截去一半' },
  '曜甲': { path:'yaozu', realm:'飞升境', src:'原著', note:'金精王座，本命为倒悬般的破碎山岳；斩姚可久、周神芝，终被白也以仙剑太白三剑斩杀' },
  '切韵': { path:'yaozu', realm:'飞升境', src:'原著', note:'飞升境巅峰；面皮皆为拼凑，腰悬养剑葫，化名青花、酒靥；斐然师兄' },
  '黄鸾': { path:'yaozu', realm:'飞升境', src:'原著', note:'真身娈鸟，炼化无数仙家洞府亭台；被阿良联手姚冲道斩杀而跌境' },
  '荷花庵主': { path:'yaozu', realm:'飞升境', src:'原著', note:'真身兔妖，雪白道袍；私炼蛮荒半数月魄，被董三更登月斩杀' },
  '持剑者': { path:'jianxiu', realm:'十四境·合道', src:'推定', note:'旧天庭五至高之一、万剑之源，本身即是剑道规则之化身（不以天时/地利/人和合道）；天庭最高神灵层级，对标十四境' },
  '搬山猿': { path:'yaozu', realm:'止境', src:'推定', note:'蛮荒大妖' },
  '老秀才': { path:'lianqi', realm:'十四境·合道', src:'原著', note:'老秀才，合道三洲之地（地利）：西南扶摇洲、正南婆娑洲、东南桐叶洲——据传本可走人和，未走' },
  '斐然': { path:'lianqi', realm:'练气', src:'推定', note:'文庙小夫子，年轻' },
  '朱敛': { path:'wufu', realm:'止境武夫', src:'推定', note:'落魄山二掌柜，武止境' },
  '李二': { path:'wufu', realm:'止境武夫', src:'推定', note:'李宝瓶之父，止境武夫' },
  '李宝瓶': { path:'lianqi', realm:'练气', src:'推定', note:'年轻一代，文圣一脉' },
  '李希圣': { path:'lianqi', realm:'止境', src:'推定', note:'李宝瓶大伯，止境' },
  '李柳': { path:'lianqi', realm:'十四境·合道', src:'原著', note:'旧天庭水神转世，合道水运；李二之女' },
  '李槐': { path:'lianqi', realm:'练气', src:'推定', note:'同乡少年' },
  '杨老头': { path:'lianqi', realm:'飞升境', src:'原著', note:'杨家老祖，飞升境布局者' },
  '林守一': { path:'lianqi', realm:'练气', src:'推定', note:'同乡少年，先天剑胚' },
  '柳柔': { path:'lianqi', realm:'玉璞境', src:'推定', note:'宝瓶洲女修' },
  '沛湘': { path:'yaozu', realm:'止境', src:'推定', note:'黄湖湖君，落魄山供奉' },
  '火龙真人': { path:'lianqi', realm:'十四境·合道', src:'推定', note:'阮邛之师，合道火道（火德一脉之极致）' },
  '玉圭': { path:'lianqi', realm:'止境', src:'推定', note:'稚圭 / 田婉，皆止境' },
  '稚圭': { path:'lianqi', realm:'止境', src:'推定', note:'稚圭 / 田婉，皆止境' },
  '纳兰烧苇': { path:'yaozu', realm:'止境', src:'推定', note:'蛮荒大妖' },
  '老瞎子': { path:'yaozu', realm:'止境', src:'推定', note:'蛮荒老妖' },
  '老聋儿': { path:'yaozu', realm:'止境', src:'推定', note:'蛮荒老妖' },
  '至圣先师': { path:'lianqi', realm:'十五境', src:'原著', note:'三教祖师之一，儒教至圣先师' },
  '苏心斋': { path:'lianqi', realm:'止境', src:'推定', note:'心斋书院，止境' },
  '苏稼': { path:'lianqi', realm:'练气', src:'推定', note:'早期出场女子' },
  '萧𢙏': { path:'jianxiu', realm:'止境', src:'推定', note:'剑气长城止境剑修' },
  '董三更': { path:'jianxiu', realm:'止境', src:'推定', note:'剑气长城止境剑修' },
  '董水井': { path:'lianqi', realm:'练气', src:'推定', note:'年轻一代' },
  '蔡金简': { path:'jianxiu', realm:'止境', src:'推定', note:'女子止境剑修' },
  '裴杯': { path:'lianqi', realm:'止境', src:'推定', note:'裴钱授业之一，止境' },
  '裴钱': { path:'wufu', realm:'止境武夫', src:'推定', note:'落魄山大师姐，止境武夫' },
  '谢松花': { path:'lianqi', realm:'止境', src:'推定', note:'北俱芦洲女子止境' },
  '谢狗': { path:'lianqi', realm:'练气', src:'推定', note:'同乡少年' },
  '贺小凉': { path:'lianqi', realm:'止境', src:'推定', note:'止境女修' },
  '赊月': { path:'lianqi', realm:'止境', src:'推定', note:'蛮荒大妖转世身之一，止境' },
  '赵繇': { path:'lianqi', realm:'练气', src:'推定', note:'同乡少年' },
  '郑居中': { path:'lianqi', realm:'十四境·合道', src:'原著', note:'五百年前百家争鸣奇才，一人两十四："一分为二、道心如一、各自登顶"（魔道第一人）' },
  '郦彩': { path:'lianqi', realm:'玉璞境', src:'推定', note:'宝瓶洲女修' },
  '郭竹酒': { path:'lianqi', realm:'练气', src:'推定', note:'同乡少年' },
  '长命': { path:'lianqi', realm:'止境', src:'推定', note:'止境女修' },
  '阮秀': { path:'lianqi', realm:'止境', src:'推定', note:'火龙转世，阮邛之女' },
  '阮邛': { path:'jianxiu', realm:'止境', src:'推定', note:'兵家圣人，止境剑修' },
  '陆台': { path:'lianqi', realm:'止境', src:'推定', note:'落魄山供奉' },
  '陆沉': { path:'lianqi', realm:'十四境·合道', src:'原著', note:'白玉京三掌教，合道五梦七心相（散道型合道）；常态十四境巅峰，可临时伪十五' },
  '陆芝': { path:'jianxiu', realm:'止境', src:'原著', note:'剑气长城女子止境剑修，本命飞剑「抱朴」「北斗」，北斗主死；董三更战死后独自守城育女' },
  '陈景清': { path:'lianqi', realm:'练气', src:'推定', note:'年轻一代' },
  '陈暖树': { path:'lianqi', realm:'练气', src:'推定', note:'落魄山弟子' },
  '陈熙': { path:'jianxiu', realm:'止境', src:'推定', note:'剑气长城止境剑修' },
  '隋右边': { path:'jianxiu', realm:'止境', src:'推定', note:'剑气长城女子止境剑修' },
  '隋景澄': { path:'lianqi', realm:'练气', src:'推定', note:'隋右边之妹，年轻' },
  '顾粲': { path:'lianqi', realm:'练气', src:'推定', note:'落魄山弟子，年轻' },
  '马苦玄': { path:'wufu', realm:'止境', src:'推定', note:'原著点名的止境武夫之一' },
  '魏晋': { path:'jianxiu', realm:'止境', src:'推定', note:'浩然剑气，齐家老祖，止境剑修' },
  '魏檗': { path:'yaozu', realm:'止境', src:'推定', note:'北岳神君，止境' },
  '魏羡': { path:'lianqi', realm:'练气', src:'推定', note:'年轻一代' },
  '黄庭': { path:'lianqi', realm:'止境', src:'推定', note:'宝瓶洲止境' },
  '齐廷济': { path:'jianxiu', realm:'止境', src:'推定', note:'剑气长城老祖，止境剑修' },
  '齐景龙': { path:'jianxiu', realm:'止境', src:'推定', note:'北俱芦洲止境剑修' },
  '龙君': { path:'yaozu', realm:'止境', src:'推定', note:'蛟龙之属大妖，止境' },
  // —— 补齐此前遗漏的九位，使 CHARS / CHAR_PATH / BRIEFS / PLOTS 四表 key 对齐 ——
  'xunyuan':     { path:'lianqi', realm:'飞升境', src:'原著', note:'桐叶洲玉圭宗老宗主，飞升境大修士；本命枪法「一尺枪」，常书「余家贫」三字。与姜尚真亦师亦友，蛮荒入侵桐叶洲时战死' },
  'xieshi':      { path:'jianxiu', realm:'止境', src:'推定', note:'中土文庙礼圣一脉剑修，君子之剑，止境（出处待核：暂未坐实「谢时」为独立原著角色，依现有设定补全）' },
  'laojiao':     { path:'yaozu', realm:'止境', src:'推定', note:'蛮荒旧龙族余孽，妖龙之属，止境' },
  'xianzhu':     { path:'lianqi', realm:'练气', src:'推定', note:'骊珠洞天泥瓶巷寻常女子，未入修行' },
  'liujinglong': { path:'jianxiu', realm:'飞升境', src:'原著', note:'剑气长城剑修，本命飞剑「规矩」，飞升境' },
  'yuyue':       { path:'jianxiu', realm:'玉璞境', src:'原著', note:'流霞洲老剑修，本命飞剑「惊鸟」「百花」，玉璞境瓶颈' },

  '曹晴朗': { path:'lianqi', realm:'金丹境', src:'原著', note:'藕花福地南苑国读书种子，南苑国科举连中三元、大骊科举榜眼；金丹境练气士，文圣一脉真正的读书人，青萍剑宗未来宗主' },
  '赵树下': { path:'wufu', realm:'五境武夫', src:'原著', note:'陈平安武道关门弟子；胭脂郡赵府仆役出身，以两百万次基础拳法奠定武道根基，拳风最像陈平安' },
  '宁吉': { path:'lianqi', realm:null, src:'原著', note:'人族女子与蛮荒妖族修士的子嗣，天生道胎；文庙托陆沉寻访的少年，修行几无门槛，陆沉赠「开卷有益」「宁吉读过」两印' },
  '邓剑枰': { path:'jianxiu', realm:'金丹境', src:'原著', note:'北俱芦洲女子武夫邓剑翘之弟；金丹境剑修且极契合文脉；随驾城天劫一事先避后返，收卖炭人的一对孩子为开山弟子与关门弟子' },
  '袁黄': { path:'wufu', realm:'金身境', src:'原著', note:'莲藕福地出身的江湖游侠，铁匠世家子；以诚挚学拳之心打破陈平安不再收徒的规矩，拳风与落魄山行事风格相契' },
  '郑大风': { path:'wufu', realm:'山巅境', src:'原著', note:'落魄山首任看门人；青童天君杨老头弟子、李二师弟；前身是远古天庭东天门守卫神将，披一身大霜宝甲，曾是浩然天下最强八境武夫' },
  '韦文龙': { path:'lianqi', realm:'金丹境', src:'原著', note:'落魄山泉府掌舵人兼账房；倒悬山出身，邵云岩嫡传；术算天才，被陈平安力邀上山' },

};

/* 合并进 CHARS：旧的三档（练气/止境/飞升）退为 realmLegacy，仅作无记载时的兜底档位 */
(function(){
  const LEG = { "练气":1, "止境":2, "飞升":3 };
  // 遍历 CHARS 而非 CHAR_PATH：未标注者也要清掉旧三档值，防其被当成真境界
  for(const k in CHARS){
    const c = CHARS[k];
    c.realmOld = c.realm;
    const d = CHAR_PATH[k];
    c.path      = d ? d.path  : "lianqi";
    c.realm     = d ? d.realm : null;
    c.realmSrc  = d ? d.src   : "未载";
    c.realmNote = d ? d.note  : "";
    c.tier = c.realm ? realmTier(c.path, c.realm) : (LEG[c.realmOld] || 2);
  }
})();

const REALM_LIMIT = { '练气':4, '止境':5, '飞升':6 };

// 阵营天赋（仅对非旗舰角色生效）
const TALENT_DESC = {
  '锋芒':'剑气长城天赋：你每回合首次打出的「剑气」伤害 +1。',
  '耕读':'中土文庙天赋：摸牌阶段额外摸 1 张。',
  '嗜血':'蛮荒天下天赋：你每回合首次造成伤害后，回复 1 点气血。',
  '无为':'青冥天下天赋：你每回合首次受到的伤害 -1。',
  '慈悲':'莲花天下天赋：你的「丹药」回复 2 点气血。',
  '机缘':'散修天赋：你每回合首次打出「锦囊」后，摸 1 张。',
};
function isFlagship(p){ return p.flagship === true; }
function talentOf(p){ return isFlagship(p) ? null : (p.talent || null); }

/* ===================== 卡牌 ===================== */
let cardUid = 0;
function buildDeck(){
  const lib = [
    ['attack','剑气',null,20], ['dodge','守心',null,16], ['heal','丹药',null,8], ['wine','问剑',null,5],
    ['trick','论道','duel',4], ['trick','万剑归宗','wanjian',2], ['trick','蛮荒入侵','nanman',2],
    ['trick','破阵','pozhen',3], ['trick','借物','jiewu',3], ['trick','天劫','tianjie',1],
    ['trick','读书','dushu',3], ['trick','炼器','lianqi',2],
    ['equip','本命飞剑','feijian',4],
  ];
  const deck = [];
  for (const [type,name,sub,count] of lib){
    for (let i=0;i<count;i++) deck.push({ uid:++cardUid, type, name, sub:sub||null });
  }
  return shuffle(deck);
}
function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function cardPoint(c){ return ({ dodge:2, heal:1, attack:3, wine:4, trick:5, equip:4 })[c.type] || 3; }
// 卡面中央字与类别
const CARD_SIG = {
  '剑气':'剑', '守心':'守', '丹药':'丹', '饮者':'酒', '本命飞剑':'器',
  '论道':'论', '万剑归宗':'万', '蛮荒入侵':'蛮', '破阵':'破', '借物':'借',
  '天劫':'劫', '读书':'书', '炼器':'炼',
};
const CARD_KIND = { attack:'基本·攻', dodge:'基本·守', heal:'基本·丹', wine:'基本·酒', trick:'锦囊', equip:'装备' };
function cardSig(c){ return CARD_SIG[c.name] || c.name.charAt(0); }
function cardCls(c){ return ({attack:'c-attack',dodge:'c-dodge',heal:'c-heal',wine:'c-wine',trick:'c-trick',equip:'c-equip'})[c.type]||''; }

// 招式名（出牌时飘字）
const SHOUTS = {
  attack:['一剑霜寒','长剑出鞘','剑气纵横','斩浪式','破云斩','问剑于野','横剑四顾'],
  dodge:['守心如玉','不动如山','气定神闲'],
  heal:['丹田回暖','回春之息'],
  wine:['且饮此杯'],
  equip:['本命飞剑·出鞘'],
  trick:{ duel:'与你论道', wanjian:'万剑归宗', nanman:'蛮荒入侵', pozhen:'破阵子',
          jiewu:'借物代形', tianjie:'天劫降世', dushu:'读书养气', lianqi:'祭炼飞剑' },
};
function pickShout(list){ return list[Math.floor(Math.random()*list.length)]; }

/* ===================== 音效（WebAudio 合成，无需外部资源） ===================== */
const SFX = (function(){
  let ctx=null, on=true;
  function ac(){
    if(!ctx){ try { ctx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){ ctx=null; } }
    if(ctx && ctx.state==='suspended'){ try{ ctx.resume(); }catch(e){} }
    return ctx;
  }
  function tone(freq, dur, type, vol, delay, slideTo){
    const c=ac(); if(!c||!on) return;
    const t0=c.currentTime+(delay||0);
    const o=c.createOscillator(), g=c.createGain();
    o.type=type||'sine'; o.frequency.setValueAtTime(freq,t0);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30,slideTo), t0+dur);
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.linearRampToValueAtTime(vol||0.15, t0+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0+dur+0.03);
  }
  function noise(dur, vol, f0, delay, f1){
    const c=ac(); if(!c||!on) return;
    const t0=c.currentTime+(delay||0);
    const n=Math.max(1,Math.floor(c.sampleRate*dur));
    const buf=c.createBuffer(1,n,c.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
    const src=c.createBufferSource(); src.buffer=buf;
    const bp=c.createBiquadFilter(); bp.type='bandpass';
    bp.frequency.setValueAtTime(f0||1800,t0);
    if(f1) bp.frequency.exponentialRampToValueAtTime(Math.max(60,f1), t0+dur);
    bp.Q.value=1.1;
    const g=c.createGain();
    g.gain.setValueAtTime(vol||0.2,t0);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    src.connect(bp); bp.connect(g); g.connect(c.destination); src.start(t0);
  }
  return {
    set(v){ on=!!v; if(on) ac(); },
    isOn(){ return on; },
    click(){ noise(0.045,0.07,3000,0,1400); },
    draw(){ noise(0.11,0.10,2600,0,820); },
    slash(){ noise(0.30,0.30,3600,0,560); tone(1500,0.14,'triangle',0.06,0,380); },
    hit(){ tone(190,0.24,'sine',0.24,0,62); noise(0.18,0.22,900,0,200); },
    heal(){ tone(523,0.16,'sine',0.11); tone(659,0.18,'sine',0.10,0.08); tone(784,0.24,'sine',0.09,0.16); },
    die(){ tone(165,0.75,'sawtooth',0.15,0,55); noise(0.55,0.16,600,0,140); },
    turn(){ tone(294,0.85,'triangle',0.10); tone(441,0.95,'triangle',0.07,0.05); },
    win(){ [523,587,659,784,880].forEach((f,i)=>tone(f,0.55,'triangle',0.13,i*0.12)); },
    lose(){ [440,392,330,262].forEach((f,i)=>tone(f,0.8,'sine',0.13,i*0.19)); },
    breakout(){ [392,523,659,880].forEach((f,i)=>tone(f,0.5,'triangle',0.12,i*0.08)); noise(0.4,0.12,2200,0,600); },
    swordrain(){ for(let i=0;i<9;i++) noise(0.16,0.14,4200,i*0.075,900); tone(880,0.5,'triangle',0.08,0,300); },
    mist(){ tone(120,0.9,'sawtooth',0.10,0,58); noise(0.85,0.16,520,0,190); },
    execute(){ noise(0.2,0.34,1200,0,220); tone(70,0.55,'sine',0.26,0.02,40); tone(1320,0.16,'triangle',0.09,0.03,500); },
    guard(){ tone(1180,0.13,'triangle',0.11,0,880); noise(0.07,0.12,5200,0,2600); },
    thunder(){ noise(0.5,0.30,220,0,1800); tone(58,0.6,'sawtooth',0.16,0.04,34); },
    combo(n){ const b=520+Math.min(n||1,5)*90; tone(b,0.16,'triangle',0.13); tone(b*1.5,0.2,'triangle',0.10,0.07); },
    forge(){ tone(196,0.4,'square',0.09,0,120); noise(0.35,0.13,1400,0,420); },
    scroll(){ noise(0.16,0.09,2400,0,900); tone(660,0.2,'sine',0.08,0.05); },
    shatter(){ noise(0.26,0.24,3400,0,700); tone(880,0.12,'square',0.07,0,220); },
    pull(){ tone(300,0.28,'sine',0.11,0,1100); },
    heavy(){ tone(120,0.34,'square',0.20,0,45); noise(0.3,0.30,700,0,150); },
    heartbeat(){ tone(72,0.16,'sine',0.16); tone(62,0.2,'sine',0.13,0.17); },
    wine(){ tone(392,0.16,'sine',0.11); tone(294,0.20,'sine',0.10,0.14);
            tone(220,0.28,'sine',0.09,0.30); noise(0.30,0.10,700,0.05,260); },
    rune(){ tone(330,0.5,'triangle',0.09); tone(495,0.55,'sine',0.07,0.06); noise(0.3,0.08,2600,0,900); },
  };
})();

/* ===================== 工具 ===================== */
/* 节奏倍速：1 = 缓（默认值已按「能看清 AI 出牌」调过），0.4 = 疾。
   所有回合等待都乘这个系数，玩家可在顶栏随时切换。 */
let speedMul = 1;
// 连击总开关（供平衡采样对照用；默认开启）
let COMBO_ON = true;
const sleep = ms => new Promise(r=>setTimeout(r, Math.max(0, Math.round(ms * speedMul))));

/* ===================== 技能引擎（全角色 · 声明式） =====================
   SKILLS[角色key] = [ {n 名, k 类型, v 数值, c 条件, o 限定, a 主动技, q 喊话, qo 原著原话, f 特效} ]

   k 类型：
     atk 剑气伤害+v   atkLimit 多出一剑   hand 手牌上限+v   draw 摸牌+v
     judge 判定+v     range 攻击范围+v    nodist 无视距离   nododge 剑气不可守心
     reduce 受伤-v    reflect 反弹v       immune 免疫(v:'trick'/'lang')
     taunt 嘲讽       regen 回合末回v     hitdraw 命中摸v   hitextra 命中再出一剑
     deathsave 濒死免伤 deathally 亡时队友摸v  deathfac 亡时同阵回v  killdraw 击杀摸v
     startcard 开局全场+v  startequip 开局专属飞剑  equipUp 装备效果+1
     act 主动技(a)    useAs 牌转化(a)     dodgeAs 弃牌当守心  flavor 仅台词

   c 条件：'mang'对蛮荒 'ru'对文庙 'qing'对青冥 'lotus'对莲花 'far'范围外
           'low'自身血≤1 'hurt'自身已伤   {with:'宁姚'} 场上有某人
   o 限定：'once'每局限一次  'turn'每回合限一次
   f 特效：sword / shield / lotus / flame / thunder / mist / rune / forge / star / aura / blood / scroll
=================================================================== */
const SKILLS = {
  /* ---------- 剑气长城 ---------- */
  chenqingdu:[{n:'一剑',k:'act',a:'yijian',o:'once',q:'一剑霜寒十四州。',f:'sword'},
              {n:'长城',k:'taunt',q:'长城在，我在。',f:'aura'}],
  ningyao:[{n:'剑心',k:'nododge',q:'剑心通明，守无可守。',f:'sword'},
           {n:'镇蛮',k:'atk',v:1,c:'mang',q:'蛮荒妖族，来一个杀一个。',f:'blood'}],
  aliang:[{n:'问剑',k:'act',a:'wenjian',q:'我叫阿良，善良的良。',qo:1,f:'sword'},
          {n:'无忧',k:'immune',v:'lang',q:'天下第一剑客，无忧无虑。',f:'aura'}],
  miyu:[{n:'米',k:'atk',v:1,q:'米家剑，快。',f:'sword'},
        {n:'杀力',k:'atk',v:1,c:'mang',q:'杀力全开。',f:'blood'}],
  baiye:[{n:'诗剑',k:'atk',v:1,c:'hurt',q:'白也诗无敌，剑亦无敌。',f:'scroll'},
         {n:'青衫',k:'nodist',q:'青衫磊落，剑及天下。',f:'sword'}],
  '左右':[{n:'出城',k:'atk',v:1,c:'far',q:'出城一战，不回头。',f:'sword'},
          {n:'剑仙',k:'hand',v:1,q:'左右为难，仍是剑仙。',f:'aura'}],
  '魏晋':[{n:'浩然',k:'atk',v:1,c:{with:'宁姚'},q:'浩然气，可吞万里。',f:'aura'},
          {n:'孤峰',k:'hand',v:2,q:'孤峰独立，不求人。',f:'aura'}],
  '董三更':[{n:'三更',k:'atk',v:1,c:'third',q:'三更天，该杀人了。',f:'sword'},
            {n:'夜',k:'hand',v:1,q:'夜色如墨，剑光如雪。',f:'sword'}],
  '姚近之':[{n:'近之',k:'atk',v:1,c:{with:'魏晋'},q:'近之，则近之。',f:'sword'},
            {n:'柔剑',k:'useAs',a:'dodge>attack',q:'柔能克刚。',f:'sword'}],
  '齐廷济':[{n:'齐家剑',k:'atkLimit',v:1,q:'齐家剑法，连绵不绝。',f:'sword'},
            {n:'廷',k:'judge',v:1,q:'廷上论剑，寸步不让。',f:'scroll'}],
  '齐景龙':[{n:'老剑',k:'nodist',q:'老剑无锋，剑及履及。',f:'sword'},
            {n:'齐',k:'reduce',v:1,o:'turn',q:'齐姓一家，同生共死。',f:'shield'}],
  '隋右边':[{n:'右边',k:'reduce',v:1,o:'turn',q:'右边有我。',f:'shield'},
            {n:'隋',k:'flavor',q:'隋家的人，不后退。',f:'shield'}],
  '陆芝':[{n:'抱朴',k:'act',a:'give',q:'抱朴守拙，赠与同道。',f:'lotus'},
          {n:'北斗',k:'deathally',v:2,q:'北斗主死，我先走一步。',f:'lotus'}],
  '持剑者':[{n:'至高',k:'immune',v:'lang',q:'万剑之源，不可言说。',f:'aura'},
            {n:'剑源',k:'atk',v:1,q:'天下万剑，皆出我手。',f:'sword'}],
  '陈熙':[{n:'熙',k:'equipUp',v:1,q:'祭炼之剑，日益锋锐。',f:'forge'},
          {n:'城',k:'hitdraw',v:1,q:'剑出，气自回。',f:'sword'}],
  '萧𢙏':[{n:'𢙏',k:'hitextra',q:'一剑未尽，再来一剑。',f:'sword'}],
  mihu:[{n:'守门',k:'reduce',v:1,o:'turn',q:'米家守门，寸步不移。',f:'shield'},
        {n:'米家',k:'atk',v:1,c:'mang',q:'米家剑，斩妖。',f:'blood'}],
  nalanyexing:[{n:'夜行',k:'atk',v:1,c:'far',q:'夜行者，无声而至。',f:'sword'},
               {n:'纳兰',k:'hand',v:1,q:'纳兰家的人，从不多言。',f:'aura'}],

  /* ---------- 中土文庙 ---------- */
  qijingchun:[{n:'教化',k:'act',a:'jiaohua',q:'遇事不决，可问春风。',qo:1,f:'scroll'},
              {n:'护道',k:'reduce',v:1,o:'turn',q:'我为你护道。',f:'shield'}],
  lisan:[{n:'礼法',k:'immune',v:'trick',q:'无规矩，不成方圆。',f:'scroll'},
         {n:'规矩',k:'judge',v:1,q:'此乃礼圣所定。',f:'scroll'}],
  '老秀才':[{n:'文',k:'hand',v:1,q:'读书人的事，能算偷么。',f:'scroll'},
                        {n:'圣',k:'startcard',v:1,q:'人人皆可读书。',f:'scroll'}],
  '亚圣':[{n:'守礼',k:'immune',v:'trick',o:'once',q:'守礼，即守心。',f:'scroll'},
          {n:'亚',k:'judge',v:1,q:'亚圣在此。',f:'scroll'}],
  '至圣先师':[{n:'至圣',k:'draw',v:1,q:'有教无类。',qo:1,f:'scroll'},
              {n:'先师',k:'deathfac',v:1,q:'薪火相传，不可断绝。',f:'lotus'}],
  '崔瀺':[{n:'算无遗策',k:'act',a:'suanji',q:'我崔瀺，算无遗策。',f:'rune'},
          {n:'国士无双',k:'killdraw',v:1,q:'国士无双，当如是。',f:'aura'}],
  '崔诚':[{n:'传道',k:'act',a:'give',q:'道，是要传下去的。',f:'scroll'},
          {n:'严教',k:'reduce',v:1,o:'turn',q:'严师出高徒。',f:'scroll'}],
  '崔东山':[{n:'观棋',k:'act',a:'peek',q:'观棋不语真君子。',f:'rune'},
            {n:'分身',k:'deathsave',q:'此身非我身。',f:'rune'}],
  '君倩':[{n:'君子',k:'atkLimit',v:1,q:'君子不争，争则必胜。',f:'sword'},
          {n:'倩',k:'reduce',v:1,c:'ru',q:'君子之交，淡如水。',f:'shield'}],
  '周澄':[{n:'澄',k:'jSwap',q:'澄澈见底，方见本心。',f:'scroll'},
          {n:'文',k:'judge',v:1,q:'文章千古事。',f:'scroll'}],
  '李宝瓶':[{n:'宝瓶',k:'draw',v:1,q:'宝瓶里装着好多问题。',f:'scroll'},
            {n:'问学',k:'act',a:'give',q:'我要问个明白！',f:'scroll'}],
  '林守一':[{n:'守一',k:'judge',v:1,q:'守一，而万事毕。',f:'scroll'},
            {n:'算',k:'judge',v:1,q:'算学一道，我最擅长。',f:'scroll'}],
  '张山峰':[{n:'山峰',k:'reduce',v:1,o:'once',q:'山就在那里。',f:'shield'},
            {n:'厚',k:'hand',v:1,q:'厚德载物。',f:'shield'}],
  '宋集薪':[{n:'集薪',k:'hand',v:2,q:'集薪，为的是烧得更旺。',f:'scroll'},
            {n:'弃文',k:'useAs',a:'any>basic',q:'文章，弃了也罢。',f:'scroll'}],
  '杨老头':[{n:'棋',k:'jChange',q:'落子无悔。',f:'rune'},
            {n:'师',k:'reduce',v:1,o:'once',q:'先生教过我的。',f:'shield'}],
  '李槐':[{n:'槐',k:'draw',v:1,q:'我李槐，也是要问学的。',f:'scroll'},
          {n:'问学',k:'act',a:'give',q:'先生，我有问题。',f:'scroll'}],
  '李希圣':[{n:'希圣',k:'draw',v:1,q:'希圣希贤，希天希道。',f:'scroll'},
            {n:'兄',k:'reduce',v:1,o:'turn',q:'妹妹莫怕，兄长在。',f:'shield'}],
  '赵繇':[{n:'繇印',k:'judge',v:1,q:'繇印在手，规矩在心。',f:'scroll'},
          {n:'静春',k:'reduce',v:1,o:'once',q:'先生的道理，我记着。',f:'shield'}],
  '宋长镜':[{n:'长镜',k:'atk',v:1,q:'大骊武夫，宋长镜。',f:'sword'},
            {n:'武运',k:'reduce',v:1,o:'turn',q:'武运昌隆。',f:'shield'}],

  /* ---------- 蛮荒天下 ---------- */
  zhoumi:[{n:'算计',k:'act',a:'suanji',q:'天下大局，尽在彀中。',f:'rune'},
          {n:'化外',k:'immune',v:'lang',q:'化外之地，无有王法。',f:'mist'}],
  baize:[{n:'通晓',k:'act',a:'peek',q:'天下万妖，我尽知晓。',f:'rune'},
         {n:'旁观',k:'reduce',v:1,o:'turn',q:'我只旁观，不动手。',f:'mist'}],
  '刘重润':[{n:'龙女',k:'deathsave',q:'龙女不死。',f:'lotus'},
            {n:'润',k:'act',a:'give',q:'润物细无声。',f:'lotus'}],
  '之祠':[{n:'神祠',k:'regen',v:1,q:'神祠受香火，自当庇护。',f:'lotus'},
          {n:'祠',k:'useAs',a:'trick>dodge',q:'祠中自有庇护。',f:'shield'}],
  '斐然':[{n:'画',k:'act',a:'forge',q:'画中自有天地。',f:'rune'},
          {n:'妖',k:'atk',v:1,c:'ru',q:'妖，本就该吃人。',f:'blood'}],
  '老瞎子':[{n:'盲',k:'nodist',q:'眼盲，心不盲。',f:'sword'},
            {n:'老',k:'reduce',v:1,o:'once',q:'活了这么久，还死不了。',f:'shield'}],
  '托月山':[{n:'山',k:'regen',v:1,q:'托月山，万年不动。',f:'aura'},
            {n:'托月',k:'reflect',v:1,o:'once',q:'伤我者，必受其反。',f:'blood'}],
  '纳兰烧苇':[{n:'烧苇',k:'atk',v:1,q:'一把火烧了这片苇荡。',f:'flame'},
              {n:'苇',k:'atk',v:1,c:'qing',q:'火借风势。',f:'flame'}],
  '老聋儿':[{n:'聋',k:'immune',v:'lang',q:'我听不见。',f:'aura'},
            {n:'儿',k:'hand',v:1,q:'老儿我，还硬朗。',f:'aura'}],
  '仰止':[{n:'仰',k:'range',v:1,q:'高山仰止。',qo:1,f:'aura'},
          {n:'止',k:'nododge',q:'景行行止。',qo:1,f:'sword'}],
  '龙君':[{n:'龙君',k:'auraAtk',v:1,c:'faction',q:'蛮荒之主，在此。',f:'mist'},
          {n:'君',k:'deathally',v:2,q:'蛮荒不灭。',f:'mist'}],
  '搬山猿':[{n:'搬山',k:'atk',v:1,q:'搬山！',f:'aura'},
            {n:'猿',k:'deathsave',q:'我乃正阳山供奉。',f:'aura'}],
  /* 旧十四王座·补齐十席 */
  '刘叉':[{n:'问剑',k:'nododge',q:'阿良，少不了你一剑。',f:'sword'},
          {n:'佩刀',k:'hitdraw',v:1,q:'刀在腰，剑在背。',f:'sword'}],
  '袁首':[{n:'搬山',k:'atk',v:1,q:'此山，我搬走了。',f:'aura'},
          {n:'石珠',k:'deathsave',q:'一子一山。',f:'aura'}],
  '五嶽':[{n:'六臂',k:'atkLimit',v:1,q:'三头六臂，各持一招。',f:'blood'},
          {n:'神到',k:'reduce',v:1,o:'turn',q:'陈清都那一剑，也未杀我。',f:'shield'}],
  '牛刀':[{n:'金甲',k:'reduce',v:1,o:'turn',q:'金甲是护甲，也是牢笼。',f:'shield'},
          {n:'蛮牛',k:'atk',v:1,q:'我也曾登过托月山。',f:'blood'}],
  '白莹':[{n:'枯骨',k:'deathally',v:1,q:'白骨堆成座，坐的是我。',f:'mist'},
          {n:'傀儡',k:'hand',v:1,q:'死人也能听令。',f:'mist'}],
  '绯妃':[{n:'水运',k:'regen',v:1,q:'天下水运，归我掌中。',f:'aura'},
          {n:'蛇蜕',k:'reduce',v:1,o:'once',q:'蜕一层皮，又是一条命。',f:'shield'}],
  '曜甲':[{n:'金精',k:'equipUp',v:1,q:'金精王座，天下最大的铜钱。',f:'forge'},
          {n:'倒悬',k:'reduce',v:1,o:'once',q:'山头朝地，山根朝天。',f:'shield'}],
  '切韵':[{n:'养剑葫',k:'hitextra',q:'葫里养的，都是剑仙。',f:'sword'},
          {n:'面皮',k:'immune',v:'lang',q:'这张脸，本不是我的。',f:'mist'}],
  '黄鸾':[{n:'洞府',k:'equipUp',v:1,q:'仙家洞府，我炼了一库。',f:'forge'},
          {n:'鸾翼',k:'range',v:1,q:'飞得高，才看得远。',f:'aura'}],
  '荷花庵主':[{n:'月魄',k:'regen',v:1,q:'蛮荒三月，我取其半。',f:'aura'},
              {n:'庵主',k:'judge',v:1,q:'贫道坐于此。',f:'lotus'}],

  /* ---------- 青冥天下 ---------- */
  daozu:[{n:'道法自然',k:'act',a:'daoziran',q:'道法自然。',qo:1,f:'rune'},
         {n:'无为',k:'reduce',v:1,o:'turn',q:'无为而无不为。',qo:1,f:'aura'}],
  '余斗':[{n:'斗转',k:'judge',v:1,q:'斗转星移。',f:'star'},
          {n:'星移',k:'range',v:1,q:'星移物换。',f:'star'}],
  '陆沉':[{n:'一气化三清',k:'act',a:'sanqing',q:'一气化三清。',qo:1,f:'rune'},
          {n:'沉静',k:'judge',v:1,q:'沉静如水。',f:'aura'}],
  '玉圭':[{n:'玉圭',k:'equipUp',v:1,q:'玉圭在手，号令群仙。',f:'aura'},
          {n:'清',k:'judge',v:1,q:'清静无为。',f:'aura'}],
  longhushan:[{n:'天师',k:'draw',v:1,q:'龙虎山天师，在此。',f:'rune'},
              {n:'斩龙',k:'atk',v:1,c:'mang',q:'斩妖除魔，本分事。',f:'thunder'}],

  /* ---------- 莲花天下 ---------- */
  fozu:[{n:'因果',k:'reflect',v:1,o:'turn',q:'一饮一啄，莫非前定。',qo:1,f:'lotus'},
        {n:'慈悲',k:'regen',v:1,q:'慈悲为怀。',f:'lotus'}],

  /* ---------- 散修 ---------- */
  chenpingan:[{n:'守拙',k:'dodgeAs',q:'我陈平安，只会一些笨功夫。',f:'shield'},
              {n:'问心',k:'judge',v:1,q:'遇事不决，可问本心。',f:'scroll'},
              {n:'攒劲',k:'hand',v:1,q:'攒着劲儿，慢慢来。',f:'aura'}],
  caoci:[{n:'慈',k:'regen',v:1,q:'武夫之慈，亦是慈。',f:'aura'},
         {n:'武',k:'atk',v:1,q:'武道一途，唯有向前。',f:'blood'}],
  '阮秀':[{n:'炼器',k:'act',a:'forge',q:'铸剑这件事，我比谁都懂。',f:'forge'},
          {n:'火属',k:'atk',v:1,c:'mang',q:'此火，可燎原。',f:'flame'}],
  '火龙真人':[{n:'铸剑',k:'startequip',q:'火龙真人，铸剑千年。',f:'forge'},
              {n:'火德',k:'equipUp',v:1,q:'火德星君，在此。',f:'flame'}],
  '裴钱':[{n:'钱',k:'draw',v:1,q:'我裴钱，最会算账。',f:'aura'},
          {n:'学徒',k:'atk',v:1,c:{with:'陈平安'},q:'师父说的，我都记着。',f:'sword'}],
  '刘羡阳':[{n:'炼',k:'atk',v:1,c:'mang',q:'炼剑炼人，一样的。',f:'forge'},
            {n:'阳',k:'reduce',v:1,o:'turn',q:'我姓刘，名羡阳。',f:'shield'}],
  '李二':[{n:'武夫',k:'atk',v:1,q:'天下武夫，止境第一。',f:'blood'},
          {n:'二',k:'reduce',v:1,o:'turn',q:'李二在此。',f:'shield'}],
  '李柳':[{n:'柳',k:'hand',v:1,q:'柳絮随风。',f:'aura'},
          {n:'柔',k:'reduce',v:1,o:'turn',q:'柔能克刚。',f:'shield'}],
  '朱敛':[{n:'敛',k:'hand',v:1,q:'敛财敛物，不如敛心。',f:'aura'},
          {n:'管家',k:'act',a:'give',q:'落魄山的管家，朱敛。',f:'aura'}],
  '姜尚真':[{n:'尚真',k:'judge',v:1,q:'尚真，尚真。',f:'scroll'},
            {n:'真',k:'immune',v:'lang',q:'真人不露相。',f:'aura'}],
  '姜赦':[{n:'赦',k:'reduce',v:1,o:'once',q:'赦，即是不杀。',f:'lotus'}],
  '南簪':[{n:'簪',k:'draw',v:1,q:'一支簪子，也能杀人。',f:'sword'},
          {n:'南',k:'hand',v:1,q:'南簪，南簪。',f:'aura'}],
  '卢白象':[{n:'白象',k:'reduce',v:1,o:'turn',q:'白象负重，行稳致远。',f:'shield'},
            {n:'卢',k:'atk',v:1,c:'mang',q:'卢氏武夫，白象在身。',f:'blood'}],
  '刘灞桥':[{n:'灞桥',k:'reduce',v:1,o:'turn',q:'灞桥折柳，送君千里。',f:'shield'}],
  '谢松花':[{n:'松花',k:'regen',v:1,q:'松花酿酒，春水煎茶。',f:'lotus'},
            {n:'谢',k:'hand',v:1,q:'谢家的女儿。',f:'aura'}],
  '谢狗':[{n:'狗',k:'atk',v:1,c:'low',q:'狗急了，也咬人。',f:'blood'}],
  '贺小凉':[{n:'小凉',k:'jReroll',q:'小凉，凉的是心。',f:'shield'}],
  '赊月':[{n:'赊',k:'draw',v:1,q:'赊月色，赊风声。',f:'aura'}],
  '郑居中':[{n:'居中',k:'judge',v:1,q:'居中，则不偏不倚。',f:'scroll'},
            {n:'郑',k:'hand',v:1,q:'郑居中，居中而立。',f:'aura'}],
  '郭竹酒':[{n:'竹酒',k:'regen',v:1,q:'竹酒一壶，敬此山河。',f:'lotus'},
            {n:'郭',k:'draw',v:1,q:'郭家的酒，管够。',f:'aura'}],
  '长命':[{n:'长命',k:'deathsave',q:'长命，长命百岁。',f:'lotus'}],
  '徐远霞':[{n:'远霞',k:'range',v:1,q:'远霞孤鹜，秋水长天。',f:'sword'},
            {n:'徐',k:'hand',v:1,q:'徐徐图之。',f:'aura'}],
  '小陌':[{n:'陌',k:'draw',v:1,q:'陌上花开，可缓缓归矣。',f:'lotus'}],
  '苏稼':[{n:'稼',k:'regen',v:1,q:'耕读传家，稼穑为本。',f:'lotus'}],
  '裴杯':[{n:'杯',k:'act',a:'give',q:'一杯酒，敬同道。',f:'aura'}],
  '陈景清':[{n:'景清',k:'judge',v:1,q:'景清，心清。',f:'scroll'}],
  '陈暖树':[{n:'暖树',k:'regen',v:1,q:'暖树栖鸦，各自安好。',f:'lotus'}],
  '隋景澄':[{n:'景澄',k:'reduce',v:1,o:'turn',q:'景澄，心澄。',f:'shield'},
            {n:'隋',k:'flavor',q:'隋家的人，不后退。',f:'shield'}],
  '魏檗':[{n:'山君',k:'reduce',v:1,o:'turn',q:'山君在此，百兽退避。',f:'aura'},
          {n:'檗',k:'atk',v:1,c:'mang',q:'檗木虽苦，可斩妖邪。',f:'blood'}],
  '魏羡':[{n:'羡',k:'draw',v:1,q:'羡，是羡慕，也是多余。',f:'aura'}],
  '黄庭':[{n:'黄庭',k:'equipUp',v:1,q:'黄庭一卷，诵读不辍。',f:'scroll'}],
  '周海镜':[{n:'海镜',k:'act',a:'peek',q:'海镜照心，无所遁形。',f:'rune'}],
  '周米粒':[{n:'米粒',k:'draw',v:1,q:'米粒虽小，也能果腹。',f:'aura'}],
  '石柔':[{n:'蜕',k:'reduce',v:1,o:'once',q:'这身皮囊，原是替人挡灾用的。',f:'shield'},
          {n:'窥',k:'judge',v:1,q:'这双眼睛，曾被人借去看落魄山。',f:'aura'}],
  '稚圭':[{n:'稚圭',k:'regen',v:1,q:'稚圭，稚圭。',f:'lotus'}],
  '宋雨烧':[{n:'雨烧',k:'atk',v:1,q:'雨中烧火，烧不尽。',f:'flame'}],
  '沛湘':[{n:'沛',k:'draw',v:1,q:'沛然莫御。',f:'aura'},
          {n:'湘',k:'hand',v:1,q:'湘水悠悠。',f:'aura'}],
  '柳柔':[{n:'柔',k:'reduce',v:1,o:'turn',q:'柔，是柳的本分。',f:'shield'}],
  '陆台':[{n:'陆台',k:'judge',v:1,q:'陆台高筑，望远。',f:'scroll'}],
  '马苦玄':[{n:'苦玄',k:'reduce',v:1,o:'turn',q:'苦，是修行的本分。',f:'shield'},
            {n:'玄',k:'judge',v:1,q:'玄之又玄，众妙之门。',qo:1,f:'rune'}],
  '于玄':[{n:'于玄',k:'judge',v:1,q:'于玄，于玄。',f:'rune'}],
  '吴霜降':[{n:'霜降',k:'atk',v:1,c:'low',q:'霜降，则万物收藏。',f:'sword'}],
  '苏心斋':[{n:'心斋',k:'immune',v:'lang',q:'心斋坐忘。',qo:1,f:'aura'}],
  '郦彩':[{n:'郦彩',k:'draw',v:1,q:'郦彩，郦彩。',f:'aura'}],
  '阮邛':[{n:'铸剑',k:'startequip',q:'铸剑师阮邛，在此。',f:'forge'},
          {n:'护女',k:'reduce',v:1,o:'turn',q:'谁敢动我女儿。',f:'shield'}],
  '蔡金简':[{n:'断桥',k:'atk',v:1,q:'长生桥，断。',f:'sword'},
            {n:'金简',k:'nododge',q:'正阳山蔡金简。',f:'sword'}],
  '董水井':[{n:'井',k:'draw',v:1,q:'井水不犯河水。',f:'aura'},
            {n:'商',k:'hand',v:1,q:'商人重利，也重义。',f:'aura'}],
  '顾粲':[{n:'棋子',k:'act',a:'qizi',q:'哥，我下棋从没输过。',f:'rune'},
          {n:'蛊',k:'reflect',v:1,o:'once',q:'书简湖的规矩，是弱肉强食。',f:'blood'}],
  liulaocheng:[{n:'书简湖',k:'hand',v:1,q:'湖里的规矩，不是一天立起来的。',f:'aura'},
               {n:'老成',k:'judge',v:1,q:'老成，是活出来的。',f:'scroll'}],
  liujinglong:[{n:'规矩',k:'nodist',q:'规矩既定，剑不可挡。',f:'sword'},
               {n:'守序',k:'taunt',q:'同袍有难，我来。',f:'aura'}],
  xunyuan:[{n:'一尺枪',k:'atk',v:1,q:'一尺枪，一寸短一寸险。',f:'sword'},
           {n:'余家贫',k:'reduce',v:1,o:'turn',q:'余家贫，守得住。',f:'shield'}],
  /* ---------- 以下为补齐「描述有技能却未注册」的白板角色（忠于原著设定） ---------- */
  xieshi:[{n:'君子',k:'nododge',q:'礼圣门下，剑不可挡。',f:'sword'},
          {n:'礼剑',k:'hand',v:1,q:'礼者，立人也。',f:'scroll'}],
  laojiao:[{n:'古',k:'judge',v:1,q:'老蛟活了千年，道理见得多。',f:'mist'},
           {n:'执拗',k:'reduce',v:1,q:'蛮荒旧龙，性子最拗。',f:'shield'}],
  xianzhu:[{n:'邻',k:'act',a:'give',q:'远亲不如近邻。',f:'lotus'},
           {n:'暖',k:'hand',v:1,c:{with:'chenpingan'},q:'陈平安在，便暖了。',f:'aura'}],
  yuyue:[{n:'惊鸟',k:'range',v:1,q:'惊鸟一飞，电抹长空。',f:'sword'},
         {n:'百花',k:'hand',v:1,q:'百花满江河。',f:'sword'}],

  /* ---------- 落魄山（后补 · 原著可考） ---------- */
  '曹晴朗':[{n:'三元',k:'draw',v:1,q:'',f:'scroll'},
            {n:'读书',k:'judge',v:1,q:'',f:'aura'}],
  '赵树下':[{n:'百万拳',k:'atk',v:1,q:'',f:'aura'},
            {n:'走桩',k:'draw',v:1,q:'',f:'aura'}],
  '宁吉':[{n:'道胎',k:'draw',v:1,q:'',f:'rune'},
          {n:'开卷',k:'judge',v:1,q:'',f:'scroll'}],
  '邓剑枰':[{n:'开山',k:'atk',v:1,q:'',f:'sword'},
            {n:'文脉',k:'judge',v:1,q:'',f:'scroll'}],
  '袁黄':[{n:'金身',k:'reduce',v:1,q:'',f:'shield'},
          {n:'诚拳',k:'atk',v:1,q:'',f:'aura'}],
  '郑大风':[{n:'守门',k:'reduce',v:1,q:'',f:'shield'},
            {n:'大霜',k:'draw',v:1,q:'',f:'aura'}],
  '韦文龙':[{n:'术算',k:'draw',v:1,q:'',f:'rune'},
            {n:'泉府',k:'hand',v:1,q:'',f:'aura'}],

};

/* ---------- 查询 API ---------- */
let SKILLS_ON = true;   // 全角色技能引擎总开关（供平衡对照采样）
let SKILL_OFF = {};     // 消融实验：{kind:true} 临时停用某类技能
function skillsOf(p){
  if(!SKILLS_ON) return [];
  const a = (p && SKILLS[p.key]) || [];
  // 包袱斋：随身法宝与悟道印记（由 bfApplyLoadout 注入），与角色技共用同一查询口径
  const ex = (p && p.extraSkills) || null;
  const all = ex && ex.length ? a.concat(ex) : a;
  if(!Object.keys(SKILL_OFF).length) return all;
  return all.filter(s=>!SKILL_OFF[s.k]);
}
function nameMatches(q, ref){ return q.key===ref || q.name===ref; }
function condOk(p, c, t){
  if(!c) return true;
  if(typeof c === 'string'){
    switch(c){
      case 'mang':  return !!t && t.faction==='蛮荒天下';
      case 'ru':    return !!t && t.faction==='中土文庙';
      case 'qing':  return !!t && t.faction==='青冥天下';
      case 'lotus': return !!t && t.faction==='莲花天下';
      case 'far':   return !!t && isFar(p, t);
      case 'third': return !!p && (p._atkThisTurn||0)>=3;
      case 'low':   return !!p && p.hp<=1;
      case 'hurt':  return !!p && p.hp<p.maxHp;
    }
    return true;
  }
  if(c.with) return state.players.some(q=>q.alive && q.id!==p.id && nameMatches(q, c.with));
  return true;
}
function usedFlag(p, s){
  const b = s.n || s.k;
  if(s.o==='turn') return !!p['_sk_'+b+'_r'+state.round];
  return !!p['_sk_'+b];
}
function markUsed(p, s){
  const b = s.n || s.k;
  if(s.o==='turn') p['_sk_'+b+'_r'+state.round] = 1;
  else p['_sk_'+b] = 1;
}
function equipUpOf(p){ return sumK(p,'equipUp'); }
/* 剑气伤害加成明细：[{n 来源, v 数值}]，用于战报归属与悬停说明 */
function atkBonusParts(p, t){
  const out = [];
  if(p.equip) out.push({ n:'本命飞剑', v:1 + equipUpOf(p) });
  if(p.wineActive) out.push({ n:'饮者', v:1 });
  if(p.baiyeBonus>0) out.push({ n:'诗剑', v:p.baiyeBonus });
  if(p.key==='caoci') out.push({ n:'武', v:1 });
  for(const sk of skillsOf(p)){
    if(sk.k!=='atk' && sk.k!=='auraAtk') continue;
    if(sk.o==='once' && usedFlag(p,sk)) continue;
    if(!condOk(p, sk.c, t)) continue;
    if(sk.k==='auraAtk' && sk.c==='faction') continue;   // 光环另计
    out.push({ n:sk.n, v:(sk.v||0) });
  }
  const au = auraAtk(p, t);
  if(au) out.push({ n:'阵营光环', v:au });
  if(t && t.faction !== p.faction
     && aliveOthers(p).some(q=>q.faction===p.faction && q.id!==t.id)) out.push({ n:'齐心', v:1 });
  return out;
}
/* 技能的人类可读说明（悬停/人物卡用） */
function skillText(p){
  return (SKILLS[p.key]||[]).map(s=>{
    const K = { atk:'剑气伤害', atkLimit:'每回合多出一剑', hand:'手牌上限', draw:'摸牌阶段多摸',
      judge:'判定点数', range:'攻击范围', nodist:'剑气无视距离', nododge:'剑气不可被守心',
      reduce:'受伤减免', reflect:'受伤害反弹', immune:'免疫锦囊', taunt:'嘲讽（须先过其关）',
      regen:'回合末回气', hitdraw:'命中后摸牌', hitextra:'命中后可再出一剑',
      deathsave:'濒死弃 2 牌自救', deathally:'阵亡时队友摸牌', deathfac:'阵亡时同阵营回气',
      killdraw:'击杀后摸牌', startcard:'开局全场得牌', startequip:'开局得本命飞剑',
      equipUp:'装备效果强化', act:'主动技', useAs:'牌可转化使用', dodgeAs:'弃牌当守心',
      auraAtk:'同阵营全体剑气加成', flavor:'—',
      jSwap:'判定阶段可替换判定牌', jChange:'可改他人判定牌', jReroll:'判定牌可重掷' };
    const C = { mang:'（对蛮荒）', ru:'（对中土文庙）', qing:'（对青冥）', lotus:'（对莲花）',
      far:'（攻击范围外）', third:'（本回合第三剑）', low:'（自身残血时）', hurt:'（自身已伤时）',
      faction:'（同阵营）' };
    const lim = s.o==='once' ? '，每局限一次' : (s.o==='turn' ? '，每回合限一次' : '');
    return { n:s.n, k:s.k, q:s.q, qo:!!s.qo,
      txt:K[s.k] + (s.v ? ' +'+s.v : '') + (C[s.c]||'') + lim };
  });
}
/* 阵营光环：存活同阵营者的 auraAtk 全体加成（如龙君领蛮荒） */
function auraAtk(p, t){
  let v = 0;
  if(!state || !state.players) return 0;
  for(const q of state.players){
    if(!q.alive || q.id===p.id) continue;
    for(const s of skillsOf(q)){
      if(s.k!=='auraAtk') continue;
      if(s.o==='once' && usedFlag(q,s)) continue;
      if(s.c==='faction' && q.faction!==p.faction) continue;
      if(!condOk(q, s.c, t)) continue;
      v += (s.v||0);
    }
  }
  return v;
}
function judgePoint(p, card){ return cardPoint(card) + sumK(p,'judge'); }
function sumK(p, k, t){
  if(!p) return 0;
  let v = 0;
  for(const s of skillsOf(p)){
    if(s.k!==k) continue;
    if(s.o==='once' && usedFlag(p,s)) continue;
    if(!condOk(p, s.c, t)) continue;
    v += (s.v||0);
  }
  return v;
}
function hasK(p, k, t){
  if(!p) return false;
  for(const s of skillsOf(p)){
    if(s.k!==k) continue;
    if(s.o==='once' && usedFlag(p,s)) continue;
    if(condOk(p, s.c, t)) return true;
  }
  return false;
}
function firstK(p, k, t){
  if(!p) return null;
  for(const s of skillsOf(p)){
    if(s.k!==k) continue;
    if(s.o==='once' && usedFlag(p,s)) continue;
    if(condOk(p, s.c, t)) return s;
  }
  return null;
}
/* 座次距离：1 = 相邻 */
function distOf(a, b){
  if(!state || !state.players.length) return 1;
  const n = state.players.length;
  const d = Math.abs(a.id - b.id);
  return Math.min(d, n - d);
}
function isFar(p, t){
  if(hasK(p,'nodist')) return false;
  return distOf(p, t) > (1 + sumK(p,'range'));
}
/* 技能喊话：出招/触发时飘一句 */
function skillShout(p, s){
  if(!s || !s.q) return;
  log('【'+s.n+'】'+p.name+'：'+s.q, 'big');
  if(isFlagship(p) || s.f==='sword' || s.f==='blood') shout(s.n, '#e8c66a');
  skillFx(p, s);
  figScene(p, s);
}
/* ---------- 「画意」整幅水墨场景（figfx.js） ----------
 * 全屏图案分量很重，不能每次判定都放。门槛：
 *   1) 只给旗舰角色 / 主动技 / 原著原话的招式上画意；
 *   2) 全局冷却，默认 5.6s，签名牌可自带更短的 cd。 */
var _figCd = 0;
function figFig(name, line, opt){
  if(typeof FigFx === 'undefined' || !FigFx || !FigFx.play) return false;
  opt = opt || {};
  const cd = (opt.cd == null) ? 5600 : opt.cd;
  const now = Date.now();
  if(now - _figCd < cd) return false;
  _figCd = now;
  /* 画意是可选层，任何异常都不许冒泡到技能结算链上 */
  try { FigFx.play(name, { line: line || '', dur: opt.dur }); }
  catch (err) { return false; }
  return true;
}
/* 技能 -> 画意：够分量的招式才配一整幅图，台词直接当题字 */
function figScene(p, s){
  if(!s || !s.f) return false;
  if(!(isFlagship(p) || s.a || s.qo)) return false;
  return figFig(s.f, s.q || s.n || '');
}
/* 水墨横扫转场。同样是可选层，绝不能把 nextWave 这类主流程给拖宕 */
function juiceWipe(){
  try { if(typeof Juice !== 'undefined' && Juice && Juice.wipe) Juice.wipe(); }
  catch (err) {}
}
/* 技能特效 */
function skillFx(p, s){
  const f = (s && s.f) || 'aura';
  const id = p.id;
  switch(f){
    case 'sword':  fxSwordQi(id, p.faction); break;
    case 'shield': fxShieldEx(id); break;
    case 'lotus':  fxLotus(id, 12); break;
    case 'flame':  fxFlame(id); break;
    case 'thunder':fxThunder(id); SFX.thunder(); break;
    case 'mist':   fxMist(10); SFX.mist(); break;
    case 'rune':   fxTrickOpen(id); SFX.rune(); break;
    case 'forge':  fxForge(id); SFX.forge(); break;
    case 'star':   fxStar(id); break;
    case 'blood':  fxBlood(id, 3); break;
    case 'scroll': fxScroll(id); break;
    default:       fxAura(id);
  }
}
function fxFlame(id){
  const r = rectOf(id);
  for(let i=0;i<14;i++){
    spawnFx('fx-flame', {
      left:(r.left + r.width/2 - 26 + Math.random()*52) + 'px',
      top:(r.top + r.height*0.72) + 'px',
      '--dx':(Math.random()*44-22).toFixed(0) + 'px',
      '--dy':(-50 - Math.random()*70).toFixed(0) + 'px',
      '--sz':(10 + Math.random()*14).toFixed(0) + 'px',
      animationDelay:(Math.random()*0.4).toFixed(2) + 's'
    }, 1200);
  }
  SFX.forge();
}
function fxStar(id){
  const r = rectOf(id);
  for(let i=0;i<10;i++){
    const a = (Math.PI*2/10)*i;
    spawnFx('fx-spark', {
      left:(r.left + r.width/2) + 'px', top:(r.top + r.height/2) + 'px',
      '--dx':(Math.cos(a)*62).toFixed(0) + 'px', '--dy':(Math.sin(a)*62).toFixed(0) + 'px',
      '--sc':'#bfe3ff', animationDelay:(i*0.04).toFixed(2) + 's'
    }, 1100);
  }
  fxAura(id);
}


/* ===================== 状态 ===================== */
let state = null;
let pendingFx = [];
let pendingBlur = null;

function newStats(){ return { kills:0, dmg:0, taken:0, heal:0 }; }

function makePlayer(key, id, side){
  let c = CHARS[key];
  if(!c){
    // key 与 CHARS 不一致时（旗舰用拼音 key、其余用中文名，极易混写），
    // 先按「人物名」回退匹配，再兜底，避免静默崩在 c.name 上。
    const alt = Object.keys(CHARS).find(k=>CHARS[k].name === key);
    if(alt){ key = alt; c = CHARS[key]; }
  }
  if(!c){ c = CHARS.chenpingan; key = 'chenpingan'; }
  /* 座位号：全局递增的入场序，所有模式/siege 新生敌人/boss 都拿到唯一号
     ——绝不复用，绝不重号；阵亡、离场、被替换都保留旧号 */
  let seatNo = 0;
  if(state){
    state.seatCounter = (state.seatCounter|0);
    state.seatCounter++;
    seatNo = state.seatCounter;
  }
  return {
    id, key, side:side||null,
    name:c.name, faction:c.faction,
    hp:c.hp, maxHp:c.hp, realm:c.realm,
    hand:[], equip:null, alive:true,
    skills: c.skills || [],
    wineActive:false, baiyeBonus:0, noDodgeFrom:new Set(),
    caociUsed:false, chenqingduUsed:false, lisanTrickUsed:false,
    flagship: c.flagship === true, talent: c.talent || null,
    lifestealUsed:false, wuweiUsed:false, jiyuanUsed:false, fengmangUsed:false,
    attackUsed:0, stats:newStats(),
    // 连击：同一回合内每成功命中一次即累加；第 2 次起每层 +1 伤害（上限 +2）
    hitThisTurn:0, combo:0,
    seatNo,
  };
  // 落魄山联动：若此角色曾在经营中受训，依其境界增益气血
  const sa = loadSectAllies();
  if(sa && sa[p.name]){
    const add = Math.min(6, sa[p.name].realm * 2);   // 练气+0 … 飞升+6（上限）
    p.maxHp += add; p.hp = p.maxHp;
    p.sectTrained = sa[p.name];
  }
  return p;
}

/* 模式：
 *   hot   群雄论剑 —— 2-5 人同席热座
 *   ai    仗剑独行 —— 玩家 1 人 vs 1-3 名 AI
 *   siege 剑气长城 —— 玩家 1-2 人守城，蛮荒天下分 5 波来犯
 *   boss  天下共伐 —— 玩家 2-3 人围攻 1 名强化巨寇
 */
const MODE_META = {
  hot:   { title:'群雄论剑', minPick:2, maxPick:5 },
  ai:    { title:'仗剑独行', minPick:1, maxPick:1 },
  siege: { title:'剑气长城', minPick:1, maxPick:3 },
  boss:  { title:'天下共伐', minPick:2, maxPick:3 },
};

/* 难度：只调起手牌与巨寇气血，不动核心伤害公式，避免整体节奏失衡 */
const DIFF = {
  easy:   { key:'easy',   name:'简 单', desc:'我方起手多摸 1 张，巨寇气血 ×1.35', allyDraw:1, foeDraw:0, bossMul:1.35 },
  normal: { key:'normal', name:'普 通', desc:'依原典规矩行棋',                    allyDraw:0, foeDraw:0, bossMul:1.60 },
  hard:   { key:'hard',   name:'困 难', desc:'敌方起手多摸 1 张，巨寇气血 ×1.90', allyDraw:0, foeDraw:1, bossMul:1.90 },
};
let difficulty = 'normal';
// 战绩（本地留存）：胜/负/当前连胜/最高连胜，以及分模式统计
let record = { win:0, lose:0, streak:0, best:0, byMode:{} };
function loadSettings(){
  try{
    const d = localStorage.getItem('jianlai_diff');
    if(d && DIFF[d]) difficulty = d;
    const r = localStorage.getItem('jianlai_record');
    if(r){
      const o = JSON.parse(r);
      if(o && typeof o==='object'){
        record = { win:o.win|0, lose:o.lose|0, streak:o.streak|0, best:o.best|0, byMode:o.byMode||{} };
      }
    }
  }catch(e){ /* 无 localStorage（沙箱/隐私模式）时静默降级为默认 */ }
}
/* 落魄山联动：读取经营存档，弟子训练成果可带入对战（按角色名匹配 CHARS key） */
let _sectAllies = undefined;   // 懒加载缓存
function loadSectAllies(){
  if(_sectAllies !== undefined) return _sectAllies;
  try{ _sectAllies = JSON.parse(localStorage.getItem('jianlai_sect_allies')||'null'); }
  catch(e){ _sectAllies = null; }
  if(_sectAllies && typeof _sectAllies!=='object') _sectAllies = null;
  return _sectAllies;
}

function saveRecord(){
  try{ localStorage.setItem('jianlai_record', JSON.stringify(record)); }catch(e){}
}
function setDifficulty(k){
  if(!DIFF[k]) return;
  difficulty = k;
  try{ localStorage.setItem('jianlai_diff', k); }catch(e){}
  SFX.click();
  render();
}
function myCharsOf(mode){
  if(!state || !state.players) return [];
  return state.players.filter(function(p){
    if(mode==='siege') return p.side==='ally';
    if(mode==='boss')  return p.side==='hero';
    if(mode==='ai')    return p.id===0;
    return true;                      // hot 同席切磋：每人都是自己人
  }).map(function(p){ return p.key; });
}
function updateRecord(win, mode){
  if(win){ record.win++; record.streak++; if(record.streak > record.best) record.best = record.streak; }
  else   { record.lose++; record.streak = 0; }
  record.byMode = record.byMode || {};
  const m = record.byMode[mode] || { win:0, lose:0 };
  m[win?'win':'lose']++;
  record.byMode[mode] = m;
  saveRecord();
  // 行迹录（PC 端玩家档案）：战局计入道行、战绩、常用角色
  try{ if(typeof prRecordBattle==='function')
    prRecordBattle(!!win, mode, difficulty, (state&&state.round)||0, myCharsOf(mode)); }catch(e){}
  if(typeof bfAddCoin==='function' && typeof BF_COIN_WIN!=='undefined') bfAddCoin(win ? BF_COIN_WIN : BF_COIN_LOSE);
}

function startGame(keys, mode){
  mode = mode || 'hot';
  const D = DIFF[difficulty] || DIFF.normal;
  renderGame._overFx = false;      // 新开一局：重开结算特效

  /* 先建 state，再 makePlayer —— makePlayer 必须能读到 state 才能稳定分配 seatNo
     （原写法顺序错位：players = keys.map(makePlayer) 在 state=... 之前，
      导致首调时 state undefined，所有座位号都是 0） */
  state = {
    phase:'game', mode, human:0, diff:difficulty,
    deck:buildDeck(), discard:[], current:0, round:1, tphase:'draw',
    await:null, busy:false, log:[], over:false, win:false,
    winner:null, winnerId:-1, resultTitle:'',
    auto:false,            // 托管：开则人类座位也由 AI 代打
    sel:keys.slice(),
    wave:0, maxWave:5, pressureRound:0,
    seatCounter:0,   // 座位号全局递增（每 makePlayer 自增一次，绝不复用）
  };
  const players = keys.map((k,i)=>makePlayer(k, i, null));
  state.players = players;

  // 包袱斋：随身法宝与悟道印记随我方入场（群雄论剑为同席切磋，不带私物）
  if(typeof bfApplyLoadout==='function'){ try{ bfApplyLoadout(players, mode); }catch(e){} }
  // 行迹录：境界所得精进入局（同包袱斋纪律，hot 不注入）
  if(typeof prApplyRealm==='function'){ try{ prApplyRealm(players, mode); }catch(e){} }

  // 开局技能：全场发牌 / 专属本命飞剑
  state.players.forEach(pl=>{
    const sc = firstK(pl,'startcard');
    if(sc && !pl['_sk_'+sc.n]){ markUsed(pl,sc); state.players.forEach(q=>draw(q, sc.v||1));
      log('【'+sc.n+'】'+pl.name+' 令全场各得 '+(sc.v||1)+' 张。', 'big'); skillFx(pl,sc); }
  });
  state.players.forEach(pl=>{
    const se = firstK(pl,'startequip');
    if(se && !pl['_sk_'+se.n] && !pl.equip){
      markUsed(pl,se);
      pl.equip = { uid:++cardUid, type:'equip', name:'本命飞剑', sub:'feijian' };
      log('【'+se.n+'】'+pl.name+' 开局祭出本命飞剑。', 'big'); skillFx(pl,se);
    }
  });

  if(mode==='siege'){
    // 守城：玩家方为 ally，敌方按波次生成
    players.forEach(p=>{ p.side='ally'; });
    state.human = 0;
    state.wave = 0;
    state.players = players;
    players.forEach(p=>draw(p,4 + D.allyDraw));
    state.log = [];
    log('蛮荒叩关，剑气长城告急——守住五波！', 'sys');
    players.forEach(p=>draw(p,2));    // 守方先手优势
    nextWave();                       // 生成第 1 波（内含守方回气补牌）
    runTurn(true);
    return;
  }
  if(mode==='boss'){
    // 讨伐：玩家方为 hero，Boss 从蛮荒/飞升强者中择一，气血 ×2.5
    // 注意：必须用 CHARS 的 key。旗舰角色是拼音 key（周密 → zhoumi），
    // 其余为中文名 key（托月山、龙君）。混写会拿到 undefined。
    const BOSS_POOL = ['托月山','龙君','zhoumi','zhoumi','托月山'];
    const bossKey = BOSS_POOL[Math.floor(Math.random()*BOSS_POOL.length)];
    const boss = makePlayer(bossKey, players.length, 'boss');
    boss.maxHp = Math.round(boss.maxHp * D.bossMul);
    boss.hp = boss.maxHp;
    boss.isBoss = true;
    players.forEach(p=>{ p.side='hero'; });
    players.push(boss);
    state.players = players;
    state.log = [];
    players.forEach(p=>draw(p, 4 + (p.id===boss.id ? D.foeDraw : D.allyDraw)));
    log('共伐'+boss.name+'！巨寇气血 '+boss.maxHp+'，每轮威压渐盛。', 'big');
    runTurn(true);
    return;
  }

  // ai 为「玩家 vs AI」：按难度给双方调起手牌；hot 是同席热座，不作加减
  players.forEach(p=>{
    const isFoe = (mode==='ai' && p.id !== 0);
    draw(p, 4 + (isFoe ? D.foeDraw : (mode==='ai' ? D.allyDraw : 0)));
  });
  state.log = [];
  log('群雄聚首，剑气干云。', 'sys');
  runTurn(true);
}

/* ===================== 通用 ===================== */
function playerById(id){ return state.players.find(p=>p.id===id); }
function current(){ return state.players[state.current]; }
function alivePlayers(){ return state.players.filter(p=>p.alive); }
function aliveOthers(p){ return state.players.filter(q=>q.alive && q.id!==p.id); }
function hasAlly(pl){ return state.players.some(q=>q.alive && q.id!==pl.id && q.faction===pl.faction); }
/* 阵营对位：以 mode 决定"我方"判定
   - siege: 同 side==='ally'
   - boss:  同 side==='hero'
   - ai:    同 faction（也兼容人机 1vN）；若同阵营都被选中，则他们都算"我方队友"
   - hot:   只有自己算"我方"，其他人一律对位（保持现状） */
function isMyTeam(pl){
  if(!state || !pl) return false;
  const me = state.players[state.current];
  if(!me || pl.id===me.id) return true;          // 自己永远算我方
  if(state.mode==='siege') return me.side==='ally' && pl.side==='ally';
  if(state.mode==='boss')  return me.side==='hero' && pl.side==='hero';
  if(state.mode==='ai')    return me.faction && pl.faction===me.faction;
  return false;                                  // hot / 其他：单挑
}
/* 阵营/对位阵营名（用于侧栏小标） */
function oppSideLabel(){
  if(!state) return '对 位';
  if(state.mode==='siege') return '来犯之敌';
  if(state.mode==='boss')  return '巨寇';
  if(state.mode==='ai'){
    const me = state.players[state.current];
    const opp = state.players.find(pl=>pl.id!==state.current && pl.faction!==me.faction);
    return opp ? opp.faction : '对 位';
  }
  return '对 位';
}
function isAI(p){
  if(state.auto && isHumanSeat(p)) return true;            // 托管：人类座位也由 AI 代打
  if(state.mode==='ai')    return p.id !== state.human;   // 混战：除玩家外皆 AI
  if(state.mode==='siege') return p.side === 'foe';       // 守城：守方热座，来犯之敌皆 AI
  if(state.mode==='boss')  return p.side === 'boss';      // 讨伐：讨伐方热座，巨寇为 AI
  return false;
}
/* 人类座位（不看托管标记）：托管时仍要认出「这是谁的牌」，以便继续亮牌给玩家看 */
function isHumanSeat(p){ return state.human != null && p.id === state.human; }
/* 托管观战态：AI 代打，但人类手牌照常摊开（不可点） */
function isTrusteeView(p){ return !!(state && state.auto) && isHumanSeat(p); }
function hasCard(p,type){ return p.hand.some(c=>c.type===type); }
function countCard(p,type){ return p.hand.filter(c=>c.type===type).length; }
function findCard(p,type){ return p.hand.find(c=>c.type===type); }
function removeFromHand(p,card){ const i=p.hand.indexOf(card); if(i>=0) p.hand.splice(i,1); }
function discardCard(p,card){ removeFromHand(p,card); state.discard.push(card); }
function draw(p,n){
  let got=0;
  for(let i=0;i<n;i++){
    if(state.deck.length===0){ if(state.discard.length===0) break; state.deck=shuffle(state.discard.splice(0)); }
    p.hand.push(state.deck.pop()); got++;
  }
  if(got>0) pendingFx.push({ id:p.id, type:'draw', amt:got });
  return got;
}
function log(s, cls){ state.log.push({ t:s, c:cls||'' }); }
function realmLimit(p){ return TIER_LIMIT[p.tier || tierOf(p)] || REALM_LIMIT[p.realmOld] || 5; }
function handLimit(p){
  let n = TIER_LIMIT[p.tier || tierOf(p)] || REALM_LIMIT[p.realmOld] || 5;
  if(p.equip) n += 1 + equipUpOf(p);
  n += sumK(p,'hand');
  return n;
}
function attackLimit(p){
  let n = 1;
  if(p.equip) n += 1 + equipUpOf(p);
  n += sumK(p,'atkLimit');
  if(p.isBoss) n += 1;
  // 协作模式的玩家方「群起而攻」：多出一剑。
  // 否则手牌里剑气密度（约 28%）撑不起对巨寇/连续波次的必要输出。
  if(state && (state.mode==='boss' || state.mode==='siege') && p.side!=='foe' && p.side!=='boss') n += 1;
  return n;
}
function isBaizeBlocked(t){ return t.key==='baize'; }

/* ===================== 回合流程 ===================== */
function beginTurn(p){
  p.wineActive=false; p.baiyeBonus=0; p.noDodgeFrom=new Set();
  p.caociUsed=false;   p.lifestealUsed=false; p.wuweiUsed=false; p.attackUsed=0;
  p.jiyuanUsed=false; p.fengmangUsed=false;
  p.hitThisTurn=0; p.combo=0;            // 连击每回合清零
  p._atkThisTurn=0;
  p.judgeBuff=false;                     // 判定阶段「气势」加成，每回合清零
  draw(p,2);
  if(!isFlagship(p) && talentOf(p)==='耕读') draw(p,1);
  const _db = sumK(p,'draw'); if(_db>0){ draw(p,_db); const _ds=firstK(p,'draw'); if(_ds) log('【'+_ds.n+'】'+p.name+' 多摸 '+_db+' 张。', 'heal'); }
  log('—— '+p.name+'（'+p.faction+'）行棋 ——', 'sys');
}

// 天下共伐：巨寇威压，第 3 轮起每轮对全体讨伐者造成 1 伤
async function bossPressure(){
  if(state.mode!=='boss') return;
  if(state.round < 5 || state.pressureRound >= state.round) return;
  const boss = state.players.find(p=>p.side==='boss' && p.alive);
  if(!boss) return;
  state.pressureRound = state.round;
  const heroes = state.players.filter(p=>p.alive && p.side==='hero');
  if(!heroes.length) return;
  log('【威压】'+boss.name+' 气势如山，诸修各受 1 伤。', 'big');
  shout('威 压', '#ff8a6b');
  render();
  await sleep(300);
  for(const h of heroes){
    if(state.over) return;
    await loseHp(h, 1, '（威压）', boss);
  }
  render(); flushFx();
  await sleep(300);
}

async function runTurn(first){
  if(state.over) return;
  const p = current();
  if(!p.alive){ advanceTurn(); return; }
  state.tphase = 'draw';
  banner(p.name, first ? '入 局' : '行 棋');
  SFX.turn();
  beginTurn(p);
  render();
  await sleep(460);                    // 摸牌阶段：让横幅看得清即可
  if(state.over) return;
  // 热座模式：每回合开始前提示换手（托管时不打断）
  if(state.mode==='hot' && !state.over && !state.auto) await showHandoff(p);
  if(state.over) return;
  if(p.side==='hero') await bossPressure();
  if(state.over) return;
  await judgePhase(p);                 // 判定阶段：道心/气运，judge 类技能在此落点
  if(state.over) return;
  state.tphase = 'play';
  render();
  if(isAI(p)){
    await sleep(360);                  // AI「思量」
    await aiPlay(p);
    await sleep(260);
    if(!state.over) endTurn();
  }
}

/* ===================== 判定阶段 ===================== */
// 每回合出牌前的「判定」：抽一张判定牌，judge 类被动点数越高越易「道心通明」，
// 得本回合首张剑气 +1（气势）。此阶段也是周澄【澄】/杨老头【棋】/贺小凉【小凉】的落点。
const JP_THRESHOLD = 6;                // 判定点数门槛：无 judge 者（卡点≤5）永不得势，有 judge 者按层数获得概率
function synthJudgeCard(){             // 牌库见底时的兜底判定牌，不消耗牌库
  const T = [['dodge','守心'],['heal','丹药'],['attack','剑气'],['wine','酒'],['trick','锦囊'],['equip','本命飞剑']];
  const t = T[Math.floor(Math.random()*T.length)];
  return { uid:++cardUid, type:t[0], name:t[1], sub:(t[0]==='trick'?'duel':t[0]) };
}
function _hiCard(arr){ return arr.reduce((a,b)=> cardPoint(b)>cardPoint(a)?b:a, arr[0]); }
function _loCard(arr){ return arr.reduce((a,b)=> cardPoint(b)<cardPoint(a)?b:a, arr[0]); }
async function judgePhase(p){
  if(state.over) return;
  state.tphase = 'judge';
  banner(p.name, '判 定');
  render();
  SFX.turn();
  await sleep(380);
  if(state.over) return;

  let jc = state.deck.length ? state.deck.pop() : synthJudgeCard();
  log(p.name+' 取判定牌「'+jc.name+'」（'+cardPoint(jc)+'）。', 'sys');

  // 贺小凉【小凉】：判定牌可重掷一次（取两次中点数高者）
  if(hasK(p,'jReroll')){
    const alt = state.deck.length ? state.deck.pop() : synthJudgeCard();
    if(cardPoint(alt) > cardPoint(jc)){ state.discard.push(jc); jc = alt; log('【小凉】'+p.name+' 重掷，得「'+jc.name+'」（'+cardPoint(jc)+'）。', 'sys'); skillFx(p, firstK(p,'jReroll')); }
    else state.discard.push(alt);
  }

  // 周澄【澄】：判定阶段可将判定牌替换为自己的一张手牌（敌不过则换高牌）
  if(hasK(p,'jSwap') && p.hand.length){
    let rep = null;
    if(isAI(p)){ const best = _hiCard(p.hand); if(cardPoint(best) > cardPoint(jc)) rep = best; }
    else {
      const opts = p.hand.map(c=>({ v:c.uid, t:'以「'+c.name+'」（'+cardPoint(c)+'）替换' }));
      opts.push({ v:'keep', t:'保持「'+jc.name+'」' });
      const ch = await ask(p, p.name+'【澄】：是否以手牌替换判定牌？', opts,
        ()=>{ const b=_hiCard(p.hand); return cardPoint(b)>cardPoint(jc)?b.uid:'keep'; });
      if(ch!=='keep') rep = p.hand.find(c=>c.uid===ch);
    }
    if(rep){ state.discard.push(jc); removeFromHand(p, rep); jc = rep; log('【澄】'+p.name+' 以手牌替换判定牌，得「'+jc.name+'」（'+cardPoint(jc)+'）。', 'sys'); skillFx(p, firstK(p,'jSwap')); }
  }

  // 杨老头【棋】：任意其他存活角色的判定结算前，可改其中一张判定牌（敌则求其低、友则求其高）
  const changer = state.players.find(q=>q.alive && q.id!==p.id && hasK(q,'jChange'));
  if(changer && changer.hand.length){
    const enemy = changer.side !== p.side;
    const cur = judgePoint(p, jc);
    let rep = null;
    if(isAI(changer)){
      if(enemy && cur >= JP_THRESHOLD) rep = _loCard(changer.hand);        // 敌：正要得势，压下去
      else if(!enemy && cur < JP_THRESHOLD) rep = _hiCard(changer.hand);   // 友：将可得势，拉一把
    } else {
      const opts = changer.hand.map(c=>({ v:c.uid, t:'改判定牌为「'+c.name+'」（'+cardPoint(c)+'）' }));
      opts.push({ v:'keep', t:'不动' });
      const ch = await ask(changer, changer.name+'【棋】：改动 '+p.name+' 的判定牌？', opts,
        ()=>{ if(enemy && cur>=JP_THRESHOLD) return _loCard(changer.hand).uid; if(!enemy && cur<JP_THRESHOLD) return _hiCard(changer.hand).uid; return 'keep'; });
      if(ch!=='keep') rep = changer.hand.find(c=>c.uid===ch);
    }
    if(rep){ state.discard.push(jc); removeFromHand(changer, rep); jc = rep; log('【棋】'+changer.name+' 落子，'+p.name+' 判定牌易为「'+jc.name+'」（'+cardPoint(jc)+'）。', 'sys'); skillFx(changer, firstK(changer,'jChange')); }
  }

  const jp = judgePoint(p, jc);
  if(jp >= JP_THRESHOLD){
    p.judgeBuff = true;
    log('【道心通明】'+p.name+' 判定 '+jp+' ≥ '+JP_THRESHOLD+'，本回合剑气气势如虹（首剑 +1）。', 'big');
  } else {
    log(p.name+' 判定 '+jp+'（＜'+JP_THRESHOLD+'），道心平平。', 'sys');
  }
  state.discard.push(jc);
  render();
  await sleep(260);
}

async function endTurn(){
  if(state.over || state.busy || state.await) return;
  const p = current();
  state.tphase = 'discard';
  const over = p.hand.length - handLimit(p);
  if(over > 0){
    let drop = null;
    if(isAI(p)) drop = aiDiscard(p, over);
    else drop = await showMulti('弃牌阶段：手牌超出上限 '+handLimit(p)+' 张，需弃置 '+over+' 张', p.hand, over, '弃 置');
    if(drop && drop.length){
      drop.forEach(c=>{ removeFromHand(p,c); state.discard.push(c); });
      log(p.name+' 弃置 '+drop.map(c=>'「'+c.name+'」').join(''), 'sys');
    }
  }
  // 回合末回气
  const rg = firstK(p,'regen');
  if(rg && p.alive && p.hp < p.maxHp){
    const b=p.hp; p.hp = Math.min(p.maxHp, p.hp + (rg.v||1));
    if(p.hp>b){ log('【'+rg.n+'】'+p.name+' 回 '+(p.hp-b)+' 气血。', 'heal'); pendingFx.push({id:p.id,amt:p.hp-b,type:'heal'}); skillFx(p,rg); }
  }
  render();
  await sleep(220);
  advanceTurn();
}

function advanceTurn(){
  if(state.over) return;
  const old = state.current;
  let n = old;
  do { n = (n+1) % state.players.length; } while(!state.players[n].alive);
  if(n <= old) state.round++;
  state.current = n;
  runTurn(false);
}

/* ===================== 伤害 / 死亡 ===================== */
async function loseHp(p, amt, reason, source){
  let realAmt = amt;
  if(!isFlagship(p) && talentOf(p)==='无为' && !p.wuweiUsed){ realAmt -= 1; p.wuweiUsed = true; }
  if(realAmt>0 && p._sanqingGuard){ p._sanqingGuard = 0; realAmt = 0; log('【一气化三清·守】'+p.name+' 免疫此伤。', 'sys'); fxShieldEx(p.id); }
  // 技能减伤（o:'once' 每局限一次 / o:'turn' 每回合限一次）
  const _red = firstK(p,'reduce',source);
  if(_red && realAmt>0){
    const cut = Math.min(realAmt, _red.v||1);
    realAmt -= cut; markUsed(p,_red);
    log('【'+_red.n+'】'+p.name+' 减免 '+cut+' 点。', 'sys');
    skillFx(p,_red);
  }
  if(realAmt < 0) realAmt = 0;
  // 濒死自救：需弃 2 张牌为代价，无牌则救不得（否则守城每波刷新都等于白送一命）
  const _ds = firstK(p,'deathsave');
  if(_ds && p.hp - realAmt <= 0){
    if(p.hand.length >= 2){
      for(let i=0;i<2;i++){ const c=p.hand.pop(); if(c) state.discard.push(c); }
      realAmt = Math.max(0, p.hp - 1);
      markUsed(p,_ds);
      log('【'+_ds.n+'】'+p.name+' 弃 2 牌，于鬼门关前回转。', 'big');
      skillShout(p,_ds);
    }
  }
  p.hp -= realAmt;
  p.stats.taken += realAmt;
  if(source && source.id!==p.id) source.stats.dmg += realAmt;
  if(realAmt>0){
    log(p.name+' 受 '+realAmt+' 点伤害'+(reason||''), 'hit');
    pendingFx.push({ id:p.id, amt:realAmt, type:'hit' });
    // 反弹：直接扣血，不递归触发对方技能
    const _rf = firstK(p,'reflect',source);
    if(_rf && source && source.alive && source.id!==p.id){
      markUsed(p,_rf);
      const rv = _rf.v||1;
      source.hp -= rv;
      if(source.id!==p.id) source.stats.taken += rv;
      log('【'+_rf.n+'】'+p.name+' 反噬 '+source.name+' '+rv+' 点。', 'hit');
      skillFx(p,_rf);
      pendingFx.push({ id:source.id, amt:rv, type:'hit' });
      if(source.hp<=0){ source.hp=0; die(source, p); }
    }
  }
  if(p.hp<=0){ p.hp=0; die(p, source); }
}
function die(p, killer){
  p.alive=false;
  log(p.name+' 气绝身亡。', 'big');
  SFX.die();
  // 退场特效入队：必须等重绘之后再播，否则 fx-dead 会被重建的 DOM 冲掉
  pendingFx.push({ id:p.id, type:'death' });
  p.hand.forEach(c=>state.discard.push(c)); p.hand=[]; p.equip=null;
  if(killer && killer.alive && killer.id!==p.id){
    killer.stats.kills++;
    breakthrough(killer, p);
    // 斩杀特写只在「玩家参与」时播放，避免 AI 互杀连播拖慢节奏
    const involvesHuman = (state.mode!=='ai') || killer.id===state.human || p.id===state.human;
    if(involvesHuman) fxExecute(p.name);
    const kd = firstK(killer,'killdraw');
    if(kd){ draw(killer, kd.v||1); log('【'+kd.n+'】'+killer.name+' 摸 '+(kd.v||1)+' 张。', 'heal'); skillFx(killer,kd); }
  }
  // 亡语：队友摸牌 / 同阵营回血
  const da = firstK(p,'deathally');
  if(da){
    markUsed(p,da);
    const mates = state.players.filter(q=>q.alive && q.id!==p.id);
    const tgt = mates.filter(q=>q.faction===p.faction);
    const list = (tgt.length?tgt:mates).slice(0,1);
    list.forEach(q=>{ draw(q, da.v||2); log('【'+da.n+'】'+q.name+' 摸 '+(da.v||2)+' 张。', 'heal'); });
    if(list.length) skillFx(list[0], da);
  }
  const df = firstK(p,'deathfac');
  if(df){
    markUsed(p,df);
    state.players.filter(q=>q.alive && q.faction===p.faction).forEach(q=>{
      const b=q.hp; q.hp=Math.min(q.maxHp, q.hp+(df.v||1));
      if(q.hp>b){ log('【'+df.n+'】'+q.name+' 回 '+(q.hp-b)+' 气血。', 'heal'); pendingFx.push({id:q.id,amt:q.hp-b,type:'heal'}); }
    });
    skillFx(p, df);
  }
  checkEnd();
}

/* 胜负判定：不同模式规则不同 */
function checkEnd(){
  if(state.over) return;
  if(state.mode==='siege'){
    const allies = state.players.filter(p=>p.alive && p.side==='ally');
    const foes   = state.players.filter(p=>p.alive && p.side==='foe');
    if(allies.length===0){ endGame(false, '剑气长城失守', '蛮荒天下'); return; }
    if(foes.length===0){ nextWave(); return; }
    return;
  }
  if(state.mode==='boss'){
    const boss   = state.players.find(p=>p.side==='boss');
    const heroes = state.players.filter(p=>p.alive && p.side==='hero');
    if(!boss || !boss.alive){ endGame(true, '共伐功成 · 巨寇伏诛', '讨伐诸修'); return; }
    if(heroes.length===0){ endGame(false, '讨伐失利 · 全军覆没', boss ? boss.name : '巨寇'); return; }
    return;
  }
  const alive = alivePlayers();
  if(alive.length<=1){
    endGame(true, '尘埃落定，胜者：'+(alive[0] ? alive[0].name : '无'),
      alive[0] ? alive[0].name : '无', alive[0] ? alive[0].id : -1);
  }
}

function endGame(win, title, winnerName, winnerId){
  state.over = true;
  state.win = !!win;
  // 战绩只记一次：checkEnd 可能在多条分支里走到同一个结算
  if(!state.recorded){ state.recorded = true; updateRecord(!!win, state.mode); }
  state.winner = winnerName || '无';
  state.winnerId = (winnerId===undefined || winnerId===null) ? -1 : winnerId;
  state.resultTitle = title || '';
  log(title, 'big');
}

/* ---------- 守城波次 ---------- */
function spawnWave(){
  const ALL = Object.keys(CHARS).filter(k=>CHARS[k].faction==='蛮荒天下');
  const n = Math.min(3, 1 + Math.floor(state.wave/2));   // 1,2,2,3,3
  const born = [];
  for(let i=0;i<n;i++){
    // 先排除仍在场的敌人，避免同名立绘重复出现；
    // 池子被抽干时允许重复出场（5 波共需 11 人，蛮荒角色约 12 个，存在耗尽风险）
    const onField = state.players.filter(p=>p.alive && p.side==='foe').map(p=>p.key);
    let pool = ALL.filter(k=>onField.indexOf(k)<0);
    if(!pool.length) pool = ALL.slice();
    if(!pool.length) break;
    const k = pool[Math.floor(Math.random()*pool.length)];
    const pl = makePlayer(k, state.players.length, 'foe');
    state.players.push(pl);
    born.push(pl.name);
  }
  return born;
}
function nextWave(){
  state.wave++;
  if(state.wave > state.maxWave){
    state.wave = state.maxWave;          // 钳住，避免结算页显示「6 / 5 波」
    endGame(true, '守城功成 · 蛮荒退兵', '守城诸修');
    return;
  }
  // 波次间隙：守方回气补牌。给得足一些，否则第 3 波基本必崩
  const allies = state.players.filter(p=>p.alive && p.side==='ally');
  allies.forEach(p=>{
    p.hp = Math.min(p.maxHp, p.hp + 3);
    draw(p, 3);
  });
  const born = spawnWave();
  log('第 '+state.wave+' 波蛮荒大军压境：'+born.join('、'), 'big');
  shout('第 '+state.wave+' 波', '#ff8a6b');
  SFX.turn();
  juiceWipe();   // 水墨横扫，切波次的仪式感
}

function breakthrough(killer, victim){
  const order = ['练气','止境','飞升'];
  killer.maxHp += 1;
  killer.hp = Math.min(killer.maxHp, killer.hp + 1);
  const i = order.indexOf(killer.realm);
  if(i >= 0 && i < order.length-1){
    killer.realm = order[i+1];
    log(killer.name+' 斩 '+victim.name+'，境界突破至【'+killer.realm+'】！', 'big');
  } else {
    log(killer.name+' 斩 '+victim.name+'，气血上限 +1！', 'big');
  }
  pendingFx.push({ id:killer.id, amt:1, type:'heal' });
  SFX.breakout();
  shout('境界突破', '#ffe9a8');
  fxPillar(killer.id);
}

/* ===================== 攻击结算 ===================== */
function fatigue(){
  // 后期疲劳：回合数越高，伤害越高、治疗越弱，防止治疗>输出的僵局
  return state.round >= 40 ? 2 : (state.round >= 25 ? 1 : 0);
}

/* 剑气伤害的唯一来源：实战结算（apply=true）与 AI 预估（apply=false）共用同一公式，
   避免两处各写一份导致 AI 低估伤害、该补刀时不补刀。
   apply=false 时不消耗「气势」、不写日志，纯查询。 */
function swordDamage(attacker, target, apply){
  let dmg = 1;
  if(attacker.equip) dmg += 1 + equipUpOf(attacker);
  if(attacker.wineActive) dmg += 1;
  if(attacker.key==='miyu') dmg = Math.max(dmg,2);
  if(attacker.baiyeBonus>0) dmg += attacker.baiyeBonus;
  if(attacker.key==='ningyao' && target.faction==='蛮荒天下') dmg += 1;
  if(attacker.key==='miyu' && target.faction==='蛮荒天下') dmg += 1;
  if(attacker.key==='caoci') dmg += 1;
  dmg += sumK(attacker, 'atk', target);
  if(attacker.judgeBuff){
    dmg += 1;
    if(apply){ attacker.judgeBuff = false; log('【气势】'+attacker.name+' 道心通明，剑气 +1。', 'sys'); }
  }
  dmg += auraAtk(attacker, target);
  // 同阵营齐心：有同阵营存活友方、且剑锋指向外敌时，剑气 +1
  // （友方即目标时不计——自家人的剑不该因此更利）
  const united = target.faction !== attacker.faction
    && aliveOthers(attacker).some(q=>q.faction===attacker.faction && q.id!==target.id);
  if(united) dmg += 1;
  const fat = fatigue();
  if(fat > 0){
    dmg += fat;
    if(apply) log('【天道势压】第 '+state.round+' 轮，剑气 +'+fat+'。', 'sys');
  }
  return dmg;
}

async function resolveAttack(attacker, target){
  attacker._atkThisTurn = (attacker._atkThisTurn||0) + 1;
  const _hadBuff = !!attacker.judgeBuff;
  const _fat = fatigue();
  let dmg = swordDamage(attacker, target, true);

  const _parts = atkBonusParts(attacker, target);
  if(_hadBuff) _parts.push({ n:'气势', v:1 });
  if(_fat > 0) _parts.push({ n:'天道势压', v:_fat });
  // 每剑都播报伤害，便于玩家看清「剑气多少点」（含无加成的基础一剑），反馈更及时
  log('　剑气 '+dmg+' 点' + (_parts.length ? '：'+_parts.map(x=>x.n+' +'+x.v).join('、') : '。'), 'sys');

  const swordheart = (attacker.key==='ningyao');
  const _nd = firstK(attacker,'nododge',target);
  if(_nd) log('【'+_nd.n+'】'+attacker.name+' 之剑无可守。', 'sys');
  const noDodge = swordheart || _nd || attacker.noDodgeFrom.has(target.id);

  const _uaT = firstK(target,'useAs');
  const _trickAsDodge = !!_uaT && _uaT.a==='trick>dodge' && countCard(target,'trick')>0 && !hasCard(target,'dodge');
  if(!noDodge && (hasCard(target,'dodge') || _trickAsDodge)){
    const _opts = [{v:'d',t:'出守心（免伤）'},{v:'t',t:'硬受此剑'}];
    const c = await ask(target, target.name+' 遭 '+dmg+' 点剑气，可出【守心】？', _opts,
      ()=> (target.hp<=dmg || countCard(target,'dodge')>=2) ? 'd' : 't');
    if(c==='d'){
      const _dc = _trickAsDodge ? findCard(target,'trick') : findCard(target,'dodge');
      if(_trickAsDodge) log('【'+_uaT.n+'】'+target.name+' 以「锦囊」当「守心」用。', 'sys');
      discardCard(target, _dc);
      log(target.name+' 守心如玉，免此一剑。', '');
      shoutCard(target, _dc, pickShout(SHOUTS.dodge), '#7fb8d8'); SFX.guard(); fxCardPlay(target, _dc);
      fxShield(target.id);
      return;
    }
  } else if(noDodge && swordheart){
    log('【剑心】锋芒难避，'+target.name+' 无从守心。', 'sys');
  }

  if(target.key==='chenpingan' && target.hand.length>0 && !noDodge){
    const c = await ask(target, target.name+'（陈平安）可用【守拙】弃一张牌当守心，是否使用？',
      [{v:'sz',t:'守拙（弃一张牌免伤）'},{v:'t',t:'硬受此剑'}],
      ()=> (target.hp<=dmg) ? 'sz' : 't');
    if(c==='sz'){
      discardCard(target, target.hand[0]); log('陈平安 守拙免伤。', '');
      SFX.guard(); fxShield(target.id);
      return;
    }
  }

  // 连击：本回合此前已命中过，则剑势连绵、伤害递增（每层 +1，最多 +2）
  // 限定我方（非 AI）——巨寇与来犯之敌本就多出一剑，放任其叠连击会让玩家侧胜率崩塌
  if(COMBO_ON && !isAI(attacker) && attacker.hitThisTurn > 0){
    const cb = Math.min(attacker.hitThisTurn, 2);
    dmg += cb;
    attacker.combo = attacker.hitThisTurn + 1;
    log('【连击 ×'+attacker.combo+'】'+attacker.name+' 剑势连绵，伤害 +'+cb+'。', 'sys');
    fxCombo(attacker.combo);
  }

  // 剑气长城天赋·锋芒：每回合首次「剑气」伤害 +1（确认命中后才结算，被守心则留待下剑）
  if(!isFlagship(attacker) && talentOf(attacker)==='锋芒' && !attacker.fengmangUsed){
    attacker.fengmangUsed = true;
    dmg += 1;
    log('【锋芒】'+attacker.name+' 剑意 +1。', 'sys');
  }

  slashFx(attacker.faction);
  SFX.slash();
  await sleep(180);
  await applyDamage(attacker, target, dmg);
}

async function applyDamage(attacker, target, dmg){
  if(target.key==='caoci' && !target.caociUsed){
    target.caociUsed = true; dmg -= 1;
    if(attacker && attacker.alive) await loseHp(attacker, 1, '（曹慈·慈 反弹）', target);
  }
  if(target.key==='fozu'){
    dmg -= 1;
    if(attacker && attacker.alive) await loseHp(attacker, 1, '（佛祖·因果 反弹）', target);
  }
  if(dmg>0) await loseHp(target, dmg, '', attacker);
  // 命中即累计连击层数（未造成伤害不计，反弹致死也不计）
  if(dmg>0 && attacker) attacker.hitThisTurn = (attacker.hitThisTurn||0) + 1;

  // 命中后技能：摸牌 / 再出一剑
  if(dmg>0 && attacker && attacker.alive){
    const hd = firstK(attacker,'hitdraw',target);
    if(hd){ draw(attacker, hd.v||1); log('【'+hd.n+'】'+attacker.name+' 摸 '+(hd.v||1)+' 张。', 'heal'); skillFx(attacker,hd); }
    const he = firstK(attacker,'hitextra',target);
    if(he && !attacker['_sk_'+he.n+'_r'+state.round]){
      if(attacker.attackUsed < attackLimit(attacker) + 1){
        attacker['_sk_'+he.n+'_r'+state.round] = 1;
        log('【'+he.n+'】'+attacker.name+' 可再出一剑。', 'sys');
        skillShout(attacker, he);
        if(isAI(attacker)){ const c = findCard(attacker,'attack'); if(c) attacker.attackUsed--; }
        else attacker.attackUsed = Math.max(0, attacker.attackUsed - 1);
      }
    }
  }

  if(dmg>0 && attacker && attacker.alive && !isFlagship(attacker)
     && talentOf(attacker)==='嗜血' && !attacker.lifestealUsed){
    attacker.lifestealUsed = true;
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + 1);
    log('蛮荒【嗜血】'+attacker.name+' 回 1 气血。', 'heal');
    pendingFx.push({ id:attacker.id, amt:1, type:'heal' });
  }
  if(attacker && attacker.key==='chenpingan' && target.alive){
    await wenxin(attacker, target);
  }
}

// 陈平安【问心】：讲道理
async function wenxin(attacker, target){
  if(target.hand.length===0) return;
  const opts = target.hand.map(c=>({ v:c.uid, t:'讲「'+c.name+'」（'+cardPoint(c)+'）' }));
  opts.push({ v:'skip', t:'不予理会' });
  const best = target.hand.reduce((a,b)=> cardPoint(b) > cardPoint(a) ? b : a, target.hand[0]);
  const ch = await ask(target, '陈平安【问心】：'+target.name+' 且讲道理（点数须 >5 方可讲过）', opts,
    ()=> cardPoint(best) > 5 ? best.uid : 'skip');
  if(ch==='skip') return;
  const card = target.hand.find(c=>c.uid==ch);
  if(!card) return;
  if(judgePoint(target, card) <= 5 + sumK(attacker,'judge')){ discardCard(target, card); log(target.name+' 理屈词穷，弃「'+card.name+'」。', ''); }
  else log(target.name+' 侃侃而谈，保住手牌。', '');
}

/* ===================== 出牌 ===================== */
// allowSelf：增益类（丹药、教化）应允许以自己为目标，
// 否则残血且队友皆满血时该牌永远打不出去。
function chooseTarget(p, label, aiPick, allowSelf){
  let cands = allowSelf ? state.players.filter(q=>q.alive) : aliveOthers(p);
  // 嘲讽（如陈清都【长城】）：场上有嘲讽存活时，须先过其关
  const taunts = cands.filter(q=>q.id!==p.id && hasK(q,'taunt'));
  if(taunts.length) cands = cands.filter(q=>q.id===p.id || taunts.indexOf(q)>=0);
  if(!cands.length) return Promise.resolve(null);
  if(isAI(p)) return Promise.resolve(aiPick ? aiPick(cands) : cands[0]);
  return new Promise(res=>{
    state.await = { resolve:(tid)=>res(playerById(tid)), allowSelf:!!allowSelf, label:label };
    log('选择【'+label+'】的目标'+(allowSelf?'（可点自己的英雄卡）':'')+'，可点「取消」或按 ESC 返回', 'sys');
    render();
  });
}

function cancelAwait(){
  if(!state.await) return;
  const r = state.await.resolve;
  state.selUid = null;
  log('取消目标选择。', 'sys');
  state.await = null;
  render();
  r(null);
}

function onCardClick(uid){
  if(state.over || state.await || state.busy) return;
  const p = current();
  if(isAI(p)) return;
  const card = p.hand.find(c=>c.uid===uid);
  if(!card) return;
  if(card.type==='attack' && p.attackUsed >= attackLimit(p)){
    log('本回合剑气已尽，且待下回合。', 'sys'); render(); return;
  }
  /* 两步出牌（仿三国杀 PC）：第一次点=选中抬起，再点或按「出牌」=真正打出 */
  if(state.selUid === uid){ playSelected(); return; }
  state.selUid = uid;
  render();
}
function playSelected(){
  const uid = state.selUid;
  if(uid==null) return;
  const p = current();
  if(isAI(p)){ state.selUid=null; return; }
  const card = p.hand.find(c=>c.uid===uid);
  state.selUid = null;
  if(!card) return;
  if(card.type==='attack' && p.attackUsed >= attackLimit(p)){ log('本回合剑气已尽。','sys'); render(); return; }
  attemptPlay(p, card);
}
function onCancelSel(){ state.selUid = null; render(); }

// 一次操作结算完毕：重绘 + 播放排队特效
function afterAction(){ render(); flushFx(); }

function attemptPlay(p, card){
  state.selUid = null;
  state.busy = true;
  playCard(p, card).then(()=>{
    state.busy = false;
    if(!state.over) afterAction();
  });
}

async function playCard(p, card){
  // 「守心」当「剑气」用：柔剑 / 弃文
  const _ua = firstK(p,'useAs');
  const _asAtk = card.type==='dodge' && !!_ua && (_ua.a==='dodge>attack' || _ua.a==='any>basic');
  if(card.type==='dodge' && !_asAtk){ log('【守心】只能应敌时打出。', 'sys'); return; }

  if(card.type==='attack' || _asAtk){
    if(_asAtk) log('【'+_ua.n+'】'+p.name+' 以「守心」作「剑气」用。', 'sys');
    if(p._noAttackNext === state.round){ log('【棋子】未解，本回合不得出剑气。', 'sys'); return; }
    if(p.attackUsed >= attackLimit(p)){ log('本回合剑气已尽。', 'sys'); return; }
    const t = await chooseTarget(p, '剑气', ()=>aiChooseTarget(p));
    if(!t) return;
    flyCard(card.uid, t.id);
    p.attackUsed++;
    removeFromHand(p, card); state.discard.push(card);
    log(p.name+' 一剑递向 '+t.name+'。', 'hit');
    shoutCard(p, card, pickShout(SHOUTS.attack), '#ff8a6b'); fxCardPlay(p, card);
    await bladeFx(p, t);
    await resolveAttack(p, t);
    return;
  }

  if(card.type==='heal'){
    const t = await chooseTarget(p, '丹药', cands=>{
      const hurt = cands.filter(q=>q.hp < q.maxHp);
      if(hurt.length){
        hurt.sort((a,b)=> (a.id===p.id?-1:0)-(b.id===p.id?-1:0) || (a.hp/a.maxHp)-(b.hp/b.maxHp));
        return hurt[0];
      }
      return p;                    // 全员满血：给自己（回 0），牌照样消耗，避免卡死
    }, true);
    if(!t) return;
    flyCard(card.uid, t.id);
    removeFromHand(p, card); state.discard.push(card);
    if(t.hp >= t.maxHp) log(t.name+' 气血已满，丹药空耗。', 'sys');
    doHeal(p, t, card);
    return;
  }

  if(card.type==='wine'){
    flyCard(card.uid, null);
    removeFromHand(p, card); state.discard.push(card);
    p.wineActive = true;
    log(p.name+' 饮下问剑，本回合剑气 +1。', '');
    shoutCard(p, card, pickShout(SHOUTS.wine), '#e8c66a'); SFX.click(); fxCardPlay(p, card);
    return;
  }

  if(card.type==='equip'){
    flyCard(card.uid, null);
    removeFromHand(p, card); p.equip = card;
    log(p.name+' 祭出【本命飞剑】（攻击 +1，多出一剑）。', '');
    shoutCard(p, card, '本命飞剑·出鞘', '#cfe6a0'); SFX.heal(); fxCardPlay(p, card);
    return;
  }

  if(card.type==='trick'){ await playTrick(p, card); return; }
}

function doHeal(p, t, card){
  let amt = (p.faction==='莲花天下') ? 2 : 1;
  const fat = fatigue();
  if(fat > 0){ amt = Math.max(0, amt - fat); log('【天道势压】第 '+state.round+' 轮，丹药效力降至 '+amt+'。', 'sys'); }
  const before = t.hp;
  t.hp = Math.min(t.maxHp, t.hp + amt);
  const real = t.hp - before;
  p.stats.heal += real;
  log(p.name+' 以丹药为 '+t.name+' 回复 '+real+' 气血。', 'heal');
  shoutCard(p, card, pickShout(SHOUTS.heal), '#79e6a0'); SFX.heal(); fxCardPlay(p, card);
  pendingFx.push({ id:t.id, amt:real, type:'heal' });
  if(p.faction==='莲花天下' && aliveOthers(p).length>0){
    const ally = aliveOthers(p)[0];
    const b2 = ally.hp;
    ally.hp = Math.min(ally.maxHp, ally.hp + 1);
    log('莲花【慈悲】泽被 '+ally.name+'，回 '+(ally.hp-b2)+'。', 'heal');
    pendingFx.push({ id:ally.id, amt:ally.hp-b2, type:'heal' });
  }
}

/* ===================== 锦囊 ===================== */
function trickBlocked(t, p, sub){
  const im = firstK(t,'immune');
  if(!im) return false;
  if(im.v==='lang' && sub!=='duel') return false;   // 言语类免疫：只挡「论道」，不挡破阵/天劫等实体
  if(im.v==='trick' || im.v==='all'){
    markUsed(t,im);
    log('【'+im.n+'】'+t.name+' 消解了此锦囊。', 'sys');
    skillShout(t, im);
    return true;
  }
  return false;
}
async function playTrick(p, card){
  // 先播飞牌动画：此时 DOM 尚未重绘，手牌元素还在，之后由目标类锦囊补牵引光效
  flyCard(card.uid, null);
  removeFromHand(p, card); state.discard.push(card);
  if(p.key==='baiye') p.baiyeBonus += 1;
  if(!isFlagship(p) && talentOf(p)==='机缘' && !p.jiyuanUsed){ p.jiyuanUsed = true; draw(p,1); log('散修【机缘】'+p.name+' 摸 1 张。', 'heal'); }
  const s = SHOUTS.trick[card.sub] || card.name;
  shoutCard(p, card, s, '#c89fe0'); fxCardPlay(p, card);

  if(card.sub==='wanjian'){
    log(p.name+' 施展【万剑归宗】，万剑齐落！', 'big');
    fxSwordRain(18, '#8fd8ff'); SFX.swordrain();
    figFig('swordrain', '万剑归宗', { cd: 1600 });   // 整幅水墨：万剑齐落（与粒子叠加，短暂不遮挡判定交互）
    for(const t of aliveOthers(p)){
      if(hasCard(t,'dodge')){
        const c = await ask(t, t.name+' 需出【守心】抵御万剑', [{v:'d',t:'出守心'},{v:'t',t:'受 1 伤'}],
          ()=> (t.hp<=1 || countCard(t,'dodge')>=2) ? 'd' : 't');
        if(c==='d'){ discardCard(t, findCard(t,'dodge')); log(t.name+' 剑阵中守心全身。', ''); continue; }
      }
      await loseHp(t,1,'（万剑归宗）', p);
    }
    return;
  }
  if(card.sub==='nanman'){
    log(p.name+' 引【蛮荒入侵】，妖潮漫野！', 'big');
    fxMist(8); SFX.mist();
    figFig('mist', '妖潮', { cd: 1600 });            // 整幅水墨：妖潮漫野（场景映射 beast）
    for(const t of aliveOthers(p)){
      if(hasCard(t,'attack')){
        const c = await ask(t, t.name+' 需出【剑气】抵御妖潮', [{v:'a',t:'出剑气'},{v:'t',t:'受 1 伤'}],
          ()=> (t.hp<=1) ? 'a' : (countCard(t,'attack')>=2 ? 'a' : 't'));
        if(c==='a'){ discardCard(t, findCard(t,'attack')); log(t.name+' 挥剑斩妖。', ''); continue; }
      }
      await loseHp(t,1,'（蛮荒入侵）', p);
    }
    return;
  }
  if(card.sub==='tianjie'){
    const t = await chooseTarget(p, '天劫', ()=>aiChooseTarget(p));
    if(!t) return;
    if(trickBlocked(t, p, card.sub)) return;
    if(t.key==='lisan' && !t.lisanTrickUsed){ t.lisanTrickUsed=true; log('礼圣【礼法】消解天劫。', 'sys'); return; }
    fxThunder(t.id);
    figFig('thunder', '天劫降世', { cd: 1600 });     // 整幅水墨：天劫降世
    await sleep(300);
    await loseHp(t,2,'（天劫）', p);
    return;
  }
  if(card.sub==='duel'){
    const t = await chooseTarget(p, '论道', ()=>aiChooseTarget(p));
    if(!t) return;
    if(trickBlocked(t, p, card.sub)) return;
    if(isBaizeBlocked(t)){ log('白泽【旁观】，不可为单体锦囊之的。', 'sys'); return; }
    if(t.key==='lisan' && !t.lisanTrickUsed){ t.lisanTrickUsed=true; log('礼圣【礼法】消解论道。', 'sys'); return; }
    fxAura(p.id); fxAura(t.id);
    await sleep(260);
    await duel(p, t);
    return;
  }
  if(card.sub==='pozhen'){
    const t = await chooseTarget(p, '破阵', ()=>aiChooseTarget(p));
    if(!t) return;
    if(trickBlocked(t, p, card.sub)) return;
    if(isBaizeBlocked(t)){ log('白泽【旁观】，不可为的。', 'sys'); return; }
    if(t.key==='lisan' && !t.lisanTrickUsed){ t.lisanTrickUsed=true; log('礼圣【礼法】消解破阵。', 'sys'); return; }
    fxShatter(t.id);
    await sleep(240);
    if(t.equip){ t.equip=null; log(t.name+' 的本命飞剑被破。', ''); }
    else if(t.hand.length){
      const c = await ask(t, t.name+'【破阵】：弃一张手牌',
        t.hand.map(x=>({v:x.uid,t:'弃「'+x.name+'」'})),
        ()=> (findCard(t,'dodge')||t.hand[0]).uid);
      const card2 = t.hand.find(x=>x.uid===c);
      if(card2){ discardCard(t, card2); log(t.name+' 弃「'+card2.name+'」。', ''); }
    }
    return;
  }
  if(card.sub==='jiewu'){
    const t = await chooseTarget(p, '借物', ()=>aiChooseTarget(p));
    if(!t) return;
    if(trickBlocked(t, p, card.sub)) return;
    if(isBaizeBlocked(t)){ log('白泽【旁观】，不可为的。', 'sys'); return; }
    if(t.key==='lisan' && !t.lisanTrickUsed){ t.lisanTrickUsed=true; log('礼圣【礼法】消解借物。', 'sys'); return; }
    fxBeam(t.id, p.id);
    await sleep(240);
    if(t.hand.length){
      const i=Math.floor(Math.random()*t.hand.length);
      const c=t.hand.splice(i,1)[0]; p.hand.push(c);
      log(p.name+' 借物代形，得 '+t.name+' 一张牌。', '');
    }
    return;
  }
  if(card.sub==='dushu'){
    draw(p,2); log(p.name+'【读书】养浩然气，摸 2 张。', 'heal'); SFX.draw(); fxScroll(p.id);
    return;
  }
  if(card.sub==='lianqi'){
    p.equip = { uid:++cardUid, type:'equip', name:'本命飞剑', sub:'feijian' };
    log(p.name+'【炼器】祭炼出一柄本命飞剑。', ''); SFX.heal(); fxForge(p.id);
    return;
  }
}

async function duel(p, t){
  log(p.name+' 与 '+t.name+' 论道。', '');
  // 先讲道理：判定点数低者理亏，先弃一张（judge 类技能在此生效）
  const jp = sumK(p,'judge'), jt = sumK(t,'judge');
  if(jp !== jt && p.alive && t.alive){
    const loser = jp > jt ? t : p;
    const win   = jp > jt ? p : t;
    const s = firstK(win,'judge');
    if(loser.hand.length){
      const c = loser.hand.pop(); state.discard.push(c);
      log('【'+(s?s.n:'判定')+'】'+loser.name+' 理亏，先弃「'+c.name+'」。', 'sys');
      if(s) skillFx(win, s);
    }
  }
  while(true){
    if(!hasCard(t,'attack')){ await loseHp(t,1,'（论道）', p); return; }
    const r1 = await ask(t, t.name+'【论道】：可出剑气？', [{v:'a',t:'出剑气'},{v:'t',t:'受 1 伤'}], ()=> t.hp<=1?'a':'a');
    if(r1!=='a'){ await loseHp(t,1,'（论道）', p); return; }
    discardCard(t, findCard(t,'attack'));
    if(!hasCard(p,'attack')){ await loseHp(p,1,'（论道）', t); return; }
    const r2 = await ask(p, p.name+'【论道】：可出剑气？', [{v:'a',t:'出剑气'},{v:'t',t:'受 1 伤'}], ()=> p.hp<=1?'a':'a');
    if(r2!=='a'){ await loseHp(p,1,'（论道）', t); return; }
    discardCard(p, findCard(p,'attack'));
  }
}

/* ===================== 主动技能 ===================== */
function onSkill(key){
  if(state.over || state.await || state.busy) return;
  const p = current();
  if(isAI(p)) return;
  if(key==='talent'){
    showChoice('【'+p.talent+'】天赋\n'+(TALENT_DESC[p.talent]||''), [{v:'ok',t:'知晓了'}]);
    return;
  }
  state.busy = true;
  useSkill(p, key).then(()=>{ state.busy=false; if(!state.over) afterAction(); });
}

const ACT_NEED = { yijian:3, daoziran:2, jiaohua:1, give:1, forge:2, qizi:1,
                   sanqing:0, steal:0, peek:0, wenjian:0, suanji:0 };
async function useSkill(p, key){
  const _s = skillsOf(p).filter(x=>x.k==='act' && x.a===key)[0];
  await useSkillCore(p, key);
  if(_s && (_s.o==='once' || _s.o==='turn')) markUsed(p, _s);
}
async function useSkillCore(p, key){
  if(key==='yijian'){
    if(p.chenqingduUsed){ log('一剑已出，难再。', 'sys'); return; }
    if(p.hand.length===0){ log('无牌可弃，一剑难出。', 'sys'); return; }
    const t = await chooseTarget(p, '一剑', ()=>aiChooseTarget(p));
    if(!t) return;
    const X = p.hand.length;
    const dmg = Math.max(X, Math.ceil(t.hp/2));
    p.hand.forEach(c=>state.discard.push(c)); p.hand=[];
    p.chenqingduUsed = true;
    log('陈清都【一剑】弃 '+X+' 牌，剑意贯虹，造 '+dmg+' 伤！', 'big');
    shout('一 剑', '#ff8a6b');
    await bladeFx(p, t);
    await applyDamage(p, t, dmg);
    return;
  }
  if(key==='daoziran'){
    if(p.hand.length<2){ log('手牌不足，道法难行。', 'sys'); return; }
    const a=p.hand.pop(), b=p.hand.pop(); state.discard.push(a,b);
    let n=2; if(a.type==='trick'||b.type==='trick') n=3;
    draw(p,n); log('道祖【道法自然】弃 2 摸 '+n+'。', 'heal'); shout('道法自然', '#9ed4be');
    return;
  }
  if(key==='suanji'){
    const t = await chooseTarget(p, '算计', ()=>aiChooseTarget(p));
    if(!t) return;
    if(t.hand.length){
      const i=Math.floor(Math.random()*t.hand.length);
      const c=t.hand.splice(i,1)[0]; p.hand.push(c);
      log(p.name+'【算计】得 '+t.name+' 一张牌。', ''); shout('算 计', '#c89fe0');
    }
    return;
  }
  if(key==='wenjian'){
    const t = await chooseTarget(p, '问剑', ()=>aiChooseTarget(p));
    if(!t) return;
    p.noDodgeFrom.add(t.id);
    log(p.name+'【问剑】'+t.name+' 本回合不得守心。', ''); shout('问 剑', '#e8c66a');
    return;
  }
  if(key==='jiaohua'){
    const t = await chooseTarget(p, '教化', ()=>{
      const ally = aliveOthers(p).filter(q=>q.faction===p.faction);
      return ally.length ? ally[0] : aliveOthers(p)[0];
    });
    if(!t) return;
    if(t.faction===p.faction && p.hand.length){
      const c=p.hand.pop(); t.hand.push(c);
      log(p.name+'【教化】授 '+t.name+' 一卷书。', 'heal'); shout('教 化', '#9ed4be');
    } else log('教化只可授同阵营之人。', 'sys');
    return;
  }
  if(key==='give'){
    if(p.hand.length===0){ log('无牌可授。', 'sys'); return; }
    const t = await chooseTarget(p, '授牌', ()=>{
      const ally = state.players.filter(q=>q.alive && q.id!==p.id && q.faction===p.faction);
      return (ally.length?ally:aliveOthers(p))[0];
    }, true);
    if(!t) return;
    const c = p.hand.pop(); t.hand.push(c);
    const sk = firstK(p,'act') || {};
    log(p.name+' 授 '+t.name+' 一张「'+c.name+'」。', 'heal');
    skillFx(p, {f:'lotus'});
    return;
  }
  if(key==='peek'){
    const t = await chooseTarget(p, '观牌', ()=>aiChooseTarget(p));
    if(!t) return;
    if(t.hand.length){
      const c = t.hand[Math.floor(Math.random()*t.hand.length)];
      log(p.name+' 窥见 '+t.name+' 一张「'+c.name+'」。', 'sys');
    } else log(t.name+' 两手空空。', 'sys');
    skillFx(p, {f:'rune'});
    return;
  }
  if(key==='steal'){
    const t = await chooseTarget(p, '夺牌', ()=>aiChooseTarget(p));
    if(!t) return;
    if(t.hand.length){
      const i = Math.floor(Math.random()*t.hand.length);
      const c = t.hand.splice(i,1)[0]; p.hand.push(c);
      log(p.name+' 夺得 '+t.name+' 一张牌。', '');
      skillFx(p, {f:'rune'});
    } else log(t.name+' 无牌可夺。', 'sys');
    return;
  }
  if(key==='forge'){
    if(p.hand.length<2){ log('牌不足，难以祭炼。', 'sys'); return; }
    const a1=p.hand.pop(), a2=p.hand.pop(); state.discard.push(a1,a2);
    p.equip = { uid:++cardUid, type:'equip', name:'本命飞剑', sub:'feijian' };
    log(p.name+' 祭炼出一柄本命飞剑。', 'big');
    skillFx(p, {f:'forge'}); SFX.forge();
    return;
  }
  if(key==='sanqing'){
    if(p['_sk_三清']) { log('一气化三清已用。', 'sys'); return; }
    const c = await ask(p, '一气化三清：择其一', [
      {v:'g',t:'攻 · 本回合剑气 +1'},
      {v:'s',t:'守 · 免疫下一次伤害'},
      {v:'b',t:'变 · 弃一摸二'}], ()=>'g');
    p['_sk_三清'] = 1;
    if(c==='g'){ p.baiyeBonus = (p.baiyeBonus||0) + 1; log('【一气化三清·攻】'+p.name+' 本回合剑气 +1。', 'big'); skillFx(p,{f:'sword'}); }
    else if(c==='s'){ p._sanqingGuard = 1; log('【一气化三清·守】'+p.name+' 免疫下一次伤害。', 'big'); skillFx(p,{f:'shield'}); }
    else {
      if(p.hand.length){ const d=p.hand.pop(); state.discard.push(d); }
      draw(p,2); log('【一气化三清·变】'+p.name+' 弃一摸二。', 'big'); skillFx(p,{f:'rune'});
    }
    return;
  }
  if(key==='qizi'){
    if(p.hand.length===0){ log('无牌可弃。', 'sys'); return; }
    const t = await chooseTarget(p, '棋子', ()=>aiChooseTarget(p));
    if(!t) return;
    const c = p.hand.pop(); state.discard.push(c);
    t._noAttackNext = state.round + 1;
    log('【棋子】'+p.name+' 落子，'+t.name+' 下回合不得出剑气。', 'big');
    skillFx(p, {f:'rune'});
    return;
  }
}

/* ===================== AI ===================== */
// AI 预估这一剑的伤害：直接复用实战公式（含技能剑气/气势/势压/齐心），
// 避免旧版只算「酒+飞剑」导致 AI 严重低估伤害、明明能斩杀却不补刀。
function aiExpectedAtk(p, q){ return swordDamage(p, q, false); }

function aiChooseTarget(p){
  const cands = aliveOthers(p);
  if(!cands.length) return null;
  // 守城/讨伐是协作模式：只以「敌对阵营（不同 side）」为目标，绝不内讧。
  // 若不这样限定，巨寇 12 点气血会被「集火残血」项压到最低分，导致讨伐方转而互砍。
  let pool = cands;
  if(state.mode==='siege' || state.mode==='boss'){
    const foes = cands.filter(q=>q.side !== p.side);
    if(foes.length) pool = foes;
  }
  const score = q=>{
    let s = 0;
    if(q.faction !== p.faction) s += 10;
    if(q.faction === (HOSTILE[p.faction]||'__')) s += 6;
    if(aiExpectedAtk(p,q) >= q.hp) s += 40;   // 可一剑斩杀，最高优先
    if(q.flagship) s += 4;                    // 主将倒则阵崩，优先压制
    s -= q.hp * 3;                            // 残血优先集火
    s -= q.hand.length * 0.4;
    if(q.key==='caoci' || q.key==='fozu') s -= 3;   // 反弹，非必要时不碰
    if(p.noDodgeFrom && p.noDodgeFrom.has && p.noDodgeFrom.has(q.id)) s += 8;  // 已问剑夺守，必补刀
    return s;
  };
  const sorted = pool.slice().sort((a,b)=> score(b)-score(a));
  return sorted[0];
}

function aiPickCard(p){
  const h = p.hand;
  // 1. 装备（未装备时优先）
  if(!p.equip && hasCard(p,'equip')) return findCard(p,'equip');
  // 2. 残血自救
  if(p.hp <= 2 && hasCard(p,'heal')) return findCard(p,'heal');
  // 2.5 准备类锦囊（炼器铸剑 / 读书）须先于剑气，否则本回合攻击吃不到增益（组合技关键）
  const setup = h.find(c=>c.type==='trick' && ['lianqi','dushu'].includes(c.sub));
  if(setup) return setup;
  // 3. 群伤锦囊（敌人 >= 2）。协作模式下群伤会误伤队友，故不使用
  const isCoop = (state.mode==='siege' || state.mode==='boss');
  const aoe = h.find(c=>c.type==='trick' && (c.sub==='wanjian'||c.sub==='nanman'));
  if(aoe && aliveOthers(p).length >= 2 && !isCoop) return aoe;
  // 4. 进攻锦囊：破阵/借物仅在有收益目标（有装备或手牌）时打出，避免空耗
  const worthwhile = sub=>{
    if(sub==='pozhen' || sub==='jiewu'){
      const pool = isCoop ? aliveOthers(p).filter(q=>q.side!==p.side) : aliveOthers(p);
      return pool.some(q=> q.equip || q.hand.length>=1);
    }
    return true;
  };
  const off = h.find(c=>['duel','tianjie','pozhen','jiewu'].includes(c.sub) && worthwhile(c.sub));
  if(off) return off;
  // 5. 酒+剑气 连招：先饮后击，气势更盛
  if(!p.wineActive && hasCard(p,'wine') && hasCard(p,'attack') && p.attackUsed < attackLimit(p) && aliveOthers(p).length) return findCard(p,'wine');
  // 6. 剑气（次数内）
  if(hasCard(p,'attack') && p.attackUsed < attackLimit(p) && aliveOthers(p).length) return findCard(p,'attack');
  // 7. 其余装备位就装
  if(hasCard(p,'equip')) return findCard(p,'equip');
  return null;
}

/* ===================== AI 组合技（连携） =====================
 * 让 AI 在出牌阶段把「准备/增益」与「进攻」串成连招，而非把剑气一股脑打完再补增益；
 * 一回合内打出 ≥2 式且有「准备→进攻」结构时，播报【连携】以提供及时反馈。
 * 仅改 AI 出牌顺序与反馈，不触碰任何数值/阵营平衡。 */
function _comboTag(p, c){
  if(!p._combo) p._combo = [];
  let t = 'misc';
  if(c.type==='equip' || c.sub==='lianqi') t='forge';
  else if(c.sub==='dushu') t='draw';
  else if(c.type==='wine') t='wine';
  else if(c.type==='attack') t='atk';
  else if(c.sub==='wanjian'||c.sub==='nanman') t='aoe';
  else if(['duel','tianjie','pozhen','jiewu'].includes(c.sub)) t='trick';
  p._combo.push(t);
}
function _emitCombo(p){
  const seq = p._combo || [];
  const setup = seq.some(t=>['forge','wenjian','buff','aoe','trick','draw'].includes(t));
  const hasAtk = seq.includes('atk');
  if(seq.length < 2 || !setup || !hasAtk) return;   // 至少「准备→进攻」两式才算连携
  let name = '符箓连击';
  if(seq.includes('forge')) name = '本命飞剑·连打';
  else if(seq.includes('wenjian')) name = '问剑夺守';
  else if(seq.includes('buff')) name = '三清剑势';
  else if(seq.includes('aoe')) name = '万剑掩杀';
  else if(seq.includes('draw')) name = '读书助剑';
  log('【连携·'+name+'】'+p.name+' 一气呵成（'+seq.length+' 式）。', 'sys');
  if(typeof shout==='function'){ try{ shout('连 携', '#e8c66a'); }catch(e){} }
}

async function aiPlay(p){
  p._combo = [];
  // 旗舰主动技能（一次性/每回合）：炼器/问剑/三清·攻 等已在剑气前结算
  await aiTrySkills(p);
  await sleep(240);
  let guard = 0;
  while(guard++ < 14 && !state.over){
    const c = aiPickCard(p);
    if(!c) break;
    _comboTag(p, c);
    await playCard(p, c);
    await sleep(420);
  }
  _emitCombo(p);
}

async function aiTrySkills(p){
  if(state.over) return;
  // 数据驱动：按 SKILLS 表逐个尝试主动技，手牌不足则跳过
  for(const sk of skillsOf(p)){
    if(sk.k!=='act') continue;
    if(sk.o==='once' && usedFlag(p,sk)) continue;
    if(sk.o==='turn' && usedFlag(p,sk)) continue;
    if(p.hand.length < (ACT_NEED[sk.a]||0)) continue;
    await useSkill(p, sk.a);
    if(!p._combo) p._combo = [];
    if(sk.a==='forge') p._combo.push('forge');
    else if(sk.a==='wenjian') p._combo.push('wenjian');
    else if(sk.a==='sanqing') p._combo.push('buff');
    await sleep(420);
    if(state.over) return;
  }
}

function aiDiscard(p, n){
  // 弃价值最低的：守心 > 多余剑气 > 其他
  const h = p.hand.slice();
  const val = c => ({dodge:0, attack:1, wine:2, heal:3, equip:4, trick:5})[c.type];
  h.sort((a,b)=> val(a)-val(b));
  return h.slice(0, n);
}

/* ===================== 询问（人类弹窗 / AI 自动） ===================== */
function ask(resp, text, options, aiPick){
  if(resp && isAI(resp)){
    const v = aiPick ? aiPick(options) : options[0].v;
    const o = options.find(x=>x.v===v) || options[0];
    log('（'+resp.name+' 抉择：'+o.t+'）', 'sys');
    return Promise.resolve(v);
  }
  return showChoice(text, options);
}

const MODAL_CREST_SVG = '<svg viewBox="0 0 120 40" aria-hidden="true"><g fill="none" stroke="#c9a24b" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M38 32 L54 8 L58 8 L42 32 Z" fill="#c9a24b"/><path d="M82 32 L66 8 L62 8 L78 32 Z" fill="#c9a24b"/><path d="M46 12 L46 30 M74 12 L74 30 M40 28 L56 28 M64 28 L80 28"/><circle cx="60" cy="20" r="5.5" stroke="#a02a3f" fill="#a02a3f"/><path d="M32 20 H22 M98 20 H88" opacity=".6"/><path d="M60 6 V10 M60 30 V34" opacity=".5"/></g></svg>';
const MODAL_ROLL_END = '<span></span><span></span>';

function modalChoiceBox(text, extra){
  return '<div class="modal-box modal-choice">'
       + '<div class="modal-crest">'+MODAL_CREST_SVG+'</div>'
       + '<div class="modal-prompt">'+text+'</div>'
       + (extra || '')
       + '<div class="modal-seal-btns" id="modal-btns"></div>'
       + '<div class="modal-roll-end">'+MODAL_ROLL_END+'</div>'
       + '</div>';
}

function showChoice(text, options){
  return new Promise(res=>{
    const m = document.getElementById('modal');
    m.innerHTML = modalChoiceBox(text);
    const box = document.getElementById('modal-btns');
    options.forEach((o,i)=>{
      const b=document.createElement('button'); b.textContent=o.t; b.className='seal-btn'+(i===0?' primary':'');
      b.onclick=()=>{ SFX.click(); m.style.display='none'; m.innerHTML=''; m.onclick=null; lockBody(false); res(o.v); };
      box.appendChild(b);
    });
    m.onclick = null;          // 抉择类不允许点遮罩跳过
    m.style.display='flex';
    lockBody(true);
  });
}

function showHandoff(p){
  return showChoice('热座争锋 · 请把设备交给 '+p.name, [{v:'ok', t:'准备好了'}]);
}

function showMulti(title, cards, count, confirmLabel){
  return new Promise(res=>{
    const m = document.getElementById('modal');
    let sel = [];
    m.innerHTML = '<div class="modal-box modal-choice">'
                + '<div class="modal-crest">'+MODAL_CREST_SVG+'</div>'
                + '<div class="modal-prompt">'+title+'</div>'
                + '<div class="pickrow" id="pickrow"></div>'
                + '<div class="modal-seal-btns" id="modal-btns"></div>'
                + '<div class="modal-roll-end">'+MODAL_ROLL_END+'</div>'
                + '</div>';
    const row = document.getElementById('pickrow');
    cards.forEach(c=>{
      const d=document.createElement('div'); d.className='pickcard'; d.textContent=c.name;
      d.onclick=()=>{
        SFX.click();
        if(sel.indexOf(c.uid)>=0){ sel=sel.filter(x=>x!==c.uid); d.classList.remove('on'); }
        else if(sel.length<count){ sel.push(c.uid); d.classList.add('on'); }
        btn.textContent = confirmLabel+'（'+sel.length+'/'+count+'）';
        btn.disabled = sel.length !== count;
      };
      row.appendChild(d);
    });
    const box=document.getElementById('modal-btns');
    const btn=document.createElement('button'); btn.className='seal-btn primary';
    btn.textContent = confirmLabel+'（0/'+count+'）'; btn.disabled = true;
    btn.onclick=()=>{
      if(sel.length!==count) return;
      m.style.display='none'; m.innerHTML=''; m.onclick=null; lockBody(false);
      res(cards.filter(c=>sel.indexOf(c.uid)>=0));
    };
    box.appendChild(btn);
    m.onclick = null;
    m.style.display='flex';
    lockBody(true);
  });
}

/* ===================== 特效 ===================== */
function fxHit(id, amt){
  const el = document.getElementById('pl-'+id); if(!el) return;
  el.classList.remove('fx-hit'); void el.offsetWidth; el.classList.add('fx-hit');
  setTimeout(()=>el.classList.remove('fx-hit'), 460);
  // 伤害分级：3 点及以上为「重击」，追加红闪、冲击波与强震
  const grade = amt>=3 ? ' big' : (amt===2 ? ' mid' : '');
  floatNum(id, '-'+amt, 'dmg'+grade);
  fxBlood(id, amt);
  if(amt>=3){
    shakeApp(2);
    fxFlash('rgba(255,48,32,.40)', 340);
    fxShockwave(id);
    SFX.heavy();
  } else {
    shakeApp(1);
    SFX.hit();
  }
}
function fxHeal(id, amt){
  const el = document.getElementById('pl-'+id); if(!el) return;
  el.classList.remove('fx-heal'); void el.offsetWidth; el.classList.add('fx-heal');
  setTimeout(()=>el.classList.remove('fx-heal'), 520);
  if(amt>0){ floatNum(id, '+'+amt, 'heal'); fxLotus(id, 10); }
}
function floatNum(id, txt, cls){
  const el = document.getElementById('pl-'+id); if(!el) return;
  const f = document.createElement('div'); f.className='floatnum '+cls; f.textContent=txt;
  el.appendChild(f); setTimeout(()=>f.remove(), 1000);
}
// lv>=2 为「重击」：幅度更大、更久
function shakeApp(lv){
  const a = document.getElementById('app'); if(!a) return;
  const cls = (lv>=2) ? 'shake-hard' : 'shake';
  a.classList.remove('shake','shake-hard'); void a.offsetWidth; a.classList.add(cls);
  setTimeout(()=>a.classList.remove(cls), (lv>=2?560:420));
}
function slashFx(faction){
  const s = document.getElementById('slash'); if(!s) return;
  const col = FACTIONS[faction]||'#fff';
  s.style.background = 'linear-gradient(115deg, transparent 44%, '+col+' 50%, #fff 52%, '+col+' 54%, transparent 60%)';
  s.classList.remove('go'); void s.offsetWidth; s.classList.add('go');
}
function shout(text, color){
  const s = document.getElementById('shout'); if(!s) return;
  s.innerHTML = '<span class="sh-txt" style="--sc:'+(color||'#e8c66a')+'">'+text+'</span>';
  s.classList.remove('go'); void s.offsetWidth; s.classList.add('go');
}
function banner(name, sub){
  const b = document.getElementById('banner'); if(!b) return;
  b.innerHTML = '<div class="bn-inner"><div class="bn-sweep"></div>'
              + '<div class="bn-name">'+name+'</div><div class="bn-sub">'+sub+'</div></div>';
  b.classList.remove('go'); void b.offsetWidth; b.classList.add('go');
}
// 剑光轨迹：从攻方飞向守方
function bladeFx(from, to){
  return new Promise(res=>{
    const el = document.getElementById('blade');
    const a = document.getElementById('pl-'+from.id);
    const b = document.getElementById('pl-'+to.id);
    if(!el || !a || !b){ res(); return; }
    const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
    const col = FACTIONS[from.faction] || '#e8c66a';
    el.textContent = '剑';
    el.style.color = col;
    el.style.textShadow = '0 0 6px #fff, 0 0 18px '+col+', 0 0 36px '+col;
    el.style.left = (r1.left + r1.width/2) + 'px';
    el.style.top = (r1.top + r1.height/2) + 'px';
    el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
    requestAnimationFrame(()=>{
      el.style.left = (r2.left + r2.width/2) + 'px';
      el.style.top = (r2.top + r2.height/2) + 'px';
    });
    setTimeout(()=>{ el.classList.remove('go'); res(); }, 430);
  });
}
/* ---------- 卡牌特效：一牌一景 ---------- */
function rectOf(id){
  const el = document.getElementById('pl-'+id);
  if(el) return el.getBoundingClientRect();
  const w = (typeof innerWidth==='number'?innerWidth:1024), h = (typeof innerHeight==='number'?innerHeight:768);
  return { left:w/2-40, top:h/2-60, width:80, height:120 };
}
function fxCardPlay(p, card){
  if(!p || !card) return;
  switch(card.type){
    case 'attack': fxSwordQi(p.id, p.faction); break;
    case 'dodge':  fxShieldEx(p.id); break;
    case 'heal':   fxLotus(p.id, 12); break;
    case 'wine':   fxWine(p.id); break;
    case 'equip':  fxSwordDraw(p.id); break;
    case 'trick':  fxTrickOpen(p.id); break;
  }
}

/* 【剑气】三道斜斩 + 迸射剑芒 */
function fxSwordQi(id, faction){
  const r = rectOf(id);
  const col = FACTIONS[faction] || '#e8c66a';
  slashFx(faction);
  for(let i=0;i<3;i++){
    spawnFx('fx-slashline', {
      left:(r.left + r.width/2 - 160) + 'px',
      top:(r.top + r.height/2 + i*15 - 16) + 'px',
      '--ang':(-26 + i*13) + 'deg',
      '--w':(210 + Math.random()*90).toFixed(0) + 'px',
      animationDelay:(i*0.07).toFixed(2) + 's'
    }, 900);
  }
  for(let i=0;i<16;i++){
    const a = Math.random()*Math.PI*2, d = 40 + Math.random()*100;
    spawnFx('fx-spark', {
      left:(r.left + r.width/2) + 'px', top:(r.top + r.height/2) + 'px',
      '--dx':(Math.cos(a)*d).toFixed(0) + 'px', '--dy':(Math.sin(a)*d).toFixed(0) + 'px',
      '--sc':col, animationDelay:(Math.random()*0.14).toFixed(2) + 's'
    }, 820);
  }
  SFX.slash();
}

/* 【守心】涟漪 + 六面镜盾 */
function fxShieldEx(id){
  fxShield(id);
  const r = rectOf(id);
  for(let i=0;i<3;i++){
    spawnFx('fx-ripple', {
      left:(r.left + r.width/2 - 65) + 'px', top:(r.top + r.height/2 - 65) + 'px',
      '--sz':'130px', animationDelay:(i*0.15).toFixed(2) + 's'
    }, 1250);
  }
  for(let i=0;i<6;i++){
    const a = (Math.PI*2/6) * i;
    spawnFx('fx-mirror', {
      left:(r.left + r.width/2) + 'px', top:(r.top + r.height/2) + 'px',
      '--dx':(Math.cos(a)*54).toFixed(0) + 'px', '--dy':(Math.sin(a)*54).toFixed(0) + 'px',
      '--rot':(a*57.3).toFixed(0) + 'deg', animationDelay:(i*0.05).toFixed(2) + 's'
    }, 1150);
  }
}

/* 【问剑·酒】全屏朦胧酒气 + 「饮酒图」整幅画意 */
function fxWine(id){
  /* 画意：一人仰头举壶畅饮。交由 FigFx 出题字与印章，这里不再堆大字 */
  figFig('drink', '且饮此杯', { cd: 2000 });
  const el = document.getElementById('drunkfx');
  if(el){
    el.innerHTML = '<div class="drunk-veil"></div><div class="drunk-wave"></div>';
    el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
    clearTimeout(fxWine._t);
    fxWine._t = setTimeout(()=>{ el.classList.remove('go'); el.innerHTML=''; }, 2300);
  }
  const r = rectOf(id);
  for(let i=0;i<18;i++){
    spawnFx('fx-winepuff', {
      left:(r.left + r.width/2 - 30 + Math.random()*60) + 'px',
      top:(r.top + r.height*0.6 + Math.random()*40) + 'px',
      '--dx':(Math.random()*80-40).toFixed(0) + 'px',
      '--dy':(-70 - Math.random()*100).toFixed(0) + 'px',
      '--sz':(14 + Math.random()*26).toFixed(0) + 'px',
      animationDelay:(Math.random()*0.6).toFixed(2) + 's'
    }, 2600);
  }
  const e = document.getElementById('pl-'+id);
  if(e){
    e.classList.remove('drunk-sway'); void e.offsetWidth; e.classList.add('drunk-sway');
    setTimeout(()=>e.classList.remove('drunk-sway'), 2300);
  }
  SFX.wine();
}

/* 【本命飞剑】剑影绕身 + 一剑出鞘 + 「出剑图」画意 */
function fxSwordDraw(id){
  figFig('sword', '剑出', { cd: 2400 });
  const r = rectOf(id);
  for(let i=0;i<5;i++){
    spawnFx('fx-orbit', {
      left:(r.left + r.width/2) + 'px', top:(r.top + r.height/2) + 'px',
      '--r':(56 + i*13) + 'px', animationDelay:(i*0.09).toFixed(2) + 's'
    }, 1550);
  }
  spawnFx('fx-bladeup', {
    left:(r.left + r.width/2 - 8) + 'px', top:(r.top + r.height*0.62) + 'px'
  }, 1350);
  SFX.pull();
}

/* 【锦囊】符文环 + 紫芒迸射 */
function fxTrickOpen(id){
  const r = rectOf(id);
  spawnFx('fx-rune', {
    left:(r.left + r.width/2 - 70) + 'px', top:(r.top + r.height/2 - 70) + 'px'
  }, 1250);
  for(let i=0;i<14;i++){
    const a = Math.random()*Math.PI*2, d = 46 + Math.random()*80;
    spawnFx('fx-spark', {
      left:(r.left + r.width/2) + 'px', top:(r.top + r.height/2) + 'px',
      '--dx':(Math.cos(a)*d).toFixed(0) + 'px', '--dy':(Math.sin(a)*d).toFixed(0) + 'px',
      '--sc':'#c89fe0', animationDelay:(Math.random()*0.22).toFixed(2) + 's'
    }, 950);
  }
}

function flushFx(){
  for(const f of pendingFx){
    if(f.type==='hit') fxHit(f.id, f.amt);
    else if(f.type==='heal') fxHeal(f.id, f.amt);
    else if(f.type==='death') fxDeath(f.id);
    else if(f.type==='draw') SFX.draw();
  }
  pendingFx = [];
}

/* ---------- 粒子层：剑雨 / 妖雾 / 莲华 / 金光柱 / 血溅 ---------- */
function fxLayer(){ return document.getElementById('fxlayer'); }
function spawnFx(cls, style, life){
  const L = fxLayer(); if(!L) return;
  const d = document.createElement('div');
  d.className = cls;
  // 自定义属性（--dx/--sc 等）必须用 setProperty，直接赋值在多数浏览器上会被忽略
  for(const k in style){
    if(k.indexOf('--')===0) d.style.setProperty(k, style[k]);
    else d.style[k] = style[k];
  }
  L.appendChild(d);
  setTimeout(()=>d.remove(), life);
}
// 万剑归宗：天降剑雨
function fxSwordRain(n, color){
  const col = color || '#8fd8ff';
  for(let i=0;i<(n||14);i++){
    spawnFx('fx-sword', {
      left: (Math.random()*100)+'%',
      height: (44+Math.random()*46)+'px',
      '--sc': col,
      animationDelay: (Math.random()*.34)+'s',
      animationDuration: (.62+Math.random()*.34)+'s',
    }, 1500);
  }
}
// 蛮荒入侵：妖雾从四周涌出
function fxMist(n){
  for(let i=0;i<(n||7);i++){
    const sz = 160+Math.random()*260;
    spawnFx('fx-mist', {
      left: (Math.random()*100)+'%',
      top: (30+Math.random()*55)+'%',
      width: sz+'px', height: sz+'px',
      animationDelay: (Math.random()*.45)+'s',
    }, 2200);
  }
}
// 疗愈：莲华自目标升起
function fxLotus(id, n){
  const el = document.getElementById('pl-'+id);
  const L = fxLayer();
  if(!el || !L) return;
  const r = el.getBoundingClientRect();
  for(let i=0;i<(n||12);i++){
    spawnFx('fx-petal', {
      left: (r.left + r.width*(0.15+Math.random()*0.7))+'px',
      top: (r.top + r.height*(0.45+Math.random()*0.4))+'px',
      width: (9+Math.random()*8)+'px',
      height: (9+Math.random()*8)+'px',
      animationDelay: (Math.random()*.4)+'s',
    }, 1900);
  }
}
// 境界突破：金光柱
function fxPillar(id){
  const el = document.getElementById('pl-'+id);
  const L = fxLayer();
  if(!el || !L) return;
  const r = el.getBoundingClientRect();
  spawnFx('fx-pillar', {
    left: (r.left + r.width/2 - 65)+'px',
    top: (r.top - r.height*0.9)+'px',
    height: (r.height*1.9)+'px',
  }, 1400);
  for(let i=0;i<16;i++){
    spawnFx('fx-petal', {
      left: (r.left + r.width*(0.1+Math.random()*0.8))+'px',
      top: (r.top + r.height*(0.5+Math.random()*0.4))+'px',
      width: (8+Math.random()*7)+'px',
      height: (8+Math.random()*7)+'px',
      animationDelay: (Math.random()*.5)+'s',
    }, 1900);
  }
}
// 受击：血溅
function fxBlood(id, amt){
  const el = document.getElementById('pl-'+id);
  const L = fxLayer();
  if(!el || !L) return;
  const r = el.getBoundingClientRect();
  const n = Math.min(16, 4 + (amt||1)*3);
  for(let i=0;i<n;i++){
    const a = Math.random()*Math.PI*2, d = 18+Math.random()*46;
    spawnFx('fx-blood', {
      left: (r.left + r.width/2)+'px',
      top: (r.top + r.height*0.42)+'px',
      '--dx': (Math.cos(a)*d).toFixed(1)+'px',
      '--dy': (Math.sin(a)*d + 16)+'px',
      width: (4+Math.random()*5)+'px',
      height: (4+Math.random()*5)+'px',
      animationDelay: (Math.random()*.16)+'s',
    }, 1100);
  }
}
// 斩杀特写：暗场 + 白闪 + 「斩」大字
function fxExecute(victimName){
  const e = document.getElementById('execfx');
  if(!e) return;
  e.innerHTML = '<div class="exec-vig"></div><div class="exec-flash"></div>'
    + '<div class="exec-word">斩</div><div class="exec-sub">'+victimName+' · 殁</div>';
  e.classList.remove('go'); void e.offsetWidth; e.classList.add('go');
  SFX.execute();
  setTimeout(()=>{ e.classList.remove('go'); e.innerHTML=''; }, 1200);
}
function winFx(){
  const w = document.getElementById('winfx'); if(!w) return;
  w.innerHTML='';
  const colors = ['#e8c66a','#ff5b46','#79e6a0','#88c0d0','#c08fff','#f0e6c8'];
  for(let i=0;i<44;i++){
    const c=document.createElement('div'); c.className='confetti';
    c.style.left=(Math.random()*100)+'%';
    c.style.background=colors[Math.floor(Math.random()*colors.length)];
    c.style.animationDelay=(Math.random()*.7)+'s';
    c.style.animationDuration=(1.4+Math.random()*.9)+'s';
    w.appendChild(c);
  }
  w.classList.remove('go'); void w.offsetWidth; w.classList.add('go');
  setTimeout(()=>{ w.classList.remove('go'); w.innerHTML=''; }, 2200);
}
/* ---------- 特效补充：闪屏 / 护盾 / 冲击波 / 连击 / 退场 / 锦囊专属 / 出牌 ---------- */
// 全屏闪色：重击用红，天劫用蓝白
function fxFlash(color, dur){
  const f = document.getElementById('flash'); if(!f) return;
  f.style.background = color || 'rgba(255,60,40,.42)';
  f.style.animationDuration = (dur||380)+'ms';
  f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
// 守心：金色护盾光环 + 「守」字
function fxShield(id){
  const el = document.getElementById('pl-'+id); if(!el) return;
  el.classList.remove('fx-guard'); void el.offsetWidth; el.classList.add('fx-guard');
  setTimeout(()=>el.classList.remove('fx-guard'), 640);
  floatNum(id, '守', 'guard');
}
// 重击冲击波
function fxShockwave(id){
  const el = document.getElementById('pl-'+id); const L = fxLayer();
  if(!el || !L) return;
  const r = el.getBoundingClientRect();
  spawnFx('fx-wave', { left:(r.left+r.width/2)+'px', top:(r.top+r.height/2)+'px' }, 850);
}
// 连击计数（≥2 连才显示）
function fxCombo(n){
  if(!n || n < 2) return;
  const c = document.getElementById('combo'); if(!c) return;
  c.innerHTML = '<span class="cb-n">×'+n+'</span><span class="cb-t">连 击</span>';
  c.style.setProperty('--cb', String(Math.min(n,6)));
  c.classList.remove('go'); void c.offsetWidth; c.classList.add('go');
  SFX.combo(n);
}
// 退场：角色卡灰化 + 剑光消散
function fxDeath(id){
  const el = document.getElementById('pl-'+id); if(!el) return;
  el.classList.add('fx-die');          // 与 renderGame 里对已殁者的处理保持一致
  const L = fxLayer();
  if(L){
    const r = el.getBoundingClientRect();
    for(let i=0;i<14;i++){
      spawnFx('fx-wisp', {
        left:(r.left+r.width*(0.2+Math.random()*0.6))+'px',
        top:(r.top+r.height*(0.2+Math.random()*0.6))+'px',
        animationDelay:(Math.random()*.3)+'s',
      }, 1600);
    }
  }
}
// 天劫：三道落雷 + 蓝白闪屏
function fxThunder(id){
  const el = document.getElementById('pl-'+id); if(!el) return;
  const L = fxLayer();
  fxFlash('rgba(186,224,255,.46)', 300);
  if(L){
    const r = el.getBoundingClientRect();
    for(let i=0;i<3;i++){
      spawnFx('fx-bolt', {
        left:(r.left+r.width*(0.3+Math.random()*0.4))+'px',
        top:(r.top-50)+'px',
        animationDelay:(i*.09)+'s',
      }, 950);
    }
  }
  SFX.thunder();
}
// 论道：金色道理光环
function fxAura(id){
  const el = document.getElementById('pl-'+id); if(!el) return;
  el.classList.remove('fx-aura'); void el.offsetWidth; el.classList.add('fx-aura');
  setTimeout(()=>el.classList.remove('fx-aura'), 950);
}
// 破阵：碎片四溅
function fxShatter(id){
  const el = document.getElementById('pl-'+id); const L = fxLayer();
  if(!el || !L) return;
  const r = el.getBoundingClientRect();
  for(let i=0;i<10;i++){
    spawnFx('fx-shard', {
      left:(r.left+r.width*(0.25+Math.random()*0.5))+'px',
      top:(r.top+r.height*(0.3+Math.random()*0.4))+'px',
      '--dx':((Math.random()*2-1)*70).toFixed(0)+'px',
      '--dy':(30+Math.random()*60).toFixed(0)+'px',
      animationDelay:(Math.random()*.14)+'s',
    }, 1000);
  }
  SFX.shatter();
}
// 借物：一道牵引光带自目标流向施术者
function fxBeam(fromId, toId){
  const a = document.getElementById('pl-'+fromId), b = document.getElementById('pl-'+toId), L = fxLayer();
  if(!a || !b || !L) return;
  const r1 = a.getBoundingClientRect(), r2 = b.getBoundingClientRect();
  const x1 = r1.left+r1.width/2, y1 = r1.top+r1.height/2;
  const x2 = r2.left+r2.width/2, y2 = r2.top+r2.height/2;
  spawnFx('fx-beam', {
    left:x1+'px', top:y1+'px',
    width:Math.hypot(x2-x1, y2-y1)+'px',
    '--ang':(Math.atan2(y2-y1, x2-x1)*180/Math.PI).toFixed(1)+'deg',
  }, 720);
  SFX.pull();
}
// 读书：书卷文字升腾
function fxScroll(id){
  const el = document.getElementById('pl-'+id); const L = fxLayer();
  if(!el || !L) return;
  const r = el.getBoundingClientRect();
  for(let i=0;i<8;i++){
    spawnFx('fx-glyph', {
      left:(r.left+r.width*(0.2+Math.random()*0.6))+'px',
      top:(r.top+r.height*0.62)+'px',
      animationDelay:(Math.random()*.3)+'s',
    }, 1500);
  }
  SFX.scroll();
}
// 炼器：炉火飞溅
function fxForge(id){
  const el = document.getElementById('pl-'+id); const L = fxLayer();
  if(!el || !L) return;
  const r = el.getBoundingClientRect();
  for(let i=0;i<12;i++){
    spawnFx('fx-forge-spark', {
      left:(r.left+r.width*(0.3+Math.random()*0.4))+'px',
      top:(r.top+r.height*0.62)+'px',
      '--dx':((Math.random()*2-1)*50).toFixed(0)+'px',
      '--dy':(-40-Math.random()*55).toFixed(0)+'px',
      animationDelay:(Math.random()*.25)+'s',
    }, 1100);
  }
  SFX.forge();
}
// 出牌动画：卡牌自手牌飞向目标（无目标则向上消散）
function flyCard(uid, targetId){
  const src = document.getElementById('card-'+uid); if(!src) return;
  const L = fxLayer(); if(!L) return;
  const r1 = src.getBoundingClientRect();
  const VW = window.innerWidth, VH = window.innerHeight;
  const maxX = Math.max(0, VW - r1.width), maxY = Math.max(0, VH - r1.height);
  const c = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const fly = document.createElement('div');
  fly.className = 'fx-flycard ' + (src.className||'');
  fly.innerHTML = src.innerHTML;
  fly.style.left = c(r1.left, 0, maxX)+'px'; fly.style.top = c(r1.top, 0, maxY)+'px';
  fly.style.width = r1.width+'px'; fly.style.height = r1.height+'px';
  L.appendChild(fly);
  const dst = (targetId!==undefined && targetId!==null) ? document.getElementById('pl-'+targetId) : null;
  requestAnimationFrame(()=>{
    if(dst){
      const r2 = dst.getBoundingClientRect();
      let nx = r2.left + r2.width/2 - r1.width/2;
      let ny = r2.top + r2.height/2 - r1.height/2;
      // 若目标在视口外（r2 越界），则把飞卡钉在视口内相应方向边缘而不是飞出视口
      if(r2.right < 0 || r2.bottom < 0 || r2.left > VW || r2.top > VH){
        nx = c(r2.left + r2.width/2 - r1.width/2, 0, maxX);
        ny = c(r2.top + r2.height/2 - r1.height/2, 0, maxY);
      }else{
        nx = c(nx, 0, maxX); ny = c(ny, 0, maxY);
      }
      fly.style.left = nx+'px';
      fly.style.top  = ny+'px';
      fly.style.transform = 'scale(.5) rotate(10deg)';
    } else {
      fly.style.top = c(r1.top - 100, 0, maxY)+'px';
      fly.style.transform = 'scale(1.18)';
    }
    fly.style.opacity = '0';
  });
  setTimeout(()=>fly.remove(), 640);
}

function initAmbient(){
  const a=document.getElementById('ambient'); if(!a || a.childElementCount) return;
  for(let i=0;i<30;i++){
    const s=document.createElement('span'); s.className='am-dot';
    s.style.left=(Math.random()*100)+'%';
    s.style.setProperty('--d', (7+Math.random()*11)+'s');
    s.style.animationDelay=(-Math.random()*14)+'s';
    const sz=(2+Math.random()*3).toFixed(1);
    s.style.width=sz+'px'; s.style.height=sz+'px';
    s.style.opacity=(0.2+Math.random()*0.5).toFixed(2);
    a.appendChild(s);
  }
}

/* 图片目录规格（务必遵守，两类图不可交叉使用）：
 *   art/  —— 人物立绘，统一竖版 1024x1536（宽高比 0.667）。文件名 = CHARS 的 key。
 *   bg/   —— 战场场景图，统一横版（宽高比 >= 2.3）。文件名与人物无关。
 * 判定新图归属：用宽高比。>=1.15 归 bg/，<=0.87 归 art/，中间方形需人工确认。
 * 注意：art/ 下存在 4 张拼音别名孤儿图（guozj/liuchr/song/yang，实为郭竹酒/刘重润/宋集薪/杨老头），
 *       CHARS 用中文名作 key，这 4 张不会被引用，勿搬进 bg/。
 */
const BG_LIST = ['hepan.png','feisheng.png','一句一剑仙.png'];
let bgIdx = 0;
function cycleBg(){
  bgIdx = (bgIdx+1) % BG_LIST.length;
  const bf = document.querySelector('.battlefield');
  if(bf) bf.style.setProperty('--bg', "url(bg/"+BG_LIST[bgIdx]+")");
  juiceWipe();
}
// 节奏：缓 / 疾
function toggleSpeed(){
  speedMul = (speedMul > 0.7) ? 0.4 : 1;
  SFX.click();
  const b = document.getElementById('spdbtn');
  if(b){
    b.textContent = (speedMul > 0.7) ? '节奏 缓' : '节奏 疾';
    b.classList.toggle('off', speedMul <= 0.7);
  }
}
function toggleSfx(){
  SFX.set(!SFX.isOn());
  const b=document.getElementById('sfxbtn');
  if(b){ b.classList.toggle('off', !SFX.isOn()); b.textContent = SFX.isOn() ? '♪ 音效开' : '♪ 音效关'; }
}
/* 托管：人类座位交给 AI 代打；再点一次收回。
   只改「谁来下棋」，不碰任何数值与技能结算（AI 与人类共用 playCard/useSkill）。 */
function toggleAuto(){
  if(!state || state.over) return;
  SFX.click();
  state.auto = !state.auto;
  log(state.auto ? '【托管】此后由天意行棋，再点「托管 中」收回。' : '【托管】你接过了棋子。', 'sys');
  render();
  if(state.auto) autoTakeOver();
}
/* 托管接管：若此刻正停在人类出牌阶段，立刻把这一手走完；
   其余阶段（摸牌/判定）由 runTurn 自然流转到 AI 分支，不重复驱动。 */
async function autoTakeOver(){
  if(!state || !state.auto || state.over || state.busy || state.await || state.modal) return;
  if(state.tphase !== 'play') return;
  const p = current();
  if(!p || !p.alive) return;
  await sleep(300);
  if(!state.auto || state.over) return;
  await aiPlay(p);
  await sleep(240);
  if(!state.over && state.auto) endTurn();
}

/* ===================== 渲染 ===================== */
function onPlayerClick(id){
  if(state.await){ const r=state.await.resolve; state.await=null; r(id); }
}
function render(){
  const app = document.getElementById('app');
  if(!app) return;
  if(!state || state.phase==='title'){ renderTitle(app); return; }
  try {
    if(state.phase==='setup'){ renderSetup(app); return; }
    if(state.phase==='codex'){ renderCodex(app); return; }
    if(state.phase==='asklake'){ renderAskLake(app); return; }
    if(state.phase==='sect'){ renderSect(app); return; }
    if(state.phase==='fulu'){ renderFulu(app); return; }
    if(state.phase==='shenci'){ renderShenci(app); return; }
    if(state.phase==='baofu'){ renderBaofu(app); return; }
    if(state.phase==='profile'){ renderProfile(app); return; }
    if(state.phase==='result'){ renderResult(app); return; }
    renderGame(app);
  }catch(e){
    console.error('[render] phase='+state.phase+' failed:', e);
    app.innerHTML = '<div style="padding:32px;text-align:center;color:#e8c66a;font-family:var(--kai);">'
      +'<div style="font-size:22px;letter-spacing:6px;margin-bottom:12px">此 局 受 阻</div>'
      +'<div style="font-size:12px;color:#9a917f;letter-spacing:1px;margin-bottom:18px">'
      +(e.message||'未知异常')+'</div>'
      +'<button class="btn primary" onclick="state={phase:\'title\',sel:[],log:[]};render()">回 到 卷 首</button>'
      +'</div>';
  }
}

/* ---------- 人物志（不涉战局，纯翻阅） ---------- */
/* ---------- 境界稀有档位（人物志卡片角标） ----------
 * 坑：CHARS 经境界清洗后只有 14 人的 realm 是真值，其余 95 人原著未载、realm 被刻意
 * 置 null（旧三档退到 realmOld，防未考证值被当成真境界）。所以档位不能按 realm 取，
 * 否则 95 张卡片会退化成同一个"未载"档，角标失去区分度。
 * 改用 tier —— 1~4 层级人人有值，且正是 TIER_LIMIT 算手牌上限时实际使用的口径。
 * 角标文字：有真境界者写境界简称，未载者退到修行路径（原著确有记载的维度），
 * 保证 109 张卡片都有内容且不出现 null。 */
const TIER_RANK = {
  1: { t:'凡', c:'#8a8578' },
  2: { t:'精', c:'#5fb8a6' },
  3: { t:'绝', c:'#9b6fd4' },
  4: { t:'仙', c:'#d9553f' }
};
/* 角标内用简称："十四境·合道" 太长放不下 */
const REALM_SHORT = { '飞升境':'飞升', '玉璞境':'玉璞', '山巅境':'山巅',
                      '十四境·合道':'十四境', '十五境':'十五境', '止境':'止境' };
function tierRank(n){ return TIER_RANK[n] || TIER_RANK[2]; }
/* 角标文字：真境界优先，未载则退到修行路径 */
function realmTag(c){
  if(c.realm) return REALM_SHORT[c.realm] || c.realm;
  const s = (typeof pathLabel === 'function') ? pathLabel(c) : '';
  return s === '纯粹武夫' ? '武夫' : (s || '未载');
}
/* 全量字段：返回「境界 · 路径」拼接，仍 null 时不显示 null；用作 hero card 等大字号展示
   用 realmShortTag() 让 hero/setup 卡片也走同样的兜底，不再渲染 "null" */
function realmFullTag(c){
  const t = realmTag(c);
  if(!t || t === '未载') return '境界未载';        // 兜底文案（不是 null）
  return t;
}
/* 气血 -> 五星制星级：实心星数 = hp，其余用空心星补足到 5 颗，卡片高度因此整齐 */
function hpStars(n){
  n = Math.max(0, Math.min(5, n | 0));
  let s = '';
  for (let i = 0; i < 5; i++) s += i < n ? '<i class="st on">★</i>' : '<i class="st">☆</i>';
  return '<span class="cstars" title="气血 '+n+'">'+s+'</span>';
}

function renderCodex(app){
  const q = (state.q||'').trim();
  const keys = codexSort(Object.keys(CHARS).filter(k=>{
    const c = CHARS[k];
    if(state.filter!=='全部' && c.faction!==state.filter) return false;
    if(q && c.name.indexOf(q)<0 && k.indexOf(q)<0) return false;
    return true;
  }));
  const total = Object.keys(CHARS).length;
  const perFac = {};
  Object.keys(CHARS).forEach(k=>{ perFac[CHARS[k].faction] = (perFac[CHARS[k].faction]||0)+1; });

  if(state.codexTab==='wsp'){
    app.innerHTML = (typeof renderWushipai==='function')
      ? renderWushipai()
      : '<p class="hint">无事牌未载入。</p>';
    return;
  }
  let html;
  if(state.codexTab==='tales'){
    html = '<div class="codex-head"><h1>戏 里 戏 外</h1>'
      + '<span class="codex-stat">原著小记 · 共 <b>'+(typeof TALES!=='undefined'?TALES.length:0)+'</b> 则</span></div>'
      + '<button class="btn ghost" style="margin:8px 0 18px" onclick="state={phase:\'title\',sel:[],log:[]};render()">返回卷首</button>';
    html += renderTales();
    app.innerHTML = html; return;
  }
  html = '<div class="codex-head"><h1>人 物 志</h1>'
    + '<span class="codex-stat">共 <b>'+total+'</b> 人 · '
    + Object.keys(FACTIONS).map(f=>f+' <b>'+(perFac[f]||0)+'</b>').join(' · ')
    + '</span></div>';
  html += '<p class="hint">点击任一人查看立绘、技能与原著简报。此处不涉战局。</p>';

  html += '<div class="filterbar">';
  ['全部'].concat(Object.keys(FACTIONS)).forEach(f=>{
    const n = f==='全部' ? total : (perFac[f]||0);
    html += '<button class="fbtn'+(state.filter===f?' on':'')+'" onclick="setFilter(\''+f+'\')">'+f+' '+n+'</button>';
  });
  html += '<input class="fsearch" placeholder="搜人物" value="'+q+'" oninput="setQuery(this.value)">';
  html += '<button class="btn ghost" onclick="state={phase:\'title\',sel:[],log:[]};render()">返回卷首</button>';
  html += '</div>';

  html += '<div class="codex-grid">';
  keys.forEach(k=>{
    const c = CHARS[k];
    const col = FACTIONS[c.faction]||'#999';
    const rk = tierRank(c.tier);
    const parsed = parseSkills(c.txt);
    const skText = parsed.slice(0,2).map(s=>'<span>'+s.name+'</span>').join(' · ');
    const plots = (typeof PLOTS!=='undefined' && PLOTS[k]) ? PLOTS[k] : null;
    const plotTeaser = (plots && plots.length) ? (plots[0].length>22 ? plots[0].slice(0,22)+'…' : plots[0]) : '—';
    html += '<div class="codex-card" style="border-color:'+col+';--rc:'+rk.c+'" onclick="showCharBrief(\''+k+'\')">'
      + '<div class="cw" style="background:'+col+'">'
      +   '<div class="ph-initial">'+c.name.charAt(0)+'</div>'
      +   '<img src="art/'+k+'.png" alt="'+c.name+'" onerror="this.style.display=\'none\'">'
      +   '<span class="cf" style="color:'+col+'">'+c.faction+'</span>'
      +   '<span class="cr" title="'+realmLabel(c)+' · '+pathLabel(c)+'">'+(typeof realmIconForChar==='function'?realmIconForChar(c.realm):'')+realmTag(c)+'</span>'
      +   '<div class="cn">'+c.name+'</div>'
      + '</div>'
      + '<div class="cinfo">'
      +   '<div class="csk">'+(skText || '—')+'</div>'
      +   '<div class="cplot">'+plotTeaser+'</div>'
      +   '<div class="cno">'+hpStars(c.hp)+'<span class="cdot">·</span>'
      +     '天赋·'+(c.talent||'—')+'</div>'
      + '</div></div>';
  });
  html += '</div>';
  if(!keys.length) html += '<p class="hint" style="margin-top:26px">此间无人。</p>';
  app.innerHTML = html;
}
function showTale(id){
  state.selTale = id||null;
  render();
  /* 打开/收起画卷都回顶部：让摊卷动画从头可见 */
  if(typeof window!=='undefined' && window.scrollTo) window.scrollTo(0,0);
}
function renderTales(){
  if(state.selTale){
    const t = (typeof TALES!=='undefined') ? TALES.find(x=>x.id===state.selTale) : null;
    if(t) return renderTaleDetail(t);
  }
  let h = '<p class="hint">原著中的小故事 · 取《剑来》本意，不杜撰情节。</p>';
  h += '<div class="cx-tales">';
  (typeof TALES!=='undefined' ? TALES : []).forEach(t=>{
    h += '<div class="cx-tale" onclick="showTale(\''+t.id+'\')">'
      + '<div class="cx-tl">'+t.title+'</div>'
      + '<div class="cx-tmeta"><span class="cx-mchip">'+t.era+'</span><span class="cx-mchip">'+t.place+'</span></div>'
      + '<div class="cx-tpeople">'+t.people.map(p=>'<span class="cx-pchip">'+p+'</span>').join('')+'</div>'
      + '<div class="cx-tlead">'+t.lead+'</div>'
      + '<div class="cx-tmore">细 看 ›</div>'
      + '</div>';
  });
  h += '</div>';
  return h;
}
/* 光阴长河 · 蒙版后的流动光影：整块柔光平铺（每块到 tile 边缘已全透明，接缝天然不可见），
   两层以不同速度/方向漂移 + 呼吸；位移量取各层 background-size 整数倍以保证无缝循环。
   旧实现是 SVG 线条水波平铺，接缝为硬折角（表现为"很不连续"），已弃用。 */
const TALE_RIVER_SVG = '<div class="tale-river" aria-hidden="true">'
  + '<i class="tr-glow"></i>'
  + '<i class="tr-glow g2"></i>'
  + '</div>';
function renderTaleDetail(t){
  /* 画卷外壳：.tale-sway 居中容器（不晃动）/ .tale-scroll 居中摊卷 + 波纹光阴长河 + 圆木画轴 */
  let h = '<div class="tale-sway">'
    + '<div class="tale-scroll">'
    + '<div class="tale-axis left"></div><div class="tale-axis right"></div>'
    + '<span class="tale-seal-tl">剑来</span><span class="tale-seal-br">戏外</span>'
    + TALE_RIVER_SVG
    + '<div class="cx-tale-detail">'
    + '<div class="cx-dname" style="color:#c9a24b">'+t.title+'</div>'
    + '<div class="cx-tmeta"><span class="cx-mchip">'+t.era+'</span><span class="cx-mchip">'+t.place+'</span></div>'
    + '<div class="cx-tpeople">'+t.people.map(p=>'<span class="cx-pchip">'+p+'</span>').join('')+'</div>'
    + '<div class="cx-tlead">'+t.lead+'</div>'
    + '<div class="cx-sec">— 故 事 —</div>';
  (t.beats||[]).forEach(b=>{
    h += '<div class="cx-beat"><div class="cx-bt">'+b.t+'</div><div class="cx-bd">'+b.d+'</div></div>';
  });
  if(t.quote) h += '<div class="cx-quote">「'+t.quote+'」</div>';
  if(t.note) h += '<div class="cx-note">'+t.note+'</div>';
  h += '<div style="text-align:center;margin-top:18px"><button class="btn ghost" onclick="showTale(null)">收 卷</button></div>';
  h += '</div></div></div>';
  return h;
}
function parseSkills(txt){
  if(!txt) return [];
  const out=[]; const re=/【([^】]+)】([^【]*)/g; let m;
  while((m=re.exec(txt))) out.push({ name:m[1], desc:m[2].replace(/^[；;、\s]+/,'').trim() });
  return out;
}

/* ---------- 开场 ---------- */
const TITLE_BGS = ['bg/feisheng.png','bg/小镇牌匾.png','bg/合集封面海报.png','bg/群像长卷.png','bg/廊桥认主.png','bg/开天斩周密.png','bg/一句一剑仙.png','bg/河畔议事.png','bg/那就打.png','bg/举城飞升.png','bg/hepan.png','bg/隐官一脉.png'];
let titleBgIndex = 0;
function nextTitleBg(){ titleBgIndex = (titleBgIndex+1)%TITLE_BGS.length; render(); }
function prevTitleBg(){ titleBgIndex = (titleBgIndex-1+TITLE_BGS.length)%TITLE_BGS.length; render(); }
/* 首页模式卡图标：单色描边、stroke-width 2、round、无渐变光晕；currentColor 继承金色 */
const TS_MODE_ICO = {
  ai: '<svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="9.8" cy="25.4" rx="5" ry="1" fill="currentColor" fill-opacity=".16" stroke="none"/><path d="M7.6 10.4 L10.9 10.4 L12.1 18.2 Q9.6 19 7.1 18.2 Z" fill="currentColor" fill-opacity=".13" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.3 12 Q8.9 14.4 8.6 16.6" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity=".4" stroke-linecap="round"/><path d="M9 18.6 L6.6 24.4 M10.3 18.6 L13 24.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9.2" cy="8" r="2.15" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="1.6"/><path d="M17.5 4.6 L6 19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M18.2 5.2 L6.7 19.8" fill="none" stroke="currentColor" stroke-width=".9" stroke-opacity=".38" stroke-linecap="round"/><path d="M16.8 8.7 L13.6 6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="4.1" r=".9" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="1.2"/></svg>',
  hot: '<svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 23 L17 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 23 L13 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 8 L21 10 L18 14 Z" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 8 L9 10 L12 14 Z" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  siege: '<svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 24 L5 14 L9 14 L9 24 M9 24 L9 11 L13 11 L13 24 M13 24 L13 14 L17 14 L17 24 M17 24 L17 11 L21 11 L21 24 M21 24 L21 14 L25 14 L25 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M5 11 L25 11 L23 7 L7 7 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M15 7 L15 3 M12 3 L18 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  boss: '<svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="15" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 11 L6 7 M15 8 L15 3 M21 11 L24 7 M9 19 L6 23 M21 19 L24 23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11 9 L13 12 M19 9 L17 12 M11 21 L13 18 M19 21 L17 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".6"/></svg>',
  asklake: '<svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5 L9 25 M15 5 L15 25 M21 5 L21 25" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 8 L24 8 M6 15 L24 15 M6 22 L24 22" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".55"/><path d="M9 5 Q15 3 21 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  sect: '<svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 24 Q9 11 14 19 Q18 12 26 24 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M11 20 Q14 15 17 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".5"/></svg>',
  shenci: '<svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 24 Q7 21.5 12 24 T22 24 T30 24 L30 29 L2 29 Z" fill="#3f5d57" fill-opacity=".5"/><path d="M3 23 Q9 12 14 20 Q18 10 27 23 Z" fill="#c79a44" fill-opacity=".32" stroke="#e8cf8f" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M9 19 Q13 15 17 19" fill="none" stroke="#e8cf8f" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".5"/><path d="M9 13.5 L15 9.5 L21 13.5 Z" fill="#b5514a" fill-opacity=".85" stroke="#e8cf8f" stroke-width="1.3" stroke-linejoin="round"/><path d="M8.6 13.5 L7 12 M21.4 13.5 L23 12" stroke="#e8cf8f" stroke-width="1.5" stroke-linecap="round"/><path d="M11.5 13.5 L11.5 18.5 M18.5 13.5 L18.5 18.5 M11.5 18.5 L18.5 18.5" stroke="#e8cf8f" stroke-width="1.7" stroke-linecap="round"/><path d="M14 18.5 L14 15 L16 15 L16 18.5" fill="none" stroke="#e8cf8f" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M15 9.5 Q13.5 7 15 5 Q16.5 3.5 15 2.2" fill="none" stroke="#e8cf8f" stroke-width="1.4" stroke-linecap="round"/><circle cx="15" cy="2.2" r="1.2" fill="#e8cf8f"/></svg>',
  codex: '<svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 6 Q5 6 5 9 L5 21 Q5 24 8 24 L22 24 Q25 24 25 21 L25 9 Q25 6 22 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M8 6 L22 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11 11 L19 11 M11 15 L19 15 M11 19 L16 19" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".55"/></svg>',
};
function renderTitle(app){
  const total = Object.keys(CHARS).length;
  const bg = TITLE_BGS[titleBgIndex];
  app.innerHTML =
    '<div class="title-screen" style="--bg-img:url(\''+bg+'\')">'
    + '<div class="ts-mark">剑来</div>'
    + '<div class="ts-rule"></div>'
    + '<div class="ts-sub">江湖没什么好的，也就酒还行</div>'

    + '<div class="ts-group">'
    +   '<div class="ts-group-title">对 战</div>'
    +   '<div class="mode-grid">'
    +     '<div class="ts-mode" onclick="chooseMode(\'ai\')">' +
        '<div class="ts-mode-head"><h3>仗剑独行</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="9.8" cy="25.4" rx="5" ry="1" fill="currentColor" fill-opacity=".16" stroke="none"/><path d="M7.6 10.4 L10.9 10.4 L12.1 18.2 Q9.6 19 7.1 18.2 Z" fill="currentColor" fill-opacity=".13" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.3 12 Q8.9 14.4 8.6 16.6" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity=".4" stroke-linecap="round"/><path d="M9 18.6 L6.6 24.4 M10.3 18.6 L13 24.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="9.2" cy="8" r="2.15" fill="currentColor" fill-opacity=".16" stroke="currentColor" stroke-width="1.6"/><path d="M17.5 4.6 L6 19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M18.2 5.2 L6.7 19.8" fill="none" stroke="currentColor" stroke-width=".9" stroke-opacity=".38" stroke-linecap="round"/><path d="M16.8 8.7 L13.6 6.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="4.1" r=".9" fill="currentColor" fill-opacity=".35" stroke="currentColor" stroke-width="1.2"/></svg></div></div>'
    +       '<p>你执一人，与 1–3 名由天意撮合的对手酣战。对手自行出牌、应招、讲道理。</p>'
    +       '<div class="md-meta">选 1 人 · 对手 1–3 名</div></div>'
    +     '<div class="ts-mode" onclick="chooseMode(\'hot\')">' +
        '<div class="ts-mode-head"><h3>群雄论剑</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M7 23 L17 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 23 L13 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 8 L21 10 L18 14 Z" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 8 L9 10 L12 14 Z" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></div></div>'
    +       '<p>2–5 人共坐一席、轮流传机，彼此斗智。适合现场对决。</p>'
    +       '<div class="md-meta">选 2–5 人 · 全为手动</div></div>'
    +     '<div class="ts-mode" onclick="chooseMode(\'siege\')">' +
        '<div class="ts-mode-head"><h3>剑气长城</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 24 L5 14 L9 14 L9 24 M9 24 L9 11 L13 11 L13 24 M13 24 L13 14 L17 14 L17 24 M17 24 L17 11 L21 11 L21 24 M21 24 L21 14 L25 14 L25 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M5 11 L25 11 L23 7 L7 7 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M15 7 L15 3 M12 3 L18 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div></div>'
    +       '<p>蛮荒天下分五波叩关。每波退敌可回气补牌，看你能守到第几波。</p>'
    +       '<div class="md-meta">守方 1–2 人 · 共 5 波</div></div>'
    +     '<div class="ts-mode" onclick="chooseMode(\'boss\')">' +
        '<div class="ts-mode-head"><h3>天下共伐</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="15" cy="15" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 11 L6 7 M15 8 L15 3 M21 11 L24 7 M9 19 L6 23 M21 19 L24 23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11 9 L13 12 M19 9 L17 12 M11 21 L13 18 M19 21 L17 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".6"/></svg></div></div>'
    +       '<p>2–3 人联手围攻一名气血 ×2 的巨寇。第 4 轮起巨寇威压渐盛。</p>'
    +       '<div class="md-meta">讨伐方 2–3 人 · 1 名巨寇</div></div>'
    +   '</div>'
    + '</div>'

    + '<div class="ts-group">'
    +   '<div class="ts-group-title">问 心</div>'
    +   '<div class="mode-grid">'
    +     '<div class="ts-mode" onclick="openAskLake()">' +
        '<div class="ts-mode-head"><h3>书简湖问心局</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 5 L9 25 M15 5 L15 25 M21 5 L21 25" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 8 L24 8 M6 15 L24 15 M6 22 L24 22" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".55"/><path d="M9 5 Q15 3 21 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div></div>'
    +       '<p>不拼剑气，只问本心。择来路、走支线、付代价，在五维心境与六方态度之间取舍。</p>'
      +       '<div class="md-meta">单人叙事 · 分支 · '+AL_TOTAL+' 结局</div></div>'
    +   '</div>'
    + '</div>'

    + '<div class="ts-group">'
    +   '<div class="ts-group-title">经 营</div>'
    +   '<div class="mode-grid">'
    +     '<div class="ts-mode" onclick="openSect()">' +
        '<div class="ts-mode-head"><h3>落魄山</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 24 Q9 11 14 19 Q18 12 26 24 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M11 20 Q14 15 17 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".5"/></svg></div></div>'
    +       '<p>不做剑客，做山主。以「旬」为节奏收徒、建观、祭炼飞剑、应对江湖与蛮荒，在节点 deadline 与道心约束下，求得第五十四旬建宗大典立世。</p>'
    +       '<div class="md-meta">单人经营 · 养成 · 多结局</div></div>'
    +     '<div class="ts-mode" onclick="openShenci()">' +
        '<div class="ts-mode-head"><h3>山水祠</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 24 Q7 21.5 12 24 T22 24 T30 24 L30 29 L2 29 Z" fill="#3f5d57" fill-opacity=".5"/><path d="M3 23 Q9 12 14 20 Q18 10 27 23 Z" fill="#c79a44" fill-opacity=".32" stroke="#e8cf8f" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M9 19 Q13 15 17 19" fill="none" stroke="#e8cf8f" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".5"/><path d="M9 13.5 L15 9.5 L21 13.5 Z" fill="#b5514a" fill-opacity=".85" stroke="#e8cf8f" stroke-width="1.3" stroke-linejoin="round"/><path d="M8.6 13.5 L7 12 M21.4 13.5 L23 12" stroke="#e8cf8f" stroke-width="1.5" stroke-linecap="round"/><path d="M11.5 13.5 L11.5 18.5 M18.5 13.5 L18.5 18.5 M11.5 18.5 L18.5 18.5" stroke="#e8cf8f" stroke-width="1.7" stroke-linecap="round"/><path d="M14 18.5 L14 15 L16 15 L16 18.5" fill="none" stroke="#e8cf8f" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/><path d="M15 9.5 Q13.5 7 15 5 Q16.5 3.5 15 2.2" fill="none" stroke="#e8cf8f" stroke-width="1.4" stroke-linecap="round"/><circle cx="15" cy="2.2" r="1.2" fill="#e8cf8f"/></svg></div></div>'
    +       '<p>不做剑客，做神明。辖一方水土、享一方香火，不能下山也不能出手，只能应或不应。香火养你，也绑住你；往上走一步，脚下的土就薄一寸。</p>'
    +       '<div class="md-meta">单人神道 · 香火经营 · 7 结局</div></div>'
    +     '<div class="ts-mode" onclick="openBaofu()">' +
        '<div class="ts-mode-head"><h3>包袱斋</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 7 L23 13 L23 24 Q23 26 21 26 L9 26 Q7 26 7 24 L7 13 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 13 Q15 16 21 13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 9 Q15 5 18 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M15 5 L15 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></div></div>'
    +       '<p>不做剑客，做行商。老祖师的和气斋有九十九间屋子，一间只卖一物；没有落脚地儿的散修摊子，才最考眼力——捡漏还是打眼，全凭你读过几本书。</p>'
    +       '<div class="md-meta">行商 · 拣漏 · 悟道 · 赊欠</div></div>'
    +   '</div>'
    + '</div>'

    + '<div class="ts-group">'
    +   '<div class="ts-group-title">阅 览</div>'
    +   '<div class="mode-grid">'
    +     '<div class="ts-mode" onclick="openCodex()">' +
        '<div class="ts-mode-head"><h3>人物志</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M8 6 Q5 6 5 9 L5 21 Q5 24 8 24 L22 24 Q25 24 25 21 L25 9 Q25 6 22 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M8 6 L22 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M11 11 L19 11 M11 15 L19 15 M11 19 L16 19" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".55"/></svg></div></div>'
    +       '<p>不涉战局，只翻阅群英：立绘、阵营、境界、技能与原著简报。</p>'
    +       '<div class="md-meta">共 '+total+' 人</div></div>'
    +       '<div class="ts-mode" onclick="openTales()">'
    +         '<div class="ts-mode-head"><h3>戏里戏外</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 7 C11 4 7 5 5 7 L5 22 C7 20 11 19 15 22 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M15 7 C19 4 23 5 25 7 L25 22 C23 20 19 19 15 22 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><path d="M15 7 L15 22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-opacity=".55"/></svg></div></div>'
    +         '<p>原著里的闲笔与回响：杨晃夫妇、齐静春称圣、阿良、崔瀺、宁姚……取《剑来》本意，不杜撰。</p>'
    +         '<div class="md-meta">原著小记 共 '+((typeof TALES!=='undefined')?TALES.length:0)+' 则</div></div>'
    +       '<div class="ts-mode" onclick="openWushipai()">'
    +         '<div class="ts-mode-head"><h3>无事牌</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="9" y="5.5" width="12" height="21" rx="2.4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="15" cy="9" r="1.5" fill="currentColor"/><path d="M11 13.5 H19 M11 17.5 H19 M13 21.5 H17" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-opacity=".5"/></svg></div></div>'
    +         '<p>剑气长城酒铺那面木墙：剑修出城前留一句"最后的声音"，也收录书中人物的对白与箴言。翻八十块，看他们来过、爱过、憾过。</p>'
    +         '<div class="md-meta">八十面 · 箴言匣</div></div>'
    +       '<div class="ts-mode" onclick="openFulu()">'
    +         '<div class="ts-mode-head"><h3>符箓图鉴</h3><div class="ts-mode-ico"><svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="8" y="4" width="14" height="22" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M11 8 H19 M11 12 H19 M11 16 H19 M11 20 H16" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-opacity=".6"/><circle cx="15" cy="6.5" r="1.2" fill="currentColor" fill-opacity=".5"/></svg></div></div>'
    +         '<p>不涉战局，只翻阅符箓：缩地、破障、镇妖、求雨、雷符……名、功效、来历与出处，并附据古法符箓体例绘制的图样。</p>'
    +         '<div class="md-meta">原著符箓 共 '+((typeof FULU!=='undefined')?FULU.length:0)+' 种</div></div>'
    +   '</div>'
    + '</div>'

    + pfTitleCard()

    + '<div class="ts-group">'
    +   '<div class="ts-group-title">设 置</div>'
    +   '<div class="diff-row">'
    +     Object.keys(DIFF).map(k=>{
            const d = DIFF[k];
            return '<button class="dbtn'+(difficulty===k?' on':'')+'" onclick="setDifficulty(\''+k+'\')" '
                 + 'title="'+d.desc+'">'+d.name+'</button>';
          }).join('')
    +   '</div>'
    +   '<div class="diff-desc">'+(DIFF[difficulty]||DIFF.normal).desc+'</div>'
    +   '<div class="rec-row">战绩 <b>'+record.win+'</b> 胜 <b>'+record.lose+'</b> 负'
    +     '　·　当前连胜 <b>'+record.streak+'</b>　·　最高连胜 <b>'+record.best+'</b></div>'
    + '</div>'

    + '<div class="ts-foot">点击任一入口即启程</div>'
    + '<div class="ts-foot" style="margin-top:14px;">'
    +   '<span class="fbtn" style="cursor:pointer;font-size:12px;padding:6px 16px;" onclick="openRules()">玩法说明</span>'
    + '</div>'
    + '<div class="ts-bg-switch">'
    +   '<span onclick="prevTitleBg()">◀</span>'
    +   '<span>'+(titleBgIndex+1)+' / '+TITLE_BGS.length+'</span>'
    +   '<span onclick="nextTitleBg()">▶</span>'
    + '</div>'
    + '</div>';
}
/* 卷首 · 修士卡片：名号 / 道途 / 境界 / 道行（点进行迹录）
   profile.js 未加载时静默不渲染，不影响原卷首。 */
function pfTitleCard(){
  try{
    if(typeof pfLoad!=='function') return '';
    pfLoad();
    const ICO = '<svg viewBox="0 0 30 30" width="28" height="28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<path d="M8 6 Q5 6 5 9 L5 21 Q5 24 8 24 L22 24 Q25 24 25 21 L25 9 Q25 6 22 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
      + '<path d="M8 6 L22 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      + '<circle cx="15" cy="13" r="3.2" fill="none" stroke="currentColor" stroke-width="1.7"/>'
      + '<path d="M9.5 21.5 Q15 16.5 20.5 21.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'
      + '</svg>';
    const head = '<div class="ts-mode-head"><h3>行迹录</h3><div class="ts-mode-ico">'+ICO+'</div></div>';

    if(!PF.path){
      return '<div class="ts-group"><div class="ts-group-title">修 士</div><div class="mode-grid">'
        + '<div class="ts-mode" onclick="openProfile()">' + head
        + '<p>先在山中想一想：走剑修的路，还是练气士的路，或者干脆打磨自家这一副皮肉血气。择定之后，每一局棋都算修行。</p>'
        + '<div class="md-meta">尚未择道 · 点此立身</div></div></div></div>';
    }
    const P  = pfPath(PF.path) || { name:'' };
    const rl = pfNow(), nx = pfNext(), prg = pfProgress(), b = PF.batt;
    const nm = PF.name ? PF.name : '无名客';
    const meta = (b.total ? (b.win+' 胜 '+b.lose+' 负　·　') : '') + '道行 '+PF.xp;
    const nxt = nx ? ('下一境「'+nx.realm.n.replace(/\s/g,'')+'」尚需 '+nx.far) : '已至顶峰';
    return '<div class="ts-group"><div class="ts-group-title">修 士</div><div class="mode-grid">'
      + '<div class="ts-mode" onclick="openProfile()">' + head
      + '<p><b style="color:#e8c66a;letter-spacing:1px">'+nm+'</b>　'+P.name.replace(/\s/g,'')
      + '　今天是「'+rl.n.replace(/\s/g,'')+'」——'+rl.grp+'。'
      + nxt+'。</p>'
      + '<div class="md-meta">'+meta+'</div></div></div></div>';
  }catch(e){ return ''; }
}
function chooseMode(mode){
  SFX.set(true); SFX.click();
  state = { phase:'setup', mode:mode, sel:[], filter:'全部', q:'', aiCount:2, log:[] };
  render();
}
function openCodex(){
  SFX.set(true); SFX.click();
  state = { phase:'codex', mode:'codex', sel:[], filter:'全部', q:'', log:[], codexTab:'chars', selTale:null };
  render();
}
function openTales(){
  SFX.set(true); SFX.click();
  state = { phase:'codex', mode:'codex', sel:[], filter:'全部', q:'', log:[], codexTab:'tales', selTale:null };
  render();
}
function openFulu(){
  SFX.set(true); SFX.click();
  state = { phase:'fulu', mode:'fulu', sel:[], log:[], selFulu:null };
  render();
}

function openAskLake(){
  SFX.set(true); SFX.click();
  state = {
    phase:'asklake', mode:'asklake', sel:[], filter:'全部', q:'', log:[],
    asklake: newAskLakeState()
  };
  render();
}

/* ===================== 规则说明 ===================== */
function openRules(){
  SFX.set(true); SFX.click();
  const R = (k,v)=>'<div class="rcard"><div class="rk">'+k+'</div><div class="rv">'+v+'</div></div>';
  const m = document.getElementById('modal');
  m.innerHTML = '<div class="modal-box rules-box">'
    + '<h2>剑 来 · 玩 法 要 义</h2>'
    + '<div class="rsub">说道理的修士博弈 —— 比三国杀多了境界、本命飞剑与讲道理</div>'

    + '<div class="rsec"><h3>一、胜负</h3>'
    + '<p>消灭对手阵营「主将」即破其阵；依模式不同另有守城波次、共伐巨寇等目标。气血（HP）归零即出局。</p></div>'

    + '<div class="rsec"><h3>二、境界</h3>'
    + R('练气','手牌上限 4') + R('止境','手牌上限 5') + R('飞升','手牌上限 6，部分技能额外强化')
    + '<p>回合流程：摸牌 → 出牌 → 弃牌（超上限须弃至上限）。</p></div>'

    + '<div class="rsec"><h3>三、基本牌</h3>'
    + R('剑气','杀。造成 1 点伤害，每回合有出剑次数上限。')
    + R('守心','闪。应敌时打出，抵消一次剑气。')
    + R('丹药','桃。回复 1 点气血（莲花天下回复 2）。')
    + R('饮者','酒。本回合剑气伤害 +1。') + '</div>'

    + '<div class="rsec"><h3>四、锦囊（符箓/神通/法宝）</h3>'
    + R('论道','双方轮流出剑气，先不出者受伤。')
    + R('万剑归宗','除你外全员需出守心，否则受 1 伤。')
    + R('蛮荒入侵','除你外全员需出剑气，否则受 1 伤。')
    + R('结盟','全场回复 1 气血。')
    + R('福缘','依次摸一张公共牌。')
    + R('机缘','摸两张牌。')
    + R('破阵','弃置一名角色一张牌（有装备则破装备）。')
    + R('借物','获得一名角色一张手牌。')
    + R('天劫','指定一人判定，中者受 2 伤。')
    + R('入定','目标下回合无法出牌。')
    + R('绝灵','目标下回合摸牌阶段少摸一。')
    + R('连脉','连锁两名角色，伤害共享。') + '</div>'

    + '<div class="rsec"><h3>五、装备 · 本命飞剑</h3>'
    + '<p>祭出本命飞剑：攻击 +1，且每回合可多出一剑。部分角色（如陈平安【守拙】）可弃牌当守心，或技能中另有奥义。</p></div>'

    + '<div class="rsec"><h3>六、讲道理</h3>'
    + '<p>技能或锦囊要求「讲道理」时，双方各暗置一张手牌同时翻开，先看大道相性（剑克蛮荒、儒压道、道克执、佛克蛮荒），再看牌面点数。胜方获得对应效果。</p></div>'

    + '<div class="rsec"><h3>七、连击</h3>'
    + '<p>玩家侧连续命中时，第 2 次起每层 +1 伤害（上限 +2）。仅玩家侧生效，不影响对手。</p></div>'

    + '<div class="rsec"><h3>八、后期势压（防僵局）</h3>'
    + '<p>第 25 轮起剑气伤害 +1，第 40 轮起 +2；同时丹药回复量相应降低。势压之下，久战不决的局面会更快见分晓。</p></div>'

    + '<div class="rsec"><h3>九、难度与模式</h3>'
    + R('简单','我方起手 +1 张牌；巨寇 ×1.35')
    + R('普通','原典规则')
    + R('困难','敌方起手 +1 张牌；巨寇 ×1.90')
    + R('仗剑独行','单人 vs 1–3 名 AI')
    + R('群雄论剑','2–5 人同席热座轮流')
    + R('剑气长城','守方 1–2 人，抵御蛮荒五波叩关')
    + R('天下共伐','2–3 人围攻气血 ×2 的巨寇') + '</div>'

    + '<button class="btn primary rclose" onclick="closeModal()">知晓了</button>'
    + '</div>';
  m.style.display='flex';
  m.onclick = ()=>{};
  lockBody(true);
}

function closeModal(){
  const m = document.getElementById('modal');
  m.style.display='none'; m.innerHTML=''; m.onclick=null;
  lockBody(false);
}

/* ---------- 书简湖问心局（v2 · 深局：非线性 / 五维 / 六方态度 / 十八结局） ---------- */
/* 注：「三十七户」为游戏原创文学设定（顾璨杀孽的意象化计数），原著未载确切户数与人名，非史实；
   本模块以「湖上苦主（数不胜数）」呈现，不留可核对的史实数字。 */

/* 六方态度 */
const AL_NPC = [
  { k:'gucan',   n:'顾璨',   d:'泥瓶巷一起长大的弟弟' },
  { k:'mother',  n:'顾母',   d:'把你当半个儿子的婶婶' },
  { k:'liulao',  n:'刘老成', d:'书简湖老辈，湖底最沉的那双眼' },
  { k:'zhongs',  n:'众生',   d:'湖上苦主（数不胜数），与满湖的看客' },
  { k:'shuyuan', n:'书院',   d:'文圣一脉，齐先生留下的规矩' },
  { k:'ningyao', n:'宁姚',   d:'千里之外的那把剑' }
];
const AL_NPCN = {};
AL_NPC.forEach(x=>{ AL_NPCN[x.k]=x.n; });

/* 来路（开局）：决定你带什么进书简湖 */
const AL_ORIGINS = [
  { k:'sword', t:'负剑而来', mark:'剑',
    d:'你带着剑来，也带着压不住的火气。路上有三个拦路的，没拦住。',
    tip:'剑气最盛，文胆已损三分；书院对你早有戒心，顾璨却更安心',
    eff:{ sword:40, dan:-20, qing:5, li:-5 }, npc:{ shuyuan:-15, gucan:10, zhongs:-5 } },
  { k:'alone', t:'只身而来', mark:'心',
    d:'你一个人来。没带剑，也没惊动谁。你想先看完，再决定怎么做。',
    tip:'心境最平，文胆完好；谁也没惊动，也谁都没指望你',
    eff:{ sword:-15, dan:10, li:5 }, npc:{ liulao:5 } },
  { k:'order', t:'奉师命而来', mark:'理',
    d:'老秀才老爷子只说了一句：去看看，别急着做决定。你一路把这句话念到了湖边。',
    tip:'理字在身、书院背书；可顾璨看见你，先看见了先生',
    eff:{ dan:10, li:15, qing:-10, sword:-5 }, npc:{ shuyuan:25, gucan:-15, mother:10 } }
];

/* 随机插曲：湖上风雨，不由人定 */
const AL_INTERLUDES = [
  { t:'雨夜卖酒', d:'一个不认识的少年在雨里卖酒，说湖上今天死了人，酒卖得快。你买了一坛，没喝。',
    eff:{ dao:4, hope:3 }, npc:{ zhongs:3 }, img:'assets/shujianhu/rain_wine.jpg' },
  { t:'旧信一封', d:'有人在门缝里塞了封信，是顾璨早年写的：「哥，这里的人都欺负我，我学会还手了。」',
    eff:{ qing:8, knot:3 }, npc:{ gucan:6 }, img:'assets/shujianhu/old_letter.jpg' },
  { t:'湖底浮尸', d:'一具尸体浮上来，是昨天还跟你打过招呼的船家。湖上没人围观，都习惯了。',
    eff:{ li:6, knot:4 }, npc:{ zhongs:-4 }, img:'assets/shujianhu/lake_corpse.jpg' },
  { t:'刘老成的酒', d:'刘老成派人送来一坛酒，附一张纸条：「年轻人，湖里的规矩不是一天立起来的。」',
    eff:{ li:5 }, npc:{ liulao:8 }, img:'assets/shujianhu/liulao_wine.jpg' },
  { t:'孩子扔石头', d:'几个孩子朝顾璨的院子扔石头，边扔边喊小魔头。你站了一会儿，他们就跑了。',
    eff:{ qing:5, hope:-4 }, npc:{ gucan:-3, zhongs:3 }, img:'assets/shujianhu/kids_stones.jpg' },
  { t:'远方剑鸣', d:'夜里有一道剑光自西北来，绕湖一圈，又走了。宁姚从不问你难不难，只告诉你她在。',
    eff:{ dao:6, qing:4 }, npc:{ ningyao:12 }, img:'assets/shujianhu/distant_sword.jpg' },
  { t:'三十七炷香', d:'有人在湖边点了三十七炷香，一炷一个人。香烧完之前，没人说话。',
    eff:{ li:8, hope:5 }, npc:{ zhongs:8 }, img:'assets/shujianhu/thirtyseven_incense.jpg' },
  { t:'旧刀生锈', d:'你在顾璨床下看见一把锈了的刀，是泥瓶巷那年你送他的。他一直留着。',
    eff:{ qing:10 }, npc:{ gucan:8 }, img:'assets/shujianhu/old_knife_rust.jpg' }
];

/* 问心图：id → 节点 */
const AL_NODES = {
/* ============ 一 · 入湖 ============ */
s1:{ ch:'一 · 入湖', t:'血，与笑', il:0,
  d:'你收到顾璨的消息，连夜赶来。推开那扇门时，他正坐在血泊里擦剑，抬头看见你，咧嘴笑了：「哥，你来啦。」\n他笑得像小时候偷了别人家枣子被你抓住的样子。可地上那滩血，不是他的。',
  ch2:[
    { txt:'先听他说', note:'情动于衷，但未失分寸', eff:{ qing:8, li:2 }, npc:{ gucan:8 }, next:'s2a' },
    { txt:'先问：地上这些人，是谁', note:'先把死者的名字问清楚', eff:{ li:12, qing:-4 }, npc:{ zhongs:10, gucan:-8 }, next:'s2b' },
    { txt:'替他止血，余事再议', note:'手比道理快', eff:{ qing:15, knot:5 }, npc:{ gucan:12, mother:8 }, next:'s2c' }
  ]},

s2a:{ ch:'一 · 入湖', t:'先下手为强',
  d:'顾璨擦干净剑，语气很平常：「他们都要害我，我只是先下手为强。哥，这里就是这样的规矩——你不吃人，人就吃你。」\n他说得很理直气壮，理直气壮得让你心里发凉。',
  ch2:[
    { txt:'杀人就是杀人，没有理由', note:'一句也听不进去', eff:{ li:14, dao:4, qing:-6 }, npc:{ gucan:-12, zhongs:10 }, next:'s3' },
    { txt:'你受苦了。可总得有个交代', note:'先认他的苦，再问他的账', eff:{ qing:10, li:6 }, npc:{ gucan:6 }, next:'s3' },
    { txt:'我帮你扛', note:'话出口的时候，湖面静了一下', eff:{ qing:18, knot:8 }, npc:{ gucan:18, zhongs:-15 }, next:'s3' }
  ]},

s2b:{ ch:'一 · 入湖', t:'一叠血衣',
  d:'你没有去看顾璨，先去了湖边那间破屋。一个老妇跪在门口，怀里抱着一叠血衣，一件一个人。\n她不哭也不闹，只说：「小哥，你是他哥，你替我做回主。」',
  ch2:[
    { txt:'收下血衣，许她一个交代', note:'一叠布，三十七条命的重量', eff:{ li:12, dao:6, hope:10, dan:-5 }, npc:{ zhongs:16, gucan:-6 }, flag:'cloth', next:'s3' },
    { txt:'给她银钱，让她先过日子', note:'钱能买米，买不回人', eff:{ li:-6, qing:6, hope:-6, knot:4 }, npc:{ zhongs:-4 }, next:'s3' },
    { txt:'让她先回去，容我想想', note:'想，往往就是拖', eff:{ li:-10, qing:8, hope:-8, knot:6 }, npc:{ zhongs:-10, gucan:10 }, next:'s3' }
  ]},

s2c:{ ch:'一 · 入湖', t:'你不该来',
  d:'你替他把伤口包好。他一直看着你，忽然说：「哥，你不该来。」\n你问为什么。他说：「你来了，我就装不下去了。」',
  ch2:[
    { txt:'我来了，就不会走', note:'这句话你自己听着都沉', eff:{ qing:15, knot:5 }, npc:{ gucan:15, mother:6 }, next:'s3' },
    { txt:'我来，是怕你再错', note:'把话说明白，也是一种护', eff:{ qing:8, li:10, dao:4 }, npc:{ gucan:-4 }, next:'s3' },
    { txt:'什么也不说，把药上完', note:'沉默有时候最重', eff:{ qing:12, knot:6 }, npc:{ gucan:8, mother:8 }, next:'s3' }
  ]},

s3:{ ch:'一 · 入湖', t:'婶婶跪下了', il:1,
  d:'顾璨的母亲来了。她没哭天抢地，只是端端正正跪在你面前，像当年求你去看着点璨儿那样。\n「平安，婶婶不求别的。璨儿从小听你的，你救他一次。」',
  ch2:[
    { txt:'婶婶起来。我给他一个公道', note:'公道，也是护他的一种法子', eff:{ li:12, qing:6, dao:4 }, npc:{ mother:15, shuyuan:5 }, next:'s4' },
    { txt:'我答应你，不让人伤他', note:'一句话，把三十七户推到了对面', eff:{ qing:18, knot:8 }, npc:{ mother:20, gucan:10, zhongs:-12 }, next:'s4' },
    { txt:'他犯的错，我替不了', note:'界限分明，也格外冷', eff:{ li:10, qing:-12 }, npc:{ mother:-15, gucan:-10, zhongs:8 }, next:'s4' }
  ]},

/* ============ 二 · 问心 ============ */
s4:{ ch:'二 · 问心', t:'刘老成的酒席',
  d:'刘老成派人来请。这人在书简湖活成了老辈，湖里每一桩血案，他都知道，也都没拦。\n席上他给你斟酒：「陈公子，湖里的规矩不是一天立起来的。你要拆，得先想清楚拆完拿什么补。」',
  ch2:[
    { txt:'赴宴，把他的话听完', note:'敌人的道理，也是道理', eff:{ li:8, hope:6 }, npc:{ liulao:15, zhongs:3 }, next:'s5' },
    { txt:'不去。这酒喝不得', note:'干净，但也断了消息', eff:{ li:-4, dao:4 }, npc:{ liulao:-15, zhongs:8 }, next:'s5' },
    { txt:'去了，但把剑放在桌上', note:'先亮刀，再说话', eff:{ sword:-10, li:4, knot:4 }, npc:{ liulao:8, gucan:8, zhongs:-6 }, next:'s5' }
  ]},

s5:{ ch:'二 · 问心', t:'先生的信',
  d:'老秀才老爷子的信到了，只有一句话：\n「与亲近之人，不要说气话，不要说反话，不要不说话。」\n你把这张纸看了很久。先生从来不教你怎么做，只教你想清楚再做。',
  ch2:[
    { txt:'回信：弟子明白，会先讲道理', note:'把先生的规矩摆在前面', eff:{ li:10, dao:6 }, npc:{ shuyuan:12 }, flag:'letter', next:'s6' },
    { txt:'把信收进怀里，不与顾璨争辩', note:'忍住一时，未必忍得住一世', eff:{ qing:10, li:4 }, npc:{ gucan:4 }, next:'s6' },
    { txt:'烧了。先生不懂书简湖', note:'烧的是信，也是退路', eff:{ qing:15, knot:10, li:-6 }, npc:{ shuyuan:-22, gucan:8 }, next:'s6' }
  ]},

s6:{ ch:'二 · 问心', t:'你是不是也觉得我该死', il:1,
  d:'夜里，顾璨坐在门槛上，背对着你，忽然问：\n「哥，你是不是也觉得我该死？」\n他问得很轻，像怕惊动什么。',
  ch2:[
    { txt:'你该活着。但得认', note:'活路和认账，缺一不可', eff:{ li:12, qing:8, dao:6 }, npc:{ gucan:6 }, flag:'admit', next:'s7' },
    { txt:'我不许你死', note:'一句话，把天理挡在门外', eff:{ qing:16, knot:8 }, npc:{ gucan:16, zhongs:-8 }, next:'s7' },
    { txt:'你杀的那些人，也各有他们的娘', note:'最狠的一句真话', eff:{ li:16, qing:-8 }, npc:{ gucan:-14, zhongs:14 }, flag:'confront', next:'s7' },
    { txt:'这一份，我来替你担', note:'担一分因果，就要碎一分自己', eff:{ dan:-35, li:10, qing:10, dao:8, knot:6 },
      npc:{ gucan:20, mother:10, shuyuan:-8 }, req:{ res:{ dan:45 } }, flag:'bear', next:'s7' }
  ]},

/* ============ 三 · 舍得 ============ */
s7:{ ch:'三 · 舍得', t:'君子之道，在于舍得',
  d:'你一个人坐在湖边。齐先生当年说过：君子之道，在于舍得。\n那时候你觉得这四个字简单——舍了坏的，得着好的。如今才知道，书简湖让你舍的，和你想得的，是同一件东西。',
  ch2:[
    { txt:'若舍了公理，我便不是陈平安', note:'守住一样，就守住了所有', eff:{ li:15, dao:10 }, next:'s8' },
    { txt:'有些人，我舍不掉', note:'舍不掉，就得一直背着', eff:{ qing:15, knot:8 }, next:'s8' },
    { txt:'舍一样，才能保一样', note:'折中，也最耗心血', eff:{ li:8, qing:8, dao:4, knot:3 }, next:'s8' }
  ]},

s8:{ ch:'三 · 舍得', t:'三十七户围门',
  d:'天没亮，门外站满了人。三十七户，老的少的，没人喊打喊杀，只是站着。\n领头的老妇说：「我们不要他偿命。我们要他认。认一句，我们回去好给死的人上香。」',
  ch2:[
    { txt:'开门。一户一户，赔罪', note:'三十七次低头，一次比一次低', eff:{ li:14, hope:16, dao:6, dan:-10, qing:4 },
      npc:{ zhongs:22, gucan:-6, shuyuan:6 }, flag:'bow', next:'s9' },
    { txt:'赔钱。认错的话，不说', note:'银子可以再挣，脸面没了就真没了', eff:{ li:-4, hope:-10, knot:8 }, npc:{ zhongs:-10 }, next:'s9' },
    { txt:'闭门不出', note:'门关上了，事情还在', eff:{ hope:-16, knot:10, qing:6 }, npc:{ zhongs:-16, gucan:8 }, next:'s9' },
    { txt:'再闹，我就不客气了', note:'剑出鞘一寸，道理就少一分', eff:{ sword:-25, hope:-20, li:-8, knot:12 },
      npc:{ zhongs:-26, gucan:10, liulao:-6 }, req:{ res:{ sword:55 } }, flag:'threat', next:'s9' }
  ]},

s9:{ ch:'三 · 舍得', t:'第一个人',
  d:'你终于问出了那个一直不敢问的问题：「第一个呢？」\n顾璨愣了很久，说：「是个老油子。他要把我卖给湖底的那帮人，换三块灵石。我把他按在水里，按了很久。」\n他抬眼看你：「哥，第一个，我是为了活。」',
  ch2:[
    { txt:'第一个情有可原。第三个呢？第三十七个呢？', note:'起点无辜，不等于终点无辜', eff:{ li:14, dao:8, qing:-4 }, npc:{ gucan:-8, zhongs:6 }, next:'s10' },
    { txt:'从第一个起，你就不该自己动手', note:'把活路和规矩分清楚', eff:{ li:18, qing:-6 }, npc:{ gucan:-16, zhongs:12, shuyuan:8 }, next:'s10' },
    { txt:'我知道你怕。我也怕过。', note:'承认怕，也是一种认', eff:{ qing:14, knot:6, dao:2 }, npc:{ gucan:14, mother:6 }, next:'s10' }
  ]},

s10:{ ch:'三 · 舍得', t:'千里之外', il:1,
  d:'宁姚的信来了，只有一行字：\n「陈平安，你在那边别把自己弄丢了。」\n你把信纸折了三折，收起来。有些话说出来，就不硬气了。',
  ch2:[
    { txt:'回信：我很好，勿念', note:'报喜不报忧，是怕她提剑来', eff:{ qing:6, dao:4 }, npc:{ ningyao:6 }, next:'s11' },
    { txt:'回信：这里很难，我还在想', note:'说实话，才是真把她当自己人', eff:{ qing:10, li:6, dao:6 }, npc:{ ningyao:16 }, next:'s11' },
    { txt:'不回', note:'不回，也是一种回', eff:{ qing:-4, knot:6 }, npc:{ ningyao:-8 }, next:'s11' }
  ]},

/* ============ 四 · 了断 ============ */
s11:{ ch:'四 · 了断', t:'各方齐至',
  d:'该来的都来了。刘老成带着湖上的老辈坐在东边，三十七户站在院外，书院的使者捧着一份文书，顾璨站在你身后。\n所有人都在等你开口。',
  ch2:[
    { txt:'碎裂文胆，替他赎这一份因果', note:'以我之碎，换他一线生机', eff:{ dan:-60, li:14, qing:12, dao:14, hope:8 },
      npc:{ gucan:24, zhongs:14, shuyuan:10 }, req:{ res:{ dan:40 } }, next:'fin_dan' },
    { txt:'让他自己站出来认', note:'他得自己走那一步', eff:{ li:16, dao:8, qing:-4 },
      npc:{ gucan:-6, zhongs:12, shuyuan:12 }, req:{ npc:{ gucan:25 } }, next:'fin_surrender' },
    { txt:'带他杀出去', note:'刀能开路，开不了心', eff:{ sword:-35, knot:14, qing:14, li:-12 },
      npc:{ gucan:18, zhongs:-24, shuyuan:-18 }, req:{ res:{ sword:45 } }, next:'fin_blood' },
    { txt:'交给书院公断', note:'把这一个字，交给规矩', eff:{ li:14, dao:4, qing:-10 },
      npc:{ gucan:-14, shuyuan:16, zhongs:8 }, next:'fin_court' },
    { txt:'我留下，把书简湖的规矩重立一遍', note:'三十七年血债，三十年还', eff:{ li:12, hope:18, dao:8, dan:-10, qing:-6 },
      npc:{ zhongs:20, liulao:10, shuyuan:8, gucan:-10 }, req:{ flag:'bow' }, next:'fin_order' },
    { txt:'转身就走', note:'走得了人，走不了心', eff:{ knot:16, li:-10, qing:-8, hope:-12 },
      npc:{ gucan:-18, zhongs:-14, shuyuan:-10 }, next:'fin_leave' }
  ]},

/* ============ 终局 ============ */
fin_dan:{ ch:'四 · 了断', t:'文胆碎了', fin:1,
  d:'你一掌按在心口，文胆碎裂的声音只有你自己听见。\n血从嘴角下来，顾璨扑过来扶你，被你推开。三十七户的人不喊了，刘老成站起来了，连书院的使者都低下了头。\n这一湖的因果，从此有一份记在你身上。',
  ch2:[
    { txt:'把痛咽下去，先立规矩', note:'赎完罪，还得有人管这湖水', key:'dan_guilt',
      eff:{ li:8, hope:10, dao:8 }, npc:{ zhongs:12, shuyuan:8 } },
    { txt:'让顾璨看着你碎胆，说：记住这个', note:'最狠的一次护短', key:'dan_life',
      eff:{ qing:12, dao:6 }, npc:{ gucan:20 }, req:{ npc:{ gucan:35 } } },
    { txt:'碎胆之后，仍把他交出去', note:'情还了，理不能还', key:'dan_strict',
      eff:{ li:16, qing:-14, dao:6 }, npc:{ gucan:-16, zhongs:16, shuyuan:14 } }
  ]},

fin_surrender:{ ch:'四 · 了断', t:'他自己走了出去', fin:1,
  d:'顾璨看了你很久，然后自己推开门，走出去，跪在了三十七户面前。\n他跪下去的时候，你想起泥瓶巷那年他被人按在地上打，也是这副倔样子。',
  ch2:[
    { txt:'陪他一起跪下去', note:'他的账，你认一半', key:'sur_together',
      eff:{ li:10, qing:14, dao:8, knot:4 }, npc:{ gucan:20, zhongs:14, shuyuan:6 } },
    { txt:'让他自己跪。你在门口等', note:'这一步，他得一个人走完', key:'sur_wait',
      eff:{ li:12, dao:6, qing:-4 }, npc:{ gucan:6, zhongs:10, shuyuan:10 } },
    { txt:'嘴上让他去，暗中安排他逃', note:'道理讲完了，人心还软着', key:'sur_lie',
      eff:{ qing:14, li:-14, knot:16, hope:-8 }, npc:{ gucan:16, zhongs:-20, shuyuan:-12 } }
  ]},

fin_blood:{ ch:'四 · 了断', t:'剑已经出鞘', fin:1,
  d:'你拔剑了。第一剑下去，湖上的风就变了味。\n顾璨跟在你身后，一边杀人一边笑，笑得比哭难看。',
  ch2:[
    { txt:'一路杀出去，谁拦谁死', note:'杀干净了，也把自己杀空了', key:'blood_all',
      eff:{ knot:20, li:-18, hope:-20, qing:12 }, npc:{ gucan:20, zhongs:-28, shuyuan:-24, liulao:-14 } },
    { txt:'只杀首恶，余者不问', note:'剑要有准头，也得有分寸', key:'blood_chief',
      eff:{ li:8, knot:8, hope:4, qing:6 }, npc:{ gucan:12, zhongs:4, liulao:6 }, req:{ li:55 } },
    { txt:'杀到一半，停手', note:'停在最难停的时候', key:'blood_half',
      eff:{ knot:14, li:2, hope:-8, dao:4 }, npc:{ gucan:8, zhongs:-8, shuyuan:-4 } }
  ]},

fin_court:{ ch:'四 · 了断', t:'书院的文书', fin:1,
  d:'书院的使者展开文书，一条一条念。每一条都是顾璨做过的。\n念到第三十七条时，天已经黑了。',
  ch2:[
    { txt:'为他求情', note:'求情不是脱罪，是让人知道他也是人', key:'court_plea',
      eff:{ qing:14, li:-4, dao:4 }, npc:{ gucan:14, shuyuan:-6, zhongs:-6 } },
    { txt:'一言不发', note:'沉默最安全，也最凉', key:'court_silent',
      eff:{ li:6, qing:-8, knot:8 }, npc:{ gucan:-14, shuyuan:6 } },
    { txt:'请从严', note:'把自己那一刀也砍下去', key:'court_hard',
      eff:{ li:18, qing:-20, dao:4, knot:6 }, npc:{ gucan:-24, mother:-20, zhongs:16, shuyuan:16 } }
  ]},

fin_order:{ ch:'四 · 了断', t:'重立湖规', fin:1,
  d:'你没有杀一个人，也没有放走一个人。你把三十七户、刘老成、还有湖上所有说得上话的，都请到了一起。\n规矩是死的，人是活的。你在湖边立了一块碑，碑上第一条写着：伤人者，偿。',
  ch2:[
    { txt:'我留下三十年', note:'三十年，够不够还三十七条命', key:'order_thirty',
      eff:{ hope:22, li:12, dao:10, qing:-6, knot:4 }, npc:{ zhongs:24, liulao:14, shuyuan:12, gucan:-8 } },
    { txt:'规矩立好，交给顾璨守', note:'让他守规矩，比替他守强', key:'order_pass',
      eff:{ li:10, hope:14, dao:8, qing:8 }, npc:{ gucan:16, zhongs:12, shuyuan:8 } },
    { txt:'碑立好了，我走', note:'立法的人不必守法', key:'order_leave',
      eff:{ li:8, hope:10, dao:4, qing:-8, knot:6 }, npc:{ zhongs:10, shuyuan:6, gucan:-12 } }
  ]},

fin_leave:{ ch:'四 · 了断', t:'走到渡口', fin:1,
  d:'你转身走了。顾璨没有追，也没有喊。\n走到渡口的时候，天开始下雨。你忽然想起，小时候他走不动了，也是这样站在原地等你回头。',
  ch2:[
    { txt:'上了船，再没回头', note:'这一走，湖就成了心口的一块疤', key:'leave_true',
      eff:{ knot:20, li:-14, qing:-14, hope:-16, dao:-8 }, npc:{ gucan:-24, zhongs:-18, shuyuan:-12, mother:-16 } },
    { txt:'走了一半，回来了', note:'回头不丢人，丢人的是不敢回头', key:'leave_back',
      eff:{ qing:16, li:6, dao:6, knot:4 }, npc:{ gucan:18, mother:12, zhongs:4 } }
  ]}
};

/* 结局表（icon = 语义化字标，替代 S/A/B/C/D 首字母徽章；与 weapp/utils/shujianhu.js 同步） */
const AL_ENDINGS = {
  dan_guilt:  { g:'S', icon:'碎', t:'碎文胆 · 赎旧罪',
    d:'你碎了自己的文胆，替顾璨扛下因果，又替书简湖立起了第一条规矩。顾璨活着，三十七户也有人上香了。\n从此这湖水清了三分，你的道心也更明。',
    poem:'碎胆非为全私义，替人受过是吾乡。' },
  dan_life:   { g:'S', icon:'偿', t:'以命换命',
    d:'你让他亲眼看着你碎胆。那一眼，比三十七条人命还重。\n顾璨后来再没杀过人。他说，他一想起那天，手就抖。',
    poem:'我把心给你看，你便记住了疼。' },
  dan_strict: { g:'A', icon:'分', t:'赎而不庇',
    d:'你还了他的情，也送他上了公堂。情是情，理是理，两笔账，你都还得干干净净。\n只是顾璨看你的那一眼，从此再没有当年的信赖。',
    poem:'两笔账都清了，人却远了。' },
  sur_together:{ g:'A', icon:'跪', t:'同赴书院',
    d:'你陪他一起跪。三十七户看着你们，有人哭了，有人转身走了。\n跪完那一夜，你们谁也没说话，一起把院子扫干净了。',
    poem:'跪下去的两个人，一起站了起来。' },
  sur_wait:   { g:'B', icon:'候', t:'门外等',
    d:'他在里面跪，你在门外等。等了整整一夜。\n后来他说，那夜他最怕的不是被打，是怕回头看不见你。',
    poem:'最难的不是替他跪，是忍着不跪。' },
  sur_lie:    { g:'C', icon:'欺', t:'自 欺',
    d:'你嘴上讲的是规矩，手上做的是私情。顾璨逃了，你留在原地替他挨骂。\n你骗过了所有人，骗不过湖水。',
    poem:'道理讲给旁人听，私心留给自己。' },
  blood_all:  { g:'C', icon:'杀', t:'血洗书简湖',
    d:'你杀穿了整座湖。顾璨活下来了，三十七户的后人又死了一批。\n从此书简湖没人敢提陈平安这三个字，也没人敢提公道。',
    poem:'剑太快，道理追不上。' },
  blood_chief:{ g:'B', icon:'裁', t:'剑 裁',
    d:'你只杀了首恶，一个不多。刀口精准，人心却没能缝上。\n书简湖安静了几年，然后又闹起来——规矩不立，血白流。',
    poem:'杀了狼，没修好篱笆。' },
  blood_half: { g:'C', icon:'半', t:'半 途',
    d:'你停手了。停在最难停的时候，也停在谁都不满意的地方。\n杀的人说你狠，没杀的人说你软。',
    poem:'进退都是错，只因起手就错。' },
  court_plea: { g:'B', icon:'辩', t:'公断 · 说情',
    d:'你在堂上为他求情，说他也只是个被人逼大的孩子。\n判得轻了三分。三分，是一条命换不回来的分量。',
    poem:'求来的三分，压在心头三十年。' },
  court_silent:{ g:'B', icon:'默', t:'公断 · 默',
    d:'你一句话没说。判词念完，顾璨抬头看了你一眼，什么也没说。\n沉默最安全，也最凉。',
    poem:'不开口的人，心里话最多。' },
  court_hard: { g:'C', icon:'严', t:'公断 · 从严',
    d:'你请从严。判得公允，公允得让人发冷。\n顾璨没喊冤，顾母没再看你第二眼。你守住了理，也一个人走完了回程。',
    poem:'理字写得端正，人字写散了。' },
  order_thirty:{ g:'S', icon:'碑', t:'湖主新政',
    d:'你在书简湖留了三十年。碑上那一条「伤人者偿」，从没人敢违，到没人愿违。\n三十年后你走的时候，湖边的灯是沿岸点满的。',
    poem:'碑立三十年，湖水始见底。' },
  order_pass: { g:'A', icon:'灯', t:'传 灯',
    d:'你把规矩立好，交到顾璨手上，让他自己守。\n守规矩的人，比替他守规矩的人，走得远。',
    poem:'灯递过去，手要松开。' },
  order_leave:{ g:'A', icon:'法', t:'立法者',
    d:'碑立好了，你走了。书简湖的规矩留着，人却不在了。\n后来湖上的人只知道有块碑，不知道立碑的人姓什么。',
    poem:'立了法的人，常常不在法里。' },
  leave_true: { g:'D', icon:'背', t:'转 身',
    d:'你上了船，再没回头。顾璨在书简湖继续杀人，直到有一天被人杀死。\n你听说了，一个人在酒馆坐了一夜。',
    poem:'当年不回头的那一步，走了一辈子。' },
  leave_back: { g:'B', icon:'归', t:'回 头',
    d:'你回来了。他站在原地，像小时候等你那样。\n有些事晚了，可晚了的解决办法，总比没有强。',
    poem:'回头不丢人，丢人的是不敢回头。' },
  demon:      { g:'D', icon:'灭', t:'心死道消',
    d:'你想护的人，一个也没护住；你想守的理，自己也说不清了。\n书简湖的水灌进心里，从此你走到哪儿，湖就跟着到哪儿。',
    poem:'问心问到最后，答不上来。' },
  perfect:    { g:'S+', icon:'圆', t:'问心无愧 · 两全',
    d:'你没有偏废情与理，也没有丢下一个人。顾璨认了罪，三十七户上了香，书院改了条文，书简湖立了新碑。\n那一天湖上无风，水清得能看见底。你说：这样就好。',
    poem:'情理两不负，湖月照人心。' }
};
const AL_TOTAL = Object.keys(AL_ENDINGS).length;

/* 结局图标：具象器物/情态，单色描边、stroke-width 2、round 端点转角、无渐变光晕；currentColor 继承等级色
   （与 weapp/assets/icon/end-*.svg 一一对应，小程序端写死金色 #e8cf8f） */
const AL_END_ICO = {
  dan_guilt:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><circle cx=\"15\" cy=\"15\" r=\"9.5\" fill=\"currentColor\" fill-opacity=\".12\"/><path d=\"M15 5.5 L11.5 13 L16 15.5 L12 24.5\"/><path d=\"M9 9.5 Q12 6.5 15.5 7.4\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
  dan_life:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><path d=\"M15 6 L15 25\"/><path d=\"M5 9 L25 9\"/><path d=\"M5 9 L5 15 M25 9 L25 15\"/><path d=\"M2 15 L8 15 M22 15 L28 15\"/><path d=\"M13.3 7 L13.3 24\" stroke-opacity=\".22\" stroke-width=\".8\"/><path d=\"M4 7.6 L24 7.6\" stroke-opacity=\".22\" stroke-width=\".8\"/><path d=\"M10.5 8 Q15 6 19.5 8\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
  dan_strict:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><path d=\"M15 26 L15 14\"/><path d=\"M15 14 L7 6 M15 14 L23 6\"/><path d=\"M13.4 25 L13.4 14.5\" stroke-opacity=\".22\" stroke-width=\".8\"/><path d=\"M14.3 13 L7.8 6.7 M15.7 13 L22.2 6.7\" stroke-opacity=\".22\" stroke-width=\".8\"/><path d=\"M11 9 Q15 7 19 9\" stroke-opacity=\".38\" stroke-width=\"1\"/>",
  sur_together:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><circle cx=\"10\" cy=\"9\" r=\"3.2\" fill=\"currentColor\" fill-opacity=\".13\"/><circle cx=\"20\" cy=\"9\" r=\"3.2\" fill=\"currentColor\" fill-opacity=\".13\"/><path d=\"M10 12.5 L10 24 M20 12.5 L20 24\"/><path d=\"M8 18 L12 18 M18 18 L22 18\"/><path d=\"M7.5 7 Q10 5 12.5 6\" stroke-opacity=\".4\" stroke-width=\"1\"/><path d=\"M17.5 7 Q20 5 22.5 6\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
  sur_wait:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><path d=\"M6 26 L6 8 L24 8 L24 26 Z\" fill=\"currentColor\" fill-opacity=\".10\"/><path d=\"M6 26 L6 8 L24 8 L24 26\"/><path d=\"M15 8 L15 26\"/><circle cx=\"10.5\" cy=\"16\" r=\"2.4\" fill=\"currentColor\" fill-opacity=\".14\"/><path d=\"M8 9.5 Q12 7.5 16 8\" stroke-opacity=\".38\" stroke-width=\"1\"/>",
  sur_lie:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><path d=\"M8 11 Q15 5.5 22 11 L22 17 Q15 24.5 8 17 Z\" fill=\"currentColor\" fill-opacity=\".12\"/><path d=\"M8 11 Q15 5.5 22 11 L22 17 Q15 24.5 8 17 Z\"/><path d=\"M11 13.5 L13.5 13.5 M16.5 13.5 L19 13.5\"/><path d=\"M10 10 Q15 7 20 10\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
  blood_all:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><path d=\"M15 4 L19 10 L15 21 L11 10 Z\" fill=\"currentColor\" fill-opacity=\".14\"/><path d=\"M15 4 L19 10 L15 21 L11 10 Z\"/><path d=\"M10 21 L20 21\"/><circle cx=\"13\" cy=\"25.2\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"17\" cy=\"25.2\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M12.5 6 Q15 4.5 17 7\" stroke-opacity=\".42\" stroke-width=\"1\"/>",
  blood_chief:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><path d=\"M21 4 L15 17\"/><path d=\"M17.5 6.5 L24 8.5\"/><path d=\"M6 12 L14 12 M8 17 L15.5 17\" stroke-opacity=\".65\"/><path d=\"M20 5.5 L15.5 14\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
  blood_half:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><path d=\"M15 7 A8 8 0 0 0 15 23 Z\" fill=\"currentColor\" fill-opacity=\".14\"/><path d=\"M15 4 L15 26\"/><path d=\"M15 7 A8 8 0 0 0 15 23\"/><path d=\"M12 9 Q15 7.5 15 10\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
  court_plea:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><rect x=\"5\" y=\"6\" width=\"20\" height=\"13\" rx=\"3\" fill=\"currentColor\" fill-opacity=\".10\"/><rect x=\"5\" y=\"6\" width=\"20\" height=\"13\" rx=\"3\"/><path d=\"M11 19 L10 25 L16 19\"/><path d=\"M10 10.5 L20 10.5 M10 14.5 L16 14.5\"/><path d=\"M7 8 Q12 6.5 17 7.5\" stroke-opacity=\".38\" stroke-width=\"1\"/>",
  court_silent:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><rect x=\"5\" y=\"6\" width=\"20\" height=\"13\" rx=\"3\" fill=\"currentColor\" fill-opacity=\".10\"/><rect x=\"5\" y=\"6\" width=\"20\" height=\"13\" rx=\"3\"/><path d=\"M11 19 L10 25 L16 19\"/><path d=\"M8 20.5 L22 5.5\"/><path d=\"M7 8 Q12 6.5 17 7.5\" stroke-opacity=\".38\" stroke-width=\"1\"/>",
  court_hard:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><rect x=\"4\" y=\"11\" width=\"22\" height=\"7\" rx=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\"/><rect x=\"4\" y=\"11\" width=\"22\" height=\"7\" rx=\"1.5\"/><path d=\"M9 11 L9 18 M14 11 L14 18 M19 11 L19 18\"/><path d=\"M6 12.5 Q13 11 22 12.5\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
  order_thirty:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><path d=\"M9 26 L9 11 Q15 6 21 11 L21 26 Z\" fill=\"currentColor\" fill-opacity=\".10\"/><path d=\"M9 26 L9 11 Q15 6 21 11 L21 26\"/><path d=\"M5.5 26 L24.5 26\"/><path d=\"M12.5 15 L17.5 15 M12.5 19 L17.5 19\"/><path d=\"M11 10 Q15 7 19 10\" stroke-opacity=\".38\" stroke-width=\"1\"/>",
  order_pass:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><ellipse cx=\"15\" cy=\"15\" rx=\"7\" ry=\"8\" fill=\"currentColor\" fill-opacity=\".10\"/><path d=\"M15 4 L15 7\"/><path d=\"M11 7 L19 7 M11 23 L19 23\"/><ellipse cx=\"15\" cy=\"15\" rx=\"7\" ry=\"8\"/><path d=\"M15 11.5 Q17.5 15 15 18.5 Q12.5 15 15 11.5\" fill=\"currentColor\" fill-opacity=\".30\" stroke-width=\"1.6\"/><path d=\"M10 11 Q15 8 20 11\" stroke-opacity=\".38\" stroke-width=\"1\"/>",
  order_leave:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><path d=\"M15 5 L9.5 22 M15 5 L20.5 22\"/><path d=\"M11 14 L19 14\"/><path d=\"M5 22 L5 26 L13 26\"/><path d=\"M13.6 6 L8.4 21.5\" stroke-opacity=\".22\" stroke-width=\".8\"/><path d=\"M16.4 6 L21.6 21.5\" stroke-opacity=\".22\" stroke-width=\".8\"/><path d=\"M11 8 Q15 6 19 8\" stroke-opacity=\".38\" stroke-width=\"1\"/>",
  leave_true:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><circle cx=\"11\" cy=\"9\" r=\"3\" fill=\"currentColor\" fill-opacity=\".13\"/><circle cx=\"11\" cy=\"9\" r=\"3\"/><path d=\"M11 12 L11 21\"/><path d=\"M11 15 L7 19 M11 15 L15 19\"/><path d=\"M20 12 L26 12\"/><path d=\"M26 12 L23 9 M26 12 L23 15\"/><path d=\"M8.5 7 Q11 5 13.5 6\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
  leave_back:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><circle cx=\"19\" cy=\"9\" r=\"3\" fill=\"currentColor\" fill-opacity=\".13\"/><circle cx=\"19\" cy=\"9\" r=\"3\"/><path d=\"M19 12 L19 21\"/><path d=\"M19 15 L15 19 M19 15 L23 19\"/><path d=\"M9 12 L4 12\"/><path d=\"M4 12 L7 9 M4 12 L7 15\"/><path d=\"M16.5 7 Q19 5 21.5 6\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
  demon:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><path d=\"M15 25 Q6.5 18 6.5 12.5 A4.7 4.7 0 0 1 15 10 A4.7 4.7 0 0 1 23.5 12.5 Q23.5 18 15 25 Z\" fill=\"currentColor\" fill-opacity=\".12\"/><path d=\"M15 25 Q6.5 18 6.5 12.5 A4.7 4.7 0 0 1 15 10 A4.7 4.7 0 0 1 23.5 12.5 Q23.5 18 15 25 Z\"/><path d=\"M15 10.5 L12 15 L16 17 L13 22\"/><path d=\"M9.5 12 Q12 9.5 15 10.5\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
  perfect:  "<ellipse cx=\"15\" cy=\"27\" rx=\"9\" ry=\"1.5\" fill=\"currentColor\" fill-opacity=\".12\" stroke=\"none\"/><circle cx=\"15\" cy=\"15\" r=\"10\" fill=\"currentColor\" fill-opacity=\".10\"/><circle cx=\"15\" cy=\"15\" r=\"10\"/><circle cx=\"15\" cy=\"15\" r=\"4.5\"/><circle cx=\"15\" cy=\"15\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M8.5 10.5 Q12 7 16 8\" stroke-opacity=\".4\" stroke-width=\"1\"/>",
};

function alEndIcon(k){
  return '<svg class="al-eico" viewBox="0 0 30 30" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(AL_END_ICO[k]||'')+'</svg>';
}

/* ---------- 存档：结局图鉴 ---------- */
function alSeen(){
  try{ return JSON.parse(localStorage.getItem('jianlai_asklake')||'{}') || {}; }catch(e){ return {}; }
}
function alUnlock(key){
  try{
    const s = alSeen();
    const isNew = !s[key];
    s[key] = (s[key]||0) + 1;
    localStorage.setItem('jianlai_asklake', JSON.stringify(s));
    // 行迹录：叙事结局计入道行与见闻
    try{
      if(typeof prRecordEnding==='function'){
        const e = (typeof AL_ENDINGS!=='undefined') ? AL_ENDINGS[key] : null;
        prRecordEnding('asklake', key, (e && e.t) || key, isNew);
      }
    }catch(e2){}
  }catch(e){}
}

/* ---------- 逻辑 ---------- */
function alClamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

function alReqState(a, r){
  if(!r) return { ok:true, why:'' };
  const p = [];
  if(r.li   !== undefined && a.v.li   < r.li)   p.push('理 '+a.v.li+'／'+r.li);
  if(r.qing !== undefined && a.v.qing < r.qing) p.push('情 '+a.v.qing+'／'+r.qing);
  if(r.dao  !== undefined && a.v.dao  < r.dao)  p.push('道心 '+a.v.dao+'／'+r.dao);
  if(r.npc) for(const k in r.npc){
    if((a.npc[k]||0) < r.npc[k]) p.push(AL_NPCN[k]+'的心意 '+(a.npc[k]||0)+'／'+r.npc[k]);
  }
  if(r.res){
    if(r.res.dan   !== undefined && a.res.dan   < r.res.dan)   p.push('文胆 '+a.res.dan+'／'+r.res.dan);
    if(r.res.sword !== undefined && a.res.sword < r.res.sword) p.push('剑 '+a.res.sword+'／'+r.res.sword);
  }
  if(r.flag && !a.flags[r.flag]) p.push('缺「'+alFlagName(r.flag)+'」');
  return { ok: p.length===0, why: p.join('　') };
}
function alFlagName(f){
  return ({ cloth:'三十七件血衣', letter:'回信先生', bear:'担下因果', bow:'当众赔罪',
            threat:'以剑压人', admit:'要他认账', confront:'直言其非' })[f] || f;
}

function alApply(a, eff, npcEff){
  if(eff) for(const k in eff){
    if(k==='dan' || k==='sword') a.res[k] = alClamp(a.res[k] + eff[k], 0, 100);
    else if(a.v[k] !== undefined) a.v[k] = alClamp(a.v[k] + eff[k], 0, 100);
  }
  if(npcEff) for(const k in npcEff){
    a.npc[k] = alClamp((a.npc[k]||0) + npcEff[k], -100, 100);
  }
}
/* 【不剧透纪律】此处原有一支 alEffText()，把「情+8 / 顾璨+8」这类数值后果
   算成标签贴在选项上。已随 2026-08-31 的交互纠偏一并删除（与小程序端
   utils/shujianhu.js 对齐）：玩家只需要选择，后果在提交后由叙事推进 +
   心境面板数值变化 + 纪事（trail）揭示。若将来要在别处展示效果，请重新评估
   是否属于「事前剧透」，不要直接塞回选项按钮。 */

function newAskLakeState(){
  return {
    stage:'origin', node:null, origin:null,
    v:{ qing:30, li:30, dao:20, knot:0, hope:40 },
    res:{ dan:100, sword:60 },
    npc:{ gucan:0, mother:10, liulao:0, zhongs:0, shuyuan:0, ningyao:0 },
    flags:{}, trail:[], ilUsed:{}, il:null, ended:false, ending:null, step:0
  };
}

function asklakePickOrigin(k){
  const a = state.asklake;
  const o = AL_ORIGINS.filter(x=>x.k===k)[0];
  if(!o) return;
  a.origin = k;
  alApply(a, o.eff, o.npc);
  a.node = 's1';
  a.stage = 'play';
  a.trail.push({ kind:'origin', t:'来路', c:o.t, note:o.tip });
  SFX.turn();
  render();
}

function asklakeChoose(i){
  const a = state.asklake;
  if(!a || a.stage!=='play' || a.ended) return;
  const nd = AL_NODES[a.node];
  const ch = nd.ch2[i];
  if(!ch) return;
  const rs = alReqState(a, ch.req);
  if(!rs.ok) return;

  alApply(a, ch.eff, ch.npc);
  if(ch.flag) a.flags[ch.flag] = 1;
  a.trail.push({ kind:'node', t:nd.t, c:ch.txt, note:ch.note });

  if(nd.fin){
    asklakeFinish(ch.key);
    SFX.shatter();
    return;
  }
  // 插曲
  if(nd.il){
    const pool = AL_INTERLUDES.filter((_,idx)=>!a.ilUsed[idx]);
    if(pool.length){
      const pick = pool[Math.floor(Math.random()*pool.length)];
      a.ilUsed[AL_INTERLUDES.indexOf(pick)] = 1;
      alApply(a, pick.eff, pick.npc);
      a.il = pick;
      a.stage = 'il';
      a.nextNode = ch.next;
      a.trail.push({ kind:'il', t:pick.t, c:'湖上插曲', note:'不由你定' });
      SFX.scroll();
      render();
      return;
    }
  }
  a.node = ch.next;
  a.step++;
  SFX.click();
  render();
}

function asklakeIlNext(){
  const a = state.asklake;
  if(!a || a.stage!=='il') return;
  a.node = a.nextNode; a.nextNode = null; a.il = null;
  a.stage = 'play'; a.step++;
  SFX.click();
  render();
}

function asklakeFinish(key){
  const a = state.asklake;
  const v = a.v;
  // 覆盖判定
  if(v.knot >= 70) key = 'demon';
  else if(v.dao>=75 && v.li>=60 && v.qing>=50 && v.hope>=62
        && Math.abs(v.qing-v.li)<=12 && v.knot<=20
        && (a.npc.gucan||0)>=20 && (a.npc.zhongs||0)>=20) key = 'perfect';

  const e = AL_ENDINGS[key] || AL_ENDINGS.leave_true;
  a.ended = true; a.stage = 'end';
  a.ending = { key, ...e };
  alUnlock(key);
  const g = a.ending.g;
  if(g==='S+' || g==='S') SFX.win();
  else if(g==='D') SFX.lose();
  else SFX.breakout();
  render();
}

function asklakeRestart(){
  state.asklake = newAskLakeState();
  SFX.click();
  render();
}
function asklakeOpenCodex(){
  state.asklake.stage = 'codex';
  SFX.click();
  render();
}
function asklakeBackToPlay(){
  if(state.asklake.ended) state.asklake.stage = 'end';
  else if(state.asklake.node) state.asklake.stage = state.asklake.il ? 'il' : 'play';
  else state.asklake.stage = 'origin';
  SFX.click();
  render();
}

/* 湖景独白 */
function alLakeLine(a){
  const v = a.v;
  if(v.knot>=60) return '湖水发暗，浮着一层散不开的腥气。';
  if(v.hope>=65) return '沿岸的灯一盏盏亮起来，都是新点的。';
  if(v.dao>=60 && v.li>=55) return '月光铺在湖面上，像一层被人轻轻抚平的纸。';
  if(v.qing>=62) return '风从湖心过来，带着一点泥瓶巷的烟火气。';
  if(v.li<=22) return '湖面无风，映不出人影。';
  if(v.knot>=35) return '水下有东西在动，看不清是什么。';
  return '书简湖的水，从来都不太干净。';
}
function alMoodLine(a){
  const v = a.v;
  if(v.knot>=55) return '心口发闷，像压着一块石头。';
  if(v.dao>=60) return '心里有一盏灯，风大也不灭。';
  if(v.qing - v.li >= 25) return '你听见自己的心在替顾璨说话。';
  if(v.li - v.qing >= 25) return '你听见自己的心在替死者说话。';
  return '两个声音在心里吵架，谁也没赢。';
}

/* ---------- 渲染 ---------- */
function alMeter(label, val, col, dim){
  return '<div class="al-meter">'
    + '<div class="al-label"><span>'+label+'</span><b>'+val+'</b></div>'
    + '<div class="al-bar"><div class="al-fill'+(dim?' dim':'')+'" style="width:'+val+'%;background:'+col+'"></div></div>'
    + '</div>';
}
function alNpcRow(k, val){
  const meta = AL_NPC.filter(x=>x.k===k)[0];
  const pct = Math.round((val+100)/2);
  const col = val>=0 ? '#c9a227' : '#8d5b52';
  return '<div class="al-npc" title="'+meta.d+'">'
    + '<span class="al-npc-n">'+meta.n+'</span>'
    + '<span class="al-npc-bar"><i class="al-npc-mid"></i>'
    + '<i class="al-npc-fill" style="'+(val>=0?('left:50%;width:'+(pct-50)+'%;'):('right:50%;width:'+(50-pct)+'%;'))+'background:'+col+'"></i></span>'
    + '<b class="al-npc-v">'+val+'</b></div>';
}

function renderAskLake(app){
  const a = state.asklake;
  if(!a) { openAskLake(); return; }
  let html = '<div class="asklake">';
  html += '<h1>书简湖 · 问心局</h1>';
  html += '<p class="hint">不拼剑气，只问本心 · 五维心境、六方态度、'+AL_TOTAL+' 种结局</p>';

  if(a.stage==='origin')       html += renderAskLakeOrigin(a);
  else if(a.stage==='codex')   html += renderAskLakeCodex(a);
  else if(a.stage==='il')      html += renderAskLakeIl(a);
  else if(a.stage==='end')     html += renderAskLakeEnd(a);
  else                         html += renderAskLakeNode(a);

  html += '</div>';
  app.innerHTML = html;
}

/* 来路选择 */
function renderAskLakeOrigin(a){
  let h = '<div class="al-origin">';
  h += '<div class="al-ori-lead">你来书简湖之前，先要决定：<b>你带着什么来。</b><br>'
     + '<span>来路不同，起手的心境、文胆与剑都不同，各路人对你的态度也就不一样。</span></div>';
  h += '<div class="al-ori-grid">';
  AL_ORIGINS.forEach(o=>{
    h += '<div class="al-ori-card" onclick="asklakePickOrigin(\''+o.k+'\')">'
      + '<div class="al-ori-mark">'+o.mark+'</div>'
      + '<h3>'+o.t+'</h3>'
      + '<p class="al-ori-d">'+o.d+'</p>'
      + '<div class="al-ori-tip">'+o.tip+'</div>'
      + '</div>';
  });
  h += '</div>';
  const seen = alSeen();
  const n = Object.keys(seen).length;
  h += '<div class="al-ori-foot">'
     + '<button class="btn ghost" onclick="asklakeOpenCodex()">结局图鉴 '+n+'／'+AL_TOTAL+'</button>'
     + '<button class="btn ghost" onclick="state={phase:\'title\',sel:[],log:[]};render()">回到卷首</button>'
     + '</div>';
  return h + '</div>';
}

/* 插曲 */
function renderAskLakeIl(a){
  const il = a.il;
  let h = '<div class="al-il">';
  if(il && il.img) h += '<img class="al-il-img" src="'+il.img+'" onerror="this.style.display=\'none\'">';
  h += '<div class="al-il-tag">湖 上 插 曲</div>';
  h += '<h3>'+il.t+'</h3>';
  h += '<p>'+il.d+'</p>';
  h += '<button class="btn primary" onclick="asklakeIlNext()">继 续</button>';
  h += '</div>';
  return h;
}

/* 主节点 */
function renderAskLakeNode(a){
  const nd = AL_NODES[a.node];
  const total = 12;
  const prog = Math.min(100, Math.round((a.step/total)*100));
  const v = a.v;

  let h = '<div class="al-main">';
  h += '<div class="al-progress"><div class="al-progress-fill" style="width:'+prog+'%"></div></div>';

  h += '<div class="al-card">'
    + '<div class="al-ch">'+nd.ch+'　·　第 '+(a.step+1)+' 问</div>'
    + '<h3 class="al-q">'+nd.t+'</h3>'
    + '<div class="al-d">'+nd.d.replace(/\n/g,'<br>')+'</div>'
    + '<div class="al-lake">'+alLakeLine(a)+'</div>'
    + '<div class="al-mood">'+alMoodLine(a)+'</div>'
    + '<div class="al-choices">';

  /* 选项只呈现「你要说什么／做什么」本身。
     数值后果（情+8 之类）与旁白解读一律不事前剧透，选完之后由叙事推进 +
     心境面板数值变化 + 纪事（trail）揭示。条件不满足时的锁定原因属约束提示，保留。 */
  nd.ch2.forEach((ch,i)=>{
    const rs = alReqState(a, ch.req);
    h += '<button class="al-choice'+(rs.ok?'':' locked')+'" '+(rs.ok?('onclick="asklakeChoose('+i+')"'):'disabled')+'>'
      + '<span class="al-ct">'+ch.txt+'</span>'
      + (rs.ok?'':'<span class="al-tags"><i class="al-tag req">'+rs.why+'</i></span>')
      + '</button>';
  });
  h += '</div></div>';   // /al-card
  h += '</div>';         // /al-main

  h += renderAskLakeSide(a);
  return h;
}

/* 侧栏 */
function renderAskLakeSide(a){
  const v = a.v, seen = alSeen();
  let h = '<div class="al-side">';
  h += '<div class="al-side-t">心 境</div>';
  h += alMeter('情', v.qing, 'linear-gradient(90deg,#a33a2c,#d6533f)');
  h += alMeter('理', v.li,   'linear-gradient(90deg,#1f5f8b,#2980b9)');
  h += alMeter('道心', v.dao,'linear-gradient(90deg,#8a6d1f,#e8c66a)');
  h += alMeter('众望', v.hope,'linear-gradient(90deg,#3f6b52,#6fae86)');
  h += alMeter('心结', v.knot,'linear-gradient(90deg,#3a2b3d,#7a4a6b)', true);

  h += '<div class="al-side-t">所 持</div>';
  h += '<div class="al-res">'
    + '<div class="al-res-i"><span>文胆</span><div class="al-bar sm"><div class="al-fill" style="width:'+a.res.dan+'%;background:linear-gradient(90deg,#6b5a2a,#e8c66a)"></div></div><b>'+a.res.dan+'</b></div>'
    + '<div class="al-res-i"><span>剑</span><div class="al-bar sm"><div class="al-fill" style="width:'+a.res.sword+'%;background:linear-gradient(90deg,#4a5560,#aab7c4)"></div></div><b>'+a.res.sword+'</b></div>'
    + '</div>';

  h += '<div class="al-side-t">六 方 态 度</div>';
  h += '<div class="al-npcs">';
  AL_NPC.forEach(x=>{ h += alNpcRow(x.k, a.npc[x.k]||0); });
  h += '</div>';

  if(a.flags && Object.keys(a.flags).length){
    h += '<div class="al-side-t">心 上 事</div><div class="al-flags">';
    for(const f in a.flags) h += '<span class="al-flag">'+alFlagName(f)+'</span>';
    h += '</div>';
  }

  if(a.trail.length){
    h += '<div class="al-side-t">已 行 之 择</div><div class="al-history">';
    a.trail.slice(-3).forEach(t=>{
      h += '<div class="al-hitem'+(t.kind!=='node'?' il':'')+'"><b>'+t.t+'</b><span>'+t.c+'</span><i>'+t.note+'</i></div>';
    });
    h += '</div>';
  }

  h += '<div class="al-side-foot">'
    + '<button class="btn ghost sm" onclick="asklakeOpenCodex()">图鉴 '+Object.keys(seen).length+'／'+AL_TOTAL+'</button>'
    + '<button class="btn ghost sm" onclick="asklakeRestart()">重开</button>'
    + '<button class="btn ghost sm" onclick="state={phase:\'title\',sel:[],log:[]};render()">卷首</button>'
    + '</div>';
  return h + '</div>';
}

/* 结局 */
function renderAskLakeEnd(a){
  const e = a.ending, v = a.v;
  const seen = alSeen();
  let h = '<div class="al-ending">';
  h += '<div class="al-grade lg g'+(e.g==='S+'?'sp':e.g)+'">'+alEndIcon(e.key)+'</div>';
  h += '<div class="al-end-title">'+e.t+'</div>';
  h += '<div class="al-end-desc">'+e.d.replace(/\n/g,'<br>')+'</div>';
  h += '<div class="al-poem">'+e.poem+'</div>';

  h += '<div class="al-end-grid">'
    + '<div class="al-end-col"><div class="al-side-t">终 局 心 境</div>'
    + alMeter('情', v.qing, 'linear-gradient(90deg,#a33a2c,#d6533f)')
    + alMeter('理', v.li,   'linear-gradient(90deg,#1f5f8b,#2980b9)')
    + alMeter('道心', v.dao,'linear-gradient(90deg,#8a6d1f,#e8c66a)')
    + alMeter('众望', v.hope,'linear-gradient(90deg,#3f6b52,#6fae86)')
    + alMeter('心结', v.knot,'linear-gradient(90deg,#3a2b3d,#7a4a6b)', true)
    + '</div>'
    + '<div class="al-end-col"><div class="al-side-t">六 方 终 态</div><div class="al-npcs">'
    + AL_NPC.map(x=>alNpcRow(x.k, a.npc[x.k]||0)).join('')
    + '</div></div>'
    + '</div>';

  h += '<details class="al-trail"><summary>回 看 这 一 路（'+a.trail.length+' 步）</summary><div class="al-trail-in">';
  a.trail.forEach((t,i)=>{
    h += '<div class="al-titem'+(t.kind!=='node'?' il':'')+'"><i>'+(i+1)+'</i>'
      + '<b>'+t.t+'</b><span>'+t.c+'</span><em>'+t.note+'</em></div>';
  });
  h += '</div></details>';

  const o = AL_ORIGINS.filter(x=>x.k===a.origin)[0];
  h += '<div class="al-end-origin">来路 · '+(o?o.t:'—')+'</div>';

  h += '<div class="al-btns">'
    + '<button class="btn primary" onclick="asklakeRestart()">再 问 一 局</button>'
    + '<button class="btn ghost" onclick="asklakeOpenCodex()">结局图鉴 '+Object.keys(seen).length+'／'+AL_TOTAL+'</button>'
    + '<button class="btn ghost" onclick="state={phase:\'title\',sel:[],log:[]};render()">回到卷首</button>'
    + '</div>';
  return h + '</div>';
}

/* 结局图鉴 —— 分两区：已解锁（完整卡片）/ 未解锁（缩略占位）。
   已解锁按等级 S+ → D 排序（同等级按得多次数倒序）；未解锁仅保留「未至」印玺占位。 */
function renderAskLakeCodex(a){
  const seen = alSeen();
  const gotKeys = Object.keys(seen);
  const gotCount = gotKeys.length;
  const totalCount = AL_TOTAL;
  const lostCount = totalCount - gotCount;

  let h = '<div class="al-codex">';
  h += '<div class="al-cx-head">'
     + '<div class="al-cx-n">'+gotCount+'<span>／'+totalCount+'</span></div>'
     + '<div class="al-cx-t">结 局 图 鉴<div class="al-cx-s">已解锁 '+gotCount+' 种，尚有 '+lostCount+' 种未至</div></div>'
     + '</div>';

  // === 区块 1：已解锁 ===
  h += '<div class="al-cx-sec">'
     +   '<div class="al-cx-stitle">已 解 锁<span class="al-cx-stc">'+gotCount+' / '+totalCount+'</span></div>';
  if(gotCount === 0){
    h += '<div class="al-cx-empty">还没走过任何结局。<br>挑一个来路，开始第一次。</div>';
  } else {
    h += '<div class="al-cx-grid">';
    const rank = { 'S+':5, 'S':4, 'A':3, 'B':2, 'C':1, 'D':0 };
    const ordered = gotKeys.slice().sort((a,b)=>{
      const ra = rank[AL_ENDINGS[a].g] || 0;
      const rb = rank[AL_ENDINGS[b].g] || 0;
      if(rb !== ra) return rb - ra;
      return (seen[b]||0) - (seen[a]||0);
    });
    ordered.forEach(k=>{
      const e = AL_ENDINGS[k];
      const got = seen[k];
      h += '<div class="al-cx-card got">'
        + '<div class="al-cx-wm g'+(e.g==='S+'?'sp':e.g)+'" aria-hidden="true">'+alEndIcon(k)+'</div>'
        + '<div class="al-cx-tt">'+e.t+'</div>'
        + '<div class="al-cx-dd">'+e.d.replace(/\n/g,'<br>')+'</div>'
        + '<div class="al-cx-pm">「'+e.poem+'」</div>'
        + '<div class="al-cx-ct">已得 '+got+' 次</div>'
        + '</div>';
    });
    h += '</div>';
  }
  h += '</div>';

  // === 区块 2：未解锁（缩略占位）===
  if(lostCount > 0){
    h += '<div class="al-cx-sec">'
       +   '<div class="al-cx-stitle">未 至<span class="al-cx-stc">'+lostCount+' / '+totalCount+'</span></div>'
       +   '<div class="al-cx-grid lost">';
    Object.keys(AL_ENDINGS).forEach(k=>{
      if(seen[k]) return;
      /* 未至占位：单层印玺轮廓 +「未至」篆意字标，不剧透等级与名称 */
      h += '<div class="al-cx-card lost">'
        + '<div class="al-grade sm lock" title="未至"><svg class="cx-lock" viewBox="0 0 40 40" aria-hidden="true">'
        +   '<rect x="7" y="7" width="26" height="26" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>'
        +   '<rect x="11" y="11" width="18" height="18" rx="1" fill="none" stroke="currentColor" stroke-width="1" opacity=".55"/>'
        +   '<text x="20" y="25" text-anchor="middle" font-size="8.5" fill="currentColor" font-family="serif" font-weight="bold" letter-spacing="0.5">未至</text>'
        + '</svg></div>'
        + '</div>';
    });
    h += '</div>'
       + '<div class="al-cx-hint">未见的结局，等下次来时再揭晓。</div>';
  }
  h += '</div>';

  h += '<div class="al-btns"><button class="btn primary" onclick="asklakeBackToPlay()">返 回</button></div>';
  return h + '</div>';
}

/* ---------- 书简湖问心局 · END ---------- */


/* ---------- 选人 ---------- */
function setFilter(f){ state.filter=f; render(); }
function setQuery(v){ state.q=v; render(); }

function renderSetup(app){
  const sa = loadSectAllies();
  const meta = MODE_META[state.mode] || MODE_META.hot;
  const minPick = meta.minPick, maxPick = meta.maxPick;
  const TIP = {
    ai:    '选 1 名自己的角色，天意为你撮合对手。',
    hot:   '选择 2–5 名角色同席对战，轮流传机。',
    siege: '选择 1–2 名守城之人。蛮荒天下将分五波叩关，每波退敌可回气补牌。',
    boss:  '选择 2–3 名讨伐之人，联手围攻一名巨寇。第 4 轮起巨寇威压渐盛。',
  };
  let html = '<h1>剑来 · 择主</h1>';
  html += '<p class="hint">【'+meta.title+'】'+(TIP[state.mode]||'')+'　点击卡面选中/移除。</p>';

  html += '<div class="filterbar">';
  const facs = ['全部'].concat(Object.keys(FACTIONS));
  facs.forEach(f=>{
    const n = f==='全部' ? Object.keys(CHARS).length : Object.keys(CHARS).filter(k=>CHARS[k].faction===f).length;
    html += '<button class="fbtn'+(state.filter===f?' on':'')+'" onclick="setFilter(\''+f+'\')">'+f+' '+n+'</button>';
  });
  html += '<input class="fsearch" placeholder="搜人物" value="'+(state.q||'')+'" oninput="setQuery(this.value)">';
  html += '</div>';

  html += '<div class="grid">';
  const q = (state.q||'').trim();
  let shown = 0;
  for(const k in CHARS){
    const c = CHARS[k];
    if(state.filter!=='全部' && c.faction!==state.filter) continue;
    if(q && c.name.indexOf(q)<0 && k.indexOf(q)<0) continue;
    shown++;
    const sel = state.sel.includes(k) ? ' sel' : '';
    const col = FACTIONS[c.faction]||'#999';
    const parsed = parseSkills(c.txt);
    const skillsHtml = parsed.map(s=>'<div class="skillrow"><span class="skname">'+s.name+'</span><span class="skdesc">'+s.desc+'</span></div>').join('');
    html += '<div class="char'+sel+'" style="border-color:'+col+';--col:'+col+'" onclick="toggleSelect(\''+k+'\')">'
      + '<div class="imgwrap" style="background:'+col+'">'
      + '<div class="ph-initial">'+c.name.charAt(0)+'</div>'
      + '<img class="charimg" src="art/'+k+'.png" onerror="this.style.display=\'none\'">'
      + '<div class="name-over">'+c.name+'</div>'
      + '<span class="badge badge-hp">气血 '+c.hp+'</span>'
      + '<span class="badge badge-realm">'+(typeof realmIconForChar==='function'?realmIconForChar(c.realm):'')+realmTag(c)+'</span>'
      + (sa && sa[c.name] ? '<span class="badge" style="background:rgba(232,198,106,.22);color:#e8cf8f;border:1px solid rgba(232,198,106,.5)">落魄山·'+sa[c.name].realmName+'</span>' : '')
      + '<div class="fac-over" style="color:'+col+'">'+c.faction+'</div>'
      + '<div class="selmark">✓</div>'
      + '</div>'
      + '<div class="charinfo">'
      + '<div class="skills">'+skillsHtml+'</div>'
      + '<button class="sk-more" onclick="event.stopPropagation();showCharBrief(\''+k+'\')">人物简报 ▸</button>'
      + '</div></div>';
  }
  html += '</div>';
  if(!shown) html += '<p class="hint" style="margin-top:26px">此间无人。</p>';

  // 已选阵容
  html += '<div class="roster"><span class="rtitle">已 选</span>';
  for(let i=0;i<maxPick;i++){
    const k = state.sel[i];
    if(k) html += '<div class="rslot" onclick="toggleSelect(\''+k+'\')" title="点击移除"><img src="art/'+k+'.png" onerror="this.style.display=\'none\'"><span class="rname">'+CHARS[k].name+'</span><span class="rx">×</span></div>';
    else html += '<div class="rslot empty">＋</div>';
  }
  html += '<span class="spacer"></span>';
  html += '<button class="btn ghost" onclick="randomPick()">随机择主</button>';
  if(state.mode==='ai'){
    html += '<span class="ai-count">对手 <select onchange="state.aiCount=+this.value">'
         +  [1,2,3].map(n=>'<option value="'+n+'"'+(state.aiCount===n?' selected':'')+'>'+n+'</option>').join('')
         +  '</select> 名</span>';
  }
  html += '<button class="btn ghost" onclick="state={phase:\'title\',sel:[],log:[]};render()">返回</button>';
  html += '<button class="btn primary" '+(state.sel.length>=minPick?'':'disabled')+' onclick="doStart()">'
       +  (state.mode==='siege'?'登城迎敌':(state.mode==='boss'?'起兵讨伐':'开始对战'))+'</button>';
  html += '</div>';

  app.innerHTML = html;
}

function toggleSelect(k){
  if(!state) return;
  if(!state.sel) state.sel = [];
  const meta = MODE_META[state.mode] || MODE_META.hot;
  SFX.click();
  const i = state.sel.indexOf(k);
  const adding = i<0;
  if(i>=0) state.sel.splice(i,1);
  else if(state.sel.length < meta.maxPick) state.sel.push(k);
  render();
  // 仅给「本次操作」的卡牌一个入场反馈，已选中的其他卡不再重播动画
  const el = document.querySelector('.char[onclick*="toggleSelect(\''+k+'\')"]');
  if(el){
    const cls = adding ? 'justSel' : 'justDesel';
    el.classList.add(cls);
    el.addEventListener('animationend', ()=>el.classList.remove(cls), {once:true});
  }
}

/* 随机择主：卡牌飞转后落定。选满到 maxPick 后直接开战（doStart）。
   实现：每次 spin → flip 减速动画定位一个目标，落到目标卡上 → toggleSelect 入选；
   重复直到 sel.length === maxPick，再调 doStart 进战局。 */
function randomPick(){
  if(!state || state.phase!=='setup') return;
  const meta = MODE_META[state.mode] || MODE_META.hot;
  if(state.sel.length >= meta.maxPick){ log('已选满，无法随机。','sys'); return; }

  // 先 render 一次确保 .char 节点存在
  render();

  function pickOne(){
    if(!state || state.phase!=='setup') return;
    if(state.sel.length >= meta.maxPick){
      // 选满：自动开战（动画稳定一下再进局，避免突兀）
      setTimeout(()=>doStart(), 420);
      return;
    }
    const q = (state.q||'').trim();
    const pool = Object.keys(CHARS).filter(k=>{
      const c = CHARS[k];
      if(state.filter!=='全部' && c.faction!==state.filter) return false;
      if(q && c.name.indexOf(q)<0 && k.indexOf(q)<0) return false;
      if(state.sel.includes(k)) return false;
      return true;
    });
    if(!pool.length){ log('当前筛选下已无可选之人。','sys'); return; }

    // 重新查 DOM：上一次 toggleSelect 会 render()，旧节点已替换
    const cards = Array.from(document.querySelectorAll('.char'));
    const visibles = cards.filter(el=>{
      const key = el.getAttribute('onclick')?.match(/toggleSelect\('([^']+)'\)/)?.[1];
      return key && pool.includes(key);
    });
    if(!visibles.length) return;

    let step = 0;
    const totalSteps = 14 + Math.floor(Math.random()*6);
    let speed = 60;
    let current = 0;
    const target = pool[Math.floor(Math.random()*pool.length)];
    const targetEl = visibles.find(el=>{
      const key = el.getAttribute('onclick')?.match(/toggleSelect\('([^']+)'\)/)?.[1];
      return key === target;
    });
    if(!targetEl) return;

    SFX.draw();
    function tick(){
      // 每次重新查 DOM，避免旧节点被 render 替换后引用失效
      const live = Array.from(document.querySelectorAll('.char'));
      live.forEach(el=>{ el.classList.remove('spin','flip','landed'); });
      const el = live[current % live.length];
      if(el) el.classList.add(step % 2 === 0 ? 'spin' : 'flip');
      current++;
      step++;
      if(step >= totalSteps){
        setTimeout(()=>{
          const live2 = Array.from(document.querySelectorAll('.char'));
          live2.forEach(e=>e.classList.remove('spin','flip'));
          const tEl = live2.find(el=>{
            const key = el.getAttribute('onclick')?.match(/toggleSelect\('([^']+)'\)/)?.[1];
            return key === target;
          });
          if(tEl) tEl.classList.add('landed');
          setTimeout(()=>{
            const tEl2 = Array.from(document.querySelectorAll('.char')).find(el=>{
              const key = el.getAttribute('onclick')?.match(/toggleSelect\('([^']+)'\)/)?.[1];
              return key === target;
            });
            if(tEl2) tEl2.classList.remove('landed');
            toggleSelect(target);
            // 等目标卡入场动画结束后选下一个
            setTimeout(pickOne, 380);
          }, 500);
        }, speed);
        return;
      }
      speed = Math.min(280, speed * 1.14);
      setTimeout(tick, speed);
    }
    tick();
  }
  pickOne();
}

function pickOpponents(myKey, n){
  const me = CHARS[myKey];
  const pool = Object.keys(CHARS).filter(k=>k!==myKey);
  const hostile = pool.filter(k=>CHARS[k].faction === (HOSTILE[me.faction]||'__'));
  const other   = pool.filter(k=>CHARS[k].faction !== me.faction && hostile.indexOf(k)<0);
  const rest    = pool.filter(k=>CHARS[k].faction === me.faction);
  const out=[];
  const take=arr=>{ const a=arr.slice(); while(a.length && out.length<n){ out.push(a.splice(Math.floor(Math.random()*a.length),1)[0]); } };
  take(hostile); take(other); take(rest);
  return out.slice(0,n);
}

function doStart(){
  if(!state || !state.sel) return;
  SFX.click();
  const meta = MODE_META[state.mode] || MODE_META.hot;
  if(state.sel.length < meta.minPick) return;
  const keys = state.sel.slice(0, meta.maxPick);
  if(state.mode==='ai'){
    if(keys.length!==1) return;
    keys.push.apply(keys, pickOpponents(keys[0], state.aiCount));
  }
  startGame(keys, state.mode);
}

/* ---------- 对战 ---------- */
/* 气血：三国杀式「血量点」——实心=现有，空心=已失，一眼看清还剩几口 */
function hpBar(pl){
  const hp = Math.max(0, pl.hp), max = pl.maxHp || pl.hp || 1;
  let pips = '';
  for(let i=0;i<max;i++) pips += '<span class="pip'+(i<hp?' on':'')+'"></span>';
  return '<div class="hppips" title="气血 '+hp+' / '+max+' · '+realmTag(pl)+'">'
       +   pips
       +   '<span class="hpcnt">'+hp+' / '+max+'</span>'
       + '</div>';
}
function portraitHtml(pl, key){
  return '<img class="portrait" src="art/'+key+'.png" onerror="this.style.display=\'none\'">';
}
// 阵营立场标签：守城/讨伐模式下区分敌我
function sideLabel(pl){
  if(state.mode==='siege') return pl.side==='foe' ? '来犯之敌' : '守城';
  if(state.mode==='boss')  return pl.side==='boss' ? '巨 寇' : '讨伐';
  return null;
}
function enemyCard(pl){
  const col = FACTIONS[pl.faction]||'#999';
  const dead = pl.alive ? '' : ' dead';
  const low  = (pl.alive && pl.hp<=1) ? ' lowhp' : '';
  const clickable = (state.await && pl.alive) ? ' clickable' : '';
  const you = (state.mode==='ai' && pl.id===state.human) ? '<span class="badge badge-realm" style="top:6px;right:6px;left:auto">你</span>' : '';
  const boss = pl.isBoss ? '<span class="badge badge-hp" style="bottom:auto;top:6px;left:50%;transform:translateX(-50%);background:linear-gradient(180deg,#8e44ad,#5b2a6e)">巨寇</span>' : '';
  /* 位置号：用持久 seatNo（全局唯一），不再用 state.players.indexOf
     —— siege 每波新生、boss 模式 push 都会让 index 漂移，
     —— 但 seatNo 是入场时一次性分配的，永远不再变 */
  const seatZh = ['一','二','三','四','五','六','七','八','九','十'];
  function seatZhOf(n){
    if(!n || n<1) return '';
    return seatZh[n-1] || (''+n);
  }
  const seatHtml = pl.seatNo ? '<span class="seat-num">'+seatZhOf(pl.seatNo)+'号位</span>' : '';
  const cur = (pl.id===state.current) ? ' cur' : '';
  return '<div id="pl-'+pl.id+'" class="player'+dead+low+clickable+cur+'" style="border-color:'+col+';--col:'+col+'" onclick="onPlayerClick('+pl.id+')">'
    + '<div class="pwrap">'
    +   '<div class="ph-initial">'+pl.name.charAt(0)+'</div>'
    +   portraitHtml(pl, pl.key)
    +   '<div class="name-over">'+pl.name+'</div>'
    +   '<div class="fac-over" style="color:'+col+'">'+pl.faction+'</div>'
    +   you + boss + seatHtml
    +   (pl.alive?'':'<div class="ph-dead">阵 亡</div>')
    + '</div>'
    + '<div class="pinfo">'
    +   '<div class="pfac" style="color:'+col+'">'+pl.faction
    +     (sideLabel(pl)?' · '+sideLabel(pl):'')+'</div>'
    +   hpBar(pl)
    +   '<div class="pequip">'+(pl.equip?'飞剑 · '+pl.equip.name:'无飞剑')+' · 手牌 '+pl.hand.length+'</div>'
    +   '<div class="pskills">'+((pl.skills||[]).map(s=>skTag(pl,s)).join(' '))+'</div>'
    +   (state.await && pl.alive ? '<div class="tag tgt">▼ 可选</div>':'')
    +   (hasAlly(pl) ? '<div class="tag">齐心</div>':'')
    + '</div></div>';
}
function heroBody(p){
  const col = FACTIONS[p.faction]||'#999';
  const seatZh = ['一','二','三','四','五','六','七','八','九','十'];
  function seatZhOf(n){
    if(!n || n<1) return '';
    return seatZh[n-1] || (''+n);
  }
  const seatHtml = p.seatNo ? '<span class="seat-num hero-seat">'+seatZhOf(p.seatNo)+'号位</span>' : '';
  return '<div class="pwrap hero-portrait" style="background:'+col+'">'
    +   '<div class="ph-initial">'+p.name.charAt(0)+'</div>'
    +   portraitHtml(p, p.key)
    +   '<div class="name-over">'+p.name+'</div>'
    +   '<div class="fac-over" style="color:'+col+'">'+p.faction+'</div>'
    +   (isAI(p) ? '<div class="hero-badge">天意行棋</div>' : '<div class="hero-badge">行 棋 中</div>')
    +   seatHtml
    + '</div>'
    + '<div class="hero-info">'
    +   '<div class="hero-fac" style="color:'+col+'">'+realmFullTag(p)+(p.talent?' · 天赋 '+p.talent:'')+'</div>'
    +   hpBar(p)
    +   '<div class="pequip">'+(p.equip?'飞剑 · '+p.equip.name:'未祭飞剑')+' · 手牌 '+p.hand.length+'</div>'
    +   '<div class="pskills big">'+((p.skills||[]).map(s=>skTag(p,s)).join(' '))+'</div>'
    +   '<div class="tag">'+(hasAlly(p)?'齐心 · ':'')+'剑气 '+p.attackUsed+' / '+attackLimit(p)+'</div>'
    + (state.await && state.await.allowSelf && p.alive ? '<div class="tag tgt">▼ 可选</div>' : '')
    + '</div>';
}
function skTag(p, n){
  const d = skillText(p).filter(x=>x.n===n)[0];
  const tip = d ? (d.txt + (d.q ? ' &#10;「'+d.q+'」' : '')) : '';
  return '<span class="sk" title="'+tip.replace(/"/g,'&quot;')+'">'+n+'</span>';
}
function handCardHtml(c, i, n, disabled, sel){
  const mid = (n-1)/2;
  // 扇形：张数越多，单张旋转/位移越小，保证不被裁切
  const span = n<=1 ? 0 : Math.min(4.5, 26/n);
  const rot = ((i-mid) * span).toFixed(2);
  const lift = (Math.pow(Math.abs(i-mid), 1.5) * (n>7?1.0:1.6)).toFixed(1);
  const selCls = (sel ? ' sel' : '');
  const tip = CARD_KIND[c.type]+' · 点数 '+cardPoint(c)+(disabled?'（此刻打不出）':'')+'&#10;'+cardDesc(c);
  return '<div id="card-'+c.uid+'" class="card '+cardCls(c)+(disabled?' disabled':'')+selCls+'" '
       + 'style="--rot:'+rot+'deg;--lift:'+lift+'px" onclick="onCardClick('+c.uid+')" title="'+tip+'">'
       + '<div class="cf-head"><span class="cf-point">'+cardPoint(c)+'</span>'+c.name+'</div>'
       + '<div class="cf-art"><span class="cf-sig">'+cardSig(c)+'</span></div>'
       + '<div class="cf-foot">'+CARD_KIND[c.type]+'</div>'
       + '</div>';
}
/* 卡牌效果说明：PC 悬停即用，比手机端更直观 */
function cardDesc(c){
  return ({
    attack:'剑气 · 出剑伤敌，须择一名角色为鹄的（可越位）。',
    dodge:'守心 · 仅应敌时打出，避去一剑。',
    heal:'丹药 · 疗伤，择一名气血未满者（含己）。',
    wine:'问剑 · 饮后本回合首剑气势如虹（剑气 +1）。',
    trick:'诡道 · 出奇制胜，惑乱敌心或夺其机先。',
    equip:'法宝 · 祭出本命飞剑，剑气与手牌上限俱增。'
  })[c.type] || '未知牌。';
}
/* PC 专属「装备 · 状态」坞：一眼看清当前持有（手机端屏窄故省去） */
function statusStripHtml(p){
  const chips=[];
  if(p.equip) chips.push({t:'本命飞剑', s:p.equip.name, c:'#e8c66a'});
  if(p.wineActive) chips.push({t:'问剑', s:'已饮 · 首剑+1', c:'#c9a23f'});
  if(p.judgeBuff) chips.push({t:'气势', s:'道心通明', c:'#9b6fd4'});
  if(hasAlly(p)) chips.push({t:'齐心', s:'同阵营+1', c:'#5fb8a6'});
  (p.extraSkills||[]).forEach(s=>{ if(s && s.n) chips.push({t:'法宝', s:s.n, c:'#caa15a'}); });
  if(!chips.length) return '';
  let h='<div class="status-strip"><span class="ss-label">装 备 · 状 态</span>';
  chips.forEach(c=>{ h+='<span class="ss-chip" style="border-color:'+c.c+';color:'+c.c+'"><b>'+c.t+'</b>'+c.s+'</span>'; });
  h+='</div>';
  return h;
}
/* 两步出牌确认条：选中牌后浮现于手牌区下方 */
function confirmBarHtml(p){
  const card = p.hand.find(c=>c.uid===state.selUid);
  if(!card) return '';
  return '<div class="confirm-bar">'
    + '<div class="cb-card card '+cardCls(card)+'" style="--rot:0deg;--lift:0px">'
    +   '<div class="cf-head"><span class="cf-point">'+cardPoint(card)+'</span>'+card.name+'</div>'
    +   '<div class="cf-art"><span class="cf-sig">'+cardSig(card)+'</span></div>'
    +   '<div class="cf-foot">'+CARD_KIND[card.type]+'</div>'
    + '</div>'
    + '<div class="cb-info"><div class="cb-name">'+card.name+' · '+CARD_KIND[card.type]+'</div>'
    +   '<div class="cb-desc">'+cardDesc(card)+'</div>'
    +   '<div class="cb-hint">回车出牌 · 再点卡牌亦可 · Esc 取消</div></div>'
    + '<button class="btn primary" onclick="playSelected()">出 牌 <span class="cb-key">↵</span></button>'
    + '<button class="btn ghost" onclick="onCancelSel()">取 消</button>'
    + '</div>';
}

/* 中央「出牌展示区」：最近打出的一张牌 + 招式名 */
function stageHtml(){
  const lp = state.lastPlay;
  if(!lp) return '<div class="stg-empty">静 待 出 手</div>';
  return '<div class="stg-card '+lp.cls+'">'
       +   '<div class="cf-head"><span class="cf-point">'+lp.point+'</span>'+lp.name+'</div>'
       +   '<div class="cf-art"><span class="cf-sig">'+lp.sig+'</span></div>'
       +   '<div class="cf-foot">'+lp.kind+'</div>'
       + '</div>'
       + '<div class="stg-by">'+lp.by+'　·　<b style="color:'+lp.col+'">'+lp.txt+'</b></div>';
}
/* 出牌时记录：既飘招式名，也把牌摆到中央展示区 */
function shoutCard(p, card, text, color){
  state.lastPlay = {
    name:card.name, sig:cardSig(card), cls:cardCls(card), point:cardPoint(card),
    kind:CARD_KIND[card.type], by:p.name, txt:text, col:color||'#e8c66a'
  };
  shout(text, color);
}

function handWrapHtml(p){
  let h = '';
  const trustee = isTrusteeView(p);        // 托管中：手牌照常摊开，供玩家旁观
  if(isAI(p) && !trustee){
    h += '<div class="handtitle">'+p.name+' 正在思量…（手牌 '+p.hand.length+' 张）</div>';
    h += statusStripHtml(p);
    h += '<div class="hand">';
    for(let i=0;i<Math.min(p.hand.length,10);i++) h += '<div class="cardback">剑</div>';
    h += '</div>';
    return h;
  }
  h += '<div class="handtitle"><span>'+p.name+' 的手牌'+(trustee?'<b class="trustee-tag">· 托管中</b>':'')+'</span>'
     + '<span class="atkinfo">上限 '+handLimit(p)+' · 剑气 '+p.attackUsed+'/'+attackLimit(p)+'</span>'
     + (p.wineActive?'<b>· 饮者已饮（剑气 +1）</b>':'')+'</div>';
  h += statusStripHtml(p);
  h += '<div class="hand'+(state.selUid!=null?' has-sel':'')+'">';
  if(state.await){
    h += '<div class="wait">请点击上方一名角色为【'+state.await.label+'】目标；或<button class="btn ghost" style="margin-left:8px" onclick="cancelAwait()">取消</button></div>';
  } else {
    const n = p.hand.length;
    const selUid = state.selUid;
    p.hand.forEach((c,i)=>{
      const unusable = (c.type==='attack' && p.attackUsed>=attackLimit(p)) || c.type==='dodge';
      h += handCardHtml(c, i, n, unusable, c.uid===selUid);
    });
    if(!n) h += '<div class="wait">两手空空。</div>';
  }
  h += '</div>';
  if(!state.await && state.selUid!=null && !isAI(p)) h += confirmBarHtml(p);
  return h;
}

function renderGame(app){
  const p = current();
  /* 防御性清掉选中态：进入 AI 回合 / 选目标中 / 忙碌 / 选中牌已离手时，确认条自动消失 */
  if(state.selUid!=null){
    if(isAI(p) || state.busy || state.await || !p.hand.find(c=>c.uid===state.selUid)) state.selUid=null;
  }
  /* 阵营对位：当前玩家 + 同阵营/同 side 的队友放我方行；其余进对位行
     siege/boss 多队友不再被误判成"敌人" */
  const mates = state.players.filter(pl=>pl.id!==state.current && isMyTeam(pl));
  const opps  = state.players.filter(pl=>pl.id!==state.current && !isMyTeam(pl));
  let html = '<div class="battlefield'+(state.await?' awaiting':'')+'">';

  /* ---------- 顶栏 ---------- */
  html += '<div class="bf-top"><div class="topbar">';
  html +=   '<div class="turn-banner">';
  html +=     '<span class="phase">第 '+state.round+' 轮</span>';
  if(state.mode==='siege'){
    html +=   '<span class="phase" style="color:#e8c66a;border-color:rgba(232,198,106,.6)">'
           +    '守城 '+state.wave+' / '+state.maxWave+' 波</span>';
  }
  if(state.mode==='boss'){
    const b = state.players.find(x=>x.side==='boss');
    if(b) html += '<span class="phase" style="color:#c89fe0;border-color:rgba(200,159,224,.6)">'
           +    '共伐 '+b.name+' '+Math.max(0,b.hp)+'/'+b.maxHp+'</span>';
  }
  if(state.mode==='hot'||state.mode==='ai'){
    html +=   '<span class="phase">'+(MODE_META[state.mode]||{title:''}).title+'</span>';
  }
  html +=     '<span class="turn">'+p.name+'</span>';
  html +=     '<span class="tfac" style="color:'+(FACTIONS[p.faction]||'#999')+'">'+p.faction+'</span>';
  html +=     '<span class="stepper">'
         +      '<span class="st'+(state.tphase==='draw'?' on':(state.tphase==='judge'||state.tphase==='play'||state.tphase==='discard'?' done':''))+'">摸牌</span>'
         +      '<span class="arw">›</span>'
         +      '<span class="st'+(state.tphase==='judge'?' on':(state.tphase==='play'||state.tphase==='discard'?' done':''))+'">判定</span>'
         +      '<span class="arw">›</span>'
         +      '<span class="st'+(state.tphase==='play'?' on':(state.tphase==='discard'?' done':''))+'">出牌</span>'
         +      '<span class="arw">›</span>'
         +      '<span class="st'+(state.tphase==='discard'?' on':'')+'">弃牌</span>'
         +    '</span>';
  html +=   '</div>';
  html +=   '<div class="topctrl">';
  html +=     '<button class="bg-btn" onclick="cycleBg()">换景</button>';
  html +=     '<button class="bg-btn" id="spdbtn" onclick="toggleSpeed()">节奏 缓</button>';
  html +=     '<button class="bg-btn" id="sfxbtn" onclick="toggleSfx()">♪ 音效开</button>';
  html +=     '<button class="bg-btn'+(state.auto?' on':'')+'" id="autobtn" onclick="toggleAuto()" title="交给 AI 代打，再点一次收回"'
         +      '>'+(state.auto?'托管 中':'托 管')+'</button>';
  html +=     '<button class="btn endturn" '+(isAI(p)||state.busy||state.await?'disabled':'')+' onclick="onEndTurn()">结束回合</button>';
  html +=   '</div>';
  html += '</div></div>';

  /* ---------- 主区：战场 + 战报 ---------- */
  html += '<div class="bf-main">';

  html +=   '<div class="bf-field">';
  /* 对位行（顶部）：敌方 + 对位阵营小标 */
  html +=     '<div class="bf-enemies">'
         +       '<div class="bf-side-band opp-band"><i>◤</i>'+oppSideLabel()+'</div>'
         +       '<div class="enemies">';
  for(const pl of opps){ html += enemyCard(pl); }
  html +=         '</div>'
         +     '</div>';
  html +=     '<div class="bf-board">'
         +       '<div class="bf-pile"><b>'+state.deck.length+'</b>牌库</div>'
         +       '<div class="bf-stage">'+stageHtml()+'</div>'
         +       '<div class="bf-pile"><b>'+state.discard.length+'</b>弃牌</div>'
         +     '</div>';
  html +=   '</div>';

  html +=   '<div class="bf-log"><div class="log"><div class="logtitle">战 报</div>';
  state.log.slice(-40).forEach(l=>{ html += '<div class="lg-'+l.c+'">'+l.t+'</div>'; });
  html +=   '</div></div>';

  html += '</div>';

  /* ---------- 我方：队友 + 当前武将 + 手牌 + 技能 ---------- */
  const selfPick = (state.await && state.await.allowSelf && p.alive) ? ' clickable' : '';
  html += '<div class="bf-me">';
  /* 队友条（独立一行，置于主行之上） */
  if(mates.length){
    html += '<div class="bf-mates">'
         +    '<div class="bf-side-band my-band"><i>◤</i>同 阵 营</div>'
         +    '<div class="mates-row">';
    for(const pl of mates){ html += enemyCard(pl); }
    html +=    '</div></div>';
  }
  /* 主行：武将 + 手牌 + 技能（保留原 .bf-me 三栏） */
  html += '<div class="bf-me-main">';
  html +=   '<div class="hero'+(p.alive?'':' dead')+((p.alive && p.hp<=1)?' lowhp':'')+(p.id===state.current?' cur':'')+selfPick+'" id="pl-'+p.id+'"'
         +  ' onclick="onPlayerClick('+p.id+')" style="--col:'+(FACTIONS[p.faction]||'#999')+'">'
         +     heroBody(p)
         +   '</div>';
  html +=   '<div class="bf-handwrap">'+handWrapHtml(p)+'</div>';
  html +=   '<div class="bf-skills">';
  if(!isAI(p) && !state.await){
    const skills = skillButtons(p);
    if(skills.length){
      html += '<div class="sktitle">技 能</div>';
      skills.forEach(s=>{ html += '<button class="btn skill" title="'+s.tip+'" onclick="onSkill(\''+s.key+'\')">'+s.label+'</button>'; });
    }
  }
  html +=     '<button class="btn ghost quit" onclick="state={phase:\'title\',sel:[],log:[]};render()">退出战局</button>';
  html +=   '</div>';
  html += '</div>';   /* /bf-me-main */
  html += '</div>';   /* /bf-me */

  html += '</div>';

  app.innerHTML = html;

  const sb = document.getElementById('sfxbtn');
  if(sb && !SFX.isOn()){ sb.classList.add('off'); sb.textContent='♪ 音效关'; }
  const pb = document.getElementById('spdbtn');
  if(pb){
    pb.textContent = (speedMul > 0.7) ? '节奏 缓' : '节奏 疾';
    pb.classList.toggle('off', speedMul <= 0.7);
  }
  const lg = document.querySelector('.bf-log .log');
  if(lg) lg.scrollTop = lg.scrollHeight;

  if(state.over && !renderGame._overFx){
    renderGame._overFx = true;                    // 只播一次：over 期间 render 会被反复调用
    const coop = (state.mode==='siege' || state.mode==='boss');
    const humanWin = coop ? (state.win !== false)
                          : (state.mode==='hot' || state.winnerId === state.human);
    if(humanWin){
      winFx();                                    // 彩带
      fxSwordRain(26, '#e8c66a');                 // 漫天金剑
      if(state.winnerId >= 0) fxPillar(state.winnerId);
      SFX.win();
      figFig('walk', '后会有期', { cd: 0, dur: 3400 });   // 收尾画意：一人一剑走向远山
    } else {
      fxFlash('rgba(120,16,16,.55)', 900);        // 血色闪屏
      if(state.winnerId >= 0) fxShatter(state.winnerId);
      SFX.lose();
      figFig('walk', '来日方长', { cd: 0, dur: 3400 });
    }
    clearTimeout(renderGame._t);
    renderGame._t = setTimeout(()=>{ if(state && state.phase==='game'){ state.phase='result'; render(); } }, 2100);
  }
  for(const pl of state.players){
    if(!pl.alive){
      const el = document.getElementById('pl-'+pl.id);
      if(el && !el.classList.contains('fx-die')) el.classList.add('fx-die');
    }
  }
}


function skillButtons(p){
  const out=[];
  for(const sk of skillsOf(p)){
    if(sk.k!=='act') continue;
    if(sk.o==='once' && usedFlag(p,sk)) continue;
    if(sk.o==='turn' && usedFlag(p,sk)) continue;
    out.push({ key:sk.a, label:sk.n, tip:(sk.q||'')+(sk.qo?'（原著）':'') });
  }
  if(!isFlagship(p) && p.talent) out.push({key:'talent', label:'天赋 · '+p.talent, tip:TALENT_DESC[p.talent]||''});
  return out;
}

/* ---------- 结算 ---------- */
/* 加冕时刻：决出"全场魁首"
   - 败方：不加冕，return null（renderResult 走克制模式）
   - 热座（hot）：魁首 = 唯一赢家
   - 协作模式（siege/boss）+ 1v1（ai）：魁首 = 我方阵营 中 杀优先 + 伤补足 的最强者（死了也表彰） */
function computeMVP(){
  const wid = state.winnerId;
  const won = state.win !== false;
  const coop = (state.mode==='siege' || state.mode==='boss');
  const humanWin = coop ? won : ((state.mode==='hot') || (wid===state.human));
  if(!humanWin) return null;
  if(state.mode==='hot'){
    return state.players.find(p=>p.id===wid) || null;
  }
  // standard / ai / siege / boss：我方阵营候选
  const me = state.players[state.current] || state.players.find(p=>p.id===state.human);
  const pool = me ? state.players.filter(p => p.id===me.id || p.faction===me.faction || p.side===me.side)
                  : state.players.slice();
  let best=null, bestScore=-1;
  for(const pl of pool){
    const score = (pl.stats.kills||0)*1000 + (pl.stats.dmg||0);
    if(score > bestScore){ bestScore=score; best=pl; }
  }
  return best;
}
/* 本局成就：按 human 玩家整局战绩评定一枚《剑来》意境称号（含品级与点评） */
function computeAchievement(){
  const me = state.players.find(p=>p.id===state.human) || state.players[state.current] || null;
  if(!me) return null;
  const won = state.win !== false;
  const humanWin = (state.mode==='siege'||state.mode==='boss') ? won
                 : ((state.mode==='hot') || (state.winnerId===state.human));
  const k=me.stats.kills||0, d=me.stats.dmg||0, t=me.stats.taken||0, h=me.stats.heal||0, alive=me.alive;
  let r;
  if(humanWin && k>=6)      r={ title:'一剑霜寒', grade:'神品', gkey:'divine', note:'杀伐之盛，一剑霜寒，万修辟易。' };
  else if(humanWin && h>=6) r={ title:'春风化雨', grade:'上品', gkey:'high',    note:'以疗护友，如春风化雨，润物无声。' };
  else if(humanWin && t>=10)r={ title:'中流一柱', grade:'上品', gkey:'high',    note:'独承锋镝，中流一柱，镇守山河。' };
  else if(humanWin && d>=14)r={ title:'万军辟易', grade:'神品', gkey:'divine', note:'剑气纵横，所向披靡，万军辟易如卷席。' };
  else if(humanWin && alive && t<=2) r={ title:'守心如玉', grade:'上品', gkey:'high', note:'守心如玉，问心无愧于天地。' };
  else if(humanWin)        r={ title:'浩然长存', grade:'中品', gkey:'mid',     note:'持正而行，浩然之气长存。' };
  else if(alive)           r={ title:'卷土可来', grade:'中品', gkey:'mid',     note:'败而不馁，他日卷土可重来。' };
  else                     r={ title:'百折不回', grade:'下品', gkey:'low',     note:'道阻且长，百折其志不回。' };
  return r;
}
function renderResult(app){
  const wid = state.winnerId;
  const won = state.win !== false;
  // 守城/讨伐是协作模式，胜负看 state.win；混战/热座看胜者是否为玩家
  const humanWin = (state.mode==='siege' || state.mode==='boss')
    ? won
    : ((state.mode==='hot') || (wid===state.human));
  const w = playerById(wid);
  const wkey = w ? w.key : null;
  let sub;
  if(state.mode==='siege'){
    sub = won ? '五波蛮荒尽退，长城无恙。'
              : '守至第 '+state.wave+' 波，城破人亡。';
  } else if(state.mode==='boss'){
    sub = won ? '巨寇伏诛，天下共伐功成。' : '讨伐失利，巨寇犹在。';
  } else {
    sub = humanWin ? '剑气长存，胜者 '+state.winner : state.winner+' 技高一筹，再练三年';
  }
  let html = '<div class="result">';
  /* 加冕时刻：魁首卡（MVP）只在胜方颁发；败方走克制头像 */
  const mvp = computeMVP();
  const mvpPl  = mvp;
  const mvpKey = mvpPl ? mvpPl.key : (w ? w.key : null);
  const mvpCol = mvpPl ? (FACTIONS[mvpPl.faction]||'#e8c66a') : '#e8c66a';
  if(humanWin && mvpPl){
    const realm = realmTag(mvpPl);
    const facLab = mvpPl.faction + (sideLabel(mvpPl)?' · '+sideLabel(mvpPl):'');
    html += '<div class="rs-mvp-wrap">'
         +   '<div class="rs-mvp-banner"><span class="rs-mvp-flame-t"></span><span class="rs-mvp-banner-t">全 场 最 佳</span><span class="rs-mvp-flame-b"></span><small>'+ (state.mode==='siege'?'守城同道':
              state.mode==='boss'?'天下共伐': (state.mode==='hot'?'热座争锋':'同门之最')) +'</small></div>'
         +   '<div class="rs-mvp-card" style="--col:'+mvpCol+'">'
         +     '<div class="rs-mvp-art"><img src="art/'+mvpKey+'.png" onerror="this.style.display=\'none\'"></div>'
         +     '<div class="rs-mvp-flame"></div>'
         +     '<div class="rs-mvp-name" style="color:'+mvpCol+'">'+mvpPl.name+'<span class="mvp-fac">'+facLab+' · '+realm+'</span></div>'
         +   '</div>'
         +   '<div class="rs-mvp-stats">'
         +     '<div class="rs-mvp-stat"><b>'+(mvpPl.stats.kills||0)+'</b><span>斩 杀</span></div>'
         +     '<div class="rs-mvp-stat"><b>'+(mvpPl.stats.dmg||0)+'</b><span>造 伤</span></div>'
         +     '<div class="rs-mvp-stat"><b>'+(mvpPl.stats.heal||0)+'</b><span>疗 愈</span></div>'
         +   '</div>'
         + '</div>';
  } else if(wkey){
    html += '<div class="rs-lose-card"><img src="art/'+wkey+'.png" onerror="this.style.display=\'none\'"></div>';
  }
  /* 本局成就：按 human 玩家战绩评定称号 */
  const ach = computeAchievement();
  if(ach){
    html += '<div class="rs-ach '+(humanWin?'rs-ach-win':'rs-ach-lose')+' rs-grade-'+ach.gkey+'">'
         +  '<div class="rs-ach-grade">'+ach.grade+' · 本 局 成 就</div>'
         +  '<div class="rs-ach-title">'+ach.title+'</div>'
         +  '<div class="rs-ach-note">'+ach.note+'</div>'
         + '</div>';
  }
  html += '<div class="rs-title '+(humanWin?'win':'lose')+'">'+(humanWin?'胜':'败')+'</div>';
  html += '<div class="rs-sub">'+sub+'</div>';
  html += '<div class="rs-stats"><table>'
       +  '<tr><th>人物</th><th>阵营</th><th>境界</th><th>斩杀</th><th>造成伤害</th><th>承受</th><th>疗愈</th></tr>';
  state.players.slice().sort((a,b)=> (b.alive?1:0)-(a.alive?1:0) || b.stats.kills-a.stats.kills)
    .forEach(pl=>{
      html += '<tr class="'+(pl.id===wid?'win-row':'')+'">'
           +  '<td>'+pl.name+(pl.alive?'':'（殁）')+'</td>'
           +  '<td style="color:'+(FACTIONS[pl.faction]||'#999')+'">'+pl.faction+'</td>'
           +  '<td>'+realmTag(pl)+'</td><td>'+pl.stats.kills+'</td><td>'+pl.stats.dmg+'</td>'
           +  '<td>'+pl.stats.taken+'</td><td>'+pl.stats.heal+'</td></tr>';
    });
  html += '</table></div>';
  html += '<div class="rs-btns">'
       +  '<button class="btn primary" onclick="rematch()">再 战</button>'
       +  '<button class="btn ghost" onclick="state={phase:\'title\',sel:[],log:[]};render()">回到卷首</button>'
       +  '</div></div>';
  app.innerHTML = html;
}
function rematch(){
  SFX.click();
  const keys = state.sel.slice();
  startGame(keys, state.mode);
}
function onEndTurn(){
  SFX.click();
  if(state.over || state.busy || state.await) return;
  state.selUid = null;
  endTurn();
}

/* ===================== 人物简报 ===================== */
function showCharBrief(key){
  // 行迹录：翻阅人物志计入见闻（每位只记一次）
  try{ if(typeof prRecordRead==='function')
    prRecordRead('codex', key, (typeof CHARS!=='undefined' && CHARS[key]) ? CHARS[key].name : key); }catch(e){}
  const c = CHARS[key]; if(!c) return;
  const col = FACTIONS[c.faction]||'#999';
  const b = (typeof BRIEFS!=='undefined') ? BRIEFS[key] : null;
  const parsed = parseSkills(c.txt);
  pendingBlur = "url('art/"+key+".png')";

  const sparks = [[12,8,0],[78,6,1.1],[30,10,2.0],[62,7,2.9],[48,9,1.6],[88,5,.6],[6,6,3.4]]
    .map(s=>'<span class="portrait-spark" style="left:'+s[0]+'%;top:'+s[1]+'%;'
        + 'width:'+(5+s[0]%4)+'px;height:'+(5+s[0]%4)+'px;animation-delay:'+s[2]+'s"></span>').join('');
  const portrait =
    '<div class="brief-portrait">'
    + '<div class="portrait-aura"></div><div class="portrait-halo"></div><div class="portrait-halo inner"></div>'
    + sparks + '<div class="portrait-glow"></div>'
    + '<img class="portrait-img" src="art/'+key+'.png" alt="'+c.name+'" onerror="this.style.display=\'none\'">'
    + '<div class="portrait-mirror"></div><div class="portrait-ring"></div>'
    + '<div class="pm-badges">'
      + '<span class="badge badge-fac" style="color:'+col+'">'+c.faction+'</span>'
      + '<span class="badge badge-realm">'+(typeof realmIconForChar==='function'?realmIconForChar(c.realm):'')+realmTag(c)+'</span>'
      + '<span class="badge badge-hp">气血 '+c.hp+'</span>'
    + '</div></div>';

  let right = '<div class="brief-mast"><div class="brief-name">'+c.name+'</div>'
    + '<div class="brief-meta">'+((b&&b.pos)?b.pos:'')+'</div>'
    + ((b&&b.sect)?'<div class="brief-meta" style="color:#c9a24b">宗门 · '+b.sect+'</div>':'')+'</div>';
  right += '<div class="brief-cards">';
  if(b){
    if(b.intro) right += '<div class="brief-card"><h3 class="brief-h">形象速写</h3><p class="brief-intro">'+b.intro+'</p></div>';
    else right += '<div class="brief-card"><p class="brief-intro">（该角色原著详介整理中，以下为卡牌技能设定。）</p></div>';
    /* 原著三栏：形貌 / 衣着 / 性情 —— 字段缺失或空数组则整栏跳过，绝不渲染空标题 */
    [['形貌', b.look], ['衣着', b.dress], ['性情', b.temper]].forEach(function(f){
      const arr = (Array.isArray(f[1]) ? f[1] : []).filter(function(s){ return s && String(s).trim(); });
      if(!arr.length) return;
      right += '<div class="brief-card"><h3 class="brief-h">'+f[0]+'</h3><div class="brief-lines">'
        + arr.map(function(s){ return '<p class="brief-line">'+s+'</p>'; }).join('')
        + '</div></div>';
    });
    if(b.tags && b.tags.length) right += '<div class="brief-card"><h3 class="brief-h">性格标签</h3><div class="chips">'
      + b.tags.map(t=>'<span class="chip">'+t+'</span>').join('')+'</div></div>';
    const scenes = (b.scenes||[]).filter(s=>s && (String(s.d||'').trim() || String(s.q||'').trim()));
    if(scenes.length){
      let sc='<div class="brief-card"><h3 class="brief-h">名场面 · 关键经历</h3>';
      scenes.forEach(s=>{ sc += '<div class="scene"><h4>'+s.t+'</h4>'
        + (s.d?'<p>'+s.d+'</p>':'')
        + (s.q?'<blockquote class="scene-quote">'+s.q+'</blockquote>':'')+'</div>'; });
      right += sc+'</div>';
    }
    if(typeof PLOTS!=='undefined' && PLOTS[key] && PLOTS[key].length){
      const pl2 = PLOTS[key].filter(p=>p && String(p).trim());
      if(pl2.length){ let pl='<div class="brief-card"><h3 class="brief-h">关键情节</h3>';
      pl2.forEach(p=>{ pl += '<div class="plot"><p>'+p+'</p></div>'; });
      right += pl+'</div>'; }
    }
    if(b.quotes && b.quotes.length) right += '<div class="brief-card"><h3 class="brief-h">经典台词</h3><div class="quotes">'
      + b.quotes.map(q=>'<blockquote>'+q+'</blockquote>').join('')+'</div></div>';
    if(b.rel){
      let rc='<div class="brief-card"><h3 class="brief-h">人物关系</h3>';
      for(const k2 in b.rel){
        if(b.rel[k2] && b.rel[k2].length) rc += '<div class="rel-group"><span class="rel-label">'+k2+'</span><div class="rel-chips">'
          + b.rel[k2].map(r=>'<span class="rel-chip">'+r+'</span>').join('')+'</div></div>';
      }
      right += rc+'</div>';
    }
    if(b.verdict) right += '<div class="brief-card brief-card--verdict"><h3 class="brief-h">一句话定评</h3><p class="verdict-text">'+b.verdict+'</p></div>';
  } else {
    right += '<div class="brief-card"><p class="brief-intro">（该角色原著详介整理中，以下为卡牌技能设定。）</p></div>';
  }
  // 技能卡放左栏立绘下方：仅列出技能名，效果在卡牌对战中体验
  let skc = '<div class="brief-skills"><div class="brief-card">';
  if(parsed.length){
    skc += '<div class="chips">' + parsed.map(s=>'<span class="chip" style="background:rgba(232,198,106,.12);color:var(--gold);border-color:rgba(232,198,106,.35);cursor:default">'+s.name+'</span>').join('') + '</div>';
  } else skc += '<div class="modal-empty">（暂无技能说明）</div>';
  skc += '</div></div>';
  right += '</div></div>';

  const m = document.getElementById('modal');
  if(pendingBlur) m.style.setProperty('--blurbg', pendingBlur);
  pendingBlur = null;
  m.innerHTML = '<div class="modal-box brief-modal">'
    + '<div class="brief-axis left"></div><div class="brief-axis right"></div>'
    + '<span class="brief-seal-tl">剑来</span><span class="brief-seal-br">人物</span>'
    + '<div class="brief-left">'+portrait+skc+'</div>'
    + '<div class="brief-right">'+right+'</div><div id="modal-btns" class="brief-btns"></div></div>';
  const box = document.getElementById('modal-btns');
  const btn = document.createElement('button'); btn.textContent='关闭'; btn.className='btn';
  btn.onclick=()=>closeModal();
  box.appendChild(btn);
  // 点击遮罩也可关闭（仅人物简报；抉择类弹窗不允许）
  m.onclick = e=>{ if(e.target === m) closeModal(); };
  m.style.display='flex';
  lockBody(true);
}

/* 弹窗统一开关：打开时锁整页滚动，关闭时解锁 */
function lockBody(on){
  const b = document.body;
  if(!b) return;
  if(on) b.classList.add('modal-lock'); else b.classList.remove('modal-lock');
}
function closeModal(){
  const m = document.getElementById('modal');
  if(!m) return;
  m.style.display='none'; m.innerHTML=''; m.onclick=null;
  lockBody(false);
}

/* ===================== 启动 ===================== */
window.addEventListener('DOMContentLoaded', ()=>{
  initAmbient();
  loadSettings();          // 难度与战绩（无 localStorage 时静默用默认值）
  state = { phase:'title', sel:[], log:[] };
  render();
  // 首次交互解锁音频
  const unlock = ()=>{ SFX.set(SFX.isOn()); document.removeEventListener('pointerdown', unlock); };
  document.addEventListener('pointerdown', unlock);
  // 键盘交互：Esc 取消目标选择；回车出牌；数字 1-9 选中手牌（复用两步出牌）
  document.addEventListener('keydown', (e)=>{
    if(!state || state.phase!=='game' || state.over) return;
    if(e.key==='Escape'){ cancelAwait(); return; }
    if(state.await) return;                       // 选目标期间只响应 Esc
    const p = current();
    if(isAI(p) || state.busy) return;
    if(e.key==='Enter'){ if(state.selUid!=null) playSelected(); return; }
    if(/^[1-9]$/.test(e.key)){
      const card = p.hand[parseInt(e.key,10)-1];
      if(card) onCardClick(card.uid);             // 数字键=选中/再按=打出
    }
  });
});
