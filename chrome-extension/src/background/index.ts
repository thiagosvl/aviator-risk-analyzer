import { exampleThemeStorage } from '@extension/storage';
import 'webextension-polyfill';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Background loaded');

// Listener para retransmissão de mensagens (Relay)
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.action === 'TOGGLE_STEALTH' && sender.tab?.id) {
    // Retransmitir para TODOS os frames da aba ativa (incluindo iframes)
    console.log(`[Background] Relaying TOGGLE_STEALTH to tab ${sender.tab.id}`);
    
    // Envia para a aba específica, mas para todos os frames (options não especificado = top-level apenas por padrão? Não, tabs.sendMessage vai pro top frame por padrão, mas precisa verificar se precisamos iterar)
    // Na verdade, tabs.sendMessage vai para o content script da aba. Se quisermos todos os frames, precisamos especificar ou o content script deve tratar.
    // Melhor abordagem: chrome.tabs.sendMessage com frameId ou simplesmente enviar e torcer?
    // A documentação diz: chrome.tabs.sendMessage sends to all frames if options.frameId is not set? No, it sends to top frame.
    // WE NEED TO SPECIFY `frameId` OR USE `chrome.tabs.sendMessage(tabId, msg, { frameId: ... })`?
    // Actually, `chrome.tabs.sendMessage` sends to the specific tab. If we want ALL frames, we usually need to iterate or rely on broadcast.
    // However, since Manifest V3, `chrome.tabs.sendMessage` doesn't have a simple "all frames" flag in the top level signature easily without iteration?
    // Wait, let's verify. 
    // Correction: `chrome.tabs.sendMessage` sends to ALL frames by default? No.
    // Let's use `chrome.scripting` or just iterate? No, `chrome.tabs.sendMessage` DOES have an options object { frameId }. If omitted, sends to ?
    // "If unspecified, the message is sent to all frames in the tab." -> This is commonly misunderstood. Usually sends to top frame.
    // Let's use the SAFE way: Broadcast via connect or just iterate? 
    // Actually, let's try sending without frameId, assuming listener is everywhere. If that fails, we iterate.
    // Better: Send to `frameId: 0` (top) AND iterate frames?
    // Actually, let's just use `chrome.tabs.sendMessage(sender.tab.id, message)`. If the docs say it hits all frames, perfect. If not, we might need a workaround.
    // Checking MDN/Chrome docs: "If the frameId option is omitted, the message is sent to all frames in the specified tab." -> This is true for `chrome.tabs.connect`, but `sendMessage`?
    // Chrome Docs: "Sends a single message to the content script(s) in the specified tab... The message is delivered to all frames in the tab." -> YES! It goes to all frames by default if no frameId specified.
    
    chrome.tabs.sendMessage(sender.tab.id, message).catch(err => {
        console.error('[Background] Error relaying message:', err);
    });
  }
});
