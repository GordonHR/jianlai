/* ============================================================================
 * 符箓图鉴 · 据《剑来》原著与古法符箓体例
 * ----------------------------------------------------------------------------
 * 数据纪律（贴原著铁律）：
 *   - desc（功效）、caster（施法者/来历）、src（出处）均源自《剑来》原著明载，
 *     已联网核对《丹书真迹》所载、割鹿山阵师秘籍、刘景龙传授、钟魁代笔等段落。
 *   - 图形（img）为「据古法符箓体例（云篆·符头符胆符脚·朱砂）立意重构」，
 *     原著只给符名与功效、并未实绘符形，故图形标 src:'游戏原创·符箓体例'，
 *     不得当作「原著实绘」呈现。
 * 双端：PC 端本文件含 img；微信端 pages/fulu/fulu.js 复用同一份 FULU（纯文字）。
 * ========================================================================== */

const FULU = [
  { id:'suodi', name:'缩地符', alias:'方寸符', type:'山水·移动',
    desc:'缩地成寸，一步踏出可去方圆十丈内的任意一处。陈平安离乡远游途中常备，用以应急脱身或抢身位。',
    caster:'陈平安自《丹书真迹》所习，南下游历时写就二三张防身',
    src:'原著·《丹书真迹》载（最普通范畴，作符箓流派典型录入）' },

  { id:'tiaodeng', name:'阳气挑灯符', alias:'', type:'山水·破障',
    desc:'山水破障符之一种。置身乱葬岗、古遗址，若再遇鬼打墙，可随符顺利走出迷障；亦能确定周边山水是否有厉鬼邪祟，用以趋吉避凶。',
    caster:'陈平安自《丹书真迹》所习；夜幕翻山越岭时常祭出',
    src:'原著·《丹书真迹》（阳气挑灯符属山水破障符）' },

  { id:'taoba', name:'宝塔镇妖符', alias:'', type:'攻击·拘押',
    desc:'杀力较大的一类符箓。符纸一出，凭空现一座玲珑宝塔，将妖邪暂时拘押其中，内蕴雷霆之威，可鞭打魂魄。',
    caster:'陈平安自《丹书真迹》所习，对敌问拳厮杀时祭出',
    src:'原著·《丹书真迹》载（宝塔镇妖符，内蕴雷霆）' },

  { id:'pozhang', name:'破障符', alias:'', type:'山水·破障',
    desc:'山水符之一种，专破鬼打墙一类迷障。林守一曾驾驭一张，引领众人走出"黄泉路"上的险境。',
    caster:'林守一（山水符）；天下符箓一脉的入门符',
    src:'原著·山水符·林守一驾驭破障符引领众人' },

  { id:'jingxin', name:'静心安宁符', alias:'', type:'辅助·凝神',
    desc:'用以凝神静气。陈平安在地下河走龙道渡船上练拳时，常写一张静心安宁符，与祛秽涤尘符同备。',
    caster:'陈平安自《丹书真迹》前几页所习',
    src:'原著·《丹书真迹》前几页（静心安宁符）' },

  { id:'quhui', name:'祛秽涤尘符', alias:'', type:'辅助·涤尘',
    desc:'涤尘去秽，与静心安宁符同列《丹书真迹》前几页，作远游随身之备。',
    caster:'陈平安自《丹书真迹》前几页所习',
    src:'原著·《丹书真迹》前几页（祛秽涤尘符）' },

  { id:'shanhe', name:'山河剑敕符', alias:'', type:'攻击·道教坛符',
    desc:'道教坛符之一。陈平安跻身武夫炼气境后便能画出，虽仍属《丹书真迹》下品，但按书中所载很是神异，用处颇多。',
    caster:'陈平安炼气境后可读可画（《丹书真迹》下品符箓）',
    src:'原著·《丹书真迹》下品·山河剑敕符' },

  { id:'qiuyu', name:'求雨符', alias:'', type:'天气·道教坛符',
    desc:'道教坛符之一，可使"天地晦冥，大雨流淹"。陈平安于余荫山房镇妖楼内，梧桐叶幻象天地中旱灾严重，为祈雨首次祭出。',
    caster:'陈平安炼气境后所习；余荫山房首次祭出祈雨',
    src:'原著·《丹书真迹》下品·求雨符（余荫山房镇妖楼）' },

  { id:'shaosha', name:'起火烧煞符', alias:'', type:'辅助·感知',
    desc:'最为寻常、广为流传，最能感知煞气存在。一张黄纸符往手心一贴默念咒语便轰然燃烧化灰，用以勘验宅院阴煞。',
    caster:'年轻道人张山所用；不入流品，一枚雪花钱近三十余张',
    src:'原著·张山所用·起火烧煞符（感知煞气）' },

  { id:'tingsi', name:'天部霆司符', alias:'', type:'攻击·雷法旁门',
    desc:'脱胎于雷法正宗的旁门，杀伐极大。陈平安自第一拨割鹿山刺客中那位阵师的秘籍学得，用来对阵厮杀。',
    caster:'割鹿山阵师秘籍（陈平安自野修处贩得）',
    src:'原著·割鹿山阵师秘籍·天部霆司符' },

  { id:'daliu', name:'大江横流符', alias:'', type:'攻击·血战',
    desc:'用在鲜血如湖泊江河的战场上，恰到好处。同出割鹿山阵师秘籍，陈平安于战场上祭出。',
    caster:'割鹿山阵师秘籍（陈平安自野修处贩得）',
    src:'原著·割鹿山阵师秘籍·大江横流符' },

  { id:'cuorang', name:'撮壤符', alias:'', type:'防御·地形',
    desc:'平地起山脉，用以阻滞妖族大军前行，符出山起，十分玄妙。同出割鹿山阵师秘籍。',
    caster:'割鹿山阵师秘籍（陈平安自野修处贩得）',
    src:'原著·割鹿山阵师秘籍·撮壤符' },

  { id:'luzhen', name:'白泽路引符', alias:'路引符', type:'山水·破障',
    desc:'破障符之一种，既能让活人过关通行，战场上亦可令敌人走上黄泉路。陈平安于剑气长城城头摆摊推销，称"某位大剑仙醉酒后所传"。',
    caster:'刘景龙传授（原著第651集作"齐景龙"，存异文）；陈平安摆摊所售',
    src:'原著·刘景龙传授·白泽路引符（存异文：第651集作齐景龙）' },

  { id:'guoqiao', name:'剑气过桥符', alias:'', type:'山水·破障',
    desc:'破障符之一种，剑气过桥，守心拦不住。破开山水迷障的同时更有无形震慑。陈平安于剑气长城城头摆摊推销。',
    caster:'刘景龙传授（原著第651集作"齐景龙"，存异文）；陈平安摆摊所售',
    src:'原著·刘景龙传授·剑气过桥符（存异文：第651集作齐景龙）' },

  { id:'bingfu', name:'三才兵符', alias:'铁骑绕城符', type:'攻击·结阵',
    desc:'可结阵之符。钟魁借小雪锥所写三张，符纸上有披挂银甲、身骑白马的百余骑武将冲锋而出，最终排布成符箓图案。陈平安以之对埋河水妖，列阵在前。',
    caster:'钟魁代笔（碧游府，借小雪锥，一口浩然气写就）',
    src:'原著·钟魁代笔·三才兵符（铁骑绕城符）' },

  { id:'wulei', name:'五雷正法符', alias:'', type:'攻击·雷法',
    desc:'龙虎山天师府雷法正符。钟魁应陈平安之请，以金色材质符纸写就，上山下水防鬼打墙。',
    caster:'钟魁代笔（应陈平安之请，龙虎山天师府五雷正法）',
    src:'原著·钟魁代笔·五雷正法符（龙虎山天师府）' },

  { id:'zhenjian', name:'镇剑符', alias:'', type:'攻击·镇剑',
    desc:'品秩、威势远远超出井字符，钟魁誉之"投袂剑起，九洲海沸"。钟魁应陈平安之请写就，用于对抗埋河水妖。',
    caster:'钟魁代笔（应陈平安之请，圣人文稿青色符纸写就）',
    src:'原著·钟魁代笔·镇剑符（"投袂剑起，九洲海沸"）' }
];

