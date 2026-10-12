$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectPath = Split-Path -Parent $PSScriptRoot
foreach ($iconSize in @(192,512)) {
  $bitmap = New-Object System.Drawing.Bitmap($iconSize,$iconSize)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.ScaleTransform($iconSize/192.0,$iconSize/192.0)
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#ed7446'))
  $pin = New-Object System.Drawing.Drawing2D.GraphicsPath
  $pin.AddBezier(96,30,67,30,47,52,47,79)
  $pin.AddBezier(47,79,47,115,96,153,96,153)
  $pin.AddBezier(96,153,96,153,145,115,145,79)
  $pin.AddBezier(145,79,145,52,125,30,96,30)
  $graphics.FillPath([System.Drawing.Brushes]::White,$pin)
  $compassBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#36644e'))
  $points = [System.Drawing.PointF[]]@((New-Object System.Drawing.PointF(74,100)),(New-Object System.Drawing.PointF(87,62)),(New-Object System.Drawing.PointF(121,78)),(New-Object System.Drawing.PointF(106,112)))
  $graphics.FillPolygon($compassBrush,$points)
  $graphics.FillEllipse([System.Drawing.Brushes]::White,89,80,14,14)
  $bitmap.Save((Join-Path $projectPath "assets\icon-$iconSize.png"),[System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose(); $bitmap.Dispose(); $pin.Dispose(); $compassBrush.Dispose()
}
Write-Output 'Generated local PWA icons (192px and 512px).'
