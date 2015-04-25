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
    var svg = dimple.newSvg(container, 270, 120);
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

    s.barGap = 0.3;
    s.getTooltipText = s2.getTooltipText = s3.getTooltipText = function (e) { return [formatHour(Math.round(e.yValue * 60))]; };
    s2.interpolation = s3.interpolation = 'step';
    s2.lineWeight = s3.lineWeight = 1.5;

    c.assignColor("Hours", "#b3d1dc", "#b3d1dc");
    c.assignColor("Lower", "#b4ff12", "#b4ff12", 0.6);
    c.assignColor("Upper", "#ef5975", "#ef5975", 0.3);

    c.setMargins(10, 10, 10, 10);
    c.draw();
}
