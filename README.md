# i18n LLM Translator

[![npm version](https://badge.fury.io/js/@your-scope%2Fi18n-llm-translator.svg)](https://badge.fury.io/js/@your-scope%2Fi18n-llm-translator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Smart i18n translation tool using LLM that only translates missing or invalid keys. Save API costs by only translating what's needed!

## Features

- 🎯 **Smart Translation** - Only translates missing or invalid keys
- 🔍 **Validation** - Detects placeholder mismatches, empty translations, and abnormal lengths
- 📝 **Multiple Formats** - Supports .properties and JSON files
- 🚀 **Batch Processing** - Translate multiple files at once
- 💰 **Cost Efficient** - No re-translation of valid content
- 📊 **Detailed Reports** - JSON reports of all translations
- 🎨 **CLI & Programmatic** - Use as CLI tool or npm package

## Installation

```bash
npm install -g @your-scope/i18n-llm-translator
```

Or for local installation:

```bash
npm install --save-dev @your-scope/i18n-llm-translator
```

## Quick Start

### CLI Usage

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=sk-...

# Initialize configuration
i18n-translate init

# Translate a file (only missing/invalid keys)
i18n-translate translate -s messages_en.properties -t messages_es.properties -l es

# Validate existing translations
i18n-translate validate -s messages_en.properties -t messages_es.properties -l es

# Batch translate all files in a directory
i18n-translate batch -d ./locales/en -t ./locales/es -l es

# Dry run to see what would be translated
i18n-translate translate -s messages_en.properties -t messages_es.properties -l es --dry-run
```

### Programmatic Usage

```javascript
import Translator from '@your-scope/i18n-llm-translator';

const translator = new Translator({
    apiKey: process.env.OPENAI_API_KEY,
    sourceLang: 'en',
    targetLang: 'es'
});

// Smart translate - only missing/invalid keys
const result = await translator.smartTranslate(
    './messages_en.properties',
    './messages_es.properties',
    'properties'
);

console.log(`Translated: ${result.statistics.newlyTranslated}`);
console.log(`Skipped: ${result.statistics.alreadyValid}`);
```

## Configuration

Create `i18n-translate.config.json`:

```json
{
  "sourceLang": "en",
  "defaultTargetLang": "es",
  "model": "gpt-3.5-turbo",
  "preserveComments": true,
  "batchSize": 20,
  "validationThreshold": 0.7
}
```

## Supported Languages

The tool supports any language supported by OpenAI's GPT models. Common language codes:

- `es` - Spanish
- `fr` - French
- `de` - German
- `ja` - Japanese
- `zh-CN` - Simplified Chinese
- `ko` - Korean
- `ru` - Russian

## How It Works

1. **Compare** - Checks existing target file for existing translations
2. **Validate** - Validates each translation (placeholders, length, etc.)
3. **Translate** - Only translates missing or invalid keys
4. **Update** - Merges new translations while preserving valid ones

## API Documentation

### Translator Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | `process.env.OPENAI_API_KEY` | OpenAI API key |
| `model` | string | `gpt-3.5-turbo` | OpenAI model to use |
| `sourceLang` | string | `en` | Source language code |
| `targetLang` | string | Required | Target language code |
| `batchSize` | number | `20` | Number of parallel translations |
| `delayMs` | number | `500` | Delay between batches |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## License

MIT

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/i18n-llm-translator/issues)
- Documentation: [API Docs](docs/API.md)