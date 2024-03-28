const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

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

            // Filter personal Information
            const mmrObjects = result.Attributes.Attr.filter(attr => 
                attr.$.name.includes("MissionBagPlayer") && attr.$.value.includes("Rens")
            );
            console.log("Me:");
            mmrObjects.forEach(obj => {
                console.log(`Name: ${obj.$.name}, Value: ${obj.$.value}`);
            });

            // Filter enemy i downed
            const downedbymeObjects = result.Attributes.Attr.filter(attr =>
                attr.$.name.includes("MissionBagPlayer") && attr.$.name.includes("downedbyme") && attr.$.value === "1"
            );
            console.log("Player who i downed:");
            downedbymeObjects.forEach(obj => {
                console.log(`Name: ${obj.$.name}, Value: ${obj.$.value}`);
            });

            // Filter enemy who i killed
            const killedbymeObjects = result.Attributes.Attr.filter(attr =>
                attr.$.name.includes("MissionBagPlayer") && attr.$.name.includes("killedbyme") && attr.$.value === "1"
            );
            console.log("Player who i killed:");
            killedbymeObjects.forEach(obj => {
                console.log(`Name: ${obj.$.name}, Value: ${obj.$.value}`);
            });

            // Filter enemy who downed me
            const downedmeObjects = result.Attributes.Attr.filter(attr =>
                attr.$.name.includes("MissionBagPlayer") && attr.$.name.includes("downedme") && attr.$.value === "1"
            );
            console.log("Player who downed me:");
            downedmeObjects.forEach(obj => {
                console.log(`Name: ${obj.$.name}, Value: ${obj.$.value}`);
            });

            // Filter enemy who killed me
            const killedmeObjects = result.Attributes.Attr.filter(attr =>
                attr.$.name.includes("MissionBagPlayer") && attr.$.name.includes("killedme") && attr.$.value === "1"
            );
            console.log("Player who killed me:");
            killedmeObjects.forEach(obj => {
                console.log(`Name: ${obj.$.name}, Value: ${obj.$.value}`);
            });
        });
    });
}

readXmlFile();
