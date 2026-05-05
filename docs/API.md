# API Documentation

## Classes

### Translator

The main class for handling i18n translations using LLM.

#### Constructor

```javascript
const translator = new Translator(options);
```

**Options:**
- `apiKey` (string): OpenAI API key
- `model` (string): OpenAI model (default: 'gpt-3.5-turbo')
- `sourceLang` (string): Source language code (default: 'en')
- `targetLang` (string): Target language code
- `batchSize` (number): Number of parallel translations (default: 20)
- `delayMs` (number): Delay between batches (default: 500)
- `verbose` (boolean): Enable verbose logging

#### Methods

##### compareFiles(sourcePath, targetPath, fileType)

Compares source and target files to identify missing or invalid translations.

**Parameters:**
- `sourcePath` (string): Path to source file
- `targetPath` (string): Path to target file
- `fileType` (string): 'properties' or 'json'

**Returns:** Promise<ComparisonResult>

##### smartTranslate(sourcePath, targetPath, fileType, options)

Performs smart translation, only translating missing/invalid keys.

**Parameters:**
- `sourcePath` (string): Path to source file
- `targetPath` (string): Path to target file
- `fileType` (string): 'properties' or 'json'
- `options` (object): Additional options
  - `preserveComments` (boolean): Preserve comments in properties files
  - `verbose` (boolean): Enable verbose output
  - `dryRun` (boolean): Preview changes without writing files

**Returns:** Promise<SmartTranslateResult>

### PropertiesParser

Parser for Java .properties files.

#### Methods

##### parse(content)

Parses properties file content.

**Parameters:**
- `content` (string): File content

**Returns:** Object with parsed key-value pairs

##### update(filePath, translations, existingData, options)

Updates properties file with new translations.

**Parameters:**
- `filePath` (string): Path to file
- `translations` (Array): Array of translation objects
- `existingData` (Object): Existing parsed data
- `options` (Object): Update options

### JsonParser

Parser for JSON files.

#### Methods

##### parse(content)

Parses JSON content.

**Parameters:**
- `content` (string): JSON string

**Returns:** Parsed JSON object

##### flatten(obj, prefix)

Flattens nested JSON objects.

**Parameters:**
- `obj` (Object): Object to flatten
- `prefix` (string): Key prefix

**Returns:** Flattened object

##### unflatten(flatObj)

Unflattens flat object back to nested structure.

**Parameters:**
- `flatObj` (Object): Flat object

**Returns:** Nested object

### TranslationValidator

Validates translation quality.

#### Methods

##### validate(original, translation, targetLang)

Validates a translation.

**Parameters:**
- `original` (string): Original text
- `translation` (string): Translated text
- `targetLang` (string): Target language

**Returns:** ValidationResult

##### validatePlaceholders(original, translation)

Validates placeholder consistency.

##### validateLength(original, translation)

Validates translation length ratio.

## Types

### ComparisonResult

```typescript
interface ComparisonResult {
  keysToTranslate: Array<{
    key: string;
    original: string;
    currentTranslation?: string;
    reason: string;
  }>;
  alreadyValid: Array<{
    key: string;
    original: string;
    translation: string;
  }>;
  orphanedKeys: string[];
  sourceData: Record<string, any>;
  targetData: Record<string, any>;
}
```

### SmartTranslateResult

```typescript
interface SmartTranslateResult {
  timestamp: string;
  sourceFile: string;
  targetFile: string;
  targetLanguage: string;
  statistics: {
    totalKeys: number;
    alreadyValid: number;
    newlyTranslated: number;
    needsReview: number;
  };
  translations: TranslationResult[];
  reportPath: string;
}
```

### TranslationResult

```typescript
interface TranslationResult {
  key: string;
  original: string;
  translated: string;
  previousTranslation?: string | null;
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  reason: string;
  pattern?: string;
}
```