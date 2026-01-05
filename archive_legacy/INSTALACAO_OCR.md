# 📦 INSTALAÇÃO DO OCR AUTOMÁTICO

Para usar extração automática de imagens, você precisa instalar o **easyocr**.

---

## 🚀 INSTALAÇÃO RÁPIDA

### **Windows:**

```bash
# No terminal do VSCode (PowerShell ou CMD)
pip install easyocr
```

### **Linux/Mac:**

```bash
pip3 install easyocr
```

---

## ✅ VERIFICAR INSTALAÇÃO

```bash
python -c "import easyocr; print('✅ EasyOCR instalado!')"
```

Se aparecer "✅ EasyOCR instalado!", está pronto!

---

## 🎯 USAR OCR AUTOMÁTICO

Depois de instalar:

```bash
# 1. Coloque suas imagens em GRAFOS_SCREENSHOTS/

# 2. Rode:
python scripts/auto_extract.py GRAFOS_SCREENSHOTS

# 3. Teste:
npx tsx scripts/test_batch.ts GRAFOS_TESTE balanced
```

**Pronto!** O OCR vai extrair todos os números automaticamente.

---

## ⚠️ SE DER ERRO

Se o easyocr não instalar ou não funcionar, use a **extração manual**:

```bash
npx tsx scripts/extract_and_test.ts GRAFOS_SCREENSHOTS balanced
```

Você vai colar os números de cada imagem (mais trabalhoso, mas 100% confiável).

---

## 📝 COMPARAÇÃO

| Método | Velocidade | Precisão | Trabalho Manual |
|--------|------------|----------|-----------------|
| **OCR Automático** | ⚡ Rápido | ~80% | ✅ Zero |
| **Extração Manual** | 🐌 Lento | 100% | ❌ Alto |

**Recomendação:** Tente OCR primeiro. Se falhar, use manual.

---

## 🔧 TROUBLESHOOTING

### **"ModuleNotFoundError: No module named 'easyocr'"**

```bash
pip install easyocr
```

### **"Permission denied"**

```bash
pip install easyocr --user
```

### **"pip não é reconhecido"**

Instale Python: https://www.python.org/downloads/

---

## 💡 DICA

O OCR pode não ser 100% preciso. Sempre **verifique os resultados** no relatório:

- Se assertividade muito baixa (<30%): OCR pode ter errado
- Se números estranhos no log: OCR pode ter confundido dígitos
- Nestes casos, use extração manual

---

**Boa sorte! 🚀**
