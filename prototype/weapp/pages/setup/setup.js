const D = require('../../utils/data.js');
const Engine = require('../../utils/engine.js');

const TIP = {
  ai: '选 1 名自己的角色，天意为你撮合对手。',
  hot: '选择 2–5 名角色同席对战，轮流传机。',
  siege: '选择 1–2 名守城之人。蛮荒天下将分五波叩关，每波退敌可回气补牌。',
  boss: '选择 2–3 名讨伐之人，联手围攻一名巨寇。第 4 轮起巨寇威压渐盛。',
};

Page({
  data: {
    mode: 'ai', metaTitle: '', minPick: 1, maxPick: 5, tip: '',
    facs: [], filter: '全部', q: '',
    list: [], view: [], sel: [], aiCount: 2, canStart: false,
    pickFxOn: false, pickNames: [],   // 随机择主中转过场
  },
  onLoad(query){
    const mode = query.mode || 'ai';
    const meta = D.MODE_META[mode] || D.MODE_META.hot;
    const facs = ['全部'].concat(Object.keys(D.FACTIONS));
    const list = Object.keys(D.CHARS).map(k=>{
      const c = D.CHARS[k];
      const col = D.FACTIONS[c.faction] || '#999';
      const parsed = D.parseSkills(c.txt);
      return {
        key: k, name: c.name, faction: c.faction, col,
        art: D.artUrl(k), initial: c.name.charAt(0),
        hp: c.hp, realm: c.realm, flagship: !!c.flagship, talent: c.talent || '',
        sk1: parsed[0] ? parsed[0].name : '', sk2: parsed[1] ? parsed[1].name : '',
        selected: false,
      };
    });
    this.setData({
      mode, metaTitle: meta.title, minPick: meta.minPick, maxPick: meta.maxPick,
      tip: TIP[mode] || '', facs, list, view: list,
    });
  },
  onShow(){
    // 从对战页返回时清掉中转过场残留（页面栈保留，data 不会自动重置）
    if(this.data.pickFxOn) this.setData({ pickFxOn: false, pickNames: [] });
  },
  applyFilter(){
    const { filter, q, list } = this.data;
    const kw = (q || '').trim();
    const view = list.filter(it=>{
      if(filter !== '全部' && it.faction !== filter) return false;
      if(kw && it.name.indexOf(kw) < 0 && it.key.indexOf(kw) < 0) return false;
      return true;
    });
    this.setData({ view });
  },
  setFilter(e){
    this.setData({ filter: e.currentTarget.dataset.f });
    this.applyFilter();
  },
  onSearch(e){
    this.setData({ q: e.detail.value });
    this.applyFilter();
  },
  toggleSelect(e){
    const key = e.currentTarget.dataset.key;
    const list = this.data.list;
    const it = list.find(x => x.key === key);
    if(!it) return;
    const sel = this.data.sel;
    const i = sel.indexOf(key);
    if(i >= 0){ sel.splice(i,1); it.selected = false; }
    else if(sel.length < this.data.maxPick){ sel.push(key); it.selected = true; }
    this.setData({ list, sel, canStart: sel.length >= this.data.minPick });
    this.applyFilter();
  },
  removeSel(e){
    this.toggleSelect({ currentTarget: { dataset: { key: e.currentTarget.dataset.key } } });
  },
  changeAi(e){
    this.setData({ aiCount: Number(e.currentTarget.dataset.n) });
  },
  randomPick(){
    // 与 PC 端 randomPick 对齐：选满 maxPick 后播中转过场，再 start() 进场。
    if(this.data.sel.length >= this.data.maxPick) return;
    const tick = () => {
      const sel = this.data.sel;
      if(sel.length >= this.data.maxPick){
        // 选满：先播「择主」过场（暗幕→剑光→大字→角色名→落印），再进场
        setTimeout(()=>this._showPickFx(()=>this.start()), 220);
        return;
      }
      const pool = this.data.view.filter(it => !it.selected);
      if(!pool.length){ setTimeout(()=>this._showPickFx(()=>this.start()), 220); return; }
      const pick = pool[Math.floor(Math.random() * pool.length)];
      this.toggleSelect({ currentTarget: { dataset: { key: pick.key } } });
      // 每选一个间隔 320ms，给页面一个"飞转落定"的视觉节奏
      setTimeout(tick, 320);
    };
    tick();
  },
  /* 随机择主中转过场：展示抽中角色名，1.7s 后回调进场 */
  _showPickFx(done){
    const names = this.data.sel.map(k=>{
      const it = this.data.list.find(x=>x.key===k);
      return it ? it.name : k;
    });
    this.setData({ pickFxOn: true, pickNames: names });
    clearTimeout(this._t_pick);
    // 过场总时长：剑光 .9s + 落印 .95s+.55s ≈ 1.5s，留 .2s 余韵
    this._t_pick = setTimeout(()=>{ done && done(); }, 1700);
  },
  start(){
    const sel = this.data.sel;
    if(sel.length < this.data.minPick) return;
    let keys = sel.slice(0, this.data.maxPick);
    if(this.data.mode === 'ai'){
      const opps = Engine.pickOpponents(keys[0], this.data.aiCount);
      keys = [keys[0]].concat(opps);
    }
    getApp().globalData.pendingGame = { keys, mode: this.data.mode };
    wx.navigateTo({ url: '/pages/game/game' });
  },
  back(){ wx.navigateBack(); }
});
