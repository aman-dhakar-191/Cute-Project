# 💕 Love Shower Game — GitHub Pages Deploy

## Setup Steps

### 1. Create a GitHub repo
Go to github.com → New repository → name it anything (e.g. `love-shower-game`)

### 2. Add your files
Your repo root should look like this:
```
/
├── index.html                   ← rename love-shower-game.html to this
└── .github/
    └── workflows/
        └── deploy.yml           ← this file
```
> ⚠️ The file MUST be named `index.html` — GitHub Pages serves the root index.

### 3. Enable GitHub Pages
- Go to repo **Settings → Pages**
- Under **Source** select **GitHub Actions**
- Save

### 4. Push to main
```bash
git init
git add .
git commit -m "Add love shower game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 5. Done! 🎉
GitHub Actions will run automatically. Your game will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```
Check progress under the **Actions** tab in your repo.
