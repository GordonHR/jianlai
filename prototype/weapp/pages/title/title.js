/* 开场：单张大图
   近背剑少年 → 拉开全景 → 一眼剑气长城 → 推回少年 → 衣摆等 → 落款 */
Page({
  data: {
    opShow: true,
    phase: 'camIn',
    enterOn: false
  },
  _timers: [],
  noop() {},
  _clear() { (this._timers || []).forEach(clearTimeout); this._timers = []; },
  _later(fn, ms) { this._timers.push(setTimeout(fn, ms)); },

  play() {
    this._clear();
    this.setData({ opShow: true, phase: 'camIn', enterOn: false });
    // 中景少年 → 缓拉全景（长城自然在画面里）→ 停一拍 → 缓推回 → 动效 → 落款
    this._later(() => this.setData({ phase: 'camOut' }), 600);
    this._later(() => this.setData({ phase: 'camHold' }), 3200);
    this._later(() => this.setData({ phase: 'camPush' }), 4200);
    this._later(() => this.setData({ phase: 'youthFx' }), 6200);
    this._later(() => this.setData({ phase: 'title' }), 7400);
    this._later(() => this.setData({ enterOn: true, phase: 'done' }), 8200);
  },

  opEnter() {
    if (!this.data.enterOn) return;
    this.setData({ opShow: false });
  },

  goMode(e) {
    wx.navigateTo({ url: '/packageArt/pages/setup/setup?mode=' + e.currentTarget.dataset.mode });
  },
  goCodex() { wx.navigateTo({ url: '/packageArt/pages/codex/codex' }); },
  /* 戏里戏外配图独立分包 packageTales；packageArt/codex 保留人物志 */
  goTales() { wx.navigateTo({ url: '/packageTales/pages/tales/tales' }); },
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
