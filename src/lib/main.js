import app from 'app';
import ipc from 'ipc';
import path from 'path';

import BrowserWindow from 'browser-window';
import CrashReporter from 'crash-reporter';
import Tray from 'tray';

import {getUserHome} from './utils';
import {Trackr} from './trackr/trackr';

const ROOT_DIR          = path.normalize(__dirname +'/../');
const TRAY_ARROW_HEIGHT = 10; //px
const WINDOW_WIDTH      = 375;

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

            window.loadUrl('file://'+ ROOT_DIR +'/views/index.html');

            window.on('close', () => {
                window = null;
            });

            trayIcon = new Tray(ROOT_DIR +'/assets/tray-icon.png');

            trayIcon.on('clicked', () => {
                if (window.isVisible()) {
                    window.hide();
                } else {
                    // From: https://github.com/atom/electron/issues/752
                    var cursorPosition = screen.getCursorScreenPoint();

                    window.setPosition(cursorPosition.x - parseInt(WINDOW_WIDTH / 2), TRAY_ARROW_HEIGHT);

                    // Force update
                    window.webContents.send('update-uptime', trackr.uptime.getTodayUptime().minutes);

                    window.show();
                    window.focus();
                }
            });

            window.on('blur', () => {
                window.hide();
            });

            window.webContents.on('did-finish-load', () => {
                window.webContents.send('notification', `Main Initialized. Hello ${process.env.USER}! - ${getUserHome()}`);
            });
        });

        ipc.on('quit', (event) => {
            app.quit();
        });

        trackr.uptime.on('update', uptime => {
            window.webContents.send('update-uptime', uptime.minutes);
        });

        //
        // Config Menu
        //
        var Menu = require('menu');
        var MenuItem = require('menu-item');

        var menu = new Menu();

        menu.append(new MenuItem({ label: 'Notify: Uptime?', click: () => window.webContents.send('notification', 'Uptime: '+ trackr.uptime.getTodayUptime()) }));
        menu.append(new MenuItem({ label: 'Disable notifications for 3 hours', type: 'checkbox', checked: false, click: () => window.webContents.send('notification', 'Notifications disabled for 3 hours') }));
        menu.append(new MenuItem({ type: 'separator' }));
        menu.append(new MenuItem({ label: 'Quit Trackr', click: () => app.quit() }));

        ipc.on('show-config-menu', (event) => {
            menu.popup(window);
        });
    }
}

// Report crashes to our server.
CrashReporter.start();

var trackr = new Trackr(getUserHome() +'/.trackr');
var gui    = new GUI(trackr, app);
