/* 开场：单张大图
   ① 更近锁人 → ② 匀速拉远（整幅 scale↓）→ ③ 极限停住，不再放大 → 题字
   filmOut 3.5s linear，与 title.wxss 对齐；无推回放大 */
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
    // 更近锁人稍停 → 匀速拉远 3.5s → 极限 hold（不再推近）→ 微效 → 题字/按钮
    this._later(() => this.setData({ phase: 'camOut' }), 700);
    this._later(() => this.setData({ phase: 'camHold' }), 4200);
    this._later(() => this.setData({ phase: 'youthFx' }), 4600);
    this._later(() => this.setData({ phase: 'title' }), 5200);
    this._later(() => this.setData({ enterOn: true, phase: 'done' }), 6000);
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
