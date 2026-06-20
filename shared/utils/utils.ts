import { readdir } from "fs/promises";

export async function readFile(path: string) {
  return await Bun.file(path).json();
}

export async function folderContents(path: string) {
  return await readdir(path);
}

export function sum(nums: number[]) {
  return nums.reduce((acc, curr) => acc + curr, 0);
}

export function getAvarage(nums: number[]) {
  const avg = sum(nums) / nums.length;
}
