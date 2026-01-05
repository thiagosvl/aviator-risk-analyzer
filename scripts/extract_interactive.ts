/**
 * Extração Interativa - Cole os valores e gera arquivo .txt
 */

import fs from 'fs';
import path from 'path';
import * as readline from 'readline';

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
  console.log('\n' + '='.repeat(80));
  console.log('EXTRAÇÃO INTERATIVA DE GRAFOS');
  console.log('='.repeat(80));
  console.log('\nComo usar:');
  console.log('1. Olhe sua screenshot do histórico');
  console.log('2. Copie os valores (da esquerda pra direita, linha por linha)');
  console.log('3. Cole aqui quando solicitado');
  console.log('4. Script gera o arquivo .txt automaticamente\n');
  
  // Perguntar nome do arquivo
  const filename = await question('Nome do arquivo (ex: grafo_003): ');
  const outputPath = path.join('GRAFOS_TESTE', `${filename}.txt`);
  
  console.log('\n' + '-'.repeat(80));
  console.log('Cole os valores abaixo (pode ser em uma linha ou várias)');
  console.log('Quando terminar, digite "FIM" em uma linha vazia e pressione Enter');
  console.log('-'.repeat(80) + '\n');
  
  // Coletar valores
  const lines: string[] = [];
  let line = '';
  
  while (true) {
    line = await question('');
    if (line.trim().toUpperCase() === 'FIM') {
      break;
    }
    if (line.trim()) {
      lines.push(line);
    }
  }
  
  // Juntar todas as linhas
  const text = lines.join(' ');
  
  // Extrair números
  // Aceita formatos: 1.33x, 1.33, 1,33x, 1,33
  const pattern = /(\d+[.,]\d+)x?/g;
  const matches = text.match(pattern);
  
  if (!matches || matches.length === 0) {
    console.log('\n❌ Nenhum valor encontrado! Verifique o formato.');
    rl.close();
    return;
  }
  
  // Converter para float
  const values: number[] = [];
  for (const match of matches) {
    const cleaned = match.replace('x', '').replace(',', '.');
    const val = parseFloat(cleaned);
    
    // Validar range
    if (val >= 0.5 && val <= 1000) {
      values.push(val);
    }
  }
  
  if (values.length === 0) {
    console.log('\n❌ Nenhum valor válido encontrado!');
    rl.close();
    return;
  }
  
  console.log(`\n✅ Extraídos ${values.length} valores`);
  
  // Validar quantidade
  if (values.length < 60) {
    console.log(`⚠️  AVISO: Apenas ${values.length} valores (mínimo recomendado: 60)`);
    const confirm = await question('Continuar mesmo assim? (s/n): ');
    if (confirm.toLowerCase() !== 's') {
      console.log('Cancelado.');
      rl.close();
      return;
    }
  }
  
  // Criar diretório se não existir
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Salvar arquivo
  const content = values.map(v => v.toFixed(2)).join('\n');
  fs.writeFileSync(outputPath, content);
  
  console.log(`\n💾 Arquivo salvo: ${outputPath}`);
  console.log(`📊 Total de velas: ${values.length}`);
  console.log(`📈 Rodadas testáveis: ${values.length - 25}`);
  
  // Perguntar se quer testar agora
  console.log('\n' + '-'.repeat(80));
  const testNow = await question('Deseja testar agora? (s/n): ');
  
  if (testNow.toLowerCase() === 's') {
    const profile = await question('Perfil (balanced/conservative/aggressive): ') || 'balanced';
    
    console.log(`\n🎯 Testando com perfil ${profile}...\n`);
    
    rl.close();
    
    // Executar teste
    const { execSync } = require('child_process');
    try {
      execSync(`npx tsx scripts/test_v4.ts ${outputPath} ${profile}`, { stdio: 'inherit' });
    } catch (error) {
      console.log('\n❌ Erro ao executar teste');
    }
  } else {
    console.log('\n✅ Pronto! Execute:');
    console.log(`   npx tsx scripts/test_v4.ts ${outputPath} balanced\n`);
    rl.close();
  }
}

main().catch(error => {
  console.error('Erro:', error);
  rl.close();
  process.exit(1);
});
