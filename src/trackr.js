/*
.trackr/
    uptime/
        thresholds.json
            {
                "YYYY-MM-DD": {
                    "lower": 4
                    "upper": 6.5
                }
            }
        YYYY-MM-DD.json
            ["0001", "0002", "1334", ...]
    projects/
        ID.json
            {
                "name": "...",
                "isFeatured": true|false,
                "weeklyCommitment": {
                    "YYYY-MM-DD": 10
                },
                "entries": {
                    "YYYY-MM-DD": {
                        "hours": 4.5,
                        "description": "..."
                    }
                }
            }
*/
/*
trackr.uptime.setThreshold('YYYY-MM-DD', 4, 6.5);
trackr.uptime.deleteThreshold('YYYY-MM-DD');
trackr.uptime.getStats();
*/

class Uptime {
    setThreshold(date, lower, upper) {

    }

    deleteThreshold(date) {

    }

    getStats() {

    }
}

/*
trackr.projects.getAll();
var project = trackr.projects.get('ID');
 */
class Projects {
    getAll() {

    }

    get(id) {

    }
}

/*
project.setName("...");
project.getName();
project.isFeatured();
project.toggleIsFeatured();
project.setIsFeatured();
project.setWeeklyCommitment("YYYY-MM-DD", 10);
project.deleteWeeklyCommitment("YYYY-MM-DD");
project.setEntry("YYYY-MM-DD", 4.5, "...");
project.deleteEntry("YYYY-MM-DD");
*/
class Project {
    setName(name) {
        this.name = name;
    }

    getName(name) {

    }
}

export class Trackr {
    constructor() {
        this.uptime = new Uptime();
        this.projects = new Projects();
    }
}
