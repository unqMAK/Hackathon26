import api from '@/lib/api';
import { CertificateConfig, CertificateRecord, BulkGenerateResponse } from '@/types/certificates';

export const getCertificateConfig = async (): Promise<CertificateConfig> => {
    const { data } = await api.get('/certificates/config');
    return data;
};

export const updateCertificateConfig = async (config: Partial<CertificateConfig>): Promise<CertificateConfig> => {
    const { data } = await api.put('/certificates/config', config);
    return data;
};

export const generateCertificates = async (payload: {
    category: string;
    userIds?: string[];
    teamIds?: string[];
}): Promise<BulkGenerateResponse> => {
    const { data } = await api.post('/certificates/generate', payload);
    return data;
};

export const getMyCertificates = async (): Promise<CertificateRecord[]> => {
    const { data } = await api.get('/certificates/my');
    return data;
};

export const downloadCertificate = async (id: string, fileName: string) => {
    try {
        const response = await api.get(`/certificates/${id}/download`, {
            responseType: 'blob',
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Download failed', error);
        throw error;
    }
};
