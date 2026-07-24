import React, { useState, useRef } from 'react';
import DashboardHeader from "../components/DashboardHeader";
import {
    Presentation, Settings, Sparkles, Download, 
    FileText, UploadCloud, List, Sliders, CheckCircle, AlertCircle, Globe
} from "lucide-react"; 
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

const PPTGenerator = () => {
    const { t } = useLanguage(); 

    // 🔷 UI States
    const [isGenerating, setIsGenerating] = useState(false);
    const [pptGenerated, setPptGenerated] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(0); 

    // Form States
    const [file, setFile] = useState(null);
    const [mode, setMode] = useState("auto");
    const [slideCount, setSlideCount] = useState(8);
    const [topics, setTopics] = useState("");
    const [pptLanguage, setPptLanguage] = useState("Marathi_lang"); 

    const fileInputRef = useRef(null);

    // Handle File Selection
    const handleFileChange = (e) => {
        setError("");
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validExtensions = ['.pdf', '.txt', '.docx', '.pptx'];
            const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
            
            if (!validExtensions.includes(fileExtension)) {
                setError(t('err_invalid_file'));
                setFile(null);
                return;
            }
            
            setFile(selectedFile);
            setPptGenerated(false);
            setProgress(0);
        }
    };

    // Trigger API Call
    const handleGenerate = async () => {
        // 🚀 FIXED: Dynamic Validation
        if (mode === "auto" && !file) {
            setError(t('err_no_doc')); // Only require file in Auto mode
            return;
        }
        if (mode === "manual" && !topics.trim()) {
            setError(t('err_no_topics')); // Require topics in Manual mode
            return;
        }

        setError("");
        setIsGenerating(true);
        setPptGenerated(false);
        setProgress(0);

        let currentProgress = 0;
        const progressTimer = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 5) + 2; 
            if (currentProgress > 90) currentProgress = 90; 
            setProgress(currentProgress);
        }, 800);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication missing. Please log in again.");

            const formData = new FormData();
            
            // 🚀 FIXED: Only append the file if one was actually uploaded
            if (file) {
                formData.append("file", file);
            }
            
            formData.append("mode", mode);
            
            const languageToSend = pptLanguage === 'Marathi_lang' ? 'Marathi' : (pptLanguage === 'Hindi_lang' ? 'Hindi' : 'English');
            formData.append("language", languageToSend);

            if (mode === "auto") {
                formData.append("slide_count", slideCount);
            } else {
                const topicsArray = topics.split('\n').filter(t => t.trim() !== '');
                formData.append("slide_topics", JSON.stringify(topicsArray));
            }

            const response = await fetch(`${API_URL}/api/ppt/generate`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate PPT.");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            setDownloadUrl(url);
            
            clearInterval(progressTimer);
            setProgress(100);

            setTimeout(() => {
                setIsGenerating(false);
                setPptGenerated(true);
            }, 600);

        } catch (err) {
            clearInterval(progressTimer);
            console.error("PPT Gen Error:", err);
            setError(err.message || "Cannot connect to server. Is Flask running?");
            setIsGenerating(false);
        }
    };

    // 🚀 FIXED: Ensure the button disables properly based on the current mode
    const isGenerateDisabled = isGenerating || (mode === "auto" && !file) || (mode === "manual" && !topics.trim());

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <DashboardHeader title={t('ppt_generator')} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            {t('smart_ppt_maker')}
                        </h1>
                        <p className="text-slate-500 mt-1">{t('smart_ppt_maker_sub')}</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: CONFIGURATION PANEL */}
                    <div className="lg:col-span-5 space-y-6">

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <FileText size={18} className="text-indigo-600" /> {t('source_document')}
                                {mode === "manual" && <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">Optional</span>}
                            </h2>
                            <div 
                                onClick={() => fileInputRef.current.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                                    file ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                                }`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept=".txt, .pdf, .docx, .pptx, application/pdf, text/plain, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.presentationml.presentation"
                                    onChange={handleFileChange}
                                />
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="bg-indigo-100 p-3 rounded-full mb-3">
                                            <FileText className="text-indigo-600" size={24} />
                                        </div>
                                        <p className="font-bold text-slate-800">{file.name}</p>
                                        <p className="text-sm text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • {t('click_to_change')}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-500">
                                        <UploadCloud size={40} className="mb-3 text-slate-400" />
                                        <p className="font-bold text-slate-700 mb-1">{t('click_to_upload')}</p>
                                        <p className="text-sm">{t('supports_formats')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Settings size={18} className="text-indigo-600" /> {t('slide_settings')}
                                </h2>
                            </div>

                            <div className="mb-5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Globe size={14}/> {t('language')}
                                </label>
                                <select
                                    value={pptLanguage}
                                    onChange={e => setPptLanguage(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700"
                                >
                                    <option value="Marathi_lang">{t('Marathi_lang')}</option>
                                    <option value="English_lang">{t('English_lang')}</option>
                                    <option value="Hindi_lang">{t('Hindi_lang')}</option>
                                </select>
                            </div>

                            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                                <button
                                    onClick={() => setMode("auto")}
                                    className={`flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                        mode === "auto" ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <Sparkles size={16}/> {t('auto_magic')}
                                </button>
                                <button
                                    onClick={() => setMode("manual")}
                                    className={`flex-1 flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                        mode === "manual" ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <List size={16}/> {t('manual_topics')}
                                </button>
                            </div>

                            {mode === "auto" ? (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Sliders size={14} /> {t('total_slides_label')}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="3" max="20"
                                            value={slideCount}
                                            onChange={(e) => setSlideCount(e.target.value)}
                                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="bg-slate-100 font-bold text-indigo-700 px-4 py-2 rounded-lg text-center w-16">
                                            {slideCount}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        {t('specific_topics_label')}
                                    </label>
                                    <textarea
                                        rows="5"
                                        placeholder={t('topics_placeholder')}
                                        value={topics}
                                        onChange={(e) => setTopics(e.target.value)}
                                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 text-sm"
                                    ></textarea>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerateDisabled}
                            className={`w-full py-4 rounded-2xl font-extrabold text-lg shadow-md transition-all flex items-center justify-center gap-3 ${
                                isGenerateDisabled
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]'
                            }`}
                        >
                            {isGenerating ? (
                                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> {t('crafting_presentation')}</>
                            ) : (
                                <><Presentation size={22} /> {t('generate_pptx')}</>
                            )}
                        </button>

                    </div>

                    {/* RIGHT COLUMN: STATUS PREVIEW */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-24">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 ml-2">{t('status_panel')}</h2>

                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 min-h-[600px] overflow-hidden flex flex-col relative">

                                {!isGenerating && !pptGenerated && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-8 text-center">
                                        <Presentation size={64} className="mb-4 text-slate-200" />
                                        <h3 className="text-xl font-bold text-slate-600 mb-2">{t('ready_to_design')}</h3>
                                        <p className="max-w-xs">{t('ready_to_design_sub')}</p>
                                    </div>
                                )}

                                {isGenerating && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10 p-8">
                                        <Sparkles size={56} className="text-indigo-500 animate-pulse mb-6" />
                                        <h3 className="text-xl font-bold text-slate-800 tracking-wider animate-pulse mb-2">{t('analyzing_document')}</h3>
                                        <p className="text-sm text-slate-500 text-center max-w-md">
                                            {t('analyzing_document_sub')}
                                        </p>

                                        <div className="w-full max-w-sm mt-10">
                                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                                <span>{t('generating_content')}</span>
                                                <span className="text-indigo-600">{progress}%</span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
                                                    style={{ width: `${progress}%` }}
                                                >
                                                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {pptGenerated && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50/30 p-8 text-center animate-in fade-in duration-700">
                                        <div className="bg-green-100 text-green-600 p-4 rounded-full mb-6 shadow-sm">
                                            <CheckCircle size={48} />
                                        </div>
                                        <h3 className="text-3xl font-extrabold text-slate-800 mb-3">{t('presentation_ready')}</h3>
                                        <p className="text-slate-600 max-w-md mb-8">
                                            {t('presentation_ready_sub')}
                                        </p>
                                        
                                        <div className="relative w-64 h-40 mb-10 perspective-1000">
                                            <div className="absolute inset-0 bg-white border border-slate-200 shadow-xl rounded-xl transform rotate-y-12 rotate-x-6 z-30 flex items-center justify-center">
                                                <Presentation size={40} className="text-indigo-500" />
                                            </div>
                                            <div className="absolute inset-0 bg-slate-100 border border-slate-200 shadow-md rounded-xl transform rotate-y-12 rotate-x-6 translate-x-4 translate-y-4 z-20"></div>
                                            <div className="absolute inset-0 bg-slate-200 border border-slate-300 shadow-sm rounded-xl transform rotate-y-12 rotate-x-6 translate-x-8 translate-y-8 z-10"></div>
                                        </div>

                                        <a 
                                            href={downloadUrl} 
                                            download={`Presentation_${file?.name || t('generated')}.pptx`}
                                            className="group relative overflow-hidden flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-indigo-500/40 hover:scale-105 hover:-translate-y-1"
                                        >
                                            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 skew-x-12"></div>
                                            
                                            <Download size={22} className="relative z-20 group-hover:animate-bounce" /> 
                                            <span className="relative z-20">{t('download_presentation')}</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
        </div>
    );
};

export default PPTGenerator;