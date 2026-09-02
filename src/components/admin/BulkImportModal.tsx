import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  UserPlus, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  X,
  FileText,
  ArrowRight
} from 'lucide-react';

interface ParsedRow {
  id: string;
  original: string;
  name: string;
  username: string;
  facebookUrl: string;
  isDuplicate: boolean;
  duplicateId?: string;
  status: 'valid' | 'duplicate' | 'invalid';
  resolution: 'create' | 'skip' | 'rename';
}

export const BulkImportModal: React.FC = () => {
  const { members, bulkImportMembers } = useApp();
  const [rawText, setRawText] = useState(`@Tarek Aziz\n@Sabbir Ahmed - sabbir22\nNafis Iqbal (https://facebook.com/nafis.iqbal)\n@Md Emon\n@Zahid Hasan - zahid_h`);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; skipped: number } | null>(null);

  // Parse raw text
  const handleParse = () => {
    if (!rawText.trim()) return;

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const existingUsernames = new Set(members.map(m => m.username.toLowerCase()));
    const existingNames = new Set(members.map(m => m.name.toLowerCase()));

    const rows: ParsedRow[] = lines.map((line, idx) => {
      let clean = line.replace(/^[\d+.\-•*]\s*/, '').trim(); // Remove leading numbers
      clean = clean.replace(/^@/, ''); // Remove leading @

      let name = clean;
      let username = '';
      let facebookUrl = '';

      // Check for (URL)
      const urlMatch = clean.match(/\((https?:\/\/[^\)]+)\)/);
      if (urlMatch) {
        facebookUrl = urlMatch[1];
        name = clean.replace(urlMatch[0], '').trim();
      }

      // Check for - username
      const userMatch = name.split(/\s*-\s*|\s*\|\s*/);
      if (userMatch.length > 1) {
        name = userMatch[0].trim();
        username = userMatch[1].replace(/[@\s]/g, '').toLowerCase();
      } else {
        username = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 18);
      }

      if (!facebookUrl) {
        facebookUrl = `https://facebook.com/${username}`;
      }

      // Check for duplicate
      const isDuplicate = existingUsernames.has(username.toLowerCase()) || existingNames.has(name.toLowerCase());
      const dupMember = members.find(m => m.username.toLowerCase() === username.toLowerCase() || m.name.toLowerCase() === name.toLowerCase());

      return {
        id: `parse_${idx}`,
        original: line,
        name,
        username,
        facebookUrl,
        isDuplicate,
        duplicateId: dupMember?.id,
        status: isDuplicate ? 'duplicate' : 'valid',
        resolution: isDuplicate ? 'skip' : 'create'
      };
    });

    setParsedRows(rows);
    setImportResult(null);
  };

  const handleResolve = (id: string, resolution: 'create' | 'skip' | 'rename') => {
    setParsedRows(prev => prev.map(r => {
      if (r.id === id) {
        let username = r.username;
        if (resolution === 'rename') {
          username = `${username}_${Math.floor(10 + Math.random() * 90)}`;
        }
        return {
          ...r,
          resolution,
          username,
          status: resolution === 'skip' ? 'duplicate' : 'valid'
        };
      }
      return r;
    }));
  };

  const handleExecuteImport = () => {
    const validToImport = parsedRows.filter(r => r.resolution === 'create' || r.resolution === 'rename');
    const skippedCount = parsedRows.length - validToImport.length;

    if (validToImport.length === 0) {
      alert('No valid members selected to import.');
      return;
    }

    setIsProcessing(true);
    const result = bulkImportMembers(validToImport.map(r => ({
      name: r.name,
      username: r.username,
      email: `${r.username}@community.local`,
      facebookUrl: r.facebookUrl
    })));
    setIsProcessing(false);

    setImportResult({ count: result.imported, skipped: skippedCount });
    setParsedRows([]);
    setRawText('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          <UserPlus className="w-6 h-6 text-indigo-400" />
          Bulk Community Member Import
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Paste 50-200 members from Messenger/Excel. Auto-detects names, usernames, and flags duplicates with resolution controls.
        </p>
      </div>

      {importResult && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-emerald-300">Bulk Import Completed Successfully!</div>
              <div className="text-xs text-emerald-400/80">{importResult.count} new members created • {importResult.skipped} duplicate entries skipped.</div>
            </div>
          </div>
          <button 
            onClick={() => setImportResult(null)}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Paste Box */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1">
            Paste Raw Member List (1 per line)
          </label>
          <p className="text-[11px] text-gray-500 mb-2">
            Supports: `@Name`, `Name - username`, `Name (https://facebook.com/...)`
          </p>
          <textarea
            rows={6}
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="Paste member list here..."
            className="w-full p-3 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl font-mono text-white placeholder-gray-600 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {rawText.split('\n').filter(Boolean).length} lines detected
          </span>
          <button
            onClick={handleParse}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Parse & Detect Duplicates
          </button>
        </div>
      </div>

      {/* Parsed Results & Resolution Table */}
      {parsedRows.length > 0 && (
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Parsed Members ({parsedRows.length})
              </h3>
              <p className="text-xs text-gray-500">
                Review detected duplicates and choose whether to skip, rename, or proceed.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg font-bold">
                {parsedRows.filter(r => r.isDuplicate).length} Duplicates Detected
              </span>
              <button
                onClick={handleExecuteImport}
                disabled={isProcessing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-600/20 transition-colors"
              >
                {isProcessing ? 'Importing...' : `Import Valid Members (${parsedRows.filter(r => r.resolution !== 'skip').length})`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-[#1E1E20] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Facebook Profile</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Duplicate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1E20]">
                {parsedRows.map(row => (
                  <tr key={row.id} className={row.isDuplicate ? 'bg-amber-500/5' : 'hover:bg-[#18181B]'}>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {row.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-400">
                      @{row.username}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 truncate max-w-[200px]">
                      {row.facebookUrl}
                    </td>
                    <td className="py-2.5 px-3">
                      {row.isDuplicate ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Duplicate
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3 text-emerald-400" />
                          Ready
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {row.isDuplicate ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleResolve(row.id, 'skip')}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg ${
                              row.resolution === 'skip' ? 'bg-[#27272A] text-white' : 'bg-[#0E0E10] border border-[#1E1E20] text-gray-400 hover:text-white'
                            }`}
                          >
                            Skip
                          </button>
                          <button
                            onClick={() => handleResolve(row.id, 'rename')}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg ${
                              row.resolution === 'rename' ? 'bg-indigo-600 text-white' : 'bg-[#0E0E10] border border-[#1E1E20] text-gray-400 hover:text-white'
                            }`}
                          >
                            Rename Suffix
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-[10px]">Auto Create</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
