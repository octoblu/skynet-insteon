skynet-insteon
==============

Skynet Gateway plugin to control an Insteon hub and switches


####Options:
`ipAddress` - IP address for the insteon hub. Can be found at https://www.connect.insteon.com/getinfo.asp  
`portNumber` - Port number for PLM interface, defaults to 9761. This is not the same as the web interface port (25105).   

####Message payload:
`on` - Boolean on/off status for specified light.  
`deviceId` - Device ID of light, 6 hex characters without periods. ex: `aabbcc`
`brightness` - Brightness number between 0 - 100, only applies when light is on. Default: `100`  
Note: Brightness only works if switch and light support it.

`{on : true, deviceId : 'aabbcc', brightness : 50 }`