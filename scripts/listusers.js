module.exports = (config, local, backendAPI) => {
    const mongoose = require("mongoose");

    const VisionAutomateIO = require('../vision-automate-io');

    let ApiKey;
    try {
        ApiKey = mongoose.model("ApiKey");
    }
    catch {
        ApiKey = mongoose.model("ApiKey", new mongoose.Schema({
            companyName: {
                type: String,
                index: { unique: true }
            },
            pass: String,
            maxUses: Number,
            devices: [{
                _id: false,
                uuid: String,
                identifier: String
            }],
            scripts: [{
                _id: false,
                title: String,
                location: String,
                configHosted: Boolean,
                configSchema: Object,
                config: Object
            }]
        }));
    }

    const IO = new VisionAutomateIO(startScript, { local: local, api: backendAPI });

    function startScript() {
        IO.out("Connecting to database.");

        mongoose.set('strictQuery', false);
        mongoose.connect('mongodb://127.0.0.1/visionautomate');
        const connection = mongoose.connection;

        connection.once("open", () => {
            IO.out("Connected.");

            console.log(config.apiKey)
            ApiKey.findById(config.apiKey)
                .then((apiKey) => {
                    IO.out("Found users.");
                    let users = "Users:\n";
                    for (let i = 0; i < apiKey.devices.length; i++) {
                        users += `\n${i + 1}: ${apiKey.devices[i].identifier}`;
                    }
                    IO.out(users);

                    connection.close();
                    completeScript();
                })
                .catch((err) => {
                    console.log(err);
                    IO.out("Failed to find.", { failure: true });
                    connection.close();
                    completeScript();
                })
        })

    }

    function completeScript() {
        // console.log(apiObj);

        IO.close();
    }

    IO.run();
}

// module.exports({}, true);