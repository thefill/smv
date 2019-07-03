import {Semver} from '../semver';

describe('SMV class should integrate with semver', () => {
    const semverWrapper = new Semver();
    // semver.stub();

    const methodSpecs = [
        {
            name: 'valid',
            args: ['1.2.3'],
            expected: '1.2.3'
        },
        {
            name: 'inc',
            args: ['1.2.3', 'major'],
            expected: '2.0.0'
        },
        {
            name: 'prerelease',
            args: ['1.2.3'],
            expected: null
        },
        {
            name: 'major',
            args: ['1.2.3'],
            expected: 1
        },
        {
            name: 'minor',
            args: ['1.2.3'],
            expected: 2
        },
        {
            name: 'patch',
            args: ['1.2.3'],
            expected: 3
        },
        {
            name: 'intersects',
            args: ['~1.2.3', '~1.2.3', false],
            expected: true
        },
        {
            name: 'parse',
            args: ['1.2.3'],
            expected: {
                build: [],
                loose: false,
                major: 1,
                minor: 2,
                options: {
                    includePrerelease: false,
                    loose: false
                },
                patch: 3,
                prerelease: [],
                raw: '1.2.3',
                version: '1.2.3'
            }
        },
        {
            name: 'gt',
            args: ['1.2.3', '2.3.4'],
            expected: false
        },
        {
            name: 'gte',
            args: ['1.2.3', '2.3.4'],
            expected: false
        },
        {
            name: 'lt',
            args: ['1.2.3', '2.3.4'],
            expected: true
        },
        {
            name: 'lte',
            args: ['1.2.3', '2.3.4'],
            expected: true
        },
        {
            name: 'eq',
            args: ['1.2.3', '2.3.4'],
            expected: false
        },
        {
            name: 'neq',
            args: ['1.2.3', '2.3.4'],
            expected: true
        },
        {
            name: 'cmp',
            args: ['1.2.3', '=', '2.3.4'],
            expected: false
        },
        {
            name: 'compare',
            args: ['1.2.3', '2.3.4'],
            expected: -1
        },
        {
            name: 'rcompare',
            args: ['1.2.3', '2.3.4'],
            expected: 1
        },
        {
            name: 'compareBuild',
            args: ['1.2.3', '2.3.4'],
            expected: -1
        },
        {
            name: 'diff',
            args: ['1.2.3', '2.3.4'],
            expected: 'major'
        },
        {
            name: 'validRange',
            args: ['~1.2.3'],
            expected: '>=1.2.3 <1.3.0'
        },
        {
            name: 'satisfies',
            args: ['1.2.3', '~1.2.3'],
            expected: true
        },
        {
            name: 'maxSatisfying',
            args: [['1.2.3', '2.3.4'], '~1.2.3'],
            expected: '1.2.3'
        },
        {
            name: 'minSatisfying',
            args: [['1.2.3', '2.3.4'], '~1.2.3'],
            expected: '1.2.3'
        },
        {
            name: 'minVersion',
            args: ['~1.2.3'],
            expected: {
                build: [],
                loose: false,
                major: 1,
                minor: 2,
                options: {
                    includePrerelease: false,
                    loose: false
                },
                patch: 3,
                prerelease: [],
                raw: '1.2.3',
                version: '1.2.3'
            }
        },
        {
            name: 'gtr',
            args: ['1.2.3', '~1.2.3'],
            expected: false
        },
        {
            name: 'ltr',
            args: ['1.2.3', '~1.2.3'],
            expected: false
        },
        {
            name: 'outside',
            args: ['1.2.3', '~1.2.3', '>'],
            expected: false
        },
        {
            name: 'coerce',
            args: ['1.2.3'],
            expected: {
                build: [],
                loose: false,
                major: 1,
                minor: 2,
                options: {
                    includePrerelease: false,
                    loose: false
                },
                patch: 3,
                prerelease: [],
                raw: '1.2.3',
                version: '1.2.3'
            }
        },
        {
            name: 'clean',
            args: ['1.2.3'],
            expected: '1.2.3'
        }
    ];

    describe('should pass calls to the semver', () => {
        methodSpecs.forEach((methodSpec) => {
            it(`for ${methodSpec.name}`, () => {
                const result = semverWrapper[methodSpec.name](...methodSpec.args);
                expect(result).toEqual(methodSpec.expected);
            });
        });
    });
});
