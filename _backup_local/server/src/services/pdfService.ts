import puppeteer from 'puppeteer';
import { ICertificateConfig } from '../models/CertificateConfig';
import { IUser } from '../models/User';

export const generateCertificatePDF = async (user: IUser, config: ICertificateConfig, category: string): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Basic HTML Template
  // In a real app, you might use a template engine like EJS or Handlebars
  // For now, we'll construct the HTML string directly with dynamic data

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Great+Vibes&family=Lato:wght@300;400;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          width: 1123px; /* A4 Landscape width at 96 DPI */
          height: 794px; /* A4 Landscape height at 96 DPI */
          font-family: 'Lato', sans-serif;
          color: #333;
          background-color: #fff;
        }
        
        .certificate-container {
          width: 100%;
          height: 100%;
          position: relative;
          background-image: ${config.backgroundImage ? `url('${config.backgroundImage}')` : 'none'};
          background-color: #fff; /* Ensure white background if no image */
          background-size: cover;
          background-position: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border: 20px solid #fff; 
          box-sizing: border-box;
        }

        .border-overlay {
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid #DAA520; /* Golden border */
            pointer-events: none;
        }

        .header {
          margin-bottom: 20px;
        }

        .title {
          font-family: 'Cinzel', serif;
          font-size: 60px;
          font-weight: 700;
          color: #1a237e; /* Navy Blue */
          text-transform: uppercase;
          letter-spacing: 4px;
          margin: 0;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .subtitle {
          font-size: 24px;
          color: #555;
          margin-top: 10px;
          font-style: italic;
        }

        .recipient-name {
          font-family: 'Great Vibes', cursive;
          font-size: 80px;
          color: #DAA520; /* Golden */
          margin: 20px 0;
          padding: 0 40px;
          border-bottom: 1px solid #ddd;
          display: inline-block;
          min-width: 400px;
        }

        .body-text {
          font-size: 18px;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto 40px;
          color: #444;
        }

        .event-name {
          font-weight: 700;
          color: #1a237e;
        }

        .signatures {
          display: flex;
          justify-content: space-around;
          width: 80%;
          margin-top: 40px;
        }

        .signature-block {
          text-align: center;
        }

        .signature-image {
          height: 60px;
          margin-bottom: 10px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }

        .signature-line {
          width: 200px;
          height: 1px;
          background-color: #333;
          margin: 0 auto 5px;
        }

        .signature-label {
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }
        
        .date-block {
            position: absolute;
            bottom: 40px;
            font-size: 14px;
            color: #777;
        }

        .category-badge {
            position: absolute;
            top: 50px;
            right: 50px;
            background-color: #DAA520;
            color: white;
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
      </style>
    </head>
    <body>
      <div class="certificate-container">
        <div class="border-overlay"></div>
        
        ${category !== 'participation' ? `<div class="category-badge">${category}</div>` : ''}

        <div class="header">
          <h1 class="title">${config.title}</h1>
          <p class="subtitle">${config.subtitle}</p>
        </div>

        <div class="recipient-name">
          ${user.name}
        </div>

        <div class="body-text">
          <p>
            ${config.description}
            <br/>
            Presented at <span class="event-name">${config.eventName}</span>
          </p>
        </div>

        <div class="signatures">
          <div class="signature-block">
            ${config.signature1?.imageUrl ? `<img src="${config.signature1.imageUrl}" class="signature-image" alt="Signature" />` : '<div style="height:60px"></div>'}
            <div class="signature-line"></div>
            <div class="signature-label">${config.signature1?.label || 'Organizer'}</div>
          </div>
          
          <div class="signature-block">
            ${config.signature2?.imageUrl ? `<img src="${config.signature2.imageUrl}" class="signature-image" alt="Signature" />` : '<div style="height:60px"></div>'}
            <div class="signature-line"></div>
            <div class="signature-label">${config.signature2?.label || 'Director'}</div>
          </div>
        </div>

        <div class="date-block">
            Issued on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
};
