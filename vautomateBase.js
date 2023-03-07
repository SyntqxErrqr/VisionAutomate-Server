module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('./vision-automate-io');

   /* Creates an object that can be used for running the script locally and/or through the client.
   Parameters: 
   
   0: Settings. {
      local: When set to true, runs the script locally. When set to false, runs the script through the api provided.
      api: Optional. Not used when running locally. Used to communicate between the server and the client.
   }
   */
   const IO = new VisionAutomateIO({ local: local, api: backendAPI });

   /*

      Your code goes here.

   */

   // Closes the script and connection.
   IO.close();
}

// module.exports({}, true); // Uncomment to run locally.