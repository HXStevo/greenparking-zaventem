const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const nunjucks = require('nunjucks');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'content');
const TEMPLATES = path.join(ROOT, 'templates');

// Configure Nunjucks (noCache for watch mode)
const env = nunjucks.configure(TEMPLATES, {
    autoescape: false,
    trimBlocks: true,
    lstripBlocks: true,
    noCache: true
});

// Load global content
const globals = yaml.load(fs.readFileSync(path.join(CONTENT, '_globals.yml'), 'utf8'));

// Pages to build (content file -> output file)
const pages = [
    { content: 'index.yml', template: 'index.njk', output: 'index.html' },
    { content: 'parking-zaventem.yml', template: 'parking-zaventem.njk', output: 'parking-zaventem.html' },
    { content: 'tarieven.yml', template: 'tarieven.njk', output: 'tarieven.html' },
    { content: 'shuttle-service.yml', template: 'shuttle-service.njk', output: 'shuttle-service.html' },
    { content: 'locaties.yml', template: 'locaties.njk', output: 'locaties.html' },
    { content: 'faq.yml', template: 'faq.njk', output: 'faq.html' },
    { content: 'contact.yml', template: 'contact.njk', output: 'contact.html' },
    { content: 'klantenservice.yml', template: 'klantenservice.njk', output: 'klantenservice.html' },
    { content: 'over-greenparking-zaventem.yml', template: 'over-greenparking-zaventem.njk', output: 'over-greenparking-zaventem.html' },
    { content: 'reserveren.yml', template: 'reserveren.njk', output: 'reserveren.html' },
    { content: 'goedkoop-lang-parkeren-zaventem.yml', template: 'goedkoop-lang-parkeren-zaventem.njk', output: 'goedkoop-lang-parkeren-zaventem.html' },
    { content: 'parking-zaventem-reserveren.yml', template: 'parking-zaventem-reserveren.njk', output: 'parking-zaventem-reserveren.html' },
    { content: 'parking-zaventem-vergelijken.yml', template: 'parking-zaventem-vergelijken.njk', output: 'parking-zaventem-vergelijken.html' },
    { content: 'lang-parkeren.yml', template: 'lang-parkeren.njk', output: 'lang-parkeren.html' },
    { content: 'kort-parkeren.yml', template: 'kort-parkeren.njk', output: 'kort-parkeren.html' },
    { content: 'algemene-voorwaarden.yml', template: 'legal-page.njk', output: 'algemene-voorwaarden.html' },
    { content: 'privacy-verklaring.yml', template: 'legal-page.njk', output: 'privacy-verklaring.html' },
];

// French pages (use fr/ globals and output to fr/ subdirectory)
const frenchPages = [
    { content: 'fr/index.yml', template: 'fr/index.njk', output: 'fr/index.html' },
    { content: 'fr/parking-zaventem.yml', template: 'fr/parking-zaventem.njk', output: 'fr/parking-zaventem.html' },
    { content: 'fr/tarifs.yml', template: 'fr/tarifs.njk', output: 'fr/tarifs.html' },
    { content: 'fr/a-propos-de-greenparking-zaventem.yml', template: 'fr/a-propos-de-greenparking-zaventem.njk', output: 'fr/a-propos-de-greenparking-zaventem.html' },
    { content: 'fr/foire-aux-questions.yml', template: 'fr/foire-aux-questions.njk', output: 'fr/foire-aux-questions.html' },
    { content: 'fr/lieux.yml', template: 'fr/lieux.njk', output: 'fr/lieux.html' },
    { content: 'fr/reserver-ma-place.yml', template: 'fr/reserver-ma-place.njk', output: 'fr/reserver-ma-place.html' },
    { content: 'fr/parking-economique-a-long-terme.yml', template: 'fr/parking-economique-a-long-terme.njk', output: 'fr/parking-economique-a-long-terme.html' },
    { content: 'fr/parking-a-court-terme.yml', template: 'fr/parking-a-court-terme.njk', output: 'fr/parking-a-court-terme.html' },
    { content: 'fr/comparaison-des-parkings-zaventem.yml', template: 'fr/comparaison-des-parkings-zaventem.njk', output: 'fr/comparaison-des-parkings-zaventem.html' },
    { content: 'fr/parking-aeroport-de-zaventem.yml', template: 'fr/parking-aeroport-de-zaventem.njk', output: 'fr/parking-aeroport-de-zaventem.html' },
    { content: 'fr/parking-long-terme.yml', template: 'fr/parking-long-terme.njk', output: 'fr/parking-long-terme.html' },
    { content: 'fr/parking-de-arrivee-a-zaventem.yml', template: 'fr/parking-de-arrivee-a-zaventem.njk', output: 'fr/parking-de-arrivee-a-zaventem.html' },
    { content: 'fr/reservez-une-place-deparking-zaventem.yml', template: 'fr/reservez-une-place-deparking-zaventem.njk', output: 'fr/reservez-une-place-deparking-zaventem.html' },
];

