#include <v8.h>
#include <node.h>
#include "mpg123.h"

namespace nodelame {

/* structs used for async decoding */
struct feed_req {
  uv_work_t req;
  mpg123_handle *mh;
  const unsigned char *in;
  size_t size;
  int rtn;
  Nan::Persistent<v8::Function> callback;
};

struct read_req {
  uv_work_t req;
  mpg123_handle *mh;
  unsigned char *out;
  size_t size;
  size_t done;
  int rtn;
  int meta;
  Nan::Persistent<v8::Function> callback;
};

struct id3_req {
  uv_work_t req;
  mpg123_handle *mh;
  mpg123_id3v1 *v1;
  mpg123_id3v2 *v2;
  int rtn;
  Nan::Persistent<v8::Function> callback;
};

void node_mpg123_feed_async (uv_work_t *);
void node_mpg123_feed_after (uv_work_t *);

void node_mpg123_read_async (uv_work_t *);
void node_mpg123_read_after (uv_work_t *);

void node_mpg123_id3_async (uv_work_t *);
void node_mpg123_id3_after (uv_work_t *);

} // nodelame namespace
