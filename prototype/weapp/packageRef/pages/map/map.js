const map = require('../../utils/map.js');

Page({
  data: { v: { ready:false } },
  onLoad(){
    map.setHook((snap)=>{ this.setData({ v: snap }); });
    map.open();
  },
  drill(e){ map.drill(e.currentTarget.dataset.k); },
  drillLizhu(){ map.drillLizhu(); },
  backWorld(){ map.backWorld(); },
  showPlace(e){ map.showPlace(e.currentTarget.dataset.k); },
  showLizhuPlace(e){ map.showLizhuPlace(e.currentTarget.dataset.k); },
  closePlace(){ map.closePlace(); },
  back(){ wx.navigateBack({ delta:1, fail(){ wx.reLaunch({ url:'/pages/title/title' }); } }); }
});
