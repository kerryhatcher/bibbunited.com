import * as migration_20260324_200000 from './20260324_200000';
import * as migration_20260325_022815_add_excerpt_field from './20260325_022815_add_excerpt_field';

export const migrations = [
  {
    up: migration_20260324_200000.up,
    down: migration_20260324_200000.down,
    name: '20260324_200000',
  },
  {
    up: migration_20260325_022815_add_excerpt_field.up,
    down: migration_20260325_022815_add_excerpt_field.down,
    name: '20260325_022815_add_excerpt_field'
  },
];
