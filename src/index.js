import Translator from './translator.js';
import PropertiesParser from './parsers/properties-parser.js';
import JsonParser from './parsers/json-parser.js';
import TranslationValidator from './validators/translation-validator.js';
import { FileUtils } from './utils/file-utils.js';
import Logger from './utils/logger.js';
import ConfigLoader from './utils/config-loader.js';

export {
    Translator,
    PropertiesParser,
    JsonParser,
    TranslationValidator,
    FileUtils,
    Logger,
    ConfigLoader
};

export default Translator;