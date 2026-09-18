'use strict';
const fs = require('fs');
try {
  const E = require('./weapp/utils/engine.js');
  const has = (k) => typeof E[k] === 'function';
  const need = ['start','tick','play','view','useSkill','choose','emit','setSpeed'];
  const missing = need.filter(k => !has(k));
  fs.writeFileSync(__dirname + '/_chk_engine.txt',
    'ENGINE_LOADED_OK\nexports样例: ' + Object.keys(E).slice(0, 20).join(',') +
    '\n缺失核心方法: ' + (missing.length ? missing.join(',') : '无') +
    '\nSFX已挂触觉: ' + (typeof E.vb === 'function' ? '是' : '否(内联)'),
    'utf8');
} catch (e) {
  fs.writeFileSync(__dirname + '/_chk_engine.txt', 'ENGINE_LOAD_FAIL\n' + (e && e.stack || e), 'utf8');
}
