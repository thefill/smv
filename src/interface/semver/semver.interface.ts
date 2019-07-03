import {ISemVerDigest} from '../semver-digest';

/**
 * Interface for Semver class (semver wrapper) which SMV extends
 */
export interface ISemver {

    /**
     * Return the parsed version:string, or null if it's not valid.
     * @param {string} version
     * @returns {string | null}
     */
    valid(version: string): string | null;

    /**
     * Return the version incremented by the release type
     * (major, premajor, minor, preminor, patch, prepatch, or prerelease)
     * @param {string} version
     * @param {string} release
     * @returns {string | null}
     */
    inc(version: string, release: string): string | null;

    /**
     * Returns an array of prerelease components, or null if none exist.
     * @param {string} version
     * @returns {string[] | null}
     */
    prerelease(version: string): string[] | null;

    /**
     * Return the major version number.
     * @param {string} version
     * @returns {string | null}
     */
    major(version: string): number | null;

    /**
     * Return the minor version number.
     * @param {string} version
     * @returns {string | null}
     */
    minor(version: string): number | null;

    /**
     * Return the patch version number.
     * @param {string} version
     * @returns {string | null}
     */
    patch(version: string): number | null;

    /**
     * Return true if the two supplied ranges or comparators intersect.
     * @param {string} rangeA
     * @param {string} rangeB
     * @param {boolean} loose
     * @returns {boolean}
     */
    intersects(rangeA: string, rangeB: string, loose?: boolean): boolean;

    /**
     * Attempt to parse a string as a semantic version:string,
     * returning either a SemVer object or null.
     * @param {string} version
     * @returns {string | null}
     */
    parse(version: string): ISemVerDigest | null;

    /**
     * versionA > versionB
     * @param {string} versionA
     * @param {string} versionB
     * @returns {boolean}
     */
    gt(versionA: string, versionB: string): boolean;

    /**
     * versionA >= versionB
     * @param {string} versionA
     * @param {string} versionB
     * @returns {boolean}
     */
    gte(versionA: string, versionB: string): boolean;

    /**
     * versionA < versionB
     * @param {string} versionA
     * @param {string} versionB
     * @returns {boolean}
     */
    lt(versionA: string, versionB: string): boolean;

    /**
     * versionA <= versionB
     * @param {string} versionA
     * @param {string} versionB
     * @returns {boolean}
     */
    lte(versionA: string, versionB: string): boolean;

    /**
     * versionA == versionB
     * @param {string} versionA
     * @param {string} versionB
     * @returns {boolean}
     */
    eq(versionA: string, versionB: string): boolean;

    /**
     * versionA != versionB
     * @param {string} versionA
     * @param {string} versionB
     * @returns {boolean}
     */
    neq(versionA: string, versionB: string): boolean;

    /**
     * Pass in a comparison string, and it'll call the corresponding function above.
     * @param {string} versionA
     * @param comparator
     * @param {string} versionB
     * @returns {boolean}
     */
    cmp(versionA: string, comparator, versionB: string): boolean;

    /**
     * Return 0 if versionA == v2, or 1 if versionA is greater, or -1 if v2 is greater.
     * @param {string} versionA
     * @param {string} versionB
     * @returns {0 | 1 | -1}
     */
    compare(versionA: string, versionB: string): 0 | 1 | -1;

    /**
     * The reverse of compare.
     * @param {string} versionA
     * @param {string} versionB
     * @returns {0 | 1 | -1}
     */
    rcompare(versionA: string, versionB: string): 0 | 1 | -1;

    /**
     * The same as compare but considers build when two versions are equal.
     * @param {string} versionA
     * @param {string} versionB
     * @returns {0 | 1 | -1}
     */
    compareBuild(versionA: string, versionB: string): 0 | 1 | -1;

    /**
     * Returns difference between two versions by the release type
     * (major, premajor, minor, preminor, patch, prepatch, or prerelease),
     * or null if the versions are the same.
     * @param {string} versionA
     * @param {string} versionB
     * @returns {string | null}
     */
    diff(versionA: string, versionB: string): string | null;

    /**
     * Return the valid range or null if it's not valid
     * @param {string} range
     * @returns {string | null}
     */
    validRange(range: string): string | null;

    /**
     * Return true if the version satisfies the range.
     * @param {string} version
     * @param {string} range
     * @returns {boolean}
     */
    satisfies(version: string, range: string): boolean;

    /**
     * Return the highest version in the list that satisfies
     * the range, or null if none of them do.
     * @param {string[]} versions
     * @param {string} range
     * @returns {string | null}
     */
    maxSatisfying(versions: string[], range: string): string | null;

    /**
     *  Return the lowest version in the list that satisfies
     *  the range, or null if none of them do.
     * @param {string[]} versions
     * @param {string} range
     * @returns {string | null}
     */
    minSatisfying(versions: string[], range: string): string | null;

    /**
     * Return the lowest version that can possibly match the given range.
     * @param {string} range
     * @returns {ISemVerDigest | null}
     */
    minVersion(range: string): ISemVerDigest | null;

    /**
     * Return true if version is greater than all the versions possible in the range.
     * @param {string} version
     * @param {string} range
     * @returns {boolean}
     */
    gtr(version: string, range: string): boolean;

    /**
     * Return true if version is less than all the versions possible in the range.
     * @param {string} version
     * @param {string} range
     * @returns {boolean}
     */
    ltr(version: string, range: string): boolean;

    /**
     * Return true if the version is outside the bounds of the range in either the high or low direction.
     * @param {string} version
     * @param range
     * @param {">" | "<"} hilo
     * @returns {boolean}
     */
    outside(version: string, range, hilo: '>' | '<'): boolean;

    /**
     * Try to parse dirty version
     * @param {string} version
     * @returns {ISemVerDigest}
     */
    coerce(version: string): ISemVerDigest;

    /**
     * Clean dirty bersion
     * @param {string} version
     * @returns {string}
     */
    clean(version: string): string;
}
