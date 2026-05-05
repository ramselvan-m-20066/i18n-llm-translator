import fs from 'fs/promises';
import path from 'path';
import { FileUtils } from './file-utils.js';

class ConfigLoader {
    static async load(configPath = 'i18n-translate.config.json') {
        try {
            const content = await FileUtils.readFile(configPath);
            return JSON.parse(content);
        } catch (error) {
            // Return empty config if file doesn't exist
            return {};
        }
    }
    
    static async save(configPath, config) {
        await FileUtils.writeFile(configPath, JSON.stringify(config, null, 2));
    }
}

export default ConfigLoader;