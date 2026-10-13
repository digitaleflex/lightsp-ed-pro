#requires -Version 5.1
<#
    dry-run-issues.ps1 — Validation visuelle SANS aucun appel à gh.

    Ce script "dot-source" create-issues.ps1 pour réutiliser les données
    ($Milestones, $Labels, $Issues). Grâce à la garde
    `$MyInvocation.InvocationName -ne '.'`, la logique de création n'est PAS lancée.

    Usage :
        pwsh -File .\scripts\dry-run-issues.ps1
        # ou (PowerShell 5.1)
        powershell -ExecutionPolicy Bypass -File .\scripts\dry-run-issues.ps1
#>

$ErrorActionPreference = 'Stop'

# Charge les données (aucune exécution réseau : fichier dot-sourcé).
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $scriptDir 'create-issues.ps1')

$repo = 'digitaleflex/lightsp-ed-pro'

Write-Host ''
Write-Host "======================================================================" -ForegroundColor Magenta
Write-Host " DRY-RUN — création des issues IA Velocita" -ForegroundColor Magenta
Write-Host " Repo cible : $repo" -ForegroundColor Magenta
Write-Host " AUCUN appel à gh n'est effectué par ce script." -ForegroundColor Magenta
Write-Host "======================================================================" -ForegroundColor Magenta

# --- Milestones ---
Write-Host ''
Write-Host "MILESTONES ($($Milestones.Count))" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
foreach ($m in $Milestones) {
    $count = ($Issues | Where-Object { $_.Milestone -eq $m.Code }).Count
    Write-Host ("  {0}  {1,-28}  ({2} issues)" -f $m.Code, $m.Title, $count) -ForegroundColor White
}

# --- Labels ---
Write-Host ''
Write-Host "LABELS ($($Labels.Count))" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray
foreach ($l in $Labels) {
    Write-Host ("  #{0,-6} {1}" -f $l.Color, $l.Name) -ForegroundColor White
}

# --- Issues ---
Write-Host ''
Write-Host "ISSUES ($($Issues.Count))" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray

$index = 0
foreach ($issue in $Issues) {
    $index++
    $milestone = $Milestones | Where-Object { $_.Code -eq $issue.Milestone }
    $color = 'White'
    switch ($issue.Effort) {
        'XS' { $color = 'DarkGray' }
        'S'  { $color = 'Green' }
        'M'  { $color = 'Yellow' }
        'L'  { $color = 'Cyan' }
        'XL' { $color = 'Red' }
    }
    Write-Host ("  [{0,2}/{1}] " -f $index, $Issues.Count) -NoNewline
    Write-Host ("{0,-6} " -f $issue.Id) -NoNewline -ForegroundColor $color
    Write-Host ("[{0,-2}] " -f $issue.Effort) -NoNewline -ForegroundColor $color
    Write-Host $issue.Title

    Write-Host ("            milestone : {0}" -f $milestone.Title) -ForegroundColor DarkGray
    Write-Host ("            labels    : {0}" -f ($issue.Labels -join ', ')) -ForegroundColor DarkGray

    $deps = [regex]::Matches($issue.Body, '#M\d+-\d+') | ForEach-Object { $_.Value } | Sort-Object -Unique
    if ($deps.Count -eq 0) {
        Write-Host "            dépend.   : (aucune)" -ForegroundColor DarkGray
    } else {
        Write-Host ("            dépend.   : {0}" -f ($deps -join ', ')) -ForegroundColor DarkGray
    }
}

# --- Validations ---
Write-Host ''
Write-Host "VALIDATIONS" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkGray

$checks = @()

# 1. Nombre d'issues
$checks += [pscustomobject]@{ Check = 'Total issues = 34'; Pass = ($Issues.Count -eq 34); Detail = "$($Issues.Count)" }
# 2. Nombre de milestones
$checks += [pscustomobject]@{ Check = 'Total milestones = 8 (M0–M7)'; Pass = ($Milestones.Count -eq 8); Detail = "$($Milestones.Count)" }
# 3. Sans doublon d'Id
$dupIds = ($Issues | Group-Object Id | Where-Object { $_.Count -gt 1 }).Name
$checks += [pscustomobject]@{ Check = 'Aucun Id dupliqué'; Pass = ($dupIds.Count -eq 0); Detail = ($dupIds -join ', ') }
# 4. Sans doublon de titre
$dupTitles = ($Issues | Group-Object Title | Where-Object { $_.Count -gt 1 }).Name
$checks += [pscustomobject]@{ Check = 'Aucun titre dupliqué'; Pass = ($dupTitles.Count -eq 0); Detail = ($dupTitles -join ', ') }
# 5. Chaque issue a 1 label d'effort cohérent
$effortLabels = @{ 'XS'='effort:XS (1h)'; 'S'='effort:S (0.5j)'; 'M'='effort:M (1j)'; 'L'='effort:L (2-3j)'; 'XL'='effort:XL (1 sem)' }
$badEffort = $Issues | Where-Object { $_.Labels -notcontains $effortLabels[$_.Effort] }
$checks += [pscustomobject]@{ Check = 'Label effort cohérent partout'; Pass = ($badEffort.Count -eq 0); Detail = ($badEffort.Id -join ', ') }
# 6. Toutes les dépendances pointent vers une issue existante
$ids = $Issues | ForEach-Object { $_.Id }
$refs = [regex]::Matches(($Issues | ForEach-Object { $_.Body }) -join "`n", '#M\d+-\d+') |
    ForEach-Object { $_.Value.Substring(1) } | Sort-Object -Unique
$danglingRefs = $refs | Where-Object { $ids -notcontains $_ }
$checks += [pscustomobject]@{ Check = 'Dépendances résolues (pas de #ref orpheline)'; Pass = ($danglingRefs.Count -eq 0); Detail = ($danglingRefs -join ', ') }
# 7. Toutes les issues couvrent bien M0..M7
$covered = $Issues.Milestone | Sort-Object -Unique
$checks += [pscustomobject]@{ Check = 'Milestones M0–M7 tous couverts'; Pass = ($covered.Count -eq 8); Detail = ($covered -join ', ') }

$allPassed = $true
foreach ($c in $checks) {
    if ($c.Pass) {
        Write-Host ("  [PASS] {0}" -f $c.Check) -ForegroundColor Green
    } else {
        $allPassed = $false
        Write-Host ("  [FAIL] {0}  -> {1}" -f $c.Check, $c.Detail) -ForegroundColor Red
    }
}

Write-Host ''
if ($allPassed) {
    Write-Host "DRY-RUN OK — 34 issues prêtes à être créées sur $repo." -ForegroundColor Green
    Write-Host "Pour créer réellement : pwsh -File .\scripts\create-issues.ps1" -ForegroundColor Yellow
} else {
    Write-Host "DRY-RUN EN ÉCHEC — corriger les points ci-dessus avant d'exécuter create-issues.ps1." -ForegroundColor Red
    exit 1
}
