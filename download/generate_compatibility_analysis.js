const {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  AlignmentType, HeadingLevel, PageNumber, NumberFormat,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  ShadingType, PageBreak, SectionType
} = require("docx");
const fs = require("fs");

// Palette: GO-1 Graphite Orange — proposals, construction industry
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
    footerColor: "687078"
  },
  table: {
    headerBg: "D4875A",
    headerText: "FFFFFF",
    accentLine: "D4875A",
    innerLine: "DDD0C8",
    surface: "F8F0EB"
  }
};

const c = (hex) => hex.replace("#", "");

// Helper: heading
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, color: P.primary, font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32 })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [new TextRun({ text, bold: true, color: P.primary, font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28 })]
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 80 },
    children: [new TextRun({ text, bold: true, color: P.primary, font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 26 })]
  });
}

// Body paragraph
function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: P.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })]
  });
}

// Bold inline
function boldBody(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: P.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, bold: true })]
  });
}

// Bullet item
function bullet(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 60 },
    indent: { left: 480 },
    children: [
      new TextRun({ text: "\u2022  ", size: 24, color: P.accent, font: { ascii: "Calibri" } }),
      new TextRun({ text, size: 24, color: P.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })
    ]
  });
}

// Horizontal rule via paragraph border
function hrule() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
    children: []
  });
}

// Table helper
function makeTable(headers, rows) {
  const borderStyle = {
    top: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: P.table.accentLine },
    left: { style: BorderStyle.NONE },
    right: { style: BorderStyle.NONE },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.table.innerLine },
    insideVertical: { style: BorderStyle.NONE }
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(h => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: P.table.headerBg },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: h, bold: true, size: 21, color: P.table.headerText, font: { ascii: "Calibri", eastAsia: "SimHei" } })]
      })]
    }))
  });

  const dataRows = rows.map((row, idx) => new TableRow({
    children: row.map(cell => new TableCell({
      shading: idx % 2 === 0 ? { type: ShadingType.CLEAR, fill: P.table.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [new TextRun({ text: cell, size: 21, color: P.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })]
      })]
    }))
  }));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: borderStyle,
    rows: [headerRow, ...dataRows]
  });
}

// === COVER PAGE (R4 - Top Color Block) ===
function buildCover() {
  const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: allNoBorders,
      rows: [
        // Color block top
        new TableRow({
          height: { value: 6400, rule: "exact" },
          children: [new TableCell({
            shading: { type: ShadingType.CLEAR, fill: "1A2330" },
            verticalAlign: "top",
            borders: allNoBorders,
            children: [
              new Paragraph({ spacing: { before: 1600 }, children: [] }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                indent: { left: 800 },
                spacing: { line: 1000, lineRule: "atLeast" },
                children: [new TextRun({ text: "ANALIZA ZDRU\u017DLJIVOSTI", size: 72, bold: true, color: P.cover.titleColor, font: { ascii: "Calibri", eastAsia: "SimHei" } })]
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                indent: { left: 800 },
                spacing: { before: 200, line: 600, lineRule: "atLeast" },
                children: [new TextRun({ text: "Podobne aplikacije na GitHubu", size: 36, color: P.accent, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })]
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                indent: { left: 800 },
                spacing: { before: 200 },
                children: [new TextRun({ text: "in priporo\u010Dila za projekt Monter Ograj PRO", size: 28, color: P.cover.subtitleColor, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })]
              })
            ]
          })]
        }),
        // White bottom area
        new TableRow({
          height: { value: 10438, rule: "exact" },
          children: [new TableCell({
            shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
            verticalAlign: "top",
            borders: allNoBorders,
            children: [
              new Paragraph({ spacing: { before: 1200 }, children: [] }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                indent: { left: 800 },
                children: [new TextRun({ text: "Projekt: Monter Balkonskih Ograj", size: 24, color: P.secondary, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })]
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                indent: { left: 800 },
                spacing: { before: 80 },
                children: [new TextRun({ text: "Repozitorij: markec12345678/monter-balkonskih-ograj", size: 22, color: P.secondary, font: { ascii: "Calibri" } })]
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                indent: { left: 800 },
                spacing: { before: 80 },
                children: [new TextRun({ text: "Tehnologija: Android / Kotlin / Jetpack Compose / Room / Gemini API", size: 22, color: P.secondary, font: { ascii: "Calibri" } })]
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                indent: { left: 800 },
                spacing: { before: 200 },
                border: { top: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 12 } },
                children: [new TextRun({ text: "Datum: Junij 2026", size: 22, color: P.secondary, font: { ascii: "Calibri" } })]
              })
            ]
          })]
        })
      ]
    })
  ];
}

