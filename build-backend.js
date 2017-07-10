const exec = require('child_process').exec;
const fs = require('fs-extra');

const backendJarSource = 'target/backend.jar';
const backendJarDestination = 'src/main/resources/backend.jar';

console.log('Building backend jar...');
exec('mvn clean package', function(error, stdout, stderr) {
  if (error != null) {
    console.log(stdout);
    console.error(stderr);
    process.exit(error.code || 1);
  }

  try {
    fs.removeSync(backendJarDestination);
    fs.copySync(backendJarSource, backendJarDestination);

    exec('mvn clean', function(error, stdout, stderr) {
      if (error != null) {
        console.log(stdout);
        console.error(stderr);
        process.exit(error.code || 1);
      }

      // Attempt to remove 'out' directory, with retries
      let tries = 3;
      let removeOutErr = null;
      while (tries-- > 0) {
        try {
          fs.removeSync('out');
          removeOutErr = null;
        } catch (error) {
          removeOutErr = error;
        }
      }
      if (removeOutErr != null) {
        console.error(error.message);
        process.exit(1);
      }

      console.log('Done building backend jar');
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
});
