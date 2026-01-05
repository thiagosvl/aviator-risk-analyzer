/**
 * Process All - Extrai de screenshots e testa automaticamente
 * 
 * Workflow:
 * 1. Lê todas as imagens de uma pasta
 * 2. Tenta extrair números (OCR ou manual)
 * 3. Gera arquivos .txt
 * 4. Executa teste em massa
 * 5. Gera relatório consolidado
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Ler argumentos
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Uso: npx tsx scripts/process_all.ts <pasta_screenshots> [profile]');
    console.log('Exemplo: npx tsx scripts/process_all.ts GRAFOS_SCREENSHOTS balanced');
    process.exit(1);
}

const screenshotsDir = args[0];
const profile = args[1] || 'balanced';
const outputDir = 'GRAFOS_TESTE';

console.log('\n' + '='.repeat(80));
console.log('PROCESS ALL - EXTRAÇÃO E TESTE AUTOMÁTICO');
console.log('='.repeat(80));
console.log(`Pasta de screenshots: ${screenshotsDir}`);
console.log(`Pasta de saída: ${outputDir}`);
console.log(`Perfil de teste: ${profile}`);
console.log('='.repeat(80) + '\n');

// Verificar se pasta existe
if (!fs.existsSync(screenshotsDir)) {
    console.log(`❌ Pasta não encontrada: ${screenshotsDir}`);
    process.exit(1);
}

// Criar pasta de saída se não existir
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Encontrar imagens
const imageExtensions = ['.png', '.jpg', '.jpeg', '.bmp'];
const files = fs.readdirSync(screenshotsDir)
    .filter(f => imageExtensions.some(ext => f.toLowerCase().endsWith(ext)))
    .sort();

if (files.length === 0) {
    console.log(`❌ Nenhuma imagem encontrada em ${screenshotsDir}`);
    process.exit(1);
}

console.log(`📸 Encontradas ${files.length} imagens\n`);

// Verificar se OCR está disponível
let hasOCR = false;
try {
    execSync('which tesseract', { stdio: 'ignore' });
    hasOCR = true;
    console.log('✅ Tesseract OCR disponível\n');
} catch {
    console.log('⚠️  Tesseract OCR não disponível');
    console.log('   Instale com: sudo apt-get install tesseract-ocr');
    console.log('   Ou use extração manual\n');
}

if (!hasOCR) {
    console.log('❌ OCR não disponível. Use uma das alternativas:');
    console.log('   1. Instale Tesseract: sudo apt-get install tesseract-ocr');
    console.log('   2. Use extração manual: npx tsx scripts/extract_interactive.ts');
    console.log('   3. Use Python OCR: python3 scripts/extract_from_screenshots.py\n');
    process.exit(1);
}

// Processar cada imagem
console.log('🔄 Processando imagens...\n');

let successCount = 0;
const extractedFiles: string[] = [];

for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imagePath = path.join(screenshotsDir, file);
    const outputFile = path.join(outputDir, `grafo_${String(i + 1).padStart(3, '0')}.txt`);
    
    console.log(`[${i + 1}/${files.length}] ${file}`);
    
    try {
        // Usar Python OCR script
        const pythonScript = path.join(__dirname, 'extract_from_screenshots.py');
        
        // Executar OCR
        const result = execSync(`python3 ${pythonScript} manual`, {
            input: imagePath,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        // Por enquanto, pular OCR e instruir usuário
        console.log(`   ⚠️  OCR automático ainda não implementado`);
        console.log(`   Use: npx tsx scripts/extract_interactive.ts\n`);
        
    } catch (error) {
        console.log(`   ❌ Erro ao processar\n`);
    }
}

if (successCount === 0) {
    console.log('\n❌ Nenhum grafo foi extraído com sucesso');
    console.log('\n💡 ALTERNATIVA: Use extração manual');
    console.log('   npx tsx scripts/extract_interactive.ts\n');
    process.exit(1);
}

console.log(`\n✅ Extraídos ${successCount}/${files.length} grafos\n`);

// Executar teste em massa
console.log('🎯 Executando testes...\n');

try {
    execSync(`npx tsx scripts/test_batch.ts ${outputDir} ${profile}`, { stdio: 'inherit' });
} catch (error) {
    console.log('\n❌ Erro ao executar testes');
    process.exit(1);
}

console.log('\n✅ Processo completo!\n');
