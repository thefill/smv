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
 * Selection of versions used in the tests
 */
enum TestVersion {
    LOW = '1.0.0',
    LOW_PATCH = '1.0.5',
    LOW_MINOR = '1.5.0',
    MEDIUM = '2.0.0',
    MEDIUM_PATCH = '2.0.5',
    MEDIUM_MINOR = '2.5.0',
    HIGH = '4.0.0',
    HIGH_PATCH = '4.0.5',
    HIGH_MINOR = '4.5.0'
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
    result: [TestVersionPrefix, TestVersion] | void;
    recommended: [TestVersionPrefix, TestVersion];
    recommendedSourceIndexes: number[];
    highest: [TestVersionPrefix, TestVersion];
    highestSourceIndexes: number[];
    lowest: [TestVersionPrefix, TestVersion];
    lowestSourceIndexes: number[];
    conflicts: Array<{
        conflictType: ConflictType | void;
        conflictSourceIndexes: number[];
    }>;
}

const cases: ITestCase[] = [
    // Only versions
    {
        versions: [
            [TestVersionPrefix.VERSION, TestVersion.LOW]
        ],
        result: [TestVersionPrefix.VERSION, TestVersion.LOW],
        recommended: [TestVersionPrefix.VERSION, TestVersion.LOW], recommendedSourceIndexes: [0],
        highest: [TestVersionPrefix.VERSION, TestVersion.LOW], highestSourceIndexes: [0],
        lowest: [TestVersionPrefix.VERSION, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.VERSION, TestVersion.LOW],
            [TestVersionPrefix.VERSION, TestVersion.LOW]
        ],
        result: [TestVersionPrefix.VERSION, TestVersion.LOW],
        recommended: [TestVersionPrefix.VERSION, TestVersion.LOW], recommendedSourceIndexes: [0, 1],
        highest: [TestVersionPrefix.VERSION, TestVersion.LOW], highestSourceIndexes: [0, 1],
        lowest: [TestVersionPrefix.VERSION, TestVersion.LOW], lowestSourceIndexes: [0, 1],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.VERSION, TestVersion.LOW],
            [TestVersionPrefix.VERSION, TestVersion.HIGH]
        ],
        result: undefined,
        recommended: [TestVersionPrefix.VERSION, TestVersion.HIGH], recommendedSourceIndexes: [1],
        highest: [TestVersionPrefix.VERSION, TestVersion.HIGH], highestSourceIndexes: [1],
        lowest: [TestVersionPrefix.VERSION, TestVersion.LOW], lowestSourceIndexes: [0],
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
        recommended: [TestVersionPrefix.VERSION, TestVersion.HIGH], recommendedSourceIndexes: [2],
        highest: [TestVersionPrefix.VERSION, TestVersion.HIGH], highestSourceIndexes: [2],
        lowest: [TestVersionPrefix.VERSION, TestVersion.LOW], lowestSourceIndexes: [0],
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
    },
    // Only version ranges
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], recommendedSourceIndexes: [0],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], highestSourceIndexes: [0],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], recommendedSourceIndexes: [0, 1],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], highestSourceIndexes: [0, 1],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [0, 1],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
            [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], recommendedSourceIndexes: [0],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], highestSourceIndexes: [0],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
            [TestVersionPrefix.MINOR_RANGE, TestVersion.HIGH]
        ],
        result: undefined,
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.HIGH], recommendedSourceIndexes: [1],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.HIGH], highestSourceIndexes: [1],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: [
            {
                conflictType: ConflictType.NO_RANGE_INTERSECTION,
                conflictSourceIndexes: [0, 1]
            }
        ]
    },
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
            [TestVersionPrefix.MINOR_RANGE, TestVersion.MEDIUM],
            [TestVersionPrefix.MINOR_RANGE, TestVersion.HIGH]
        ],
        result: undefined,
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.HIGH], recommendedSourceIndexes: [2],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.HIGH], highestSourceIndexes: [2],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: [
            {
                conflictType: ConflictType.NO_RANGE_INTERSECTION,
                conflictSourceIndexes: [0, 1]
            },
            {
                conflictType: ConflictType.NO_RANGE_INTERSECTION,
                conflictSourceIndexes: [0, 2]
            },
            {
                conflictType: ConflictType.NO_RANGE_INTERSECTION,
                conflictSourceIndexes: [1, 2]
            }
        ]
    },
    // Version ranges and intermittent version states
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], recommendedSourceIndexes: [0],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], highestSourceIndexes: [0],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW_MINOR],
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR], recommendedSourceIndexes: [1],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR], highestSourceIndexes: [1],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR], lowestSourceIndexes: [1],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR],
            [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW_MINOR]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR], recommendedSourceIndexes: [0],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR], highestSourceIndexes: [0],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR], lowestSourceIndexes: [0],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW_MINOR],
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], recommendedSourceIndexes: [1],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], highestSourceIndexes: [1],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [1],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW],
            [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW_MINOR]
        ],
        result: undefined,
        recommended: [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW_MINOR], recommendedSourceIndexes: [1],
        highest: [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW_MINOR], highestSourceIndexes: [1],
        lowest: [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: [
            {
                conflictType: ConflictType.NO_RANGE_INTERSECTION,
                conflictSourceIndexes: [0, 1]
            }
        ]
    },
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
            [TestVersionPrefix.MINOR_RANGE, TestVersion.MEDIUM]
        ],
        result: undefined,
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.MEDIUM], recommendedSourceIndexes: [1],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.MEDIUM], highestSourceIndexes: [1],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: [
            {
                conflictType: ConflictType.NO_RANGE_INTERSECTION,
                conflictSourceIndexes: [0, 1]
            }
        ]
    },
    // Versions and version ranges
    {
        versions: [
            [TestVersionPrefix.VERSION, TestVersion.LOW],
            [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW]
        ],
        result: [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW],
        recommended: [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW], recommendedSourceIndexes: [1],
        highest: [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW], highestSourceIndexes: [1],
        lowest: [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW], lowestSourceIndexes: [1],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.VERSION, TestVersion.LOW],
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], recommendedSourceIndexes: [1],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], highestSourceIndexes: [1],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [1],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.VERSION, TestVersion.LOW_MINOR],
            [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW]
        ],
        result: undefined,
        recommended: [TestVersionPrefix.VERSION, TestVersion.LOW_MINOR], recommendedSourceIndexes: [0],
        highest: [TestVersionPrefix.VERSION, TestVersion.LOW_MINOR], highestSourceIndexes: [0],
        lowest: [TestVersionPrefix.PATCH_RANGE, TestVersion.LOW], lowestSourceIndexes: [1],
        conflicts: [
            {
                conflictType: ConflictType.VERSION_ABOVE_RANGE,
                conflictSourceIndexes: [0, 1]
            }
        ]
    },
    {
        versions: [
            [TestVersionPrefix.VERSION, TestVersion.LOW],
            [TestVersionPrefix.PATCH_RANGE, TestVersion.MEDIUM]
        ],
        result: undefined,
        recommended: [TestVersionPrefix.PATCH_RANGE, TestVersion.MEDIUM], recommendedSourceIndexes: [1],
        highest: [TestVersionPrefix.PATCH_RANGE, TestVersion.MEDIUM], highestSourceIndexes: [1],
        lowest: [TestVersionPrefix.VERSION, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: [
            {
                conflictType: ConflictType.VERSION_BELOW_RANGE,
                conflictSourceIndexes: [0, 1]
            }
        ]
    },
    {
        versions: [
            [TestVersionPrefix.VERSION, TestVersion.LOW_MINOR],
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], recommendedSourceIndexes: [1],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], highestSourceIndexes: [1],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [1],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
            [TestVersionPrefix.VERSION, TestVersion.LOW_MINOR]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], recommendedSourceIndexes: [0],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], highestSourceIndexes: [0],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: []
    },
    {
        versions: [
            [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
            [TestVersionPrefix.VERSION, TestVersion.LOW]
        ],
        result: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW],
        recommended: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], recommendedSourceIndexes: [0],
        highest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], highestSourceIndexes: [0],
        lowest: [TestVersionPrefix.MINOR_RANGE, TestVersion.LOW], lowestSourceIndexes: [0],
        conflicts: []
    }
];

