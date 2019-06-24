import {ConflictDescription, ConflictType, VersionType} from '../../enums';
import {
    IDependencyConflictDefinition,
    IDependencyConflictDigest,
    IDependencyDigest,
    IDependencyResolutionDigest,
    IDependencyStatsDigest,
    IMergeInput,
    IMergeResolution,
    ISMV,
    ISourceDependencyDigest,
    IVersion,
    IVersionDefinition
} from '../../interface';
import {Semver} from '../semver';

/**
 * Main SMV class
 */
export class SMV extends Semver implements ISMV {
    /**
     * Decouples provided list of dependencies from its reference.
     * @param {IMergeInput} dependencies
     * @returns {IMergeInput}
     */
    protected static decouple(dependencies: IMergeInput): IMergeInput {
        const wrapper: IMergeInput = {};

        // decouple inner references
        Object.keys(dependencies).forEach((key) => {
            wrapper[key] = Object.assign({}, dependencies[key]);
        });

        return wrapper;
    }

    /**
     * Merge provided lists of dependencies per source into list of
     * common dependencies and conflicts.
     * @param {IMergeInput} dependencies
     * @param {boolean} forceRecommended
     * @returns {IMergeResolution | null}
     */
    public merge(dependencies: IMergeInput, forceRecommended = false): IMergeResolution | null {
        const digest: ISourceDependencyDigest = this.getDigest(dependencies, forceRecommended);

        // convert digest to output resolution
        return this.toMergeResolution(digest);
    }

    /**
     * Get merge digest for all packages across all sources
     * @param {IMergeInput} dependencies
     * @param {boolean} forceRecommended
     * @returns {ISourceDependencyDigest}
     */
    protected getDigest(dependencies: IMergeInput, forceRecommended = false): ISourceDependencyDigest {
        const inputDependencies: IMergeInput = SMV.decouple(dependencies);

        // get initial digest with list of all packages across resources
        let digest: ISourceDependencyDigest = this.getInitialDigest(inputDependencies);
        // get digest with conflicts and recommended versions
        digest = this.getMergeDigest(digest, forceRecommended);

        return digest;
    }

    /**
     * Convert merged dependency digest to output resolution.
     * @param {ISourceDependencyDigest} digest
     * @returns {IMergeResolution}
     */
    protected toMergeResolution(digest: ISourceDependencyDigest): IMergeResolution {
        const resolution: IMergeResolution = {
            hasConflicts: false,
            result: {},
            resolved: {}
        };

        // for non-conflicting digests, output them as a result
        // outside of list of conflicts
        Object.keys(digest).forEach((key) => {
            const digestEntry = digest[key];

            if (!digestEntry.hasConflict) {
                (resolution.resolved as object)[key] = digestEntry;
                return resolution.result[key] = digestEntry.recommended;
            }

            resolution.hasConflicts = true;

            if (!resolution.conflicts) {
                resolution.conflicts = {};
            }

            resolution.conflicts[key] = {
                hasConflict: true,
                conflicts: digestEntry.conflicts
            };
        });

        return resolution;
    }

    /**
     * Get initial digest for all packages across all sources, no conflicts
     * @param {IMergeInput} dependencies
     * @returns {ISourceDependencyDigest}
     */
    protected getInitialDigest(dependencies: IMergeInput): ISourceDependencyDigest {
        const sourceKeys = Object.keys(dependencies);
        const dependencyKeysPerSourceKey: Array<{
            sourceKey: string,
            dependencyKeys: string[]
        }> = sourceKeys.map((sourceKey) => {
            return {
                sourceKey: sourceKey,
                dependencyKeys: Object.keys(dependencies[sourceKey])
            };
        });

        const digest: ISourceDependencyDigest = {};

        // loop over dependencies and prepare digest
        dependencyKeysPerSourceKey.forEach((config) => {
            const sourceKey = config.sourceKey;

            config.dependencyKeys.forEach((dependencyKey) => {
                const version: IVersion = dependencies[sourceKey][dependencyKey];

                // if package occurs for the first time
                if (!digest[dependencyKey]) {
                    digest[dependencyKey] = {
                        hasConflict: false,
                        conflicts: [],
                        sources: {
                            [sourceKey]: {
                                version: version,
                                type: this.getVersionType(version)
                            }
                        },
                        recommended: version,
                        recommendedSources: [sourceKey],
                        highest: {
                            version: version,
                            type: this.getVersionType(version)
                        },
                        highestSources: [sourceKey],
                        lowest: {
                            version: version,
                            type: this.getVersionType(version)
                        },
                        lowestSources: [sourceKey]
                    };
                } else {
                    // if package occurs for the nth time
                    digest[dependencyKey].sources[sourceKey] = {
                        version: version,
                        type: this.getVersionType(version)
                    };
                }
            });
        });

        return digest;
    }

