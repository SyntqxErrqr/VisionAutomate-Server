module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('../../vision-automate-io');
   const IO = new VisionAutomateIO({ local: local, api: backendAPI });

   console.log("FIRST");
   IO.updateConfig({ numTest: 9, arrTest: ['Test1', 'abcd', 4] });

   IO.close();
}

module.exports({}, true); // Uncomment to run locally.