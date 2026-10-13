'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const gitBlob = bytes => crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes])).digest('hex');
const BASE_COMMIT = 'fe6a5a1e01be41121eee30247c495e7aea192ae4';
const BASE_TREE = 'f33693da3cccd69c8301806791e776704f2fc13a';
const BASE_BLOB = '7daa337d20726f51aede9f90de1704c0951ad05b';
const BASE_SHA256 = 'aacd35a2682ae1a0dc02ce50cb97cfeefff049d826a8efe764defe4455dfa6c7';
const CSS = fs.readFileSync(path.join(__dirname, 'layout.css'), 'utf8');
const scripts = html => [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)].map(x => x[0]);
function sourceContract(before, after) {
  before = Buffer.from(before); after = Buffer.from(after);
  assert.equal(gitBlob(before), BASE_BLOB, 'exact released tutorial baseline');
  assert.equal(sha256(before), BASE_SHA256);
  const text = before.toString(), candidate = after.toString();
  assert.equal(text.split('    </style>').length, 2, 'one scoped insertion point');
  assert.equal(text.split('<body class="flex h-screen overflow-hidden">').length, 2);
  const expected = text.replace('    </style>', CSS + '    </style>').replace('<body class="flex h-screen overflow-hidden">', '<body class="tutorial-hub">');
  assert.equal(candidate, expected, 'only the reviewed layout CSS block and body layout class may change');
  assert.deepEqual(scripts(candidate), scripts(text), 'all scripts are byte-identical, including categories, Markdown loading and every demo path');
  assert.equal(candidate.slice(candidate.indexOf('<!-- tront-topics:start -->')), text.slice(text.indexOf('<!-- tront-topics:start -->')), 'all topic labels, hrefs, order, and original topics styles are byte-identical');
  assert.equal(candidate.slice(candidate.indexOf('    <!-- Sidebar -->')), text.slice(text.indexOf('    <!-- Sidebar -->')), 'entire body below the body opening tag is byte-identical');
  for (const block of scripts(candidate)) if (!/^<script\b[^>]*\bsrc=/.test(block)) new vm.Script(block.replace(/^<script\b[^>]*>/, '').replace(/<\/script>$/, ''));
  assert.match(CSS, /grid-template-columns: 20rem minmax\(0, 1fr\)/);
  assert.match(CSS, /@media \(max-width: 767px\)/);
  assert.match(CSS, /grid-column: 1 \/ -1/);
  assert.doesNotMatch(CSS, /display:\s*none|visibility:\s*hidden|overflow(?:-x|-y)?:\s*hidden|!important/);
  return {baseCommit:BASE_COMMIT,baseTree:BASE_TREE,baselineBlob:gitBlob(before),candidateBlob:gitBlob(after),baselineSha256:sha256(before),candidateSha256:sha256(after),candidateBytes:after.length,bytesAdded:after.length-before.length,scriptsPreserved:scripts(candidate).length,topicsPreserved:76,scope:['index.html: responsive CSS insertion and body layout class']};
}
const QA_FILES = new Set([
  '.github/workflows/tutorial-layout.yml',
  'tools/layout-audit/browser.cjs', 'tools/layout-audit/contract.cjs',
  'tools/layout-audit/layout.css', 'tools/layout-audit/loader-harness.cjs',
  'tools/layout-audit/test.cjs', 'tools/layout-audit/README.md'
]);
function parseTree(text) {
  return new Map(text.split('\0').filter(Boolean).map(entry => {
    const [identity, name] = entry.split('\t');
    return [name, identity];
  }));
}
function repositoryContract(before, after) {
  const baseline = parseTree(before), candidate = parseTree(after);
  assert.ok(baseline.has('index.html') && baseline.size > 100, 'complete baseline Git tree');
  for (const [name, identity] of baseline) {
    assert.ok(candidate.has(name), `preserve existing file ${name}`);
    if (name !== 'index.html') assert.equal(candidate.get(name), identity, `preserve exact file bytes and mode: ${name}`);
  }
  const added = [...candidate.keys()].filter(name => !baseline.has(name));
  assert.ok(added.every(name => QA_FILES.has(name)), 'only reviewed new QA files are allowed');
  return {existingFiles:baseline.size,unchangedNonIndexFiles:baseline.size-1,addedQaFiles:added};
}
module.exports = {sourceContract,repositoryContract,sha256,gitBlob,BASE_COMMIT,BASE_TREE,BASE_BLOB,BASE_SHA256,CSS};
if (require.main === module) {
 const result=sourceContract(fs.readFileSync(path.join(process.env.TUTORIAL_LAYOUT_BASELINE || '.local/tutorial-layout-baseline','index.html')),fs.readFileSync(path.join(process.env.TUTORIAL_LAYOUT_CANDIDATE || '.', 'index.html')));
 if(process.argv.includes('--repository')) {
  const {execFileSync}=require('node:child_process');
  result.repository=repositoryContract(execFileSync('git',['-C',process.env.TUTORIAL_LAYOUT_BASELINE||'.local/tutorial-layout-baseline','ls-tree','-r','-z','HEAD'],{encoding:'utf8'}),execFileSync('git',['-C',process.env.TUTORIAL_LAYOUT_CANDIDATE||'.','ls-tree','-r','-z','HEAD'],{encoding:'utf8'}));
 }
 console.log(JSON.stringify(result,null,2));
}