describe('SMV class', () => {
    const smv = new SMV();

    describe('should merge dependency lists', () => {

        describe('with single package', () => {
            cases.forEach((caseDefinition) => {
                describe('and resolve correctly', () => {
                    [undefined, true, false].forEach((forceRecommended) => {
                        it(`${forceRecommended ? 'with' : 'without'} forcing recommended versions`, () => {
                            const dependencies = generateDependencyLists(caseDefinition);
                            const resolution = smv.merge(dependencies, forceRecommended) as IMergeResolution;

                            assertResolution(resolution, forceRecommended, caseDefinition);
                        });
                    });
                });
            });
        });

        describe('should resolve dependency lists with multiple packages', () => {

            // Generate increased number of packages in merged dependency lists
            cases.reduce((cumulativeCases: ITestCase[], currentCase) => {
                cumulativeCases.push(currentCase);

                describe(`with ${cumulativeCases.length} package${cumulativeCases.length ? 's' : ''} `, () => {

                    [undefined, true, false].forEach((forceRecommended) => {
                        it(`${forceRecommended ? 'with' : 'without'} forcing recommended versions`, () => {
                            const definitions = generateDependencyLists(...cumulativeCases);
                            const resolution = smv.merge(definitions, forceRecommended);

                            if (typeof forceRecommended === 'boolean') {
                                assertResolution(resolution, forceRecommended, ...cumulativeCases);
                            } else {
                                assertResolution(resolution, undefined, ...cumulativeCases);
                            }
                        });
                    });
                });

                return cumulativeCases;
            }, []);
        });

    });

    it('should return no results for empty dependency lists', () => {
        const resolution: IMergeResolution = smv.merge({}) as IMergeResolution;
        expect(resolution.conflicts).toBeFalsy();
        expect(resolution.result).toEqual({});
        expect(resolution.hasConflicts).toBeFalsy();
        expect(resolution.resolved).toEqual({});
    });

    // TODO: enable - invalid - no error throw
    it('should throw error for invalid dependencies', () => {
        try {
            const resolution = smv.merge({
                sourceA: {
                    packageA: 'a.b.c'
                }
            });
        } catch (e) {
            expect(e).toBeTruthy();
        }
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
    forceRecommended: boolean | undefined,
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
    forceRecommended: boolean | undefined
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
    forceRecommended: boolean | undefined
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
            if (definition.conflicts.length) {
                expect(resolution.result[packageName]).toBeFalsy();
            } else {
                expect(resolution.result[packageName]).toEqual(definition.result[0] + definition.result[1]);
            }
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
        const expectedType: VersionType = versionPrefixToVersionType(definition.versions[sourceIndex][0]);
        expect(source.type).toEqual(expectedType);
        expect(source.version).toEqual(definition.versions[sourceIndex][0] + definition.versions[sourceIndex][1]);

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
    expect(resolvedPackage.highest.version).toEqual(definition.highest[0] + definition.highest[1]);
    expect(resolvedPackage.highest.type).toEqual(versionPrefixToVersionType(definition.highest[0]));

    expect(resolvedPackage.lowest.version).toEqual(definition.lowest[0] + definition.lowest[1]);
    expect(resolvedPackage.lowest.type).toEqual(versionPrefixToVersionType(definition.lowest[0]));

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
    expect(resolvedPackage.recommended).toEqual(definition.recommended[0] + definition.recommended[1]);
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

function versionPrefixToVersionType(prefix: TestVersionPrefix): VersionType {
    return prefix === TestVersionPrefix.VERSION ? VersionType.VERSION : VersionType.RANGE;
}
