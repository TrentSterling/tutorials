'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
function loaderSource(html) {
  const script = html.toString();
  const start = script.indexOf('        async function loadTutorial(id) {');
  const end = script.indexOf("        window.addEventListener('hashchange'", start);
  assert.ok(start >= 0 && end > start);
  return script.slice(start, end);
}
// Controlled in-memory DOM/network/renderer stubs. No network, third-party code,
// tutorial demo source, or browser is invoked by this test harness.
function harness(html, {responses = {}, withDemo = false, navIds = ['gemini', 'research']} = {}) {
  const calls = [];
  const classList = initial => {
    const values = new Set(initial);
    return {add:x=>values.add(x), remove:x=>values.delete(x), has:x=>values.has(x), values};
  };
  const wrapper = {classList:classList([])};
  const nav = new Map(navIds.map(id=>[id,{id, classList:classList(id === 'research' ? ['active'] : [])}]));
  const content = {innerHTML:'initial', querySelectorAll(selector) {calls.push(['codeBlocks',selector]);return [{name:'code-1'},{name:'code-2'}];}};
  const main = {scrollTop:120};
  const canvas = {name:'controlled-canvas'};
  const priorDemo = {destroy() {calls.push(['destroyPriorDemo']);}};
  const generatedDemo = {destroy() {calls.push(['destroyGeneratedDemo']);}};
  const sandbox = {
    currentDemo:withDemo ? priorDemo : null,
    contentDiv:content,
    document:{
      getElementById(id) {return id === 'demo-wrapper' ? wrapper : id === 'demo-canvas' ? canvas : nav.get(id.replace(/^nav-/,'')) || null;},
      querySelectorAll(selector) {assert.equal(selector,'.nav-item'); return [...nav.values()];},
      querySelector(selector) {assert.equal(selector,'main');return main;}
    },
    fetch:async url => {
      calls.push(['fetch',url]);
      const entry = responses[url] ?? {ok:false,text:'not found'};
      if (entry.reject) throw new Error(entry.reject);
      return {ok:entry.ok ?? true, text:async()=>{if(entry.textReject)throw new Error(entry.textReject);return entry.text ?? '# controlled tutorial';}};
    },
    marked:{parse(text){calls.push(['parse',text]);return `<rendered>${text}</rendered>`;}},
    hljs:{highlightElement(block){calls.push(['highlight',block.name]);}},
    Function:function(...args){
      calls.push(['constructDemo',...args]);
      return actualCanvas => {assert.equal(actualCanvas,canvas);calls.push(['invokeControlledDemo']);return generatedDemo;};
    }
  };
  vm.createContext(sandbox);
  new vm.Script(loaderSource(html)+'\nglobalThis.testLoad = loadTutorial;').runInContext(sandbox);
  function snapshot() {
    return {calls:JSON.parse(JSON.stringify(calls)),html:content.innerHTML,scrollTop:main.scrollTop,wrapperHidden:wrapper.classList.has('hidden'),active:[...nav.values()].filter(x=>x.classList.has('active')).map(x=>x.id),demo:sandbox.currentDemo === priorDemo ? 'prior' : sandbox.currentDemo === generatedDemo ? 'generated' : 'none'};
  }
  return {load:sandbox.testLoad,calls,snapshot,content,wrapper,main};
}
module.exports={loaderSource,harness};
