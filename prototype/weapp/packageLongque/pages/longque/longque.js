const LQ = require('../../utils/longque.js');

Page({
  data: { v: null },
  onLoad(){
    LQ.init(this.onState.bind(this));
    LQ.start();
  },
  onState(s){ if(s) this.setData({ v: s }); },
  pickOrigin(e){ LQ.pickOrigin(e.currentTarget.dataset.k); },
  choose(e){ LQ.choose(Number(e.currentTarget.dataset.i)); },
  ilNext(){ LQ.ilNext(); },
  restart(){ LQ.restart(); },
  openCodex(){ LQ.openCodex(); },
  back(){ LQ.back(); },
  goHome(){ wx.reLaunch({ url: '/pages/title/title' }); }
});
