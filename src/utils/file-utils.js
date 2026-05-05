import fs from 'fs/promises';
import path from 'path';

class FileUtils {
    static async readFile(filePath) {
        return await fs.readFile(filePath, 'utf-8');
    }
    
    static async writeFile(filePath, content) {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, content, 'utf-8');
    }
    
    static async saveReport(targetPath, report) {
        const reportDir = path.dirname(targetPath);
        const reportName = path.basename(targetPath, path.extname(targetPath)) + '_translation_report.json';
        const reportPath = path.join(reportDir, reportName);
        
        await this.writeFile(reportPath, JSON.stringify(report, null, 2));
        return reportPath;
    }
    
    static async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}

export { FileUtils };