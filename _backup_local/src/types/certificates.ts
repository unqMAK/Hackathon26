export interface CertificateConfig {
    _id: string;
    title: string;
    subtitle: string;
    eventName: string;
    description: string;
    backgroundImage?: string;
    signature1?: {
        label: string;
        imageUrl: string;
    };
    signature2?: {
        label: string;
        imageUrl: string;
    };
    isPublished: boolean;
    updatedAt: string;
}

export interface CertificateRecord {
    _id: string;
    userId: string;
    teamId?: string;
    category: 'participation' | 'winner' | 'runner-up' | 'jury' | 'mentor' | 'spoc' | 'custom';
    pdfUrl: string;
    issuedAt: string;
}

export interface BulkGenerateResponse {
    message: string;
    results: CertificateRecord[];
    errors: { userId: string; error: string }[];
}
