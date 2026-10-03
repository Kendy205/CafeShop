const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

const mapping = {
    // App
    'auth': 'app.auth',
    'ui': 'app.ui',
    // User
    'user': 'user.profile',
    'product': 'user.product',
    'address': 'user.address',
    'order': 'user.order',
    'voucher': 'user.voucher',
    'cart': 'user.cart',
    'size': 'user.size',
    'topping': 'user.topping',
    'category': 'user.category',
    'news': 'user.news',
    // Admin
    'adminVoucher': 'admin.voucher',
    'adminCategory': 'admin.category',
    'adminSize': 'admin.size',
    'adminTopping': 'admin.topping',
    'adminProduct': 'admin.product',
    'adminUser': 'admin.user',
    'adminOrder': 'admin.order',
    'adminDashboard': 'admin.dashboard',
    'adminShippingConfig': 'admin.shippingConfig',
    'adminNews': 'admin.news'
};

walk(srcDir, (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let originalContent = content;
        
        for (const [oldKey, newKey] of Object.entries(mapping)) {
            const regexS = new RegExp(`\\bs\\.${oldKey}\\b`, 'g');
            content = content.replace(regexS, `s.${newKey}`);
            
            const regexState = new RegExp(`\\bstate\\.${oldKey}\\b`, 'g');
            content = content.replace(regexState, `state.${newKey}`);
            
            const regexGetState = new RegExp(`getState\\(\\)\\.${oldKey}\\b`, 'g');
            content = content.replace(regexGetState, `getState().${newKey}`);
        }

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`Updated: ${filePath}`);
        }
    }
});
