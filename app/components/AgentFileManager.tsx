"use client";

import React, { useState, useEffect } from 'react';

interface AgentFile {
  id: number;
  agent_id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  upload_status: string;
  processing_status: string;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  agent_name?: string;
  display_name?: string;
}

interface AgentFileManagerProps {
  agentId: string | null;
}

export default function AgentFileManager({ agentId }: AgentFileManagerProps) {
  const [files, setFiles] = useState<AgentFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Fetch files when agent changes
  useEffect(() => {
    if (agentId) {
      fetchFiles();
    } else {
      setFiles([]);
    }
  }, [agentId]);

  const fetchFiles = async () => {
    if (!agentId) return;
    
    setLoading(true);
    try {
      // Use the bridge endpoint that tries database first, then enhanced backend
      const response = await fetch(`/api/agent-files-bridge?agent_id=${agentId}`);
      const data = await response.json();
      
      if (response.ok) {
        setFiles(data.files || []);
        console.log(`📁 Loaded ${data.files?.length || 0} files for agent ${agentId}`, {
          source: data.source || 'database',
          message: data.message
        });
      } else {
        console.error('Error fetching files:', data.error);
        setFiles([]);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      setSelectedFiles(Array.from(fileList));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !agentId) return;

    setUploading(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      // Upload files one by one to track individual progress
      for (const file of selectedFiles) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('agent_id', agentId);

          const response = await fetch('/api/agent-files', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            successCount++;
          } else {
            failureCount++;
            const data = await response.json();
            console.error(`Upload failed for ${file.name}:`, data.error);
          }
        } catch (error) {
          failureCount++;
          console.error(`Upload error for ${file.name}:`, error);
        }
      }

      // Show results
      if (successCount > 0 && failureCount === 0) {
        alert(`Successfully uploaded ${successCount} file(s)`);
      } else if (successCount > 0 && failureCount > 0) {
        alert(`Uploaded ${successCount} file(s) successfully, ${failureCount} failed`);
      } else {
        alert(`All ${failureCount} file(s) failed to upload`);
      }

      // Clear selected files and refresh list
      setSelectedFiles([]);
      fetchFiles();
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!agentId) return;
    
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/agent-files?file_id=${fileId}&agent_id=${agentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchFiles(); // Refresh file list
      } else {
        const data = await response.json();
        console.error('Delete failed:', data.error);
        alert('Delete failed: ' + data.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed: ' + error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'var(--success-color)';
      case 'processing': return 'var(--warning-color)';
      case 'processed': return 'var(--success-color)';
      case 'failed': return 'var(--error-color)';
      default: return 'var(--text-tertiary)';
    }
  };

  if (!agentId) {
    return (
      <div style={{
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        background: 'var(--surface-secondary)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--border-color)'
      }}>
        Please select an agent to manage files
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--surface-primary)',
      borderRadius: 'var(--border-radius)',
      border: '1px solid var(--border-color)',
      overflow: 'hidden'
    }}>
      {/* Upload Section */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--surface-secondary)'
      }}>
        <h3 style={{
          margin: '0 0 var(--spacing-md) 0',
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)'
        }}>
          Upload Files for Agent
        </h3>
        
        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? 'var(--primary-color)' : 'var(--border-color)'}`,
            borderRadius: 'var(--border-radius)',
            padding: 'var(--spacing-xl)',
            textAlign: 'center',
            background: dragActive ? 'var(--primary-color-light)' : 'var(--surface-primary)',
            transition: 'all 0.2s ease',
            marginBottom: 'var(--spacing-md)'
          }}
        >
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            📁 Drop files here or click to select
          </div>
          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.docx,.txt,.csv,.json,.md"
            multiple
            style={{ display: 'none' }}
          />
          <button
            onClick={() => document.getElementById('file-input')?.click()}
            style={{
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--border-radius)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Choose File
          </button>
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div style={{
            background: 'var(--surface-primary)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)',
            marginBottom: 'var(--spacing-md)'
          }}>
            <div style={{
              padding: 'var(--spacing-md)',
              borderBottom: '1px solid var(--border-color)',
              fontWeight: 500,
              color: 'var(--text-primary)'
            }}>
              Selected Files ({selectedFiles.length})
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {selectedFiles.map((file, index) => (
                <div key={index} style={{
                  padding: 'var(--spacing-md)',
                  borderBottom: index < selectedFiles.length - 1 ? '1px solid var(--border-color)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                    style={{
                      background: 'var(--error-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--border-radius)',
                      padding: 'var(--spacing-xs) var(--spacing-sm)',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>
              <button
                onClick={handleUpload}
                disabled={uploading}
                style={{
                  background: uploading ? 'var(--text-tertiary)' : 'var(--success-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--border-radius)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginLeft: 'var(--spacing-sm)'
                }}
              >
                {uploading ? `Uploading ${selectedFiles.length} file(s)...` : `Upload ${selectedFiles.length} file(s)`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Files List */}
      <div style={{ padding: 'var(--spacing-lg)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--spacing-md)'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}>
            Uploaded Files ({files.length})
          </h4>
          <button
            onClick={fetchFiles}
            disabled={loading}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--border-radius)',
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            color: 'var(--text-secondary)'
          }}>
            Loading files...
          </div>
        ) : files.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            color: 'var(--text-secondary)',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border-color)'
          }}>
            No files uploaded yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {files.map((file) => (
              <div
                key={file.id}
                style={{
                  background: 'var(--surface-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  padding: 'var(--spacing-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 500,
                    marginBottom: '4px',
                    color: 'var(--text-primary)'
                  }}>
                    {file.original_filename}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    flexWrap: 'wrap'
                  }}>
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>{file.file_type.toUpperCase()}</span>
                    <span>Uploaded: {formatDate(file.created_at)}</span>
                    <span style={{ color: getStatusColor(file.processing_status) }}>
                      Status: {file.processing_status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(file.id)}
                  title="Delete file"
                  style={{
                    background: 'var(--error-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--border-radius)',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginLeft: 'var(--spacing-md)'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
