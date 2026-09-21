# PixelLift AI ko live karna — step-by-step Hindi guide

Recommended demo setup: **GitHub par code → Neon par PostgreSQL → Render par website**.
Free plans ke current quotas ke andar ₹0 par demo chal sakta hai; permanent free,
unlimited use, instant startup ya production availability ki guarantee nahi hai.
Provider ke current plans aur account-verification requirements check karein.

## 1. Abhi GitHub ki “Create a new repository” screen par ho?

Screenshot jaisi settings rakhein:

| Field | Kya select karein |
|---|---|
| Repository name | `pixellift-ai` |
| Description | Optional; khaali chhod sakte hain |
| Visibility | Public = source sab dekh sakte hain. Source chhupana ho to Private. Dono se deploy ho sakta hai. |
| Add README | Off — project ka code pehle se bana hai |
| Add .gitignore | No .gitignore — project ki apni file upload hogi |
| Add license | No license — abhi chhod sakte hain |

Neeche **Create repository** dabayein. Agle page par khaali repository aur
**Quick setup** dikhna normal hai. Sirf repository banane se code upload ya
website live nahi hoti.

### Zaroori security correction

**GitHub token, password, OTP, ya database connection string chat mein mat bhejein.**
Pehle token chat mein bhejne wali salah galat thi; uski zaroorat nahi hai.
Agar koi token pehle share ho chuka hai, GitHub Settings → Developer settings →
Personal access tokens se use revoke/delete karein.

Authentication apne browser mein GitHub ke official login se karein. Render ko
GitHub se connect karte waqt sirf zaroori repository ka access dein.

## 2. Project ka source code GitHub par upload karein

Is editor mein bana project apne-aap aapke computer ya GitHub mein nahi aata.
Preview par tayyar kiya gaya source bundle `/downloads/pixellift-ai-source.zip`
se download karein. Ye download preview available rehne tak milega. Ismein
Render deploy ke liye code aur configuration hain; `.env`, Git history,
`node_modules`, database contents aur uploaded photos nahi hain.

### Screenshot mein “Quick setup” aa gaya? Browser se upload karein

1. Source ZIP download karein aur **Extract All / Extract** se unzip karein.
2. Extracted folder kholein jahan `package.json`, `render.yaml` aur `src/` dikhte hain.
3. GitHub ke **Quick setup** box mein **uploading an existing file** par click karein.
   Copilot ya Invite collaborators ki zaroorat nahi hai.
4. Extracted folder ke **andar ke saare files aur folders** upload area mein
   drag-and-drop karein. ZIP khud ya bahar wala parent folder upload na karein.
   `src/` ko folder hi rakhein, uske contents root mein alag-alag na daalein.
5. Hidden `.gitignore` file bhi include karein. Windows mein **View → Show → Hidden
   items**, macOS mein **Command + Shift + .** se hidden files dikha sakte hain.
6. Upload complete hone par summary likhein aur **Commit changes** se `main`
   branch mein save karein. Page refresh par root mein `package.json`, `render.yaml`
   aur `src/` dikhne chahiye. Tab code upload hua hai, website abhi deploy nahi hui.

Is chhote bundle mein GitHub ki 100-file browser upload limit se kam files hain,
aur har file 25 MiB se chhoti hai. Source changes ke baad maintainer
`python3 scripts/export-source.py` se ZIP dobara bana sakta hai; Render par
Python ya is script ko run karne ki zaroorat nahi hai.

Agar preview download available nahi hai, editor/platform ka source Export/Download
ya official GitHub integration use karein. Exact controls platform par depend karte hain.

### Alternative: GitHub Desktop

