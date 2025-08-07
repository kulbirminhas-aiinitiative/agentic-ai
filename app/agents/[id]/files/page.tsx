'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ModernNavigation from '../../../components/ModernNavigation';

interface Agent {
  id: number;
  name: string;
  description: string;
  rag_architecture: string;
  model: string;
  status: string;
}

interface FileInfo {
  name: string;
  size: number;
  uploaded_at: string;
  type: string;
}

export default function AgentFilesPage() {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (agentId) {
      loadAgentAndFiles();
    }
  }, [agentId]);

  const loadAgentAndFiles = async () => {
    try {
      setLoading(true);
      
      // Load agent details
      const agentResponse = await fetch('/api/agents');
      const agents = await agentResponse.json();
      const currentAgent = agents.find((a: Agent) => a.id === parseInt(agentId));
      
      if (!currentAgent) {
        setError('Agent not found');
        return;
      }
      
      setAgent(currentAgent);

      // Load agent files from the backend
      const filesResponse = await fetch(`/api/agents/${agentId}/files`);
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        console.log('Loaded files data:', filesData);
        
        // Transform backend file format to frontend format
        const transformedFiles = filesData.files?.map((file: any) => ({
          name: file.filename || file.original_filename,
          size: file.file_size,
          uploaded_at: new Date(file.created_at * 1000).toISOString(), // Convert Unix timestamp
          type: file.file_type || 'unknown'
        })) || [];
        
        setFiles(transformedFiles);
        console.log('Set files:', transformedFiles);
      } else {
        console.error('Failed to load files:', filesResponse.status);
        setFiles([]);
      }
      
    } catch (error) {
      console.error('Error loading agent files:', error);
      setError('Failed to load agent files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    try {
      setUploading(true);
      
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/agents/${agentId}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      // Reload files after upload
      await loadAgentAndFiles();
      alert('Files uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload files');
    } finally {
      setUploading(false);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div>
        <ModernNavigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Loading agent files...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ModernNavigation />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
              <div className="text-red-400 font-medium">Error</div>
              <div className="text-red-300">{error}</div>
            </div>
            <button
              onClick={() => router.push('/agents')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Back to Agents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ModernNavigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/agents')}
              className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
            >
              ← Back to Agents
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">
              Files for Agent: {agent?.name}
            </h1>
            <p className="text-gray-400">{agent?.description}</p>
          </div>

          {/* File Upload Area */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4">Upload Files</h3>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-400/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="text-4xl text-gray-400">📁</div>
                <div className="text-gray-300">
                  <p className="text-lg font-medium">
                    Drag and drop files here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      click to browse
                    </button>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports: PDF, TXT, DOCX, CSV, JSON, and more
                  </p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  className="hidden"
                  accept=".pdf,.txt,.docx,.doc,.csv,.json,.md,.html,.xml"
                />
                
                {uploading && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span>Uploading files...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Uploaded Files</h3>
            </div>
            
            <div className="p-6">
              {files.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl text-gray-500 mb-4">📄</div>
                  <div className="text-gray-400">
                    <p className="text-lg font-medium mb-2">No files uploaded yet</p>
                    <p className="text-sm">Upload some files to get started with this agent's knowledge base.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">
                          {file.type === 'pdf' ? '📕' : 
                           file.type === 'txt' ? '📄' : 
                           file.type === 'docx' ? '📘' : 
                           file.type === 'csv' ? '📊' : '📄'}
                        </div>
                        <div>
                          <div className="text-white font-medium">{file.name}</div>
                          <div className="text-gray-400 text-sm">
                            {formatFileSize(file.size)} • Uploaded {formatDate(file.uploaded_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="text-blue-400 hover:text-blue-300 px-3 py-1 text-sm">
                          View
                        </button>
                        <button className="text-red-400 hover:text-red-300 px-3 py-1 text-sm">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* File Processing Status */}
          <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Processing Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
                <div className="text-green-400 font-medium">Processed</div>
                <div className="text-2xl font-bold text-green-300">{files.length}</div>
                <div className="text-green-300 text-sm">Files ready for RAG</div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
                <div className="text-yellow-400 font-medium">Processing</div>
                <div className="text-2xl font-bold text-yellow-300">0</div>
                <div className="text-yellow-300 text-sm">Files being indexed</div>
              </div>
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                <div className="text-red-400 font-medium">Failed</div>
                <div className="text-2xl font-bold text-red-300">0</div>
                <div className="text-red-300 text-sm">Files with errors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
