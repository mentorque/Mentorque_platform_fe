// src/pages/APIKeys.tsx
import { useState, useEffect } from 'react';
import { listenToAuth } from '@/lib/auth';
import { apiClient } from '@/lib/apiClient';
import { Eye, EyeOff, Copy, Trash2, Plus, Key, CheckCircle2, FolderOpen, Download, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import Protected from '@/shared/components/Protected';
import Navbar from '@/shared/components/Navbar';

interface APIKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
}

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = listenToAuth(async (user) => {
      if (user) {
        await checkVerificationStatus();
        await fetchAPIKeys();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const res = await apiClient.get('/api/users/me/verification');
      if (res.ok) {
        const data = await res.json();
        setIsVerified(data.verifiedByAdmin);
      } else {
        setIsVerified(false);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setIsVerified(false);
    }
  };

  const fetchAPIKeys = async () => {
    try {
      const response = await apiClient.get('/api/keys');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch app passwords');
      }
      const data = await response.json();
      setApiKeys(data.keys || []);
    } catch (error: any) {
      console.error('Error fetching app passwords:', error);
      toast.error(error.message || 'Failed to load app passwords');
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }

    setIsCreating(true);
    try {
      const response = await apiClient.post('/api/keys', { name: newKeyName });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create app password');
      }
      
      const data = await response.json();
      if (data.key) {
        setNewKeyName('');
        toast.success('App password created successfully!');
        
        // Auto-copy to clipboard
        navigator.clipboard.writeText(data.key.key);
        
        // Show the newly created key temporarily
        const newKeyId = data.key.id;
        
        // Refetch all keys from database to keep in sync
        await fetchAPIKeys();
        
        // Show and highlight the new key
        setShowKey({ ...showKey, [newKeyId]: true });
        setCopiedKeyId(newKeyId);
        setTimeout(() => setCopiedKeyId(null), 3000);
      }
    } catch (error: any) {
      console.error('Error creating app password:', error);
      toast.error(error.message || 'Failed to create app password');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this app password? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiClient.delete(`/api/keys/${keyId}`);

      if (!response.ok) {
        throw new Error('Failed to delete app password');
      }
      
      toast.success('App password deleted successfully');
      
      // Refetch all keys from database to keep in sync
      await fetchAPIKeys();
    } catch (error) {
      console.error('Error deleting app password:', error);
      toast.error('Failed to delete app password');
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKeyId(null), 3000);
  };

  const toggleShowKey = (keyId: string) => {
    setShowKey({ ...showKey, [keyId]: !showKey[keyId] });
  };

  const maskKey = (key: string) => {
    if (key.length < 16) return key;
    return `${key.substring(0, 8)}${'•'.repeat(32)}${key.substring(key.length - 4)}`;
  };

  const handleDownloadZip = () => {
    // File in public folder - direct download, no backend/CDN
    const filename = 'Mentorque-Extension-Feb-23.zip';
    const a = document.createElement('a');
    a.href = `/${filename}`;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Download started');
  };

  if (loading) {
    return (
      <Protected>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-700 border-t-blue-500"></div>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <Navbar />
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">App Passwords</h1>
            <p className="text-gray-400">
              Manage your app passwords for the Mentorque Chrome Extension
            </p>
          </div>

          {/* Latest Dist - AI extension zip download */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-semibold text-white">Latest AI Extension</h2>
                    <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                      Last updated Feb 23 2026
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Click the button to download our latest AI extension build.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  Download zip
                </button>
                <a
                  href="https://drive.google.com/file/d/1m6yZgXGXhbxzr9Pungh6TaLImz8dVj66/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium border border-gray-600"
                >
                  <BookOpen className="w-5 h-5" />
                  Setup guide
                </a>
              </div>
            </div>
          </div>

          {/* Verification Check */}
          {isVerified === false && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-200 mb-2">
                    Admin Approval Needed
                  </h3>
                  <p className="text-yellow-200/90">
                    Your account is pending admin approval. Please contact the administrator and come back once you have been approved to create app passwords.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Create New App Password Section */}
          {isVerified !== false && (
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                <Plus className="w-5 h-5 text-blue-400" />
                Create New App Password
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="App password name (e.g., Chrome Extension)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 bg-white text-black focus:ring-blue-400"
                  onKeyPress={(e) => e.key === 'Enter' && createAPIKey()}
                  maxLength={50}
                />
                <button
                  onClick={createAPIKey}
                  disabled={isCreating || !newKeyName.trim() || !isVerified}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      Create Password
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                💡 Name your app password to help identify where it&apos;s being used (max 5)
              </p>
            </div>
          )}

          {/* App Passwords List */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">Your App Passwords</h2>
              <p className="text-sm text-gray-400 mt-1">
                {apiKeys.length} {apiKeys.length === 1 ? 'password' : 'passwords'} active
              </p>
            </div>

            {apiKeys.length === 0 ? (
              <div className="p-12 text-center">
                <Key className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  No App Passwords Yet
                </h3>
                <p className="text-gray-500">
                  Create your first app password to use with the Chrome Extension
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-6 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-white">{key.name}</h3>
                        <p className="text-sm text-gray-400">
                          Created {new Date(key.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}`}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteAPIKey(key.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete App Password"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-sm bg-black/40 border border-gray-700 text-gray-200 px-4 py-2 rounded-lg overflow-x-auto">
                        {showKey[key.id] ? key.key : maskKey(key.key)}
                      </div>
                      <button
                        onClick={() => toggleShowKey(key.id)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        title={showKey[key.id] ? 'Hide password' : 'Show password'}
                      >
                        {showKey[key.id] ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.key, key.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          copiedKeyId === key.id
                            ? 'text-green-400 bg-green-500/10'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700'
                        }`}
                        title="Copy to clipboard"
                      >
                        {copiedKeyId === key.id ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {showKey[key.id] && (
                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-200">
                          ⚠️ <strong>Warning:</strong> Keep this password secure! It provides access to your account.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions Section */}
          <div className="mt-6 bg-gray-900 border border-blue-500/30 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              How to use your app password
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
              <li>Install the Mentorque Chrome Extension from the Chrome Web Store</li>
              <li>Click on the extension icon in your browser</li>
              <li>Select &quot;Login with App Password&quot;</li>
              <li>Copy and paste your app password from above</li>
              <li>Start using the extension on LinkedIn job pages!</li>
            </ol>
          </div>
        </div>
      </div>
    </Protected>
  );
}