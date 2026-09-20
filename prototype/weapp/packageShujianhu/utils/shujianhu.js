'use strict';
/* 书简湖·问心局 v2（非线性 / 五维心境 / 六方态度 / 多结局）
 * 移植自 PC game.js 3072–3791，重构为无 DOM：逻辑与数据在此，页面只负责 setData 渲染。
 */

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
AL_NPC.forEach(x => { AL_NPCN[x.k] = x.n; });

/* 来路（开局） */
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

/* 随机插曲 */
const AL_INTERLUDES = [
  { t:'雨夜卖酒', d:'一个不认识的少年在雨里卖酒，说湖上今天死了人，酒卖得快。你买了一坛，没喝。',
    eff:{ dao:4, hope:3 }, npc:{ zhongs:3 }, img:'/packageShujianhu/assets/shujianhu/rain_wine.jpg' },
  { t:'旧信一封', d:'有人在门缝里塞了封信，是顾璨早年写的：「哥，这里的人都欺负我，我学会还手了。」',
    eff:{ qing:8, knot:3 }, npc:{ gucan:6 }, img:'/packageShujianhu/assets/shujianhu/old_letter.jpg' },
  { t:'湖底浮尸', d:'一具尸体浮上来，是昨天还跟你打过招呼的船家。湖上没人围观，都习惯了。',
    eff:{ li:6, knot:4 }, npc:{ zhongs:-4 }, img:'/packageShujianhu/assets/shujianhu/lake_corpse.jpg' },
  { t:'刘老成的酒', d:'刘老成派人送来一坛酒，附一张纸条：「年轻人，湖里的规矩不是一天立起来的。」',
    eff:{ li:5 }, npc:{ liulao:8 }, img:'/packageShujianhu/assets/shujianhu/liulao_wine.jpg' },
  { t:'孩子扔石头', d:'几个孩子朝顾璨的院子扔石头，边扔边喊小魔头。你站了一会儿，他们就跑了。',
    eff:{ qing:5, hope:-4 }, npc:{ gucan:-3, zhongs:3 }, img:'/packageShujianhu/assets/shujianhu/kids_stones.jpg' },
  { t:'远方剑鸣', d:'夜里有一道剑光自西北来，绕湖一圈，又走了。宁姚从不问你难不难，只告诉你她在。',
    eff:{ dao:6, qing:4 }, npc:{ ningyao:12 }, img:'/packageShujianhu/assets/shujianhu/distant_sword.jpg' },
  { t:'三十七炷香', d:'有人在湖边点了三十七炷香，一炷一个人。香烧完之前，没人说话。',
    eff:{ li:8, hope:5 }, npc:{ zhongs:8 }, img:'/packageShujianhu/assets/shujianhu/thirtyseven_incense.jpg' },
  { t:'旧刀生锈', d:'你在顾璨床下看见一把锈了的刀，是泥瓶巷那年你送他的。他一直留着。',
    eff:{ qing:10 }, npc:{ gucan:8 }, img:'/packageShujianhu/assets/shujianhu/old_knife_rust.jpg' }
];

