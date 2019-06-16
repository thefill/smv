/**
 * Description of conflict types
 */
export enum ConflictDescription {
    VERSION_MISMATCH = 'Versions {{versionA}} (required by {{sourceA}}) and ' +
        '{{versionB}} (required by {{sourceB}}) differ from each-other',
    VERSION_ABOVE_RANGE = 'Version {{version}} (required by {{versionSource}}) is greater ' +
        'than all the versions possible in the range {{range}} (required by {{rangeSource}})',
    VERSION_BELOW_RANGE = 'Version {{version}} (required by {{versionSource}}) is less ' +
        'than all the versions possible in the range {{range}} (required by {{rangeSource}})',
    NO_RANGE_INTERSECTION = 'Ranges {{versionA}} (required by {{sourceA}}) and ' +
        '{{versionB}} (required by {{sourceB}}) don\' intersect with each-other'
}
