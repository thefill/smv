import {
    ConflictType,
    IDependencyConflictDigest,
    IDependencyDigest,
    IMergeInput,
    IMergeResolution,
    SMV,
    VersionType
} from '../../';

/**
 * Selection of versions used in th tests
 */
enum TestVersion {
    LOWEST = '1.2.3',
    LOW = '2.3.4',
    MEDIUM = '3.4.5',
    HIGH = '4.5.6',
    HIGHEST = '5.6.7'
}

/**
 * Possible version prefixes
 */
enum TestVersionPrefix {
    VERSION = '',
    MINOR_RANGE = '^',
    PATCH_RANGE = '~'
}

/**
 * Cases with possible scenarios & expectations
 */
interface ITestCase {
    versions: Array<[TestVersionPrefix, TestVersion]>;
    result: TestVersion | void;
    conflictType: ConflictType | void;
    conflictSourceIndexes: number[];
    highest: TestVersion;
    highestSourceIndexes: number[];
    lowest: TestVersion;
    lowestSourceIndexes: number[];
    recommended: TestVersion;
    recommendedSourceIndexes: number[];
}

describe('SMV class', () => {
    const smv = new SMV();

    describe('should merge dependency lists', () => {

        const cases: ITestCase[] = [
            {
                versions: [
                    [TestVersionPrefix.VERSION, TestVersion.LOW]
                ],
                result: TestVersion.LOW, conflictType: undefined, conflictSourceIndexes: [],
                highest: TestVersion.LOW, highestSourceIndexes: [0],
                lowest: TestVersion.LOW, lowestSourceIndexes: [0],
                recommended: TestVersion.LOW, recommendedSourceIndexes: [0]
            }
        ];

        describe('with single package', () => {
            cases.forEach((caseDefinition) => {
                describe('and resolve correctly', () => {
                    [true, false].forEach((forceRecommended) => {
                        it(`${forceRecommended ? 'with' : 'without'} forcing recommended versions`, () => {
                            const dependencies = generateDependencyLists(caseDefinition);
                            const resolution = smv.merge(dependencies, forceRecommended) as IMergeResolution;
                            assertResolution(resolution, forceRecommended, caseDefinition);
                        });
                    });
                });
            });
        });

        describe.skip('should resolve dependency lists with multiple packages', () => {

            // Generate increased number of packages in merged dependency lists
            cases.reduce((cummulativeCases: ITestCase[], currentCase) => {
                cummulativeCases.push(currentCase);

                it(`with ${cummulativeCases.length} packages`, () => {

                    [true, false].forEach((forceRecommended) => {
                        it(`${forceRecommended ? 'with' : 'without'} forcing recommended versions`, () => {
                            const definitions = generateDependencyLists(...cummulativeCases);
                            const resolution = smv.merge(definitions, forceRecommended);
                            assertResolution(resolution, forceRecommended, ...cummulativeCases);
                        });
                    });
                });

                return cummulativeCases;
            }, []);
        });

        it.skip('should return no results for empty dependency lists', () => {
            cases.forEach((caseDefinition) => {
                // TODO: implement
                // tslint:disable-next-line
                console.log(1);
            });
        });

        it.skip('should throw error for invalid dependencies', () => {
            cases.forEach((caseDefinition) => {
                // TODO: implement
                // tslint:disable-next-line
                console.log(1);
            });
        });

    });

});

/**
 * Generate list of dependencies where source names & package names
 * are generated based on indexes e.g. source1, package1
 * @param {ITestCase} definitions
 * @returns {IMergeInput}
 */
function generateDependencyLists(...definitions: ITestCase[]): IMergeInput {
    const mergeInput: IMergeInput = {};
    let sourceCount = -1;

    definitions.forEach((definition, packageIndex) => {
        const packageName = `package${packageIndex}`;

        // version count indicates how many sources we have
        // for each version add entry in the source
        definition.versions.forEach((version, sourceIndex) => {
            const sourceName = `source${sourceIndex}`;

            // if new source needed add it
            if (sourceCount < sourceIndex) {
                mergeInput[sourceName] = {};
                sourceCount = sourceIndex;
            }

            // add package with version for source
            // build package version from prefix + version number
            mergeInput[sourceName][packageName] = version[0] + version[1];
        });
    });

    return mergeInput;
}

