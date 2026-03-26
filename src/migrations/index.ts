import * as migration_20260324_153917 from './20260324_153917';
import * as migration_20260324_200000 from './20260324_200000';
import * as migration_20260326_032803 from './20260326_032803';

export const migrations = [
  {
    up: migration_20260324_153917.up,
    down: migration_20260324_153917.down,
    name: '20260324_153917',
  },
  {
    up: migration_20260324_200000.up,
    down: migration_20260324_200000.down,
    name: '20260324_200000',
  },
  {
    up: migration_20260326_032803.up,
    down: migration_20260326_032803.down,
    name: '20260326_032803'
  },
];
