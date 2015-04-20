import app from 'app';
import BrowserWindow from 'browser-window';
import CrashReporter from 'crash-reporter';

import {Trackr} from './trackr.js';

var trackr = new Trackr();

// Report crashes to our server.
CrashReporter.start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    //if (process.platform != 'darwin') {
        app.quit();
    //}
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600 });

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    mainWindow.maximize();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});
