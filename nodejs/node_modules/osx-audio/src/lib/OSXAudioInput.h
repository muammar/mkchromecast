#ifndef OSXAUDIOINPUT_H
#define OSXAUDIOINPUT_H

#include <stdlib.h>
#include <math.h>

#include <AudioToolbox/AudioQueue.h>
#include <CoreAudio/CoreAudioTypes.h>
#include <CoreFoundation/CFRunLoop.h>

#define NUM_CHANNELS 2
#define NUM_BUFFERS 4
#define BUFFER_SIZE 4096
#define SAMPLE_TYPE short
#define MAX_NUMBER 32767
#define SAMPLE_RATE 44100

class OSXAudioInput {
	public:
		typedef void (*OSXAudioCallback)(UInt32 size, char *message, void *userData);	

		struct OSXAudioInData {
			bool usingCallback;
			OSXAudioInput::OSXAudioCallback userCallback;
			void *userData;

			// Default constructor.
			OSXAudioInData()
				: usingCallback(false), userCallback(0), userData(0) {}
		};

		OSXAudioInput();

		void openInput(OSXAudioCallback callback, void *userData = 0);
		void closeInput();
		bool isOpen();
	protected:
		AudioStreamBasicDescription format;
		AudioQueueRef inQueue;
		AudioQueueBufferRef inBuffers[NUM_BUFFERS];

		static void inputCallback_(void *custom_data, AudioQueueRef queue, AudioQueueBufferRef buffer, 
				const AudioTimeStamp *start_time, UInt32 num_packets,
				const AudioStreamPacketDescription *packet_desc);

		OSXAudioInData inputData_;
		bool open;
};

#endif
