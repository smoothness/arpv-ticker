module.exports = {
  name: 'arpv-ticker',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/arpv-ticker',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js',
  ],
};
