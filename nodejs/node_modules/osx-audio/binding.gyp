{
	"targets": [ {
		"target_name": "audio",
			"sources": [
				"src/bindings.cc",
				"src/AudioInput.cc",
				"src/lib/OSXAudioInput.cc"
			],
			"include_dirs": [
				"src",
				"System/Library/Frameworks/CoreFoundation.framework/Headers",
				"System/Library/Frameworks/AudioToolbox.framework/Headers",
				"System/Library/Frameworks/CoreAudio.framework/Headers",
				"<!(node -e \"require('nan')\")"
			],
			"link_settings": {
				"libraries": [
					"-framework CoreFoundation",
					"-framework CoreAudio",
					"-framework AudioToolbox"
				]
			}
	} ]
}
