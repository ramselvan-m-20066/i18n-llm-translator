import { parse as parseJsonc } from 'jsonc-parser';
import BaseParser from './base-parser.js';
import { FileUtils } from '../utils/file-utils.js';

class JsonParser extends BaseParser {
    parse(content) {
        try {
            return JSON.parse(content);
        } catch (e) {
            // Try JSON with comments
            return parseJsonc(content);
        }
    }
    
    flatten(obj, prefix = '') {
        const result = {};
        
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(result, this.flatten(value, fullKey));
            } else {
                result[fullKey] = String(value);
            }
        }
        
        return result;
    }
    
    unflatten(flatObj) {
        const result = {};
        
        for (const [key, value] of Object.entries(flatObj)) {
            const parts = key.split('.');
            let current = result;
            
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }
            
            current[parts[parts.length - 1]] = value;
        }
        
        return result;
    }
    
    async update(filePath, translations, existingData, _options = {}) {
        const merged = { ...existingData };
        
        for (const trans of translations) {
            merged[trans.key] = trans.translated;
        }
        
        const unflattened = this.unflatten(merged);
        const content = JSON.stringify(unflattened, null, 2);
        await FileUtils.writeFile(filePath, content);
    }
}

export default JsonParser;