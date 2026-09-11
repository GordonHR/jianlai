const sc = require('../../utils/shenci.js');

Page({
  data: { v: { ready: false } },
  onLoad(q){
    sc.setHook((snap)=>{ this.setData({ v: snap }); });
    sc.open();
  },
  pickDomain(e){ sc.pickDomain(e.currentTarget.dataset.dom); },
  pickDiff(e){ sc.pickDiff(e.currentTarget.dataset.d); },
  start(){ sc.start(); },
  resolve(e){
    const d = e.currentTarget.dataset;
    sc.resolve(Number(d.idx), Number(d.oi));
  },
  skip(e){ sc.skip(Number(e.currentTarget.dataset.idx)); },
  onImgErr(e){
    // 真机上 <image> 加载失败默认静默隐藏；本兜底：把 wishes[idx].img 置空，下次重渲就不会再生成该 image
    const idx = e.currentTarget.dataset.idx;
    const key = 'v.wishes['+idx+'].img';
    this.setData({ [key]: '' });
  },
  advance(){ sc.settle(); },
  settle(){ sc.settle(); },
  enterNext(){ sc.enterNext(); },
  patrol(){ sc.patrol(); },
  nourish(){ sc.nourish(); },
  tianjie(){ sc.tianjie(); },
  toggleCiwu(){ sc.toggleCiwu(); },
  restart(){ sc.open(); },
  back(){ wx.navigateBack({ delta:1, fail(){ wx.reLaunch({ url:'/pages/title/title' }); } }); }
});