/* 问心图：节点 */
const AL_NODES = {
  /* 一 · 入湖 */
  s1:{ ch:'一 · 入湖', t:'血，与笑', il:0, img:'/packageShujianhu/assets/shujianhu/node_s1.jpg',
    d:'你收到顾璨的消息，连夜赶来。推开那扇门时，他正坐在血泊里擦剑，抬头看见你，咧嘴笑了：「哥，你来啦。」\n他笑得像小时候偷了别人家枣子被你抓住的样子。可地上那滩血，不是他的。',
    ch2:[
      { txt:'先听他说', note:'情动于衷，但未失分寸', eff:{ qing:8, li:2 }, npc:{ gucan:8 }, next:'s2a' },
      { txt:'先问：地上这些人，是谁', note:'先把死者的名字问清楚', eff:{ li:12, qing:-4 }, npc:{ zhongs:10, gucan:-8 }, next:'s2b' },
      { txt:'替他止血，余事再议', note:'手比道理快', eff:{ qing:15, knot:5 }, npc:{ gucan:12, mother:8 }, next:'s2c' }
    ]},
  s2a:{ ch:'一 · 入湖', t:'先下手为强', img:'/packageShujianhu/assets/shujianhu/node_s2a.jpg',
    d:'顾璨擦干净剑，语气很平常：「他们都要害我，我只是先下手为强。哥，这里就是这样的规矩——你不吃人，人就吃你。」\n他说得很理直气壮，理直气壮得让你心里发凉。',
    ch2:[
      { txt:'杀人就是杀人，没有理由', note:'一句也听不进去', eff:{ li:14, dao:4, qing:-6 }, npc:{ gucan:-12, zhongs:10 }, next:'s3' },
      { txt:'你受苦了。可总得有个交代', note:'先认他的苦，再问他的账', eff:{ qing:10, li:6 }, npc:{ gucan:6 }, next:'s3' },
      { txt:'我帮你扛', note:'话出口的时候，湖面静了一下', eff:{ qing:18, knot:8 }, npc:{ gucan:18, zhongs:-15 }, next:'s3' }
    ]},
  s2b:{ ch:'一 · 入湖', t:'一叠血衣', img:'/packageShujianhu/assets/shujianhu/node_s2b.jpg',
    d:'你没有去看顾璨，先去了湖边那间破屋。一个老妇跪在门口，怀里抱着一叠血衣，一件一个人。\n她不哭也不闹，只说：「小哥，你是他哥，你替我做回主。」',
    ch2:[
      { txt:'收下血衣，许她一个交代', note:'一叠布，三十七条命的重量', eff:{ li:12, dao:6, hope:10, dan:-5 }, npc:{ zhongs:16, gucan:-6 }, flag:'cloth', next:'s3' },
      { txt:'给她银钱，让她先过日子', note:'钱能买米，买不回人', eff:{ li:-6, qing:6, hope:-6, knot:4 }, npc:{ zhongs:-4 }, next:'s3' },
      { txt:'让她先回去，容我想想', note:'想，往往就是拖', eff:{ li:-10, qing:8, hope:-8, knot:6 }, npc:{ zhongs:-10, gucan:10 }, next:'s3' }
    ]},
  s2c:{ ch:'一 · 入湖', t:'你不该来', img:'/packageShujianhu/assets/shujianhu/node_s2c.jpg',
    d:'你替他把伤口包好。他一直看着你，忽然说：「哥，你不该来。」\n你问为什么。他说：「你来了，我就装不下去了。」',
    ch2:[
      { txt:'我来了，就不会走', note:'这句话你自己听着都沉', eff:{ qing:15, knot:5 }, npc:{ gucan:15, mother:6 }, next:'s3' },
      { txt:'我来，是怕你再错', note:'把话说明白，也是一种护', eff:{ qing:8, li:10, dao:4 }, npc:{ gucan:-4 }, next:'s3' },
      { txt:'什么也不说，把药上完', note:'沉默有时候最重', eff:{ qing:12, knot:6 }, npc:{ gucan:8, mother:8 }, next:'s3' }
    ]},
  s3:{ ch:'一 · 入湖', t:'婶婶跪下了', il:1, img:'/packageShujianhu/assets/shujianhu/node_s3.jpg',
    d:'顾璨的母亲来了。她没哭天抢地，只是端端正正跪在你面前，像当年求你去看着点璨儿那样。\n「平安，婶婶不求别的。璨儿从小听你的，你救他一次。」',
    ch2:[
      { txt:'婶婶起来。我给他一个公道', note:'公道，也是护他的一种法子', eff:{ li:12, qing:6, dao:4 }, npc:{ mother:15, shuyuan:5 }, next:'s4' },
      { txt:'我答应你，不让人伤他', note:'一句话，把三十七户推到了对面', eff:{ qing:18, knot:8 }, npc:{ mother:20, gucan:10, zhongs:-12 }, next:'s4' },
      { txt:'他犯的错，我替不了', note:'界限分明，也格外冷', eff:{ li:10, qing:-12 }, npc:{ mother:-15, gucan:-10, zhongs:8 }, next:'s4' }
    ]},

  /* 二 · 问心 */
  s4:{ ch:'二 · 问心', t:'刘老成的酒席', img:'/packageShujianhu/assets/shujianhu/node_s4.jpg',
    d:'刘老成派人来请。这人在书简湖活成了老辈，湖里每一桩血案，他都知道，也都没拦。\n席上他给你斟酒：「陈公子，湖里的规矩不是一天立起来的。你要拆，得先想清楚拆完拿什么补。」',
    ch2:[
      { txt:'赴宴，把他的话听完', note:'敌人的道理，也是道理', eff:{ li:8, hope:6 }, npc:{ liulao:15, zhongs:3 }, next:'s5' },
      { txt:'不去。这酒喝不得', note:'干净，但也断了消息', eff:{ li:-4, dao:4 }, npc:{ liulao:-15, zhongs:8 }, next:'s5' },
      { txt:'去了，但把剑放在桌上', note:'先亮刀，再说话', eff:{ sword:-10, li:4, knot:4 }, npc:{ liulao:8, gucan:8, zhongs:-6 }, next:'s5' }
    ]},
  s5:{ ch:'二 · 问心', t:'先生的信', img:'/packageShujianhu/assets/shujianhu/node_s5.jpg',
    d:'老秀才老爷子的信到了，只有一句话：\n「与亲近之人，不要说气话，不要说反话，不要不说话。」\n你把这张纸看了很久。先生从来不教你怎么做，只教你想清楚再做。',
    ch2:[
      { txt:'回信：弟子明白，会先讲道理', note:'把先生的规矩摆在前面', eff:{ li:10, dao:6 }, npc:{ shuyuan:12 }, flag:'letter', next:'s6' },
      { txt:'把信收进怀里，不与顾璨争辩', note:'忍住一时，未必忍得住一世', eff:{ qing:10, li:4 }, npc:{ gucan:4 }, next:'s6' },
      { txt:'烧了。先生不懂书简湖', note:'烧的是信，也是退路', eff:{ qing:15, knot:10, li:-6 }, npc:{ shuyuan:-22, gucan:8 }, next:'s6' }
    ]},
  s6:{ ch:'二 · 问心', t:'你是不是也觉得我该死', il:1, img:'/packageShujianhu/assets/shujianhu/node_s6.jpg',
    d:'夜里，顾璨坐在门槛上，背对着你，忽然问：\n「哥，你是不是也觉得我该死？」\n他问得很轻，像怕惊动什么。',
    ch2:[
      { txt:'你该活着。但得认', note:'活路和认账，缺一不可', eff:{ li:12, qing:8, dao:6 }, npc:{ gucan:6 }, flag:'admit', next:'s7' },
      { txt:'我不许你死', note:'一句话，把天理挡在门外', eff:{ qing:16, knot:8 }, npc:{ gucan:16, zhongs:-8 }, next:'s7' },
      { txt:'你杀的那些人，也各有他们的娘', note:'最狠的一句真话', eff:{ li:16, qing:-8 }, npc:{ gucan:-14, zhongs:14 }, flag:'confront', next:'s7' },
      { txt:'这一份，我来替你担', note:'担一分因果，就要碎一分自己', eff:{ dan:-35, li:10, qing:10, dao:8, knot:6 },
        npc:{ gucan:20, mother:10, shuyuan:-8 }, req:{ res:{ dan:45 } }, flag:'bear', next:'s7' }
    ]},

  /* 三 · 舍得 */
  s7:{ ch:'三 · 舍得', t:'君子之道，在于舍得', img:'/packageShujianhu/assets/shujianhu/node_s7.jpg',
    d:'你一个人坐在湖边。齐先生当年说过：君子之道，在于舍得。\n那时候你觉得这四个字简单——舍了坏的，得着好的。如今才知道，书简湖让你舍的，和你想得的，是同一件东西。',
    ch2:[
      { txt:'若舍了公理，我便不是陈平安', note:'守住一样，就守住了所有', eff:{ li:15, dao:10 }, next:'s8' },
      { txt:'有些人，我舍不掉', note:'舍不掉，就得一直背着', eff:{ qing:15, knot:8 }, next:'s8' },
      { txt:'舍一样，才能保一样', note:'折中，也最耗心血', eff:{ li:8, qing:8, dao:4, knot:3 }, next:'s8' }
    ]},
  s8:{ ch:'三 · 舍得', t:'三十七户围门', img:'/packageShujianhu/assets/shujianhu/node_s8.jpg',
    d:'天没亮，门外站满了人。三十七户，老的少的，没人喊打喊杀，只是站着。\n领头的老妇说：「我们不要他偿命。我们要他认。认一句，我们回去好给死的人上香。」',
    ch2:[
      { txt:'开门。一户一户，赔罪', note:'三十七次低头，一次比一次低', eff:{ li:14, hope:16, dao:6, dan:-10, qing:4 },
        npc:{ zhongs:22, gucan:-6, shuyuan:6 }, flag:'bow', next:'s9' },
      { txt:'赔钱。认错的话，不说', note:'银子可以再挣，脸面没了就真没了', eff:{ li:-4, hope:-10, knot:8 }, npc:{ zhongs:-10 }, next:'s9' },
      { txt:'闭门不出', note:'门关上了，事情还在', eff:{ hope:-16, knot:10, qing:6 }, npc:{ zhongs:-16, gucan:8 }, next:'s9' },
      { txt:'再闹，我就不客气了', note:'剑出鞘一寸，道理就少一分', eff:{ sword:-25, hope:-20, li:-8, knot:12 },
        npc:{ zhongs:-26, gucan:10, liulao:-6 }, req:{ res:{ sword:55 } }, flag:'threat', next:'s9' }
    ]},
  s9:{ ch:'三 · 舍得', t:'第一个人', img:'/packageShujianhu/assets/shujianhu/node_s9.jpg',
    d:'你终于问出了那个一直不敢问的问题：「第一个呢？」\n顾璨愣了很久，说：「是个老油子。他要把我卖给湖底的那帮人，换三块灵石。我把他按在水里，按了很久。」\n他抬眼看你：「哥，第一个，我是为了活。」',
    ch2:[
      { txt:'第一个情有可原。第三个呢？第三十七个呢？', note:'起点无辜，不等于终点无辜', eff:{ li:14, dao:8, qing:-4 }, npc:{ gucan:-8, zhongs:6 }, next:'s10' },
      { txt:'从第一个起，你就不该自己动手', note:'把活路和规矩分清楚', eff:{ li:18, qing:-6 }, npc:{ gucan:-16, zhongs:12, shuyuan:8 }, next:'s10' },
      { txt:'我知道你怕。我也怕过。', note:'承认怕，也是一种认', eff:{ qing:14, knot:6, dao:2 }, npc:{ gucan:14, mother:6 }, next:'s10' }
    ]},
  s10:{ ch:'三 · 舍得', t:'千里之外', il:1, img:'/packageShujianhu/assets/shujianhu/node_s10.jpg',
    d:'宁姚的信来了，只有一行字：\n「陈平安，你在那边别把自己弄丢了。」\n你把信纸折了三折，收起来。有些话说出来，就不硬气了。',
    ch2:[
      { txt:'回信：我很好，勿念', note:'报喜不报忧，是怕她提剑来', eff:{ qing:6, dao:4 }, npc:{ ningyao:6 }, next:'s11' },
      { txt:'回信：这里很难，我还在想', note:'说实话，才是真把她当自己人', eff:{ qing:10, li:6, dao:6 }, npc:{ ningyao:16 }, next:'s11' },
      { txt:'不回', note:'不回，也是一种回', eff:{ qing:-4, knot:6 }, npc:{ ningyao:-8 }, next:'s11' }
    ]},

  /* 四 · 了断 */
  s11:{ ch:'四 · 了断', t:'各方齐至', img:'/packageShujianhu/assets/shujianhu/node_s11.jpg',
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

  /* 终局 */
  fin_dan:{ ch:'四 · 了断', t:'文胆碎了', fin:1, img:'/packageShujianhu/assets/shujianhu/node_fin_dan.jpg',
    d:'你一掌按在心口，文胆碎裂的声音只有你自己听见。\n血从嘴角下来，顾璨扑过来扶你，被你推开。三十七户的人不喊了，刘老成站起来了，连书院的使者都低下了头。\n这一湖的因果，从此有一份记在你身上。',
    ch2:[
      { txt:'把痛咽下去，先立规矩', note:'赎完罪，还得有人管这湖水', key:'dan_guilt',
        eff:{ li:8, hope:10, dao:8 }, npc:{ zhongs:12, shuyuan:8 } },
      { txt:'让顾璨看着你碎胆，说：记住这个', note:'最狠的一次护短', key:'dan_life',
        eff:{ qing:12, dao:6 }, npc:{ gucan:20 }, req:{ npc:{ gucan:35 } } },
      { txt:'碎胆之后，仍把他交出去', note:'情还了，理不能还', key:'dan_strict',
        eff:{ li:16, qing:-14, dao:6 }, npc:{ gucan:-16, zhongs:16, shuyuan:14 } }
    ]},
  fin_surrender:{ ch:'四 · 了断', t:'他自己走了出去', fin:1, img:'/packageShujianhu/assets/shujianhu/node_fin_surrender.jpg',
    d:'顾璨看了你很久，然后自己推开门，走出去，跪在了三十七户面前。\n他跪下去的时候，你想起泥瓶巷那年他被人按在地上打，也是这副倔样子。',
    ch2:[
      { txt:'陪他一起跪下去', note:'他的账，你认一半', key:'sur_together',
        eff:{ li:10, qing:14, dao:8, knot:4 }, npc:{ gucan:20, zhongs:14, shuyuan:6 } },
      { txt:'让他自己跪。你在门口等', note:'这一步，他得一个人走完', key:'sur_wait',
        eff:{ li:12, dao:6, qing:-4 }, npc:{ gucan:6, zhongs:10, shuyuan:10 } },
      { txt:'嘴上让他去，暗中安排他逃', note:'道理讲完了，人心还软着', key:'sur_lie',
        eff:{ qing:14, li:-14, knot:16, hope:-8 }, npc:{ gucan:16, zhongs:-20, shuyuan:-12 } }
    ]},
  fin_blood:{ ch:'四 · 了断', t:'剑已经出鞘', fin:1, img:'/packageShujianhu/assets/shujianhu/node_fin_blood.jpg',
    d:'你拔剑了。第一剑下去，湖上的风就变了味。\n顾璨跟在你身后，一边杀人一边笑，笑得比哭难看。',
    ch2:[
      { txt:'一路杀出去，谁拦谁死', note:'杀干净了，也把自己杀空了', key:'blood_all',
        eff:{ knot:20, li:-18, hope:-20, qing:12 }, npc:{ gucan:20, zhongs:-28, shuyuan:-24, liulao:-14 } },
      { txt:'只杀首恶，余者不问', note:'剑要有准头，也得有分寸', key:'blood_chief',
        eff:{ li:8, knot:8, hope:4, qing:6 }, npc:{ gucan:12, zhongs:4, liulao:6 }, req:{ li:55 } },
      { txt:'杀到一半，停手', note:'停在最难停的时候', key:'blood_half',
        eff:{ knot:14, li:2, hope:-8, dao:4 }, npc:{ gucan:8, zhongs:-8, shuyuan:-4 } }
    ]},
  fin_court:{ ch:'四 · 了断', t:'书院的文书', fin:1, img:'/packageShujianhu/assets/shujianhu/node_fin_court.jpg',
    d:'书院的使者展开文书，一条一条念。每一条都是顾璨做过的。\n念到第三十七条时，天已经黑了。',
    ch2:[
      { txt:'为他求情', note:'求情不是脱罪，是让人知道他也是人', key:'court_plea',
        eff:{ qing:14, li:-4, dao:4 }, npc:{ gucan:14, shuyuan:-6, zhongs:-6 } },
      { txt:'一言不发', note:'沉默最安全，也最凉', key:'court_silent',
        eff:{ li:6, qing:-8, knot:8 }, npc:{ gucan:-14, shuyuan:6 } },
      { txt:'请从严', note:'把自己那一刀也砍下去', key:'court_hard',
        eff:{ li:18, qing:-20, dao:4, knot:6 }, npc:{ gucan:-24, mother:-20, zhongs:16, shuyuan:16 } }
    ]},
  fin_order:{ ch:'四 · 了断', t:'重立湖规', fin:1, img:'/packageShujianhu/assets/shujianhu/node_fin_order.jpg',
    d:'你没有杀一个人，也没有放走一个人。你把三十七户、刘老成、还有湖上所有说得上话的，都请到了一起。\n规矩是死的，人是活的。你在湖边立了一块碑，碑上第一条写着：伤人者，偿。',
    ch2:[
      { txt:'我留下三十年', note:'三十年，够不够还三十七条命', key:'order_thirty',
        eff:{ hope:22, li:12, dao:10, qing:-6, knot:4 }, npc:{ zhongs:24, liulao:14, shuyuan:12, gucan:-8 } },
      { txt:'规矩立好，交给顾璨守', note:'让他守规矩，比替他守强', key:'order_pass',
        eff:{ li:10, hope:14, dao:8, qing:8 }, npc:{ gucan:16, zhongs:12, shuyuan:8 } },
      { txt:'碑立好了，我走', note:'立法的人不必守法', key:'order_leave',
        eff:{ li:8, hope:10, dao:4, qing:-8, knot:6 }, npc:{ zhongs:10, shuyuan:6, gucan:-12 } }
    ]},
  fin_leave:{ ch:'四 · 了断', t:'走到渡口', fin:1, img:'/packageShujianhu/assets/shujianhu/node_fin_leave.jpg',
    d:'你转身走了。顾璨没有追，也没有喊。\n走到渡口的时候，天开始下雨。你忽然想起，小时候他走不动了，也是这样站在原地等你回头。',
    ch2:[
      { txt:'上了船，再没回头', note:'这一走，湖就成了心口的一块疤', key:'leave_true',
        eff:{ knot:20, li:-14, qing:-14, hope:-16, dao:-8 }, npc:{ gucan:-24, zhongs:-18, shuyuan:-12, mother:-16 } },
      { txt:'走了一半，回来了', note:'回头不丢人，丢人的是不敢回头', key:'leave_back',
        eff:{ qing:16, li:6, dao:6, knot:4 }, npc:{ gucan:18, mother:12, zhongs:4 } }
    ]}
};

/* 结局表（icon = 语义化字标，替代 S/A/B/C/D 首字母徽章） */
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

/* 存档：结局图鉴（小程序用 wx storage） */
function alSeen(){
  try { return wx.getStorageSync('jianlai_asklake') || {}; } catch(e){ return {}; }
}
function alUnlock(key){
  try {
    const s = alSeen(); s[key] = (s[key] || 0) + 1;
    wx.setStorageSync('jianlai_asklake', s);
  } catch(e){}
}

/* 逻辑 */
let AL = null;
let emit = function(){};

function alClamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
function alFlagName(f){
  return ({ cloth:'三十七件血衣', letter:'回信先生', bear:'担下因果', bow:'当众赔罪',
            threat:'以剑压人', admit:'要他认账', confront:'直言其非' })[f] || f;
}
function alReqState(a, r){
  if(!r) return { ok:true, why:'' };
  const p = [];
  if(r.li   !== undefined && a.v.li   < r.li)   p.push('理 '+a.v.li+'／'+r.li);
  if(r.qing !== undefined && a.v.qing < r.qing) p.push('情 '+a.v.qing+'／'+r.qing);
  if(r.dao  !== undefined && a.v.dao  < r.dao)  p.push('道心 '+a.v.dao+'／'+r.dao);
  if(r.npc) for(const k in r.npc){ if((a.npc[k]||0) < r.npc[k]) p.push(AL_NPCN[k]+'的心意 '+(a.npc[k]||0)+'／'+r.npc[k]); }
  if(r.res){
    if(r.res.dan   !== undefined && a.res.dan   < r.res.dan)   p.push('文胆 '+a.res.dan+'／'+r.res.dan);
    if(r.res.sword !== undefined && a.res.sword < r.res.sword) p.push('剑 '+a.res.sword+'／'+r.res.sword);
  }
  if(r.flag && !a.flags[r.flag]) p.push('缺「'+alFlagName(r.flag)+'」');
  return { ok: p.length === 0, why: p.join('　') };
}
function alApply(a, eff, npcEff){
  if(eff) for(const k in eff){
    if(k==='dan' || k==='sword') a.res[k] = alClamp(a.res[k] + eff[k], 0, 100);
    else if(a.v[k] !== undefined) a.v[k] = alClamp(a.v[k] + eff[k], 0, 100);
  }
  if(npcEff) for(const k in npcEff){ a.npc[k] = alClamp((a.npc[k]||0) + npcEff[k], -100, 100); }
}
/* 【不剧透纪律】此处原有一支 alEffText()，把「情+8 / 顾璨+8」这类数值后果
   算成标签贴在选项上（2026-08-31 已停止渲染）。函数随之删除，与 PC 端 game.js
   保持一致：玩家只需要选择，后果在提交后由叙事推进 + 心境面板变化 + 纪事揭示。
   注意 ch.note 仍会写入 trail（见下方 choose），那是「事后揭示」，属正常链路。 */
function newAskLakeState(){
  return {
    stage:'origin', node:null, origin:null,
    v:{ qing:30, li:30, dao:20, knot:0, hope:40 },
    res:{ dan:100, sword:60 },
    npc:{ gucan:0, mother:10, liulao:0, zhongs:0, shuyuan:0, ningyao:0 },
    flags:{}, trail:[], ilUsed:{}, il:null, nextNode:null, ended:false, ending:null, step:0,
    moodOpen:false, lastNote:'', reviewCh:null
  };
}
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
function alNpcRow(k, val){
  const meta = AL_NPC.filter(x=>x.k===k)[0];
  const pct = Math.round((val+100)/2);
  const col = val>=0 ? '#c9a227' : '#8d5b52';
  const right = val>=0;
  const w = Math.abs(pct-50);
  const style = (right ? 'right:50%;' : 'left:50%;') + 'width:'+w+'%;background:'+col;
  return { name: meta.n, val, style };
}
function alMeter(label, val, col){
  return { label, val, style:'width:'+val+'%;background:'+col };
}

/* 动作 */
function init(cb){ emit = cb || function(){}; }
function start(){ AL = newAskLakeState(); emitView(); }
function restart(){ AL = newAskLakeState(); emitView(); }
function openCodex(){ if(AL) AL.stage = 'codex'; emitView(); }
function back(){
  if(!AL) return;
  if(AL.ended) AL.stage = 'end';
  else if(AL.stage==='review') AL.stage = 'play';
  else if(AL.node) AL.stage = AL.il ? 'il' : 'play';
  else AL.stage = 'origin';
  emitView();
}
function pickOrigin(k){
  const a = AL;
  const o = AL_ORIGINS.filter(x=>x.k===k)[0];
  if(!o) return;
  a.origin = k;
  alApply(a, o.eff, o.npc);
  a.node = 's1'; a.stage = 'play';
  a.trail.push({ kind:'origin', t:'来路', c:o.t, note:o.tip });
  emitView();
}
function choose(i){
  const a = AL;
  if(!a || a.stage!=='play' || a.ended) return;
  const nd = AL_NODES[a.node];
  const ch = nd.ch2[i];
  if(!ch) return;
  const rs = alReqState(a, ch.req);
  if(!rs.ok) return;
  alApply(a, ch.eff, ch.npc);
  if(ch.flag) a.flags[ch.flag] = 1;
  a.trail.push({ kind:'node', t:nd.t, c:ch.txt, note:ch.note });
  a.lastNote = ch.note;
  if(nd.fin){ finish(ch.key); return; }
  if(nd.il){
    const pool = AL_INTERLUDES.filter((_,idx)=>!a.ilUsed[idx]);
    if(pool.length){
      const pick = pool[Math.floor(Math.random()*pool.length)];
      a.ilUsed[AL_INTERLUDES.indexOf(pick)] = 1;
      alApply(a, pick.eff, pick.npc);
      a.il = pick; a.stage = 'il'; a.nextNode = ch.next;
      a.trail.push({ kind:'il', t:pick.t, c:'湖上插曲', note:'不由你定' });
      emitView();
      return;
    }
  }
  alAdvanceTo(a, ch.next);
  emitView();
}
function ilNext(){
  const a = AL;
  if(!a || a.stage!=='il') return;
  const nk = a.nextNode; a.nextNode = null; a.il = null;
  alAdvanceTo(a, nk);
  if(a.stage!=='review') a.stage = 'play';
  emitView();
}

function alAdvanceTo(a, nextKey){
  const curCh = AL_NODES[a.node].ch;
  a.node = nextKey; a.step++;
  const nxtCh = AL_NODES[a.node].ch;
  if(nxtCh !== curCh){ a.reviewCh = curCh; a.stage = 'review'; }
}
function reviewNext(){ if(AL && AL.stage==='review'){ AL.stage='play'; emitView(); } }
function reviewView(a){
  const npcs = AL_NPC.map(x=>{
    const v = a.npc[x.k]||0;
    const lab = v>15 ? '亲' : (v<-15 ? '隙' : '平');
    return { name:x.n, lab, v };
  });
  return { ch:a.reviewCh, lake:alLakeLine(a), mood:alMoodLine(a), npcs };
}
function toggleMood(){ if(AL){ AL.moodOpen = !AL.moodOpen; emitView(); } }

function finish(key){
  const a = AL;
  const v = a.v;
  if(v.knot >= 70) key = 'demon';
  else if(v.dao>=75 && v.li>=60 && v.qing>=50 && v.hope>=62
        && Math.abs(v.qing-v.li)<=12 && v.knot<=20
        && (a.npc.gucan||0)>=20 && (a.npc.zhongs||0)>=20) key = 'perfect';
  const e = AL_ENDINGS[key] || AL_ENDINGS.leave_true;
  a.ended = true; a.stage = 'end';
  a.ending = { key, ...e };
  alUnlock(key);
  emitView();
}

/* 渲染快照（供 wxml 使用） */
function sideView(a){
  const v = a.v;
  const meters = [
    alMeter('情', v.qing, 'linear-gradient(90deg,#a33a2c,#d6533f)'),
    alMeter('理', v.li,   'linear-gradient(90deg,#1f5f8b,#2980b9)'),
    alMeter('道心', v.dao,'linear-gradient(90deg,#8a6d1f,#e8c66a)'),
    alMeter('众望', v.hope,'linear-gradient(90deg,#3f6b52,#6fae86)'),
    alMeter('心结', v.knot,'linear-gradient(90deg,#3a2b3d,#7a4a6b)')
  ];
  const res = [
    alMeter('文胆', a.res.dan, 'linear-gradient(90deg,#6b5a2a,#e8c66a)'),
    alMeter('剑', a.res.sword, 'linear-gradient(90deg,#4a5560,#aab7c4)')
  ];
  const npcs = AL_NPC.map(x=>alNpcRow(x.k, a.npc[x.k]||0));
  const flags = Object.keys(a.flags).map(f=>alFlagName(f));
  const trail = a.trail.slice(-3).map(t=>({ t:t.t, c:t.c, note:t.note, il: t.kind!=='node' }));
  return { meters, res, npcs, flags, trail };
}
function playView(a){
  const nd = AL_NODES[a.node];
  const total = 12;
  const prog = Math.min(100, Math.round((a.step/total)*100));
  const choices = nd.ch2.map((ch,i)=>{
    const rs = alReqState(a, ch.req);
    return { idx:i, txt:ch.txt, locked: !rs.ok, why: rs.why };
  });
  return {
    node: { ch:nd.ch, t:nd.t, d:nd.d, img:nd.img||'', lake:alLakeLine(a), mood:alMoodLine(a), prog, prevNote: a.lastNote||'' },
    choices,
    side: sideView(a),
  };
}
function endView(a){
  const e = a.ending, v = a.v;
  const meters = [
    alMeter('情', v.qing, 'linear-gradient(90deg,#a33a2c,#d6533f)'),
    alMeter('理', v.li,   'linear-gradient(90deg,#1f5f8b,#2980b9)'),
    alMeter('道心', v.dao,'linear-gradient(90deg,#8a6d1f,#e8c66a)'),
    alMeter('众望', v.hope,'linear-gradient(90deg,#3f6b52,#6fae86)'),
    alMeter('心结', v.knot,'linear-gradient(90deg,#3a2b3d,#7a4a6b)')
  ];
  const npcs = AL_NPC.map(x=>alNpcRow(x.k, a.npc[x.k]||0));
  const trail = a.trail.map((t,i)=>({ i:i+1, t:t.t, c:t.c, note:t.note, il: t.kind!=='node' }));
  const o = AL_ORIGINS.filter(x=>x.k===a.origin)[0];
  return {
    ending: {
      key:a.ending && a.ending.key, ico:alEndIcoPath(a.ending && a.ending.key),
      icon:e.icon, g:e.g, gt:(e.g==='S+'?'sp':e.g), title:e.t, desc:e.d, poem:e.poem,
      meters, npcs, trail, origin:o ? o.t : '—'
    }
  };
}
function alEndIcoPath(k){ return k ? ('/assets/icon/end-' + k + '.svg') : ''; }
function codexView(){
  const seen = alSeen();
  const list = Object.keys(AL_ENDINGS).map(k=>({
    key:k, ico:alEndIcoPath(k), icon:AL_ENDINGS[k].icon, g:AL_ENDINGS[k].g, gt:(AL_ENDINGS[k].g==='S+'?'sp':AL_ENDINGS[k].g),
    t:AL_ENDINGS[k].t, seen:!!seen[k],
    d:seen[k] ? AL_ENDINGS[k].d : '？？？',
    poem:seen[k] ? AL_ENDINGS[k].poem : ''
  }));
  return list;
}
function view(){
  const a = AL;
  if(!a) return { stage:'origin', total: AL_TOTAL, seen: Object.keys(alSeen()).length };
  const base = { stage:a.stage, total: AL_TOTAL, seen: Object.keys(alSeen()).length, step:a.step, origin:a.origin, moodOpen:a.moodOpen };
  if(a.stage==='origin') return Object.assign(base, { origins: AL_ORIGINS.map(o=>({ k:o.k, t:o.t, mark:o.mark, d:o.d, tip:o.tip })) });
  if(a.stage==='codex')  return Object.assign(base, { codex: codexView() });
  if(a.stage==='il')      return Object.assign(base, { il:{ t:a.il.t, d:a.il.d, img:a.il.img } });
  if(a.stage==='review')  return Object.assign(base, reviewView(a));
  if(a.stage==='end')     return Object.assign(base, endView(a));
  return Object.assign(base, playView(a));
}
function emitView(){ emit(view()); }

module.exports = {
  init, start, restart, openCodex, back, pickOrigin, choose, ilNext, toggleMood, reviewNext,
  AL_TOTAL, getState(){ return AL; }
};
