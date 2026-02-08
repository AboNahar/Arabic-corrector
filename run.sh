#!/bin/bash

# تثبيت المكتبات المطلوبة
echo "📦 تثبيت المكتبات المطلوبة..."
pip install -q -r requirements.txt

# الانتقال إلى مجلد backend
cd backend

# تشغيل الخادم
echo "🚀 تشغيل خادم مُصَحِّح..."
echo "================================"
echo "✨ الموقع متاح على: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "================================"
echo ""
echo "اضغط Ctrl+C للإيقاف"
echo ""

python app.py