    /**
     * Get digest with conflicts
     * @param {ISourceDependencyDigest} digest
     * @param {boolean} forceRecommended
     * @returns {ISourceDependencyDigest}
     */
    protected getMergeDigest(digest: ISourceDependencyDigest, forceRecommended: boolean): ISourceDependencyDigest {

        Object.keys(digest).forEach((packageKey) => {
            let packageDigest = digest[packageKey];

            // dont proceed if only one source has package - no chance of conflict
            if (Object.keys(packageDigest.sources).length === 1) {
                return;
            }

            // get stats
            const statsDigest = this.getStatsDigest(packageDigest);
            packageDigest = Object.assign(packageDigest, statsDigest);

            // get conflicts
            const conflictDigest = this.getConflictDigest(packageDigest);
            packageDigest = Object.assign(packageDigest, conflictDigest);

            // get resolution
            const resolutionDigest = this.getRecommendedResolutionDigest(packageDigest, forceRecommended);
            packageDigest = Object.assign(packageDigest, resolutionDigest);

            digest[packageKey] = packageDigest;
        });

        return digest;
    }

    /**
     * Get dependency stats digest
     * @param {ISourceDependencyDigest} digest
     * @returns {IDependencyStatsDigest}
     * @returns {IDependencyStatsDigest}
     */
    protected getStatsDigest(digest: IDependencyDigest): IDependencyStatsDigest {
        // get stats for all sources
        const lowest = this.getExtreme(digest, 'min');
        const highest = this.getExtreme(digest, 'max');

        return {
            highest: {
                version: highest.version,
                type: highest.type
            },
            highestSources: highest.sourceKeys,
            lowest: {
                version: lowest.version,
                type: lowest.type
            },
            lowestSources: lowest.sourceKeys
        };
    }

    /**
     * Get min or max for digest
     * @param {IDependencyDigest} digest
     * @param {"min" | "max"} type
     * @returns {{maxVersion: IVersion; maxVersionType: VersionType; MaxSourceKeys: string[]}}
     */
    protected getExtreme(
        digest: IDependencyDigest,
        type: 'min' | 'max'
    ): { version: IVersion; type: VersionType; sourceKeys: string[]; } {
        let extreme: string = '';
        let extremeType: VersionType = VersionType.VERSION;
        let extremeSourceKeys: string[] = [];

        const comparator = type === 'max' ? this.semver.gt : this.semver.lt;

        Object.keys(digest.sources).forEach((sourceKey) => {
            const sourceDigest: IVersionDefinition = digest.sources[sourceKey];
            let versionA = sourceDigest.version;
            let versionB = extreme;

            // if no max set it
            if (!extreme) {
                extreme = sourceDigest.version;
                extremeType = VersionType.VERSION;
                extremeSourceKeys = [sourceKey];
                return;
            }

            // if same version as max
            if (versionA === versionB) {
                extremeSourceKeys.push(sourceKey);
                return;
            }

            // if both same are not of type version
            if (!(extremeType === VersionType.VERSION && sourceDigest.type === VersionType.VERSION)) {
                // if any of type range
                if (sourceDigest.type === VersionType.RANGE) {
                    // get lowest possible version from ranges
                    versionA = this.semver.minVersion(sourceDigest.version) as string;
                }

                if (extremeType === VersionType.RANGE) {
                    versionB = this.semver.minVersion(extreme) as string;
                }
            }

            // if new max
            if (comparator(versionA as string, versionB as string)) {
                extreme = sourceDigest.version;
                extremeType = VersionType.VERSION;
                extremeSourceKeys = [sourceKey];
            }
        });

        return {
            version: extreme,
            type: extremeType,
            sourceKeys: extremeSourceKeys
        };
    }

