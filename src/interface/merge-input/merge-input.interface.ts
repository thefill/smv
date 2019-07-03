import {IVersion} from '../version';

/**
 * Interface for initial merge input
 */
export interface IMergeInput {
    /**
     * List of dependency sources ant ids list of packages & its versions
     */
    [sourceName: string]: { [packageName: string]: IVersion };
}
