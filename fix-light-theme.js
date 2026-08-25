const fs = require('fs');

function readFile(p) {
    const src = fs.readFileSync(p, 'utf8');
    return { src, eol: src.includes('\r\n') ? '\r\n' : '\n' };
}
function writeFile(p, content, eol) {
    fs.writeFileSync(p, content.split('\n').join(eol), 'utf8');
}

// ── 1. page.js: remove 3rd hero button (Referanslar) ──
{
    const p = 'src/app/(public)/page.js';
    const { src, eol } = readFile(p);
    const oldBtn = `            <a href="#projects" className="btn btn-outline btn-large">
              Referanslar <i className="ph ph-arrow-right" />
            </a>
`;
    if (src.includes(oldBtn)) {
        const next = src.replace(oldBtn, '');
        writeFile(p, next, eol);
        console.log('page.js: removed Referanslar hero button');
    } else {
        console.log('page.js: Referanslar button NOT FOUND');
    }
}

// ── 2. analiz/page.js: fix isCurrent white text on light bg ──
{
    const p = 'src/app/(public)/analiz/page.js';
    const { src, eol } = readFile(p);
    const old = `color: isDone ? '#16a34a' : isCurrent ? '#fff' : '#6b6459'`;
    const next = `color: isDone ? '#16a34a' : isCurrent ? '#4f46e5' : '#6b6459'`;
    if (src.includes(old)) {
        writeFile(p, src.replace(old, next), eol);
        console.log('analiz/page.js: fixed isCurrent text color');
    } else {
        console.log('analiz/page.js: isCurrent color NOT FOUND');
    }
}

// ── 3. analiz/[id]/page.js: soften harsh dark shadow on score banner ──
{
    const p = 'src/app/(public)/analiz/[id]/page.js';
    const { src, eol } = readFile(p);
    const oldShadow = `boxShadow: '0 20px 50px rgba(0,0,0,0.5)',`;
    const newShadow = `boxShadow: '0 20px 50px rgba(20,16,10,0.12)',`;
    if (src.includes(oldShadow)) {
        writeFile(p, src.replace(oldShadow, newShadow), eol);
        console.log('analiz/[id]/page.js: softened score banner shadow');
    } else {
        console.log('analiz/[id]/page.js: score banner shadow NOT FOUND');
    }
}

// ── 4. analiz/[id]/page.js: fix dark bg on priority action items ──
{
    const p = 'src/app/(public)/analiz/[id]/page.js';
    const { src, eol } = readFile(p);
    const oldBg = `padding: '16px', background: 'rgba(0,0,0,0.2)',`;
    const newBg = `padding: '16px', background: 'rgba(255,255,255,0.6)',`;
    if (src.includes(oldBg)) {
        writeFile(p, src.replace(oldBg, newBg), eol);
        console.log('analiz/[id]/page.js: fixed priority action item bg');
    } else {
        console.log('analiz/[id]/page.js: priority action bg NOT FOUND');
    }
}

console.log('Done.');
