import {SMV} from '../../';
import {IMergeResolution} from '../../interface';

const defaultDependencies = {
    '@scoped/package': '1.2.3',
    // 'hyphened-package': '1.2.3',
    // 'default-package': '1.2.3',
    // 'patch-package': '^1.2.3',
    // 'minor-package': '~1.2.3'
};

const conflictingDependencies = {
    '@scoped/package': '2.2.3',
    // 'hyphened-package': '2.2.3',
    // 'default-package': '1.2.3',
    // 'patch-package': '^1.5.3',
    // 'minor-package': '~2.2.3'
};

describe('SMV class', () => {
    const smv = new SMV();

    it('should resolve correctly for single dependency list', () => {
        const resolution = smv.merge({defaultDependencies}) as IMergeResolution;

        expect(resolution).toBeTruthy();
        expect(resolution.result).toEqual(defaultDependencies);
        expect(resolution.conflicts).toBeFalsy();
    });

    it('should resolve correctly for multiple similar dependency lists', () => {
        const dependenciesB = Object.assign({}, defaultDependencies);
        const dependenciesC = Object.assign({}, defaultDependencies);
        const resolution = smv.merge({
            defaultDependencies,
            dependenciesB,
            dependenciesC
        }) as IMergeResolution;

        expect(resolution).toBeTruthy();
        expect(resolution.result).toEqual(defaultDependencies);
        expect(resolution.conflicts).toBeFalsy();
    });

    it.only('should resolve correctly for multiple different dependency lists', () => {
        const resolution = smv.merge({
            defaultDependencies,
            conflictingDependencies
        }) as IMergeResolution;
        // tslint:disable
        console.log('resolution.conflicts',resolution.conflicts);
        console.log('resolution.resolved',resolution.resolved);
        console.log('resolution.result',resolution.result);
        // tslint:enable

        expect(resolution).toBeTruthy();
        expect(resolution.result).not.toEqual(defaultDependencies);
        expect(resolution.conflicts).toBeTruthy();
        expect(resolution.conflicts).toEqual({});
    });
});
