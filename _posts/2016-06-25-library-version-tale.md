---
layout: post
title: "A library version tale with Node.js: set exact library versions"
tags:
  - nodejs
  - software-engineering
---

Something every developer should know: when you develop a project that has to go
in production, it is good to control the version of the dependencies you use.
**Embed the libraries you use, or at least set fixed version numbers in your
favorite dependency management tool.**

It can help to avoid lots of bugs and headaches.

Here is one of the weirdest bug I had. I struggled a lot to find its cause, only
to understand the bug was not in my code, but introduced by a third party
dependency of which I lost control.

* This will become a table of contents (this text will be scraped).
{:toc}

## A new feature

I work on some code actually deployed in production. I manage several
environments (let's restrain to production and preproduction) with automation
tools so I can be sure the code is ready to go in production.

Needing an awesome network protocol library - let's call it *awesome-library* -
I started one of my favorite `npm` command at the beginning of the project:

    npm install awesome-library --save

*That was my mistake.*

For those who use other tools or languages, this simply tells I want to add the
*awesome-library* as a dependency in my project; each time my automation tools
deploy the code, this dependency will be installed (`--save` option).

Later on, I needed to add a new feature in my project. I implemented the
feature. Did some tests. Put it in preproduction. Seeing it was fine a whole
day, it was deployed on the production environment the morrow.

2 hours later, the production platform was acting weird and I had network
troubles.

Fortunately, I have the means to do a quick rollup, so the previous version was
immediately restored.

## Searching for the bug

I had logs. Good practices for production. The code I added was so simple and
minimal that I could not understand how it could have so drastically changed the
behavior of the app. However the logs were showing some problems coming from the
use of *awesome-library* and I actually did some modifications in some code
using that library.

But why a behavior so different between my preproduction and production environments?

![Problem Timeline][problem-timeline]
*Problem timeline*

I immediately redeployed the code in one of my testing environments. Here is the very weird timeline of my tests.

1. Original implementation in production, all is fine.
2. New feature in preproduction, all is fine.
3. Deployment in production: lots of instabilities
4. Rollback: the app is not fully redeployed, actually a symlink is changed
   toward an already-installed version of the app.
5. Full redeploy of my feature in the preproduction environment. Contrary to step 2, the feature was not working anymore!
6. Quite randomly and after lots of tests mixing redeploys of the old version
   (that was not working any more in preproduction!) and of the new version in
   preproduction, my app started to work again in preproduction.

I finally had the intuition of checking the commit logs on GitHub of
*awesome-library*. Good intuition. I discovered 2 things:

- my problem was detailed in the commit messages of the library on GitHub
- the library was updated 2 times while I was doing my production deployment and
  my tests

## The explanation

If we add the timeline of the *awesome-library* evolution, the full timeline
view becomes:

[![Problem Timeline Full][full-timeline]][full-timeline]
*Full timeline of the problem*

When a fresh installation of my app is done, *awesome-library* is automatically
pulled from GitHub.

My first implementation was using version x.0.0 of *awesome-library*. And all
was fine. Unfortunately for me, just before I decided to put my new code in
production, version x.0.1 of *awesome-library* was available - with a nasty bug
in it - and my build system automatically fetched this new version!

While I was doing some tests on my code to find the bug, the maintainer of
*awesome-library* corrected the regression and published version x.0.2. Since
some of my tests (with the old AND new version of my app) were done with x.0.1
and some others with x.0.2 it was difficult to understand what was happening.

## Conclusion

I would have avoid lots of headaches if the command I did at the beginning of
the project was:

    npm install awesome-library --save --save-exact

In the case of Node.js, the `--save-exact` option freezes the library version.

Without its use, the content of `package.json` is:

    "dependencies": {
        "awesome-library": "^1.0.0"
    }

According to `npm` documentation, it means that higher minor or patch numbers
are allowed. Each time you do a fresh install with a fresh `npm install`
command, `npm` downloads an updated version of the library. It can be noted that
once `npm install` is executed, typing it once again does not update the already
installed library - unless `npm update` is executed.

When the `--save-exact` option is added, `package.json` becomes:

    "dependencies": {
        "awesome-library": "1.0.0"
    }

The caret disappears, and the library version is definitively set-up (unless
the developer decides to change it).

Even allowing an automatic upgrade for the patch number in a
[SemVer][semver]-compatible library is not a good idea since a bug fix can also
be a source of new bugs.

A production environment must be as predictable as possible.

[semver]: http://semver.org/
[problem-timeline]: {{site.url}}/assets/posts/library-version-tale/problem-timeline.png
[full-timeline]: {{site.url}}/assets/posts/library-version-tale/problem-timeline-full.png
