$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$port = 4173
$prefix = "http://127.0.0.1:$port/"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$contentTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".svg" = "image/svg+xml"
  ".png" = "image/png"
}

function Resolve-SafePath {
  param([string] $RequestPath)

  $relativePath = [Uri]::UnescapeDataString($RequestPath.Split("?")[0].TrimStart("/"))
  if ([string]::IsNullOrWhiteSpace($relativePath)) {
    $relativePath = "index.html"
  }

  $target = Join-Path $root $relativePath
  $resolved = Resolve-Path -LiteralPath $target -ErrorAction SilentlyContinue
  if (-not $resolved) {
    return $null
  }

  $fullPath = $resolved.Path
  if (-not $fullPath.StartsWith($root) -or -not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
    return $null
  }

  return $fullPath
}

$listener.Start()
Write-Host "Memo Desk local server: $prefix"
Write-Host "Stop: Ctrl+C"

while ($listener.IsListening) {
  $context = $listener.GetContext()

  try {
    $filePath = Resolve-SafePath $context.Request.Url.PathAndQuery

    if ($filePath) {
      $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
      $context.Response.ContentType = if ($contentTypes.ContainsKey($extension)) {
        $contentTypes[$extension]
      } else {
        "application/octet-stream"
      }

      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $context.Response.StatusCode = 200
    } else {
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $context.Response.ContentType = "text/plain; charset=utf-8"
      $context.Response.StatusCode = 404
    }

    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
  } finally {
    $context.Response.Close()
  }
}
