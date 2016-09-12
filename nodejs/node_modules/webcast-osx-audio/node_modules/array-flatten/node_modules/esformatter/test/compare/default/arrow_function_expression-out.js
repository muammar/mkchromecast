arr.map(a => a * 2);
arr.map(b => {
  return b * 2;
});
arr.map((c, i) => {
  return c * i;
});
arr.map(d => {
  return d * 2;
});
arr.map((e, f, g) => e * f - g);

// default params (#285)
let defaultParams = (x, y = 1, z = 2) => {
  return x + y + z;
}

// issue #393
a = () => {
  test(() => {
    return 1
  })
  test(() => {
    return 1
  })
}

// issue #357
const object = x => ({
  x
});

const retObject = x => {
  return {
    x
  };
}

const array = x => [
  x
];

const callWithObject = x => f({
  x
});
