/**
 * Extract and Test - Versão Windows-friendly
 * 
 * Extrai números das imagens e testa automaticamente
 */

import fs from 'fs';
import path from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  const screenshotsDir = process.argv[2] || 'GRAFOS_SCREENSHOTS';
  const profile = process.argv[3] || 'balanced';
  const outputDir = 'GRAFOS_TESTE';

  console.log('\n' + '='.repeat(80));
  console.log('EXTRACT AND TEST - EXTRAÇÃO + ANÁLISE');
  console.log('='.repeat(80));
  console.log(`Pasta de screenshots: ${screenshotsDir}`);
  console.log(`Perfil: ${profile}`);
  console.log('='.repeat(80) + '\n');

  // Verificar pasta
  if (!fs.existsSync(screenshotsDir)) {
    console.log(`❌ Pasta não encontrada: ${screenshotsDir}`);
    rl.close();
    return;
  }

  // Criar pasta de saída
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Encontrar imagens
  const files = fs.readdirSync(screenshotsDir)
    .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.log(`❌ Nenhuma imagem encontrada em ${screenshotsDir}`);
    rl.close();
    return;
  }

  console.log(`📸 Encontradas ${files.length} imagens\n`);
  console.log('🔄 INSTRUÇÕES:');
  console.log('   1. Para cada imagem, olhe os números');
  console.log('   2. Cole todos os valores (pode ser em uma linha ou várias)');
  console.log('   3. Digite FIM e pressione Enter');
  console.log('   4. Repita para todas as imagens\n');
  console.log('='.repeat(80) + '\n');

  let successCount = 0;

  // Processar cada imagem
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const outputFile = path.join(outputDir, `grafo_${String(i + 1).padStart(3, '0')}.txt`);

    console.log(`\n[${ i + 1}/${files.length}] 📸 ${file}`);
    console.log('-'.repeat(80));
    console.log('Cole os valores abaixo (termine com FIM):');

    // Coletar valores
    const lines: string[] = [];
    while (true) {
      const line = await question('');
      if (line.trim().toUpperCase() === 'FIM') {
        break;
      }
      if (line.trim()) {
        lines.push(line);
      }
    }

    // Extrair números
    const text = lines.join(' ');
    const pattern = /(\d+[.,]\d+)x?/g;
    const matches = text.match(pattern);

    if (!matches || matches.length === 0) {
      console.log('   ❌ Nenhum valor encontrado! Pulando...\n');
      continue;
    }

    // Converter para float
    const values: number[] = [];
    for (const match of matches) {
      const cleaned = match.replace('x', '').replace(',', '.');
      const val = parseFloat(cleaned);
      if (val >= 0.5 && val <= 1000) {
        values.push(val);
      }
    }

    if (values.length < 60) {
      console.log(`   ⚠️  AVISO: Apenas ${values.length} valores (mínimo: 60)`);
      const confirm = await question('   Continuar? (s/n): ');
      if (confirm.toLowerCase() !== 's') {
        console.log('   Pulando...\n');
        continue;
      }
    }

    // Salvar
    const content = values.map(v => v.toFixed(2)).join('\n');
    fs.writeFileSync(outputFile, content);

    console.log(`   ✅ Extraídos ${values.length} valores → ${outputFile}\n`);
    successCount++;
  }

  console.log('\n' + '='.repeat(80));
  console.log(`✅ Extraídos: ${successCount}/${files.length}`);
  console.log('='.repeat(80) + '\n');

  if (successCount === 0) {
    console.log('❌ Nenhum grafo foi extraído');
    rl.close();
    return;
  }

  // Perguntar se quer testar
  const testNow = await question('Deseja executar testes agora? (s/n): ');

  if (testNow.toLowerCase() === 's') {
    console.log('\n🎯 Executando testes em massa...\n');
    rl.close();

    try {
      execSync(`npx tsx scripts/test_batch.ts ${outputDir} ${profile}`, { stdio: 'inherit' });
    } catch (error) {
      console.log('\n❌ Erro ao executar testes');
    }
  } else {
    console.log('\n✅ Pronto! Execute:');
    console.log(`   npx tsx scripts/test_batch.ts ${outputDir} ${profile}\n`);
    rl.close();
  }
}

main().catch(error => {
  console.error('Erro:', error);
  rl.close();
  process.exit(1);
});
