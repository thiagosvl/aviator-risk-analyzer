import { TestPatternService } from './generate_scenarios';

const service = new TestPatternService();
// Histórico extraído da imagem (Recente -> Antigo)
const history = [
    1.00, 1.19, 1.81, 2.43, 4.25, 1.02, 1.27, 1.54, 1.00, 2.74, 1.97, 
    1.17, 5.71, 1.43, 2.39, 1.06, 2.18, 2.10, 3.98, 29.54, 1.91, 
    1.08, 3.35, 1.00, 25.46, 1.96, 1.30, 1.48, 16.16, 1.00, 1.20, 
    1.97, 30.10, 7.00, 7.31, 1.06, 3.27, 1.51, 4.65, 1.58, 1.00, 
    4.92, 4.85, 3.29, 6.37, 1.68, 1.02, 3.54, 1.00, 1.18, 1.74, 
    1.72, 11.87, 1.29, 1.85, 1.61, 2.06, 2.75, 1.50, 2.73, 1.84
];

const { rec2x, recPink } = service.analyze(history);

console.log('\n--- RESULTADO DA ANÁLISE DE IMAGEM (V3.1) ---');
console.log(`2X: ${rec2x.action} -> ${rec2x.reason}`);
console.log(`PINK: ${recPink.action} -> ${recPink.reason}`);
console.log('---------------------------------------------\n');
