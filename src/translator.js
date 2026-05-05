import OpenAI from 'openai';
import PropertiesParser from './parsers/properties-parser.js';
import JsonParser from './parsers/json-parser.js';
import TranslationValidator from './validators/translation-validator.js';
import { FileUtils } from './utils/file-utils.js';
import Logger from './utils/logger.js';

class Translator {
    constructor(options = {}) {
        this.openai = new OpenAI({
            apiKey: options.apiKey || process.env.OPENAI_API_KEY,
            baseURL: options.baseURL || process.env.OPENAI_BASE_URL
        });
        this.model = options.model || 'gpt-3.5-turbo';
        this.sourceLang = options.sourceLang || 'en';
        this.targetLang = options.targetLang;
        this.batchSize = options.batchSize || 20;
        this.delayMs = options.delayMs || 500;
        this.validator = new TranslationValidator();
        this.logger = new Logger(options.verbose);
        this.parsers = {
            properties: new PropertiesParser(),
            json: new JsonParser()
        };
    }

    async compareFiles(sourcePath, targetPath, fileType = 'properties') {
        this.logger.info(`Comparing files: ${sourcePath} vs ${targetPath}`);
        
        const sourceContent = await FileUtils.readFile(sourcePath);
        let sourceData = this.parsers[fileType].parse(sourceContent);
        
        let targetContent;
        let targetData = {};
        try {
            targetContent = await FileUtils.readFile(targetPath);
            targetData = this.parsers[fileType].parse(targetContent);
        } catch (error) {
            this.logger.warn(`Target file not found, all keys will be translated`);
        }
        
        // Flatten data for comparison if JSON
        if (fileType === 'json') {
            sourceData = this.parsers.json.flatten(sourceData);
            targetData = this.parsers.json.flatten(targetData);
        }
        
        const keysToTranslate = [];
        const alreadyValid = [];
        
        for (const [key, sourceValue] of Object.entries(sourceData)) {
            const sourceText = typeof sourceValue === 'string' ? sourceValue : sourceValue.value;
            
            if (!targetData[key]) {
                keysToTranslate.push({
                    key,
                    original: sourceText,
                    reason: 'Missing key'
                });
                continue;
            }
            
            const targetValue = targetData[key];
            const targetText = typeof targetValue === 'string' ? targetValue : targetValue.value;
            const validation = this.validator.validate(sourceText, targetText, this.targetLang);
            
            if (validation.isValid) {
                alreadyValid.push({
                    key,
                    original: sourceText,
                    translation: targetText
                });
            } else {
                keysToTranslate.push({
                    key,
                    original: sourceText,
                    currentTranslation: targetText,
                    reason: validation.reason
                });
            }
        }
        
        const orphanedKeys = Object.keys(targetData).filter(key => !sourceData[key]);
        
        return {
            keysToTranslate,
            alreadyValid,
            orphanedKeys,
            sourceData,
            targetData
        };
    }

    async translateText(text, context = '', existingTranslation = null) {
        if (!text || text.trim() === '') return text;
        
        let prompt = this.buildTranslationPrompt(text, context, existingTranslation);
        
        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional translator specializing in software internationalization. Preserve all placeholders and formatting.'
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 500
            });
            
            let translated = response.choices[0].message.content.trim();
            translated = translated.replace(/^["']|["']$/g, '');
            return translated;
        } catch (error) {
            this.logger.error(`Translation failed: ${error.message}`);
            return text;
        }
    }

    buildTranslationPrompt(text, context, existingTranslation = null) {
        let prompt = `Translate the following ${this.sourceLang} text to ${this.targetLang}.\n\n`;
        prompt += `Context: ${context || 'General application text'}\n`;
        prompt += `Text: "${text}"\n\n`;
        
        if (existingTranslation) {
            prompt += `Current translation is: "${existingTranslation}"\n`;
            prompt += `This translation is INVALID because: ${context}\n`;
            prompt += `Please provide a CORRECT translation.\n\n`;
        }
        
        prompt += `Important rules:\n`;
        prompt += `1. Preserve all placeholders like {0}, {1}, {{name}}, %s, $1, etc.\n`;
        prompt += `2. Keep HTML/XML tags unchanged\n`;
        prompt += `3. Maintain line breaks and formatting\n`;
        prompt += `4. Return ONLY the translated text, no explanations\n`;
        prompt += `5. Keep variables and interpolation markers exactly as is\n\n`;
        prompt += `Translated text:`;
        
        return prompt;
    }

    async batchTranslate(items) {
        const results = [];
        
        for (let i = 0; i < items.length; i += this.batchSize) {
            const batch = items.slice(i, i + this.batchSize);
            const batchResults = await Promise.all(
                batch.map(item => this.translateText(
                    item.original,
                    item.reason || `Key: ${item.key}`,
                    item.currentTranslation
                ))
            );
            
            batch.forEach((item, idx) => {
                results.push({
                    key: item.key,
                    original: item.original,
                    translated: batchResults[idx],
                    previousTranslation: item.currentTranslation || null
                });
            });
            
            if (i + this.batchSize < items.length) {
                await new Promise(resolve => setTimeout(resolve, this.delayMs));
            }
        }
        
        return results;
    }

    async smartTranslate(sourcePath, targetPath, fileType, options = {}) {
        this.logger.info(`Starting smart translation`);
        this.logger.info(`Source: ${sourcePath}`);
        this.logger.info(`Target: ${targetPath}`);
        this.logger.info(`Language: ${this.sourceLang} -> ${this.targetLang}`);
        
        const comparison = await this.compareFiles(sourcePath, targetPath, fileType);
        
        if (comparison.keysToTranslate.length === 0) {
            this.logger.info(`All translations are valid! Nothing to translate.`);
            return {
                statistics: {
                    totalKeys: Object.keys(comparison.sourceData).length,
                    alreadyValid: comparison.alreadyValid.length,
                    newlyTranslated: 0,
                    needsReview: 0
                }
            };
        }
        
        this.logger.info(`Translating ${comparison.keysToTranslate.length} keys...`);
        const translations = await this.batchTranslate(comparison.keysToTranslate);
        
        if (!options.dryRun) {
            await this.parsers[fileType].update(
                targetPath,
                translations,
                comparison.targetData,
                options
            );
        }
        
        const report = {
            timestamp: new Date().toISOString(),
            sourceFile: sourcePath,
            targetFile: targetPath,
            targetLanguage: this.targetLang,
            statistics: {
                totalKeys: Object.keys(comparison.sourceData).length,
                alreadyValid: comparison.alreadyValid.length,
                newlyTranslated: translations.length,
                needsReview: comparison.keysToTranslate.filter(k => k.currentTranslation).length
            },
            translations
        };
        
        const reportPath = await FileUtils.saveReport(targetPath, report);
        
        return { ...report, reportPath };
    }
}

export default Translator;