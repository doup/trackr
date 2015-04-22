import {exec} from 'child_process';

import {Project} from './project';
import {Projects} from './projects';
import {Uptime} from './uptime';

export class Trackr {
    constructor(dbPath) {
        this.uptime   = new Uptime(dbPath);
        this.projects = new Projects();
    }
}
