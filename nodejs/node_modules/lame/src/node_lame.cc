/*
 * Copyright (c) 2011, Nathan Rajlich <nathan@tootallnate.net>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

#include <v8.h>
#include <node.h>
#include <node_buffer.h>
#include "node_pointer.h"
#include "node_lame.h"
#include "lame.h"
#include "nan.h"

using namespace v8;
using namespace node;
using namespace nodelame;

namespace nodelame {

#define PASTE2(a, b) a##b
#define PASTE(a, b) PASTE2(a, b)

#define UNWRAP_GFP \
  Nan::HandleScope scope; \
  lame_global_flags *gfp = reinterpret_cast<lame_global_flags *>(UnwrapPointer(info[0]));

#define FN(type, v8type, fn) \
NAN_METHOD(PASTE(node_lame_get_, fn)) { \
  UNWRAP_GFP; \
  type output = PASTE(lame_get_, fn)(gfp); \
  info.GetReturnValue().Set(Nan::New<Number>(output)); \
} \
NAN_METHOD(PASTE(node_lame_set_, fn)) { \
  UNWRAP_GFP; \
  type input = (type)info[1]->PASTE(v8type, Value)(); \
  int output = PASTE(lame_set_, fn)(gfp, input); \
  info.GetReturnValue().Set(Nan::New<Number>(output)); \
}

/* get_lame_version() */
NAN_METHOD(node_get_lame_version) {
  info.GetReturnValue().Set(Nan::New<String>(get_lame_version()).ToLocalChecked());
}


/* get_lame_os_bitness() */
NAN_METHOD(node_get_lame_os_bitness) {
  info.GetReturnValue().Set(Nan::New<String>(get_lame_os_bitness()).ToLocalChecked());
}


/* lame_close() */
NAN_METHOD(node_lame_close) {
  UNWRAP_GFP;
  lame_close(gfp);
}


/* malloc()'s a `lame_t` struct and returns it to JS land */
NAN_METHOD(node_lame_init) {

  lame_global_flags *gfp = lame_init();
  if (gfp == NULL) return info.GetReturnValue().SetNull();

  Nan::MaybeLocal<v8::Object> wrapper = WrapPointer((char *)gfp);
  info.GetReturnValue().Set(wrapper.ToLocalChecked());
}


/* lame_encode_buffer_interleaved()
 * The main encoding function */
NAN_METHOD(node_lame_encode_buffer) {
  UNWRAP_GFP;

  // the input buffer
  char *input = UnwrapPointer(info[1]);
  pcm_type input_type = static_cast<pcm_type>(Nan::To<int32_t>(info[2]).FromMaybe(0));
  int32_t channels = Nan::To<int32_t>(info[3]).FromMaybe(0);
  int32_t num_samples = Nan::To<int32_t>(info[4]).FromMaybe(0);

  // the output buffer
  int out_offset = Nan::To<int32_t>(info[6]).FromMaybe(0);
  char *output = UnwrapPointer(info[5], out_offset);
  int output_size = Nan::To<int32_t>(info[7]).FromMaybe(0);

  encode_req *request = new encode_req;
  request->gfp = gfp;
  request->input = (unsigned char *)input;
  request->input_type = input_type;
  request->channels = channels;
  request->num_samples = num_samples;
  request->output = (unsigned char *)output;
  request->output_size = output_size;
  request->callback.Reset(info[8].As<Function>());

  // set a circular pointer so we can get the "encode_req" back later
  request->req.data = request;

  uv_queue_work(uv_default_loop(), &request->req,
      node_lame_encode_buffer_async,
      (uv_after_work_cb)node_lame_encode_buffer_after);
}