// Clean and create dist directory
if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST, { recursive: true });

// Build each Dutch page
pages.forEach(({ content, template, output }) => {
    const pageData = yaml.load(fs.readFileSync(path.join(CONTENT, content), 'utf8'));

    const html = env.render(template, {
        globals: globals,
        page: pageData,
        page_usp_bar: pageData.usp_bar || null
    });

    fs.writeFileSync(path.join(DIST, output), html);
    console.log(`Built: ${output}`);
});

// Build French pages
const frGlobals = yaml.load(fs.readFileSync(path.join(CONTENT, 'fr', '_globals.yml'), 'utf8'));
fs.mkdirSync(path.join(DIST, 'fr'), { recursive: true });

frenchPages.forEach(({ content, template, output }) => {
    const pageData = yaml.load(fs.readFileSync(path.join(CONTENT, content), 'utf8'));

    const html = env.render(template, {
        globals: frGlobals,
        page: pageData,
        page_usp_bar: pageData.usp_bar || null
    });

    fs.writeFileSync(path.join(DIST, output), html);
    console.log(`Built: ${output}`);
});

// Copy static assets
const assetDirs = ['css', 'js', 'images'];
assetDirs.forEach(dir => {
    const src = path.join(ROOT, dir);
    const dest = path.join(DIST, dir);
    if (fs.existsSync(src)) {
        copyDir(src, dest);
        console.log(`Copied: ${dir}/`);
    }
});

// Copy admin directory for Decap CMS
const adminSrc = path.join(ROOT, 'admin');
if (fs.existsSync(adminSrc)) {
    copyDir(adminSrc, path.join(DIST, 'admin'));
    console.log('Copied: admin/');
}

console.log('\nBuild complete! Output in dist/');

// Watch mode: rebuild when content or templates change
if (process.argv.includes('--watch')) {
    console.log('Watching for changes in content/ and templates/...\n');

    // Track file modification times
    const lastMtimes = {};

    function getFiles(dir) {
        const files = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...getFiles(fullPath));
            } else {
                files.push(fullPath);
            }
        }
        return files;
    }

    function checkForChanges() {
        const files = [...getFiles(CONTENT), ...getFiles(TEMPLATES)];
        let changed = false;

        for (const file of files) {
            try {
                const mtime = fs.statSync(file).mtimeMs;
                if (lastMtimes[file] !== mtime) {
                    if (lastMtimes[file] !== undefined) {
                        changed = true;
                    }
                    lastMtimes[file] = mtime;
                }
            } catch (e) { /* file may have been deleted */ }
        }

        if (changed) {
            try {
                const freshGlobals = yaml.load(fs.readFileSync(path.join(CONTENT, '_globals.yml'), 'utf8'));
                const freshFrGlobals = yaml.load(fs.readFileSync(path.join(CONTENT, 'fr', '_globals.yml'), 'utf8'));

                pages.forEach(({ content, template, output }) => {
                    const pageData = yaml.load(fs.readFileSync(path.join(CONTENT, content), 'utf8'));
                    const html = env.render(template, {
                        globals: freshGlobals,
                        page: pageData,
                        page_usp_bar: pageData.usp_bar || null
                    });
                    fs.writeFileSync(path.join(DIST, output), html);
                });

                fs.mkdirSync(path.join(DIST, 'fr'), { recursive: true });
                frenchPages.forEach(({ content, template, output }) => {
                    const pageData = yaml.load(fs.readFileSync(path.join(CONTENT, content), 'utf8'));
                    const html = env.render(template, {
                        globals: freshFrGlobals,
                        page: pageData,
                        page_usp_bar: pageData.usp_bar || null
                    });
                    fs.writeFileSync(path.join(DIST, output), html);
                });

                console.log(`[${new Date().toLocaleTimeString()}] Rebuilt all pages`);
            } catch (err) {
                console.error('Build error:', err.message);
            }
        }
    }

    // Initial scan to populate mtimes
    checkForChanges();

    // Poll every second
    setInterval(checkForChanges, 1000);
}

// Helper: recursively copy directory
function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
