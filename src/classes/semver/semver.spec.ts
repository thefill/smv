import semver from 'semver';
import {Semver} from './semver.class';
import Mock = jest.Mock;

jest.mock('semver');

describe('Semver wrapper class', () => {
    const semverWrapper = new Semver();
    // semver.stub();

    const methodSpecs = [
        {
            name: 'valid',
            args: ['1.2.3']
        },
        {
            name: 'inc',
            args: ['1.2.3', '1.2.3']
        },
        {
            name: 'prerelease',
            args: ['1.2.3']
        },
        {
            name: 'major',
            args: ['1.2.3']
        },
        {
            name: 'minor',
            args: ['1.2.3']
        },
        {
            name: 'patch',
            args: ['1.2.3']
        },
        {
            name: 'intersects',
            args: ['~1.2.3', '~1.2.3', false]
        },
        {
            name: 'parse',
            args: ['1.2.3']
        },
        {
            name: 'gt',
            args: ['1.2.3', '2.3.4']
        },
        {
            name: 'gte',
            args: ['1.2.3', '2.3.4']
        },
        {
            name: 'lt',
            args: ['1.2.3', '2.3.4']
        },
        {
            name: 'lte',
            args: ['1.2.3', '2.3.4']
        },
        {
            name: 'eq',
            args: ['1.2.3', '2.3.4']
        },
        {
            name: 'neq',
            args: ['1.2.3', '2.3.4']
        },
        {
            name: 'cmp',
            args: ['1.2.3', '=', '2.3.4']
        },
        {
            name: 'compare',
            args: ['1.2.3', '2.3.4']
        },
        {
            name: 'rcompare',
            args: ['1.2.3', '2.3.4']
        },
        {
            name: 'compareBuild',
            args: ['1.2.3', '2.3.4']
        },
        {
            name: 'diff',
            args: ['1.2.3', '2.3.4']
        },
        {
            name: 'validRange',
            args: ['~1.2.3']
        },
        {
            name: 'satisfies',
            args: ['1.2.3', '~1.2.3']
        },
        {
            name: 'maxSatisfying',
            args: [['1.2.3', '2.3.4'], '~1.2.3']
        },
        {
            name: 'minSatisfying',
            args: [['1.2.3', '2.3.4'], '~1.2.3']
        },
        {
            name: 'minVersion',
            args: ['~1.2.3']
        },
        {
            name: 'gtr',
            args: ['1.2.3', '~1.2.3']
        },
        {
            name: 'ltr',
            args: ['1.2.3', '~1.2.3']
        },
        {
            name: 'outside',
            args: ['1.2.3', '~1.2.3', '>']
        },
        {
            name: 'coerce',
            args: ['1.2.3']
        },
        {
            name: 'clean',
            args: ['1.2.3']
        }
    ];

    describe('should pass calls to the semver', () => {
        methodSpecs.forEach((methodSpec) => {
            it(`for ${methodSpec.name}`, () => {
                semverWrapper[methodSpec.name](...methodSpec.args);
                const mock = semver[methodSpec.name] as Mock;
                expect(mock.mock.calls.length).toEqual(1);
                expect(mock.mock.calls[0]).toEqual(methodSpec.args);
            });
        });
    });
});
