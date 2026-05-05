class TranslationValidator {
    constructor(threshold = 0.7) {
        this.threshold = threshold;
    }
    
    validate(original, translation, targetLang) {
        if (!translation || translation.trim() === '') {
            return { isValid: false, reason: 'Empty translation' };
        }
        
        if (translation === original) {
            return { isValid: false, reason: 'Untranslated (same as source)' };
        }
        
        const placeholderCheck = this.validatePlaceholders(original, translation);
        if (!placeholderCheck.isValid) {
            return placeholderCheck;
        }
        
        const lengthCheck = this.validateLength(original, translation);
        if (!lengthCheck.isValid) {
            return lengthCheck;
        }
        
        return { isValid: true, reason: 'Valid translation' };
    }
    
    validatePlaceholders(original, translation) {
        const patterns = [
            /\{[0-9]+\}/g,      // {0}, {1}
            /\{\{\w+\}\}/g,      // {{name}}
            /%[sd]/g,            // %s, %d
            /\$[0-9]+/g,        // $1, $2
            /<[^>]+>/g          // HTML tags
        ];
        
        for (const pattern of patterns) {
            const originalMatches = original.match(pattern) || [];
            const translationMatches = translation.match(pattern) || [];
            
            if (originalMatches.length !== translationMatches.length) {
                return {
                    isValid: false,
                    reason: `Placeholder mismatch: expected ${originalMatches.length}, got ${translationMatches.length}`,
                    pattern: pattern.toString()
                };
            }
        }
        
        return { isValid: true };
    }
    
    validateLength(original, translation) {
        const ratio = translation.length / original.length;
        
        if (ratio < 0.3 || ratio > 3.0) {
            return {
                isValid: false,
                reason: `Length ratio abnormal: ${ratio.toFixed(2)} (expected 0.3-3.0)`
            };
        }
        
        return { isValid: true };
    }
}

export default TranslationValidator;