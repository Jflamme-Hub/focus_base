Add-Type -AssemblyName System.Drawing
$basePath = "C:\Users\jennl\Documents\agent files"
$sourceIcon = "$basePath\app_icon.png"

# Check if original image exists
if (-not (Test-Path $sourceIcon)) {
    Write-Host "Source image not found"
    exit
}

$img = [System.Drawing.Image]::FromFile($sourceIcon)

# Ensure app_icon_512.png is exactly 512x512
$bmp512 = New-Object System.Drawing.Bitmap(512, 512)
$g512 = [System.Drawing.Graphics]::FromImage($bmp512)
$g512.DrawImage($img, 0, 0, 512, 512)
$bmp512.Save("$basePath\app_icon_512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g512.Dispose()
$bmp512.Dispose()

# Create app_icon_192.png
$bmp192 = New-Object System.Drawing.Bitmap(192, 192)
$g192 = [System.Drawing.Graphics]::FromImage($bmp192)
$g192.DrawImage($img, 0, 0, 192, 192)
$bmp192.Save("$basePath\app_icon_192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$g192.Dispose()
$bmp192.Dispose()

# Create screenshot_narrow.png (1080x1920)
$bmpNarrow = New-Object System.Drawing.Bitmap(1080, 1920)
$gNarrow = [System.Drawing.Graphics]::FromImage($bmpNarrow)
$gNarrow.Clear([System.Drawing.Color]::White)
$gNarrow.DrawImage($img, 284, 704, 512, 512)
$bmpNarrow.Save("$basePath\screenshot_narrow.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gNarrow.Dispose()
$bmpNarrow.Dispose()

# Create screenshot_wide.png (1920x1080)
$bmpWide = New-Object System.Drawing.Bitmap(1920, 1080)
$gWide = [System.Drawing.Graphics]::FromImage($bmpWide)
$gWide.Clear([System.Drawing.Color]::White)
$gWide.DrawImage($img, 704, 284, 512, 512)
$bmpWide.Save("$basePath\screenshot_wide.png", [System.Drawing.Imaging.ImageFormat]::Png)
$gWide.Dispose()
$bmpWide.Dispose()

$img.Dispose()
Write-Host "Images generated successfully."
