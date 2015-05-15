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
ipc.on('ping', () => (new Audio('../assets/ping.ogg')).play());

ipc.on('update-uptime', stats => {
    var today = stats.data[stats.data.length - 1];

    document.getElementById('time').innerHTML = formatHour(today.minutes);
    drawUptimeChart('#uptimeChart', stats.data);
});

function drawUptimeChart(container, data) {
    // Remove all SVG elements (charts)
    d3.select("svg").remove();

    var svg   = dimple.newSvg(container, 270, 100);
    var chart = new dimple.chart(svg, data);

    var axisDate    = chart.addCategoryAxis("x", "date");
    var axisHours   = chart.addMeasureAxis("y", "hours");
    var axisAverage = chart.addMeasureAxis(axisHours, "averageHours");
    var axisLower   = chart.addMeasureAxis(axisHours, "lower");
    var axisUpper   = chart.addMeasureAxis(axisHours, "upper");

    var hours   = chart.addSeries('Hours', dimple.plot.bar, [axisDate, axisHours]);
    var average = chart.addSeries('Average', dimple.plot.line, [axisDate, axisAverage]);
    var lower   = chart.addSeries('Lower', dimple.plot.line, [axisDate, axisLower]);
    var upper   = chart.addSeries('Upper', dimple.plot.line, [axisDate, axisUpper]);

    axisDate.hidden         = true;
    axisHours.hidden        = true;
    axisHours.showGridlines = true;
    axisHours.title         = null;
    axisHours.ticks         = 5;

    hours.barGap = 0.3;
    hours.getTooltipText = average.getTooltipText = lower.getTooltipText = upper.getTooltipText = (e) => {
        return [formatHour(Math.round(e.yValue * 60))];
    };

    average.interpolation = 'cardinal';
    average.lineWeight = 1.0;

    lower.interpolation = upper.interpolation = 'step';
    lower.lineWeight = upper.lineWeight = 1.5;

    chart.assignColor("Hours", "#b3d1dc", "#b3d1dc");
    chart.assignColor("Average", "#84abb9", "#84abb9");
    chart.assignColor("Lower", "#b4ff12", "#b4ff12", 0.6);
    chart.assignColor("Upper", "#ef5975", "#ef5975", 0.3);

    chart.setMargins(10, 10, 10, 10);
    chart.draw();
}
