# סטודיו עיצוב הזמנות — ארכיטקטורת טרנספורמציה מלאה

**תאריך:** 2026-07-03
**סטטוס:** מסמך תכנון (טרם מומש)
**מטרה:** להפוך את מערכת ההזמנות מכרטיס בוטני קבוע לסטודיו עיצוב תבניות מלא — בחירת תבניות, שליטה מלאה באסתטיקה, עורך ויזואלי — בלי לשבור את ההזמנה החיה ובלי לפגוע בביצועי עמוד האורח.

---

## עיקרון-על: מנוע רינדור אחד, ספק נתונים אחד

כל המערכת נשענת על החלטה אחת: **ההזמנה מוגדרת כ-JSON (spec) ומרונדרת על ידי רכיב אחד** — `<InvitationRenderer spec guest />` — שמשמש בו-זמנית את:

1. עמוד ה-RSVP החי של האורח (Server Component, אפס JS של העורך)
2. התצוגה המקדימה בסטודיו (אותו רכיב, בקנבס העריכה)
3. צילום המסך לוואטסאפ (`/invite-preview`)
4. גלריית התבניות (רינדור מוקטן)

WYSIWYG אמיתי לא מושג על ידי ספריית עורך — הוא מושג מכך שהעורך והאתר החי מריצים את אותו קוד רינדור. זו הסיבה שלא נאמץ GrapesJS/Craft.js כמנוע: הם כופים מודל קנבס חופשי וקוד רינדור נפרד, וההזמנה שלנו היא כרטיס אנכי צר שזורם מלמעלה למטה. עורך בלוקים ייעודי קטן יותר, מהיר יותר, ו-RTL-נכון.

---

## 1. ארכיטקטורת נתונים ב-Supabase

### טבלאות חדשות

```sql
-- קטלוג תבניות (מערכת + נוצרות-משתמש)
create table design_templates (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,          -- 'botanical-classic'
  name         text not null,                 -- 'בוטני קלאסי'
  description  text not null default '',
  category     text not null default 'botanical',  -- botanical|modern|classic|playful
  is_system    boolean not null default false,     -- תבניות מובנות אינן ניתנות למחיקה
  preview_path text,                          -- נתיב תמונת preview ב-Storage
  spec         jsonb not null,                -- ה-spec המלא (ראה סכמה למטה)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- העיצוב הפעיל של האירוע (draft/published מופרדים — עריכה לא שוברת את ההזמנה החיה)
create table invitation_designs (
  id             uuid primary key default gen_random_uuid(),
  event_id       integer not null default 1,   -- מוכן-קדימה לריבוי אירועים
  template_id    uuid references design_templates(id) on delete set null,
  draft_spec     jsonb not null,
  published_spec jsonb,                        -- null = טרם פורסם, ההזמנה בעיצוב ברירת המחדל
  updated_at     timestamptz not null default now(),
  unique (event_id)
);

-- נכסים שהועלו (תמונות/לוגו)
create table design_assets (
  id           uuid primary key default gen_random_uuid(),
  event_id     integer not null default 1,
  kind         text not null,                 -- image|logo
  storage_path text not null,                 -- 'event-1/images/<uuid>.webp'
  thumb_path   text,
  mime         text not null,
  width        integer, height integer, size_bytes integer,
  created_at   timestamptz not null default now()
);

-- היסטוריית גרסאות (undo בין סשנים + שחזור פרסום קודם)
create table design_revisions (
  id         uuid primary key default gen_random_uuid(),
  design_id  uuid not null references invitation_designs(id) on delete cascade,
  spec       jsonb not null,
  kind       text not null default 'autosave', -- autosave|publish
  created_at timestamptz not null default now()
);
-- טריגר גיזום: שומרים 20 autosave אחרונים + כל ה-publish
```

RLS מופעל על כולן; אין מדיניות ציבורית — כל הגישה דרך API עם service key (התואם לדפוס הקיים בפרויקט), וה-spec המפורסם נחשף רק דרך endpoint ציבורי ייעודי.

### סכמת ה-spec (JSONB, מוּסָפת גרסה)

