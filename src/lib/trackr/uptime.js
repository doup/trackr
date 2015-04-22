import {exec} from 'child_process';
import {getDate, getDB, getTimeCode} from '../utils';

export class Uptime {
    constructor(dbPath) {
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
                var date = getDB(`${this.dbPath}/uptime/${getDate()}.json`);
                var time = getTimeCode();

                if (!date.ticks) {
                    date.ticks = [];
                }

                if (date.ticks.indexOf(time) == -1) {
                    date.ticks.push(time);
                }
            }
        });
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

    getStats() {
        return {};
    }
}