1. [GitHub Desktop](https://desktop.github.com/) install karke **Sign in to GitHub.com**
   se apne browser mein login karein. Chat mein koi credential share nahi karna.
2. **File → Clone repository** se apni abhi banayi `pixellift-ai` repository clone karein.
3. Download kiye project ke source files clone wale folder ke **andar** copy karein.
   Poora parent folder rakhne se bachein: `package.json` repo ke root par hona chahiye.
4. Export ki `.git` directory, `.env` files, `node_modules`, aur `.next` copy na karein.
   Clone ki apni `.git` directory ko replace/delete na karein.
5. `.gitignore`, `.env.example` (sirf placeholders), `src/`, `package.json`,
   `package-lock.json`, `render.yaml`, `drizzle.config.ts`, `next.config.ts`,
   TypeScript, ESLint aur PostCSS configuration files include karein.
6. GitHub Desktop mein **Changes** list review karein. Credentials nazar aayein to
   commit na karein. Summary likhein → **Commit to main** → **Push origin**.
7. GitHub repository page refresh karein. `src/`, `package.json` aur `render.yaml`
   dikhne chahiye — tab code upload hua hai.

> Browser se upload karte waqt `.gitignore` sensitive files ko automatically
> filter nahi karta. `.env`, tokens aur database passwords kabhi upload na karein.
> `.gitignore` bhi pehle se tracked secrets ko Git history se remove nahi karta.
> Secret accidentally push ho to use turant rotate/revoke karein.

## 3. Neon par free database banayein

1. [Neon](https://neon.tech/) par apne browser mein sign in karein.
2. Free plan mein ek **naya, dedicated project/database** banayein.
3. App server ke paas available region chunein.
4. **Connect** se PostgreSQL connection string copy karein. Neon jo SSL parameters
   deta hai unhe rehne dein.
5. Is secret ko sirf Render ke `DATABASE_URL` environment-variable field mein paste
   karein — source code, GitHub issue, chat ya public screenshot mein nahi.

Current storage aur compute quotas [Neon pricing](https://neon.tech/pricing) aur
apne dashboard mein check karein. Images database mein stored hain, isliye storage
usage monitor karna zaroori hai.

## 4. Render par free web service deploy karein

1. [Render](https://render.com/) par apne browser mein sign in karein.
2. **New → Blueprint** chunein aur `pixellift-ai` repository connect karein.
3. Blueprint `render.yaml` padhega. **Free** compute plan confirm karein.
4. Private environment-variable form mein `DATABASE_URL` = Neon connection string
   set karein, phir Blueprint deploy karein.
5. Build logs mein dependencies install, Next.js build aur Drizzle schema setup
   successful hone dein. Free plan mein `preDeployCommand` supported nahi hai;
   is project mein initial demo database setup **build command** mein rakha hai.
6. Service ready hone ke baad dashboard ka diya hua `https://…onrender.com` URL kholein.
   Naam available hone par depend karta hai; exact URL dashboard se lein.
7. Chhoti test image upscale karke result aur download check karein. `/api/health`
   par success response DB connectivity batata hai; image test poora flow verify karega.

### Database setup note

Build mein `drizzle-kit push` dedicated demo database par current schema sync karta hai.
Ismein destructive `--force` flag nahi diya gaya. Future mein schema badalne se pehle
backup aur migration review karein. Agar build schema approval par rukti hai, logs
review karke local authenticated environment mein change approve karein — warnings
ko blindly force na karein. Real production ke liye versioned migrations use karein.

## Free hosting ki limits

- Render free web service 15 minute bina traffic ke idle hone par sleep hoti hai.
  Agli request par wake-up lagbhag ek minute le sakta hai. Normal cold start ko accept
  karein; artificial keep-alive pings se free quotas kharch hote hain aur always-on
  availability ki guarantee nahi milti.
- Free workspace ke instance-hours, bandwidth aur build-minute quotas hain.
  Usage limit par suspension ya billing behavior provider settings par depend karta hai.
- `render.yaml` mein upload 6MB, output longest-side target 4096px aur latest 12 jobs
  rakhe gaye hain. Compressed image size decoded memory use nahi batata; complex/badi
  images ya simultaneous jobs phir bhi free server ki RAM se zyada ho sakte hain.
- Render free PostgreSQL **30 din baad expire** hota hai; upgrade grace period ke baad
  data delete ho sakta hai. Is guide mein database Neon par hai.
- Render ka free subdomain milta hai. Custom domain kharidne ki cost alag hoti hai.
- App ki gallery abhi **shared aur unauthenticated** hai. Public demo mein private
  ya sensitive photos upload na karein. Public/private GitHub repository selection
  app ki image privacy ya access control ko change nahi karta.
- Production traffic se pehle authentication, per-user data access, abuse/rate limits,
  backups aur resource planning chahiye. Free-tier configuration inka replacement nahi hai.

## Agar atko

| Screen / problem | Agla check |
|---|---|
| GitHub par Quick setup dikh raha hai | Repo abhi khaali hai; Step 2 mein source upload karein |
| Render ko `render.yaml` nahi mil raha | File committed branch ke root mein honi chahiye |
| `npm ci` fail hota hai | `package-lock.json` upload hua hai aur package versions se match karta hai |
| Database connection error | Render mein `DATABASE_URL` set hai aur Neon project reachable hai |
| Page khul raha, upload fail | Build/schema logs aur actual processing error check karein |
| Pehla visit slow | Free service ka cold start ho sakta hai |
| Memory error | Chhoti dimensions/scale try karein; free RAM limited hai |

Screenshot ya logs share karne se pehle credentials aur connection strings hide karein.

## Official references

- [GitHub: Adding locally hosted code](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github)
- [Render: Deploy for Free](https://render.com/docs/free)
- [Render: deploy commands and paid pre-deploy support](https://render.com/docs/deploys#pre-deploy-command)
- [Neon: current plans](https://neon.tech/pricing)
