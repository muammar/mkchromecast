# This file is used with the GYP meta build system.
# http://code.google.com/p/gyp
# To build try this:
#   svn co http://gyp.googlecode.com/svn/trunk gyp
#   ./gyp/gyp -f make --depth=`pwd` libmp3lame.gyp
#   make
#   ./out/Debug/test

{
  'variables': { 'target_arch%': 'ia32' }, # default for node v0.6.x

  'target_defaults': {
    'default_configuration': 'Debug',
    'configurations': {
      'Debug': {
        'defines': [ 'DEBUG', '_DEBUG' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 1, # static debug
          },
        },
      },
      'Release': {
        'defines': [ 'NDEBUG' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 0, # static release
          },
        },
      }
    },
    'msvs_settings': {
      'VCLinkerTool': {
        'GenerateDebugInformation': 'true',
      },
    },

    # lame-specific stuff
    'defines': [
      'PIC',
      'HAVE_CONFIG_H'
    ],
    'include_dirs': [
      'include',
      'libmp3lame',
      'libmp3lame/vector',
      # platform and arch-specific headers
      'config/<(OS)/<(target_arch)'
    ],
    'conditions': [
      ['OS=="win"', {
        'defines': [
          'TAKEHIRO_IEEE754_HACK',
          'FLOAT8=float',
          'REAL_IS_FLOAT=1',
          'BS_FORMAT=BINARY',
        ]
      }]
    ],
  },

  'targets': [

    # liblamevectorroutines
    {
      'target_name': 'lamevectorroutines',
      'product_prefix': 'lib',
      'type': 'static_library',
      'sources': [
        'libmp3lame/vector/xmm_quantize_sub.c'
      ],
    },

    # libmp3lame
    {
      'target_name': 'mp3lame',
      'product_prefix': 'lib',
      'type': 'static_library',
      'sources': [
        'libmp3lame/VbrTag.c',
        'libmp3lame/bitstream.c',
        'libmp3lame/encoder.c',
        'libmp3lame/fft.c',
        'libmp3lame/gain_analysis.c',
        'libmp3lame/id3tag.c',
        'libmp3lame/lame.c',
        'libmp3lame/newmdct.c',
        'libmp3lame/presets.c',
        'libmp3lame/psymodel.c',
        'libmp3lame/quantize.c',
        'libmp3lame/quantize_pvt.c',
        'libmp3lame/reservoir.c',
        'libmp3lame/set_get.c',
        'libmp3lame/tables.c',
        'libmp3lame/takehiro.c',
        'libmp3lame/util.c',
        'libmp3lame/vbrquantize.c',
        'libmp3lame/version.c',
      ],
      'dependencies': [
        'lamevectorroutines',
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          'include',
          'libmp3lame',
          'libmp3lame/vector',
          # platform and arch-specific headers
          'config/<(OS)/<(target_arch)'
        ],
      },
    },

    # test program that prints the version number
    {
      'target_name': 'test',
      'type': 'executable',
      'dependencies': [ 'mp3lame' ],
      'sources': [ 'test.c' ]
    },
  ]
}
