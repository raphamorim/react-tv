const fs = require('fs');
const path = require('path');
const Table = require('cli-table');

const files = ['react-tv.development.js', 'react-tv.production.js'];

const sizeInfo = ['size'];
const table = new Table({
  head: ['rel'].concat(files),
  colWidths: [20, 20, 20],
});

files.forEach(file => {
  const stats = fs.statSync(path.resolve('packages/react-tv/dist/', file));
  const size = stats.size;
  const i = Math.floor(Math.log(stats.size) / Math.log(1024));
  sizeInfo.push(
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
      ' ' +
      ['B', 'KB', 'MB', 'GB', 'TB'][i]
  );
});

table.push(sizeInfo);

console.log(table.toString());