/* encode a buffer on the thread pool. */
void node_lame_encode_buffer_async (uv_work_t *req) {
  encode_req *r = (encode_req *)req->data;

  if (r->input_type == PCM_TYPE_SHORT_INT) {
    if (r->channels > 1) {
      // encoding short int interleaved input buffer
      r->rtn = lame_encode_buffer_interleaved(
        r->gfp,
        (short int *)r->input,
        r->num_samples,
        r->output,
        r->output_size
      );
    } else {
      // encoding short int input buffer
      r->rtn = lame_encode_buffer(
        r->gfp,
        (short int *)r->input,
        NULL,
        r->num_samples,
        r->output,
        r->output_size
      );
    }
  } else if (r->input_type == PCM_TYPE_FLOAT) {
    if (r->channels > 1) {
      // encoding float interleaved input buffer
      r->rtn = lame_encode_buffer_interleaved_ieee_float(
        r->gfp,
        (float *)r->input,
        r->num_samples,
        r->output,
        r->output_size
      );
    } else {
      // encoding float input buffer
      r->rtn = lame_encode_buffer_ieee_float(
        r->gfp,
        (float *)r->input,
        NULL,
        r->num_samples,
        r->output,
        r->output_size
      );
    }
  } else if (r->input_type == PCM_TYPE_DOUBLE) {
    if (r->channels > 1) {
      // encoding double interleaved input buffer
      r->rtn = lame_encode_buffer_interleaved_ieee_double(
        r->gfp,
        (double *)r->input,
        r->num_samples,
        r->output,
        r->output_size
      );
    } else {
      // encoding double input buffer
      r->rtn = lame_encode_buffer_ieee_double(
        r->gfp,
        (double *)r->input,
        NULL,
        r->num_samples,
        r->output,
        r->output_size
      );
    }
  }
}

void node_lame_encode_buffer_after (uv_work_t *req) {
  Nan::HandleScope scope;

  encode_req *r = (encode_req *)req->data;

  Handle<Value> argv[1];
  argv[0] = Nan::New<Integer>(r->rtn);

  Nan::TryCatch try_catch;

  Nan::New(r->callback)->Call(Nan::GetCurrentContext()->Global(), 1, argv);

  // cleanup
  r->callback.Reset();
  delete r;

  if (try_catch.HasCaught()) {
    FatalException(try_catch);
  }
}


/* lame_encode_flush_nogap() */
NAN_METHOD(node_lame_encode_flush_nogap) {
  UNWRAP_GFP;

  // the output buffer
  int out_offset = Nan::To<int32_t>(info[2]).FromMaybe(0);
  char *output = UnwrapPointer(info[1], out_offset);
  int output_size = Nan::To<int32_t>(info[3]).FromMaybe(0);

  encode_req *request = new encode_req;
  request->gfp = gfp;
  request->output = (unsigned char *)output;
  request->output_size = output_size;
  request->callback.Reset(info[4].As<Function>());

  // set a circular pointer so we can get the "encode_req" back later
  request->req.data = request;

  uv_queue_work(uv_default_loop(), &request->req,
      node_lame_encode_flush_nogap_async,
      (uv_after_work_cb)node_lame_encode_flush_nogap_after);
}

void node_lame_encode_flush_nogap_async (uv_work_t *req) {
  encode_req *r = (encode_req *)req->data;
  r->rtn = lame_encode_flush_nogap(
    r->gfp,
    r->output,
    r->output_size
  );
}


/**
 * lame_get_id3v1_tag()
 * Must be called *after* lame_encode_flush()
 * TODO: Make async
 */
NAN_METHOD(node_lame_get_id3v1_tag) {

  UNWRAP_GFP;

  Local<Object> outbuf = info[1]->ToObject();
  unsigned char *buf = (unsigned char *)Buffer::Data(outbuf);
  size_t buf_size = (size_t)Buffer::Length(outbuf);

  size_t b = lame_get_id3v1_tag(gfp, buf, buf_size);
  info.GetReturnValue().Set(Nan::New<Integer>(static_cast<uint32_t>(b)));
}


/**
 * lame_get_id3v2_tag()
 * Must be called *before* lame_init_params()
 * TODO: Make async
 */
NAN_METHOD(node_lame_get_id3v2_tag) {
  UNWRAP_GFP;

  Local<Object> outbuf = info[1]->ToObject();
  unsigned char *buf = (unsigned char *)Buffer::Data(outbuf);
  size_t buf_size = (size_t)Buffer::Length(outbuf);

  size_t b = lame_get_id3v2_tag(gfp, buf, buf_size);
  info.GetReturnValue().Set(Nan::New<Integer>(static_cast<uint32_t>(b)));
}


/* lame_init_params(gfp) */
NAN_METHOD(node_lame_init_params) {
  UNWRAP_GFP;
  info.GetReturnValue().Set(Nan::New<Number>(lame_init_params(gfp)));
}


