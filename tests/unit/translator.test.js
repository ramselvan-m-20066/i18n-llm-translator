import Translator from '../../src/translator.js';
import { jest } from '@jest/globals';

describe('Translator', () => {
    let translator;
    let mockOpenAI;

    beforeEach(() => {
        mockOpenAI = {
            chat: {
                completions: {
                    create: jest.fn()
                }
            }
        };

        translator = new Translator({
            apiKey: 'test-key',
            sourceLang: 'en',
            targetLang: 'es',
            model: 'gpt-3.5-turbo'
        });

        // Mock the openai instance
        translator.openai = mockOpenAI;
    });

    describe('translateText', () => {
        it('should translate text successfully', async () => {
            mockOpenAI.chat.completions.create.mockResolvedValue({
                choices: [{
                    message: {
                        content: 'Hola mundo'
                    }
                }]
            });

            const result = await translator.translateText('Hello world');
            expect(result).toBe('Hola mundo');
        });

        it('should handle empty text', async () => {
            const result = await translator.translateText('');
            expect(result).toBe('');
        });

        it('should handle API errors gracefully', async () => {
            mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

            const result = await translator.translateText('Hello world');
            expect(result).toBe('Hello world'); // Should return original text on error
        });
    });

    describe('buildTranslationPrompt', () => {
        it('should build correct prompt for new translation', () => {
            const prompt = translator.buildTranslationPrompt('Hello {0}', 'Button text');

            expect(prompt).toContain('Translate the following en text to es');
            expect(prompt).toContain('Context: Button text');
            expect(prompt).toContain('Text: "Hello {0}"');
            expect(prompt).toContain('Preserve all placeholders');
        });

        it('should build correct prompt for correcting existing translation', () => {
            const prompt = translator.buildTranslationPrompt(
                'Hello {0}',
                'Invalid placeholder count',
                'Hola {0} {1}'
            );

            expect(prompt).toContain('Current translation is: "Hola {0} {1}"');
            expect(prompt).toContain('This translation is INVALID because: Invalid placeholder count');
        });
    });
});