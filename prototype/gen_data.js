const fs = require("fs");
const src = fs.readFileSync("game.js", "utf8");
const lines = src.split("\n");

// 按起始正则 + 花括号配对，抽取一个顶层声明块（支持对象/数组字面量）
function extractBlock(startRe) {
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (startRe.test(lines[i])) { start = i; break; }
  }
  if (start < 0) return null; // 容错：game.js 中已无此块时跳过，而非中断整个生成
  // 找到第一个 { 或 [ 作为开括号
  let open = -1, openCh = "";
  for (let i = start; i < lines.length; i++) {
    const idx = lines[i].indexOf("{");
    const idxB = lines[i].indexOf("[");
    let cand = -1, ch = "";
    if (idx >= 0 && (idxB < 0 || idx < idxB)) { cand = idx; ch = "{"; }
    else if (idxB >= 0) { cand = idxB; ch = "["; }
    if (cand >= 0) { open = i; openCh = ch; break; }
  }
  const closeCh = openCh === "{" ? "}" : "]";
  let depth = 0, ended = -1;
  for (let i = open; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === openCh) depth++;
      else if (ch === closeCh) { depth--; if (depth === 0) { ended = i; break; } }
    }
    if (ended >= 0) break;
  }
  return lines.slice(start, ended + 1).join("\n");
}

const blocks = [
  extractBlock(/^const FACTIONS\s*=/),
  extractBlock(/^const HOSTILE\s*=/),
  extractBlock(/^const CHARS\s*=/),
  extractBlock(/^const REALM_LIMIT\s*=/),
  extractBlock(/^const SKILLS\s*=/),
  extractBlock(/^const TALENT_DESC\s*=/),
  extractBlock(/^const CARD_SIG\s*=/),
  extractBlock(/^const CARD_KIND\s*=/),
  extractBlock(/^const SHOUTS\s*=/),
  extractBlock(/^const MODE_META\s*=/),
  extractBlock(/^const BG_LIST\s*=/),
  extractBlock(/^const ASKLAKE_QUESTIONS\s*=/), // 兼容旧 game.js：缺失则返回 null 并被过滤
].filter(Boolean);

/* 立绘白名单：扫 weapp/packageArt/assets/portraits 目录自动派生。
   这样新增/删除人物时不必手工维护「缺图名单」——没有对应 .jpg 的 key 自动不出图。 */
const PORTRAIT_DIR = "weapp/packageArt/assets/portraits";
let portraitKeys = [];
try {
  portraitKeys = fs.readdirSync(PORTRAIT_DIR)
    .filter(f => /\.jpg$/i.test(f))
    .map(f => f.replace(/\.jpg$/i, ""))
    .sort();
} catch (e) {
  console.warn("[warn] 未找到立绘目录 " + PORTRAIT_DIR + "，artUrl 将全部返回空串");
}

const helpers = [
  "function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }",
  "function cardPoint(c){ return ({ dodge:2, heal:1, attack:3, wine:4, trick:5, equip:4 })[c.type] || 3; }",
  "function pickShout(list){ return list[Math.floor(Math.random()*list.length)]; }",
  "function parseSkills(txt){",
  "  if(!txt) return [];",
  "  const out=[]; const re=/【([^】]+)】([^【]*)/g; let m;",
  "  while((m=re.exec(txt))) out.push({ name:m[1], desc:m[2].replace(/^[；;、\\s]+/,'') .trim() });",
  "  return out;",
  "}",
  "function cardSig(c){ return CARD_SIG[c.name] || c.name.charAt(0); }",
  "function cardCls(c){ return ({attack:'c-attack',dodge:'c-dodge',heal:'c-heal',wine:'c-wine',trick:'c-trick',equip:'c-equip'})[c.type]||''; }",
  "",
  "// 图片基址：部署到公网/CDN 后改成你的地址，例如 'https://your-cdn.com/jianlai'。",
  "// 留空时小程序内显示阵营色占位（无立绘），等你有托管再填。",
  "const IMG_BASE = '';",
  "// 有立绘的 key（由 gen_data.js 扫 weapp/packageArt/assets/portraits 目录生成，勿手改）",
  "const HAS_PORTRAIT = new Set(" + JSON.stringify(portraitKeys) + ");",
  "function portraitKey(key){ return String(key).replace(/[\\/\\\\:]/g,'_'); }",
  "function artUrl(key){",
  "  if(IMG_BASE) return IMG_BASE + '/art/' + key + '.png';",
  "  const k = portraitKey(key);",
  "  return HAS_PORTRAIT.has(k) ? ('/packageArt/assets/portraits/' + k + '.jpg') : '';",
  "}",
  "function bgUrl(name){ return IMG_BASE ? IMG_BASE + '/bg/' + name : ''; }",
  "module.exports = { FACTIONS, HOSTILE, CHARS, REALM_LIMIT, SKILLS, TALENT_DESC, CARD_SIG, CARD_KIND, cardSig, cardCls, SHOUTS, MODE_META, BG_LIST, IMG_BASE, HAS_PORTRAIT, artUrl, bgUrl, shuffle, cardPoint, pickShout, parseSkills };",
].join("\n");

const header = "// ===== 抽取自 game.js 的纯数据（自动生成，请勿手改） =====\n";
fs.writeFileSync("weapp/utils/data.js", header + blocks.join("\n\n") + "\n\n" + helpers + "\n");
console.log("data.js 字节数:", fs.statSync("weapp/utils/data.js").size);
