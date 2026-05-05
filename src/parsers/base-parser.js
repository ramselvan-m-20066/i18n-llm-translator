class BaseParser {
    parse(content) {
        throw new Error('parse method must be implemented by subclass');
    }
    
    async update(filePath, translations, existingData, options = {}) {
        throw new Error('update method must be implemented by subclass');
    }
}

export default BaseParser;