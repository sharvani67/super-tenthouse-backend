// backend/routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');

// ─── Generate PDF Invoice ─────────────────────────────────────────────────────
router.post('/generate-pdf', async (req, res) => {
  try {
    const { orderData } = req.body;
    
    if (!orderData) {
      return res.status(400).json({
        success: false,
        message: 'Order data is required'
      });
    }

    console.log('📄 Generating PDF invoice for order:', orderData.orderNumber);
    console.log('📄 Order data received:', JSON.stringify(orderData, null, 2));
    
    // Generate HTML invoice
    const htmlContent = generateInvoiceHTML(orderData);
    
    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '20px',
        right: '20px'
      }
    });
    
    await browser.close();
    
    // Send PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${orderData.orderNumber}_${Date.now()}.pdf`);
    res.setHeader('Content-Length', pdf.length);
    res.send(pdf);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
});

// ─── Generate Invoice HTML ──────────────────────────────────────────────────
function generateInvoiceHTML(order) {
  const now = new Date();
  const invoiceDate = now.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const invoiceTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const items = Array.isArray(order.items) ? order.items : [];
  
  // Format event date if exists
  let eventDateFormatted = 'N/A';
  if (order.event_date) {
    try {
      eventDateFormatted = new Date(order.event_date).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      eventDateFormatted = order.event_date;
    }
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${order.orderNumber || order.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #ffffff;
          padding: 0;
          margin: 0;
          color: #1a1a2e;
        }
        .invoice-container {
          max-width: 900px;
          margin: 0 auto;
          background: #ffffff;
          overflow: hidden;
        }
        .invoice-header {
          background: linear-gradient(135deg, #0c2d67 0%, #1a4a8a 100%);
          padding: 40px 50px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .invoice-header h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
        .invoice-header .subtitle { font-size: 14px; opacity: 0.8; margin-top: 4px; }
        .invoice-number { text-align: right; }
        .invoice-number .number { font-size: 22px; font-weight: 700; letter-spacing: 1px; }
        .invoice-number .date { font-size: 13px; opacity: 0.8; margin-top: 4px; }
        .invoice-body { padding: 40px 50px; }
        .company-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }
        .company-info .company-name { font-size: 18px; font-weight: 700; color: #0c2d67; }
        .company-info .company-details { font-size: 13px; color: #666; line-height: 1.6; margin-top: 4px; }
        .customer-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }
        .customer-info .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 4px; }
        .customer-info .value { font-size: 15px; font-weight: 500; color: #1a1a2e; }
        .event-details {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 30px;
          padding: 16px 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }
        .event-details .item .label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 2px; }
        .event-details .item .value { font-size: 14px; font-weight: 500; color: #1a1a2e; }
        .event-details .item.span-full { grid-column: span 3; }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0 25px;
        }
        .items-table th {
          background: #f8f9fa;
          text-align: left;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #666;
          border-bottom: 2px solid #e9ecef;
        }
        .items-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
        }
        .items-table .item-name { font-weight: 500; }
        .items-table .item-total { font-weight: 600; color: #0c2d67; }
        .summary {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 2px solid #f0f0f0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }
        .summary-row .label { color: #666; }
        .summary-row .value { font-weight: 500; color: #1a1a2e; }
        .summary-row.total {
          margin-top: 10px;
          padding-top: 12px;
          border-top: 2px solid #0c2d67;
          font-size: 18px;
        }
        .summary-row.total .label { font-weight: 700; color: #0c2d67; }
        .summary-row.total .value { font-weight: 700; color: #0c2d67; }
        .coupon-info {
          margin-top: 12px;
          padding: 10px 16px;
          background: #e8f5e9;
          border-radius: 8px;
          font-size: 13px;
          color: #2e7d32;
        }
        .payment-info {
          display: flex;
          justify-content: space-between;
          margin-top: 25px;
          padding: 16px 20px;
          background: #f8f9fa;
          border-radius: 12px;
          font-size: 13px;
        }
        .payment-info .label { color: #666; }
        .payment-info .value { font-weight: 600; }
        .payment-info .status-paid { color: #2e7d32; }
        .payment-info .status-pending { color: #f57c00; }
        .payment-info .status-failed { color: #c62828; }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #f0f0f0;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        .footer .thankyou {
          font-size: 16px;
          font-weight: 600;
          color: #0c2d67;
          margin-bottom: 4px;
        }
        @media print {
          body { background: white; padding: 0; }
          .invoice-container { box-shadow: none; border-radius: 0; }
          .invoice-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .items-table th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        @media (max-width: 600px) {
          .invoice-header { flex-direction: column; text-align: center; padding: 30px 20px; }
          .invoice-number { text-align: center; margin-top: 12px; }
          .invoice-body { padding: 20px; }
          .company-info { flex-direction: column; text-align: center; }
          .customer-info { flex-direction: column; gap: 12px; }
          .event-details { grid-template-columns: 1fr; }
          .items-table { font-size: 12px; }
          .payment-info { flex-direction: column; gap: 8px; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div>
            <h1>INVOICE</h1>
            <div class="subtitle">Event Management Services</div>
          </div>
          <div class="invoice-number">
            <div class="number">#${order.orderNumber || order.id}</div>
            <div class="date">${invoiceDate} • ${invoiceTime}</div>
          </div>
        </div>
        <div class="invoice-body">
          <div class="company-info">
            <div>
              <div class="company-name">IIIQBETS EVENTS</div>
              <div class="company-details">
                Hyderabad, Telangana, India<br>
                Email: info@iiqbets.com<br>
                Phone: +91 93468 43156
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; color: #666;">Invoice Date</div>
              <div style="font-size: 14px; font-weight: 500;">${invoiceDate}</div>
            </div>
          </div>

          <div class="customer-info">
            <div>
              <div class="label">Customer</div>
              <div class="value">${order.customer_name || order.customerName || 'N/A'}</div>
              <div style="font-size: 13px; color: #666; margin-top: 2px;">${order.customer_email || order.customerEmail || 'N/A'}</div>
              <div style="font-size: 13px; color: #666;">${order.customer_phone || order.customerPhone || 'N/A'}</div>
            </div>
            <div>
              <div class="label">Delivery Address</div>
              <div class="value">${order.address_full_name || order.address?.fullName || 'N/A'}</div>
              <div style="font-size: 13px; color: #666; margin-top: 2px;">${order.address_line1 || order.address?.line1 || ''}</div>
              ${(order.address_line2 || order.address?.line2) ? `<div style="font-size: 13px; color: #666;">${order.address_line2 || order.address?.line2}</div>` : ''}
              <div style="font-size: 13px; color: #666;">${order.address_city || order.address?.city || ''}, ${order.address_state || order.address?.state || ''} - ${order.address_pincode || order.address?.pincode || ''}</div>
              <div style="font-size: 13px; color: #666;">${order.address_country || order.address?.country || 'India'}</div>
            </div>
          </div>

          <div class="event-details">
            <div class="item">
              <div class="label">Event Type</div>
              <div class="value">${order.event_type || order.eventType || 'N/A'}</div>
            </div>
            <div class="item">
              <div class="label">Event Date</div>
              <div class="value">${eventDateFormatted}</div>
            </div>
            <div class="item">
              <div class="label">Guest Count</div>
              <div class="value">${order.guest_count || order.guestCount || 0}</div>
            </div>
            <div class="item span-full">
              <div class="label">Venue</div>
              <div class="value">${order.venue || 'N/A'}</div>
            </div>
            ${order.event_time || order.eventTime ? `
            <div class="item span-full">
              <div class="label">Event Time</div>
              <div class="value">${order.event_time || order.eventTime || 'N/A'}</div>
            </div>
            ` : ''}
            ${order.special_instructions || order.specialInstructions ? `
            <div class="item span-full">
              <div class="label">Special Instructions</div>
              <div class="value">${order.special_instructions || order.specialInstructions || 'N/A'}</div>
            </div>
            ` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50%;">Item</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 20%; text-align: right;">Price</th>
                <th style="width: 15%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.length > 0 ? items.map(item => `
                <tr>
                  <td class="item-name">${item.name || 'Item'}</td>
                  <td style="text-align: center;">${item.quantity || 0}</td>
                  <td style="text-align: right;">₹${(item.price || 0).toLocaleString('en-IN')}</td>
                  <td style="text-align: right; font-weight: 600;">₹${((item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="4" style="text-align: center; padding: 20px; color: #999;">No items found</td>
                </tr>
              `}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span class="label">Subtotal</span>
              <span class="value">₹${(order.subtotal || 0).toLocaleString('en-IN')}</span>
            </div>
            ${(order.coupon_discount || order.couponDiscount) > 0 ? `
              <div class="summary-row">
                <span class="label">Discount (${order.coupon_code || order.couponCode || 'Coupon'})</span>
                <span class="value" style="color: #2e7d32;">-₹${(order.coupon_discount || order.couponDiscount || 0).toLocaleString('en-IN')}</span>
              </div>
            ` : ''}
            <div class="summary-row">
              <span class="label">Delivery Charge</span>
              <span class="value">${(order.delivery_charge || order.deliveryCharge) === 0 ? 'FREE' : `₹${(order.delivery_charge || order.deliveryCharge || 0).toLocaleString('en-IN')}`}</span>
            </div>
            <div class="summary-row">
              <span class="label">GST (18%)</span>
              <span class="value">₹${(order.gst || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="summary-row total">
              <span class="label">Grand Total</span>
              <span class="value">₹${(order.grand_total || order.grandTotal || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="payment-info">
            <div>
              <span class="label">Payment Method: </span>
              <span class="value">${(order.payment_method || order.paymentMethod || 'N/A').toUpperCase()}</span>
            </div>
            <div>
              <span class="label">Payment Status: </span>
              <span class="value">${(order.payment_status || order.paymentStatus || 'PENDING').toUpperCase()}</span>
            </div>
          </div>

          <div class="footer">
            <div class="thankyou">Thank You for Your Order!</div>
            <div>This is a system-generated invoice. For any queries, please contact our support team.</div>
            <div style="margin-top: 8px; font-size: 11px; color: #bbb;">www.iiqbets.com</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = router;