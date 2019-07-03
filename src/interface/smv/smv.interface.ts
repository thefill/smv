import {IMergeInput} from '../merge-input';
import {IMergeResolution} from '../merge-resolution';
import {ISemver} from '../semver';

/**
 * Interface for SMV class
 */
export interface ISMV extends ISemver {
    /**
     * Try to merge provided list of sources with its dependencies.
     * Produces merge resolution object that lists conflicts
     * @param {IMergeInput} packages
     * @param {boolean} forceRecommended If true automatically accepts
     *                               highest version available as correct
     * @returns {IMergeResolution | null}
     */
    merge(packages: IMergeInput, forceRecommended?: boolean): IMergeResolution | null;
}
