/* 分包内引主包公共代码必须用相对路径：绝对路径 require('/utils/..') 真机解析失败会整页空白 */
const D = require('../../../utils/data.js');
const BRIEFS = require('../../../utils/briefs.js');
const TALES = require('../../../utils/tales.js');

/* 原著三栏容错：字段缺失 / 非数组 / 空串 一律收敛为 []，WXML 侧据此整栏不渲染 */
function _arr(v){ return (Array.isArray(v) ? v : []).filter(s=>!!s); }

Page({
  data: {
    tab: 'chars',          // chars | tales（由入口决定，不再页内切换）
    groups: [],
    sel: null,
    tales: TALES,
    selTale: null,
    lastNote: '',
    collapsed: false,      // 详情滚动折叠：false=立绘全屏态 true=顶部小头像条态
  },
  onLoad(options){
    const mode = (options && options.mode==='tales') ? 'tales' : 'chars';
    /* 顶部导航栏标题跟随入口（页内不再重复大标题） */
    wx.setNavigationBarTitle({ title: mode==='tales' ? '戏里戏外' : '人物志' });
    const FACTIONS = D.FACTIONS;
    /* 阵营次序（贴合原著辈分/地位）：儒家（中土文庙）置首 */
    const FAC_ORDER = ['中土文庙','剑气长城','青冥天下','莲花天下','蛮荒天下','散修'];
    const FAC_HEAD = {
      '中土文庙': ['至圣先师','礼圣','亚圣','老秀才','齐静春'],
      '剑气长城': ['陈清都','持剑者'],
      '青冥天下': ['道祖'],
      '莲花天下': ['佛祖'],
      '蛮荒天下': ['周密','托月山大祖'],
      '散修':     ['陈平安'],
    };
    const map = {};
    for(const key of Object.keys(D.CHARS)){
      const c = D.CHARS[key];
      const f = c.faction;
      if(!map[f]) map[f] = { faction:f, col:FACTIONS[f]||'#999', list:[] };
      map[f].list.push({
        key, name:c.name, realm:c.realm, col:FACTIONS[f]||'#999',
        art: D.artUrl(key), skills:(c.skills||[]).length,
      });
    }
    /* 阵营内：核心人物置顶，其余保持原序 */
    Object.keys(map).forEach(f=>{
      const head = FAC_HEAD[f] || [];
      map[f].list.sort((a,b)=>{
        const ia = head.indexOf(a.name), ib = head.indexOf(b.name);
        if(ia!==ib) return (ia<0?999:ia)-(ib<0?999:ib);
        return 0;
      });
    });
    const groups = Object.keys(map)
      .sort((a,b)=>FAC_ORDER.indexOf(a)-FAC_ORDER.indexOf(b))
      .map(f=>map[f]);
    this.setData({ groups, tab:mode });
    /* 折叠阈值 = 立绘高(60vh) × 0.5：滑过一半立绘即收成顶部小条 */
    try{
      const info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
      this._collapsePx = (info.windowHeight || info.screenHeight || 667) * 0.3;
    }catch(err){ this._collapsePx = 200; }
  },
  open(e){
    const key = e.currentTarget.dataset.key;
    const c = D.CHARS[key];
    const b = BRIEFS[key] || {};
    const detail = {
      key, name:c.name, faction:c.faction, col:D.FACTIONS[c.faction]||'#999',
      art: D.artUrl(key), realm:c.realm, hp:c.hp,
      pos:b.pos||'', intro:b.intro||'', tags:b.tags||[],
      sect:b.sect||'',
      /* 场景：正文与原话皆空者整条剔除，避免只剩标题的空壳（与 PC 端 scenes 过滤保持一致） */
      scenes:(b.scenes||[]).map(s=>({ t:s.t, d:s.d, q:s.q||'' })).filter(s=>String(s.d||'').trim()||String(s.q||'').trim()),
      quotes:b.quotes||[], rel:b.rel||{}, verdict:b.verdict||'',
      /* 原著三栏：形貌 / 衣着 / 性情 —— 无内容即空数组，WXML 侧整栏不渲染（不留空标题） */
      look:_arr(b.look), dress:_arr(b.dress), temper:_arr(b.temper),
      /* 人物关系：对象转数组（WXML 无 v-html，且对象遍历难以嵌套渲染），与 PC 端 .rel-group 分组标签视觉一致 */
      relList: Object.keys(b.rel||{}).map(k=>({ label:k, list:(b.rel[k]||[]).map(n=>({ n })) })),
      skills:c.skills||[],
    };
    this.setData({ sel:detail });
  },
  openTale(e){
    const id = e.currentTarget.dataset.id;
    const t = TALES.find(x=>x.id===id) || null;
    this.setData({ selTale:t });
  },
  noop(){},
  close(){ this.setData({ sel:null, selTale:null, collapsed:false }); },
  /* 自定义导航后的列表态返回：优先出栈，栈空兜底回标题页 */
  back(){
    wx.navigateBack({ delta:1, fail:()=>{ wx.reLaunch({ url:'/pages/title/title' }); } });
  },
  /* 详情滚动折叠：滑过约半个立绘高度后固定成顶部小头像条。
     仅在布尔值跨越阈值时 setData（非逐帧），避免滚动 setData 抖动。 */
  onScroll(e){
    if(!this._collapsePx) return;
    const c = e.detail.scrollTop > this._collapsePx;
    if(c !== this.data.collapsed) this.setData({ collapsed:c });
  }
});
