$key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplaGNtam14cHZhd2Z4c3B5dmVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTExOTIsImV4cCI6MjEwMDM2NzE5Mn0.6hPkhznCUCS9qGLDVShILqSCxE1SAU3MQ_GePgAq2tw'
$headers = @{ 'apikey' = $key; 'Authorization' = 'Bearer ' + $key }
$tables = @('companies','sub_companies','users','roles','work_hours','work_records','departments','profiles')
foreach ($t in $tables) {
  $url = "https://zehcmjmxpvawfxspyvee.supabase.co/rest/v1/$($t)?select=id&limit=1"
  try {
    $r = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    Write-Host "$t : OK ($((@($r).Count)) rows)"
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $body = $reader.ReadToEnd()
    Write-Host "$t : $code  $body"
  }
}
