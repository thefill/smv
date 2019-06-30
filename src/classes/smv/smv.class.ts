import {ConflictDescription, ConflictType, VersionType} from '../../enums';
import {
    IDependencyConflictDefinition,
    IDependencyConflictDigest,
    IDependencyDigest,
    IDependencyResolutionDigest,
    IDependencyStatsDigest,
    IMergeInput,
    IMergeResolution,
    ISemVerDigest,
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

            (resolution.resolved as ISourceDependencyDigest)[key] = digestEntry;

            if (!digestEntry.hasConflict) {
                return resolution.result[key] = digestEntry.recommended;
            }

            resolution.hasConflicts = true;
            (resolution.resolved as ISourceDependencyDigest)[key].hasConflict = true;
            (resolution.resolved as ISourceDependencyDigest)[key].conflicts = digestEntry.conflicts;

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
        // Extremum can be a range or a version
        let extremum: string = '';
        let extremumType: VersionType = VersionType.VERSION;
        let extremumSourceKeys: string[] = [];

        Object.keys(digest.sources).forEach((contenderSourceKey) => {
            const contenderDigest: IVersionDefinition = digest.sources[contenderSourceKey];
            const contender = contenderDigest.version;
            const contenderType = contenderDigest.type;

            // if no max set it to current element
            if (!extremum) {
                extremum = contenderDigest.version;
                extremumType = contenderDigest.type;
                extremumSourceKeys = [contenderSourceKey];
                return;
            }

            // if same version as extremum
            if (contender === extremum && contenderType === extremumType) {
                extremumSourceKeys.push(contenderSourceKey);
                return;
            }

            let extremumMinimum = extremum;
            let contenderMinimum = contender;

            // if contender value is range
            if (contenderType === VersionType.RANGE) {
                // get lowest possible version from ranges
                const contenderVersion = this.semver.minVersion(contenderDigest.version) as ISemVerDigest;
                contenderMinimum = contenderVersion.version;
            }

            // if extremum value is range get it as a version
            if (extremumType === VersionType.RANGE) {
                // get lowest possible version from ranges
                const extremumVersion = this.semver.minVersion(extremum) as ISemVerDigest;
                extremumMinimum = extremumVersion.version;
            }

            // if versions are equal
            if (this.semver.eq(contenderMinimum as string, extremumMinimum as string)) {
                // we know both have not the same type so
                // only select contender if its type is range,
                // else extremum is range and its preferred
                if (contenderType === VersionType.RANGE) {
                    extremum = contenderDigest.version;
                    extremumType = contenderDigest.type;
                    extremumSourceKeys = [contenderSourceKey];
                }
                return;
            }

            // check if contender in the new extremum
            let newExtremum = false;

            // for max check
            if (type === 'max') {

                switch (contenderType + extremumType) {
                    // if contender is range and extremum is range
                    case VersionType.RANGE + VersionType.RANGE:
                        // if contender minimum version is above extremum minimum version
                        // and if contender minimum version is above possible values of extremum range
                        newExtremum = this.semver.gt(contenderMinimum, extremumMinimum) &&
                            this.semver.gtr(contenderMinimum, extremum);
                        break;
                    // if contender is range and extremum is version
                    case VersionType.RANGE + VersionType.VERSION:
                        // if extremum version is below all possible contender versions
                        newExtremum = !this.semver.gtr(extremum, contender);
                        break;
                    // if contender is version and extremum is range
                    case VersionType.VERSION + VersionType.RANGE:
                        // if contender version is above possible values of extremum range
                        newExtremum = this.semver.gtr(contender, extremum);
                        break;
                    // if contender is version and extremum is version
                    case VersionType.VERSION + VersionType.VERSION:
                        // if contender version is above extremum version
                        newExtremum = this.semver.gt(contender, extremum);
                        break;
                }
            }

            // for min check
            if (type === 'min') {

                switch (contenderType + extremumType) {
                    // if contender is range and extremum is range
                    case VersionType.RANGE + VersionType.RANGE:
                        // if contender minimum version is below extremum minimum version
                        // and if contender minimum version is below possible values of extremum range
                        newExtremum = this.semver.lt(contenderMinimum, extremumMinimum) &&
                            this.semver.ltr(contenderMinimum, extremum);
                        break;
                    // if contender is range and extremum is version
                    case VersionType.RANGE + VersionType.VERSION:
                        // if extremum version is above all possible contender versions
                        newExtremum = !this.semver.ltr(extremum, contender);
                        break;
                    // if contender is version and extremum is range
                    case VersionType.VERSION + VersionType.RANGE:
                        // if contender version is below possible values of extremum range
                        newExtremum = this.semver.ltr(contender, extremum);
                        break;
                    // if contender is version and extremum is version
                    case VersionType.VERSION + VersionType.VERSION:
                        // if contender version is below extremum version
                        newExtremum = this.semver.lt(contender, extremum);
                        break;
                }
            }

            if (newExtremum) {
                // set contender as new extremum
                extremum = contenderDigest.version;
                extremumType = contenderDigest.type;
                extremumSourceKeys = [contenderSourceKey];
            }

        });

        // return calculated extremum
        return {
            version: extremum,
            type: extremumType,
            sourceKeys: extremumSourceKeys
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
                let versionSource = sourceKeyA;
                let rangeDefinition = versionB;
                let rangeSource = sourceKeyB;

                if (versionA.type === VersionType.RANGE) {
                    versionDefinition = versionB;
                    versionSource = sourceKeyB;
                    rangeDefinition = versionA;
                    rangeSource = sourceKeyA;
                }

                // if version above range
                if (this.semver.gtr(versionDefinition.version, rangeDefinition.version)) {

                    const description = ConflictDescription.VERSION_ABOVE_RANGE
                        .replace('{{versionA}}', versionDefinition.version)
                        .replace('{{sourceA}}', versionSource)
                        .replace('{{versionB}}', rangeDefinition.version)
                        .replace('{{sourceB}}', rangeSource);

                    conflicts.push({
                        type: ConflictType.VERSION_ABOVE_RANGE,
                        description: description,
                        conflictSources: {
                            [versionSource]: versionDefinition,
                            [rangeSource]: rangeDefinition
                        }
                    });
                } else if (this.semver.ltr(versionDefinition.version, rangeDefinition.version)) {
                    // if version below range
                    const description = ConflictDescription.VERSION_BELOW_RANGE
                        .replace('{{versionA}}', versionDefinition.version)
                        .replace('{{sourceA}}', versionSource)
                        .replace('{{versionB}}', rangeDefinition.version)
                        .replace('{{sourceB}}', rangeSource);

                    conflicts.push({
                        type: ConflictType.VERSION_BELOW_RANGE,
                        description: description,
                        conflictSources: {
                            [versionSource]: versionDefinition,
                            [rangeSource]: rangeDefinition
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
