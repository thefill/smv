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
}
