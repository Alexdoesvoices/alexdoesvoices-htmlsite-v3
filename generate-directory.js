// Import Node.js modules for file system operations
const fs = require('fs');
const path = require('path');

// --- Configuration Section ---

// The path to the exclusion list file.
const excludeListPath = path.join(__dirname, 'directory_exclude.json');

// The path to the template HTML file. This file will NEVER be overwritten.
const templatePath = path.join(__dirname, 'directory_template.html');

// The path for the final, generated directory HTML file.
const outputPath = path.join(__dirname, '/pages/directory.html');

// The folder that will be scanned for .html files.
const pagesDir = path.join(__dirname, '/pages');

// The marker in the template where the list will be inserted.
const placeholder = '<!-- DIRECTORY_LIST_PLACEHOLDER -->';

// Define custom labels for specific filenames.
const customLabels = {
    'index.html': 'Home'
};

// --- Helper Function for Formatting ---
function formatFilename(filename) {
    const customLabel = customLabels[filename];
    if (customLabel) return customLabel;

    const nameWithoutExtension = filename.replace(/\.html$/i, '');
    if (nameWithoutExtension.length > 0) {
        return nameWithoutExtension.charAt(0).toUpperCase() + nameWithoutExtension.slice(1);
    }
    return '';
}

// --- Main Script Execution ---
console.log('--- Starting Directory Generator with JSON Exclusions ---');

try {
    // Step 1: Read and parse the JSON exclusion list synchronously.
    console.log(`Reading and parsing JSON exclusion list from: ${excludeListPath}`);
    const excludeData = fs.readFileSync(excludeListPath, 'utf8');
    const excludedPages = JSON.parse(excludeData).map(filename => filename.toLowerCase());

    console.log('Successfully processed exclusion list. The following pages will be ignored:');
    console.log(excludedPages.length > 0 ? excludedPages.join(', ') : 'No pages excluded.');

    // Step 2: Read all files in the /pages directory.
    console.log(`Scanning ${pagesDir} for HTML files...`);
    const files = fs.readdirSync(pagesDir);

    // Step 3: Filter the HTML files.
    const htmlFiles = files
        .filter(file => file.endsWith('.html'))
        .filter(file => !excludedPages.includes(file.toLowerCase()));

    // Step 4: Separate 'index.html' to ensure it's at the top, and sort the rest.
    const indexFile = 'index.html'; // we’ll manually add this link to /index.html
    const otherFiles = htmlFiles.filter(file => file !== indexFile).sort((a, b) => a.localeCompare(b));

    // Step 5: Generate the list items with a separator.
    let listItems = '';

    // Home button always links to root /index.html
    listItems += `<li><a href="/index.html">${formatFilename(indexFile)}</a></li>\n            <hr>\n            `;

    listItems += otherFiles.map(file => {
        const formattedName = formatFilename(file);
        // Links to /pages/filename.html
        return `<li><a href="/pages/${file}">${formattedName}</a></li>`;
    }).join('\n            ');

    // Step 6: Read the template HTML file.
    console.log(`Reading template HTML from: ${templatePath}`);
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    // Step 7: Replace the placeholder with the generated list.
    const finalHtml = templateContent.replace(placeholder, listItems);

    // Step 8: Write the final HTML content to the output file.
    console.log(`Writing final directory to: ${outputPath}`);
    fs.writeFileSync(outputPath, finalHtml, 'utf8');

    console.log('--- Directory updated successfully. You can now commit your changes. ---');

} catch (error) {
    console.error('An error occurred during script execution:');
    if (error instanceof SyntaxError) {
        console.error('JSON Parse Error: The directory_exclude.json file is not correctly formatted.');
    } else if (error.code === 'ENOENT') {
        console.error(`File not found: ${error.path}`);
    } else {
        console.error('An unexpected error occurred:', error);
    }
}
