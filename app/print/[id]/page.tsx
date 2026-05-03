import { prisma } from "@/lib/db";
import { QRCodeSVG } from "qrcode.react";

export default async function PrintPage(props: any) {
  const params = await props.params;
  const id = Number(params?.id);

  if (!id || isNaN(id)) {
    return <p>ID inválido.</p>;
  }

  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order) {
    return <p>Pedido não encontrado.</p>;
  }

  return (
    <html>
      <body>
        <div className="ticket">
          <h2>MARMITARIA</h2>
          <h1>Pedido #{order.id}</h1>

          <p><strong>Cliente:</strong> {order.customer}</p>
          {order.phone && <p><strong>Tel:</strong> {order.phone}</p>}

          <hr />

          <pre>{order.items}</pre>

          <hr />

          <p><strong>Total:</strong> R$ {Number(order.total).toFixed(2)}</p>
          <p><strong>Pagamento:</strong> {order.payment}</p>

          {order.address && (
            <>
              <hr />
              <p><strong>Endereço:</strong></p>
              <p>{order.address}</p>
            </>
          )}

          {order.locationUrl && (
            <>
              <hr />
              <p><strong>Localização:</strong></p>
              <QRCodeSVG value={order.locationUrl} size={120} />
            </>
          )}

          {order.notes && (
            <>
              <hr />
              <p><strong>Obs:</strong></p>
              <p>{order.notes}</p>
            </>
          )}
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `window.onload = function() { window.print(); }`
        }} />

        <style>{`
          body {
            font-family: monospace;
            margin: 0;
            padding: 0;
            color: #000;
            background: #fff;
          }

          .ticket {
            width: 280px;
            padding: 10px;
            font-size: 14px;
          }

          h1, h2 {
            text-align: center;
            margin: 5px 0;
          }

          pre {
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 14px;
          }

          p {
            margin: 5px 0;
          }

          hr {
            border: none;
            border-top: 1px dashed #000;
            margin: 8px 0;
          }

          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        `}</style>
      </body>
    </html>
  );
}