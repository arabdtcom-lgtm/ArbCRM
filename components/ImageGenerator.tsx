
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { ImageSize, GeneratedImage } from '../types';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('A cinematic shot of a massive Amazon Marine container ship navigating a sunset-lit Suez Canal, ultra-realistic, 8k');
  const [size, setSize] = useState<ImageSize>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    // Check for API key presence/selection flow
    // For gemini-3-pro-image-preview, user must have selected an API key.
    if (typeof window.aistudio !== 'undefined') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Billing doc link is provided in the actual UI dialog handled by the framework
        // After openSelectKey, we continue.
      }
    }

    setIsGenerating(true);
    setError(null);

    try {
      const url = await generateImage(prompt, size);
      setCurrentImage({
        id: Date.now().toString(),
        url,
        prompt,
        size
      });
    } catch (err: any) {
      console.error("Image generation failed:", err);
      if (err.message?.includes("Requested entity was not found")) {
        setError("يرجى اختيار مفتاح API صالح من مشروع مدفوع.");
        if (typeof window.aistudio !== 'undefined') {
          await window.aistudio.openSelectKey();
        }
      } else {
        setError("عذراً، فشل توليد الصورة. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <i className="fas fa-wand-magic-sparkles text-blue-600"></i>
          مصمم الصور اللوجستية
        </h2>
        <p className="text-slate-600 text-sm">قم بتوليد صور عالية الجودة لعمليات الشحن والأسطول البحري باستخدام الذكاء الاصطناعي.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">وصف الصورة (Prompt)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm h-24"
            placeholder="مثلاً: سفينة شحن ضخمة في المحيط..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-slate-700 mb-1">دقة الصورة</label>
            <div className="flex gap-2">
              {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    size === s 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="self-end px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <i className="fas fa-spinner animate-spin"></i>
                جاري التوليد...
              </>
            ) : (
              <>
                <i className="fas fa-bolt"></i>
                توليد الصورة
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <div className="mt-8 relative min-h-[300px] rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-dashed border-slate-300">
          {isGenerating ? (
            <div className="text-center z-10 p-8">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">نستخدم أرقى تقنيات الذكاء الاصطناعي لتصميم صورتك...</p>
              <p className="text-slate-400 text-xs mt-1">قد يستغرق ذلك بضع ثوانٍ</p>
            </div>
          ) : currentImage ? (
            <div className="group relative w-full h-full">
              <img 
                src={currentImage.url} 
                alt={currentImage.prompt} 
                className="w-full h-full object-cover shadow-inner"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <a 
                  href={currentImage.url} 
                  download={`amazon-marine-${Date.now()}.png`}
                  className="bg-white text-slate-900 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors"
                >
                  <i className="fas fa-download"></i>
                  تحميل
                </a>
              </div>
              <div className="absolute bottom-4 right-4 bg-slate-900/80 text-white px-3 py-1 rounded-md text-xs backdrop-blur-sm">
                الدقة: {currentImage.size}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 p-8">
              <i className="fas fa-image text-5xl mb-4 opacity-20"></i>
              <p>ستظهر الصورة المولدة هنا</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
