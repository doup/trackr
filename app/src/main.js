import app from 'app';
import ipc from 'ipc';
import path from 'path';

import BrowserWindow from 'browser-window';
import CrashReporter from 'crash-reporter';
import Tray from 'tray';

import {getUserHome} from './utils';
import {Trackr} from './trackr/trackr';

import quotes from './quotes.json';

const ROOT_DIR          = path.normalize(__dirname +'/../');
const TRAY_ARROW_HEIGHT = 10; //px
const WINDOW_WIDTH      = 325;

// Debug utils
require('electron-debug')();

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
                title:       'Trackr',
                width:       WINDOW_WIDTH,
                height:      180,
                resizable:   false,
                frame:       false,
                transparent: true,
                show:        false
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
                    window.webContents.send('update-uptime', this.trackr.uptime.getStats());

                    window.show();
                    window.focus();
                }
            });

            window.on('blur', () => {
                window.hide();
            });

            window.webContents.on('did-finish-load', () => {
                //window.webContents.send('notification', `Main Initialized. Hello ${process.env.USER}! - ${getUserHome()}`);
            });
        });

        ipc.on('quit', (event) => {
            app.quit();
        });

        this.trackr.uptime.on('update', uptime => {
            var threshold = this.trackr.uptime.getTodayThreshold();
            var overtime;

            window.webContents.send('update-uptime', this.trackr.uptime.getStats());

            //
            // Overtime Check
            //
            function getRandomQuote() {
                return quotes[parseInt(Math.random() * quotes.length)]
            }

            if (uptime.minutes >= ((threshold.upper * 1.15) * 60)) {
                overtime = ((uptime.minutes - (threshold.upper * 60)) % 1) == 0;
            } else if (uptime.minutes >= (threshold.upper * 60)) {
                overtime = ((uptime.minutes - (threshold.upper * 60)) % 5) == 0;
            } else if (uptime.minutes >= (threshold.lower * 60)) {
                overtime = ((uptime.minutes - (threshold.lower * 60)) % 15) == 0;
            }

            if (overtime && !notificationsDisabled) {
                window.webContents.send('notification', getRandomQuote());
                window.webContents.send('ping');
            }
        });

        // Notifications toggle
        var notificationsDisabled = false;

        function toggleNotifications() {
            notificationsDisabled = !notificationsDisabled;

            if (notificationsDisabled) {
                window.webContents.send('notification', 'Notifications disabled.');
            } else {
                window.webContents.send('notification', 'Notifications enabled.');
            }
        }

        //
        // Config Menu
        //
        var Menu = require('menu');
        var MenuItem = require('menu-item');

        var menu = new Menu();

        //menu.append(new MenuItem({ label: 'Edit thresholds…', click: () => window.webContents.send('notification', 'Threshold view appears') }));
        menu.append(new MenuItem({ label: 'Disable notifications', type: 'checkbox', checked: false, click: toggleNotifications }));
        //menu.append(new MenuItem({ label: 'Disable notifications for 2.5 hours', type: 'checkbox', checked: false, click: () => window.webContents.send('notification', 'Notifications disabled for 3 hours') }));
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
