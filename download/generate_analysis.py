# -*- coding: utf-8 -*-
import os, sys, hashlib
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether, CondPageBreak
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── Font Registration ──
pdfmetrics.registerFont(TTFont('DejaVuSerif', '/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansBold', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSans', '/usr/share/fonts/truetype/freefont/FreeSans.ttf'))
pdfmetrics.registerFont(TTFont('FreeSansBold', '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuMono', '/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('FreeSans', normal='FreeSans', bold='FreeSansBold')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSansBold')

# ── Palette (auto-generated) ──
ACCENT       = colors.HexColor('#4f2cb9')
TEXT_PRIMARY  = colors.HexColor('#262522')
TEXT_MUTED    = colors.HexColor('#7b776f')
BG_SURFACE   = colors.HexColor('#e1ded8')
BG_PAGE      = colors.HexColor('#f4f3f1')
TABLE_HEADER_COLOR = ACCENT
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = BG_SURFACE

# ── Page Setup ──
PAGE_W, PAGE_H = A4
LEFT_M = 1.0 * inch
RIGHT_M = 1.0 * inch
TOP_M = 0.8 * inch
BOT_M = 0.8 * inch
CONTENT_W = PAGE_W - LEFT_M - RIGHT_M

# ── Styles ──
body_font = 'FreeSans'
head_font = 'FreeSansBold'

s_title = ParagraphStyle('DocTitle', fontName=head_font, fontSize=28, leading=34,
    alignment=TA_CENTER, textColor=ACCENT, spaceAfter=6)
s_subtitle = ParagraphStyle('Subtitle', fontName=head_font, fontSize=14, leading=20,
    alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=24)

s_h1 = ParagraphStyle('H1', fontName=head_font, fontSize=20, leading=28,
    textColor=ACCENT, spaceBefore=18, spaceAfter=10)
s_h2 = ParagraphStyle('H2', fontName=head_font, fontSize=15, leading=22,
    textColor=ACCENT, spaceBefore=14, spaceAfter=8)
s_h3 = ParagraphStyle('H3', fontName=head_font, fontSize=12, leading=18,
    textColor=TEXT_PRIMARY, spaceBefore=10, spaceAfter=6)

s_body = ParagraphStyle('Body', fontName=body_font, fontSize=10.5, leading=17,
    alignment=TA_JUSTIFY, textColor=TEXT_PRIMARY, spaceAfter=6)
s_body_left = ParagraphStyle('BodyLeft', fontName=body_font, fontSize=10.5, leading=17,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceAfter=6)
s_bullet = ParagraphStyle('Bullet', fontName=body_font, fontSize=10.5, leading=17,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY, spaceAfter=4, leftIndent=18, bulletIndent=6)
s_code = ParagraphStyle('Code', fontName='DejaVuMono', fontSize=9, leading=14,
    alignment=TA_LEFT, textColor=colors.HexColor('#333333'), backColor=colors.HexColor('#f5f5f5'),
    spaceAfter=6, leftIndent=12, rightIndent=12, borderPadding=4)

s_table_header = ParagraphStyle('TH', fontName=head_font, fontSize=10.5,
    alignment=TA_CENTER, textColor=TABLE_HEADER_TEXT)
s_table_cell = ParagraphStyle('TC', fontName=body_font, fontSize=10,
    alignment=TA_LEFT, textColor=TEXT_PRIMARY)
s_table_cell_c = ParagraphStyle('TCC', fontName=body_font, fontSize=10,
    alignment=TA_CENTER, textColor=TEXT_PRIMARY)
s_caption = ParagraphStyle('Caption', fontName=body_font, fontSize=9, leading=13,
    alignment=TA_CENTER, textColor=TEXT_MUTED, spaceBefore=3, spaceAfter=6)

# ── TOC ──
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle('TOC1', fontName=head_font, fontSize=13, leftIndent=20, leading=22, spaceBefore=6, textColor=ACCENT),
    ParagraphStyle('TOC2', fontName=body_font, fontSize=11, leftIndent=40, leading=18, spaceBefore=2, textColor=TEXT_PRIMARY),
]

def heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = text
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

H1_ORPHAN = (PAGE_H - TOP_M - BOT_M) * 0.15

def major_section(text):
    return [CondPageBreak(H1_ORPHAN), heading(text, s_h1, 0)]

def make_table(data, col_widths, caption_text=None):
    elements = []
    t = Table(data, colWidths=col_widths, hAlign='CENTER')
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('GRID', (0, 0), (-1, -1), 0.5, TEXT_MUTED),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        bg = TABLE_ROW_EVEN if i % 2 == 1 else TABLE_ROW_ODD
        style_cmds.append(('BACKGROUND', (0, i), (-1, i), bg))
    t.setStyle(TableStyle(style_cmds))
    elements.append(Spacer(1, 18))
    elements.append(t)
    if caption_text:
        elements.append(Spacer(1, 6))
        elements.append(Paragraph(caption_text, s_caption))
    elements.append(Spacer(1, 18))
    return elements

# ── Build Content ──
story = []

# Title page content
story.append(Spacer(1, 120))
story.append(Paragraph('<b>Analiza repozitorija</b>', s_title))
story.append(Spacer(1, 8))
story.append(Paragraph('monter-balkonskih-ograj', ParagraphStyle('BigTitle', fontName=head_font,
    fontSize=22, leading=28, alignment=TA_CENTER, textColor=TEXT_PRIMARY)))
story.append(Spacer(1, 24))
story.append(Paragraph('Monter Ograj Pro - Profesionalna tablicna aplikacija za monterje balkonskih ograj', s_subtitle))
story.append(Spacer(1, 30))
story.append(Paragraph('GitHub: https://github.com/markec12345678/monter-balkonskih-ograj', ParagraphStyle('Link',
    fontName=body_font, fontSize=10, leading=16, alignment=TA_CENTER, textColor=ACCENT)))
story.append(Spacer(1, 16))
story.append(Paragraph('Datum analize: 5. junij 2026', ParagraphStyle('Date',
    fontName=body_font, fontSize=10, leading=16, alignment=TA_CENTER, textColor=TEXT_MUTED)))
story.append(Spacer(1, 16))
story.append(Paragraph('Avtor analize: Z.ai', ParagraphStyle('Author',
    fontName=body_font, fontSize=10, leading=16, alignment=TA_CENTER, textColor=TEXT_MUTED)))
story.append(PageBreak())

# TOC
story.append(Paragraph('<b>Kazalo vsebine</b>', ParagraphStyle('TOCTitle', fontName=head_font,
    fontSize=20, leading=28, alignment=TA_LEFT, textColor=ACCENT, spaceAfter=18)))
story.append(toc)
story.append(PageBreak())

# ── 1. Povzetek projekta ──
story.extend(major_section('1. Povzetek projekta'))
story.append(Paragraph(
    'Repozitorij <b>monter-balkonskih-ograj</b> vsebuje izvorno kodo Android aplikacije z imenom <b>Monter Ograj Pro</b>. '
    'Gre za profesionalno tablicno aplikacijo, namenjeno monterjem balkonskih ograj, ki delujejo na terenu po Sloveniji. '
    'Aplikacija omogoca terenske meritve, skiciranje ograj na fotografijah balkonov, vizualni predogled razlicnih stilov ograj v zivo '
    'ter avtomatsko generiranje strokovnih porocil s pomocjo umetne inteligence (Google Gemini AI). Projekt je bil ustvarjen s pomocjo '
    'orodja Google AI Studio in uporablja arhitekturo MVVM z lokalno Room podatkovno bazo, Jetpack Compose za uporabniski vmesnik '
    'ter Retrofit za komunikacijo z Gemini API-jem.', s_body))
story.append(Paragraph(
    'Aplikacija je jasno usmerjena v slovenski trg - ves uporabniski vmesnik je v slovenscini, podprte so slovenske gradbene norme '
    '(višina ograj, RAL barve, davcne stopnje DDV), vgrajen pa je tudi katalog izdelkov slovenskega proizvajalca ROKSAL iz Kranja. '
    'Projekt cilja na tablicne racunalnike (detekcija zaslonske sirine nad 680dp za master-detail razporeditev), hkrati pa podpira '
    'tudi mobilne telefone z animiranimi prehodi med zasloni.', s_body))

# ── 2. Tehnicni sklad ──
story.extend(major_section('2. Tehnicni sklad in arhitektura'))
story.append(heading('2.1. Gradbene tehnologije', s_h2, 1))

tdata = [
    [Paragraph('<b>Komponenta</b>', s_table_header), Paragraph('<b>Tehnologija</b>', s_table_header), Paragraph('<b>Razlicica</b>', s_table_header)],
    [Paragraph('Jezik', s_table_cell), Paragraph('Kotlin', s_table_cell), Paragraph('2.2.10', s_table_cell_c)],
    [Paragraph('UI Okvir', s_table_cell), Paragraph('Jetpack Compose + Material 3', s_table_cell), Paragraph('BOM 2024.09.00', s_table_cell_c)],
    [Paragraph('Podatkovna baza', s_table_cell), Paragraph('Room (SQLite)', s_table_cell), Paragraph('2.7.0', s_table_cell_c)],
    [Paragraph('Mrezna knjiznica', s_table_cell), Paragraph('Retrofit + OkHttp + Moshi', s_table_cell), Paragraph('2.12.0 / 4.10.0', s_table_cell_c)],
    [Paragraph('AI Integracija', s_table_cell), Paragraph('Google Gemini 3.5 Flash API', s_table_cell), Paragraph('v1beta', s_table_cell_c)],
    [Paragraph('Kamera', s_table_cell), Paragraph('CameraX (camera2)', s_table_cell), Paragraph('1.5.0', s_table_cell_c)],
    [Paragraph('Slikovni nalagalnik', s_table_cell), Paragraph('Coil Compose', s_table_cell), Paragraph('2.7.0', s_table_cell_c)],
    [Paragraph('Gradnja', s_table_cell), Paragraph('Gradle (Kotlin DSL) + KSP', s_table_cell), Paragraph('AGP 9.1.1', s_table_cell_c)],
    [Paragraph('Min SDK', s_table_cell), Paragraph('Android 7.0 (API 24)', s_table_cell), Paragraph('-', s_table_cell_c)],
    [Paragraph('Target SDK', s_table_cell), Paragraph('Android 16 (API 36)', s_table_cell), Paragraph('-', s_table_cell_c)],
]
story.extend(make_table(tdata, [CONTENT_W*0.35, CONTENT_W*0.42, CONTENT_W*0.23], 'Tabela 1: Tehnoloski sklad projekta'))

story.append(heading('2.2. Arhitektura MVVM', s_h2, 1))
story.append(Paragraph(
    'Aplikacija sledi vzorcu MVVM (Model-View-ViewModel), ki je priporočljivi arhitekturni vzorec za moderne Android aplikacije. '
    'Struktura je razdeljena na tri plasti: podatkovno (data), logično (ViewModel) in predstavno (UI/Compose). Podatkovna plast '
    'vključuje Room entiteto <b>Project</b>, DAO vmesnik <b>ProjectDao</b>, konverterje tipov <b>Converters</b> (Moshi za JSON '
    'serializacijo seznama SketchLine), singleton podatkovno bazo <b>AppDatabase</b> ter repozitorij <b>ProjectRepository</b>, '
    'ki abstrahira dostop do DAO-ja. ViewModel plast upravlja s stanjem aplikacije preko StateFlow objektov, omogoca pa dodajanje, '
    'posodabljanje, brisanje projektov ter shranjevanje slik in zagon analize Gemini AI.', s_body))

# ── 3. Struktura repozitorija ──
story.extend(major_section('3. Struktura repozitorija'))
story.append(Paragraph(
    'Repozitorij sledi standardni strukturi Android projekta z Gradle Kotlin DSL konfiguracijo. Izvorna koda je organizirana '
    'v paketu com.example z jasno ločnico med podatkovno plastjo (data), poslovno logiko (ui) in uporabniskimi komponentami '
    '(ui/screens, ui/components, ui/theme). Naslednja tabela prikazuje ključne datoteke in njihove namene.', s_body))

fdata = [
    [Paragraph('<b>Datoteka</b>', s_table_header), Paragraph('<b>Namen</b>', s_table_header)],
    [Paragraph('MainActivity.kt', s_table_cell), Paragraph('Vstopna tocka aplikacije, inicializacija Room DB, ViewModel-ja in Compose vsebine', s_table_cell)],
    [Paragraph('data/Models.kt', s_table_cell), Paragraph('Podatkovni modeli: FloatPoint, SketchLine, Project (Room entiteta)', s_table_cell)],
    [Paragraph('data/ProjectDao.kt', s_table_cell), Paragraph('Room DAO vmesnik s CRUD operacijami in Flow poizvedbami', s_table_cell)],
    [Paragraph('data/AppDatabase.kt', s_table_cell), Paragraph('Room podatkovna baza (singleton), razlicica 1, destruktivna migracija', s_table_cell)],
    [Paragraph('data/TypeConverters.kt', s_table_cell), Paragraph('Moshi konverter za serializacijo List&lt;SketchLine&gt; v JSON', s_table_cell)],
    [Paragraph('data/ProjectRepository.kt', s_table_cell), Paragraph('Repozitorij - abstrakcija nad DAO, izpostavlja Flow seznamov', s_table_cell)],
    [Paragraph('ui/ProjectViewModel.kt', s_table_cell), Paragraph('ViewModel z StateFlow stanji, CRUD logika, shranjevanje slik, Gemini klici', s_table_cell)],
    [Paragraph('ui/GeminiClient.kt', s_table_cell), Paragraph('Retrofit klient za Gemini 3.5 Flash API zBase64 kodiranjem slik', s_table_cell)],
    [Paragraph('ui/screens/DashboardScreen.kt', s_table_cell), Paragraph('Glavni zaslon s seznamom projektov, master-detail razporeditvijo, obrazci in kalkulatorjem', s_table_cell)],
    [Paragraph('ui/components/RailingVisualizer.kt', s_table_cell), Paragraph('Kanvas za skiciranje ograj na slikah z DrawingCanvas, prikaz ograd v zivo, kalibracija, primerjava Prej/Potem', s_table_cell)],
    [Paragraph('ui/components/LidarScannerDialog.kt', s_table_cell), Paragraph('Simuliran LiDAR/AR skener z animiranimi učinki, postavljanjem sidrnih tock in uvozom skenov', s_table_cell)],
    [Paragraph('ui/components/LidarCalibrationDialog.kt', s_table_cell), Paragraph('Kalibracijski dialog z simuliranim napredkom v treh korakih', s_table_cell)],
    [Paragraph('ui/components/PhotoCaptureComponent.kt', s_table_cell), Paragraph('Komponenta za zajem fotografije balkona preko kamere', s_table_cell)],
    [Paragraph('ui/components/ImageAnnotationCanvas.kt', s_table_cell), Paragraph('Kanvas za annotacijo slik z locnikom in povecevalnim steklom', s_table_cell)],
    [Paragraph('ui/components/RoksalCatalog.kt', s_table_cell), Paragraph('Brskalnik po ROKSAL katalogu izdelkov s tehnicnimi listi in navodili', s_table_cell)],
]
story.extend(make_table(fdata, [CONTENT_W*0.35, CONTENT_W*0.65], 'Tabela 2: Kljucne datoteke repozitorija'))

# ── 4. Podatkovni model ──
story.extend(major_section('4. Podatkovni model in Room baza'))
story.append(Paragraph(
    'Jedro podatkovnega modela je Room entiteta <b>Project</b>, ki shrani vse podatke o posameznem projektu montaže ograje. '
    'Entiteta vsebuje osnovne podatke o stranki (ime, naslov, telefon), tehnicne specifikacije ograje (stil, dolzina, visina, '
    'globina, nacin montaže, barva RAL), vizualne podatke (pot do originalne slike, seznam skicirnih crt SketchLine) ter '
    'rezultate AI analize (geminiEstimate). Vsak projekt ima tudi oznako isFinished za sledenje statusa.', s_body))

story.append(heading('4.1. Entiteta Project', s_h2, 1))
pdata = [
    [Paragraph('<b>Polje</b>', s_table_header), Paragraph('<b>Tip</b>', s_table_header), Paragraph('<b>Privzeto</b>', s_table_header), Paragraph('<b>Opis</b>', s_table_header)],
    [Paragraph('id', s_table_cell), Paragraph('Long', s_table_cell_c), Paragraph('auto', s_table_cell_c), Paragraph('Avtomatsko generiran primarni kljuc', s_table_cell)],
    [Paragraph('customerName', s_table_cell), Paragraph('String', s_table_cell_c), Paragraph('-', s_table_cell_c), Paragraph('Ime in priimek stranke', s_table_cell)],
    [Paragraph('address', s_table_cell), Paragraph('String', s_table_cell_c), Paragraph('-', s_table_cell_c), Paragraph('Naslov lokacije montaze', s_table_cell)],
    [Paragraph('railingStyle', s_table_cell), Paragraph('String', s_table_cell_c), Paragraph('MODERN_ALU', s_table_cell_c), Paragraph('Stil ograje (5 tipov)', s_table_cell)],
    [Paragraph('lengthCm / heightCm / widthCm', s_table_cell), Paragraph('Int', s_table_cell_c), Paragraph('350/110/0', s_table_cell_c), Paragraph('Dimenzije v centimetrih', s_table_cell)],
    [Paragraph('mountType', s_table_cell), Paragraph('String', s_table_cell_c), Paragraph('V tla', s_table_cell_c), Paragraph('Nacin sidranja (v tla ali bocno)', s_table_cell)],
    [Paragraph('colorHex / colorName', s_table_cell), Paragraph('String', s_table_cell_c), Paragraph('#2D2D2D', s_table_cell_c), Paragraph('Hex barva in RAL oznaka', s_table_cell)],
    [Paragraph('sketchLines', s_table_cell), Paragraph('List&lt;SketchLine&gt;', s_table_cell_c), Paragraph('emptyList()', s_table_cell_c), Paragraph('Seznam skicirnih crt (JSON v bazi)', s_table_cell)],
    [Paragraph('geminiEstimate', s_table_cell), Paragraph('String?', s_table_cell_c), Paragraph('null', s_table_cell_c), Paragraph('Rezultat Gemini AI analize', s_table_cell)],
    [Paragraph('isFinished', s_table_cell), Paragraph('Boolean', s_table_cell_c), Paragraph('false', s_table_cell_c), Paragraph('Status zakljucenosti projekta', s_table_cell)],
]
story.extend(make_table(pdata, [CONTENT_W*0.22, CONTENT_W*0.20, CONTENT_W*0.18, CONTENT_W*0.40], 'Tabela 3: Polja entitete Project'))

story.append(Paragraph(
    'Podatkovna baza uporablja Moshi za pretvorbo seznama SketchLine v JSON niz, kar omogoca shranjevanje kompleksnih '
    'podatkovnih struktur v SQLite stolpec. Razred SketchLine vsebuje seznam tock (FloatPoint), heksadecimalno barvo, '
    'debelino crtice, tip crtice (DRAWING za meritve ali RAILING za vizualizacijo ograje), stil ograje in opcionalno oznako. '
    'Ta pristop je priljubljen v manjsih projektih, vendar prinaša tudi slabosti: poizvedbe po posameznih skicnih crtah '
    'niso mogoce brez nalozitve celotnega seznama, prav tako ni mogoce učinkovito iskati projektov po stilu ograje znotraj '
    'skicnih crt.', s_body))

# ── 5. Funkcionalnosti ──
story.extend(major_section('5. Kljucne funkcionalnosti'))
story.append(heading('5.1. Upravljanje projektov', s_h2, 1))
story.append(Paragraph(
    'Aplikacija omogoca ustvarjanje novih projektov z vnosom podatkov o stranki (ime, naslov, telefonska stevilka). '
    'Projekti so prikazani v seznamu s hitrim iskanjem po imenu stranke ali naslovu. Vsak projekt lahko označimo kot '
    'zakljucen ali ga znova odpremo, predvsem pa ga lahko izbrisemo. Na tablicnih racunalnikih je uporabljen master-detail '
    'razporeditveni vzorec (35:65 razmerje), kjer je seznam projektov na levi strani, podrobnosti pa na desni. Na mobilnih '
    'napravah so seznami in podrobnosti prikazani sekvenčno z animiranimi prehodi (slide + fade).', s_body))

story.append(heading('5.2. Skiciranje in vizualizacija ograj', s_h2, 1))
story.append(Paragraph(
    'Srediscna funkcionalnost aplikacije je <b>RailingVisualizer</b>, ki omogoca nalaganje fotografije balkona in nanjo '
    'skiciranje ograj v realnem casu. Komponenta podpira tri nacine risanja: VIEW (pregled), MEASURE (meritve z oznakami '
    'dolzin) in RAILING (vizualizacija izbranega stila ograje na sliki). Uporabnik lahko izbira med petimi stili ograj '
    'ROKSAL: H-Line (vodoravne letve), Steklena (glass), V-Line (pokonczne letve), Panelna (CNC laserski izrez) in '
    'Klasik (tradicijska kovana). Na voljo je sedem RAL barv (antracit, crna, bela, srebrna eloksirana, rjava, imitacija '
    'hrast, imitacija oreh) z vizualnim izbirnikom.', s_body))
story.append(Paragraph(
    'Napredne funkcije vkljucujejo mrezno prikazovanje za natacnost, pripenjanje kotov na 45-stopinjske sektorje '
    '(angle snapping), umerjanje merila (kalibracija), primerjavo Prej/Potem z drsnim prehodom, razdeljeni pogled '
    '(split-view) ter razveljavljanje zadnjega koraka. Slike se nalagajo preko fotoaparata ali galerije, pri cemer '
    'aplikacija uporablja CameraX za neposreden zajem in FileProvider za varno deljenje URI-jev.', s_body))

story.append(heading('5.3. Integracija z Gemini AI', s_h2, 1))
story.append(Paragraph(
    'Aplikacija vkljucuje globoko integracijo z Google Gemini 3.5 Flash modelom preko REST API-ja. Ko monter vnese '
    'vse podatke o projektu in nalozi fotografijo balkona, lahko sprozi AI analizo, ki generira stiridelno strokovno '
    'porocilo v slovenscini: (1) Statika in varnost glede na slovenske predpise, (2) Tehnicna kalkulacija materiala '
    '(stevilo stebričkov, dolzina rocajev, sidrni vijaki), (3) Navodila za montazo na terenu in (4) Prodajna predstavitev '
    'za stranko. Slika balkona se kompresira na najvec 800px in kodira v Base64 za prenos k API-ju. Casovne omejitve '
    'HTTP povezave so nastavljene na 60 sekund za vsako od treh operacij (connect, read, write), kar zagotavlja dovolj '
    ' casa za obdelavo slikovnih podatkov z AI modelom.', s_body))

story.append(heading('5.4. Simuliran LiDAR skener', s_h2, 1))
story.append(Paragraph(
    'Ena izmed vizualno najizrazitejsih komponent je <b>LidarScannerDialog</b>, ki simulira LiDAR/AR skeniranje balkona. '
    'Komponenta prikazuje predogled kamere v ozadju z animiranimi učinki: matrika tock z globinskim ucinkom, animirana '
    'radarska črta, ki se premica po zaslonu, rocno postavljanje 3D sidrnih tock ter samodejno zaznavanje robov balkona. '
    'Po koncanem "skeniranju" se generirajo prednastavljene SketchLine crte za glavni in stranska robova balkona. Pomembno '
    'je poudariti, da gre za <b>simulacijo</b> - dejansko LiDAR skeniranje trenutno ni implementirano, vendar je v kodi '
    'predvidena integracija z ARCore v prihodnosti (komentar "V prihodnosti bo tu ArFragment"). Komponenta vkljucuje '
    'tudi kalibracijski dialog (LidarCalibrationDialog) s tremi simuliranimi koraki in indikatorjem napredka.', s_body))

story.append(heading('5.5. Kalkulator cen in ROKSAL katalog', s_h2, 1))
story.append(Paragraph(
    'V zavihku "Podatki in Meritve" je vgrajen interaktivni kalkulator cen, ki uposteva stil ograje (osnovna cena na meter), '
    'dimenzije (z 10-odstotnim dodatkem za odrezek in varnostni dobicek), visinski multiplikator (za ograje visje od 100 cm), '
    'nacin montaze (v tla 50 EUR, bocno v fasado 140 EUR), popust v odstotkih ter slovensko DDV stopnjo (9,5-odstotni za '
    'stanovanjske objekte ali 22-odstotni splosni). Katalog ROKSAL izdelkov (CatalogBrowser) prikazuje stirih modelov ograj '
    's povezavami na tehnicne liste in navodila za montazo, vendar so povezave trenutno referencne in ne vodijo na dejanske '
    'dokumente.', s_body))

# ── 6. Kakovost kode ──
story.extend(major_section('6. Ocena kakovosti kode'))
story.append(heading('6.1. Prednosti', s_h2, 1))
story.append(Paragraph(
    '<b>Modularna arhitektura:</b> Koda je jasno razdeljena na podatkovno plast, ViewModel in UI komponente. '
    'Uporaba repozitorija kot abstrakcijske plasti nad DAO-jem je dobra praksa, ki olajsja morebitne spremembe '
    'v podatkovnem viru. ViewModel uporablja StateFlow za reaktivno posodabljanje UI-ja, kar je skladno s '
    'priporocili Google za moderno Android arhitekturo.', s_body))
story.append(Paragraph(
    '<b>Tematska podpora:</b> Aplikacija podpira temni in svetli nacin z dinamicnimi barvami Material You '
    '(Android 12+). Uporabljene so komponente Material 3 s pravilnimi barvnimi shemami za oba nacina.', s_body))
story.append(Paragraph(
    '<b>Odzivna zasnova:</b> Detekcija tablicnega zaslona (680dp) za master-detail razporeditev kaže '
    'pozornost do uporabniske izkusnje na razlicnih velikostih zaslonov. Animirani prehodi na mobilnih '
    'napravah dodajajo poliranost.', s_body))
story.append(Paragraph(
    '<b>Varnost API kljucev:</b> Uporaba Secrets Gradle Plugin-ja z .env datoteko za shranjevanje '
    'Gemini API kljuca prepreci pomotni vpis kljuca v izvorno kodo. Prav tako je v kodi preverjanje, '
    'da kljuc ni prazen ali enak nadomestnemu nizu "MY_GEMINI_API_KEY".', s_body))

story.append(heading('6.2. Slabosti in izboljsave', s_h2, 1))
story.append(Paragraph(
    '<b>Velike datoteke komponent:</b> DashboardScreen.kt in RailingVisualizer.kt sta izjemno obsežni (več sto '
    'vrstic), kar otežuje vzdrževanje in testiranje. Priporočljiva je razdelitev na manjše, fokusirane komponente. '
    'Na primer, obrazec za vnos dimenzij bi lahko bil locena komponenta, kalkulator cen locen od prikaza projekta, '
    'priemer Prej/Potem locen od glavnega vizualizatorja.', s_body))
story.append(Paragraph(
    '<b>Ni.Dependency Injection:</b> Aplikacija ne uporablja DI okvira (Hilt, Koin). ViewModel se ročno instancira '
    'z ViewModelProvider.Factory v MainActivity, Room podatkovna baza pa se ustvarja neposredno v aktivnosti. '
    'Za večji projekt bi bilo vnašanje odvisnosti z Hiltom znatno izboljšanje, saj bi olajšalo testiranje in '
    'zmanjšalo tesno sklopljenost med komponentami.', s_body))
story.append(Paragraph(
    '<b>Odsotnost navigacijskega okvira:</b> Kljub temu, da je Navigation Compose deklariran v odvisnostih '
    '(komentiran), aplikacija ne uporablja formalnega navigacijskega graficona. Namesto tega stanje upravlja '
    'z lastnimi StateFlow spremenljivkami in pogojnim risanjem. To vodi v globoko gnezdenje komponent in '
    'zapleteno upravljanje stanja, ki ga navigacijski okvir poenostavi.', s_body))
story.append(Paragraph(
    '<b>Simulirana LiDAR funkcionalnost:</b> LiDAR skener je vizualno impresiven, vendar ne opravi dejanskega '
    '3D skeniranja. Generirane "zaznane" crte so harcodirane in ne temeljijo na dejanski geometriji balkona. '
    'Uporabnik bi lahko bil zaveden, da skener dejansko zaznava robove. Priporočljiva je bodisi jasna oznaka '
    '"simulacija" bodisi dejanska integracija z ARCore Depth API-jem za naprave, ki ga podpirajo.', s_body))
story.append(Paragraph(
    '<b>Destruktivna migracija baze:</b> AppDatabase uporablja fallbackToDestructiveMigration(), kar pomeni, '
    'da bo ob spremembi sheme celotna baza izbrisana. Za produkcijsko aplikacijo je to nesprejemljivo, saj '
    'uporabniki izgubijo vse podatke o projektih. Pravilni migracijski strategiji sta podajanje eksplicitnih '
    'migracijskih funkcij ali uporaba Automigration.', s_body))
story.append(Paragraph(
    '<b>Pomanjkanje testov:</b> V repozitoriju so le nadomestni testi (ExampleUnitTest, ExampleInstrumentedTest, '
    'ExampleRobolectricTest), ki ne pokrivajo dejanske poslovne logike. Za produktivno aplikacijo bi bili '
    'potrebni testi za ViewModel, Repository, GeminiClient in kljucne UI komponente. Roborazzi za slikovne '
    'teste je sicer deklariran, a se ne uporablja.', s_body))

# ── 7. Varnost ──
story.extend(major_section('7. Varnostna analiza'))
story.append(Paragraph(
    'Aplikacija ima nekaj pomembnih varnostnih premislekov, ki jih je treba upostevati pri nadaljnjem razvoju '
    'in uvajanju v produkcijsko okolje. Naslednja tabela povzema kljucne varnostne vidike in priporocila.', s_body))

sdata = [
    [Paragraph('<b>Vidik</b>', s_table_header), Paragraph('<b>Trenutno stanje</b>', s_table_header), Paragraph('<b>Priporocilo</b>', s_table_header)],
    [Paragraph('API kljuc', s_table_cell), Paragraph('Shranjen v .env, bran preko BuildConfig', s_table_cell), Paragraph('Za produkcijo: uporaba strenega backend proxy-ja, ki skrije API kljuc pred klientom', s_table_cell)],
    [Paragraph('Podatki strank', s_table_cell), Paragraph('Shranjeni v lokalni Room DB brez sifriranja', s_table_cell), Paragraph('Implementacija SQLCipher za sifriranje baze (osebni podatki)', s_table_cell)],
    [Paragraph('Mrezna komunikacija', s_table_cell), Paragraph('HTTPS za Gemini API, brez potrdilnega pripenjanja', s_table_cell), Paragraph('Dodaj Certificate Pinning za Gemini API domen', s_table_cell)],
    [Paragraph('ProGuard/R8', s_table_cell), Paragraph('Izkljucen (isMinifyEnabled = false)', s_table_cell), Paragraph('Vklopi minifikacijo in obfuscacijo za release build', s_table_cell)],
    [Paragraph('Debug keystore', s_table_cell), Paragraph('Vkljucen v repozitorij (base64)', s_table_cell), Paragraph('Odstrani debug keystore iz repozitorija, uporabi CI/CD skrivnosti', s_table_cell)],
    [Paragraph('Slike projektov', s_table_cell), Paragraph('Shranjene v internal filesDir (zašcitene pred drugimi aplikacijami)', s_table_cell), Paragraph('Dobro, vendar razmisliti o sifriranju obcutljivih fotografij', s_table_cell)],
]
story.extend(make_table(sdata, [CONTENT_W*0.18, CONTENT_W*0.38, CONTENT_W*0.44], 'Tabela 4: Varnostna analiza'))

# ── 8. Izboljsave ──
story.extend(major_section('8. Predlogi za izboljsave'))
story.append(heading('8.1. Kriticne izboljsave', s_h2, 1))
story.append(Paragraph(
    '<b>Implementirati Dependency Injection:</b> Uvedba Hilt okvira za upravljanje odvisnosti bi bistveno '
    'izboljsala testabilnost, zmanjsala sklopljenost in poenostavila zivljenjski cikel ViewModelov. Namesto '
    'rocne izdelave ViewModelFactory-ja v MainActivity bi Hilt samodejno vbrizgaval odvisnosti.', s_body))
story.append(Paragraph(
    '<b>Razdeliti velike komponente:</b> DashboardScreen.kt (vec kot 800 vrstic) in RailingVisualizer.kt '
    '(vec kot 700 vrstic) bi morali biti razdeljeni na manjse, fokusirane komponente. Na primer: ProjectFormTab, '
    'GeminiReportTab, RailingStyleSelector, ColorPicker, PriceCalculator, SplitViewContrast in podobne podkomponente. '
    'To izboljsa berljivost, vzdrzljivost in omogoca neodvisno testiranje.', s_body))
story.append(Paragraph(
    '<b>Uvesti navigacijski okvir:</b> Odstraniti komentar pri Navigation Compose odvisnosti in implementirati '
    'formalni NavGraph. To bo poenostavilo upravljanje stanja, omogocilo deep linking in izboljsalo UX s pravilnim '
    'obnavljanjem stanja pri vrtenju zaslona ali sistemskem brisanju procesa.', s_body))

story.append(heading('8.2. Pomembne izboljsave', s_h2, 1))
story.append(Paragraph(
    '<b>Implementirati pravilno migracijo baze:</b> Zamenjati fallbackToDestructiveMigration() z eksplicitnimi '
    'migracijskimi funkcijami. Celo za enostavne spremembe sheme je pomembno ohraniti uporabniske podatke. '
    'Alternativa je uporaba @AutoMigration iz Room knjiznice za avtomatsko generiranje migracij.', s_body))
story.append(Paragraph(
    '<b>Dodati teste:</b> Implementirati enotske teste za ViewModel, Repository in GeminiClient. Dodati UI teste '
    's Compose Testing knjiznico za kljucne poti uporabe (ustvarjanje projekta, skiciranje, zagon AI analize). '
    'Roborazzi je ze konfiguriran in bi lahko takoj uporabljen za regresijsko testiranje vizualnih komponent.', s_body))
story.append(Paragraph(
    '<b>Dejanska ARCore integracija:</b> Namesto simuliranega LiDAR skenerja implementirati pravo integracijo '
    'z ARCore Depth API-jem za naprave, ki ga podpirajo (naprave s ToF senzorjem ali LiDAR-jem). Za naprave '
    'brez podpore prikazati jasno obvestilo o omejitvi in ne navidezno funkcionalno simulacijo.', s_body))

story.append(heading('8.3. Zelene izboljsave', s_h2, 1))
story.append(Paragraph(
    '<b>Podpora za deljenje projektov:</b> Omogociti izvoz projekta (slika, skice, AI porocilo) v PDF ali '
    'deljivo povezavo. Trenutno ni mogoce deliti rezultatov s stranko ali sodelavci brez fizicnega posredovanja '
    'tablice. Ustvarjanje PDF porocila z vsemi podatki bi bilo naravna razširitev obstojece Gemini analize.', s_body))
story.append(Paragraph(
    '<b>Offline sinhronizacija:</b> Dodati podporo za sinhronizacijo projektov z oblacnim strežnikom '
    '(Firebase Firestore ali lasten backend). Trenutno so vsi podatki lokalni, kar pomeni, da izguba naprave '
    'pomeni izgubo vseh podatkov. Sinhronizacija bi omogocila tudi delo v timu z vec monterji.', s_body))
story.append(Paragraph(
    '<b>Večjezična podpora:</b> Lokalizirati aplikacijo z uporabo Androidovih string resources. Trenutno so '
    'vsi nizi harcodirani v Kotlin kodi, kar otežuje morebitno širitev na druge trge. Slovenci govorijo več '
    'jezikov, toda sosednje trge (Hrvaska, Avstrija, Italija) bi bilo mogoce pokriti z relativno malo napora.', s_body))

# ── 9. Zaključek ──
story.extend(major_section('9. Zakljucenek'))
story.append(Paragraph(
    'Projekt Monter Ograj Pro predstavlja ambiciozen in vizualno izrazit pristop k digitalizaciji terenskega dela '
    'monterjev balkonskih ograj. Aplikacija združuje več naprednih tehnologij (Jetpack Compose, Room, CameraX, '
    'Gemini AI, simuliran LiDAR) v koherentno celoto, ki jasno naslavlja potrebe slovenskega trga. Uporabniski '
    'vmesnik je poliran z animacijami, master-detail razporeditvijo za tablice in tematsko podporo Material You.', s_body))
story.append(Paragraph(
    'Kljub vizualni privlacnosti pa projekt potrebuje strukturnejši pristop k arhitekturi in kakovosti kode. '
    'Kljucne pomanjkljivosti so: odsotnost Dependency Injection okvira, prevelike komponente, ki bi jih bilo '
    'treba razdeliti, odsotnost formalne navigacije, simulirana LiDAR funkcionalnost, ki bi lahko zavedla '
    'uporabnike, ter destruktivna migracija podatkovne baze, ki je nesprejemljiva za produkcijsko uporabo. '
    'Prav tako je kritično pomanjkanje testov, ki bi zagotavljali zanesljivost poslovne logike.', s_body))
story.append(Paragraph(
    'Z implementacijo predlaganih izboljsav - predvsem Hilt DI, razdelitev velikih komponent, navigacijski '
    'okvir, pravilna migracija baze in testno pokritje - bi se aplikacija lahko razvila iz trenutnega prototipa '
    'v robustno produkcijsko orodje za terenske monterje po vsej Sloveniji.', s_body))

# ── Build ──
output_path = '/home/z/my-project/download/analiza_monter_ograj.pdf'
doc = TocDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=LEFT_M, rightMargin=RIGHT_M,
    topMargin=TOP_M, bottomMargin=BOT_M,
    title='Analiza repozitorija monter-balkonskih-ograj',
    author='Z.ai',
    creator='Z.ai',
    subject='Analiza izvorne kode Android aplikacije Monter Ograj Pro'
)
doc.multiBuild(story)
print(f'PDF generated: {output_path}')
