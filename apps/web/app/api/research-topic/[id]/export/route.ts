import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';

export interface ResearchContent {
  summary: string;
  keyPoints: string[];
  trends: string[];
  questions: string[];
  contentAngles: string[];
  sources: string[];
}

export interface ResearchData {
  ResearchContent: ResearchContent
  topic: string;
  created_at: string; 
  updated_at: string;
}

export async function generateResearchPdf(data: ResearchData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const pageDimensions = { width: 595.28, height: 841.89 }; // A4

  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };


  const MARGINS = { top: 60, bottom: 60, left: 50, right: 50 };

  let state = {
    currentPage: pdfDoc.addPage([pageDimensions.width, pageDimensions.height]),
    y: pageDimensions.height - MARGINS.top,
  };

  const addPageIfNeeded = (requiredHeight: number) => {
    if (state.y - requiredHeight < MARGINS.bottom) {
      state.currentPage = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);
      state.y = pageDimensions.height - MARGINS.top;
    }
  };


  const drawWrappedText = (
    text: string,
    options: {
      font: PDFFont;
      size: number;
      x: number;
      lineHeight: number;
      color?: any;
    }
  ) => {
    const { font, size, x, lineHeight, color = rgb(0.2, 0.2, 0.2) } = options;
    const words = text.replace(/\n/g, ' \n ').split(' ');
    let currentLine = '';

    const lines: string[] = [];
    for (const word of words) {
        // Handle manual newlines
        if (word === '\n') {
            lines.push(currentLine);
            currentLine = '';
            continue;
        }

        const testLine = currentLine === '' ? word : `${currentLine} ${word}`;
        const width = font.widthOfTextAtSize(testLine, size);

        if (width > (pageDimensions.width - x - MARGINS.right)) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);

    // Draw the calculated lines
    for (const line of lines) {
        addPageIfNeeded(lineHeight);
        state.currentPage.drawText(line, { x, y: state.y, font, size, color });
        state.y -= lineHeight;
    }
  };



  drawWrappedText(data.topic, {
      font: fonts.bold,
      size: 18,
      x: MARGINS.left,
      lineHeight: 22,
      color: rgb(0, 0, 0),
  });
  state.y -= 20; 


  addPageIfNeeded(20);
  state.currentPage.drawText("Summary:", {
    x: MARGINS.left,
    y: state.y,
    size: 14,
    font: fonts.bold,
    color: rgb(0, 0, 0),
  });
  state.y -= 20;

  drawWrappedText(data.ResearchContent.summary, {
      font: fonts.regular,
      size: 12,
      x: MARGINS.left + 20, 
      lineHeight: 18,
  });
  state.y -= 20; 


  const addSection = (title: string, content: string[]) => {
    if (!content || content.length === 0) return;

    addPageIfNeeded(30); 
    state.currentPage.drawText(title + ":", {
      x: MARGINS.left,
      y: state.y,
      size: 14,
      font: fonts.bold,
      color: rgb(0, 0, 0),
    });
    state.y -= 20;

    for (const line of content) {

      drawWrappedText(line, {
          font: fonts.regular,
          size: 12,
          x: MARGINS.left + 20, 
          lineHeight: 18,
      });
    }
    state.y -= 10; 
  };


  addSection("Key Points", data.ResearchContent.keyPoints);
  addSection("Trends", data.ResearchContent.trends);
  addSection("Questions", data.ResearchContent.questions);
  addSection("Content Angles", data.ResearchContent.contentAngles);
  addSection("Sources", data.ResearchContent.sources);

  return await pdfDoc.save();
}


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const scriptId = (await context.params).id;

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data: script, error } = await supabase
      .from('research_topics')
      .select('topic, research_data, created_at, updated_at')
      .eq('id', scriptId)
      .eq('user_id', user.id)
      .single();

    if (error || !script) {
      return new NextResponse('Script not found', { status: 404 });
    }
    console.log(script);


    const pdfBytes = await generateResearchPdf({
      ResearchContent: script.research_data,
      topic: script.topic,
      created_at: script.created_at,
      updated_at: script.updated_at,
    });

    return new Response(pdfBytes as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${script.topic.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
      },
    });
  } catch (err) {
    console.error('Error generating script PDF:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
