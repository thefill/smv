/**
 * Description of conflict types
 */
export enum ConflictDescription {
    VERSION_MISMATCH = 'Versions {{versionA}} (required by {{sourceA}}) and ' +
        '{{versionB}} (required by {{sourceB}}) differ from each-other',
    VERSION_ABOVE_RANGE = 'Version {{versionA}} (required by {{sourceA}}) is greater ' +
        'than all the versions possible in the range {{versionB}} (required by {{sourceB}})',
    VERSION_BELOW_RANGE = 'Version {{versionA}} (required by {{sourceA}}) is less ' +
        'than all the versions possible in the range {{versionB}} (required by {{sourceB}})',
    NO_RANGE_INTERSECTION = 'Ranges {{versionA}} (required by {{sourceA}}) and ' +
        '{{versionB}} (required by {{sourceB}}) don\' intersect with each-other'
}
