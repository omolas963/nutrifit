Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)

WshShell.CurrentDirectory = strPath
WshShell.Environment("PROCESS")("NODE_TLS_REJECT_UNAUTHORIZED") = "0"

' 1. Limpiar perfiles temporales conflictivos si existieran
profileDir = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\NutriFitProfile"
If fso.FolderExists(profileDir) Then
    On Error Resume Next
    fso.DeleteFolder profileDir, True
    On Error GoTo 0
End If

' 2. Verificar si el servidor ya esta activo
On Error Resume Next
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.open "GET", "http://127.0.0.1:5000/api/health", False
http.setTimeouts 800, 800, 800, 800
http.send ""
isServerRunning = (http.status = 200)
On Error GoTo 0

' 3. Si no esta iniciado, arrancar el servidor Node en segundo plano
If Not isServerRunning Then
    WshShell.Run """" & "C:\Users\oscar\nodejs\node.exe" & """ dist\server.js", 0, False
    
    For i = 1 To 20
        WScript.Sleep 400
        On Error Resume Next
        Set http2 = CreateObject("MSXML2.ServerXMLHTTP.6.0")
        http2.open "GET", "http://127.0.0.1:5000/api/health", False
        http2.setTimeouts 800, 800, 800, 800
        http2.send ""
        If http2.status = 200 Then Exit For
        On Error GoTo 0
    Next
End If

' 4. Abrir la ventana de aplicacion (Edge prioritario por integracion nativa en Windows 11 sin fallos de pantalla en blanco, o Chrome)
edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
appUrl = "http://127.0.0.1:5000"

If fso.FileExists(edgePath) Then
    WshShell.Run """" & edgePath & """ --app=" & appUrl, 1, False
ElseIf fso.FileExists(chromePath) Then
    WshShell.Run """" & chromePath & """ --app=" & appUrl, 1, False
Else
    WshShell.Run appUrl, 1, False
End If
