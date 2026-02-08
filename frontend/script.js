// متغيرات عامة
let currentResult = null;
let currentTab = 'marked';

// تحديث عداد الحروف
const inputText = document.getElementById('inputText');
const charCount = document.getElementById('charCount');

inputText.addEventListener('input', () => {
    const count = inputText.value.length;
    charCount.textContent = `${count.toLocaleString('ar-EG')} حرف`;
});

// تحميل نص تجريبي
function loadSample() {
    const sampleText = `الطالب ذهب الى المدرسه ودرس الرياضيات والعلوم. ثم عاد الى البيت وقرء كتابه المفضل. اللة يوفقه في دراسته.`;
    inputText.value = sampleText;
    inputText.dispatchEvent(new Event('input'));
}

// مسح النص
function clearInput() {
    inputText.value = '';
    document.getElementById('outputText').innerHTML = `
        <div class="placeholder">
            <div class="placeholder-icon">✨</div>
            <p>النتيجة ستظهر هنا</p>
        </div>
    `;
    document.getElementById('statsContainer').style.display = 'none';
    document.getElementById('correctionsList').style.display = 'none';
    document.getElementById('copyBtn').disabled = true;
    currentResult = null;
    inputText.dispatchEvent(new Event('input'));
}

// معالجة النص
async function processText() {
    const text = inputText.value.trim();
    
    if (!text) {
        showNotification('⚠️ الرجاء إدخال نص للمعالجة', 'warning');
        return;
    }
    
    const processBtn = document.getElementById('processBtn');
    const outputText = document.getElementById('outputText');
    
    // تعطيل الزر وإظهار التحميل
    processBtn.disabled = true;
    processBtn.classList.add('loading');
    outputText.innerHTML = '<div class="placeholder"><div class="placeholder-icon">⏳</div><p>جاري المعالجة...</p></div>';
    
    try {
        // استدعاء API
        const response = await fetch('http://localhost:8000/api/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        });
        
        if (!response.ok) {
            throw new Error('فشل في معالجة النص');
        }
        
        const data = await response.json();
        currentResult = data;
        
        // عرض النتائج
        displayResults(data);
        
        // تفعيل زر النسخ
        document.getElementById('copyBtn').disabled = false;
        
        showNotification('✅ تم المعالجة بنجاح!', 'success');
        
    } catch (error) {
        console.error('خطأ:', error);
        outputText.innerHTML = `
            <div class="placeholder">
                <div class="placeholder-icon">❌</div>
                <p>حدث خطأ في المعالجة. الرجاء المحاولة مرة أخرى.</p>
            </div>
        `;
        showNotification('❌ حدث خطأ في المعالجة', 'error');
    } finally {
        processBtn.disabled = false;
        processBtn.classList.remove('loading');
    }
}

// عرض النتائج
function displayResults(data) {
    // عرض النص حسب التبويب المختار
    switchTab(currentTab);
    
    // عرض الإحصائيات
    document.getElementById('correctionsCount').textContent = data.stats.corrections_count.toLocaleString('ar-EG');
    document.getElementById('wordsMarked').textContent = data.stats.words_marked.toLocaleString('ar-EG');
    document.getElementById('sentencesCount').textContent = data.stats.sentences_count.toLocaleString('ar-EG');
    document.getElementById('statsContainer').style.display = 'grid';
    document.getElementById('statsContainer').classList.add('fade-in');
    
    // عرض قائمة التصحيحات
    if (data.corrections && data.corrections.length > 0) {
        displayCorrections(data.corrections);
    } else {
        document.getElementById('correctionsList').style.display = 'none';
    }
}

// عرض قائمة التصحيحات
function displayCorrections(corrections) {
    const correctionsList = document.getElementById('correctionsList');
    const correctionsContent = document.getElementById('correctionsContent');
    
    let html = '';
    corrections.forEach((correction, index) => {
        html += `
            <div class="correction-item fade-in" style="animation-delay: ${index * 0.1}s">
                <span class="correction-original">${correction.original}</span>
                <span class="correction-arrow">←</span>
                <span class="correction-fixed">${correction.corrected}</span>
            </div>
        `;
    });
    
    correctionsContent.innerHTML = html;
    correctionsList.style.display = 'block';
}

// التبديل بين التبويبات
function switchTab(tab) {
    currentTab = tab;
    
    if (!currentResult) return;
    
    // تحديث الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target?.classList.add('active');
    
    const outputText = document.getElementById('outputText');
    
    switch(tab) {
        case 'marked':
            outputText.innerHTML = `<div class="fade-in" style="font-size: 1.4rem; line-height: 2.5;">${currentResult.marked}</div>`;
            break;
        case 'corrected':
            outputText.innerHTML = `<div class="fade-in">${currentResult.corrected}</div>`;
            break;
        case 'diff':
            outputText.innerHTML = generateDiff(currentResult.original, currentResult.corrected);
            break;
    }
}

// توليد عرض الفروقات
function generateDiff(original, corrected) {
    const originalWords = original.split(' ');
    const correctedWords = corrected.split(' ');
    
    let html = '<div class="diff-view fade-in">';
    
    for (let i = 0; i < Math.max(originalWords.length, correctedWords.length); i++) {
        const origWord = originalWords[i] || '';
        const corrWord = correctedWords[i] || '';
        
        if (origWord !== corrWord) {
            if (origWord) {
                html += `<span class="diff-removed">${origWord}</span> `;
            }
            if (corrWord) {
                html += `<span class="diff-added">${corrWord}</span> `;
            }
        } else {
            html += `${origWord} `;
        }
    }
    
    html += '</div>';
    return html;
}

// نسخ النتيجة
function copyResult() {
    if (!currentResult) return;
    
    let textToCopy = '';
    switch(currentTab) {
        case 'marked':
            textToCopy = currentResult.marked;
            break;
        case 'corrected':
            textToCopy = currentResult.corrected;
            break;
        case 'diff':
            textToCopy = currentResult.corrected;
            break;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showNotification('✅ تم النسخ إلى الحافظة', 'success');
    }).catch(() => {
        showNotification('❌ فشل النسخ', 'error');
    });
}

// إظهار الإشعارات
function showNotification(message, type = 'info') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // إضافة الأنماط
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4ade80' : type === 'warning' ? '#fbbf24' : '#ef4444'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 600;
        animation: slideDown 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // إزالة الإشعار بعد 3 ثواني
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// إضافة أنماط الرسوم المتحركة للإشعارات
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
    }
`;
document.head.appendChild(style);

// التمرير السلس للروابط
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// معالجة مفتاح Enter (Ctrl+Enter للمعالجة)
inputText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        processText();
    }
});

// تحميل النص التجريبي عند بدء الصفحة
window.addEventListener('load', () => {
    console.log('🚀 مُصَحِّح - منصة التصحيح الإملائي وتشكيل أواخر الكلمات');
    console.log('📝 جاهز للاستخدام!');
});
