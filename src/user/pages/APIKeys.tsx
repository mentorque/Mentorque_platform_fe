// src/pages/APIKeys.tsx
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Eye, EyeOff, Copy, Trash2, Plus, Key, CheckCircle2 } from 'lucide-react';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const auth = getAuth();

  useEffect(() => {
    // Listen to auth state changes and fetch keys when user is authenticated
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('Auth state changed: User authenticated, fetching verification status...');
        await checkVerificationStatus(user);
        await fetchAPIKeys(user);
      } else {
        console.log('Auth state changed: No user authenticated');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkVerificationStatus = async (user?: any) => {
    try {
      const currentUser = user || auth.currentUser;
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_URL}/api/users/me/verification`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const fetchAPIKeys = async (user?: any) => {
    try {
      // Use the provided user or get from auth.currentUser
      const currentUser = user || auth.currentUser;
      if (!currentUser) {
        console.log('No authenticated user');
        setLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();
      console.log('Fetching API keys for user:', currentUser.email);

      const response = await fetch(`${API_URL}/api/keys`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch API keys:', errorData);
        throw new Error(errorData.error || 'Failed to fetch API keys');
      }

      const data = await response.json();
      console.log('API Keys fetched successfully:', data.keys?.length || 0, 'keys');
      setApiKeys(data.keys || []);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      toast.error(error.message || 'Failed to load API keys');
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
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newKeyName })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create API key');
      }
      
      const data = await response.json();
      if (data.key) {
        setNewKeyName('');
        toast.success('API key created successfully!');
        
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
      console.error('Error creating API key:', error);
      toast.error(error.message || 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }
      
      toast.success('API key deleted successfully');
      
      // Refetch all keys from database to keep in sync
      await fetchAPIKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
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

  if (loading) {
    return (
      <Protected>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Keys</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your API keys for the Mentorque Chrome Extension
        </p>
      </div>

      {/* Verification Check */}
      {isVerified === false && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
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
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Admin Approval Needed
              </h3>
              <p className="text-yellow-800 dark:text-yellow-200">
                Your account is pending admin approval. Please contact the administrator and come back once you have been approved to create API keys.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create New Key Section */}
      {isVerified !== false && (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New API Key
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Key name (e.g., Chrome Extension)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && createAPIKey()}
            maxLength={50}
          />
          <button
            onClick={createAPIKey}
              disabled={isCreating || !newKeyName.trim() || isVerified === false}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                Create Key
              </>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          💡 Name your key to help identify where it's being used (max 5 keys)
        </p>
      </div>
      )}

      {/* API Keys List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Your API Keys</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {apiKeys.length} {apiKeys.length === 1 ? 'key' : 'keys'} active
          </p>
        </div>

        {apiKeys.length === 0 ? (
          <div className="p-12 text-center">
            <Key className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
              No API Keys Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Create your first API key to use with the Chrome Extension
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{key.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
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
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Delete API Key"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-sm bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-lg overflow-x-auto">
                    {showKey[key.id] ? key.key : maskKey(key.key)}
                  </div>
                  <button
                    onClick={() => toggleShowKey(key.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title={showKey[key.id] ? 'Hide key' : 'Show key'}
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
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-600'
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
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ <strong>Warning:</strong> Keep this key secure! It provides access to your account.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions Section */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <Key className="w-5 h-5" />
          How to use your API key
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>Install the Mentorque Chrome Extension from the Chrome Web Store</li>
          <li>Click on the extension icon in your browser</li>
          <li>Select "Login with API Key"</li>
          <li>Copy and paste your API key from above</li>
          <li>Start using the extension on LinkedIn job pages!</li>
        </ol>
      </div>
      </div>
    </Protected>
  );
}