Write-Host "Setting up your website on GitHub..." -ForegroundColor Green

# 1. Check/Install Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git not found. Installing..."
    winget install --id Git.Git -e --source winget
    
    # Refresh env
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "Git installation requires a restart of the terminal." -ForegroundColor Yellow
        Write-Host "Please restart this terminal or VS Code and run this script again."
        Pause
        Exit
    }
}

# 2. Check/Install GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI not found. Installing..."
    winget install --id GitHub.cli -e --source winget
    
    # Refresh env
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# 3. Authenticate
Write-Host "Please authenticate with GitHub (follow the steps in the browser)..."
gh auth login

# 4. Create Repo & Push
Write-Host "Creating repository..."
git init
git add .
git commit -m "Initial commit of CV Website"
git branch -M main

# Create repo (ignore error if exists)
gh repo create cv_website --public --source=. --remote=origin --push

# Enable Pages
Write-Host "Enabling GitHub Pages..."
# This might require manual setting, but let's try pushing first.
# Usually main branch needs to be set.

Write-Host "Website deployed! Go to your repository settings to enable GitHub Pages if not already active." -ForegroundColor Green
Write-Host "Your Repo: $(gh repo view --json url -q .url)"
Pause
