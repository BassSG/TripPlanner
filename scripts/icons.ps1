$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectPath = Split-Path -Parent $PSScriptRoot
$assetPath = Join-Path $projectPath 'assets'
$culture = [System.Globalization.CultureInfo]::InvariantCulture
$utf8 = New-Object System.Text.UTF8Encoding($false)
$markText = [System.IO.File]::ReadAllText((Join-Path $assetPath 'brand-mark.svg'))

# Rasterize the same SVG geometry used in the web/GAS UI; no separate icon design.
function Convert-ShapePath([string]$data) {
  $shape = New-Object System.Drawing.Drawing2D.GraphicsPath
  $tokens = [regex]::Matches($data, '[MLCZ]|-?(?:\d+\.?\d*|\.\d+)')
  $index = 0; $currentX = 0.0; $currentY = 0.0
  while ($index -lt $tokens.Count) {
    $command = $tokens[$index++].Value
    switch ($command) {
      'M' { $currentX = [float]::Parse($tokens[$index++].Value,$culture); $currentY = [float]::Parse($tokens[$index++].Value,$culture); $shape.StartFigure() }
      'L' { $nextX = [float]::Parse($tokens[$index++].Value,$culture); $nextY = [float]::Parse($tokens[$index++].Value,$culture); $shape.AddLine($currentX,$currentY,$nextX,$nextY); $currentX=$nextX; $currentY=$nextY }
      'C' {
        $values = @(); for ($part=0; $part -lt 6; $part++) { $values += [float]::Parse($tokens[$index++].Value,$culture) }
        $shape.AddBezier($currentX,$currentY,$values[0],$values[1],$values[2],$values[3],$values[4],$values[5]); $currentX=$values[4]; $currentY=$values[5]
      }
      'Z' { $shape.CloseFigure() }
      default { throw "Unsupported SVG command: $command" }
    }
  }
  return ,$shape
}
function New-Brush([string]$value) { return New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($value)) }
function Draw-Mark($graphics,[string]$source) {
  $document = [xml]$source
  foreach ($node in $document.DocumentElement.ChildNodes) {
    if ($node.LocalName -eq 'path') { $shape = Convert-ShapePath $node.GetAttribute('d') }
    elseif ($node.LocalName -eq 'circle') {
      $shape = New-Object System.Drawing.Drawing2D.GraphicsPath
      $radius = [float]::Parse($node.GetAttribute('r'),$culture)
      $shape.AddEllipse([float]::Parse($node.GetAttribute('cx'),$culture)-$radius,[float]::Parse($node.GetAttribute('cy'),$culture)-$radius,2*$radius,2*$radius)
    } else { continue }
    $fill = $node.GetAttribute('fill')
    if ($fill -and $fill -ne 'none') { $brush = New-Brush $fill; $graphics.FillPath($brush,$shape); $brush.Dispose() }
    $stroke = $node.GetAttribute('stroke')
    if ($stroke -and $stroke -ne 'none') {
      $pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($stroke),[float]::Parse($node.GetAttribute('stroke-width'),$culture))
      if ($node.GetAttribute('stroke-linecap') -eq 'round') { $pen.StartCap = $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round }
      $graphics.DrawPath($pen,$shape); $pen.Dispose()
    }
    $shape.Dispose()
  }
}
function Export-Path($shape) {
  $parts = New-Object System.Collections.Generic.List[string]
  $points=$shape.PathPoints; $types=$shape.PathTypes
  for ($index=0; $index -lt $points.Count; $index++) {
    $type=$types[$index] -band 7
    if ($type -eq 0) { $parts.Add('M') }
    elseif ($type -eq 1) { $parts.Add('L') }
    elseif ($type -eq 3) {
      $parts.Add('C')
      for ($part=0; $part -lt 2; $part++) {
        $parts.Add($points[$index].X.ToString('0.###',$culture)); $parts.Add($points[$index].Y.ToString('0.###',$culture)); $index++
      }
    }
    $parts.Add($points[$index].X.ToString('0.###',$culture)); $parts.Add($points[$index].Y.ToString('0.###',$culture))
    if ($types[$index] -band 128) { $parts.Add('Z') }
  }
  return $parts -join ' '
}
$markBody = [regex]::Replace($markText,'(?s)^.*?<svg[^>]*>|</svg>\s*$','').Trim()
$iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0d1625"/>'+$markBody+'</svg>'
[System.IO.File]::WriteAllText((Join-Path $assetPath 'icon.svg'),$iconSvg+"`n",$utf8)
[System.IO.File]::WriteAllText((Join-Path $assetPath 'logo-monochrome.svg'),[regex]::Replace($markText,'#[0-9a-fA-F]{6}','#ffffff'),$utf8)

