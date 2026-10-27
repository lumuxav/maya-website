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

test('premium redesign and local photo fallbacks are included in the production build',async()=>{
  const refresh=await read('public/refresh.css');
  assert.match(html,/href="\.\/refresh\.css"/);
  assert.match(html,/class="hero hero-v2"/);
  assert.match(html,/METALWORK/);
  assert.match(refresh,/hero-v2-grid/);
  assert.match(refresh,/prefers-reduced-motion/);
  assert.match(refresh,/max-width:700px/);
  assert.match(js,/fallbackApplied/);
  const imageNames=['ribbed-plates','roller-channels','kibaati-strips','louvers','sliding-channels','cnc-plasma'];
  for(const name of imageNames){
    const file='assets/'+name+'.svg';
    const image=await read('public/'+file);
    assert.match(image,/<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    assert.match(html,new RegExp('data-fallback="\\.\\/assets\\/'+name+'\\.svg"'));
    assert.ok((await stat(new URL('../dist/'+file,import.meta.url))).isFile());
  }
  assert.ok((await stat(new URL('../dist/refresh.css',import.meta.url))).isFile());
});
