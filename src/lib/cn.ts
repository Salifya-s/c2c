import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

/**
 * Merge Tailwind class names, resolving conflicts so the last value wins.
 *
 * `clsx` flattens conditionals/arrays/objects; `twMerge` then drops earlier
 * classes that target the same Tailwind property. Without the merge step a
 * base `rounded-2xl` and a caller's `rounded-xl` would both survive and CSS
 * source order would decide the winner.
 */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));
