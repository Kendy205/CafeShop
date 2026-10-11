$file = "d:\hoc tap\PTPMMNM\BE_2\CafeShop\CafeShop.Service\Service\Users\CartService.cs"
$text = [System.IO.File]::ReadAllText($file)
$bytes = [System.Text.Encoding]::GetEncoding(1252).GetBytes($text)
$fixed = [System.Text.Encoding]::UTF8.GetString($bytes)
if ($fixed -match "Không tìm thấy giỏ hàng") {
    Write-Output "Recovery successful!"
} else {
    Write-Output "Failed."
}
