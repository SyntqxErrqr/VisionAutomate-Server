module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('./vision-automate-io');

   /* Creates an object that can be used for running the script locally and/or through the client.

   Parameters: 
   
      0: callback function that runs the code from this script.
      1: Settings. {
         local: When set to true, runs the script locally. When set to false, runs the script through the api provided.
         api: Optional. Not used when running locally. Used to communicate between the server and the client.
      }
   */
   const IO = new VisionAutomateIO(startScript, { local: local, api: backendAPI });

   // Provided to IO. Called by IO.run();.
   function startScript() {
      /*

         Your code goes here.

      */
      IO.out("https://imgs.search.brave.com/_3zTXZYcrMHL3JJ5ODocGIfkqcf8iNnlkScHwfLV2_E/rs:fit:711:225:1/g:ce/aHR0cHM6Ly90c2Uy/Lm1tLmJpbmcubmV0/L3RoP2lkPU9JUC5i/WlJ1YS1HVHp3NGh2/VzFBT2RSY25RSGFF/OCZwaWQ9QXBp", { image: true });

      imageFromConfig();
   }

   function imageFromConfig() {
      IO.out(config.image, { image: true });

      imageFromInput();
   }

   function imageFromInput() {
      IO.in((input) => {
         IO.out(input, { image: true });

         completeScript();
      })
   }

   completeScript();
   // Called by startScript();. Runs IO.close(); which completes the script and terminates the connection.
   function completeScript() {
      IO.close();
   }

   // Starts the script. It is best to keep this line at the bottom.
   IO.run();
}

// module.exports({}, true); // Uncomment to run locally.