const AL = require('../../utils/shujianhu.js');

Page({
  data: { v: null, flipEnd: false },
  onLoad(){
    AL.init(this.onState.bind(this));
    AL.start();
  },
  onState(s){ if(s) this.setData({ v: s }); },
  pickOrigin(e){ AL.pickOrigin(e.currentTarget.dataset.k); },
  choose(e){ AL.choose(Number(e.currentTarget.dataset.i)); },
  ilNext(){ AL.ilNext(); },
  toggleMood(){ AL.toggleMood(); },
  toggleEnd(){ this.setData({ flipEnd: !this.data.flipEnd }); },
  reviewNext(){ AL.reviewNext(); },
  restart(){ AL.restart(); this.setData({ flipEnd: false }); },
  openCodex(){ AL.openCodex(); this.setData({ flipEnd: false }); },
  back(){ AL.back(); },
  goHome(){ wx.reLaunch({ url: '/pages/title/title' }); }
});
