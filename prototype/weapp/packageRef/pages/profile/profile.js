const pf = require('../../utils/profile.js');

Page({
  data: { v: { ready:false } },
  onLoad(){
    pf.setHook((snap)=>{ this.setData({ v: snap }); });
    pf.open();
  },
  pick(e){ pf.pick(e.currentTarget.dataset.key); },
  setLadder(e){ pf.setLadder(e.currentTarget.dataset.w); },
  randomName(){ pf.setName(pf.randomName()); },
  recordWin(){ pf.recordWin(); },
  back(){ wx.navigateBack({ delta:1, fail(){ wx.reLaunch({ url:'/pages/title/title' }); } }); }
});
