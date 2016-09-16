#include "AudioInput.h"

/**
 * # Audio Classes
 *
 * Thanks to:
 *   - Justin Latimer: https://github.com/justinlatimer (node-midi, which this  
 *     module is adapted from.
 */

using namespace node;

const char* symbol_emit = "emit";
const char* symbol_message = "message";

NAN_MODULE_INIT(AudioInput::Init)
{
	v8::Local<v8::FunctionTemplate> tpl = Nan::New<v8::FunctionTemplate>(New);
	tpl->SetClassName(Nan::New("AudioInput").ToLocalChecked());
	tpl->InstanceTemplate()->SetInternalFieldCount(1);

	Nan::SetPrototypeMethod(tpl, "openInput", OpenInput);
	Nan::SetPrototypeMethod(tpl, "closeInput", CloseInput);
	Nan::SetPrototypeMethod(tpl, "isOpen", IsOpen);

	constructor().Reset(Nan::GetFunction(tpl).ToLocalChecked());
  Nan::Set(target, Nan::New("input").ToLocalChecked(),
    Nan::GetFunction(tpl).ToLocalChecked());
}

AudioInput::AudioInput()
{
	in = new OSXAudioInput();
	uv_mutex_init(&message_mutex);
}

AudioInput::~AudioInput()
{
	in->closeInput();
	delete in;
	uv_mutex_destroy(&message_mutex);
}

void AudioInput::EmitMessage(uv_async_t *w)
{
	Nan::HandleScope scope;

	AudioInput *input = static_cast<AudioInput*>(w->data);
	uv_mutex_lock(&input->message_mutex);

	while (!input->message_queue.empty())
	{
		AudioMessage* message = input->message_queue.front();
		v8::Local<v8::Value> args[3];
		args[0] = Nan::New(symbol_message).ToLocalChecked();
		args[1] = Nan::New(message->size);

		args[2] = Nan::CopyBuffer(message->message, message->size).ToLocalChecked();

		Nan::MakeCallback(input->handle(), symbol_emit, 3, args);
		input->message_queue.pop();
		delete message;
	}
	uv_mutex_unlock(&input->message_mutex);
}

void AudioInput::Callback(UInt32 size, char *message, void *userData)
{
	AudioInput *input = static_cast<AudioInput*>(userData);
	AudioMessage* data = new AudioMessage();
	data->message = message;
	data->size = size * 4;
	uv_mutex_lock(&input->message_mutex);
	input->message_queue.push(data);
	uv_mutex_unlock(&input->message_mutex);
	uv_async_send(&input->message_async);
}

NAN_METHOD(AudioInput::New)
{
	if (!info.IsConstructCall()) {
		return Nan::ThrowTypeError("Use the new operator to create instances of this object.");
	}

	AudioInput* input = new AudioInput();
	input->message_async.data = input;
	uv_async_init(uv_default_loop(), &input->message_async, AudioInput::EmitMessage);
	input->Wrap(info.This());
	info.GetReturnValue().Set(info.This());
}

NAN_METHOD(AudioInput::OpenInput)
{
	AudioInput* input = ObjectWrap::Unwrap<AudioInput>(info.This());

	input->Ref();
	input->in->openInput(&AudioInput::Callback, ObjectWrap::Unwrap<AudioInput>(info.This()));
	info.GetReturnValue().SetUndefined();
}

NAN_METHOD(AudioInput::CloseInput)
{
	AudioInput* input = ObjectWrap::Unwrap<AudioInput>(info.This());

	input->in->closeInput();
	uv_close((uv_handle_t*)&input->message_async, NULL);
	info.GetReturnValue().SetUndefined();
}

NAN_METHOD(AudioInput::IsOpen)
{
	AudioInput* input = ObjectWrap::Unwrap<AudioInput>(info.This());

	bool open = input->in->isOpen();
	info.GetReturnValue().Set(open);
}
