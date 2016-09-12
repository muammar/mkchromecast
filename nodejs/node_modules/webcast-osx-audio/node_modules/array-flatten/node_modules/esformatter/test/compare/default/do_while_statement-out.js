do {
  console.log(i++)
} while (i < 100);
do {
  i--
} while (i);

do n--; while (n && foo());

do n--; while (n && foo());
do ++i; while (amet(i));

// issue #256
function main() {
  do
    if (true) return 1;
  while (true);
}

function main() {
  do
    if (true) return 1;
  while (true);
}