```jsonc
{
  "version": 1,                       // מאפשר מיגרציות עתידיות של הסכמה
  "canvas": {
    "width": 460,
    "background": { "type": "gradient", "from": "#f7f5f0", "to": "#eee9df", "angle": 135 },
    // או: { "type": "solid", "color": "#..." } / { "type": "image", "assetId": "..." , "overlayOpacity": 0.85 }
    "frame": { "style": "solid", "color": "#ebdcb9", "opacity": 0.4 }   // solid|dotted|gold|none
  },
  "theme": {
    "palette": {                      // טוקנים — בלוקים מפנים אליהם, לא ל-hex ישיר
      "primary": "#b8963e",           // זהב — שם הילד, הדגשות
      "ink":     "#5a5347",           // טקסט רץ
      "muted":   "#9a8e7a",
      "accent":  "#2c3e6b",           // פרשה/כותרות משנה
      "leaf":    "#3a4f7a",           // צבע עלים בעיטורים
      "berry":   "#b8963e"
    },
    "fonts": { "serif": "frank-ruhl-libre", "sans": "heebo" }
  },
  "blocks": [                         // מערך סדור = הזרימה האנכית של הכרטיס
    { "id": "b1", "type": "ornament",     "props": { "variant": "wreath-floral", "position": "top", "scale": 1 } },
    { "id": "b2", "type": "greeting",     "props": { "text": "שלום, {name} ♥", "size": "xs", "color": "muted" } },
    { "id": "b3", "type": "titleLines",   "props": { "lines": ["...", "..."], "size": "sm", "color": "ink" } },
    { "id": "b4", "type": "childName",    "props": { "fontSize": 56, "font": "serif", "color": "primary", "shadow": true } },
    { "id": "b5", "type": "divider",      "props": { "variant": "botanical-1" } },
    { "id": "b6", "type": "eventDetails", "props": { "dateEmphasis": true, "showHebrewDate": true } },
    { "id": "b7", "type": "image",        "props": { "assetId": "…", "radius": 16, "widthPct": 60 } },
    { "id": "b8", "type": "customText",   "props": { "text": "...", "italic": true, "color": "muted" } },
    { "id": "b9", "type": "rsvpButtons",  "props": { "style": "pill", "comingGradient": ["#2d6a4f", "#40916c"] } }
  ]
}
```

עקרונות: כל בלוק מטופס (typed) עם סכמת props קשיחה; צבעים מפנים לטוקן של ה-theme (החלפת פלטה = כל הכרטיס מתעדכן); שדות דינמיים (`{name}`, פרטי אירוע) נשאבים בזמן רינדור מ-`invitation_config` הקיימת — **התוכן נשאר בטבלה הקיימת, ה-spec מגדיר רק מראה ומבנה**. אין שבירה לאחור.

---

## 2. סכמת ה-API

כל המסלולים תחת `app/api/design/` מאחורי middleware האדמין הקיים, למעט `published`.
ולידציה: סכמת **zod** משותפת ב-`lib/design/schema.ts` — מקור אמת יחיד לקליינט ולשרת.

| Method | Route | תפקיד | הערות |
|---|---|---|---|
| GET | `/api/design/templates` | רשימת קטלוג | מחזיר מטא + preview בלבד, לא spec מלא |
| GET | `/api/design/templates/[id]` | spec מלא של תבנית | |
| POST | `/api/design/templates` | "שמור כתבנית" מהעיצוב הנוכחי | `{ name, category }` |
| DELETE | `/api/design/templates/[id]` | מחיקה | חסום עבור `is_system` |
| GET | `/api/design` | ה-draft הנוכחי לעורך | יוצר רשומה מתבנית ברירת מחדל אם אין |
| PUT | `/api/design` | שמירת draft | zod מלא, גודל ≤ 100KB, rate-limit 30/דקה; כותב גם revision (autosave, debounced) |
| POST | `/api/design/publish` | draft → published | כותב revision מסוג publish, `revalidateTag('design')` |
| POST | `/api/design/revert` | שחזור revision | `{ revisionId }` → נטען ל-draft |
| GET | `/api/design/revisions` | רשימת גרסאות | מטא בלבד |
| GET | `/api/design/published` | **ציבורי** — ה-spec לרינדור | Cache: `s-maxage=300, stale-while-revalidate`, מתאפס ב-publish |
| POST | `/api/design/assets` | העלאת נכס | ראה סעיף 4 |
| DELETE | `/api/design/assets/[id]` | מחיקת נכס | חסום אם בשימוש ב-spec פעיל |

