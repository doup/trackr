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
            date: getDate(),
            minutes: (this.getTodayData().ticks || []).length
        };
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
        var data, minutes;

        while (i <= end) {
            data    = this.getDateData(i);
            minutes = (data.ticks || []).length;

            stats.data.push({
                date: getDate(i),
                hours: Math.round(minutes / 60 * 100) / 100,
                minutes: minutes,
                lower: 5,
                upper: 7
            });

            i = new Date(i.getTime() + ((1) * 24 * 60 * 60 * 1000));
        }

        return stats;
    }
}
