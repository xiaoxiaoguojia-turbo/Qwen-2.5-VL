
// client/src/types/index.ts

export interface GenerateRequest {
    input: string;
    fileName?: string;
}

export interface GenerateResponse {
    success: boolean;
    imagePath?: string;
    fileName?: string;
}
