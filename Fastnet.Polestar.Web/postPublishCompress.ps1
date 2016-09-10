#
# postPublishCompress.ps1
#
param()
function compress {
	[cmdletbinding()]
	param($from, $to)
	$zipfile = [IO.Path]::Combine($to, "Polestar.zip")
	Compress-Archive -Path $from -DestinationPath $zipfile -Force
	$zipfile + " created"
}
try {
	$here = pwd
	$releaseFolder = [IO.Path]::Combine($here, "bin", "debug")
	$appOut = [IO.Path]::Combine($here, "bin", "debug", "publishOutput")
	compress $appOut $releaseFolder
}
catch{
    "An error occurred during publish.`n{0}" -f $_.Exception.Message | Write-Error
}

