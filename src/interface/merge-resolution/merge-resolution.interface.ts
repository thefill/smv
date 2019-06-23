import {IDependencyConflictDigest, ISourceDependencyDigest} from '../digest';
import {IVersion} from '../version';

/**
 * Output of cross-source dependency merge
 */
export interface IMergeResolution {
    /**
     * Does any package has conflict
     */
    hasConflicts: boolean;
    /**
     * Final list of non-conflicting pairs package-version
     */
    result: { [packageName: string]: IVersion };
    /**
     * List of conflicts that have to be resolved
     */
    conflicts?: { [packageName: string]: IDependencyConflictDigest };
    /**
     * List of resolved results - kept for informative purposes
     */
    resolved?: ISourceDependencyDigest;
}
