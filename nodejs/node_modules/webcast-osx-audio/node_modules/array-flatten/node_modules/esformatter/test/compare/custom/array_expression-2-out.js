[];

[
  1
  ,
  2
  ,
  3
]
;

[
  1
  ,
  2
  ,
  [
    3
    ,
    4
    ,
    [
      5
      ,
      6
      ,
      [
        7
        ,
        8
        ,
        9
      ]
    ]
  ]
]
;

function fn() {
  // IMPORTANT: we can't break lines here because of ASI!!!
  return [
    4
    ,
    5
    ,
    [
      6
      ,
      7
      ,
      8
    ]
  ];
}

// issue #12
var tuples = [
  // comment test
  [
    "resolve"
    ,
    "done"
    ,
    "bla"
    ,
    "resolved"
  ]
  ,
  [
    "reject"
    ,
    "fail"
    ,
    "lorem"
    ,
    "rejected"
  ]
  ,
  [
    [
      "lorem"
      ,
      "ipsum"
    ]
  ]
  ,
  [
    "notify"
    ,
    "progress"
    ,
    "ipsum"
  ]
]
;
