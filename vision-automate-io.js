const readline = require("readline");
const fs = require("fs");
const os = require("os");
const jschardet = require('jschardet');

class VisionAutomateIO {
   // Set this to true if this is being ran manually. If run through VisionAutomate, set to false.
   local = false;
   backendAPI;
   fileLocation;
   folderExists = false;

   constructor(obj = {}) {
      this.local = obj.local;
      if (!this.local) {
         this.backendAPI = obj.api;
         this.fileLocation = `${this.backendAPI.wDir}/files/${this.backendAPI.id}/`;
      }
      else {
         this.fileLocation = './';
      }
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

   inFile(callback, setFileInfo = { writeFile: false, location: "" }, fileLocation = "") {
      // Receives a file
      if (this.local) {
         if (!fileLocation) {
            this.out("File location: ");
            this.in((searchLocation) => {
               fileLocation = searchLocation;
            });
         }

         let loc = fileLocation;
         loc = loc.replace(/^~($|\/|\\)/, `${os.homedir()}/`);
         if (!fs.existsSync(loc)) throw "File does not exist.";

         let buffer = fs.readFileSync(loc);

         if (setFileInfo.writeFile) {
            if (setFileInfo.location == undefined) {
               let file = fileLocation.split('/');
               file = file[file.length - 1];
               setFileInfo.location = file;
            }

            this.writeFile(buffer, setFileInfo.location);
         }

         try {
            let encoding = jschardet.detect(buffer).encoding;

            callback(buffer.toString(encoding));
         }
         catch {
            callback(buffer);
         }
      }
      else {

      }
   }

   writeFile(data, location = "") {
      if (!this.folderExists) {
         if (!fs.existsSync(this.fileLocation)) {
            console.log("Doesn't exist")
            fs.mkdirSync(this.fileLocation);
         }
         this.folderExists = true;
      }

      let locArr = location.split('/');
      let path = this.fileLocation;

      for (let i = 0; i < locArr.length - 1; i++) {
         path += `${locArr[i]}/`;
         if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
         }
      }

      try {
         fs.writeFileSync(path + locArr[locArr.length - 1], data);
         // Potenially add a return to this.
      } catch {
         throw "File already exists."
      }
   }

   getFile(location) {

   }

   close() {
      this.out("Script complete.", { success: true, action: "close" })
      if (!this.local) {
         this.backendAPI.close();
      }
   }
}

module.exports = VisionAutomateIO;