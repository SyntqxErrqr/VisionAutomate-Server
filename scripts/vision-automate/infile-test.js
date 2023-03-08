module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('../../vision-automate-io');
   const IO = new VisionAutomateIO({ local: local, api: backendAPI });

   IO.inFile((info) => {
      IO.out(`Name: ${info.name}`);
      IO.out(`Type: ${info.type}`);

      setTimeout(() => {
         IO.close();
      }, 10000)
   }, { writeFile: true, location: "test.txt" }, "~/Downloads/text.txt");
}

// module.exports({}, true); // Uncomment to run locally.