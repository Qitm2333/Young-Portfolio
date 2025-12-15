// Define a shared data structure to ensure media links are always synced
import { MOTION_DATA } from './motion';
import { UIUX_DATA } from './uiux';
import { GRAPH_DATA } from './graph';
import { DEV_DATA } from './dev';
import { PHOTOGRAPH_DATA } from './photograph';
import { PRACTICE_DATA } from './practice';

export const PROJECT_DATA = [
  ...MOTION_DATA,
  ...PHOTOGRAPH_DATA,
  ...UIUX_DATA,
  ...GRAPH_DATA,
  ...DEV_DATA,
  ...PRACTICE_DATA
];
