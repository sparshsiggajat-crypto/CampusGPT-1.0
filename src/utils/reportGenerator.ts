export interface ReportData {
  title: string;
  headers: string[];
  rows: string[][];
}

/**
 * Utility to download mock Excel (CSV) files with proper headers & rows
 */
export const downloadAsExcel = (report: ReportData, filename: string) => {
  const headerLine = report.headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",");
  const rowLines = report.rows.map(row => 
    row.map(val => `"${(val || "").toString().replace(/"/g, '""')}"`).join(",")
  );
  
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headerLine, ...rowLines].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Utility to trigger print-ready customized elegant PDF receipt & transcript views
 */
export const downloadAsPDF = (report: ReportData, filename: string) => {
  // Create an iframe to generate clean print layout
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) return;

  const html = `
    <html>
      <head>
        <title>${report.title}</title>
        <style>
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            color: #1e293b;
            padding: 40px;
            margin: 0;
          }
          .header {
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: 800;
            color: #4f46e5;
          }
          .doctype {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #64748b;
            margin-top: 5px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
            font-size: 13px;
          }
          .meta-label {
            color: #64748b;
            font-weight: 500;
          }
          .meta-val {
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
            font-size: 12px;
          }
          th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 700;
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
          }
          tr:nth-child(even) td {
            background-color: #f8fafc/50;
          }
          .footer {
            margin-top: 60px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            font-size: 10px;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">CampusGPT</div>
          <div class="doctype">Official Academic Digest Transcript</div>
          <h1 style="margin: 15px 0 0 0; font-size: 22px; color: #0f172a;">${report.title}</h1>
        </div>
        
        <div class="meta-grid">
          <div>
            <span class="meta-label">Issued To:</span> Student Enrollment Registry<br/>
            <span class="meta-label">Date Generated:</span> ${new Date().toLocaleDateString()}<br/>
            <span class="meta-label">Authority:</span> Campus Controller Office
          </div>
          <div style="text-align: right;">
            <span class="meta-label">Status:</span> Verification Verified<br/>
            <span class="meta-label">Ref ID:</span> CGPT-DIS-${Math.floor(100000 + Math.random() * 900000)}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              ${report.headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${report.rows.map(row => `
              <tr>
                ${row.map(cell => `<td>${cell || "--"}</td>`).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="footer">
          This is an electronically transmitted authentic administrative record compiled inside the CampusGPT system.
          No physical signature required. Authorized under corporate educational seal.
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  // Print once fully loaded
  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    // Soft cleanups
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};
