const fs = require('fs');
const path = require('path');

const GRAPHS_DIR = path.join(__dirname, '../GRAFOS_TESTE');
const BET_VALUE = 50.00; // Normal Stake
const STOP_LOSS_SEQ = 3; // Trigger for Cool Down

async function runAnalysis() {
    console.log("🔍 ANALISANDO MELHOR GATILHO PARA SAIR DO COOL DOWN...");
    
    let files = fs.readdirSync(GRAPHS_DIR).filter(f => f.endsWith('.txt') && !f.startsWith('RELATORIO'));
    
    let stats = {
        totalCoolDowns: 0,
        pinkTrigger: { count: 0, next10Wins: 0, next10Losses: 0 },
        purpleTrigger: { count: 0, next10Wins: 0, next10Losses: 0 }
    };

    for (const file of files) {
        const content = fs.readFileSync(path.join(GRAPHS_DIR, file), 'utf-8');
        const values = content.trim().split(/\s+/).map(v => parseFloat(v));
        
        // Simulation State
        let consecutiveLosses = 0;
        let inCoolDown = false;
        let purpleCount = 0; // Track consecutive purples inside Cool Down

        for (let i = 0; i < values.length; i++) {
            const candle = values[i];
            
            // --- LOGIC BEFORE COOL DOWN ---
            if (!inCoolDown) {
                // Simulate a generic strategy loss (if candle < 2.0)
                // This is a naive approx, assuming we bet on every candle until CD.
                // In reality V8 selects bets, but here we want to find "Bad Sequences" generic.
                if (candle < 2.0) {
                    consecutiveLosses++;
                } else {
                    consecutiveLosses = 0;
                }

                if (consecutiveLosses >= STOP_LOSS_SEQ) {
                    inCoolDown = true;
                    stats.totalCoolDowns++;
                    purpleCount = 0; // Reset triggers
                    continue; // Skip to next (we are now in CD)
                }
            } 
            
            // --- LOGIC INSIDE COOL DOWN (Waiting for Trigger) ---
            else {
                // Check Trigger 1: PINK (>10x)
                if (candle >= 10.0) {
                    // FOUND PINK TRIGGER
                    inCoolDown = false; // Release
                    consecutiveLosses = 0;
                    stats.pinkTrigger.count++;
                    
                    // Evaluate Life after Release (Next 10 rounds)
                    analyzeFuture(values, i + 1, 'pinkTrigger', stats);
                    continue; 
                }
                
                // Check Trigger 2: 2 PURPLES (>2.0x)
                if (candle >= 2.0 && candle < 10.0) {
                    purpleCount++;
                } else if (candle < 2.0) {
                    purpleCount = 0;
                }

                if (purpleCount >= 2) {
                    // FOUND PURPLE TRIGGER
                    inCoolDown = false; // Release
                    consecutiveLosses = 0;
                    stats.purpleTrigger.count++;
                    
                    // Evaluate Life after Release (Next 10 rounds)
                    analyzeFuture(values, i + 1, 'purpleTrigger', stats);
                    continue;
                }
            }
        }
    }

    printReport(stats);
}

function analyzeFuture(values, startIndex, type, stats) {
    // Check next 10 candles
    // If we find meaningful profits (Pinks or good Purples) vs Losses
    // Simple metric: Win Rate (>2.0) in next 10
    
    const horizon = 10;
    let wins = 0;
    let losses = 0;
    
    for (let j = 0; j < horizon; j++) {
        if (startIndex + j >= values.length) break;
        const futureCandle = values[startIndex + j];
        if (futureCandle >= 2.0) wins++;
        else losses++;
    }
    
    stats[type].next10Wins += wins;
    stats[type].next10Losses += losses;
}

function printReport(stats) {
    console.log("\n=================================");
    console.log("📊 RESULTADO DA ANÁLISE (40 GRAFOS)");
    console.log("=================================");
    console.log(`❄️  Total de Cool Downs Ativados: ${stats.totalCoolDowns}`);
    
    console.log("\n🌸 GATILHO: 1x ROSA (>10x)");
    console.log(`   - Ocorrências: ${stats.pinkTrigger.count}`);
    const pinkTotal = stats.pinkTrigger.next10Wins + stats.pinkTrigger.next10Losses;
    const pinkRate = pinkTotal ? (stats.pinkTrigger.next10Wins / pinkTotal * 100).toFixed(2) : 0;
    console.log(`   - Qualidade Pós-Saída (WinRate próx 10): ${pinkRate}%`);

    console.log("\n🟣 GATILHO: 2x ROXAS (>2.0x)");
    console.log(`   - Ocorrências: ${stats.purpleTrigger.count}`);
    const purpTotal = stats.purpleTrigger.next10Wins + stats.purpleTrigger.next10Losses;
    const purpRate = purpTotal ? (stats.purpleTrigger.next10Wins / purpTotal * 100).toFixed(2) : 0;
    console.log(`   - Qualidade Pós-Saída (WinRate próx 10): ${purpRate}%`);
    
    console.log("\n📝 CONCLUSÃO:");
    if (parseFloat(pinkRate) > parseFloat(purpRate)) {
        console.log("✅ AGUARDAR UMA ROSA É MAIS SEGURO.");
    } else {
        console.log("✅ AGUARDAR DUAS ROXAS É MAIS SEGURO.");
    }
}

runAnalysis();
