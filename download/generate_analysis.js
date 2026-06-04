const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableOfContents,
} = require("docx");
const fs = require("fs");

// Palette: GO-1 Graphite Orange (proposal/report for construction industry)
const P = {
  primary: "1A2330",
  body: "000000",
  secondary: "607080",
  accent: "D4875A",
  surface: "F8F0EB",
  cover: {
    titleColor: "FFFFFF",
    subtitleColor: "B0B8C0",
    metaColor: "90989F",
    footerColor: "687078",
  },
  table: {
    headerBg: "D4875A",
    headerText: "FFFFFF",
    accentLine: "D4875A",
    innerLine: "DDD0C8",
    surface: "F8F0EB",
  },
};

const c = (hex) => hex.replace("#", "");

// ── Cover Recipe R1 (Pure Paragraph Left) ──
function buildCoverR1() {
  const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const allNoBorders = {
    top: NB, bottom: NB, left: NB, right: NB,
    insideHorizontal: NB, insideVertical: NB,
  };

  const titleText = "Analiza aplikacije Monter Ograj Pro";
  const subtitleText = "Tr\u017ei\u0161na analiza, primerjava s konkurenco in priporo\u010dila za razvoj terenske aplikacije za monterje balkonskih ograj in teras";

  const titleLines = [
    "Analiza aplikacije",
    "Monter Ograj Pro",
  ];

  const metaLines = [
    "Repozitorij: github.com/markec12345678/monter-balkonskih-ograj",
    "Datum: 5. junij 2026",
    "Avtor: Super Z analiza",
  ];

  const children = [];

  // Title lines
  titleLines.forEach((line, i) => {
    children.push(
      new Paragraph({
        spacing: {
          before: i === 0 ? 4200 : 100,
          after: 100,
          line: Math.ceil(36 * 23),
          lineRule: "atLeast",
        },
        children: [
          new TextRun({
            text: line,
            bold: true,
            size: 72,
            color: P.cover.titleColor,
            font: { ascii: "Calibri", eastAsia: "SimHei" },
          }),
        ],
      })
    );
  });

  // Accent line
  children.push(
    new Paragraph({
      spacing: { before: 300, after: 300 },
      indent: { left: 0, right: 6000 },
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 18, color: P.accent, space: 8 },
      },
      children: [],
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 200, line: 400, lineRule: "atLeast" },
      children: [
        new TextRun({
          text: subtitleText,
          size: 26,
          color: P.cover.subtitleColor,
          font: { ascii: "Calibri", eastAsia: "SimHei" },
        }),
      ],
    })
  );

  // Meta lines
  metaLines.forEach((line) => {
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [
          new TextRun({
            text: line,
            size: 20,
            color: P.cover.metaColor,
            font: { ascii: "Calibri", eastAsia: "SimHei" },
          }),
        ],
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [
      new TableRow({
        height: { value: 16838, rule: "exact" },
        children: [
          new TableCell({
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: c("#1A2330") },
            verticalAlign: "top",
            borders: allNoBorders,
            children: children,
          }),
        ],
      }),
    ],
  });
}

// ── Helper functions ──
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: {
      before: level === HeadingLevel.HEADING_1 ? 360 : 240,
      after: 120,
      line: 312,
    },
    children: [
      new TextRun({
        text,
        bold: true,
        color: P.primary,
        font: { ascii: "Calibri", eastAsia: "SimHei" },
        size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 28 : 24,
      }),
    ],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 60 },
    children: [
      new TextRun({
        text,
        size: 24,
        color: P.body,
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      }),
    ],
  });
}

function bodyBold(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 60 },
    children: [
      new TextRun({
        text,
        size: 24,
        bold: true,
        color: P.body,
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      }),
    ],
  });
}

function bulletItem(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { line: 312, after: 40 },
    children: [
      new TextRun({
        text,
        size: 24,
        color: P.body,
        font: { ascii: "Calibri", eastAsia: "SimHei" },
      }),
    ],
  });
}

