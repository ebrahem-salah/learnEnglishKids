import { Component, signal } from '@angular/core';

/**
 * Privacy policy TEMPLATE for the app. Replace the highlighted [placeholders],
 * check every statement against what the app really does before publishing,
 * and ideally have it reviewed by a lawyer (children's apps are regulated: COPPA, GDPR-K, Google Play Families policy).
 */
@Component({
  selector: 'app-privacy',
  standalone: true,
  template: `
    <div class="max-w-3xl mx-auto space-y-4" [attr.dir]="lang() === 'ar' ? 'rtl' : 'ltr'">
      <div class="flex justify-center gap-3">
        <button (click)="lang.set('ar')" class="px-5 py-2 rounded-full font-black border-4 shadow"
                [class]="lang() === 'ar' ? 'bg-sky-500 text-white border-sky-700' : 'bg-white text-sky-700 border-sky-200'">العربية</button>
        <button (click)="lang.set('en')" class="px-5 py-2 rounded-full font-black border-4 shadow"
                [class]="lang() === 'en' ? 'bg-sky-500 text-white border-sky-700' : 'bg-white text-sky-700 border-sky-200'">English</button>
      </div>

      @if (lang() === 'ar') {
        <article class="bg-white rounded-3xl shadow-xl border-4 border-sky-200 p-6 space-y-4 leading-8 text-gray-700">
          <h1 class="text-3xl font-black text-sky-700">سياسة الخصوصية: تعلم مع يونس</h1>
          <p class="text-sm font-bold text-gray-400">آخر تحديث: {{ updated }}</p>
          <p>تطبيق «تعلم مع يونس» تطبيق تعليمي موجّه للأطفال (من 3 إلى 8 سنوات تقريبًا) يعلّم الحروف والكلمات والجمل بالإنجليزية والعربية. يقدّمه <b class="bg-yellow-100 px-1">[اسم المطوّر / الشركة]</b>. نحن نحترم خصوصية الأطفال ونجمع أقل قدر ممكن من البيانات.</p>

          <h2 class="text-xl font-black text-sky-700">1. ما البيانات التي نحفظها؟</h2>
          <p>يحفظ التطبيق على جهازك فقط: اسم الطفل الأول (يكتبه الأهل أو الطفل)، والنجوم والتقدم والإحصائيات، وإعدادات الصوت، وبيانات الحيوان الأليف والأطفال المتعددين. <b>لا ننشئ حسابات، ولا نرسل هذه البيانات إلى أي خادم، ولا نبيعها أو نشاركها.</b> يمكن للأهل مسحها من «منطقة الأهل» أو بمسح بيانات التطبيق من إعدادات الجهاز.</p>

          <h2 class="text-xl font-black text-sky-700">2. الميكروفون</h2>
          <p>يُستخدم الميكروفون فقط عندما يضغط الطفل على زر الميكروفون في تمارين النطق. <b>لا يسجّل التطبيق الصوت ولا يحفظه.</b> يتم التعرف على الكلام بواسطة خدمة التعرف على الكلام في جهازك أو متصفحك (وقد ترسل هذه الخدمات المقطع الصوتي إلى مزوّدها، مثل Google، وفق سياساتها).</p>

          <h2 class="text-xl font-black text-sky-700">3. خدمات وجهات خارجية</h2>
          <ul class="list-disc pr-6">
            <li><b>Google Fonts و jsDelivr:</b> لتحميل الخطوط وصور الإيموجي ومؤثرات الاحتفال. قد تستقبل هذه الخدمات عنوان IP عند التحميل.</li>
            <li><b>Unsplash:</b> لعرض صور بعض الكلمات.</li>
            <li><b>YouTube (youtube-nocookie.com):</b> لعرض فيديوهات الدروس. تخضع هذه الفيديوهات لسياسة خصوصية YouTube.</li>
            <li><b>Google Translate (نطق احتياطي):</b> إذا لم يتوفر ملف صوتي لكلمة ما، قد يُرسل <u>نص الكلمة فقط</u> للحصول على النطق. لا تُرسل أي بيانات شخصية.</li>
          </ul>

          <h2 class="text-xl font-black text-sky-700">4. الإعلانات والتتبع</h2>
          <p>لا يحتوي التطبيق على إعلانات، ولا أدوات تحليلات أو تتبع، ولا مشتريات داخل التطبيق.</p>

          <h2 class="text-xl font-black text-sky-700">5. الأطفال</h2>
          <p>لا نطلب من الأطفال أي معلومات شخصية. «منطقة الأهل» محمية بسؤال حسابي. نشجّع الأهل على مرافقة الطفل أثناء استخدام التطبيق.</p>

          <h2 class="text-xl font-black text-sky-700">6. التغييرات والتواصل</h2>
          <p>قد نحدّث هذه السياسة، وسيظهر تاريخ آخر تحديث أعلاه. للاستفسار أو لطلب حذف البيانات: <b class="bg-yellow-100 px-1">[بريدك الإلكتروني]</b></p>
        </article>
      } @else {
        <article class="bg-white rounded-3xl shadow-xl border-4 border-sky-200 p-6 space-y-4 leading-7 text-gray-700">
          <h1 class="text-3xl font-black text-sky-700">Privacy Policy: Learn With Younis</h1>
          <p class="text-sm font-bold text-gray-400">Last updated: {{ updated }}</p>
          <p>"Learn With Younis" is an educational app for young children (about 3 to 8 years old) that teaches letters, words and sentences in English and Arabic. It is provided by <b class="bg-yellow-100 px-1">[Developer / company name]</b>. We respect children's privacy and collect as little data as possible.</p>

          <h2 class="text-xl font-black text-sky-700">1. What data is stored?</h2>
          <p>The app stores only on your device: the child's first name, stars, progress and statistics, sound settings, pet data and the list of child profiles. <b>We do not create accounts, we do not send this data to any server, and we never sell or share it.</b> Parents can erase it in the Parent area or by clearing the app's data in the device settings.</p>

          <h2 class="text-xl font-black text-sky-700">2. Microphone</h2>
          <p>The microphone is used only when the child taps a microphone button in the speaking exercises. <b>The app does not record or store audio.</b> Speech recognition is performed by your device's or browser's speech service, which may send the audio to its provider (for example Google) under that provider's policy.</p>

          <h2 class="text-xl font-black text-sky-700">3. Third-party services</h2>
          <ul class="list-disc pl-6">
            <li><b>Google Fonts and jsDelivr:</b> to load fonts, emoji images and celebration effects. These services may receive your IP address.</li>
            <li><b>Unsplash:</b> to show pictures for some words.</li>
            <li><b>YouTube (youtube-nocookie.com):</b> to show lesson videos, subject to YouTube's privacy policy.</li>
            <li><b>Google Translate (fallback pronunciation):</b> if no audio file exists for a word, <u>only the word text</u> may be sent to get its pronunciation. No personal data is sent.</li>
          </ul>

          <h2 class="text-xl font-black text-sky-700">4. Ads and tracking</h2>
          <p>The app contains no ads, no analytics or tracking tools, and no in-app purchases.</p>

          <h2 class="text-xl font-black text-sky-700">5. Children</h2>
          <p>We do not ask children for any personal information. The Parent area is protected by a math question. We encourage parents to accompany their children while using the app.</p>

          <h2 class="text-xl font-black text-sky-700">6. Changes and contact</h2>
          <p>We may update this policy; the date above will change. Questions or data-deletion requests: <b class="bg-yellow-100 px-1">[your e-mail]</b></p>
        </article>
      }
    </div>
  `
})
export class PrivacyComponent {
  lang = signal<'ar' | 'en'>('ar');
  updated = new Date().toLocaleDateString('en-GB');
}
