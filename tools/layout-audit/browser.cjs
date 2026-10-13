#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('./contract.cjs');
const HOST='https://tront.xyz',ROOT=HOST+'/tutorials/';
const OUT=path.resolve(process.env.TUTORIAL_LAYOUT_OUTPUT||'.local/tutorial-layout-results');
const CANDIDATE=path.resolve(process.env.TUTORIAL_LAYOUT_CANDIDATE||'.');
const BASELINE=path.resolve(process.env.TUTORIAL_LAYOUT_BASELINE||'.local/tutorial-layout-baseline');
const ALLOWED=new Set(['tront.xyz','cdn.tailwindcss.com','cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com']);
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const write=(name,data)=>fs.writeFileSync(path.join(OUT,name),JSON.stringify(data,null,2));
const markdown={
 '/tutorials/gemini.md':fs.readFileSync(path.join(CANDIDATE,'gemini.md')),
 '/tutorials/research/README.md':fs.readFileSync(path.join(CANDIDATE,'research/README.md')),
 '/tutorials/data-serialization/README.md':fs.readFileSync(path.join(CANDIDATE,'data-serialization/README.md'))
};
function measurements(){
 const box=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,clientHeight:e.clientHeight,scrollHeight:e.scrollHeight,scrollTop:e.scrollTop,overflowX:s.overflowX,overflowY:s.overflowY};};
 const content=document.querySelector('#content'),main=document.querySelector('main'),sidebar=document.querySelector('aside'),nav=document.querySelector('#sidebar-nav'),topics=document.querySelector('.tront-topics');
 const textEscapes=[];let checkedTextFragments=0;
 const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT);let node;
 const rect=content.getBoundingClientRect();
 while(node=walker.nextNode()){
  if(!node.textContent.trim()||node.parentElement.closest('pre,table'))continue;
  const range=document.createRange();range.selectNodeContents(node);
  for(const r of range.getClientRects())if(r.width>0&&r.height>0){checkedTextFragments++;if(r.x<rect.x-1||r.right>rect.right+1)textEscapes.push({text:node.textContent.trim().slice(0,100),x:r.x,right:r.right});}
 }
 return{viewport:{width:innerWidth,height:innerHeight},document:{clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,scrollTop:scrollY},main:box(main),content:box(content),sidebar:box(sidebar),nav:box(nav),topics:box(topics),checkedTextFragments,textEscapes,active:[...document.querySelectorAll('.nav-item.active')].map(x=>x.id),headings:[...content.querySelectorAll('h1,h2')].map(x=>x.textContent.trim())};
}
function point(el){const r=el.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;return{x,y,inside:x>=0&&x<innerWidth&&y>=0&&y<innerHeight,hit:el.contains(document.elementFromPoint(x,y)),width:r.width,height:r.height};}
function assertReadable(m){
 assert.ok(m.content.width>=Math.min(896,m.viewport.width<768?m.viewport.width-40:m.viewport.width-320-(m.viewport.width>=1024?96:64))-1,'full readable content width');
 assert.ok(m.main.width>=(m.viewport.width<768?m.viewport.width:m.viewport.width-320)-1,'reading pane retains expected grid width');
 assert.ok(m.document.scrollWidth<=m.document.clientWidth+1,'no horizontal document overflow');
 assert.ok(m.content.scrollWidth<=m.content.clientWidth+1,'content is not horizontally clipped');
 assert.ok(m.main.scrollWidth<=m.main.clientWidth+1,'reading pane has no horizontal overflow');
 assert.deepEqual(m.textEscapes,[],'all normal text fragments fit inside the reading column');
 assert.ok(m.checkedTextFragments>15,'actual Markdown text was measured');
 assert.ok(m.topics.y>=m.main.bottom-1,'complete topic index occupies a separate row after the reader');
 assert.ok(m.topics.width<=m.viewport.width+1);
 if(m.viewport.width<768){assert.equal(m.main.overflowY,'visible');assert.ok(m.main.y>=m.sidebar.bottom-1);}else assert.ok(Math.abs(m.main.x-320)<1);
}
async function contextFor(browser,width,html){
 const context=await browser.newContext({viewport:{width,height:900},colorScheme:'dark',serviceWorkers:'block'});
 const events={blockedNonReadMethods:[],blockedDemos:[],blockedExternal:[],pageErrors:[],criticalFailures:[],markdown:[]};
 await context.route('**/*',route=>{
  const request=route.request(),u=new URL(request.url());
  if(!['GET','HEAD'].includes(request.method())){events.blockedNonReadMethods.push({url:u.href,method:request.method()});return route.abort('blockedbyclient');}
  if(/(?:^|\/)demo\.js$/i.test(u.pathname)){events.blockedDemos.push(u.href);return route.abort('blockedbyclient');}
  if(u.href.split('#')[0]===ROOT&&request.isNavigationRequest())return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html});
  if(u.origin===HOST&&markdown[u.pathname]){events.markdown.push({url:u.href,sha256:C.sha256(markdown[u.pathname])});return route.fulfill({status:200,contentType:'text/markdown; charset=utf-8',body:markdown[u.pathname]});}
  if(u.protocol!=='https:'||!ALLOWED.has(u.hostname)){events.blockedExternal.push(u.href);return route.abort('blockedbyclient');}
  return route.continue();
 });
 const page=await context.newPage();page.setDefaultTimeout(10000);page.setDefaultNavigationTimeout(20000);
 page.on('pageerror',error=>events.pageErrors.push(error.message));
 page.on('response',response=>{if(['script','stylesheet'].includes(response.request().resourceType())&&response.status()>=400)events.criticalFailures.push({url:response.url(),status:response.status()});});
 return{context,page,events};
}
async function screenshot(page,name,fullPage=false){await page.screenshot({path:path.join(OUT,name+'.png'),animations:'disabled',fullPage,timeout:8000});}
async function ready(page){
 await page.waitForFunction(()=>document.querySelector('#content h1')?.textContent.trim()==='Game Development Tutorials');
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('aside')).backgroundColor==='rgb(15, 23, 42)');
 await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,3000))]));await delay(150);
}
async function clickVisible(page,selector){
 const g=await page.locator(selector).evaluate(point);assert.ok(g.inside&&g.hit&&g.width>0&&g.height>0,'ordinary visible hit-testable control');await page.mouse.click(g.x,g.y);return g;
}
async function flow(page,width,name){
 const evidence={};
 const initial=await page.evaluate(measurements);
 if(width>=768){
  await page.mouse.move(initial.main.x+initial.main.width/2,200);await page.mouse.wheel(0,500);await delay(180);
  const scrolled=await page.evaluate(measurements);assert.ok(scrolled.main.scrollTop>0,'reader independently scrolls');assert.equal(scrolled.nav.scrollTop,0);assert.equal(scrolled.document.scrollTop,0);evidence.readerScroll=scrolled;
 }
 const nav=await page.locator('#sidebar-nav').evaluate(point);assert.ok(nav.inside&&nav.hit);await page.mouse.move(nav.x,nav.y);await page.mouse.wheel(0,600);await delay(180);
 const side=await page.evaluate(measurements);assert.ok(side.nav.scrollTop>0,'sidebar independently scrolls');assert.equal(side.document.scrollTop,0);if(width>=768)assert.equal(side.main.scrollTop,evidence.readerScroll.main.scrollTop);evidence.sidebarScroll=side;
 await page.mouse.wheel(0,-10000);await delay(180);assert.equal((await page.evaluate(measurements)).nav.scrollTop,0);
 evidence.researchClick=await clickVisible(page,'#nav-research');await page.waitForFunction(()=>document.querySelector('#nav-research').classList.contains('active')&&!document.querySelector('#content').textContent.includes('Game Development Tutorials'));
 assert.equal(new URL(page.url()).hash,'#research');assert.equal(await page.locator('main').evaluate(el=>el.scrollTop),0);assert.equal(await page.locator('.nav-item.active').count(),1);assert.equal(await page.locator('#content').getByText('Content TBD',{exact:true}).count(),0);
 evidence.research=await page.evaluate(measurements);assertReadable(evidence.research);
 evidence.geminiClick=await clickVisible(page,'#nav-gemini');await ready(page);assert.equal(new URL(page.url()).hash,'#gemini');
 await page.goBack({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('#nav-research').classList.contains('active')&&document.querySelector('#content h1')?.textContent.trim()==='Research & Methodology');assert.equal(new URL(page.url()).hash,'#research');
 await page.goForward({waitUntil:'domcontentloaded'});await ready(page);assert.equal(new URL(page.url()).hash,'#gemini');
 const contentBefore=await page.locator('#content').innerHTML();await clickVisible(page,'#nav-gemini');await delay(100);assert.equal(await page.locator('#content').innerHTML(),contentBefore);
 await page.reload({waitUntil:'domcontentloaded'});await ready(page);assertReadable(await page.evaluate(measurements));
 evidence.selectionAndHistory={research:true,gemini:true,back:true,forward:true,repeatedSameHash:true,directReload:true};
 const current=await page.evaluate(measurements);await page.mouse.move(current.main.x+Math.min(current.main.width/2,100),Math.min(800,current.main.y+150));await page.mouse.wheel(0,10000);await delay(180);if(width>=768){await page.mouse.wheel(0,10000);await delay(180);}
 const outer=await page.evaluate(measurements);assert.ok(outer.document.scrollTop>0,'document scroll reaches the topic index');evidence.documentScroll=outer;
 const target=page.locator('.tront-topics a[href="/tutorials/gemini.html"]');await target.scrollIntoViewIfNeeded();evidence.topicClick=await target.evaluate(point);assert.ok(evidence.topicClick.inside&&evidence.topicClick.hit);await screenshot(page,name+'-topics');
 const navigation=page.waitForResponse(r=>r.request().isNavigationRequest()&&r.url()===HOST+'/tutorials/gemini.html');await page.mouse.click(evidence.topicClick.x,evidence.topicClick.y);const response=await navigation;await page.waitForURL(HOST+'/tutorials/gemini.html');assert.equal(response.status(),200);assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),HOST+'/tutorials/gemini.html');
 evidence.standalone={url:page.url(),status:response.status(),canonical:await page.locator('link[rel="canonical"]').getAttribute('href')};
 await page.goBack({waitUntil:'domcontentloaded'});await ready(page);assert.equal(new URL(page.url()).hash,'#gemini');assert.equal(await page.locator('.tront-topics a[href="/tutorials/gemini.html"]').count(),1);evidence.standaloneBack=true;
 return evidence;
}
async function allTopics(page){
 const index=await page.locator('.tront-topics').evaluate(section=>{
  const bounds=section.getBoundingClientRect();return [...section.querySelectorAll('ul a')].map(a=>{const r=a.getBoundingClientRect();return{text:a.textContent,href:a.getAttribute('href'),width:r.width,height:r.height,inSection:r.x>=bounds.x-1&&r.right<=bounds.right+1&&r.y>=bounds.y-1&&r.bottom<=bounds.bottom+1,visible:getComputedStyle(a).visibility==='visible'};});
 });
 assert.equal(index.length,76);assert.ok(index.every(x=>x.width>0&&x.height>0&&x.visible&&x.inSection),'all 76 static links fit in the vertically reachable topic index');
 const categories=page.locator('#sidebar-nav > details'),accessible=[];
 for(let i=0;i<await categories.count();i++){
  const category=categories.nth(i);if(!await category.evaluate(el=>el.open))await category.locator('summary').click();
  const last=category.locator('.nav-item').last();await last.scrollIntoViewIfNeeded();const g=await last.evaluate(point);assert.ok(g.inside&&g.hit,'each category can expand and its last topic can be reached by scrolling');accessible.push({category:await category.locator('summary').innerText(),lastId:await last.getAttribute('id'),geometry:g});
 }
 return{staticIndex:index,sidebarCategories:accessible};
}
async function codeAndTable(page,name){
 await page.goto(ROOT+'#data-serialization',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#content h1')?.textContent.trim()==='Data Serialization (High-Speed Game State)'&&document.querySelector('#content pre code.hljs'));
 await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,3000))]));await delay(100);
 const prose=await page.evaluate(measurements);assertReadable(prose);
 const expected=markdown['/tutorials/data-serialization/README.md'].toString().match(/```csharp\n([\s\S]*?)```/)[1];
 assert.equal(await page.locator('#content pre code').textContent(),expected,'the complete real source code is preserved');
 const pre=page.locator('#content pre');await pre.scrollIntoViewIfNeeded();await screenshot(page,name+'-real-code');
 const geometry=await pre.evaluate(el=>({clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,overflowX:getComputedStyle(el).overflowX}));assert.equal(geometry.overflowX,'auto');
 if(geometry.scrollWidth>geometry.clientWidth+1){const g=await pre.evaluate(point);await page.mouse.move(g.x,Math.min(899,Math.max(1,g.y)));await page.mouse.wheel(400,0);await delay(120);assert.ok(await pre.evaluate(el=>el.scrollLeft)>0,'long real code lines remain reachable by horizontal scroll inside the code block');}
 // Deliberately synthetic stress input, rendered only in this test. Never saved in site content.
 const table=await page.evaluate(()=>{
  const probe=document.createElement('div');probe.id='layout-table-probe';probe.innerHTML=marked.parse('| Field | Long identifier |\n| --- | --- |\n| State | '+ 'unchanged_payload_'.repeat(18)+' |');document.querySelector('#content').appendChild(probe);
  const el=probe.querySelector('table');return{clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,overflowX:getComputedStyle(el).overflowX,text:el.textContent};
 });
 assert.equal(table.overflowX,'auto');assert.ok(table.text.includes('unchanged_payload_'.repeat(18)));assertReadable(await page.evaluate(measurements));
 await page.locator('#layout-table-probe').evaluate(el=>el.remove());
 return{realMarkdown:'/tutorials/data-serialization/README.md',prose,code:geometry,sourceCodePreserved:true,syntheticTableProbe:table};
}
async function runCase(browser,width,kind,html,exercise){
 const name=`tutorial-${width}-${kind}`,result={name,width,kind,status:'running'};
 const{context,page,events}=await contextFor(browser,width,html);
 try{
  await page.goto(ROOT+'#gemini',{waitUntil:'domcontentloaded'});await ready(page);result.geometry=await page.evaluate(measurements);await screenshot(page,name);if(kind==='candidate')await screenshot(page,name+'-full',true);
  if(kind==='baseline'){result.status='baseline-observed';result.preexistingReadingWidth=result.geometry.content.width;}
  else{assertReadable(result.geometry);assert.deepEqual(result.geometry.active,['nav-gemini']);assert.equal(await page.locator('#demo-wrapper').evaluate(el=>getComputedStyle(el).display),'none');assert.equal(await page.locator('#sidebar-nav .nav-item').count(),76);assert.equal(await page.locator('.tront-topics ul a').count(),76);if(exercise){result.flow=await flow(page,width,name);result.allTopics=await allTopics(page);}result.codeAndTable=await codeAndTable(page,name);result.status='passed';}
  assert.deepEqual(events.blockedNonReadMethods,[]);assert.deepEqual(events.pageErrors,[]);assert.deepEqual(events.criticalFailures,[]);assert.deepEqual(events.blockedExternal,[]);
 }catch(error){result.status='failed';result.error=error.stack;try{await screenshot(page,name+'-failure');}catch(screenshotError){result.screenshotError=screenshotError.message;}}
 finally{result.events=events;await context.close();write(name+'.json',result);}return result;
}
async function main(){
 if(process.env.GITHUB_ACTIONS!=='true')throw Error('Only run in the parent-approved read-only GitHub Actions runner; no local browser launch.');
 fs.mkdirSync(OUT,{recursive:true});
 const before=fs.readFileSync(path.join(BASELINE,'index.html')),after=fs.readFileSync(path.join(CANDIDATE,'index.html'));
 const report={started:new Date().toISOString(),source:C.sourceContract(before,after),head:process.env.GITHUB_SHA,scope:'Seven real browser contexts: exact released/candidate source at 1440 and 390px, candidate edge widths 1024, 768 and 320px. Exact candidate-repository Roadmap, Research and Data Serialization Markdown is fulfilled locally over the tutorial URL. Real CDN styles/scripts and the public standalone Roadmap page are fetched. A clearly labelled synthetic long table is appended and removed in each candidate context solely as an overflow stress probe. All demo scripts, non-read methods, and unapproved hosts are blocked. No credentials, forms, repository writes, game tests, or deployment.',markdown:Object.fromEntries(Object.entries(markdown).map(([url,bytes])=>[url,{bytes:bytes.length,sha256:C.sha256(bytes)}])),cases:[],errors:[]};
 try{
  const{chromium}=require('playwright');const browser=await chromium.launch({headless:true,executablePath:process.env.THEME_BROWSER_EXECUTABLE||'/opt/google/chrome/chrome'});report.browser=await browser.version();
  try{for(const width of[1440,390])for(const[kind,html]of[['baseline',before],['candidate',after]]){report.cases.push(await runCase(browser,width,kind,html.toString(),kind==='candidate'));write('summary.json',report);}for(const width of[1024,768,320]){report.cases.push(await runCase(browser,width,'candidate',after.toString(),false));write('summary.json',report);}}finally{await browser.close();}
 }catch(error){report.errors.push(error.stack);}finally{report.finished=new Date().toISOString();write('summary.json',report);}
 if(report.errors.length||report.cases.length!==7||report.cases.some(c=>!['passed','baseline-observed'].includes(c.status)))process.exitCode=2;
 console.log(JSON.stringify({cases:report.cases.map(({name,status,error})=>({name,status,error})),errors:report.errors},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
