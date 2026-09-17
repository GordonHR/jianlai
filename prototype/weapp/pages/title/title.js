Page({
  data: {},
  goMode(e){
    const mode = e.currentTarget.dataset.mode;
    wx.navigateTo({ url: '/pages/setup/setup?mode=' + mode });
  },
  goCodex(){ wx.navigateTo({ url: '/pages/codex/codex' }); },
  goTales(){ wx.navigateTo({ url: '/pages/codex/codex?mode=tales' }); },
  goWsp(){ wx.navigateTo({ url: '/pages/wushipai/wushipai' }); },
  goFulu(){ wx.navigateTo({ url: '/packageFulu/pages/fulu/fulu' }); },
  goAskLake(){ wx.navigateTo({ url: '/pages/asklake/asklake' }); },
  goLongque(){ wx.navigateTo({ url: '/packageLongque/pages/longque/longque' }); },
  goSect(){ wx.navigateTo({ url: '/pages/sect/sect?diff=normal' }); },
  goShenci(){ wx.navigateTo({ url: '/pages/shenci/shenci' }); }
});
