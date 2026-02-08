#!/bin/bash

echo "🧪 اختبار أمثلة مُصَحِّح"
echo "=========================="
echo ""

# مثال 1
echo "1️⃣ مثال بسيط:"
echo "المدخل: الطالب ذهب الى المدرسه"
curl -s -X POST http://localhost:8000/api/process \
  -H "Content-Type: application/json" \
  -d '{"text": "الطالب ذهب الى المدرسه"}' | \
  python3 -c "import json, sys; data=json.load(sys.stdin); print('المخرج:', data['marked']); print('التصحيحات:', data['stats']['corrections_count'])"
echo ""

# مثال 2
echo "2️⃣ جملة معقدة:"
echo "المدخل: الطالب درس في المكتبه وقرء كتابه المفضل"
curl -s -X POST http://localhost:8000/api/process \
  -H "Content-Type: application/json" \
  -d '{"text": "الطالب درس في المكتبه وقرء كتابه المفضل"}' | \
  python3 -c "import json, sys; data=json.load(sys.stdin); print('المخرج:', data['marked']); print('التصحيحات:', data['stats']['corrections_count'])"
echo ""

# مثال 3
echo "3️⃣ نص طويل:"
echo "المدخل: الطلاب ذهبو الى الجامعه. درسو الرياضيات والعلوم. اللة يوفقهم."
curl -s -X POST http://localhost:8000/api/process \
  -H "Content-Type: application/json" \
  -d '{"text": "الطلاب ذهبو الى الجامعه. درسو الرياضيات والعلوم. اللة يوفقهم."}' | \
  python3 -c "import json, sys; data=json.load(sys.stdin); print('المخرج:', data['marked']); print('التصحيحات:', data['stats']['corrections_count']); print('الجمل:', data['stats']['sentences_count'])"
echo ""

echo "✅ انتهى الاختبار!"
