import TranslationValidator from '../../src/validators/translation-validator.js';

describe('TranslationValidator', () => {
    let validator;

    beforeEach(() => {
        validator = new TranslationValidator();
    });

    describe('validate', () => {
        it('should validate correct translation', () => {
            const result = validator.validate('Hello {0}', 'Hola {0}', 'es');
            expect(result.isValid).toBe(true);
            expect(result.reason).toBe('Valid translation');
        });

        it('should reject empty translation', () => {
            const result = validator.validate('Hello', '', 'es');
            expect(result.isValid).toBe(false);
            expect(result.reason).toBe('Empty translation');
        });

        it('should reject untranslated text', () => {
            const result = validator.validate('Hello', 'Hello', 'es');
            expect(result.isValid).toBe(false);
            expect(result.reason).toBe('Untranslated (same as source)');
        });
    });

    describe('validatePlaceholders', () => {
        it('should pass when placeholders match', () => {
            const result = validator.validatePlaceholders('Hello {0}', 'Hola {0}');
            expect(result.isValid).toBe(true);
        });

        it('should fail when placeholders mismatch', () => {
            const result = validator.validatePlaceholders('Hello {0}', 'Hola {0} {1}');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('Placeholder mismatch');
        });

        it('should handle multiple placeholder types', () => {
            const result = validator.validatePlaceholders(
                'Hello {0} and {{name}} with %s',
                'Hola {0} y {{name}} con %s'
            );
            expect(result.isValid).toBe(true);
        });
    });

    describe('validateLength', () => {
        it('should pass for reasonable length ratios', () => {
            const result = validator.validateLength('Hi', 'Hola');
            expect(result.isValid).toBe(true);
        });

        it('should fail for too short translations', () => {
            const result = validator.validateLength('Hello world', 'Hi');
            expect(result.isValid).toBe(false);
            expect(result.reason).toContain('Length ratio abnormal');
        });

        it('should fail for too long translations', () => {
            const result = validator.validateLength('Hi', 'Hello world this is a very long translation');
            expect(result.isValid).toBe(false);
        });
    });
});