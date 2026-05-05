export interface TranslationOptions {
    apiKey?: string;
    model?: string;
    sourceLang?: string;
    targetLang?: string;
    batchSize?: number;
    delayMs?: number;
    verbose?: boolean;
}

export interface TranslationResult {
    key: string;
    original: string;
    translated: string;
    previousTranslation?: string | null;
}

export interface ComparisonResult {
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

export interface SmartTranslateResult {
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

export interface ValidationResult {
    isValid: boolean;
    reason: string;
    pattern?: string;
}

export declare class Translator {
    constructor(options?: TranslationOptions);
    compareFiles(sourcePath: string, targetPath: string, fileType?: string): Promise<ComparisonResult>;
    translateText(text: string, context?: string, existingTranslation?: string | null): Promise<string>;
    batchTranslate(items: Array<{key: string; original: string; currentTranslation?: string; reason?: string}>): Promise<TranslationResult[]>;
    smartTranslate(sourcePath: string, targetPath: string, fileType: string, options?: {preserveComments?: boolean; verbose?: boolean; dryRun?: boolean}): Promise<SmartTranslateResult>;
}

export declare class PropertiesParser {
    parse(content: string): Record<string, {value: string; comments?: string[]; originalLine?: string}>;
    parseLine(line: string): {key: string; value: string} | null;
    escapeValue(value: string): string;
    update(filePath: string, translations: TranslationResult[], existingData: Record<string, any>, options?: {preserveComments?: boolean}): Promise<void>;
}

export declare class JsonParser {
    parse(content: string): Record<string, any>;
    flatten(obj: Record<string, any>, prefix?: string): Record<string, string>;
    unflatten(flatObj: Record<string, string>): Record<string, any>;
    update(filePath: string, translations: TranslationResult[], existingData: Record<string, any>, options?: any): Promise<void>;
}

export declare class TranslationValidator {
    constructor(threshold?: number);
    validate(original: string, translation: string, targetLang: string): ValidationResult;
    validatePlaceholders(original: string, translation: string): ValidationResult;
    validateLength(original: string, translation: string): ValidationResult;
}

export declare class Logger {
    constructor(verbose?: boolean);
    info(message: string): void;
    success(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    debug(message: string): void;
}

export declare class ConfigLoader {
    static load(configPath?: string): Promise<Record<string, any>>;
    static save(configPath: string, config: Record<string, any>): Promise<void>;
}