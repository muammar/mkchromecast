#ifndef AUDIOINPUT_H
#define AUDIOINPUT_H

#include <nan.h>
#include <queue>
#include <uv.h>

#include "lib/OSXAudioInput.h"

class AudioInput : public Nan::ObjectWrap
{
  public:
    static NAN_MODULE_INIT(Init);

  private:
    OSXAudioInput* in;

    uv_async_t message_async;
    uv_mutex_t message_mutex;

    explicit AudioInput();
    ~AudioInput();

    static void EmitMessage(uv_async_t *w);
    static void Callback(UInt32 size, char *message, void *userData);

    struct AudioMessage
    {
      char* message;
      UInt32 size;
    };
    std::queue<AudioMessage*> message_queue;

    static NAN_METHOD(New);
    static NAN_METHOD(OpenInput);
    static NAN_METHOD(CloseInput);
    static NAN_METHOD(IsOpen);

    static inline Nan::Persistent<v8::Function> & constructor() {
      static Nan::Persistent<v8::Function> ctr;
      return ctr;
    }
};

#endif