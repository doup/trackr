import app from 'app';
import ipc from 'ipc';
import BrowserWindow from 'browser-window';
import CrashReporter from 'crash-reporter';
import Tray from 'tray';

import {Trackr} from './trackr.js';

const TRAY_ARROW_HEIGHT = 8; //px
const WINDOW_WIDTH = 375;

class GUI {
    constructor(trackr, app) {
        var trayIcon = null;
        var window = null;

        this.app    = app;
        this.trackr = trackr;

        this.app.dock.hide();

        this.app.on('window-all-closed', () => {
            //if (process.platform != 'darwin') {
                //this.app.quit();
            //}
        });

        this.app.on('ready', () => {
            var screen = require('screen');

            window = new BrowserWindow({
                width: WINDOW_WIDTH,
                height: 335,
                title: 'Hello World',
                resizable: false,
                frame: false,
                transparent: true,
                show: false
            });

            window.loadUrl('file://'+ __dirname +'/index.html');

            window.on('close', () => {
                window = null;
            });

            trayIcon = new Tray(__dirname +'/assets/tray-icon.png');

            trayIcon.on('clicked', () => {
                // From: https://github.com/atom/electron/issues/752
                var cursorPosition = screen.getCursorScreenPoint();

                window.setPosition(cursorPosition.x - parseInt(WINDOW_WIDTH / 2), TRAY_ARROW_HEIGHT);

                window.show();
                window.focus();
            });

            window.on('blur', () => {
                window.hide();
            });
        });

        ipc.on('quit', (event) => {
            app.quit();
        });
    }
}

// Report crashes to our server.
CrashReporter.start();

var trackr = new Trackr();
var gui    = new GUI(trackr, app);
