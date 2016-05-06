#
# Regular cron jobs for the mkchromecast package
#
0 4	* * *	root	[ -x /usr/bin/mkchromecast_maintenance ] && /usr/bin/mkchromecast_maintenance
