var o = { p : 1 };
delete o.p;
if (o.hasOwnProperty('p')) {
    throw new Error('delete broke');
}
