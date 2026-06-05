import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const zai = await ZAI.create();
    const body = await req.json();
    const { customerName, address, style, length, height, width, mountType, color, notes, imageBase64 } = body;

    const styleTranslation: Record<string, string> = {
      'MODERN_ALU': 'Sodobna ALU letevna ograja',
      'GLASS_PANEL': 'Premium steklena ograja',
      'STAINLESS_STEEL_CABLE': 'Inox zajle (nerjavne jeklene pletenice)',
      'ELEGANT_WOODEN': 'Klasična lesena ograja',
      'WROUGHT_IRON': 'Kovana ograja z ornamenti',
    };

    const styleName = styleTranslation[style] || style;

    const messages: Array<{ role: string; content: string }> = [
      {
        role: 'system',
        content:
          'Si vrhunski tehnični in svetovalni pomočnik za slovensko podjetje, ki se ukvarja z montažo aluminijastih, steklenih in drugih balkonskih ograj.',
      },
      {
        role: 'user',
        content: `Deluješ kot vlogo izkušenega inženirja in vodje montiranja balkonskih ograj na terenu (slovenski strokovnjak). 
Naredi podrobno strokovno-tehnično analizo in priporočilo za stranko. 

PODATKI O PROJEKTU:
- Stranka: ${customerName}
- Lokacija: ${address}
- Izbrani stil ograje: ${styleName}
- Dimenzije: Dolžina = ${length} cm, Višina = ${height} cm, Širina = ${width} cm
- Način montaže: ${mountType} (v tla ali bočno v fasado)
- RAL barva / specifikacija barve: ${color}
- Dodatne opombe s terena: ${notes || 'Brez posebnih opomb'}

V slovenskem jeziku pripravi naslednja štiri poglavja z jasno strukturiranim besedilom:

1. STATIKA IN VARNOST (varnostni standardi, višina ${height} cm glede na slovenske predpise, stabilnost glede na način montaže '${mountType}', vetrni vplivi).
2. TEHNIČNA KALKULACIJA MATERIALA (oceni število stebričkov ob razmaku 100-120cm, skupno dolžino ročajev, število polnil/letev, sidrnih vijakov in ostalega montažnega materiala).
3. NAVODILA ZA MONTAŽO NA TERENU (natančni koraki za monterja, na kaj mora paziti pri montaži '${mountType}' na tej lokaciji).
4. PRODAJNA PREDSTAVITEV ZA STRANKO (kratka, estetska, prepričljiva predstavitev v dolžini 3-4 stavkov, ki jo monter pokaže stranki '${customerName}', zakaj je ta stil ograje v barvi ${color} popolna izbira za njihov dom).

Formatiraj z lepim, berljivim markdownom. Bodi strokoven in prepričljiv.`,
      },
    ];

    // If image is provided, add it as a text description in the message
    if (imageBase64) {
      messages[1].content += '\n\nPri analizi upoštevaj tudi priloženo fotografijo balkona/objekta.';
    }

    const completion = await zai.chat.completions.create({
      messages: messages as Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    });

    const result =
      completion.choices[0]?.message?.content ||
      'Napaka: Model ni vrnil odgovora.';
    return NextResponse.json({ result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Neznana napaka';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
