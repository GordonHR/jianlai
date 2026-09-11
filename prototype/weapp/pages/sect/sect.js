const sect = require('../../utils/sect.js');

Page({
  data: { v: { ready:false } },
  onLoad(q){
    const diff = (q && q.diff) || 'normal';
    sect.setHook((snap)=>{ this.setData({ v: snap }); });
    sect.open(diff);
  },
  pick(e){ const d = e.currentTarget.dataset; sect.sectResolveEvent(Number(d.idx), Number(d.oi)); },
  skip(e){ sect.sectSkipEvent(Number(e.currentTarget.dataset.idx)); },
  advance(){ sect.sectSettle(); },
  settle(){ sect.sectSettle(); },
  enterNext(){ sect.sectEnterNext(); },
  ui(e){ sect.sectUISwitch(e.currentTarget.dataset.ui); },
  build(e){ sect.sectBuild(e.currentTarget.dataset.key); },
  recruit(){ sect.sectRecruitSeek(); },
  forge(){ sect.sectForge(); },
  preach(){ sect.sectPreach(); },
  brk(){ sect.sectBreak(); },
  trade(){ sect.sectTrade(); },
  gambleSmall(){ sect.sectGamble(false); },
  gambleBig(){ sect.sectGamble(true); },
  closePrologue(){ sect.closePrologue(); },
  toggleMood(){ sect.toggleMood(); },
  toggleChron(){ sect.toggleChron(); },
  restart(){ sect.restart('normal'); },
  back(){ wx.navigateBack({ delta:1, fail(){ wx.reLaunch({ url:'/pages/title/title' }); } }); }
});
