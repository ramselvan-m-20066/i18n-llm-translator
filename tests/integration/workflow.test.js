import Translator from '../../src/translator.js';
import { FileUtils } from '../../src/utils/file-utils.js';
import fs from 'fs/promises';
import path from 'path';
import { jest } from '@jest/globals';

describe('Integration Tests', () => {
    const testDir = path.join(process.cwd(), 'test-temp');
    const sourceFile = path.join(testDir, 'messages_en.properties');
    const targetFile = path.join(testDir, 'messages_es.properties');

    beforeAll(async () => {
        await fs.mkdir(testDir, { recursive: true });
    });

    afterAll(async () => {
        await fs.rm(testDir, { recursive: true, force: true });
    });

    beforeEach(async () => {
        // Create test source file
        const sourceContent = `welcome=Welcome to our app
button.save=Save changes
error.required=This field is required
placeholder.name=Enter your {0}
`;
        await FileUtils.writeFile(sourceFile, sourceContent);

        // Create partial target file
        const targetContent = `welcome=Bienvenido a nuestra app
button.save=
error.required=Este campo es obligatorio
`;
        await FileUtils.writeFile(targetFile, targetContent);
    });

    describe('Smart Translation Workflow', () => {
        it('should identify missing and invalid translations', async () => {
            const translator = new Translator({
                apiKey: 'test-key',
                sourceLang: 'en',
                targetLang: 'es'
            });

            const comparison = await translator.compareFiles(sourceFile, targetFile, 'properties');

            expect(comparison.keysToTranslate).toHaveLength(2); // button.save (empty) and placeholder.name (missing)
            expect(comparison.alreadyValid).toHaveLength(2); // welcome and error.required
            expect(comparison.orphanedKeys).toHaveLength(0);
        });

        it('should handle file updates correctly', async () => {
            const mockTranslations = [
                { key: 'button.save', original: 'Save changes', translated: 'Guardar cambios' },
                { key: 'placeholder.name', original: 'Enter your {0}', translated: 'Ingresa tu {0}' }
            ];

            const parser = (await import('../../src/parsers/properties-parser.js')).default;
            const propertiesParser = new parser();

            const existingData = propertiesParser.parse(await FileUtils.readFile(targetFile));

            await propertiesParser.update(targetFile, mockTranslations, existingData);

            const updatedContent = await FileUtils.readFile(targetFile);
            const updatedData = propertiesParser.parse(updatedContent);

            expect(updatedData['button.save'].value).toBe('Guardar cambios');
            expect(updatedData['placeholder.name'].value).toBe('Ingresa tu {0}');
            expect(updatedData.welcome.value).toBe('Bienvenido a nuestra app');
        });
    });

    describe('JSON Workflow', () => {
        const jsonSource = path.join(testDir, 'messages_en.json');
        const jsonTarget = path.join(testDir, 'messages_es.json');

        beforeEach(async () => {
            const sourceJson = {
                welcome: 'Welcome',
                nav: {
                    home: 'Home',
                    about: 'About'
                }
            };
            await FileUtils.writeFile(jsonSource, JSON.stringify(sourceJson, null, 2));

            const targetJson = {
                welcome: 'Bienvenido',
                nav: {
                    home: '',
                    about: 'Acerca de'
                }
            };
            await FileUtils.writeFile(jsonTarget, JSON.stringify(targetJson, null, 2));
        });

        it('should handle nested JSON structures', async () => {
            const translator = new Translator({
                apiKey: 'test-key',
                sourceLang: 'en',
                targetLang: 'es'
            });

            const comparison = await translator.compareFiles(jsonSource, jsonTarget, 'json');

            expect(comparison.keysToTranslate).toHaveLength(1); // nav.home is empty
            expect(comparison.alreadyValid).toHaveLength(2); // welcome and nav.about
        });
    });
});