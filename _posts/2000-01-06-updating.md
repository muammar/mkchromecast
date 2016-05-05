---
title: "updating"
bg: purple
color: white
fa-icon: cloud-upload
---

## Updating

So you've got a copy running and there's some new update? Let's update!

1. Checkout your github-pages branch
  - `git checkout gh-pages` for a standalone or existing page
  - `git checkout master` for a *username.github.io* page
2. run `git remote | grep -q "singlepage" || git remote add -t publish singlepage https://github.com/t413/SinglePaged.git` to be sure you have access to this repository (you can run this command at any time).
2. `git fetch singlepage` to fetch-in-place new changes.
3. Update to the new base (using merge)
    1. `git merge singlepage/publish`
4. You can alternatively update using rebase. This *rewrites history* (**bad**), but it is cleaner.
    1. `git rebase singlepage/publish`
