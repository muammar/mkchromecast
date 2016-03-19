#include <v8.h>
#include <node.h>
#include <node_buffer.h>
#include <node_object_wrap.h>
#include <queue>
#include <uv.h>

#include "lib/OSXAudioInput.h"
#include "lib/OSXAudioInput.cc"

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

class AudioInput : public ObjectWrap
{
private:
    OSXAudioInput* in;

public:
    uv_async_t message_async;
    uv_mutex_t message_mutex;

    struct AudioMessage
    {
				char* message;
				UInt32 size;
    };
    std::queue<AudioMessage*> message_queue;

    static v8::Persistent<v8::FunctionTemplate> s_ct;
    static void Init(v8::Handle<v8::Object> target)
    {
        v8::HandleScope scope;

        v8::Local<v8::FunctionTemplate> t = v8::FunctionTemplate::New(New);

        s_ct = v8::Persistent<v8::FunctionTemplate>::New(t);
        s_ct->InstanceTemplate()->SetInternalFieldCount(1);

        s_ct->SetClassName(v8::String::NewSymbol("AudioInput"));

				NODE_SET_PROTOTYPE_METHOD(s_ct, "openInput", OpenInput);
				NODE_SET_PROTOTYPE_METHOD(s_ct, "closeInput", CloseInput);
				NODE_SET_PROTOTYPE_METHOD(s_ct, "isOpen", IsOpen);

        target->Set(v8::String::NewSymbol("input"),
                    s_ct->GetFunction());
    }

    AudioInput()
    {
        in = new OSXAudioInput();
        uv_mutex_init(&message_mutex);
    }

    ~AudioInput()
    {
        in->closeInput();
        delete in;
        uv_mutex_destroy(&message_mutex);
    }

    static void EmitMessage(uv_async_t *w, int status)
    {
			assert(status == 0);
			v8::HandleScope scope;
			AudioInput *input = static_cast<AudioInput*>(w->data);
			uv_mutex_lock(&input->message_mutex);
			while (!input->message_queue.empty())
			{
				AudioMessage* message = input->message_queue.front();
				v8::Local<v8::Value> args[3];
				args[0] = v8::String::New(symbol_message);
				args[1] = v8::Local<v8::Value>::New(v8::Number::New(message->size));

				// create the node buffer for audio data
				node::Buffer *slowBuffer = node::Buffer::New(message->size);
				memcpy(node::Buffer::Data(slowBuffer), message->message, message->size);
				v8::Local<v8::Object> globalObj = v8::Context::GetCurrent()->Global();
				v8::Local<v8::Function> bufferConstructor = v8::Local<v8::Function>::Cast(globalObj->Get(v8::String::New("Buffer")));
				v8::Handle<v8::Value> constructorArgs[3] = { slowBuffer->handle_, v8::Integer::New(message->size), v8::Integer::New(0) };
				args[2] = bufferConstructor->NewInstance(3, constructorArgs);
				
				MakeCallback(input->handle_, symbol_emit, 3, args);
				input->message_queue.pop();
				delete message;
			}
			uv_mutex_unlock(&input->message_mutex);
    }

    static void Callback(UInt32 size, char *message, void *userData)
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

    static v8::Handle<v8::Value> New(const v8::Arguments& args)
    {
        v8::HandleScope scope;

        if (!args.IsConstructCall()) {
            return ThrowException(v8::Exception::TypeError(
                v8::String::New("Use the new operator to create instances of this object.")));
        }

        AudioInput* input = new AudioInput();
        input->message_async.data = input;
        uv_async_init(uv_default_loop(), &input->message_async, AudioInput::EmitMessage);
        input->Wrap(args.This());
        return args.This();
    }

    static v8::Handle<v8::Value> OpenInput(const v8::Arguments& args)
    {
        v8::HandleScope scope;
        AudioInput* input = ObjectWrap::Unwrap<AudioInput>(args.This());

				input->Ref();
        input->in->openInput(&AudioInput::Callback, ObjectWrap::Unwrap<AudioInput>(args.This()));
        return scope.Close(v8::Undefined());
    }

    static v8::Handle<v8::Value> CloseInput(const v8::Arguments& args)
    {
        v8::HandleScope scope;
        AudioInput* input = ObjectWrap::Unwrap<AudioInput>(args.This());

				input->in->closeInput();
        uv_close((uv_handle_t*)&input->message_async, NULL);
        return scope.Close(v8::Undefined());
    }

		static v8::Handle<v8::Value> IsOpen(const v8::Arguments& args)
		{
			v8::HandleScope scope;
			AudioInput* input = ObjectWrap::Unwrap<AudioInput>(args.This());

			bool open = input->in->isOpen();
			return scope.Close(v8::Boolean::New(open));
		}
};

v8::Persistent<v8::FunctionTemplate> AudioInput::s_ct;

extern "C" {
    void init (v8::Handle<v8::Object> target)
    {
        AudioInput::Init(target);
    }
    NODE_MODULE(audio, init)
}
