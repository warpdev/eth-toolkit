import { atom } from 'jotai';
import { DecodingHistoryRecord } from '@/lib/storage/abi-storage';

export const decodingHistoryAtom = atom<DecodingHistoryRecord[]>([]);

export const isHistoryPanelOpenAtom = atom<boolean>(false);