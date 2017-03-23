#include <stdio.h>
#include "mpg123.h"

int main () {
  mpg123_init();
  char **decoders = (char **)mpg123_decoders();
  while (*decoders != NULL) {
    printf("%s\n", *decoders);
    decoders++;
  }
  mpg123_exit();
}
