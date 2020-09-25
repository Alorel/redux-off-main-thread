const {builtinModules} = require('module');
const pkgJson = require('../../package.json');
const {_buildGetProjects, _buildPkgJsonFor} = require('./_syncPkg');

exports._buildBaseExternals = Array.from(
  new Set(
    Object.keys(pkgJson.dependencies || {})
      .concat(Object.keys(pkgJson.peerDependencies || {}))
      .filter(p => !p.startsWith('@types/'))
      .concat(...builtinModules, ..._buildGetProjects().map(p => _buildPkgJsonFor(p)[0].name))
  )
);

exports._buildUmdExternals = exports._buildBaseExternals
  .filter(e => e !== 'tslib');

Object.defineProperty(exports, '__esModule', {value: true});