/* 符箓体系说明（原著明载，非单条符箓，作图鉴卷首） */
const FULU_SYS = {
  danShu: '画符即"写丹书"，分九品：上五境练气士写一二三"三上品"丹书，中五境写四五六"中三品"，下五境写七八九"下三品"。陈平安非练气士，靠十八停剑气运转的"一口气"一气呵成，也只能写最粗浅的入门符。',
  fuZhi: '符纸材质各异：下五境入门用黄玺符纸；另有金色材质符纸、圣人文稿青色符纸。李希圣曾在竹楼墙壁写"字"、字成符成，属极高造诣；并赠陈平安"风雪小锥"笔，呵一口气即可润开笔锥，紧急画符无需朱漆印泥。',
  fuDan: '符有"符胆"，灵气流散快慢定品秩。修士画符先天"封山"，符胆灵气流散极慢；武夫画符秉持一口纯粹真气，却"开山无法封山"，符不长久——好处是不耗气府灵气，且画符本身即是淬炼真气的修行。',
  note: '图形据古法符箓体例（云篆线条·符头符胆符脚·朱砂）立意重构，原著只传符名与功效、未实绘符形，故图样不作"原著实绘"。'
};

/* ------- 渲染（PC 端，与 codex/tales 平行，纯阅览） ------- */
function renderFulu(app){
  const sel = state.selFulu || null;
  if(sel){
    const f = FULU.find(x => x.id === sel);
    if(f){
      let html = '<div class="codex-head"><h1>'+f.name+(f.alias?' · '+f.alias:'')+'</h1>'
        + '<span class="codex-stat">'+f.type+'</span></div>';
      html += '<button class="btn ghost" style="margin:8px 0 16px" onclick="state.selFulu=null;render()">← 返回图鉴</button>';
      html += '<div class="fulu-detail">';
      html += '  <div class="fulu-art"><img src="assets/fulu/'+f.id+'.jpg" alt="'+f.name+'" '
        + 'onerror="this.style.display=\'none\'" /></div>';
      html += '  <div class="fulu-info">';
      html += '    <p class="fulu-row"><b>功效</b>'+f.desc+'</p>';
      html += '    <p class="fulu-row"><b>来历</b>'+f.caster+'</p>';
      html += '    <p class="fulu-row fulu-src"><b>出处</b><span>'+f.src+'</span></p>';
      html += '    <p class="fulu-row fulu-graph"><b>图样</b><span>'+FULU_SYS.note+'</span></p>';
      html += '  </div>';
      html += '</div>';
      app.innerHTML = html;
      return;
    }
  }
  let html = '<div class="codex-head"><h1>符 箓 图 鉴</h1>'
    + '<span class="codex-stat">原著符箓 · 共 <b>'+FULU.length+'</b> 种</span></div>';
  html += '<button class="btn ghost" style="margin:8px 0 14px" onclick="state={phase:\'title\',sel:[],log:[]};render()">返回卷首</button>';
  html += '<div class="fulu-sys">'
    + '<div class="fulu-sys-h">符 箓 体 系（据《丹书真迹》与各家传授）</div>'
    + '<p><b>写丹书 · 九品</b>'+FULU_SYS.danShu+'</p>'
    + '<p><b>符纸与笔</b>'+FULU_SYS.fuZhi+'</p>'
    + '<p><b>符胆 · 封山开山</b>'+FULU_SYS.fuDan+'</p>'
    + '<p class="fulu-sys-note">'+FULU_SYS.note+'</p>'
    + '</div>';
  html += '<div class="fulu-grid">';
  FULU.forEach(f => {
    html += '<div class="fulu-card" onclick="state.selFulu=\''+f.id+'\';render()">'
      + '  <div class="fulu-thumb"><img src="assets/fulu/'+f.id+'.jpg" alt="'+f.name+'" '
      + 'onerror="this.parentNode.classList.add(\'noimg\');this.remove()" /></div>'
      + '  <div class="fulu-cap">'+f.name+(f.alias?'<span class="fulu-alias">'+f.alias+'</span>':'')+'</div>'
      + '  <div class="fulu-type">'+f.type+'</div>'
      + '</div>';
  });
  html += '</div>';
  app.innerHTML = html;
}
