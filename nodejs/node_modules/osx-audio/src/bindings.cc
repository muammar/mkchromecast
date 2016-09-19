#include <nan.h>
#include "AudioInput.h"

void initAll(v8::Local<v8::Object> exports)
{
  AudioInput::Init(exports);
}

NODE_MODULE(audio, initAll)
