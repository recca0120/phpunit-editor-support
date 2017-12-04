import { Detail } from './detail';

export interface Fault {
    message: string;
    type?: string;
    details?: Detail[];
}
