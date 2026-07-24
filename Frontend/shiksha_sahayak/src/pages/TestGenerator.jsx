import React, { useState, useRef, useEffect } from 'react';
import DashboardHeader from "../components/DashboardHeader";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
    BookOpen, Layers, Clock, CheckSquare, Settings, Sparkles,
    Download, Printer, FileText, AlertCircle, Globe
} from "lucide-react";
import { useLanguage } from '../context/LanguageContext';
import { API_URL } from '../config';

const TestGenerator = () => {
    const { t } = useLanguage(); 

    const [isGenerating, setIsGenerating] = useState(false);
    const [paperGenerated, setPaperGenerated] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(0);
    const [testContent, setTestContent] = useState("");
    
    const [config, setConfig] = useState({
        classId: 'Grade 3',
        subject: 'Mathematics',
        language: 'Marathi_lang', 
        totalMarks: 20,
        duration: 45, 
        numberOfQuestions: 10,
        difficulty: 'Medium',
    });

    const [questionTypes, setQuestionTypes] = useState({});

    const gradeQuestionTypes = {
        "Grade 1": [
            { id: 'mcq', label: 'MCQs' },
            { id: 'trueFalse', label: 'True / False' },
            { id: 'fillBlanks', label: 'Fill in Blanks' },
            { id: 'match', label: 'Match the Pairs' },
            { id: 'oneWord', label: 'One Word Answers' }
        ],
        "Grade 2": [
            { id: 'mcq', label: 'MCQs' },
            { id: 'trueFalse', label: 'True / False' },
            { id: 'fillBlanks', label: 'Fill in Blanks' },
            { id: 'match', label: 'Match the Pairs' },
            { id: 'oneWord', label: 'One Word Answers' }
        ],
        "Grade 3": [
            { id: 'mcq', label: 'MCQs' },
            { id: 'trueFalse', label: 'True / False' },
            { id: 'fillBlanks', label: 'Fill in Blanks' },
            { id: 'match', label: 'Match the Pairs' },
            { id: 'shortAnswer', label: 'Short Answer' }
        ],
        "Grade 4": [
            { id: 'mcq', label: 'MCQs' },
            { id: 'trueFalse', label: 'True / False' },
            { id: 'fillBlanks', label: 'Fill in Blanks' },
            { id: 'shortAnswer', label: 'Short Answer' },
            { id: 'longAnswer', label: 'Long Answer' }
        ],
        "Grade 5": [
            { id: 'mcq', label: 'MCQs' },
            { id: 'trueFalse', label: 'True / False' },
            { id: 'fillBlanks', label: 'Fill in Blanks' },
            { id: 'shortAnswer', label: 'Short Answer' },
            { id: 'longAnswer', label: 'Long Answer' }
        ]
    };

    const syllabusMatrix = {
        "Grade 1": {
            "Marathi (First Language)": [
                { id: 101, name: "Mulaakshare (Alphabets)", selected: true },
                { id: 102, name: "Barakhadi Introduction", selected: true },
                { id: 103, name: "Basic Vocabulary (Animals, Colors)", selected: false }
            ],
            "English": [
                { id: 104, name: "Alphabets and Phonics", selected: true },
                { id: 105, name: "Basic Rhymes and Poems", selected: true },
                { id: 106, name: "Simple Sight Words", selected: false }
            ],
            "Mathematics": [
                { id: 107, name: "Numbers up to 20", selected: true },
                { id: 108, name: "Addition and Subtraction (Basic)", selected: true },
                { id: 109, name: "Shapes and Spatial Understanding", selected: false }
            ]
        },
        "Grade 2": {
            "Marathi (First Language)": [
                { id: 201, name: "Barakhadi Practice", selected: true },
                { id: 202, name: "Reading Short Paragraphs", selected: true },
                { id: 203, name: "Singular and Plural Words", selected: false }
            ],
            "English": [
                { id: 204, name: "Reading Simple Stories", selected: true },
                { id: 205, name: "Nouns and Action Words", selected: true },
                { id: 206, name: "Forming Simple Sentences", selected: false }
            ],
            "Mathematics": [
                { id: 207, name: "Numbers up to 100", selected: true },
                { id: 208, name: "Addition and Subtraction (2-digit)", selected: true },
                { id: 209, name: "Measurement (Length, Weight)", selected: false }
            ]
        },
        "Grade 3": {
            "Marathi (First Language)": [
                { id: 301, name: "Kavita (Poems) and Goshti (Stories)", selected: true },
                { id: 302, name: "Vyakaran (Basic Grammar)", selected: true },
                { id: 303, name: "Nibandh (Short Essays)", selected: false }
            ],
            "English": [
                { id: 304, name: "Reading Comprehension", selected: true },
                { id: 305, name: "Grammar (Adjectives, Pronouns)", selected: true },
                { id: 306, name: "Writing Short Letters", selected: false }
            ],
            "Mathematics": [
                { id: 307, name: "Numbers up to 1000", selected: true },
                { id: 308, name: "Multiplication Basics", selected: true },
                { id: 309, name: "Division Basics", selected: false },
                { id: 310, name: "Geometry (Edges and Corners)", selected: false }
            ],
            "EVS": [
                { id: 311, name: "Our Surroundings", selected: true },
                { id: 312, name: "Water, our Need", selected: true },
                { id: 313, name: "Our Body", selected: false },
                { id: 314, name: "Festivals and Celebrations", selected: false }
            ]
        },
        "Grade 4": {
            "Marathi (First Language)": [
                { id: 401, name: "Prose and Poetry", selected: true },
                { id: 402, name: "Advanced Grammar", selected: true },
                { id: 403, name: "Essay Writing", selected: false }
            ],
            "English": [
                { id: 404, name: "Paragraph Writing", selected: true },
                { id: 405, name: "Grammar (Tenses, Prepositions)", selected: true },
                { id: 406, name: "Story Reading and Analysis", selected: false }
            ],
            "Mathematics": [
                { id: 407, name: "Large Numbers (up to 5-digit)", selected: true },
                { id: 408, name: "Multiplication & Division (Advanced)", selected: true },
                { id: 409, name: "Fractions & Decimals Basics", selected: false },
                { id: 410, name: "Perimeter and Area", selected: false }
            ],
            "EVS - Part 1": [
                { id: 411, name: "The Life Cycle of Animals", selected: true },
                { id: 412, name: "Food and Nutrition", selected: true },
                { id: 413, name: "Water Management", selected: false }
            ],
            "EVS - Part 2": [
                { id: 414, name: "Maharashtra before Shivaji", selected: true },
                { id: 415, name: "Childhood of Shivaji Maharaj", selected: true },
                { id: 416, name: "The Oath of Swaraj", selected: false }
            ]
        },
        "Grade 5": {
            "Marathi (First Language)": [
                { id: 501, name: "Advanced Prose", selected: true },
                { id: 502, name: "Complex Grammar", selected: true },
                { id: 503, name: "Letter Writing", selected: false }
            ],
            "Hindi (Second Language)": [
                { id: 504, name: "Varnamala (Alphabets)", selected: true },
                { id: 505, name: "Basic Words and Sentences", selected: true },
                { id: 506, name: "Short Poems", selected: false }
            ],
            "English": [
                { id: 507, name: "Standardized Reading", selected: true },
                { id: 508, name: "Composition", selected: true },
                { id: 509, name: "Advanced Vocabulary", selected: false }
            ],
            "Mathematics": [
                { id: 510, name: "Number Work (7-digit numbers)", selected: true },
                { id: 511, name: "Fractions (Operations)", selected: true },
                { id: 512, name: "Angles and Circles", selected: false },
                { id: 513, name: "Preparation for Algebra", selected: false }
            ],
            "EVS - Part 1": [
                { id: 514, name: "Our Earth and Our Solar System", selected: true },
                { id: 515, name: "Motions of the Earth", selected: true },
                { id: 516, name: "Public Facilities and my School", selected: false }
            ],
            "EVS - Part 2": [
                { id: 517, name: "What is History?", selected: true },
                { id: 518, name: "Evolution of Mankind", selected: true },
                { id: 519, name: "Life on Earth", selected: false }
            ]
        }
    };

    const initialClassData = syllabusMatrix[config.classId] || {};
    const [chapters, setChapters] = useState(initialClassData[config.subject] || []);

    useEffect(() => {
        const classData = syllabusMatrix[config.classId] || {};
        const topicList = classData[config.subject] || [];
        setChapters(topicList);

        const allowedTypes = gradeQuestionTypes[config.classId] || [];
        const newTypeState = {};
        allowedTypes.forEach((type, index) => {
            newTypeState[type.id] = index < 2; 
        });
        setQuestionTypes(newTypeState);
    }, [config.classId, config.subject]);

    const toggleChapter = (id) => {
        setChapters(chapters.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
    };

    const handleToggleType = (typeId) => {
        setQuestionTypes(prev => ({ ...prev, [typeId]: !prev[typeId] }));
    };

    const paperRef = useRef(null);

    const handleGenerate = async () => {
        const selectedTopics = chapters.filter(c => c.selected).map(c => c.name).join(", ");
        
        if (!selectedTopics) {
            setError("Please select at least one chapter/topic.");
            return;
        }

        const hasTypeSelected = Object.values(questionTypes).some(val => val === true);
        if (!hasTypeSelected) {
            setError("Please select at least one question type.");
            return;
        }

        setError("");
        setIsGenerating(true);
        setPaperGenerated(false);
        setProgress(0);

        let currentProgress = 0;
        const progressTimer = setInterval(() => {
            currentProgress += Math.floor(Math.random() * 6) + 2; 
            if (currentProgress > 90) currentProgress = 90; 
            setProgress(currentProgress);
        }, 600);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Authentication missing. Please log in again.");

            const payload = {
                grade: config.classId,
                language: config.language === 'Marathi_lang' ? 'Marathi' : (config.language === 'Hindi_lang' ? 'Hindi' : 'English'),
                subject: config.subject,
                topics: selectedTopics,
                totalMarks: parseInt(config.totalMarks),
                duration: parseInt(config.duration),
                numberOfQuestions: parseInt(config.numberOfQuestions), 
                difficulty: config.difficulty,
                questionTypes: questionTypes
            };

            const response = await fetch(`${API_URL}/api/test/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate test.");
            }

            const data = await response.json();
            setTestContent(data.testContent);

            clearInterval(progressTimer);
            setProgress(100);

            setTimeout(() => {
                setIsGenerating(false);
                setPaperGenerated(true);
            }, 500);

        } catch (err) {
            clearInterval(progressTimer);
            console.error("Test Gen Error:", err);
            setError(err.message || "Cannot connect to server. Is Flask running?");
            setIsGenerating(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = paperRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { 
                scale: 1.5, 
                useCORS: true,
                scrollY: 0,
                windowHeight: element.scrollHeight
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.7); 
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`${config.subject}_Test_Paper_${config.classId}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <DashboardHeader title={t('test_generator')} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                            {t('test_generator')}
                        </h1>
                        <p className="text-slate-500 mt-1">{t('test_generator_sub')}</p>
                    </div>

                    {paperGenerated && (
                        <div className="flex gap-3 w-full md:w-auto animate-in fade-in duration-300">
                            <button 
                                onClick={() => window.print()}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <Printer size={18} /> {t('print')}
                            </button>
                            <button
                                onClick={handleDownloadPDF}
                                className="group flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-indigo-500/40 hover:-translate-y-0.5 overflow-hidden relative"
                            >
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-10 skew-x-12"></div>
                                <Download size={18} className="relative z-20 group-hover:animate-bounce" /> 
                                <span className="relative z-20">{t('download_pdf')}</span>
                            </button>
                        </div>
                    )}
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
                                <Settings size={18} className="text-indigo-600" /> {t('test_details')}
                            </h2>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('class_label')}</label>
                                    <select
                                        value={config.classId}
                                        onChange={e => {
                                            const newClass = e.target.value;
                                            const availableSubjects = Object.keys(syllabusMatrix[newClass] || {});
                                            setConfig({ 
                                                ...config, 
                                                classId: newClass,
                                                subject: availableSubjects.length > 0 ? availableSubjects[0] : ''
                                            });
                                        }}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700"
                                    >
                                        <option value="Grade 1">{t('Grade 1')}</option>
                                        <option value="Grade 2">{t('Grade 2')}</option>
                                        <option value="Grade 3">{t('Grade 3')}</option>
                                        <option value="Grade 4">{t('Grade 4')}</option>
                                        <option value="Grade 5">{t('Grade 5')}</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('subject')}</label>
                                    <select
                                        value={config.subject}
                                        onChange={e => setConfig({ ...config, subject: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700"
                                    >
                                        {Object.keys(syllabusMatrix[config.classId] || {}).map(sub => (
                                            <option key={sub} value={sub}>{t(sub)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Globe size={14}/> {t('language')}</label>
                                <select
                                    value={config.language}
                                    onChange={e => setConfig({ ...config, language: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700"
                                >
                                    <option value="Marathi_lang">{t('Marathi_lang')}</option>
                                    <option value="English_lang">{t('English_lang')}</option>
                                    <option value="Hindi_lang">{t('Hindi_lang')}</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <CheckSquare size={14} /> {t('marks')}
                                    </label>
                                    <input
                                        type="number"
                                        value={config.totalMarks}
                                        onChange={e => setConfig({ ...config, totalMarks: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Clock size={14} /> {t('mins')}
                                    </label>
                                    <input
                                        type="number"
                                        value={config.duration}
                                        onChange={e => setConfig({ ...config, duration: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <FileText size={14} /> {t('qty')}
                                    </label>
                                    <input
                                        type="number"
                                        value={config.numberOfQuestions}
                                        onChange={e => setConfig({ ...config, numberOfQuestions: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <BookOpen size={18} className="text-indigo-600" /> {t('syllabus_topics')}
                            </h2>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                {chapters.map(chapter => (
                                    <button
                                        key={chapter.id}
                                        onClick={() => toggleChapter(chapter.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${chapter.selected
                                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                                : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {/* Wraps chapter names so they can be translated if you add them to the dictionary! */}
                                        {t(chapter.name)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Layers size={18} className="text-indigo-600" /> {t('question_types')}
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                {(gradeQuestionTypes[config.classId] || []).map((type) => (
                                    <label key={type.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${questionTypes[type.id] ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={questionTypes[type.id] || false} 
                                            onChange={() => handleToggleType(type.id)} 
                                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" 
                                        />
                                        <span className="text-sm font-bold text-slate-700">{t(type.label)}</span>
                                    </label>
                                ))}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{t('overall_difficulty')}</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['Easy', 'Medium', 'Hard'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setConfig({ ...config, difficulty: level })}
                                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${config.difficulty === level ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                        >
                                            {t(level)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className={`w-full py-4 rounded-2xl font-extrabold text-lg shadow-md transition-all flex items-center justify-center gap-3 ${isGenerating
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:scale-[1.02]'
                                }`}
                        >
                            {isGenerating ? (
                                <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> {t('curating_questions')}</>
                            ) : (
                                <><Sparkles size={22} /> {t('generate_paper')}</>
                            )}
                        </button>
                    </div>

                    {/* RIGHT COLUMN: LIVE PREVIEW */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-24">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 ml-2">{t('live_preview')}</h2>
                            
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col relative h-[700px]">

                                {!isGenerating && !paperGenerated && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-8 text-center h-full">
                                        <Globe size={64} className="mb-4 text-slate-200" />
                                        <h3 className="text-xl font-bold text-slate-600 mb-2">{t('multilingual_gen')}</h3>
                                        <p className="max-w-xs">{t('multilingual_gen_sub')}</p>
                                    </div>
                                )}

                                {isGenerating && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm z-10 p-8 h-full">
                                        <Layers size={56} className="text-indigo-500 animate-pulse mb-6" />
                                        <h3 className="text-xl font-bold text-slate-800 tracking-wider animate-pulse mb-2">{t('curating_questions')}</h3>
                                        <p className="text-sm text-slate-500 text-center max-w-md">
                                            {t('translating_topics')}
                                        </p>

                                        <div className="w-full max-w-sm mt-10">
                                            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
                                                <span>{t('drafting_assessment')}</span>
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

                                {paperGenerated && (
                                    <div className="overflow-y-auto custom-scrollbar h-full bg-slate-50">
                                        <div 
                                            ref={paperRef} 
                                            className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-full bg-white"
                                        >
                                            <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center">
                                                <h1 className="text-2xl font-serif font-bold text-slate-900 mb-2 uppercase">Shiksha Sahayak</h1>
                                                {/* Translated Header */}
                                                <h2 className="text-lg font-serif font-semibold text-slate-700 mb-4">{t('unit_test')} - {t(config.subject)}</h2>

                                                <div className="flex justify-between items-end text-sm font-semibold text-slate-600">
                                                    <div className="text-left">
                                                        <p>{t('class_label')}: {t(config.classId)}</p>
                                                        <p>{t('date_label')}: ____________</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p>{t('max_marks_label')}: {config.totalMarks}</p>
                                                        <p>{t('time_label')}: {config.duration} {t('mins')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="font-serif text-slate-800 whitespace-pre-wrap leading-relaxed text-sm">
                                                {testContent.replace(/\$/g, '')}
                                            </div>

                                            <div className="text-center text-slate-400 mt-16 font-serif italic">
                                                {t('end_of_paper')}
                                            </div>
                                        </div>
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

export default TestGenerator;