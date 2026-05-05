class PlaceholderValidator {
    validate(original, translation) {
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
}

export default PlaceholderValidator;