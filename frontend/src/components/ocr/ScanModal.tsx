import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '../common/Modal';
import { CardUploader } from './CardUploader';
import { ScanProgress } from './ScanProgress';
import { ReviewForm } from './ReviewForm';
import { DuplicateAlert } from './DuplicateAlert';
import { Contact, ContactCreateInput, ExtractOCRResponse, OCRStatus } from '../../types/contact';
import { contactsApi } from '../../api/contactsApi';
import { useToast } from '../common/Toast';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedContact: Contact) => void;
  onViewExisting: (contact: Contact) => void;
}

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onViewExisting,
}) => {
  const { success, error, warning } = useToast();

  const [ocrStatus, setOcrStatus] = useState<OCRStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<Contact> | null>(null);
  const [duplicateResponse, setDuplicateResponse] = useState<ExtractOCRResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetState = () => {
    setOcrStatus('idle');
    setSelectedFile(null);
    setSelectedUrl(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setDuplicateResponse(null);
    setErrorMessage(null);
    setIsSaving(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setSelectedUrl(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    processFileOCR(file, objectUrl);
  };

  const handleUrlSubmit = (url: string) => {
    setSelectedUrl(url);
    setSelectedFile(null);
    setPreviewUrl(url);
    processUrlOCR(url);
  };

  const processFileOCR = async (file: File, _pUrl?: string) => {
    setOcrStatus('processing');
    setErrorMessage(null);
    setDuplicateResponse(null);

    try {
      const res = await contactsApi.extractFromFile(file);

      if (res.is_duplicate || res.status === 'duplicate_ignored') {
        setOcrStatus('success');
        setDuplicateResponse(res);
        setExtractedData(res.contact);
        warning('Potential Duplicate Detected', 'This card shares properties with an existing record. You can review and save as new if distinct.');
      } else {
        setOcrStatus('success');
        setExtractedData(res.contact);
        triggerConfetti();
        success('OCR Extraction Complete', 'Review the extracted contact information below.');
      }
    } catch (err: any) {
      if (err.statusCode === 504) {
        setOcrStatus('timeout');
      } else {
        setOcrStatus('failed');
      }
      setErrorMessage(err.message || 'Failed to extract text from business card.');
      error('OCR Scan Failed', err.message);
    }
  };

  const processUrlOCR = async (url: string) => {
    setOcrStatus('processing');
    setErrorMessage(null);
    setDuplicateResponse(null);

    try {
      const res = await contactsApi.extractFromUrl(url);

      if (res.is_duplicate || res.status === 'duplicate_ignored') {
        setOcrStatus('success');
        setDuplicateResponse(res);
        setExtractedData(res.contact);
        warning('Potential Duplicate Detected', 'This card shares properties with an existing record. You can review and save as new if distinct.');
      } else {
        setOcrStatus('success');
        setExtractedData(res.contact);
        triggerConfetti();
        success('OCR Extraction Complete', 'Review the extracted contact information below.');
      }
    } catch (err: any) {
      if (err.statusCode === 504) {
        setOcrStatus('timeout');
      } else {
        setOcrStatus('failed');
      }
      setErrorMessage(err.message || 'Failed to extract text from business card.');
      error('OCR Scan Failed', err.message);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981'],
      });
    } catch {
      // ignore
    }
  };

  const handleSaveContact = async (data: ContactCreateInput) => {
    setIsSaving(true);
    try {
      // If user is saving after duplicate warning, use force=true so they are not blocked
      const isOverride = !!duplicateResponse;
      const saved = await contactsApi.createContact(data, isOverride);
      success('Contact Saved', `${saved.full_name} has been added to your directory.`);
      onSuccess(saved);
      handleClose();
    } catch (err: any) {
      error('Failed to Save', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    if (selectedFile && previewUrl) {
      processFileOCR(selectedFile, previewUrl);
    } else if (selectedUrl) {
      processUrlOCR(selectedUrl);
    } else {
      resetState();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Business Card OCR Scanner"
      subtitle="Extract and verify contact information automatically using AI"
      maxWidth={extractedData ? '780px' : '620px'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Step 1: Upload Card (when idle) */}
        {ocrStatus === 'idle' && (
          <CardUploader
            onFileSelect={handleFileSelect}
            onUrlSubmit={handleUrlSubmit}
            previewUrl={previewUrl}
          />
        )}

        {/* Step 2: Processing Progress & Laser Beam */}
        {(ocrStatus === 'uploading' ||
          ocrStatus === 'processing' ||
          ocrStatus === 'failed' ||
          ocrStatus === 'timeout') && (
          <ScanProgress
            status={ocrStatus}
            previewUrl={previewUrl}
            errorMessage={errorMessage}
            onRetry={handleRetry}
            onCancel={resetState}
          />
        )}

        {/* Step 3: Duplicate Warning (if matched) */}
        {duplicateResponse && duplicateResponse.contact && (
          <DuplicateAlert
            existingContact={duplicateResponse.contact}
            onViewContact={(c) => {
              handleClose();
              onViewExisting(c);
            }}
            onContinueReview={() => {
              // Dismiss duplicate alert banner and proceed to review form
              setDuplicateResponse(null);
            }}
          />
        )}

        {/* Step 4: Data Review and Correction */}
        {ocrStatus === 'success' && extractedData && (
          <ReviewForm
            initialData={extractedData}
            previewUrl={previewUrl}
            onSave={handleSaveContact}
            onCancel={resetState}
            isSaving={isSaving}
          />
        )}
      </div>
    </Modal>
  );
};
