# This file is used with the GYP meta build system.
# http://code.google.com/p/gyp
# To build try this:
#   svn co http://gyp.googlecode.com/svn/trunk gyp
#   ./gyp/gyp -f make --depth=. mpg123.gyp
#   make
#   ./out/Debug/test

{
  'variables': {
    'target_arch%': 'ia32',
  },
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
    'conditions': [
      ['OS=="mac"', {
        'conditions': [
          ['target_arch=="ia32"', { 'xcode_settings': { 'ARCHS': [ 'i386' ] } }],
          ['target_arch=="x64"', { 'xcode_settings': { 'ARCHS': [ 'x86_64' ] } }]
        ],
      }],
    ]
  },

  'targets': [
    {
      'target_name': 'mpg123',
      'product_prefix': 'lib',
      'type': 'static_library',
      'variables': {
        'conditions': [
          # "mpg123_cpu" is the cpu optimization to use
          # Windows uses "i386_fpu" even on x64 to avoid compiling .S asm files
          # (I don't think the 64-bit ASM files are compatible with `ml`/`ml64`...)
          ['OS=="win"', { 'mpg123_cpu%': 'i386_fpu' },
          { 'conditions': [
            ['target_arch=="arm"', { 'mpg123_cpu%': 'arm_nofpu' }],
            ['target_arch=="ia32"', { 'mpg123_cpu%': 'i386_fpu' }],
            ['target_arch=="x64"', { 'mpg123_cpu%': 'x86-64' }],
          ]}],
        ]
      },
      'sources': [
        'src/libmpg123/compat.c',
        'src/libmpg123/parse.c',
        'src/libmpg123/frame.c',
        'src/libmpg123/format.c',
        'src/libmpg123/dct64.c',
        'src/libmpg123/equalizer.c',
        'src/libmpg123/id3.c',
        'src/libmpg123/optimize.c',
        'src/libmpg123/readers.c',
        'src/libmpg123/tabinit.c',
        'src/libmpg123/libmpg123.c',
        'src/libmpg123/index.c',
        'src/libmpg123/stringbuf.c',
        'src/libmpg123/icy.c',
        'src/libmpg123/icy2utf8.c',
        'src/libmpg123/ntom.c',
        'src/libmpg123/synth.c',
        'src/libmpg123/synth_8bit.c',
        'src/libmpg123/layer1.c',
        'src/libmpg123/layer2.c',
        'src/libmpg123/layer3.c',
        'src/libmpg123/feature.c',
      ],
      'include_dirs': [
        'src/libmpg123',
        # platform and arch-specific headers
        'config/<(OS)/<(target_arch)',
      ],
      'defines': [
        'PIC',
        'NOXFERMEM',
        'HAVE_CONFIG_H',
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          'src/libmpg123',
          # platform and arch-specific headers
          'config/<(OS)/<(target_arch)',
        ]
      },
      'conditions': [
        ['mpg123_cpu=="arm_nofpu"', {
          'defines': [
            'OPT_ARM',
            'REAL_IS_FIXED',
            'NEWOLD_WRITE_SAMPLE',
          ],
          'sources': [
            'src/libmpg123/synth_arm.S',
          ],
        }],
        ['mpg123_cpu=="i386_fpu"', {
          'defines': [
            'OPT_I386',
            'REAL_IS_FLOAT',
            'NEWOLD_WRITE_SAMPLE',
          ],
          'sources': [
            'src/libmpg123/synth_s32.c',
            'src/libmpg123/synth_real.c',
            'src/libmpg123/dct64_i386.c',
          ],
        }],
        ['mpg123_cpu=="x86-64"', {
          'defines': [
            'OPT_X86_64',
            'REAL_IS_FLOAT',
          ],
          'sources': [
            'src/libmpg123/dct64_x86_64.S',
            'src/libmpg123/dct64_x86_64_float.S',
            'src/libmpg123/synth_s32.c',
            'src/libmpg123/synth_real.c',
            'src/libmpg123/synth_stereo_x86_64.S',
            'src/libmpg123/synth_stereo_x86_64_float.S',
            'src/libmpg123/synth_stereo_x86_64_s32.S',
            'src/libmpg123/synth_x86_64.S',
            'src/libmpg123/synth_x86_64_s32.S',
            'src/libmpg123/synth_x86_64_float.S',
          ],
        }],
      ],
    },

    {
      'target_name': 'output',
      'product_prefix': 'lib',
      'type': 'static_library',
      'variables': {
        'conditions': [
          # "mpg123_backend" is the audio backend to use
          ['OS=="mac"', { 'mpg123_backend%': 'coreaudio' }],
          ['OS=="win"', { 'mpg123_backend%': 'win32' }],
          ['OS=="linux"', { 'mpg123_backend%': 'alsa' }],
          ['OS=="freebsd"', { 'mpg123_backend%': 'alsa' }],
          ['OS=="solaris"', { 'mpg123_backend%': 'sun' }],
        ]
      },
      'include_dirs': [
        'src',
        'src/output',
        'src/libmpg123',
        # platform and arch-specific headers
        'config/<(OS)/<(target_arch)',
      ],
      'defines': [
        'PIC',
        'NOXFERMEM',
        'REAL_IS_FLOAT',
        'HAVE_CONFIG_H',
        'BUILDING_OUTPUT_MODULES=1'
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          'src',
          'src/output',
          'src/libmpg123',
          # platform and arch-specific headers
          'config/<(OS)/<(target_arch)',
        ]
      },
      'conditions': [
        ['mpg123_backend=="alsa"', {
          'link_settings': {
            'libraries': [
              '-lasound',
            ]
          }
        }],
        ['mpg123_backend=="coreaudio"', {
          'link_settings': {
            'libraries': [
              '-framework AudioToolbox',
              '-framework AudioUnit',
              '-framework CoreServices',
            ],
          },
        }],
        ['mpg123_backend=="openal"', {
          'defines': [
            'OPENAL_SUBDIR_OPENAL'
          ],
          'link_settings': {
            'libraries': [
              '-framework OpenAL',
            ]
          }
        }],
        ['mpg123_backend=="win32"', {
          'link_settings': {
            'libraries': [
              '-lwinmm.lib',
            ],
          }
        }],
      ],
      'sources': [ 'src/output/<(mpg123_backend).c' ],
    },

    {
      'target_name': 'test',
      'type': 'executable',
      'dependencies': [ 'mpg123' ],
      'sources': [ 'test.c' ]
    },

    {
      'target_name': 'output_test',
      'type': 'executable',
      'dependencies': [ 'output' ],
      'sources': [ 'test_output.c' ]
    }
  ]
}
