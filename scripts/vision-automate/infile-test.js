module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('../../vision-automate-io');
   const IO = new VisionAutomateIO({ local: local, api: backendAPI });

   IO.inFile((data) => {
      console.log(data);
      IO.close();
   }, { writeFile: true, location: "test.txt" }, "~/Downloads/text.txt");
}

// module.exports({}, true); // Uncomment to run locally.