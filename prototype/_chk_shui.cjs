const fs=require('fs'),path=require('path');
function dirSize(p){
  let total=0,n=0;
  if(!fs.existsSync(p)) return {total:0,n:0};
  for(const f of fs.readdirSync(p)){
    const fp=path.join(p,f);
    const st=fs.statSync(fp);
    if(st.isFile()){ total+=st.size; n++; }
  }
  return {total,n};
}
const main=dirSize(path.join(__dirname,'weapp/assets/shujianhu'));
const dup=dirSize(path.join(__dirname,'weapp/packageMedia/assets/shujianhu'));
const KB=x=>(x.total/1024).toFixed(1)+'KB';
const out=[
 '主包 weapp/assets/shujianhu : '+main.n+' 文件, '+KB(main),
 '死副本 weapp/packageMedia/assets/shujianhu : '+dup.n+' 文件, '+KB(dup),
 '两份合计浪费 : '+KB({total:main.total+dup.total,n:main.n+dup.n}),
 '两份文件清单一致? '+(main.n===dup.n?'数量一致(需逐文件比对哈希确认)':'不一致')
];
fs.writeFileSync(path.join(__dirname,'_chk_shui.txt'),out.join('\n'),'utf8');
