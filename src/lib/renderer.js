import ipc from 'ipc';

function config() {
    ipc.send('show-config-menu');
}

function notify(msg) {
    new Notification(msg);
}

function formatHour(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    } else {
        var hours = Math.floor(minutes / 60);

        minutes = minutes - (hours * 60);
        minutes = ('00'+ minutes).slice(-2);

        return `${hours}h ${minutes}m`;
    }
}

ipc.on('notification', msg => notify(msg));

ipc.on('update-uptime', stats => {
    var today = stats.data[stats.data.length - 1];

    document.getElementById('time').innerHTML = formatHour(today.minutes);
    drawUptimeChart('#uptimeChart', stats.data);
});

function drawUptimeChart(container, data) {
    d3.select("svg").remove();
    var svg = dimple.newSvg(container, 250, 100);
    var c = new dimple.chart(svg, data);
    var x = c.addCategoryAxis("x", "date");
    var y = c.addMeasureAxis("y", "hours");
    var y2 = c.addMeasureAxis(y, "lower");
    var y3 = c.addMeasureAxis(y, "upper");
    var s = c.addSeries('Hours', dimple.plot.bar, [x,y]);
    var s2 = c.addSeries('Lower', dimple.plot.line, [x,y2]);
    var s3 = c.addSeries('Upper', dimple.plot.line, [x,y3]);

    x.hidden = true;
    y.hidden = true;
    y.showGridlines = true;
    y.title = null;
    y.ticks = 5;

    s.barGap = 0.0;
    s.getTooltipText = s2.getTooltipText = s3.getTooltipText = function (e) { return [formatHour(Math.round(e.yValue * 60))]; };
    s2.interpolation = s3.interpolation = 'step';
    s2.lineWeight = s3.lineWeight = 1.5;

    c.assignColor("Hours", "#a0ced9", "#8cbeca");
    c.assignColor("Lower", "#00ff00", "#00ff00", 0.5);
    c.assignColor("Upper", "#ff0000", "#ff0000", 0.2);

    c.setMargins(0,0,0,0);
    c.draw();
}
