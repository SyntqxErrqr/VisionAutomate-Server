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

      completeScript();
   }

   // Called by startScript();. Runs IO.close(); which completes the script and terminates the connection.
   function completeScript() {
      IO.close();
   }

   // Starts the script. It is best to keep this line at the bottom.
   IO.run();
}

// module.exports({}, true); // Uncomment to run locally.