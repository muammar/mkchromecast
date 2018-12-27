
# This file is part of mkchromecast.

resolutions = {
        '480p': ('scale-854:-1', '854x480:'),
        '720p': ('scale=1280:-1', '1280x720'),
        '1366x768': ('scale=1366x768', '1366x768'),
        '1080p': ('scale=1920x1080', '1920x1080'),
        '2k': ('scale=2048x1148', '2048x1148'),
        'uhd': ('scale=3840x2160', '3840x2160'),
        '2160p': ('scale=3840x2160', '3840x2160'),
        '4k': ('scale=4096:-1', '4096x2160')
        }


def resolution(res, screencast):
        res = resolutions[res.lower()]
        if not screencast:
            return ['-vf', res[0]]
        else:
            return res[1]
