const readline = require("readline");

class VisionAutomateIO {
   // Set this to true if this is being ran manually. If run through VisionAutomate, set to false.
   start;
   local = false;
   backendAPI;

   constructor(start, obj = {}) {
      this.start = start;
      this.local = obj.local;
      if (!this.local) {
         this.backendAPI = obj.api;
      }
   }

   run() {
      // Runs the first function provided by the script.
      this.start();
   }

   out(str, props = {}) {
      if (this.local) {
         console.log(str);
      }
      else {
         this.backendAPI.send({ text: str, props: props });
      }
   }


   in(callback, errCallback = () => { this.close() }) {
      if (this.local) {
         // If running locally: 
         // Creates a readline interface, reads the line, and closes. 
         const rl = readline.createInterface({
            input: process.stdin
         });
         rl.question("", (input) => {
            rl.close();
            callback(input);
         });
      }
      else {
         // If running through a client:
         // Sends a message with the userInput property, awaits user to send data back, calls the given callback from the script. 
         this.out("", { userInput: true });
         this.backendAPI.receive()
            .then((message) => {
               callback(message);
            })
            .catch((err) => {
               console.log(err);
               this.out(err, { error: true });
               errCallback(err);
            })
      }
   }

   outFile() {
      // Sends a file
   }

   inFile(fileLocation) {
      // Receives a file
      if (this.local) {
         this.out("File location: ");
         this.in((searchLocation) => {

         });
      }
      else {

      }
   }

   close() {
      this.out("Script complete.", { success: true, action: "close" })
      if (!this.local) {
         this.backendAPI.close();
      }
   }
}

module.exports = VisionAutomateIO;