חוזה שגיאות אחיד: `{ error: string, field?: string }` עם קודי HTTP נכונים — ולידציית zod שנכשלת מחזירה את נתיב השדה, כך שהעורך יכול להצביע על הבלוק הבעייתי.

---

## 3. אסטרטגיית העורך הוויזואלי (WYSIWYG) ב-React

**החלטה: עורך בלוקים ייעודי, לא ספריית עורך כללית.**

| שכבה | מימוש |
|---|---|
| רינדור | `InvitationRenderer` — פונקציה טהורה spec→JSX. Server Component בעמוד האורח; אותו קוד רץ בקנבס העורך |
| רישום בלוקים | `BLOCK_REGISTRY: Record<BlockType, { render, Inspector, defaults, label, icon }>` — הוספת סוג בלוק חדש = קובץ אחד |
| מצב עורך | `useReducer` + מחסנית undo/redo (immer patches). Autosave מושהה 2 שניות אחרי שינוי אחרון |
| גרירה | **dnd-kit** (`@dnd-kit/core` + `@dnd-kit/sortable`) — סידור מחדש של בלוקים בגרירה, והוספה בגרירה מפלטת הבלוקים. קל-משקל, נגיש (חיישני מקלדת מובנים), תומך RTL |
| בקרות Inspector | רכיבי shadcn (`npx shadcn@latest add slider popover tabs toggle-group`) — בורר טוקן-צבע, בורר פונט עם preview, סליידר גודל, גלריית וריאנטים לעיטורים |
| עריכה ישירה | קליק על טקסט בקנבס → contentEditable מבוקר inline; קליק על עיטור → פותח גלריית וריאנטים |
| טעינה | כל העורך ב-`dynamic(import(...))` — צ'אנק אדמין בלבד, אפס השפעה על עמוד האורח |

**שלביות מימוש** (כל שלב שמיש בפני עצמו):
- **שלב 0 — חילוץ:** המרת העיצוב הבוטני הקיים ל-spec v1 + `InvitationRenderer`, מאחורי feature flag, עם בדיקות snapshot שמוכיחות זהות פיקסלית להיום. הבוטני הנוכחי הופך לתבנית מערכת "בוטני קלאסי".
- **שלב 1 — סטודיו Theme:** גלריית תבניות + עריכת פלטה/פונטים/רקע/וריאנטי עיטורים על מבנה קבוע. 80% מהערך, 20% מהמורכבות.
- **שלב 2 — עורך בלוקים:** סידור/הוספה/הסרה בגרירה, העלאת תמונות, טקסט חופשי.
- **שלב 3 — שמור-כתבנית, היסטוריית גרסאות מלאה, ריבוי אירועים.**

---

## 4. אחסון וניהול נכסים — Supabase Storage

- **Bucket `design-assets`** — קריאה ציבורית, כתיבה רק דרך ה-API (לא ישירות מהקליינט). מבנה: `event-{id}/images/{uuid}.webp`, `event-{id}/previews/{templateId}.webp`.
- **צנרת העלאה בצד שרת** (route handler): קבלת קובץ ≤ 5MB (jpg/png/webp בלבד) → עיבוד עם sharp: המרה ל-webp, הגבלה ל-1600px, יצירת thumbnail 400px, **מחיקת EXIF** (פרטיות — תמונות ילדים עם geo-tags) → רישום ב-`design_assets`.
- **SVG לא מתקבל מהמשתמש** — וקטור XSS קלאסי. ספריית העיטורים (זרים, ענפים, מפרידים) חיה בקוד הריפו כרכיבי React מגורסים, ומופנית ב-spec לפי `variant` בלבד.
- **פונטים: אוסף אצור, לא העלאות משתמש** (רישוי + ביצועים). רישום בקוד דרך `next/font` עם subsetting עברי: Heebo, Frank Ruhl Libre, Assistant, David Libre, Secular One, Amatic SC. self-hosted אוטומטית — משפר גם את הביצועים וגם את הפרטיות מול Google Fonts הנוכחי.
- **מכסות וניקיון:** תקרה 50 נכסים / 100MB לאירוע; משימת ניקוי לנכסים יתומים (לא מופנים מאף spec/revision בן פחות מ-30 יום).

---

## 5. קווים מנחים ל-UX של סטודיו התבניות

