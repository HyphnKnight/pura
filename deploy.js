const exec = require('child_process').exec;

/**
 * Deploy Process:
 * Check for uncommited changes
 * Check if on dev branch
 * Compile project
 * Get current version
 * Checkout master branch
 * Check to make sure master version is not equal to dev version
 * Update master version to dev version
 * Recursively move files from the dist folder to the top level of root
 * Add all the files
 * Commit change with the new version number
 * Push changes
 * Checkout dev branch
 */

