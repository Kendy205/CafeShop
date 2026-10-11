$modules = @("Auth", "Cart", "Category", "Dashboard", "News", "Product", "Role", "Order", "Voucher")

$directories = @(
    "d:\hoc tap\PTPMMNM\BE_2\CafeShop\CafeShop.Service",
    "d:\hoc tap\PTPMMNM\BE_2\CafeShop\CafeShop"
)
$utf8 = new-object System.Text.UTF8Encoding $false

foreach ($dir in $directories) {
    $files = Get-ChildItem -Path $dir -Recurse -File -Filter "*.cs"
    foreach ($file in $files) {
        $content = [System.IO.File]::ReadAllText($file.FullName, $utf8)
        $changed = $false
        
        foreach ($mod in $modules) {
            $oldUsing = "using CafeShop.DTO.$mod;"
            $reqUsing = "using CafeShop.DTO.$mod.Requests;"
            $resUsing = "using CafeShop.DTO.$mod.Responses;"
            
            if ($content -match [regex]::Escape($oldUsing)) {
                $content = $content -replace [regex]::Escape($oldUsing), "$reqUsing`r`n$resUsing"
                $changed = $true
            }
        }
        
        if ($changed) {
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8)
        }
    }
}
Write-Output "Imports successfully updated!"
