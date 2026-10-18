# publish.ps1 - ASCII-only on purpose: Windows PowerShell 5.1 and pwsh 7+ parse it identically.
# All file I/O touching UTF-8 content goes through Node (encoding-safe by design), so the
# system ANSI codepage (e.g. GBK on zh-CN Windows) can never corrupt the SVG/JSON payloads.
# Steps: 1) inject icon into package.json  2) git commit + push  3) GitHub About topics.
$ErrorActionPreference = "Continue"
Set-Location -LiteralPath $PSScriptRoot

# --- 1) icon -> package.json (Node handles UTF-8 natively) ---
node add-icon.mjs
if ($LASTEXITCODE -ne 0) { throw "add-icon.mjs failed" }

# --- 2) git: init (if needed), force branch main, commit, push ---
if (-not (git config user.name))  { git config user.name  "TIUCSIB" }
if (-not (git config user.email)) { git config user.email "TIUCSIB@users.noreply.github.com" }
git init | Out-Null
git symbolic-ref HEAD refs/heads/main
git add -A
git commit -m "feat: magpie/OpenCode provider plugin for bilibili Index-Translate"
git log --oneline -1
$remotes = @(git remote)
if ($remotes -contains "origin") { git remote remove origin }
git remote add origin https://github.com/TIUCSIB/magpie-biliTranslate.git
git push -u origin main
if ($LASTEXITCODE -ne 0) { throw "git push failed - run: gh auth login, then re-run this script" }

# --- 3) About: description + topics (magpie-plugin lists the repo under
#        magpie -> plugins -> discover -> unofficial plugins (GitHub)) ---
gh repo edit TIUCSIB/magpie-biliTranslate `
  --description "Bilibili Index-Translate free public translation API as a magpie/OpenCode provider plugin - anonymous, free, no key" `
  --add-topic magpie-plugin --add-topic opencode-plugin --add-topic opencode `
  --add-topic magpie --add-topic bilibili --add-topic translation `
  --add-topic index-translate --add-topic llm
if ($LASTEXITCODE -eq 0) { Write-Host "TOPICS_OK" } else { Write-Host "TOPICS_FAILED - run: gh auth login, then re-run this script" }
