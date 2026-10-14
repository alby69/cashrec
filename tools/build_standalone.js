#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const WEB_INDEX = path.join(ROOT, 'web', 'index.html');
const CSS_FILE = path.join(ROOT, 'web', 'static', 'css', 'cashrec.css');
const MAIN_JS = path.join(ROOT, 'web', 'static', 'js', 'main.js');
const WORKER_JS = path.join(ROOT, 'web', 'static', 'js', 'worker.js');
const OUTPUT_HTML = path.join(ROOT, 'app', 'cashrec.html');

async function build() {
    const isCheck = process.argv.includes('--check');

    let html = fs.readFileSync(WEB_INDEX, 'utf-8');
    const cssContent = fs.readFileSync(CSS_FILE, 'utf-8');
    const workerSource = fs.readFileSync(WORKER_JS, 'utf-8');

    // 1. Inline CSS
    const cssTagRegex = /<link\s+rel=["']stylesheet["']\s+href=["']static\/css\/cashrec\.css["']\s*\/?>/i;
    if (!cssTagRegex.test(html)) {
        throw new Error('CSS link tag not found in web/index.html');
    }
    html = html.replace(cssTagRegex, `<style>\n${cssContent}\n</style>`);

    // 2. Bundle main.js
    const result = await esbuild.build({
        entryPoints: [MAIN_JS],
        bundle: true,
        write: false,
        format: 'iife',
        minify: false,
        sourcemap: false
    });

    if (!result.outputFiles || result.outputFiles.length === 0) {
        throw new Error('esbuild failed to produce output bundle');
    }
    const bundledJs = result.outputFiles[0].text;

    // 3. Inject mode, worker source, and bundled JS
    const safeWorkerSourceJson = JSON.stringify(workerSource).replace(/<\/script/g, '<\\/script');
    const injectedGlobals = `<script>\nwindow.__CASHREC_MODE__ = 'standalone';\nwindow.__CASHREC_WORKER_SOURCE__ = ${safeWorkerSourceJson};\n</script>\n`;

    const scriptTagRegex = /<script\s+type=["']module["']\s+src=["']static\/js\/main\.js["']\s*><\/script>/i;
    if (!scriptTagRegex.test(html)) {
        throw new Error('main.js script tag not found in web/index.html');
    }
    html = html.replace(scriptTagRegex, `${injectedGlobals}<script>\n${bundledJs}\n</script>`);

    // 4. Remove manifest link tag if present
    html = html.replace(/<link\s+rel=["']manifest["'].*?>\n?/gi, '');

    // 5. Add Header Comment
    const generatedHeader = `<!-- GENERATO da tools/build_standalone.js — NON MODIFICARE A MANO -->\n`;
    html = generatedHeader + html;

    if (isCheck) {
        if (!fs.existsSync(OUTPUT_HTML)) {
            console.error(`ERROR: ${OUTPUT_HTML} does not exist.`);
            process.exit(1);
        }
        const existingContent = fs.readFileSync(OUTPUT_HTML, 'utf-8');
        if (existingContent !== html) {
            console.error(`ERROR: ${OUTPUT_HTML} is out of date compared to web/ sources. Run 'npm run build:standalone' to update.`);
            process.exit(1);
        }
        console.log('Standalone HTML check passed.');
        process.exit(0);
    } else {
        fs.mkdirSync(path.dirname(OUTPUT_HTML), { recursive: true });
        fs.writeFileSync(OUTPUT_HTML, html, 'utf-8');
        console.log(`Successfully generated ${path.relative(ROOT, OUTPUT_HTML)}`);
    }
}

build().catch(err => {
    console.error(err);
    process.exit(1);
});
