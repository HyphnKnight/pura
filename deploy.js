const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { readFile: rf, writeFile: wf } = require('fs');
const readFile = util.promisify(rf);
const writeFile = util.promisify(wf);

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

const logError =
  (errorText) =>
    console.log(`\x1b[31m%s\x1b[0m`, errorText);

const logFocus =
  (text) =>
  console.log(`\x1b[32m%s\x1b[0m`, text);

async function deploy() {
  logFocus(`Deploying Pura.`);
  try {
    console.log(`Checking for uncommited files.`);
    await exec(`git status | grep "working tree clean"`);
  } catch (e) {
    logError(`Deploy failed, can not deploy with uncommited code.`);
    process.exit(0);
  }
  try {
    console.log('Checking branch name.');
    await exec(`git branch | grep "* dev"`);
  } catch (e) {
    logError(`Deploy failed, can only deploy when on the dev branch.`);
    process.exit(0);
  }
  try {
    console.log(`Linting Pura.`)
    await exec(`npm run lint`);
  } catch (e) {
    logError(`Deploy failed, can not deploy while there are lint errors.`);
    console.log(e);
    process.exit(0);
  }
  try {
    console.log(`Compiling Pura.`)
    await exec(`npm run compile`);
  } catch (e) {
    logError(`Deploy failed, can not deploy the build failed.`);
    console.log(e);
    process.exit(0);
  }
  let version;
  try {
    console.log(`Checking package version.`);
    const packageStr = await readFile(`./package.json`, `utf8`);
    version = JSON.parse(packageStr).version;
  } catch (e) {
    logError(`Deploy failed, unable to read the package.json.`);
    console.log(e);
    process.exit(0);
  }
  try {
    console.log(`Switching to master branch.`);
    await exec(`git checkout master`);
  } catch (e) {
    logError(`Deploy failed, unable to switch to the master branch.`);
    console.log(e);
    process.exit(0);
  }
  try {
    console.log(`Checking and updating package version.`);
    const packageStr = await readFile(`./package.json`, `utf8`);
    const package = JSON.parse(packageStr);
    if (version === package.version) {
      await exec(`git reset HEAD --hard`);
      await exec(`git checkout dev`);
      logError(`Deploy failed, new version is the same as the old version.`);
      process.exit(0);
    }
    package.version = version;
    await writeFile('./package.json', JSON.stringify(package));
  } catch (e) {
    await exec(`git reset HEAD --hard`);
    await exec(`git checkout dev`);
    logError(`Deploy failed, unable to read/write package.json on the master branch.`);
    console.log(e);
    process.exit(0);
  }
  try {
    console.log(`Moving newer files out of dist folder.`);
    await exec(`mv -u ./dist/** ./`);
    await exec(`git add .`);
    console.log(`Commiting new version of the project.`);
    await exec(`git commit -m 'version@${version}'`);
    console.log(`Push new version of master.`);
    await exec(`git push origin master`);
    console.log(`Return to the dev branch.`);
    await exec(`git checkout dev`);
  } catch (e) {
    logError(`Deploy failed, unable to finish the commit of new files.`);
    await exec(`git reset HEAD --hard`);
    await exec(`git checkout dev`);
    console.log(e);
    process.exit(0);
  }
  logFocus(`Deploy Succeeded, version ${version} is now live.`);
}

deploy();
