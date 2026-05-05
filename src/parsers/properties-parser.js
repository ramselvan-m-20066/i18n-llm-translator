import BaseParser from './base-parser.js';
import { FileUtils } from '../utils/file-utils.js';

class PropertiesParser extends BaseParser {
    parse(content) {
        const result = {};
        const lines = content.split(/\r?\n/);
        let comments = [];
        
        for (let line of lines) {
            const originalLine = line;
            line = line.trim();
            
            if (line.startsWith('#')) {
                comments.push(line);
                continue;
            }
            
            if (!line) {
                comments.push('');
                continue;
            }
            
            const parsed = this.parseLine(line);
            if (parsed) {
                result[parsed.key] = {
                    value: parsed.value,
                    comments: [...comments],
                    originalLine
                };
            }
            comments = [];
        }
        
        return result;
    }
    
    parseLine(line) {
        let key = '';
        let value = '';
        let i = 0;
        
        // Parse key
        while (i < line.length && line[i] !== '=' && line[i] !== ':') {
            if (line[i] === '\\') {
                key += line[i + 1];
                i += 2;
            } else {
                key += line[i];
                i++;
            }
        }
        
        if (i >= line.length) return null;
        
        // Skip separator
        i++;
        
        // Parse value
        while (i < line.length) {
            if (line[i] === '\\' && i + 1 < line.length) {
                const next = line[i + 1];
                switch (next) {
                    case 'n': value += '\n'; break;
                    case 't': value += '\t'; break;
                    case 'r': value += '\r'; break;
                    case '=': case ':': case '\\': value += next; break;
                    default: value += '\\' + next;
                }
                i += 2;
            } else {
                value += line[i];
                i++;
            }
        }
        
        return { key: key.trim(), value: value.trim() };
    }
    
    escapeValue(value) {
        let escaped = String(value);
        escaped = escaped.replace(/\\/g, '\\\\');
        escaped = escaped.replace(/\n/g, '\\n');
        escaped = escaped.replace(/\r/g, '\\r');
        escaped = escaped.replace(/\t/g, '\\t');
        escaped = escaped.replace(/:/g, '\\:');
        escaped = escaped.replace(/=/g, '\\=');
        return escaped;
    }
    
    async update(filePath, translations, existingData, options = {}) {
        let output = '';
        const keys = new Set([...Object.keys(existingData), ...translations.map(t => t.key)]);
        
        for (const key of keys) {
            const existing = existingData[key];
            const translation = translations.find(t => t.key === key);
            
            let value, comments = [];
            
            if (translation) {
                value = this.escapeValue(translation.translated);
                if (existing && options.preserveComments !== false) {
                    comments = existing.comments || [];
                }
                if (translation.previousTranslation) {
                    comments.push(`# Updated: ${new Date().toISOString()}`);
                    comments.push(`# Previous: ${translation.previousTranslation}`);
                }
            } else if (existing) {
                value = this.escapeValue(existing.value);
                comments = existing.comments || [];
            } else {
                continue;
            }
            
            if (comments.length > 0) {
                output += comments.join('\n') + '\n';
            }
            
            output += `${key}=${value}\n`;
        }
        
        await FileUtils.writeFile(filePath, output);
    }
}

export default PropertiesParser;