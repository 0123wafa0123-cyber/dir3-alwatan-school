import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import {
  PenTool,
  Image as ImageIcon,
  FileCheck2,
  Award,
  Eraser,
  RotateCcw,
  RotateCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Printer,
  Shield,
  Send,
  HelpCircle,
  HeartHandshake,
  Sliders,
  Square,
  Circle,
  Minus,
  Palette,
  Trash2,
  Loader2,
  Info,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

interface StudentPortalProps {
  initialSection?: 'text' | 'drawing' | 'survey' | 'quiz' | 'certificate';
}

import { SCHOOL_GRADES } from '../constants/grades';
import { SHIELD_TEMPLATES } from '../constants/templates';
import { ShieldTextCard } from './ShieldTextCard';

export const StudentPortal: React.FC<StudentPortalProps> = ({ initialSection = 'text' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'text' | 'drawing' | 'survey' | 'quiz' | 'certificate'>(initialSection);

  // Global student identity in this session
  const [studentName, setStudentName] = useState<string>('');
  const [grade, setGrade] = useState<string>(SCHOOL_GRADES[0]);

  // Loading and feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);

  // 1. Text Submission State
  const [textTitle, setTextTitle] = useState('رسالة ولاء واعتزاز لدِرعِ الوَطَن');
  const [textContent, setTextContent] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('emerald-shield');
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);
  const [submittedCardData, setSubmittedCardData] = useState<{
    id: string;
    title: string;
    content: string;
    templateId: string;
    studentName: string;
    grade: string;
    date: string;
  } | null>(null);

  // 2. Enhanced Canvas & Drawing State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#064e3b'); // Saudi Deep Green
  const [brushSize, setBrushSize] = useState(6);
  const [eraserSize, setEraserSize] = useState(14);
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser' | 'line' | 'rect' | 'circle'>('brush');
  const [brushStyle, setBrushStyle] = useState<'round' | 'calligraphy' | 'glow' | 'soft'>('round');
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [shapeSnapshot, setShapeSnapshot] = useState<ImageData | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [drawingTitle, setDrawingTitle] = useState('لوحة فخر واعتزاز بالوطن');
  const [drawingFeedback, setDrawingFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    subId?: string;
  } | null>(null);
  const studentNameInputRef = useRef<HTMLInputElement | null>(null);

  // 3. Survey State
  const [surveyType, setSurveyType] = useState<'pre' | 'post'>('pre');
  const [q1, setQ1] = useState(3);
  const [q2, setQ2] = useState(3);
  const [q3, setQ3] = useState(3);
  const [q4, setQ4] = useState(3);
  const [q5, setQ5] = useState(3);
  const [surveyNotes, setSurveyNotes] = useState('');
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // 4. Quiz State
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [awardedBadge, setAwardedBadge] = useState<string | null>(null);

  // 5. Charter / Pledge State
  const [pledgeAgreed, setPledgeAgreed] = useState(false);
  const [pledgeSigned, setPledgeSigned] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    if (activeSubTab === 'drawing' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setUndoStack([initialSnapshot]);
        setRedoStack([]);
      }
    }
  }, [activeSubTab]);

  // Coordinate helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Configure context for selected tool and style
  const applyContextStyle = (ctx: CanvasRenderingContext2D) => {
    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.lineWidth = eraserSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
      return;
    }

    ctx.strokeStyle = brushColor;
    ctx.fillStyle = brushColor;
    ctx.lineWidth = brushSize;

    if (brushStyle === 'round') {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    } else if (brushStyle === 'calligraphy') {
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'miter';
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
    } else if (brushStyle === 'glow') {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 10;
      ctx.shadowColor = brushColor;
      ctx.globalAlpha = 1.0;
    } else if (brushStyle === 'soft') {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 4;
      ctx.shadowColor = brushColor;
      ctx.globalAlpha = 0.35;
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPoint(coords);
    applyContextStyle(ctx);

    if (activeTool === 'brush' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else {
      setShapeSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    if (activeTool === 'brush' || activeTool === 'eraser') {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (startPoint && shapeSnapshot) {
      ctx.putImageData(shapeSnapshot, 0, 0);
      applyContextStyle(ctx);

      if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (activeTool === 'rect') {
        const w = coords.x - startPoint.x;
        const h = coords.y - startPoint.y;
        ctx.strokeRect(startPoint.x, startPoint.y, w, h);
      } else if (activeTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPoint(null);
    setShapeSnapshot(null);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev.slice(-25), currentState]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newUndo = [...undoStack];
    const current = newUndo.pop();
    if (!current) return;

    const previous = newUndo[newUndo.length - 1];
    ctx.putImageData(previous, 0, 0);
    setUndoStack(newUndo);
    setRedoStack((prev) => [...prev, current]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newRedo = [...redoStack];
    const restored = newRedo.pop();
    if (!restored) return;

    ctx.putImageData(restored, 0, 0);
    setUndoStack((prev) => [...prev, restored]);
    setRedoStack(newRedo);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save current drawing state to undo stack so student can undo anytime!
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const fresh = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev.slice(-25), currentState, fresh]);
    setRedoStack([]);
    setUploadedImageUrl(null);
    setDrawingFeedback({
      type: 'info',
      message: 'تم مسح اللوحة بنجاح. يمكنكِ الضغط على زر "تراجع" لاستعادة رسمتكِ في أي وقت.'
    });
  };

  const handleDownloadArtwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `لوحة_درع_الوطن_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Add Patriotic Stamp onto Canvas
  const addStamp = (stampType: 'shield' | 'palm' | 'star' | 'heart' | 'flag') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '48px sans-serif';
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (stampType === 'shield') ctx.fillText('🛡️', centerX, centerY);
    if (stampType === 'palm') ctx.fillText('🌴', centerX, centerY);
    if (stampType === 'star') ctx.fillText('⭐', centerX, centerY);
    if (stampType === 'heart') ctx.fillText('💚', centerX, centerY);
    if (stampType === 'flag') ctx.fillText('🇸🇦', centerX, centerY);

    ctx.restore();
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev.slice(-25), currentState]);
    setRedoStack([]);
  };

  // Upload external file to canvas
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setUndoStack((prev) => [...prev.slice(-25), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
        setUploadedImageUrl(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit Text Participation
  const handleSubmitText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMessage('يرجى إدخال اسم الطالبة أولاً');
      return;
    }
    if (!textContent.trim()) {
      setErrorMessage('يرجى كتابة نص المشاركة أو الخاطرة الوطنية');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.createSubmission({
        studentName: studentName.trim(),
        grade,
        type: 'text',
        title: textTitle.trim(),
        content: textContent.trim(),
        backgroundTemplate: selectedTemplateId
      });

      setSuccessMessage(res.message);
      setLastSubmissionId(res.submission.id);
      setSubmittedCardData({
        id: res.submission.id,
        title: textTitle.trim(),
        content: textContent.trim(),
        templateId: selectedTemplateId,
        studentName: studentName.trim(),
        grade,
        date: res.submission.createdAt
      });
      setTextContent('');

      // Award badge if first text participation (non-fatal if already awarded)
      try {
        await api.awardBadge({
          studentName: studentName.trim(),
          grade,
          badgeId: 'patriotic_voice',
          badgeTitle: 'شارة الكلمة والولاء الوطني',
          iconName: 'PenTool',
          reason: 'تقديم مشاركة نصية مميزة في منصة درع الوطن'
        });
      } catch (badgeErr) {
        console.warn('Badge award non-fatal:', badgeErr);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ المشاركة في قاعدة البيانات');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Drawing Participation
  const handleSubmitDrawing = async () => {
    if (!studentName.trim()) {
      setDrawingFeedback({
        type: 'error',
        message: 'يرجى كتابة اسم الطالبة أولاً لتوثيق وحفظ اللوحة في قاعدة البيانات السحابية.'
      });
      if (studentNameInputRef.current) {
        studentNameInputRef.current.focus();
        studentNameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setDrawingFeedback({
        type: 'error',
        message: 'تعذر الوصول إلى لوحة الرسم. يرجى إعادة المحاولة.'
      });
      return;
    }

    setIsSubmitting(true);
    setDrawingFeedback(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const uploadRes = await api.uploadDrawing(dataUrl);

      const subRes = await api.createSubmission({
        studentName: studentName.trim(),
        grade,
        type: 'drawing',
        title: drawingTitle.trim() || 'لوحة فخر واعتزاز بالوطن',
        content: `رسمة فنية معبرة عن درع الوطن والمادة 34 أعدتها الطالبة: ${studentName.trim()}`,
        fileUrl: uploadRes.url
      });

      setSuccessMessage(subRes.message);
      setLastSubmissionId(subRes.submission.id);

      setDrawingFeedback({
        type: 'success',
        message: 'تم حفظ لوحتكِ الوطنية بنجاح في قاعدة البيانات السحابية لمبادرة درع الوطن!',
        subId: subRes.submission.id
      });

      // Award creative badge (non-fatal if already awarded)
      try {
        await api.awardBadge({
          studentName: studentName.trim(),
          grade,
          badgeId: 'creative_shield',
          badgeTitle: 'وسام الإبداع الفني الوطني',
          iconName: 'Sparkles',
          reason: 'رسم لوحة وطنية معبرة في مرسم درع الوطن'
        });
      } catch (badgeErr) {
        console.warn('Badge auto-award non-fatal:', badgeErr);
      }
    } catch (err: any) {
      console.error('Save drawing error:', err);
      setDrawingFeedback({
        type: 'error',
        message: err.message || 'فشل حفظ الرسمة في قاعدة البيانات السحابية. يرجى المحاولة مجدداً.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Survey
  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMessage('يرجى إدخال اسم الطالبة أولاً');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.submitSurvey({
        studentName: studentName.trim(),
        grade,
        surveyType,
        q1,
        q2,
        q3,
        q4,
        q5,
        notes: surveyNotes.trim()
      });

      setSuccessMessage(res.message);
      setSurveySubmitted(true);

      // Award survey badge
      await api.awardBadge({
        studentName: studentName.trim(),
        grade,
        badgeId: surveyType === 'pre' ? 'pre_survey_badge' : 'post_survey_badge',
        badgeTitle: surveyType === 'pre' ? 'وسام المبادرة والاستطلاع' : 'وسام الأثر والوعي المتكامل',
        iconName: 'FileCheck2',
        reason: `إكمال ${surveyType === 'pre' ? 'الاستبانة القبلية' : 'الاستبانة البعدية'} لقياس الأثر`
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ الاستبانة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Constitutional Quiz Questions
  const quizQuestions = [
    {
      id: 1,
      q: 'ما هو نص الركن الأول في المادة (34) من النظام الأساسي للحكم؟',
      options: [
        'الدفاع عن الاقتصاد الوطني وتنميته',
        'الدفاع عن العقيدة الإسلامية، والمجتمع، والوطن',
        'حماية المرافق العامة والبيئة',
        'المشاركة في الأنشطة الثقافية'
      ],
      correct: 1
    },
    {
      id: 2,
      q: 'على من يقع واجب الدفاع عن العقيدة والمجتمع والوطن وفقاً للمادة 34؟',
      options: [
        'على القوات العسكرية فقط دون غيرها',
        'على كبار السن والمسؤولين حصراً',
        'واجب على كل مواطن ومواطنة',
        'على الجهات التطوعية والخيرية فقط'
      ],
      correct: 2
    },
    {
      id: 3,
      q: 'كيف تساهم طالبة الثانوية الأولى بالبدع كدرع للوطن في حماية المجتمع؟',
      options: [
        'بنشر الشائعات دون تدقيق',
        'بالسلبية وعدم الاهتمام بالشأن العام',
        'بالتحصين الفكري، ومكافحة الشائعات، والتفوق العلمي، والتكافل',
        'بالاكتفاء بالحضور المدرسي دون تفاعل'
      ],
      correct: 2
    },
    {
      id: 4,
      q: 'ما الذي يبينه النظام وفق نص المادة 34؟',
      options: [
        'أحكام الخدمة العسكرية',
        'أسعار السلع والمنتجات',
        'مواعيد الإجازات المدرسية',
        'أحكام المرور والسير'
      ],
      correct: 0
    }
  ];

  const handleSelectQuizOption = (qIdx: number, optIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleEvaluateQuiz = async () => {
    if (!studentName.trim()) {
      setErrorMessage('يرجى إدخال اسم الطالبة أولاً للاختبار');
      return;
    }
    if (Object.keys(quizAnswers).length < quizQuestions.length) {
      setErrorMessage('يرجى الإجابة عن جميع الأسئلة الأربعة');
      return;
    }

    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) correctCount++;
    });

    setQuizScore(correctCount);
    setQuizSubmitted(true);

    if (correctCount >= 3) {
      setAwardedBadge('وسام المعرفة الدستورية وحامية الوطن');
      try {
        await api.awardBadge({
          studentName: studentName.trim(),
          grade,
          badgeId: 'constitutional_scholar',
          badgeTitle: 'وسام المعرفة الدستورية وحامية الوطن',
          iconName: 'Shield',
          reason: `اجتياز اختبار المادة 34 بنتيجة ${correctCount}/${quizQuestions.length}`
        });

        // Record submission in database
        await api.createSubmission({
          studentName: studentName.trim(),
          grade,
          type: 'quiz',
          title: 'اجتياز اختبار الوعي الدستوري بالمادة 34',
          content: `حققت الطالبة درجة ${correctCount} من ${quizQuestions.length} وحصلت على وسام المعرفة الدستورية.`
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Sign National Charter Pledge
  const handleSignPledge = async () => {
    if (!studentName.trim()) {
      setErrorMessage('يرجى إدخال اسم الطالبة قبل توقيع الميثاق');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createSubmission({
        studentName: studentName.trim(),
        grade,
        type: 'pledge',
        title: 'ميثاق عهد ووفاء لدِرعِ الوَطَن',
        content: `أعاهد الله تعالى أن أكون درعاً حامياً لعقيدتي الإسلامية ومجتمعي ووطني الغالي، ممتثلة للمادة 34، ومخلصة لمليكي وولي عهده الأمين.`
      });

      await api.awardBadge({
        studentName: studentName.trim(),
        grade,
        badgeId: 'pledge_guardian',
        badgeTitle: 'شارة ميثاق الوفاء والعهد الوطني',
        iconName: 'HeartHandshake',
        reason: 'توقيع ميثاق درع الوطن والتعهد بالواجب الوطني'
      });

      setPledgeSigned(true);
      setSuccessMessage('تم اعتماد توقيعكِ لميثاق درع الوطن وحفظه في السجل السحابي للمدرسة!');
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر حفظ الميثاق');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Student Identity Card (Required first) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-950 text-white shadow-lg border border-amber-400/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-right w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Shield className="w-4 h-4" />
              <span>الثانوية الأولى بالبدع · بوابة الطالبة التفاعلية</span>
            </div>
            <h2 className="text-xl font-bold text-white">بيانات الطالبة للمشاركة وإصدار الشهادات والأوسمة</h2>
            <p className="text-xs text-emerald-200/90">
              إعداد وتنفيذ المعلمتين: <strong className="text-amber-300">أمل رشيد + وفاء الزهراني</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-60">
              <label className="block text-[11px] text-emerald-200 mb-1">اسم الطالبة الثلاثي:</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="أدخلي اسمكِ الكريم..."
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-emerald-400/30 text-white placeholder-emerald-300/50 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white/20 transition-all"
              />
            </div>

            <div className="w-full sm:w-52">
              <label className="block text-[11px] text-emerald-200 mb-1">الفصل الدراسي:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-400/30 text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400 transition-all cursor-pointer"
              >
                {SCHOOL_GRADES.map((g) => (
                  <option key={g} value={g} className="bg-emerald-950 text-white">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Sub-Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => {
            setActiveSubTab('text');
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'text'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200/70'
          }`}
        >
          <PenTool className="w-4 h-4 text-amber-400" />
          <span>المشاركة النصية</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('drawing');
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'drawing'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200/70'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>المرسم والتصاميم</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('survey');
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'survey'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200/70'
          }`}
        >
          <FileCheck2 className="w-4 h-4 text-amber-400" />
          <span>الاستبانة والقياس</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('quiz');
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'quiz'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200/70'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>الأنشطة والشارات</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('certificate');
            setSuccessMessage(null);
            setErrorMessage(null);
          }}
          className={`col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'certificate'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200/70'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>شهادة الاعتزاز</span>
        </button>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-right flex-1">
            <p className="text-sm font-bold">{successMessage}</p>
            {lastSubmissionId && (
              <p className="text-xs text-emerald-700">
                رقم التوثيق السحابي للمشاركة: <span className="font-mono font-bold">{lastSubmissionId}</span> (يمكن للمعلمتين مراجعته باللوحة).
              </p>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-right flex-1">
            <p className="text-sm font-bold">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* TAB 1: TEXT SUBMISSION */}
      {activeSubTab === 'text' && (
        <div className="space-y-6">
          {/* Main Form Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>1. المشاركات النصية والتأملات الوطنية</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                اكتبي رسالة اعتزاز بالوطن ودوركِ كدرع حامٍ لعقيدته ومجتمعه
              </h3>
              <p className="text-xs text-slate-500">
                اختاري إحدى «خلفيات درع الوطن» المزخرفة لإضفاء طابع بصري ملكي فاخر على مشاركتكِ وتوثيقها بالسجل السحابي للمبادرة.
              </p>
            </div>

            {/* Student Name Reminder if Empty */}
            {!studentName.trim() && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-900 flex items-center gap-3 text-xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold">تنبيه لطيف:</span> يرجى كتابة اسمكِ الرباعي في أعلى الصفحة أو في الحقل أدناه ليظهر على بطاقة درع الوطن المزخرفة.
                </div>
              </div>
            )}

            {/* Shield Background Template Selector */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-700" />
                  <span>اختاري «خلفية درع الوطن» المزخرفة لتعزيز الطابع البصري لمشاركتكِ:</span>
                </label>
                <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {SHIELD_TEMPLATES.length} قوالب وطنية فاخرة
                </span>
              </div>

              {/* Template Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SHIELD_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`relative p-3.5 rounded-2xl text-right transition-all cursor-pointer border text-xs flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-emerald-700 ring-2 ring-emerald-700/30 bg-emerald-50/40 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Top Preview Swatch & Badge */}
                      <div className="flex items-center justify-between w-full">
                        <div className={`h-7 px-2.5 rounded-lg bg-gradient-to-r ${tmpl.previewGradient} border flex items-center justify-center shadow-xs`}>
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                        </div>

                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>مختارة</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {tmpl.badgeText}
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-0.5">
                        <div className={`font-bold text-sm ${isSelected ? 'text-emerald-950 font-black' : 'text-slate-800'}`}>
                          {tmpl.name}
                        </div>
                        <div className="text-[11px] text-slate-500 leading-tight">
                          {tmpl.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submission Form Inputs */}
            <form onSubmit={handleSubmitText} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  عنوان المشاركة / الخاطرة:
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="مثال: نبض الولاء.. عهد وطني بالمادة 34"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700 transition-all font-semibold"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    نص المشاركة أو التأمل الوطني:
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {textContent.length} حرف
                  </span>
                </div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={5}
                  placeholder="سطري كلماتك الصادقة حول فهمك للمادة 34، ودور الفتاة السعودية في الدفاع عن عقيدتها ومجتمعها ووطنها، وكيف تكونين درعاً حصيناً لمملكتنا الغالية..."
                  className="w-full p-4 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700 transition-all leading-relaxed"
                  required
                />
              </div>

              {/* Live Preview Toggle & Card Box */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800">
                      معاينة حية لبطاقة «درع الوطن» المزخرفة:
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1.5 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    {showLivePreview ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>إخفاء المعاينة</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>إظهار المعاينة</span>
                      </>
                    )}
                  </button>
                </div>

                {showLivePreview && (
                  <div className="p-4 sm:p-6 bg-slate-100/70 rounded-2xl border border-slate-200">
                    <ShieldTextCard
                      templateId={selectedTemplateId}
                      title={textTitle}
                      content={textContent}
                      studentName={studentName || 'طالبة درع الوطن'}
                      grade={grade}
                      showActions={true}
                    />
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600 text-right w-full sm:w-auto">
                  الطالبة: <span className="font-bold text-slate-900">{studentName || 'لم يُحدد الاسم بعد'}</span> · الفصل: <span className="font-bold text-emerald-800">{grade}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !studentName.trim() || !textContent.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{isSubmitting ? 'جارٍ الحفظ والتوثيق السحابي...' : 'إرسال المشاركة واعتماد خلفية درع الوطن'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Celebratory Card on Recent Submission */}
          {submittedCardData && (
            <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-emerald-300 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      تم حفظ وتوثيق بطاقتكِ المزخرفة في قاعدة البيانات بنجاح!
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      رقم التوثيق: {submittedCardData.id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmittedCardData(null)}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  إغلاق هذه البطاقة ×
                </button>
              </div>

              <ShieldTextCard
                templateId={submittedCardData.templateId}
                title={submittedCardData.title}
                content={submittedCardData.content}
                studentName={submittedCardData.studentName}
                grade={submittedCardData.grade}
                date={submittedCardData.date}
                submissionId={submittedCardData.id}
                showActions={true}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTIVE DRAWING BOARD */}
      {activeSubTab === 'drawing' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-700">2. مرسم درع الوطن التفاعلي</span>
            <h3 className="text-xl font-bold text-slate-900">
              أبدعي برسم لوحة وطنية رقمية تعبر عن فخركِ بوطنكِ ومبادرة درع الوطن
            </h3>
            <p className="text-xs text-slate-500">
              استخدمي أدوات الرسم الحية، الفرشاة، الأختام الوطنية، أو ارفعي تصميماً جاهزاً لحفظه بالسجل السحابي.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                عنوان اللوحة / الرسمة:
              </label>
              <input
                type="text"
                value={drawingTitle}
                onChange={(e) => setDrawingTitle(e.target.value)}
                placeholder="مثال: درع الأمان وراية التوحيد الخفاقة"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700 transition-all"
              />
            </div>

            {/* Drawing Toolbar - Professional Creative Studio */}
            <div className="space-y-3 p-4 bg-slate-50/90 rounded-2xl border border-slate-200">
              {/* Row 1: Active Tool & Mode Selection */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700 ml-1">الأداة:</span>
                  <button
                    type="button"
                    onClick={() => setActiveTool('brush')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTool === 'brush'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>فرشاة الرسم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTool('eraser')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTool === 'eraser'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>ممحاة دقيقة</span>
                  </button>

                  <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

                  <button
                    type="button"
                    onClick={() => setActiveTool('line')}
                    className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                      activeTool === 'line'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="خط مستقيم"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTool('rect')}
                    className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                      activeTool === 'rect'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="مستطيل"
                  >
                    <Square className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTool('circle')}
                    className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                      activeTool === 'circle'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="دائرة"
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                </div>

                {/* Undo / Redo & Clear Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={undoStack.length <= 1}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                    title="تراجع (Ctrl+Z)"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                    <span>تراجع</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={redoStack.length === 0}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                    title="إعادة"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-slate-600" />
                    <span>إعادة</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadArtwork}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 rounded-xl text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                    title="تحميل اللوحة كصورة"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تحميل اللوحة</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    className="px-2.5 py-1.5 bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    title="مسح اللوحة بالكامل"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>مسح</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Thickness & Precision Eraser Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {activeTool === 'eraser' ? (
                  /* Precise Eraser Settings */
                  <div className="flex items-center gap-3 flex-wrap w-full bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Eraser className="w-4 h-4 text-amber-700" />
                      <span>سُمك الممحاة الدقيقة:</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[
                        { size: 4, label: 'دقيقة جداً (4px)' },
                        { size: 8, label: 'دقيقة (8px)' },
                        { size: 16, label: 'متوسطة (16px)' },
                        { size: 32, label: 'عريضة (32px)' }
                      ].map((item) => (
                        <button
                          key={item.size}
                          type="button"
                          onClick={() => setEraserSize(item.size)}
                          className={`px-2.5 py-1 text-xs rounded-lg border font-semibold cursor-pointer transition-all ${
                            eraserSize === item.size
                              ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                              : 'bg-white text-slate-700 border-amber-300 hover:bg-amber-100/50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Smooth slider for fine eraser */}
                    <div className="flex items-center gap-2 mr-auto">
                      <span className="text-[11px] text-amber-800 font-medium">تحكم دقيق:</span>
                      <input
                        type="range"
                        min="2"
                        max="50"
                        value={eraserSize}
                        onChange={(e) => setEraserSize(Number(e.target.value))}
                        className="w-28 accent-amber-700 cursor-pointer"
                      />
                      <div
                        className="rounded-full bg-amber-800/80 border border-white shrink-0 shadow-2xs"
                        style={{ width: `${Math.min(eraserSize, 28)}px`, height: `${Math.min(eraserSize, 28)}px` }}
                        title={`حجم الممحاة: ${eraserSize}px`}
                      />
                      <span className="text-xs font-mono font-bold text-amber-900">{eraserSize}px</span>
                    </div>
                  </div>
                ) : (
                  /* Brush Thickness & Style Settings */
                  <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                    {/* Brush thickness presets & slider */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-700">سُمك الفرشاة:</span>
                      {[
                        { size: 2, label: 'رفيع (2)' },
                        { size: 5, label: 'عادي (5)' },
                        { size: 10, label: 'متوسط (10)' },
                        { size: 18, label: 'عريض (18)' },
                        { size: 26, label: 'كبير (26)' }
                      ].map((item) => (
                        <button
                          key={item.size}
                          type="button"
                          onClick={() => setBrushSize(item.size)}
                          className={`px-2.5 py-1 text-xs rounded-lg border font-semibold cursor-pointer transition-all ${
                            brushSize === item.size
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}

                      {/* Slider */}
                      <div className="flex items-center gap-1.5 mr-2">
                        <input
                          type="range"
                          min="1"
                          max="40"
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-24 accent-emerald-800 cursor-pointer"
                        />
                        <div
                          className="rounded-full border border-slate-300 shrink-0"
                          style={{
                            width: `${Math.min(brushSize, 24)}px`,
                            height: `${Math.min(brushSize, 24)}px`,
                            backgroundColor: brushColor
                          }}
                          title={`سُمك الفرشاة: ${brushSize}px`}
                        />
                        <span className="text-xs font-mono font-bold text-slate-700">{brushSize}px</span>
                      </div>
                    </div>

                    {/* Brush Style */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-600">النمط:</span>
                      {[
                        { id: 'round', label: 'عادي' },
                        { id: 'calligraphy', label: 'خط عربي' },
                        { id: 'glow', label: 'توهج وطني' },
                        { id: 'soft', label: 'ناعم' }
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setBrushStyle(s.id as any)}
                          className={`px-2 py-0.5 text-xs rounded-md border cursor-pointer ${
                            brushStyle === s.id
                              ? 'bg-emerald-900 text-white border-emerald-900 font-bold'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 3: Colors & National Stamps */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
                {/* Palette */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700 ml-1">الألوان:</span>
                  {[
                    { color: '#064e3b', label: 'أخضر داكن' },
                    { color: '#059669', label: 'أخضر زمردي' },
                    { color: '#d97706', label: 'ذهبي ملكي' },
                    { color: '#b45309', label: 'برونزي' },
                    { color: '#0f172a', label: 'أسود كحل' },
                    { color: '#dc2626', label: 'أحمر' },
                    { color: '#0284c7', label: 'أزرق سماوي' },
                    { color: '#ffffff', label: 'أبيض' }
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => {
                        setBrushColor(c.color);
                        if (activeTool === 'eraser') setActiveTool('brush');
                      }}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        brushColor === c.color && activeTool !== 'eraser'
                          ? 'scale-125 border-amber-400 shadow-md ring-2 ring-emerald-700/40'
                          : 'border-slate-300'
                      }`}
                    />
                  ))}

                  {/* Custom color picker */}
                  <label
                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white border border-slate-200 cursor-pointer hover:bg-slate-100 text-xs text-slate-700 shadow-2xs mr-1"
                    title="اختيار لون مخصص"
                  >
                    <Palette className="w-3.5 h-3.5 text-emerald-800" />
                    <span>مخصص</span>
                    <input
                      type="color"
                      value={brushColor}
                      onChange={(e) => {
                        setBrushColor(e.target.value);
                        if (activeTool === 'eraser') setActiveTool('brush');
                      }}
                      className="w-4 h-4 p-0 border-0 cursor-pointer rounded-full"
                    />
                  </label>
                </div>

                {/* Patriotic Stamps */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-700">أختام درع الوطن:</span>
                  {[
                    { type: 'shield', label: '🛡️ درع' },
                    { type: 'palm', label: '🌴 نخلة' },
                    { type: 'star', label: '⭐ تميز' },
                    { type: 'heart', label: '💚 ولاء' },
                    { type: 'flag', label: '🇸🇦 راية' }
                  ].map((stamp) => (
                    <button
                      key={stamp.type}
                      type="button"
                      onClick={() => addStamp(stamp.type as any)}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-2xs"
                      title={`إضافة ختم ${stamp.label}`}
                    >
                      {stamp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Canvas Area */}
            <div className="flex justify-center bg-slate-200/60 p-4 rounded-2xl border border-slate-300 overflow-auto">
              <canvas
                ref={canvasRef}
                width={700}
                height={420}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-white rounded-xl shadow-md border border-slate-300 touch-none cursor-crosshair max-w-full"
              />
            </div>

            {/* Drawing Feedback Messages (Success / Error / Info) */}
            {drawingFeedback && (
              <div className="pt-1">
                {drawingFeedback.type === 'success' && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-900">{drawingFeedback.message}</p>
                        {drawingFeedback.subId && (
                          <p className="text-xs text-emerald-700 font-mono mt-0.5">
                            رقم التوثيق السحابي للمشاركة: <span className="font-bold underline">{drawingFeedback.subId}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mr-auto sm:mr-0">
                      <button
                        type="button"
                        onClick={handleDownloadArtwork}
                        className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100/50 cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل نسخة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('certificate')}
                        className="px-3 py-1.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>شهادة التكريم</span>
                      </button>
                    </div>
                  </div>
                )}

                {drawingFeedback.type === 'error' && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-950 flex items-start gap-2.5 shadow-xs">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-right">
                      <p className="text-sm font-bold text-red-900">{drawingFeedback.message}</p>
                    </div>
                  </div>
                )}

                {drawingFeedback.type === 'info' && (
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600 shrink-0" />
                      <p className="text-xs font-semibold text-blue-900">{drawingFeedback.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleUndo}
                      disabled={undoStack.length <= 1}
                      className="px-3 py-1 bg-white border border-blue-200 text-blue-800 rounded-lg text-xs font-bold hover:bg-blue-100/50 cursor-pointer flex items-center gap-1 disabled:opacity-40"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>تراجع واستعادة</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Inline Student Identity Fields for Drawing */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الطالبة الرسامة: <span className="text-red-500">*</span>
                </label>
                <input
                  ref={studentNameInputRef}
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (drawingFeedback?.type === 'error') setDrawingFeedback(null);
                  }}
                  placeholder="أدخلي اسمكِ الثلاثي..."
                  className={`w-full px-3.5 py-2 rounded-xl text-xs border transition-all ${
                    !studentName.trim() && drawingFeedback?.type === 'error'
                      ? 'border-red-400 bg-red-50/50 ring-2 ring-red-300'
                      : 'border-slate-300 bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-hidden'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الفصل الدراسي:
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-hidden cursor-pointer"
                >
                  {SCHOOL_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان اللوحة / الرسمة:
                </label>
                <input
                  type="text"
                  value={drawingTitle}
                  onChange={(e) => setDrawingTitle(e.target.value)}
                  placeholder="مثال: لوحة درع الوطن"
                  className="w-full px-3.5 py-2 rounded-xl text-xs border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-emerald-700" />
                  <span>رفع رسمة من جهازكِ</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleClearCanvas}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="مسح لوحة الرسم بالكامل"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>مسح اللوحة</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadArtwork}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="تنزيل اللوحة كصورة بجهازكِ"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>تنزيل PNG</span>
                </button>
              </div>

              {/* Working Save Button */}
              <button
                type="button"
                onClick={handleSubmitDrawing}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                )}
                <span>{isSubmitting ? 'جارٍ حفظ اللوحة في قاعدة البيانات السحابية...' : 'حفظ الرسمة في قاعدة البيانات السحابية'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRE & POST SURVEY */}
      {activeSubTab === 'survey' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-blue-700">3. استبانة قياس الأثر المعرفي والوجداني</span>
              <h3 className="text-xl font-bold text-slate-900">
                استبانة الوعي بالمادة 34 من النظام الأساسي للحكم
              </h3>
              <p className="text-xs text-slate-500">
                نتائج هذه الاستبانة تُحسب في لوحة المعلمتين لإصدار تقرير الأثر الإحصائي المعتمد للمدرسة.
              </p>
            </div>

            {/* Pre/Post selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setSurveyType('pre');
                  setSurveySubmitted(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  surveyType === 'pre' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                استبانة قبلية
              </button>
              <button
                type="button"
                onClick={() => {
                  setSurveyType('post');
                  setSurveySubmitted(false);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  surveyType === 'post' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                استبانة بعدية
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitSurvey} className="space-y-6">
            <div className="space-y-5">
              {[
                { id: 'q1', val: q1, set: setQ1, title: '1. مدى معرفتي المسبقة بنص المادة (34) من النظام الأساسي للحكم:' },
                { id: 'q2', val: q2, set: setQ2, title: '2. مدى استيعابي لأبعاد الدفاع عن العقيدة الإسلامية والمجتمع والوطن:' },
                { id: 'q3', val: q3, set: setQ3, title: '3. مدى شعوري بالمسؤولية الوطنية كدرع واقٍ لحماية وطني ومدرستي:' },
                { id: 'q4', val: q4, set: setQ4, title: '4. إدراكي لدور الفتاة السعودية في الدفاع الفكري والاعتزاز بالهوية ومكافحة الشائعات:' },
                { id: 'q5', val: q5, set: setQ5, title: '5. استعدادي للتطوع والمشاركة الإيجابية في خدمة الوطن والمجتمع:' }
              ].map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{item.title}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {[
                      { score: 1, label: 'ضعيف جداً' },
                      { score: 2, label: 'بسيط' },
                      { score: 3, label: 'متوسط' },
                      { score: 4, label: 'جيد' },
                      { score: 5, label: 'ممتاز جداً' }
                    ].map((lvl) => (
                      <label
                        key={lvl.score}
                        className={`flex-1 min-w-[70px] text-center p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          item.val === lvl.score
                            ? 'bg-emerald-800 text-white border-emerald-800 font-bold shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name={item.id}
                          value={lvl.score}
                          checked={item.val === lvl.score}
                          onChange={() => item.set(lvl.score)}
                          className="hidden"
                        />
                        <div>{lvl.score} / 5</div>
                        <div className="text-[10px] mt-0.5">{lvl.label}</div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ملاحظات أو مقترحات إضافية لتعزيز الوعي بالمادة 34 (اختياري):
                </label>
                <textarea
                  value={surveyNotes}
                  onChange={(e) => setSurveyNotes(e.target.value)}
                  rows={2}
                  placeholder="أي فكرة أو اقتراح لخدمة المبادرة في المدرسة..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                تسجيل باسم: <span className="font-bold text-slate-800">{studentName || 'لم يُحدد'}</span> · الاستبانة:{' '}
                <span className="font-bold text-emerald-800">{surveyType === 'pre' ? 'القبلية' : 'البعدية'}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !studentName.trim() || surveySubmitted}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>
                  {surveySubmitted
                    ? 'تم حفظ الاستبانة بنجاح ✓'
                    : isSubmitting
                    ? 'جارٍ الحفظ في السحابة...'
                    : `إرسال الاستبانة ${surveyType === 'pre' ? 'القبلية' : 'البعدية'}`}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: INTERACTIVE QUIZ & CHARTER */}
      {activeSubTab === 'quiz' && (
        <div className="space-y-6">
          {/* Quiz Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700">4. مسابقة الوعي الدستوري بالمادة 34</span>
              <h3 className="text-xl font-bold text-slate-900">
                اختبري معلوماتكِ واحصلي على «وسام المعرفة الدستورية وحامية الوطن»
              </h3>
              <p className="text-xs text-slate-500">
                أجيبي عن الأسئلة بدقة لتسجيل شارتكِ رسمياً في قاعدة بيانات الثانوية الأولى بالبدع.
              </p>
            </div>

            <div className="space-y-5">
              {quizQuestions.map((q, idx) => (
                <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span>{q.q}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[idx] === optIdx;
                      let optionClasses = 'p-3 rounded-lg border text-xs text-right cursor-pointer transition-all ';

                      if (quizSubmitted) {
                        if (optIdx === q.correct) {
                          optionClasses += 'bg-emerald-100 text-emerald-900 border-emerald-500 font-bold';
                        } else if (isSelected && optIdx !== q.correct) {
                          optionClasses += 'bg-red-100 text-red-900 border-red-400';
                        } else {
                          optionClasses += 'bg-white text-slate-600 border-slate-200 opacity-60';
                        }
                      } else {
                        optionClasses += isSelected
                          ? 'bg-emerald-800 text-white border-emerald-800 font-bold shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => !quizSubmitted && handleSelectQuizOption(idx, optIdx)}
                          className={optionClasses}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              {quizSubmitted ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-slate-900">
                    النتيجة: {quizScore} من {quizQuestions.length}
                  </div>
                  {awardedBadge && (
                    <div className="text-xs text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>{awardedBadge}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500">
                  يتطلب الحصول على الوسام الإجابة الصحيحة على 3 أسئلة على الأقل.
                </div>
              )}

              {!quizSubmitted ? (
                <button
                  type="button"
                  onClick={handleEvaluateQuiz}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>تصحيح الإجابات ومنح الوسام</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setQuizSubmitted(false);
                    setQuizAnswers({});
                    setQuizScore(0);
                  }}
                  className="text-xs text-emerald-800 hover:underline cursor-pointer"
                >
                  إعادة المحاولة
                </button>
              )}
            </div>
          </div>

          {/* Virtual Pledge & Charter Section */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white border-2 border-amber-400/40 shadow-xl space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <HeartHandshake className="w-4 h-4" />
              <span>ميثاق عهد ووفاء · درع الوطن</span>
            </div>

            <div className="space-y-2 text-right">
              <h3 className="text-2xl font-bold text-white">وثيقة العهد الوطني لطالبات الثانوية الأولى بالبدع</h3>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                وثيقة شرف تعاهد فيها الطالبة الله والوطن على أن تكون درعاً حامياً لثوابتها الدينية وقيمها المجتمعية.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-amber-400/30 text-amber-100 font-calligraphy text-base sm:text-lg leading-loose text-center">
              « أُعَاهِدُ اللهَ تَعَالَى أَنْ أَكُونَ دِرْعاً حَامِياً لِعَقِيدَتِي الإِسْلَامِيَّةِ، وَمُجْتَمَعِي، وَوَطَنِي الغَالِي المَمْلَكَة العَرَبِيَّة السُّعُودِيَّة، مُسْتَلْهِمَةً المَادَّة 34 مِنْ النِّظَامِ الأَسَاسِيِّ لِلحُكْمِ، وَأَنْ أَبْذُلَ جُهْدِي فِي العِلْمِ وَالوَفَاءِ لِوُلَاةِ أَمْرِنَا حَفِظَهُمُ اللهُ. »
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs text-emerald-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pledgeAgreed}
                  onChange={(e) => setPledgeAgreed(e.target.checked)}
                  className="rounded text-amber-400 focus:ring-amber-400 w-4 h-4"
                />
                <span>أقرُّ ببنود الميثاق وأعتزُّ بواجبي الدستوري والشرعي</span>
              </label>

              <button
                type="button"
                onClick={handleSignPledge}
                disabled={!pledgeAgreed || !studentName.trim() || pledgeSigned || isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
              >
                <Shield className="w-4 h-4" />
                <span>{pledgeSigned ? 'تم توقيع الميثاق رسمياً ✓' : 'توقيع الميثاق واعتماده سحابياً'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CERTIFICATE OF APPRECIATION */}
      {activeSubTab === 'certificate' && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-emerald-700">5. شهادة شكر واعتزاز وتقدير رسمية</span>
            <h3 className="text-xl font-bold text-slate-900">
              شهادة مشاركة معتمدة باسم الطالبة والمدرسة والمعلمتين
            </h3>
            <p className="text-xs text-slate-500">
              قابلة للطباعة والحفظ بجودة عالية تخليداً لإنجازكِ ومشاركتكِ في مبادرة درع الوطن.
            </p>
          </div>

          {/* Certificate Canvas / Card */}
          <div className="p-8 sm:p-12 rounded-3xl bg-radial from-emerald-50 via-white to-amber-50/40 border-8 border-double border-amber-600/70 shadow-2xl relative overflow-hidden text-center space-y-6">
            {/* Corner Decorative Borders */}
            <div className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
            <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 border-amber-600 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 border-amber-600 pointer-events-none" />

            {/* School Header */}
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-900">المملكة العربية السعودية · وزارة التعليم</p>
              <p className="text-sm font-bold text-emerald-950">الثانوية الأولى بالبدع</p>
              <div className="w-24 h-0.5 bg-amber-500 mx-auto mt-2" />
            </div>

            {/* Shield Emblem in Certificate */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-900 text-amber-400 border-2 border-amber-400 flex items-center justify-center shadow-md">
                <Shield className="w-8 h-8 fill-amber-400/20" />
              </div>
            </div>

            {/* Certificate Title */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-calligraphy">
                شَهَادَةُ شُكْرٍ وَتَقْدِيرٍ وَاعْتِزَاز
              </h2>
              <p className="text-xs text-amber-800 font-bold">
                «مُبَادَرَةُ دِرْعِ الوَطَن - المَادَّة 34 مِنْ النِّظَامِ الأَسَاسِيِّ لِلحُكْم»
              </p>
            </div>

            {/* Recipient text */}
            <div className="space-y-3 max-w-2xl mx-auto py-2">
              <p className="text-sm text-slate-700 leading-loose">
                تَسُرُّ إدارة مبادرة درع الوطن بالثانوية الأولى بالبدع أن تمنح هذه الشهادة والوسام التقديري للطالبة النجيبة:
              </p>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-900 py-2 border-b-2 border-dashed border-amber-400 font-cairo">
                {studentName.trim() || 'اسم الطالبة الكريمة'}
              </div>
              <p className="text-xs text-slate-600">
                المقيدة بالصف: <span className="font-bold text-emerald-950">{grade}</span>
              </p>
              <p className="text-xs text-slate-700 leading-relaxed pt-2">
                تقديراً لمشاركتها الفاعلة وإسهامها المتميز في التوعية بالواجب الوطني المستلهم من المادة 34 من النظام الأساسي للحكم، وترسيخاً لقيم الولاء والانتماء والاعتزاز بوطننا المعطاء.
              </p>
            </div>

            {/* Official Signatures & Teachers Credit */}
            <div className="pt-8 grid grid-cols-2 gap-6 text-xs text-slate-800 max-w-lg mx-auto border-t border-amber-300">
              <div className="space-y-1">
                <p className="text-slate-500 font-medium">إعداد وتنفيذ المعلمة:</p>
                <p className="font-bold text-emerald-950 text-sm">أمل رشيد</p>
                <p className="text-[10px] text-amber-700">الثانوية الأولى بالبدع</p>
              </div>

              <div className="space-y-1">
                <p className="text-slate-500 font-medium">إعداد وتنفيذ المعلمة:</p>
                <p className="font-bold text-emerald-950 text-sm">وفاء الزهراني</p>
                <p className="text-[10px] text-amber-700">الثانوية الأولى بالبدع</p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')} · منصة درع الوطن السحابية
            </div>
          </div>

          {/* Print Button */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة الشهادة الرسمية أو حفظها كـ PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
