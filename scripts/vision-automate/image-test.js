module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('../../vision-automate-io');
   const IO = new VisionAutomateIO({ local: local, api: backendAPI });

   IO.out("Direct:");
   IO.out("https://imgs.search.brave.com/_3zTXZYcrMHL3JJ5ODocGIfkqcf8iNnlkScHwfLV2_E/rs:fit:711:225:1/g:ce/aHR0cHM6Ly90c2Uy/Lm1tLmJpbmcubmV0/L3RoP2lkPU9JUC5i/WlJ1YS1HVHp3NGh2/VzFBT2RSY25RSGFF/OCZwaWQ9QXBp", { image: true });

   IO.out("Config:");
   IO.out(config.image, { image: true });

   IO.in((input) => {
      IO.out("Input:");
      IO.out(input, { image: true });

      IO.close();
   })
}

// module.exports({}, true); // Uncomment to run locally.