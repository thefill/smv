import {Utils} from './utils.class';

describe('Utils class', () => {

    describe('unique method', () => {
        const sets = [
            {
                provided: ['A', 'B', 'C', 'D', 'E'],
                expected: ['A', 'B', 'C', 'D', 'E']
            },
            {
                provided: ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E'],
                expected: ['A', 'B', 'C', 'D', 'E']
            },
            {
                provided: ['A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'C', 'C', 'C', 'C'],
                expected: ['A', 'B', 'C']
            },
            {
                provided: [],
                expected: []
            }
        ];

        it('should return unique primitives', () => {
            sets.forEach((set) => {
                const result = Utils.unique(set.provided);
                expect(result).toEqual(set.expected);
            });
        });
    });

    describe('sameArray method', () => {
        const sets = [
            {
                providedA: ['A', 'B', 'C', 'D', 'E'],
                providedB: ['A', 'B', 'C', 'D', 'E'],
                expected: true
            },
            {
                providedA: ['A', 'B', 'C', 'D', 'E'],
                providedB: ['A', 'B', 'C'],
                expected: false
            },
            {
                providedA: ['A', 'B', 'C'],
                providedB: ['A', 'B', 'C', 'D', 'E'],
                expected: false
            },
            {
                providedA: [1, 2, 3, 4, 5],
                providedB: [1, 2, 3, 4, 5],
                expected: true
            },
            {
                providedA: [1, 2, 3, 4, 5],
                providedB: [1, 2, 3],
                expected: false
            },
            {
                providedA: [1, 2, 3],
                providedB: [1, 2, 3, 4, 5],
                expected: false
            },
            {
                providedA: ['A', 'B', 'C', 1, 2, 3],
                providedB: ['A', 'B', 'C', 1, 2, 3],
                expected: true
            },
            {
                providedA: ['A', 'B', 'C', 1, 2, 3],
                providedB: ['A', 'B', 1, 2],
                expected: false
            },
            {
                providedA: ['A', 'B', 1, 2],
                providedB: ['A', 'B', 'C', 1, 2, 3],
                expected: false
            }
        ];

        it('should correctly check for array similarities', () => {
            sets.forEach((set) => {
                const result = Utils.sameArrays(set.providedA, set.providedB);
                expect(result).toEqual(set.expected);
            });
        });
    });

});
