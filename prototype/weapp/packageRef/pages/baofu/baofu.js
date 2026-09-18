const bf = require('../../utils/baofuzhai.js');

Page({
  data: { v: { ready:false } },
  onLoad(){
    bf.setHook((snap)=>{ this.setData({ v: snap }); });
    bf.open();
  },
  tab(e){ bf.tab(e.currentTarget.dataset.t); },
  buy(e){ bf.buy(e.currentTarget.dataset.id); },
  credit(e){ bf.credit(e.currentTarget.dataset.id); },
  sell(e){ bf.sell(e.currentTarget.dataset.id); },
  repay(){ bf.repay(); },
  eye(e){ bf.eye(Number(e.currentTarget.dataset.i)); },
  buyStall(e){ bf.buyStall(Number(e.currentTarget.dataset.i)); },
  refreshStall(){ bf.refreshStall(); },
  read(e){ bf.read(e.currentTarget.dataset.id); },
  toggleMark(e){ bf.toggleMark(e.currentTarget.dataset.id); },
  toggleGear(e){ bf.toggleGear(e.currentTarget.dataset.id); },
  rouEye(){ bf.rouEye(); },
  back(){ wx.navigateBack({ delta:1, fail(){ wx.reLaunch({ url:'/pages/title/title' }); } }); }
});
