module.exports = (config, local, backendAPI) => {
   const VisionAutomateIO = require('../../vision-automate-io');
   const IO = new VisionAutomateIO({ local: local, api: backendAPI });

   let file1;
   let file2;

   IO.out("Upload a file of your choosing:");

   IO.inFile((info) => {
      file1 = info;

      IO.inFile((info) => {
         file2 = info;

         sendLastData();
      }, { writeFile: true, location: "pdf.pdf" }, "~/Downloads/pdf.pdf");
   }, { writeFile: true, location: "test.txt" }, "~/Downloads/text.txt");

   function sendLastData() {
      IO.outFile(file1.name);
      IO.outFile(file2.name);
      IO.close();
   }

}

// module.exports({}, true); // Uncomment to run locally.