import ipc from 'ipc';

function config() {
    ipc.send('show-config-menu');
}

function notify(msg) {
    new Notification(msg);
}

function formatHour(minutes) {
    var hours = Math.floor(minutes / 60);
    minutes = minutes - (hours * 60);

    return `${hours}h ${minutes}m`;
}

ipc.on('notification', msg => notify(msg));

ipc.on('update-uptime', minutes => {
    document.getElementById('time').innerHTML = formatHour(minutes);
});
