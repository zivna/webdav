if not exist "C:\Program Files\WisdomStone" mkdir "C:\Program Files\WisdomStone"
xcopy /y "%~dp0wsUriHandler.bat" "C:\Program Files\WisdomStone\"
xcopy /y "%~dp0Agent.exe" "C:\Program Files\WisdomStone\"
%~dp0wsUriScheme.reg