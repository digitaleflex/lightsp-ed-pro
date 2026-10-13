# Réparation ciblée : rattacher les 8 milestones M0-M7 aux 34 issues IA (#21-#54)
# sur digitaleflex/lightsp-ed-pro. Idempotent, aucune création d'issue.
#
# Cause du bug d'origine : ConvertFrom-Json sous PowerShell 5.1 échoue sur la sortie
# multi-lignes de `gh api` (tableau de strings au lieu d'une seule string JSON).
# Fix : utiliser `gh api --jq '.[] | [.number, .title] | @tsv'` pour un parsing fiable.
#
# Astuce 2 : on matche les milestones par PRÉFIXE ("M0", "M1", ...) et non par titre
# exact, pour éviter tout souci d'encodement (em dash vs hyphen).

$ErrorActionPreference = 'Stop'
$Repo = 'digitaleflex/lightsp-ed-pro'

Write-Host "==> Récupération milestones"
$msLines = & gh api "repos/$Repo/milestones?state=all&per_page=100" --jq '.[] | [.number, .title] | @tsv'
$msByPrefix = @{}  # prefix "M0".."M7" -> number
foreach ($line in $msLines) {
    if ($line -match "^(\d+)\t(M[0-7])") {
        $msByPrefix[$Matches[2]] = [int]$Matches[1]
    }
}
if ($msByPrefix.Count -eq 0) { throw "Aucun milestone trouvé" }
Write-Host "    $($msByPrefix.Count) milestones trouvés"
foreach ($kv in $msByPrefix.GetEnumerator()) { Write-Host "      [$($kv.Value)] $($kv.Key)" }

Write-Host "==> Récupération issues ouvertes (préfixe Mx-y)"
$issueLines = & gh issue list --repo $Repo --state open --limit 200 --json number,title --jq '.[] | [.number, .title] | @tsv'
$aiIssues = @()
foreach ($line in $issueLines) {
    if ($line -match "^(\d+)\t(M[0-7])-[0-9]+") {
        $aiIssues += [pscustomobject]@{
            number = [int]$Matches[1]
            title  = $Matches[0] -replace "^\d+\t", ''
            prefix = $Matches[2]
        }
    }
}
Write-Host "    $($aiIssues.Count) issues IA détectées"

$fixed = 0; $already = 0; $failed = 0
foreach ($issue in $aiIssues) {
    $msNumber = $msByPrefix[$issue.prefix]
    if (-not $msNumber) { Write-Host "    [FAIL] #$($issue.number) — milestone $($issue.prefix) introuvable"; $failed++; continue }

    # Vérifie si déjà attaché
    $detailJson = & gh issue view $issue.number --repo $Repo --json milestone --jq '.milestone.number'
    if ($detailJson -and ([int]$detailJson -eq $msNumber)) {
        Write-Host "    [OK]   #$($issue.number) déjà sur $($issue.prefix) (milestone #$msNumber)"
        $already++
        continue
    }

    # Attachement via l'API REST
    & gh api -X PATCH "repos/$Repo/issues/$($issue.number)" -f "milestone=$msNumber" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    [FIX]  #$($issue.number) $($issue.title) -> $($issue.prefix) (milestone #$msNumber)"
        $fixed++
    } else {
        Write-Host "    [FAIL] #$($issue.number) $($issue.title) — échec PATCH"
        $failed++
    }
}

Write-Host ""
Write-Host "==> Terminé : $fixed fixée(s), $already déjà OK, $failed échec(s)"

Write-Host ""
Write-Host "==> Vérification finale (open_issues par milestone)"
& gh api "repos/$Repo/milestones?state=all&per_page=100" --jq '.[] | [.title, .open_issues, .closed_issues] | @tsv' 2>&1 | ForEach-Object {
    $parts = $_ -split "`t"
    Write-Host ("    {0} — {1} open / {2} closed" -f $parts[0], $parts[1], $parts[2])
}