- **Gallery-first, לעולם לא דף ריק:** הזרימה נפתחת בגריד תבניות עם preview אמיתי (מרונדר מה-spec שלהן, עם נתוני דוגמה) → "התאם אישית". קסטומיזציה תמיד מתחילה מנקודה יפה.
- **פריסת שלושה פאנלים בדסקטופ:** ימין (RTL ראשון) — פלטת בלוקים ושכבות; מרכז — הקנבס ברוחב אמיתי 460px עם החלפת מצב תצוגה: מובייל / דסקטופ / "כך זה ייראה בוואטסאפ" (מסגרת בועת צ'אט); שמאל — Inspector של הבלוק הנבחר. במובייל-אדמין: Inspector כ-bottom sheet.
- **מניפולציה ישירה:** עריכת טקסט בקליק על הקנבס; קליק על עיטור מחליף וריאנט; גרירת בלוק עם קווי snap ו-placeholder.
- **חופש עם מעקות:** פלטות אצורות שנבדקו לניגודיות, זוגות פונטים מוכנים, מדרגות ריווח קבועות. צבע חופשי מותר — עם התראת ניגודיות WCAG חיה, וחסימת פרסום מתחת ל-AA על טקסט גוף.
- **Draft/Publish מפורש:** באנר "טיוטה — האורחים עדיין רואים את הגרסה הקודמת"; כפתור פרסום עם סיכום שינויים; שחזור גרסה קודמת בקליק. Autosave עם חיווי "נשמר לפני רגע"; Ctrl+Z / Ctrl+Shift+Z מלאים.
- **תצוגה מקדימה עם נתונים אמיתיים:** בורר "הצג כ..." עם מוזמן אמיתי או נתוני דוגמה — `{name}` וכל פרטי האירוע חיים.
- **נגישות של הסטודיו עצמו:** סידור בלוקים גם במקלדת (dnd-kit sensors), פוקוס נראה, aria-labels על כל בקרה, סמנטיקה נכונה (buttons, fieldsets). *(הערה להנחיית העיצוב הגלובלית: שפת ה-v0/Slate-950 חלה על מעטפת הסטודיו האדמיני — כולל מצב כהה; ההזמנה עצמה מולכת האורח שומרת על זהותה החמה-בוטנית — זה המוצר.)*

---

## 6. אבטחת מידע וביצועים

**אבטחה**
- ה-spec הוא קלט משתמש לכל דבר: ולידציית zod קשיחה בצד שרת (enum-ים לוריאנטים, regex ל-hex, תקרות אורך לטקסטים, סוגי בלוקים מוכרים בלבד — unknown נדחה, לא מסונן). טקסט מרונדר אך ורק כ-React text nodes; **אסור `dangerouslySetInnerHTML` בשום בלוק**.
- נכסים: ה-spec שומר `assetId`, לא URL — הרנדרר בונה URL רק מה-bucket שלנו. אין הפניה לדומיינים חיצוניים מההזמנה.
- כל כתיבות העיצוב מאחורי אימות אדמין + rate limit; `design_revisions` משמש גם כ-audit trail. RLS על כל הטבלאות החדשות.
- העלאות: הגבלת mime + גודל, עיבוד מחדש בשרת (מנטרל payloads), מחיקת EXIF.

**ביצועים**
- עמוד האורח: `published_spec` נטען ב-Server Component עם `unstable_cache` + `revalidateTag('design')` בפרסום — אפס עלות עריכה על האורח; יעד LCP < 1.5s ב-4G.
- העורך: dynamic import, וריאנטי עיטורים נטענים lazy; יעד TTI < 3s.
- תמונות דרך `next/image` עם ה-webp המעובד; פונטים subsetted דרך `next/font`; spec ≤ 100KB; בדיקת snapshot לכל תבנית מערכת מונעת רגרסיות רינדור.

---

## סיכום סדר מימוש מומלץ

| שלב | תכולה | סיכון | ערך |
|---|---|---|---|
| 0 | InvitationRenderer + spec v1 + טבלאות + snapshot tests | נמוך (feature flag) | תשתית הכרחית |
| 1 | גלריית תבניות + סטודיו Theme (פלטות/פונטים/רקעים/עיטורים) | נמוך | גבוה מאוד — הבידול המוצרי |
| 2 | עורך בלוקים מלא + נכסים | בינוני | גבוה |
| 3 | שמור-כתבנית, revisions UI, ריבוי אירועים | בינוני | פותח SaaS |
