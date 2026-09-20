/* 开场立绘：主包 assets/opening · 单页叠合，衔接不闪 */
const OP_PORTRAITS = [
  '/assets/opening/chenpingan.jpg','/assets/opening/ningyao.jpg',
  '/assets/opening/qijingchun.jpg','/assets/opening/aliang.jpg',
  '/assets/opening/chenqingdu.jpg','/assets/opening/daozu.jpg',
  '/assets/opening/lisan.jpg','/assets/opening/miyu.jpg',
  '/assets/opening/baiye.jpg','/assets/opening/caoci.jpg',
  '/assets/opening/baize.jpg','/assets/opening/zhoumi.jpg',
  '/assets/opening/崔瀺.jpg','/assets/opening/左右.jpg',
  '/assets/opening/老秀才.jpg','/assets/opening/至圣先师.jpg',
  '/assets/opening/裴钱.jpg','/assets/opening/刘羡阳.jpg',
  '/assets/opening/魏檗.jpg','/assets/opening/马苦玄.jpg',
  '/assets/opening/阮秀.jpg','/assets/opening/顾璨.jpg',
  '/assets/opening/刘灞桥.jpg','/assets/opening/崔东山.jpg'
];

Page({
  data: {
    opShow: true,
    logoLevel: 0,
    logoClass: 'lv0',
    /* 叠页栈：后一张落下时前一张仍在，落稳后再合走 */
    opPages: [],
    opFin: false,
    opEnter: false,
    opFlash: ''
  },
  _timers: [],
  _uid: 0,

  noop() {},
  _clear() { (this._timers || []).forEach(clearTimeout); this._timers = []; },
  _later(fn, ms) { this._timers.push(setTimeout(fn, ms)); },

  _lv(n) {
    const steps = [0, 0.5, 1, 1.6, 2.2, 2.8, 3.4, 4, 4.6, 5];
    let pick = steps[0], best = 99;
    steps.forEach(s => {
      const d = Math.abs(s - n);
      if (d < best) { best = d; pick = s; }
    });
    return 'lv' + String(pick).replace('.', '-');
  },
  _at(i) {
    return OP_PORTRAITS[((i % OP_PORTRAITS.length) + OP_PORTRAITS.length) % OP_PORTRAITS.length];
  },

  /* 纯合页：新页在下停稳；旧页左缘固定、右缘向后转走。
     同步推进底层/上层「剑来」清晰度——每次合页都升一档 */
  _handoff(src, logoLevel) {
    const id = ++this._uid;
    const under = this.data.opPages.filter(p => p.anim === 'rest' || p.anim === 'drop');

    // 合页一开始就把剑来调到本档（可见地变清）
    const stack = [
      { id: id, src: src, anim: 'rest', z: 10 }
    ].concat(
      under.map(p => ({ id: p.id, src: p.src, anim: 'close', z: 20 }))
    );

    this.setData({
      opPages: stack,
      logoLevel: logoLevel,
      logoClass: this._lv(logoLevel)
    });

    // 合页过程中再抬半档，强化「逐渐清晰」
    this._later(() => {
      const lv = Math.min(5, logoLevel + 0.5);
      this.setData({ logoLevel: lv, logoClass: this._lv(lv) });
    }, 280);

    // 旧页合完 → 只留新页
    this._later(() => {
      this.setData({
        opPages: [{ id: id, src: src, anim: 'rest', z: 10 }]
      });
    }, 600);
  },

  play() {
    this._clear();
    this._uid = 0;
    const first = this._at(0);
    this.setData({
      opShow: true,
      logoLevel: 0,
      logoClass: 'lv0',
      opPages: [{ id: 0, src: first, anim: 'drop', z: 10 }],
      opFin: false,
      opEnter: false,
      opFlash: ''
    });

    /* 每合一页，剑来清晰度上一档（0 → 5） */
    const seq = [
      { t: 700,  art: 1,  lv: 0.6 },
      { t: 1400, art: 4,  lv: 1.2 },
      { t: 2100, art: 2,  lv: 1.8 },
      { t: 2800, art: 5,  lv: 2.4 },
      { t: 3500, art: 3,  lv: 3.0 },
      { t: 4200, art: 12, lv: 3.6 },
      { t: 4900, art: 22, lv: 4.2 },
      { t: 5600, art: 0,  lv: 4.7 }
    ];
    seq.forEach(s => {
      this._later(() => this._handoff(this._at(s.art), s.lv), s.t);
    });

    this._later(() => this._finale(), 6350);
  },

  _finale() {
    const list = this.data.opPages.slice();
    const closed = list.map(p => ({ id: p.id, src: p.src, anim: 'close', z: 20 }));
    this.setData({
      opPages: closed,
      logoLevel: 5,
      logoClass: 'lv5',
      opFlash: 'on',
      opFin: true
    });
    this._later(() => this.setData({ opPages: [], opFlash: '' }), 600);
    this._later(() => this.setData({ opEnter: true }), 320);
  },

  opEnter() {
    if (!this.data.opEnter) return;
    this.setData({ opShow: false });
  },

  goMode(e) {
    wx.navigateTo({ url: '/packageArt/pages/setup/setup?mode=' + e.currentTarget.dataset.mode });
  },
  goCodex() { wx.navigateTo({ url: '/packageArt/pages/codex/codex' }); },
  goTales() { wx.navigateTo({ url: '/packageArt/pages/codex/codex?mode=tales' }); },
  goWsp() { wx.navigateTo({ url: '/packageArt/pages/wushipai/wushipai' }); },
  goFulu() { wx.navigateTo({ url: '/packageFulu/pages/fulu/fulu' }); },
  goBaofu() { wx.navigateTo({ url: '/packageRef/pages/baofu/baofu' }); },
  goProfile() { wx.navigateTo({ url: '/packageRef/pages/profile/profile' }); },
  goMap() { wx.navigateTo({ url: '/packageMap/pages/map/map' }); },
  goAskLake() { wx.navigateTo({ url: '/pages/asklake/asklake' }); },
  goLongque() { wx.navigateTo({ url: '/packageLongque/pages/longque/longque' }); },
  goSect() { wx.navigateTo({ url: '/packageArt/pages/sect/sect?diff=normal' }); },
  goShenci() { wx.navigateTo({ url: '/packageShui/pages/shenci/shenci' }); },

  onLoad() { this.play(); },
  onUnload() { this._clear(); }
});
