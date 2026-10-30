Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath
WshShell.Environment("PROCESS")("NODE_TLS_REJECT_UNAUTHORIZED") = "0"

WshShell.Run """C:\Users\oscar\nodejs\node.exe"" """ & strPath & "\dist\server.js""", 0, False
