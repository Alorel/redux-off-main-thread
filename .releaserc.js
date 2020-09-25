const projectNames = require('./build/rollup/_syncPkg')._buildGetProjects()

const NPM = '@semantic-release/npm';
const GH = '@semantic-release/github';

function exec(cmd) {
  return {
    cmd,
    path: '@semantic-release/exec'
  }
}

module.exports = {
  generateNotes: {
    config: '@alorel-personal/conventional-changelog-alorel'
  },
  prepare: [
    '@semantic-release/changelog',
    NPM,
    exec('yarn run sync-pkg'),
    exec('yarn run doctoc'),
    {
      assets: [
        'CHANGELOG.md',
        'README.md',
        'package.json',
        'yarn.lock',
        ...projectNames.map(n => `projects/${n}/package.json`)
      ],
      message: 'chore(release): ${nextRelease.version}',
      path: '@semantic-release/git'
    },
    exec('yarn run rollup')
  ],
  publish: [
    ...projectNames.map(p => exec(`bash -c "cd dist/${p} && npm publish"`)),
    GH
  ],
  tagFormat: '${version}',
  verifyConditions: [
    {path: NPM, pkgRoot: '.'},
    GH
  ]
};
