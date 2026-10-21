# AbPsych Study Hub
Static study site (Practice, Exam, Review, Slides, Summary, Cheat sheets). No build step.

## Run locally
    python3 -m http.server 3000     # then open http://localhost:3000
    # or: npx serve .

## Push to GitHub
    git init && git add . && git commit -m "Initial site"
    git branch -M main
    git remote add origin https://github.com/<you>/abpsych-study.git
    git push -u origin main

## Deploy on Vercel
vercel.com > Add New > Project > import the repo. Framework Preset: **Other**. Leave build command and output directory empty. Deploy.

## Add content
Edit `data.js`: add questions to a chapter's `q` list as `[question, [A,B,C,D], correctIndex, explanation]`. Add new chapters by copying a chapter block and dropping its PDF in `slides/`.
Verify questions against your source materials; the key is only as good as the data.
