# CLI Documentation

## Installation

```bash
npm install -g @ramselvan-m-20066/i18n-llm-translator
```

## Commands

### translate

Translate i18n files smartly (only missing/invalid keys).

```bash
i18n-translate translate [options]
```

**Options:**
- `-s, --source <path>`: Source file path (.properties or .json)
- `-t, --target <path>`: Target file path
- `-l, --lang <code>`: Target language code (ISO 639-1)
- `--source-lang <code>`: Source language code (default: 'en')
- `-m, --model <model>`: OpenAI model (default: 'gpt-3.5-turbo')
- `-k, --api-key <key>`: OpenAI API key
- `-c, --config <path>`: Path to config file (default: 'i18n-translate.config.json')
- `--no-preserve-comments`: Do not preserve comments in properties files
- `--dry-run`: Preview changes without writing files
- `-v, --verbose`: Verbose output

**Examples:**

```bash
# Basic translation
i18n-translate translate -s messages_en.properties -t messages_es.properties -l es

# With custom model and API key
i18n-translate translate -s messages_en.properties -t messages_es.properties -l es -m gpt-4 -k sk-your-key

# Dry run to see what would be translated
i18n-translate translate -s messages_en.properties -t messages_es.properties -l es --dry-run

# JSON files
i18n-translate translate -s messages_en.json -t messages_es.json -l es
```

### batch

Batch translate multiple files.

```bash
i18n-translate batch [options]
```

**Options:**
- `-d, --source-dir <path>`: Source directory
- `-t, --target-dir <path>`: Target directory
- `-l, --lang <code>`: Target language code (default: 'es')
- `-p, --pattern <pattern>`: File pattern (default: '*.{properties,json}')
- `--source-lang <code>`: Source language (default: 'en')
- `-c, --config <path>`: Config file path

**Example:**

```bash
# Translate all properties files in a directory
i18n-translate batch -d ./locales/en -t ./locales/es -l es

# Custom pattern
i18n-translate batch -d ./locales/en -t ./locales/es -l es -p "**/*.properties"
```

### validate

Validate existing translations.

```bash
i18n-translate validate [options]
```

**Options:**
- `-s, --source <path>`: Source file
- `-t, --target <path>`: Target file
- `-l, --lang <code>`: Target language

**Example:**

```bash
i18n-translate validate -s messages_en.properties -t messages_es.properties -l es
```

### init

Initialize configuration file.

```bash
i18n-translate init [options]
```

**Options:**
- `-c, --config <path>`: Config file path (default: 'i18n-translate.config.json')

**Example:**

```bash
i18n-translate init
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
  "validationThreshold": 0.7,
  "filePatterns": ["*.properties", "*.json"],
  "excludePatterns": ["node_modules/**", "dist/**"]
}
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_BASE_URL`: Custom OpenAI API base URL (optional)

## Exit Codes

- `0`: Success
- `1`: Error

## Examples

### Complete Workflow

```bash
# 1. Initialize configuration
i18n-translate init

# 2. Set API key
export OPENAI_API_KEY=sk-your-api-key

# 3. Dry run to see what needs translation
i18n-translate translate -s messages_en.properties -t messages_es.properties -l es --dry-run

# 4. Perform actual translation
i18n-translate translate -s messages_en.properties -t messages_es.properties -l es

# 5. Validate results
i18n-translate validate -s messages_en.properties -t messages_es.properties -l es
```

### Batch Translation

```bash
# Translate all locale files
i18n-translate batch -d ./src/locales/en -t ./src/locales/es -l es

# Translate specific file types
i18n-translate batch -d ./locales -t ./locales/es -l es -p "**/*properties"
```