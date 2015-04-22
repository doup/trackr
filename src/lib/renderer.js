import ipc from 'ipc';

function quit() {
    //require('remote').require('app').quit();
    ipc.send('quit');
}

ipc.on('notification', (msg) => {
    new Notification(msg);
});

function notify(msg) {
    new Notification(msg);
}
