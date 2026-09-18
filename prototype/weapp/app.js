App({
  globalData: {
    // 进入对战页前，由 setup 页写入 { keys:[...], mode:'ai' }
    pendingGame: null,
  },
  onLaunch() {
    // 立绘仍跨包（packageArt）；分包预载可降低首开失败率
    this.preloadMedia();
  },
  preloadMedia() {
    if (typeof wx === 'undefined' || !wx.preloadSubpackage) return;
    ['packageMedia', 'packageShui', 'packageLongque', 'packageArt', 'packageFulu'].forEach((name) => {
      try {
        wx.preloadSubpackage({ name });
      } catch (e) {}
    });
  },
});
