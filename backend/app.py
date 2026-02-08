"""
منصة التصحيح الإملائي وتشكيل أواخر الكلمات العربية
Arabic Spelling Corrector and I'rab Marker
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
from typing import List, Dict

app = FastAPI(
    title="مصحح ومشكّل النصوص العربية",
    description="منصة للتصحيح الإملائي وتشكيل أواخر الكلمات العربية",
    version="1.0.0"
)

# السماح بطلبات CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TextInput(BaseModel):
    text: str


class Correction(BaseModel):
    original: str
    corrected: str
    position: int


class TextOutput(BaseModel):
    original: str
    corrected: str
    marked: str
    corrections: List[Correction]
    stats: Dict[str, int]


class SpellChecker:
    """مصحح إملائي للأخطاء الشائعة"""
    
    def __init__(self):
        # قاموس الأخطاء الإملائية الشائعة
        self.corrections = {
            # أخطاء الهمزة
            'الى': 'إلى',
            'على': 'على',
            'اللة': 'الله',
            'اكثر': 'أكثر',
            'افضل': 'أفضل',
            'احد': 'أحد',
            'احسن': 'أحسن',
            'اجمل': 'أجمل',
            'اكبر': 'أكبر',
            'اصغر': 'أصغر',
            
            # أخطاء التاء المربوطة
            'المدرسه': 'المدرسة',
            'الجامعه': 'الجامعة',
            'المكتبه': 'المكتبة',
            'الحياه': 'الحياة',
            'السعاده': 'السعادة',
            'الصحه': 'الصحة',
            'الغرفه': 'الغرفة',
            'الشركه': 'الشركة',
            
            # أخطاء الألف المقصورة واللينة
            'علي': 'على',
            'الي': 'إلى',
            'متى': 'متى',
            
            # أخطاء أسماء الإشارة
            'هاذا': 'هذا',
            'هاذه': 'هذه',
            'هاؤلاء': 'هؤلاء',
            'ذالك': 'ذلك',
            'تالك': 'تلك',
            
            # أخطاء الأفعال
            'ذهبو': 'ذهبوا',
            'درسو': 'درسوا',
            'كتبو': 'كتبوا',
            'قرءو': 'قرأوا',
            'اكلو': 'أكلوا',
            'شربو': 'شربوا',
            
            # أخطاء شائعة أخرى
            'الرياضيات': 'الرياضيات',
            'الرياضه': 'الرياضة',
            'كتابه': 'كتابة',
            'قرءه': 'قراءة',
            'قرء': 'قرأ',
            'مبارك': 'مبارك',
        }
    
    def correct_text(self, text: str) -> tuple[str, list]:
        """تصحيح النص وإرجاع النص المصحح مع قائمة التصحيحات"""
        corrections_list = []
        words = text.split()
        corrected_words = []
        
        for i, word in enumerate(words):
            # إزالة علامات الترقيم للمقارنة
            clean_word = re.sub(r'[^\w\s]', '', word)
            
            if clean_word in self.corrections:
                corrected = self.corrections[clean_word]
                # الحفاظ على علامات الترقيم
                for char in word:
                    if not char.isalnum() and char not in 'ًٌٍَُِّْ':
                        corrected += char
                
                corrections_list.append({
                    'original': word,
                    'corrected': corrected,
                    'position': i
                })
                corrected_words.append(corrected)
            else:
                corrected_words.append(word)
        
        return ' '.join(corrected_words), corrections_list


class IrabMarker:
    """مشكّل أواخر الكلمات بناءً على الإعراب"""
    
    def __init__(self):
        # حروف الجر
        self.prepositions = ['في', 'من', 'إلى', 'على', 'عن', 'ب', 'ل', 'ك']
        
        # الأفعال المتعدية الشائعة
        self.transitive_verbs = ['درس', 'كتب', 'قرأ', 'أكل', 'شرب', 'فعل', 'صنع']
    
    def mark_text(self, text: str) -> str:
        """إضافة علامات الإعراب لأواخر الكلمات"""
        sentences = re.split(r'[.!؟]', text)
        marked_sentences = []
        
        for sentence in sentences:
            if sentence.strip():
                marked = self._mark_sentence(sentence.strip())
                marked_sentences.append(marked)
        
        return '. '.join(marked_sentences)
    
    def _mark_sentence(self, sentence: str) -> str:
        """تشكيل جملة واحدة"""
        words = sentence.split()
        marked_words = []
        
        for i, word in enumerate(words):
            # إزالة أي تشكيل موجود
            clean_word = re.sub(r'[ًٌٍَُِّْ]', '', word)
            
            # تحديد الإعراب بناءً على الموقع
            if i == 0:
                # بداية الجملة - مبتدأ أو فاعل (مرفوع)
                marked_word = clean_word + 'ُ'
            elif i > 0 and words[i-1] in self.prepositions:
                # بعد حرف جر (مجرور)
                marked_word = clean_word + 'ِ'
            elif i > 0 and any(verb in words[i-1] for verb in self.transitive_verbs):
                # بعد فعل متعدي (منصوب)
                marked_word = clean_word + 'َ'
            elif clean_word.startswith('ال'):
                # الأسماء المعرفة عادة مرفوعة أو مجرورة
                if i > 0 and words[i-1] in self.prepositions:
                    marked_word = clean_word + 'ِ'
                else:
                    marked_word = clean_word + 'ُ'
            else:
                # افتراضياً: منصوب
                marked_word = clean_word + 'َ'
            
            marked_words.append(marked_word)
        
        return ' '.join(marked_words)


# إنشاء نسخ من الكلاسات
spell_checker = SpellChecker()
irab_marker = IrabMarker()


@app.get("/")
async def root():
    """الصفحة الرئيسية"""
    return {
        "message": "🎉 Welcome to Arabic Text Corrector API",
        "service": "مصحح ومشكّل النصوص العربية",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "process": "/api/process (POST)",
            "docs": "/docs"
        },
        "example": {
            "method": "POST",
            "url": "/api/process",
            "body": {"text": "الطالب ذهب الى المدرسه"}
        }
    }


@app.get("/api/health")
async def health_check():
    """فحص صحة الخدمة"""
    return {
        "status": "healthy",
        "service": "Arabic Text Processor",
        "version": "1.0.0"
    }


@app.post("/api/process", response_model=TextOutput)
async def process_text(input_data: TextInput):
    """معالجة النص: تصحيح إملائي + تشكيل أواخر"""
    try:
        original_text = input_data.text
        
        # 1. التصحيح الإملائي
        corrected_text, corrections = spell_checker.correct_text(original_text)
        
        # 2. تشكيل أواخر الكلمات
        marked_text = irab_marker.mark_text(corrected_text)
        
        # 3. حساب الإحصائيات
        sentences = re.split(r'[.!؟]', original_text)
        sentences = [s for s in sentences if s.strip()]
        words = original_text.split()
        
        result = {
            'original': original_text,
            'corrected': corrected_text,
            'marked': marked_text,
            'corrections': corrections,
            'stats': {
                'corrections_count': len(corrections),
                'words_count': len(words),
                'sentences_count': len(sentences),
                'words_marked': len(marked_text.split())
            }
        }
        
        return TextOutput(
            original=result['original'],
            corrected=result['corrected'],
            marked=result['marked'],
            corrections=[
                Correction(
                    original=c['original'],
                    corrected=c['corrected'],
                    position=c['position']
                ) for c in result['corrections']
            ],
            stats=result['stats']
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطأ في المعالجة: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    import os
    
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
