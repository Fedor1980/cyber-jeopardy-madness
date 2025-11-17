; ============================================================================
; Cyber Jeopardy Madness - Client Installer Script (Inno Setup)
; ============================================================================
; This script creates a Windows installer for client workstations
;
; To build the installer:
; 1. Install Inno Setup from: https://jrsoftware.org/isinfo.php
; 2. Open this file in Inno Setup Compiler
; 3. Click Build > Compile
; 4. The installer will be created in the Output folder
; ============================================================================

#define MyAppName "Cyber Jeopardy Madness"
#define MyAppVersion "2.0.0"
#define MyAppPublisher "Capital Technology Group"
#define MyAppURL "https://github.com/Fedor1980/cyber-jeopardy-madness"
#define MyAppExeName "LaunchGame.bat"

[Setup]
; Basic application information
AppId={{CyberJeopardyMadness-B7E9-4F3A-9D2C-8E1F0C9A5B6D}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Default installation directory
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}

; Output settings
OutputDir=Output
OutputBaseFilename=CyberJeopardyMadness-Client-Setup
Compression=lzma2/max
SolidCompression=yes

; UI settings
WizardStyle=modern
SetupIconFile=..\public\favicon.ico
DisableProgramGroupPage=yes
PrivilegesRequired=lowest

; Version information
VersionInfoVersion={#MyAppVersion}
VersionInfoCompany={#MyAppPublisher}
VersionInfoDescription={#MyAppName} Client Installer

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Frontend build files (if building desktop client)
Source: "..\frontend\dist\*"; DestDir: "{app}\frontend"; Flags: ignoreversion recursesubdirs createallsubdirs
; Launcher scripts
Source: "..\installer\LaunchGame.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\installer\ConfigureServer.bat"; DestDir: "{app}"; Flags: ignoreversion
; Configuration file
Source: "..\installer\client-config.txt"; DestDir: "{app}"; Flags: ignoreversion confirmoverwrite
; Documentation
Source: "..\README.md"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\docs\*"; DestDir: "{app}\docs"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Configure Server"; Filename: "{app}\ConfigureServer.bat"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\ConfigureServer.bat"; Description: "Configure server connection"; Flags: postinstall nowait skipifsilent runhidden
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
var
  ServerURLPage: TInputQueryWizardPage;

procedure InitializeWizard;
begin
  { Create custom page for server URL input }
  ServerURLPage := CreateInputQueryPage(wpSelectDir,
    'Server Configuration',
    'Enter the server connection details',
    'Please enter the IP address or hostname of your Cyber Jeopardy server:');

  ServerURLPage.Add('Server Address:', False);
  ServerURLPage.Values[0] := 'http://localhost:4173';
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: String;
  ServerURL: String;
begin
  if CurStep = ssPostInstall then
  begin
    { Save server URL to config file }
    ConfigFile := ExpandConstant('{app}\client-config.txt');
    ServerURL := ServerURLPage.Values[0];

    { Write configuration }
    SaveStringToFile(ConfigFile, 'SERVER_URL=' + ServerURL + #13#10, False);
  end;
end;
