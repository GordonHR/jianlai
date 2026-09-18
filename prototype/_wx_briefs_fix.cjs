/* weapp briefs 精确删改（按用户原著口径） */
const fs = require('fs');
const f = 'weapp/utils/briefs.js';
let t = fs.readFileSync(f, 'utf8');

// 删除顶层键块："KEY": { ... }  （括号配对）
function delKey(src, key) {
  const re = new RegExp('"' + key + '"\\s*:\\s*\\{');
  const m = re.exec(src);
  if (!m) { console.log('skip', key); return src; }
  let i = m.index + m[0].length - 1; // at {
  let depth = 0, j = i;
  for (; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') { depth--; if (depth === 0) { j++; break; } }
  }
  // 吃掉尾随逗号与换行
  while (j < src.length && /[\s,]/.test(src[j])) j++;
  // 吃掉前导空白行/注释？只从 m.index 前的缩进起
  let start = m.index;
  while (start > 0 && (src[start-1] === ' ' || src[start-1] === '\t')) start--;
  if (src[start-1] === '\n') start--;
  console.log('del', key, 'bytes', j - start);
  return src.slice(0, start) + '\n' + src.slice(j);
}

for (const k of ['玉圭', '齐景龙', 'xieshi', 'laojiao', 'xianzhu']) t = delKey(t, k);

// rel 列表中的 "齐景龙"
t = t.replace(/\n\s*"齐景龙",/g, '\n');
t = t.replace(/与齐景龙并称/g, '齐家老辈剑修');
t = t.replace(/他和齐景龙齐名于长城/g, '他是长城齐姓一脉老辈');

// 萧𢙏 → 萧愻
t = t.replace(/"萧𢙏"/g, '"萧愻"');
t = t.replace(
  /"intro": "剑气长城中以追击见长的剑修[^"]*"/,
  '"intro": "剑气长城前任隐官（原著用字萧愻）。以追击见长，一剑命中后常能再递一剑。飞剑名未载/「藏锋」待考。"'
);
t = t.replace(/"pos": "剑气长城 · 追击剑修"/, '"pos": "剑气长城 · 前任隐官 · 追击剑修"');

// 火龙真人 intro/pos
t = t.replace(/"pos": "散修 · 火德铸剑师"/, '"pos": "趴地峰 · 火龙真人 · 火德一脉"');
t = t.replace(
  /"intro": "散修里的火德修士[^"]*"/,
  '"intro": "原著人物，居趴地峰，火德修行。卡内「本命飞剑·火龙」为对战机制名，勿与骊珠洞天铸剑师阮邛混写。"'
);

// 李柳 与火龙对照句
t = t.replace(/，与火龙真人相对——一火一水，皆是散修中的特例。/g, '。');

// 裴杯
t = t.replace(/"pos": "[^"]*"/, (s, ...a) => {
  // only first if裴杯 - too broad; skip
  return s;
});

// 更稳：直接改裴杯块的 pos/intro 若存在
t = t.replace(
  /("裴杯":\s*\{\s*"pos":\s*")[^"]+(")/,
  '$1中土神州 · 女子武夫$2'
);

// 谢狗 / 小陌 的 pos/intro（键存在则改）
t = t.replace(
  /("谢狗":\s*\{\s*"pos":\s*")[^"]+(")/,
  '$1落魄山一等供奉 · 化名白景 · 剑修$2'
);
t = t.replace(
  /("小陌":\s*\{\s*"pos":\s*")[^"]+(")/,
  '$1落魄山一等供奉 · 道号喜烛$2'
);

// 莲藕
t = t.replace(/莲藕福地/g, '藕花福地');

fs.writeFileSync(f, t);
console.log('weapp briefs done, length', t.length);
