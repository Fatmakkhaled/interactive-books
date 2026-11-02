import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
export async function readPdf(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024)
    throw new Error("Choose a PDF smaller than 10 MB.");
  const data = new Uint8Array(await file.arrayBuffer());
  if (!new TextDecoder().decode(data.slice(0, 1024)).includes("%PDF-"))
    throw new Error("This file is not a readable PDF.");
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const task = pdfjs.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
  });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > 60)
      throw new Error(
        "Choose a PDF with up to 60 pages, or paste the chapter you want to study.",
      );
    const pages: string[] = [];
    let length = 0;
    for (let number = 1; number <= pdf.numPages; number++) {
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) =>
          "str" in item
            ? item.str + ("hasEOL" in item && item.hasEOL ? "\n" : " ")
            : "",
        )
        .join("")
        .trim();
      if (text) {
        const section = `[PDF page ${number}]\n${text}`;
        pages.push(section);
        length += section.length + 2;
      }
      page.cleanup();
      if (length > 30000)
        throw new Error(
          "This PDF contains more than 30,000 characters. Paste a shorter chapter or excerpt instead.",
        );
    }
    const notes = pages.join("\n\n");
    if (notes.replace(/\[PDF page \d+\]/g, "").trim().length < 120)
      throw new Error(
        "This PDF contains too little readable text. Try a text-based PDF or paste your notes.",
      );
    return notes;
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException")
      throw new Error(
        "This PDF is password-protected. Upload an unlocked copy or paste your notes.",
      );
    throw error instanceof Error
      ? error
      : new Error(
          "This PDF could not be read. Try another file or paste your notes.",
        );
  } finally {
    await task.destroy();
  }
}
