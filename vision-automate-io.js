const readline = require("readline");
const fs = require("fs");
const os = require("os");
const mime = require('mime');

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

   out(str, props = {}, data = {}) {
      if (this.local) {
         console.log(str);
      }
      else {
         if (props.downloadFile) {
            this.backendAPI.send({ text: str, fileData: data.fileData, props: props });
         }
         else if (props.uploadConfig) {
            this.backendAPI.send({ text: str, configData: data.configData, props: props });
         }
         else {
            this.backendAPI.send({ text: str, props: props });
         }
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

   outFile(fileLocation, desiredLocation = "") {
      console.log(fileLocation);
      // Sends a file
      fileLocation = this.fileLocation + fileLocation;
      // Used to get the filename.
      let locArr = fileLocation.split("/");
      if (this.local) {
         if (desiredLocation) {
            console.log(locArr)
            console.log(desiredLocation + locArr[locArr.length - 1]);
            this.writeFile(fs.readFileSync(fileLocation), desiredLocation + locArr[locArr.length - 1]);
         }
         else {
            this.out("Missing desiredLocation: (fileLocation, desiredLocation)");
         }
      }
      else {
         if (fs.existsSync(fileLocation)) {

            // Reads the file as a buffer and then converts the data to a base64 string to send.
            let fileData = fs.readFileSync(fileLocation)
            this.out(locArr[locArr.length - 1], { downloadFile: true }, { fileData: Buffer.from(fileData, 'binary').toString('base64') });
         }
      }
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
         let type = mime.getType(loc);

         if (setFileInfo.writeFile) {
            if (setFileInfo.location == undefined) {
               let file = fileLocation.split('/');
               file = file[file.length - 1];
               setFileInfo.location = file;
            }

            this.writeFile(buffer, setFileInfo.location);
         }

         if (setFileInfo.location) {
            callback({ name: setFileInfo.location, type: type });
         }
         else {
            let locArr = loc.split('/');
            callback({ name: locArr[locArr.length - 1], type: type });
         }
      }
      else {
         this.out("Select file.", { userUpload: true });
         this.backendAPI.receiveFile()
            .then((obj) => {
               this.writeFile(Buffer.from(obj.data, "base64"), obj.info.name);
               callback(obj.info);
            })
            .catch((err) => {
               console.log(err);
               this.out(err, { error: true });
               callback(err);
            })
      }
   }

   writeFile(data, location = "") {
      let oldLoc = location;
      location = location.replace(/^~($|\/|\\)/, `${os.homedir()}/`);

      let homeToggle = oldLoc == location;

      if (!this.folderExists) {
         if (!fs.existsSync(this.fileLocation)) {
            fs.mkdirSync(this.fileLocation);
         }
         this.folderExists = true;
      }

      let locArr = location.split('/');

      let path = "";
      if (homeToggle) path = this.fileLocation;

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

   updateConfig(data) {
      if (this.local) {
         this.out("Running locally does not support updating config from this library.");
      }
      else {
         this.out("Updating config.", { uploadConfig: true, highlight: true }, { configData: data });
      }
   }


   close() {
      this.out("Script complete.", { success: true, highlight: true, action: "close" })
      if (!this.local) {
         this.backendAPI.close();
      }
   }
}

module.exports = VisionAutomateIO;