'use strict';
const fs = require('fs');
try {
  const d = require('./weapp/utils/data.js');
  const out = [
    'data.js 解析成功',
    'CHARS 角色数: ' + Object.keys(d.CHARS).length,
    'SKILLS 角色数: ' + Object.keys(d.SKILLS).length,
    "郭竹酒.txt: " + d.CHARS['郭竹酒'].txt,
    "郭竹酒 在 game.js 修正后的期望含「饮者（酒）」: " + (d.CHARS['郭竹酒'].txt.indexOf('饮者（酒）') >= 0 ? '是' : '否')
  ];
  fs.writeFileSync('_chk_data.txt', out.join('\n') + '\n', 'utf8');
} catch (e) {
  fs.writeFileSync('_chk_data.txt', 'ERROR: ' + (e && e.stack ? e.stack : String(e)) + '\n', 'utf8');
}