function makeTable(headers, rows) {
  const t = P.table;
  const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      left: NB,
      right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: t.innerLine },
      insideVertical: NB,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: headers.map((h) =>
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: t.headerBg },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: h, bold: true, size: 21, color: t.headerText, font: { ascii: "Calibri", eastAsia: "SimHei" } }),
                ],
              }),
            ],
          })
        ),
      }),
      ...rows.map((row, idx) =>
        new TableRow({
          cantSplit: true,
          children: row.map((cell) =>
            new TableCell({
              shading: {
                type: ShadingType.CLEAR,
                fill: idx % 2 === 0 ? t.surface : "FFFFFF",
              },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: cell, size: 21, color: P.body, font: { ascii: "Calibri", eastAsia: "SimHei" } }),
                  ],
                }),
              ],
            })
          ),
        })
      ),
    ],
  });
}

// ── Document ──
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: { ascii: "Calibri", eastAsia: "SimHei" },
          size: 24,
          color: P.body,
        },
        paragraph: {
          spacing: { line: 312 },
        },
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: P.primary },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: P.primary },
        paragraph: { spacing: { before: 240, after: 120, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: P.primary },
        paragraph: { spacing: { before: 200, after: 100, line: 312 } },
      },
    },
  },
  sections: [
    // Section 1: Cover
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: [buildCoverR1()],
    },
    // Section 2: TOC
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          spacing: { before: 200, after: 400 },
          children: [
            new TextRun({
              text: "Kazalo vsebine",
              bold: true,
              size: 36,
              color: P.primary,
              font: { ascii: "Calibri", eastAsia: "SimHei" },
            }),
          ],
        }),
        new TableOfContents("Kazalo", {
          hyperlink: true,
          headingStyleRange: "1-3",
        }),
        new Paragraph({
          spacing: { before: 200 },
          children: [
            new TextRun({
              text: "Opomba: Za osve\u017eitev \u0161tevilk strani kliknite desno na kazalo in izberite \u00bbPosodobi polje\u00ab.",
              italics: true,
              size: 18,
              color: "909090",
            }),
          ],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // Section 3: Body
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "Analiza: Monter Ograj Pro",
                  size: 18,
                  color: "808080",
                  font: { ascii: "Calibri", eastAsia: "SimHei" },
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })],
            }),
          ],
        }),
      },
      children: [
        // ── 1. Povzetek ──
        heading("1. Povzetek analize"),
        body("Aplikacija Monter Ograj Pro je Android tabli\u010dna aplikacija, razvita v Kotlinu s paradigmo Jetpack Compose, namenjena monterjem balkonskih ograj za terensko delo. Aplikacija omogo\u010da zajem podatkov o strankah, fotografiranje balkonov, skiciranje meritev na slikah, vizualizacijo ograj v realnem \u010dasu, kalkulacijo cen po ROKSAL katalogu ter generiranje strokovnih poro\u010dil s pomo\u010djo umetne inteligence (Gemini AI). Razvita je bila z orodjem Google AI Studio in trenutno obstaja kot prototip z nekaterimi simuliranimi funkcijami (npr. LiDAR skeniranje je vizualno simulirano, a \u0161e ne povezano s pravim ARCore/LiDAR senzorjem)."),
        body("Na\u0161a temeljita analiza konkurence je pokazala, da na trgu ne obstaja neposreden odprtokodni konkurent, ki bi zdru\u017eeval terensko merjenje balkonov, vizualizacijo ograj, kalkulacijo materiala in generiranje ponudb v eni sami mobilni aplikaciji. Najbli\u017eji konkurenti so ali specializirani konfiguratorji (Kordo, IHME-3D, Smart Glazier) za namizne brskalnike, ali splo\u0161ne aplikacije za merjenje (magicPlan, ArcSite) brez podpore za ograje. IOS aplikacija AR Railing ponuja AR vizualizacijo, vendar brez merjenja in ponudb. Ta analiza identificira klju\u010dne vrzeli na trgu in podaja konkretna priporo\u010dila za nadaljnji razvoj aplikacije."),

        // ── 2. Opis obstoječe aplikacije ──
        heading("2. Opis obstoje\u010de aplikacije"),

        heading("2.1 Arhitektura in tehnologije", HeadingLevel.HEADING_2),
        body("Aplikacija je zgrajena na sodobnem Android skladu: Kotlin kot primarni programski jezik, Jetpack Compose za uporabni\u0161ki vmesnik, Room Database za lokalno shranjevanje podatkov, Retrofit + Moshi za komunikacijo z API-jem, CameraX za zajem fotografij ter Coil za asinhrono nalaganje slik. Podatkovni model je razmeroma preprost \u2014 ena sama entiteta Project z vsemi relevantnimi podatki o stranki, dimenzijah, izbranem stilu ograje, barvi in skiciranimi \u010drtami. ViewModel uporablja StateFlow za reaktivno posodabljanje uporabni\u0161kega vmesnika, kar ustreza sodobnim priporo\u010dilom za Android razvoj."),
        body("Aplikacija cilja na API 24+ (Android 7.0 in novejše), kar pokrije več kot 95 % aktivnih Android naprav. Podpira tabletne in mobilne zaslone z odzivnim razporedom master-detail, ki samodejno preklaplja med stranskim pogledom na tabletah in animiranimi prehodi na telefonih. Paket je identificiran kot com.aistudio.montograj.skvzpt, kar nakazuje na izvor v AI Studio okolju."),

        heading("2.2 Obstojec\u030ce funkcionalnosti", HeadingLevel.HEADING_2),
        makeTable(
          ["Funkcija", "Opis", "Status"],
          [
            ["Upravljanje projektov", "Seznam strank, iskanje, dodajanje novih meritev, brisanje, ozna\u010devanje kot zaklju\u010denih", "Delujo\u010da"],
            ["Zajem fotografij", "Fotografiranje balkona s kamero ali izbor iz galerije", "Delujo\u010da"],
            ["Skiciranje na sliki", "Risanje meritev in ograjnih linij na fotografiji z ragljanjem kotov", "Delujo\u010da"],
            ["Vizualizacija ograj", "Prikaz 5 stilov ROKSAL ograj na sliki (H-Line, Glass, V-Line, Panelna, Klasik)", "Delujo\u010da (poenostavljen Canvas)"],
            ["Izbira RAL barv", "7 barvnih opcij z vizualnim predogledom (Antracit, \u010crna, Bela, Srebrna, Rjava, Hrast, Oreh)", "Delujo\u010da"],
            ["Kalkulator cen", "Izra\u010dun materiala, delo, DDV (9,5 % / 22 %), popust", "Delujo\u010da"],
            ["Gemini AI poro\u010dilo", "Strokovna analiza slike s predpisi, kalkulacijo materiala, navodili za monta\u017eo in prodajno predstavitev", "Delujo\u010da (potrebuje API klju\u010d)"],
            ["ROKSAL katalog", "Pregled izdelkov s tehni\u010dnimi listi in navodili za monta\u017eo", "Osnovna (povezave \u0161e ne delujejo)"],
            ["LiDAR/AR skeniranje", "Simuliran 3D sken balkona s kalibracijo in uvozom v skico", "Le simulacija"],
            ["Split-view primerjava", "Primerjava pred/predhodne slike z vizualizacijo", "Delujo\u010da"],
            ["Umerjanje meritev", "Dolo\u010ditev razmerja slikovnih pik z realnimi centimetri", "Delujo\u010da"],
          ]
        ),

        heading("2.3 Podatkovni model", HeadingLevel.HEADING_2),
        body("Podatkovni model je zasnovan okrog entitete Project, ki vsebuje vse informacije o posamezni terenski meritvi: ime in naslov stranke, telefonsko \u0161tevilko, dimenzije ograje (dol\u017eina, vi\u0161ina, globina v centimetrih), na\u010din monta\u017ee (v tla ali bo\u010dno), izbran stil ograje, RAL barvo s hex kodo, pot do originalne fotografije, seznam skiciranih \u010drt (SketchLine) z normaliziranimi koordinatami ter opombe. SketchLine podpira dva tipa risanja: navadne meritve (DRAWING) in vizualno zamenjavo ograje (RAILING), pri \u010demer ima vsaka \u010drta svoj stil, barvo in oznako. Podatki se serializirajo z Moshi knji\u017enico za shranjevanje v Room bazo preko TypeConverter razreda."),

        // ── 3. Tržna analiza ──
        heading("3. Tr\u017ei\u0161\u010dna analiza in primerjava s konkurenco"),

        heading("3.1 Neposredni konkurenti", HeadingLevel.HEADING_2),
        body("Na\u0161a obse\u017ena raziskava je preiskala ve\u010d kot 30 virov v angle\u0161\u010dini, nem\u0161\u010dini in sloven\u0161\u010dini. Rezultat je jasen: ne obstaja nobena odprtokodna ali komercialna mobilna aplikacija, ki bi zdru\u017eevala terensko merjenje balkonov, vizualizacijo ograj na fotografijah, kalkulacijo materiala in generiranje ponudb v enem samem paketu. Trg je fragmentiran \u2014 posamezne re\u0161itve pokrivajo le dele celotnega delovnega procesa monterja."),
        body("Najbli\u017eji konkurent je iOS aplikacija AR Railing, ki omogo\u010da AR vizualizacijo ograj na balkonu. Vendar je to zgolj orodje za vizualizacijo, namenjeno arhitektom in oblikovalcem, brez funkcionalnosti merjenja, kalkulacije materiala ali generiranja ponudb. Prav tako ni na voljo za Android. Nem\u0161ki konfiguratorji Kordo in CROSO omogo\u010dajo konfiguracijo ograj v brskalniku, vendar ne podpirajo terenskega dela, merjenja ali mobilnega delovnega toka. IHME-3D ponuja kombinacijo oblikovanja in ponudbe, a je prav tako namizna re\u0161itev."),

        heading("3.2 Primerjalna tabela klju\u010dnih konkurentov", HeadingLevel.HEADING_2),
        makeTable(
          ["Re\u0161itev", "Merjenje", "Vizualizacija", "Ponudba/Cena", "Mobilna", "Ciljni trg"],
          [
            ["AR Railing (iOS)", "Ne", "Da (AR)", "Ne", "Da", "Arhitekti, lastniki"],
            ["Kordo Konfigurator", "Ne", "Da (2D/3D)", "Ne", "Ne (web)", "Nem\u0161ki trg"],
            ["IHME-3D", "Ne", "Da (3D)", "Da", "Ne (web)", "Mednarodni B2B"],
            ["Smart Glazier", "Ne", "Da (3D)", "Da", "Ne (desktop)", "Steklarji"],
            ["Railing Designer", "Ne", "Da (3D)", "Da", "Ne (desktop)", "B2B SaaS"],
            ["magicPlan", "Da (LiDAR)", "Ne", "Ne", "Da", "Splo\u0161na gradnja"],
            ["ArcSite", "Da", "Ne", "Delno", "Da", "Splo\u0161na gradnja"],
            ["Fence Quote Pro", "Ne", "Ne", "Da", "Da", "Ograjni monterji"],
            ["Trex AR", "Ne", "Da (AR)", "Ne", "Da", "Lastni izdelki"],
            ["Monter Ograj Pro", "Da", "Da", "Da", "Da", "Monterji ograj"],
          ]
        ),

        heading("3.3 Vrzeli na trgu", HeadingLevel.HEADING_2),
        body("Analiza konkurence razkriva ve\u010d klju\u010dnih tr\u017enih prilo\u017enosti. Nobena obstoje\u010da re\u0161itev ne zdru\u017euje celotnega delovnega toka monterja balkonskih ograj: od prihoda na teren, merjenja balkona, fotografiranja, oblikovanja ograje, izra\u010duna materiala in cene do generiranja ponudbe za stranko. Obstajajo fragmentirane re\u0161itve, ki pokrivajo posamezne dele tega procesa, vendar zahtevajo uporabo ve\u010d razli\u010dnih orodij hkrati."),
        body("Nem\u0161ki in srednjeevropski trg je posebej nedosljen. Kordo, CROSO in gelaender.app so spletni konfiguratorji brez mobilne podpore za terensko delo. Slovenski in regionalni trg (DACH + JIE) nima nobene specializirane re\u0161itve. Prav tako ne obstaja integracija s strojno opremo za merjenje (npr. REEKON T1 Tomahawk digitalni meter z Bluetooth), kar bi bistveno izbolj\u0161alo natan\u010dnost in hitrost merjenja na terenu. Podro\u010dje AR merjenja z ARCore/ARKit za gradbeni\u0161tvo je \u0161e v povojih, zlasti za specifi\u010dne namene kot so balkonske ograje."),

        // ── 4. Kaj monter potrebuje na terenu ──
        heading("4. Kaj monter potrebuje na terenu"),

        heading("4.1 Celovit pregled terenskih potreb", HeadingLevel.HEADING_2),
        body("Terensko delo monterja balkonskih ograj je zapleten proces, ki zahteva natan\u010dno merjenje, dokumentacijo, komunikacijo s stranko in hitro pripravo ponudbe. Na podlagi na\u0161e analize obstoje\u010de aplikacije, primerjave s konkurenco in razumevanja delovnega procesa monterja, smo identificirali klju\u010dne funkcionalnosti, ki jih monter potrebuje na terenu. Te potrebe segajo od osnovnega merjenja dimenzij do napredne AR vizualizacije in avtomatskega generiranja ponudb."),

        heading("4.2 Meritve in dokumentacija", HeadingLevel.HEADING_2),
        body("Monter prihaja na lokacijo stranke z nalogo meriti balkon ali teraso za namestitev ograje. Potrebuje zanesljivo orodje za zajem klju\u010dnih dimenzij: dol\u017eino ograjne linije, vi\u0161ino ograje (predpisana zakonsko, obi\u010dajno minimum 100 cm za balkone), globino terase (za L in U oblike), razdaljo med stebri\u010dki (obi\u010dajno 100-120 cm), debelino talne obloge za sidranje ter morebitne ovire (cevi, klimatske naprave, vogali). Vsaka meritve mora biti dokumentirana s fotografijo in lokacijskim ozna\u010dbam, da se izogne napakam pri poznej\u0161i izdelavi."),
        body("Trenutna aplikacija omogo\u010da ro\u010dno risanje meritev na fotografiji z ragljanjem kotov po 45 stopinjah, kar je dober za\u010detek. Vendar manjkajo klju\u010dne izbolj\u0161ave: polavtomatsko zaznavanje robov balkona s kamero (uporaba ARCore Depth API-ja), integracija z Bluetooth laserskimi metri za natan\u010dne \u0161tevil\u010dne meritve, podpora za tlorisne skice (ne le frontalne fotografije) ter samodejno izra\u010dunavanje skupne dol\u017eine ograjne linije iz narisanih segmentov. Prav tako bi bilo koristno dodati podporo za merjenje kotov naklona teras in stopni\u0161\u010d, kjer so ograje prav tako potrebne."),

        heading("4.3 Vizualizacija za stranko", HeadingLevel.HEADING_2),
        body("Ena najpomembnej\u0161ih funkcionalnosti za monterja je mo\u017enost, da stranki poka\u017ee, kako bo ograja dejansko izgledala na njenem balkonu. To bistveno pove\u010da verjetnost sklenitve posla in zmanj\u0161a nesporazume pri izbiri stila in barve. Trenutna aplikacija ponuja osnovno vizualizacijo s Canvas risanjem na fotografijo, kar je uporabno, vendar poenostavljeno \u2014 prikazuje le horizontalne ali vertikalne letve kot \u010drte na sliki."),
        body("Za res prepri\u010dljivo predstavitev bi monter potreboval fotorealisti\u010dno prekrivanje ograje na fotografiji balkona (augmented reality pristop), 3D predogled ograje iz razli\u010dnih zornih kotov, primerjavo pred/po namestitvi s premikalnim drsnikom, podporo za razli\u010dne konfiguracije istega stila (npr. razmak med letvami, debelina profila) ter mo\u017enost souporabe vizualizacije s stranko preko povezave ali PDF-ja. Aplikacija AR Railing na iOS-u ponuja tak\u0161en AR pristop, vendar brez ostalih funkcionalnosti, ki jih potrebuje monter."),

        heading("4.4 Kalkulacija materiala in cene", HeadingLevel.HEADING_2),
        body("Trenutna aplikacija vsebuje osnovni kalkulator cen z ROKSAL cenami na meter, ki upo\u0161teva višino, na\u010din monta\u017ee, DDV in popust. To je odli\u010den za\u010detek, vendar monter na terenu potrebuje bolj podrobno kalkulacijo. Kalkulacija mora vklju\u010devati natan\u010den izra\u010dun \u0161tevila stebri\u010dkov ob upo\u0161tevanju maksimalnega razmaka, dol\u017eino ro\u010dajev (handrail), \u0161tevilo polnilnih plo\u0161\u010d ali letvi, \u0161tevilo sidrnih vijakov in kemi\u010dnih sidrov (odvisno od podlage), tip podstavkov (okrogli, kvadratni), robne profilacije in kon\u010dne kapice, steklene plo\u0161\u010de z natan\u010dnimi dimenzijami za steklene ograje ter morebitne dodatke (pragovi, prehodi, stopnice)."),
        body("Pomembno je tudi, da kalkulacija upo\u0161teva rezervni material (obi\u010dajno 10 % za odrezke in odpad), razli\u010dne cenike za razli\u010dne dobavitelje (ne le ROKSAL) ter zgodovinske cene za primerjavo. Monter bi moral imeti mo\u017enost hitro prilagajati cene na terenu glede na konkretne razmere (npr. te\u017eaven dostop, posebna sidranja v histri\u010dnih objektih). Prav tako bi moral sistem samodejno generirati kosovnico z natan\u010dnimi dimenzijami za proizvodnjo."),

        heading("4.5 Dokumentacija in ponudba", HeadingLevel.HEADING_2),
        body("Ko so meritve opravljene in cena dogovorjena, mora monter pripraviti dokumentacijo za stranko in za proizvodnjo. Trenutno aplikacija generira AI poro\u010dilo preko Gemini API-ja, kar je inovativno, vendar ne nadome\u0161\u010da potrebe po formalni ponudbi. Monter potrebuje mo\u017enost generiranja PDF ponudbe s podjetnim logotipom, podatki stranke, specifikacijo ograje, kosovnico materiala, ceno z DDV in pogoji pla\u010dila. Prav tako potrebuje delovni nalog za proizvodnjo z natan\u010dnimi dimenzijami, preglednico monta\u017enih to\u010dk, navodila za monta\u017eo za konkretne razmere na lokaciji ter garancijski list."),
        body("Gemini AI poro\u010dilo je vredna funkcija, ki jo je treba izbolj\u0161ati. Trenutno generira splo\u0161no analizo, ki vklju\u010duje statiko, tehni\u010dno kalkulacijo, navodila za monta\u017eo in prodajno predstavitev. Za monterja bi bilo bolj uporabno, \u010de bi AI lahko analiziral dejansko fotografijo balkona in prepoznal morebitne te\u017eave (npr. po\u0161kodovana podlaga, nepravilni koti, ovire za sidranje), predlagal optimalen razmestitev stebri\u010dkov glede na zaznano strukturo in opozoril na morebitne kr\u0161itve predpisov glede na zaznano vi\u0161ino in lokacijo."),

        heading("4.6 Organizacija terenskega dela", HeadingLevel.HEADING_2),
        body("Monter na terenu potrebuje tudi orodja za organizacijo dela. Trenutna aplikacija ponuja seznam projektov z iskanjem in statusom zaklju\u010denosti, kar je osnovno. Za resni\u010dno terensko delo bi bilo potrebno dodati podporo za na\u010drtovanje obiskov z integracijo GPS lokacij in navigacijo do strank, urnik obiskov z obvestili, evidenco porabljenega \u010dasa na projektu, možnost dodajanja več fotografij na projekt (ne le ene), sinhronizacijo podatkov s podjetnim informacijskim sistemom ter offline delovanje za območja brez internetne povezave (kar je pogosto na gradbiščih)."),

        // ── 5. Priporočila ──
        heading("5. Priporo\u010dila za nadaljnji razvoj"),

        heading("5.1 Kratkoro\u010dna izbolj\u0161anja (1-3 meseci)", HeadingLevel.HEADING_2),
        bodyBold("Integracija ARCore za resni\u010dno merjenje"),
        body("Nadomestitev simuliranega LiDAR skenerja z dejansko integracijo ARCore Depth API-ja za Android naprave. ARCore omogo\u010da zaznavanje ravnin, merjenje razdalj in postavljanje virtualnih predmetov v resni\u010den prostor. Za naprave z LiDAR senzorjem (npr. iPad Pro, iPhone Pro) bi lahko uporabili tudi ARKit za iOS različico. To bi omogočilo polavtomatsko zaznavanje robov balkona in natančno merjenje dimenzij brez ročnega risanja."),
        bodyBold("Izbolj\u0161ana vizualizacija ograj"),
        body("Zamenjava poenostavljenega Canvas risanja s fotorealisti\u010dnimi 3D modeli ograj, renderiranimi preko OpenGL ali Sceneform knji\u017enice. Vsak ROKSAL model bi moral imeti svoj 3D model z realisti\u010dnimi materiali (kovinska tekstura, steklo z odsevi, lesena imitacija z vlakni). Modeli naj se samodejno prilagajajo dimenzijam in konfiguraciji, ki jo monter dolo\u010di, vklju\u010dno z razmikom med letvami, debelino profilov in barvo po RAL standardu."),
        bodyBold("Generiranje PDF ponudb"),
        body("Dodajanje funkcionalnosti za generiranje formalnih PDF ponudb neposredno iz aplikacije. Ponudba mora vsebovati podjetne podatke, podatke stranke, specifikacijo ograje s sliko, kosovnico materiala, ceno z DDV, pogoje pla\u010dila in garancijo. To je klju\u010dna funkcionalnost, ki jo monterji trenutno rešujejo z ročnim izpolnjevanjem obrazcev ali preprostimi Excel predlogami."),

        heading("5.2 Srednjero\u010dna izbolj\u0161anja (3-6 mesecev)", HeadingLevel.HEADING_2),
        bodyBold("Integracija s strojno opremo za merjenje"),
        body("Povezava z Bluetooth laserskimi metri (npr. REEKON T1 Tomahawk, Leica DISTO) za samodejni prenos meritev v aplikacijo. REEKON T1 ponuja 0,5 mm natan\u010dnost z e-ink zaslonom in Bluetooth povezavo do mobilne aplikacije. Integracija bi bistveno pospe\u0161ila merjenje in zmanj\u0161ala napake pri prepisovanju \u0161tevilk. Prav tako bi bilo smiselno razmisliti o podpori za povezljive kotne mere in digitalne libele."),
        bodyBold("Napredna AI analiza"),
        body("Izbolj\u0161anje Gemini AI integracije za dejansko ra\u010dunalni\u0161ki vid (computer vision) na fotografiji balkona. AI naj bi samodejno prepoznal vrsto podlage (beton, opeka, kamen), ocenil stanje podlage za sidranje, zaznal morebitne ovire in nepravilnosti, predlagal optimalen razmestitev stebri\u010dkov ter preveril skladnost z lokalnimi predpisi. Trenutno AI generira splo\u0161no besedilo; cilj je prehod k konkretni, na sliki zasnovani analizi."),
        bodyBold("Podpora za tlorisno skiciranje"),
        body("Dodajanje 2D tlorisnega na\u010drtovalnika za skiciranje oblike balkona ali terase od zgoraj. To je klju\u010dno za L-oblikovane, U-oblikovane in druge netrivialne oblike, kjer ena sama frontalna fotografija ne zado\u0161\u010da. Tlorisna skica bi omogo\u010dila natan\u010dnej\u0161o kalkulacijo skupne dol\u017eine ograjne linije in bolj\u0161o vizualizacijo za stranko. Nem\u0161ki konkurent Kordo \u017ee ponuja tak\u0161no funkcionalnost v spletnem okolju."),

        heading("5.3 Dolgoro\u010dne izbolj\u0161anja (6-12 mesecev)", HeadingLevel.HEADING_2),
        bodyBold("Sinhronizacija s podjetnim ERP sistemom"),
        body("Razvoj strežniškega zaledja s sinhronizacijo podatkov med mobilno aplikacijo in podjetnim informacijskim sistemom. To bi omogočilo samodejno posodabljanje zalog ob generiranju ponudbe, prenos naročil v proizvodnjo, sledenje statusa naročila od ponudbe do montaže, obračun dela in materiala ter analitiko poslovanja (povprečen čas merjenja, stopnja konverzije ponudb, sezonska nihanja)."),
        bodyBold("iOS razli\u010dica"),
        body("Razvoj iOS razli\u010dice aplikacije, ki bi izkoristila LiDAR senzorje v iPad Pro in iPhone Pro napravah. iOS LiDAR ponuja bistveno natančnejše in hitrejše 3D skeniranje kot katerakoli Android rešitev, kar bi bilo ključno konkurenčno prednost. Razvoj bi lahko potekal v Kotlin Multiplatform (skupna poslovna logika) s Swift/SwiftUI za iOS specifični del."),
        bodyBold("Multi-dobaviteljska podpora"),
        body("Razširitev kataloga z dodatnimi dobavitelji ograjnih sistemov (ne le ROKSAL). To bi vključevalo Q-Railing, Jakob, Carl Stahl, Regupol in druge evropske proizvajalce. Vsak dobavitelj bi imel svoj cenik, katalog izdelkov in tehnične specifikacije, monter pa bi lahko primerjal ponudbe različnih dobaviteljev za isto konfiguracijo ograje. To bi povečalo vrednost aplikacije za neodvisne monterje, ki ne delajo ekskluzivno z eno znamko."),

        // ── 6. Prednostni načrt ──
        heading("6. Prednostni na\u010drt implementacije"),
        makeTable(
          ["Prioriteta", "Funkcionalnost", "Vpliv", "Zahtevnost", "Rok"],
          [
            ["P1", "ARCore integracija za merjenje", "Visok", "Srednja", "1-2 meseca"],
            ["P1", "Generiranje PDF ponudb", "Visok", "Nizka", "2-3 tedne"],
            ["P1", "Ve\u010d fotografij na projekt", "Srednji", "Nizka", "1 teden"],
            ["P2", "3D vizualizacija ograj", "Visok", "Visoka", "2-3 meseci"],
            ["P2", "Bluetooth laserski meter", "Srednji", "Srednja", "1-2 meseca"],
            ["P2", "Offline delovanje", "Visok", "Srednja", "1 mesec"],
            ["P2", "Tlorisno skiciranje", "Srednji", "Srednja", "1-2 meseca"],
            ["P3", "ERP integracija", "Visok", "Visoka", "3-6 mesecev"],
            ["P3", "iOS razli\u010dica z LiDAR", "Visok", "Visoka", "4-6 mesecev"],
            ["P3", "Multi-dobaviteljska podpora", "Srednji", "Srednja", "2-3 meseci"],
          ]
        ),
        body("Prednostni na\u010drt temelji na na\u010delu, da so najprej implementirane funkcionalnosti z najvi\u0161jim razmerjem med vplivom na uporabnost in zahtevnostjo implementacije. Generiranje PDF ponudb in podpora za ve\u010d fotografij sta relativno enostavni izbolj\u0161anji z visokim vplivom na terensko delo. ARCore integracija in 3D vizualizacija zahtevata ve\u010d developmenta, a sta klju\u010dni za konkurenčno prednost. ERP integracija in iOS različica sta dolgoročna cilja, ki razširjata obseg rešitve."),

        // ── 7. Zaključek ──
        heading("7. Zaklju\u010dek"),
        body("Aplikacija Monter Ograj Pro predstavlja obetaven za\u010detek razvoja specializirane terenske re\u0161itve za monterje balkonskih ograj. Trenutna implementacija pokriva osnovne potrebe (merjenje, fotografiranje, skiciranje, osnovna vizualizacija, kalkulacija cen, AI poro\u010dilo), vendar zahteva bistvene izbolj\u0161ave za resni\u010dno uporabnost na terenu. Klju\u010dne manjkajo\u010de funkcionalnosti so: resni\u010dna AR/LiDAR integracija za natan\u010dno merjenje, fotorealisti\u010dna 3D vizualizacija ograj, generiranje formalnih PDF ponudb in integracija s strojno opremo za merjenje."),
        body("Tr\u017ena analiza potrjuje, da je prilo\u017eenost resni\u010dna. Noben konkurent ne ponuja celovite mobilne re\u0161itve za ta specifi\u010den trg. Nem\u0161ki konfiguratorji so omejeni na spletno okolje, iOS AR Railing ponuja zgolj vizualizacijo, splo\u0161ne gradbene aplikacije pa ne podpirajo specifik ograjnega dela. S pravilnim razvojnem strategijo \u2014 najprej PDF ponudbe in osnovne izbolj\u0161ave, nato AR in 3D vizualizacija, dolgoro\u010dno ERP in multi-platform \u2014 lahko Monter Ograj Pro postane vodilna re\u0161itev na srednjeevropskem trgu za terensko delo z balkonskimi ograjami in terasami."),
        body("Priporo\u010damo takoj\u0161njo implementacijo P1 prioritete (ARCore, PDF ponudbe, ve\u010d fotografij), ki bo aplikacijo pripeljala iz stanja prototipa v uporabno terensko orodje. Sledi naj P2 faza z 3D vizualizacijo in Bluetooth integracijo, ki bo diferencirala produkt od konkurence. Dolgoro\u010dna vizija ERP integracije in iOS podpore bo raz\u0161irila tr\u017eni obseg in omogo\u010dila skaliranje poslovanja."),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const outPath = "/home/z/my-project/download/Analiza_Monter_Ograj_Pro.docx";
  fs.writeFileSync(outPath, buf);
  console.log("Document saved to: " + outPath);
});
