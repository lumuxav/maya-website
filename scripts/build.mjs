import {rm,cp,mkdir,stat} from 'node:fs/promises';
const src=new URL('../public/',import.meta.url),dst=new URL('../dist/',import.meta.url);
await rm(dst,{force:true,recursive:true});await mkdir(dst,{recursive:true});await cp(src,dst,{recursive:true});for(const name of ['index.html','styles.css','app.js','404.html'])await stat(new URL(name,dst));console.log('Build complete: dist/');
