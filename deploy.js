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

async function deploy() {
  console.log(`Deploying Pura.`);
  try {
    await exec(`git status | grep "working tree clean"`);
  } catch (e) {
    console.log(`Deploy failed, can not deploy with uncommited code.`);
    process.exit(0);
  }
  try {
    await exec(`git branch | grep "*"`);
  } catch (e) {
    console.log(`Deploy failed, can only deploy when on the dev branch.`);
    process.exit(0);
  }
  console.log(`Compiling Pura.`)
  try {
    await exec(`npm run compile`);
  } catch (e) {
    console.log(`Deploy failed, can not deploy the build failed.`);
    // process.exit(0);
  }
  let version;
  try {
    const packageStr = await readFile(`./package.json`, `utf8`);
    version = JSON.parse(packageStr).version;
  } catch (e) {
    console.log(`Deploy failed, unable to read the package.json`);
    process.exit(0);
  }
  try {
    await exec(`git checkout master`);
  } catch (e) {
    console.log(`Deploy failed, unable to switch to the master branch.`);
    process.exit(0);
  }
  try {
    const packageStr = await readFile(`./package.json`, `utf8`);
    const package = JSON.parse(packageStr);
    if (version === package.version) {
      console.log(`Deploy failed, new version is the same as the old version.`);
      process.exit(0);
    }
    package.version = version;
    await writeFile('./package.json', JSON.stringify(package));
  } catch (e) {
    console.log(`Deploy failed, unable to read/write package.json on the master branch.`);
    process.exit(0);
  }
  try {
    await exec(`mv ./dist/** ./`);
    await exec(`git add .`);
    await exec(`git commit -m 'version@${version}`);
    await exec(`git push origin master`);
    await exec(`git checkout dev`);
  } catch (e) {
    console.log(`Deploy failed, unable to move files during the build.`);
    await exec(`git reset HEAD --hard`);
    await exec(`git checkout dev`);
    process.exit(0);
  }
  console.log(`Deploy Succeeded, version ${version} is now live.`);
}

deploy();
