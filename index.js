var Uptime = require('./dist/lib/trackr/uptime').Uptime;
var uptime = new Uptime('/Users/doup/.trackr');

uptime.stopChecking();

var stats = uptime.getStats();
console.log(JSON.stringify(stats, null, 4));
console.log(stats.data.length);