/**
 * Assert validity of merge resolution based on case definitions & resolution
 * @param {IMergeResolution | null} resolution
 * @param {boolean} forceRecommended
 * @param {ITestCase} definitions
 */
function assertResolution(
    resolution: IMergeResolution | null,
    forceRecommended: boolean,
    ...definitions: ITestCase[]
) {
    expect(resolution).toBeTruthy();

    if (!resolution) {
        // Bailout - invalid state
        return;
    }

    assertGlobalExpectations(resolution, definitions, forceRecommended);

    // For each definition trigger assertions
    definitions.forEach((definition, packageIndex) => {
        const packageName = `package${packageIndex}`;

        // version count indicates how many sources we have
        // for each version add entry in the source
        definition.versions.forEach((version, sourceIndex) => {
            const sourceName = `source${sourceIndex}`;
            const versionName = version[0] + version[1];

            assertResolvedExpectations(resolution, definition, packageName, sourceName, sourceIndex, forceRecommended);

            if (!forceRecommended) {
                assertConflictExpectations(resolution, definition, packageName);
            }
        });
    });
}

/**
 * Check if resolution has expected conflicts for single package definition
 * @param {IDependencyConflictDigest} conflict
 * @param {ITestCase} definition
 * @returns {boolean}
 */
function hasExpectedConflicts(conflict: IDependencyConflictDigest, definition: ITestCase): boolean {
    if (!conflict.conflicts) {
        return false;
    }

    // if any of conflict definitions matches expected conflict definition
    return conflict.conflicts.some((conflictDetails) => {
        // if types dont match
        if (conflictDetails.type !== definition.conflictType) {
            // Bailout - invalid state
            return false;
        }

        // if no conflict sources
        if (!conflictDetails.conflictSources) {
            // Bailout - invalid state
            return false;
        }

        const expectedConflictSourceNames = definition.conflictSourceIndexes.map((index) => {
            return `source${index}`;
        });

        // if conflict sources match e.g. same values on both arrays
        return sameArrays(expectedConflictSourceNames, Object.keys(conflictDetails.conflictSources));
    });
}

/**
 * Assert global merge properties
 * @param {IMergeResolution} resolution
 * @param {ITestCase[]} definitions
 * @param {boolean} forceRecommended
 */
function assertGlobalExpectations(
    resolution: IMergeResolution,
    definitions: ITestCase[],
    forceRecommended: boolean
) {

    const hasConflicts = definitions.every((definition) => {
        return !definition.conflictType;
    });

    const hasResults = definitions.every((definition) => {
        return !!definition.result;
    });

    // when we force recommended - no conflicts
    if (forceRecommended) {
        expect(resolution.hasConflicts).toBeFalsy();
        expect(resolution.conflicts).toBeFalsy();
        expect(resolution.resolved).toBeTruthy();
        return;
    }

    // if has any conflicts
    if (hasConflicts) {
        expect(resolution.conflicts).toBeTruthy();
    } else {
        expect(resolution.conflicts).toBeFalsy();
    }

    // if has any results
    if (hasResults) {
        expect(resolution.resolved).toBeTruthy();

        if (resolution.resolved) {
            if (hasConflicts) {
                expect(resolution.resolved.hasConflicts).toBeTruthy();
            } else {
                expect(resolution.resolved.hasConflicts).toBeFalsy();
            }
        }
    } else {
        expect(resolution.resolved).toBeFalsy();
    }
}

/**
 * Assert conflict expectations for single dependency package
 * @param {IMergeResolution} resolution
 * @param {ITestCase} definition
 * @param {string} packageName
 */
