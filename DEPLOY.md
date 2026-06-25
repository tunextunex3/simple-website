Deploy steps (Netlify):

1. Create a GitHub repo and push the project.
2. Sign into Netlify and connect the GitHub repository in "Sites > New site from Git".
3. Set build settings (none for static site) and deploy.
4. In Netlify site settings > Domain management, add a custom domain and enable "Enforce HTTPS".

Quick local push:

```powershell
cd "C:\Users\TUNEX\Desktop\WEBSITE TuNeX"
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```
