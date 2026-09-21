'use strict';
/*
 * 天下舆图 · 从 PC 版 HTML 抽取矢量数据 → 生成小程序分包模块
 *
 *   输入：  浩然天下地图.html                 （九洲海岸线路径 / 设色 / 洲详图数据）
 *   输出：  weapp/packageMap/utils/mapgeo.js  （纯数据，无 DOM、无图片）
 *
 * 用法：  node prototype/_map_extract_weapp.cjs
 *
 * 说明：
 *  - 舆图地理是**真矢量**（land-* 为贝塞尔海岸线），与 28.6MB 的手绘底图 map-assets/ 无关；
 *    小程序端只取矢量，不取底图，因此整个 packageMap 不到 120KB。
 *  - 路径数据只用到 M/L/C/Z，运行期由 packageMap/utils/vecpath.js 解析并重放到 canvas。
 *  - 骊珠洞天（村社级矢量图）尚未移植，其文字考据数据在 packageMap/utils/lizhu.js，
 *    来源为 骊珠洞天古地图.html（POI data-key + DESC），待接入该图时并入本脚本。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const SRC_HTML = path.join(ROOT, '..', 'pc-map', '浩然天下地图.html');
const OUT = path.join(ROOT, 'weapp/packageMap/utils/mapgeo.js');

const html = fs.readFileSync(SRC_HTML, 'utf8');
const report = [];

/* ---------- 1. <defs> 里的九洲陆地路径 ---------- */
const di = html.indexOf('<defs>'), dj = html.indexOf('</defs>');
if (di < 0 || dj < 0) throw new Error('找不到 <defs>，源文件结构可能已变');
const defs = html.slice(di + 6, dj);
const LAND = {};
{
  const re = /<path id="(land-[a-z]+)"\s+d="([^"]+)"\s*\/>/g;
  let m;
  while ((m = re.exec(defs))) LAND[m[1].replace('land-', '')] = m[2];
}
report.push('land paths: ' + Object.keys(LAND).join(', '));

/* ---------- 2. 数据块（WORLD / ZHOU / CHAR_IDX / PLACE_CHARS / ZHOU_RELS） ---------- */
const s0 = html.indexOf('const WORLD');
const s1 = html.indexOf('const scene=');
if (s0 < 0 || s1 < 0) throw new Error('找不到数据块边界');
const chunk = html.slice(s0, s1);
const names = [];
const reConst = /const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/g;
let mc;
while ((mc = reConst.exec(chunk))) names.push(mc[1]);

/* 数据字面量里没有任何 DOM 引用，可在沙箱函数里安全求值 */
const data = new Function(chunk + '\nreturn {' + names.join(',') + '};')();
report.push('chunk consts: ' + names.join(', '));

const WORLD = data.WORLD;
const ZHOU = data.ZHOU;
const ZHOU_RELS = data.ZHOU_RELS;
const PLACE_CHARS = data.PLACE_CHARS;
const CHAR_IDX = data.CHAR_IDX;

/* 立绘属 packageArt 分包，分包间不可互引 → 去掉 img，详情卡改纯文字 */
Object.keys(CHAR_IDX).forEach(k => { delete CHAR_IDX[k].img; });

/* ---------- 3. 六套传统设色（CSS 变量） ---------- */
const cssStart = html.indexOf('<style>'), cssEnd = html.indexOf('</style>');
const css = html.slice(cssStart, cssEnd);
function vars(block) {
  const o = {};
  const re = /--([a-z0-9-]+)\s*:\s*([^;}]+)/g;
  let m;
  while ((m = re.exec(block))) o[m[1]] = m[2].trim();
  return o;
}
const STYLES = {};
{
  const a = css.indexOf(':root{');
  STYLES.qinglv = vars(css.slice(a, css.indexOf('}', a)));
}
['shuimo', 'jinbi', 'qianjiang', 'yeyue', 'qiushan'].forEach(k => {
  const tag = '.mapstage[data-style="' + k + '"]{';
  const a = css.indexOf(tag);
  if (a >= 0) STYLES[k] = vars(css.slice(a, css.indexOf('}', a)));
});
report.push('styles: ' + Object.keys(STYLES).join(', '));

/* ---------- 4. 固定标注与符号（取自 PC renderWorld / <defs>） ---------- */
const SEAS = [['东海', 1002, 424], ['南海', 762, 716], ['西海', 562, 548], ['北海', 772, 368]];
const WALL = { x: 1360, y0: 150, y1: 950, label: '剑气长城 · 浩然东界·隔蛮荒' };
const MANHUANG = { x: 1472, y: 540, t: '蛮荒天下', s: '妖族祖地 · 长城以东' };
const DAOXUAN = { x: 920, y: 980, hit: { x: 940, y: 980, rx: 70, ry: 36 }, name: '倒悬山', zhou: 'posuo' };
const SYM = {
  mtn: { d: 'M0,0 L9,-15 L16,-5 L25,-18 L34,0 Z', inner: 'M6,-4 L13,-11 M17,-6 L24,-13' },
  mtnS: { d: 'M0,0 L7,-11 L13,-4 L20,-13 L27,0 Z' },
  sect: { d: 'M0,-13 L11,3 L-11,3 Z', stem: 'M-3,3 L3,3 L3,12 L-3,12 Z' },
  city: { r: 6, r2: 2.4 },
  capital: { s: 18 }
};
const STYLE_LIST = [
  ['qinglv', '青绿山水'], ['shuimo', '水墨淡彩'], ['jinbi', '金碧'],
  ['qianjiang', '浅绛山水'], ['yeyue', '月夜图'], ['qiushan', '秋山']
];

/* ---------- 5. 落盘 ---------- */
const payload = {
  VIEW: [1600, 1100],
  LAND: LAND,
  SYM: SYM,
  WORLD: WORLD,
  ZHOU: ZHOU,
  ZHOU_RELS: ZHOU_RELS,
  PLACE_CHARS: PLACE_CHARS,
  CHAR_IDX: CHAR_IDX,
  STYLES: STYLES,
  STYLE_LIST: STYLE_LIST,
  SEAS: SEAS,
  WALL: WALL,
  MANHUANG: MANHUANG,
  DAOXUAN: DAOXUAN
};

const body = `'use strict';
/* 天下舆图 · 矢量地理与设色数据
 * 由 prototype/_map_extract_weapp.cjs 从 浩然天下地图.html 程序化抽取，请勿手改。
 * 含：九洲海岸线路径(land-*)、山脉/城邑/宗门符号、WORLD/ZHOU/PLACE_CHARS/CHAR_IDX 数据、
 *     六套传统设色、海域/剑气长城/蛮荒/倒悬山常量。纯数据，无 DOM、无图片资源。
 */
module.exports = ${JSON.stringify(payload)};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, body, 'utf8');

report.push('wrote ' + path.relative(ROOT, OUT) + '  ' + (Buffer.byteLength(body) / 1024).toFixed(1) + 'KB');
report.push('land=' + Object.keys(LAND).length +
  ' world=' + WORLD.length +
  ' zhou=' + Object.keys(ZHOU).length +
  ' styles=' + Object.keys(STYLES).length +
  ' chars=' + Object.keys(CHAR_IDX).length +
  ' placeChars=' + Object.keys(PLACE_CHARS).length);
report.push('done');
console.log(report.join('\n'));
