const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// Elo rating constant
const k = 32;

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // Load the index.html file of your Electron app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools in development mode.
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

// This method will be called when Electron has finished initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS, re-create a window in the app when the dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

function readXmlFile(callback) {
    // Define the path to the XML file
    const filePath = "D:\\SteamLibrary\\steamapps\\common\\Hunt Showdown\\user\\profiles\\default\\attributes.xml";

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
        console.log(`File '${filePath}' not found.`);
        return;
    }

    // Read the XML file
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error(`Error reading XML file '${filePath}': ${err}`);
            return callback(err); // Call the callback with an error
        }

        // Parse the XML data
        xml2js.parseString(data, (parseErr, result) => {
            if (parseErr) {
                console.error(`Error parsing XML file '${filePath}': ${parseErr}`);
                return callback(parseErr); // Call the callback with an error
            }

            let myMMR = 0;

            // Filter personal Information
            const playerMe = result.Attributes.Attr.filter(attr =>
                attr.$.name.includes("MissionBagPlayer") && attr.$.value.includes("Rens")
            );

            let lastMatchingObject = null;
            playerMe.forEach(obj => {
                console.log(`Name: ${obj.$.name}, Value: ${obj.$.value}`);
                lastMatchingObject = obj;
            });

            if (lastMatchingObject) {
                const matches = lastMatchingObject.$.name.match(/MissionBagPlayer_(\d+)_\d+/);
                if (matches) {
                    const personalInfoPrefix = matches[0];
                    const personalInfo = `${personalInfoPrefix}_mmr`;
                    console.log("Personal Info:", personalInfo);

                    // Filter my current MMR
                    const personalMmrObjects = result.Attributes.Attr.filter(attr =>
                        attr.$.name.includes(personalInfo)
                    );
                    console.log("My MMR:");
                    personalMmrObjects.forEach(obj => {
                        console.log(`Value: ${obj.$.value}`);
                        myMMR = parseInt(obj.$.value); // Update my MMR
                    });
                } else {
                    console.log("No matching object found");
                }
            } else {
                console.log("No objects found");
            }

            // Filter enemy i downed
            const downedbymeObjects = result.Attributes.Attr.filter(attr =>
                attr.$.name.includes("MissionBagPlayer") && attr.$.name.includes("downedbyme") && attr.$.value === "1"
            );
            console.log("Player who I downed:");
            downedbymeObjects.forEach(obj => {
                console.log(`Name: ${obj.$.name}, Value: ${obj.$.value}`);
                const matches = obj.$.name.match(/(MissionBagPlayer_\d+_\d+)_downedbyme/);
                if (matches) {
                    const downedPlayerVariable = `${matches[1]}_mmr`;
                    // Filter MMR for the downed player
                    const downedPlayerMmrObjects = result.Attributes.Attr.filter(attr =>
                        attr.$.name.includes(matches[1] + "_mmr")
                    );
                    downedPlayerMmrObjects.forEach(mmrObj => {
                        console.log(`MMR for ${matches[1]}: ${mmrObj.$.value}`);
                        myMMR += k * (1 - 1 / (1 + Math.pow(10, (parseInt(mmrObj.$.value) - myMMR) / 400)));
                    });
                }
            });

            // Filter enemy who i killed
            const killedbymeObjects = result.Attributes.Attr.filter(attr =>
                attr.$.name.includes("MissionBagPlayer") && attr.$.name.includes("killedbyme") && attr.$.value === "1"
            );
            console.log("Player who I killed:");
            killedbymeObjects.forEach(obj => {
                console.log(`Name: ${obj.$.name}, Value: ${obj.$.value}`);
                const matches = obj.$.name.match(/(MissionBagPlayer_\d+_\d+)_killedbyme/);
                if (matches) {
                    const killedByMePlayerVariable = `${matches[1]}_mmr`;
                    // Filter MMR for the player I killed
                    const killedByMePlayerMmrObjects = result.Attributes.Attr.filter(attr =>
                        attr.$.name.includes(matches[1] + "_mmr")
                    );
                    killedByMePlayerMmrObjects.forEach(mmrObj => {
                        console.log(`MMR for ${matches[1]}: ${mmrObj.$.value}`);
                        myMMR += k * (1 - 1 / (1 + Math.pow(10, (parseInt(mmrObj.$.value) - myMMR) / 400)));
                    });
                }
            });

            // Filter enemy who downed me
            const downedmeObjects = result.Attributes.Attr.filter(attr =>
                attr.$.name.includes("MissionBagPlayer") && attr.$.name.includes("downedme") && attr.$.value === "1"
            );
            console.log("Player who downed me:");
            downedmeObjects.forEach(obj => {
                console.log(`Name: ${obj.$.name}, Value: ${obj.$.value}`);
                const matches = obj.$.name.match(/(MissionBagPlayer_\d+_\d+)_downedme/);
                if (matches) {
                    const downedMePlayerVariable = `${matches[1]}_mmr`;
                    // Filter MMR for the player who downed me
                    const downedMePlayerMmrObjects = result.Attributes.Attr.filter(attr =>
                        attr.$.name.includes(matches[1] + "_mmr")
                    );
                    downedMePlayerMmrObjects.forEach(mmrObj => {
                        console.log(`MMR for ${matches[1]}: ${mmrObj.$.value}`);
                        myMMR += k * (0 - 1 / (1 + Math.pow(10, (parseInt(myMMR) - parseInt(mmrObj.$.value)) / 400)));
                    });
                }
            });

            // Filter enemy who killed me
            const killedmeObjects = result.Attributes.Attr.filter(attr =>
                attr.$.name.includes("MissionBagPlayer") && attr.$.name.includes("killedme") && attr.$.value === "1"
            );
            console.log("Player who killed me:");
            killedmeObjects.forEach(obj => {
                console.log(`Name: ${obj.$.name}, Value: ${obj.$.value}`);
                const matches = obj.$.name.match(/(MissionBagPlayer_\d+_\d+)_killedme/);
                if (matches) {
                    const killedMePlayerVariable = `${matches[1]}_mmr`;
                    // Filter MMR for the player who killed me
                    const killedMePlayerMmrObjects = result.Attributes.Attr.filter(attr =>
                        attr.$.name.includes(matches[1] + "_mmr")
                    );
                    killedMePlayerMmrObjects.forEach(mmrObj => {
                        console.log(`MMR for ${matches[1]}: ${mmrObj.$.value}`);
                        myMMR += k * (0 - 1 / (1 + Math.pow(10, (parseInt(myMMR) - parseInt(mmrObj.$.value)) / 400)));
                    });
                }
            });

            // Print the predicted MMR
            console.log();
            console.log('Predicted MMR:', myMMR.toFixed(2));
            console.log();
        });
    });
}

readXmlFile();


