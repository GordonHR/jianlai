Page({
  data: {},
  goMode(e){
    const mode = e.currentTarget.dataset.mode;
    wx.navigateTo({ url: '/packageArt/pages/setup/setup?mode=' + mode });
  },
  goCodex(){ wx.navigateTo({ url: '/packageArt/pages/codex/codex' }); },
  goTales(){ wx.navigateTo({ url: '/packageArt/pages/codex/codex?mode=tales' }); },
  goWsp(){ wx.navigateTo({ url: '/packageArt/pages/wushipai/wushipai' }); },
  goFulu(){ wx.navigateTo({ url: '/packageFulu/pages/fulu/fulu' }); },
  goBaofu(){ wx.navigateTo({ url: '/packageRef/pages/baofu/baofu' }); },
  goProfile(){ wx.navigateTo({ url: '/packageRef/pages/profile/profile' }); },
  goMap(){ wx.navigateTo({ url: '/packageMap/pages/map/map' }); },
  goAskLake(){ wx.navigateTo({ url: '/pages/asklake/asklake' }); },
  goLongque(){ wx.navigateTo({ url: '/packageLongque/pages/longque/longque' }); },
  goSect(){ wx.navigateTo({ url: '/packageArt/pages/sect/sect?diff=normal' }); },
  goShenci(){ wx.navigateTo({ url: '/packageShui/pages/shenci/shenci' }); }
});
