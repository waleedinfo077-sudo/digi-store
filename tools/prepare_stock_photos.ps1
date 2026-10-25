$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$photoRows = @(
  @{ Slug = "gym-fitness"; Id = "photo-1534438327276-14e5300c3a48"; Alt = "Modern gym with weights and exercise equipment" },
  @{ Slug = "doctors-clinics"; Id = "photo-1622253692010-333f2da6031d"; Alt = "Doctor in a bright, modern healthcare clinic" },
  @{ Slug = "hospitals-pharmacies"; Id = "photo-1586773860418-d37222d8fce3"; Alt = "Bright, modern hospital and healthcare building" },
  @{ Slug = "dentists"; Id = "photo-1606811971618-4486d14f3f99"; Alt = "Modern dental care room and equipment" },
  @{ Slug = "primary-schools"; Id = "photo-1503454537195-1dcabb73ffb9"; Alt = "Young schoolchildren learning together" },
  @{ Slug = "high-schools-academies"; Id = "photo-1509062522246-3755977927d7"; Alt = "Bright classroom ready for a school lesson" },
  @{ Slug = "universities-coaching"; Id = "photo-1562774053-701939374585"; Alt = "University campus with classic academic architecture" },
  @{ Slug = "shops-retail"; Id = "photo-1483985988355-763728e1935b"; Alt = "Friends browsing a contemporary fashion collection" },
  @{ Slug = "ecommerce-stores"; Id = "photo-1441986300917-64674bd600d8"; Alt = "Curated products in a contemporary retail store" },
  @{ Slug = "cars-showrooms"; Id = "photo-1492144534655-ae79c964c9d7"; Alt = "Modern car photographed outside in natural light" },
  @{ Slug = "real-estate"; Id = "photo-1600607687939-ce8a6c25118c"; Alt = "Contemporary home with warm light and garden views" },
  @{ Slug = "restaurants-cafes"; Id = "photo-1517248135467-4c7edcad34c4"; Alt = "Welcoming restaurant interior set for dinner" },
  @{ Slug = "salons-spas-barbers"; Id = "photo-1560066984-138dadb4c035"; Alt = "Light-filled modern hair and beauty salon" },
  @{ Slug = "law-firms-consultants"; Id = "photo-1521791136064-7986c2920216"; Alt = "Professionals discussing a project around a table" },
  @{ Slug = "photography-studios"; Id = "photo-1516035069371-29a1b244cc32"; Alt = "Professional camera ready for a photography session" },
  @{ Slug = "hotels-travel-tours"; Id = "photo-1566073771259-6a8506099945"; Alt = "Inviting hotel with a pool and green garden" },
  @{ Slug = "portfolios-freelancers"; Id = "photo-1498050108023-c5249f4df085"; Alt = "Creative workspace with a laptop and design tools" },
  @{ Slug = "construction-interior"; Id = "photo-1504307651254-35680f356dfd"; Alt = "Construction professionals working on a building project" },
  @{ Slug = "events-weddings"; Id = "photo-1519741497674-611481863552"; Alt = "Elegant wedding reception decorated with flowers" },
  @{ Slug = "agencies-startups"; Id = "photo-1521737711867-e3b97375f902"; Alt = "Creative team collaborating around a studio table" }
)
$productRows = @(
  @{ Name = "Everyday sneakers"; Id = "photo-1542291026-7eec264c27ff"; Alt = "Colorful everyday sneaker" },
  @{ Name = "Classic wristwatch"; Id = "photo-1523275335684-37898b6baf30"; Alt = "Minimal wristwatch product photograph" },
  @{ Name = "Modern fashion"; Id = "photo-1529139574466-a303027c1d8b"; Alt = "Modern clothing and fashion styling" },
  @{ Name = "Leather carryall"; Id = "photo-1548036328-c9fa89d128fa"; Alt = "Leather handbag displayed in soft light" }
)
$imageDir = Join-Path $root "assets\images\categories"
New-Item -ItemType Directory -Path $imageDir -Force | Out-Null
$photoBySlug = @{}
foreach ($row in $photoRows) {
  $destination = Join-Path $imageDir "$($row.Slug).webp"
  $url = "https://images.unsplash.com/$($row.Id)?auto=format&fit=crop&w=1280&h=900&q=72&fm=webp"
  $result = & curl.exe --fail --location --silent --show-error --max-time 60 --output $destination --write-out "%{http_code}|%{content_type}" $url
  if ($LASTEXITCODE -ne 0 -or "$result" -notmatch "^200\|image/webp$" -or (Get-Item $destination).Length -lt 10000) {
    throw "Could not download the local WebP photo for $($row.Slug): $result"
  }
  $photoBySlug[$row.Slug] = $row
}
$storePhoto = Join-Path $root "assets\images\store-workspace.webp"
$storeUrl = "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1280&h=900&q=72&fm=webp"
$storeResult = & curl.exe --fail --location --silent --show-error --max-time 60 --output $storePhoto --write-out "%{http_code}|%{content_type}" $storeUrl
if ($LASTEXITCODE -ne 0 -or "$storeResult" -notmatch "^200\|image/webp$" -or (Get-Item $storePhoto).Length -lt 10000) {
  throw "Could not download the Digi Store hero photo: $storeResult"
}
$productImageDir = Join-Path $root "assets\images\products"
New-Item -ItemType Directory -Path $productImageDir -Force | Out-Null
foreach ($product in $productRows) {
  $destination = Join-Path $productImageDir "$($product.Id.Replace('photo-', '')).webp"
  $url = "https://images.unsplash.com/$($product.Id)?auto=format&fit=crop&w=700&h=700&q=72&fm=webp"
  $result = & curl.exe --fail --location --silent --show-error --max-time 60 --output $destination --write-out "%{http_code}|%{content_type}" $url
  if ($LASTEXITCODE -ne 0 -or "$result" -notmatch "^200\|image/webp$" -or (Get-Item $destination).Length -lt 5000) {
    throw "Could not download local WebP product photo $($product.Id): $result"
  }
}

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$catalogPath = Join-Path $root "templates.json"
$catalog = Get-Content -Path $catalogPath -Raw | ConvertFrom-Json
foreach ($item in $catalog) {
  $photo = $photoBySlug[$item.category]
  $safeName = [System.Net.WebUtility]::HtmlEncode($item.name)
  $safeCategory = [System.Net.WebUtility]::HtmlEncode($item.categoryName)
  $primary = $item.colors[0]
  $secondary = $item.colors[1]
  $photoPath = "../../../assets/images/categories/$($item.category).webp"
  $thumb = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" role="img" aria-label="$safeName website design">
  <defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".2" stop-color="#111" stop-opacity=".02"/><stop offset="1" stop-color="#111" stop-opacity=".78"/></linearGradient></defs>
  <image href="$photoPath" width="800" height="500" preserveAspectRatio="xMidYMid slice"/>
  <rect width="800" height="500" fill="$primary" opacity=".13"/>
  <rect width="800" height="500" fill="url(#shade)"/>
  <rect x="38" y="34" width="124" height="31" rx="15" fill="$secondary" opacity=".94"/>
  <text x="57" y="55" fill="$primary" font-family="Arial,sans-serif" font-size="13" font-weight="700">$safeCategory</text>
  <text x="48" y="408" fill="#fff" font-family="Arial,sans-serif" font-size="39" font-weight="700">$safeName</text>
  <text x="51" y="445" fill="#fff" font-family="Arial,sans-serif" font-size="16" opacity=".9">A thoughtful website, ready to explore</text>
</svg>
"@
  $designDir = Join-Path $root (Split-Path $item.previewPath -Parent)
  [System.IO.File]::WriteAllText((Join-Path $designDir "thumb.svg"), $thumb, $utf8NoBom)

  $htmlPath = Join-Path $root $item.previewPath
  $html = [System.IO.File]::ReadAllText($htmlPath)
  $html = $html.Replace('src="./hero-art.svg"', "src=`"$photoPath`"")
  $html = [System.Text.RegularExpressions.Regex]::Replace(
    $html,
    'alt="(?:Custom abstract illustration|A colorful abstract illustration) for [^"]+"',
    ('alt="' + $photo.Alt + '"')
  )
  $gallery = @"
<div class="gallery-photo"><img src="$photoPath" alt="$($photo.Alt)" width="1280" height="900" loading="lazy"><b>Made for the everyday</b></div><div class="gallery-photo"><img src="$photoPath" alt="$($photo.Alt)" width="1280" height="900" loading="lazy"><b>Room to grow</b></div><div class="gallery-photo"><img src="$photoPath" alt="$($photo.Alt)" width="1280" height="900" loading="lazy"><b>Simply considered</b></div>
"@
  $html = [System.Text.RegularExpressions.Regex]::Replace(
    $html,
    '<div class="gallery"><div><b>Made for the everyday</b></div><div><b>Room to grow</b></div><div><b>Simply considered</b></div></div>',
    ('<div class="gallery">' + $gallery + '</div>')
  )
  if ($item.category -in @("shops-retail", "ecommerce-stores")) {
    $productPattern = '<div class=["'']product-art["'']>\*</div>'
    $productMatches = [System.Text.RegularExpressions.Regex]::Matches($html, $productPattern)
    if ($productMatches.Count -ne $productRows.Count) {
      throw "Expected four product images in the shop demo $($item.id), found $($productMatches.Count)."
    }
    $builder = [System.Text.StringBuilder]::new()
    $position = 0
    foreach ($index in 0..($productRows.Count - 1)) {
      $match = $productMatches[$index]
      [void]$builder.Append($html.Substring($position, $match.Index - $position))
      $product = $productRows[$index]
      $productFile = $product.Id.Replace("photo-", "")
      [void]$builder.Append("<div class=`"product-art`"><img src=`"../../../assets/images/products/$productFile.webp`" alt=`"$($product.Alt)`" width=`"700`" height=`"700`" loading=`"lazy`"></div>")
      $position = $match.Index + $match.Length
    }
    [void]$builder.Append($html.Substring($position))
    $html = $builder.ToString()
    if (-not $html.Contains(".product-art img{")) {
      $html = $html.Replace(".product-art{height:130px;", ".product-art{height:130px;overflow:hidden;")
      $html = $html.Replace(".product-art{height:110px}", ".product-art{height:110px;overflow:hidden}")
      $html = $html.Replace(".product-art{", ".product-art img{width:100%;height:100%;object-fit:cover;border-radius:8px}.product-art{")
    }
  }
  if (-not $html.Contains(".gallery div img{")) {
    $html = $html.Replace(
      '.gallery div:before{',
      '.gallery div img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;transition:transform .45s}.gallery div:hover img{transform:scale(1.045)}.gallery div:after{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(0deg,rgba(15,16,22,.76),rgba(15,16,22,.03) 75%)}.gallery div:before{display:none}.gallery div:before{'
    )
    $html = $html.Replace('.gallery b{z-index:1;', '.gallery b{z-index:2;color:#fff;text-shadow:0 1px 7px rgba(0,0,0,.35);')
  }
  [System.IO.File]::WriteAllText($htmlPath, $html, $utf8NoBom)
}
[System.IO.File]::WriteAllText($catalogPath, ($catalog | ConvertTo-Json -Depth 10), $utf8NoBom)
Write-Output "Saved 25 local, optimized Unsplash WebP photos; updated all 60 designs, product cards, and photo thumbnails."
