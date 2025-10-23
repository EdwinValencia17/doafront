type CSVArgs = {
  filename: string;
  header?: string[];
  rows: (string | number | boolean | null | undefined)[][];
};

export function useCSVDownload() {
  let downloading = false;

  function toCSV({ header = [], rows }: Pick<CSVArgs, 'header' | 'rows'>): string {
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = header.length ? header.map(esc).join(',') + '\n' : '';
    const body = rows.map(r => r.map(esc).join(',')).join('\n');
    return head + body;
  }

  function downloadCSV(args: CSVArgs) {
    downloading = true;
    const csv = toCSV(args);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = args.filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    downloading = false;
  }

  return { downloadCSV, get downloading() { return downloading; } };
}