/* lame_print_internals() */
NAN_METHOD(node_lame_print_internals) {
  UNWRAP_GFP;
  lame_print_internals(gfp);
}


/* lame_print_config() */
NAN_METHOD(node_lame_print_config) {
  UNWRAP_GFP;
  lame_print_config(gfp);
}


/* lame_get_bitrate() */
NAN_METHOD(node_lame_bitrates) {
  int v;
  int x = 3;
  int y = 16;
  Local<Array> n;
  Local<Array> ret = Nan::New<Array>();
  for (int i = 0; i < x; i++) {
    n = Nan::New<Array>();
    for (int j = 0; j < y; j++) {
      v = lame_get_bitrate(i, j);
      if (v >= 0) {
        Nan::Set(n, j, Nan::New<Integer>(v));
      }
    }
    Nan::Set(ret, i, n);
  }
  info.GetReturnValue().Set(ret);
}


/* lame_get_samplerate() */
NAN_METHOD(node_lame_samplerates) {
  int v;
  int x = 3;
  int y = 4;
  Local<Array> n;
  Local<Array> ret = Nan::New<Array>();
  for (int i = 0; i < x; i++) {
    n = Nan::New<Array>();
    for (int j = 0; j < y; j++) {
      v = lame_get_samplerate(i, j);
      if (v >= 0) {
        Nan::Set(n, j, Nan::New<Integer>(v));
      }
    }
    Nan::Set(ret, i, n);
  }
  info.GetReturnValue().Set(ret);
}

// define the node_lame_get/node_lame_set functions
FN(unsigned long, Number, num_samples);
FN(int, Int32, in_samplerate);
FN(int, Int32, num_channels);
FN(float, Number, scale);
FN(float, Number, scale_left);
FN(float, Number, scale_right);
FN(int, Int32, out_samplerate);
FN(int, Int32, analysis);
FN(int, Int32, bWriteVbrTag);
FN(int, Int32, quality);
FN(MPEG_mode, Int32, mode);

FN(int, Int32, brate);
FN(float, Number, compression_ratio);
FN(int, Int32, copyright);
FN(int, Int32, original);
FN(int, Int32, error_protection);
FN(int, Int32, extension);
FN(int, Int32, strict_ISO);
FN(int, Int32, disable_reservoir);
FN(int, Int32, quant_comp);
FN(int, Int32, quant_comp_short);
FN(int, Int32, exp_nspsytune);
FN(vbr_mode, Int32, VBR);
FN(int, Int32, VBR_q);
FN(float, Number, VBR_quality);
FN(int, Int32, VBR_mean_bitrate_kbps);
FN(int, Int32, VBR_min_bitrate_kbps);
FN(int, Int32, VBR_max_bitrate_kbps);
FN(int, Int32, VBR_hard_min);
FN(int, Int32, lowpassfreq);
FN(int, Int32, lowpasswidth);
FN(int, Int32, highpassfreq);
FN(int, Int32, highpasswidth);
// ...


