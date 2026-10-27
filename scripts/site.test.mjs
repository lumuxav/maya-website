import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const html = await read('public/index.html');
const css = await read('public/styles.css');
const js = await read('public/app.js');

test('all six brochure service categories are present', () => {
  assert.equal((html.match(/class="service-card reveal"/g) || []).length, 6);
  for(const name of [
    'PRESSED','ROLLER SHUTTER','KIBAATI','LOUVERS',
    'SLIDING DOOR','PLASMA CNC'
  ]) assert.ok(html.includes(name), 'missing '+name);
});

test('gallery has six filterable cards and a keyboard-accessible image dialog', () => {
  assert.equal((html.match(/class="gallery-item reveal"/g) || []).length, 6);
  assert.match(html, /<dialog id="gallery-dialog"/);
  assert.match(html, /id="dialog-prev"/);
  assert.match(html, /id="dialog-next"/);
  assert.match(js, /ArrowLeft/);
  assert.match(js, /ArrowRight/);
});

test('client contacts and WhatsApp destination match supplied brochure', () => {
  for(const phone of ['0757 742 177','0706 672 557','0759 660 116'])
    assert.ok(html.includes(phone), 'missing contact '+phone);
  assert.match(html, /https:\/\/wa\.me\/256757742177/);
  assert.match(js, /https:\/\/wa\.me\/256757742177/);
  assert.match(html, /Monday — Saturday/);
});

test('quote form requires a name, phone and selected service before preview', () => {
  for (const field of ['name','phone','service'])
    assert.match(html, new RegExp('name="'+field+'"[^>]*required'));
  assert.match(html, /<dialog id="review-dialog"/);
  assert.match(js, /quoteForm\.reportValidity\(\)/);
  assert.match(js, /encodeURIComponent\(message\)/);
});

test('navigation anchors exist in document and have keyboard support', () => {
  assert.match(html, /class="skip-link"/);
  assert.match(html, /aria-expanded="false"/);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for(const match of html.matchAll(/\bhref="#([^"]+)"/g)) {
    assert.ok(ids.has(match[1]), 'Broken anchor: #' + match[1]);
  }
});

test('reduced motion and small mobile layouts are supported', () => {
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width:700px/);
  assert.match(js, /IntersectionObserver/);
});

test('built files are ready for static hosting', async () => {
  for (const path of ['index.html','styles.css','app.js','404.html','brochure.html','favicon.svg']) {
    assert.ok((await stat(new URL('../dist/' + path, import.meta.url))).isFile(), 'Missing dist/' + path);
  }
  const config=JSON.parse(await read('vercel.json'));
  assert.equal(config.outputDirectory,'dist');
  assert.equal(config.buildCommand,'npm run build');
});

test('the site uses actual company photos, correct monogram and dark orange theme',async()=>{
  const axis=await read('public/axis.css');
  assert.match(html,/class="hero hero-v2 axis-hero"/);
  assert.match(html,/href="\.\/axis\.css"/);
  assert.match(html,/id="feature-heading"/);
  assert.match(axis,/axis-feature/);
  assert.match(axis,/axis-material-notes/);
  assert.match(axis,/max-width:700px/);
  assert.match(axis,/prefers-reduced-motion/);
  const names=['ribbed-steel-plates','roller-shutter-channels','workshop-steel-strips',
    'metal-louvers','sliding-channels','cnc-pattern-panel','cnc-lettering','profile-structure'];
  for(const name of names){
    const file='assets/real/'+name+'.webp';
    const binary=await readFile(new URL('../public/'+file,import.meta.url));
    assert.equal(binary.toString('ascii',0,4),'RIFF','Invalid WebP photo: '+file);
    assert.equal(binary.toString('ascii',8,12),'WEBP','Invalid WebP photo: '+file);
    assert.ok((await stat(new URL('../dist/'+file,import.meta.url))).isFile(),'Missing '+file);
    assert.ok(html.includes('./assets/real/'+name+'.webp'),'Photo absent from page: '+name);
  }
  const logo=await read('public/assets/maya-steel-logo.svg');
  assert.match(logo,/Maya Steel Works/);
  assert.match(html,/\.\/assets\/maya-steel-logo\.svg/);
  assert.ok((await stat(new URL('../dist/assets/maya-steel-logo.svg',import.meta.url))).isFile());
  assert.ok((await stat(new URL('../dist/axis.css',import.meta.url))).isFile());
  assert.doesNotMatch(html,/images\.unsplash\.com/);
  assert.doesNotMatch(html,/assets\/real\/[\w-]+\.svg/);
});

test('all brochure services and accurate claims remain',()=>{
  assert.match(html,/Prices negotiable/);
  assert.match(html,/Maya.*Wakiso/);
  assert.doesNotMatch(html,/ISO 9001|24\/7 Production|Projects Completed|Years Experience/i);
  assert.match(html,/data-service="Plasma CNC Designs"/);
  assert.match(html,/id="quote-form"/);
});

test('phone layout hides desktop nav and prevents horizontal overflow',async()=>{
  const css=await read('public/axis.css');
  assert.match(css, /\.site-header \.desktop-nav,[\s\S]*?\.site-header \.nav-cta\{display:none!important\}/);
  assert.match(css, /\.site-header \.menu-button\{display:flex!important/);
  assert.match(css, /\.mobile-menu\[hidden\]\{display:none!important\}/);
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /overflow-x:clip/);
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1"/);
  assert.match(html, /class="mobile-whatsapp"/);
});

test('customer WhatsApp orders use the correct number and work without optional scripts',async()=>{
  const count=(html.match(/class="axis-service-order"/g)||[]).length;
  assert.equal(count,6,'All six services must link to their individual WhatsApp order messages');
  assert.match(html,/class="axis-whatsapp-order"[^>]*aria-label="Order by WhatsApp at 0757 742 177"/);
  assert.match(html,/wa\.me\/256757742177\?text=/);
  assert.match(html,/Order on WhatsApp/);
  assert.match(html,/Prefer WhatsApp\? Order directly/);
  assert.match(js,/\$\$\('img\[data-fallback\]'\)\.forEach/);
  assert.doesNotMatch(js,/\$\('img\[data-fallback\]'\)\.forEach/);
});

test('motion libraries are progressive, touch-safe and respect reduced motion',async()=>{
  const motion=await read('public/motion-effects.js');
  const css=await read('public/axis.css');
  assert.match(html,/gsap@3\.15\.0/);
  assert.match(html,/lenis@1\.3\.27/);
  assert.match(html,/src="\.\/motion-effects\.js"/);
  assert.match(motion,/gsap\.registerPlugin\(ScrollTrigger\)/);
  assert.match(motion,/import\('https:\/\/cdn\.jsdelivr\.net\/npm\/motion@/);
  assert.match(motion,/import\('https:\/\/cdn\.jsdelivr\.net\/npm\/animejs@/);
  assert.match(motion,/three@0\.180\.0/);
  assert.match(motion,/desktop\.matches && finePointer\.matches/);
  assert.match(motion,/prefers-reduced-motion: reduce/);
  assert.match(motion,/dataSaver/);
  assert.match(css,/axis-three-canvas\{display:none!important/);
  assert.ok((await stat(new URL('../dist/motion-effects.js',import.meta.url))).isFile());
});
