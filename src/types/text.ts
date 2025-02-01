// src/types/text.ts

export enum TextForm {
    PROSE = 'PROSE',
    POETRY = 'POETRY',
    DRAMA = 'DRAMA',
    OTHER = 'OTHER'
}

export enum PrimaryType {
    NARRATIVE = 'NARRATIVE',
    INFORMATIONAL = 'INFORMATIONAL',
    PERSUASIVE = 'PERSUASIVE',
    OTHER = 'OTHER'
}

export enum Genre {
    FANTASY = 'FANTASY',
    MYTHOLOGY = 'MYTHOLOGY',
    REALISTIC = 'REALISTIC',
    HISTORICAL = 'HISTORICAL',
    TECHNICAL = 'TECHNICAL',
    BIOGRAPHY = 'BIOGRAPHY',
    ADVENTURE = 'ADVENTURE',
    MYSTERY = 'MYSTERY',
    NONFICTION = 'NONFICTION',
    OTHER = 'OTHER'
}

export interface TextChunk {
    id: string;
    content: string;
    is_first: boolean;
    word_count: number;
    next_chunk_id: string | null;
}

export interface Text {
    id: string;
    title: string;
    grade_level: number;
    form: TextForm;
    primary_type: PrimaryType;
    genres: Genre[];
    chunk_count: number;
    avg_unit_length: string;
    created_at: string;
    updated_at: string;
}

export interface TextMetadata {
    grade_level: number;
    form: TextForm;
    primary_type: PrimaryType;
    genres: Set<Genre>;
}

export interface CreateTextPayload {
    metadata: TextMetadata;
    content: string;
}

export interface TextState {
    texts: Text[];
    selectedText: Text | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        grade_level: number | null;
        form: TextForm | null;
        type: PrimaryType | null;
        genre: Genre | null;
    };
}