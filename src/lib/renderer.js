import ipc from 'ipc';

function config() {
    ipc.send('show-config-menu');
}

function notify(msg) {
    new Notification(msg);
}

ipc.on('notification', (msg) => {
    new Notification(msg);
});
