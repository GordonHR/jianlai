const Engine = require('../../utils/engine.js');

// 3.2 触觉反馈：iOS 仅手势链内有效且只支持 heavy/medium/light；非手势触发会 reject，静默吞掉
function vib(t){
  try { const p = wx.vibrateShort({ type: t || 'light' }); if (p && p.catch) p.catch(() => {}); } catch(e){}
}

Page({
  data: {
    s: null,
    banner: null, bannerOn: false,
    flash: null, flashOn: false,
    shout: null, shoutOn: false,
    popup: null, popupOn: false,
    pickSel: [], modalType: null,
    speedOn: true,
    recapOn: false,          // 结局屏「本局战报」抽屉，默认收起
    selUid: null,            // 出牌选择态：抬起中的手牌 uid
    logCollapsed: true,      // 战报默认收起（仅最新一条浮窗）
    playName: '',            // 中间核心：出牌动态演出中的牌名（空=不显示）
    skillFolded: true,       // 技能按钮默认折叠成右下"技"浮标
  },
  onLoad(){
    const pg = getApp().globalData.pendingGame;
    if(!pg){ wx.reLaunch({ url: '/pages/title/title' }); return; }
    this._ids = {};
    Engine.init(this.onState.bind(this));
    Engine.startGame(pg.keys, pg.mode);
  },
  onState(s){
    if(!s){ this.setData({ s: null }); return; }
    const upd = { s };
    if(s.banner && s.banner.id !== this._ids.banner){ this._ids.banner = s.banner.id; upd.banner = s.banner; this._flash('banner'); }
    if(s.flash && s.flash.id !== this._ids.flash){ this._ids.flash = s.flash.id; upd.flash = s.flash; this._flash('flash'); vib('medium'); }
    if(s.shout && s.shout.id !== this._ids.shout){ this._ids.shout = s.shout.id; upd.shout = s.shout; this._flash('shout'); }
    if(s.popup && s.popup.fx !== this._ids.popup){ this._ids.popup = s.popup.fx; upd.popup = s.popup; this._flash('popup'); }
    // 多重选择（弃牌等）：改为手牌直接多选，进入时清空选择与出牌抬起态
    if(s.modal && s.modal.type === 'multi' && this.data.modalType !== 'multi'){
      upd.pickSel = []; upd.modalType = 'multi'; upd.selUid = null;
    } else if(!s.modal){ upd.modalType = null; upd.pickSel = []; }
    // 出牌选择态：卡牌离手 / 非我方回合 / 进入选目标，均自动清理
    if(this.data.selUid != null){
      const still = s.meHand && s.meHand.some(c => c.uid === this.data.selUid);
      if(!still || !s.isMyTurn || s.await) upd.selUid = null;
    }
    // 出牌动态演出：lastPlay 变化时销毁重建节点，重播飞入放大动画
    const lp = s.lastPlay || '';
    if(lp !== this._lastPlay){
      this._lastPlay = lp;
      upd.playName = '';                       // 先置空 → wx:if false，节点销毁
      clearTimeout(this._t_play);
      if(lp) this._t_play = setTimeout(() => this.setData({ playName: lp }), 40); // 再设回 → 节点重建，动画重播
    }
    this.setData(upd);
  },
  _flash(kind){
    this.setData({ [kind + 'On']: true });
    clearTimeout(this['_t_' + kind]);
    this['_t_' + kind] = setTimeout(() => this.setData({ [kind + 'On']: false }), kind === 'popup' ? 900 : 1100);
  },
  tapCard(e){
    const s = this.data.s;
    if(!s || !s.isMyTurn || s.await || s.busy) return;
    const uid = Number(e.currentTarget.dataset.uid);
    if(this.data.modalType === 'multi'){ this.tapMultiCard(e); return; }  // 弃牌等多选：点手牌即选牌
    const card = (s.meHand || []).find(c => c.uid === uid);
    if(!card || card.disabled) return;
    if(this.data.selUid === uid) this._play(uid);          // 再次点同一张 = 出牌
    else { this.setData({ selUid: uid }); vib('light'); }  // 首次点 = 抬起选中
  },
  _play(uid){
    vib('medium');
    this.setData({ selUid: null });
    Engine.onCardClick(uid);
  },
  tapConfirmPlay(){ if(this.data.selUid != null) this._play(this.data.selUid); },
  tapCancelSel(){ if(this.data.selUid != null) this.setData({ selUid: null }); },
  toggleLog(){ this.setData({ logCollapsed: !this.data.logCollapsed }); },
  toggleSkillFold(){ this.setData({ skillFolded: !this.data.skillFolded }); },
  tapSkill(e){ if(this.data.modalType === 'multi') return; vib('light'); Engine.onSkill(e.currentTarget.dataset.key); },
  tapPlayer(e){
    if(!this.data.s || !this.data.s.await) return;
    vib('light');
    Engine.onPlayerClick(Number(e.currentTarget.dataset.id));
  },
  tapEndTurn(){ if(this.data.modalType === 'multi') return; vib('light'); Engine.onEndTurn(); },
  tapCancelAwait(){ Engine.cancelAwait(); },
  modalChoice(e){ vib('light'); Engine.resolveModal(e.currentTarget.dataset.v); },
  tapMultiCard(e){
    const m = this.data.s && this.data.s.modal;
    if(!m) return;
    const uid = Number(e.currentTarget.dataset.uid);
    if(!(m.cards || []).some(c => c.uid === uid)) return;   // 只能选弹窗给的牌
    const count = m.count;
    let sel = this.data.pickSel.slice();
    const i = sel.indexOf(uid);
    if(i >= 0) sel.splice(i, 1);
    else if(sel.length < count) sel.push(uid);
    vib('light');
    this.setData({ pickSel: sel });
  },
  tapMultiConfirm(){
    if(this.data.pickSel.length === this.data.s.modal.count){ vib('medium'); Engine.resolveMulti(this.data.pickSel); }
  },
  cycleBg(){ Engine.cycleBg(); },
  toggleSpeed(){
    Engine.toggleSpeed();
    this.setData({ speedOn: Engine.getSpeed() > 0.7 });
  },
  toggleSfx(){ /* 小程序暂无音效资源，按钮占位 */ },
  tapAuto(){ if(this.data.modalType === 'multi') return; Engine.toggleAuto(); },
  toggleRecap(){ this.setData({ recapOn: !this.data.recapOn }); },
  resultRematch(){ vib('light'); this.setData({ recapOn: false }); Engine.rematch(); },
  resultHome(){ vib('light'); wx.reLaunch({ url: '/pages/title/title' }); },
  /* 底栏浮动按钮：先占位，后续接入排序/表情/聊天逻辑 */
  tapSortHand(){ /* TODO: 按花色/点数排序 */ },
  tapEmoji(){ /* TODO: 表情面板 */ },
  tapChat(){ /* TODO: 聊天面板 */ },
});
