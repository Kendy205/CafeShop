const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const notificationComponentPath = path.join(srcDir, 'components/common/AppNotification');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walk(dirPath, callback);
        } else if (f.endsWith('.js') || f.endsWith('.jsx')) {
            callback(dirPath);
        }
    });
}

walk(srcDir, (filePath) => {
    if (filePath.replace(/\\/g, '/').includes('/components/common/AppNotification')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    let changed = false;
    
    if (content.includes('message.') || content.includes('Modal.confirm')) {
        content = content.replace(/message\.success/g, 'AppToast.success');
        content = content.replace(/message\.error/g, 'AppToast.error');
        content = content.replace(/message\.warning/g, 'AppToast.warning');
        content = content.replace(/message\.info/g, 'AppToast.info');
        content = content.replace(/Modal\.confirm/g, 'AppConfirm');
        changed = true;
    }
    
    if (changed) {
        // compute relative path
        let relPath = path.relative(path.dirname(filePath), notificationComponentPath).replace(/\\/g, '/');
        if (!relPath.startsWith('.')) relPath = './' + relPath;
        
        let importStatement = `import { AppToast, AppConfirm } from '${relPath}'\n`;
        
        // Add import after the last import
        let lines = content.split('\n');
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) lastImportIdx = i;
        }
        
        if (lastImportIdx !== -1) {
            lines.splice(lastImportIdx + 1, 0, importStatement);
        } else {
            lines.unshift(importStatement);
        }
        
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
        console.log('Updated', filePath);
    }
});
