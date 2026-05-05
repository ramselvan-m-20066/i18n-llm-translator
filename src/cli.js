#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import Translator from './translator.js';
import Logger from './utils/logger.js';
import ConfigLoader from './utils/config-loader.js';

dotenv.config();

const program = new Command();
const logger = new Logger();

program
    .name('i18n-translate')
    .description('Smart i18n translation tool using LLM')
    .version('2.0.0');

// Translate command
program
    .command('translate')
    .description('Translate i18n files smartly (only missing/invalid keys)')
    .option('-s, --source <path>', 'Source file path (.properties or .json)')
    .option('-t, --target <path>', 'Target file path')
    .option('-l, --lang <code>', 'Target language code (ISO 639-1)')
    .option('--source-lang <code>', 'Source language code', 'en')
    .option('-m, --model <model>', 'OpenAI model', 'gpt-3.5-turbo')
    .option('-k, --api-key <key>', 'OpenAI API key (or set OPENAI_API_KEY env)')
    .option('-c, --config <path>', 'Path to config file', 'i18n-translate.config.json')
    .option('--no-preserve-comments', 'Do not preserve comments in properties files')
    .option('--dry-run', 'Preview changes without writing files')
    .option('-v, --verbose', 'Verbose output')
    .action(async (options) => {
        try {
            // Load config
            const config = await ConfigLoader.load(options.config);
            
            // Merge options with config
            const finalOptions = { ...config, ...options };
            
            // Validate required options
            if (!finalOptions.source && !config.source) {
                throw new Error('Source file is required');
            }
            if (!finalOptions.target && !config.target) {
                throw new Error('Target file is required');
            }
            if (!finalOptions.lang && !config.lang) {
                throw new Error('Target language is required');
            }
            
            // Get API key
            const apiKey = finalOptions.apiKey || process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OpenAI API key is required. Set OPENAI_API_KEY env or use --api-key');
            }
            
            const spinner = ora('Initializing translator...').start();
            
            const translator = new Translator({
                apiKey,
                model: finalOptions.model,
                sourceLang: finalOptions.sourceLang,
                targetLang: finalOptions.lang,
                verbose: finalOptions.verbose
            });
            
            spinner.text = 'Analyzing files...';
            
            const ext = path.extname(finalOptions.source);
            const fileType = ext === '.properties' ? 'properties' : 'json';
            
            spinner.stop();
            
            if (finalOptions.dryRun) {
                logger.info(chalk.yellow('🔍 DRY RUN MODE - No files will be written'));
                
                const comparison = await translator.compareFiles(
                    finalOptions.source,
                    finalOptions.target,
                    fileType
                );
                
                logger.info(`\n📊 Analysis Results:`);
                logger.info(`   Total keys: ${Object.keys(comparison.sourceData).length}`);
                logger.info(`   ✅ Valid: ${chalk.green(comparison.alreadyValid.length)}`);
                logger.info(`   ❌ Invalid/Missing: ${chalk.red(comparison.keysToTranslate.length)}`);
                logger.info(`   🗑️ Orphaned: ${chalk.yellow(comparison.orphanedKeys.length)}`);
                
                if (comparison.keysToTranslate.length > 0) {
                    logger.info(`\n📝 Keys to translate:`);
                    comparison.keysToTranslate.slice(0, 10).forEach(item => {
                        logger.info(`   - ${item.key}: ${item.original.substring(0, 50)}...`);
                    });
                }
            } else {
                const result = await translator.smartTranslate(
                    finalOptions.source,
                    finalOptions.target,
                    fileType,
                    {
                        preserveComments: finalOptions.preserveComments !== false,
                        verbose: finalOptions.verbose
                    }
                );
                
                logger.success(chalk.green(`\n✅ Translation complete!`));
                logger.info(`   📝 ${result.statistics.alreadyValid} keys already valid (skipped)`);
                logger.info(`   🆕 ${result.statistics.newlyTranslated} keys newly translated`);
                if (result.statistics.needsReview.length > 0) {
                    logger.warn(`   ⚠️ ${result.statistics.needsReview.length} keys need manual review`);
                }
                logger.info(`   📊 Report saved: ${result.reportPath}`);
            }
            
        } catch (error) {
            logger.error(chalk.red(`\n❌ Error: ${error.message}`));
            if (options.verbose) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    });

