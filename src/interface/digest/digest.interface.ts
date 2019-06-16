import {ConflictDescription} from '../../enums/conflict-description';
import {ConflictType} from '../../enums/conflict-type';
import {VersionType} from '../../enums/version-type';
import {IVersion} from '../version';

/**
 * Output list of version per package
 */
export interface IMergeDigest {
    /**
     * Standard object entry where key is a package name and value is a package version
     */
    [packageName: string]: IVersion;
}

/**
 * List of versions per source
 */
export interface ISourceDigest {
    /**
     * Standard object entry where key is a package name and value is a package version
     */
    [sourceName: string]: IVersionDefinition;
}

/**
 * List of dependencies from all provided sources
 */
export interface ISourceDependencyDigest {
    /**
     * List of packages and its digest objects
     */
    [packageName: string]: IDependencyConflictDigest & IDependencyStatsDigest & IDependencyResolutionDigest;
}

/**
 * Dependency digest for a single package
 */
export interface IDependencyDigest
    extends IDependencyConflictDigest,
        IDependencyStatsDigest,
        IDependencyResolutionDigest {
}

/**
 * List of single dependency stats across all sources
 */
export interface IDependencyStatsDigest {
    /**
     * Highest version available
     */
    highest: IVersionDefinition;
    /**
     * Sources that provided highest version
     */
    highestSources: string | string[];
    /**
     * Lowest version available
     */
    lowest: IVersionDefinition;
    /**
     * Sources that provided lowest version
     */
    lowestSources: string | string[];
}

/**
 * List of single dependency conflicts across all sources
 */
export interface IDependencyConflictDigest {
    /**
     * Does package has conflict with other package from sibling source?
     */
    hasConflict: boolean;
    /**
     * List of conflict definitions
     */
    conflicts: IDependencyConflictDefinition[];
}

export interface IVersionDefinition {
    /**
     * Package version
     */
    version: IVersion;
    /**
     * Version type
     */
    type: VersionType;
}

/**
 * Conflict definition
 */
export interface IDependencyConflictDefinition {
    /**
     * Conflict type
     */
    type: ConflictType;
    /**
     * Conflict description
     */
    description: string;
    /**
     * List of source names and conflicting versions
     */
    conflictSources?: ISourceDigest;
}

// two or more ranges dont have common intersection
// two or more ranges have common intersection but version outside of range
//

/**
 * List of single dependency conflicts across all sources
 */
export interface IDependencyResolutionDigest {
    /**
     * List of sources and package versions
     */
    sources: ISourceDigest;
    /**
     * Recommended package version
     */
    recommended: IVersion;
    /**
     * Sources that provided recommended version
     */
    recommendedSources: string | string[];
}
