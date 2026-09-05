# Kai Monno — Portfolio

Single-page personal portfolio site. Plain HTML/CSS/JS, no build step, no framework — deploys to Vercel as a static site with zero configuration.

## Structure

```
index.html       Page markup (hero, about, projects, experience, skills, resume, footer)
css/styles.css   All styling (responsive, light/dark aware)
js/script.js     Small progressive-enhancement scroll animation (optional)
resume.pdf       Downloadable resume — replace this file to update it
vercel.json      Clean URLs / no trailing slash
```

## Updating the resume

To swap in a new resume, overwrite `resume.pdf` at the project root with a file of the same name, then redeploy.

## Local preview

No build step needed — open `index.html` directly in a browser, or serve it locally:

```bash
npx serve .
```

## Deploy

See deployment instructions provided separately, or run:

```bash
npx vercel
```

from the project root and follow the prompts to link it to your own Vercel account.
