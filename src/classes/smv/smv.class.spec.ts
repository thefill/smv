import {
    ConflictType,
    IDependencyConflictDigest,
    IDependencyDigest,
    IMergeInput,
    IMergeResolution,
    SMV,
    Utils,
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
    recommended: TestVersion;
    recommendedSourceIndexes: number[];
    highest: TestVersion;
    highestSourceIndexes: number[];
    lowest: TestVersion;
    lowestSourceIndexes: number[];
    conflicts: Array<{
        conflictType: ConflictType | void;
        conflictSourceIndexes: number[];
    }>;
}

describe('SMV class', () => {
    const smv = new SMV();

    describe('should merge dependency lists', () => {

        // TODO: add more test cases
        const cases: ITestCase[] = [
            {
                versions: [
                    [TestVersionPrefix.VERSION, TestVersion.LOW]
                ],
                result: TestVersion.LOW,
                recommended: TestVersion.LOW, recommendedSourceIndexes: [0],
                highest: TestVersion.LOW, highestSourceIndexes: [0],
                lowest: TestVersion.LOW, lowestSourceIndexes: [0],
                conflicts: []
            },
            {
                versions: [
                    [TestVersionPrefix.VERSION, TestVersion.LOW],
                    [TestVersionPrefix.VERSION, TestVersion.HIGH]
                ],
                result: undefined,
                recommended: TestVersion.HIGH, recommendedSourceIndexes: [1],
                highest: TestVersion.HIGH, highestSourceIndexes: [1],
                lowest: TestVersion.LOW, lowestSourceIndexes: [0],
                conflicts: [
                    {
                        conflictType: ConflictType.VERSION_MISMATCH,
                        conflictSourceIndexes: [0, 1]
                    }
                ]
            },
            {
                versions: [
                    [TestVersionPrefix.VERSION, TestVersion.LOW],
                    [TestVersionPrefix.VERSION, TestVersion.MEDIUM],
                    [TestVersionPrefix.VERSION, TestVersion.HIGH]
                ],
                result: undefined,
                recommended: TestVersion.HIGH, recommendedSourceIndexes: [2],
                highest: TestVersion.HIGH, highestSourceIndexes: [2],
                lowest: TestVersion.LOW, lowestSourceIndexes: [0],
                conflicts: [
                    {
                        conflictType: ConflictType.VERSION_MISMATCH,
                        conflictSourceIndexes: [0, 1]
                    },
                    {
                        conflictType: ConflictType.VERSION_MISMATCH,
                        conflictSourceIndexes: [0, 2]
                    },
                    {
                        conflictType: ConflictType.VERSION_MISMATCH,
                        conflictSourceIndexes: [1, 2]
                    }
                ]
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

        // TODO: enable
        describe('should resolve dependency lists with multiple packages', () => {

            // Generate increased number of packages in merged dependency lists
            cases.reduce((cummulativeCases: ITestCase[], currentCase) => {
                cummulativeCases.push(currentCase);

                describe(`with ${cummulativeCases.length} packages`, () => {

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

        // TODO: enable
        it.skip('should return no results for empty dependency lists', () => {
            cases.forEach((caseDefinition) => {
                // TODO: implement
                // tslint:disable-next-line
                console.log(1);
            });
        });

        // TODO: enable
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
function assertExpectedConflicts(conflict: IDependencyConflictDigest, definition: ITestCase): void {
    if (!conflict.conflicts) {
        return;
    }

    let received = conflict.conflicts.map((conflictDetails) => {
        const conflictSourceIndexes = Object.keys(conflictDetails.conflictSources as object).sort();
        const conflictType = conflictDetails.type;

        return {conflictType, conflictSourceIndexes};
    });

    // sort by all properties
    received = received.sort((A, B) => {
        if (JSON.stringify(A) > JSON.stringify(B)) {
            return 1;
        }
        return JSON.stringify(A) < JSON.stringify(B) ? -1 : 0;
    });

    let expected = definition.conflicts.map((conflictDefinition) => {
        const conflictSourceIndexes = conflictDefinition.conflictSourceIndexes
            .sort()
            .map((e) => {
                return `source${e}`;
            });
        const conflictType = conflictDefinition.conflictType;

        return {conflictType, conflictSourceIndexes};
    });

    // sort by all properties
    expected = expected.sort((A, B) => {
        if (JSON.stringify(A) > JSON.stringify(B)) {
            return 1;
        }
        return JSON.stringify(A) < JSON.stringify(B) ? -1 : 0;
    });

    expect(received).toEqual(expected);
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

    const hasConflicts = definitions.some((definition) => {
        return definition.conflicts.some((conflictDefinition) => {
            return !!conflictDefinition.conflictType;
        });
    });

    const hasResults = definitions.some((definition) => {
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
        expect(resolution.result).toBeTruthy();
        expect(resolution.resolved).toBeTruthy();

        if (resolution.resolved) {
            // Check if any has conflict
            const anyHasConflict = Object.keys(resolution.resolved).some((resolvedKey) => {
                return !!resolution.resolved && resolution.resolved[resolvedKey].hasConflict;
            });
            if (hasConflicts) {
                expect(anyHasConflict).toBeTruthy();
            } else {
                expect(anyHasConflict).toBeFalsy();
            }
        }
    } else {
        expect(resolution.result).toEqual({});
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

    // asses conflict data
    if (definition.conflicts && definition.conflicts.length) {
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
        expect(conflict.conflicts.length).toEqual(definition.conflicts.length);

        assertExpectedConflicts(conflict, definition);

    } else {
        if (resolution.conflicts) {
            expect(resolution.conflicts[packageName]).toBeFalsy();
        } else {
            expect(resolution.hasConflicts).toBeFalsy();
        }
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

        const source = resolvedPackage.sources[sourceName];
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
    expect(resolvedPackage.highest.version).toEqual(definition.highest);
    expect(resolvedPackage.highest.type).toEqual(VersionType.VERSION);

    expect(resolvedPackage.lowest.version).toEqual(definition.lowest);
    expect(resolvedPackage.lowest.type).toEqual(VersionType.VERSION);

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

    return Utils.sameArrays(expectedRecommendedSourceNames, Object.keys(resolvedPackage.recommendedSources));
}
