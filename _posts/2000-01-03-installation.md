---
title: "Install"
bg: orange
color: black
fa-icon: toggle-on
---

## Installing from Github

To install **mkchromecast**, clone this repository:

```
git clone https://github.com/muammar/mkchromecast.git
```

Or you may download one of the [stable releases
here](https://github.com/muammar/mkchromecast/releases), and unzip the file.

#### Python

To install the python requirements use the `requirements.txt` file shipped in
this repository:

```
pip install -r requirements.txt
```

**Note**: if this step fails, maybe you need to run the installation with
`sudo` as shown below. However, before installing using this method verify why
a regular user cannot install the requirements.

```
sudo pip install -r requirements.txt
```

**Linux** users can try to install these python requirements using the package
managers coming with their distributions.

-------------------------

## Debian based installation

Got some *killer app*, some *neat project*, a cool portfolio? Make an easy single-page site to show it all off. SinglePaged uses jekyll niceties to make a ***polished, modular, and beautiful* single page site**.

Oh-- go see [some examples](https://github.com/t413/SinglePaged#fancy-jekyll-powered-single-page-site)!

- Each vertical section is a markdown file in **_posts/** directory.
  * They're sorted by 'date'. (we don't use date anywhere, it only sorts)
- Each vertical section sets it's own **color**, **header icon** (or image), **title**, and easy-to-write markdown body.
- Only **two things** to edit:
  1. Edit `_config.yml` to set the site title, description, etc
  2. Add `_posts/*.md` to make each vertical section. Copy some examples and add the sections from your README.md for a fast start!
- Easy adding of **SEO terms**, **favicon** & such, and **google analytics token**.

Sound good? Let's go!

There are three way to get started: (links jump to that section)

1. Make a [**user homepage**](#setup-as-user-homepage) (or organization)
2. Make a [**standalone project**](#setup-as-standalone-project-page) page
3. Make a [site under an **existing project**](#setup-inside-existing-project)

## Setup as user homepage

- Go click **fork** on the [github project page](https://github.com/t413/SinglePaged)
- Rename your new repository to `**username**.github.io`. (click settings in the right column)
- Clone your repository, **cd into the project**
- Run `git checkout publish && git branch -m master && git push -u origin master && git branch -D gh-pages` to get the *publish* branch as master for a clean, empty starting point.
- On your github project page go to *settings* again and change your **default branch** to ***master***
- Run `git push origin --delete gh-pages` to delete your remote's development branch

Now hop over to [Usage](#usage) to get it running with your own stuff!

**When you publish changes use `git push -u origin master`**

-------------------------


## Setup as standalone project page

- Go click **fork** on the [github project page](https://github.com/t413/SinglePaged)
- Rename your new repository to `whatever you want`. (click settings in the right column)
  * It will go live at yourusername.github.io/**WhateverYouWant**
- Clone your repository, cd into the project
- Run `git checkout publish && git branch -D gh-pages && git branch -m gh-pages && git push -uf origin gh-pages` to swap the *publish* and *gh-pages* branch.

Now hop over to [Usage](#usage) to get it running with your own stuff!

**When you publish changes use `git push -u origin gh-pages`**

-------------------------


## Setup inside existing project

This is the most complicated use-case .. but it's the coolest.
Say you've got your kickass project `github.com/t413/kicker` and want to have
some web presence to post about on [hacker news](http://news.ycombinator.com).
This will create an orphan branch called `gh_pages` in your repository
where you can publish changes, posts, images, and such. It won't alter your code at all.

- `cd` into your project on the command line
- use `git remote add -t publish singlepage git@github.com:t413/SinglePaged.git` to get access to this repository.
- use `git fetch singlepage publish:gh-pages` to fetch the remote branch
- use `git branch --set-upstream gh-pages singlepage/publish && git checkout gh-pages;`
  This creates and checks out an orphan branch called gh-pages that tracks the original and lets you make changes.
- When you run `git push gh-pages:origin/gh-pages` it'll be live at *yourusername.github.io/repositoryName*

Now hop over to [Usage](#usage) to get it running with your own stuff!

**When you publish changes use `git push -u origin gh-pages`**

