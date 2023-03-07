module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('../../vision-automate-io');
   const IO = new VisionAutomateIO({ local: local, api: backendAPI });

   IO.writeFile("Hello, world!", "test.txt");
   IO.writeFile("Hi world.", "test1/test2/test3/test4.txt");

   setTimeout(() => {
      IO.close();
   }, 10000);

   IO.close();
}

// module.exports({}, true); // Uncomment to run locally.