# Outlined letters keep the wordmark identical without a font dependency.
$letterPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$letterPath.AddString('TripPlanner',(New-Object System.Drawing.FontFamily('Segoe UI')),[int][System.Drawing.FontStyle]::Bold,34,(New-Object System.Drawing.PointF(67,8)),[System.Drawing.StringFormat]::GenericTypographic)
$letterSvg = Export-Path $letterPath
$wordmarkWidth = [int][Math]::Ceiling($letterPath.GetBounds().Right + 5)
foreach ($variant in @('dark','light')) {
  $wordColor = if ($variant -eq 'dark') { '#dce5f0' } else { '#1a2c43' }
  $wordmarkSvg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+$wordmarkWidth+' 64">'+$markBody+'<path d="'+$letterSvg+'" fill="'+$wordColor+'"/></svg>'
  [System.IO.File]::WriteAllText((Join-Path $assetPath "logo-wordmark-$variant.svg"),$wordmarkSvg+"`n",$utf8)
  $wordBitmap = New-Object System.Drawing.Bitmap(($wordmarkWidth*4),256)
  $wordGraphics = [System.Drawing.Graphics]::FromImage($wordBitmap); $wordGraphics.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias; $wordGraphics.ScaleTransform(4,4)
  Draw-Mark $wordGraphics $markText; $wordBrush=New-Brush $wordColor; $wordGraphics.FillPath($wordBrush,$letterPath)
  $wordBitmap.Save((Join-Path $assetPath "logo-wordmark-$variant.png"),[System.Drawing.Imaging.ImageFormat]::Png)
  $wordBrush.Dispose(); $wordGraphics.Dispose(); $wordBitmap.Dispose()
}
$letterPath.Dispose()
foreach ($iconSize in @(16,32,48,180,192,512,1024)) {
  $bitmap = New-Object System.Drawing.Bitmap($iconSize,$iconSize)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.ScaleTransform($iconSize/64.0,$iconSize/64.0)
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#0d1625'))
  Draw-Mark $graphics $markText
  $bitmap.Save((Join-Path $projectPath "assets\icon-$iconSize.png"),[System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose(); $bitmap.Dispose()
}
$icoFile = [System.IO.File]::Create((Join-Path $assetPath 'favicon.ico'))
$writer = New-Object System.IO.BinaryWriter($icoFile)
$writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]3)
$offset=6+16*3; $payloads=@()
foreach ($iconSize in @(16,32,48)) {
  $bytes=[System.IO.File]::ReadAllBytes((Join-Path $assetPath "icon-$iconSize.png")); $payloads+=,$bytes
  $writer.Write([byte]$iconSize); $writer.Write([byte]$iconSize); $writer.Write([byte]0); $writer.Write([byte]0); $writer.Write([uint16]1); $writer.Write([uint16]32); $writer.Write([uint32]$bytes.Length); $writer.Write([uint32]$offset); $offset+=$bytes.Length
}
foreach ($bytes in $payloads) { $writer.Write([byte[]]$bytes) }; $writer.Dispose(); $icoFile.Dispose()
Write-Output 'Generated SVG/outlined wordmarks, PNG icons (16-1024), Apple icon and multi-size favicon from brand-mark.svg.'
