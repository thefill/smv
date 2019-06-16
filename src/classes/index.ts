export * from './utils';
export * from './smv';

// TODO: remove below
import {SMV} from './smv';

const defaultDependencies = {
    '@scoped/package': '1.2.3'
    // 'hyphened-package': '1.2.3',
    // 'default-package': '1.2.3',
    // 'patch-package': '^1.2.3',
    // 'minor-package': '~1.2.3'
};

const conflictingDependencies = {
    '@scoped/package': '2.2.3'
    // 'hyphened-package': '2.2.3',
    // 'default-package': '1.2.3',
    // 'patch-package': '^1.5.3',
    // 'minor-package': '~2.2.3'
};

const smv = new SMV();

const resolution = smv.merge({defaultDependencies, conflictingDependencies});

// tslint:disable-next-line
console.log(resolution);
