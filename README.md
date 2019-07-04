[//]: # (Readme partial used by an default readme page)

# SMV

Simple, lightweight dependency injector - supports factories, classes and primitives.

[//]: # (Readme partial used by an default readme page)

[![Code quality](https://api.codacy.com/project/badge/Grade/b0a7a03515fd4fdeaedc37f667588860)](https://www.codacy.com/app/fifofil/smv?utm_source=github.com&utm_medium=referral&utm_content=thefill/smv&utm_campaign=Badge_Grade)
[![Coverage](https://api.codacy.com/project/badge/Coverage/b0a7a03515fd4fdeaedc37f667588860)](https://www.codacy.com/app/fifofil/smv?utm_source=github.com&utm_medium=referral&utm_content=thefill/smv&utm_campaign=Badge_Coverage)
[![Greenkeeper badge](https://badges.greenkeeper.io/thefill/smv.svg)](https://greenkeeper.io/)
[![CricleCi badge](https://circleci.com/gh/thefill/smv/tree/master.svg?style=shield)](https://circleci.com/gh/thefill/smv)

![npm version](https://img.shields.io/npm/v/smv.svg)
[![Open issues](https://img.shields.io/github/issues-raw/thefill/smv.svg)](https://github.com/thefill/smv/issues)
![Types: TypeScript](https://img.shields.io/npm/types/smv.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[//]: # (Readme partial used by an default readme page)

## Main features

*   tiny & easy to use: 1 powerful merge method, rest is plain old semver
*   returns descriptive merge conflict details
*   1 dependency (for dist)
*   Typescript types included
*   exposes esm/cjs modules
*   always 100% test coverage

## Guide

*   [Installation](#installation "Installation")
*   [Basic usage](#basicusage "Basic usage")
*   [Advanced usage](#advancedusage "Advanced usage")
*   [API documentation](#documentation "Documentation")

## Installation

<pre>npm install --save smv</pre>

or

<pre>yarn add smv</pre>

or

<pre>pnpm --save smv</pre>

## Basic usage

### Doing it semver-style 

SMV is a typed replacement for semver package as it proxies all semver-like methods to the semver.
Full list of supported methods can be found [on the semver github page](https://www.npmjs.com/package/semver).

<pre class="runkit-source">const SMV = require('smv@0.0.7').SMV;
const smv = new SMV();

const major = smv.major('1.2.3');
console.log('major', major);

const equal = smv.eq('1.2.3', '2.3.4');
console.log('equal?', equal);

const greater = smv.gt('1.2.3', '2.3.4');
console.log('greater?', greater);

const lower = smv.ltr('1.2.3', '^1.3.4');
console.log('lower than range?', lower);</pre>

### Dependency merge

With SMV you can resolve dependencies from multiple sources. 

Imagine how you would programmatically merge devDependencies from few package.json files?

<pre class="runkit-source">const SMV = require('smv@0.0.7').SMV;
const smv = new SMV();

const sourceA = {
    packageA: '1.2.3',
    packageB: '1.2.3',
    packageC: '0.0.1',
}
const sourceB = {
    packageA: '1.2.3',
    packageB: '1.2.3'
}

const digest = smv.merge({sourceA, sourceB});

console.log('Has conflicts?', digest.hasConflicts);
console.log('Final result', digest.result);
console.log('Conflicts', digest.conflicts);
console.log('Resolved digest', digest.resolved);</pre>

Un-conflicting dependencies are easy - you can deal with them using basic JS techniques.

How about conflicting dependencies?

<pre class="runkit-source">const SMV = require('smv@0.0.7').SMV;
const smv = new SMV();

const sourceA = {
    packageA: '1.2.3',
    packageB: '^1.2.3',
    packageC: '0.0.1',
}
const sourceB = {
    packageA: '1.2.3',
    packageB: '1.0.3'
}

const digest = smv.merge({sourceA, sourceB});

console.log('Has conflicts?', digest.hasConflicts);
console.log('Final result', digest.result);
console.log('Conflicts', digest.conflicts);
console.log('Resolved digest', digest.resolved);</pre>

## Advanced usage

### Forced dependency merge

There are situations when you don't want to waste time resolving conflicts. 
SMV allows you to enforce recommended versions (from resolved digest) as a final result.

<pre class="runkit-source">const SMV = require('smv@0.0.7').SMV;
const smv = new SMV();

const sourceA = {
    packageA: '1.2.3',
    packageB: '^1.2.3',
    packageC: '0.0.1',
}
const sourceB = {
    packageA: '1.2.3',
    packageB: '1.0.3'
}

// notice 2nd param passed to the merge method - thats forceRecommended flag
const digest = smv.merge({sourceA, sourceB}, true);

console.log('Has conflicts?', digest.hasConflicts);
console.log('Final result', digest.result);
console.log('Conflicts', digest.conflicts);
console.log('Resolved digest', digest.resolved);</pre>

[//]: # (Readme partial used by an markdown readme page)

## Documentation

Full API documentation for this package can be found [here](https://thefill.github.io/smv "API documentations for the package")
