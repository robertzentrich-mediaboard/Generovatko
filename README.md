# Mediaboard – Generátor nabídek

Webová aplikace pro generování cenových nabídek obchodního týmu Mediaboard.  
Běží lokálně v prohlížeči, exportuje nabídky jako **PDF** i **PPTX**.

---

## Požadavky

- **Node.js** verze 18 nebo novější  
  → Stáhnout: [nodejs.org](https://nodejs.org) (doporučeno LTS)

---

## Spuštění na macOS

### 1. Nainstalujte Node.js

Stáhněte a nainstalujte z [nodejs.org](https://nodejs.org). Zkontrolujte instalaci:

```bash
node --version   # mělo by ukázat v18+ nebo v20+
npm --version
```

### 2. Nainstalujte závislosti

V Terminálu přejděte do složky aplikace a spusťte:

```bash
cd ~/Desktop/Generovátko
npm install
```

Tento příkaz automaticky:
- Nainstaluje všechny závislosti (`next`, `react`, `pptxgenjs`, `@react-pdf/renderer`…)
- Zkopíruje fonty DM Sans do složky `public/fonts/`

### 3. Spusťte aplikaci

```bash
npm run dev
```

### 4. Otevřete v prohlížeči

```
http://localhost:3000
```

---

## Jak používat

### Krok 0 – Nastavení profilu (jednou)
Při prvním spuštění vyplňte své údaje:
- Fotografie (JPG/PNG, doporučeno čtvercový formát)
- Jméno a příjmení
- Pracovní pozice
- Email a telefon

Údaje se uloží do prohlížeče (localStorage) a předvyplní se při každém dalším spuštění.  
Kdykoliv je lze změnit kliknutím na ikonu ozubeného kola v pravém horním rohu.

### Krok 1 – Základní údaje
- Název / jméno klienta
- Datum nabídky (předvyplněno dnešním datem)
- Počet variant: 1 nebo 2

### Krok 2 – Konfigurace variant
Pro každou variantu:
- Editovatelný název (Základní / Premium nebo vlastní)
- Cena v CZK nebo EUR
- Zaškrtávací seznam 25 funkcí produktu
- Volitelný popis varianty

### Krok 3 – Náhled a export
- Živý náhled všech 3 stran nabídky
- **Stáhnout PDF** – vygeneruje profesionální PDF dokument
- **Stáhnout PPTX** – vygeneruje prezentaci pro PowerPoint / Keynote

---

## Struktura nabídky

| Strana | Obsah |
|--------|-------|
| **Titulní** | Tmavý navy background, název klienta, datum, foto obchodníka, screenshot produktu |
| **Cenová nabídka** | Přehled variant s cenami a zahrnutými funkcemi |
| **Kontaktní** | Headline, kontaktní údaje, foto obchodníka |

---

## Technický stack

| Technologie | Použití |
|-------------|---------|
| Next.js 14 | Framework (App Router) |
| Tailwind CSS | Styling |
| @react-pdf/renderer | Export PDF |
| pptxgenjs | Export PPTX |
| localStorage | Ukládání dat lokálně (žádná databáze) |

---

## Poznámky

- Aplikace funguje **kompletně offline** po prvním spuštění `npm install`
- Data se ukládají pouze lokálně v prohlížeči – **nic se nikam neodesílá**
- Fonty DM Sans jsou staženy a uloženy lokálně při `npm install`
- Foto obchodníka se ukládá jako base64 v localStorage prohlížeče

---

## Resetování dat

Chcete-li smazat uložená data obchodníka:
1. Otevřete Chrome DevTools (F12)
2. Přejděte na záložku **Application → Local Storage → localhost:3000**
3. Smažte klíče `mb_salesperson` a `mb_current_offer`
