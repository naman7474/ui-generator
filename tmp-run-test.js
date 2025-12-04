const fs = require('fs');
const path = require('path');

const fixReactDomClientImport = require('./tmp-test-dedupe.js').fixReactDomClientImport || (function() { return null; });

const file = process.argv[2];
const code = fs.readFileSync(file, 'utf8');
const out = (typeof fixReactDomClientImport === 'function') ? fixReactDomClientImport(code) : code;
process.stdout.write(out);

