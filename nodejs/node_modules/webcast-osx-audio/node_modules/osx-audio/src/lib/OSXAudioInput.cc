#include "OSXAudioInput.h"

#include <AudioToolbox/AudioQueue.h>
#include <CoreAudio/CoreAudioTypes.h>
#include <CoreFoundation/CFRunLoop.h>

#define NUM_CHANNELS 2
#define NUM_BUFFERS 4
#define BUFFER_SIZE 4096
#define SAMPLE_TYPE short
#define MAX_NUMBER 32767
#define SAMPLE_RATE 44100

OSXAudioInput :: OSXAudioInput() {
	format.mSampleRate = SAMPLE_RATE;
	format.mFormatID = kAudioFormatLinearPCM;
	format.mFormatFlags = kLinearPCMFormatFlagIsSignedInteger | kAudioFormatFlagIsPacked;
	format.mBitsPerChannel = 8 * sizeof(SAMPLE_TYPE);
	format.mChannelsPerFrame = NUM_CHANNELS;
	format.mBytesPerFrame = sizeof(SAMPLE_TYPE) * NUM_CHANNELS;
	format.mFramesPerPacket = 1;
	format.mBytesPerPacket = format.mBytesPerFrame * format.mFramesPerPacket;
	format.mReserved = 0;
	open = false;
}

void OSXAudioInput :: openInput(OSXAudioInput::OSXAudioCallback callback, void *userData) {
	unsigned int i;

	inputData_.userCallback = callback;
	inputData_.userData = userData;
	inputData_.usingCallback = true;

	// Initialize Input
	AudioQueueNewInput(&format, inputCallback_, &inputData_, NULL, kCFRunLoopCommonModes, 0, &inQueue);
	for (i = 0; i < NUM_BUFFERS; i++)
	{
		AudioQueueAllocateBuffer(inQueue, BUFFER_SIZE, &inBuffers[i]);
		AudioQueueEnqueueBuffer(inQueue, inBuffers[i], 0, NULL);
	}
	AudioQueueStart(inQueue, NULL);
	open = true;
}

void OSXAudioInput :: closeInput() {
	AudioQueueDispose(inQueue, true);
	inputData_.usingCallback = false;
	inputData_.userCallback = 0;
	inputData_.userData = 0;
	open = false;
}

bool OSXAudioInput :: isOpen() {
	return open;
}

void OSXAudioInput :: inputCallback_(void *custom_data, AudioQueueRef queue,
		AudioQueueBufferRef buffer, const AudioTimeStamp *start_time, UInt32 num_packets,
		const AudioStreamPacketDescription *packet_desc) {
	OSXAudioInData *data = (OSXAudioInData *) custom_data;

	if ( data->usingCallback ) {
		OSXAudioInput::OSXAudioCallback callback = (OSXAudioInput::OSXAudioCallback) 
			data->userCallback;
		callback(num_packets, (char *)buffer->mAudioData, data->userData);
	}

	AudioQueueEnqueueBuffer(queue, buffer, 0, NULL);
}
