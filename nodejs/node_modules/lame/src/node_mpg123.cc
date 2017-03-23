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
#include <string.h>
#include "node_pointer.h"
#include "node_mpg123.h"
#include "nan.h"

using namespace v8;
using namespace node;
using namespace Nan;

namespace nodelame {

#define UNWRAP_MH \
  Nan::HandleScope scope; \
  mpg123_handle *mh = reinterpret_cast<mpg123_handle *>(UnwrapPointer(info[0]));

/* not a macro because we're passing function calls in here */
inline int min (int a, int b) {
  return a < b ? a : b;
}

NAN_METHOD(node_mpg123_init) {
  info.GetReturnValue().Set(Nan::New<Integer>(mpg123_init()));
}


NAN_METHOD(node_mpg123_exit) {
  mpg123_exit();
}


NAN_METHOD(node_mpg123_new) {

  // TODO: Accept an input decoder String
  int error = MPG123_OK;
  mpg123_handle *mh = mpg123_new(NULL, &error);

  if (error == MPG123_OK) {
    info.GetReturnValue().Set(WrapPointer(mh).ToLocalChecked());
  } else {
    info.GetReturnValue().Set(Nan::New<Integer>(error));
  }
}


NAN_METHOD(node_mpg123_current_decoder) {
  UNWRAP_MH;
  const char *decoder = mpg123_current_decoder(mh);
  info.GetReturnValue().Set(Nan::New<String>(decoder).ToLocalChecked());
}


NAN_METHOD(node_mpg123_supported_decoders) {
  const char **decoders = mpg123_supported_decoders();
  int i = 0;
  v8::Local<Array> rtn = Nan::New<Array>();
  while (*decoders != NULL) {
    Nan::Set(rtn, i++, Nan::New<String>(*decoders).ToLocalChecked());
    decoders++;
  }
  info.GetReturnValue().Set(rtn);
}


NAN_METHOD(node_mpg123_decoders) {
  const char **decoders = mpg123_decoders();
  int i = 0;
  v8::Local<Array> rtn = Nan::New<Array>();
  while (*decoders != NULL) {
    Nan::Set(rtn, i++, Nan::New<String>(*decoders).ToLocalChecked());
    decoders++;
  }
  info.GetReturnValue().Set(rtn);
}


NAN_METHOD(node_mpg123_open_feed) {
  UNWRAP_MH;
  int ret = mpg123_open_feed(mh);
  info.GetReturnValue().Set(Nan::New<Integer>(ret));
}


NAN_METHOD(node_mpg123_getformat) {
  UNWRAP_MH;
  long rate;
  int channels;
  int encoding;
  int ret;
  Local<Value> rtn;
  ret = mpg123_getformat(mh, &rate, &channels, &encoding);
  if (ret == MPG123_OK) {
    Local<Object> o = Nan::New<Object>();
    Nan::Set(o, Nan::New<String>("raw_encoding").ToLocalChecked(), Nan::New<Number>(encoding));
    Nan::Set(o, Nan::New<String>("sampleRate").ToLocalChecked(), Nan::New<Number>(rate));
    Nan::Set(o, Nan::New<String>("channels").ToLocalChecked(), Nan::New<Number>(channels));
    Nan::Set(o, Nan::New<String>("signed").ToLocalChecked(), Nan::New<Boolean>(encoding & MPG123_ENC_SIGNED));
    Nan::Set(o, Nan::New<String>("float").ToLocalChecked(), Nan::New<Boolean>(encoding & MPG123_ENC_FLOAT));
    Nan::Set(o, Nan::New<String>("ulaw").ToLocalChecked(), Nan::New<Boolean>(encoding & MPG123_ENC_ULAW_8));
    Nan::Set(o, Nan::New<String>("alaw").ToLocalChecked(), Nan::New<Boolean>(encoding & MPG123_ENC_ALAW_8));
    if (encoding & MPG123_ENC_8)
      Nan::Set(o, Nan::New<String>("bitDepth").ToLocalChecked(), Nan::New<Integer>(8));
    else if (encoding & MPG123_ENC_16)
      Nan::Set(o, Nan::New<String>("bitDepth").ToLocalChecked(), Nan::New<Integer>(16));
    else if (encoding & MPG123_ENC_24)
      Nan::Set(o, Nan::New<String>("bitDepth").ToLocalChecked(), Nan::New<Integer>(24));
    else if (encoding & MPG123_ENC_32 || encoding & MPG123_ENC_FLOAT_32)
      Nan::Set(o, Nan::New<String>("bitDepth").ToLocalChecked(), Nan::New<Integer>(32));
    else if (encoding & MPG123_ENC_FLOAT_64)
      Nan::Set(o, Nan::New<String>("bitDepth").ToLocalChecked(), Nan::New<Integer>(64));
    rtn = o;
  } else {
    rtn = Nan::New<Integer>(ret);
  }
  info.GetReturnValue().Set(rtn);
}


NAN_METHOD(node_mpg123_safe_buffer) {
  info.GetReturnValue().Set(Nan::New<Number>(mpg123_safe_buffer()));
}


NAN_METHOD(node_mpg123_outblock) {
  UNWRAP_MH;
  info.GetReturnValue().Set(Nan::New<Number>(mpg123_outblock(mh)));
}


NAN_METHOD(node_mpg123_framepos) {
  UNWRAP_MH;
  info.GetReturnValue().Set(Nan::New<Number>(mpg123_framepos(mh)));
}


NAN_METHOD(node_mpg123_tell) {
  UNWRAP_MH;
  info.GetReturnValue().Set(Nan::New<Number>(mpg123_tell(mh)));
}


NAN_METHOD(node_mpg123_tellframe) {
  UNWRAP_MH;
  info.GetReturnValue().Set(Nan::New<Number>(mpg123_tellframe(mh)));
}


NAN_METHOD(node_mpg123_tell_stream) {
  UNWRAP_MH;
  info.GetReturnValue().Set(Nan::New<Number>(mpg123_tell_stream(mh)));
}


NAN_METHOD(node_mpg123_feed) {
  UNWRAP_MH;

  // input buffer
  char *input = UnwrapPointer(info[1]);
  size_t size = Nan::To<int32_t>(info[2]).FromMaybe(0);

  feed_req *request = new feed_req;
  request->mh = mh;
  request->in = (const unsigned char *)input;
  request->size = size;
  request->callback.Reset(info[3].As<Function>());

  request->req.data = request;

  uv_queue_work(uv_default_loop(), &request->req,
      node_mpg123_feed_async,
      (uv_after_work_cb)node_mpg123_feed_after);
}

void node_mpg123_feed_async (uv_work_t *req) {
  feed_req *r = (feed_req *)req->data;
  r->rtn = mpg123_feed(
    r->mh,
    r->in,
    r->size
  );
}

void node_mpg123_feed_after (uv_work_t *req) {
  Nan::HandleScope scope;
  feed_req *r = (feed_req *)req->data;

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


NAN_METHOD(node_mpg123_read) {
  UNWRAP_MH;

  // output buffer
  char *output = UnwrapPointer(info[1]);
  size_t size = Nan::To<int32_t>(info[2]).FromMaybe(0);

  read_req *request = new read_req;
  request->mh = mh;
  request->out = (unsigned char *)output;
  request->size = size;
  request->done = 0;
  request->callback.Reset(info[3].As<Function>());
  request->req.data = request;

  uv_queue_work(uv_default_loop(), &request->req,
      node_mpg123_read_async,
      (uv_after_work_cb)node_mpg123_read_after);
}

void node_mpg123_read_async (uv_work_t *req) {
  read_req *r = (read_req *)req->data;
  r->rtn = mpg123_read(
    r->mh,
    r->out,
    r->size,
    &r->done
  );

  /* any new metadata? */
  r->meta = mpg123_meta_check(r->mh);
}

void node_mpg123_read_after (uv_work_t *req) {
  Nan::HandleScope scope;
  read_req *r = (read_req *)req->data;

  Handle<Value> argv[3];
  argv[0] = Nan::New<Integer>(r->rtn);
  argv[1] = Nan::New<Integer>(static_cast<uint32_t>(r->done));
  argv[2] = Nan::New<Integer>(r->meta);

  Nan::TryCatch try_catch;

  Nan::New(r->callback)->Call(Nan::GetCurrentContext()->Global(), 3, argv);

  // cleanup
  r->callback.Reset();
  delete r;

  if (try_catch.HasCaught()) {
    FatalException(try_catch);
  }
}


NAN_METHOD(node_mpg123_id3) {
  UNWRAP_MH;

  id3_req *request = new id3_req;
  request->mh = mh;
  request->callback.Reset(info[1].As<Function>());
  request->req.data = request;

  uv_queue_work(uv_default_loop(), &request->req,
      node_mpg123_id3_async,
      (uv_after_work_cb)node_mpg123_id3_after);
}

void node_mpg123_id3_async (uv_work_t *req) {
  id3_req *r = (id3_req *)req->data;
  r->rtn = mpg123_id3(
    r->mh,
    &r->v1,
    &r->v2
  );
}

void node_mpg123_id3_after (uv_work_t *req) {
  Nan::HandleScope scope;
  id3_req *ireq = (id3_req *)req->data;

  mpg123_id3v1 *v1 = ireq->v1;
  mpg123_id3v2 *v2 = ireq->v2;
  int r = ireq->rtn;
  Handle<Value> rtn;

  if (r == MPG123_OK) {
    if (v1 != NULL) {
      /* got id3v1 tags */
      Local<Object> o = Nan::New<Object>();
#define SET(prop) \
      Nan::Set(o, Nan::New<String>(#prop).ToLocalChecked(), Nan::New<String>(v1->prop, min(sizeof(v1->prop), v1->prop == NULL ? 0 : strlen(v1->prop))).ToLocalChecked());
      SET(tag);
      SET(title);
      SET(artist);
      SET(album);
      SET(year);
      if (v1->comment[28] == 0 && v1->comment[29] >= 1) {
        /* ID3v1.1 */
        Nan::Set(o, Nan::New<String>("comment").ToLocalChecked(), Nan::New<String>(v1->comment, min(sizeof(v1->comment) - 2, v1->comment == NULL ? 0 : strlen(v1->comment))).ToLocalChecked());
        Nan::Set(o, Nan::New<String>("trackNumber").ToLocalChecked(), Nan::New<Integer>(v1->comment[29]));
      } else {
        /* ID3v1 */
        SET(comment);
      }
      Nan::Set(o, Nan::New<String>("genre").ToLocalChecked(), Nan::New<Integer>(v1->genre));
      rtn = o;
#undef SET
    } else if (v2 != NULL) {
      /* got id3v2 tags */
      mpg123_string *s;
      mpg123_text *t;
      Local<Object> o = Nan::New<Object>();
      Local<Array> a;
      Local<Object> text;
#define SET(prop) \
      s = v2->prop; \
      if (s != NULL) \
        Nan::Set(o, Nan::New<String>(#prop).ToLocalChecked(), Nan::New<String>(s->p, mpg123_strlen(s, 1)).ToLocalChecked());
      SET(title)
      SET(artist)
      SET(album)
      SET(year)
      SET(genre)
      SET(comment)
#undef SET

#define SET_ARRAY(array, count) \
      a = Nan::New<Array>(v2->count); \
      for (size_t i = 0; i < v2->count; i++) { \
        t = &v2->array[i]; \
        text = Nan::New<Object>(); \
        Nan::Set(a, i, text); \
        Nan::Set(text, Nan::New<String>("lang").ToLocalChecked(), Nan::New<String>(t->lang, min(sizeof(t->lang), strlen(t->lang))).ToLocalChecked()); \
        Nan::Set(text, Nan::New<String>("id").ToLocalChecked(), Nan::New<String>(t->id, min(sizeof(t->id), strlen(t->id))).ToLocalChecked()); \
        s = &t->description; \
        if (s != NULL) \
          Nan::Set(text, Nan::New<String>("description").ToLocalChecked(), Nan::New<String>(s->p, mpg123_strlen(s, 1)).ToLocalChecked()); \
        s = &t->text; \
        if (s != NULL) \
          Nan::Set(text, Nan::New<String>("text").ToLocalChecked(), Nan::New<String>(s->p, mpg123_strlen(s, 1)).ToLocalChecked()); \
      } \
      Nan::Set(o, Nan::New<String>(#count).ToLocalChecked(), a);
      SET_ARRAY(comment_list, comments)
      SET_ARRAY(text, texts)
      SET_ARRAY(extra, extras)
#undef SET_ARRAY

      rtn = o;
    } else {
      rtn = Nan::Null();
    }
  }

  Handle<Value> argv[2];
  argv[0] = Nan::New<Integer>(ireq->rtn);
  argv[1] = rtn;

  Nan::TryCatch try_catch;

  Nan::New(ireq->callback)->Call(Nan::GetCurrentContext()->Global(), 2, argv);

  // cleanup
  ireq->callback.Reset();
  delete ireq;

  if (try_catch.HasCaught()) {
    FatalException(try_catch);
  }
}


void InitMPG123(Handle<Object> target) {
  Nan::HandleScope scope;

#define CONST_INT(value) \
  Nan::ForceSet(target, Nan::New<String>(#value).ToLocalChecked(), Nan::New<Integer>(value), \
      static_cast<PropertyAttribute>(ReadOnly|DontDelete));

  // mpg123_errors
  CONST_INT(MPG123_DONE);  /**< Message: Track ended. Stop decoding. */
  CONST_INT(MPG123_NEW_FORMAT);  /**< Message: Output format will be different on next call. Note that some libmpg123 versions between 1.4.3 and 1.8.0 insist on you calling mpg123_getformat() after getting this message code. Newer verisons behave like advertised: You have the chance to call mpg123_getformat(), but you can also just continue decoding and get your data. */
  CONST_INT(MPG123_NEED_MORE);  /**< Message: For feed reader: "Feed me more!" (call mpg123_feed() or mpg123_decode() with some new input data). */
  CONST_INT(MPG123_ERR);      /**< Generic Error */
  CONST_INT(MPG123_OK);       /**< Success */
  CONST_INT(MPG123_BAD_OUTFORMAT);   /**< Unable to set up output format! */
  CONST_INT(MPG123_BAD_CHANNEL);    /**< Invalid channel number specified. */
  CONST_INT(MPG123_BAD_RATE);    /**< Invalid sample rate specified.  */
  CONST_INT(MPG123_ERR_16TO8TABLE);  /**< Unable to allocate memory for 16 to 8 converter table! */
  CONST_INT(MPG123_BAD_PARAM);    /**< Bad parameter id! */
  CONST_INT(MPG123_BAD_BUFFER);    /**< Bad buffer given -- invalid pointer or too small size. */
  CONST_INT(MPG123_OUT_OF_MEM);    /**< Out of memory -- some malloc() failed. */
  CONST_INT(MPG123_NOT_INITIALIZED);  /**< You didn't initialize the library! */
  CONST_INT(MPG123_BAD_DECODER);    /**< Invalid decoder choice. */
  CONST_INT(MPG123_BAD_HANDLE);    /**< Invalid mpg123 handle. */
  CONST_INT(MPG123_NO_BUFFERS);    /**< Unable to initialize frame buffers (out of memory?). */
  CONST_INT(MPG123_BAD_RVA);      /**< Invalid RVA mode. */
  CONST_INT(MPG123_NO_GAPLESS);    /**< This build doesn't support gapless decoding. */
  CONST_INT(MPG123_NO_SPACE);    /**< Not enough buffer space. */
  CONST_INT(MPG123_BAD_TYPES);    /**< Incompatible numeric data types. */
  CONST_INT(MPG123_BAD_BAND);    /**< Bad equalizer band. */
  CONST_INT(MPG123_ERR_NULL);    /**< Null pointer given where valid storage address needed. */
  CONST_INT(MPG123_ERR_READER);    /**< Error reading the stream. */
  CONST_INT(MPG123_NO_SEEK_FROM_END);/**< Cannot seek from end (end is not known). */
  CONST_INT(MPG123_BAD_WHENCE);    /**< Invalid 'whence' for seek function.*/
  CONST_INT(MPG123_NO_TIMEOUT);    /**< Build does not support stream timeouts. */
  CONST_INT(MPG123_BAD_FILE);    /**< File access error. */
  CONST_INT(MPG123_NO_SEEK);     /**< Seek not supported by stream. */
  CONST_INT(MPG123_NO_READER);    /**< No stream opened. */
  CONST_INT(MPG123_BAD_PARS);    /**< Bad parameter handle. */
  CONST_INT(MPG123_BAD_INDEX_PAR);  /**< Bad parameters to mpg123_index() and mpg123_set_index() */
  CONST_INT(MPG123_OUT_OF_SYNC);  /**< Lost track in bytestream and did not try to resync. */
  CONST_INT(MPG123_RESYNC_FAIL);  /**< Resync failed to find valid MPEG data. */
  CONST_INT(MPG123_NO_8BIT);  /**< No 8bit encoding possible. */
  CONST_INT(MPG123_BAD_ALIGN);  /**< Stack aligmnent error */
  CONST_INT(MPG123_NULL_BUFFER);  /**< NULL input buffer with non-zero size... */
  CONST_INT(MPG123_NO_RELSEEK);  /**< Relative seek not possible (screwed up file offset) */
  CONST_INT(MPG123_NULL_POINTER); /**< You gave a null pointer somewhere where you shouldn't have. */
  CONST_INT(MPG123_BAD_KEY);   /**< Bad key value given. */
  CONST_INT(MPG123_NO_INDEX);  /**< No frame index in this build. */
  CONST_INT(MPG123_INDEX_FAIL);  /**< Something with frame index went wrong. */
  CONST_INT(MPG123_BAD_DECODER_SETUP);  /**< Something prevents a proper decoder setup */
  CONST_INT(MPG123_MISSING_FEATURE);  /**< This feature has not been built into libmpg123. */
  CONST_INT(MPG123_BAD_VALUE); /**< A bad value has been given, somewhere. */
  CONST_INT(MPG123_LSEEK_FAILED); /**< Low-level seek failed. */
  CONST_INT(MPG123_BAD_CUSTOM_IO); /**< Custom I/O not prepared. */
  CONST_INT(MPG123_LFS_OVERFLOW); /**< Offset value overflow during translation of large file API calls -- your client program cannot handle that large file. */

  /* mpg123_enc_enum */
  CONST_INT(MPG123_ENC_8);
  CONST_INT(MPG123_ENC_16);
  CONST_INT(MPG123_ENC_24);
  CONST_INT(MPG123_ENC_32);
  CONST_INT(MPG123_ENC_SIGNED);
  CONST_INT(MPG123_ENC_FLOAT);
  CONST_INT(MPG123_ENC_SIGNED_16);
  CONST_INT(MPG123_ENC_UNSIGNED_16);
  CONST_INT(MPG123_ENC_UNSIGNED_8);
  CONST_INT(MPG123_ENC_SIGNED_8);
  CONST_INT(MPG123_ENC_ULAW_8);
  CONST_INT(MPG123_ENC_ALAW_8);
  CONST_INT(MPG123_ENC_SIGNED_32);
  CONST_INT(MPG123_ENC_UNSIGNED_32);
  CONST_INT(MPG123_ENC_SIGNED_24);
  CONST_INT(MPG123_ENC_UNSIGNED_24);
  CONST_INT(MPG123_ENC_FLOAT_32);
  CONST_INT(MPG123_ENC_FLOAT_64);
  CONST_INT(MPG123_ENC_ANY);

  /* mpg123_channelcount */
  CONST_INT(MPG123_MONO);
  CONST_INT(MPG123_STEREO);

  /* mpg123_channels */
  CONST_INT(MPG123_LEFT);
  CONST_INT(MPG123_RIGHT);
  CONST_INT(MPG123_LR);

  CONST_INT(MPG123_ID3);
  CONST_INT(MPG123_NEW_ID3);
  CONST_INT(MPG123_ICY);
  CONST_INT(MPG123_NEW_ICY);

  Nan::SetMethod(target, "mpg123_init", node_mpg123_init);
  Nan::SetMethod(target, "mpg123_exit", node_mpg123_exit);
  Nan::SetMethod(target, "mpg123_new", node_mpg123_new);
  Nan::SetMethod(target, "mpg123_decoders", node_mpg123_decoders);
  Nan::SetMethod(target, "mpg123_current_decoder", node_mpg123_current_decoder);
  Nan::SetMethod(target, "mpg123_supported_decoders", node_mpg123_supported_decoders);
  Nan::SetMethod(target, "mpg123_getformat", node_mpg123_getformat);
  Nan::SetMethod(target, "mpg123_safe_buffer", node_mpg123_safe_buffer);
  Nan::SetMethod(target, "mpg123_outblock", node_mpg123_outblock);
  Nan::SetMethod(target, "mpg123_framepos", node_mpg123_framepos);
  Nan::SetMethod(target, "mpg123_tell", node_mpg123_tell);
  Nan::SetMethod(target, "mpg123_tellframe", node_mpg123_tellframe);
  Nan::SetMethod(target, "mpg123_tell_stream", node_mpg123_tell_stream);
  Nan::SetMethod(target, "mpg123_open_feed", node_mpg123_open_feed);
  Nan::SetMethod(target, "mpg123_feed", node_mpg123_feed);
  Nan::SetMethod(target, "mpg123_read", node_mpg123_read);
  Nan::SetMethod(target, "mpg123_id3", node_mpg123_id3);
}

} // nodelame namespace
