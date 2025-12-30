import React from 'react';
import { Copy, User, Check } from 'lucide-react';

const credentials = [
  { plan: 'Free', email: 'free@checkias.com', password: 'password', color: 'bg-gray-100 dark:bg-gray-800' },
  { plan: 'Starter', email: 'starter@checkias.com', password: 'password', color: 'bg-green-100 dark:bg-green-900/40' },
  { plan: 'Pro', email: 'pro@checkias.com', password: 'password', color: 'bg-purple-100 dark:bg-purple-900/40' },
  { plan: 'Achiever', email: 'achiever@checkias.com', password: 'password', color: 'bg-yellow-100 dark:bg-yellow-900/40' },
];

const HardcodedUsers = () => {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
        Dev Testing Credentials
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {credentials.map((cred) => (
          <div 
            key={cred.plan} 
            className={`p-4 rounded-xl border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-all ${cred.color} bg-opacity-50`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-gray-900 dark:text-white text-sm">{cred.plan} User</span>
              <User className="w-4 h-4 text-gray-500" />
            </div>
            
            <div className="space-y-2">
              <div 
                onClick={() => copyToClipboard(cred.email)}
                className="flex items-center justify-between p-2 bg-white dark:bg-black/50 rounded-lg cursor-pointer group"
              >
                <code className="text-xs text-gray-600 dark:text-gray-300 truncate mr-2">{cred.email}</code>
                {copied === cred.email ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Pass:</span>
                <code className="text-xs text-gray-600 dark:text-gray-300 font-mono">password</code>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HardcodedUsers;
