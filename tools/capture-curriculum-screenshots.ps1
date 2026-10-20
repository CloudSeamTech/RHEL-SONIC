# Run on your OWN Windows lab workstation. No admin rights or remote execution.
# Captures only the rectangle you explicitly select; no automatic capture/upload.
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$LessonId,
  [string]$Checklist = (Join-Path $PSScriptRoot '..\content\screenshots\coverage.json'),
  [string]$OutputDirectory = (Join-Path $env:USERPROFILE 'Pictures\SONIC-Lab-Captures')
)
$ErrorActionPreference = 'Stop'
if ($env:OS -ne 'Windows_NT') { throw 'Run this script on your Windows lab workstation.' }
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$manifest = Get-Content -LiteralPath $Checklist -Raw | ConvertFrom-Json
$steps = @($manifest.steps | Where-Object { $_.lessonId -eq $LessonId })
if ($steps.Count -eq 0) { throw "No screenshot requirements found for $LessonId" }
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
Write-Host 'Keep passwords, keys, tokens, and personal data outside every capture.'
Write-Host 'Only capture your own authorized lab. Nothing is uploaded by this script.'
foreach ($step in $steps) {
  Write-Host "`n$($step.stepId): $($step.title)" -ForegroundColor Cyan
  Write-Host "WHERE: $($step.where)"
  Write-Host "DO: $($step.actions)"
  Write-Host "EXPECTED: $($step.expected)"
  $choice = Read-Host 'Complete the action in your lab, then enter C to select a screenshot, S to skip, or Q to quit'
  if ($choice -eq 'Q') { break }
  if ($choice -ne 'C') { continue }
  [System.Windows.Forms.Clipboard]::Clear()
  Start-Process 'ms-screenclip:'
  [void](Read-Host 'Select only the relevant lab window area in Snipping Tool, then return here and press Enter')
  if (-not [System.Windows.Forms.Clipboard]::ContainsImage()) { Write-Warning 'No screenshot on clipboard; this step remains missing.'; continue }
  $image = [System.Windows.Forms.Clipboard]::GetImage()
  try {
    if ($image.Width -lt 600 -or $image.Height -lt 300) { Write-Warning 'Capture is too small to read; select a larger area next time.'; continue }
    $path = Join-Path $OutputDirectory $step.expectedFilename
    if (Test-Path -LiteralPath $path) {
      if ((Read-Host 'A capture exists for this step. Enter REPLACE to overwrite') -ne 'REPLACE') { continue }
    }
    $image.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "Saved: $path"
    Write-Host 'Review the image for accuracy and secrets before sharing the collection.'
  } finally { $image.Dispose() }
}
Write-Host "Capture folder: $OutputDirectory"
