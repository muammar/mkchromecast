import unittest
from unittest import mock

from pychromecast.error import RequestFailed

from mkchromecast import cast as cast_mod
from mkchromecast.constants import OpMode


def _make_casting(media_controller):
    """Builds a Casting instance wired to a fake cast/media_controller.

    Bypasses __init__ (which discovers real devices) and injects the minimum
    state play_cast() touches, so the handshake logic can be exercised without
    a live Chromecast.
    """
    casting = object.__new__(cast_mod.Casting)

    mkcc = mock.Mock()
    mkcc.debug = False
    mkcc.videoarg = True
    mkcc.mtype = None
    mkcc.operation = OpMode.SCREENCAST
    mkcc.host = None
    mkcc.port = 5000
    mkcc.hijack = False

    fake_cast = mock.Mock()
    fake_cast.media_controller = media_controller
    fake_cast.socket_client.host = "192.168.0.10"
    fake_cast.status = "fake-status"

    casting.mkcc = mkcc
    casting.cast = fake_cast
    casting.cast_to = "Living Room TV"
    casting.ip = "192.168.0.5"
    casting.title = "Mkchromecast test"
    return casting


def _media_controller(is_active, player_is_playing, play_raises=False):
    mc = mock.Mock()
    mc.is_active = is_active
    mc.status.player_is_playing = player_is_playing
    mc.block_until_active = mock.Mock(return_value=None)
    if play_raises:
        mc.play.side_effect = RequestFailed("Failed to execute play.")
    return mc


class PlayCastHandshakeTests(unittest.TestCase):
    """play_cast must survive the async LOAD/session handshake.

    play_media(autoplay=True) starts playback once the device establishes a
    media session, but that can take longer than the local cold start. Issuing
    play() before a session exists raises RequestFailed; play_cast must not let
    that crash the cast.
    """

    def test_no_session_does_not_crash(self):
        # Session never becomes active and play() would raise — the historical
        # crash path. play_cast must complete without propagating.
        mc = _media_controller(
            is_active=False, player_is_playing=False, play_raises=True)
        casting = _make_casting(mc)

        casting.play_cast()

        # With no active session we must not have issued a play() that throws.
        mc.play.assert_not_called()
        mc.block_until_active.assert_called_once()

    def test_active_session_plays(self):
        mc = _media_controller(is_active=True, player_is_playing=False)
        casting = _make_casting(mc)

        casting.play_cast()

        mc.play.assert_called_once()

    def test_already_playing_does_not_replay(self):
        # autoplay already started playback; no redundant play() needed.
        mc = _media_controller(is_active=True, player_is_playing=True)
        casting = _make_casting(mc)

        casting.play_cast()

        mc.play.assert_not_called()


if __name__ == "__main__":
    unittest.main()
