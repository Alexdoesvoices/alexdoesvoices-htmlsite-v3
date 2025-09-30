// Import Node.js modules for file system operations
const fs = require('fs');
const path = require('path');

// --- Configuration Section ---

// The path to the exclusion list file.
const excludeListPath = path.join(__dirname, 'directory_exclude.json');

// The path to the template HTML file. This file will NEVER be overwritten.
const templatePath = path.join(__dirname, 'directory_template.html');

// The path for the final, generated directory HTML file.
const outputPath = path.join(__dirname, 'directory.html');

// The marker in the template where the list will be inserted.
const placeholder = '<!-- DIRECTORY_LIST_PLACEHOLDER -->';

// Define custom labels for specific filenames.
// The key should be the filename (e.g., 'index.html') and the value is the desired label (e.g., 'Home').
const customLabels = {
    'index.html': 'Home'
};

// --- Helper Function for Formatting ---
/**
 * Takes a filename string, checks for a custom label, and if none exists,
 * removes the .html extension and capitalizes the first letter.
 * @param {string} filename The file name to format (e.g., 'index.html').
 * @returns {string} The formatted name (e.g., 'Home').
 */
function formatFilename(filename) {
    // 1. Check if a custom label exists for this filename.
    const customLabel = customLabels[filename];
    if (customLabel) {
        return customLabel;
    }

    // 2. If no custom label, remove the '.html' extension.
    const nameWithoutExtension = filename.replace(/\.html$/i, '');
    
    // 3. Capitalize the first letter of the resulting string.
    if (nameWithoutExtension.length > 0) {
        return nameWithoutExtension.charAt(0).toUpperCase() + nameWithoutExtension.slice(1);
    }
    return ''; // Return an empty string if the filename was empty.
}

// --- Main Script Execution ---

console.log('--- Starting Directory Generator with JSON Exclusions ---');

// Use a try-catch block to handle errors gracefully and provide detailed feedback.
try {
    // Step 1: Read and parse the JSON exclusion list synchronously.
    console.log(`Reading and parsing JSON exclusion list from: ${excludeListPath}`);
    const excludeData = fs.readFileSync(excludeListPath, 'utf8');
    const excludedPages = JSON.parse(excludeData).map(filename => filename.toLowerCase());
    
    console.log('Successfully processed exclusion list. The following pages will be ignored:');
    console.log(excludedPages.length > 0 ? excludedPages.join(', ') : 'No pages excluded.');
    
    // Step 2: Read all files in the current directory synchronously.
    console.log('Scanning current directory for all files...');
    const files = fs.readdirSync(__dirname);

    // Step 3: Filter the files to be included in the directory.
    const htmlFiles = files
        .filter(file => file.endsWith('.html'))
        .filter(file => !excludedPages.includes(file.toLowerCase()));

    // Step 4: Separate 'index.html' to ensure it's at the top, and sort the rest.
    const indexFile = htmlFiles.find(file => file === 'index.html');
    const otherFiles = htmlFiles.filter(file => file !== 'index.html').sort((a, b) => a.localeCompare(b));
    
    // Step 5: Generate the list items with a separator.
    let listItems = '';
    if (indexFile) {
        listItems += `<li><a href="${indexFile}">${formatFilename(indexFile)}</a></li>\n            `;
        // Add a horizontal rule for visual separation.
        listItems += `<hr>\n            `;
    }
    
    listItems += otherFiles.map(file => {
        const formattedName = formatFilename(file);
        return `<li><a href="${file}">${formattedName}</a></li>`;
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
    // Provide specific, helpful error messages for JSON or file-related errors.
    console.error('An error occurred during script execution:');
    if (error instanceof SyntaxError) {
        console.error('JSON Parse Error: The directory_exclude.json file is not correctly formatted.');
        console.error('Please ensure it is a valid JSON array of strings, with commas between items.');
        console.error('Example: ["directory.html", "help.html"]');
    } else if (error.code === 'ENOENT') {
        console.error(`File not found: ${error.path}`);
        console.error('Please make sure your `directory_exclude.json` and `directory_template.html` files exist in the same folder as this script.');
    } else {
        console.error('An unexpected error occurred:', error);
    }
}