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


    in(callback, errCallback = () => { }) {
        if (this.local) {
            const rl = readline.createInterface({
                input: process.stdin
            });
            rl.question("", (input) => {
                rl.close();
                callback(input);
            });
        }
        else {
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

    inFile() {
        // Receives a file
    }

    outFile() {
        // Sends a file
    }

    close() {
        this.out("Script complete.", { success: true, action: "close" })
        if (!this.local) {
            this.backendAPI.close()
        }
    }
}

module.exports = VisionAutomateIO;