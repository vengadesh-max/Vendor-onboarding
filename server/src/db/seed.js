import { loadEnv } from '../config/env.js';
import { getRepository } from './repository.js';

loadEnv();
const repo = getRepository();
await repo.ensureReady();
const counts = await repo.counts();
console.log(`DB mode: ${repo.mode}, vendors: ${counts.vendors}, runs: ${counts.runs}`);