// === BODY CONTENT ===
function buildBody() {
  const children = [];

  // ===== 1. POVZETEK =====
  children.push(h1("1. Povzetek analize"));
  children.push(body("Analiza je temeljito preu\u010Dila ve\u010D kot 25 odprtokodnih repozitorijev na GitHubu ter dodatne komercialne referen\u010Dne aplikacije, da bi ugotovila, ali obstaja aplikacija, ki je neposredno zdru\u017Eljiva s projektom Monter Ograj PRO. Odgovor je enozna\u010Den: nobena celota ni zdru\u017Eljiva, vendar so posamezni komponentni deli zelo uporabni. Na\u0161 projekt je unikatna kombinacija terenskega merjenja, vizualizacije ograj na fotografijah, AI analize s pomo\u010Djo Gemini, ROKSAL kataloga izdelkov, kalkulatorja cen s slovenskim DDV in simuliranega LiDAR skeniranja. Nobena obstoje\u010Da odprtokodna aplikacija ne pokriva niti polovice teh funkcionalnosti, kaj \u0161ele vse v enem paketu."));
  children.push(body("Kljub temu smo identificirali \u0161est knji\u017Enic, ki so neposredno zdru\u017Eljive s Kotlin/Jetpack Complace arhitekturo na\u0161ega projekta in jih je mogo\u010De vgraditi z minimalnim naporom. Te knji\u017Enice pokrivajo klju\u010Dne funkcionalnosti: skiciranje na fotografijah, primerjavo pred/poslej, izbirnik barv, Gemini SDK, AR merjenje in postavitev 3D objektov. Poleg tega obstaja ve\u010D referen\u010Dnih repozitorijev, ki nudijo vzorce kode za ARCore integracijo, ki jo na\u0161 projekt \u0161e potrebuje."));
  children.push(body("Spodnja tabela prikazuje kon\u010Dno oceno zdru\u017Eljivosti po funkcionalnih sklopih:"));

  children.push(makeTable(
    ["Funkcionalni sklop", "Zdru\u017Eljivost", "Najdena re\u0161itev", "Potrebna prilagoditev"],
    [
      ["Skiciranje/ozna\u010Devanje fotografij", "ZDRU\u017DLJIVO", "ChitraLekhan (Compose)", "Minimalna — vgradljiva direktno"],
      ["Pred/Poslej primerjava", "ZDRU\u017DLJIVO", "before-after-slider (Compose)", "Minimalna — vgradljiva direktno"],
      ["Izbirnik RAL barv", "ZDRU\u017DLJIVO", "colorpicker-compose (skydoves)", "Srednja — dodati RAL paleto"],
      ["Gemini AI integracija", "ZDRU\u017DLJIVO", "generative-ai-kmp", "Srednja — zamenjati Retrofit implementacijo"],
      ["AR merjenje (ARCore)", "DELUJO\u010CE", "StreetMeasure", "Velika — potrebna ARCore migracija"],
      ["LiDAR skeniranje", "NI ZDRU\u017ELJIVO", "Brez odprtokodne alternative", "Gradnja od za\u010Detka z ARCore"],
      ["ROKSAL katalog/poslovna logika", "NI ZDRU\u017ELJIVO", "Brez podobne aplikacije", "Obstoje\u010Da koda je primerna"],
      ["Kalkulator cen s DDV", "NI ZDRU\u017ELJIVO", "Brez slovenske specifikacije", "Obstoje\u010Da koda je primerna"],
      ["Upravljanje projektov/strank", "DELUJO\u010CE", "Room DB + ViewModel", "Obstoje\u010Da arhitektura je solidna"]
    ]
  ));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // ===== 2. OPIS PROJEKTA =====
  children.push(h1("2. Opis projekta Monter Ograj PRO"));
  children.push(body("Monter Ograj PRO je Android aplikacija, razvita v Kotlinu s Jetpack Compose UI okvirjem, namenjena terenskim monterjem balkonskih ograj in teras. Aplikacija je nastala iz izvorne kode Google AI Studio in je bila prilagojena za specifi\u010Dne potrebe slovenskega trga. Uporablja Room podatkovno bazo za shranjevanje projektov, Retrofit za komunikacijo z Gemini API ter CameraX za fotografiranje objektov na terenu. Aplikacija podpira tako mobilni kot tabli\u010Dni na\u010Din prikaza z master-detail postavitvijo."));
  children.push(body("Trenutne klju\u010Dne funkcionalnosti vklju\u010Dujejo: upravljanje seznamov strank s projekti, fotografiranje balkonov s kamero ali izbira iz galerije, skiciranje in merjenje na fotografijah z vrsticami (Canvas API), vizualizacijo petih slogov ograj ROKSAL (H-Line, Steklena, V-Line, Panelna, Klasik), izbiro RAL barv (7016 Antracit, 9005 \u010Crna, 9016 Bela, EV1 Srebrna, 8017 Rjava, imitacije Hrast/Oreh), kalkulacijo cen s slovenskim DDV (9,5% stanovanjski / 22% splo\u0161ni), simuliran LiDAR ToF skener s kamero in AI poro\u010Dilo Gemini s statiko, tehni\u010Dno kalkulacijo, navodili za monta\u017Eo in prodajno predstavitvijo."));

  children.push(h2("2.1 Tehnolo\u0161ki sklad projekta"));
  children.push(makeTable(
    ["Komponenta", "Tehnologija", "Namen"],
    [
      ["UI Okvir", "Jetpack Compose + Material 3", "Declarativni uporabni\u0161ki vmesnik"],
      ["Jezik", "Kotlin", "Primarni razvojni jezik"],
      ["Podatkovna baza", "Room (SQLite)", "Lokalno shranjevanje projektov"],
      ["Omre\u017Ena komunikacija", "Retrofit + Moshi + OkHttp", "Gemini API klici"],
      ["Slike", "Coil (AsyncImage)", "Nalaganje in prikaz fotografij"],
      ["Kamera", "CameraX", "Fotografiranje na terenu"],
      ["AI Model", "Gemini 3.5 Flash", "Analiza slik in poro\u010Dila"],
      ["AR/LiDAR", "Simulacija (ni ARCore)", "Simuliran 3D sken - \u0161e ni pravi"],
      ["Barve", "Lastna RAL paleta", "7 RAL barv v Color.kt"]
    ]
  ));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // ===== 3. ZDRUZLJIVE KNJIZNICE =====
  children.push(h1("3. Zdru\u017Eljive knji\u017Enice za neposredno vgradnjo"));
  children.push(body("Naslednje \u0161est knji\u017Enic je bilo identificiranih kot neposredno zdru\u017Eljivih s Kotlin/Jetpack Compose arhitekturo projekta Monter Ograj PRO. Vse so aktivno vzdr\u017Eevane, imajo odprto licenco in so zasnovane za Compose ekosistem. Njihova vgradnja bo bistveno izbolj\u0161ala kakovost obstoje\u010Dih funkcionalnosti, ne da bi zahtevala prelomne spremembe arhitekture."));

  // 3.1 ChitraLekhan
  children.push(h2("3.1 ChitraLekhan — Skiciranje in ozna\u010Devanje fotografij"));
  children.push(body("Repozitorij: karya-inc/ChitraLekhan je Compose Multiplatform knji\u017Enica za ozna\u010Devanje slik, zgrajena z Jetpack Compose in Canvas API. Podpira prostoro\u010Dno risanje, risanje oblik (pravokotniki, krogi, \u010Drte), dodajanje besedilnih oznak, radirko ter undo/redo operacije. Knji\u017Enica je neposredno uporabna za izbolj\u0161anje obstoje\u010De komponente ImageAnnotationCanvas.kt, ki trenutno uporablja ro\u010Dno implementirano Canvas logiko z omejenimi mo\u017Enostmi. ChitraLekhan bi dodal profesionalno orodno vrstico z oblikami, bolj\u0161i undo/redo ter podporo za besedilne oznake z merami."));
  children.push(boldBody("Primerjava z obstoje\u010Do kodo:"));
  children.push(makeTable(
    ["Funkcija", "Trenutno (RailingVisualizer.kt)", "ChitraLekhan"],
    [
      ["Prostoro\u010Dno risanje", "Da (Canvas pointerInput)", "Da (z gladko interpolacijo)"],
      ["Oblike (pravokotnik, krog)", "Ne", "Da (vgrajene)"],
      ["Besedilne oznake", "Omejeno (le \u0161tevilke mer)", "Da (poljuben besedilo)"],
      ["Radirka", "Ne", "Da"],
      ["Undo/Redo", "Le undo (removeAt)", "Polni undo/redo stack"],
      ["Zoom/Pan", "Ne", "Da (vgrajen)"],
      ["Izvoz annotirane slike", "Da (Bitmap compress)", "Da (vgrajen)"]
    ]
  ));
  children.push(body("Vgradnja zahteva zamenjavo dele\u017Ea risalne logike v RailingVisualizer.kt s ChitraLekhan komponento, pri \u010Demer je treba ohraniti lastno logiko za risanje ograj (tip \"RAILING\") in meritev (tip \"MEASURE\"). Ocena napora za integracijo je 2-3 dni razvoja, saj je API kompatibilen s Compose. Licenca je MIT."));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // 3.2 before-after-slider
  children.push(h2("3.2 before-after-slider — Primerjava pred/poslej"));
  children.push(body("Repozitorij: numq/before-after-slider je Compose-native komponenta za primerjavo dveh slik z interaktivnim drsnikom. Podpira horizontalno in vertikalno primerjavo, nastavljiv min/max polo\u017Eaj, razli\u010Dne na\u010Dine vle\u010Denja ter efekto zamegljenosti. V projektu Monter Ograj PRO trenutno obstaja preprosta implementacija primerjave z comparisonSplitX spremenljivko v RailingVisualizer.kt, ki ri\u0161e vertikalno \u010Drto na Canvasu. Before-after-slider bi to nadomestil s profesionalno, teko\u010Do in vizualno privla\u010Dno komponento."));
  children.push(body("Uporaba je neposredna: namesto trenutne Canvas implementacije z comparisonSplitX se uporabi BeforeAfterSlider composable, ki sprejme dve sliki (originalna fotografija balkona in vizualizacija z ograjo). Ocena napora za integracijo je 1 dan, saj je API izjemno preprost. Licenca je Apache 2.0."));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // 3.3 colorpicker-compose
  children.push(h2("3.3 colorpicker-compose — Izbirnik RAL barv"));
  children.push(body("Repozitorij: skydoves/colorpicker-compose je Kotlin Multiplatform knji\u017Enica za izbiranje barv, ki podpira pridobivanje barv iz slik s tapom, HSV/ARGB/Hex vrednosti ter integracijo s Compose. Trenutna implementacija v projektu uporablja fiksno paleto 7 RAL barv z lastnimi Surface/Row elementi. Colorpicker-compose bi dodal profesionalni izbirnik barv s podporo za \u0161iroko paleto, hkrati pa bi obdr\u017Eal RAL paleto kot prilagojen seznam hitrih izbir."));
  children.push(body("Na voljo je tudi alternativna knji\u017Enica KvColorPicker-Android z uporabniku prijaznej\u0161im bottom-sheet vmesnikom. Klju\u010Dna prednost obeh je podpora za dodajanje lastnih barvnih palet, kar pomeni, da bi lahko RAL Classic (213 barv) dodali kot prilagojeno bazo podatkov. Na GitHubu ne obstaja posebna RAL barvna knji\u017Enica, zato bo treba RAL podatke (ime, RAL \u0161tevilka, RGB vrednost) dodati kot JSON ali Kotlin podatkovni razred. Ocena napora za integracijo je 2 dni. Licenca je Apache 2.0."));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // 3.4 generative-ai-kmp
  children.push(h2("3.4 generative-ai-kmp — Gemini AI SDK"));
  children.push(body("Repozitorij: PatilShreyas/generative-ai-kmp je Kotlin Multiplatform SDK za Google Generative AI (Gemini modele). Trenutna implementacija v projektu uporablja ro\u010Dno zgrajen Retrofit + Moshi klient (GeminiClient.kt) s stabilnim API-je v1beta. Generative-ai-kmp ponuja \u010Disti Kotlin API z avtomatskim upravljanjem ponovnih poskusov, strukturiranimi tipi za zahtevke/odgovore, podporo za Kotlin Coroutines in Multiplatform zdru\u017Eljivost."));
  children.push(body("Migracija bi nadomestila celoten GeminiClient.kt s klici generative-ai-kmp, kar bi bistveno poenostavilo kodo in izbolj\u0161alo zanesljivost. Knji\u017Enica podpira enake funkcije (besedilo + slika), ki jih projekt trenutno uporablja. Dodatna prednost je podpora za Kotlin Multiplatform, kar bi omogo\u010Dilo morebitno prihodnjo raz\u0161iritev na iOS. Ocena napora za migracijo je 2-3 dni. Licenca je Apache 2.0."));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // 3.5 StreetMeasure
  children.push(h2("3.5 StreetMeasure — AR merjenje razdalj"));
  children.push(body("Repozitorij: streetcomplete/StreetMeasure je Kotlin/ARCore knji\u017Enica za merjenje razdalj v pove\u010Dani resni\u010Dnosti, razvita v okviru projekta StreetComplete. Aktivno se vzdr\u017Euje in uporablja sodobne ARCore API-je brez odvisnosti od opu\u0161\u010Denega Sceneform SDK. To je klju\u010Dnega pomena, saj so vsi drugi AR merilni repozitoriji na GitHubu (ArCoreMeasurement, AR-Toolbox) odvisni od Sceneform, ki ga Google ni ve\u010D vzdr\u017Eeval od leta 2020."));
  children.push(body("StreetMeasure bi nadomestil trenutno simulirano LiDAR/ToF funkcionalnost v LidarScannerDialog.kt s pravim ARCore merjenjem. Namesto simuliranega skeniranja z animacijami bi monter dejansko usmeril kamero na balkon in pridobil realne razdalje med to\u010Dkami. Vendar je ta integracija najzahtevnej\u0161a od vseh, saj zahteva celovito ARCore integracijo, obdelavo senzorjev, upravljanje \u017Eivljenjskega cikla kamere ter kalibracijo. Ocena napora za integracijo je 5-10 dni. Licenca je GPL-3.0 (pozor: preveriti skladnost z licenco projekta)."));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // 3.6 Interior-Design-AR
  children.push(h2("3.6 Interior-Design-AR — Postavitev 3D objektov v AR"));
  children.push(body("Repozitorij: abinovarghese/Interior-Design-AR je Android AR aplikacija za postavljanje in prilagajanje 3D pohi\u0161tva v resni\u010Dnem prostoru z ARCore. Koncept je neposredno prenosljiv na vizualizacijo ograj: namesto pohi\u0161tva se v AR prostor postavi 3D model ograje. Ta repozitorij je najbli\u017Eji referen\u010Dni primer za \u017Eeleno funkcionalnost \u2014 vizualizacijo ograje na pravi fotografiji balkona v pove\u010Dani resni\u010Dnosti."));
  children.push(body("Pozor: repozitorij je odvisen od Sceneform SDK, ki je opu\u0161\u010Den. Za uporabo v sodobnem projektu je potrebna migracija na ARCore Extensions za Jetpack Compose ali na Filament (Googlov nov 3D renderalnik). Kljub temu je koda odli\u010Den referen\u010Dni vir za razumevanje ARCore \u017Eivljenjskega cikla, upravljanja Anchorjev in postavljanja 3D modelov. Ocena napora za implementacijo prave AR vizualizacije ograj je 10-15 dni. Licenca je MIT."));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // ===== 4. NEZDRUZLJIVE APLIKACIJE =====
  children.push(h1("4. Nezdru\u017Eljive aplikacije in zakaj"));
  children.push(body("Naslednje aplikacije so bile podrobno preu\u010Dene, vendar niso neposredno zdru\u017Eljive s projektom Monter Ograj PRO. Razlogi segajo od nezdru\u017Eljivih tehnolo\u0161kih skladov, opu\u0161\u010Denih odvisnosti, do povsem druga\u010Dnih poslovnih domen. Kljub temu nezdru\u017Eljivosti imajo nekatere med njimi vrednost kot referen\u010Dni viri za specifi\u010Dne vzorce kode."));

  children.push(makeTable(
    ["Aplikacija", "Razlog nezdru\u017Eljivosti", "Vrednost kot referenca"],
    [
      ["ProTakeoff (ilirkl)", "Spletna aplikacija, ne Android", "Visoka: poslovna logika meritev + ponudbe"],
      ["OpenConstructionERP", "Spletni sistem, ne mobilna aplikacija", "Srednja: model cenooblikovanja"],
      ["Material-Calc (pcgofpa)", "Java Android, zastarela, zelo osnovna", "Nizka: enostavna kalkulacija materiala"],
      ["Interior-Design-AR", "Odvisna od Sceneform (opu\u0161\u010Den)", "Visoka: koncept AR 3D postavitve"],
      ["ArCoreMeasurement (Kashif-E)", "Odvisna od Sceneform (opu\u0161\u010Den)", "Srednja: AR merjenje v Kotlin"],
      ["3d-product-configurator", "React/Three.js, ne Android", "Srednja: UI/UX konfiguratorja"],
      ["QField (opengisch)", "C++/Qt arhitektura, GIS domena", "Srednja: terenski UX vzorci"],
      ["ConstructionCostEstimator", "React/Supabase, spletna aplikacija", "Nizka: splo\u0161na kalkulacija"]
    ]
  ));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  children.push(h2("4.1 Kriti\u010Dno opozorilo: Sceneform SDK je opu\u0161\u010Den"));
  children.push(body("Trije najbolj relevantni AR repozitoriji (ArCoreMeasurement, Interior-Design-AR, AR-Toolbox) so vsi odvisni od Google Sceneform SDK, ki je bil uradno opu\u0161\u010Den leta 2020. Sceneform ve\u010D ni vzdr\u017Eevan, ne deluje na novih Android verzijah (Android 13+) in nima varnostnih popravkov. Vsak poskus uporabe Sceneform kode bi zahteval obse\u017Eno migracijo, ki je po obsegu primerljiva s pisanjem nove kode. Pravilna pot je uporaba ARCore Extensions za Jetpack Compose ali Filament za 3D prikazovanje, skupaj s \u010Distim ARCore API-jem."));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // ===== 5. PRIORITETNI NAČRT =====
  children.push(h1("5. Prioritetni na\u010Drt vgradnje"));
  children.push(body("Naslednji na\u010Drt razvr\u0161\u010Da integracije po prioriteti, upo\u0161tevajo\u010D razmerje med koristjo za uporabnika in naporom za implementacijo. Prva tri priporo\u010Dila so hitre zmage, ki bistveno izbolj\u0161ajo uporabni\u0161ko izku\u0161njo z minimalnim tveganjem, medtem ko zadnji dve zahtevata bistveno ve\u010D resursov in na\u010Drtovane pristope."));

  children.push(makeTable(
    ["Prioriteta", "Integracija", "Napor", "Korist", "Tveganje", "Razvojna faza"],
    [
      ["P1", "ChitraLekhan (skiciranje)", "2-3 dni", "Zelo visoka", "Nizko", "Faza 1"],
      ["P2", "before-after-slider (primerjava)", "1 dan", "Visoka", "Nizko", "Faza 1"],
      ["P3", "generative-ai-kmp (Gemini SDK)", "2-3 dni", "Visoka", "Nizko", "Faza 1"],
      ["P4", "colorpicker-compose (RAL barve)", "2 dni", "Srednja", "Nizko", "Faza 2"],
      ["P5", "StreetMeasure (AR merjenje)", "5-10 dni", "Zelo visoka", "Srednje", "Faza 2"],
      ["P6", "AR vizualizacija ograj (3D)", "10-15 dni", "Izjemna", "Visoko", "Faza 3"]
    ]
  ));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  children.push(h2("5.1 Faza 1: Hitre izbolj\u0161ave (5-7 dni)"));
  children.push(body("Prva faza se osredoto\u010Da na tri integracije z najni\u017Ejim tveganjem in najvi\u0161jo koristjo. ChitraLekhan bo bistveno izbolj\u0161al skiciranje, ki je jedrna funkcionalnost za monterja na terenu, saj bo dodal oblike, besedilne oznake, radirko in polni undo/redo. Before-after-slider bo nadomestil preprosto Canvas implementacijo primerjave s profesionalno komponento. Generative-ai-kmp bo poenostavil in stabiliziral komunikacijo z Gemini API, obenem pa odstranil ro\u010Dno vzdr\u017Eevano Moshi/Retrofit kodo. Vse tri integracije so Compose-native in ne zahtevajo sprememb arhitekture."));

  children.push(h2("5.2 Faza 2: Funkcionalna raz\u0161iritev (7-12 dni)"));
  children.push(body("Druga faza raz\u0161iri barvno paleto z vsemi 213 RAL Classic barvami preko colorpicker-compose ter za\u010Dne integracijo ARCore merjenja s StreetMeasure kot referenco. Barvna raz\u0161iritev je pomembna za tr\u017Eno ustreznost, saj monterji pogosto delajo z neobi\u010Dajnimi barvami, ki niso v trenutni paleti 7 barv. AR merjenje bo prva prava uporaba senzorjev naprave namesto simulacije, kar bo bistveno pove\u010Dalo zaupanje uporabnikov v natan\u010Dnost meritev."));

  children.push(h2("5.3 Faza 3: AR vizualizacija (10-15 dni)"));
  children.push(body("Tretja faza je najzahtevnej\u0161a in najbolj vizionarska: namesto risanja 2D \u010Drt na fotografijah bo monter lahko dejansko postavil 3D model ograje v pove\u010Dano resni\u010Dnost na pravi balkon. To zahteva integracijo ARCore, ustvarjanje ali uvoz 3D modelov ROKSAL ograj (format GLB/GLTF), implementacijo Anchorjev za pritrditev modelov na ravnine ter optimizacijo za delo na son\u010Dni svetlobi (terenski pogoji). Referen\u010Dna koda Interior-Design-AR bo v pomo\u010D, vendar bo potrebna popolna zamenjava Sceneform z ARCore Extensions + Filament."));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // ===== 6. KAJ MANJKA =====
  children.push(h1("6. Kaj manjka in ga morate razviti sami"));
  children.push(body("Dolo\u010Dene funkcionalnosti, ki jih monter potrebuje na terenu, niso pokrite z nobeno obstoje\u010Do knji\u017Enico ali aplikacijo. Te morate razviti sami, prilagojene slovenskemu gradbenemu trgu in specifikam ROKSAL izdelkov. Spodaj je podroben pregled klju\u010Dnih mankajo\u010Dih funkcionalnosti z utemeljitvami."));

  children.push(h2("6.1 Generiranje PDF ponudb"));
  children.push(body("Morter na terenu potrebuje mo\u017Enost takoj\u0161njega izdelovanja ponudbe za stranko. Trenutna aplikacija prika\u017Ee kalkulacijo na zaslonu, vendar je ne more izvoziti v tiskano obliko. Potrebna je integracija knji\u017Enice za generiranje PDF (npr. iTextPDF ali Android nativni PrintedPdfDocument), ki bo samodejno oblikovala ponudbo s podatki o stranki, dimenzijah, izbranem slogu ograje, barvi, ceni z DDV in pogoji pla\u010Dila. To je ena najpomembnej\u0161ih mankajo\u010Dih funkcionalnosti, saj omogo\u010Da neposreden prehod od meritve k poslovnemu dogovoru."));

  children.push(h2("6.2 Ve\u010D fotografij na projekt"));
  children.push(body("Trenutni podatkovni model (Project) podpira le eno fotografijo (originalImagePath: String?). Monter na terenu potrebuje ve\u010D fotografij: splo\u0161ni pogled na balkon, detalj sidri\u0161\u010Da, pogled od zgoraj, bli\u017Enji posnetek po\u0161kodbe itd. Potrebna je sprememba podatkovnega modela za podporo seznama fotografij z oznakami tipa (osnovna, detalj, meritev), kar zahteva spremembo Room entitete in dodajanje nove tabele za slike."));

  children.push(h2("6.3 Offline na\u010Din in sinhronizacija"));
  children.push(body("Terenski monterji pogosto delajo na lokacijah brez zanesljive internetne povezave. Trenutna aplikacija zahteva internet za Gemini AI analizo, vendar bi morale vse ostale funkcionalnosti delovati brez povezave. Potrebna je implementacija offline-first arhitekture z lokalnim predpomnjenjem Gemini rezultatov, \u010Dakalno vrsto za sinhronizacijo, ko se povezava vzpostavi, ter mehanizem za re\u0161evanje konfliktov pri so\u010Dasnem urejanju istega projekta."));

  children.push(h2("6.4 Slovenski gradbeni predpisi"));
  children.push(body("Aplikacija mora vsebovati preverjanje skladnosti s slovenskimi gradbenimi predpisi, zlasti z TSG-01-001:2010 (Tehni\u010Dna smernica za graditev objektov) in standardom SIST EN 1090 (Izvedba jeklenih konstrukcij). Trenutno Gemini AI delno pokriva to funkcionalnost v stati\u010Dni analizi, vendar ni zanesljivo, saj je odvisen od povezave in trenutnega znanja modela. Potrebna je lokalna baza predpisov z avtomatskim preverjanjem (npr. minimalna vi\u0161ina ograje 100 cm za stanovanjske objekte, 110 cm za javne, razmik stebri\u010Dkov max 120 cm)."));

  children.push(h2("6.5 Evidenca \u010Dasa in materiala na terenu"));
  children.push(body("Monter potrebuje sledenje \u010Dasa dela na posameznem projektu (prihod na lokacijo, za\u010Detek dela, konec dela) ter evidence porabljenega materiala (stebri\u010Dki, letve, sidrni vijaki, zakovice). Trenutna aplikacija bele\u017Ei le dimenzije in slog, ne pa dejanske porabe materiala in \u010Dasa. To je klju\u010Dno za natan\u010Dno kalkulacijo stro\u0161kov in obra\u010Dun dela."));

  children.push(new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }));

  // ===== 7. SKLEPNA PRIPOROČILA =====
  children.push(h1("7. Sklepna priporo\u010Dila"));

  children.push(h2("7.1 Ali naj uporabimo kaj od najdenega?"));
  children.push(body("Da, absolutno. Najdeni knji\u017Enice so neposredno uporabne in bodo bistveno izbolj\u0161ale kakovost aplikacije z manj\u0161im naporom, kot \u010De bi iste funkcionalnosti razvijali od za\u010Detka. ChitraLekhan, before-after-slider in generative-ai-kmp so tri komponente, ki jih priporo\u010Dam takoj vgraditi v Fazi 1, saj so vsi trije Compose-native, aktivno vzdr\u017Eevani in z nizkim tveganjem."));

  children.push(h2("7.2 Ali je na\u0161 projekt unikaten?"));
  children.push(body("Da, na\u0161 projekt je unikatna kombinacija na ve\u010D ravneh. Nobena obstoje\u010Da aplikacija ne zdru\u017Euje: (1) specifi\u010Dne domene balkonskih ograj in teras, (2) terenskega merjenja in skiciranja, (3) AI-poganjanega tehni\u010Dnega poro\u010Danja, (4) lokaliziranega kalkulatorja s slovenskim DDV, (5) proizvajal\u010Devega kataloga (ROKSAL) ter (6) vizualizacije ograj na fotografijah. Najbli\u017Eji komercialni konkurenti (AR Railing na iOS, Kordo, IHME-3D) pokrivajo le dele te funkcionalnosti in niso odprtokodni. To pomeni, da ima projekt jasno tr\u017Eno ni\u0161o in konkuren\u010Dno prednost."));

  children.push(h2("7.3 Prioritetni vrstni red dela"));
  children.push(bullet("Faza 1 (5-7 dni): Vgradnja ChitraLekhan + before-after-slider + generative-ai-kmp — hitre zmage z nizkim tveganjem"));
  children.push(bullet("Faza 2 (7-12 dni): Raz\u0161iritev RAL palete + za\u010Detek ARCore integracije s StreetMeasure referenco"));
  children.push(bullet("Faza 3 (10-15 dni): Polna AR vizualizacija ograj s 3D modeli ROKSAL izdelkov"));
  children.push(bullet("Vzporedno: Razvoj PDF ponudbe, ve\u010D fotografij na projekt, offline na\u010Din in evidenca \u010Dasa/materiala"));

  children.push(h2("7.4 Opozorila glede licenc"));
  children.push(body("ChitraLekhan, colorpicker-compose, before-after-slider in generative-ai-kmp so pod odprtimi licencami (MIT ali Apache 2.0), kar pomeni, da jih je mogo\u010De brezpla\u010Dno uporabiti tudi v komercialnih projektih z ustrezno navedbo avtorstva. StreetMeasure je pod licenco GPL-3.0, kar zahteva, da je vsa povezana koda prav tako pod GPL — \u010De \u017Eelite komercialno uporabo, morate StreetMeasure uporabiti le kot referenco in napisati lastno implementacijo. Interior-Design-AR je pod MIT licenco, a zaradi Sceneform odvisnosti njegova neposredna uporaba ni mogo\u010Da."));

  return children;
}

// === BUILD DOCUMENT ===
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 24, color: P.body },
        paragraph: { spacing: { line: 312 } }
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: P.primary }
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: P.primary }
      }
    }
  },
  sections: [
    // Cover section
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 }
        }
      },
      children: buildCover()
    },
    // Body section
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL }
        }
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: P.secondary })]
          })]
        })
      },
      children: buildBody()
    }
  ]
});

const OUTPUT = "/home/z/my-project/download/Analiza_Zdruzljivosti_Monter_Ograj_PRO.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUTPUT, buf);
  console.log("Document generated: " + OUTPUT);
});
