import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Shield, Server, Terminal, AlertCircle, CheckCircle, Clock, Copy, Upload, FileText, ChevronRight, FileJson, List, Cloud } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const App = () => {
  const [inputType, setInputType] = useState('domain'); // 'domain' or 'list'
  const [domain, setDomain] = useState('');
  const [listFile, setListFile] = useState('');
  const [results, setResults] = useState([]);
  const [whatWebResults, setWhatWebResults] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [includeWhatWeb, setIncludeWhatWeb] = useState(false);
  const [stats, setStats] = useState({ total: 0, alive: 0, vulnerable: 0, cdn: 0 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [view, setView] = useState('upload'); // 'upload' or 'dashboard'
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
    event.target.value = null; // Reset input to allow re-selecting same file
  };

  const processFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let data = [];
        try {
            data = JSON.parse(text); 
            if (!Array.isArray(data)) data = [data]; 
        } catch {
            const lines = text.trim().split('\n');
            data = lines.map(line => {
                try { return JSON.parse(line); } catch (e) { return null; }
            }).filter(Boolean);
        }

        if (data.length > 0) {
            // Check content type
            const isWhatWeb = data[0].hasOwnProperty('target') && data[0].hasOwnProperty('plugins');
            const isHttpx = data[0].hasOwnProperty('input') || data[0].hasOwnProperty('host');

            if (isWhatWeb) {
                setWhatWebResults(data);
                if (!results.length && activeTab !== 'whatweb') setActiveTab('whatweb');
                if (view === 'upload') setView('dashboard');
                alert(`Loaded ${data.length} WhatWeb results.`);
            } else if (isHttpx) {
                setResults(data);
                setStats({
                    total: data.length,
                    alive: data.filter(r => r.status_code < 400).length,
                    vulnerable: data.filter(r => r.status_code === 200 && (r.title?.toLowerCase().includes('login') || r.knowledgebase?.PageType === 'login')).length,
                    cdn: data.filter(r => r.cdn || r.cdn_name).length
                });
                setView('dashboard');
            } else {
                alert("Unknown file format. Please upload httpx JSON or WhatWeb JSON.");
            }
        } else {
            alert("No valid JSON data found in file.");
        }
      } catch (error) {
        console.error("Parse error:", error);
        alert("Error parsing file.");
      }
    };
    reader.readAsText(file);
  };

  const getStatusColor = (code) => {
    if (code >= 200 && code < 300) return 'text-green-400 bg-green-500/10 border-green-500/20';
    if (code >= 300 && code < 400) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (code >= 400 && code < 500) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  // Generate the command based on user input
  const getOutputFile = () => {
    if (inputType === 'domain') return domain ? `${domain}_results.json` : 'results.json';
    return listFile ? `${listFile.split('.')[0]}_results.json` : 'results.json';
  };

  const baseCmd = inputType === 'domain'
    ? (domain 
        ? `subenum -d ${domain} -s | httpx -title -tech-detect -status-code -ip -cname -content-length -web-server -content-type -json -o ${getOutputFile()}`
        : `subenum -d target.com -s | httpx ... -json -o results.json`)
    : (listFile
        ? `subenum -l ${listFile} -s | httpx -title -tech-detect -status-code -ip -cname -content-length -web-server -content-type -json -o ${getOutputFile()}`
        : `subenum -l domains.txt -s | httpx ... -json -o results.json`);

  const generatedCommand = includeWhatWeb
    ? `${baseCmd} && cat ${getOutputFile()} | jq -r '.url' | whatweb -i /dev/stdin -a 3 --log-json=whatweb_results.json`
    : baseCmd;


  return (
    <div 
        className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-cyan-500 selection:text-white"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processFile(e.dataTransfer.files[0]);
            }
        }}
    >
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-850 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('upload')}>
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Globe className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                EnumMenum
              </h1>
              <p className="text-xs text-slate-400">Offline Report Viewer</p>
            </div>
          </div>
          
          {view === 'dashboard' && (
            <div className="flex items-center gap-6">
              <nav className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                {['dashboard', 'results', 'whatweb'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab 
                        ? 'bg-slate-700 text-cyan-400 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                    }`}
                  >
                    {tab === 'whatweb' ? 'WhatWeb' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
              <div className="flex items-center gap-2">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-800 border border-slate-700 hover:border-slate-500"
                 >
                    <Upload className="w-4 h-4" />
                    Load File
                 </button>
                 <button 
                    onClick={() => { 
                        if(confirm('Clear all data and start over?')) {
                            setResults([]); 
                            setWhatWebResults([]);
                            setView('upload'); 
                        }
                    }}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-1.5"
                 >
                    Reset
                 </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {view === 'upload' ? (
            <div className="max-w-4xl mx-auto animate-fade-in space-y-12">
                
                {/* Hero Section */}
                <div className="text-center space-y-4 pt-10">
                    <h2 className="text-4xl font-bold text-white">Visualize Your Recon Data</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        A secure, offline-first viewer for your subdomain enumeration results. 
                        Run your tools locally on Kali/Parrot, then drop the JSON file here.
                    </p>
                </div>

                {/* Step 1: Generate Command */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">1</div>
                        <h3 className="text-xl font-semibold text-white">Generate Scan Command</h3>
                    </div>
                    
                    <div className="space-y-4">
                        
                        <div className="flex bg-slate-950 p-1 rounded-lg w-fit border border-slate-800">
                             <button 
                                onClick={() => setInputType('domain')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${inputType === 'domain' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                             >
                                <Globe className="w-4 h-4" />
                                Single Domain
                             </button>
                             <button 
                                onClick={() => setInputType('list')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${inputType === 'list' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-white'}`}
                             >
                                <List className="w-4 h-4" />
                                Domain List
                             </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                {inputType === 'domain' ? 'Target Domain' : 'List Filename (local path)'}
                            </label>
                            <div className="relative">
                                {inputType === 'domain' ? (
                                    <>
                                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                                        <input 
                                            type="text" 
                                            placeholder="e.g. example.com" 
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <FileText className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
                                        <input 
                                            type="text" 
                                            placeholder="e.g. domains.txt" 
                                            value={listFile}
                                            onChange={(e) => setListFile(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 py-1">
                             <input 
                                type="checkbox" 
                                id="includeWhatWeb"
                                checked={includeWhatWeb}
                                onChange={(e) => setIncludeWhatWeb(e.target.checked)}
                                className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500/50"
                             />
                             <label htmlFor="includeWhatWeb" className="text-sm text-slate-400 select-none cursor-pointer">
                                Include <span className="text-slate-200 font-medium font-mono">whatweb</span> analysis
                             </label>
                        </div>

                        <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 relative group">
                            <code className="font-mono text-sm text-emerald-400 break-all leading-relaxed block">
                                {generatedCommand}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedCommand);
                                }}
                                className="absolute right-2 top-2 p-2 bg-slate-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 text-slate-400 hover:text-white"
                                title="Copy to clipboard"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">
                             Requires <span className="text-slate-300">subenum</span> (or your preferred tool) and <span className="text-slate-300">httpx</span> installed.
                        </p>
                    </div>
                </div>

                {/* Step 2: Upload */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">2</div>
                        <h3 className="text-xl font-semibold text-white">Upload Results</h3>
                    </div>

                    <div 
                        className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all cursor-pointer"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                processFile(e.dataTransfer.files[0]);
                            }
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept=".json,.txt"
                            onChange={handleFileUpload}
                        />
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                            <Upload className="w-8 h-8 text-cyan-500" />
                        </div>
                        <h4 className="text-lg font-medium text-white mb-2">Drop your JSON file here</h4>
                        <p className="text-slate-400 text-sm">or click to browse</p>
                    </div>
                </div>

                {/* Privacy Note */}
                <div className="text-center text-slate-500 text-sm py-4">
                     <p className="flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4" />
                        Processed locally in your browser. No data is sent to any server.
                     </p>
                </div>

            </div>
        ) : (
            <div className="space-y-6 animate-fade-in">
                
                {activeTab === 'dashboard' && (
                     <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard 
                            title="Total Subdomains" 
                            value={stats.total} 
                            icon={<Globe className="w-6 h-6 text-indigo-400" />}
                            color="from-indigo-500/10 to-indigo-500/5"
                            border="border-indigo-500/20"
                        />
                        <StatCard 
                            title="Alive Hosts" 
                            value={stats.alive} 
                            icon={<CheckCircle className="w-6 h-6 text-emerald-400" />}
                            color="from-emerald-500/10 to-emerald-500/5"
                            border="border-emerald-500/20"
                        />
                        <StatCard 
                            title="Potential Issues" 
                            value={stats.vulnerable} 
                            icon={<AlertCircle className="w-6 h-6 text-orange-400" />}
                            color="from-orange-500/10 to-orange-500/5"
                            border="border-orange-500/20"
                            trend="Based on scan data"
                        />
                        <StatCard 
                            title="Cloud/CDN" 
                            value={stats.cdn} 
                            icon={<Cloud className="w-6 h-6 text-sky-400" />}
                            color="from-sky-500/10 to-sky-500/5"
                            border="border-sky-500/20"
                        />
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <div className="w-1 h-5 bg-cyan-500 rounded-full" />
                            Status Code Distribution
                            </h3>
                            <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                { name: '200', value: results.filter(r => r.status_code === 200).length },
                                { name: '301', value: results.filter(r => r.status_code === 301).length },
                                { name: '403', value: results.filter(r => r.status_code === 403).length },
                                { name: '404', value: results.filter(r => r.status_code === 404).length },
                                { name: '500', value: results.filter(r => r.status_code === 500).length },
                                ]}>
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <div className="w-1 h-5 bg-purple-500 rounded-full" />
                            Technology Stack
                            </h3>
                            <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(results.flatMap(r => r.tech || []))).slice(0, 20).map((tech, i) => (
                                <div key={i} className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300 border border-slate-600">
                                {tech}
                                </div>
                            ))}
                            </div>
                        </div>
                        </div>
                    </div>
                )}

                {activeTab === 'results' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                             <span className="text-slate-400 text-sm">Filter by Status:</span>
                             <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                                {['ALL', '2xx', '3xx', '4xx', '5xx'].map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setStatusFilter(filter)}
                                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                            statusFilter === filter 
                                            ? 'bg-slate-700 text-cyan-400 shadow-sm' 
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {filter}
                                    </button>
                                ))}
                             </div>
                        </div>
                        <div className="text-sm text-slate-500">
                            Showing {results.filter(r => {
                                if (statusFilter === 'ALL') return true;
                                const code = parseInt(r.status_code);
                                if (statusFilter === '2xx') return code >= 200 && code < 300;
                                if (statusFilter === '3xx') return code >= 300 && code < 400;
                                if (statusFilter === '4xx') return code >= 400 && code < 500;
                                if (statusFilter === '5xx') return code >= 500;
                                return true;
                            }).length} results
                        </div>
                    </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-medium">Domain</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Tech</th>
                            <th className="px-6 py-4 font-medium">IP</th>
                            <th className="px-6 py-4 font-medium">CNAME</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                        {results
                            .filter(r => {
                                if (statusFilter === 'ALL') return true;
                                const code = parseInt(r.status_code);
                                if (statusFilter === '2xx') return code >= 200 && code < 300;
                                if (statusFilter === '3xx') return code >= 300 && code < 400;
                                if (statusFilter === '4xx') return code >= 400 && code < 500;
                                if (statusFilter === '5xx') return code >= 500;
                                return true;
                            })
                            .map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-3 font-medium text-slate-200">
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 hover:underline">
                                {item.input || item.url}
                                </a>
                            </td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded-md bg-slate-900 border border-slate-700/50 font-mono text-xs ${getStatusColor(item.status_code)}`}>
                                {item.status_code}
                                </span>
                            </td>
                            <td className="px-6 py-3 text-slate-400 max-w-xs truncate" title={item.title}>
                                {item.title}
                            </td>
                            <td className="px-6 py-3 text-slate-400 whitespace-normal">
                                <div className="flex flex-wrap gap-1 min-w-[200px]">
                                {(item.tech || []).map((t, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-slate-800 rounded-md text-xs border border-slate-700/50 text-slate-300 shadow-sm">{t}</span>
                                ))}
                                </div>
                            </td>
                            <td className="px-6 py-3 text-slate-400 font-mono text-xs">
                                {item.host_ip}
                            </td>
                            <td className="px-6 py-3 text-slate-500 text-xs">
                                {(item.cname || []).join(', ') || '-'}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                </div>
                )}

                {activeTab === 'whatweb' && (
                     <div className="space-y-6">
                         {!whatWebResults.length ? (
                             <div className="text-center py-20 bg-slate-800/50 rounded-xl border border-slate-700/50 border-dashed">
                                 <h3 className="text-xl font-medium text-white mb-2">No WhatWeb Results Loaded</h3>
                                 <p className="text-slate-400 mb-6">Upload a WhatWeb JSON output file to view detailed analysis.</p>
                                 <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                                 >
                                    Load File
                                 </button>
                             </div>
                         ) : (
                             <div className="grid grid-cols-1 gap-6">
                                {whatWebResults.map((item, idx) => (
                                    <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 transition-all hover:bg-slate-800/80">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <a href={item.target} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-cyan-400 hover:underline break-all">
                                                    {item.target}
                                                </a>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${getStatusColor(item.http_status)}`}>
                                                        HTTP {item.http_status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                Detected Technologies
                                                <span className="text-xs normal-case bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                                                    {Object.keys(item.plugins || {}).length}
                                                </span>
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {Object.entries(item.plugins || {})
                                                    .sort((a, b) => {
                                                        const aHasVer = a[1].version && a[1].version.length > 0;
                                                        const bHasVer = b[1].version && b[1].version.length > 0;
                                                        if (aHasVer && !bHasVer) return -1;
                                                        if (!aHasVer && bHasVer) return 1;
                                                        return 0;
                                                    })
                                                    .map(([name, data]) => (
                                                    <div 
                                                        key={name} 
                                                        className={`flex flex-col p-3 rounded-lg border transition-all ${
                                                            data.version 
                                                            ? 'bg-gradient-to-br from-slate-900 to-emerald-900/10 border-emerald-500/30 hover:border-emerald-500/50 shadow-sm shadow-emerald-500/5' 
                                                            : 'bg-slate-900/50 border-slate-700/30 hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className={`font-medium text-sm ${data.version ? 'text-emerald-100' : 'text-slate-300'}`}>
                                                                {name}
                                                            </span>
                                                            {data.version && (
                                                                <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                                    v{data.version.join(', ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mt-auto">
                                                            {data.string && data.string.map((s, i) => (
                                                                <span key={i} className="text-[10px] text-slate-400 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-full" title={s}>{s}</span>
                                                            ))}
                                                            {data.module && data.module.map((s, i) => (
                                                                <span key={i} className="text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div> 
                                        </div>
                                    </div>
                                ))}
                             </div>
                         )}
                     </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, border, trend }) => (
  <div className={`shadow-lg rounded-xl p-6 bg-gradient-to-br ${color} ${border} border backdrop-blur-sm`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
      <div className="p-2 bg-slate-900/40 rounded-lg">
        {icon}
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-1 text-xs text-emerald-400 font-medium">
        <span>▲</span>
        <span>{trend}</span>
      </div>
    )}
  </div>
);

export default App;
