/* 剑来 · 戏里戏外 · 小程序端（packageTales）
 * navigationStyle:custom；详情=人物志式「配图铺顶 + 信息卡上滑」整页滚动
 * 数据：主包 utils/tales.js（相对路径）；图：本分包 assets/tales/<id>.jpg
 */
const TALES = require('../../../utils/tales.js');
const IMG_BASE = '/packageTales/assets/tales/';

Page({
  data: {
    tales: [],
    selTale: null,
    collapsed: false,
  },
  onLoad(){
    const tales = TALES.map(function(t){
      return Object.assign({}, t, { img: IMG_BASE + t.id + '.jpg' });
    });
    this.setData({ tales: tales });
  },
  goBack(){
    const pages = getCurrentPages();
    if (pages.length > 1) wx.navigateBack();
    else wx.reLaunch({ url: '/pages/title/title' });
  },
  openTale(e){
    const id = e.currentTarget.dataset.id;
    const t = this.data.tales.find(function(x){ return x.id === id; }) || null;
    /* 折叠阈值 ≈ 半个立绘高度；仅跨阈值 setData，避免滚动抖动 */
    this._collapsePx = Math.round((wx.getSystemInfoSync().windowWidth || 375) * (2 / 3) / 2);
    this.setData({ selTale: t, collapsed: false });
  },
  close(){
    this.setData({ selTale: null, collapsed: false });
  },
  onScroll(e){
    if (!this._collapsePx) return;
    const c = e.detail.scrollTop > this._collapsePx;
    if (c !== this.data.collapsed) this.setData({ collapsed: c });
  },
  noop(){}
});
