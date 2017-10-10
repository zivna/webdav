FOR /F "tokens=1,2,3 delims=@" %%a IN ("%1") do (
    set scheme=%%a
    set action=%%b
    set parameter=%%c
)

start %action% %parameter%