void InitLame(Handle<Object> target) {
  Nan::HandleScope scope;

  /* sizeof's */
#define SIZEOF(value) \
  Nan::ForceSet(target, Nan::New<String>("sizeof_" #value).ToLocalChecked(), Nan::New<Integer>(static_cast<uint32_t>(sizeof(value))), \
      static_cast<PropertyAttribute>(ReadOnly|DontDelete))
  SIZEOF(short);
  SIZEOF(int);
  SIZEOF(float);
  SIZEOF(double);


#define CONST_INT(value) \
  Nan::ForceSet(target, Nan::New<String>(#value).ToLocalChecked(), Nan::New<Integer>(value), \
      static_cast<PropertyAttribute>(ReadOnly|DontDelete));

  // vbr_mode_e
  CONST_INT(vbr_off);
  CONST_INT(vbr_mt);
  CONST_INT(vbr_rh);
  CONST_INT(vbr_abr);
  CONST_INT(vbr_mtrh);
  CONST_INT(vbr_default);
  // MPEG_mode_e
  CONST_INT(STEREO);
  CONST_INT(JOINT_STEREO);
  CONST_INT(MONO);
  CONST_INT(NOT_SET);
  // Padding_type_e
  CONST_INT(PAD_NO);
  CONST_INT(PAD_ALL);
  CONST_INT(PAD_ADJUST);
  // Maximum size of an album art
  CONST_INT(LAME_MAXALBUMART);
  // lame_errorcodes_t
  CONST_INT(LAME_OKAY);
  CONST_INT(LAME_NOERROR);
  CONST_INT(LAME_GENERICERROR);
  CONST_INT(LAME_NOMEM);
  CONST_INT(LAME_BADBITRATE);
  CONST_INT(LAME_BADSAMPFREQ);
  CONST_INT(LAME_INTERNALERROR);
  //define PCM types
  CONST_INT(PCM_TYPE_SHORT_INT)
  CONST_INT(PCM_TYPE_FLOAT)
  CONST_INT(PCM_TYPE_DOUBLE)

  // Functions
  Nan::SetMethod(target, "get_lame_version", node_get_lame_version);
  Nan::SetMethod(target, "get_lame_os_bitness", node_get_lame_os_bitness);
  Nan::SetMethod(target, "lame_close", node_lame_close);
  Nan::SetMethod(target, "lame_encode_buffer", node_lame_encode_buffer);
  Nan::SetMethod(target, "lame_encode_flush_nogap", node_lame_encode_flush_nogap);
  Nan::SetMethod(target, "lame_get_id3v1_tag", node_lame_get_id3v1_tag);
  Nan::SetMethod(target, "lame_get_id3v2_tag", node_lame_get_id3v2_tag);
  Nan::SetMethod(target, "lame_init_params", node_lame_init_params);
  Nan::SetMethod(target, "lame_print_config", node_lame_print_config);
  Nan::SetMethod(target, "lame_print_internals", node_lame_print_internals);
  Nan::SetMethod(target, "lame_init", node_lame_init);
  Nan::SetMethod(target, "lame_bitrates", node_lame_bitrates);
  Nan::SetMethod(target, "lame_samplerates", node_lame_samplerates);

  // Get/Set functions
#define LAME_SET_METHOD(fn) \
  Nan::SetMethod(target, "lame_get_" #fn, PASTE(node_lame_get_, fn)); \
  Nan::SetMethod(target, "lame_set_" #fn, PASTE(node_lame_set_, fn));

  LAME_SET_METHOD(num_samples);
  LAME_SET_METHOD(in_samplerate);
  LAME_SET_METHOD(num_channels);
  LAME_SET_METHOD(scale);
  LAME_SET_METHOD(scale_left);
  LAME_SET_METHOD(scale_right);
  LAME_SET_METHOD(out_samplerate);
  LAME_SET_METHOD(analysis);
  LAME_SET_METHOD(bWriteVbrTag);
  LAME_SET_METHOD(quality);
  LAME_SET_METHOD(mode);

  LAME_SET_METHOD(brate);
  LAME_SET_METHOD(compression_ratio);
  LAME_SET_METHOD(copyright);
  LAME_SET_METHOD(original);
  LAME_SET_METHOD(error_protection);
  LAME_SET_METHOD(extension);
  LAME_SET_METHOD(strict_ISO);
  LAME_SET_METHOD(disable_reservoir);
  LAME_SET_METHOD(quant_comp);
  LAME_SET_METHOD(quant_comp_short);
  LAME_SET_METHOD(exp_nspsytune);
  LAME_SET_METHOD(VBR);
  LAME_SET_METHOD(VBR_q);
  LAME_SET_METHOD(VBR_quality);
  LAME_SET_METHOD(VBR_mean_bitrate_kbps);
  LAME_SET_METHOD(VBR_min_bitrate_kbps);
  LAME_SET_METHOD(VBR_max_bitrate_kbps);
  LAME_SET_METHOD(VBR_hard_min);
  LAME_SET_METHOD(lowpassfreq);
  LAME_SET_METHOD(lowpasswidth);
  LAME_SET_METHOD(highpassfreq);
  LAME_SET_METHOD(highpasswidth);
  // ...

  /*
  Nan::SetMethod(target, "lame_get_decode_only", node_lame_get_decode_only);
  Nan::SetMethod(target, "lame_set_decode_only", node_lame_set_decode_only);
  Nan::SetMethod(target, "lame_get_framesize", node_lame_get_framesize);
  Nan::SetMethod(target, "lame_get_frameNum", node_lame_get_frameNum);
  Nan::SetMethod(target, "lame_get_version", node_lame_get_version);
  */

}

} // nodelame namespace
