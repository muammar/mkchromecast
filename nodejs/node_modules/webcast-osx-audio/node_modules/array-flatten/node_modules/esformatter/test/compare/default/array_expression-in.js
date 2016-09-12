[

];

[1,2,3];

[1,2,[3,4,[5,6,[7,8,9]]]];

function fn(){
    return [4,5,[6,  7 , 8 ]];
}

// issue #12
var tuples = [
    // comment test
    ["resolve", "done", "bla", "resolved"],
        ["reject", "fail", "lorem", "rejected"],
    [
["lorem", "ipsum"]
    ],
["notify", "progress", "ipsum"]
];

var x,
  y = [
    "a",
    "b",
    "c"
  ];

// rocambole issue with sparse arrays
;[,3,[,4]];
// sparse arrays indentation is tricky!
;[
,
3,
[,,
,
4
]];
;[
,
3,
[,
4
]
];

// issue #165 (MemberExpression)
[
    "grunt-contrib-concat",
    "grunt-contrib-watch",
    "grunt-contrib-jshint",
    "grunt-contrib-qunit"
].forEach(function( task ) {
    grunt.loadNpmTasks( task );
});

// issue #224
var fa = [ {
foo: 'bar',
baz: 'yak'
}, {
foo: '1',
baz: '2'
} ];

// issue #239
var data = [1,
2];
