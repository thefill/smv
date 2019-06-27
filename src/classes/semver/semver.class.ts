import semver from 'semver';
import {ISemVerDigest} from '../../interface';
import {ISemver} from '../../interface/semver';

/**
 * Main class
 */
export class Semver implements ISemver {
    protected semver: ISemver = semver;

    public valid(version: string): string | null {
        return this.semver.valid(version);
    }

    public inc(version: string, release: string): string | null {
        return this.semver.inc(version, release);
    }

    public prerelease(version: string): string[] | null {
        return this.semver.prerelease(version);
    }

    public major(version: string): string | null {
        return this.semver.major(version);
    }

    public minor(version: string): string | null {
        return this.semver.minor(version);
    }

    public patch(version: string): string | null {
        return this.semver.patch(version);
    }

    public intersects(rangeA: string, rangeB: string, loose?: boolean): boolean {
        return this.semver.intersects(rangeA, rangeB, loose);
    }

    public parse(version: string): string | null {
        return this.semver.parse(version);
    }

    public gt(versionA: string, versionB: string): boolean {
        return this.semver.gt(versionA, versionB);
    }

    public gte(versionA: string, versionB: string): boolean {
        return this.semver.gte(versionA, versionB);
    }

    public lt(versionA: string, versionB: string): boolean {
        return this.semver.lt(versionA, versionB);
    }

    public lte(versionA: string, versionB: string): boolean {
        return this.semver.lte(versionA, versionB);
    }

    public eq(versionA: string, versionB: string): boolean {
        return this.semver.eq(versionA, versionB);
    }

    public neq(versionA: string, versionB: string): boolean {
        return this.semver.neq(versionA, versionB);
    }

    public cmp(versionA: string, comparator, versionB: string): boolean {
        return this.semver.cmp(versionA, comparator, versionB);
    }

    public compare(versionA: string, versionB: string): 0 | 1 | -1 {
        return this.semver.compare(versionA, versionB);
    }

    public rcompare(versionA: string, versionB: string): 0 | 1 | -1 {
        return this.semver.rcompare(versionA, versionB);
    }

    public compareBuild(versionA: string, versionB: string): 0 | 1 | -1 {
        return this.semver.compareBuild(versionA, versionB);
    }

    public diff(versionA: string, versionB: string): string | null {
        return this.semver.diff(versionA, versionB);
    }

    public validRange(range: string): string | null {
        return this.semver.validRange(range);
    }

    public satisfies(version: string, range: string): boolean {
        return this.semver.satisfies(version, range);
    }

    public maxSatisfying(versions: string[], range: string): string | null {
        return this.semver.maxSatisfying(versions, range);
    }

    public minSatisfying(versions: string[], range: string): string | null {
        return this.semver.minSatisfying(versions, range);
    }

    public minVersion(range: string): ISemVerDigest | null {
        return this.semver.minVersion(range);
    }

    public gtr(version: string, range: string): boolean {
        return this.semver.gtr(version, range);
    }

    public ltr(version: string, range: string): boolean {
        return this.semver.ltr(version, range);
    }

    public outside(version: string, range, hilo: '>' | '<'): boolean {
        return this.semver.outside(version, range, hilo);
    }

    public coerce(version: string): string {
        return this.semver.coerce(version);
    }

    public clean(version: string): string {
        return this.semver.clean(version);
    }
}
