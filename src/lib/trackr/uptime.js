import EventEmitter from 'events';
import {exec} from 'child_process';
import {getDate, getDB, getTimeCode} from '../utils';

export class Uptime extends EventEmitter {
    constructor(dbPath) {
        super();

        this.dbPath       = dbPath;
        this.thresholds   = getDB(`${dbPath}/uptime/thresholds.json`);
        this.tickInterval = setInterval(() => this.tick(), 60000);

        this.tick();
    }

    tick() {
        // OSX Check
        exec("stat -f '%u %Su' /dev/console", (err, stdout, stdin) => {
            if (err) {
                throw err;
            }

            var isActive = stdout.replace(/^\s+|\s+$/g, '').indexOf(process.env.USER) !== -1;

            if (isActive) {
                var data = this.getTodayData();
                var time = getTimeCode();

                if (!data.ticks) {
                    data.ticks = [];
                }

                if (data.ticks.indexOf(time) == -1) {
                    data.ticks.push(time);
                    this.emit('update', { date: getDate(), minutes: data.ticks.length });
                }
            }
        });
    }

    stopChecking() {
        clearInterval(this.tickInterval);
    }

    getDateData(date) {
        return getDB(`${this.dbPath}/uptime/${getDate(date)}.json`);
    }

    getTodayData() {
        return this.getDateData(new Date());
    }

    /**
     * Today total uptime minutes
     * @return {number} Uptime minutes
     */
    getTodayUptime() {
        return {
            date:    getDate(),
            minutes: (this.getTodayData().ticks || []).length
        };
    }

    getDateThreshold(date) {
        return {
            lower: 5,
            upper: 7
        };
    }

    getTodayThreshold() {
        return this.getDateThreshold(new Date());
    }

    setThreshold(date, lower, upper) {
        this.thresholds[date] = {
            lower: lower,
            upper: upper,
        };
    }

    deleteThreshold(date) {
        delete this.thresholds[date];
    }

    getStats(days = 40) {
        var end   = new Date();
        var start = new Date(end.getTime() - ((days - 1) * 24 * 60 * 60 * 1000));
        var i     = new Date(start);
        var stats = { start: getDate(start), end: getDate(end), days: days, data: [] };
        var data, minutes, threshold;

        while (i <= end) {
            data      = this.getDateData(i);
            minutes   = (data.ticks || []).length;
            threshold = this.getDateThreshold(i);

            stats.data.push({
                date:    getDate(i),
                hours:   Math.round(minutes / 60 * 100) / 100,
                minutes: minutes,
                lower:   threshold.lower,
                upper:   threshold.upper
            });

            i = new Date(i.getTime() + ((1) * 24 * 60 * 60 * 1000));
        }

        // Moving average 7 days
        var count = 7;
        var days  = [];

        // Init
        for (i = 0; i < count; i++) {
            days.push(0);
        }

        function average(arr) {
            var sum = 0;

            for (var i = 0; i < arr.length; i++) {
                sum += arr[i];
            }

            return sum / arr.length;
        }

        for (var i = 0; i < stats.data.length; i++) {
            days.shift();
            days.push(stats.data[i].minutes);

            stats.data[i].averageMinutes = Math.round(average(days));
            stats.data[i].averageHours   = Math.round(stats.data[i].averageMinutes / 60 * 100) / 100;
        }

        return stats;
    }
}
