const fs = require('fs');
const path = require('path');

const GRAFOS_DIR = path.join(__dirname, '../GRAFOS_TESTE');

function repairFiles() {
    const files = fs.readdirSync(GRAFOS_DIR).filter(f => f.endsWith('.txt'));
    let totalFixed = 0;

    files.forEach(file => {
        const filePath = path.join(GRAFOS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n');
        
        let fileModified = false;
        const newLines = lines.map(line => {
            const val = parseFloat(line);
            
            // Heuristic: If it's an integer >= 100, and looks like a concatenated decimal (e.g., 111, 241, 100)
            // Note: In some cases, real yellows/pinks could be > 100, but they usually have decimals and are rare.
            // These errors always end in .00 after being parsed by common tools.
            if (val >= 100 && Number.isInteger(val)) {
                const fixed = val / 100;
                fileModified = true;
                totalFixed++;
                return fixed.toFixed(2);
            }
            return line;
        });

        if (fileModified) {
            fs.writeFileSync(filePath, newLines.join('\n') + '\n');
            console.log(`✅ Reparado: ${file}`);
        }
    });

    console.log(`\n✨ Total de valores corrigidos: ${totalFixed} em ${files.length} arquivos.`);
}

repairFiles();
