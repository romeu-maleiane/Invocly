declare module "pdf-parse/lib/pdf-parse" {
  const pdf: (data: Buffer) => Promise<{ text: string }>;
  export default pdf;
}