// Batch command
program
    .command('batch')
    .description('Batch translate multiple files')
    .option('-d, --source-dir <path>', 'Source directory')
    .option('-t, --target-dir <path>', 'Target directory')
    .option('-l, --lang <code>', 'Target language code', 'es')
    .option('-p, --pattern <pattern>', 'File pattern', '*.{properties,json}')
    .option('--source-lang <code>', 'Source language', 'en')
    .option('-c, --config <path>', 'Config file path', 'i18n-translate.config.json')
    .action(async (options) => {
        const spinner = ora('Processing files...').start();
        
        try {
            const config = await ConfigLoader.load(options.config);
            const finalOptions = { ...config, ...options };
            
            const glob = await import('glob');
            const files = await glob.glob(`${finalOptions.sourceDir}/${finalOptions.pattern}`);
            
            spinner.text = `Found ${files.length} files to process`;
            
            let totalTranslated = 0;
            let totalSkipped = 0;
            
            for (const sourceFile of files) {
                const relativePath = path.relative(finalOptions.sourceDir, sourceFile);
                const targetFile = path.join(finalOptions.targetDir, relativePath);
                
                await fs.mkdir(path.dirname(targetFile), { recursive: true });
                
                const ext = path.extname(sourceFile);
                const fileType = ext === '.properties' ? 'properties' : 'json';
                
                const translator = new Translator({
                    apiKey: process.env.OPENAI_API_KEY,
                    sourceLang: finalOptions.sourceLang,
                    targetLang: finalOptions.lang
                });
                
                spinner.text = `Translating: ${relativePath}`;
                
                const result = await translator.smartTranslate(
                    sourceFile,
                    targetFile,
                    fileType
                );
                
                totalTranslated += result.statistics.newlyTranslated;
                totalSkipped += result.statistics.alreadyValid;
            }
            
            spinner.succeed(`Batch translation complete!`);
            logger.info(`   📝 Total valid keys skipped: ${totalSkipped}`);
            logger.info(`   🆕 Total newly translated: ${totalTranslated}`);
            
        } catch (error) {
            spinner.fail(`Batch failed: ${error.message}`);
            process.exit(1);
        }
    });

// Validate command
program
    .command('validate')
    .description('Validate existing translations')
    .option('-s, --source <path>', 'Source file')
    .option('-t, --target <path>', 'Target file')
    .option('-l, --lang <code>', 'Target language')
    .action(async (options) => {
        try {
            const translator = new Translator({});
            const ext = path.extname(options.source);
            const fileType = ext === '.properties' ? 'properties' : 'json';
            
            const comparison = await translator.compareFiles(
                options.source,
                options.target,
                fileType
            );
            
            logger.info(`\n📊 Validation Results:`);
            logger.info(`   ✅ Valid translations: ${chalk.green(comparison.alreadyValid.length)}`);
            logger.info(`   ❌ Invalid/Missing: ${chalk.red(comparison.keysToTranslate.length)}`);
            logger.info(`   🗑️ Orphaned keys: ${chalk.yellow(comparison.orphanedKeys.length)}`);
            
            if (comparison.keysToTranslate.length > 0) {
                logger.warn(`\n⚠️ Keys needing attention:`);
                comparison.keysToTranslate.forEach(item => {
                    logger.warn(`   - ${item.key}: ${item.reason}`);
                });
            }
            
        } catch (error) {
            logger.error(`Validation failed: ${error.message}`);
            process.exit(1);
        }
    });

// Init command
program
    .command('init')
    .description('Initialize configuration file')
    .option('-c, --config <path>', 'Config file path', 'i18n-translate.config.json')
    .action(async (options) => {
        const template = {
            sourceLang: "en",
            defaultTargetLang: "es",
            model: "gpt-3.5-turbo",
            preserveComments: true,
            batchSize: 20,
            validationThreshold: 0.7,
            filePatterns: ["*.properties", "*.json"],
            excludePatterns: ["node_modules/**", "dist/**"]
        };
        
        await fs.writeFile(options.config, JSON.stringify(template, null, 2));
        logger.success(`✅ Configuration file created: ${options.config}`);
        logger.info(`\nEdit the file to customize your translation settings.`);
    });

program.parse();