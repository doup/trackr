import app from 'app';
import BrowserWindow from 'browser-window';
import CrashReporter from 'crash-reporter';
import Tray from 'tray';

import {Trackr} from './trackr.js';

//
// https://github.com/atom/electron/issues/752
//

class GUI {
    constructor(trackr, app) {
        this.app    = app;
        this.trackr = trackr;

        var appIcon = null;

        // Keep a global reference of the window object, if you don't, the window will
        // be closed automatically when the javascript object is GCed.
        var mainWindow = null;

        this.app.dock.hide();

        // Quit when all windows are closed.
        this.app.on('window-all-closed', () => {
            //if (process.platform != 'darwin') {
                //this.app.quit();
            //}
        });

        // This method will be called when atom-shell has done everything
        // initialization and ready for creating browser windows.
        this.app.on('ready', () => {
            appIcon = new Tray(__dirname + '/assets/tray-icon.png');

            appIcon.on('clicked', () => {
                mainWindow.show();
            });

            // Create the browser window.
            mainWindow = new BrowserWindow({
                width: 310,
                height: 335,
                show: false,
                resizable: false,
                frame: false,
                transparent: true,
            });

            // and load the index.html of the app.
            mainWindow.loadUrl('file://' + __dirname + '/index.html');

            // Emitted when the window is closed.
            mainWindow.on('closed', () => {
                // Dereference the window object, usually you would store windows
                // in an array if your app supports multi windows, this is the time
                // when you should delete the corresponding element.
                // mainWindow = null;
            });
        });
    }
}

// Report crashes to our server.
CrashReporter.start();

var trackr = new Trackr();
var gui    = new GUI(trackr, app);
