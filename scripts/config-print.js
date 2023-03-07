module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('../vision-automate-io');
   const IO = new VisionAutomateIO({ local: local, api: backendAPI });

   IO.out(JSON.stringify(config, null, 3));

   IO.close();
}

// module.exports({}, true); // Uncomment to run locally.