function assertConflictExpectations(
    resolution: IMergeResolution,
    definition: ITestCase,
    packageName: string
) {

    // asset conflict data
    if (definition.conflictType) {
        expect(resolution.hasConflicts).toBeTruthy();

        if (!resolution.conflicts) {
            // Bailout - invalid state
            return;
        }

        const conflict = resolution.conflicts[packageName];

        expect(conflict).toBeTruthy();
        expect(conflict.hasConflict).toBeTruthy();

        expect(conflict.conflicts).toBeTruthy();

        if (!conflict.conflicts) {
            // Bailout - invalid state
            return;
        }

        expect(conflict.conflicts.length).toBeGreaterThan(0);

        const conflictMatch = hasExpectedConflicts(conflict, definition);
        expect(conflictMatch).toBeTruthy();

    } else {
        expect(resolution.conflicts).toBeTruthy();
        expect(resolution.hasConflicts).toBeTruthy();
    }
}

/**
 * Assert result & resolution expectation
 * @param {IMergeResolution} resolution
 * @param {ITestCase} definition
 * @param {string} packageName
 * @param {string} sourceName
 * @param {number} sourceIndex
 * @param {boolean} forceRecommended
 */
function assertResolvedExpectations(
    resolution: IMergeResolution,
    definition: ITestCase,
    packageName: string,
    sourceName: string,
    sourceIndex: number,
    forceRecommended: boolean
) {
    // assert result
    if (definition.result || forceRecommended) {

        // assert resolution
        const resolved = resolution.resolved;

        expect(resolved).toBeTruthy();

        if (!resolved) {
            // Bailout - invalid state
            return;
        }

        if (forceRecommended) {
            expect(resolution.result[packageName]).toEqual(resolved[packageName].recommended);
        } else {
            expect(resolution.result[packageName]).toEqual(definition.result);
        }

        const resolvedPackage = resolved[packageName];
        expect(resolvedPackage).toBeTruthy();

        if (!resolvedPackage) {
            // Bailout - invalid state
            return;
        }

        expect(resolvedPackage.sources).toBeTruthy();

        const source = resolvedPackage.sources[packageName];
        expect(source).toBeTruthy();

        // translate version prefix to VersionType
        const expectedType: VersionType = definition.versions[sourceIndex][0] === TestVersionPrefix.VERSION ?
            VersionType.VERSION : VersionType.RANGE;
        expect(source.type).toEqual(expectedType);
        expect(source.version).toEqual(definition.versions[sourceIndex][1]);

        assertStatsExpectations(resolvedPackage, definition);

        assertRecommendationExpectations(resolvedPackage, definition);
    }
}

/**
 * Assert resolution stats data
 * @param {IDependencyDigest} resolvedPackage
 * @param {ITestCase} definition
 */
function assertStatsExpectations(resolvedPackage: IDependencyDigest, definition: ITestCase) {
    expect(resolvedPackage.highest).toEqual(definition.highest);
    expect(resolvedPackage.lowest).toEqual(definition.lowest);

    const highestSourceNames = definition.highestSourceIndexes.map((index) => {
        return `source${index}`;
    });
    expect(resolvedPackage.highestSources).toEqual(highestSourceNames);

    const lowestSourceNames = definition.lowestSourceIndexes.map((index) => {
        return `source${index}`;
    });
    expect(resolvedPackage.lowestSources).toEqual(lowestSourceNames);
}

function assertRecommendationExpectations(resolvedPackage: IDependencyDigest, definition: ITestCase) {
    // TODO: implement
    expect(resolvedPackage.recommended).toEqual(definition.recommended);
    expect(resolvedPackage.recommendedSources).toBeTruthy();

    // if no recommended sources
    if (!resolvedPackage.recommendedSources) {
        // Bailout - invalid state
        return false;
    }

    const expectedRecommendedSourceNames = definition.recommendedSourceIndexes.map((index) => {
        return `source${index}`;
    });

    return sameArrays(expectedRecommendedSourceNames, Object.keys(resolvedPackage.recommendedSources));
}

/**
 * Checks if 2 arrays with primitive values are equal
 * @param {any[]} arrayA
 * @param {any[]} arrayB
 * @returns {boolean}
 */
function sameArrays(arrayA: any[], arrayB: any[]): boolean {
    const unique = new Set(arrayA.concat(arrayB));

    // if match e.g. same values on both arrays
    return arrayA.length === unique.size;
}
