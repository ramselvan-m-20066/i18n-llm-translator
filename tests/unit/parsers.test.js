import PropertiesParser from '../../src/parsers/properties-parser.js';
import JsonParser from '../../src/parsers/json-parser.js';

describe('Parsers', () => {
    describe('PropertiesParser', () => {
        let parser;

        beforeEach(() => {
            parser = new PropertiesParser();
        });

        describe('parse', () => {
            it('should parse simple properties', () => {
                const content = 'key1=value1\nkey2=value2';
                const result = parser.parse(content);

                expect(result.key1.value).toBe('value1');
                expect(result.key2.value).toBe('value2');
            });

            it('should handle comments', () => {
                const content = '# This is a comment\nkey1=value1\n\nkey2=value2';
                const result = parser.parse(content);

                expect(result.key1.comments).toContain('# This is a comment');
                expect(result.key2.comments).toContain('');
            });

            it('should handle escaped characters', () => {
                const content = 'key=Value with\\nnew line\\tand tab';
                const result = parser.parse(content);

                expect(result.key.value).toBe('Value with\nnew line\tand tab');
            });
        });

        describe('parseLine', () => {
            it('should parse key=value', () => {
                const result = parser.parseLine('key=value');
                expect(result).toEqual({ key: 'key', value: 'value' });
            });

            it('should parse key:value', () => {
                const result = parser.parseLine('key:value');
                expect(result).toEqual({ key: 'key', value: 'value' });
            });

            it('should handle escaped equals', () => {
                const result = parser.parseLine('key\\=with=equals=value');
                expect(result).toEqual({ key: 'key=with', value: 'equals=value' });
            });
        });

        describe('escapeValue', () => {
            it('should escape special characters', () => {
                const result = parser.escapeValue('Value\nwith\r\nlines\tand\ttabs');
                expect(result).toBe('Value\\nwith\\r\\nlines\\tand\\ttabs');
            });
        });
    });

    describe('JsonParser', () => {
        let parser;

        beforeEach(() => {
            parser = new JsonParser();
        });

        describe('parse', () => {
            it('should parse valid JSON', () => {
                const content = '{"key1": "value1", "key2": "value2"}';
                const result = parser.parse(content);

                expect(result.key1).toBe('value1');
                expect(result.key2).toBe('value2');
            });

            it('should handle nested objects', () => {
                const content = '{"nested": {"key": "value"}}';
                const result = parser.parse(content);

                expect(result.nested.key).toBe('value');
            });
        });

        describe('flatten', () => {
            it('should flatten nested objects', () => {
                const obj = { a: '1', b: { c: '2', d: '3' } };
                const result = parser.flatten(obj);

                expect(result).toEqual({
                    a: '1',
                    'b.c': '2',
                    'b.d': '3'
                });
            });
        });

        describe('unflatten', () => {
            it('should unflatten flat objects', () => {
                const flat = { a: '1', 'b.c': '2', 'b.d': '3' };
                const result = parser.unflatten(flat);

                expect(result).toEqual({
                    a: '1',
                    b: { c: '2', d: '3' }
                });
            });
        });
    });
});