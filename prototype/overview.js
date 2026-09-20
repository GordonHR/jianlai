/* ============ 修为总览（跨模块资源账目一览） ============
   纯读取四套持久化 key，不改写任何存档；重复点击关闭浮层。
   四套资源：雪花钱(jianlai_baofu) / 香火功德(jianlai_shenci) /
            金精铜钱·人情(jianlai_sect_allies + jianlai_sect_endings) /
            声望道行(jianlai_profile)。 */
(function injectCovStyle(){
  if(document.getElementById('cov-style')) return;
  const s = document.createElement('style');
  s.id = 'cov-style';
  s.textContent =
    '.cultivation-overview{ position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; }'
    + '.cov-backdrop{ position:absolute; inset:0; background:rgba(8,6,12,.72); }'
    + '.cov-panel{ position:relative; width:min(720px,92vw); max-height:86vh; overflow:auto; background:linear-gradient(160deg,rgba(28,24,36,.98),rgba(18,16,26,.98)); border:1px solid rgba(232,198,106,.4); border-radius:14px; padding:22px 24px; box-shadow:0 20px 60px rgba(0,0,0,.6), 0 0 30px rgba(232,198,106,.15); color:#ece6d8; font-family:"PingFang SC","Microsoft YaHei",serif; }'
    + '.cov-head{ display:flex; align-items:center; justify-content:space-between; }'
    + '.cov-head h2{ font-family:var(--kai); font-size:24px; letter-spacing:6px; color:var(--gold); margin:0; font-weight:normal; }'
    + '.cov-close{ background:transparent; border:1px solid rgba(232,198,106,.3); color:var(--gold); width:30px; height:30px; border-radius:8px; cursor:pointer; font-size:15px; }'
    + '.cov-close:hover{ background:rgba(232,198,106,.15); }'
    + '.cov-note{ color:#9a917f; font-size:12.5px; letter-spacing:1px; margin:6px 0 18px; line-height:1.7; }'
    + '.cov-grid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:14px; }'
    + '.cov-card{ background:rgba(20,17,15,.5); border:1px solid rgba(232,198,106,.2); border-left:3px solid var(--c,#e8c66a); border-radius:8px; padding:14px; }'
    + '.cov-mod{ font-size:11px; letter-spacing:2px; color:#9a917f; }'
    + '.cov-res{ font-size:12.5px; color:#c3bdac; margin-top:3px; }'
    + '.cov-val{ font-family:var(--kai); font-size:30px; letter-spacing:2px; color:var(--c,#e8c66a); margin:6px 0 4px; }'
    + '.cov-sub{ font-size:11.5px; color:#8d8574; line-height:1.6; }'
    + '.cov-foot{ text-align:center; color:#6b6455; font-size:11px; letter-spacing:2px; margin-top:18px; }';
  document.head.appendChild(s);
})();

function showCultivationOverview(){
  try{
    const safe = (s)=>{ try{ const o = JSON.parse(s||'null'); return (o && typeof o==='object') ? o : {}; }catch(e){ return {}; } };
    const baofu   = safe(localStorage.getItem('jianlai_baofu'));
    const shenci  = safe(localStorage.getItem('jianlai_shenci'));
    const allies  = safe(localStorage.getItem('jianlai_sect_allies'));
    const sectEnd = safe(localStorage.getItem('jianlai_sect_endings'));
    const profile = safe(localStorage.getItem('jianlai_profile'));

    const coin = (baofu.coin|0);
    const baofuMarks = Array.isArray(baofu.marks) ? baofu.marks.length : 0;
    const baofuOwned = Array.isArray(baofu.owned) ? baofu.owned.length : 0;

    const sk = Object.keys(shenci).filter(k=>typeof shenci[k]==='number');
    const shenciTotal = sk.reduce((a,k)=>a+shenci[k],0);

    const allyArr = Object.keys(allies);
    const ek = Object.keys(sectEnd).filter(k=>typeof sectEnd[k]==='number');
    const sectEndTotal = ek.reduce((a,k)=>a+sectEnd[k],0);

    const xp  = (profile.xp|0);
    const batt = profile.batt || { win:0, lose:0 };

    const cards = [
      { mod:'包袱斋', res:'雪花钱',        val:coin,           sub:'藏书 '+baofuMarks+' · 藏珍 '+baofuOwned, col:'#e8c66a' },
      { mod:'山水祠', res:'香火功德',      val:shenciTotal,    sub:'已历 '+sk.length+' 结局 · 共 '+shenciTotal+' 次', col:'#5f8c7e' },
      { mod:'落魄山', res:'金精铜钱·人情', val:allyArr.length, sub:'坐镇 '+allyArr.length+' 人 · 历 '+sectEndTotal+' 局终', col:'#c79a44' },
      { mod:'行迹录', res:'声望·道行',    val:xp,             sub:batt.win+' 胜 '+batt.lose+' 负', col:'#9b6fd4' },
    ];

    const exist = document.getElementById('cultivation-overview');
    if(exist){ exist.remove(); return; }

    const ov = document.createElement('div');
    ov.id = 'cultivation-overview';
    ov.className = 'cultivation-overview';
    ov.innerHTML =
      '<div class="cov-backdrop"></div>'
      + '<div class="cov-panel">'
      +   '<div class="cov-head"><h2>修为总览</h2><button class="cov-close" onclick="showCultivationOverview()">✕</button></div>'
      +   '<p class="cov-note">四套修行资源各成账册、互不通兑——雪花钱、香火功德、金精铜钱与人情、声望道行。此页只清点，不动分毫。</p>'
      +   '<div class="cov-grid">'
      +     cards.map(c=>'<div class="cov-card" style="--c:'+c.col+'">'
      +       '<div class="cov-mod">'+c.mod+'</div>'
      +       '<div class="cov-res">'+c.res+'</div>'
      +       '<div class="cov-val">'+c.val+'</div>'
      +       '<div class="cov-sub">'+c.sub+'</div>'
      +     '</div>').join('')
      +   '</div>'
      +   '<div class="cov-foot">点击空白处或 ✕ 关闭</div>'
      + '</div>';
    document.body.appendChild(ov);
    ov.querySelector('.cov-backdrop').addEventListener('click', function(){ ov.remove(); });
  }catch(e){}
}