    /**
     * Get dependency conflict digest
     * @param {ISourceDependencyDigest} digest
     * @returns {IDependencyStatsDigest}
     * @returns {IDependencyStatsDigest}
     */
    protected getConflictDigest(digest: IDependencyDigest): IDependencyConflictDigest {
        const conflicts: IDependencyConflictDefinition[] = [];

        // for each combination check conflicts
        const sourceKeys = Object.keys(digest.sources);

        let x = 0;
        sourceKeys.forEach((sourceKeyA) => {
            for (let i = x; i < sourceKeys.length; i++) {
                const sourceKeyB = sourceKeys[i];

                // don't compare same entries
                if (sourceKeyA === sourceKeyB) {
                    return;
                }

                const versionA = digest.sources[sourceKeyA];
                const versionB = digest.sources[sourceKeyB];

                // if only versions lets check if the same
                if (versionA.type === VersionType.VERSION && versionB.type === VersionType.VERSION) {
                    if (!this.semver.eq(versionA.version, versionB.version)) {
                        const description = ConflictDescription.VERSION_MISMATCH
                            .replace('{{versionA}}', versionA.version)
                            .replace('{{sourceA}}', sourceKeyA)
                            .replace('{{versionB}}', versionB.version)
                            .replace('{{sourceB}}', sourceKeyB);

                        conflicts.push({
                            type: ConflictType.VERSION_MISMATCH,
                            description: description,
                            conflictSources: {
                                [sourceKeyA]: versionA,
                                [sourceKeyB]: versionB
                            }
                        });
                    }
                    continue;
                }

                // if only ranges check if there is intersection
                if (versionA.type === VersionType.RANGE && versionB.type === VersionType.RANGE) {
                    if (!this.semver.intersects(versionA.version, versionB.version)) {
                        const description = ConflictDescription.NO_RANGE_INTERSECTION
                            .replace('{{versionA}}', versionA.version)
                            .replace('{{sourceA}}', sourceKeyA)
                            .replace('{{versionB}}', versionB.version)
                            .replace('{{sourceB}}', sourceKeyB);

                        conflicts.push({
                            type: ConflictType.NO_RANGE_INTERSECTION,
                            description: description,
                            conflictSources: {
                                [sourceKeyA]: versionA,
                                [sourceKeyB]: versionB
                            }
                        });
                    }
                    continue;
                }

                // if version and range check if version in range
                let versionDefinition = versionA;
                let rangeDefinition = versionB;

                if (versionA.type === VersionType.RANGE) {
                    versionDefinition = versionB;
                    rangeDefinition = versionA;
                }

                // if version above range
                if (this.semver.gtr(versionDefinition.version, rangeDefinition.version)) {

                    const description = ConflictDescription.VERSION_ABOVE_RANGE
                        .replace('{{versionA}}', versionA.version)
                        .replace('{{sourceA}}', sourceKeyA)
                        .replace('{{versionB}}', versionB.version)
                        .replace('{{sourceB}}', sourceKeyB);

                    conflicts.push({
                        type: ConflictType.VERSION_ABOVE_RANGE,
                        description: description,
                        conflictSources: {
                            [sourceKeyA]: versionA,
                            [sourceKeyB]: versionB
                        }
                    });
                } else if (this.semver.ltr(versionDefinition.version, rangeDefinition.version)) {
                    // if version below range
                    const description = ConflictDescription.VERSION_BELOW_RANGE
                        .replace('{{versionA}}', versionA.version)
                        .replace('{{sourceA}}', sourceKeyA)
                        .replace('{{versionB}}', versionB.version)
                        .replace('{{sourceB}}', sourceKeyB);

                    conflicts.push({
                        type: ConflictType.VERSION_BELOW_RANGE,
                        description: description,
                        conflictSources: {
                            [sourceKeyA]: versionA,
                            [sourceKeyB]: versionB
                        }
                    });
                }
            }
            x++;
        });
        const hasConflict = !!conflicts.length;

        return {hasConflict, conflicts};
    }

    /**
     * Get dependency resolution digest, respect forced recommendation
     * @param {ISourceDependencyDigest} digest
     * @param {boolean} forceRecommended
     * @returns {IDependencyStatsDigest}
     */
    protected getRecommendedResolutionDigest(
        digest: IDependencyDigest,
        forceRecommended: boolean
    ): IDependencyResolutionDigest & IDependencyConflictDigest {

        // versions per sources already computed
        const sources = digest.sources;
        // for recommended always take highest version
        const recommended = digest.highest.version;
        const recommendedSources = digest.highestSources;

        let hasConflict = digest.hasConflict;
        let conflicts = digest.conflicts;

        // if conflict and we force recommended
        if (hasConflict && forceRecommended) {
            // discard conflicts
            hasConflict = false;
            conflicts = undefined;
        }

        return {
            sources,
            recommended,
            recommendedSources,
            hasConflict,
            conflicts
        };
    }

    /**
     * get version type (version or version range)
     * @returns {boolean}
     */
    protected getVersionType(version: IVersion): VersionType {
        // use semver validator that returns null if invalid
        // (accepts only versions if format: 1.2.3 or v1.2.3)
        return !!this.semver.valid(version) ? VersionType.VERSION : VersionType.RANGE;
    }

}
