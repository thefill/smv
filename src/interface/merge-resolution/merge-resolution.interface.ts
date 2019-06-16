import {ISourceDependencyDigest} from '../digest';
import {IVersion} from '../version';

/**
 * Output of cross-source dependency merge
 */
export interface IMergeResolution {
    /**
     * Final list of non-conflicting pairs package-version
     */
    result: { [packageName: string]: IVersion };
    /**
     * List of conflicts that have to be resolved
     */
    conflicts?: ISourceDependencyDigest;
    /**
     * List of resolved results - kept for informative purposes
     */
    resolved?: ISourceDependencyDigest;
}
