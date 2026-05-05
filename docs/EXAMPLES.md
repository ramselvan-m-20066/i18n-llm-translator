# Examples

## Basic Usage

### Properties Files

**Source file (`messages_en.properties`):**
```properties
welcome=Welcome to our app
button.save=Save changes
error.required=This field is required
placeholder.name=Enter your {0}
```

**Target file (`messages_es.properties`):**
```properties
welcome=Bienvenido a nuestra app
button.save=
error.required=Este campo es obligatorio
```

**Command:**
```bash
i18n-translate translate -s messages_en.properties -t messages_es.properties -l es
```

**Result:**
```properties
welcome=Bienvenido a nuestra app
button.save=Guardar cambios
error.required=Este campo es obligatorio
placeholder.name=Ingresa tu {0}
```

### JSON Files

**Source file (`messages_en.json`):**
```json
{
  "welcome": "Welcome",
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "errors": {
    "required": "This field is required"
  }
}
```

**Target file (`messages_es.json`):**
```json
{
  "welcome": "Bienvenido",
  "buttons": {
    "save": "",
    "cancel": "Cancelar"
  }
}
```

**Command:**
```bash
i18n-translate translate -s messages_en.json -t messages_es.json -l es
```

**Result:**
```json
{
  "welcome": "Bienvenido",
  "buttons": {
    "save": "Guardar",
    "cancel": "Cancelar"
  },
  "errors": {
    "required": "Este campo es obligatorio"
  }
}
```

## Advanced Examples

### Custom Configuration

**`i18n-translate.config.json`:**
```json
{
  "sourceLang": "en",
  "defaultTargetLang": "fr",
  "model": "gpt-4",
  "preserveComments": true,
  "batchSize": 10,
  "validationThreshold": 0.8
}
```

**Command:**
```bash
i18n-translate translate -s messages_en.properties -t messages_fr.properties
```

### Batch Translation

**Directory structure:**
```
locales/
├── en/
│   ├── common.properties
│   ├── auth.properties
│   └── dashboard.properties
└── es/
    ├── common.properties
    ├── auth.properties
    └── dashboard.properties
```

**Command:**
```bash
i18n-translate batch -d locales/en -t locales/es -l es
```

### Validation Only

**Command:**
```bash
i18n-translate validate -s messages_en.properties -t messages_es.properties -l es
```

**Output:**
```
📊 Validation Results:
   ✅ Valid translations: 15
   ❌ Invalid/Missing: 3
   🗑️ Orphaned keys: 1

⚠️ Keys needing attention:
   - button.save: Placeholder mismatch: expected 0, got 1
   - error.email: Empty translation
   - nav.profile: Missing key
```

### Dry Run

**Command:**
```bash
i18n-translate translate -s messages_en.properties -t messages_es.properties -l es --dry-run
```

**Output:**
```
🔍 DRY RUN MODE - No files will be written

📊 Analysis Results:
   Total keys: 20
   ✅ Valid: 15
   ❌ Invalid/Missing: 5
   🗑️ Orphaned: 1

📝 Keys to translate:
   - button.save: Save changes
   - error.email: Please enter a valid email
   - placeholder.search: Search for {0}...
   - message.confirm: Are you sure?
   - nav.settings: Settings
```

## Integration Examples

### Node.js Script

```javascript
import Translator from '@your-scope/i18n-llm-translator';

async function translateFiles() {
    const translator = new Translator({
        apiKey: process.env.OPENAI_API_KEY,
        sourceLang: 'en',
        targetLang: 'es',
        model: 'gpt-4'
    });

    try {
        const result = await translator.smartTranslate(
            './messages_en.properties',
            './messages_es.properties',
            'properties'
        );

        console.log(`✅ Translated ${result.statistics.newlyTranslated} keys`);
        console.log(`📊 Report: ${result.reportPath}`);
    } catch (error) {
        console.error('Translation failed:', error);
    }
}

translateFiles();
```

### Build Script Integration

**`package.json`:**
```json
{
  "scripts": {
    "translate": "i18n-translate translate -s src/locales/en/messages.properties -t src/locales/es/messages.properties -l es",
    "translate:fr": "i18n-translate translate -s src/locales/en/messages.properties -t src/locales/fr/messages.properties -l fr",
    "translate:all": "npm run translate && npm run translate:fr"
  }
}
```

### CI/CD Integration

**`.github/workflows/deploy.yml`:**
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Translate locales
        run: npm run translate:all
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      
      - name: Deploy
        run: # Your deployment steps
```

## Error Handling

### Common Issues

**API Key Not Set:**
```bash
export OPENAI_API_KEY=sk-your-key-here
```

**Invalid File Paths:**
```bash
i18n-translate translate -s ./src/locales/en/messages.properties -t ./src/locales/es/messages.properties -l es
```

**Unsupported Language:**
```bash
# Use ISO 639-1 language codes
i18n-translate translate -s messages_en.properties -t messages_de.properties -l de
```

### Error Messages

- `Source file is required`: Specify source file with `-s` option
- `Target file is required`: Specify target file with `-t` option
- `Target language is required`: Specify language with `-l` option
- `OpenAI API key is required`: Set `OPENAI_API_KEY` environment variable

## Performance Tips

1. **Use batch translation** for multiple files
2. **Set appropriate batch size** (default 20, reduce for slower networks)
3. **Use dry run first** to estimate costs
4. **Validate regularly** to catch issues early
5. **Keep source files organized** for better context