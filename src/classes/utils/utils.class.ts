export class Utils {

    /**
     * Get unique list of values from an array of string values
     * @param {string[]} values
     * @returns {string[]}
     */
    public static unique(values: string[]): string[] {
        return values.filter((value, index, allValues) => {
            return allValues.indexOf(value) === index;
        });
    }

    /**
     * Checks if 2 arrays with primitive values are equal
     * @param {any[]} arrayA
     * @param {any[]} arrayB
     * @returns {boolean}
     */
    public static sameArrays(arrayA: any[], arrayB: any[]): boolean {
        const unique = new Set(arrayA.concat(arrayB));

        // if match e.g. same values on both arrays
        return arrayA.length === unique.size;
    }
}
