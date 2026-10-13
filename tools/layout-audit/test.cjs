'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {sourceContract,repositoryContract} = require('./contract.cjs');
const {harness,loaderSource} = require('./loader-harness.cjs');
const before = fs.readFileSync(path.join(process.env.TUTORIAL_LAYOUT_BASELINE || '.local/tutorial-layout-baseline','index.html'));
const after = fs.readFileSync(path.join(process.env.TUTORIAL_LAYOUT_CANDIDATE || '.', 'index.html'));
test('exact release-to-candidate source and all byte-preservation contracts',()=>sourceContract(before,after));
test('loader is byte-identical to released source',()=>assert.equal(loaderSource(before),loaderSource(after)));
for (const [name,from,to] of [
 ['content','Gamedev Hub','Gamedev tutorials'],
 ['link','/tutorials/gemini.html','/tutorials/gemini/README.md'],
 ['script',"if (id === 'gemini') return;",'return;'],
 ['layout','20rem minmax(0, 1fr)','20rem 5rem'],
 ['original styles','font-size: 9px','font-size: 7px'],
 ['topic order','Research &amp; Methodology','Changed topic']
]) test(`reject unreviewed ${name} change`,()=>assert.throws(()=>sourceContract(before,after.toString().replace(from,to))));
test('all 76 navigation IDs and metadata remain unchanged and unique',()=>{
 const ids = text => [...text.toString().matchAll(/\{ id: '([^']+)'/g)].map(x=>x[1]);
 assert.equal(ids(after).length,76); assert.equal(new Set(ids(after)).size,76); assert.deepEqual(ids(after),ids(before));
});
test('all 76 loader success paths retain behavior without executing demo source',async()=>{
 const ids=[...after.toString().matchAll(/\{ id: '([^']+)'/g)].map(x=>x[1]);
 for (const id of ids) {
  const url = id==='gemini' ? 'gemini.md' : `${id}/README.md`;
  const options={responses:{[url]:{text:'# controlled content'},[`${id}/demo.js`]:{text:'controlled demo source (never evaluated)'}},withDemo:true,navIds:ids};
  const a=harness(before,options),b=harness(after,options);
  await a.load(id); await b.load(id); assert.deepEqual(b.snapshot(),a.snapshot(),id);
  assert.equal(b.snapshot().scrollTop,0); assert.deepEqual(b.snapshot().active,[id]);
 }
});
test('failed document, rejected document, missing demo, and rejected demo retain behavior',async()=>{
 for(const responses of [
  {'research/README.md':{ok:false}},
  {'research/README.md':{reject:'controlled failure'}},
  {'research/README.md':{text:'# content'},'research/demo.js':{ok:false}},
  {'research/README.md':{text:'# content'},'research/demo.js':{reject:'controlled demo failure'}}
 ]){
  const a=harness(before,{responses,withDemo:true}),b=harness(after,{responses,withDemo:true});
  await a.load('research');await b.load('research');assert.deepEqual(b.snapshot(),a.snapshot());
 }
});

test('complete Git-tree contract rejects any non-index edit or non-QA addition',()=>{
 const records=['100644 blob base\tindex.html',...Array.from({length:110},(_,i)=>`100644 blob stable-${i}\ttopic-${i}/README.md`)];
 const before=records.join('\0')+'\0';
 const after=records.map(x=>x.endsWith('\tindex.html')?'100644 blob candidate\tindex.html':x).join('\0')+'\0'+'100644 blob qa\ttools/layout-audit/browser.cjs\0';
 assert.equal(repositoryContract(before,after).unchangedNonIndexFiles,110);
 assert.throws(()=>repositoryContract(before,after.replace('stable-1\t','changed\t')));
 assert.throws(()=>repositoryContract(before,after+'100644 blob unexpected\tnew-runtime.js\0'));
 assert.throws(()=>repositoryContract(before,after.replace('100644 blob stable-0\ttopic-0/README.md\0','')));
});
